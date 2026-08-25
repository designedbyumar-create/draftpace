import type { ProductCatalogEntry } from "@/product-framework/catalog";
import { travelCompanionDefinition } from "./definition";
import {
  TodayPlaceholder,
  TripPlaceholder,
  PeoplePlaceholder,
  RecordPlaceholder,
  SettingsPlaceholder,
} from "./components/PlaceholderScreens";

/**
 * Phase 1 scaffolding only. See PlaceholderScreens.tsx for why every
 * destination is wired to an honest not-built-yet state rather than a
 * real module. No printableAssets: the PDF is Phase 7.
 */
export const travelCompanionCatalogEntry: ProductCatalogEntry = {
  definition: travelCompanionDefinition,
  moduleComponents: {
    "travel-companion.workspace": TodayPlaceholder,
    "travel-companion.trip": TripPlaceholder,
    "travel-companion.people": PeoplePlaceholder,
    "travel-companion.record": RecordPlaceholder,
    "travel-companion.settings": SettingsPlaceholder,
  },
};
