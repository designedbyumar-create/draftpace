"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * The buy action, kept reachable on a phone.
 *
 * THE PROBLEM THIS SOLVES
 *
 * On a 390px screen the gallery, its thumbnails, the badge, the title and
 * the promise fill the whole first screen, so the button the page exists
 * for sits below the fold. A reader has to scroll to find it, and once
 * they have scrolled past it while reading, has to scroll back.
 *
 * WHY IT IS NOT ALWAYS VISIBLE
 *
 * It appears only once the real button has scrolled out of view, and
 * hides again when that button returns. Two identical calls to action on
 * screen at once is a worse page, not a more persuasive one, and a bar
 * that covers content from the first paint is an advert for itself.
 *
 * Mobile only. On desktop the buy box is beside the gallery and never
 * leaves the first screen, so there is nothing to solve.
 */
export default function StickyBuyBar({
  priceLabel,
  compareAtLabel,
  children,
}: {
  priceLabel: string;
  compareAtLabel: string | null;
  /** The same GetAction the page renders inline, so the two can never disagree. */
  children: ReactNode;
}) {
  const [visible, setVisible] = useState(false);
  const sentinel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = sentinel.current;
    if (!node) return;

    /**
     * The sentinel sits directly after the inline button, so "the sentinel
     * is above the viewport" means "the button has scrolled past".
     *
     * Read on scroll rather than with an IntersectionObserver, which is
     * the obvious tool and does not work here. The marketing layout wraps
     * its content in `overflow-x: clip`, and per spec a `clip` on one axis
     * computes `clip` on the other, so the observer treats that element as
     * the clipping root and the sentinel never reports leaving it. The bar
     * stayed hidden at every scroll position. A rect check has no such
     * dependency on ancestor overflow.
     *
     * Throttled to one read per frame, and passive, so it cannot make the
     * scroll it is watching feel heavy.
     */
    let frame = 0;
    const update = () => {
      frame = 0;
      setVisible(node.getBoundingClientRect().bottom < 0);
    };
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <>
      <div ref={sentinel} aria-hidden className="h-px w-full" />
      <div
        // aria-hidden throughout: the real button is still in the page and
        // still reachable in reading order. This is a shortcut back to it
        // for a thumb, not a second control, and announcing it twice would
        // make the page worse for a screen reader.
        aria-hidden
        className={`fixed inset-x-0 bottom-0 z-40 border-t border-[var(--border)] bg-[var(--surface)]/97 px-4 pb-[max(env(safe-area-inset-bottom),12px)] pt-3 backdrop-blur transition-transform duration-200 lg:hidden ${
          visible ? "translate-y-0" : "pointer-events-none translate-y-full"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="shrink-0">
            <div className="flex items-baseline gap-1.5">
              <span className="font-serif text-[22px] font-semibold leading-none text-[var(--text)]">{priceLabel}</span>
              {compareAtLabel && (
                <span className="text-[13px] text-[var(--faint)] line-through">{compareAtLabel}</span>
              )}
            </div>
            <p className="mt-0.5 text-[11px] text-[var(--muted)]">One payment</p>
          </div>
          <div className="min-w-0 flex-1">{children}</div>
        </div>
      </div>
    </>
  );
}
