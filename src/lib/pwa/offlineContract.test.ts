import { describe, expect, it } from "vitest";
import { isRecoverable, type DataSaveState } from "./offlineContract";

describe("DataSaveState / isRecoverable", () => {
  it("temporarily offline is recoverable", () => {
    const state: DataSaveState = { kind: "temporarilyOffline" };
    expect(isRecoverable(state)).toBe(true);
  });

  it("a retryable save failure is recoverable", () => {
    const state: DataSaveState = { kind: "saveFailed", message: "network blip", retryable: true };
    expect(isRecoverable(state)).toBe(true);
  });

  it("a non-retryable save failure is not recoverable", () => {
    const state: DataSaveState = { kind: "saveFailed", message: "validation error", retryable: false };
    expect(isRecoverable(state)).toBe(false);
  });

  it("online is not itself a recoverable-from state (nothing to recover from)", () => {
    const state: DataSaveState = { kind: "online" };
    expect(isRecoverable(state)).toBe(false);
  });

  it("a stale cached read is not automatically recoverable — the caller must trigger a refresh", () => {
    const state: DataSaveState = { kind: "staleCachedRead", asOf: "2026-08-08T00:00:00Z" };
    expect(isRecoverable(state)).toBe(false);
  });
});
