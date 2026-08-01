/**
 * Only ever redirect back to a same-origin relative path — never trust a
 * query param enough to send someone off-site after auth.
 */
export function getSafeRedirect(value: string | null, fallback = "/app"): string {
  if (!value) return fallback;
  if (!value.startsWith("/") || value.startsWith("//")) return fallback;
  return value;
}

/**
 * The Google OAuth `redirectTo` sent to Supabase has to match an allow-listed
 * URL exactly (e.g. "https://draftpace.com/auth/callback"), so it can't carry
 * a `?redirectTo=` query string of its own — appending one makes the URL stop
 * matching the allow list and Supabase silently falls back to the Site URL
 * instead. sessionStorage is the bridge that carries the intended next path
 * across the redirect to Google and back without touching that URL.
 */
const OAUTH_REDIRECT_KEY = "dp-oauth-redirect";

export function storeOAuthRedirect(value: string): void {
  try {
    sessionStorage.setItem(OAUTH_REDIRECT_KEY, value);
  } catch {
    // Storage can throw in private/locked-down browsing contexts; the
    // callback just falls back to the default redirect in that case.
  }
}

export function consumeOAuthRedirect(): string | null {
  try {
    const value = sessionStorage.getItem(OAUTH_REDIRECT_KEY);
    sessionStorage.removeItem(OAUTH_REDIRECT_KEY);
    return value;
  } catch {
    return null;
  }
}
