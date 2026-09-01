import type { ProductDefinitionInput } from "./definition";
import type { ProductModuleComponent } from "./moduleRegistry";
import type { PrintableAssetMeta } from "./printableAssets";

/**
 * What one product contributes to the central manifest (src/products/manifest.ts):
 * its definition, plus the real component behind every module id it declares
 * in `definition.modules`. The framework only knows this shape — it never
 * imports a specific product. See docs/PRODUCT-FRAMEWORK.md.
 */
export type ProductCatalogEntry = {
  definition: ProductDefinitionInput;
  /** Module id (matching definition.modules[].id) -> the component it renders. */
  moduleComponents: Record<string, ProductModuleComponent>;
  /**
   * Metadata only for any included downloadable printable(s) this product
   * ships (id/title/filename). Never put file bytes or an import of a
   * bytes-loader module here — this field is reachable from client
   * components via manifest.ts, see printableAssets.ts.
   */
  printableAssets?: PrintableAssetMeta[];
};
