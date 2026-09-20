import type { ReactNode } from "react";

/**
 * A page of the book: paper on the desk, a hint of the page beneath it,
 * and, when it is the page being written now, a ribbon marking the place.
 *
 * Everything the person is asked to do sits on one of these, so the
 * product reads as a single object being filled in rather than a set of
 * screens. The running head is the area the page belongs to, which is a
 * real fact about the step, never decoration.
 */

const RIBBON = "polygon(0 0, 100% 0, 100% 100%, 50% 80%, 0 100%)";

export default function BookPage({
  label,
  head,
  ribbon = false,
  children,
}: {
  label: string;
  /** The running head: the area this page belongs to. */
  head?: string;
  /** Marks the page currently being written. Never a progress figure. */
  ribbon?: boolean;
  children: ReactNode;
}) {
  return (
    <section aria-label={label} className="relative pt-2">
      <div className="relative rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-6 pb-6 pt-8 shadow-[0_1px_0_var(--border),0_5px_0_-1px_var(--surface),0_6px_0_-1px_var(--border),0_18px_30px_-20px_color-mix(in_srgb,#000_30%,transparent)]">
        {ribbon && (
          <span
            aria-hidden
            data-testid="ribbon"
            className="absolute -top-2 right-6 block h-14 w-[18px] bg-[var(--primary)]"
            style={{ clipPath: RIBBON }}
          />
        )}
        {head && (
          <p className="border-b border-[var(--border)] pb-2.5 pr-10 text-[10.5px] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">
            {head}
          </p>
        )}
        {children}
      </div>
    </section>
  );
}
