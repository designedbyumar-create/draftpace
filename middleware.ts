import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const allowedPrefixes = [
  "/api/waitlist",
  "/_next",
  "/logo",
  "/images",
];

const allowedPaths = [
  "/",
  "/favicon.ico",
  "/manifest.webmanifest",
  "/robots.txt",
  "/sitemap.xml",
  "/sw.js",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    allowedPaths.includes(pathname) ||
    allowedPrefixes.some((prefix) => pathname.startsWith(prefix))
  ) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = "/";
  url.search = "";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!.*\\..*).*)", "/manifest.webmanifest", "/sw.js"],
};
