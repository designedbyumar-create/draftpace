import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getLaunchMode, isAdminEnabled } from "@/product-framework/environment";

// Always reachable regardless of launch mode: static assets, the waitlist
// API, and the files a browser/PWA requests before any routing decision.
const alwaysAllowedPrefixes = ["/_next", "/logo", "/images"];
const alwaysAllowedPaths = [
  "/",
  "/favicon.ico",
  "/manifest.webmanifest",
  "/robots.txt",
  "/sitemap.xml",
  "/sw.js",
  "/api/waitlist",
];

// Reachable once launch mode is "beta" or "full" (see docs/ROUTE-MAP.md).
const gatedPublicContentPaths = ["/careers", "/blog", "/privacy", "/terms", "/cookies", "/offline"];
const gatedAuthPaths = ["/login", "/signup", "/forgot-password", "/auth/callback"];

function redirectHome(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = "/";
  url.search = "";
  return NextResponse.redirect(url);
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    alwaysAllowedPaths.includes(pathname) ||
    alwaysAllowedPrefixes.some((prefix) => pathname.startsWith(prefix))
  ) {
    return NextResponse.next();
  }

  // /admin is gated independently of launch mode — architecture scaffolding
  // only, unavailable in ordinary production configuration.
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return isAdminEnabled() ? NextResponse.next() : redirectHome(request);
  }

  const launchMode = getLaunchMode();

  if (launchMode === "waitlist") {
    return redirectHome(request);
  }

  // beta / full: public content, auth, and the authenticated platform.
  if (
    gatedPublicContentPaths.includes(pathname) ||
    gatedAuthPaths.includes(pathname) ||
    pathname === "/app" ||
    pathname.startsWith("/app/")
  ) {
    return NextResponse.next();
  }

  return redirectHome(request);
}

export const config = {
  matcher: ["/((?!.*\\..*).*)", "/manifest.webmanifest", "/sw.js"],
};
