"use client";

import { useState, type ReactNode } from "react";
import { Check, CheckCircle2, Clock, Lock, MapPin, RotateCcw, WarningCircle } from "@/design-system/Icon";
import { comparePayoff, formatMonth } from "@/products/personal-finance-companion/components/debt/payoffPlan";
import type { Debt } from "@/products/personal-finance-companion/state";
import { odometerDigits } from "@/products/vehicle-maintenance-companion/odometer";
import { buildFormsSheet } from "@/products/family-health-binder/printSheets";
import type { FamilyMember, MedicalFact } from "@/products/family-health-binder/state";
import type { Hero } from "./posterTypes";

/**
 * One small working copy of each Companion, so a visitor can watch it do the
 * thing instead of reading that it does. They are deliberately small: a
 * single card, about 400px wide, type no smaller than 13px, one or two
 * things to touch.
 *
 * WHAT IS REAL
 *
 * Wherever the product has logic that can run in a browser, the demo runs
 * that logic and not a picture of its result: the payoff plan is
 * planPayoff/comparePayoff from Personal Finance Companion, and the Forms
 * sheet is buildFormsSheet from Family Health Binder, privacy rules
 * included. Where the product's behaviour is a small state machine (a job
 * done or snoozed, a step ticked, a change walked one booking at a time),
 * the demo is that state machine with sample data, and says nothing the
 * product does not.
 *
 * The people, amounts and dates are illustrative and internally consistent.
 * They are never presented as anybody's records.
 *
 * Colours come from the --poster-* tones the surrounding section sets from
 * the product's own theme.
 */

const SHELL =
  "w-full max-w-[420px] rounded-[var(--poster-radius)] border border-[var(--poster-border)] bg-[var(--poster-surface)] text-[var(--poster-text)] shadow-[0_28px_56px_-30px_rgba(0,0,0,0.4)]";

