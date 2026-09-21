"use client";

import { useEffect, useRef, useState } from "react";
import { CaretDown } from "@/design-system/Icon";

export interface ProductNavItem {
  slug: string;
  /** What the pill says: the product's own name, without the word Companion. */
  label: string;
  accent: string;
  contrast: string;
}

/**
 * Where you are in the eight Companions, and a way to move between them.
 *
 * Eight full-height sections in a row read as one long scroll with no sense
 * of how far along it is or what is left. This is a slim bar that sticks
 * under the site header while you are inside them (it is a child of the
 * section that holds them, so it lets go the moment they end) and shows:
 *
 *   every product by name, the current one filled in its own colour
 *   a count, "3 of 8", and previous and next
 *   a hairline that fills as you go
 *
 * Choosing a name scrolls to that product; the previous and next buttons
 * step one at a time. Which one is current is worked out from the scroll
 * position, so it stays right however you got there: the pills, the buttons,
 * an anchor link from the hero, or the scroll wheel.
 *
 * On a phone the names are one scrolling row, and the current name is kept
 * in view as you move.
 */
export default function ProductNav({ items }: { items: ProductNavItem[] }) {
  const [active, setActive] = useState(0);
  const row = useRef<HTMLDivElement>(null);
  const pills = useRef<(HTMLAnchorElement | null)[]>([]);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const line = window.innerHeight * 0.42;
      let current = 0;
      items.forEach((item, i) => {
        const el = document.getElementById(item.slug);
        if (el && el.getBoundingClientRect().top <= line) current = i;
      });
      setActive(current);
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [items]);

  useEffect(() => {
    const container = row.current;
    const pill = pills.current[active];
    if (!container || !pill) return;
    const target = pill.offsetLeft - container.clientWidth / 2 + pill.clientWidth / 2;
    container.scrollTo({ left: Math.max(0, target), behavior: "smooth" });
  }, [active]);

  function go(index: number) {
    const item = items[Math.min(items.length - 1, Math.max(0, index))];
    const el = document.getElementById(item.slug);
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  }

  const current = items[active];

  return (
    <nav aria-label="The Companions" className="sticky top-[76px] z-30 border-y border-[var(--border)] bg-[var(--bg)]/92 backdrop-blur lg:top-[65px]">
      <div className="mx-auto flex max-w-[1180px] items-center gap-3 px-5 py-2.5 sm:px-8">
        <div ref={row} className="flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {items.map((item, i) => {
            const on = i === active;
            return (
              <a
                key={item.slug}
                ref={(el) => {
                  pills.current[i] = el;
                }}
                href={`#${item.slug}`}
                aria-current={on ? "true" : undefined}
                onClick={(e) => {
                  e.preventDefault();
                  go(i);
                }}
                className="shrink-0 whitespace-nowrap rounded-full px-3.5 py-2 text-[13.5px] font-semibold transition-colors duration-[var(--dur)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
                style={on ? { backgroundColor: item.accent, color: item.contrast } : { color: "var(--muted)" }}
              >
                {item.label}
              </a>
            );
          })}
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <span className="hidden pr-2 text-[13px] tabular-nums text-[var(--muted)] sm:block">
            {active + 1} of {items.length}
          </span>
          <button type="button" aria-label="Previous Companion" onClick={() => go(active - 1)} disabled={active === 0} className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border-strong)] text-[var(--text)] disabled:opacity-35">
            <CaretDown size={15} className="rotate-180" aria-hidden />
          </button>
          <button type="button" aria-label="Next Companion" onClick={() => go(active + 1)} disabled={active === items.length - 1} className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border-strong)] text-[var(--text)] disabled:opacity-35">
            <CaretDown size={15} aria-hidden />
          </button>
        </div>
      </div>
      <div aria-hidden className="h-[2px] w-full bg-[var(--border)]">
        <div className="h-full transition-[width,background-color] duration-[400ms] ease-out" style={{ width: `${((active + 1) / items.length) * 100}%`, backgroundColor: current.accent }} />
      </div>
    </nav>
  );
}
