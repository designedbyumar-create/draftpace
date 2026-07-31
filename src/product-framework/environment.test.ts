import { afterEach, describe, expect, it, vi } from "vitest";
import { areDevFixturesEnabled, isAdminEnabled } from "./environment";

afterEach(() => {
  vi.unstubAllEnvs();
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
