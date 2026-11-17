import type { GuideBlock } from "@/content/guides";
import type { ArticleDiagram, LibraryInfo } from "@/content/revisions/library";
import { headingId } from "@/content/guideHeadings";
import { ArrowRight, BookOpen, CalendarCheck, Check, ListChecks, MessageCircle, WarningCircle } from "@/design-system/Icon";
import GuideBody from "./GuideBody";
import { renderInline } from "./inline";
import { FieldnoteChecklist, FieldnoteScripts } from "./LibraryArticleTools";
import s from "./LibraryArticleExperience.module.css";

function Heading({ text }: { text?: string }) { return text ? <h2 className={s.heading} id={headingId(text)}>{text}</h2> : null; }

export function LibraryDiagram({ diagram }: { diagram: ArticleDiagram }) {
  const icons = [BookOpen, ListChecks, MessageCircle, CalendarCheck];
  return <figure className={`${s.diagram} ${s[diagram.kind]}`} data-library-visual={diagram.src} aria-label={diagram.alt}>
    <header><span>{diagram.kicker}</span><h3>{diagram.title}</h3></header>
    <ol>{diagram.steps.map((step, i) => { const Icon = icons[i]; return <li key={step.label}>
      <div className={s.diagramMarker}>{diagram.kind === "timeline" || diagram.kind === "sequence" ? <span>0{i + 1}</span> : <Icon size={27} aria-hidden />}</div><div><strong>{step.label}</strong><p>{step.detail}</p></div>
      {diagram.kind === "sequence" && i < diagram.steps.length - 1 && <ArrowRight size={18} aria-hidden className={s.connector} />}
    </li>; })}</ol>
    {diagram.caption && <figcaption>{diagram.caption}</figcaption>}
  </figure>;
}

export default function LibraryArticleExperience({ blocks, info }: { blocks: GuideBlock[]; info: LibraryInfo }) {
  return <div className={s.experience}>{blocks.map((block, i) => {
    if (block.kind === "figure") {
      const diagram = info.diagrams.find((v) => v.src === block.src);
      return diagram ? <LibraryDiagram key={i} diagram={diagram} /> : null;
    }
    if (block.kind === "list") return <section className={s.section} key={i}><Heading text={block.heading} />{block.intro && <p>{renderInline(block.intro, `intro-${i}`)}</p>}{block.checkable ? <FieldnoteChecklist items={block.items} /> : <ol className={s.actions}>{block.items.map((item, j) => <li key={item}><span className={s.number}>{block.ordered ? String(j + 1).padStart(2, "0") : <Check size={17} aria-hidden />}</span><p>{renderInline(item, `action-${i}-${j}`)}</p></li>)}</ol>}</section>;
    if (block.kind === "scripts") return <section className={s.section} key={i}><Heading text={block.heading} />{block.intro && <p>{block.intro}</p>}<FieldnoteScripts items={block.items} /></section>;
    if (block.kind === "timeline") return <section className={s.section} key={i}><Heading text={block.heading} />{block.intro && <p>{block.intro}</p>}<ol className={s.timeline}>{block.steps.map((step, j) => <li key={step.when}><span className={s.number}>{String(j+1).padStart(2,"0")}</span><div><strong>{step.when}</strong><p>{renderInline(step.what, `when-${i}-${j}`)}</p></div></li>)}</ol></section>;
    if (block.kind === "compare") return <section className={s.section} key={i}><Heading text={block.heading} />{block.intro && <p>{block.intro}</p>}<div className={s.comparison}>{[block.left,block.right].map((side,j)=><div key={side.label}><header><span>0{j+1}</span><h3>{side.label}</h3></header><ul>{side.items.map((item,k)=><li key={item}>{renderInline(item, `side-${i}-${j}-${k}`)}</li>)}</ul></div>)}</div></section>;
    if (block.kind === "table") return <section className={s.section} key={i}><Heading text={block.heading} />{block.intro && <p className={s.tableIntro}>{block.intro}</p>}<div className={s.table}><table><caption className="sr-only">{block.heading || "Reference details"}</caption><thead><tr>{block.columns.map(c=><th key={c} scope="col">{c}</th>)}</tr></thead><tbody>{block.rows.map((row,j)=><tr key={j}>{row.map((cell,k)=>k===0?<th scope="row" key={k}>{renderInline(cell,`cell-${i}-${j}-${k}`)}</th>:<td data-label={block.columns[k]} key={k}>{renderInline(cell,`cell-${i}-${j}-${k}`)}</td>)}</tr>)}</tbody></table></div></section>;
    if (block.kind === "callout") return <aside key={i} className={s.caution}><WarningCircle size={25} aria-hidden /><div><strong>{block.label}</strong><p>{renderInline(block.body, `warning-${i}`)}</p></div></aside>;
    return <div key={i} className={s.prose}><GuideBody blocks={[block]} /></div>;
  })}</div>;
}
