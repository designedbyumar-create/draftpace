import { formatCurrency } from "@/lib/currency";

/**
 * A money figure set as the product sets them where the figure is the
 * point: the product's narrative face, whole units large, cents smaller
 * and quieter. Everywhere else a figure is plain text in the running
 * sans; this is for the hero and a handful of headline numbers.
 */
export default function Figure({ minorUnits, size, currency = "USD", className = "" }: { minorUnits: number; size: number; currency?: string; className?: string }) {
  const [whole, cents] = formatCurrency(Math.abs(minorUnits), currency).split(".");
  return (
    <span
      className={`tabular-nums tracking-[-0.03em] ${className}`}
      style={{ fontFamily: "var(--product-narrative-font, inherit)", fontSize: size, lineHeight: 1, fontWeight: 400 }}
    >
      {minorUnits < 0 ? "−" : ""}
      {whole}
      {cents !== undefined && (
        <span style={{ fontSize: size * 0.5, letterSpacing: 0, opacity: 0.6 }}>.{cents}</span>
      )}
    </span>
  );
}
