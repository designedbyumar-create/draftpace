// Stand-in for domain/homeProfile.ts (Supabase): the answer to "do you own it or rent it?" for the capture.
// With tenure already known, the real SetupModule skips straight to "What's in your home?" exactly as it does for a returning user.
import { ok, type Result } from "@/product-framework/result";
import { TENURE } from "../fixtures";

export type HomeTenure = "own" | "rent";
export interface HomeProfile { tenure: HomeTenure | null }
export const defaultHomeProfile = (): HomeProfile => ({ tenure: null });
export async function loadHomeProfile(): Promise<Result<HomeProfile>> { return ok({ tenure: TENURE }); }
export async function saveHomeProfile(_id: string, profile: HomeProfile): Promise<Result<HomeProfile>> { return ok(profile); }
