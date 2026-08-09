/**
 * Metadata only for a product's included downloadable printable(s) - e.g.
 * Personal Finance Companion's paper companion. Deliberately holds no file
 * bytes: this registry is populated from catalog.ts (see manifest.ts's
 * ensureProductsRegistered), which is reachable from client components
 * (Library, Home), so anything registered here ships in the client bundle.
 * The actual bytes live in each product's own server-only asset-loader
 * module, imported only by the download route - see
 * personal-finance-companion/printables/assetBytes.ts for that product's.
 */
export interface PrintableAssetMeta {
  id: string;
  title: string;
  filename: string;
}

class PrintableAssetRegistry {
  private byProduct = new Map<string, PrintableAssetMeta[]>();

  register(productSlug: string, asset: PrintableAssetMeta): void {
    const list = this.byProduct.get(productSlug) ?? [];
    if (list.some((a) => a.id === asset.id)) return;
    list.push(asset);
    this.byProduct.set(productSlug, list);
  }

  list(productSlug: string): PrintableAssetMeta[] {
    return this.byProduct.get(productSlug) ?? [];
  }

  get(productSlug: string, id: string): PrintableAssetMeta | undefined {
    return this.byProduct.get(productSlug)?.find((a) => a.id === id);
  }
}

export const printableAssetRegistry = new PrintableAssetRegistry();
