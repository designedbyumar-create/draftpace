import type { ProductCatalogEntry } from "@/product-framework/catalog";
import { travelCompanionDefinition } from "./definition";
import TodayModule from "./components/TodayModule";
import TripModule from "./components/TripModule";
import PeopleModule from "./components/PeopleModule";
import { RecordPlaceholder, SettingsPlaceholder } from "./components/PlaceholderScreens";

/**
 * Phase 2: Today, Trip and People are real. Record and the Companion
 * still render an honest not-built-yet state, per the approved phase
 * plan (Record is Phase 6, the Companion is Phase 3-4). No
 * printableAssets: the PDF is Phase 7.
 */
export const travelCompanionCatalogEntry: ProductCatalogEntry = {
  definition: travelCompanionDefinition,
  moduleComponents: {
    "travel-companion.workspace": TodayModule,
    "travel-companion.trip": TripModule,
    "travel-companion.people": PeopleModule,
    "travel-companion.record": RecordPlaceholder,
    "travel-companion.settings": SettingsPlaceholder,
  },
};
