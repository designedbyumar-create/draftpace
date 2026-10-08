import { NextResponse, type NextRequest } from "next/server";
import { ACCESS_COOKIE, accessMode, keyHash, sameString } from "./lib/access";

/** Every Studio page and API sits behind the access gate (lib/access.ts). */
export async function proxy(request: NextRequest) {
  const mode = accessMode();
  if (mode === "open") return NextResponse.next();
  if (mode === "closed") {
    return new NextResponse("Draftpace Studio is not configured: set STUDIO_ACCESS_KEY before deploying it.", { status: 503 });
  }
  const cookie = request.cookies.get(ACCESS_COOKIE)?.value ?? "";
  if (cookie && sameString(cookie, await keyHash(process.env.STUDIO_ACCESS_KEY!))) return NextResponse.next();
  if (request.nextUrl.pathname.startsWith("/api/")) return new NextResponse("Not signed in to Studio.", { status: 401 });
  const url = new URL("/login", request.url);
  url.searchParams.set("next", request.nextUrl.pathname + request.nextUrl.search);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!login|_next/|favicon).*)"],
};
