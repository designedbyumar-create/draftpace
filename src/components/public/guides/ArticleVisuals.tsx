import { ArrowRight, BookOpen, CalendarCheck, Download, FirstAidKit, MessageCircle, RotateCcw, Wallet } from "@/design-system/Icon";
import s from "./ArticleVisuals.module.css";

export function AppointmentSheetVisual() {
  return <figure className={s.visual} data-article-visual="appointment-sheet" aria-label="A preview of the blank appointment preparation sheet">
    <div className={s.sheet}>
      <header><span className={s.eyebrow}>The page you bring with you</span><h3>Your appointment,<br />on one page.</h3><span className={s.dateLine}>Appointment date __________________</span></header>
      <dl className={s.fields}>{[
        ["01", "The question that comes first", "What do you most need help with today?"],
        ["02", "What changed", "When it started. How often. What helped."],
        ["03", "What you take", "Current medicines, supplements, allergies and reactions."],
        ["04", "What we agreed", "The next step. Results. Who to contact."],
      ].map(([number, label, help]) => <div key={number}><dt><span>{number}</span>{label}</dt><dd><span>{help}</span><div className={s.writingLine} /><div className={s.writingLine} /></dd></div>)}</dl>
      <a className={s.sheetLink} href="/guides/print/doctor-appointment.html"><Download size={18} aria-hidden />Open the free blank sheet<ArrowRight size={17} aria-hidden /></a>
    </div>
  </figure>;
}

export function AppointmentKitVisual() {
  const items = [
    { Icon: MessageCircle, title: "Your questions", note: "The important one marked. Space for answers." },
    { Icon: FirstAidKit, title: "Your current list", note: "Medicines, supplements, allergies and reactions." },
    { Icon: Wallet, title: "Clinic paperwork", note: "ID, insurance or referral if requested." },
    { Icon: BookOpen, title: "A way to take notes", note: "Paper or a phone note you can find quickly." },
  ];
  return <figure className={s.visual} data-article-visual="appointment-kit" aria-label="Four useful things to bring to a doctor visit"><div className={s.kit}>
    <header><h3>Bring what helps<br />the conversation.</h3><span>Start with your clinic's instructions.</span></header>
    <ul>{items.map(({ Icon, title, note }) => <li key={title}><Icon size={36} aria-hidden /><div><strong>{title}</strong><span>{note}</span></div></li>)}</ul>
  </div></figure>;
}

export function LearningRhythmVisual() {
  return <figure className={s.visual} data-article-visual="learning-rhythm" aria-label="A four-day learning rhythm keeps steady practice, rotates longer work and gives the open day a clear purpose"><div className={s.rhythm}>
    <header><h3>Make room.<br />Do not lose the thread.</h3><span>A weekly rhythm has three different jobs.</span></header>
    <ol>{[
      { Icon: RotateCcw, title: "Keep coming back", detail: "Protect the practice your child and curriculum need." },
      { Icon: BookOpen, title: "Let longer work rotate", detail: "Give projects, experiments and writing enough space." },
      { Icon: CalendarCheck, title: "Give the spare day one job", detail: "Co-op, appointments, a project or rest. Not all at once." },
    ].map(({ Icon, title, detail }, i) => <li key={title}><span className={s.rhythmNumber}>0{i + 1}</span><Icon size={36} aria-hidden /><strong>{title}</strong><span>{detail}</span></li>)}</ol>
    <div className={s.arithmetic}><strong>4 × 36 = 144</strong><span>Planned teaching days, not automatically 180.<br />Check lesson coverage and local requirements separately.</span></div>
  </div></figure>;
}

export function LearningRecordVisual() {
  return <figure className={s.visual} data-article-visual="learning-record" aria-label="A worked example distinguishes planned work, actual learning activity and what needs another try"><div className={s.record}>
    <header><span className={s.eyebrow}>A small record, filled in</span><h3>A tick says finished.<br />A note says what happened.</h3><span>Example: equivalent fractions</span></header>
    <dl>{[
      ["Plan", "What we meant to cover", "Explore why two quarters equal one half."],
      ["Record", "What actually happened", "Folded paper strips and compared the pieces."],
      ["Revisit", "What needs another try", "Explain the relationship without folding a new strip."],
    ].map(([label, meaning, example]) => <div key={label}><dt>{label}<span>{meaning}</span></dt><dd>{example}</dd></div>)}</dl>
    <a className={s.sheetLink} href="/guides/print/four-day-homeschool.html"><Download size={18} aria-hidden />Use the blank week worksheet<ArrowRight size={17} aria-hidden /></a>
  </div></figure>;
}
