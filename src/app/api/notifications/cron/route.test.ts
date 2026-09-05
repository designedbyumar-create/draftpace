import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

/**
 * Structural checks on the Personal Finance Companion cron evaluator,
 * mirroring cron-hmc/route.test.ts's own discipline: this route also has
 * no Supabase-mocking harness, so behavior that matters gets asserted
 * against the route's own source text instead of a live invocation.
 */

const ROUTE = path.resolve(process.cwd(), "src/app/api/notifications/cron/route.ts");
const source = readFileSync(ROUTE, "utf8");

describe("the Personal Finance Companion cron evaluator", () => {
  it("reads its own variable, not the one Home Base's cron uses", () => {
    // The two products run separate jobs with separate secrets on purpose,
    // so a fault in one pipeline cannot reach the other.
    expect(source).toContain("process.env.CRON_SECRET");
    expect(source).not.toMatch(/process\.env\.HMC_CRON_SECRET\b/);
  });

  /**
   * The Updates feed's whole reason to exist is that web push opt-in is
   * rare — most users never grant browser permission, and the feed has
   * to stay true for them too. So this has to record before the "no
   * device to deliver to yet" early-exit, not after it.
   */
  it("records every payload to the Updates feed before the no-subscription skip, not after", () => {
    const insertIndex = source.indexOf("insertProductUpdate(supabase, {");
    const skipIndex = source.indexOf("// No device to deliver to yet");
    expect(insertIndex).toBeGreaterThan(-1);
    expect(skipIndex).toBeGreaterThan(-1);
    expect(insertIndex).toBeLessThan(skipIndex);
  });

  it("tags every recorded update with its own product slug", () => {
    expect(source).toContain('productSlug: "personal-finance-companion"');
  });
});
