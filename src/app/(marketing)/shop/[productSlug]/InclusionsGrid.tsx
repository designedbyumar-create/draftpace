import { CheckCircle2 } from "@/design-system/Icon";

/**
 * Every one of a product's inclusions, at once, in a grid that never
 * needs a "show more."
 *
 * The list this replaced was a 2-column checklist folded behind a
 * disclosure past 6 items, with a bare 16px outline checkmark on every
 * row regardless of how many rows there were. Products range from 8 to
 * 14 inclusions (see src/shop/products/*.ts); a 3-column grid holds 14
 * in five rows, scannable in one glance, so nothing is ever hidden.
 *
 * The checkmark became a small tinted chip rather than a bare glyph.
 * `product.inclusions` is a flat string[] with no categories in the data
 * model, so every item gets the same chip: the fix here is weight, not
 * inventing variety the content doesn't have.
 */
export default function InclusionsGrid({ items, accent }: { items: string[]; accent: string }) {
  return (
    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <li
          key={item}
          className="flex items-start gap-2.5 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-3.5"
        >
          <span
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
            style={{ backgroundColor: `color-mix(in srgb, ${accent} 14%, var(--surface))` }}
          >
            <CheckCircle2 size={14} filled style={{ color: accent }} aria-hidden />
          </span>
          <span className="mt-0.5 text-body-sm leading-relaxed text-[var(--text)]">{item}</span>
        </li>
      ))}
    </ul>
  );
}
