"use client";

import { supabase } from "@/lib/supabase/client";
import type { SupportCategory } from "./supportCategories";

/**
 * Submitting and reading back a user's own support reports (public.
 * support_reports — see its own migration for schema/RLS reasoning). This
 * is the real path behind the Support page's "Report an issue" form, now
 * that there is no support mailbox configured to send a mailto: to.
 *
 * The category list itself lives in supportCategories.ts, not here, and
 * every caller (including this file) imports it from there directly —
 * see that file's own comment for why it must never be re-exported
 * through a "use client" module like this one.
 */

export type SupportReportRow = {
  id: string;
  category: string;
  message: string;
  pageUrl: string | null;
  createdAt: string;
};

export type SubmitSupportReportResult = { status: "ok" } | { status: "error"; message: string };
export type ListSupportReportsResult =
  | { status: "ok"; rows: SupportReportRow[] }
  | { status: "error"; message: string };

type SupportReportDbRow = {
  id: string;
  category: string;
  message: string;
  page_url: string | null;
  created_at: string;
};

/** Shapes a raw Supabase select response — pure and unit-testable without a network call. */
export function interpretListSupportReportsResponse(
  data: SupportReportDbRow[] | null,
  error: { message: string } | null
): ListSupportReportsResult {
  if (error) return { status: "error", message: error.message };
  if (!data) return { status: "error", message: "No response while loading your reports." };

  return {
    status: "ok",
    rows: data.map((row) => ({
      id: row.id,
      category: row.category,
      message: row.message,
      pageUrl: row.page_url,
      createdAt: row.created_at,
    })),
  };
}

export async function submitSupportReport(params: {
  userId: string;
  email: string;
  category: SupportCategory;
  message: string;
  pageUrl: string;
}): Promise<SubmitSupportReportResult> {
  const { error } = await supabase.from("support_reports").insert({
    user_id: params.userId,
    email: params.email,
    category: params.category,
    message: params.message,
    page_url: params.pageUrl,
  });

  if (error) return { status: "error", message: error.message };
  return { status: "ok" };
}

export async function listMySupportReports(): Promise<ListSupportReportsResult> {
  const { data, error } = await supabase
    .from("support_reports")
    .select("id, category, message, page_url, created_at")
    .order("created_at", { ascending: false });

  return interpretListSupportReportsResponse(data, error);
}
