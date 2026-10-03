"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, type DraftpaceIcon } from "@/design-system/Icon";

export type PaletteProduct = { slug: string; title: string; href: string; Icon: DraftpaceIcon };
export type PalettePage = { label: string; href: string; Icon: DraftpaceIcon };

type PaletteEntry = { key: string; label: string; sublabel?: string; href: string; Icon: DraftpaceIcon };

/**
 * The quick-switcher: Cmd/Ctrl+K from anywhere under PlatformShell jumps
 * straight to an owned product or a platform page, the same move Notion,
 * Slack and Linear all give you instead of making every jump a trip back
 * through a list page. Products come from the same owned-products fetch
 * PlatformShell already does for the sidebar — nothing fabricated,
 * nothing re-fetched a second time here.
 */
export default function CommandPalette({
  open,
  onClose,
  products,
  pages,
}: {
  open: boolean;
  onClose: () => void;
  products: PaletteProduct[];
  pages: PalettePage[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const entries = useMemo<PaletteEntry[]>(() => {
    const productEntries: PaletteEntry[] = products.map((p) => ({
      key: `product:${p.slug}`,
      label: p.title,
      sublabel: "Open",
      href: p.href,
      Icon: p.Icon,
    }));
    const pageEntries: PaletteEntry[] = pages.map((p) => ({
      key: `page:${p.href}`,
      label: p.label,
      href: p.href,
      Icon: p.Icon,
    }));
    return [...productEntries, ...pageEntries];
  }, [products, pages]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return entries;
    return entries.filter((e) => e.label.toLowerCase().includes(q));
  }, [entries, query]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIndex(0);
      // Next tick: the input isn't mounted yet on the same render that flips `open`.
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  const go = useCallback(
    (href: string) => {
      onClose();
      router.push(href);
    },
    [onClose, router]
  );

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      } else if (event.key === "ArrowDown") {
        event.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
      } else if (event.key === "Enter") {
        event.preventDefault();
        const entry = filtered[activeIndex];
        if (entry) go(entry.href);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, filtered, activeIndex, go, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Quick switcher"
      className="fixed inset-0 z-50 flex items-start justify-center bg-[rgba(20,18,14,0.45)] px-4 pt-[12vh]"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[shadow:var(--shadow-soft)]">
        <div className="flex items-center gap-2.5 border-b border-[var(--border)] px-4 py-3">
          <Search size={17} className="shrink-0 text-[var(--faint)]" aria-hidden />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Jump to a product or page…"
            aria-label="Jump to a product or page"
            className="w-full bg-transparent text-body text-[var(--text)] placeholder:text-[var(--faint)] focus:outline-none"
          />
          <kbd className="shrink-0 rounded border border-[var(--border-strong)] px-1.5 py-0.5 text-[11px] font-semibold text-[var(--faint)]">
            Esc
          </kbd>
        </div>

        <div role="listbox" aria-label="Results" className="max-h-[50vh] overflow-y-auto p-1.5">
          {filtered.length === 0 ? (
            <p className="px-3 py-6 text-center text-body-sm text-[var(--muted)]">Nothing matches "{query}".</p>
          ) : (
            filtered.map((entry, i) => (
              <button
                key={entry.key}
                type="button"
                role="option"
                aria-selected={i === activeIndex}
                onMouseEnter={() => setActiveIndex(i)}
                onClick={() => go(entry.href)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                  i === activeIndex ? "bg-[var(--primary-soft)]" : ""
                }`}
              >
                <entry.Icon size={17} className="shrink-0 text-[var(--muted)]" aria-hidden />
                <span className="min-w-0 flex-1 truncate text-body-sm font-semibold text-[var(--text)]">{entry.label}</span>
                {entry.sublabel && <span className="shrink-0 text-caption text-[var(--faint)]">{entry.sublabel}</span>}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
