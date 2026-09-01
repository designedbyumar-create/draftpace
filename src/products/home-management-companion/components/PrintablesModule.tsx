import type { ProductDefinition } from "@/product-framework/definition";
import { printableAssetRegistry } from "@/product-framework/printableAssets";
import Surface from "@/design-system/Surface";
import EmptyState from "@/design-system/EmptyState";
import { Article, Download } from "@/design-system/Icon";
import { buttonClassName } from "@/design-system/buttonStyles";

const ASSET_DESCRIPTION: Record<string, string> = {
  letter: "Sized for US Letter paper. 36 pages.",
  a4: "Sized for A4 paper. 35 pages.",
};

// One definition, shared with the real Button. See
// src/design-system/buttonStyles.ts for why it lives outside the
// client component: this module is a Server Component, and the
// hand-copied string it used to hold had already gone stale.
const DOWNLOAD_LINK_CLASS = buttonClassName({ variant: "secondary", size: "sm" });

/**
 * The Home Survey: the paper half of this product. It exists because home
 * information cannot be gathered from a chair, and a phone in one hand
 * while crouching behind a fridge is worse than a clipboard.
 *
 * It is not a second product and grants nothing on its own. Access comes
 * from owning Home Base, checked server-side on every download by the API
 * route this links to.
 */
export default function PrintablesModule({ definition }: { definition: ProductDefinition }) {
  const assets = printableAssetRegistry.list(definition.slug);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--primary)]">
          Included with this product
        </p>
        <h1
          className="mt-2 text-xl font-semibold text-[var(--text)]"
          style={{ fontFamily: "var(--product-narrative-font, inherit)" }}
        >
          The Home Survey
        </h1>
        <p className="mt-2 max-w-lg text-[13px] leading-relaxed text-[var(--muted)]">
          Print it, carry it round the house once, and write down what you find. Model numbers live on stickers behind
          appliances, the filter size is printed on the filter, and the water shutoff is usually behind something heavy.
          Paper is the right tool for that walk. Bring it back here afterwards and Home Base works out the timing, so
          you never have to gather any of it twice.
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

      <p className="max-w-lg text-[12px] leading-relaxed text-[var(--muted)]">
        Filled in, this book lists what you own and where your water and gas shut off. Keep it somewhere private, and
        leave passwords and alarm codes out of it. It travels round the building and sits on worktops while trades are
        in the house.
      </p>
    </div>
  );
}
