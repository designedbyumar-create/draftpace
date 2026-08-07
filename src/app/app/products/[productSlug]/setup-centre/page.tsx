import { notFound } from "next/navigation";
import { productRegistry } from "@/product-framework/registry";
import { registerDevFixtures } from "@/product-framework/fixtures";
import { ensureProductsRegistered } from "@/products/manifest";
import { resolveProductModule } from "@/product-framework/moduleRegistry";
import EmptyState from "@/design-system/EmptyState";
import { ListChecks } from "@/design-system/Icon";

export default async function ProductSetupCentrePage({
  params,
}: {
  params: Promise<{ productSlug: string }>;
}) {
  registerDevFixtures();
  ensureProductsRegistered();

  const { productSlug } = await params;
  const definition = productRegistry.getBySlug(productSlug);
  if (!definition) notFound();

  const Module = resolveProductModule(definition, "setup-centre");
  if (Module) return <Module definition={definition} />;

  return (
    <EmptyState
      icon={ListChecks}
      title="No setup centre for this product"
      description="This product does not have a returning-user setup management surface."
    />
  );
}
