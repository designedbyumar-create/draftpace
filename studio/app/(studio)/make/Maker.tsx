"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Button from "@/design-system/Button";
import Alert from "@/design-system/Alert";
import Badge from "@/design-system/Badge";
import EmptyState from "@/design-system/EmptyState";
import { BookOpen, Microphone, Search, Sparkles, Article } from "@/design-system/Icon";
import FilmPlayer from "~/components/FilmPlayer";
import { Panel, Swatch, seconds } from "~/components/ui";
import type { Film } from "@engine/director/film";
import type { PlatformId, Goal } from "@engine/director/platforms";
import type { ProductSource, GuideSource } from "~/lib/server/engine";
import { planAction, saveAction } from "../actions";

type PlatformInfo = { id: PlatformId; label: string; width: number; height: number; duration: { min: number; max: number }; soundOn: boolean; notes: string };

const GOALS: { id: Goal; label: string; hint: string }[] = [
  { id: "awareness", label: "Get noticed", hint: "People who have the problem but have not heard of it" },
  { id: "consideration", label: "Explain", hint: "People weighing it up: how it works, who it is for" },
  { id: "conversion", label: "Sell", hint: "People ready to decide: what you get, the price" },
];

const STRUCTURE: Record<string, string> = {
  cascade: "Problem cascade", searched: "In their words", walkthrough: "How it works", isThisYou: "Is this you?", honestNo: "What it is not",
  whatYouGet: "What you get", oneScreen: "One screen, closely", beforeAfter: "Before and after", question: "The question before buying",
  guideTimeline: "In order", guideSteps: "Do this", guideChecklist: "The checklist", guideQuestion: "The question people ask",
};

const shape = (p: PlatformInfo) => (p.height / p.width > 1.7 ? "9:16" : p.height / p.width > 1.4 ? "2:3" : "4:5");

