import {
  ActiveSession,
  CompanionIntent,
  CompanionResponse,
  CompletedSession,
  ProgressMetric,
  ProgressSummary,
  RuntimeActionValues,
  RuntimeState,
  RuntimeValue,
  SessionTemplate,
  SystemAction,
  SystemBlueprint,
  SystemPath,
} from "@/lib/systems/types";

export function createInitialRuntimeState(blueprint: SystemBlueprint): RuntimeState {
  return {
    stage: "entry",
    setup: {
      companionTone: blueprint.companionTone.default,
      customizations: {},
    },
    actionValues: {},
    completedSessions: [],
    lastIntent: "started",
  };
}

export function runtimeStorageKey(systemId: string) {
  return `draftpace-system-runtime:${systemId}`;
}

export function legacyRuntimeStorageKey(systemId: string) {
  return `draftpace-system-state:${systemId}`;
}

export function readRuntimeState(blueprint: SystemBlueprint): RuntimeState {
  if (typeof window === "undefined") return createInitialRuntimeState(blueprint);

  try {
    const raw =
      window.localStorage.getItem(runtimeStorageKey(blueprint.id)) ||
      window.localStorage.getItem(legacyRuntimeStorageKey(blueprint.id));
    if (!raw) return createInitialRuntimeState(blueprint);

    const parsed = JSON.parse(raw) as Partial<RuntimeState>;
    return {
      ...createInitialRuntimeState(blueprint),
      ...parsed,
      setup: {
        ...createInitialRuntimeState(blueprint).setup,
        ...(parsed.setup || {}),
        customizations: parsed.setup?.customizations || {},
      },
      actionValues: parsed.actionValues || {},
      completedSessions: parsed.completedSessions || [],
      lastIntent: parsed.lastIntent || "started",
    };
  } catch {
    return createInitialRuntimeState(blueprint);
  }
}

export function writeRuntimeState(systemId: string, state: RuntimeState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(runtimeStorageKey(systemId), JSON.stringify(state));
  window.localStorage.setItem(
    "draftpace-sync-state",
    JSON.stringify({ status: "queued", updatedAt: new Date().toISOString() })
  );
}

export function getRecommendedPath(blueprint: SystemBlueprint) {
  return blueprint.paths.find((path) => path.recommended) || blueprint.paths[0];
}

export function getSelectedPath(blueprint: SystemBlueprint, state: RuntimeState) {
  return blueprint.paths.find((path) => path.id === state.setup.pathId) || getRecommendedPath(blueprint);
}

export function getSelectedRhythm(blueprint: SystemBlueprint, state: RuntimeState) {
  return blueprint.rhythmOptions.find((rhythm) => rhythm.id === state.setup.rhythmId) || blueprint.rhythmOptions[0];
}

export function getSelectedIntensity(blueprint: SystemBlueprint, state: RuntimeState) {
  return (
    blueprint.intensityOptions.find((intensity) => intensity.id === state.setup.intensityId) ||
    blueprint.intensityOptions.find((intensity) => intensity.id === "balanced") ||
    blueprint.intensityOptions[0]
  );
}

export function isRuntimeConfigured(state: RuntimeState) {
  return Boolean(state.setup.pathId && state.setup.rhythmId && state.setup.intensityId);
}

export function getNextRecommendedStep(blueprint: SystemBlueprint, state: RuntimeState) {
  if (!state.setup.pathId) return "Choose a path inside this System.";
  if (!state.setup.rhythmId) return "Set the rhythm this System should follow.";
  if (!state.setup.intensityId) return "Choose the intensity that fits your current capacity.";
  if (state.stage === "complete") return "Open the next session when you are ready.";

  const session = getActiveSession(blueprint, state);
  return session.recommendedAction;
}

export function getActiveSession(blueprint: SystemBlueprint, state: RuntimeState): ActiveSession {
  const path = getSelectedPath(blueprint, state);
  const rhythm = getSelectedRhythm(blueprint, state);
  const intensity = getSelectedIntensity(blueprint, state);
  const template = getSessionTemplate(path, state);
  const actions = getActionsForIntensity(template, intensity.suggestedActionCount);

  return {
    label: rhythm.sessionLabel,
    title: template.title,
    lead: template.lead,
    recommendedAction: template.recommendedAction,
    template,
    actions,
    path,
    rhythm,
    intensity,
  };
}

function getSessionTemplate(path: SystemPath, state: RuntimeState) {
  const pathCompletions = state.completedSessions.filter((session) => session.pathId === path.id);
  const index = pathCompletions.length % Math.max(path.sessionTemplates.length, 1);
  return path.sessionTemplates[index] || path.sessionTemplates[0];
}

function getActionsForIntensity(template: SessionTemplate, suggestedActionCount: number) {
  const required = template.actions.filter((action) => action.required);
  const optional = template.actions.filter((action) => !action.required);
  const roomForOptional = Math.max(0, suggestedActionCount - required.length);
  const selectedOptional = optional.slice(0, roomForOptional);
  return [...required, ...selectedOptional];
}

export function hasRuntimeValue(value: RuntimeValue | undefined) {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value > 0;
  return typeof value === "string" && value.trim().length > 0;
}

export function isSessionReady(actions: SystemAction[], values: RuntimeActionValues) {
  return actions.every((action) => !action.required || hasRuntimeValue(values[action.id]));
}

