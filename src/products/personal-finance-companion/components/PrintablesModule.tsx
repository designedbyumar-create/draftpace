import type { ProductDefinition } from "@/product-framework/definition";
import { printableAssetRegistry } from "@/product-framework/printableAssets";
import Surface from "@/design-system/Surface";
import EmptyState from "@/design-system/EmptyState";
import { Article, Download } from "@/design-system/Icon";
import { buttonClassName } from "@/design-system/buttonStyles";
import SharedStatementDownloadButton from "./SharedStatementDownloadButton";

const ASSET_DESCRIPTION: Record<string, string> = {
  letter: "Sized for US Letter paper.",
  a4: "Sized for A4 paper.",
};

// One definition, shared with the real Button. See
// src/design-system/buttonStyles.ts for why it lives outside the
// client component: this module is a Server Component, and the
// hand-copied string it used to hold had already gone stale.
const DOWNLOAD_LINK_CLASS = buttonClassName({ variant: "secondary", size: "sm" });

/**
 * The Printable Finance Companion: an included, paper version of this
 * product, for gathering and thinking away from a screen. It is not a
 * second product and grants nothing on its own, access to it comes from
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

      <div className="border-t border-[var(--border)] pt-6">
        <p className="text-[13px] font-semibold text-[var(--text)]">Shared Responsibility statement</p>
        <p className="mt-1 max-w-lg text-[13px] leading-relaxed text-[var(--muted)]">
          Generated from your current shared bills and subscriptions: what&apos;s already settled, and what&apos;s
          still owed. Always current, unlike the printable companion above.
        </p>
        <div className="mt-3">
          <SharedStatementDownloadButton />
        </div>
      </div>
    </div>
  );
}
