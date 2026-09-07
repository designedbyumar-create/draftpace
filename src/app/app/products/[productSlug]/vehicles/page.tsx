import { notFound } from "next/navigation";
import { productRegistry } from "@/product-framework/registry";
import { registerDevFixtures } from "@/product-framework/fixtures";
import { ensureProductsRegistered } from "@/products/manifest";
import { resolveProductModule } from "@/product-framework/moduleRegistry";
import EmptyState from "@/design-system/EmptyState";
import { Car } from "@/design-system/Icon";

export default async function ProductVehiclesPage({
  params,
}: {
  params: Promise<{ productSlug: string }>;
}) {
  registerDevFixtures();
  ensureProductsRegistered();

  const { productSlug } = await params;
  const definition = productRegistry.getBySlug(productSlug);
  if (!definition) notFound();

  const Module = resolveProductModule(definition, "vehicles");
  if (Module) return <Module definition={definition} />;

  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--primary)]">Vehicles</p>
      <div className="mt-6">
        <EmptyState
          icon={Car}
          title="No vehicles yet"
          description="Add a vehicle to start tracking what it needs."
        />
      </div>
    </div>
  );
}
