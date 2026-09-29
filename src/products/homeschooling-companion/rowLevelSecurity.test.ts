import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

/**
 * The standing proof that every table this product owns is closed by
 * default and scoped to its owner.
 *
 * Structural, same shape as every sibling's own proof, adapted for one
 * real difference: six of this product's tables (the check tables and
 * the question bank) are secured through a `do $$ ... foreach t in
 * array [...] loop ... end loop; end $$;` block rather than one literal
 * `create policy` statement per table, because the same three-policy
 * shape repeats identically across them. A naive scan for literal
 * `create policy ... on public.<table>` text misses those six entirely,
 * which would make this test claim a real gap that doesn't exist, so it
 * parses the loop separately and merges the two.
 *
 * It matters here for the reason the household migration's own comment
 * gives: a child's records, and what a parent observed about them, are
 * not survivable to leak.
 */

const MIGRATIONS = path.resolve(process.cwd(), "supabase/migrations");

const sql = readdirSync(MIGRATIONS)
  .filter((f) => f.endsWith(".sql"))
  .map((f) => readFileSync(path.join(MIGRATIONS, f), "utf8"))
  .join("\n");

/**
 * Scoped to this product's own migrations for the loop-block scan below:
 * the global `sql` also contains an unrelated `foreach t in array [...]`
 * loop in a Personal Finance Companion migration (a trigger-creation
 * loop, nothing to do with policies), which the loop regex would
 * otherwise match too.
 */
const hscSql = readdirSync(MIGRATIONS)
  .filter((f) => f.endsWith(".sql") && f.includes("homeschooling_companion"))
  .map((f) => readFileSync(path.join(MIGRATIONS, f), "utf8"))
  .join("\n");

const tables = [...sql.matchAll(/create table if not exists public\.(hsc_\w+)/g)].map((m) => m[1]);

/** Literal, one-per-table `create policy` statements. */
const staticPolicies = [...sql.matchAll(/create policy\s+"([^"]+)"\s*\n?on public\.(hsc_\w+)([\s\S]*?);/g)].map((m) => ({
  name: m[1],
  table: m[2],
  body: m[0],
}));

/**
 * Tables secured via a `foreach t in array array[...] loop` block. Each
 * match captures the array literal (the table list) and the loop body
 * (the format() calls, which is where the policy shape actually lives),
 * so the safety of every table in the array can be verified against the
 * one shared template rather than assumed.
 */
const loopBlocks = [...hscSql.matchAll(/foreach t in array array\[([^\]]+)\][\s\S]*?end loop;/g)]
  .filter((m) => /create policy/.test(m[0]))
  .map((m) => ({
    tableList: m[1].match(/'([a-z_]+)'/g)?.map((s) => s.replace(/'/g, "")) ?? [],
    body: m[0],
  }));

const dynamicallyCoveredTables = new Set(loopBlocks.flatMap((b) => b.tableList));

describe("Homeschooling Companion row level security", () => {
  it("creates the fourteen tables this product is built on", () => {
    expect(tables.sort()).toEqual(
      [
        "hsc_children",
        "hsc_curricula",
        "hsc_curriculum_nodes",
        "hsc_positions",
        "hsc_plan",
        "hsc_task_events",
        "hsc_observations",
        "hsc_items",
        "hsc_child_topics",
        "hsc_checks",
        "hsc_check_items",
        "hsc_check_answers",
        "hsc_check_results",
        "hsc_household",
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

  it("finds every dynamically-secured table's loop, so the merge below isn't silently checking zero tables", () => {
    expect(dynamicallyCoveredTables.size).toBeGreaterThan(0);
    expect([...dynamicallyCoveredTables].sort()).toEqual(
      ["hsc_checks", "hsc_check_items", "hsc_check_answers", "hsc_check_results", "hsc_child_topics", "hsc_items"].sort()
    );
  });

  it("gives every table at least one policy, static or looped", () => {
    for (const table of tables) {
      const hasStatic = staticPolicies.some((p) => p.table === table);
      const hasDynamic = dynamicallyCoveredTables.has(table);
      expect(hasStatic || hasDynamic, `${table} has RLS on but no policy, static or looped`).toBe(true);
    }
  });

  it("scopes every static policy to the signed-in user's own rows, granted only to authenticated", () => {
    for (const policy of staticPolicies) {
      expect(policy.body, `"${policy.name}" does not compare auth.uid() to user_id`).toContain("auth.uid() = user_id");
      expect(policy.body, `"${policy.name}" is not restricted to authenticated`).toContain("to authenticated");
      expect(policy.body).not.toMatch(/\bto\s+anon\b/);
      expect(policy.body).not.toMatch(/\bto\s+public\b/);
    }
  });

  it("every loop body follows the same safe template: select, insert with instance ownership, update with both checks, all scoped to auth.uid(), none granting delete", () => {
    for (const block of loopBlocks) {
      expect(block.body, "loop body has no select policy scoped to the owner").toMatch(
        /for select to authenticated using \(auth\.uid\(\) = user_id\)/
      );
      expect(block.body, "loop body's insert policy does not check ownership").toMatch(
        /for insert to authenticated with check \(auth\.uid\(\) = user_id and public\._hsc_owns_instance\(product_instance_id\)\)/
      );
      expect(block.body, "loop body's update policy is missing using/with check").toMatch(
        /for update to authenticated using \(auth\.uid\(\) = user_id\) with check \(auth\.uid\(\) = user_id\)/
      );
      expect(block.body, "loop body grants delete").not.toMatch(/for delete/);
    }
  });

  it("additionally proves instance ownership on every static insert policy", () => {
    const inserts = staticPolicies.filter((p) => /for insert/.test(p.body));
    const staticInsertableTables = tables.filter((t) => !dynamicallyCoveredTables.has(t));
    expect(inserts.length).toBe(staticInsertableTables.length);
    for (const policy of inserts) {
      expect(policy.body, `"${policy.name}" does not check _hsc_owns_instance`).toContain("_hsc_owns_instance");
    }
  });

  it("grants no delete policy anywhere, static or looped, so nothing can be destroyed from a client", () => {
    for (const policy of staticPolicies) {
      expect(policy.body, `"${policy.name}" grants delete`).not.toMatch(/for delete/);
    }
    for (const block of loopBlocks) {
      expect(block.body).not.toMatch(/for delete/);
    }
  });

  it("is the only thing scoping the domain layer's updates to their owner", () => {
    const domainDir = new URL("./domain/", import.meta.url);
    const files = readdirSync(domainDir).filter((f) => f.endsWith(".ts") && !f.endsWith(".test.ts"));
    const domain = files.map((f) => readFileSync(new URL(f, domainDir), "utf8")).join("\n");
    expect(domain).toMatch(/\.update\(/);
    expect(domain, "the domain layer must never call .delete(), RLS grants no delete policy to fall back on").not.toMatch(
      /\.delete\(/
    );

    const staticUpdatePolicies = staticPolicies.filter((p) => /for update/.test(p.body));
    expect(staticUpdatePolicies.length).toBeGreaterThan(0);
    for (const policy of staticUpdatePolicies) {
      expect(policy.body, `"${policy.name}" is missing a using clause`).toMatch(/using \(auth\.uid\(\) = user_id\)/);
      expect(policy.body, `"${policy.name}" is missing a with check clause`).toMatch(
        /with check \(auth\.uid\(\) = user_id/
      );
    }
  });
});
