import { notFound } from "next/navigation";
import { productRegistry } from "@/product-framework/registry";
import { registerDevFixtures } from "@/product-framework/fixtures";
import { ensureProductsRegistered } from "@/products/manifest";
import { resolveProductModule } from "@/product-framework/moduleRegistry";
import EmptyState from "@/design-system/EmptyState";
import { Clock } from "@/design-system/Icon";

export default async function ProductTimelinePage({
  params,
}: {
  params: Promise<{ productSlug: string }>;
}) {
  registerDevFixtures();
  ensureProductsRegistered();

  const { productSlug } = await params;
  const definition = productRegistry.getBySlug(productSlug);
  if (!definition) notFound();

  const Module = resolveProductModule(definition, "timeline");
  if (Module) return <Module definition={definition} />;

  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--primary)]">Symptoms</p>
      <div className="mt-6">
        <EmptyState
          icon={Clock}
          title="Nothing recorded yet"
          description="Symptoms appear here as they are recorded, most recent first."
        />
      </div>
    </div>
  );
}
