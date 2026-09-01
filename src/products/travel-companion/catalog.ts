import type { ProductCatalogEntry } from "@/product-framework/catalog";
import { travelCompanionDefinition } from "./definition";
import TodayModule from "./components/TodayModule";
import TripModule from "./components/TripModule";
import PeopleModule from "./components/PeopleModule";
import RecordModule from "./components/RecordModule";
import PrintablesModule from "./components/PrintablesModule";
import { SettingsPlaceholder } from "./components/PlaceholderScreens";

/**
 * Phase 6: Record is real. Phase 7: Printables is real, My Trip Book
 * generated client side, so no printableAssets entry, unlike Personal
 * Finance Companion's own pre-built static file: there is nothing here
 * for the generic /api/products/{slug}/printables/{assetId} route to
 * serve, every copy is made fresh in the requesting browser. Settings
 * still renders an honest not-built-yet state.
 */
export const travelCompanionCatalogEntry: ProductCatalogEntry = {
  definition: travelCompanionDefinition,
  moduleComponents: {
    "travel-companion.workspace": TodayModule,
    "travel-companion.trip": TripModule,
    "travel-companion.people": PeopleModule,
    "travel-companion.record": RecordModule,
    "travel-companion.printables": PrintablesModule,
    "travel-companion.settings": SettingsPlaceholder,
  },
};
