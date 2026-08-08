import { describe, expect, it } from "vitest";
import { resolveNotificationDeepLink, NOTIFICATION_KIND_TIER, NOTIFICATION_KIND_COPY } from "./notifications";

describe("resolveNotificationDeepLink", () => {
  it("links a missing-bill-detail notification to the exact bill, not just the Bills list", () => {
    const link = resolveNotificationDeepLink("billMissingDetail", { billId: "bill-1" });
    expect(link).toBe("/app/products/personal-finance-companion/bills?focus=bill-1");
  });

  it("falls back to the section list when no specific record id is available", () => {
    const link = resolveNotificationDeepLink("billMissingDetail", {});
    expect(link).toBe("/app/products/personal-finance-companion/bills");
  });

  it("links each notification kind to its own relevant section, never a bare /app fallback", () => {
    const links = [
      resolveNotificationDeepLink("estimatedIncomeDatePassed", {}),
      resolveNotificationDeepLink("balanceStale", {}),
      resolveNotificationDeepLink("weeklyReviewDue", {}),
      resolveNotificationDeepLink("importNeedsReview", {}),
    ];
    for (const link of links) {
      expect(link).toMatch(/^\/app\/products\/personal-finance-companion\//);
      expect(link).not.toBe("/app");
    }
  });
});

describe("NOTIFICATION_KIND_TIER", () => {
  it("assigns a tier to every kind so a future platform never has to guess whether an event deserves a push", () => {
    for (const kind of Object.keys(NOTIFICATION_KIND_TIER) as (keyof typeof NOTIFICATION_KIND_TIER)[]) {
      expect(["action", "upcoming", "attention", "review", "progress"]).toContain(NOTIFICATION_KIND_TIER[kind]);
    }
  });
});

describe("NOTIFICATION_KIND_COPY — honest language", () => {
  it("never claims a real-world outcome Draftpace cannot actually know", () => {
    const forbidden = /wasn't paid|didn't arrive|payment failed|still active|forgot to save/i;
    for (const copy of Object.values(NOTIFICATION_KIND_COPY)) {
      expect(copy.generic).not.toMatch(forbidden);
      expect(copy.withName("Visa")).not.toMatch(forbidden);
    }
  });
});
