import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

/**
 * The standing proof that every table this product owns is closed by
 * default and scoped to its owner.
 *
 * Structural, same shape as every sibling's own proof. It matters most
 * here: this is the one product whose whole job is holding real account
 * balances, debts and income, the single most sensitive category of
 * data any product on this platform stores after Travel Companion's own
 * passport/visa references.
 */

const MIGRATIONS = path.resolve(process.cwd(), "supabase/migrations");

const sql = readdirSync(MIGRATIONS)
  .filter((f) => f.endsWith(".sql"))
  .map((f) => readFileSync(path.join(MIGRATIONS, f), "utf8"))
  .join("\n");

const tables = [...sql.matchAll(/create table if not exists public\.(pfc_\w+)/g)].map((m) => m[1]);

const policies = [...sql.matchAll(/create policy\s+"([^"]+)"\s*\n?on public\.(pfc_\w+)([\s\S]*?);/g)].map((m) => ({
  name: m[1],
  table: m[2],
  body: m[0],
}));

/**
 * Tables written only through a service-role/cron path, never directly by
 * a client, so a select-only policy is correct rather than a gap: there is
 * nothing for a client insert/update policy to guard.
 */
const SELECT_ONLY_TABLES = ["pfc_notification_deliveries", "pfc_setup_state"];

/** The one table with a delete policy instead of update, see below. */
const DELETE_INSTEAD_OF_UPDATE_TABLE = "pfc_bill_payments";

describe("Personal Finance Companion row level security", () => {
  it("creates the fifteen tables this product is built on", () => {
    expect(tables.sort()).toEqual(
      [
        "pfc_accounts",
        "pfc_income_sources",
        "pfc_bills",
        "pfc_subscriptions",
        "pfc_transactions",
        "pfc_debts",
        "pfc_savings_goals",
        "pfc_import_sessions",
        "pfc_extraction_candidates",
        "pfc_confirmation_events",
        "pfc_setup_state",
        "pfc_notification_preferences",
        "pfc_reminders",
        "pfc_notification_deliveries",
        "pfc_bill_payments",
      ].sort()
    );
  });

  it("enables row level security on every table it creates", () => {
    for (const table of tables) {
      expect(sql, `${table} never enables RLS, so every row in it is world-readable`).toContain(
        `alter table public.${table} enable row level security`
      );
    }
  });

  it("gives every table at least one policy, since RLS with no policy denies everything", () => {
    for (const table of tables) {
      expect(policies.filter((p) => p.table === table).length, `${table} has RLS on but no policy`).toBeGreaterThan(0);
    }
  });

  it("scopes every policy to the signed-in user's own rows", () => {
    for (const policy of policies) {
      expect(policy.body, `"${policy.name}" does not compare auth.uid() to user_id`).toContain("auth.uid() = user_id");
    }
  });

  it("grants only to authenticated, never to anon or public", () => {
    for (const policy of policies) {
      expect(policy.body, `"${policy.name}" is not restricted to authenticated`).toContain("to authenticated");
      expect(policy.body).not.toMatch(/\bto\s+anon\b/);
      expect(policy.body).not.toMatch(/\bto\s+public\b/);
    }
  });

  it("additionally proves instance ownership on every client-writable insert", () => {
    const insertableTables = tables.filter((t) => !SELECT_ONLY_TABLES.includes(t));
    const inserts = policies.filter((p) => /for insert/.test(p.body));
    expect(inserts.length).toBe(insertableTables.length);
    for (const policy of inserts) {
      expect(policy.body, `"${policy.name}" does not check _pfc_owns_instance`).toContain("_pfc_owns_instance");
    }
  });

  it("has no insert or update policy on the service-role-only tables, since a client should never write them directly", () => {
    for (const table of SELECT_ONLY_TABLES) {
      const tablePolicies = policies.filter((p) => p.table === table);
      expect(tablePolicies.length, `${table} has no policies at all`).toBeGreaterThan(0);
      for (const policy of tablePolicies) {
        expect(policy.body, `"${policy.name}" grants a client write on a service-role-only table`).not.toMatch(
          /for (insert|update)/
        );
      }
    }
  });

  it("grants a delete policy only on the one table that legitimately needs one", () => {
    for (const policy of policies) {
      if (policy.table === DELETE_INSTEAD_OF_UPDATE_TABLE) continue;
      expect(policy.body, `"${policy.name}" grants delete outside ${DELETE_INSTEAD_OF_UPDATE_TABLE}`).not.toMatch(
        /for delete/
      );
    }
    const billPaymentPolicies = policies.filter((p) => p.table === DELETE_INSTEAD_OF_UPDATE_TABLE);
    expect(billPaymentPolicies.some((p) => /for delete/.test(p.body))).toBe(true);
  });

  it("is the only thing scoping the domain layer's writes to their owner", () => {
    const domainDir = new URL("./domain/", import.meta.url);
    const files = readdirSync(domainDir).filter((f) => f.endsWith(".ts") && !f.endsWith(".test.ts"));
    const domain = files.map((f) => readFileSync(new URL(f, domainDir), "utf8")).join("\n");

    expect(domain).toMatch(/\.update\(/);

    // Only billPayments.ts may call .delete(), matching the one table
    // above with a delete policy; every other file must rely on RLS's
    // "no delete policy" backstop rather than a client-side delete call.
    for (const file of files) {
      if (file === "billPayments.ts") continue;
      const content = readFileSync(new URL(file, domainDir), "utf8");
      expect(content, `${file} calls .delete(), but only billPayments.ts should`).not.toMatch(/\.delete\(/);
    }

    const updatePolicies = policies.filter((p) => /for update/.test(p.body));
    expect(updatePolicies.length).toBeGreaterThan(0);
    for (const policy of updatePolicies) {
      expect(policy.body, `"${policy.name}" is missing a using clause`).toMatch(/using \(auth\.uid\(\) = user_id\)/);
      // Some tables (e.g. pfc_reminders) additionally AND an
      // _pfc_owns_instance check into with-check, stricter than the
      // minimum bar, so this only requires the clause exist and start
      // with the ownership comparison, not that nothing follows it.
      expect(policy.body, `"${policy.name}" is missing a with check clause`).toMatch(
        /with check \(auth\.uid\(\) = user_id/
      );
    }
  });
});
