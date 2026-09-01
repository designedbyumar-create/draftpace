"use client";

import { useEffect, useId, useState } from "react";
import { Check, LinkSimple } from "@/design-system/Icon";

/**
 * Pick your situation, get the words.
 *
 * Three guides are built around opening lines: the admin calls people
 * dread, the conversation with a parent about their affairs, and what to
 * say about a gap you are embarrassed by. Printed as a bullet list, all
 * five openings are on screen at once and the reader has to find theirs
 * inside a paragraph that begins with a label.
 *
 * The reading situation these were written for is somebody with a phone
 * in their hand who has been putting the call off. One line, theirs, big
 * enough to read while dialling, and copyable. That is the whole
 * component, and it is the most useful thing on those pages.
 *
 * Copying is the reader's own action on the reader's own clipboard, so
 * there is no permission prompt to design around. Where the API is
 * unavailable the button simply does not appear rather than failing
 * silently when pressed.
 */
export default function ScriptPicker({
  items,
}: {
  items: { situation: string; line: string }[];
}) {
  const groupId = useId();
  const [index, setIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [canCopy, setCanCopy] = useState(false);

  // Read after mount rather than during render: the server has no
  // navigator, and a value read during render would mismatch on hydration.
  useEffect(() => {
    setCanCopy(typeof navigator !== "undefined" && !!navigator.clipboard);
  }, []);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const active = items[index];

  async function copy() {
    try {
      await navigator.clipboard.writeText(active.line);
      setCopied(true);
    } catch {
      // A refused clipboard is not worth an error state on an article.
      setCanCopy(false);
    }
  }

  return (
    <div className="mt-5 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)]">
      <div className="border-b border-[var(--border)] p-3">
        <p id={`${groupId}-label`} className="mb-2.5 px-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--muted)]">
          Pick the one you are facing
        </p>
        <div role="tablist" aria-labelledby={`${groupId}-label`} className="flex flex-wrap gap-1.5">
          {items.map((item, i) => {
            const selected = i === index;
            return (
              <button
                key={item.situation}
                type="button"
                role="tab"
                id={`${groupId}-tab-${i}`}
                aria-selected={selected}
                aria-controls={`${groupId}-panel-${i}`}
                onClick={() => {
                  setIndex(i);
                  setCopied(false);
                }}
                className={[
                  "rounded-full border px-3 py-1.5 text-[13px] font-medium transition-colors",
                  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]",
                  selected
                    ? "border-[var(--area,var(--primary))] bg-[var(--area,var(--primary))] text-white"
                    : "border-[var(--border-strong)] bg-[var(--surface)] text-[var(--muted)] hover:border-[var(--area,var(--primary))] hover:text-[var(--text)]",
                ].join(" ")}
              >
                {item.situation}
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-[var(--area-soft,var(--surface-muted))] px-5 py-6">
        {/* Every line is rendered and the inactive ones are hidden,
            rather than rendering only the chosen one. Otherwise four of
            the five scripts would be absent from the server HTML, which
            costs a reader without JavaScript the other options and costs
            the page the words it should be found for. */}
        {items.map((item, i) => (
          <p
            key={item.situation}
            role="tabpanel"
            id={`${groupId}-panel-${i}`}
            aria-labelledby={`${groupId}-tab-${i}`}
            hidden={i !== index}
            className="font-serif text-[19px] leading-[1.5] text-[var(--text)] sm:text-[21px]"
          >
            &ldquo;{item.line}&rdquo;
          </p>
        ))}

        {canCopy && (
          <button
            type="button"
            onClick={copy}
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-strong)] bg-[var(--surface)] px-3 py-1.5 text-[13px] font-semibold text-[var(--text)] transition-colors hover:border-[var(--area,var(--primary))] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
          >
            {copied ? <Check size={13} aria-hidden /> : <LinkSimple size={13} aria-hidden />}
            {copied ? "Copied" : "Copy this line"}
          </button>
        )}
        <span aria-live="polite" className="sr-only">
          {copied ? "Copied to your clipboard" : ""}
        </span>
      </div>
    </div>
  );
}
