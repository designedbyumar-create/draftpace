import { Check } from "@/design-system/Icon";

const FIELDS = [
  { label: "What are you working on?", value: "Moving apartments", state: "answered" as const },
  { label: "When does it need to happen?", value: "By the 15th", state: "answered" as const },
  { label: "Do you have kids or pets to plan around?", value: "Not applicable, skipped", state: "skipped" as const },
];

export default function SetupSection() {
  return (
    <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
      <div className="order-2 lg:order-1">
        <div className="flex flex-col divide-y divide-[var(--border)] rounded-xl border border-[var(--border)] bg-[var(--surface)]">
          {FIELDS.map((field) => (
            <div key={field.label} className="flex items-center justify-between gap-4 p-4">
              <div>
                <p className="text-[12px] text-[var(--faint)]">{field.label}</p>
                <p
                  className={`mt-1 text-[14px] font-medium ${
                    field.state === "skipped" ? "text-[var(--faint)] italic" : "text-[var(--text)]"
                  }`}
                >
                  {field.value}
                </p>
              </div>
              {field.state === "answered" && (
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--success-soft)] text-[var(--success)]">
                  <Check size={11} aria-hidden />
                </span>
              )}
            </div>
          ))}
        </div>
        <p className="mt-3 text-[12px] text-[var(--faint)]">
          Questions that would not change anything for you never show up in the first place.
        </p>
      </div>

      <div className="order-1 lg:order-2">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--primary)]">Getting started</p>
        <h2 className="mt-3 font-serif text-[30px] font-semibold leading-tight tracking-tight sm:text-[38px]">
          Start with what is true for you right now.
        </h2>
        <p className="mt-4 max-w-md text-[15px] leading-relaxed text-[var(--muted)]">
          You only answer what actually matters for your situation. Rough answers are fine. Anything you are not
          sure about, you can skip and come back to later.
        </p>
      </div>
    </div>
  );
}
