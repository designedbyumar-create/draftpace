"use client";

import type { ZodType } from "zod";
import { supabase } from "@/lib/supabase/client";
import { ok, err, type Result } from "@/product-framework/result";

/**
 * The shared CRUD implementation every Home Base record type's domain
 * module (homeItems.ts, maintenanceTasks.ts, serviceProviders.ts) is
 * built from, Home Base's own copy of PFC's identical
 * personal-finance-companion/domain/repository.ts, not imported across
 * products.
 *
 * Ownership is enforced by RLS + the `_hmc_owns_instance` check in the
 * insert policies (see the records migration); this layer does not
 * re-check auth.uid() itself for reads/updates, matching PFC's own
 * repository.
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
      // getSession() (not getUser()): reads the already-cached local
      // session with no network round trip; RLS's own auth.uid() = user_id
      // check is the real enforcement boundary regardless. See PFC's
      // repository.ts for the incident this avoids.
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