export default function Maker({ products, guides, platforms, areas, initial }: {
  products: ProductSource[]; guides: (GuideSource & { made: boolean })[]; platforms: PlatformInfo[];
  areas: { slug: string; label: string }[]; initial: { product?: string; guide?: string };
}) {
  const router = useRouter();
  const [source, setSource] = useState<"product" | "guide">(initial.guide ? "guide" : "product");
  const [product, setProduct] = useState(initial.product ?? "");
  const [guide, setGuide] = useState(initial.guide ?? "");
  const [platform, setPlatform] = useState<PlatformId>(initial.guide ? "youtube-short" : "instagram-reel");
  const [goal, setGoal] = useState<Goal>("awareness");
  const [query, setQuery] = useState("");
  const [area, setArea] = useState("all");
  const [result, setResult] = useState<{ film: Film; exists: boolean } | null>(null);
  const [error, setError] = useState("");
  const [planning, startPlan] = useTransition();
  const [saving, startSave] = useTransition();

  const shownGuides = useMemo(() => guides.filter((g) =>
    (area === "all" || g.area === area) && (!query || `${g.title} ${g.query ?? ""}`.toLowerCase().includes(query.toLowerCase()))
  ).sort((a, b) => Number(b.startHere) - Number(a.startHere) || Number(a.made) - Number(b.made)), [guides, area, query]);

  const ready = source === "product" ? !!product : !!guide;
  const req = source === "product" ? { kind: "product" as const, product, platform, goal } : { kind: "guide" as const, guide, platform };
  const chosenGuide = guides.find((g) => g.slug === guide);
  const productName = (slug: string | null) => products.find((p) => p.slug === slug)?.name ?? "";

  const plan = () => startPlan(async () => {
    setError("");
    const r = await planAction(req);
    if ("error" in r) { setError(r.error); setResult(null); } else setResult({ film: r.film, exists: r.exists });
  });
  const save = () => startSave(async () => {
    const r = await saveAction(req);
    if ("error" in r) setError(r.error); else router.push(`/library/${r.id}`);
  });
  const reset = () => setResult(null);

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,460px)]">
      <div className="min-w-0 space-y-4">
        <Panel title="1. The source" description="A product film sells one product. A guide Short teaches from a guide, then shows the product the guide links.">
          <div className="grid gap-2 sm:grid-cols-3">
            {([
              { id: "product", label: "A product", hint: "9 products", Icon: Sparkles },
              { id: "guide", label: "A guide", hint: `${guides.length} guides`, Icon: BookOpen },
            ] as const).map((o) => (
              <button key={o.id} onClick={() => { setSource(o.id); reset(); if (o.id === "guide") setPlatform("youtube-short"); }} aria-pressed={source === o.id}
                className={`flex items-center gap-3 rounded-lg border p-3 text-left transition ${source === o.id ? "border-[var(--primary)] bg-[var(--primary-soft)]" : "border-[var(--border)] hover:border-[var(--border-strong)]"}`}>
                <o.Icon size={20} active={source === o.id} className={source === o.id ? "text-[var(--primary)]" : "text-[var(--muted)]"} />
                <span><span className="block text-body-sm font-semibold">{o.label}</span><span className="block text-caption text-[var(--muted)]">{o.hint}</span></span>
              </button>
            ))}
            <Link href="/voiceover" className="flex items-center gap-3 rounded-lg border border-dashed border-[var(--border-strong)] p-3 text-left transition hover:bg-[var(--surface-muted)]">
              <Microphone size={20} className="text-[var(--muted)]" />
              <span><span className="block text-body-sm font-semibold">My own voice-over</span><span className="block text-caption text-[var(--muted)]">Script in, visuals out</span></span>
            </Link>
          </div>

          {source === "product" ? (
            <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((p) => (
                <li key={p.slug}>
                  <button onClick={() => { setProduct(p.slug); reset(); }} aria-pressed={product === p.slug}
                    className={`h-full w-full rounded-lg border p-3 text-left transition ${product === p.slug ? "border-[var(--primary)] bg-[var(--primary-soft)]" : "border-[var(--border)] hover:border-[var(--border-strong)]"}`}>
                    <span className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-2 text-body-sm font-semibold"><Swatch color={p.accent} />{p.name}</span>
                      <span className="tabular text-caption font-semibold text-[var(--muted)]">{p.price}</span>
                    </span>
                    <span className="mt-1 line-clamp-2 block text-caption text-[var(--muted)]">{p.tagline}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-4">
              <div className="flex flex-wrap gap-2">
                <label className="relative flex flex-1 items-center">
                  <Search size={15} className="pointer-events-none absolute left-2.5 text-[var(--faint)]" />
                  <span className="sr-only">Search guides</span>
                  <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search guides by title or search phrase"
                    className="h-9 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] pl-8 pr-3 text-body-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]" />
                </label>
                <select aria-label="Area" value={area} onChange={(e) => setArea(e.target.value)} className="h-9 rounded-md border border-[var(--border)] bg-[var(--surface)] px-2.5 text-body-sm">
                  <option value="all">All areas</option>
                  {areas.map((a) => <option key={a.slug} value={a.slug}>{a.label}</option>)}
                </select>
              </div>
              <ul className="studio-scroll mt-2 max-h-[340px] divide-y divide-[var(--border)] overflow-y-auto rounded-lg border border-[var(--border)]">
                {shownGuides.map((g) => (
                  <li key={g.slug}>
                    <button onClick={() => { setGuide(g.slug); reset(); }} aria-pressed={guide === g.slug}
                      className={`flex w-full items-start justify-between gap-3 px-3 py-2.5 text-left transition ${guide === g.slug ? "bg-[var(--primary-soft)]" : "hover:bg-[var(--surface-muted)]"}`}>
                      <span className="min-w-0">
                        <span className="block text-body-sm font-semibold">{g.title}</span>
                        <span className="block truncate text-caption text-[var(--muted)]">{g.areaLabel} · hands over to {productName(g.product)}</span>
                      </span>
                      <span className="flex shrink-0 gap-1">{g.startHere && <Badge tone="info">Start here</Badge>}{g.made && <Badge tone="success">Has a Short</Badge>}</span>
                    </button>
                  </li>
                ))}
                {!shownGuides.length && <li className="px-3 py-6 text-center text-caption text-[var(--muted)]">No guide matches.</li>}
              </ul>
            </div>
          )}
        </Panel>

        <Panel title="2. Where it goes" description="Each placement has its own shape, length, hook deadline and sound habits; the director plans for it.">
          <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {platforms.map((p) => (
              <li key={p.id}>
                <button onClick={() => { setPlatform(p.id); reset(); }} aria-pressed={platform === p.id}
                  className={`h-full w-full rounded-lg border p-3 text-left transition ${platform === p.id ? "border-[var(--primary)] bg-[var(--primary-soft)]" : "border-[var(--border)] hover:border-[var(--border-strong)]"}`}>
                  <span className="flex items-center gap-2.5">
                    <span aria-hidden className="shrink-0 rounded-[3px] border-2 border-current opacity-60" style={{ width: 14, height: Math.round(14 * (p.height / p.width)) }} />
                    <span className="text-body-sm font-semibold">{p.label}</span>
                  </span>
                  <span className="tabular mt-1.5 block text-caption text-[var(--muted)]">{shape(p)} · {source === "guide" ? "teaches, so longer" : `${p.duration.min}–${p.duration.max}s`} · sound {p.soundOn ? "on" : "off"}</span>
                </button>
              </li>
            ))}
          </ul>
          {source === "product" && (
            <>
              <p className="mt-4 text-caption font-semibold text-[var(--muted)]">What is it for?</p>
              <div className="mt-1.5 grid gap-2 sm:grid-cols-3">
                {GOALS.map((g) => (
                  <button key={g.id} onClick={() => { setGoal(g.id); reset(); }} aria-pressed={goal === g.id}
                    className={`rounded-lg border p-3 text-left transition ${goal === g.id ? "border-[var(--primary)] bg-[var(--primary-soft)]" : "border-[var(--border)] hover:border-[var(--border-strong)]"}`}>
                    <span className="block text-body-sm font-semibold">{g.label}</span>
                    <span className="mt-0.5 block text-caption text-[var(--muted)]">{g.hint}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </Panel>

        <div className="flex flex-wrap items-center gap-3">
          <Button variant="commit" iconLeft={<Sparkles size={16} />} disabled={!ready || planning} onClick={plan}>{planning ? "Planning" : "Plan the film"}</Button>
          {!ready && <p className="text-caption text-[var(--muted)]">Choose a {source} first.</p>}
          {source === "guide" && chosenGuide && <p className="text-caption text-[var(--muted)]">Ends on draftpace.com/guides/{chosenGuide.slug}, then {productName(chosenGuide.product)}.</p>}
        </div>
        {error && <Alert tone="danger">{error}</Alert>}
      </div>

      <div className="xl:sticky xl:top-6 xl:self-start">
        {result ? (
          <Panel title={result.exists ? "Already in the library" : "The plan"} description={result.exists ? "This brief was planned before; here it is." : "Not saved yet. Watch it, then save it to the library."}>
            <FilmPlayer film={result.film} maxHeight={520} />
            <div className="mt-4 space-y-1.5">
              <p className="text-body-sm font-semibold">{result.film.angle.text}</p>
              <p className="tabular text-caption text-[var(--muted)]">{STRUCTURE[result.film.structure] ?? result.film.structure} · {result.film.scenes.length} scenes · {seconds(result.film.durationInFrames)}</p>
              <ul className="mt-2 space-y-1">
                {result.film.reasoning.filter((r) => ["Structure", "Angle", "Guide"].includes(r.topic)).map((r, i) => (
                  <li key={i} className="text-caption text-[var(--muted)]"><span className="font-semibold text-[var(--text)]">{r.topic}:</span> {r.decision}</li>
                ))}
              </ul>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {result.exists
                ? <Button variant="commit" href={`/library/${result.film.id}`} iconLeft={<Article size={15} />}>Open it</Button>
                : <Button variant="commit" disabled={saving} onClick={save}>{saving ? "Saving" : "Save to library"}</Button>}
            </div>
          </Panel>
        ) : (
          <div className="rounded-xl border border-dashed border-[var(--border-strong)] bg-[var(--surface)] p-6">
            <EmptyState icon={Sparkles} title="Your film appears here" description="Choose a source and a placement, then plan it. It plays live, before anything is saved or rendered." />
          </div>
        )}
      </div>
    </div>
  );
}
