// Stand-in for domain/extractionCandidates.ts (Supabase): nothing imported, so nothing waiting for review.
import { ok, type Result } from "@/product-framework/result";

export async function countUnreviewedCandidates(_instance: string): Promise<Result<number>> { return ok(0); }
