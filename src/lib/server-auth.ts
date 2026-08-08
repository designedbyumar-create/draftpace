import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export async function getUserFromBearer(request: Request) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice("Bearer ".length) : null;

  if (!token || !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return { user: null, error: "Missing session" };
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  const { data, error } = await supabase.auth.getUser(token);
  return { user: data.user, error: error?.message || null };
}

/**
 * Like getUserFromBearer, but also returns a Supabase client with the
 * caller's own access token attached — every query made with it runs as
 * that user, so RLS (`auth.uid()`) resolves correctly. This is the
 * anon-key client, still fully RLS-bound; it is not a service-role
 * bypass. Use this (never a bare anon client) whenever a route handler
 * needs to read or write RLS-protected rows on the caller's behalf —
 * getUserFromBearer alone only confirms identity, it can't scope a query.
 */
export async function getSupabaseClientForBearer(
  request: Request
): Promise<{ user: Awaited<ReturnType<SupabaseClient["auth"]["getUser"]>>["data"]["user"] | null; supabase: SupabaseClient | null; error: string | null }> {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice("Bearer ".length) : null;

  if (!token || !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return { user: null, supabase: null, error: "Missing session" };
  }

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) return { user: null, supabase: null, error: error?.message || "Not authenticated" };
  return { user: data.user, supabase, error: null };
}

/**
 * Service-role client — bypasses RLS entirely. Server-only, and only ever
 * used by the notifications cron evaluator (no user session exists for a
 * cron job to scope RLS against). Returns null if SUPABASE_SERVICE_ROLE_KEY
 * isn't configured in this environment — callers must handle that
 * explicitly, never fall back to the anon client for this purpose.
 */
export function getSupabaseServiceRoleClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}
