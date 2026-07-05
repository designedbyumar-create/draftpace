export type SystemCategory =
  | "money"
  | "focus"
  | "health"
  | "productivity"
  | "habits"
  | "learning"
  | "lifestyle";

export type SystemAccess = "free" | "paid" | "membership";
export type SystemStatus = "draft" | "coming_soon" | "active" | "archived";
export type SystemVisibility = "public" | "unlisted" | "internal";
export type OwnedStatus = "owned" | "included" | "preview" | "locked";
export type ProductType = "draftpace-system" | "system-series" | "imported-system";
export type SystemVisualKind =
  | "budget"
  | "savings"
  | "focus"
  | "health"
  | "productivity"
  | "habits"
  | "learning"
  | "lifestyle"
  | "custom";

export type RuntimeStage = "entry" | "path" | "setup" | "session" | "complete";
export type RhythmKind = "daily" | "weekly" | "custom" | "sprint" | "module" | "reset";
export type SessionLabel = "Today" | "This Week" | "Current Sprint" | "Current Reset" | "Current Module" | "Custom Session";
export type IntensityId = "gentle" | "balanced" | "focused" | "challenge";
export type CompanionTone = "Calm" | "Direct" | "Encouraging";
export type CompanionIntent =
  | "started"
  | "path-selected"
  | "rhythm-set"
  | "session-framed"
  | "completed"
  | "exceeded-target"
  | "adjusted"
  | "recovery";

export type SystemActionType =
  | "checkbox"
  | "number"
  | "amount"
  | "text"
  | "reflection"
  | "choice"
  | "progress-mark"
  | "custom-task";

export type SystemAction = {
  id: string;
  type: SystemActionType;
  label: string;
  helper?: string;
  placeholder?: string;
  unit?: string;
  options?: string[];
  required?: boolean;
  targetValue?: number;
  metricId?: string;
};

export type SessionTemplate = {
  id: string;
  title: string;
  lead: string;
  recommendedAction: string;
  actions: SystemAction[];
  completionLabel?: string;
  companionFrame?: string;
};

export type SystemPath = {
  id: string;
  name: string;
  shortName: string;
  description: string;
  recommended?: boolean;
  modeLabel?: string;
  sessionTemplates: SessionTemplate[];
};

export type RhythmOption = {
  id: string;
  label: string;
  kind: RhythmKind;
  sessionLabel: SessionLabel;
  description: string;
};

export type IntensityOption = {
  id: IntensityId;
  label: string;
  description: string;
  suggestedActionCount: number;
  companionModifier: string;
  recoveryLine: string;
};

export type ProgressMetric = {
  id: string;
  label: string;
  unit?: string;
  goal?: number;
  kind: "completed-sessions" | "sum-action" | "count-action" | "streak" | "custom";
  actionId?: string;
  weight?: number;
};

export type CustomizationOption = {
  id: string;
  label: string;
  description: string;
  type: "choice" | "text" | "number";
  options?: string[];
};

export type RecoveryBehavior = {
  title: string;
  trigger: string;
  minimumAction: string;
  companionLine: string;
};

export type VisualTheme = {
  accent: string;
  secondary: string;
  surface?: string;
  visualKind: SystemVisualKind;
};

export type SystemAssets = {
  cover: string;
  preview: string;
};

export type SystemStoreCard = {
  badge?: string;
  ctaLabel?: string;
  featured?: boolean;
  highlights?: string[];
  sortOrder?: number;
  summary?: string;
};

export type SystemDashboardCard = {
  ctaLabel?: string;
  statusLine?: string;
  summary?: string;
};

export type SystemPack = {
  id: string;
  slug: string;
  category: SystemCategory;
  status: SystemStatus;
  visibility: SystemVisibility;
  name: string;
  shortName: string;
  promise: string;
  description: string;
  access: SystemAccess;
  productType: ProductType;
  priceCents: number;
  duration: string;
  estimatedMinutes: number;
  visualTheme: VisualTheme;
  paths: SystemPath[];
  rhythmOptions: RhythmOption[];
  intensityOptions: IntensityOption[];
  progressMetrics: ProgressMetric[];
  companionTone: {
    default: CompanionTone;
    options: CompanionTone[];
  };
  customizationOptions: CustomizationOption[];
  recoveryBehavior: RecoveryBehavior;
  storeCard: SystemStoreCard;
  dashboardCard: SystemDashboardCard;
  assets: SystemAssets;
};

export type SystemBlueprint = SystemPack & {
  ownedStatus: OwnedStatus;
  prototypeUnlocked: boolean;
  sessionLabels: Record<RhythmKind, SessionLabel>;
  actionTypes: SystemActionType[];
};

export type RuntimeValue = string | number | boolean;
export type RuntimeActionValues = Record<string, RuntimeValue>;
export type RuntimeCustomizations = Record<string, RuntimeValue>;

export type CompletedSession = {
  id: string;
  pathId: string;
  rhythmId: string;
  intensityId: IntensityId;
  sessionTemplateId: string;
  sessionLabel: SessionLabel;
  completedAt: string;
  values: RuntimeActionValues;
};

export type RuntimeSetup = {
  pathId?: string;
  rhythmId?: string;
  intensityId?: IntensityId;
  companionTone: CompanionTone;
  customizations: RuntimeCustomizations;
};

export type RuntimeState = {
  stage: RuntimeStage;
  setup: RuntimeSetup;
  actionValues: RuntimeActionValues;
  completedSessions: CompletedSession[];
  lastIntent: CompanionIntent;
};

export type ProgressSummary = {
  percent: number;
  completedSessions: number;
  momentumScore: number;
  currentStreak: number;
  metrics: {
    id: string;
    label: string;
    value: number;
    displayValue: string;
    progress?: number;
  }[];
};

export type ActiveSession = {
  label: SessionLabel;
  title: string;
  lead: string;
  recommendedAction: string;
  template: SessionTemplate;
  actions: SystemAction[];
  path: SystemPath;
  rhythm: RhythmOption;
  intensity: IntensityOption;
};

export type CompanionResponse = {
  intent: CompanionIntent;
  line: string;
};

export type DraftpaceSystem = SystemBlueprint;
export type SystemIntensity = IntensityOption["label"];
