"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import Badge from "@/design-system/Badge";
import Button from "@/design-system/Button";
import Tabs, { TabPanel } from "@/design-system/Tabs";
import { Search, ArrowRight } from "@/design-system/Icon";
import { Swatch } from "~/components/ui";
import type { ProductSource, GuideSource } from "~/lib/server/engine";

type P = ProductSource & { productFilms: number; guideFilms: number; voiceFilms: number; approved: number };
type G = GuideSource & { films: string[] };

export default function SourcesView({ tab: initialTab, products, guides, areas }: { tab: string; products: P[]; guides: G[]; areas: { slug: string; label: string }[] }) {
  const [tab, setTab] = useState(initialTab);
  const [q, setQ] = useState("");
  const [area, setArea] = useState("all");
  const [only, setOnly] = useState<"all" | "without" | "with">("all");
  const shown = useMemo(() => guides.filter((g) =>
    (area === "all" || g.area === area) &&
    (only === "all" || (only === "with" ? g.films.length > 0 : g.films.length === 0)) &&
    (!q || `${g.title} ${g.query ?? ""} ${g.dek}`.toLowerCase().includes(q.toLowerCase()))), [guides, area, only, q]);
  const name = (slug: string | null) => products.find((p) => p.slug === slug)?.name ?? "No single product";

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)]">
      <div className="border-b border-[var(--border)] px-3 pt-2">
        <Tabs tabs={[{ id: "products", label: `Products · ${products.length}` }, { id: "guides", label: `Guides · ${guides.length}` }]} activeId={tab} onChange={setTab} idPrefix="src" />
      </div>
      <div className="p-4">
        <TabPanel id="products" activeId={tab} idPrefix="src">
          <div className="studio-scroll overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-body-sm">
              <thead className="text-caption text-[var(--muted)]">
                <tr className="border-b border-[var(--border)]"><th className="py-2 pr-3 font-semibold">Product</th><th className="py-2 pr-3 font-semibold">Price</th><th className="py-2 pr-3 font-semibold">Real screens</th><th className="py-2 pr-3 font-semibold">Films</th><th className="py-2 pr-3 font-semibold">Approved</th><th /></tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {products.map((p) => (
                  <tr key={p.slug}>
                    <td className="py-3 pr-3"><p className="flex items-center gap-2 font-semibold"><Swatch color={p.accent} />{p.name}</p><p className="mt-0.5 line-clamp-1 max-w-[46ch] text-caption text-[var(--muted)]">{p.tagline}</p></td>
                    <td className="tabular py-3 pr-3">{p.price}{p.compareAt && <span className="ml-1.5 text-caption text-[var(--faint)] line-through">{p.compareAt}</span>}</td>
                    <td className="tabular py-3 pr-3">{p.screens}</td>
                    <td className="py-3 pr-3 text-caption"><Link className="font-semibold hover:underline" href={`/library?product=${p.slug}`}>{p.productFilms + p.guideFilms + p.voiceFilms}</Link><span className="text-[var(--muted)]"> · {p.productFilms} product, {p.guideFilms} guide, {p.voiceFilms} voice-over</span></td>
                    <td className="tabular py-3 pr-3">{p.approved}</td>
                    <td className="py-3 text-right"><Button size="sm" variant="action" href={`/make?product=${p.slug}`}>Make</Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabPanel>
        <TabPanel id="guides" activeId={tab} idPrefix="src">
          <div className="flex flex-wrap gap-2">
            <label className="relative flex min-w-[240px] flex-1 items-center">
              <Search size={15} className="pointer-events-none absolute left-2.5 text-[var(--faint)]" />
              <span className="sr-only">Search guides</span>
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search titles, search phrases, summaries" className="h-9 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] pl-8 pr-3 text-body-sm" />
            </label>
            <select aria-label="Area" value={area} onChange={(e) => setArea(e.target.value)} className="h-9 rounded-md border border-[var(--border)] bg-[var(--surface)] px-2.5 text-body-sm">
              <option value="all">All areas</option>
              {areas.map((a) => <option key={a.slug} value={a.slug}>{a.label}</option>)}
            </select>
            <select aria-label="Coverage" value={only} onChange={(e) => setOnly(e.target.value as typeof only)} className="h-9 rounded-md border border-[var(--border)] bg-[var(--surface)] px-2.5 text-body-sm">
              <option value="all">Any coverage</option>
              <option value="without">No film yet</option>
              <option value="with">Has a film</option>
            </select>
            <p className="tabular ml-auto self-center text-caption text-[var(--muted)]">{shown.length} of {guides.length}</p>
          </div>
          <ul className="mt-3 divide-y divide-[var(--border)]">
            {shown.map((g) => (
              <li key={g.slug} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-1.5 text-body-sm font-semibold">{g.title}{g.startHere && <Badge tone="info">Start here</Badge>}{g.locale === "uk" && <Badge>UK</Badge>}</p>
                  <p className="mt-0.5 text-caption text-[var(--muted)]">{g.areaLabel} · hands over to {name(g.product)}{g.query && <> · searched as “{g.query}”</>}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {g.films.length > 0 && <Link href={`/library/${g.films[0]}`} className="text-caption font-semibold text-[var(--primary)] hover:underline">{g.films.length} film{g.films.length > 1 ? "s" : ""}</Link>}
                  <a href={`https://draftpace.com/guides/${g.slug}`} target="_blank" rel="noreferrer" className="text-caption font-semibold text-[var(--muted)] hover:text-[var(--text)]">On the site</a>
                  {g.product && <Button size="sm" variant="action" href={`/make?guide=${g.slug}`} iconRight={<ArrowRight size={14} />}>Make a Short</Button>}
                </div>
              </li>
            ))}
          </ul>
        </TabPanel>
      </div>
    </div>
  );
}
