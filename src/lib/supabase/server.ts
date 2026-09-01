import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Server-side client for use in Server Components, layouts and route
 * handlers under /app and /admin. Cookie writes are best-effort — Server
 * Components can't set cookies, but src/proxy.ts refreshes the session on
 * every request to those paths, so the session stays current regardless.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key",
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // Called from a Server Component render — safe to ignore since
            // proxy.ts refreshes the session cookie for these routes.
          }
        },
      },
    }
  );
}
