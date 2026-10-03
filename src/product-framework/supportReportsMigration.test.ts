import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Structural checks on the support_reports migration SQL itself — same
 * discipline as updatesFeedMigration.test.ts: an automated pass on the
 * migration text, not a live database. It proves RLS is declared,
 * insert/select are both scoped to auth.uid() = user_id, and there is no
 * update/delete policy for `authenticated` — a submitted report must stay
 * a record a reporter can't quietly edit or remove after the fact.
 */

const sql = readFileSync(
  join(process.cwd(), "supabase", "migrations", "202610030001_support_reports.sql"),
  "utf-8"
);

describe("support_reports migration — structural checks", () => {
  it("enables row level security", () => {
    expect(sql).toContain("alter table public.support_reports enable row level security");
  });

  it("has an insert policy scoped to auth.uid() = user_id", () => {
    expect(sql).toContain("on public.support_reports for insert to authenticated with check (auth.uid() = user_id)");
  });

  it("has a select policy scoped to auth.uid() = user_id", () => {
    expect(sql).toContain("on public.support_reports for select to authenticated using (auth.uid() = user_id)");
  });

  it("has no update policy for authenticated — a report is a record, not an editable draft", () => {
    expect(sql).not.toMatch(/on public\.support_reports for update to authenticated/);
  });

  it("has no delete policy for authenticated", () => {
    expect(sql).not.toMatch(/on public\.support_reports for delete to authenticated/);
  });

  it("does not constrain category to a hardcoded enum", () => {
    expect(sql).not.toMatch(/category text.*check/);
  });

  it("cascades on user deletion rather than orphaning reports", () => {
    expect(sql).toContain("references auth.users(id) on delete cascade");
  });
});
