import type { ProductCatalogEntry } from "@/product-framework/catalog";
import { vehicleMaintenanceCompanionDefinition } from "./definition";
import WorkspaceModule from "./components/WorkspaceModule";
import VehiclesModule from "./components/VehiclesModule";
import PrintablesModule from "./components/PrintablesModule";
import SettingsModule from "./components/SettingsModule";

export const vehicleMaintenanceCompanionCatalogEntry: ProductCatalogEntry = {
  definition: vehicleMaintenanceCompanionDefinition,
  moduleComponents: {
    "vehicle-maintenance-companion.workspace": WorkspaceModule,
    "vehicle-maintenance-companion.vehicles": VehiclesModule,
    "vehicle-maintenance-companion.printables": PrintablesModule,
    "vehicle-maintenance-companion.settings": SettingsModule,
  },
};
