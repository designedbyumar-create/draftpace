"use client";

import { useState, type CSSProperties } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Article, ArrowRight, Bell, BookOpen, CalendarCheck, Car, FirstAidKit, Globe, Home, Save, Wallet, type DraftpaceIcon } from "@/design-system/Icon";
import { DEFAULTS, ITEMS, describe, type ItemId, type Options } from "./tellItOnceRules";

/**
 * How every Companion works, as something to try.
 *
 * Pick a thing you would hate to forget and watch what happens to it: it is
 * remembered, the date is worked out, and it speaks up only when it should.
 * Two of the six have something to move (when the boiler was last done, how
 * far off the insurance renewal is) so the working is visible: drag the
 * slider and the date, and what is said about it, change.
 *
 * It is an example, and says so. Each item belongs to a different product,
 * each result is that product's own rule (see tellItOnceRules.ts), and the link
 * at the foot goes to that product's section further down the page. There is
 * no merged screen here and none is implied: the Companions never read one
 * another's data.
 *
 * The colour of the result follows the product the item belongs to, taken
 * from that product's own theme, so choosing a different tile changes whose
 * work you are looking at.
 */
const ICONS: Record<ItemId, DraftpaceIcon> = { boiler: Home, car: Car, flight: Globe, allergy: FirstAidKit, visa: Wallet, will: BookOpen };

export interface TellItOnceAccent {
  base: string;
  soft: string;
}

const STEPS = [
  { key: "remembered", label: "Remembered", Icon: Save },
  { key: "worked", label: "Worked out", Icon: CalendarCheck },
  { key: "speaks", label: "Speaks up", Icon: Bell },
] as const;

