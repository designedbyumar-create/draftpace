import { HOMESCHOOL_YEAR_LETTER_BASE64 } from "./homeschoolYearLetter.base64";
import { HOMESCHOOL_YEAR_A4_BASE64 } from "./homeschoolYearA4.base64";

/**
 * Server-only, and deliberately never imported by catalog.ts, which is
 * reachable from client components through manifest.ts. Only the
 * download route imports this file, so the base64 payloads it pulls in
 * never end up in any client bundle.
 *
 * Same shape as both siblings' own assetBytes.ts on purpose: a third
 * product adds its own loader rather than anybody building a shared
 * bytes registry, so bytes stay out of anything generic and
 * client-reachable.
 */
const BYTES_BY_ASSET_ID: Record<string, string> = {
  letter: HOMESCHOOL_YEAR_LETTER_BASE64,
  a4: HOMESCHOOL_YEAR_A4_BASE64,
};

export function getPrintableAssetBytes(assetId: string): Buffer | null {
  const base64 = BYTES_BY_ASSET_ID[assetId];
  if (!base64) return null;
  return Buffer.from(base64, "base64");
}
