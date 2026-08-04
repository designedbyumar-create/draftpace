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
  if (!instance.setupComplete) return `${base}/setup`;
  if (instance.lifecycleState === "completed") return `${base}/history`;
  return `${base}/workspace`;
}
