/**
 * Who may open Studio. Shared by proxy.ts and the login action.
 *
 *   local dev, no key set        open: it is your own machine
 *   STUDIO_ACCESS_KEY set        locked: the key, once, sets a cookie holding its hash
 *   production, no key           closed: a hosted Studio is never left open by accident
 *
 * Hosted Studio replaces this with Supabase login (plan, phase 1); the
 * gate stays as the fallback for a single-person deploy.
 */
export const ACCESS_COOKIE = "studio_access";

export type AccessMode = "open" | "locked" | "closed";

export function accessMode(env: Record<string, string | undefined> = process.env): AccessMode {
  if (env.STUDIO_ACCESS_KEY) return "locked";
  return env.NODE_ENV === "production" ? "closed" : "open";
}

export async function keyHash(key: string): Promise<string> {
  const data = new TextEncoder().encode(`draftpace-studio:${key}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** Constant-time comparison, so the check never leaks how much of a guess was right. */
export function sameString(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
