import { iconForProduct } from "@/product-framework/productIcons";
import type { ProductDefinition } from "@/product-framework/definition";

/**
 * The one shared icon badge for an owned product, used on Home, in the
 * Library, on the Shop, and inside a product's own shell, so a product
 * looks like the same thing everywhere it's shown.
 *
 * Reads the product's own `theme.accentScale` directly rather than the
 * ambient `--primary`/`--primary-soft` tokens: those are the platform's
 * own accent (or, inside a themed product's shell, that product's accent
 * remapped onto them by `productThemeStyle`), reading them here meant a
 * product's icon only ever showed its own colour on the one screen that
 * happens to be inside its own shell root, and fell back to plain
 * platform teal everywhere else, which is what this component fixes.
 *
 * A product with no declared `accentScale` (still true for a couple of
 * products at the time of writing) falls back to the platform accent ,
 * an honest "no identity yet" rather than a colour invented here.
 */
export default function ProductBadge({
  definition,
  size = "md",
}: {
  definition: ProductDefinition;
  size?: "sm" | "md";
}) {
  const Icon = iconForProduct(definition.slug);
  const scale = definition.theme.accentScale;
  const dimension = size === "sm" ? "h-6 w-6" : "h-7 w-7";
  const iconSize = size === "sm" ? 13 : 15;

  const style = scale
    ? ({ backgroundColor: scale.wash ?? scale.soft, color: scale.base } as React.CSSProperties)
    : undefined;

  return (
    <span
      className={`flex ${dimension} shrink-0 items-center justify-center rounded-full ${
        scale ? "" : "bg-[var(--primary-soft)] text-[var(--primary)]"
      }`}
      style={style}
    >
      <Icon size={iconSize} aria-hidden />
    </span>
  );
}
