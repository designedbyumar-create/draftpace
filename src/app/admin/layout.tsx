import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isAdminEnabled } from "@/product-framework/environment";
import { SessionProvider } from "@/design-system/shell/SessionProvider";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

// isAdminEnabled() must be re-evaluated per request, not baked in at build
// time: a normal `next build` runs with isAdminEnabled() false, so without
// forcing dynamic rendering, Next would statically prerender every /admin/*
// route as a 404 — and a deployment that later sets DRAFTPACE_ADMIN_PREVIEW
// at runtime (without rebuilding) would still serve that stale 404.
export const dynamic = "force-dynamic";

/**
 * Architecture scaffolding only (docs/ADMIN-AND-OPERATIONS.md). Reachability
 * is already gated in src/proxy.ts; this layout re-checks both conditions
 * as defense in depth rather than trusting middleware alone. No role model
 * yet — any authenticated user who reaches this point sees the same
 * read-only scaffold.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!isAdminEnabled()) notFound();

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?redirectTo=/admin");

  return <SessionProvider user={user}>{children}</SessionProvider>;
}
