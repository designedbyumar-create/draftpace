/**
 * Single source of truth for the launch-mode and scaffolding gates used by
 * both `middleware.ts` and the product framework. See docs/ROUTE-MAP.md and
 * docs/DECISIONS.md for the contract this implements.
 *
 * Kept dependency-free and edge-runtime safe (no Node-only APIs) since
 * middleware.ts imports it directly.
 */

export type LaunchMode = "waitlist" | "beta" | "full";

const LAUNCH_MODES: readonly LaunchMode[] = ["waitlist", "beta", "full"];

function isLaunchMode(value: string | undefined): value is LaunchMode {
  return typeof value === "string" && (LAUNCH_MODES as readonly string[]).includes(value);
}

/**
 * Production defaults to "waitlist" unless explicitly overridden. Non-
 * production (local dev, test) defaults to "beta" so /app is reachable
 * without any environment configuration while developing.
 */
export function getLaunchMode(): LaunchMode {
  const explicit = process.env.NEXT_PUBLIC_LAUNCH_MODE;
  if (isLaunchMode(explicit)) return explicit;
  return process.env.NODE_ENV === "production" ? "waitlist" : "beta";
}

/**
 * Admin is gated independently of launch mode. It is architecture
 * scaffolding, not a working admin tool, and stays closed in ordinary
 * production configuration regardless of launch mode.
 */
export function isAdminEnabled(): boolean {
  if (process.env.NODE_ENV !== "production") return true;
  return process.env.DRAFTPACE_ADMIN_PREVIEW === "true";
}

/**
 * Development fixtures are separate from launch mode on purpose: a real
 * deployed beta environment should not automatically show fixtures to
 * testers just because /app is open. Fixtures exist only to prove the
 * framework locally, or on a deploy that opts in explicitly.
 */
export function areDevFixturesEnabled(): boolean {
  if (process.env.NODE_ENV !== "production") return true;
  return process.env.NEXT_PUBLIC_DEV_FIXTURES === "true";
}
