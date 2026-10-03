"use client";

import {
  Children,
  cloneElement,
  isValidElement,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactElement,
} from "react";
import { createPortal } from "react-dom";

const VIEWPORT_MARGIN = 8;

/**
 * A minimal hover/focus label for an icon-only control. Portaled to
 * document.body and positioned from the wrapping span's own bounding
 * rect, not CSS `absolute` relative to its parent: the collapsed
 * sidebar's `<aside>` carries `overflow-hidden` (needed so labels don't
 * visibly spill out while its width animates on collapse/expand) and its
 * nav region carries `overflow-y-auto` for genuine scrolling, and either
 * one clips a same-subtree absolutely-positioned tooltip instead of
 * letting it float above the page. Measuring the trigger and rendering
 * the tooltip as a portal sidesteps both, the same way MobileSheet
 * already escapes its own container.
 *
 * Centered-by-default, then nudged back inside the viewport once its own
 * width is known: the collapsed sidebar sits flush against the left
 * edge, so a longer label centered on a ~44px-wide icon routinely wants
 * to render partway off-screen.
 */
export default function Tooltip({ label, children }: { label: string; children: ReactElement }) {
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState<{ top: number; center: number } | null>(null);
  const [left, setLeft] = useState<number | null>(null);
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<HTMLSpanElement>(null);
  const id = useId();
  const child = Children.only(children);

  const show = () => {
    const rect = wrapperRef.current?.getBoundingClientRect();
    if (rect) setAnchor({ top: rect.top, center: rect.left + rect.width / 2 });
    setOpen(true);
  };
  const hide = () => {
    setOpen(false);
    setLeft(null);
  };

  // Runs after the tooltip has rendered at its natural (centered) width,
  // so this can clamp the real rect rather than guess at one.
  useLayoutEffect(() => {
    if (!anchor || !tooltipRef.current) return;
    const width = tooltipRef.current.getBoundingClientRect().width;
    const ideal = anchor.center - width / 2;
    const max = window.innerWidth - width - VIEWPORT_MARGIN;
    setLeft(Math.min(Math.max(ideal, VIEWPORT_MARGIN), Math.max(max, VIEWPORT_MARGIN)));
  }, [anchor]);

  const trigger = isValidElement(child)
    ? cloneElement(child as ReactElement<{ "aria-describedby"?: string }>, { "aria-describedby": id })
    : child;

  return (
    <span ref={wrapperRef} className="inline-flex" onMouseEnter={show} onMouseLeave={hide} onFocus={show} onBlur={hide}>
      {trigger}
      {anchor &&
        createPortal(
          <span
            ref={tooltipRef}
            role="tooltip"
            id={id}
            style={{
              top: anchor.top - 8,
              left: left ?? anchor.center,
              // Until the real width is measured, fall back to centering
              // via transform so the tooltip doesn't flash at the left
              // edge for one frame.
              transform: `translate(${left === null ? "-50%" : "0"}, ${open ? "-100%" : "calc(-100% + 3px)"})`,
            }}
            className={`pointer-events-none fixed z-50 whitespace-nowrap rounded-md bg-[var(--text)] px-2.5 py-1.5 text-[11px] font-medium text-[var(--bg)] shadow-[shadow:var(--shadow-soft)] transition-[opacity,transform] duration-[var(--dur-fast)] ease-[var(--ease-out)] ${
              open ? "opacity-100" : "opacity-0"
            }`}
          >
            {label}
          </span>,
          document.body
        )}
    </span>
  );
}
