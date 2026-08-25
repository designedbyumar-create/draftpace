import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

/**
 * The standing proof that every table this product owns is closed by
 * default and scoped to its owner.
 *
 * Structural, mirroring Alongside's own proof. It matters here for a
 * reason specific to this product: trv_documents (a later migration)
 * will hold passport and visa references, and trv_people holds a
 * child's requirements. There is no version of either leaking which is
 * survivable.
 */

const MIGRATIONS = path.resolve(process.cwd(), "supabase/migrations");

const sql = readdirSync(MIGRATIONS)
  .filter((f) => f.endsWith(".sql"))
  .map((f) => readFileSync(path.join(MIGRATIONS, f), "utf8"))
  .join("\n");

/** Scoped to this product's own migrations only, for checks that scan for generic words a sibling product legitimately uses elsewhere (e.g. PFC's own "amount" columns, HMC's import "upload" copy). */
const trvSql = readdirSync(MIGRATIONS)
  .filter((f) => f.endsWith(".sql") && f.includes("travel_companion"))
  .map((f) => readFileSync(path.join(MIGRATIONS, f), "utf8"))
  .join("\n");

const tables = [...sql.matchAll(/create table if not exists public\.(trv_\w+)/g)].map((m) => m[1]);

const policies = [...sql.matchAll(/create policy\s+"([^"]+)"\s*\n?on public\.(trv_\w+)([\s\S]*?);/g)].map((m) => ({
  name: m[1],
  table: m[2],
  body: m[0],
}));

describe("Travel Companion row level security", () => {
  it("creates the five phase 1 tables", () => {
    expect(tables.sort()).toEqual(["trv_booking_people", "trv_bookings", "trv_people", "trv_places", "trv_trips"]);
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
      expect(policy.body, `"${policy.name}" does not check _trv_owns_instance`).toContain("_trv_owns_instance");
    }
  });

  /**
   * A wrongly linked traveller, a mistyped trip title, a booking added
   * to the wrong place, all real, ordinary mistakes, all corrected by
   * an update to status, never a delete. This is the same guarantee
   * every sibling product makes, applied here without exception,
   * including to the join table.
   */
  it("grants no delete policy anywhere, so nothing can be destroyed from a client", () => {
    for (const policy of policies) {
      expect(policy.body, `"${policy.name}" grants delete`).not.toMatch(/for delete/);
    }
  });

  it("is the only thing scoping the domain layer's updates to their owner", () => {
    const domain = readFileSync(new URL("./domain/travelData.ts", import.meta.url), "utf8");
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

  /**
   * The tree claim (§13 of the proposal) is a database constraint plus
   * an application-level cycle guard working together. This proves the
   * database half: a booking cannot reference itself, which the cycle
   * guard in trip.ts cannot enforce on its own if a write bypassed it.
   */
  it("stops a booking depending on itself at the schema level, not only in application code", () => {
    expect(sql).toMatch(/constraint trv_bookings_not_self_dependent check \(id <> depends_on_booking_id\)/);
  });

  /**
   * The boundary the founder locked: no amount, currency, balance, or
   * split column anywhere in this product's schema. This is the
   * tripwire the migration's own header comment names explicitly.
   */
  it("has no money column anywhere: the founder's hard boundary against becoming a second Personal Finance Companion", () => {
    for (const word of ["amount", "currency", "balance", "price", "cost"]) {
      expect(trvSql.toLowerCase(), `a "${word}" column would breach the money boundary`).not.toMatch(
        new RegExp(`\\b${word}\\b\\s+(text|numeric|integer|decimal)`)
      );
    }
  });

  /**
   * The other boundary the founder locked: no file storage. A document
   * is a registry entry (kept_where), never a file reference.
   */
  it("has no file/storage column anywhere: documents are a registry, not a vault", () => {
    expect(trvSql.toLowerCase()).not.toMatch(/\b(file_url|storage_path|upload|attachment)\b/);
  });
});
