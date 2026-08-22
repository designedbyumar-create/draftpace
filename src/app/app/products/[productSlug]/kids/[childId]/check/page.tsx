import { notFound } from "next/navigation";
import { productRegistry } from "@/product-framework/registry";
import { registerDevFixtures } from "@/product-framework/fixtures";
import { ensureProductsRegistered } from "@/products/manifest";
import CheckModule from "@/products/homeschooling-companion/components/CheckModule";

/**
 * Checking one child.
 *
 * Its own route rather than a mode inside the child page, because a
 * check is a sequence a parent walks with their child beside them and
 * anything else on screen is in the way. Product-local for the same
 * reason as the child page itself. The entitlement gate for this whole
 * subtree lives in [productSlug]/layout.tsx and applies here unchanged.
 */
export default async function ChildCheckPage({
  params,
}: {
  params: Promise<{ productSlug: string; childId: string }>;
}) {
  registerDevFixtures();
  ensureProductsRegistered();

  const { productSlug, childId } = await params;
  const definition = productRegistry.getBySlug(productSlug);
  if (!definition || definition.slug !== "homeschooling-companion") notFound();

  return <CheckModule childId={childId} />;
}
