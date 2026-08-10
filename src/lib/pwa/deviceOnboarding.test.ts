import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import { hasDismissedInstallPrompt, dismissInstallPrompt } from "./deviceOnboarding";

function fakeLocalStorage() {
  const store = new Map<string, string>();
  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
  };
}

describe("device-level install prompt dismissal", () => {
  beforeEach(() => {
    vi.stubGlobal("window", { localStorage: fakeLocalStorage() });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("is not dismissed by default", () => {
    expect(hasDismissedInstallPrompt()).toBe(false);
  });

  it("persists dismissal so it is remembered on this device", () => {
    dismissInstallPrompt();
    expect(hasDismissedInstallPrompt()).toBe(true);
  });

  it("treats an unavailable window (SSR) as already-dismissed rather than prompting", () => {
    vi.stubGlobal("window", undefined);
    expect(hasDismissedInstallPrompt()).toBe(true);
  });

  it("never throws when storage access fails (private browsing, quota)", () => {
    vi.stubGlobal("window", {
      localStorage: {
        getItem: () => {
          throw new Error("blocked");
        },
        setItem: () => {
          throw new Error("blocked");
        },
      },
    });
    expect(() => dismissInstallPrompt()).not.toThrow();
    expect(hasDismissedInstallPrompt()).toBe(false);
  });
});
