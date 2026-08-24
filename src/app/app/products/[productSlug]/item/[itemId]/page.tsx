import { notFound } from "next/navigation";
import { productRegistry } from "@/product-framework/registry";
import { registerDevFixtures } from "@/product-framework/fixtures";
import { ensureProductsRegistered } from "@/products/manifest";
import HomeItemDetailModule from "@/products/home-management-companion/components/home/HomeItemDetailModule";
import AlongsideItemDetailModule from "@/products/alongside/components/AlongsideItemDetailModule";

/**
 * One thing, on its own page. Not part of the generic destination
 * registry (there is no per-entity detail-page pattern in that system
 * yet), so each product that needs one adds a parallel branch here,
 * the same precedent as the printables download route: a second product
 * adds its own branch alongside the first's, and does not touch it.
 * The entitlement gate for this whole subtree lives in
 * [productSlug]/layout.tsx and applies here unchanged; this file only
 * guards against an unknown product slug or an unbuilt one.
 */
export default async function ProductItemDetailPage({
  params,
}: {
  params: Promise<{ productSlug: string; itemId: string }>;
}) {
  registerDevFixtures();
  ensureProductsRegistered();

  const { productSlug } = await params;
  const definition = productRegistry.getBySlug(productSlug);
  if (!definition) notFound();

  if (definition.slug === "home-management-companion") return <HomeItemDetailModule />;
  if (definition.slug === "alongside") return <AlongsideItemDetailModule />;
  notFound();
}
