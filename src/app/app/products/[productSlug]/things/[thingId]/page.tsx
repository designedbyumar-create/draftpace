import { notFound } from "next/navigation";
import { productRegistry } from "@/product-framework/registry";
import { registerDevFixtures } from "@/product-framework/fixtures";
import { ensureProductsRegistered } from "@/products/manifest";
import ThingDetailModule from "@/products/home-management-companion/components/things/ThingDetailModule";

/**
 * A Thing's own detail page: identity, care, history, records, people.
 * Not part of the generic destination-registry (there is no per-entity
 * detail-page pattern in that system yet, see the v2 plan's own note on
 * this) — Home-Base-local by construction, reached only from
 * ThingsModule's own row links. The entitlement gate for this whole
 * subtree lives in [productSlug]/layout.tsx and applies here unchanged;
 * this file only guards against an unknown product slug.
 */
export default async function ThingDetailPage({
  params,
}: {
  params: Promise<{ productSlug: string; thingId: string }>;
}) {
  registerDevFixtures();
  ensureProductsRegistered();

  const { productSlug } = await params;
  const definition = productRegistry.getBySlug(productSlug);
  if (!definition || definition.slug !== "home-management-companion") notFound();

  return <ThingDetailModule />;
}
