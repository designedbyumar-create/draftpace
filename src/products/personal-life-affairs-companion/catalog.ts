import type { ProductCatalogEntry } from "@/product-framework/catalog";
import { personalLifeAffairsCompanionDefinition } from "./definition";
import WorkspaceModule from "./components/WorkspaceModule";
import HistoryModule from "./components/HistoryModule";
import SettingsModule from "./components/SettingsModule";
import PrintablesModule from "./components/PrintablesModule";
import AffairsModule from "./components/AffairsModule";

/**
 * No printableAssets yet. They are declared in phase 7, when real bytes
 * exist. Declaring them now would put a download link on screen with
 * nothing behind it.
 */
export const personalLifeAffairsCompanionCatalogEntry: ProductCatalogEntry = {
  definition: personalLifeAffairsCompanionDefinition,
  moduleComponents: {
    "personal-life-affairs-companion.workspace": WorkspaceModule,
    "personal-life-affairs-companion.affairs": AffairsModule,
    "personal-life-affairs-companion.history": HistoryModule,
    "personal-life-affairs-companion.settings": SettingsModule,
    "personal-life-affairs-companion.printables": PrintablesModule,
  },
};
