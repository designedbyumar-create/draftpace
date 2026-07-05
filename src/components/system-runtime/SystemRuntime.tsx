"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, BadgeCheck } from "@/components/ui/Icon";
import {
  CompanionIntent,
  IntensityId,
  RuntimeState,
  RuntimeValue,
  SystemBlueprint,
  createCompletedSession,
  createInitialRuntimeState,
  didExceedTarget,
  getActiveSession,
  getCompanionResponse,
  getNextRecommendedStep,
  getProgressSummary,
  getSelectedPath,
  isRuntimeConfigured,
  isSessionReady,
  readRuntimeState,
  writeCheckin,
  writeRuntimeState,
} from "@/lib/systems";
import ActiveSession from "@/components/system-runtime/ActiveSession";
import CompanionPanel from "@/components/system-runtime/CompanionPanel";
import PaceSetup from "@/components/system-runtime/PaceSetup";
import PathSelector from "@/components/system-runtime/PathSelector";
import ProgressPanel from "@/components/system-runtime/ProgressPanel";
import RecoveryPrompt from "@/components/system-runtime/RecoveryPrompt";
import SystemEntry from "@/components/system-runtime/SystemEntry";
import VaultPreview from "@/components/system-runtime/VaultPreview";

export default function SystemRuntime({ blueprint }: { blueprint: SystemBlueprint }) {
  const [hydrated, setHydrated] = useState(false);
  const [state, setState] = useState<RuntimeState>(() => createInitialRuntimeState(blueprint));

  useEffect(() => {
    setState(readRuntimeState(blueprint));
    setHydrated(true);
  }, [blueprint]);

  useEffect(() => {
    if (!hydrated) return;
    writeRuntimeState(blueprint.id, state);
  }, [blueprint.id, hydrated, state]);

  const activeSession = useMemo(() => getActiveSession(blueprint, state), [blueprint, state]);
  const progress = useMemo(() => getProgressSummary(blueprint, state), [blueprint, state]);
  const companion = useMemo(
    () => getCompanionResponse(blueprint, state, activeSession),
    [activeSession, blueprint, state]
  );
  const ready = isSessionReady(activeSession.actions, state.actionValues);
  const nextStep = getNextRecommendedStep(blueprint, state);

  const updateStage = (stage: RuntimeState["stage"], intent: CompanionIntent = state.lastIntent) => {
    setState((current) => ({ ...current, stage, lastIntent: intent }));
  };

  const handlePrimary = () => {
    if (!state.setup.pathId) {
      updateStage("path", "started");
      return;
    }
    if (!isRuntimeConfigured(state)) {
      updateStage("setup", "path-selected");
      return;
    }
    updateStage("session", "session-framed");
  };

  const handlePathSelect = (pathId: string) => {
    setState((current) => ({
      ...current,
      stage: "setup",
      actionValues: {},
      setup: {
        ...current.setup,
        pathId,
      },
      lastIntent: "path-selected",
    }));
  };

  const handleActionChange = (actionId: string, value: RuntimeValue) => {
    setState((current) => ({
      ...current,
      actionValues: {
        ...current.actionValues,
        [actionId]: value,
      },
      lastIntent: "session-framed",
    }));
  };

  const markProgress = () => {
    if (!ready) return;

    const completed = createCompletedSession(blueprint, state, activeSession);
    const intent: CompanionIntent = didExceedTarget(activeSession.actions, state.actionValues)
      ? "exceeded-target"
      : "completed";

    setState((current) => ({
      ...current,
      stage: "complete",
      actionValues: {},
      completedSessions: [...current.completedSessions, completed],
      lastIntent: intent,
    }));

    writeCheckin(blueprint.id);

    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
      new Notification("Draftpace progress marked", {
        body: `${blueprint.shortName} momentum is updated.`,
        icon: "/logo/dp-monogram-indigo.svg",
      });
    }
  };

  const openRecovery = () => {
    setState((current) => ({
      ...current,
      stage: "session",
      actionValues: {},
      setup: {
        ...current.setup,
        intensityId: "gentle",
      },
      lastIntent: "recovery",
    }));
  };

  const openNextSession = () => {
    setState((current) => ({
      ...current,
      stage: "session",
      actionValues: {},
      lastIntent: "session-framed",
    }));
  };

  if (!hydrated) {
    return (
      <section className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-8 text-center shadow-[var(--shadow-soft)]">
        <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-[var(--primary)] border-t-transparent" />
        <p className="mt-3 text-sm font-bold text-[var(--muted)]">Opening System</p>
      </section>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      {state.stage !== "entry" && <ProgressPanel blueprint={blueprint} progress={progress} compact />}

      {state.stage === "entry" && (
        <SystemEntry
          blueprint={blueprint}
          state={state}
          progress={progress}
          nextStep={nextStep}
          companion={companion}
          onPrimary={handlePrimary}
        />
      )}

      {state.stage === "path" && (
        <PathSelector
          blueprint={blueprint}
          selectedPathId={state.setup.pathId}
          onSelect={handlePathSelect}
          onBack={() => updateStage("entry", "started")}
        />
      )}

      {state.stage === "setup" && (
        <PaceSetup
          blueprint={blueprint}
          rhythmId={state.setup.rhythmId}
          intensityId={state.setup.intensityId}
          companionTone={state.setup.companionTone}
          customizations={state.setup.customizations}
          onRhythmChange={(rhythmId) =>
            setState((current) => ({
              ...current,
              setup: { ...current.setup, rhythmId },
              lastIntent: "rhythm-set",
            }))
          }
          onIntensityChange={(intensityId: IntensityId) =>
            setState((current) => ({
              ...current,
              setup: { ...current.setup, intensityId },
              lastIntent: "rhythm-set",
            }))
          }
          onToneChange={(companionTone) =>
            setState((current) => ({
              ...current,
              setup: { ...current.setup, companionTone },
              lastIntent: "rhythm-set",
            }))
          }
          onCustomizationChange={(id, value) =>
            setState((current) => ({
              ...current,
              setup: {
                ...current.setup,
                customizations: {
                  ...current.setup.customizations,
                  [id]: value,
                },
              },
              lastIntent: "adjusted",
            }))
          }
          onBack={() => updateStage("path", "path-selected")}
          onContinue={() => updateStage("session", "rhythm-set")}
        />
      )}

      {state.stage === "session" && (
        <div className="space-y-4">
          <ActiveSession
            blueprint={blueprint}
            session={activeSession}
            values={state.actionValues}
            ready={ready}
            companion={companion}
            onChange={handleActionChange}
            onAdjust={() => updateStage("setup", "adjusted")}
            onMark={markProgress}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <RecoveryPrompt blueprint={blueprint} onActivate={openRecovery} />
            <VaultPreview blueprint={blueprint} sessions={state.completedSessions} />
          </div>
        </div>
      )}

      {state.stage === "complete" && (
        <CompletionMoment
          blueprint={blueprint}
          state={state}
          companion={getCompanionResponse(blueprint, state, activeSession, state.lastIntent)}
          onEntry={() => updateStage("entry", state.lastIntent)}
          onNext={openNextSession}
        />
      )}
    </div>
  );
}

