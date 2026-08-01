"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ProductDefinition } from "@/product-framework/definition";
import Button from "@/design-system/Button";
import Surface from "@/design-system/Surface";
import Toggle from "@/design-system/Toggle";
import EmptyState from "@/design-system/EmptyState";
import { Download, Wallet } from "@/design-system/Icon";
import { useInstanceState } from "./useInstanceState";
import { SaveStatusIndicator } from "./shared";
import { setProductInstanceLifecycle } from "../data";
import { createEmptyState } from "../state";

const CURRENCIES = ["USD", "PKR", "GBP", "EUR", "CAD", "AUD", "INR", "AED", "SAR"];
const CHECK_IN_DAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"] as const;

export default function SettingsModule({ definition }: { definition: ProductDefinition }) {
  const router = useRouter();
  const { status, instanceId, state, saveStatus, setState } = useInstanceState(definition.slug);
  const [confirmingReset, setConfirmingReset] = useState(false);
  const [pausing, setPausing] = useState(false);

  if (status === "loading") {
    return <p className="text-[13px] text-[var(--muted)]">Loading settings…</p>;
  }

  if (status === "no-instance" || status === "error" || !state || !instanceId) {
    return (
      <EmptyState
        icon={Wallet}
        title="This product isn't set up in your library yet"
        description="Add Monthly Money Reset to your library first."
        action={
          <Button href={`/app/activate/${definition.slug}`} size="md">
            Add to my library
          </Button>
        }
      />
    );
  }

  function exportData() {
    if (!state) return;
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `monthly-money-reset-${state.cycle.cycleKey}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function pauseProduct() {
    if (!instanceId) return;
    setPausing(true);
    await setProductInstanceLifecycle(instanceId, "paused");
    setPausing(false);
    router.push("/app/library");
  }

  function resetCurrentMonth() {
    if (!state) return;
    setState(createEmptyState({ cycleKey: state.cycle.cycleKey, cycleLabel: state.cycle.label, currency: state.currency }));
    setConfirmingReset(false);
    router.push(`/app/products/${definition.slug}/setup`);
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-end">
        <SaveStatusIndicator status={saveStatus} />
      </div>

      <Surface className="p-5">
        <p className="text-[13px] font-semibold text-[var(--text)]">Currency</p>
        <p className="mt-1 text-[12px] leading-relaxed text-[var(--muted)]">
          One currency for this cycle. Changing it only changes how amounts display, it doesn&apos;t convert your
          numbers.
        </p>
        <select
          value={state.currency}
          onChange={(event) => setState({ ...state, currency: event.target.value })}
          className="mt-3 h-11 w-full max-w-xs rounded-lg border border-[var(--border-strong)] bg-[var(--surface)] px-3.5 text-[14px] text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
        >
          {CURRENCIES.map((code) => (
            <option key={code} value={code}>
              {code}
            </option>
          ))}
        </select>
      </Surface>

      <Surface className="p-5">
        <p className="text-[13px] font-semibold text-[var(--text)]">Weekly check-in day</p>
        <select
          value={state.preferences.checkInDay}
          onChange={(event) =>
            setState({ ...state, preferences: { ...state.preferences, checkInDay: event.target.value as (typeof CHECK_IN_DAYS)[number] } })
          }
          className="mt-3 h-11 w-full max-w-xs rounded-lg border border-[var(--border-strong)] bg-[var(--surface)] px-3.5 text-[14px] text-[var(--text)] capitalize focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
        >
          {CHECK_IN_DAYS.map((day) => (
            <option key={day} value={day}>
              {day.charAt(0).toUpperCase() + day.slice(1)}
            </option>
          ))}
        </select>
      </Surface>

      <Surface className="p-5">
        <p className="text-[13px] font-semibold text-[var(--text)]">Guidance tone</p>
        <div className="mt-3 flex gap-2">
          {(["calm", "direct", "minimal"] as const).map((tone) => (
            <button
              key={tone}
              type="button"
              onClick={() => setState({ ...state, preferences: { ...state.preferences, tone } })}
              className={`rounded-lg border px-3 py-2 text-[12px] font-semibold capitalize transition-colors ${
                state.preferences.tone === tone
                  ? "border-[var(--primary)] bg-[var(--primary-soft)] text-[var(--primary)]"
                  : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--border-strong)]"
              }`}
            >
              {tone}
            </button>
          ))}
        </div>
      </Surface>

      <Surface className="flex items-center justify-between gap-4 p-5">
        <div>
          <p className="text-[13px] font-semibold text-[var(--text)]">Hide amounts by default</p>
          <p className="mt-1 text-[12px] leading-relaxed text-[var(--muted)]">
            Blur money values until you choose to reveal them.
          </p>
        </div>
        <Toggle
          checked={state.preferences.privacyBlur}
          onChange={(checked) => setState({ ...state, preferences: { ...state.preferences, privacyBlur: checked } })}
          label="Hide amounts by default"
        />
      </Surface>

      <Surface className="flex items-center justify-between gap-4 p-5">
        <div>
          <p className="text-[13px] font-semibold text-[var(--text)]">Export this month&apos;s data</p>
          <p className="mt-1 text-[12px] leading-relaxed text-[var(--muted)]">Download everything as a JSON file.</p>
        </div>
        <Button variant="secondary" iconLeft={<Download size={14} aria-hidden />} onClick={exportData}>
          Export
        </Button>
      </Surface>

      <Surface className="flex items-center justify-between gap-4 border-[var(--danger)]/30 p-5">
        <div>
          <p className="text-[13px] font-semibold text-[var(--text)]">Pause Monthly Money Reset</p>
          <p className="mt-1 text-[12px] leading-relaxed text-[var(--muted)]">
            Keeps everything saved without reminders. You can pick it back up anytime from your library.
          </p>
        </div>
        <Button variant="secondary" onClick={pauseProduct} disabled={pausing}>
          {pausing ? "Pausing…" : "Pause"}
        </Button>
      </Surface>

      <Surface className="p-5">
        <p className="text-[13px] font-semibold text-[var(--text)]">Reset current month</p>
        <p className="mt-1 text-[12px] leading-relaxed text-[var(--muted)]">
          Clears everything you&apos;ve entered for {state.cycle.label} and sends you back to setup. This cannot be
          undone.
        </p>
        {confirmingReset ? (
          <div className="mt-3 flex gap-2">
            <Button variant="danger" onClick={resetCurrentMonth}>
              Yes, reset {state.cycle.label}
            </Button>
            <Button variant="ghost" onClick={() => setConfirmingReset(false)}>
              Cancel
            </Button>
          </div>
        ) : (
          <Button variant="danger" className="mt-3" onClick={() => setConfirmingReset(true)}>
            Reset current month
          </Button>
        )}
      </Surface>
    </div>
  );
}
