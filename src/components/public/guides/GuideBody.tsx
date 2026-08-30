import Link from "next/link";
import type { GuideBlock } from "@/content/guides";

/**
 * Renders a guide's typed blocks.
 *
 * The only markup permitted inside a paragraph is [text](/href), parsed
 * below. Everything else is plain text, which is what keeps arbitrary
 * HTML out of content and keeps the no-exclamation-mark and no-em-dash
 * rules checkable by a test rather than by review.
 */

const LINK = /\[([^\]]+)\]\(([^)]+)\)/g;

/** Splits a paragraph into text and links. Unmatched brackets stay literal. */
export function renderInline(text: string, keyPrefix: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  // A fresh regex per call: the g flag makes lastIndex stateful, and a
  // shared instance would skip matches on every second paragraph.
  const pattern = new RegExp(LINK.source, "g");

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) nodes.push(text.slice(lastIndex, match.index));
    const [, label, href] = match;
    nodes.push(
      <Link key={`${keyPrefix}-${match.index}`} href={href} className="font-medium text-[var(--primary)] hover:underline">
        {label}
      </Link>
    );
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
  return nodes;
}

function Heading({ children }: { children: string }) {
  return <h2 className="mt-10 text-[19px] font-semibold leading-snug text-[var(--text)]">{children}</h2>;
}

export default function GuideBody({ blocks }: { blocks: GuideBlock[] }) {
  return (
    <div className="mt-8 flex flex-col gap-1">
      {blocks.map((block, i) => {
        if (block.kind === "paragraphs") {
          return (
            <section key={i}>
              {block.heading && <Heading>{block.heading}</Heading>}
              {block.paragraphs.map((paragraph, j) => (
                <p key={j} className="mt-4 text-[16px] leading-[1.75] text-[var(--text)]">
                  {renderInline(paragraph, `p-${i}-${j}`)}
                </p>
              ))}
            </section>
          );
        }

        if (block.kind === "list") {
          const ListTag = block.ordered ? "ol" : "ul";
          return (
            <section key={i}>
              {block.heading && <Heading>{block.heading}</Heading>}
              {block.intro && (
                <p className="mt-4 text-[16px] leading-[1.75] text-[var(--text)]">{renderInline(block.intro, `li-${i}`)}</p>
              )}
              <ListTag
                className={`mt-4 flex list-outside flex-col gap-2.5 pl-5 text-[16px] leading-[1.7] text-[var(--text)] ${
                  block.ordered ? "list-decimal" : "list-disc"
                }`}
              >
                {block.items.map((item, j) => (
                  <li key={j} className="pl-1 marker:text-[var(--faint)]">
                    {renderInline(item, `l-${i}-${j}`)}
                  </li>
                ))}
              </ListTag>
            </section>
          );
        }

        if (block.kind === "table") {
          return (
            <section key={i}>
              {block.heading && <Heading>{block.heading}</Heading>}
              {block.intro && (
                <p className="mt-4 text-[16px] leading-[1.75] text-[var(--text)]">{renderInline(block.intro, `ti-${i}`)}</p>
              )}
              {/* Wide reference tables scroll inside their own container so
                  the article body never scrolls sideways on a phone. */}
              <div className="mt-5 overflow-x-auto rounded-[var(--radius-lg)] border border-[var(--border)]">
                <table className="w-full min-w-[480px] border-collapse text-[14px]">
                  <thead>
                    <tr>
                      {block.columns.map((column) => (
                        <th
                          key={column}
                          scope="col"
                          className="border-b border-[var(--border)] bg-[var(--surface-muted)] px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--muted)]"
                        >
                          {column}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {block.rows.map((row, r) => (
                      <tr key={r}>
                        {row.map((cell, c) => (
                          <td
                            key={c}
                            className="border-b border-[var(--border)] px-4 py-2.5 align-top text-[var(--text)] last:border-r-0"
                          >
                            {renderInline(cell, `t-${i}-${r}-${c}`)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          );
        }

        return (
          <aside
            key={i}
            className="mt-8 rounded-[var(--radius-lg)] border-l-2 border-[var(--primary)] bg-[var(--surface-muted)] px-5 py-4"
          >
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--primary)]">{block.label}</p>
            <p className="mt-2 text-[15px] leading-relaxed text-[var(--text)]">{renderInline(block.body, `c-${i}`)}</p>
          </aside>
        );
      })}
    </div>
  );
}
