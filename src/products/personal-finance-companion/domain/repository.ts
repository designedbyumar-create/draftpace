"use client";

import type { ZodType } from "zod";
import { supabase } from "@/lib/supabase/client";
import { ok, err, type Result } from "@/product-framework/result";

/**
 * The one shared CRUD implementation every one of the seven record types'
 * domain module (accounts.ts, incomeSources.ts, bills.ts, ...) is built
 * from. This is what makes "one canonical createBill / updateBill /
 * archiveBill" structurally true rather than merely a naming convention:
 * Companion's guided setup and a direct section's own add/edit form both
 * import the exact same generated functions from the exact same module —
 * there is no second implementation for either to drift from. See launch
 * spec section 19 and docs/products/PERSONAL-FINANCE-COMPANION-FOUNDATION.md.
 *
 * Ownership is enforced by RLS + the `_pfc_owns_instance` check in the
 * insert/update policies (see the write-access migration) — this layer
 * does not re-check auth.uid() itself, matching how a plain RLS-scoped
 * `supabase.from(...)` call is trusted everywhere else `"use client"` data
 * access already happens in this repository (e.g. deriveOwnedProducts.ts's
 * reads). Field mapping (camelCase TS <-> snake_case Postgres columns) is
 * supplied per entity, since the two never differ mechanically enough for
 * one generic name transform to be trustworthy (`currentBalanceMinorUnits`
 * -> `current_balance_minor`, not `current_balance_minor_units`).
 */
export interface RecordRepositoryConfig<TEntity, TRow> {
  table: string;
  schema: ZodType<TEntity>;
  /** Postgres row (snake_case) -> the shape the Zod schema expects (camelCase). */
  fromRow: (row: TRow) => unknown;
  /** A partial entity patch (camelCase) -> Postgres columns to write (snake_case). Never includes id/user_id/created_at/updated_at — the repository owns those. */
  toRow: (patch: Record<string, unknown>) => Record<string, unknown>;
}

export interface RecordRepository<TEntity> {
  list(productInstanceId: string): Promise<Result<TEntity[]>>;
  create(productInstanceId: string, patch: Record<string, unknown>): Promise<Result<TEntity>>;
  update(id: string, patch: Record<string, unknown>): Promise<Result<TEntity>>;
  archive(id: string): Promise<Result<TEntity>>;
}

export function createRecordRepository<TEntity, TRow>(
  config: RecordRepositoryConfig<TEntity, TRow>
): RecordRepository<TEntity> {
  const { table, schema, fromRow, toRow } = config;

  function parseRow(row: TRow): Result<TEntity> {
    const parsed = schema.safeParse(fromRow(row));
    if (!parsed.success) {
      return err({ kind: "validation", message: parsed.error.issues[0]?.message ?? "Invalid record shape." });
    }
    return ok(parsed.data);
  }

  return {
    async list(productInstanceId) {
      const { data, error } = await supabase
        .from(table)
        .select("*")
        .eq("product_instance_id", productInstanceId)
        .order("created_at", { ascending: true });

      if (error) return err({ kind: "network", message: error.message });

      const rows = (data ?? []) as TRow[];
      const parsedEntities: TEntity[] = [];
      for (const row of rows) {
        const result = parseRow(row);
        if (result.ok) parsedEntities.push(result.data);
        // A single malformed row is skipped rather than failing the whole
        // list — matching the "never a dead end" principle from the launch
        // spec section 8's failure handling, applied to reads too.
      }
      return ok(parsedEntities);
    },

    async create(productInstanceId, patch) {
      // user_id has no database default (see the records migration) — the
      // insert RLS policy's `auth.uid() = user_id` check fails on a null
      // user_id, so it must be set explicitly here rather than assumed.
      // getSession() (not getUser()) deliberately: getSession() reads the
      // already-cached local session with no network round trip, while
      // getUser() re-validates the JWT against Supabase Auth on every call.
      // That revalidation buys nothing here: RLS's own `auth.uid() =
      // user_id` check is the real, authoritative enforcement boundary
      // regardless of what user_id this client claims, so it was only ever
      // adding a second sequential network round trip to every single
      // create in this repository, real, measurable lag on every "Add"
      // across all seven PFC record types.
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();
      if (sessionError) return err({ kind: "network", message: sessionError.message });
      if (!session) return err({ kind: "not-authenticated" });

      const { data, error } = await supabase
        .from(table)
        .insert({ ...toRow(patch), product_instance_id: productInstanceId, user_id: session.user.id })
        .select("*")
        .single();

      if (error) return err({ kind: "network", message: error.message });
      return parseRow(data as TRow);
    },

    async update(id, patch) {
      const { data, error } = await supabase.from(table).update(toRow(patch)).eq("id", id).select("*").maybeSingle();

      if (error) return err({ kind: "network", message: error.message });
      if (!data) return err({ kind: "not-found" });
      return parseRow(data as TRow);
    },

    async archive(id) {
      const { data, error } = await supabase
        .from(table)
        .update({ status: "archived" })
        .eq("id", id)
        .select("*")
        .maybeSingle();

      if (error) return err({ kind: "network", message: error.message });
      if (!data) return err({ kind: "not-found" });
      return parseRow(data as TRow);
    },
  };
}
