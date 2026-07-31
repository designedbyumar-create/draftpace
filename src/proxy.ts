import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { isAdminEnabled } from "@/product-framework/environment";

function redirectTo(request: NextRequest, pathname: string, search?: Record<string, string>) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  url.search = "";
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

  if (!user) {
    return redirectTo(request, "/login", { redirectTo: pathname });
  }

  return response;
}

export const config = {
  matcher: ["/app/:path*", "/admin/:path*"],
};
