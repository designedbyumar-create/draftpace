import type { ProductDefinitionInput } from "./definition";
import type { ProductModuleComponent } from "./moduleRegistry";

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
};
