"use client";

import Surface from "@/design-system/Surface";
import Button from "@/design-system/Button";
import Alert from "@/design-system/Alert";
import type { InputPath } from "../../state";

interface PathOption {
  path: InputPath;
  label: string;
  live: boolean;
}

const PATH_OPTIONS: PathOption[] = [
  { path: "fromScratch", label: "Mostly in my head", live: true },
  { path: "notes", label: "Notes or messages", live: false },
  { path: "textFile", label: "Bank or card statements", live: false },
  { path: "csv", label: "A spreadsheet or CSV", live: false },
  { path: "manual", label: "I already know most of it — let's go", live: true },
];

/**
 * First-run orientation (launch spec Stage C §3). Every path is offered
 * honestly: the two live ones route straight into the guided manual
 * entry that actually exists; the three non-live ones say so plainly
 * before doing the same thing, rather than pretending to extract from
 * notes/statements/CSV — that pipeline isn't built yet.
 */
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
              {!option.live && <span className="text-[11px] font-medium text-[var(--muted)]">Not built yet — we&apos;ll go manual</span>}
            </button>
          ))}
        </div>
      </div>

      <Alert tone="info">
        Pasting notes, statements, or a spreadsheet to extract details automatically isn&apos;t built yet. Whichever you
        choose, Draftpace will guide you through entering it directly instead.
      </Alert>

      <div className="flex justify-end">
        <Button variant="ghost" size="sm" onClick={onSkip}>
          Skip for now
        </Button>
      </div>
    </Surface>
  );
}
