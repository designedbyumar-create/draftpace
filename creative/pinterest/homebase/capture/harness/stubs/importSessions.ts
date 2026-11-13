// Stand-in for domain/importSessions.ts (Supabase): the "import session" row the paste step opens before extracting.
import { ok, type Result } from "@/product-framework/result";
import type { ImportSession, ImportInputType, ProcessingStatus } from "@/products/home-management-companion/import/types";

export async function createImportSession(_instance: string, input: { inputType: ImportInputType }): Promise<Result<ImportSession>> {
  return ok({ id: "demo-session", inputType: input.inputType, processingStatus: "pending", createdAt: "2026-10-26T10:00:00Z" } as unknown as ImportSession);
}
export async function updateImportSessionStatus(_id: string, _status: ProcessingStatus): Promise<Result<true>> { return ok(true); }
