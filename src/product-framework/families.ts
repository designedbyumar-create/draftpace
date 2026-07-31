import { KNOWN_CAPABILITIES, ProductCapabilityId } from "./capabilities";
import { ProductDestinationId } from "./destinations";

/**
 * Product family ids are open, validated strings, not a closed union — a
 * new family registers itself via `familyRegistry.register(...)`. The six
 * families below are the initial set, registered as data, not as branches
 * anywhere in the shell. See docs/PRODUCT-FRAMEWORK.md.
 */
export type ProductFamilyId = string;

export type ProgressModelKind =
  | "momentum"
  | "mastery"
  | "run-health"
  | "stage-completion"
  | "consistency"
  | "custom";

export type ProductFamilyDefinition = {
  id: ProductFamilyId;
  label: string;
  description: string;
  supportedCapabilities: ProductCapabilityId[];
  defaultNavigation: ProductDestinationId[];
  progressModelKind: ProgressModelKind;
  /** Default label for the "workspace" destination, e.g. "Learn", "Automate". */
  defaultWorkspaceLabel?: string;
};

const FAMILY_ID_PATTERN = /^[a-z][a-z0-9-]*$/;

class FamilyRegistry {
  private families = new Map<string, ProductFamilyDefinition>();

  register(definition: ProductFamilyDefinition): ProductFamilyDefinition {
    if (!FAMILY_ID_PATTERN.test(definition.id)) {
      throw new Error(`Invalid family id "${definition.id}". Family ids must be lowercase and hyphenated.`);
    }
    if (this.families.has(definition.id)) {
      throw new Error(`Product family already registered: ${definition.id}`);
    }
    this.families.set(definition.id, definition);
    return definition;
  }

  get(id: string): ProductFamilyDefinition | undefined {
    return this.families.get(id);
  }

  has(id: string): boolean {
    return this.families.has(id);
  }

  list(): ProductFamilyDefinition[] {
    return [...this.families.values()];
  }
}

/**
 * A capability is valid for a family if it's already declared in that
 * family's known-core list, or if it shares the family's own namespace
 * prefix (allowing a family to grow new capabilities without editing this
 * file). A capability from an unrelated namespace on the wrong family is
 * rejected — e.g. "automation.trigger" is not valid for a "learning" product.
 */
export function isCapabilitySupportedByFamily(
  family: ProductFamilyDefinition,
  capabilityId: ProductCapabilityId
): boolean {
  if (family.supportedCapabilities.includes(capabilityId)) return true;
  return capabilityId.startsWith(`${family.id}.`);
}

export const familyRegistry = new FamilyRegistry();

familyRegistry.register({
  id: "companion",
  label: "Companion",
  description: "Personalized context, next action, momentum, recovery, milestones, and outcomes.",
  supportedCapabilities: [...KNOWN_CAPABILITIES.companion],
  defaultNavigation: ["start", "setup", "workspace", "progress", "history", "settings"],
  progressModelKind: "momentum",
  defaultWorkspaceLabel: "Continue",
});

familyRegistry.register({
  id: "learning",
  label: "Learning",
  description: "Modules, lessons, activities, assessment, mastery, completion, and certificates.",
  supportedCapabilities: [...KNOWN_CAPABILITIES.learning],
  defaultNavigation: ["start", "setup", "workspace", "progress", "history"],
  progressModelKind: "mastery",
  defaultWorkspaceLabel: "Learn",
});

familyRegistry.register({
  id: "automation",
  label: "Automation",
  description: "Triggers, conditions, actions, schedules, runs, run logs, retries, failures, and permissions.",
  supportedCapabilities: [...KNOWN_CAPABILITIES.automation],
  defaultNavigation: ["start", "setup", "workspace", "history", "settings"],
  progressModelKind: "run-health",
  defaultWorkspaceLabel: "Automate",
});

familyRegistry.register({
  id: "workspace",
  label: "Tool / Workspace",
  description: "Structured inputs, live processing or calculations, outputs, saved work, history, and exports.",
  supportedCapabilities: [...KNOWN_CAPABILITIES.workspace],
  defaultNavigation: ["start", "workspace", "history"],
  progressModelKind: "custom",
  defaultWorkspaceLabel: "Build",
});

familyRegistry.register({
  id: "guided-program",
  label: "Guided Program",
  description: "Stages, tasks, check-ins, reflections, and completion.",
  supportedCapabilities: [...KNOWN_CAPABILITIES.guidedProgram],
  defaultNavigation: ["start", "setup", "workspace", "progress", "history"],
  progressModelKind: "stage-completion",
  defaultWorkspaceLabel: "Continue",
});

familyRegistry.register({
  id: "tracker",
  label: "Tracker",
  description: "Recurring entries, trends, summaries, and review cycles.",
  supportedCapabilities: [...KNOWN_CAPABILITIES.tracker],
  defaultNavigation: ["start", "workspace", "progress", "history"],
  progressModelKind: "consistency",
  defaultWorkspaceLabel: "Track",
});
