"use client";

import type { ReactNode, RefObject } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import Button from "@/design-system/Button";
import { CalendarCheck, CheckCircle2, ChevronRight, Clock, Plus, WarningCircle } from "@/design-system/Icon";
import { entranceVariant, settleVariant, staggerContainer, staggerItem } from "@/design-system/motion";
import FirstRunTour from "@/components/platform/FirstRunTour";
import type { TourStep } from "@/components/platform/GuidedTour";
import { HOME_MANAGEMENT_COMPANION_SLUG } from "../setupStateData";
import { itemHref, type AttentionItem, type HomeState } from "../attention";
import { HOME_ITEM_TYPE_BY_ID } from "../homeKnowledge";
import type { HomeItem } from "../state";
import CategoryIcon from "./shared/CategoryIcon";

/**
 * The Home Line: one plain sentence about the house, a strip that shows
 * which parts of it have anything to say, and rows made like the tags you
 * would tie to a thing. Presentational only; every action, sheet and write
 * stays in HomeModule and arrives here as ReactNode.
 *
 * The strip carries no numbers. The product's voice never puts a count on
 * the screen ("a couple", "a few", "several" in the headline, reassurance
 * rather than a statistic for everything else), so the strip says which
 * parts are speaking, not how loudly.
 */

const CARD = "overflow-hidden rounded-[22px] border border-[var(--border)] bg-[var(--surface)]";
const CARD_SHADOW = "shadow-[0_1px_2px_rgba(28,25,20,0.04),0_14px_28px_-22px_rgba(28,25,20,0.2)]";

export function HomeHeader({ headline, size = "text-[30px] sm:text-[34px]" }: { headline: string; size?: string }) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div initial="hidden" animate="visible" variants={entranceVariant(Boolean(reduceMotion))}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--primary)]">Your home</p>
      <h1
        className={`mt-2 font-medium leading-[1.12] tracking-[-0.015em] text-[var(--text)] ${size}`}
        style={{ fontFamily: "var(--product-narrative-font)", textWrap: "balance" }}
      >
        {headline}
      </h1>
    </motion.div>
  );
}

const STRIP: { id: string; label: string; tone: string; Icon: typeof Clock }[] = [
  { id: "band-wrong", label: "Wrong", tone: "var(--warning)", Icon: WarningCircle },
  { id: "band-care", label: "To care for", tone: "var(--primary)", Icon: CalendarCheck },
  { id: "band-coming", label: "Coming up", tone: "var(--muted)", Icon: Clock },
  { id: "band-handled", label: "Handled", tone: "var(--success)", Icon: CheckCircle2 },
];

/**
 * A quiet row of jump links, one per part of the page that has anything to
 * say. Deliberately small and unnumbered: it is a way to skip to a section,
 * not the point of the screen, and the product's voice never puts a count on
 * it. Parts with nothing in them stay visible but faint.
 */
function StateStrip({ lit }: { lit: boolean[] }) {
  return (
    <nav aria-label="Jump to a part of your home" className="-mx-1 flex justify-between gap-0.5 overflow-x-auto px-1 pb-0.5">
      {STRIP.map((cell, i) => {
        const on = lit[i];
        const body = (
          <>
            <cell.Icon size={14} aria-hidden />
            {cell.label}
          </>
        );
        const base = "flex h-9 shrink-0 items-center gap-1 rounded-full px-2 text-[12px] transition-colors";
        return on ? (
          <a
            key={cell.id}
            href={`#${cell.id}`}
            className={`${base} font-semibold text-[var(--text)] hover:bg-[var(--surface-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]`}
            style={{ background: `color-mix(in srgb, ${cell.tone} 12%, transparent)` }}
          >
            <span style={{ color: cell.tone }} className="flex items-center gap-1">
              {body}
            </span>
          </a>
        ) : (
          <span key={cell.id} aria-hidden className={`${base} font-medium text-[var(--faint)]`}>
            {body}
          </span>
        );
      })}
    </nav>
  );
}

/** A real section of the page, so it is marked up as one and can be reached by heading. */
function Band({ id, label, children }: { id: string; label: string; children: ReactNode }) {
  return (
    <section id={id} aria-label={label} className="scroll-mt-6">
      <div className="flex items-center gap-3">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">{label}</h2>
        <span aria-hidden className="h-px flex-1 bg-[var(--border)]" />
      </div>
      <div className="mt-3 flex flex-col gap-2.5">{children}</div>
    </section>
  );
}

