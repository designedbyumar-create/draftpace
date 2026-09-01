import { SERIES } from "@/content/guides";

/**
 * Visual identity for the guides layer: one accent and one bespoke mark
 * per life area.
 *
 * WHY THESE EXIST
 *
 * Before this, every area hub, every card and every article looked
 * identical. A reader could not tell a Home guide from an Affairs guide
 * without reading the words, and the index was six boxes of the same
 * colour. Colour and mark together give each area a recognisable shelf
 * position, which is the one job the taxonomy could not do on its own.
 *
 * WHY THEY ARE DRAWN HERE RATHER THAN DRAWN AS FILES
 *
 * Same discipline as the Shop's product visuals and how-it-works
 * mockups: hand-built in code, no raster assets, no second icon set
 * alongside Phosphor. Each mark is a small composition rather than a
 * pictogram, and each one draws the thing the area's Companion actually
 * does rather than a picture of its subject. The accent is
 * `currentColor`, so a mark takes the colour of whatever area context it
 * is rendered inside and needs no props to stay consistent.
 *
 * Every mark is decorative and is hidden from assistive technology. The
 * label beside it always carries the meaning.
 */

export interface AreaIdentity {
  /** CSS custom property holding the area accent. */
  accent: string;
  /** The same accent at surface strength, for tinted panels. */
  soft: string;
  Mark: (props: MarkProps) => React.ReactElement;
}

interface MarkProps {
  className?: string;
}

const STRUCTURE = "var(--border-strong)";

function frame(className?: string) {
  return {
    viewBox: "0 0 128 88",
    fill: "none",
    className,
    "aria-hidden": true as const,
    focusable: "false" as const,
  };
}

/**
 * Money: a ledger of committed amounts, with the one band that is
 * actually yours to spend picked out. That single highlighted band is
 * the product's whole output, so it is the thing the mark draws.
 */
