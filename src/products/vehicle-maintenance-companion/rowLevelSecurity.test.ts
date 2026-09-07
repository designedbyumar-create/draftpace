import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

/**
 * The standing proof that every table this product owns is closed by
 * default and scoped to its owner. Structural, mirroring Travel
 * Companion's own proof, the most recently built sibling before this
 * one and the current shape every new product's migration should match.
 */

const MIGRATIONS = path.resolve(process.cwd(), "supabase/migrations");

const sql = readdirSync(MIGRATIONS)
  .filter((f) => f.endsWith(".sql"))
  .map((f) => readFileSync(path.join(MIGRATIONS, f), "utf8"))
  .join("\n");

const tables = [...sql.matchAll(/create table if not exists public\.(vmc_\w+)/g)].map((m) => m[1]);

const policies = [...sql.matchAll(/create policy\s+"([^"]+)"\s*\n?on public\.(vmc_\w+)([\s\S]*?);/g)].map((m) => ({
  name: m[1],
  table: m[2],
  body: m[0],
}));

describe("Vehicle Maintenance Companion row level security", () => {
  it("creates the two tables this product is built on", () => {
    expect(tables.sort()).toEqual(["vmc_maintenance_items", "vmc_vehicles"].sort());
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
      expect(policy.body, `"${policy.name}" does not check _vmc_owns_instance`).toContain("_vmc_owns_instance");
    }
  });

  it("grants no delete policy anywhere, so nothing can be destroyed from a client", () => {
    for (const policy of policies) {
      expect(policy.body, `"${policy.name}" grants delete`).not.toMatch(/for delete/);
    }
  });

  it("is the only thing scoping the domain layer's updates to their owner", () => {
    // vehicles.ts and maintenanceItems.ts both write through the shared
    // repository.ts factory (this product's own copy of Home Base's
    // generic CRUD pattern) rather than calling supabase directly, so the
    // domain layer taken as a whole is these three files together.
    const vehicles = readFileSync(new URL("./domain/vehicles.ts", import.meta.url), "utf8");
    const items = readFileSync(new URL("./domain/maintenanceItems.ts", import.meta.url), "utf8");
    const repository = readFileSync(new URL("./domain/repository.ts", import.meta.url), "utf8");
    const domain = vehicles + items + repository;
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
   * The schema-level half of "never a hardcoded universal interval
   * table": at least one of interval_miles/interval_months must be
   * supplied, so an item cannot exist with no way to ever compute a due
   * status, but neither is required alone, since a person may know only
   * the distance, only the time, or both.
   */
  it("requires at least one interval on a maintenance item, enforced by the database itself", () => {
    expect(sql).toMatch(
      /constraint vmc_maintenance_items_has_interval\s*\n?\s*check \(interval_miles is not null or interval_months is not null\)/
    );
  });

  /**
   * severe_duty lives on the item, not the vehicle: whether a given job's
   * interval shortens under hard use is a fact about that job, not a
   * single household-wide flag.
   */
  it("puts severe_duty on the maintenance item, not the vehicle", () => {
    const vehiclesTable = sql.slice(sql.indexOf("create table if not exists public.vmc_vehicles"), sql.indexOf("create table if not exists public.vmc_maintenance_items"));
    const itemsTable = sql.slice(sql.indexOf("create table if not exists public.vmc_maintenance_items"));
    expect(vehiclesTable).not.toMatch(/severe_duty/);
    expect(itemsTable).toMatch(/severe_duty/);
  });
});
