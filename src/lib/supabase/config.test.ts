import { afterEach, describe, expect, it, vi } from "vitest";
import { getSupabaseConfigStatus, getAuthUnavailableMessage } from "./config";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("getSupabaseConfigStatus", () => {
  it("is invalid when both variables are missing", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "");
    const status = getSupabaseConfigStatus();
    expect(status.valid).toBe(false);
    if (!status.valid) {
      expect(status.missing).toEqual(["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"]);
    }
  });

  it("is invalid when the URL is not a URL at all", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "not-a-url");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "sb_publishable_aaaaaaaaaaaaaaaaaaaa");
    expect(getSupabaseConfigStatus().valid).toBe(false);
  });

  it("is invalid when the URL is not https", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "http://abcdefghijklmnopqrst.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "sb_publishable_aaaaaaaaaaaaaaaaaaaa");
    expect(getSupabaseConfigStatus().valid).toBe(false);
  });

  it("is invalid when the URL is still the placeholder", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://placeholder.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "sb_publishable_aaaaaaaaaaaaaaaaaaaa");
    expect(getSupabaseConfigStatus().valid).toBe(false);
  });

  it("is invalid when the key is still the placeholder or too short", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://abcdefghijklmnopqrst.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "placeholder-anon-key");
    expect(getSupabaseConfigStatus().valid).toBe(false);

    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "short");
    expect(getSupabaseConfigStatus().valid).toBe(false);
  });

  it("is valid for a well-formed URL and a plausible key", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://abcdefghijklmnopqrst.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "sb_publishable_aaaaaaaaaaaaaaaaaaaa");
    expect(getSupabaseConfigStatus().valid).toBe(true);
  });
});

describe("getAuthUnavailableMessage", () => {
  it("never includes the actual reason in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    const message = getAuthUnavailableMessage({
      valid: false,
      missing: ["NEXT_PUBLIC_SUPABASE_URL"],
      reason: "NEXT_PUBLIC_SUPABASE_URL is still the placeholder value.",
    });
    expect(message.includes("placeholder")).toBe(false);
    expect(message.length).toBeGreaterThan(0);
  });

  it("includes the specific reason outside production", () => {
    vi.stubEnv("NODE_ENV", "development");
    const message = getAuthUnavailableMessage({
      valid: false,
      missing: ["NEXT_PUBLIC_SUPABASE_URL"],
      reason: "NEXT_PUBLIC_SUPABASE_URL is still the placeholder value.",
    });
    expect(message.includes("placeholder")).toBe(true);
  });

  it("returns an empty string when config is valid", () => {
    expect(getAuthUnavailableMessage({ valid: true })).toBe("");
  });
});
