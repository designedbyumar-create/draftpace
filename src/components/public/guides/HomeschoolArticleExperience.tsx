"use client";

import { useId, useState } from "react";
import type { GuideBlock } from "@/content/guides";
import { headingId } from "@/content/guideHeadings";
import { BookOpen, CalendarCheck, Check, Download, ArrowRight, ChevronRight, ListChecks, RotateCcw } from "@/design-system/Icon";
import GuideBody from "./GuideBody";
import { LearningRhythmVisual, LearningRecordVisual } from "./ArticleVisuals";
import { renderInline } from "./inline";
import s from "./HomeschoolArticleExperience.module.css";

function Title({ heading, label }: { heading: string; label: string }) {
  return <header className={s.sectionHead}><span>{label}</span><h2 id={headingId(heading)}>{heading}</h2></header>;
}

export function lessonCapacity(lessons: number, weeks: number, sessions: number) {
  const slots = weeks * sessions;
  return { slots, remaining: Math.max(0, lessons - slots), perWeek: lessons / weeks, weeksNeeded: Math.ceil(lessons / sessions) };
}

function WeekPlanner({ block }: { block: Extract<GuideBlock, { kind: "table" }> }) {
  const [pattern, setPattern] = useState(0);
  const id = useId();
  const patterns = [
    { title: "Friday open", detail: "Four days, then a longer gap", open: 4 },
    { title: "Wednesday open", detail: "Breathing room in the middle", open: 2 },
    { title: "Monday open", detail: "Start around an outside commitment", open: 0 },
  ];
  let teaching = 0;
  return <section className={s.section}><Title heading={block.heading!} label="01 / Build the shape of your week" /><p>{block.intro}</p>
    <fieldset className={s.patterns}><legend>Which day needs to stay open?</legend>{patterns.map((entry, i) => <label key={entry.title} data-selected={pattern === i}><input name={id} type="radio" value={i} checked={pattern === i} onChange={() => setPattern(i)} /><span><strong>{entry.title}</strong><span>{entry.detail}</span></span></label>)}</fieldset>
    <p className={s.exampleLabel}><CalendarCheck size={18} aria-hidden />Sample rhythm, not prescribed hours</p>
    <ol className={s.week} aria-label={`${patterns[pattern].title} sample week`}>{["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((day, i) => {
      const open = i === patterns[pattern].open;
      const row = open ? undefined : block.rows[teaching++];
      return <li key={day} data-open={open}><header><strong>{day}</strong><span>{open ? "Open on purpose" : row?.[0]}</span></header>{open ? <div className={s.openDay}><BookOpen size={28} aria-hidden /><strong>Leave room.</strong><p>Co-op, a project, appointments or rest. Choose the job; do not give this day all of them.</p></div> : <><div className={s.practice}><span>Steady practice</span><p>{row?.[1]}</p></div><div className={s.project}><span>Longer block</span><p>{row?.[2]}</p></div></>}</li>;
    })}</ol><div className={s.toolFooter}><span>This selection changes the example, not your saved schedule.</span><a href="/guides/print/four-day-homeschool.html"><Download size={17} aria-hidden />Print a blank week</a></div>
  </section>;
}

