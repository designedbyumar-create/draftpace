import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

/**
 * The standing proof that every table this product owns is closed by
 * default and scoped to its owner.
 *
 * Structural, mirroring the Home Base proof, and written for the same
 * reason: the failure mode being guarded is somebody adding an als_ table
 * in six months and forgetting one line, which is silent right up until
 * somebody else's life shows up in yours.
 *
 * It matters more here than in the products that came before it. This
 * table records what a person has been avoiding, what they walked away
 * from, and what they wrote to themselves about why. There is no version
 * of that leaking which is survivable, and unlike a wrong figure in a
 * budget it cannot be corrected afterwards.
 */

const MIGRATIONS = path.resolve(process.cwd(), "supabase/migrations");

const sql = readdirSync(MIGRATIONS)
  .filter((f) => f.endsWith(".sql"))
  .map((f) => readFileSync(path.join(MIGRATIONS, f), "utf8"))
  .join("\n");

const tables = [...sql.matchAll(/create table if not exists public\.(als_\w+)/g)].map((m) => m[1]);

const policies = [...sql.matchAll(/create policy\s+"([^"]+)"\s*\n?on public\.(als_\w+)([\s\S]*?);/g)].map((m) => ({
  name: m[1],
  table: m[2],
  body: m[0],
}));

describe("Alongside row level security", () => {
  it("creates the four tables this product is built on", () => {
    expect(tables.sort()).toEqual(["als_item_events", "als_items", "als_run_answers", "als_runs"]);
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
      expect(policy.body, `"${policy.name}" does not check _als_owns_instance`).toContain("_als_owns_instance");
    }
  });

  /**
   * Nothing here hard-deletes. In a product about things people find
   * hard to finish, a bad week must not be able to erase the record of a
   * year in which they got a great deal done, and the absence of a
   * delete policy is what makes that a guarantee rather than a habit the
   * interface happens to keep.
   */
  it("grants no delete policy anywhere, so nothing can be destroyed from a client", () => {
    for (const policy of policies) {
      expect(policy.body, `"${policy.name}" grants delete`).not.toMatch(/for delete/);
    }
  });

  /**
   * History is read back to the person as a record of what they did. One
   * that can be edited after the fact is not a record they can trust,
   * and the missing update policy is the only thing enforcing that.
   */
  it("makes the history append only", () => {
    const updates = policies.filter((p) => p.table === "als_item_events" && /for update/.test(p.body));
    expect(updates, "als_item_events can be rewritten after the fact").toHaveLength(0);
  });

  /**
   * The domain layer filters updates on id alone, deliberately, because
   * the policy supplies the ownership check. If that ever stops being
   * true these functions become "update any row by id", so the two facts
   * are asserted together rather than left to be noticed separately.
   */
  it("is the only thing scoping the domain layer's updates to their owner", () => {
    const domain = readFileSync(new URL("./domain/alongsideData.ts", import.meta.url), "utf8");
    expect(domain).toMatch(/\.update\(/);
    const updatePolicies = policies.filter((p) => /for update/.test(p.body));
    expect(updatePolicies.length).toBeGreaterThan(0);
    for (const policy of updatePolicies) {
      // Both halves. USING alone would let a row be updated into
      // somebody else's ownership.
      expect(policy.body, `"${policy.name}" is missing a using clause`).toMatch(/using \(auth\.uid\(\) = user_id\)/);
      expect(policy.body, `"${policy.name}" is missing a with check clause`).toMatch(
        /with check \(auth\.uid\(\) = user_id\)/
      );
    }
  });
});
