"use client";

import type { ZodType } from "zod";
import { supabase } from "@/lib/supabase/client";
import { ok, err, type Result } from "@/product-framework/result";

/**
 * The shared CRUD implementation this product's domain modules
 * (familyMembers.ts, medicalFacts.ts, symptomEvents.ts) are built from.
 * This product's own copy of the same pattern Home Base and Vehicle
 * Maintenance Companion each keep, deliberately not imported across
 * products.
 *
 * Ownership is enforced by RLS + the `_fhb_owns_instance` check in the
 * insert policies (see the schema migration); this layer does not
 * re-check auth.uid() itself for reads/updates.
 */
export interface RecordRepositoryConfig<TEntity, TRow> {
  table: string;
  schema: ZodType<TEntity>;
  fromRow: (row: TRow) => unknown;
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
      }
      return ok(parsedEntities);
    },

    async create(productInstanceId, patch) {
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
