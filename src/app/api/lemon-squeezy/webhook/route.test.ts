import { createHmac } from "node:crypto";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

const TEST_SECRET = "test-webhook-secret";
const TEST_VARIANT_ID = "998877";

function sign(body: string): string {
  return createHmac("sha256", TEST_SECRET).update(body).digest("hex");
}

function orderCreatedPayload(
  overrides: Partial<{ userId: string | null; variantId: string | number; eventName: string }> = {}
) {
  const { userId = "user-123", variantId = TEST_VARIANT_ID, eventName = "order_created" } = overrides;
  return JSON.stringify({
    meta: {
      event_name: eventName,
      custom_data: userId === null ? {} : { user_id: userId },
    },
    data: {
      attributes: {
        status: "paid",
        total: 4900,
        currency: "USD",
        first_order_item: { variant_id: variantId },
      },
    },
  });
}

/**
 * Proves the webhook's own logic (signature verification, event
 * filtering, custom_data extraction, variant->slug mapping, the
 * grant_purchased_product call) end to end with a real, hand-signed HMAC
 * payload, the only way to verify it without a real Lemon
 * Squeezy account event: the founder hasn't set up their real product yet.
 */
describe("POST /api/lemon-squeezy/webhook", () => {
  const rpc = vi.fn().mockResolvedValue({ error: null });

  beforeEach(() => {
    process.env.LEMON_SQUEEZY_WEBHOOK_SECRET = TEST_SECRET;
    process.env.LEMON_SQUEEZY_PFC_VARIANT_ID = TEST_VARIANT_ID;
    rpc.mockClear();
    vi.resetModules();
    vi.doMock("@/lib/server-auth", () => ({
      getSupabaseServiceRoleClient: () => ({ rpc }),
    }));
  });

  afterEach(() => {
    delete process.env.LEMON_SQUEEZY_WEBHOOK_SECRET;
    delete process.env.LEMON_SQUEEZY_PFC_VARIANT_ID;
    vi.doUnmock("@/lib/server-auth");
    vi.resetModules();
  });

  it("grants access on a validly signed order_created event", async () => {
    const { POST } = await import("./route");
    const body = orderCreatedPayload();
    const request = new Request("https://draftpace.com/api/lemon-squeezy/webhook", {
      method: "POST",
      headers: { "x-signature": sign(body) },
      body,
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual({ received: true, granted: "personal-finance-companion" });
    expect(rpc).toHaveBeenCalledTimes(1);
    expect(rpc).toHaveBeenCalledWith(
      "grant_purchased_product",
      expect.objectContaining({
        p_user_id: "user-123",
        p_product_slug: "personal-finance-companion",
        p_metadata: expect.objectContaining({ provider: "lemon-squeezy", amount: 4900, currency: "USD" }),
      })
    );
  });

  it("rejects a request with an invalid signature and never calls the grant RPC", async () => {
    const { POST } = await import("./route");
    const body = orderCreatedPayload();
    const request = new Request("https://draftpace.com/api/lemon-squeezy/webhook", {
      method: "POST",
      headers: { "x-signature": "not-the-real-signature-00000000000000000000000000000000" },
      body,
    });

    const response = await POST(request);
    expect(response.status).toBe(401);
    expect(rpc).not.toHaveBeenCalled();
  });

  it("rejects a request with no signature header at all", async () => {
    const { POST } = await import("./route");
    const body = orderCreatedPayload();
    const request = new Request("https://draftpace.com/api/lemon-squeezy/webhook", { method: "POST", body });

    const response = await POST(request);
    expect(response.status).toBe(401);
    expect(rpc).not.toHaveBeenCalled();
  });

  it("ignores a validly signed event that isn't order_created", async () => {
    const { POST } = await import("./route");
    const body = orderCreatedPayload({ eventName: "order_refunded" });
    const request = new Request("https://draftpace.com/api/lemon-squeezy/webhook", {
      method: "POST",
      headers: { "x-signature": sign(body) },
      body,
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual({ received: true, skipped: "order_refunded" });
    expect(rpc).not.toHaveBeenCalled();
  });

  it("rejects a validly signed order_created event with no custom_data.user_id", async () => {
    const { POST } = await import("./route");
    const body = orderCreatedPayload({ userId: null });
    const request = new Request("https://draftpace.com/api/lemon-squeezy/webhook", {
      method: "POST",
      headers: { "x-signature": sign(body) },
      body,
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
    expect(rpc).not.toHaveBeenCalled();
  });

  it("rejects a validly signed order_created event for an unmapped variant_id, never guessing a product", async () => {
    const { POST } = await import("./route");
    const body = orderCreatedPayload({ variantId: "999999999" });
    const request = new Request("https://draftpace.com/api/lemon-squeezy/webhook", {
      method: "POST",
      headers: { "x-signature": sign(body) },
      body,
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
    expect(rpc).not.toHaveBeenCalled();
  });

  it("returns 503 and never verifies anything when the webhook secret isn't configured", async () => {
    delete process.env.LEMON_SQUEEZY_WEBHOOK_SECRET;
    const { POST } = await import("./route");
    const body = orderCreatedPayload();
    const request = new Request("https://draftpace.com/api/lemon-squeezy/webhook", {
      method: "POST",
      headers: { "x-signature": sign(body) },
      body,
    });

    const response = await POST(request);
    expect(response.status).toBe(503);
    expect(rpc).not.toHaveBeenCalled();
  });

  it("surfaces a genuine RPC failure as a 500 so Lemon Squeezy retries", async () => {
    rpc.mockResolvedValueOnce({ error: { message: "db unavailable" } });
    const { POST } = await import("./route");
    const body = orderCreatedPayload();
    const request = new Request("https://draftpace.com/api/lemon-squeezy/webhook", {
      method: "POST",
      headers: { "x-signature": sign(body) },
      body,
    });

    const response = await POST(request);
    expect(response.status).toBe(500);
  });
});
