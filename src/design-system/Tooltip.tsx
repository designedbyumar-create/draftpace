"use client";

import { Children, cloneElement, isValidElement, useId, useState, type ReactElement } from "react";

/**
 * A minimal hover/focus label for an icon-only control. CSS-driven, no
 * positioning library: the tooltip is always centered above its trigger,
 * which is all any current use case needs. Keyboard-reachable
 * (focus-visible shows it too, not just mouse hover), and the trigger
 * itself carries aria-describedby so it's announced, not just visible on
 * hover.
 */
export default function Tooltip({ label, children }: { label: string; children: ReactElement }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const child = Children.only(children);

  const trigger = isValidElement(child)
    ? cloneElement(child as ReactElement<{ "aria-describedby"?: string }>, { "aria-describedby": id })
    : child;

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      {trigger}
      <span
        role="tooltip"
        id={id}
        className={`pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-[var(--text)] px-2.5 py-1.5 text-[11px] font-medium text-[var(--bg)] shadow-[shadow:var(--shadow-soft)] transition-[opacity,transform] duration-[var(--dur-fast)] ease-[var(--ease-out)] ${
          open ? "translate-y-0 opacity-100" : "translate-y-0.5 opacity-0"
        }`}
      >
        {label}
      </span>
    </span>
  );
}
