import { NextResponse } from "next/server";
import { planners } from "@/lib/planners";
import { getUserFromBearer } from "@/lib/server-auth";

type CheckoutBody = {
  mode?: "membership-monthly" | "membership-yearly" | "planner";
  plannerId?: string;
};

export async function POST(request: Request) {
  const { user, error } = await getUserFromBearer(request);
  if (!user) {
    return NextResponse.json({ error: error || "Please sign in before checkout." }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as CheckoutBody;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const stripeKey = process.env.STRIPE_SECRET_KEY;

  if (!stripeKey) {
    return NextResponse.json(
      { error: "Stripe is not configured. Add STRIPE_SECRET_KEY and price IDs before taking payments." },
      { status: 503 }
    );
  }

  const priceId = resolvePriceId(body);
  if (!priceId) {
    return NextResponse.json({ error: "No Stripe price is configured for this checkout option." }, { status: 400 });
  }

  const params = new URLSearchParams({
    mode: body.mode === "planner" ? "payment" : "subscription",
    "line_items[0][price]": priceId,
    "line_items[0][quantity]": "1",
    success_url: `${siteUrl}/dashboard?checkout=success`,
    cancel_url: `${siteUrl}/pricing?checkout=cancelled`,
    client_reference_id: user.id,
    customer_email: user.email || "",
    "metadata[user_id]": user.id,
  });

  if (body.mode === "planner" && body.plannerId) {
    params.set("metadata[planner_id]", body.plannerId);
  }

  const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${stripeKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params,
  });

  const data = await response.json();

  if (!response.ok) {
    return NextResponse.json({ error: data.error?.message || "Stripe checkout failed." }, { status: 502 });
  }

  return NextResponse.json({ url: data.url });
}

function resolvePriceId(body: CheckoutBody) {
  if (body.mode === "membership-yearly") return process.env.STRIPE_PRICE_MEMBERSHIP_YEARLY;
  if (body.mode === "membership-monthly") return process.env.STRIPE_PRICE_MEMBERSHIP_MONTHLY;
  if (body.mode === "planner" && body.plannerId) {
    const planner = planners.find((item) => item.id === body.plannerId);
    if (!planner || planner.access !== "paid") return null;
    return process.env[`STRIPE_PRICE_PLANNER_${planner.id.toUpperCase().replace(/-/g, "_")}`];
  }
  return null;
}
