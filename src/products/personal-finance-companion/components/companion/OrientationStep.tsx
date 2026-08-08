"use client";

import Surface from "@/design-system/Surface";
import Button from "@/design-system/Button";
import type { InputPath } from "../../state";

interface PathOption {
  path: InputPath;
  label: string;
  hint: string;
}

/**
 * First-run orientation (launch spec Stage C §3, extended by Stage D).
 * Every path here is genuinely live as of Stage D — "notes"/"textFile"/
 * "csv" route into the real pasted-notes, text-file, and CSV pipelines
 * (see components/companion/import/), not a "not built yet" fallback to
 * manual entry anymore. The text-file option is deliberately labeled "a
 * text file", not "bank statements" — Draftpace does not read PDFs or
 * scanned statements (no OCR), and the label must never imply it does.
 */
const PATH_OPTIONS: PathOption[] = [
  { path: "fromScratch", label: "Mostly in my head", hint: "Enter things directly" },
  { path: "notes", label: "Notes or messages", hint: "Paste what you've written down" },
  { path: "textFile", label: "A text file", hint: "Upload a .txt file" },
  { path: "csv", label: "A spreadsheet or CSV", hint: "Import transactions" },
  { path: "manual", label: "I already know most of it — let's go", hint: "Enter things directly" },
];

export default function OrientationStep({ onSelectPath, onSkip }: { onSelectPath: (path: InputPath) => void; onSkip: () => void }) {
  return (
    <Surface elevated className="flex flex-col gap-5">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--primary)]">Personal Finance Companion</p>
        <h1 className="mt-1.5 text-xl font-semibold tracking-tight text-[var(--text)]">
          Let&apos;s build a financial picture you can actually maintain.
        </h1>
        <p className="mt-2 text-[14px] leading-relaxed text-[var(--muted)]">
          Draftpace helps you gather what you know, make missing information visible, and keep it current. You don&apos;t need
          everything ready before you start.
        </p>
      </div>

      <div>
        <p className="text-[13px] font-semibold text-[var(--text)]">Where is your financial information right now?</p>
        <div className="mt-3 flex flex-col gap-2">
          {PATH_OPTIONS.map((option) => (
            <button
              key={option.path}
              type="button"
              onClick={() => onSelectPath(option.path)}
              className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-left text-[13px] font-semibold text-[var(--text)] transition hover:border-[var(--primary)]"
            >
              {option.label}
              <span className="text-[11px] font-medium text-[var(--muted)]">{option.hint}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <Button variant="ghost" size="sm" onClick={onSkip}>
          Skip for now
        </Button>
      </div>
    </Surface>
  );
}
