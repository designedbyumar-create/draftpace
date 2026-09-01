import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

/**
 * The standing proof that every table this product owns is closed by
 * default and scoped to its owner.
 *
 * A live cross-user probe is the stronger check and was run by hand
 * against the real project, but it proves one moment in time and cannot
 * be re-run in CI. This reads the migrations themselves, so the invariant
 * is enforced against every future migration too: the failure mode being
 * guarded is somebody adding an hmc_ table in six months and forgetting
 * one line, which is silent until somebody else's rows show up in your
 * home.
 *
 * Structural, not behavioural. It cannot prove Postgres enforces what the
 * SQL says, only that the SQL says it. That is the right division: the
 * enforcement is Postgres's job and is not in doubt, the declaration is
 * ours and is easy to forget.
 */

const MIGRATIONS = path.resolve(process.cwd(), "supabase/migrations");

const sql = readdirSync(MIGRATIONS)
  .filter((f) => f.endsWith(".sql"))
  .map((f) => readFileSync(path.join(MIGRATIONS, f), "utf8"))
  .join("\n");

/** Every hmc_ table any migration creates, so a new one is covered the day it lands. */
const tables = [...sql.matchAll(/create table if not exists public\.(hmc_\w+)/g)].map((m) => m[1]);

/** One policy statement, from "create policy" to its terminating semicolon. */
const policies = [...sql.matchAll(/create policy\s+"([^"]+)"\s*\n?on public\.(hmc_\w+)([\s\S]*?);/g)].map((m) => ({
  name: m[1],
  table: m[2],
  body: m[0],
}));

describe("Home Base row level security", () => {
  it("creates the tables this product is built on", () => {
    expect(tables).toContain("hmc_things");
    expect(tables).toContain("hmc_thing_documents");
    expect(tables).toContain("hmc_problems");
    expect(tables.length).toBeGreaterThanOrEqual(12);
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

  /**
   * An insert scoped only by auth.uid() would let somebody attach a row
   * to a product instance they do not own, which is the one gap the
   * owner check closes.
   */
  it("additionally proves instance ownership on insert", () => {
    const inserts = policies.filter((p) => /for insert/.test(p.body));
    expect(inserts.length).toBeGreaterThan(0);
    for (const policy of inserts) {
      expect(policy.body, `"${policy.name}" does not check _hmc_owns_instance`).toContain("_hmc_owns_instance");
    }
  });

  /**
   * Nothing in this product hard-deletes. Records are archived through
   * the shared status column so history stays answerable, and the absence
   * of a delete policy is what makes that a guarantee rather than a
   * convention the UI happens to follow.
   */
  it("grants no delete policy anywhere, so nothing can be destroyed from a client", () => {
    for (const policy of policies) {
      expect(policy.body, `"${policy.name}" grants delete`).not.toMatch(/for delete/);
    }
  });
});
