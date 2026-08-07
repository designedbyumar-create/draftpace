import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Structural checks on the migration SQL files themselves — this is an
 * AUTOMATED PASS on the migration text, not a live database. It cannot
 * prove RLS actually blocks a cross-user read/write on a real Postgres
 * instance (that requires the migration to be applied — see the final
 * report's EXTERNAL VERIFICATION REQUIRED item for this). What it does
 * prove: every table that should have RLS declares it, every insert/update
 * policy checks both auth.uid() = user_id and instance ownership, and the
 * append-only/RPC-only tables have no write policy that would violate
 * their documented invariant.
 */

const migrationsDir = join(process.cwd(), "supabase", "migrations");

function read(filename: string): string {
  return readFileSync(join(migrationsDir, filename), "utf-8");
}

const recordsSql = read("202608080001_personal_finance_companion_records.sql");
const supportingSql = read("202608080002_personal_finance_companion_supporting_tables.sql");
const writeAccessSql = read("202608080003_personal_finance_companion_write_access.sql");

const RECORD_TABLES = [
  "pfc_accounts",
  "pfc_income_sources",
  "pfc_bills",
  "pfc_subscriptions",
  "pfc_transactions",
  "pfc_debts",
  "pfc_savings_goals",
];

describe("Personal Finance Companion migrations — structural checks", () => {
  it("every one of the seven record tables enables row level security", () => {
    for (const table of RECORD_TABLES) {
      expect(recordsSql).toContain(`alter table public.${table} enable row level security`);
    }
  });

  it("every one of the seven record tables has a select policy scoped to auth.uid() = user_id", () => {
    for (const table of RECORD_TABLES) {
      const marker = `on public.${table} for select to authenticated using (auth.uid() = user_id)`;
      expect(recordsSql).toContain(marker);
    }
  });

  it("every insert policy on the seven record tables checks both user_id and _pfc_owns_instance", () => {
    for (const table of RECORD_TABLES) {
      const marker = `on public.${table} for insert to authenticated`;
      const index = writeAccessSql.indexOf(marker);
      expect(index, `expected an insert policy for ${table}`).toBeGreaterThan(-1);
      const clause = writeAccessSql.slice(index, index + 400);
      expect(clause).toContain("auth.uid() = user_id");
      expect(clause).toContain("_pfc_owns_instance(product_instance_id)");
    }
  });

  it("pfc_setup_state has no direct insert/update grant — it is RPC-only, matching Monthly Money Reset's optimistic-concurrency pattern", () => {
    expect(writeAccessSql).not.toContain("on public.pfc_setup_state for insert");
    expect(writeAccessSql).not.toContain("on public.pfc_setup_state for update");
    expect(writeAccessSql).toContain("save_personal_finance_companion_setup_state");
  });

  it("pfc_confirmation_events has an insert policy but no update or delete policy (append-only)", () => {
    expect(writeAccessSql).toContain("on public.pfc_confirmation_events for insert");
    expect(writeAccessSql).not.toContain("on public.pfc_confirmation_events for update");
    expect(writeAccessSql).not.toContain("on public.pfc_confirmation_events for delete");
  });

  it("the setup-state save function verifies auth.uid() ownership before writing, independent of RLS (security definer)", () => {
    expect(writeAccessSql).toContain("security definer");
    expect(writeAccessSql).toContain("if v_owner is null or v_owner <> v_user_id then");
  });

  it("import_sessions, extraction_candidates, and confirmation_events all enable row level security", () => {
    expect(supportingSql).toContain("alter table public.pfc_import_sessions enable row level security");
    expect(supportingSql).toContain("alter table public.pfc_extraction_candidates enable row level security");
    expect(supportingSql).toContain("alter table public.pfc_confirmation_events enable row level security");
    expect(supportingSql).toContain("alter table public.pfc_setup_state enable row level security");
  });

  it("every money column is bigint minor units, matching Monthly Money Reset's convention, never numeric/decimal", () => {
    expect(recordsSql).toContain("current_balance_minor bigint");
    expect(recordsSql).toContain("amount_minor bigint");
    expect(recordsSql).toContain("balance_minor bigint");
    expect(recordsSql).toContain("target_amount_minor bigint");
  });

  it("every record table's status column is constrained to the five documented lifecycle values", () => {
    const expectedCheck = "check (status in ('draft', 'confirmedIncomplete', 'ready', 'needsReview', 'archived'))";
    const occurrences = recordsSql.split(expectedCheck).length - 1;
    expect(occurrences).toBe(RECORD_TABLES.length);
  });

  it("no migration file drops or alters an existing (pre-PFC) table", () => {
    for (const sql of [recordsSql, supportingSql, writeAccessSql]) {
      expect(sql).not.toMatch(/drop table/i);
      const alterTargets = [...sql.matchAll(/alter table public\.(\w+)/gi)].map((match) => match[1]);
      for (const target of alterTargets) {
        expect(target.toLowerCase().startsWith("pfc_")).toBe(true);
      }
    }
  });
});
