import { HOME_SURVEY_LETTER_BASE64 } from "./homeSurveyLetter.base64";
import { HOME_SURVEY_A4_BASE64 } from "./homeSurveyA4.base64";

/**
 * Server-only, and deliberately never imported by catalog.ts (which is
 * reachable from client components via manifest.ts). Only the download
 * route imports this file, so the base64 payloads it pulls in never end
 * up in any client bundle. See product-framework/printableAssets.ts for
 * the lightweight metadata registry catalog.ts actually uses.
 *
 * Same shape as Personal Finance Companion's own assetBytes.ts, on
 * purpose: a second product adds its own loader rather than a shared
 * bytes registry, so bytes stay out of anything generic and
 * client-reachable.
 */
const BYTES_BY_ASSET_ID: Record<string, string> = {
  letter: HOME_SURVEY_LETTER_BASE64,
  a4: HOME_SURVEY_A4_BASE64,
};

export function getPrintableAssetBytes(assetId: string): Buffer | null {
  const base64 = BYTES_BY_ASSET_ID[assetId];
  if (!base64) return null;
  return Buffer.from(base64, "base64");
}
