import { CheckCircle2, WarningCircle } from "@/design-system/Icon";

export type AlertTone = "info" | "success" | "warning" | "danger";

const toneStyles: Record<AlertTone, { bg: string; text: string; icon: typeof WarningCircle }> = {
  info: { bg: "bg-[var(--info-soft)]", text: "text-[var(--info)]", icon: WarningCircle },
  success: { bg: "bg-[var(--success-soft)]", text: "text-[var(--success)]", icon: CheckCircle2 },
  warning: { bg: "bg-[var(--warning-soft)]", text: "text-[var(--warning)]", icon: WarningCircle },
  danger: { bg: "bg-[var(--danger-soft)]", text: "text-[var(--danger)]", icon: WarningCircle },
};

export default function Alert({
  tone = "info",
  title,
  children,
}: {
  tone?: AlertTone;
  title?: string;
  children: React.ReactNode;
}) {
  const { bg, text, icon: Icon } = toneStyles[tone];
  return (
    <div role={tone === "danger" ? "alert" : "status"} className={`flex items-start gap-3 rounded-lg px-4 py-3 ${bg}`}>
      <Icon size={16} className={`mt-0.5 shrink-0 ${text}`} aria-hidden />
      <div className="text-[13px] leading-5">
        {title && <p className={`font-semibold ${text}`}>{title}</p>}
        <div className="text-[var(--text)]">{children}</div>
      </div>
    </div>
  );
}
