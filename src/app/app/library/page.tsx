import ShopCardMockup from "@/app/(marketing)/shop/ShopCardMockup";
import { screensFor } from "@/app/(marketing)/shop/productScreens";
import { LIFE_AREAS } from "@/content/areas";
import { shopRegistry } from "@/shop/registry";
import { ensureShopRegistered } from "@/shop/ensureRegistered";
import LibraryShelf, { type ShelfPresentation } from "./LibraryShelf";

/**
 * Library's server half: it resolves what each product *is* — the promise
 * it was sold on, the life area it belongs to, and its three real screens
 * — and hands that to the client shelf, which resolves what the person
 * *owns*.
 *
 * Split this way on purpose. The Shop listing content and the mockup
 * components are static, sizeable, and identical for everybody; bundling
 * them into the client just so an authenticated page can read a promise
 * string would ship the whole catalogue to every visitor's browser. The
 * screens are rendered here and passed down as nodes, the same boundary
 * ShopGrid already uses for its thumbnails.
 *
 * force-dynamic because shopRegistry is populated at request time by
 * module-level singletons — see ensureShopRegistered's own note on why a
 * cached render can otherwise serve an empty registry.
 */
export const dynamic = "force-dynamic";

export default function LibraryPage() {
  ensureShopRegistered();

  const areaByProductSlug = new Map<string, (typeof LIFE_AREAS)[number]>();
  for (const area of LIFE_AREAS) {
    for (const slug of area.productSlugs) {
      if (!areaByProductSlug.has(slug)) areaByProductSlug.set(slug, area);
    }
  }

  // listAll, not listPublished: somebody can genuinely own a product whose
  // listing has since been archived, and their library should still know
  // what it is rather than showing a blank card.
  const presentation: Record<string, ShelfPresentation> = {};
  for (const product of shopRegistry.listAll()) {
    const screens = screensFor(product.slug);
    presentation[product.slug] = {
      promise: product.promise,
      areaLabel: areaByProductSlug.get(product.slug)?.label ?? null,
      preview: screens ? <ShopCardMockup screens={screens} /> : null,
    };
  }

  return <LibraryShelf presentation={presentation} />;
}
