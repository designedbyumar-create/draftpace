/**
 * Environment gates shared by src/proxy.ts and the product framework. See
 * docs/ROUTE-MAP.md and docs/DECISIONS.md.
 *
 * Kept dependency-free and edge-runtime safe (no Node-only APIs) since
 * src/proxy.ts imports it directly.
 */

/**
 * Admin is gated independently of authentication. It is architecture
 * scaffolding, not a working admin tool, and stays closed in ordinary
 * production configuration regardless of who's signed in.
 */
export function isAdminEnabled(): boolean {
  if (process.env.NODE_ENV !== "production") return true;
  return process.env.DRAFTPACE_ADMIN_PREVIEW === "true";
}

/**
 * Development fixtures exist only to prove the framework locally, or on a
 * deploy that opts in explicitly — never automatically in production, so a
 * real deploy never shows fixtures to real users by accident.
 */
export function areDevFixturesEnabled(): boolean {
  if (process.env.NODE_ENV !== "production") return true;
  return process.env.NEXT_PUBLIC_DEV_FIXTURES === "true";
}
