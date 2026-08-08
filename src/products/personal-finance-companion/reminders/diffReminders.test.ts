import { describe, expect, it } from "vitest";
import { diffReminders, type ExistingReminderSummary } from "./diffReminders";
import type { ReminderCandidate } from "./deriveReminders";

function candidate(overrides: Partial<ReminderCandidate> = {}): ReminderCandidate {
  return {
    kind: "billDue",
    entityType: "bills",
    entityId: "bill-1",
    dedupeKey: "billDue:bills:bill-1:2026-08-15",
    schedule: { kind: "onDate", date: "2026-08-15" },
    nextEligibleAt: new Date("2026-08-14T00:00:00Z"),
    ...overrides,
  };
}

function existing(overrides: Partial<ExistingReminderSummary> = {}): ExistingReminderSummary {
  return { id: "rem-1", dedupeKey: "billDue:bills:bill-1:2026-08-15", status: "scheduled", source: "system", ...overrides };
}

describe("diffReminders", () => {
  it("inserts a candidate with no matching existing row", () => {
    const { toInsert, toCancelIds } = diffReminders([candidate()], []);
    expect(toInsert).toHaveLength(1);
    expect(toCancelIds).toEqual([]);
  });

  it("does not re-insert a candidate that already has a scheduled row", () => {
    const { toInsert } = diffReminders([candidate()], [existing()]);
    expect(toInsert).toEqual([]);
  });

  it("cancels a scheduled system reminder whose condition no longer produces a candidate", () => {
    const { toCancelIds } = diffReminders([], [existing()]);
    expect(toCancelIds).toEqual(["rem-1"]);
  });

  it("cancels a snoozed system reminder the same way as a scheduled one", () => {
    const { toCancelIds } = diffReminders([], [existing({ status: "snoozed" })]);
    expect(toCancelIds).toEqual(["rem-1"]);
  });

  it("never cancels a delivered or acknowledged reminder just because the candidate is gone", () => {
    const { toCancelIds: delivered } = diffReminders([], [existing({ status: "delivered" })]);
    const { toCancelIds: acknowledged } = diffReminders([], [existing({ status: "acknowledged" })]);
    expect(delivered).toEqual([]);
    expect(acknowledged).toEqual([]);
  });

  it("never cancels a user-created reminder via re-derivation, even if it shares no candidate", () => {
    const { toCancelIds } = diffReminders([], [existing({ source: "user" })]);
    expect(toCancelIds).toEqual([]);
  });

  it("leaves an in-flight snooze alone when the candidate is still live", () => {
    const { toInsert, toCancelIds } = diffReminders([candidate()], [existing({ status: "snoozed" })]);
    expect(toInsert).toEqual([]);
    expect(toCancelIds).toEqual([]);
  });
});
