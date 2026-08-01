/**
 * Static, synchronous validation of the Supabase environment configuration.
 * This can only catch format problems (missing, malformed, still the
 * placeholder) — it cannot detect that a specific configured project has
 * been deleted or paused, which requires a real network call. See
 * `scripts/check-supabase-connection.mjs` for that check, and
 * `docs/SUPABASE-SETUP.md` for founder setup steps.
 *
 * Never logs or returns the actual URL/key values — callers get a reason
 * string naming which variable needs attention, not its content.
 */

export type SupabaseConfigStatus = { valid: true } | { valid: false; missing: string[]; reason: string };

const PLACEHOLDER_URLS = new Set(["https://placeholder.supabase.co"]);
const PLACEHOLDER_KEYS = new Set(["placeholder-anon-key"]);

export function getSupabaseConfigStatus(): SupabaseConfigStatus {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const missing: string[] = [];
  if (!url) missing.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!key) missing.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  if (missing.length > 0) {
    return { valid: false, missing, reason: `Missing environment variable(s): ${missing.join(", ")}.` };
  }

  let parsed: URL;
  try {
    parsed = new URL(url as string);
  } catch {
    return {
      valid: false,
      missing: ["NEXT_PUBLIC_SUPABASE_URL"],
      reason: "NEXT_PUBLIC_SUPABASE_URL is not a valid URL.",
    };
  }

  if (parsed.protocol !== "https:") {
    return {
      valid: false,
      missing: ["NEXT_PUBLIC_SUPABASE_URL"],
      reason: "NEXT_PUBLIC_SUPABASE_URL must start with https://.",
    };
  }

  if (PLACEHOLDER_URLS.has((url as string).replace(/\/$/, ""))) {
    return {
      valid: false,
      missing: ["NEXT_PUBLIC_SUPABASE_URL"],
      reason: "NEXT_PUBLIC_SUPABASE_URL is still the placeholder value — set it to your real Supabase project URL.",
    };
  }

  if (PLACEHOLDER_KEYS.has(key as string) || (key as string).length < 20) {
    return {
      valid: false,
      missing: ["NEXT_PUBLIC_SUPABASE_ANON_KEY"],
      reason: "NEXT_PUBLIC_SUPABASE_ANON_KEY is missing, a placeholder, or too short to be a real key.",
    };
  }

  return { valid: true };
}

/**
 * User-facing message for a failed config check. Dev shows the specific
 * reason so it's fixable immediately; production never exposes hostnames,
 * keys, or infrastructure detail.
 */
export function getAuthUnavailableMessage(status: SupabaseConfigStatus): string {
  if (status.valid) return "";
  if (process.env.NODE_ENV !== "production") {
    return `Supabase isn't configured correctly: ${status.reason}`;
  }
  return "Account sign-in is temporarily unavailable. Please try again shortly or contact support.";
}