function Btn({ children, onClick, tone = "solid", disabled = false, className = "" }: { children: ReactNode; onClick: () => void; tone?: "solid" | "quiet"; disabled?: boolean; className?: string }) {
  const solid = tone === "solid";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex min-h-10 items-center justify-center gap-1.5 rounded-[var(--poster-radius)] px-4 text-[14px] font-semibold transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--poster-accent)] focus-visible:ring-offset-2 disabled:opacity-40 ${
        solid ? "text-[var(--poster-accent-contrast)]" : "border border-[var(--poster-border)] text-[var(--poster-text)]"
      } ${className}`}
      style={solid ? { backgroundColor: "var(--poster-accent)" } : undefined}
    >
      {children}
    </button>
  );
}

function StartOver({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--poster-muted)] hover:text-[var(--poster-text)]">
      <RotateCcw size={13} aria-hidden /> Start over
    </button>
  );
}

const usd = (minor: number) => (minor < 0 ? "-" : "") + "$" + (Math.abs(minor) / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/* ------------------------------------------------- Personal Finance Companion */

const NOW = new Date(Date.UTC(2026, 8, 21));
const debt = (id: string, name: string, balance: number, rate: number, minimum: number) =>
  ({ id, name, type: "creditCard", balanceMinorUnits: balance, currency: "USD", interestRate: rate, minimumPaymentMinorUnits: minimum, dueDate: null, promotionalRate: null, promotionalExpiry: null, balanceAsOfDate: "2026-09-21", linkedAccountId: null, status: "active", needsReviewReason: null, source: "manual", importSessionId: null, createdAt: "2026-01-01T00:00:00Z", updatedAt: "2026-01-01T00:00:00Z" }) as unknown as Debt;
const DEBTS = [debt("visa", "Visa", 320_000, 22.9, 8_500), debt("car", "Car loan", 840_000, 6.5, 14_500)];

function MoneyDemo({ hero }: { hero?: Hero }) {
  const [working, setWorking] = useState(false);
  const [extra, setExtra] = useState(100);
  const plan = comparePayoff(DEBTS, extra * 100, NOW);
  const best = plan.cheaper === "snowball" ? plan.snowball : plan.avalanche;
  const rows: [string, string][] = [
    ["From your accounts", "$5,220.18"],
    ["Bills and subscriptions", "−$1,810.00"],
    ["Debt minimums", "−$230.00"],
    ["Protected", "−$2,000.00"],
  ];
  return (
    <div className={`${SHELL} overflow-hidden`}>
      <div className="p-5" style={{ background: hero ? `linear-gradient(170deg, ${hero.from}, ${hero.mid} 62%, ${hero.to})` : undefined, color: hero?.ink }}>
        <p className="text-[13px] opacity-75">Available to spend</p>
        <p className="mt-1 font-serif text-[46px] font-semibold leading-none tracking-[-0.03em]">
          $1,180<span className="text-[26px] opacity-60">.18</span>
        </p>
        <button type="button" onClick={() => setWorking((w) => !w)} aria-expanded={working} className="mt-3 text-[13px] font-semibold underline decoration-white/40 underline-offset-4">
          {working ? "Hide the working" : "Show the working"}
        </button>
        {working && (
          <dl className="mt-3 flex flex-col gap-1.5 text-[13.5px]">
            {rows.map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4">
                <dt className="opacity-75">{k}</dt>
                <dd className="font-semibold tabular-nums">{v}</dd>
              </div>
            ))}
            <div className="mt-1 flex justify-between gap-4 border-t border-white/25 pt-1.5">
              <dt className="opacity-75">Available</dt>
              <dd className="font-semibold tabular-nums">$1,180.18</dd>
            </div>
          </dl>
        )}
      </div>

      <div className="p-5">
        <p className="text-[13px] font-semibold text-[var(--poster-muted)]">Your debts: Visa $3,200 and a car loan $8,400</p>
        <label className="mt-4 block text-[14px] font-semibold" htmlFor="extra">
          Pay <span className="tabular-nums">${extra}</span> extra a month
        </label>
        <input id="extra" type="range" min={0} max={500} step={25} value={extra} onChange={(e) => setExtra(Number(e.target.value))} className="mt-2 w-full" style={{ accentColor: "var(--poster-accent)" }} />
        <div className="mt-4 rounded-[var(--poster-radius)] p-4" style={{ backgroundColor: "var(--poster-soft)" }}>
          <p className="text-[13px] text-[var(--poster-muted)]">Debt-free by</p>
          <p className="font-serif text-[28px] font-semibold leading-tight">{best.debtFreeMonth ? formatMonth(best.debtFreeMonth) : "Not within 50 years"}</p>
          <p className="mt-1 text-[13px] text-[var(--poster-muted)]">
            {plan.cheaper ? `Highest rate first saves ${usd(plan.savedMinorUnits)} in interest over smallest first.` : "Both orders come out the same."}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- Home Base */

type JobState = "open" | "done" | "snoozed";
const JOBS = [
  { id: "tank", title: "Flush the tank", meta: "Last done 2 years ago, usually every year", after: "Logged today. Next due September 2027, a year on." },
  { id: "freeze", title: "Shut off and drain before the freeze", meta: "Not logged yet, usually October", after: "Logged today. It comes up again before next winter." },
  { id: "alarm", title: "Test the alarm", meta: "Due in 3 weeks", after: "Logged today. It goes back to its own schedule." },
];

function HomeDemo() {
  const [state, setState] = useState<Record<string, JobState>>({});
  const open = JOBS.filter((j) => (state[j.id] ?? "open") === "open").length;
  const headline = open === 0 ? "Nothing needs you this week." : open === 1 ? "One thing worth taking care of." : "A couple of things worth taking care of.";
  return (
    <div className={`${SHELL} p-5`}>
      <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-[var(--poster-muted)]">Your home</p>
      <p className="mt-1 font-serif text-[26px] font-medium leading-tight tracking-tight">{headline}</p>
      <ul className="mt-4 flex flex-col gap-2.5">
        {JOBS.map((job) => {
          const s = state[job.id] ?? "open";
          return (
            <li key={job.id} className="rounded-[var(--poster-radius)] border border-[var(--poster-border)] px-4 py-3">
              <p className="text-[15px] font-semibold">{job.title}</p>
              {s === "open" ? (
                <>
                  <p className="mt-0.5 text-[13.5px] text-[var(--poster-muted)]">{job.meta}</p>
                  <div className="mt-3 flex gap-2">
                    <Btn onClick={() => setState((c) => ({ ...c, [job.id]: "done" }))} className="min-h-9 px-3.5 text-[13.5px]">Action</Btn>
                    <Btn tone="quiet" onClick={() => setState((c) => ({ ...c, [job.id]: "snoozed" }))} className="min-h-9 px-3.5 text-[13.5px]">Snooze</Btn>
                  </div>
                </>
              ) : (
                <p className="mt-1 flex items-start gap-2 text-[13.5px] text-[var(--poster-muted)]">
                  {s === "done" ? <CheckCircle2 size={16} className="mt-0.5 shrink-0" style={{ color: "var(--poster-accent)" }} aria-hidden /> : <Clock size={16} className="mt-0.5 shrink-0" aria-hidden />}
                  {s === "done" ? job.after : "Snoozed. It comes back later."}
                </p>
              )}
            </li>
          );
        })}
      </ul>
      {open < JOBS.length && <StartOver onClick={() => setState({})} />}
    </div>
  );
}

/* ---------------------------------------------------------- ADHD Life Companion */

function FocusDemo() {
  const [view, setView] = useState<"card" | "walk" | "later" | "sorted">("card");
  const [ticked, setTicked] = useState<number[]>([]);
  const steps = ["Say what you need", "Ask your main question", "Ask what happens next"];
  return (
    <div className={`${SHELL} p-6`}>
      {view === "card" && (
        <>
          <p className="text-[14px] text-[var(--poster-muted)]">You said you would come back to this</p>
          <p className="mt-2 font-serif text-[32px] font-medium leading-[1.08] tracking-tight">Call the clinic about the referral</p>
          <Btn onClick={() => setView("walk")} className="mt-6 w-full min-h-12 text-[16px]">Do this with me</Btn>
          <div className="mt-4 flex justify-center gap-6 text-[14px] font-semibold text-[var(--poster-muted)]">
            <button type="button" onClick={() => setView("later")} className="hover:text-[var(--poster-text)]">Not now</button>
            <button type="button" onClick={() => setView("sorted")} className="hover:text-[var(--poster-text)]">It is sorted</button>
          </div>
        </>
      )}
      {view === "walk" && (
        <>
          <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-[var(--poster-muted)]">Make a phone call</p>
          <div className="mt-3 rounded-[var(--poster-radius)] p-3.5 text-[14px]" style={{ backgroundColor: "var(--poster-soft)" }}>
            <p className="text-[12.5px] font-semibold text-[var(--poster-muted)]">What a good result looks like, in your words</p>
            <p className="font-semibold">A date for someone to come out</p>
            <p className="mt-2 text-[12.5px] font-semibold text-[var(--poster-muted)]">Do not forget</p>
            <p className="font-semibold">Ask if the fee is covered</p>
          </div>
          <ul className="mt-4 flex flex-col gap-2">
            {steps.map((step, i) => {
              const on = ticked.includes(i);
              return (
                <li key={step}>
                  <button type="button" onClick={() => setTicked((t) => (on ? t.filter((x) => x !== i) : [...t, i]))} aria-pressed={on} className="flex w-full items-center gap-3 rounded-[var(--poster-radius)] border border-[var(--poster-border)] px-3.5 py-3 text-left text-[15px] font-semibold">
                    <span aria-hidden className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2" style={on ? { backgroundColor: "var(--poster-accent)", borderColor: "var(--poster-accent)", color: "var(--poster-accent-contrast)" } : { borderColor: "var(--poster-border)" }}>
                      {on && <Check size={12} />}
                    </span>
                    <span className={on ? "text-[var(--poster-muted)] line-through" : ""}>{step}</span>
                  </button>
                </li>
              );
            })}
          </ul>
          <Btn onClick={() => setView("sorted")} disabled={ticked.length < steps.length} className="mt-4 w-full">It is sorted</Btn>
        </>
      )}
      {view === "later" && (
        <div>
          <p className="font-serif text-[26px] leading-tight">Set down for now.</p>
          <p className="mt-2 text-[14.5px] text-[var(--poster-muted)]">Nothing is lost, and it will not nag you. It comes back when it matters.</p>
          <StartOver onClick={() => setView("card")} />
        </div>
      )}
      {view === "sorted" && (
        <div>
          <p className="font-serif text-[26px] leading-tight">Nothing needs you right now.</p>
          <p className="mt-2 flex items-center gap-2 text-[14.5px] text-[var(--poster-muted)]">
            <CheckCircle2 size={16} style={{ color: "var(--poster-accent)" }} aria-hidden /> Call the clinic about the referral is kept under Sorted.
          </p>
          <StartOver onClick={() => { setView("card"); setTicked([]); }} />
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------ Homeschooling Companion */

type Row = "idle" | "asking" | "done" | "hard" | "skipped";
function LearningDemo() {
  const [rows, setRows] = useState<Record<string, Row>>({});
  const subjects = [
    { id: "math", name: "Math", detail: "Abeka Grade 4, Unit 3, Lesson 12" },
    { id: "reading", name: "Reading", detail: "Chapter 6" },
  ];
  const set = (id: string, v: Row) => setRows((r) => ({ ...r, [id]: v }));
  return (
    <div className={`${SHELL} p-5`}>
      <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-[var(--poster-muted)]">Today</p>
      <p className="mt-1 font-serif text-[24px] leading-tight tracking-tight">What we are doing today.</p>
      <p className="mt-4 border-b border-[var(--poster-border)] pb-2 text-[13px] font-semibold uppercase tracking-[0.08em] text-[var(--poster-muted)]">Emma</p>
      {subjects.map((s) => {
        const r = rows[s.id] ?? "idle";
        return (
          <div key={s.id} className="border-b border-[var(--poster-border)] py-4">
            <div className="flex items-center gap-3">
              <button type="button" aria-label={`Mark ${s.name} done`} onClick={() => set(s.id, "asking")} disabled={r !== "idle"} className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 text-[11px] font-bold" style={r === "done" || r === "hard" ? { backgroundColor: "var(--poster-accent)", borderColor: "var(--poster-accent)", color: "var(--poster-accent-contrast)" } : { borderColor: "var(--poster-accent)", color: "var(--poster-accent)" }}>
                {r === "done" || r === "hard" ? <Check size={18} /> : "Done"}
              </button>
              <div className="min-w-0 flex-1">
                <p className="text-[16px] font-semibold">{s.name}</p>
                <p className="text-[13.5px] text-[var(--poster-muted)]">{s.detail}</p>
              </div>
              {r === "idle" && (
                <button type="button" onClick={() => set(s.id, "skipped")} className="text-[13px] font-semibold text-[var(--poster-muted)] hover:text-[var(--poster-text)]">
                  Did not get to it
                </button>
              )}
            </div>
            {r === "asking" && (
              <div className="mt-3 flex flex-wrap items-center gap-2 pl-[60px]">
                <span className="text-[13.5px] font-semibold">How did it go?</span>
                <Btn tone="quiet" onClick={() => set(s.id, "done")} className="min-h-9 px-3 text-[13.5px]">Went well</Btn>
                <Btn tone="quiet" onClick={() => set(s.id, "hard")} className="min-h-9 px-3 text-[13.5px]">Was hard</Btn>
                <Btn tone="quiet" onClick={() => set(s.id, "done")} className="min-h-9 px-3 text-[13.5px]">Skip</Btn>
              </div>
            )}
            {r === "hard" && <p className="mt-2 pl-[60px] text-[13.5px] text-[var(--poster-muted)]">Marked done. It comes back for another go next time.</p>}
            {r === "skipped" && <p className="mt-2 pl-[60px] text-[13.5px] text-[var(--poster-muted)]">Nothing is recorded for today.</p>}
          </div>
        );
      })}
      <p className="pt-4 text-[13.5px] text-[var(--poster-muted)]"><span className="font-semibold text-[var(--poster-text)]">Noah</span> · Nothing scheduled today.</p>
      {Object.keys(rows).length > 0 && <StartOver onClick={() => setRows({})} />}
    </div>
  );
}

/* ----------------------------------------------- Personal Life Affairs Companion */

function AffairsDemo() {
  const [view, setView] = useState<"card" | "ask" | "kept" | "skipped" | "later">("card");
  const [answer, setAnswer] = useState("");
  return (
    <div className={`${SHELL} p-6`}>
      <p className="text-[11.5px] font-bold uppercase tracking-[0.16em] text-[var(--poster-muted)]">Who decides, and who to call</p>
      {view === "card" && (
        <>
          <p className="mt-3 font-serif text-[28px] leading-[1.12] tracking-tight">Write down who should be called first.</p>
          <p className="mt-3 text-[14px] leading-relaxed text-[var(--poster-muted)]">Everything else assumes somebody knows to look. If nobody knows to call, nothing else on this list is ever found.</p>
          <p className="mt-4 border-t border-[var(--poster-border)] pt-3 text-[13.5px] text-[var(--poster-muted)]">Goes in your book as <span className="font-semibold text-[var(--poster-text)]">Who to contact first</span>. About 2 minutes.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Btn onClick={() => setView("ask")}>Start</Btn>
            <Btn tone="quiet" onClick={() => setView("skipped")}>Not relevant to me</Btn>
            <Btn tone="quiet" onClick={() => setView("later")}>Later</Btn>
          </div>
        </>
      )}
      {view === "ask" && (
        <>
          <p className="mt-3 font-serif text-[24px] leading-tight tracking-tight">If something happened to you, who should be called first?</p>
          <label htmlFor="who" className="mt-4 block text-[13.5px] font-semibold text-[var(--poster-muted)]">Their name and how to reach them</label>
          <input id="who" value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Sam, 555 010 0142" className="mt-1.5 h-12 w-full rounded-[var(--poster-radius)] border border-[var(--poster-border)] bg-transparent px-3.5 text-[16px] placeholder:text-[var(--poster-muted)]/60" />
          <Btn onClick={() => setView("kept")} disabled={answer.trim().length === 0} className="mt-3 w-full">Keep this</Btn>
        </>
      )}
      {view === "kept" && (
        <div className="mt-3">
          <p className="font-serif text-[24px] leading-tight">Kept.</p>
          <div className="mt-3 border border-[var(--poster-border)] px-4 py-3 text-[14.5px]">
            <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-[var(--poster-muted)]">In your book: Who to contact first</p>
            <p className="mt-1 font-semibold">{answer}</p>
          </div>
          <p className="mt-3 text-[13.5px] text-[var(--poster-muted)]">Next it asks where the important paperwork is kept.</p>
          <StartOver onClick={() => { setView("card"); setAnswer(""); }} />
        </div>
      )}
      {view === "skipped" && (
        <div className="mt-3">
          <p className="font-serif text-[24px] leading-tight">Skipped.</p>
          <p className="mt-2 text-[14.5px] text-[var(--poster-muted)]">It does not apply to you, so it is left out of your book and it will not ask again.</p>
          <StartOver onClick={() => setView("card")} />
        </div>
      )}
      {view === "later" && (
        <div className="mt-3">
          <p className="font-serif text-[24px] leading-tight">Later.</p>
          <p className="mt-2 text-[14.5px] text-[var(--poster-muted)]">It stays where it is, and nothing is marked as missed.</p>
          <StartOver onClick={() => setView("card")} />
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------- Travel Companion */

function TravelDemo() {
  const [changed, setChanged] = useState(false);
  const [handled, setHandled] = useState<string[]>([]);
  const dependents = [
    { id: "transfer", title: "Airport transfer", meta: "10:00, booked around the 09:05 flight" },
    { id: "checkin", title: "Hotel check-in", meta: "15:00, booked to follow the flight" },
  ];
  return (
    <div className={`${SHELL} p-5`}>
      <div className="flex items-baseline justify-between">
        <p className="font-serif text-[26px] leading-none tracking-tight">Osaka</p>
        <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-[var(--poster-muted)]">Trip day 1</p>
      </div>
      <div className="mt-4 rounded-[var(--poster-radius)] border border-[var(--poster-border)] px-4 py-3">
        <div className="flex items-center gap-3">
          <MapPin size={18} style={{ color: "var(--poster-accent)" }} aria-hidden />
          <div>
            <p className="text-[15px] font-semibold">Flight to Osaka</p>
            <p className="text-[13.5px] text-[var(--poster-muted)]">{changed ? "Now 11:40, was 09:05" : "09:05"}</p>
          </div>
        </div>
      </div>
      {!changed ? (
        <Btn onClick={() => setChanged(true)} className="mt-3 w-full">The flight changed</Btn>
      ) : (
        <div className="mt-4">
          <p className="text-[14px] font-semibold">This might affect these 2, unchanged so far:</p>
          <ul className="mt-2 flex flex-col gap-2">
            {dependents.map((d) => {
              const done = handled.includes(d.id);
              return (
                <li key={d.id} className="rounded-[var(--poster-radius)] border border-[var(--poster-border)] px-4 py-3">
                  <p className="text-[15px] font-semibold">{d.title}</p>
                  <p className="text-[13.5px] text-[var(--poster-muted)]">{d.meta}</p>
                  {done ? (
                    <p className="mt-2 flex items-center gap-1.5 text-[13.5px] font-semibold" style={{ color: "var(--poster-accent)" }}>
                      <CheckCircle2 size={15} aria-hidden /> Looked at
                    </p>
                  ) : (
                    <Btn tone="quiet" onClick={() => setHandled((h) => [...h, d.id])} className="mt-2 min-h-9 px-3.5 text-[13.5px]">Deal with what changed</Btn>
                  )}
                </li>
              );
            })}
          </ul>
          {handled.length === dependents.length && <p className="mt-3 text-[14px] text-[var(--poster-muted)]">Everything built on the flight has been looked at. Nothing was edited for you.</p>}
          <StartOver onClick={() => { setChanged(false); setHandled([]); }} />
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------- Vehicle Maintenance Companion */

function VehicleDemo({ hero }: { hero?: Hero }) {
  const [car, setCar] = useState<"civic" | "van">("civic");
  const [done, setDone] = useState(false);
  const cars = {
    civic: { plate: "7ABC123", name: "2018 Honda Civic", miles: 50_400 },
    van: { plate: "8XYZ456", name: "2016 Ford Transit", miles: 88_100 },
  } as const;
  const c = cars[car];
  const { digits, lead } = odometerDigits(c.miles);
  const due = car === "civic" && !done;
  return (
    <div className={`${SHELL} overflow-hidden font-[family-name:var(--font-space-mono)]`}>
      <div className="flex gap-2 border-b border-[var(--poster-border)] p-3">
        {(Object.keys(cars) as (keyof typeof cars)[]).map((k) => {
          const lit = k === "civic" && !done;
          return (
            <button key={k} type="button" aria-pressed={car === k} onClick={() => setCar(k)} className={`flex items-center gap-2 rounded-[2px] border px-3 py-2 text-[12.5px] font-bold tracking-[0.08em] ${car === k ? "border-[var(--poster-text)] bg-[var(--poster-text)] text-[var(--poster-surface)]" : "border-[var(--poster-border)]"}`}>
              <span aria-hidden className="h-2 w-2 rounded-full" style={lit ? { backgroundColor: "var(--poster-accent)" } : { border: "1.5px solid currentColor" }} />
              {cars[k].plate}
            </button>
          );
        })}
      </div>
      <div className="p-5" style={{ background: hero ? `linear-gradient(170deg, ${hero.from}, ${hero.mid} 55%, ${hero.to})` : undefined, color: hero?.ink }}>
        <div className="flex items-center justify-between text-[12px]">
          <span className="rounded-[2px] border border-white/30 bg-white/10 px-2 py-1 font-bold tracking-[0.14em]">{c.plate}</span>
          <span className="opacity-70">{c.name}</span>
        </div>
        <div className="mt-4 flex items-end gap-1" role="img" aria-label={`${c.miles.toLocaleString("en-US")} miles`}>
          {digits.map((d, i) => (
            <span key={i} aria-hidden className="flex h-10 w-6 items-center justify-center rounded-[2px] border border-white/10 bg-black/45 text-[21px] font-bold" style={{ opacity: i < lead ? 0.25 : 1 }}>{d}</span>
          ))}
          <span className="ml-2 pb-1 text-[11px] uppercase tracking-[0.14em] opacity-60">miles</span>
        </div>
        <div className="mt-4 flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.16em]">
          <span aria-hidden className="h-2.5 w-2.5 rounded-full" style={due ? { backgroundColor: "var(--poster-accent)", boxShadow: "0 0 0 4px color-mix(in srgb, var(--poster-accent) 35%, transparent)" } : { border: "1.5px solid currentColor", opacity: 0.6 }} />
          {due ? "Due" : "Nothing due"}
        </div>
        {due ? (
          <>
            <p className="mt-2 font-sans text-[22px] font-bold leading-tight tracking-[-0.02em]">Oil and filter change</p>
            <p className="mt-1.5 text-[12.5px] leading-relaxed opacity-80">500 miles past due, 42 days past due (every 5,000 miles, every 6 months)</p>
            <button type="button" onClick={() => setDone(true)} className="mt-4 rounded-[2px] px-4 py-2.5 font-sans text-[14px] font-semibold text-[var(--poster-accent-contrast)]" style={{ backgroundColor: "var(--poster-accent)" }}>
              I had this done
            </button>
          </>
        ) : (
          <p className="mt-2 font-sans text-[15px] leading-relaxed opacity-85">{car === "civic" ? "Next: oil and filter at 55,400 miles or in 6 months." : "Tire rotation in 2,100 miles."}</p>
        )}
      </div>
      {car === "civic" && done && (
        <div className="border-t border-[var(--poster-border)] p-4 text-[12.5px]">
          <p className="font-bold uppercase tracking-[0.14em] text-[var(--poster-muted)]">History</p>
          <p className="mt-1.5 font-semibold">Engine oil and filter change</p>
          <p className="text-[var(--poster-muted)]">Sep 21, 2026 · 50,400 mi</p>
          <button type="button" onClick={() => setDone(false)} className="mt-3 inline-flex items-center gap-1.5 font-sans text-[13px] font-semibold text-[var(--poster-muted)] hover:text-[var(--poster-text)]"><RotateCcw size={13} aria-hidden /> Start over</button>
        </div>
      )}
    </div>
  );
}

/* --------------------------------------------------------- Family Health Binder */

const AMINA: FamilyMember = { id: "m1", name: "Amina", relationship: "child", dateOfBirth: "2018-04-02", emergencyName: "Sam (dad)", emergencyPhone: "(555) 010-0142", insurer: "Acme Health", insuranceMemberId: "XYZ123456", insuranceGroup: null, caregiverNotes: null, medicationsCheckedOn: null, status: "active", createdAt: "2026-01-01T00:00:00Z", updatedAt: "2026-01-01T00:00:00Z" };
const fact = (id: string, kind: MedicalFact["kind"], detail: string, reaction: string | null, visibility: "summary" | "private"): MedicalFact => ({ id, familyMemberId: "m1", kind, detail, dosage: null, frequency: null, reaction, startedOn: null, stoppedOn: null, visibility, status: "active", createdAt: "2026-01-01T00:00:00Z", updatedAt: "2026-01-01T00:00:00Z" });

function HealthDemo() {
  const [priv, setPriv] = useState<string[]>([]);
  const items = [
    { id: "peanuts", detail: "Peanuts", reaction: "Hives" },
    { id: "penicillin", detail: "Penicillin", reaction: "Rash" },
    { id: "latex", detail: "Latex", reaction: null as string | null },
  ];
  const facts = items.map((i) => fact(i.id, "allergy", i.detail, i.reaction, priv.includes(i.id) ? "private" : "summary"));
  const sheet = buildFormsSheet(AMINA, facts, [], [], [], [], "2026-09-21");
  return (
    <div className={`${SHELL} p-5`}>
      <div className="flex items-center gap-3">
        <span aria-hidden className="flex h-11 w-11 items-center justify-center rounded-full text-[19px] font-semibold" style={{ backgroundColor: "var(--poster-soft)", color: "var(--poster-accent)" }}>A</span>
        <div>
          <p className="text-[18px] font-semibold leading-tight">Amina</p>
          <p className="text-[13.5px] text-[var(--poster-muted)]">Child · 8 years</p>
        </div>
      </div>
      <p className="mt-4 text-[13px] font-semibold text-[var(--poster-muted)]">Allergies. Mark one private to keep it off the printed page.</p>
      <ul className="mt-2 flex flex-col gap-2">
        {items.map((i) => {
          const isPrivate = priv.includes(i.id);
          return (
            <li key={i.id} className="flex items-center justify-between gap-3 rounded-[var(--poster-radius)] border border-[var(--poster-border)] px-3.5 py-2.5">
              <span className="flex items-center gap-2 text-[14.5px] font-semibold">
                <WarningCircle size={16} style={{ color: "var(--poster-accent)" }} aria-hidden /> {i.detail}
              </span>
              <button type="button" aria-pressed={isPrivate} onClick={() => setPriv((p) => (isPrivate ? p.filter((x) => x !== i.id) : [...p, i.id]))} className={`inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3 text-[13px] font-semibold ${isPrivate ? "border-transparent text-[var(--poster-accent-contrast)]" : "border-[var(--poster-border)] text-[var(--poster-muted)]"}`} style={isPrivate ? { backgroundColor: "var(--poster-accent)" } : undefined}>
                <Lock size={13} aria-hidden /> {isPrivate ? "Private" : "Keep private"}
              </button>
            </li>
          );
        })}
      </ul>
      <div className="mt-4 rounded-[var(--poster-radius)] border border-dashed border-[var(--poster-border)] p-3.5">
        <p className="text-[11.5px] font-bold uppercase tracking-[0.14em] text-[var(--poster-muted)]">The Forms sheet prints</p>
        <p className="mt-1.5 text-[14.5px]">
          <span className="font-semibold">Allergies: </span>
          {sheet.allergies.length > 0 ? sheet.allergies.map((a) => (a.detail ? `${a.label} (${a.detail})` : a.label)).join(", ") : "None recorded."}
        </p>
        <p className="mt-2 flex items-center gap-1.5 text-[13px] text-[var(--poster-muted)]">
          {sheet.hiddenCount > 0 ? `${sheet.hiddenCount === 1 ? "One record marked private is" : `${sheet.hiddenCount} records marked private are`} left off this page.` : "Nothing is marked private."}
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------------- */

const DEMOS: Record<string, (props: { hero?: Hero }) => ReactNode> = {
  "personal-finance-companion": MoneyDemo,
  "home-management-companion": HomeDemo,
  alongside: FocusDemo,
  "homeschooling-companion": LearningDemo,
  "personal-life-affairs-companion": AffairsDemo,
  "travel-companion": TravelDemo,
  "vehicle-maintenance-companion": VehicleDemo,
  "family-health-binder": HealthDemo,
};

export default function LiveDemo({ slug, hero }: { slug: string; hero?: Hero }) {
  const Demo = DEMOS[slug];
  return Demo ? <Demo hero={hero} /> : null;
}