export default function TellItOnce({ accents }: { accents: Record<string, TellItOnceAccent> }) {
  const reduceMotion = useReducedMotion();
  const [id, setId] = useState<ItemId>("boiler");
  const [opts, setOpts] = useState<Options>(DEFAULTS);
  const item = ITEMS.find((i) => i.id === id) ?? ITEMS[0];
  const result = describe(id, opts);
  const accent = accents[item.productSlug] ?? { base: "var(--primary)", soft: "var(--primary-soft)" };
  const vars = { "--tio": accent.base, "--tio-soft": accent.soft } as CSSProperties;

  return (
    <div style={vars}>
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--brand-ink)]">How a Companion works</p>
      <h2 className="mt-3 max-w-3xl font-serif text-[34px] font-semibold leading-[1.06] tracking-[-0.025em] sm:text-[52px]">
        Tell it once. It does the remembering.
      </h2>
      <p className="mt-4 max-w-xl text-[16px] leading-relaxed text-[var(--muted)]">Pick something you would hate to forget, and watch what happens to it.</p>

      <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-8">
        <div>
          <div role="group" aria-label="Something to remember" className="grid grid-cols-2 gap-3">
            {ITEMS.map((it) => {
              const Icon = ICONS[it.id];
              const on = it.id === id;
              const a = accents[it.productSlug];
              return (
                <button
                  key={it.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setId(it.id)}
                  className="flex min-h-[112px] flex-col items-start gap-3 rounded-[var(--radius-lg)] border p-4 text-left transition-colors duration-[var(--dur)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]"
                  style={on ? { borderColor: a?.base, backgroundColor: a?.soft, boxShadow: `inset 0 0 0 1px ${a?.base}` } : { borderColor: "var(--border)", backgroundColor: "var(--surface)" }}
                >
                  <span aria-hidden className="flex h-9 w-9 items-center justify-center rounded-full" style={{ backgroundColor: a?.soft, color: a?.base }}>
                    <Icon size={20} />
                  </span>
                  <span className="text-[15px] font-semibold leading-snug text-[var(--text)]">{it.name}</span>
                </button>
              );
            })}
          </div>

          {item.control === "ago" && (
            <div className="mt-5">
              <label htmlFor="tio-ago" className="flex items-baseline justify-between text-[14px] font-semibold text-[var(--text)]">
                Last done <span className="tabular-nums text-[var(--muted)]">{opts.ago === 0 ? "this month" : `${opts.ago} months ago`}</span>
              </label>
              <input id="tio-ago" type="range" min={0} max={24} step={1} value={opts.ago} onChange={(e) => setOpts((o) => ({ ...o, ago: Number(e.target.value) }))} className="mt-2 w-full" style={{ accentColor: accent.base }} />
            </div>
          )}
          {item.control === "daysAway" && (
            <div className="mt-5">
              <label htmlFor="tio-days" className="flex items-baseline justify-between text-[14px] font-semibold text-[var(--text)]">
                Renews in <span className="tabular-nums text-[var(--muted)]">{opts.daysAway} days</span>
              </label>
              <input id="tio-days" type="range" min={0} max={120} step={1} value={opts.daysAway} onChange={(e) => setOpts((o) => ({ ...o, daysAway: Number(e.target.value) }))} className="mt-2 w-full" style={{ accentColor: accent.base }} />
            </div>
          )}

          <div className="mt-5 flex items-start gap-3">
            <button
              type="button"
              role="switch"
              aria-checked={opts.remind}
              aria-labelledby="tio-remind"
              onClick={() => setOpts((o) => ({ ...o, remind: !o.remind }))}
              className="relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors duration-[var(--dur)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2"
              style={{ backgroundColor: opts.remind ? accent.base : "var(--border-strong)" }}
            >
              <span aria-hidden className="absolute top-0.5 h-5 w-5 rounded-full bg-white transition-[left] duration-[var(--dur)]" style={{ left: opts.remind ? 22 : 2 }} />
            </button>
            <div>
              <p id="tio-remind" className="text-[14.5px] font-semibold text-[var(--text)]">Tell me before it is due</p>
              <p className="mt-0.5 text-[13px] leading-snug text-[var(--muted)]">Off by default. A Companion never reminds you unless you switch this on.</p>
            </div>
          </div>
        </div>

        <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8" aria-live="polite">
          <ol className="relative flex flex-col">
            <span aria-hidden className="absolute bottom-6 left-[19px] top-6 w-px bg-[var(--border-strong)]" />
            {STEPS.map(({ key, label, Icon }, i) => {
              const text = result[key];
              return (
                <li key={key} className="relative grid grid-cols-[40px_minmax(0,1fr)] gap-4 py-4">
                  <span aria-hidden className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: accent.soft, color: accent.base }}>
                    <Icon size={19} />
                  </span>
                  <div>
                    <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-[var(--faint)]">{i + 1}. {label}</p>
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.p
                        key={id + key}
                        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
                        transition={{ duration: 0.22, delay: reduceMotion ? 0 : i * 0.05 }}
                        className={key === "worked" ? "mt-1 font-serif text-[26px] font-semibold leading-[1.15] tracking-tight text-[var(--text)]" : "mt-1 text-[16px] leading-relaxed text-[var(--text)]"}
                      >
                        {text}
                      </motion.p>
                    </AnimatePresence>
                  </div>
                </li>
              );
            })}
          </ol>

          <div className="mt-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-3 border-t border-[var(--border)] pt-5">
            <span className="inline-flex items-center gap-2 text-[13.5px] text-[var(--muted)]">
              <Article size={16} aria-hidden /> Prints as {item.prints}
            </span>
            <a href={`#${item.productSlug}`} className="inline-flex items-center gap-1.5 text-[14px] font-semibold hover:underline" style={{ color: accent.base }}>
              This is how {item.product} works. See it below <ArrowRight size={14} aria-hidden />
            </a>
          </div>
        </div>
      </div>

      <p className="mt-6 max-w-2xl text-[12.5px] leading-relaxed text-[var(--faint)]">
        An example, with today as September 21, 2026. Each Companion does this for its own part of life, and none of them reads another&apos;s.
      </p>
    </div>
  );
}
