import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Structural checks on the product_updates migration SQL itself — same
 * discipline as personal-finance-companion/migrations.test.ts: an
 * automated pass on the migration text, not a live database. It proves
 * RLS is declared, select/update are scoped to auth.uid() = user_id, and
 * there is no insert policy for `authenticated` (this table's whole
 * "never forge your own update history" invariant depends on that).
 */

const sql = readFileSync(
  join(process.cwd(), "supabase", "migrations", "202609050001_platform_updates_feed.sql"),
  "utf-8"
);

describe("product_updates migration — structural checks", () => {
  it("enables row level security", () => {
    expect(sql).toContain("alter table public.product_updates enable row level security");
  });

  it("has a select policy scoped to auth.uid() = user_id", () => {
    expect(sql).toContain("on public.product_updates for select to authenticated using (auth.uid() = user_id)");
  });

  it("has an update policy scoped to auth.uid() = user_id on both sides", () => {
    expect(sql).toMatch(
      /on public\.product_updates for update to authenticated\s*\n\s*using \(auth\.uid\(\) = user_id\) with check \(auth\.uid\(\) = user_id\)/
    );
  });

  it("has no insert policy for authenticated — service-role write only", () => {
    expect(sql).not.toMatch(/on public\.product_updates for insert to authenticated/);
  });

  it("dedupes per product, not just per user", () => {
    expect(sql).toContain("unique (user_id, product_slug, dedupe_key)");
  });

  it("does not constrain product_slug to a hardcoded enum", () => {
    expect(sql).not.toMatch(/product_slug text.*check/);
  });
});
