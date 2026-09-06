import type { CSSProperties, ReactNode } from "react";

/**
 * The one shared phone bezel for every product's Shop mockups
 * (`[productSlug]/*Visuals.tsx`). Every one of those files hand-rolled the
 * same border/notch/glow markup, hardcoding that product's own accent hex
 * a second time even though `definition.ts` already declares it. This is
 * the single place that markup lives now, parameterized by accent instead
 * of duplicated.
 *
 * `accent` accepts any valid CSS color value, including a `var(--...)`
 * reference for a product (like Monthly Money Reset) whose own theme
 * tokens are already in scope on an ancestor element.
 */
export default function PhoneFrame({
  accent,
  bezelColor = "#101312",
  style,
  children,
}: {
  accent: string;
  /** Defaults to the near-black bezel shared by every mockup except Monthly Money Reset's. */
  bezelColor?: string;
  /** Applied to the outer wrapper: lets a product's own CSS-variable scope (e.g. `monthlyMoneyResetThemeVars`) travel with the frame. */
  style?: CSSProperties;
  children: ReactNode;
}) {
  return (
    <div className="relative mx-auto w-full max-w-[280px]" style={style}>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-4 inset-y-8 -z-10 rounded-[3rem] opacity-[0.16] blur-3xl"
        style={{ backgroundColor: accent }}
      />
      <div
        className="relative overflow-hidden rounded-[2.75rem] border-[6px] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.35)]"
        style={{ aspectRatio: "9 / 19.5", borderColor: bezelColor, backgroundColor: bezelColor }}
      >
        <div
          className="absolute left-1/2 top-2.5 z-10 h-[16px] w-[84px] -translate-x-1/2 rounded-full"
          style={{ backgroundColor: bezelColor }}
          aria-hidden
        />
        <div className="absolute inset-0 overflow-hidden rounded-[2.25rem]">{children}</div>
      </div>
    </div>
  );
}
