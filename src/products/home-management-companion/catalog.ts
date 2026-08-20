import type { ProductCatalogEntry } from "@/product-framework/catalog";
import { homeManagementCompanionDefinition } from "./definition";
import SetupModule from "./components/SetupModule";
import HomeModule from "./components/HomeModule";
import ImportModule from "./components/ImportModule";
import HistoryModule from "./components/HistoryModule";
import SettingsModule from "./components/SettingsModule";
import PrintablesModule from "./components/PrintablesModule";

export const homeManagementCompanionCatalogEntry: ProductCatalogEntry = {
  definition: homeManagementCompanionDefinition,
  // Metadata only. The actual PDF bytes live in printables/assetBytes.ts,
  // which only the download route imports, so they never reach a client
  // bundle through this file.
  printableAssets: [
    {
      id: "letter",
      title: "The Home Survey (US Letter)",
      filename: "draftpace-home-survey-letter.pdf",
    },
    {
      id: "a4",
      title: "The Home Survey (A4)",
      filename: "draftpace-home-survey-a4.pdf",
    },
  ],
  moduleComponents: {
    "home-management-companion.setup": SetupModule,
    "home-management-companion.workspace": HomeModule,
    "home-management-companion.import": ImportModule,
    "home-management-companion.history": HistoryModule,
    "home-management-companion.settings": SettingsModule,
    "home-management-companion.printables": PrintablesModule,
  },
};
