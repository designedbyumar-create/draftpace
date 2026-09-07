import type { ProductCatalogEntry } from "@/product-framework/catalog";
import { familyHealthBinderDefinition } from "./definition";
import WorkspaceModule from "./components/WorkspaceModule";
import MembersModule from "./components/MembersModule";
import TimelineModule from "./components/TimelineModule";
import PrintablesModule from "./components/PrintablesModule";
import SettingsModule from "./components/SettingsModule";

export const familyHealthBinderCatalogEntry: ProductCatalogEntry = {
  definition: familyHealthBinderDefinition,
  moduleComponents: {
    "family-health-binder.workspace": WorkspaceModule,
    "family-health-binder.members": MembersModule,
    "family-health-binder.timeline": TimelineModule,
    "family-health-binder.printables": PrintablesModule,
    "family-health-binder.settings": SettingsModule,
  },
};
