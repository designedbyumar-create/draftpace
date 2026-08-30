import type { GuideBlock } from "@/content/guides";
import { guideHeadings } from "@/content/guideHeadings";
import { renderInline } from "./inline";
import CheckableList from "./blocks/CheckableList";
import ReferenceTable from "./blocks/ReferenceTable";
import Timeline from "./blocks/Timeline";
import CompareBlock from "./blocks/CompareBlock";
import ScriptPicker from "./blocks/ScriptPicker";

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

function Heading({ id, children }: { id: string; children: string }) {
  return (
    <h2
      id={id}
      className="mt-11 scroll-mt-24 text-[20px] font-semibold leading-snug tracking-[-0.01em] text-[var(--text)] first:mt-0"
    >
      {/* The rule is the area accent, which is the only place an area
          colour appears inside body copy. */}
      <span aria-hidden className="mb-3 block h-[3px] w-8 rounded-full bg-[var(--area,var(--primary))]" />
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
        const heading =
          block.kind !== "callout" && block.heading ? headings[headingIndex++] : undefined;

        if (block.kind === "paragraphs") {
          return (
            <section key={i} className="mb-2">
              {heading && <Heading id={heading.id}>{heading.text}</Heading>}
              {block.paragraphs.map((paragraph, j) => (
                <p key={j} className="mt-4 text-[16.5px] leading-[1.75] text-[var(--text)]">
                  {renderInline(paragraph, `p-${i}-${j}`)}
                </p>
              ))}
            </section>
          );
        }

        if (block.kind === "list") {
          return (
            <section key={i} className="mb-2">
              {heading && <Heading id={heading.id}>{heading.text}</Heading>}
              {block.intro && (
                <p className="mt-4 text-[16.5px] leading-[1.75] text-[var(--text)]">
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
              {heading && <Heading id={heading.id}>{heading.text}</Heading>}
              {block.intro && (
                <p className="mt-4 text-[16.5px] leading-[1.75] text-[var(--text)]">
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
              {heading && <Heading id={heading.id}>{heading.text}</Heading>}
              {block.intro && (
                <p className="mt-4 text-[16.5px] leading-[1.75] text-[var(--text)]">
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
              {heading && <Heading id={heading.id}>{heading.text}</Heading>}
              {block.intro && (
                <p className="mt-4 text-[16.5px] leading-[1.75] text-[var(--text)]">
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
              {heading && <Heading id={heading.id}>{heading.text}</Heading>}
              {block.intro && (
                <p className="mt-4 text-[16.5px] leading-[1.75] text-[var(--text)]">
                  {renderInline(block.intro, `si-${i}`)}
                </p>
              )}
              <ScriptPicker items={block.items} />
            </section>
          );
        }

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
      className={`mt-4 flex list-outside flex-col gap-3 pl-5 text-[16.5px] leading-[1.7] text-[var(--text)] ${
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
