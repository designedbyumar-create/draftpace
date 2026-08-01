import { productRegistry } from "@/product-framework/registry";
import { moduleRegistry } from "@/product-framework/moduleRegistry";
import { monthlyMoneyResetDefinition } from "./definition";
import StartHereModule from "./components/StartHereModule";
import SetupModule from "./components/SetupModule";
import WorkspaceModule from "./components/WorkspaceModule";

/**
 * Registers Monthly Money Reset through the exact same productRegistry.
 * register() a fixture would use — there is no separate real-product code
 * path. Idempotent, and never gated by the development-fixture environment
 * check: a real free product is registered in every environment, dev
 * fixtures enabled or not (see docs/DATA-BOUNDARIES.md).
 *
 * Called explicitly from the entry points that need the registry populated
 * — src/app/app/layout.tsx (covers every page under /app/**) and the
 * activation route handler, which sits outside that layout tree. See
 * docs/MONTHLY-MONEY-RESET-BUILD-PLAN.md correction 6.
 */
let registered = false;

export function registerMonthlyMoneyReset(): void {
  if (registered) return;
  registered = true;

  if (!productRegistry.getBySlug(monthlyMoneyResetDefinition.slug as string)) {
    productRegistry.register(monthlyMoneyResetDefinition);
  }

  if (!moduleRegistry.has("monthly-money-reset.start")) {
    moduleRegistry.register("monthly-money-reset.start", StartHereModule);
  }
  if (!moduleRegistry.has("monthly-money-reset.setup")) {
    moduleRegistry.register("monthly-money-reset.setup", SetupModule);
  }
  if (!moduleRegistry.has("monthly-money-reset.workspace")) {
    moduleRegistry.register("monthly-money-reset.workspace", WorkspaceModule);
  }
}
