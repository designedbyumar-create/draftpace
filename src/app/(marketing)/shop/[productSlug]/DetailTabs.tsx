"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";

export type DetailTab = { id: string; label: string; content: ReactNode };

/**
 * The product page's detail, one panel at a time.
 *
 * WHY TABS
 *
 * The page used to run every section down a single column: what it
 * includes, what it solves, how it works, whose words, how it installs, who
 * it is not for, privacy, refunds, questions. Around 1,500 words and 7,000
 * pixels, most of it repeating what the section above had already said in
 * different words. A reader deciding whether to buy has one question at a
 * time, so this answers one question at a time.
 *
 * Every panel is in the page's HTML whether or not it is showing (the
 * inactive ones only carry `hidden`), so nothing is lost to a crawler, to
 * find-in-page, or to a reader who prints it. The tab named in the URL hash
 * opens on arrival, and choosing a tab writes its name back, so "the
 * questions" is a link that can be sent to someone.
 */
export default function DetailTabs({ tabs, accent }: { tabs: DetailTab[]; accent: string }) {
  const [active, setActive] = useState(tabs[0]?.id ?? "");
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => {
    const fromHash = window.location.hash.replace(/^#/, "");
    if (tabs.some((t) => t.id === fromHash)) setActive(fromHash);
  }, [tabs]);

  function choose(id: string) {
    setActive(id);
    try {
      window.history.replaceState(null, "", `#${id}`);
    } catch {
      // A blocked history write must never stop a tab from opening.
    }
  }

  function onKeyDown(event: KeyboardEvent, index: number) {
    const last = tabs.length - 1;
    const next = event.key === "ArrowRight" ? (index === last ? 0 : index + 1) : event.key === "ArrowLeft" ? (index === 0 ? last : index - 1) : event.key === "Home" ? 0 : event.key === "End" ? last : null;
    if (next === null) return;
    event.preventDefault();
    choose(tabs[next].id);
    refs.current[tabs[next].id]?.focus();
  }

  return (
    <div>
      <div className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden">
        <div role="tablist" aria-label="About this product" className="flex min-w-max gap-1 border-b border-[var(--border)]">
          {tabs.map((tab, index) => {
            const selected = tab.id === active;
            return (
              <button
                key={tab.id}
                ref={(el) => {
                  refs.current[tab.id] = el;
                }}
                type="button"
                role="tab"
                id={`tab-${tab.id}`}
                aria-selected={selected}
                aria-controls={`panel-${tab.id}`}
                tabIndex={selected ? 0 : -1}
                onClick={() => choose(tab.id)}
                onKeyDown={(e) => onKeyDown(e, index)}
                className={`relative min-h-11 whitespace-nowrap px-3.5 pb-3 pt-2 text-[14.5px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] ${
                  selected ? "text-[var(--text)]" : "text-[var(--muted)] hover:text-[var(--text)]"
                }`}
              >
                {tab.label}
                <span aria-hidden className="absolute inset-x-2 -bottom-px h-[2.5px] rounded-full transition-opacity" style={{ backgroundColor: accent, opacity: selected ? 1 : 0 }} />
              </button>
            );
          })}
        </div>
      </div>

      {tabs.map((tab) => (
        <div key={tab.id} role="tabpanel" id={`panel-${tab.id}`} aria-labelledby={`tab-${tab.id}`} hidden={tab.id !== active} className="pt-7 text-[15px] leading-relaxed text-[var(--text)]">
          {tab.content}
        </div>
      ))}
    </div>
  );
}
