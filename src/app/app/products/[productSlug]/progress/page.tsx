import { notFound } from "next/navigation";
import { productRegistry } from "@/product-framework/registry";
import { familyRegistry, ProgressModelKind } from "@/product-framework/families";
import { resolveProductModule } from "@/product-framework/moduleRegistry";

const PROGRESS_MODEL_COPY: Record<ProgressModelKind, string> = {
  momentum: "Momentum — recent meaningful actions and how consistently they're happening, not a raw streak count.",
  mastery: "Mastery — how much of the material is actually understood, not just how much was clicked through.",
  "run-health": "Run health — recent success/failure rate of runs, not a vanity count of executions.",
  "stage-completion": "Stage completion — where the program is in its ordered stages, not a generic percentage.",
  consistency: "Consistency — how regularly entries land relative to the tracker's own rhythm.",
  custom: "Custom — this product defines its own progress meaning; no generic model applies.",
};

export default async function ProductProgressPage({
  params,
}: {
  params: Promise<{ productSlug: string }>;
}) {
  const { productSlug } = await params;
  const definition = productRegistry.getBySlug(productSlug);
  if (!definition) notFound();

  const Module = resolveProductModule(definition, "progress");
  if (Module) return <Module definition={definition} />;

  const family = familyRegistry.get(definition.family);
  const modelKind = family?.progressModelKind ?? "custom";

  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--primary)]">Progress</p>
      <h2 className="mt-2 text-lg font-semibold text-[var(--text)]">This product&apos;s progress model</h2>
      <p className="mt-3 text-[14px] leading-relaxed text-[var(--muted)]">{PROGRESS_MODEL_COPY[modelKind]}</p>

      <div className="mt-6 rounded-xl border border-dashed border-[var(--border-strong)] p-6 text-center">
        <p className="text-[13px] text-[var(--faint)]">
          No progress exists yet — nothing has been logged, so nothing is shown. Draftpace never forces a percentage
          or streak where the product doesn&apos;t have one.
        </p>
      </div>
    </div>
  );
}