function CompletionMoment({
  blueprint,
  state,
  companion,
  onEntry,
  onNext,
}: {
  blueprint: SystemBlueprint;
  state: RuntimeState;
  companion: ReturnType<typeof getCompanionResponse>;
  onEntry: () => void;
  onNext: () => void;
}) {
  const path = getSelectedPath(blueprint, state);

  return (
    <motion.section
      className="rounded-[30px] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-soft)]"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div
        className="flex h-16 w-16 items-center justify-center rounded-[24px] text-white"
        style={{ background: blueprint.visualTheme.accent }}
      >
        <BadgeCheck size={28} />
      </div>
      <p className="mt-5 text-[11px] font-black uppercase tracking-[0.16em] text-[var(--faint)]">Progress marked</p>
      <h2 className="mt-2 text-[32px] font-black leading-tight tracking-tight text-[var(--text)]">
        {path.shortName} moved forward.
      </h2>
      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
        The session is saved locally. Momentum updated without touching Supabase or payment logic.
      </p>

      <CompanionPanel blueprint={blueprint} response={companion} />

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={onEntry}
          className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] px-5 py-3 text-sm font-black text-[var(--text)]"
        >
          Product Entry
        </button>
        <button
          type="button"
          onClick={onNext}
          className="flex items-center justify-center gap-2 rounded-2xl bg-[var(--primary)] px-5 py-3 text-sm font-black text-[var(--primary-contrast)]"
        >
          Next Session
          <ArrowRight size={16} />
        </button>
      </div>
    </motion.section>
  );
}
