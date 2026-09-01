import Button from "@/design-system/Button";
import { ArrowRight } from "@/design-system/Icon";
import type { ButtonSize } from "@/design-system/Button";

/**
 * The one real "get" action for a free product, shared between the Shop
 * list (ShopProductCard in ShopGrid.tsx) and the product page (GetAction
 * in shop/[productSlug]/page.tsx) so there's exactly one place that knows
 * how a free product is added: a plain POST straight to the activation
 * endpoint, the same one /app/activate/[productSlug]'s own <form> posts to.
 * Distinct from "Learn more", which just links to the product page. The
 * two used to be the same single link, collapsing "add this" and "tell me
 * more" into one ambiguous action.
 */
export default function AddToLibraryButton({
  slug,
  label = "Add to library",
  size = "md",
  fullWidth = false,
}: {
  slug: string;
  label?: string;
  size?: ButtonSize;
  fullWidth?: boolean;
}) {
  return (
    <form method="POST" action={`/api/products/${slug}/activate`}>
      <Button type="submit" size={size} fullWidth={fullWidth} iconRight={<ArrowRight size={15} aria-hidden />}>
        {label}
      </Button>
    </form>
  );
}
