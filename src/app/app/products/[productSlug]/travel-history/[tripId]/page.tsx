import { notFound } from "next/navigation";
import { productRegistry } from "@/product-framework/registry";
import { registerDevFixtures } from "@/product-framework/fixtures";
import { ensureProductsRegistered } from "@/products/manifest";
import TravelHistoryDetailModule from "@/products/travel-companion/components/TravelHistoryDetailModule";

/**
 * One past trip, on its own page. Not part of the generic destination
 * registry, same reasoning as item/[itemId]: this is a per-entity
 * detail page, and each product that needs one adds its own branch
 * here rather than the shell learning to route by entity generically.
 * The entitlement gate for this whole subtree lives in
 * [productSlug]/layout.tsx and applies here unchanged; this file only
 * guards against an unknown product slug or an unbuilt one.
 */
export default async function ProductTravelHistoryDetailPage({
  params,
}: {
  params: Promise<{ productSlug: string; tripId: string }>;
}) {
  registerDevFixtures();
  ensureProductsRegistered();

  const { productSlug } = await params;
  const definition = productRegistry.getBySlug(productSlug);
  if (!definition) notFound();

  if (definition.slug === "travel-companion") return <TravelHistoryDetailModule />;
  notFound();
}
