import type { ReactNode } from "react";

type MarketingPillTone = "brand" | "success" | "neutral";

type MarketingPillProps = {
  children: ReactNode;
  className?: string;
  icon?: ReactNode;
  tone?: MarketingPillTone;
};

const toneClass: Record<MarketingPillTone, string> = {
  brand:
    "border-[var(--marketing-primary-soft-border)] bg-[var(--marketing-primary-soft)] text-[var(--marketing-primary)]",
  success: "border-emerald-100 bg-emerald-50 text-emerald-700",
  neutral: "border-[var(--marketing-border)] bg-white text-[var(--marketing-muted)]",
};

export function marketingPillClassName({
  className = "",
  tone = "brand",
}: Omit<MarketingPillProps, "children" | "icon"> = {}) {
  return [
    "inline-flex w-fit items-center gap-2 rounded-full border px-4 py-2 text-[11px] font-bold uppercase tracking-widest",
    toneClass[tone],
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

export default function MarketingPill({
  children,
  className,
  icon,
  tone = "brand",
}: MarketingPillProps) {
  return (
    <div className={marketingPillClassName({ className, tone })}>
      {icon}
      <span>{children}</span>
    </div>
  );
}
