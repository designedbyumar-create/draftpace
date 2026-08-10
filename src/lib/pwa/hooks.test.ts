import { describe, expect, it, afterEach, vi } from "vitest";
import { isIosDevice } from "./hooks";

describe("isIosDevice", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns false when navigator is unavailable (SSR)", () => {
    vi.stubGlobal("navigator", undefined);
    expect(isIosDevice()).toBe(false);
  });

  it("detects iPhone by user agent", () => {
    vi.stubGlobal("navigator", { userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)", platform: "iPhone", maxTouchPoints: 5 });
    expect(isIosDevice()).toBe(true);
  });

  it("detects iPad by user agent", () => {
    vi.stubGlobal("navigator", { userAgent: "Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X)", platform: "iPad", maxTouchPoints: 5 });
    expect(isIosDevice()).toBe(true);
  });

  it("detects iPadOS 13+ reporting as MacIntel with touch points", () => {
    vi.stubGlobal("navigator", { userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)", platform: "MacIntel", maxTouchPoints: 5 });
    expect(isIosDevice()).toBe(true);
  });

  it("does not flag a real Mac (MacIntel, no touch points) as iOS", () => {
    vi.stubGlobal("navigator", { userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)", platform: "MacIntel", maxTouchPoints: 0 });
    expect(isIosDevice()).toBe(false);
  });

  it("does not flag Android as iOS", () => {
    vi.stubGlobal("navigator", { userAgent: "Mozilla/5.0 (Linux; Android 14)", platform: "Linux armv8l", maxTouchPoints: 5 });
    expect(isIosDevice()).toBe(false);
  });

  it("does not flag an emulated Android viewport as iOS even when navigator.platform leaks the host's MacIntel value", () => {
    // Real regression, found live in this repo's own emulated mobile test harness:
    // the UA correctly says Android, but navigator.platform still reported the
    // underlying macOS host's "MacIntel", with maxTouchPoints > 1 from touch
    // emulation — exactly the signal combination the iPadOS-13+ branch looks for.
    vi.stubGlobal("navigator", {
      userAgent: "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36",
      platform: "MacIntel",
      maxTouchPoints: 5,
    });
    expect(isIosDevice()).toBe(false);
  });
});
