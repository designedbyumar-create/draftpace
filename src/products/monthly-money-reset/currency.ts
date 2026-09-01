/**
 * Re-exports the shared money utility (promoted to src/lib/currency.ts when
 * Personal Finance Companion needed the identical functions). Kept as a
 * re-export, not removed, so every existing import path in this product
 * continues to resolve unchanged.
 */
export * from "@/lib/currency";
