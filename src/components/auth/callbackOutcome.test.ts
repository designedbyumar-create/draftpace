import { describe, expect, it } from "vitest";
import { resolveCallbackOutcome } from "./callbackOutcome";

describe("resolveCallbackOutcome", () => {
  it("redirects whenever a valid session exists, so a successful sign-in never renders as a failure", () => {
    expect(resolveCallbackOutcome(true)).toBe("redirect");
  });

  it("fails only when no session could be established", () => {
    expect(resolveCallbackOutcome(false)).toBe("fail");
  });
});
