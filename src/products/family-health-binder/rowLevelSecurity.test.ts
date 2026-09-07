import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

/**
 * The standing proof that every table this product owns is closed by
 * default and scoped to its owner. Structural, mirroring Vehicle
 * Maintenance Companion's own proof, the most recently built sibling
 * before this one and the current shape every new product's migration
 * should match.
 */

const MIGRATIONS = path.resolve(process.cwd(), "supabase/migrations");

const sql = readdirSync(MIGRATIONS)
  .filter((f) => f.endsWith(".sql"))
  .map((f) => readFileSync(path.join(MIGRATIONS, f), "utf8"))
  .join("\n");

const tables = [...sql.matchAll(/create table if not exists public\.(fhb_\w+)/g)].map((m) => m[1]);

const policies = [...sql.matchAll(/create policy\s+"([^"]+)"\s*\n?on public\.(fhb_\w+)([\s\S]*?);/g)].map((m) => ({
  name: m[1],
  table: m[2],
  body: m[0],
}));

describe("Family Health Binder row level security", () => {
  it("creates the three tables this product is built on", () => {
    expect(tables.sort()).toEqual(["fhb_family_members", "fhb_medical_facts", "fhb_symptom_events"].sort());
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
      expect(policy.body, `"${policy.name}" does not check _fhb_owns_instance`).toContain("_fhb_owns_instance");
    }
  });

  it("grants no delete policy anywhere, so nothing can be destroyed from a client", () => {
    for (const policy of policies) {
      expect(policy.body, `"${policy.name}" grants delete`).not.toMatch(/for delete/);
    }
  });

  it("is the only thing scoping the domain layer's updates to their owner", () => {
    // Every domain module writes through the shared repository.ts
    // factory rather than calling supabase directly, so the domain
    // layer taken as a whole is these four files together.
    const members = readFileSync(new URL("./domain/familyMembers.ts", import.meta.url), "utf8");
    const facts = readFileSync(new URL("./domain/medicalFacts.ts", import.meta.url), "utf8");
    const events = readFileSync(new URL("./domain/symptomEvents.ts", import.meta.url), "utf8");
    const repository = readFileSync(new URL("./domain/repository.ts", import.meta.url), "utf8");
    const domain = members + facts + events + repository;
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
   * The schema-level half of "no cross-child leakage": every fact and
   * event table references family_member_id with on delete cascade,
   * scoped through the same user_id/product_instance_id every other
   * table on this product already carries, never a separate,
   * unscoped child identity.
   */
  it("scopes every fact and event to a family member via a foreign key, never a free-floating id", () => {
    expect(sql).toMatch(/family_member_id uuid not null references public\.fhb_family_members\(id\)/);
  });

  /**
   * The schema-level half of "not a free-text box" for the symptom
   * timeline: severity is a closed set, and a duration is either fully
   * present (value and unit) or fully absent, never a half-filled pair.
   */
  it("constrains symptom severity to a closed set and duration to a matched pair", () => {
    expect(sql).toMatch(/severity text not null check \(severity in \('mild', 'moderate', 'severe'\)\)/);
    expect(sql).toMatch(/constraint fhb_symptom_events_duration_pair/);
  });

  /** visibility must default to something, and 'summary'/'private' are the only two options the app understands. */
  it("gives every fact and event a closed, defaulted visibility", () => {
    const visibilityChecks = [...sql.matchAll(/visibility text not null default 'summary' check \(visibility in \('summary', 'private'\)\)/g)];
    expect(visibilityChecks.length).toBe(2);
  });
});
