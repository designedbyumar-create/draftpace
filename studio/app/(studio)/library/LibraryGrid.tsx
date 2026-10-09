"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import Badge from "@/design-system/Badge";
import EmptyState from "@/design-system/EmptyState";
import { FilmStrip, Search } from "@/design-system/Icon";
import FilmPoster from "~/components/FilmPoster";
import { KindBadge, Swatch } from "~/components/ui";
import type { FilmSummary } from "~/lib/server/catalog";

type Filters = { kind: string; product: string; platform: string; status: string; q: string };

const KINDS = [
  { id: "all", label: "All" },
  { id: "situation", label: "Situations" },
  { id: "guide", label: "Guide Shorts" },
  { id: "product", label: "Product films" },
  { id: "voiceover", label: "Voice-overs" },
];

const STATUSES = [
  { id: "all", label: "Any status" },
  { id: "review", label: "Needs review" },
  { id: "approved", label: "Approved" },
  { id: "changes", label: "Changes asked" },
  { id: "rejected", label: "Rejected" },
  { id: "rendered", label: "Rendered" },
  { id: "unrendered", label: "Not rendered" },
  { id: "scheduled", label: "Scheduled" },
];

function matches(f: FilmSummary, x: Filters) {
  if (x.kind !== "all" && f.kind !== x.kind) return false;
  if (x.product !== "all" && f.product !== x.product) return false;
  if (x.platform !== "all" && f.platform !== x.platform) return false;
  switch (x.status) {
    case "review": if (f.review) return false; break;
    case "approved": case "changes": case "rejected": if (f.review?.status !== x.status) return false; break;
    case "rendered": if (!f.rendered) return false; break;
    case "unrendered": if (f.rendered) return false; break;
    case "scheduled": if (!f.scheduled) return false; break;
  }
  if (x.q) {
    const hay = `${f.hook} ${f.productName} ${f.guide ?? ""} ${f.platformLabel} ${f.id}`.toLowerCase();
    if (!x.q.toLowerCase().split(/\s+/).every((w) => hay.includes(w))) return false;
  }
  return true;
}

const selectClass = "h-9 rounded-md border border-[var(--border)] bg-[var(--surface)] px-2.5 text-body-sm font-medium text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]";

export default function LibraryGrid({ films, products, platforms, initial }: { films: FilmSummary[]; products: { slug: string; name: string }[]; platforms: { id: string; label: string }[]; initial: Filters }) {
  const [f, setF] = useState<Filters>(initial);
  const shown = useMemo(() => films.filter((x) => matches(x, f)), [films, f]);
  const count = (kind: string) => films.filter((x) => kind === "all" || x.kind === kind).length;
  const set = (patch: Partial<Filters>) => {
    const next = { ...f, ...patch };
    setF(next);
    const params = new URLSearchParams(Object.entries(next).filter(([k, v]) => v && v !== "all" && !(k === "q" && !v)));
    window.history.replaceState(null, "", params.size ? `?${params}` : window.location.pathname);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <div role="tablist" aria-label="Kind" className="flex rounded-lg border border-[var(--border)] bg-[var(--surface)] p-0.5">
          {KINDS.map((k) => (
            <button key={k.id} role="tab" aria-selected={f.kind === k.id} onClick={() => set({ kind: k.id })}
              className={`rounded-md px-3 py-1.5 text-body-sm font-semibold transition ${f.kind === k.id ? "bg-[var(--primary-soft)] text-[var(--primary)]" : "text-[var(--muted)] hover:text-[var(--text)]"}`}>
              {k.label} <span className="tabular ml-0.5 text-caption opacity-70">{count(k.id)}</span>
            </button>
          ))}
        </div>
        <label className="relative ml-auto flex items-center">
          <Search size={15} className="pointer-events-none absolute left-2.5 text-[var(--faint)]" />
          <span className="sr-only">Search films</span>
          <input value={f.q} onChange={(e) => set({ q: e.target.value })} placeholder="Search hooks, products, guides"
            className="h-9 w-[260px] rounded-md border border-[var(--border)] bg-[var(--surface)] pl-8 pr-3 text-body-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]" />
        </label>
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        <select aria-label="Product" className={selectClass} value={f.product} onChange={(e) => set({ product: e.target.value })}>
          <option value="all">All products</option>
          {products.map((p) => <option key={p.slug} value={p.slug}>{p.name}</option>)}
        </select>
        <select aria-label="Platform" className={selectClass} value={f.platform} onChange={(e) => set({ platform: e.target.value })}>
          <option value="all">All platforms</option>
          {platforms.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
        </select>
        <select aria-label="Status" className={selectClass} value={f.status} onChange={(e) => set({ status: e.target.value })}>
          {STATUSES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
        <p className="tabular ml-auto self-center text-caption text-[var(--muted)]">{shown.length} of {films.length}</p>
      </div>

      {shown.length === 0 ? (
        <div className="mt-6"><EmptyState icon={FilmStrip} title="No films match" description="Clear a filter, or make one from Make." /></div>
      ) : (
        <ul className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
          {shown.map((film) => (
            <li key={film.id}>
              <Link href={`/library/${film.id}`} className="group block rounded-xl border border-[var(--border)] bg-[var(--surface)] p-2 transition hover:border-[var(--border-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]">
                <div className="flex aspect-[9/14] items-center justify-center rounded-lg bg-[var(--surface-muted)] p-2">
                  <FilmPoster film={film} className="max-h-full w-auto max-w-full transition group-hover:scale-[1.02]" />
                </div>
                <div className="px-1 pb-1 pt-2.5">
                  <p className="flex items-center gap-1.5 truncate text-caption font-semibold"><Swatch color={film.accent} size={8} />{film.productName}</p>
                  <p className="mt-0.5 flex justify-between gap-2 text-caption text-[var(--muted)]"><span className="truncate">{film.platformLabel}</span><span className="tabular shrink-0">{film.seconds}s</span></p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    <KindBadge kind={film.kind} />
                    {film.review?.status === "approved" && <Badge tone="success">Approved</Badge>}
                    {film.review?.status === "changes" && <Badge tone="warning">Changes</Badge>}
                    {film.review?.status === "rejected" && <Badge tone="danger">Rejected</Badge>}
                    {film.rendered && <Badge tone="primary">Rendered</Badge>}
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
