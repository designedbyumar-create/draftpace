/**
 * The universal product shell's six canonical destinations. A product may
 * additionally register family-specific destinations (e.g. "lessons",
 * "automations", "reports", "recovery", "certificates", "integrations") —
 * ProductDestinationId stays an open string for that reason, but the six
 * core ones are the only ones the shell knows how to route by default.
 */

export const CORE_DESTINATIONS = [
  "start",
  "setup",
  "workspace",
  "progress",
  "history",
  "settings",
] as const;

export type CoreDestinationId = (typeof CORE_DESTINATIONS)[number];
export type ProductDestinationId = CoreDestinationId | string;

const CORE_DESTINATION_LABELS: Record<CoreDestinationId, string> = {
  start: "Start",
  setup: "Setup",
  workspace: "Workspace",
  progress: "Progress",
  history: "History",
  settings: "Settings",
};

export function isCoreDestination(value: string): value is CoreDestinationId {
  return (CORE_DESTINATIONS as readonly string[]).includes(value);
}

/** Default label for a destination when a product doesn't override it. */
export function defaultDestinationLabel(destination: ProductDestinationId): string {
  if (isCoreDestination(destination)) return CORE_DESTINATION_LABELS[destination];
  return destination
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
