import type { ReactNode } from "react";
import { AFFAIR_AREA_LABEL, type AffairArea } from "../affairsKnowledge";
import BookPage from "./BookPage";

/**
 * The next step, as the page that is about to be written.
 *
 * Presentational only: what to say, and what the buttons do, stay in
 * WorkspaceModule. This is where it is set.
 *
 * "Goes in your book as" is the step's own bookLabel, the heading the
 * answer will carry in the printed copy. It answers "why am I typing this"
 * with the thing itself: the page it becomes.
 *
 * Deliberately absent, as everywhere in this product: a progress bar, a
 * percentage, a denominator, and any list of what remains.
 */

export interface NextStepExisting {
  id: string;
  label: string;
  detail: string | null;
  notes: string | null;
}

export default function NextStepPage({
  area,
  lead,
  instruction,
  body,
  referOut,
  existing,
  bookLabel,
  minutes,
  actions,
}: {
  area: AffairArea;
  lead: string;
  instruction: string;
  body: string;
  referOut?: string;
  existing: NextStepExisting[];
  bookLabel: string;
  minutes: number;
  actions: ReactNode;
}) {
  return (
    <BookPage label="Your next step" head={AFFAIR_AREA_LABEL[area]} ribbon>
      <p
        className="mt-4 text-[14px] italic text-[var(--muted)]"
        style={{ fontFamily: "var(--product-narrative-font, inherit)" }}
      >
        {lead}
      </p>
      <h1
        className="mt-2 text-[30px] leading-[1.12] text-[var(--text)] [text-wrap:balance]"
        style={{ fontFamily: "var(--product-narrative-font, inherit)" }}
      >
        {instruction}
      </h1>
      <p className="mt-3 text-[15px] leading-[1.6] text-[var(--muted)]">{body}</p>

      {referOut && (
        <p className="mt-4 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface-muted)] p-3 text-[12.5px] leading-relaxed text-[var(--muted)]">
          {referOut}
        </p>
      )}

      {/* What is already recorded, shown before asking anything about it.
          Somebody rechecking needs to see the answer they are being asked
          to vouch for. */}
      {existing.length > 0 && (
        <ul aria-label="What is recorded now" className="mt-5 flex flex-col gap-3">
          {existing.map((entry) => (
            <li key={entry.id} className="border-l-2 border-[var(--border-strong)] pl-3">
              <p className="text-[15px] text-[var(--text)]" style={{ fontFamily: "var(--product-narrative-font, inherit)" }}>
                {entry.label}
              </p>
              {entry.detail && <p className="mt-0.5 text-[12.5px] leading-relaxed text-[var(--muted)]">{entry.detail}</p>}
              {entry.notes && <p className="mt-1 text-[12.5px] leading-relaxed text-[var(--muted)]">{entry.notes}</p>}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-5 flex flex-wrap items-baseline gap-x-2 border-t border-dotted border-[var(--border-strong)] pt-3 text-[12.5px] text-[var(--muted)]">
        <span>Goes in your book as</span>
        <span className="font-semibold text-[var(--text)]" style={{ fontFamily: "var(--product-narrative-font, inherit)" }}>
          {bookLabel}
        </span>
      </div>
      <p className="mt-1.5 text-[12px] text-[var(--muted)]">About {minutes} minutes</p>

      <div className="mt-5 flex flex-wrap gap-2">{actions}</div>
    </BookPage>
  );
}
