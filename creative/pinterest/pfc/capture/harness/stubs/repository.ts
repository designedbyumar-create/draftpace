// Stand-in for domain/repository.ts (Supabase). Same interface; list() serves the fixture rows for the table,
// each parsed through the entity's REAL zod schema, so a fixture that does not fit the product's own schema throws.
import type { ZodType } from "zod";
import { ok, err, type Result } from "@/product-framework/result";
import { TABLES } from "../fixtures";

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

export function createRecordRepository<TEntity, TRow>(config: RecordRepositoryConfig<TEntity, TRow>): RecordRepository<TEntity> {
  const rows = (TABLES[config.table] ?? []) as unknown[];
  return {
    async list() {
      return ok(rows.map((row) => config.schema.parse(row)));
    },
    async create() { return err({ kind: "network", message: "capture harness: read-only" }); },
    async update() { return err({ kind: "network", message: "capture harness: read-only" }); },
    async archive() { return err({ kind: "network", message: "capture harness: read-only" }); },
  };
}
