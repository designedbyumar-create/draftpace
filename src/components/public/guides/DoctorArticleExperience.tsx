"use client";

import { useId, useState } from "react";
import type { GuideBlock } from "@/content/guides";
import { headingId } from "@/content/guideHeadings";
import { ArrowRight, BookOpen, CalendarCheck, Check, Clock, Download, FirstAidKit, ListChecks, MessageCircle, RotateCcw, User, Desktop, ChevronRight } from "@/design-system/Icon";
import GuideBody from "./GuideBody";
import { AppointmentSheetVisual, AppointmentKitVisual } from "./ArticleVisuals";
import { renderInline } from "./inline";
import s from "./DoctorArticleExperience.module.css";

type ListBlock = Extract<GuideBlock, { kind: "list" }>;
const stepIcons = [MessageCircle, FirstAidKit, User, CalendarCheck];
const prepLabels = ["The concern that comes first", "A list that is current", "Allergies, not guesses", "Changes, with dates"];
const packLabels = ["Your questions", "Medicines & allergies", "Relevant records", "Clinic paperwork", "Small practical things", "Someone in your corner"];

function Heading({ children, label }: { children: string; label: string }) {
  return <header className={s.sectionHead}><span>{label}</span><h2 id={headingId(children)}>{children}</h2></header>;
}

function Checklist({ block, packing = false }: { block: ListBlock; packing?: boolean }) {
  const [checked, setChecked] = useState<number[]>([]);
  const id = useId();
  return <section className={s.section}>
    <Heading label={packing ? "02 / Pack the useful things" : "01 / The five-minute version"}>{block.heading!}</Heading>
    {packing && <AppointmentKitVisual />}
    <div className={s.checkToolbar}><div><ListChecks size={22} aria-hidden /><strong>{packing ? "The appointment bag" : "Four things to put on paper"}</strong></div><span aria-live="polite">{checked.length} / {block.items.length} ready</span></div>
    <progress className={s.progress} value={checked.length} max={block.items.length} aria-label={packing ? "Packing checklist progress" : "Preparation checklist progress"} />
    <ul className={s.checklist}>{block.items.map((item, i) => {
      const Icon = stepIcons[i % stepIcons.length];
      return <li key={item} data-complete={checked.includes(i)}><label htmlFor={`${id}-${i}`}>
        <input id={`${id}-${i}`} type="checkbox" checked={checked.includes(i)} onChange={() => setChecked((previous) => previous.includes(i) ? previous.filter((n) => n !== i) : [...previous, i])} />
        <Icon size={26} aria-hidden className={s.itemIcon} /><span><strong>{(packing ? packLabels : prepLabels)[i]}</strong><span>{renderInline(item, `${id}-text-${i}`)}</span></span>
      </label></li>;
    })}</ul>
    <div className={s.checkFooter}><span>Ticks last for this visit only. Nothing is saved.</span><button type="button" onClick={() => setChecked([])} disabled={!checked.length} aria-label={packing ? "Reset packing checklist" : "Reset preparation checklist"} title="Reset checklist"><RotateCcw size={18} aria-hidden /></button></div>
  </section>;
}

function Conversation({ block }: { block: Extract<GuideBlock, { kind: "scripts" }> }) {
  const [selected, setSelected] = useState(0);
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);
  const id = useId();
  async function copy() {
    try { await navigator.clipboard.writeText(block.items[selected].line); setCopied(true); setFailed(false); }
    catch { setFailed(true); }
  }
  return <section className={s.section}><Heading label="03 / Make room for your question">{block.heading!}</Heading>
    <div className={s.conversation}>
      <div className={s.situations} role="tablist" aria-label="Choose your conversation" aria-orientation="vertical">{block.items.map((item, i) => <button key={item.situation} role="tab" type="button" id={`${id}-tab-${i}`} aria-controls={`${id}-panel-${i}`} aria-selected={selected === i} tabIndex={selected === i ? 0 : -1} onClick={() => { setSelected(i); setCopied(false); setFailed(false); }} onKeyDown={(event) => {
        const next = event.key === "ArrowDown" ? (i + 1) % block.items.length : event.key === "ArrowUp" ? (i - 1 + block.items.length) % block.items.length : event.key === "Home" ? 0 : event.key === "End" ? block.items.length - 1 : undefined;
        if (next === undefined) return;
        event.preventDefault(); setSelected(next); setCopied(false); setFailed(false); document.getElementById(`${id}-tab-${next}`)?.focus();
      }}><span>0{i + 1}</span>{item.situation}<ChevronRight size={17} aria-hidden /></button>)}</div>
      <div className={s.spoken}>{block.items.map((item, i) => <div key={item.situation} role="tabpanel" id={`${id}-panel-${i}`} aria-labelledby={`${id}-tab-${i}`} hidden={selected !== i} tabIndex={0}><MessageCircle size={30} aria-hidden /><p className={s.smallLabel}>You could say</p><blockquote>{item.line}</blockquote></div>)}
        <button type="button" onClick={copy}><span aria-hidden>{copied ? <Check size={17} /> : <BookOpen size={17} />}</span>{copied ? "Copied" : "Copy these words"}</button><span role="status">{failed ? "Copy unavailable. Select the words above to copy them." : copied ? "Ready to paste into your notes." : ""}</span>
      </div>
    </div>
  </section>;
}

