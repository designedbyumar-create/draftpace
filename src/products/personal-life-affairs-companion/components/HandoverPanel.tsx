"use client";

import Button from "@/design-system/Button";
import { CheckCircle2, Article } from "@/design-system/Icon";
import { describeHandoverInvitation, describeReadiness, type Readiness } from "../completion";

/**
 * The handover: where somebody decides they are done and produces the
 * copy to give to the people who would need it.
 *
 * This is the emotional peak of the product, and the design brief is
 * explicit that it must not be a toast. It is the moment a person closes
 * a thing they have avoided for years.
 *
 * Two laws are visible here.
 *
 * Done is declared, never calculated. Nothing on this panel is disabled
 * by completeness. Somebody who has confirmed two things may print, and
 * the copy will say plainly that two things are confirmed.
 *
 * The document never overstates itself. The readiness line is shown
 * before generating, so there is no surprise about what is being handed
 * over, and the same sentence is printed on the cover.
 */
export default function HandoverPanel({
  readiness,
  onPrint,
  pending = false,
}: {
  readiness: Readiness;
  onPrint: () => void;
  pending?: boolean;
}) {
  const settled = readiness.nothingOutstanding && readiness.itemCount > 0;

  return (
    <section
      aria-label="Print a copy"
      className="rounded-xl border p-5"
      style={{
        borderColor: settled ? "var(--primary)" : "var(--border)",
        backgroundColor: "var(--surface)",
      }}
    >
      <div className="flex items-center gap-2">
        {settled ? (
          <CheckCircle2 size={17} className="text-[var(--primary)]" aria-hidden />
        ) : (
          <Article size={17} className="text-[var(--faint)]" aria-hidden />
        )}
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--primary)]">
          {settled ? "Ready to hand over" : "A copy for the people who would need it"}
        </p>
      </div>

      <p
        className="mt-2.5 text-[19px] leading-snug text-[var(--text)]"
        style={{ fontFamily: "var(--product-narrative-font, inherit)" }}
      >
        {describeHandoverInvitation(readiness)}
      </p>

      <p className="mt-2 text-[13px] leading-relaxed text-[var(--muted)]">{describeReadiness(readiness)}</p>

      {readiness.leftOpen > 0 && (
        <p className="mt-2 text-[12.5px] leading-relaxed text-[var(--muted)]">
          Anything you left open is printed as left open, so nobody reading it assumes it was handled.
        </p>
      )}

      <div className="mt-4">
        <Button size="sm" disabled={pending} onClick={onPrint}>
          {pending ? "Preparing..." : "Print a copy"}
        </Button>
      </div>

      <p className="mt-3 text-[12px] leading-relaxed text-[var(--faint)]">
        Every section carries the date you last confirmed it, so whoever holds this can tell what is current.
      </p>
    </section>
  );
}
