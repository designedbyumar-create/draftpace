"use client";

import { useEffect, useRef, useState } from "react";

export interface TabItem {
  id: string;
  label: string;
}

/**
 * A controlled tablist with a sliding active-state indicator: the WAI-ARIA
 * APG "automatic activation" tabs pattern (arrow keys move focus and
 * activate immediately; Home/End jump to the first/last tab; only the
 * selected tab sits in the natural tab order). The one new src/design-
 * system/ primitive the Home Base v2 rebuild introduces, built entirely
 * from tokens every other primitive already uses (--primary, --dur/
 * --ease-out, --focus-ring), nothing bespoke. The indicator skips its
 * slide-in transition on first measurement, so a freshly mounted tablist
 * never animates in from the left edge, only real tab changes slide.
 */
export default function Tabs({
  tabs,
  activeId,
  onChange,
  idPrefix = "tabs",
}: {
  tabs: TabItem[];
  activeId: string;
  onChange: (id: string) => void;
  idPrefix?: string;
}) {
  const listRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const [indicator, setIndicator] = useState<{ left: number; width: number } | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    function measure() {
      const activeEl = tabRefs.current.get(activeId);
      const listEl = listRef.current;
      if (!activeEl || !listEl) return;
      const listRect = listEl.getBoundingClientRect();
      const activeRect = activeEl.getBoundingClientRect();
      setIndicator({ left: activeRect.left - listRect.left + listEl.scrollLeft, width: activeRect.width });
    }
    measure();
    if (!ready) {
      const frame = requestAnimationFrame(() => setReady(true));
      window.addEventListener("resize", measure);
      return () => {
        cancelAnimationFrame(frame);
        window.removeEventListener("resize", measure);
      };
    }
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [activeId, tabs, ready]);

  function focusTabAt(index: number) {
    const tab = tabs[index];
    if (!tab) return;
    tabRefs.current.get(tab.id)?.focus();
    onChange(tab.id);
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    const currentIndex = tabs.findIndex((t) => t.id === activeId);
    if (event.key === "ArrowRight") {
      event.preventDefault();
      focusTabAt((currentIndex + 1) % tabs.length);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      focusTabAt((currentIndex - 1 + tabs.length) % tabs.length);
    } else if (event.key === "Home") {
      event.preventDefault();
      focusTabAt(0);
    } else if (event.key === "End") {
      event.preventDefault();
      focusTabAt(tabs.length - 1);
    }
  }

  return (
    <div
      ref={listRef}
      role="tablist"
      onKeyDown={handleKeyDown}
      className="relative flex gap-1 overflow-x-auto border-b border-[var(--border)]"
    >
      {tabs.map((tab) => {
        const selected = tab.id === activeId;
        return (
          <button
            key={tab.id}
            ref={(el) => {
              if (el) tabRefs.current.set(tab.id, el);
              else tabRefs.current.delete(tab.id);
            }}
            type="button"
            role="tab"
            id={`${idPrefix}-tab-${tab.id}`}
            aria-selected={selected}
            aria-controls={`${idPrefix}-panel-${tab.id}`}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(tab.id)}
            className={`shrink-0 whitespace-nowrap px-4 py-3 text-[13px] font-semibold transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface)] ${
              selected ? "text-[var(--text)]" : "text-[var(--muted)] hover:text-[var(--text)]"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
      {indicator && (
        <span
          aria-hidden
          className={`absolute bottom-0 h-[2px] bg-[var(--primary)] ${
            ready ? "transition-[left,width] duration-[var(--dur)] ease-[var(--ease-out)]" : ""
          }`}
          style={{ left: indicator.left, width: indicator.width }}
        />
      )}
    </div>
  );
}

/**
 * Pairs with Tabs via matching idPrefix/id: only renders while its own id
 * is the active one, correctly labeled for assistive tech via
 * aria-labelledby pointing back at the tab that controls it.
 */
export function TabPanel({
  id,
  activeId,
  idPrefix = "tabs",
  children,
}: {
  id: string;
  activeId: string;
  idPrefix?: string;
  children: React.ReactNode;
}) {
  if (id !== activeId) return null;
  return (
    <div role="tabpanel" id={`${idPrefix}-panel-${id}`} aria-labelledby={`${idPrefix}-tab-${id}`} tabIndex={0} className="focus-visible:outline-none">
      {children}
    </div>
  );
}
