import { describe, expect, it } from "vitest";
import { BOTTOM_NAV_LINKS } from "./PlatformShell";

describe("PlatformShell: mobile bottom navigation route configuration", () => {
  it("has exactly three direct-link slots, in order: Home, Explore Companions, Notifications", () => {
    expect(BOTTOM_NAV_LINKS.map((item) => item.label)).toEqual(["Home", "Explore Companions", "Notifications"]);
  });

  it("routes to the real platform destinations, not product routes", () => {
    expect(BOTTOM_NAV_LINKS.map((item) => item.href)).toEqual(["/app", "/shop", "/app/notifications"]);
  });

  it("stays at three link slots, since the fourth (Account) is a menu trigger, not a plain link, keeping the bar at four total items", () => {
    expect(BOTTOM_NAV_LINKS).toHaveLength(3);
  });
});
