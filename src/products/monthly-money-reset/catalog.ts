import type { ProductCatalogEntry } from "@/product-framework/catalog";
import { monthlyMoneyResetDefinition } from "./definition";
import StartHereModule from "./components/StartHereModule";
import SetupModule from "./components/SetupModule";
import WorkspaceModule from "./components/WorkspaceModule";
import ProgressModule from "./components/ProgressModule";
import HistoryModule from "./components/HistoryModule";
import PrintablesModule from "./components/PrintablesModule";
import SettingsModule from "./components/SettingsModule";

/**
 * Monthly Money Reset's contribution to the central product manifest
 * (src/products/manifest.ts) — plain data, no registration side effects.
 * Nothing outside the manifest should import this to register the product;
 * see docs/PRODUCT-FRAMEWORK.md for why registration is centralized there.
 */
export const monthlyMoneyResetCatalogEntry: ProductCatalogEntry = {
  definition: monthlyMoneyResetDefinition,
  moduleComponents: {
    "monthly-money-reset.start": StartHereModule,
    "monthly-money-reset.setup": SetupModule,
    "monthly-money-reset.workspace": WorkspaceModule,
    "monthly-money-reset.progress": ProgressModule,
    "monthly-money-reset.history": HistoryModule,
    "monthly-money-reset.printables": PrintablesModule,
    "monthly-money-reset.settings": SettingsModule,
  },
};
