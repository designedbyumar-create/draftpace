"use client";

/**
 * Dev-only "pretend I own this" override for entitlements — exists purely
 * so a real account (this project has no staging data, everyone tests
 * against their own) can be previewed as a fresh signup or a one-product
 * customer without touching real entitlement rows, which nothing in this
 * codebase has the credentials to do client-side anyway (grant/revoke are
 * service-role only). Never reachable in production: gated the same way
 * as areDevFixturesEnabled(), by NODE_ENV alone, no opt-in flag — there is
 * no legitimate reason this should ever run against a real deploy.
 *
 * Set with the URL: /app?dp_owned=monthly-money-reset,personal-finance-companion
 * Owning nothing:    /app?dp_owned=none
 * Back to real data: /app?dp_owned=reset
 * The param is read once and written to localStorage, so it keeps
 * applying on every subsequent page without needing to be repeated.
 */

const STORAGE_KEY = "dp_dev_owned_override";

function devOverridesEnabled(): boolean {
  return process.env.NODE_ENV !== "production";
}

/** Call once per page load, before reading the override, so ?dp_owned= in the URL takes effect. */
export function syncOwnershipOverrideFromUrl(): void {
  if (!devOverridesEnabled() || typeof window === "undefined") return;
  const param = new URLSearchParams(window.location.search).get("dp_owned");
  if (param === null) return;
  try {
    if (param === "reset") {
      window.localStorage.removeItem(STORAGE_KEY);
    } else if (param === "none") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    } else {
      const slugs = param.split(",").map((s) => s.trim()).filter(Boolean);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(slugs));
    }
  } catch {
    // Storage unavailable — the override just won't persist this load.
  }
}

/** null means "no override, use real entitlements." An empty array is a deliberate, valid override: owns nothing. */
export function getOwnershipOverride(): string[] | null {
  if (!devOverridesEnabled() || typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === null) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}
