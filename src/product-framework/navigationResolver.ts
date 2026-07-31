import { ProductDefinition } from "./definition";
import { CORE_DESTINATIONS, ProductDestinationId, defaultDestinationLabel } from "./destinations";
import { familyRegistry } from "./families";

/**
 * Resolves which destinations a product actually shows: its own declared
 * `navigation`, or its family's default if it declared none. "start" is
 * always included since every product needs an entry surface.
 */
export function resolveProductNavigation(definition: ProductDefinition): ProductDestinationId[] {
  const family = familyRegistry.get(definition.family);
  const declared = definition.navigation.length > 0 ? definition.navigation : family?.defaultNavigation ?? CORE_DESTINATIONS.slice();
  return Array.from(new Set(["start", ...declared]));
}

/**
 * The Workspace destination's family-aware label, e.g. "Learn" for a
 * learning product, "Automate" for an automation product — falling back to
 * the generic "Workspace" label when neither the product nor its family
 * specify one.
 */
export function resolveWorkspaceLabel(definition: ProductDefinition): string {
  if (definition.workspaceLabel) return definition.workspaceLabel;
  const family = familyRegistry.get(definition.family);
  return family?.defaultWorkspaceLabel ?? defaultDestinationLabel("workspace");
}

/** Resolved label for any destination, honoring the workspace special case. */
export function resolveDestinationLabel(definition: ProductDefinition, destination: ProductDestinationId): string {
  if (destination === "workspace") return resolveWorkspaceLabel(definition);
  return defaultDestinationLabel(destination);
}
