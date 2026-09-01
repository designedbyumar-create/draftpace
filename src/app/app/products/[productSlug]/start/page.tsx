import { notFound } from "next/navigation";
import { productRegistry } from "@/product-framework/registry";
import { registerDevFixtures } from "@/product-framework/fixtures";
import { ensureProductsRegistered } from "@/products/manifest";
import { familyRegistry } from "@/product-framework/families";
import { resolveWorkspaceLabel } from "@/product-framework/navigationResolver";
import { resolveProductModule } from "@/product-framework/moduleRegistry";
import Badge from "@/design-system/Badge";
import Button from "@/design-system/Button";
import { ArrowRight, Check } from "@/design-system/Icon";

/**
 * An actionable entry surface, not a decorative cover: identity, promise,
 * access state, what the product needs from the user, and one primary
 * action — straight to Setup if required, otherwise straight to Workspace.
 */
export default async function ProductStartPage({
  params,
}: {
  params: Promise<{ productSlug: string }>;
}) {
  registerDevFixtures();
  ensureProductsRegistered();

  const { productSlug } = await params;
  const definition = productRegistry.getBySlug(productSlug);
  if (!definition) notFound();

  const Module = resolveProductModule(definition, "start");
  if (Module) return <Module definition={definition} />;

  const family = familyRegistry.get(definition.family);
  const primaryDestination = definition.setup.required ? "setup" : "workspace";
  const primaryLabel = definition.setup.required ? "Start setup" : `Go to ${resolveWorkspaceLabel(definition)}`;

  return (
    <div>
      {definition.tagline && <p className="text-[16px] leading-relaxed text-[var(--text)]">{definition.tagline}</p>}

      <div className="mt-5 flex flex-wrap gap-1.5">
        <Badge tone="primary">{definition.access.model}</Badge>
        <Badge tone="neutral">{family?.label ?? definition.family}</Badge>
        <Badge tone={definition.status === "active" ? "success" : "neutral"}>{definition.status.replace("_", " ")}</Badge>
      </div>

      <div className="mt-8 rounded-xl border border-[var(--border)] p-5">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--faint)]">What this needs from you</p>
        <div className="mt-3 flex items-start gap-2.5">
          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--primary-soft)] text-[var(--primary)]">
            <Check size={11} aria-hidden />
          </span>
          <p className="text-[13px] leading-6 text-[var(--muted)]">
            {definition.setup.required
              ? `A short setup${definition.setup.skippable ? " (optional details can be skipped)" : ""} before the first result.`
              : "Nothing required up front — you can go straight to the live surface."}
          </p>
        </div>
      </div>

      <Button
        href={`/app/products/${definition.slug}/${primaryDestination}`}
        size="lg"
        className="mt-6"
        iconRight={<ArrowRight size={15} aria-hidden />}
      >
        {primaryLabel}
      </Button>

      {definition.devFixture && (
        <p className="mt-6 text-[12px] leading-5 text-[var(--faint)]">
          This is an internal architecture fixture — it proves product registration and the universal shell. It is
          not a real product, and none of its destinations run real logic.
        </p>
      )}
    </div>
  );
}
