import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

/**
 * The standing proof that every table this product owns is closed by
 * default and scoped to its owner.
 *
 * Structural, same shape as Alongside's and Travel Companion's own
 * proofs. It matters here for the same reason it mattered for Alongside:
 * this product records who someone would call first, where the deeds
 * are kept, and what a family should know after a death, and there is no
 * version of that leaking which is survivable.
 */

const MIGRATIONS = path.resolve(process.cwd(), "supabase/migrations");

const sql = readdirSync(MIGRATIONS)
  .filter((f) => f.endsWith(".sql"))
  .map((f) => readFileSync(path.join(MIGRATIONS, f), "utf8"))
  .join("\n");

const tables = [...sql.matchAll(/create table if not exists public\.(pla_\w+)/g)].map((m) => m[1]);

const policies = [...sql.matchAll(/create policy\s+"([^"]+)"\s*\n?on public\.(pla_\w+)([\s\S]*?);/g)].map((m) => ({
  name: m[1],
  table: m[2],
  body: m[0],
}));

describe("Personal Life Affairs Companion row level security", () => {
  it("creates the six tables this product is built on", () => {
    expect(tables.sort()).toEqual(
      ["pla_items", "pla_steps", "pla_item_links", "pla_item_revisions", "pla_events", "pla_profile"].sort()
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

  it("additionally proves instance ownership on insert", () => {
    const inserts = policies.filter((p) => /for insert/.test(p.body));
    expect(inserts.length).toBe(tables.length);
    for (const policy of inserts) {
      expect(policy.body, `"${policy.name}" does not check _pla_owns_instance`).toContain("_pla_owns_instance");
    }
  });

  it("grants no delete policy anywhere, so nothing can be destroyed from a client", () => {
    for (const policy of policies) {
      expect(policy.body, `"${policy.name}" grants delete`).not.toMatch(/for delete/);
    }
  });

  /**
   * pla_item_revisions is the audit trail of what a record used to say.
   * A revision that could be edited after being written is not a
   * revision, so it gets select and insert only, no update policy.
   */
  it("grants no update policy on the append-only revisions table", () => {
    const table = "pla_item_revisions";
    const tablePolicies = policies.filter((p) => p.table === table);
    expect(tablePolicies.length, `${table} has no policies at all`).toBeGreaterThan(0);
    for (const policy of tablePolicies) {
      expect(policy.body, `"${policy.name}" grants update on an append-only table`).not.toMatch(/for update/);
    }
  });

  it("is the only thing scoping the domain layer's updates to their owner", () => {
    const domain = readFileSync(new URL("./domain/affairsData.ts", import.meta.url), "utf8");
    expect(domain).toMatch(/\.update\(/);
    expect(domain, "the domain layer must never call .delete(), RLS grants no delete policy to fall back on").not.toMatch(
      /\.delete\(/
    );
    const updatePolicies = policies.filter((p) => /for update/.test(p.body));
    expect(updatePolicies.length).toBeGreaterThan(0);
    for (const policy of updatePolicies) {
      expect(policy.body, `"${policy.name}" is missing a using clause`).toMatch(/using \(auth\.uid\(\) = user_id\)/);
      expect(policy.body, `"${policy.name}" is missing a with check clause`).toMatch(
        /with check \(auth\.uid\(\) = user_id\)/
      );
    }
  });
});
