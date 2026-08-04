import type { ProductDefinition } from "./definition";
import type { ProductInstanceSummary } from "./instances";

/**
 * Where an owner should land for a product they already have an instance of.
 * The one place this resolves — Library, Platform Home, and the canonical
 * entry route all call this instead of each hand-rolling the same ternary.
 */
export function resolveProductDestination(
  definition: ProductDefinition,
  instance: Pick<ProductInstanceSummary, "setupComplete" | "lifecycleState">
): string {
  const base = `/app/products/${definition.slug}`;
  // Not every family declares a "setup" destination (e.g. workspace's
  // defaultNavigation is just start/workspace/history) — routing there
  // anyway would land the owner on a destination outside their product's
  // own nav. setup_complete defaults to false for every fresh instance
  // regardless of family, so this must be gated on the product actually
  // having somewhere to send them.
  if (definition.navigation.includes("setup") && !instance.setupComplete) return `${base}/setup`;
  if (instance.lifecycleState === "completed") return `${base}/history`;
  return `${base}/workspace`;
}
