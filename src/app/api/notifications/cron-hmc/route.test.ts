import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

/**
 * The evaluator's front door.
 *
 * This route is the only thing that ever sends a Home Base notification,
 * and it fails closed: with no HMC_CRON_SECRET in the environment it
 * rejects every request, including the real pg_cron one. That is the
 * correct posture, but it also means a missing environment variable
 * takes the entire notification pipeline offline silently, with no error
 * anywhere a person would look. Nothing else in the repository asserts
 * the two halves of that contract, so this does.
 *
 * The secret has to be identical in two places that cannot see each
 * other: Supabase Vault (read by the pg_cron job in migration
 * 202608190005 as 'hmc_cron_secret') and the deployment environment
 * (read here as HMC_CRON_SECRET). Neither side can detect a mismatch;
 * the only symptom is that notifications quietly stop.
 */

const ROUTE = path.resolve(process.cwd(), "src/app/api/notifications/cron-hmc/route.ts");
const source = readFileSync(ROUTE, "utf8");

async function callWith(headers: Record<string, string>) {
  vi.resetModules();
  const { GET } = await import("./route");
  return GET(new Request("http://localhost/api/notifications/cron-hmc", { headers }));
}

describe("the Home Base cron evaluator's authorization gate", () => {
  const original = process.env.HMC_CRON_SECRET;

  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    if (original === undefined) delete process.env.HMC_CRON_SECRET;
    else process.env.HMC_CRON_SECRET = original;
  });

  it("rejects a request carrying no authorization at all", async () => {
    process.env.HMC_CRON_SECRET = "test-secret-value";
    expect((await callWith({})).status).toBe(401);
  });

  it("rejects a wrong secret", async () => {
    process.env.HMC_CRON_SECRET = "test-secret-value";
    expect((await callWith({ authorization: "Bearer wrong" })).status).toBe(401);
  });

  it("accepts the matching secret as a Bearer token", async () => {
    process.env.HMC_CRON_SECRET = "test-secret-value";
    const response = await callWith({ authorization: "Bearer test-secret-value" });
    expect(response.status).not.toBe(401);
  });

  /**
   * The deployment failure this file exists to make visible. An unset
   * variable must never fall open, and it must not fall open for the
   * real caller either: with no secret configured, even a request that
   * presents the correct Vault value is refused.
   */
  it("rejects everything when the secret is not configured, rather than falling open", async () => {
    delete process.env.HMC_CRON_SECRET;
    expect((await callWith({})).status).toBe(401);
    expect((await callWith({ authorization: "Bearer anything" })).status).toBe(401);
    expect((await callWith({ authorization: "Bearer " })).status).toBe(401);
  });

  it("compares against the whole Bearer string, so a bare secret is not accepted", async () => {
    process.env.HMC_CRON_SECRET = "test-secret-value";
    expect((await callWith({ authorization: "test-secret-value" })).status).toBe(401);
  });

  it("reads its own variable, not the one Personal Finance Companion's cron uses", () => {
    // The two products run separate jobs with separate secrets on purpose,
    // so a fault in one pipeline cannot reach the other.
    expect(source).toContain("process.env.HMC_CRON_SECRET");
    expect(source).not.toMatch(/process\.env\.CRON_SECRET\b/);
  });

  /**
   * The Updates feed's whole reason to exist is that web push opt-in is
   * rare — most users never grant browser permission, and the feed has
   * to stay true for them too. So this has to record before the "no
   * push subscription, skip" early-exit, not after it.
   */
  it("records every payload to the Updates feed before the no-subscription skip, not after", () => {
    const insertIndex = source.indexOf("insertProductUpdate(supabase, {");
    const skipIndex = source.indexOf("// No device to deliver to yet");
    expect(insertIndex).toBeGreaterThan(-1);
    expect(skipIndex).toBeGreaterThan(-1);
    expect(insertIndex).toBeLessThan(skipIndex);
  });
});
