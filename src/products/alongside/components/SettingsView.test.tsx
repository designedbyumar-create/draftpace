import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import SettingsView, { type SettingsViewProps } from "./SettingsView";
import { DEFAULT_REMINDER_PREFERENCES } from "../reminders";

function render(over: Partial<SettingsViewProps> = {}) {
  return renderToStaticMarkup(
    <SettingsView
      prefs={DEFAULT_REMINDER_PREFERENCES}
      capability="default"
      busy={false}
      message={null}
      onRemindersChange={() => {}}
      onDetailChange={() => {}}
      onQuietChange={() => {}}
      onTest={() => {}}
      {...over}
    />,
  );
}

const on = { ...DEFAULT_REMINDER_PREFERENCES, remindersEnabled: true };

describe("Settings", () => {
  it("starts with reminders off, and shows nothing that only makes sense once they are on", () => {
    const html = render();
    expect(html).toMatch(/role="switch"[^>]*aria-checked="false"/);
    expect(html).not.toContain("Quiet hours");
    expect(html).not.toContain("Say what it is about");
    expect(html).not.toContain("Send a test notification");
  });

  it("shows the detail choice, quiet hours and a test once they are on and this device can receive them", () => {
    const html = render({ prefs: on, capability: "subscribed" });
    expect(html).toContain("Quiet hours");
    expect(html).toContain("Say what it is about");
    expect(html).toContain("Send a test notification");
    expect(html).toContain("Times are in UTC.");
  });

  it("keeps what appears on a lock screen off until somebody chooses otherwise", () => {
    const html = render({ prefs: on, capability: "subscribed" });
    const switches = [...html.matchAll(/role="switch"[^>]*aria-checked="(true|false)"[^>]*aria-label="([^"]+)"/g)];
    const detail = switches.find((m) => m[2] === "Say what it is about");
    expect(detail?.[1]).toBe("false");
  });

  it("refuses honestly, and disables the switch, when this browser cannot notify", () => {
    for (const capability of ["denied", "unsupported"] as const) {
      const html = render({ capability });
      expect(html).toMatch(/<button[^>]*role="switch"[^>]*\sdisabled=""/);
      expect(html).toMatch(/blocked|cannot receive/);
    }
  });

  it("promises nothing beyond dates the person chose, and never uses shaming words", () => {
    const html = render({ prefs: on, capability: "subscribed" });
    expect(html).toContain("a date you chose yourself");
    expect(html.toLowerCase()).not.toMatch(/overdue|missed|streak|don&#x27;t forget|never miss/);
  });

  it("never puts an /opacity on a var() colour", () => {
    const source = readFileSync(join(__dirname, "SettingsView.tsx"), "utf8");
    expect([...source.matchAll(/\[var\(--[a-z0-9-]+\)\]\/\d+/gi)].map((m) => m[0])).toEqual([]);
  });
});
