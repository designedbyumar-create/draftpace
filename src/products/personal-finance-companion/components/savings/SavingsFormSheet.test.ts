import { describe, expect, it } from "vitest";
import { savingsFormValuesToPatch, type SavingsFormValues } from "./SavingsFormSheet";

const BASE_VALUES: SavingsFormValues = {
  name: "Emergency fund",
  type: "emergencyFund",
  targetAmountMajorUnits: "1000",
  savedAmountMajorUnits: "100",
  currency: "USD",
  targetDate: "",
  recurring: false,
  linkedAccountId: "",
};

describe("savingsFormValuesToPatch: linkedAccountId", () => {
  it("converts an empty linkedAccountId to null, not an empty string", () => {
    const patch = savingsFormValuesToPatch(BASE_VALUES);
    expect(patch.linkedAccountId).toBeNull();
  });

  it("passes a real linkedAccountId through unchanged", () => {
    const patch = savingsFormValuesToPatch({ ...BASE_VALUES, linkedAccountId: "account-123" });
    expect(patch.linkedAccountId).toBe("account-123");
  });

  it("trims whitespace before deciding null vs a real id", () => {
    const patch = savingsFormValuesToPatch({ ...BASE_VALUES, linkedAccountId: "   " });
    expect(patch.linkedAccountId).toBeNull();
  });

  it("never derives savedAmountMinorUnits from the linked account — it stays exactly what was entered", () => {
    const unlinked = savingsFormValuesToPatch(BASE_VALUES);
    const linked = savingsFormValuesToPatch({ ...BASE_VALUES, linkedAccountId: "account-123" });
    expect(linked.savedAmountMinorUnits).toBe(unlinked.savedAmountMinorUnits);
  });
});
