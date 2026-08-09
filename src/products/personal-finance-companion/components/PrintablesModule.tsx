import type { ProductDefinition } from "@/product-framework/definition";
import { printableAssetRegistry } from "@/product-framework/printableAssets";
import Surface from "@/design-system/Surface";
import EmptyState from "@/design-system/EmptyState";
import { Article, Download } from "@/design-system/Icon";

const ASSET_DESCRIPTION: Record<string, string> = {
  letter: "Sized for US Letter paper.",
  a4: "Sized for A4 paper.",
};

// Mirrors Button's secondary/sm variant. Written out rather than imported
// from src/design-system/Button (a "use client" module) because this
// component is a Server Component — the download must resolve the
// registry's server-populated state, and Next.js doesn't allow a server
// module to call a function exported from a client module, only render it.
const DOWNLOAD_LINK_CLASS =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-center font-semibold tracking-[-0.006em] transition-[transform,box-shadow,background-color,border-color,color] duration-[var(--dur-fast)] ease-[var(--ease-out)] active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)] border border-[var(--border-strong)] bg-[var(--surface)] text-[var(--text)] shadow-[var(--btn-raise-rest)] hover:bg-[var(--surface-muted)] hover:shadow-[var(--btn-raise-hover)] hover:-translate-y-px min-h-9 rounded-lg px-3.5 py-2 text-[13px]";

/**
 * The Printable Finance Companion: an included, paper version of this
 * product, for gathering and thinking away from a screen. It is not a
 * second product and grants nothing on its own — access to it comes from
 * owning Personal Finance Companion, checked server-side on every download
 * (see the API route this links to).
 */
export default function PrintablesModule({ definition }: { definition: ProductDefinition }) {
  const assets = printableAssetRegistry.list(definition.slug);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--primary)]">Included with this product</p>
        <h1 className="mt-2 text-xl font-semibold text-[var(--text)]">Printable Finance Companion</h1>
        <p className="mt-2 max-w-lg text-[13px] leading-relaxed text-[var(--muted)]">
          A paper version of this product, for the moments a screen is not the right tool: gathering statements before
          an import, thinking through a decision away from the app, or writing out a plan by hand. It does not replace
          the live companion. Your accounts, balances, and Available Money stay here, always current. Print this when
          it helps, then bring what you worked out back to the app.
        </p>
      </div>

      {assets.length === 0 ? (
        <EmptyState
          icon={Article}
          title="No printable available yet"
          description="This product does not currently include a printable companion."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {assets.map((asset) => (
            <Surface key={asset.id} className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--surface-muted)] text-[var(--primary)]">
                  <Article size={18} aria-hidden />
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-[var(--text)]">{asset.title}</p>
                  {ASSET_DESCRIPTION[asset.id] && (
                    <p className="mt-0.5 text-[12px] text-[var(--muted)]">{ASSET_DESCRIPTION[asset.id]}</p>
                  )}
                </div>
              </div>
              <a
                href={`/api/products/${definition.slug}/printables/${asset.id}`}
                className={DOWNLOAD_LINK_CLASS}
                aria-label={`Download ${asset.title}`}
              >
                <Download size={14} aria-hidden />
                Download
              </a>
            </Surface>
          ))}
        </div>
      )}
    </div>
  );
}