function MoneyMark({ className }: MarkProps) {
  return (
    <svg {...frame(className)}>
      <g stroke={STRUCTURE} strokeWidth="2" strokeLinecap="round">
        <path d="M20 20h74" />
        <path d="M20 32h54" />
        <path d="M20 68h44" />
        <path d="M20 80h64" />
      </g>
      <rect x="20" y="42" width="66" height="16" rx="4" fill="currentColor" opacity="0.16" />
      <path d="M20 50h66" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path
        d="M96 42v16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path d="M92 42h4M92 58h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Home: a roofline over an interval rule. Four service dates are marked,
 * three passed and one arriving, because the product's claim is that it
 * works out what is due from real dates rather than nagging on a
 * schedule.
 */
function HomeMark({ className }: MarkProps) {
  return (
    <svg {...frame(className)}>
      <path
        d="M18 40 64 14l46 26"
        stroke={STRUCTURE}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M28 38v20M100 38v20" stroke={STRUCTURE} strokeWidth="2" strokeLinecap="round" />
      <path d="M18 70h92" stroke={STRUCTURE} strokeWidth="2" strokeLinecap="round" />
      <g stroke={STRUCTURE} strokeWidth="2" strokeLinecap="round">
        <path d="M32 70v-7M54 70v-7M76 70v-7" />
      </g>
      <path d="M98 70v-13" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <circle cx="98" cy="53" r="5" fill="currentColor" />
    </svg>
  );
}

/**
 * Mind and focus: one continuous line that stops and later resumes,
 * with the gap marked rather than hidden. Picking something back up
 * after a break is the area's actual subject, and the product records
 * nothing at all for the gap.
 */
function MindMark({ className }: MarkProps) {
  return (
    <svg {...frame(className)}>
      <path
        d="M16 62c10 0 14-30 24-30s13 22 22 22"
        stroke={STRUCTURE}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M82 54c10 0 12-26 22-26s8 20 8 20"
        stroke={STRUCTURE}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M62 54h20"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray="1 6"
      />
      <circle cx="62" cy="54" r="4.5" fill="currentColor" />
      <circle cx="82" cy="54" r="4.5" fill="currentColor" opacity="0.35" />
    </svg>
  );
}

/**
 * Family and learning: a stack of dated records built up over a year,
 * the front one carrying a check. The product's promise is a record
 * made as you go rather than reconstructed in March, so the mark is a
 * stack rather than a single sheet.
 */
function FamilyMark({ className }: MarkProps) {
  return (
    <svg {...frame(className)}>
      <rect x="30" y="14" width="72" height="52" rx="6" stroke={STRUCTURE} strokeWidth="2" />
      <rect x="24" y="20" width="72" height="52" rx="6" stroke={STRUCTURE} strokeWidth="2" fill="var(--surface)" />
      <rect
        x="18"
        y="26"
        width="72"
        height="52"
        rx="6"
        stroke="currentColor"
        strokeWidth="2"
        fill="var(--surface)"
      />
      <g stroke={STRUCTURE} strokeWidth="2" strokeLinecap="round">
        <path d="M30 42h34M30 52h44M30 62h24" />
      </g>
      <path
        d="M64 60l5 5 11-13"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Affairs and endings: a set of records where one is missing. The
 * dashed outline is the point of the area, since the product is a
 * register of what exists and where it is kept rather than a place to
 * put the documents themselves.
 */
function AffairsMark({ className }: MarkProps) {
  return (
    <svg {...frame(className)}>
      <rect x="16" y="24" width="42" height="52" rx="5" stroke={STRUCTURE} strokeWidth="2" />
      <rect x="46" y="18" width="42" height="58" rx="5" stroke={STRUCTURE} strokeWidth="2" fill="var(--surface)" />
      <g stroke={STRUCTURE} strokeWidth="2" strokeLinecap="round">
        <path d="M56 36h22M56 46h16" />
      </g>
      <rect
        x="80"
        y="26"
        width="32"
        height="44"
        rx="5"
        stroke="currentColor"
        strokeWidth="2"
        strokeDasharray="5 5"
        fill="var(--surface)"
      />
      <circle cx="96" cy="44" r="6" stroke="currentColor" strokeWidth="2.5" />
      <path d="M96 50v10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Travel: a route where the first stop has moved, drawn with the old
 * position still visible and the two downstream stops picked out. This
 * is the one behaviour on the whole shelf that a spreadsheet cannot do,
 * so it gets drawn literally.
 */
function TravelMark({ className }: MarkProps) {
  return (
    <svg {...frame(className)}>
      <path d="M20 62h88" stroke={STRUCTURE} strokeWidth="2" strokeLinecap="round" />
      <circle cx="20" cy="62" r="5" stroke={STRUCTURE} strokeWidth="2" fill="var(--surface)" opacity="0.6" />
      <path
        d="M20 62C20 40 30 30 44 30"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="4 5"
      />
      <circle cx="44" cy="30" r="6" fill="currentColor" />
      <path d="M50 34l14 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="66" cy="62" r="6" fill="currentColor" opacity="0.45" />
      <circle cx="96" cy="62" r="6" fill="currentColor" opacity="0.28" />
      <circle cx="112" cy="62" r="3.5" stroke={STRUCTURE} strokeWidth="2" />
    </svg>
  );
}

/**
 * The Series tier: six shelf positions, one per area, held in one frame.
 * The mark for the pieces that argue for the category rather than for a
 * single part of it.
 */
function SeriesMark({ className }: MarkProps) {
  const cells: [number, number, number][] = [
    [22, 20, 1],
    [54, 20, 0.7],
    [86, 20, 0.45],
    [22, 52, 0.45],
    [54, 52, 0.7],
    [86, 52, 1],
  ];
  return (
    <svg {...frame(className)}>
      <rect x="12" y="12" width="104" height="64" rx="8" stroke={STRUCTURE} strokeWidth="2" />
      {cells.map(([x, y, opacity], i) => (
        <rect
          key={i}
          x={x}
          y={y}
          width="20"
          height="16"
          rx="3"
          fill="currentColor"
          opacity={opacity * 0.55}
        />
      ))}
    </svg>
  );
}

const MARKS: Record<string, (props: MarkProps) => React.ReactElement> = {
  money: MoneyMark,
  home: HomeMark,
  "mind-and-focus": MindMark,
  "family-and-learning": FamilyMark,
  "affairs-and-endings": AffairsMark,
  travel: TravelMark,
  [SERIES]: SeriesMark,
};

/**
 * Identity for one area slug, or for the Series sentinel.
 *
 * Falls back to the brand accent and the Series mark for anything
 * unknown, so a guide filed under a slug with no identity yet still
 * renders rather than crashing a route.
 */
export function areaIdentity(slug: string | null | undefined): AreaIdentity {
  const key = slug && MARKS[slug] ? slug : SERIES;
  return {
    accent: `var(--area-${key})`,
    soft: `var(--area-${key}-soft)`,
    Mark: MARKS[key],
  };
}

/**
 * The CSS variables an area context sets on itself. Everything below an
 * element carrying these can then reference `var(--area)` without
 * knowing which area it is in, which is what keeps the block renderers
 * free of any area branching.
 */
export function areaVars(slug: string | null | undefined): React.CSSProperties {
  const { accent, soft } = areaIdentity(slug);
  return { "--area": accent, "--area-soft": soft } as React.CSSProperties;
}
