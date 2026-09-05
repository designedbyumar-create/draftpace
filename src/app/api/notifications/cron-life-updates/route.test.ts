import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

/**
 * This route writes to the Updates feed for four products with no push
 * infrastructure of their own — structural checks mirror
 * cron/route.test.ts and cron-hmc/route.test.ts's own discipline.
 */

const ROUTE = path.resolve(process.cwd(), "src/app/api/notifications/cron-life-updates/route.ts");
const source = readFileSync(ROUTE, "utf8");

async function callWith(headers: Record<string, string>) {
  vi.resetModules();
  const { GET } = await import("./route");
  return GET(new Request("http://localhost/api/notifications/cron-life-updates", { headers }));
}

describe("the life-updates cron evaluator's authorization gate", () => {
  const original = process.env.LIFE_UPDATES_CRON_SECRET;

  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    if (original === undefined) delete process.env.LIFE_UPDATES_CRON_SECRET;
    else process.env.LIFE_UPDATES_CRON_SECRET = original;
  });

  it("rejects a request carrying no authorization at all", async () => {
    process.env.LIFE_UPDATES_CRON_SECRET = "test-secret-value";
    expect((await callWith({})).status).toBe(401);
  });

  it("rejects a wrong secret", async () => {
    process.env.LIFE_UPDATES_CRON_SECRET = "test-secret-value";
    expect((await callWith({ authorization: "Bearer wrong" })).status).toBe(401);
  });

  it("accepts the matching secret as a Bearer token", async () => {
    process.env.LIFE_UPDATES_CRON_SECRET = "test-secret-value";
    const response = await callWith({ authorization: "Bearer test-secret-value" });
    expect(response.status).not.toBe(401);
  });

  it("rejects everything when the secret is not configured, rather than falling open", async () => {
    delete process.env.LIFE_UPDATES_CRON_SECRET;
    expect((await callWith({})).status).toBe(401);
    expect((await callWith({ authorization: "Bearer anything" })).status).toBe(401);
  });

  it("reads its own variable, not PFC's or Home Base's", () => {
    expect(source).toContain("process.env.LIFE_UPDATES_CRON_SECRET");
    expect(source).not.toMatch(/process\.env\.CRON_SECRET\b/);
    expect(source).not.toMatch(/process\.env\.HMC_CRON_SECRET\b/);
  });

  it("never sends push — this route's only side effect is a product_updates row", () => {
    expect(source).not.toContain("sendWebPush");
    expect(source).not.toContain("push_subscriptions");
  });

  it("checks entitlement explicitly before evaluating, since the service-role client bypasses RLS", () => {
    expect(source).toContain("entitledKeys.has");
  });
});
