import { describe, expect, it } from "vitest";
import {
  defaultNotificationPreferences,
  isCategoryEnabled,
  renderAtPrivacyLevel,
  notificationCategorySchema,
} from "./notificationPreferences";

describe("defaultNotificationPreferences", () => {
  it("defaults every category to off — nothing is sent unless the user chooses it", () => {
    const prefs = defaultNotificationPreferences();
    for (const category of notificationCategorySchema.options) {
      expect(isCategoryEnabled(prefs, category)).toBe(false);
    }
  });

  it("defaults privacy to private and review rhythm to off", () => {
    const prefs = defaultNotificationPreferences();
    expect(prefs.privacyLevel).toBe("private");
    expect(prefs.reviewRhythm).toBe("off");
  });
});

describe("renderAtPrivacyLevel", () => {
  const parts = { generic: "A financial item needs your attention.", withName: "Visa payment date is tomorrow.", withAmount: "Visa minimum payment of $320 is due tomorrow." };

  it("shows only the generic line at private", () => {
    expect(renderAtPrivacyLevel("private", parts)).toBe(parts.generic);
  });

  it("shows the name but not the amount at normal", () => {
    expect(renderAtPrivacyLevel("normal", parts)).toBe(parts.withName);
  });

  it("shows the amount at detailed", () => {
    expect(renderAtPrivacyLevel("detailed", parts)).toBe(parts.withAmount);
  });

  it("falls back to a less specific line when the more specific one isn't supplied", () => {
    expect(renderAtPrivacyLevel("detailed", { generic: parts.generic })).toBe(parts.generic);
  });
});
