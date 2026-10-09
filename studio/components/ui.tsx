import type { ReactNode } from "react";
import Badge, { type BadgeTone } from "@/design-system/Badge";
import { PLATFORMS, type PlatformId } from "@engine/director/platforms";

export function PageHeader({ title, description, actions, eyebrow }: { title: string; description?: ReactNode; actions?: ReactNode; eyebrow?: string }) {
  return (
    <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow && <p className="text-eyebrow font-bold uppercase text-[var(--faint)]">{eyebrow}</p>}
        <h1 className="mt-1 text-heading-sm font-semibold tracking-tight">{title}</h1>
        {description && <p className="mt-1.5 max-w-[68ch] text-body-sm text-[var(--muted)]">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}

export function Panel({ title, description, actions, children, className = "" }: { title?: string; description?: ReactNode; actions?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`min-w-0 rounded-xl border border-[var(--border)] bg-[var(--surface)] ${className}`}>
      {(title || actions) && (
        <div className="flex items-start justify-between gap-3 border-b border-[var(--border)] px-4 py-3">
          <div>
            {title && <h2 className="text-body-sm font-semibold">{title}</h2>}
            {description && <p className="mt-0.5 text-caption text-[var(--muted)]">{description}</p>}
          </div>
          {actions}
        </div>
      )}
      <div className="p-4">{children}</div>
    </section>
  );
}

export function Stat({ label, value, hint }: { label: string; value: ReactNode; hint?: ReactNode }) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3.5">
      <p className="text-caption font-semibold text-[var(--muted)]">{label}</p>
      <p className="tabular mt-1 text-heading-sm font-semibold tracking-tight">{value}</p>
      {hint && <p className="mt-0.5 text-caption text-[var(--faint)]">{hint}</p>}
    </div>
  );
}

const KIND: Record<string, { label: string; tone: BadgeTone }> = {
  product: { label: "Product film", tone: "neutral" },
  guide: { label: "Guide Short", tone: "info" },
  situation: { label: "Situation", tone: "success" },
  voiceover: { label: "Voice-over", tone: "primary" },
};

export function KindBadge({ kind }: { kind: string }) {
  const k = KIND[kind] ?? KIND.product;
  return <Badge tone={k.tone}>{k.label}</Badge>;
}

export function platformLabel(id: string): string {
  return PLATFORMS[id as PlatformId]?.label ?? id;
}

export function Swatch({ color, size = 10 }: { color: string; size?: number }) {
  return <span aria-hidden className="inline-block shrink-0 rounded-full ring-1 ring-black/10" style={{ width: size, height: size, background: color }} />;
}

export function seconds(frames: number, fps = 30) {
  const s = frames / fps;
  return s >= 60 ? `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, "0")}` : `${s.toFixed(1)}s`;
}

export function timecode(frames: number, fps = 30) {
  const s = frames / fps;
  return `${Math.floor(s / 60)}:${(s % 60).toFixed(1).padStart(4, "0")}`;
}
