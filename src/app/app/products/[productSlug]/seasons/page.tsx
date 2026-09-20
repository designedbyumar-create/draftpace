import { notFound } from "next/navigation";
import { productRegistry } from "@/product-framework/registry";
import { registerDevFixtures } from "@/product-framework/fixtures";
import { ensureProductsRegistered } from "@/products/manifest";
import { resolveProductModule } from "@/product-framework/moduleRegistry";
import EmptyState from "@/design-system/EmptyState";
import { Sun } from "@/design-system/Icon";

export default async function ProductSeasonsPage({
  params,
}: {
  params: Promise<{ productSlug: string }>;
}) {
  registerDevFixtures();
  ensureProductsRegistered();

  const { productSlug } = await params;
  const definition = productRegistry.getBySlug(productSlug);
  if (!definition) notFound();

  const Module = resolveProductModule(definition, "seasons");
  if (Module) return <Module definition={definition} />;

  return (
    <EmptyState
      icon={Sun}
      title="No seasons destination for this product"
      description="This product does not lay its jobs out by season."
    />
  );
}
