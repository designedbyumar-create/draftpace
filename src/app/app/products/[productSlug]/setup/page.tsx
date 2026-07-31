import { notFound } from "next/navigation";
import { productRegistry } from "@/product-framework/registry";
import Badge from "@/design-system/Badge";
import Alert from "@/design-system/Alert";

export default async function ProductSetupPage({
  params,
}: {
  params: Promise<{ productSlug: string }>;
}) {
  const { productSlug } = await params;
  const definition = productRegistry.getBySlug(productSlug);
  if (!definition) notFound();

  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--primary)]">Setup & Customize</p>
      <h2 className="mt-2 text-lg font-semibold text-[var(--text)]">Configure {definition.title}</h2>
      <p className="mt-3 text-[14px] leading-relaxed text-[var(--muted)]">
        Product-specific setup — progressive, autosaved, and resumable — is defined by each product&apos;s own
        schema and registered modules, not a generic form the shell invents.
      </p>

      <div className="mt-6 flex flex-wrap gap-1.5">
        <Badge tone={definition.setup.required ? "primary" : "neutral"}>
          {definition.setup.required ? "Required before first use" : "Optional"}
        </Badge>
        <Badge tone={definition.setup.skippable ? "success" : "neutral"}>
          {definition.setup.skippable ? "Can be skipped" : "Cannot be skipped"}
        </Badge>
      </div>

      <div className="mt-6 rounded-xl border border-dashed border-[var(--border-strong)] p-5">
        <p className="text-[13px] font-semibold text-[var(--text)]">Module slot</p>
        <p className="mt-1 text-[12px] leading-5 text-[var(--muted)]">
          {definition.modules.length > 0
            ? `Registers ${definition.modules.length} custom module(s) here.`
            : "No custom setup modules are registered for this product yet — this is where they'd render."}
        </p>
      </div>

      {definition.devFixture && (
        <div className="mt-6">
          <Alert tone="info">
            Internal fixture — no real fields exist to configure. This destination exists to prove the setup
            required/skippable contract and module-slot concept.
          </Alert>
        </div>
      )}
    </div>
  );
}