/** The tag: a plain card with an eyelet, cut a little more on the side it would hang from. */
function TagRow({
  item,
  actions,
  onOpen,
  tone = "plain",
}: {
  item: AttentionItem;
  actions?: ReactNode;
  onOpen?: () => void;
  tone?: "plain" | "warning";
}) {
  const reduceMotion = useReducedMotion();
  const warning = tone === "warning";
  const body = (
    <>
      <h3 className="text-[15.5px] font-semibold leading-snug tracking-[-0.005em] text-[var(--text)]">{item.title}</h3>
      <p className="mt-0.5 text-[13px] leading-[1.45] text-[var(--muted)]">{item.detail}</p>
    </>
  );
  return (
    <motion.div
      variants={staggerItem(Boolean(reduceMotion))}
      className={`relative rounded-l-[8px] rounded-r-[20px] border py-3.5 pl-[52px] pr-4 ${CARD_SHADOW} ${
        warning
          ? "border-[color-mix(in_srgb,var(--warning)_38%,transparent)] bg-[var(--warning-soft)]"
          : "border-[var(--border)] bg-[var(--surface)]"
      }`}
    >
      {/* The eyelet. The page shows through it. */}
      <span
        aria-hidden
        className={`absolute left-[18px] top-[19px] h-[14px] w-[14px] rounded-full border-[1.5px] bg-[var(--app-bg)] shadow-[inset_0_1px_1px_rgba(28,25,20,0.14)] ${
          warning ? "border-[var(--warning)]" : "border-[var(--border-strong)]"
        }`}
      />
      <div className="min-w-0">
        {warning && (
          <p className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--warning)]">
            <WarningCircle size={13} aria-hidden />
            Needs a look
          </p>
        )}
        {item.href ? (
          <Link href={item.href} className="block">
            {body}
          </Link>
        ) : onOpen ? (
          <button type="button" onClick={onOpen} className="block w-full text-left">
            {body}
          </button>
        ) : (
          body
        )}
      </div>
      {actions && <div className="mt-3 flex flex-wrap items-center gap-2">{actions}</div>}
    </motion.div>
  );
}

function QuietRow({
  title,
  detail,
  href,
  icon,
  justSettled = false,
  tour,
}: {
  title: string;
  detail: string;
  href: string | null;
  icon: ReactNode;
  /** True for the one row created by a care action or a resolved problem, so it gets the one-time settle beat rather than replaying on every visit. */
  justSettled?: boolean;
  tour?: { steps: TourStep[] };
}) {
  const reduceMotion = useReducedMotion();
  const row = (
    <>
      <span
        aria-hidden
        className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--surface-muted)]"
      >
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <h3 className="text-[14.5px] font-semibold leading-snug text-[var(--text)]">{title}</h3>
        <p className="mt-0.5 text-[12.5px] leading-[1.4] text-[var(--muted)]">{detail}</p>
      </div>
      {href && <ChevronRight size={15} aria-hidden className="mt-2 shrink-0 text-[var(--faint)]" />}
    </>
  );
  const className = "flex items-start gap-3 border-b border-[var(--border)] px-4 py-3 last:border-b-0";
  const inner = href ? (
    <Link href={href} className={`${className} transition-colors hover:bg-[var(--surface-muted)]`}>
      {row}
    </Link>
  ) : (
    <div className={className}>{row}</div>
  );
  if (!justSettled) return <li>{inner}</li>;
  return (
    <motion.li initial="hidden" animate="visible" variants={settleVariant(Boolean(reduceMotion))}>
      {tour && <FirstRunTour slug={HOME_MANAGEMENT_COMPANION_SLUG} steps={tour.steps} />}
      {inner}
    </motion.li>
  );
}

function describeItem(item: HomeItem): string {
  const type = HOME_ITEM_TYPE_BY_ID[item.type]?.label;
  return [type, item.brand, item.location].filter(Boolean).join(" · ") || "In your home";
}

export interface HomeViewProps {
  home: HomeState;
  headline: string;
  headlineSize: string;
  gap: string;
  /** The care rows to show now, already limited. */
  care: AttentionItem[];
  hiddenCare: number;
  closingLine: string | null;
  activeItems: HomeItem[];
  justHandledId: string | null;
  tour: { steps: TourStep[] };
  /** Actions for a row, built by the module because they write. */
  actionsFor: (item: AttentionItem, tone: "warning" | "plain") => ReactNode;
  onOpenCare: (item: AttentionItem) => (() => void) | undefined;
  onShowAllCare: () => void;
  onReport: () => void;
  onAdd: () => void;
  addRef: RefObject<HTMLDivElement | null>;
  bandLimit: number;
}

