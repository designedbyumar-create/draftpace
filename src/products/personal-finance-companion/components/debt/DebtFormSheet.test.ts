import { describe, expect, it } from "vitest";
import { debtFormValuesToPatch, type DebtFormValues } from "./DebtFormSheet";

const BASE_VALUES: DebtFormValues = {
  name: "Visa",
  type: "creditCard",
  balanceMajorUnits: "100",
  currency: "USD",
  interestRate: "",
  minimumPaymentMajorUnits: "10",
  dueDate: "",
  linkedAccountId: "",
};

describe("debtFormValuesToPatch: linkedAccountId", () => {
  it("converts an empty linkedAccountId to null, not an empty string", () => {
    const patch = debtFormValuesToPatch(BASE_VALUES, false);
    expect(patch.linkedAccountId).toBeNull();
  });

  it("passes a real linkedAccountId through unchanged", () => {
    const patch = debtFormValuesToPatch({ ...BASE_VALUES, linkedAccountId: "account-123" }, false);
    expect(patch.linkedAccountId).toBe("account-123");
  });

  it("trims whitespace before deciding null vs a real id", () => {
    const patch = debtFormValuesToPatch({ ...BASE_VALUES, linkedAccountId: "   " }, false);
    expect(patch.linkedAccountId).toBeNull();
  });

  it("always includes linkedAccountId in the patch, so unlinking on save is explicit", () => {
    const patch = debtFormValuesToPatch(BASE_VALUES, false);
    expect("linkedAccountId" in patch).toBe(true);
  });
});
