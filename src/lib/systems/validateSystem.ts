import { isSystemCategory } from "@/lib/systems/categories";
import {
  CompanionTone,
  IntensityId,
  RhythmKind,
  SessionLabel,
  SystemAction,
  SystemActionType,
  SystemBlueprint,
  SystemPack,
  SystemStatus,
  SystemVisibility,
} from "@/lib/systems/types";

const systemStatuses: SystemStatus[] = ["draft", "coming_soon", "active", "archived"];
const systemVisibilities: SystemVisibility[] = ["public", "unlisted", "internal"];
const actionTypes: SystemActionType[] = [
  "checkbox",
  "number",
  "amount",
  "text",
  "reflection",
  "choice",
  "progress-mark",
  "custom-task",
];
const intensityIds: IntensityId[] = ["gentle", "balanced", "focused", "challenge"];
const companionTones: CompanionTone[] = ["Calm", "Direct", "Encouraging"];

const fallbackSessionLabels: Record<RhythmKind, SessionLabel> = {
  daily: "Today",
  weekly: "This Week",
  custom: "Custom Session",
  sprint: "Current Sprint",
  module: "Current Module",
  reset: "Current Reset",
};

export function validateSystemPack(raw: unknown): SystemBlueprint {
  if (!raw || typeof raw !== "object") {
    throw new Error("System pack must be an object.");
  }

  const pack = raw as Partial<SystemPack>;
  const id = requiredString(pack.id, "id");
  const slug = requiredString(pack.slug, "slug");

  if (!isSystemCategory(pack.category)) {
    throw new Error(`${id}: category must be registered.`);
  }

  if (!isOneOf(pack.status, systemStatuses)) {
    throw new Error(`${id}: status must be draft, coming_soon, active, or archived.`);
  }

  if (!isOneOf(pack.visibility, systemVisibilities)) {
    throw new Error(`${id}: visibility must be public, unlisted, or internal.`);
  }

  if (!pack.visualTheme?.accent || !pack.visualTheme.secondary || !pack.visualTheme.visualKind) {
    throw new Error(`${id}: visualTheme requires accent, secondary, and visualKind.`);
  }

  const paths = Array.isArray(pack.paths) ? pack.paths : [];
  const rhythmOptions = Array.isArray(pack.rhythmOptions) ? pack.rhythmOptions : [];
  const intensityOptions = Array.isArray(pack.intensityOptions) ? pack.intensityOptions : [];
  const actionTypesInPack = inferActionTypes(paths);
  const sessionLabels = rhythmOptions.reduce<Record<RhythmKind, SessionLabel>>(
    (labels, rhythm) => ({
      ...labels,
      [rhythm.kind]: rhythm.sessionLabel,
    }),
    fallbackSessionLabels
  );
  const defaultTone = isOneOf(pack.companionTone?.default, companionTones)
    ? pack.companionTone.default
    : "Calm";
  const toneOptions =
    pack.companionTone?.options?.filter((tone): tone is CompanionTone => isOneOf(tone, companionTones)) ||
    companionTones;

  return {
    id,
    slug,
    category: pack.category,
    status: pack.status,
    visibility: pack.visibility,
    name: requiredString(pack.name, `${id}.name`),
    shortName: requiredString(pack.shortName, `${id}.shortName`),
    promise: requiredString(pack.promise, `${id}.promise`),
    description: requiredString(pack.description, `${id}.description`),
    access: pack.access === "free" || pack.access === "membership" ? pack.access : "paid",
    productType: pack.productType || "draftpace-system",
    priceCents: Number(pack.priceCents) || 0,
    duration: requiredString(pack.duration, `${id}.duration`),
    estimatedMinutes: Number(pack.estimatedMinutes) || 5,
    visualTheme: pack.visualTheme,
    paths,
    rhythmOptions,
    intensityOptions: intensityOptions.filter((intensity) => isOneOf(intensity.id, intensityIds)),
    progressMetrics: Array.isArray(pack.progressMetrics) ? pack.progressMetrics : [],
    companionTone: {
      default: defaultTone,
      options: toneOptions.length > 0 ? toneOptions : [defaultTone],
    },
    customizationOptions: Array.isArray(pack.customizationOptions) ? pack.customizationOptions : [],
    recoveryBehavior: pack.recoveryBehavior || {
      title: "Recovery Mode",
      trigger: "Momentum needs a smaller next action.",
      minimumAction: "Complete one tiny action.",
      companionLine: "Come back small. The System is designed for real life.",
    },
    storeCard: pack.storeCard || {},
    dashboardCard: pack.dashboardCard || {},
    assets: {
      cover: pack.assets?.cover || `/systems/${slug}/cover.png`,
      preview: pack.assets?.preview || `/systems/${slug}/preview.png`,
    },
    ownedStatus: pack.status === "active" ? "owned" : "preview",
    prototypeUnlocked: pack.status === "active",
    sessionLabels,
    actionTypes: actionTypesInPack,
  };
}

function requiredString(value: unknown, field: string) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`System pack missing required field: ${field}.`);
  }
  return value;
}

function isOneOf<T extends string>(value: unknown, options: readonly T[]): value is T {
  return typeof value === "string" && options.includes(value as T);
}

function inferActionTypes(paths: SystemBlueprint["paths"]) {
  const found = new Set<SystemActionType>();

  paths.forEach((path) => {
    path.sessionTemplates.forEach((template) => {
      template.actions.forEach((action: SystemAction) => {
        if (actionTypes.includes(action.type)) found.add(action.type);
      });
    });
  });

  return Array.from(found);
}
