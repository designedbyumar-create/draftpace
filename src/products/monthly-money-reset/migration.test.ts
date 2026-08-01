import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * A structural smoke test, not a real database test — this environment has
 * no Postgres/Supabase CLI available to run the migration against. It
 * catches the migration file drifting from what the application code
 * expects (table/column/function names) without asserting anything about
 * actual RLS or function behavior, which needs a real database — see
 * docs/FREE-PRODUCT-ACTIVATION.md's "Applying the migration" section for
 * the verification queries to run once the migration is applied.
 */
const MIGRATION_PATH = "supabase/migrations/202608010001_monthly_money_reset.sql";

function readMigration(): string {
  return readFileSync(join(process.cwd(), MIGRATION_PATH), "utf-8");
}

describe("Monthly Money Reset migration structure", () => {
  const sql = readMigration();

  it("creates the four expected tables", () => {
    for (const table of [
      "free_activatable_products",
      "entitlements",
      "product_instances",
      "monthly_money_reset_states",
    ]) {
      expect(sql).toContain(`create table if not exists public.${table}`);
    }
  });

  it("enables row level security on every user-owned table", () => {
    for (const table of ["entitlements", "product_instances", "monthly_money_reset_states"]) {
      expect(sql).toContain(`alter table public.${table} enable row level security`);
    }
  });

  it("only grants select to authenticated on user-owned tables, never insert/update", () => {
    for (const table of ["entitlements", "product_instances", "monthly_money_reset_states"]) {
      expect(sql).not.toMatch(new RegExp(`grant (insert|update) on (table )?public\\.${table}`, "i"));
    }
  });

  it("seeds exactly one free-activatable product row for monthly-money-reset", () => {
    expect(sql).toContain("values ('monthly-money-reset', '0.1.0', true)");
  });

  it("defines both mutation functions as security definer", () => {
    expect(sql).toMatch(/create or replace function public\.grant_free_product[\s\S]*?security definer/);
    expect(sql).toMatch(/create or replace function public\.save_monthly_money_reset_state[\s\S]*?security definer/);
  });

  it("grant_free_product looks up the version from the allowlist, never accepts one as a parameter", () => {
    expect(sql).not.toMatch(/grant_free_product\([^)]*version/i);
    expect(sql).toContain("select fap.product_version into v_version");
  });

  it("save_monthly_money_reset_state checks ownership before writing", () => {
    expect(sql).toContain("if v_owner is null or v_owner <> v_user_id then");
  });

  it("save_monthly_money_reset_state gates the update on the expected revision", () => {
    expect(sql).toContain("and mrs.revision = p_expected_revision");
  });

  it("both functions restrict execution to authenticated only", () => {
    expect(sql).toContain(
      "grant execute on function public.grant_free_product(text, text) to authenticated"
    );
    expect(sql).toContain(
      "grant execute on function public.save_monthly_money_reset_state(uuid, integer, jsonb, boolean, bigint, text) to authenticated"
    );
  });

  it("cycle_key columns are constrained to YYYY-MM", () => {
    expect(sql).toContain("cycle_key text not null check (cycle_key ~ '^\\d{4}-\\d{2}$')");
  });

  it("entitlements and product_instances have the uniqueness constraints idempotency depends on", () => {
    expect(sql).toContain("unique (user_id, product_slug)");
    expect(sql).toContain("unique (user_id, product_slug, cycle_key)");
  });
});
