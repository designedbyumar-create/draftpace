import { afterEach, describe, expect, it, vi } from "vitest";
import { areDevFixturesEnabled, getLaunchMode, isAdminEnabled } from "./environment";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("getLaunchMode", () => {
  it("defaults to waitlist in production with no override — the real production default", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_LAUNCH_MODE", "");
    expect(getLaunchMode()).toBe("waitlist");
  });

  it("defaults to beta outside production so /app is reachable in local dev without configuration", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("NEXT_PUBLIC_LAUNCH_MODE", "");
    expect(getLaunchMode()).toBe("beta");
  });

  it("respects an explicit override even in production (a real beta deploy)", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_LAUNCH_MODE", "beta");
    expect(getLaunchMode()).toBe("beta");
  });

  it("ignores an invalid override and falls back to the NODE_ENV default", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_LAUNCH_MODE", "not-a-real-mode");
    expect(getLaunchMode()).toBe("waitlist");
  });
});

describe("isAdminEnabled", () => {
  it("is unavailable in ordinary production configuration", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("DRAFTPACE_ADMIN_PREVIEW", "");
    expect(isAdminEnabled()).toBe(false);
  });

  it("is available in production only with the explicit preview flag", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("DRAFTPACE_ADMIN_PREVIEW", "true");
    expect(isAdminEnabled()).toBe(true);
  });

  it("is available outside production by default (local dev)", () => {
    vi.stubEnv("NODE_ENV", "development");
    expect(isAdminEnabled()).toBe(true);
  });
});

describe("areDevFixturesEnabled", () => {
  it("is disabled in production by default — fixtures never appear to real customers", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_DEV_FIXTURES", "");
    expect(areDevFixturesEnabled()).toBe(false);
  });

  it("is enabled in production only with the explicit opt-in", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_DEV_FIXTURES", "true");
    expect(areDevFixturesEnabled()).toBe(true);
  });

  it("is enabled outside production by default (local dev)", () => {
    vi.stubEnv("NODE_ENV", "development");
    expect(areDevFixturesEnabled()).toBe(true);
  });
});
