"use client";

import type { ReactNode } from "react";
import { ArrowRight, Check, SlidersHorizontal } from "@/components/ui/Icon";
import { CompanionTone, IntensityId, RuntimeCustomizations, RuntimeValue, SystemBlueprint } from "@/lib/systems";

export default function PaceSetup({
  blueprint,
  rhythmId,
  intensityId,
  companionTone,
  customizations,
  onRhythmChange,
  onIntensityChange,
  onToneChange,
  onCustomizationChange,
  onBack,
  onContinue,
}: {
  blueprint: SystemBlueprint;
  rhythmId?: string;
  intensityId?: IntensityId;
  companionTone: CompanionTone;
  customizations: RuntimeCustomizations;
  onRhythmChange: (rhythmId: string) => void;
  onIntensityChange: (intensityId: IntensityId) => void;
  onToneChange: (tone: CompanionTone) => void;
  onCustomizationChange: (id: string, value: RuntimeValue) => void;
  onBack: () => void;
  onContinue: () => void;
}) {
  const ready = Boolean(rhythmId && intensityId);

  return (
    <section className="rounded-[30px] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-soft)]">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--primary-soft)] text-[var(--primary)]">
        <SlidersHorizontal size={21} />
      </div>
      <h2 className="mt-5 text-[30px] font-black leading-tight tracking-tight text-[var(--text)]">Set the pace.</h2>
      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
        The runtime uses rhythm and intensity to generate the active session label, action count, and recovery tone.
      </p>

      <div className="mt-6 space-y-6">
        <SetupGroup title="Rhythm">
          <div className="grid gap-2 sm:grid-cols-2">
            {blueprint.rhythmOptions.map((rhythm) => (
              <ChoiceCard
                key={rhythm.id}
                title={rhythm.label}
                meta={rhythm.sessionLabel}
                description={rhythm.description}
                active={rhythmId === rhythm.id}
                accent={blueprint.visualTheme.accent}
                onClick={() => onRhythmChange(rhythm.id)}
              />
            ))}
          </div>
        </SetupGroup>

        <SetupGroup title="Intensity">
          <div className="grid gap-2 sm:grid-cols-2">
            {blueprint.intensityOptions.map((intensity) => (
              <ChoiceCard
                key={intensity.id}
                title={intensity.label}
                meta={`${intensity.suggestedActionCount} suggested action${intensity.suggestedActionCount === 1 ? "" : "s"}`}
                description={intensity.description}
                active={intensityId === intensity.id}
                accent={blueprint.visualTheme.accent}
                onClick={() => onIntensityChange(intensity.id)}
              />
            ))}
          </div>
        </SetupGroup>

        <SetupGroup title="Companion tone">
          <div className="grid grid-cols-3 gap-2">
            {blueprint.companionTone.options.map((tone) => {
              const active = companionTone === tone;
              return (
                <button
                  key={tone}
                  type="button"
                  onClick={() => onToneChange(tone)}
                  className={`rounded-2xl border px-3 py-3 text-sm font-black ${
                    active
                      ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-contrast)]"
                      : "border-[var(--border)] bg-[var(--surface-muted)] text-[var(--muted)]"
                  }`}
                >
                  {tone}
                </button>
              );
            })}
          </div>
        </SetupGroup>

        {blueprint.customizationOptions.length > 0 && (
          <SetupGroup title="Product customization">
            <div className="space-y-3">
              {blueprint.customizationOptions.map((option) => (
                <div key={option.id} className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-4">
                  <p className="text-sm font-black text-[var(--text)]">{option.label}</p>
                  <p className="mt-1 text-xs leading-5 text-[var(--muted)]">{option.description}</p>
                  {option.type === "choice" ? (
                    <div className="mt-3 flex gap-2 overflow-x-auto pb-1 dp-scrollbar-hide">
                      {(option.options || []).map((item) => {
                        const active = customizations[option.id] === item;
                        return (
                          <button
                            key={item}
                            type="button"
                            onClick={() => onCustomizationChange(option.id, item)}
                            className="shrink-0 rounded-full border px-4 py-2 text-xs font-black"
                            style={{
                              borderColor: active ? blueprint.visualTheme.accent : "var(--border)",
                              background: active ? blueprint.visualTheme.accent : "var(--surface)",
                              color: active ? "white" : "var(--muted)",
                            }}
                          >
                            {item}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <input
                      value={String(customizations[option.id] || "")}
                      onChange={(event) => onCustomizationChange(option.id, event.target.value)}
                      className="mt-3 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm font-bold text-[var(--text)] outline-none"
                    />
                  )}
                </div>
              ))}
            </div>
          </SetupGroup>
        )}
      </div>

      <div className="mt-6 grid grid-cols-[auto_1fr] gap-3">
        <button
          type="button"
          onClick={onBack}
          className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-5 py-3 text-sm font-bold text-[var(--muted)]"
        >
          Paths
        </button>
        <button
          type="button"
          disabled={!ready}
          onClick={onContinue}
          className="flex items-center justify-center gap-2 rounded-2xl bg-[var(--primary)] px-5 py-3 text-sm font-black text-[var(--primary-contrast)] disabled:cursor-not-allowed disabled:opacity-45"
        >
          Generate Session
          <ArrowRight size={16} />
        </button>
      </div>
    </section>
  );
}

function SetupGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <p className="mb-3 text-sm font-black text-[var(--text)]">{title}</p>
      {children}
    </div>
  );
}

function ChoiceCard({
  title,
  meta,
  description,
  active,
  accent,
  onClick,
}: {
  title: string;
  meta: string;
  description: string;
  active: boolean;
  accent: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-[22px] border p-4 text-left transition ${
        active
          ? "border-[var(--primary)] bg-[var(--primary-soft)]"
          : "border-[var(--border)] bg-[var(--surface-muted)]"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-black text-[var(--text)]">{title}</p>
          <p className="mt-1 text-[11px] font-black uppercase tracking-[0.12em] text-[var(--faint)]">{meta}</p>
        </div>
        <span
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
          style={{ background: active ? accent : "var(--surface)", color: active ? "white" : "var(--muted)" }}
        >
          {active ? <Check size={14} /> : null}
        </span>
      </div>
      <p className="mt-3 text-xs leading-5 text-[var(--muted)]">{description}</p>
    </button>
  );
}
