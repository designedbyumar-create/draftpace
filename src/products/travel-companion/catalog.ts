import type { ProductCatalogEntry } from "@/product-framework/catalog";
import { travelCompanionDefinition } from "./definition";
import TodayModule from "./components/TodayModule";
import TripModule from "./components/TripModule";
import PeopleModule from "./components/PeopleModule";
import RecordModule from "./components/RecordModule";
import { SettingsPlaceholder } from "./components/PlaceholderScreens";

/**
 * Phase 6: Record is real. Settings still renders an honest
 * not-built-yet state. No printableAssets: the PDF is Phase 7.
 */
export const travelCompanionCatalogEntry: ProductCatalogEntry = {
  definition: travelCompanionDefinition,
  moduleComponents: {
    "travel-companion.workspace": TodayModule,
    "travel-companion.trip": TripModule,
    "travel-companion.people": PeopleModule,
    "travel-companion.record": RecordModule,
    "travel-companion.settings": SettingsPlaceholder,
  },
};
