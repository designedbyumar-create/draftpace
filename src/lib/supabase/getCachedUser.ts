import { cache } from "react";
import { createSupabaseServerClient } from "./server";

/**
 * The auth check every /app/** layout runs, memoized per request via
 * React's cache(): app/layout.tsx and products/[productSlug]/layout.tsx
 * both call this independently (each is defense in depth, not trusting
 * the other), but within one request they now share a single Supabase
 * Auth round trip instead of two. This does not replace src/proxy.ts's
 * own getUser() call in middleware - middleware runs before React
 * rendering starts, outside this cache's scope, and stays the real
 * access-control gate.
 */
export const getCachedUser = cache(async () => {
  const supabase = await createSupabaseServerClient();
  return supabase.auth.getUser();
});