function Example({ block }: { block: Extract<GuideBlock, { kind: "table" }> }) {
  return <section className={s.section}><Heading label="04 / What this looks like filled in">{block.heading!}</Heading><p className={s.intro}>{block.intro}</p><div className={s.noteSheet}><div className={s.noteTop}><BookOpen size={25} aria-hidden /><span>MY APPOINTMENT NOTES</span><strong>Invented example</strong></div><dl>{block.rows.map(([title, detail], i) => <div key={title}><dt><span>0{i + 1}</span>{title}</dt><dd>{detail}</dd></div>)}</dl><a href="/guides/print/doctor-appointment.html"><Download size={18} aria-hidden />Start with a blank copy<ArrowRight size={17} aria-hidden /></a></div></section>;
}

function Variants({ block }: { block: Extract<GuideBlock, { kind: "compare" }> }) {
  const entries = [
    { title: "A new doctor", Icon: User, text: block.left.items[0] },
    { title: "Your child's appointment", Icon: FirstAidKit, text: block.left.items[1] },
    { title: "A video visit", Icon: Desktop, text: block.right.items[0] },
    { title: "Helping a relative", Icon: BookOpen, text: block.right.items[1] },
  ];
  return <section className={s.section}><Heading label="05 / Same preparation, different circumstances">{block.heading!}</Heading><div className={s.variants}>{entries.map(({ title, text, Icon }, i) => <details key={title} open={i === 0}><summary><Icon size={26} aria-hidden /><span>{title}</span><ChevronRight size={19} aria-hidden /></summary><p>{renderInline(text, `visit-${i}`)}</p></details>)}</div></section>;
}

function Departure({ block }: { block: ListBlock }) {
  const labels = ["The next action", "The result plan", "The contact route"];
  const icons = [ListChecks, CalendarCheck, MessageCircle];
  return <section className={s.section}><Heading label="06 / Before the door closes">{block.heading!}</Heading><div className={s.departure}><div className={s.departureTitle}><Check size={25} aria-hidden /><strong>Leave with these three things clear.</strong></div><ol>{block.items.map((item, i) => { const Icon = icons[i]; return <li key={item}><span className={s.routeIcon}><Icon size={25} aria-hidden /></span><div><strong>{labels[i]}</strong><p>{renderInline(item, `departure-${i}`)}</p></div></li>; })}</ol></div></section>;
}

export default function DoctorArticleExperience({ blocks }: { blocks: GuideBlock[] }) {
  const first = blocks.find((b): b is ListBlock => b.kind === "list");
  const talk = blocks.find((b) => b.kind === "scripts");
  const leave = blocks.find((b): b is ListBlock => b.kind === "list" && !b.checkable);
  return <div className={s.experience}>
    <nav className={s.stages} aria-label="Appointment stages">{[
      { name: "Before", detail: "Prepare & pack", Icon: Clock, heading: first?.heading },
      { name: "In the room", detail: "Ask & understand", Icon: MessageCircle, heading: talk?.heading },
      { name: "Before you leave", detail: "Know what is next", Icon: CalendarCheck, heading: leave?.heading },
    ].map(({ name, detail, Icon, heading }, i) => <a href={`#${headingId(heading ?? name)}`} key={name}><span className={s.stageNumber}>0{i + 1}</span><Icon size={24} aria-hidden /><strong>{name}<span>{detail}</span></strong><ArrowRight size={16} aria-hidden /></a>)}</nav>
    {blocks.map((block, i) => {
      if (block.kind === "figure") return <AppointmentSheetVisual key={i} />;
      if (block.kind === "list" && block.checkable) return <Checklist key={i} block={block} packing={block !== first} />;
      if (block.kind === "scripts") return <Conversation key={i} block={block} />;
      if (block.kind === "table") return <Example key={i} block={block} />;
      if (block.kind === "compare") return <Variants key={i} block={block} />;
      if (block.kind === "list") return <Departure key={i} block={block} />;
      return <div className={s.prose} key={i}><GuideBody blocks={[block]} /></div>;
    })}
  </div>;
}
