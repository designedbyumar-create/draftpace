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

/** Resolved label for any destination, honoring the workspace special case and any generic per-destination override. */
export function resolveDestinationLabel(definition: ProductDefinition, destination: ProductDestinationId): string {
  if (destination === "workspace") return resolveWorkspaceLabel(definition);
  return definition.destinationLabels?.[destination] ?? defaultDestinationLabel(destination);
}

/**
 * The generic, product-agnostic default for which destinations are
 * "primary" (always visible once a product is past its first-use gate) —
 * workspace/progress/history-equivalents. A product overrides this only by
 * setting `primaryNavigation` explicitly; most products won't need to.
 */
const DEFAULT_PRIMARY_DESTINATIONS = new Set<ProductDestinationId>(["workspace", "progress", "history"]);

export function resolvePrimaryDestinationIds(definition: ProductDefinition): ProductDestinationId[] {
  if (definition.primaryNavigation && definition.primaryNavigation.length > 0) {
    return definition.primaryNavigation;
  }
  const declared = resolveProductNavigation(definition);
  return declared.filter((destination) => DEFAULT_PRIMARY_DESTINATIONS.has(destination));
}

export type ResolvedNavigationItem = { id: ProductDestinationId; label: string };

export type ResolvedNavigation = {
  primary: ResolvedNavigationItem[];
  secondary: ResolvedNavigationItem[];
};

/**
 * The generic, product-agnostic signal navigation lifecycle decisions are
 * made from — deliberately not a product's own state (e.g. MMR's
 * setup.currentStep), since this resolver has to work for any product.
 * `everTouched` distinguishes a genuinely untouched fresh instance from one
 * mid-setup using data every instance already has: `createdAt` and
 * `updatedAt` start identical (the same INSERT's `now()`) and diverge the
 * moment the first real save happens. `null` means no instance summary was
 * available at all (e.g. a read failure) — resolveLifecycleNavigation
 * degrades to the full, undifferentiated destination list in that case,
 * never a blank or broken shell.
 */
export type InstanceLifecycleSignal = { setupComplete: boolean; everTouched: boolean } | null;

/**
 * The state-aware navigation model: which destinations are primary, which
 * are secondary, and — implicitly, by what's excluded from both — which
 * disappear entirely for the current lifecycle state. Three states for any
 * product that declares a "setup" destination:
 *
 * 1. Never started (setup incomplete, instance never touched): Start alone.
 * 2. Setup in progress (setup incomplete, instance touched): Setup joins the
 *    product's primary destinations; Start is gone.
 * 3. Setup complete (or no setup destination at all): the product's normal
 *    primary/secondary split; Setup (if present) demotes into secondary
 *    under its completed label ("Edit your plan" for Monthly Money Reset).
 *
 * A product with no "setup" destination skips states 1/2 entirely and is
 * always resolved as state 3.
 */
export function resolveLifecycleNavigation(
  definition: ProductDefinition,
  instance: InstanceLifecycleSignal
): ResolvedNavigation {
  const declared = resolveProductNavigation(definition);
  const hasSetup = declared.includes("setup");
  const labelOf = (id: ProductDestinationId) => resolveDestinationLabel(definition, id);

  if (!instance) {
    return { primary: declared.map((id) => ({ id, label: labelOf(id) })), secondary: [] };
  }

  if (hasSetup && !instance.setupComplete && !instance.everTouched) {
    return { primary: [{ id: "start", label: labelOf("start") }], secondary: [] };
  }

  if (hasSetup && !instance.setupComplete) {
    const primaryIds = ["setup", ...resolvePrimaryDestinationIds(definition)];
    const secondaryIds = declared.filter((id) => id !== "start" && !primaryIds.includes(id));
    return {
      primary: primaryIds.map((id) => ({ id, label: labelOf(id) })),
      secondary: secondaryIds.map((id) => ({ id, label: labelOf(id) })),
    };
  }

  const primaryIds = resolvePrimaryDestinationIds(definition);
  const secondaryIds = declared.filter((id) => id !== "start" && !primaryIds.includes(id));
  return {
    primary: primaryIds.map((id) => ({ id, label: labelOf(id) })),
    secondary: secondaryIds.map((id) => ({
      id,
      label: id === "setup" ? definition.setup.completedLabel ?? "Edit setup" : labelOf(id),
    })),
  };
}
