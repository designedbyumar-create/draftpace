import type { ProductCatalogEntry } from "@/product-framework/catalog";
import { homeManagementCompanionDefinition } from "./definition";
import SetupModule from "./components/SetupModule";
import HomeModule from "./components/HomeModule";
import ImportModule from "./components/ImportModule";
import HistoryModule from "./components/HistoryModule";
import SettingsModule from "./components/SettingsModule";

export const homeManagementCompanionCatalogEntry: ProductCatalogEntry = {
  definition: homeManagementCompanionDefinition,
  moduleComponents: {
    "home-management-companion.setup": SetupModule,
    "home-management-companion.workspace": HomeModule,
    "home-management-companion.import": ImportModule,
    "home-management-companion.history": HistoryModule,
    "home-management-companion.settings": SettingsModule,
  },
};
