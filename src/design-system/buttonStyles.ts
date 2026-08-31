/**
 * The button's class construction, deliberately in its own module with
 * no "use client" on it.
 *
 * Button.tsx is a client component, and a Server Component may render a
 * client component but may not CALL a function exported from one. Two
 * server-rendered Printables modules needed the secondary/sm classes and,
 * blocked by that rule, each pasted the whole class string inline. Both
 * copies then silently went stale the moment the real button changed:
 * they were still lifting a pixel on hover after the design system had
 * stopped. Living here, the string has one definition that servers and
 * clients can both import.
 */

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export type ButtonStyleProps = {
  className?: string;
  fullWidth?: boolean;
  size?: ButtonSize;
  variant?: ButtonVariant;
};

const baseClass =
  // background-image is in the transition list because the fill is a
  // gradient: without it the hover colour snaps instead of easing. Both
  // gradients are three-stop linear-gradients, which is what lets a
  // browser interpolate between them at all.
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-center font-semibold tracking-[-0.006em] transition-[transform,background-image,background-color,border-color,color] duration-[var(--dur-fast)] ease-[var(--ease-out)] active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)] disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none";

const variantClass: Record<ButtonVariant, string> = {
  // btn-fill-* are real classes in globals.css, not tokens, so their
  // gradient resolves var(--primary) against the button itself and
  // follows a product's own accent inside the product shell. The flat
  // bg-[var(--primary)] underneath stays as the fallback for any engine
  // without color-mix(), where the button is simply a solid accent.
  // HOVER IS A COLOUR SHIFT AND NOTHING ELSE.
  // These used to lift a pixel and swap to a heavier shadow at the same
  // time, which on a page of several buttons read as the interface
  // jumping about. The material (inset highlight, accent shadow) is now
  // constant between rest and hover, so the only thing that changes is
  // roughly five points of lightness in the fill. See .btn-fill-* in
  // globals.css. The press state keeps its scale, which is feedback for
  // something the person actually did.
  primary:
    "btn-fill-primary bg-[var(--primary)] text-[var(--primary-contrast)] shadow-[shadow:var(--btn-primary-rest)]",
  secondary:
    "btn-fill-secondary border border-[var(--border-strong)] bg-[var(--surface)] text-[var(--text)] shadow-[shadow:var(--btn-raise-rest)]",
  ghost: "text-[var(--muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--text)]",
  danger:
    "bg-[var(--danger)] text-white shadow-[shadow:var(--btn-raise-rest)] hover:brightness-[1.04]",
};

const sizeClass: Record<ButtonSize, string> = {
  sm: "min-h-9 rounded-lg px-3.5 py-2 text-[13px]",
  md: "min-h-11 rounded-lg px-5 py-2.5 text-[14px]",
  lg: "min-h-12 rounded-xl px-6 py-3.5 text-[15px]",
};

export function buttonClassName({
  className = "",
  fullWidth = false,
  size = "md",
  variant = "primary",
}: ButtonStyleProps = {}) {
  return [baseClass, variantClass[variant], sizeClass[size], fullWidth ? "w-full" : ""]
    .concat(className)
    .filter(Boolean)
    .join(" ");
}
