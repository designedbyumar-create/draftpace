import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { getSupabaseServiceRoleClient } from "@/lib/server-auth";
import { currentCycleKey } from "@/product-framework/cycle";

/**
 * Lemon Squeezy sends order_created (and other) events here once a real
 * purchase completes. This route never trusts the payload's own claims
 * about identity or product without independent verification:
 * - The signature proves the request really came from Lemon Squeezy.
 * - The Draftpace user is read from meta.custom_data.user_id, the value
 *   the checkout link itself embedded (see lemonSqueezyCheckout.ts), not
 *   guessed from an email, which could collide or be unverified.
 * - The product slug is resolved from an explicit variant-id -> slug map,
 *   never taken directly from the payload, so a malformed or unexpected
 *   variant can never grant access to something it shouldn't.
 *
 * grant_purchased_product (202608040001) is service-role-only and exists
 * specifically for "a verified purchase/webhook handler after it has
 * already confirmed the payment": this route is that handler.
 */

const VARIANT_ID_TO_PRODUCT_SLUG: Record<string, { slug: string; version: string }> = {
  ...(process.env.LEMON_SQUEEZY_PFC_VARIANT_ID
    ? { [process.env.LEMON_SQUEEZY_PFC_VARIANT_ID]: { slug: "personal-finance-companion", version: "0.1.0" } }
    : {}),
  ...(process.env.LEMON_SQUEEZY_HMC_VARIANT_ID
    ? { [process.env.LEMON_SQUEEZY_HMC_VARIANT_ID]: { slug: "home-management-companion", version: "0.1.0" } }
    : {}),
  ...(process.env.LEMON_SQUEEZY_PLA_VARIANT_ID
    ? { [process.env.LEMON_SQUEEZY_PLA_VARIANT_ID]: { slug: "personal-life-affairs-companion", version: "0.1.0" } }
    : {}),
  ...(process.env.LEMON_SQUEEZY_HSC_VARIANT_ID
    ? { [process.env.LEMON_SQUEEZY_HSC_VARIANT_ID]: { slug: "homeschooling-companion", version: "0.1.0" } }
    : {}),
  ...(process.env.LEMON_SQUEEZY_ALONGSIDE_VARIANT_ID
    ? { [process.env.LEMON_SQUEEZY_ALONGSIDE_VARIANT_ID]: { slug: "alongside", version: "0.1.0" } }
    : {}),
};

function verifySignature(rawBody: string, signatureHeader: string | null, secret: string): boolean {
  if (!signatureHeader) return false;
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  const expectedBuffer = Buffer.from(expected, "utf8");
  const receivedBuffer = Buffer.from(signatureHeader, "utf8");
  if (expectedBuffer.length !== receivedBuffer.length) return false;
  return timingSafeEqual(expectedBuffer, receivedBuffer);
}

interface LemonSqueezyOrderPayload {
  meta: {
    event_name: string;
    custom_data?: { user_id?: string };
  };
  data: {
    attributes: {
      status: string;
      total: number;
      currency: string;
      first_order_item?: { variant_id: number | string };
    };
  };
}

export async function POST(request: Request) {
  const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Lemon Squeezy webhook isn't configured on this deployment yet." }, { status: 503 });
  }

  const rawBody = await request.text();
  const signature = request.headers.get("x-signature");
  if (!verifySignature(rawBody, signature, secret)) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  let payload: LemonSqueezyOrderPayload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Malformed payload." }, { status: 400 });
  }

  // Only a completed one-time purchase should ever grant access: PFC is
  // billed once, not a subscription (see the Shop listing's own FAQ copy).
  if (payload.meta.event_name !== "order_created") {
    return NextResponse.json({ received: true, skipped: payload.meta.event_name });
  }

  const userId = payload.meta.custom_data?.user_id;
  if (!userId) {
    return NextResponse.json({ error: "Missing custom_data.user_id; cannot grant access." }, { status: 400 });
  }

  const variantId = String(payload.data.attributes.first_order_item?.variant_id ?? "");
  const mapped = VARIANT_ID_TO_PRODUCT_SLUG[variantId];
  if (!mapped) {
    return NextResponse.json({ error: `Unrecognized variant_id "${variantId}"; no product mapped.` }, { status: 400 });
  }

  const supabase = getSupabaseServiceRoleClient();
  if (!supabase) {
    return NextResponse.json({ error: "Service role isn't configured on this deployment." }, { status: 503 });
  }

  const { error } = await supabase.rpc("grant_purchased_product", {
    p_user_id: userId,
    p_product_slug: mapped.slug,
    p_product_version: mapped.version,
    p_cycle_key: currentCycleKey(),
    p_metadata: {
      provider: "lemon-squeezy",
      amount: payload.data.attributes.total,
      currency: payload.data.attributes.currency,
    },
  });

  if (error) {
    // A genuine transient failure (real 5xx) so Lemon Squeezy retries;
    // grant_purchased_product's own upsert-on-conflict makes a retry safe.
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ received: true, granted: mapped.slug });
}
