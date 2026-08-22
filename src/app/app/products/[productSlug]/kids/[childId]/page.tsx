import { notFound } from "next/navigation";
import { productRegistry } from "@/product-framework/registry";
import { registerDevFixtures } from "@/product-framework/fixtures";
import { ensureProductsRegistered } from "@/products/manifest";
import ChildDetailModule from "@/products/homeschooling-companion/components/ChildDetailModule";

/**
 * One child, on their own page.
 *
 * Not part of the generic destination registry: there is no per-entity
 * detail-page pattern in that system, and Home Base's item page set the
 * precedent for a product-local route rather than inventing one for a
 * second consumer that does not exist. The entitlement gate for this
 * whole subtree lives in [productSlug]/layout.tsx and applies here
 * unchanged; this file only guards against an unknown product slug.
 */
export default async function ChildDetailPage({
  params,
}: {
  params: Promise<{ productSlug: string; childId: string }>;
}) {
  registerDevFixtures();
  ensureProductsRegistered();

  const { productSlug, childId } = await params;
  const definition = productRegistry.getBySlug(productSlug);
  if (!definition || definition.slug !== "homeschooling-companion") notFound();

  return <ChildDetailModule childId={childId} />;
}
