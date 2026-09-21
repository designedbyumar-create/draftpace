import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { isAdminEnabled } from "@/product-framework/environment";
import { withPreservedUtm } from "@/lib/analytics/utm";

/**
 * `pathname` is a plain path (no query) when the caller already knows the
 * destination; `dest` is for the one caller (below) that is round-tripping
 * an opaque `path+query` string it did not build itself and cannot assume
 * has no "?" in it. Both go through `new URL(..., request.url)` rather
 * than mutating `request.nextUrl.clone()`'s `.pathname` directly: the
 * pathname setter percent-encodes a literal "?" instead of treating it as
 * the start of a query string, which silently produced a broken redirect
 * the one time this carried a combined string before.
 */
function redirectTo(request: NextRequest, dest: string, search?: Record<string, string>) {
  const url = new URL(dest, request.url);
  if (search) {
    for (const [key, value] of Object.entries(search)) url.searchParams.set(key, value);
  }
  return NextResponse.redirect(url);
}

/**
 * Real server-side session protection for /app and /admin, using
 * @supabase/ssr so the session is verified before any protected content is
 * ever sent (docs/DECISIONS.md — this replaces the Phase 1 client-side-only
 * AuthGate). /admin also requires isAdminEnabled() independent of session
 * state — architecture scaffolding, unavailable in ordinary production
 * configuration regardless of who's signed in.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAdminPath = pathname === "/admin" || pathname.startsWith("/admin/");
  const isAuthPage = pathname === "/login" || pathname === "/signup";

  if (isAdminPath && !isAdminEnabled()) {
    return redirectTo(request, "/");
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key",
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Already signed in and visiting an auth form: send them to their intended
  // destination (or the app home) instead of presenting another sign-in form.
  if (isAuthPage) {
    if (user) {
      const requested = request.nextUrl.searchParams.get("redirectTo");
      const dest = requested && requested.startsWith("/") && !requested.startsWith("//") ? requested : "/app";
      return redirectTo(request, dest);
    }
    return response;
  }

  // Protected /app and /admin: signed-out visitors go to login with their
  // intended destination preserved, UTM parameters included — a Pinterest
  // Pin can point straight at an owned product's /app/** route, and the
  // login detour must not be the reason gtag.js never sees the campaign
  // that brought them here (see src/lib/analytics/utm.ts).
  if (!user) {
    return redirectTo(request, "/login", { redirectTo: withPreservedUtm(pathname, request.nextUrl.searchParams) });
  }

  return response;
}

export const config = {
  matcher: ["/app/:path*", "/admin/:path*", "/login", "/signup"],
};
