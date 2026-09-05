import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Structural checks on the vacation-mode pause migration — same
 * discipline as monthly-money-reset/migration.test.ts's own checks on
 * set_product_instance_lifecycle: an automated pass on the migration
 * text, not a live database.
 */

const sql = readFileSync(
  join(process.cwd(), "supabase", "migrations", "202609060002_product_instance_pause.sql"),
  "utf-8"
);

describe("product_instance pause migration — structural checks", () => {
  it("adds paused_at as a new, additive column", () => {
    expect(sql).toContain("add column if not exists paused_at timestamptz");
  });

  it("defines set_product_instance_paused as security definer", () => {
    expect(sql).toMatch(/create or replace function public\.set_product_instance_paused[\s\S]*?security definer/);
  });

  it("checks ownership before mutating, the same way set_product_instance_lifecycle does", () => {
    expect(sql).toContain("if v_owner is null or v_owner <> v_user_id then");
  });

  it("restricts execution to authenticated only", () => {
    expect(sql).toContain("revoke all on function public.set_product_instance_paused(uuid, boolean) from public");
    expect(sql).toContain("grant execute on function public.set_product_instance_paused(uuid, boolean) to authenticated");
  });

  it("never sets lifecycle_state or completed_at — a separate, cycle-agnostic mechanism", () => {
    expect(sql).not.toMatch(/set\s+[\s\S]*lifecycle_state\s*=/);
    expect(sql).not.toMatch(/set\s+[\s\S]*completed_at\s*=/);
  });
});
