import type { GuideBlock } from "./guides";

/**
 * Every authored string inside a block.
 *
 * The voice guards (no em dash, no exclamation mark) and the inline-link
 * check both need to walk a block's text, and both used to do it with
 * their own inline switch. That worked while there were four kinds and
 * would have quietly stopped covering content the moment a fifth was
 * added: an unhandled kind falls through and its text is simply never
 * checked, so the guard passes by not looking.
 *
 * The default branch below assigns to `never`, so adding a block kind
 * without extending this fails typecheck rather than silently narrowing
 * what the test suite inspects.
 */
export function blockStrings(block: GuideBlock): string[] {
  switch (block.kind) {
    case "paragraphs":
      return [block.heading ?? "", ...block.paragraphs];
    case "list":
      return [block.heading ?? "", block.intro ?? "", ...block.items];
    case "table":
      return [block.heading ?? "", block.intro ?? "", ...block.columns, ...block.rows.flat()];
    case "timeline":
      return [
        block.heading ?? "",
        block.intro ?? "",
        ...block.steps.flatMap((step) => [step.when, step.what]),
      ];
    case "compare":
      return [
        block.heading ?? "",
        block.intro ?? "",
        block.left.label,
        block.right.label,
        ...block.left.items,
        ...block.right.items,
      ];
    case "scripts":
      return [
        block.heading ?? "",
        block.intro ?? "",
        ...block.items.flatMap((item) => [item.situation, item.line]),
      ];
    case "callout":
      return [block.label, block.body];
    default: {
      const exhaustive: never = block;
      return exhaustive;
    }
  }
}

/**
 * Only the strings a reader could follow a link out of. Headings, column
 * labels and other chrome are excluded, since inline links are a body
 * copy affordance rather than a heading one.
 */
export function blockBodyStrings(block: GuideBlock): string[] {
  switch (block.kind) {
    case "paragraphs":
      return block.paragraphs;
    case "list":
      return [block.intro ?? "", ...block.items];
    case "table":
      return [block.intro ?? "", ...block.rows.flat()];
    case "timeline":
      return [block.intro ?? "", ...block.steps.map((step) => step.what)];
    case "compare":
      return [block.intro ?? "", ...block.left.items, ...block.right.items];
    case "scripts":
      return [block.intro ?? "", ...block.items.map((item) => item.line)];
    case "callout":
      return [block.body];
    default: {
      const exhaustive: never = block;
      return exhaustive;
    }
  }
}