function CoverageCalculator({ block }: { block: Extract<GuideBlock, { kind: "table" }> }) {
  const [lessons, setLessons] = useState("180");
  const [weeks, setWeeks] = useState("36");
  const [sessions, setSessions] = useState("4");
  const id = useId();
  const l = Number(lessons), w = Number(weeks), n = Number(sessions);
  const valid = lessons !== "" && weeks !== "" && sessions !== "" && Number.isInteger(l) && Number.isInteger(w) && Number.isInteger(n) && l >= 1 && l <= 2000 && w >= 1 && w <= 52 && n >= 1 && n <= 4;
  const result = valid ? lessonCapacity(l, w, n) : undefined;
  return <section className={s.section}><Title heading={block.heading!} label="02 / Count before you commit" /><p>{block.intro}</p>
    <div className={s.calculator}><div className={s.calcHeading}><ListChecks size={24} aria-hidden /><div><strong>Does this subject fit?</strong><span>Start with one lesson per session.</span></div><button type="button" aria-label="Reset lesson calculator" title="Reset to the worked example" onClick={() => { setLessons("180"); setWeeks("36"); setSessions("4"); }}><RotateCcw size={19} aria-hidden /></button></div>
      <div className={s.inputs}>{[
        { name: "Lessons remaining", value: lessons, change: setLessons, min: 1, max: 2000 },
        { name: "Teaching weeks", value: weeks, change: setWeeks, min: 1, max: 52 },
        { name: "Sessions per week", value: sessions, change: setSessions, min: 1, max: 4 },
      ].map((entry, i) => <label key={entry.name} htmlFor={`${id}-${i}`}><span>{entry.name}</span><input id={`${id}-${i}`} type="number" inputMode="numeric" min={entry.min} max={entry.max} step="1" value={entry.value} onChange={(event) => entry.change(event.target.value)} aria-invalid={!valid} /></label>)}</div>
      <div className={s.results} aria-live="polite">{result ? <><div><span>One-lesson sessions available</span><strong>{result.slots}</strong><span>{w} weeks × {n} sessions</span></div><div><span>{result.remaining ? "Lessons still to place" : "Unplaced lessons"}</span><strong>{result.remaining}</strong><span>{result.remaining ? "The calendar needs a decision." : "The count fits at this pace."}</span></div><p>{result.remaining ? `To cover ${l} lessons, plan an average of ${Number(result.perWeek.toFixed(2))} lessons per week, or ${result.weeksNeeded} teaching weeks at ${n} lessons a week. Check that lesson lengths and workload make this practical.` : "A balanced count is a starting point. It does not show whether the child has understood the material."}</p></> : <p>Use whole numbers: 1–2,000 lessons, 1–52 teaching weeks and 1–4 weekly sessions. Empty or invalid values are not calculated.</p>}</div>
      <p className={s.mathNote}><CalendarCheck size={20} aria-hidden />{valid ? `Separately: four teaching days × ${w} weeks = ${w * 4} planned days.` : "Planned teaching days are a separate calculation."} This is not an attendance record or a legal compliance result.</p>
    </div>
    <details className={s.worked}><summary>See the original 180-lesson worked example<ChevronRight size={18} aria-hidden /></summary><dl>{block.rows.map(([question, answer]) => <div key={question}><dt>{question}</dt><dd>{answer}</dd></div>)}</dl></details>
  </section>;
}

function TroubleRoutes({ block }: { block: Extract<GuideBlock, { kind: "scripts" }> }) {
  return <section className={s.section}><Title heading={block.heading!} label="03 / Change the plan, not the whole week" /><div className={s.routes}>{block.items.map((item, i) => <details key={item.situation} open={i === 0}><summary><span>0{i + 1}</span><strong>{item.situation}</strong><ChevronRight size={19} aria-hidden /></summary><p>{item.line}</p></details>)}</div></section>;
}

function LaunchChecks({ block }: { block: Extract<GuideBlock, { kind: "list" }> }) {
  const [done, setDone] = useState<number[]>([]);
  return <section className={s.section}><Title heading={block.heading!} label="Start with four decisions" /><ul className={s.checks}>{block.items.map((item, i) => <li key={item}><label><input type="checkbox" checked={done.includes(i)} onChange={() => setDone((old) => old.includes(i) ? old.filter((n) => n !== i) : [...old, i])} /><span>{renderInline(item, `launch-${i}`)}</span></label></li>)}</ul><p className={s.checkStatus} aria-live="polite">{done.length} / {block.items.length} checked · Ticks last for this visit only.</p></section>;
}

function RecordLoop({ block }: { block: Extract<GuideBlock, { kind: "list" }> }) {
  const icons = [CalendarCheck, Check, RotateCcw];
  return <section className={s.section}><Title heading={block.heading!} label="04 / Keep the evidence small" /><ol className={s.record}>{block.items.map((item, i) => { const Icon = icons[i]; return <li key={item}><Icon size={28} aria-hidden /><p>{renderInline(item, `record-${i}`)}</p>{i < 2 && <ArrowRight size={17} aria-hidden />}</li>; })}</ol></section>;
}

export default function HomeschoolArticleExperience({ blocks }: { blocks: GuideBlock[] }) {
  return <div className={s.experience}>{blocks.map((block, i) => {
    if (block.kind === "figure") return block.src.includes("record") ? <LearningRecordVisual key={i} /> : <LearningRhythmVisual key={i} />;
    if (block.kind === "table") return i === blocks.findIndex((b) => b.kind === "table") ? <WeekPlanner key={i} block={block} /> : <CoverageCalculator key={i} block={block} />;
    if (block.kind === "scripts") return <TroubleRoutes key={i} block={block} />;
    if (block.kind === "list") return block.checkable ? <LaunchChecks key={i} block={block} /> : <RecordLoop key={i} block={block} />;
    return <div key={i} className={s.prose}><GuideBody blocks={[block]} /></div>;
  })}</div>;
}
