/**
 * Multi-currency support: all money math done in integer minor units
 * (cents for USD, for example), formatting only through Intl.NumberFormat.
 * No exchange rates, no conversion — changing currency changes formatting
 * only. Promoted from src/products/monthly-money-reset/currency.ts (which
 * now re-exports this file) when Personal Finance Companion needed the
 * identical utility across seven record types — see
 * docs/products/PERSONAL-FINANCE-COMPANION-FOUNDATION.md. Any future
 * product with money fields should import from here directly.
 */

const DEFAULT_MINOR_UNIT_DIGITS = 2;

/** How many minor-unit digits a currency uses (2 for USD/PKR/GBP/EUR, 0 for JPY, etc). */
export function getMinorUnitDigits(currencyCode: string): number {
  try {
    const parts = new Intl.NumberFormat("en-US", { style: "currency", currency: currencyCode }).resolvedOptions();
    return parts.maximumFractionDigits ?? DEFAULT_MINOR_UNIT_DIGITS;
  } catch {
    return DEFAULT_MINOR_UNIT_DIGITS;
  }
}

/** Major-unit decimal amount (e.g. 19.99) -> integer minor units (e.g. 1999). */
export function toMinorUnits(amount: number, currencyCode: string): number {
  const digits = getMinorUnitDigits(currencyCode);
  return Math.round(amount * 10 ** digits);
}

/** Integer minor units -> major-unit decimal amount. */
export function fromMinorUnits(minorUnits: number, currencyCode: string): number {
  const digits = getMinorUnitDigits(currencyCode);
  return minorUnits / 10 ** digits;
}

/** Formats integer minor units as a localized currency string. */
export function formatCurrency(minorUnits: number, currencyCode: string): string {
  return new Intl.NumberFormat(undefined, { style: "currency", currency: currencyCode }).format(
    fromMinorUnits(minorUnits, currencyCode)
  );
}