export default function HomeView({
  home,
  headline,
  headlineSize,
  gap,
  care,
  hiddenCare,
  closingLine,
  activeItems,
  justHandledId,
  tour,
  actionsFor,
  onOpenCare,
  onShowAllCare,
  onReport,
  onAdd,
  addRef,
  bandLimit,
}: HomeViewProps) {
  const reduceMotion = useReducedMotion();
  const lit = [
    home.somethingWrong.length > 0,
    home.worthTakingCareOf.length > 0,
    home.comingUp.length > 0,
    home.recentlyHandled.length > 0,
  ];
  const stagger = staggerContainer(Boolean(reduceMotion));

  return (
    <div className={`flex flex-col ${gap} pb-8 lg:pb-0`}>
      <div className="flex flex-col gap-5">
        <div className="flex items-start justify-between gap-4">
          <HomeHeader headline={headline} size={headlineSize} />
          <Button size="sm" variant="secondary" className="mt-1 shrink-0" onClick={onReport}>
            Something&apos;s wrong
          </Button>
        </div>
        <StateStrip lit={lit} />
      </div>

      {home.somethingWrong.length > 0 && (
        <Band id="band-wrong" label="Something's wrong">
          <motion.div className="flex flex-col gap-2.5" initial="hidden" animate="visible" variants={stagger}>
            {home.somethingWrong.map((item) => (
              <TagRow key={item.id} item={item} tone="warning" actions={actionsFor(item, "warning")} />
            ))}
          </motion.div>
        </Band>
      )}

      {care.length > 0 && (
        <Band id="band-care" label="Worth taking care of">
          <motion.div className="flex flex-col gap-2.5" initial="hidden" animate="visible" variants={stagger}>
            {care.map((item) => (
              <TagRow key={item.id} item={item} onOpen={onOpenCare(item)} actions={actionsFor(item, "plain")} />
            ))}
          </motion.div>
          {hiddenCare > 0 && (
            <button
              type="button"
              onClick={onShowAllCare}
              className="-ml-1 self-start rounded-full px-3 py-2 text-[12.5px] font-semibold text-[var(--muted)] transition-colors hover:bg-[var(--surface-muted)] hover:text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
            >
              {hiddenCare} more, when you get to {hiddenCare === 1 ? "it" : "them"}
            </button>
          )}
        </Band>
      )}

      {home.comingUp.length > 0 && (
        <Band id="band-coming" label="Coming up">
          <ul className={`${CARD} ${CARD_SHADOW}`}>
            {home.comingUp.slice(0, bandLimit).map((item) => (
              <QuietRow
                key={item.id}
                title={item.title}
                detail={item.detail}
                href={item.href}
                icon={<Clock size={15} aria-hidden className="text-[var(--muted)]" />}
              />
            ))}
          </ul>
        </Band>
      )}

      {home.recentlyHandled.length > 0 && (
        <Band id="band-handled" label="Recently handled">
          <ul className={`${CARD} ${CARD_SHADOW}`}>
            {home.recentlyHandled.slice(0, 3).map((entry) => (
              <QuietRow
                key={entry.id}
                title={entry.title}
                detail={entry.when}
                href={null}
                icon={<CheckCircle2 size={16} aria-hidden className="text-[var(--success)]" />}
                justSettled={entry.id === justHandledId}
                tour={tour}
              />
            ))}
          </ul>
        </Band>
      )}

      {/* Deliberately not a green box with a tick. A settled home is the
          normal state, not an achievement, and congratulating somebody for
          it is the first step toward keeping score. Just a plain sentence,
          in the product's own voice. */}
      {closingLine && (
        <p
          className="text-[17px] leading-relaxed text-[var(--muted)]"
          style={{ fontFamily: "var(--product-narrative-font)" }}
        >
          {closingLine}
        </p>
      )}

      <section aria-label="In your home">
        <div className="flex items-center gap-3">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">In your home</h2>
          <span aria-hidden className="h-px flex-1 bg-[var(--border)]" />
          <div ref={addRef} className="hidden lg:block">
            <Button size="sm" variant="secondary" iconLeft={<Plus size={14} aria-hidden />} onClick={onAdd}>
              Add something
            </Button>
          </div>
        </div>
        {activeItems.length === 0 ? (
          <p className="mt-3 text-[13px] text-[var(--muted)]">Nothing in your home yet.</p>
        ) : (
          <ul className={`mt-3 ${CARD} ${CARD_SHADOW}`}>
            {activeItems.map((item) => (
              <li key={item.id}>
                <Link
                  href={itemHref(item.id)}
                  className="flex items-center gap-3 border-b border-[var(--border)] px-4 py-3 transition-colors duration-[var(--dur)] ease-[var(--ease-out)] hover:bg-[var(--surface-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--focus-ring)] [li:last-child_&]:border-b-0"
                >
                  <CategoryIcon type={item.type} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14px] font-semibold text-[var(--text)]">{item.name}</p>
                    <p className="mt-0.5 truncate text-[12.5px] text-[var(--muted)]">{describeItem(item)}</p>
                  </div>
                  <ChevronRight size={15} aria-hidden className="shrink-0 text-[var(--faint)]" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Floating, not pinned: the phone's own bottom bar owns the bottom edge. */}
      <button
        type="button"
        onClick={onAdd}
        aria-label="Add something"
        className="fixed right-4 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--primary)] text-[var(--primary-contrast)] shadow-[0_10px_24px_-8px_color-mix(in_srgb,var(--primary)_70%,transparent),0_2px_6px_rgba(28,25,20,0.18)] transition-transform hover:scale-[1.04] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 lg:hidden"
        style={{ bottom: "calc(env(safe-area-inset-bottom) + 72px)" }}
      >
        <Plus size={22} aria-hidden />
      </button>
    </div>
  );
}