export function readRuntimeNumber(value: RuntimeValue | undefined) {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

export function getPrimaryNumericValue(actions: SystemAction[], values: RuntimeActionValues) {
  return actions.reduce((total, action) => {
    if (action.type !== "amount" && action.type !== "number") return total;
    return total + readRuntimeNumber(values[action.id]);
  }, 0);
}

export function didExceedTarget(actions: SystemAction[], values: RuntimeActionValues) {
  return actions.some((action) => {
    if (!action.targetValue) return false;
    return readRuntimeNumber(values[action.id]) > action.targetValue;
  });
}

export function createCompletedSession(
  blueprint: SystemBlueprint,
  state: RuntimeState,
  activeSession: ActiveSession
): CompletedSession {
  return {
    id: `${blueprint.id}-${Date.now()}`,
    pathId: activeSession.path.id,
    rhythmId: activeSession.rhythm.id,
    intensityId: activeSession.intensity.id,
    sessionTemplateId: activeSession.template.id,
    sessionLabel: activeSession.label,
    completedAt: new Date().toISOString(),
    values: state.actionValues,
  };
}

export function getProgressSummary(blueprint: SystemBlueprint, state: RuntimeState): ProgressSummary {
  const completedSessions = state.completedSessions.length;
  const metrics = blueprint.progressMetrics.map((metric) => getMetricSummary(metric, state));
  const percent = getAverageProgress(metrics);
  const currentStreak = getCurrentStreak(state.completedSessions);
  const momentumScore = Math.round(
    Math.min(100, completedSessions * 10 * 0.55 + currentStreak * 12 * 0.3 + percent * 0.15)
  );

  return {
    percent,
    completedSessions,
    momentumScore,
    currentStreak,
    metrics,
  };
}

function getMetricSummary(metric: ProgressMetric, state: RuntimeState): ProgressSummary["metrics"][number] {
  const value = getMetricValue(metric, state);
  const progress = metric.goal ? Math.min(100, Math.round((value / metric.goal) * 100)) : undefined;
  const displayValue = metric.unit === "$" ? `$${value.toLocaleString()}` : `${value}${metric.unit || ""}`;

  return {
    id: metric.id,
    label: metric.label,
    value,
    displayValue,
    progress,
  };
}

function getMetricValue(metric: ProgressMetric, state: RuntimeState) {
  if (metric.kind === "completed-sessions") return state.completedSessions.length;
  if (metric.kind === "streak") return getCurrentStreak(state.completedSessions);
  if (metric.kind === "sum-action" && metric.actionId) {
    return state.completedSessions.reduce((total, session) => total + readRuntimeNumber(session.values[metric.actionId || ""]), 0);
  }
  if (metric.kind === "count-action" && metric.actionId) {
    return state.completedSessions.filter((session) => hasRuntimeValue(session.values[metric.actionId || ""])).length;
  }
  return 0;
}

function getAverageProgress(metrics: ProgressSummary["metrics"]) {
  if (metrics.length === 0) return 0;
  const values = metrics.map((metric) => metric.progress ?? Math.min(100, metric.value * 10));
  return Math.round(values.reduce((total, value) => total + value, 0) / values.length);
}

function getCurrentStreak(completedSessions: CompletedSession[]) {
  const completedDays = new Set(completedSessions.map((session) => session.completedAt.slice(0, 10)));
  if (completedDays.size === 0) return 0;

  let streak = 0;
  const cursor = new Date();

  while (completedDays.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak || 1;
}

export function getCompanionResponse(
  blueprint: SystemBlueprint,
  state: RuntimeState,
  activeSession: ActiveSession,
  intent: CompanionIntent = state.lastIntent
): CompanionResponse {
  const tone = state.setup.companionTone;
  const prefix = tone === "Encouraging" ? "Good. " : "";
  const directSuffix = tone === "Direct" ? "" : " Keep it clean and repeatable.";
  const recovery = blueprint.recoveryBehavior.companionLine;
  const frame = activeSession.template.companionFrame || activeSession.recommendedAction;

  const lines: Record<CompanionIntent, string> = {
    started: `${prefix}${blueprint.shortName} is open. Pick the path that matches what you need right now.`,
    "path-selected": `${prefix}${activeSession.path.shortName} is the path. Next, set the rhythm so the System can guide the right session.`,
    "rhythm-set": `${prefix}${activeSession.rhythm.label} rhythm and ${activeSession.intensity.label} intensity are set.${directSuffix}`,
    "session-framed": `${prefix}${frame}`,
    completed: `${prefix}Session marked. Momentum comes from showing up, not overloading the day.`,
    "exceeded-target": `${prefix}Strong output. Protect sustainability so this win does not become tomorrow's pressure.`,
    adjusted: `${prefix}Adjustment accepted. The System should fit real life, not punish it.`,
    recovery,
  };

  return {
    intent,
    line: lines[intent],
  };
}

export function writeCheckin(systemId: string) {
  if (typeof window === "undefined") return;
  try {
    const today = new Date().toISOString().slice(0, 10);
    const raw = window.localStorage.getItem("draftpace-checkins");
    const checkins = raw ? JSON.parse(raw) : {};
    checkins[systemId] = { ...(checkins[systemId] || {}), [today]: true };
    window.localStorage.setItem("draftpace-checkins", JSON.stringify(checkins));
  } catch {
    // Local check-ins should never block progress marking.
  }
}
