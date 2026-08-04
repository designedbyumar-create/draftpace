import type { ProductCatalogEntry } from "@/product-framework/catalog";
import { hiddenAccessTestDefinition } from "./definition";
import PlaceholderModule from "./components/PlaceholderModule";

export const hiddenAccessTestCatalogEntry: ProductCatalogEntry = {
  definition: hiddenAccessTestDefinition,
  moduleComponents: {
    "hidden-access-test.start": PlaceholderModule,
    "hidden-access-test.workspace": PlaceholderModule,
    "hidden-access-test.history": PlaceholderModule,
  },
};
