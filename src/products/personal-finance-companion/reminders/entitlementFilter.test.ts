import { describe, expect, it } from "vitest";
import { partitionByEntitlement } from "./entitlementFilter";

describe("partitionByEntitlement", () => {
  it("keeps rows whose user is in the entitled set", () => {
    const rows = [{ userId: "a" }, { userId: "b" }];
    const { entitled, skippedCount } = partitionByEntitlement(rows, new Set(["a", "b"]));
    expect(entitled).toEqual(rows);
    expect(skippedCount).toBe(0);
  });

  it("drops a row whose user is not currently entitled — the revocation case", () => {
    const rows = [{ userId: "a" }, { userId: "revoked-user" }];
    const { entitled, skippedCount } = partitionByEntitlement(rows, new Set(["a"]));
    expect(entitled).toEqual([{ userId: "a" }]);
    expect(skippedCount).toBe(1);
  });

  it("drops everything when the entitled set is empty", () => {
    const rows = [{ userId: "a" }, { userId: "b" }];
    const { entitled, skippedCount } = partitionByEntitlement(rows, new Set());
    expect(entitled).toEqual([]);
    expect(skippedCount).toBe(2);
  });

  it("never trusts an empty rows list into skipping incorrectly", () => {
    expect(partitionByEntitlement([], new Set(["a"]))).toEqual({ entitled: [], skippedCount: 0 });
  });
});
