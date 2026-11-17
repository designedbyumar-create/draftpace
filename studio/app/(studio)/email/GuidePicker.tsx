"use client";

import { useRouter } from "next/navigation";

export default function GuidePicker({ guides, value }: { guides: { slug: string; title: string; area: string; startHere: boolean }[]; value: string }) {
  const router = useRouter();
  const areas = [...new Set(guides.map((g) => g.area))];
  return (
    <label className="block">
      <span className="text-caption font-semibold text-[var(--muted)]">Guide</span>
      <select value={value} onChange={(e) => router.push(`/email?guide=${e.target.value}`)} className="mt-1 h-9 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 text-body-sm">
        {areas.map((a) => (
          <optgroup key={a} label={a}>
            {guides.filter((g) => g.area === a).map((g) => <option key={g.slug} value={g.slug}>{g.startHere ? "★ " : ""}{g.title}</option>)}
          </optgroup>
        ))}
      </select>
    </label>
  );
}
