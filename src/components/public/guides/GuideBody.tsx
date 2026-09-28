import type { GuideBlock } from "@/content/guides";
import { blockHeading, guideHeadings } from "@/content/guideHeadings";
import { renderInline } from "./inline";
import CheckableList from "./blocks/CheckableList";
import ReferenceTable from "./blocks/ReferenceTable";
import Timeline from "./blocks/Timeline";
import CompareBlock from "./blocks/CompareBlock";
import ScriptPicker from "./blocks/ScriptPicker";
import Faq from "./blocks/Faq";
import Figure from "./blocks/Figure";

/**
 * Renders a guide's typed blocks.
 *
 * This stays a server component and hands only the genuinely
 * interactive kinds to client components, so an article of plain
 * paragraphs still ships no JavaScript for its body. Tables, checkable
 * lists, timelines and comparisons are the four that need it.
 *
 * Headings carry ids from the shared helper rather than from anything
 * computed here, because the contents panel links to them.
 */

function Heading({ id, first, children }: { id: string; first?: boolean; children: string }) {
  return (
    <h2
      id={id}
      className={[
        "scroll-mt-24 text-heading-sm font-semibold text-[var(--text)]",
        first ? "mt-0" : "mt-16",
      ].join(" ")}
    >
      {children}
    </h2>
  );
}

export default function GuideBody({ blocks }: { blocks: GuideBlock[] }) {
  // Walked in the same order as the contents panel, so the nth heading
  // here is the nth entry there.
  const headings = guideHeadings(blocks);
  let headingIndex = 0;

  return (
    <div className="mt-10 flex flex-col gap-1">
      {blocks.map((block, i) => {
        const hasHeading = Boolean(blockHeading(block));
        const isFirstHeading = hasHeading && headingIndex === 0;
        const heading = hasHeading ? headings[headingIndex++] : undefined;

        if (block.kind === "faq") {
          return (
            <section key={i} className="mb-2">
              {heading && <Heading id={heading.id} first={isFirstHeading}>{heading.text}</Heading>}
              <Faq items={block.items} idPrefix={`f${i}`} />
            </section>
          );
        }

        if (block.kind === "figure") {
          return (
            <Figure
              key={i}
              src={block.src}
              alt={block.alt}
              caption={block.caption}
              width={block.width}
              height={block.height}
              layout={block.layout}
            />
          );
        }

        if (block.kind === "paragraphs") {
          return (
            <section key={i} className="mb-2">
              {heading && <Heading id={heading.id} first={isFirstHeading}>{heading.text}</Heading>}
              {block.paragraphs.map((paragraph, j) => (
                <p key={j} className="mt-4 text-body-lg text-[var(--text)]">
                  {renderInline(paragraph, `p-${i}-${j}`)}
                </p>
              ))}
            </section>
          );
        }

        if (block.kind === "list") {
          return (
            <section key={i} className="mb-2">
              {heading && <Heading id={heading.id} first={isFirstHeading}>{heading.text}</Heading>}
              {block.intro && (
                <p className="mt-4 text-body-lg text-[var(--text)]">
                  {renderInline(block.intro, `li-${i}`)}
                </p>
              )}

              {block.checkable ? (
                <CheckableList items={block.items} idPrefix={`b${i}`} />
              ) : (
                <ListMarkup ordered={block.ordered} items={block.items} index={i} />
              )}
            </section>
          );
        }

        if (block.kind === "table") {
          return (
            <section key={i} className="mb-2">
              {heading && <Heading id={heading.id} first={isFirstHeading}>{heading.text}</Heading>}
              {block.intro && (
                <p className="mt-4 text-body-lg text-[var(--text)]">
                  {renderInline(block.intro, `ti-${i}`)}
                </p>
              )}
              <ReferenceTable columns={block.columns} rows={block.rows} idPrefix={`b${i}`} />
            </section>
          );
        }

        if (block.kind === "timeline") {
          return (
            <section key={i} className="mb-2">
              {heading && <Heading id={heading.id} first={isFirstHeading}>{heading.text}</Heading>}
              {block.intro && (
                <p className="mt-4 text-body-lg text-[var(--text)]">
                  {renderInline(block.intro, `tli-${i}`)}
                </p>
              )}
              <Timeline steps={block.steps} idPrefix={`b${i}`} />
            </section>
          );
        }

        if (block.kind === "compare") {
          return (
            <section key={i} className="mb-2">
              {heading && <Heading id={heading.id} first={isFirstHeading}>{heading.text}</Heading>}
              {block.intro && (
                <p className="mt-4 text-body-lg text-[var(--text)]">
                  {renderInline(block.intro, `ci-${i}`)}
                </p>
              )}
              <CompareBlock left={block.left} right={block.right} idPrefix={`b${i}`} />
            </section>
          );
        }

        if (block.kind === "scripts") {
          return (
            <section key={i} className="mb-2">
              {heading && <Heading id={heading.id} first={isFirstHeading}>{heading.text}</Heading>}
              {block.intro && (
                <p className="mt-4 text-body-lg text-[var(--text)]">
                  {renderInline(block.intro, `si-${i}`)}
                </p>
              )}
              <ScriptPicker items={block.items} />
            </section>
          );
        }

        if (block.kind !== "callout") return null;

        return (
          <aside
            key={i}
            className="mt-9 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--area-soft,var(--surface-muted))] px-5 py-4"
          >
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--area,var(--primary))]">
              {block.label}
            </p>
            <p className="mt-2 text-[15px] leading-relaxed text-[var(--text)]">
              {renderInline(block.body, `c-${i}`)}
            </p>
          </aside>
        );
      })}
    </div>
  );
}

/** A plain list. Markers take the area accent so lists sit in the same world as everything else. */
function ListMarkup({
  ordered,
  items,
  index,
}: {
  ordered?: boolean;
  items: string[];
  index: number;
}) {
  const ListTag = ordered ? "ol" : "ul";
  return (
    <ListTag
      className={`mt-4 flex list-outside flex-col gap-3 pl-5 text-body-lg text-[var(--text)] ${
        ordered ? "list-decimal" : "list-disc"
      }`}
    >
      {items.map((item, j) => (
        <li key={j} className="pl-1.5 marker:font-semibold marker:text-[var(--area,var(--primary))]">
          {renderInline(item, `l-${index}-${j}`)}
        </li>
      ))}
    </ListTag>
  );
}
