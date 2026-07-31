/**
 * Only ever redirect back to a same-origin relative path — never trust a
 * query param enough to send someone off-site after auth.
 */
export function getSafeRedirect(value: string | null, fallback = "/app"): string {
  if (!value) return fallback;
  if (!value.startsWith("/") || value.startsWith("//")) return fallback;
  return value;
}
