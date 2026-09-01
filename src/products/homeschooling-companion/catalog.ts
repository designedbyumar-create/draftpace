import type { ProductCatalogEntry } from "@/product-framework/catalog";
import { homeschoolingCompanionDefinition } from "./definition";
import TodayModule from "./components/TodayModule";
import KidsModule from "./components/KidsModule";
import RecordModule from "./components/RecordModule";
import SettingsModule from "./components/SettingsModule";

/**
 * The printable is declared here, now that real bytes exist. Metadata
 * only: the bytes live in printables/assetBytes.ts, which only the
 * download route imports, because this file is reachable from client
 * components through manifest.ts.
 */
export const homeschoolingCompanionCatalogEntry: ProductCatalogEntry = {
  definition: homeschoolingCompanionDefinition,
  moduleComponents: {
    "homeschooling-companion.workspace": TodayModule,
    "homeschooling-companion.kids": KidsModule,
    "homeschooling-companion.record": RecordModule,
    "homeschooling-companion.settings": SettingsModule,
  },
  printableAssets: [
    { id: "letter", title: "The Homeschool Year (US Letter)", filename: "the-homeschool-year-letter.pdf" },
    { id: "a4", title: "The Homeschool Year (A4)", filename: "the-homeschool-year-a4.pdf" },
  ],
};
