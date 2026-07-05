"use client";

import { Check } from "@/components/ui/Icon";
import { RuntimeActionValues, RuntimeValue, SystemAction, SystemBlueprint } from "@/lib/systems";

export default function ActionStack({
  blueprint,
  actions,
  values,
  onChange,
}: {
  blueprint: SystemBlueprint;
  actions: SystemAction[];
  values: RuntimeActionValues;
  onChange: (actionId: string, value: RuntimeValue) => void;
}) {
  return (
    <div className="space-y-3">
      {actions.map((action) => (
        <ActionControl
          key={action.id}
          blueprint={blueprint}
          action={action}
          value={values[action.id]}
          onChange={(value) => onChange(action.id, value)}
        />
      ))}
    </div>
  );
}

function ActionControl({
  blueprint,
  action,
  value,
  onChange,
}: {
  blueprint: SystemBlueprint;
  action: SystemAction;
  value: RuntimeValue | undefined;
  onChange: (value: RuntimeValue) => void;
}) {
  const inputClass =
    "mt-2 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm font-bold text-[var(--text)] outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-soft)]";

  if (action.type === "checkbox" || action.type === "progress-mark") {
    const active = Boolean(value);
    return (
      <button
        type="button"
        onClick={() => onChange(!active)}
        className="flex w-full items-start gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 text-left"
      >
        <span
          className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border"
          style={{
            borderColor: active ? blueprint.visualTheme.accent : "var(--border)",
            background: active ? blueprint.visualTheme.accent : "transparent",
            color: active ? "white" : "var(--muted)",
          }}
        >
          {active ? <Check size={14} /> : null}
        </span>
        <span>
          <ActionLabel action={action} />
        </span>
      </button>
    );
  }

  if (action.type === "choice") {
    return (
      <div>
        <ActionLabel action={action} />
        <div className="mt-2 flex gap-2 overflow-x-auto pb-1 dp-scrollbar-hide">
          {(action.options || []).map((option) => {
            const active = value === option;
            return (
              <button
                key={option}
                type="button"
                onClick={() => onChange(option)}
                className="shrink-0 rounded-full border px-4 py-2 text-xs font-black transition"
                style={{
                  borderColor: active ? blueprint.visualTheme.accent : "var(--border)",
                  background: active ? blueprint.visualTheme.accent : "var(--surface)",
                  color: active ? "white" : "var(--muted)",
                }}
              >
                {option}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (action.type === "reflection") {
    return (
      <label className="block">
        <ActionLabel action={action} />
        <textarea
          value={String(value || "")}
          onChange={(event) => onChange(event.target.value)}
          rows={4}
          placeholder={action.placeholder}
          className={inputClass}
        />
      </label>
    );
  }

  if (action.type === "amount" || action.type === "number") {
    return (
      <label className="block">
        <ActionLabel action={action} />
        <div className="relative">
          {action.unit && (
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-black text-[var(--muted)]">
              {action.unit}
            </span>
          )}
          <input
            type="number"
            min="0"
            inputMode="decimal"
            value={typeof value === "number" ? value : ""}
            onChange={(event) => onChange(Number(event.target.value))}
            placeholder={action.placeholder}
            className={`${inputClass} ${action.unit ? "pl-8" : ""}`}
          />
        </div>
      </label>
    );
  }

  return (
    <label className="block">
      <ActionLabel action={action} />
      <input
        type="text"
        value={String(value || "")}
        onChange={(event) => onChange(event.target.value)}
        placeholder={action.placeholder}
        className={inputClass}
      />
    </label>
  );
}

function ActionLabel({ action }: { action: SystemAction }) {
  return (
    <>
      <span className="text-sm font-black text-[var(--text)]">
        {action.label}
        {action.required && <span className="text-[var(--primary)]"> *</span>}
      </span>
      {action.helper && <span className="mt-1 block text-xs leading-5 text-[var(--muted)]">{action.helper}</span>}
    </>
  );
}
