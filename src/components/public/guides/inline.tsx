import Link from "next/link";

/**
 * The one piece of markup permitted inside guide content: [text](/href).
 *
 * It lives in its own module rather than inside GuideBody because the
 * interactive block renderers are client components and need it too.
 * Everything else in a guide is plain text, which is what keeps the
 * no-em-dash and no-exclamation-mark rules checkable by a test rather
 * than by review.
 */

const LINK = /\[([^\]]+)\]\(([^)]+)\)/g;

/** Splits a string into text and links. Unmatched brackets stay literal. */
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
      <Link
        key={`${keyPrefix}-${match.index}`}
        href={href}
        className="font-medium text-[var(--area,var(--primary))] underline decoration-[var(--area,var(--primary))]/30 underline-offset-[3px] transition-colors hover:decoration-[var(--area,var(--primary))]"
      >
        {label}
      </Link>
    );
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
  return nodes;
}
