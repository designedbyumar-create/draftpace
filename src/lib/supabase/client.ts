"use client";

import { createBrowserClient } from "@supabase/ssr";

export const isSupabaseConfigured =
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) && Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

/**
 * Cookie-backed browser client (via @supabase/ssr) so the session is
 * readable server-side too — required for src/proxy.ts and the server
 * layouts under /app and /admin to actually protect those routes.
 */
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key"
);
