import { notFound } from "next/navigation";
import { productRegistry } from "@/product-framework/registry";
import { registerDevFixtures } from "@/product-framework/fixtures";
import { ensureProductsRegistered } from "@/products/manifest";
import { resolveProductModule } from "@/product-framework/moduleRegistry";
import EmptyState from "@/design-system/EmptyState";
import { Clock } from "@/design-system/Icon";

export default async function ProductHistoryPage({
  params,
}: {
  params: Promise<{ productSlug: string }>;
}) {
  registerDevFixtures();
  ensureProductsRegistered();

  const { productSlug } = await params;
  const definition = productRegistry.getBySlug(productSlug);
  if (!definition) notFound();

  const Module = resolveProductModule(definition, "history");
  if (Module) return <Module definition={definition} />;

  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--primary)]">History</p>
      <h2 className="mt-2 text-lg font-semibold text-[var(--text)]">
        {definition.history.kinds.length > 0
          ? `Supports: ${definition.history.kinds.join(", ")}`
          : "No history kinds declared"}
      </h2>

      <div className="mt-6">
        <EmptyState
          icon={Clock}
          title="No history yet"
          description="Sessions, runs, reports, or saved outputs will appear here once something has actually happened."
        />
      </div>
    </div>
  );
}
