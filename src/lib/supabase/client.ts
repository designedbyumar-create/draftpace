"use client";

import { createBrowserClient } from "@supabase/ssr";

export const isSupabaseConfigured =
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) && Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

/**
 * Cookie-backed browser client (via @supabase/ssr) so the session is
 * readable server-side too — required for src/proxy.ts and the server
 * layouts under /app and /admin to actually protect those routes.
 *
 * detectSessionInUrl is disabled deliberately. With it enabled, an OAuth
 * `?code=` (or a recovery `?code=`) is exchanged automatically during client
 * init AND again by the manual exchangeCodeForSession call on the page that
 * received it: a duplicate PKCE exchange where the second attempt always
 * fails on the already-consumed single-use code, producing a false
 * "Sign-in didn't complete" even though the session succeeded. Disabling it
 * makes the explicit exchange in src/app/auth/callback and
 * src/app/reset-password the single, authoritative code exchange.
 */
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key",
  {
    auth: {
      flowType: "pkce",
      detectSessionInUrl: false,
      autoRefreshToken: true,
      persistSession: true,
    },
  }
);
