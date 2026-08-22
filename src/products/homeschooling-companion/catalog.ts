import type { ProductCatalogEntry } from "@/product-framework/catalog";
import { homeschoolingCompanionDefinition } from "./definition";
import TodayModule from "./components/TodayModule";
import KidsModule from "./components/KidsModule";
import RecordModule from "./components/RecordModule";
import SettingsModule from "./components/SettingsModule";

/**
 * No printableAssets yet. They are declared when real bytes exist, in
 * phase 6. Declaring them now would put a download link on screen with
 * nothing behind it.
 */
export const homeschoolingCompanionCatalogEntry: ProductCatalogEntry = {
  definition: homeschoolingCompanionDefinition,
  moduleComponents: {
    "homeschooling-companion.workspace": TodayModule,
    "homeschooling-companion.kids": KidsModule,
    "homeschooling-companion.record": RecordModule,
    "homeschooling-companion.settings": SettingsModule,
  },
};
