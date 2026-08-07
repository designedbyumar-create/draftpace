import { describe, expect, it } from "vitest";
import { resolveNotificationDeepLink, DEFAULT_NOTIFICATION_PREFERENCES } from "./notifications";

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

describe("DEFAULT_NOTIFICATION_PREFERENCES", () => {
  it("defaults every preference to off — no notification permission is ever requested on first render", () => {
    for (const value of Object.values(DEFAULT_NOTIFICATION_PREFERENCES)) {
      expect(value).toBe(false);
    }
  });
});
