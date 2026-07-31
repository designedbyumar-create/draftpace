import { ProductDefinition } from "@/product-framework/definition";

/**
 * Structural, honest placeholder body for a product destination. No fake
 * data, no charts, no fabricated progress — just what the destination is
 * for and the product's real declared metadata. Real per-family content is
 * Phase 2+ work.
 */
export default function DestinationPlaceholder({
  definition,
  eyebrow,
  description,
}: {
  definition: ProductDefinition;
  eyebrow: string;
  description: string;
}) {
  return (
    <section>
      <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[var(--primary)]">{eyebrow}</p>
      <h2 className="mt-2 text-lg font-black text-[var(--text)]">{definition.title}</h2>
      <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
        {definition.devFixture
          ? `This is an internal architecture fixture. ${description} It proves product registration, navigation, and capability resolution — it is not a real product.`
          : description}
      </p>
      <dl className="mt-6 grid gap-2 text-xs text-[var(--faint)]">
        <div>
          <dt className="inline font-bold">Family:</dt> <dd className="inline">{definition.family}</dd>
        </div>
        <div>
          <dt className="inline font-bold">Capabilities:</dt>{" "}
          <dd className="inline">{definition.capabilities.join(", ") || "none declared"}</dd>
        </div>
        <div>
          <dt className="inline font-bold">Version:</dt> <dd className="inline">{definition.version}</dd>
        </div>
      </dl>
    </section>
  );
}
