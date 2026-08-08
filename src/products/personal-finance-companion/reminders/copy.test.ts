import { describe, expect, it } from "vitest";
import { reminderDeepLink, reminderKindCopy } from "./copy";
import type { PersonalFinanceCompanionReminderKind } from "../reminders";

const ALL_KINDS: PersonalFinanceCompanionReminderKind[] = [
  "billMissingDetail",
  "estimatedIncomeDatePassed",
  "balanceStale",
  "weeklyReviewDue",
  "importNeedsReview",
  "billDue",
  "subscriptionRenewal",
  "plannedCancellation",
  "debtDue",
  "promotionalRateExpiry",
  "userCreated",
];

const SAFE_BASE = "/app/products/personal-finance-companion";

describe("reminderDeepLink", () => {
  it("never returns anything outside the entitlement-protected product base, for every kind", () => {
    for (const kind of ALL_KINDS) {
      const url = reminderDeepLink(kind, { billId: "b", subscriptionId: "s", debtId: "d", incomeSourceId: "i", accountId: "a" });
      expect(url.startsWith(SAFE_BASE)).toBe(true);
    }
  });

  it("falls back to the Attention Inbox, never a bare app link, for an unrecognized-in-this-context kind", () => {
    // userCreated with no entity context (e.g. a general reminder) still resolves somewhere safe.
    const url = reminderDeepLink("userCreated", {});
    expect(url.startsWith(SAFE_BASE)).toBe(true);
  });
});

describe("reminderKindCopy", () => {
  it("provides a generic fallback for every kind, so privacy level 'private' always has something to say", () => {
    for (const kind of ALL_KINDS) {
      expect(reminderKindCopy(kind).generic.length).toBeGreaterThan(0);
    }
  });

  it("never mentions the record name inside the generic copy", () => {
    const copy = reminderKindCopy("billDue");
    expect(copy.generic).not.toMatch(/\$/);
  });
});
