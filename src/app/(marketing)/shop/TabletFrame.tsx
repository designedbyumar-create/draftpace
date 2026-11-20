import type { CSSProperties, ReactNode } from "react";

/**
 * The tablet counterpart to PhoneFrame: same bezel language (dark border,
 * soft accent glow behind it, the same shadow), a wider aspect ratio and
 * a camera dot instead of a notch. Shares PhoneFrame's reasoning for
 * being its own component rather than hand-rolled per mockup file: one
 * place this markup lives, parameterized by accent.
 */
export default function TabletFrame({
  accent,
  bezelColor = "#101312",
  style,
  children,
}: {
  accent: string;
  /** Defaults to the near-black bezel shared by every mockup except Monthly Money Reset's. */
  bezelColor?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  return (
    <div className="relative mx-auto w-full max-w-[420px]" style={style}>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-6 inset-y-10 -z-10 rounded-[2.5rem] opacity-[0.16] blur-3xl"
        style={{ backgroundColor: accent }}
      />
      <div
        className="relative overflow-hidden rounded-[1.5rem] border-[10px] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.35)]"
        style={{ aspectRatio: "3 / 4", borderColor: bezelColor, backgroundColor: bezelColor }}
      >
        <div
          className="absolute left-1/2 top-1.5 z-10 h-[6px] w-[6px] -translate-x-1/2 rounded-full"
          style={{ backgroundColor: "#2e2e2e" }}
          aria-hidden
        />
        <div className="absolute inset-0 overflow-hidden rounded-[0.75rem]">{children}</div>
      </div>
    </div>
  );
}
