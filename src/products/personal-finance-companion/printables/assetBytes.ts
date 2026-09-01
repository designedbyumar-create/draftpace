import { PRINTABLE_FINANCE_COMPANION_LETTER_BASE64 } from "./printableFinanceCompanionLetter.base64";
import { PRINTABLE_FINANCE_COMPANION_A4_BASE64 } from "./printableFinanceCompanionA4.base64";

/**
 * Server-only. Deliberately never imported by catalog.ts (which is reachable
 * from client components via manifest.ts, e.g. Library/Home) - only the
 * download route (src/app/api/products/[productSlug]/printables/[assetId]/
 * route.ts) imports this file, so the ~270KB base64 payloads it pulls in
 * never end up in any client bundle. See printableAssets.ts for the
 * lightweight metadata registry that catalog.ts actually uses.
 */
const BYTES_BY_ASSET_ID: Record<string, string> = {
  letter: PRINTABLE_FINANCE_COMPANION_LETTER_BASE64,
  a4: PRINTABLE_FINANCE_COMPANION_A4_BASE64,
};

export function getPrintableAssetBytes(assetId: string): Buffer | null {
  const base64 = BYTES_BY_ASSET_ID[assetId];
  if (!base64) return null;
  return Buffer.from(base64, "base64");
}
