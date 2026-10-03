import { getSupabaseServiceRoleClient } from "@/lib/server-auth";

/**
 * Server-only read of every user's support reports, for the admin list
 * view (src/app/admin/support/page.tsx). There is no admin role yet
 * (docs/ADMIN-AND-OPERATIONS.md), so this is the same tool the
 * notifications cron already uses to read across users: the service-role
 * client, bypassing RLS by design, imported only here and never from a
 * "use client" module. The /admin route tree itself is the access
 * control (src/proxy.ts + src/app/admin/layout.tsx), the same boundary
 * every other admin section already trusts.
 */

export type AdminSupportReportRow = {
  id: string;
  email: string;
  category: string;
  message: string;
  pageUrl: string | null;
  createdAt: string;
};

export type ListAllSupportReportsResult =
  | { status: "ok"; rows: AdminSupportReportRow[] }
  | { status: "not-configured" }
  | { status: "error"; message: string };

type AdminSupportReportDbRow = {
  id: string;
  email: string;
  category: string;
  message: string;
  page_url: string | null;
  created_at: string;
};

export async function listAllSupportReports(): Promise<ListAllSupportReportsResult> {
  const supabase = getSupabaseServiceRoleClient();
  if (!supabase) return { status: "not-configured" };

  const { data, error } = await supabase
    .from("support_reports")
    .select("id, email, category, message, page_url, created_at")
    .order("created_at", { ascending: false })
    .returns<AdminSupportReportDbRow[]>();

  if (error) return { status: "error", message: error.message };
  if (!data) return { status: "error", message: "No response while loading support reports." };

  return {
    status: "ok",
    rows: data.map((row) => ({
      id: row.id,
      email: row.email,
      category: row.category,
      message: row.message,
      pageUrl: row.page_url,
      createdAt: row.created_at,
    })),
  };
}
