/**
 * TextLink's class construction, deliberately in its own module with no
 * "use client" on it — the same reason buttonStyles.ts is split from
 * Button.tsx: a Server Component may render a Client Component but may
 * not call a function exported from one, and GuidesExplorer.tsx needs
 * this exact class on a plain client-side <button> (it clears search
 * state, it isn't a link at all), not on <TextLink>.
 *
 * One shape, deliberately, not a variant system. Twenty-two files each
 * hand-rolled their own version of "plain inline link, sometimes with a
 * trailing arrow" before this, each with its own font size, weight and
 * gap. A `variant` prop would just reinvent that fragmentation.
 *
 * Colour comes from `--area` falling back to `--primary`: inside a guide
 * page `--area` is set by areaVars(), inside a themed product shell it's
 * unset and `--primary` is already that product's own accent, and
 * everywhere else both fall through to the platform teal. No prop for
 * this; a literal accent (the Shop pages, outside any themed shell)
 * overrides it with an ordinary `style` prop, same as Button already
 * allows.
 */
export function textLinkClassName({ className }: { className?: string } = {}) {
  return [
    "group inline-flex items-center gap-1.5 text-body-sm font-semibold text-[var(--area,var(--primary))]",
    "underline-offset-2 transition-colors hover:underline rounded-sm",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]",
    className,
  ]
    .filter(Boolean)
    .join(" ");
}
