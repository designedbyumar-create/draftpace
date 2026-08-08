import { describe, expect, it } from "vitest";
import { resolveEligibility, isWithinQuietHours } from "./eligibility";
import { defaultNotificationPreferences } from "../notificationPreferences";

describe("isWithinQuietHours", () => {
  it("flags 11pm and 3am as quiet in UTC", () => {
    expect(isWithinQuietHours(new Date("2026-08-08T23:00:00Z"), "UTC")).toBe(true);
    expect(isWithinQuietHours(new Date("2026-08-08T03:00:00Z"), "UTC")).toBe(true);
  });

  it("does not flag mid-day as quiet", () => {
    expect(isWithinQuietHours(new Date("2026-08-08T14:00:00Z"), "UTC")).toBe(false);
  });

  it("uses the given timezone, not server-local time", () => {
    // 2026-08-08T10:00:00Z is 3am in America/Los_Angeles (UTC-7 in August) — quiet there.
    expect(isWithinQuietHours(new Date("2026-08-08T10:00:00Z"), "America/Los_Angeles")).toBe(true);
    // Same instant is 10am in UTC — not quiet.
    expect(isWithinQuietHours(new Date("2026-08-08T10:00:00Z"), "UTC")).toBe(false);
  });
});

describe("resolveEligibility", () => {
  const now = new Date("2026-08-08T14:00:00Z");

  it("is ineligible when the category is off", () => {
    const prefs = { ...defaultNotificationPreferences(), timezone: "UTC" };
    const result = resolveEligibility("billMissingDetail", prefs, now);
    expect(result).toEqual({ eligible: false, reason: "categoryDisabled" });
  });

  it("is eligible when the category is on and it's not quiet hours", () => {
    const prefs = { ...defaultNotificationPreferences(), timezone: "UTC", categories: { billsAndObligations: true } };
    const result = resolveEligibility("billDue", prefs, now);
    expect(result).toEqual({ eligible: true });
  });

  it("is ineligible during quiet hours even with the category on", () => {
    const prefs = { ...defaultNotificationPreferences(), timezone: "UTC", categories: { billsAndObligations: true } };
    const result = resolveEligibility("billDue", prefs, new Date("2026-08-08T23:30:00Z"));
    expect(result).toEqual({ eligible: false, reason: "quietHours" });
  });

  it("never gates a user-created reminder on a topic category, only quiet hours", () => {
    const prefs = { ...defaultNotificationPreferences(), timezone: "UTC" };
    expect(resolveEligibility("userCreated", prefs, now)).toEqual({ eligible: true });
    expect(resolveEligibility("userCreated", prefs, new Date("2026-08-08T23:30:00Z"))).toEqual({ eligible: false, reason: "quietHours" });
  });
});
