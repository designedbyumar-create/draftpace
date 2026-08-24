import type { ProductCatalogEntry } from "@/product-framework/catalog";
import { alongsideDefinition } from "./definition";
import NowModule from "./components/NowModule";
import LifeModule from "./components/LifeModule";
import HelpModule from "./components/HelpModule";
import SettingsModule from "./components/SettingsModule";

/**
 * No printableAssets. Unlike its four siblings, this product has no
 * printed half planned: a paper artefact for somebody whose difficulty
 * is starting things would be one more surface to keep up with.
 */
export const alongsideCatalogEntry: ProductCatalogEntry = {
  definition: alongsideDefinition,
  moduleComponents: {
    "alongside.workspace": NowModule,
    "alongside.life": LifeModule,
    "alongside.help": HelpModule,
    "alongside.settings": SettingsModule,
  },
};
