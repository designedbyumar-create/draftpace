import type { ProductCatalogEntry } from "@/product-framework/catalog";
import { homeManagementCompanionDefinition } from "./definition";
import StartModule from "./components/StartModule";
import SetupModule from "./components/SetupModule";
import WorkspaceModule from "./components/WorkspaceModule";
import AttentionModule from "./components/AttentionModule";
import RecordsModule from "./components/RecordsModule";
import AppliancesModule from "./components/AppliancesModule";
import MaintenanceModule from "./components/MaintenanceModule";
import ServiceProvidersModule from "./components/ServiceProvidersModule";
import ImportModule from "./components/ImportModule";
import HistoryModule from "./components/HistoryModule";
import SettingsModule from "./components/SettingsModule";

export const homeManagementCompanionCatalogEntry: ProductCatalogEntry = {
  definition: homeManagementCompanionDefinition,
  moduleComponents: {
    "home-management-companion.start": StartModule,
    "home-management-companion.setup": SetupModule,
    "home-management-companion.workspace": WorkspaceModule,
    "home-management-companion.attention": AttentionModule,
    "home-management-companion.records": RecordsModule,
    "home-management-companion.appliances": AppliancesModule,
    "home-management-companion.maintenance": MaintenanceModule,
    "home-management-companion.providers": ServiceProvidersModule,
    "home-management-companion.import": ImportModule,
    "home-management-companion.history": HistoryModule,
    "home-management-companion.settings": SettingsModule,
  },
};
