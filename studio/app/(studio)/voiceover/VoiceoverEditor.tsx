"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Button from "@/design-system/Button";
import Alert from "@/design-system/Alert";
import Badge from "@/design-system/Badge";
import Input from "@/design-system/Input";
import Textarea from "@/design-system/Textarea";
import Toggle from "@/design-system/Toggle";
import { Microphone, Trash2, UploadSimple } from "@/design-system/Icon";
import FilmPlayer from "~/components/FilmPlayer";
import { Panel, timecode } from "~/components/ui";
import type { Film } from "@engine/director/film";
import type { PlatformId } from "@engine/director/platforms";
import { planVoiceoverAction, saveVoiceoverAction, deleteVoiceoverAction, type VoiceoverForm } from "../actions";

type Initial = { id: string; product: string; guide: string; platform: PlatformId; seconds: number; script: string; srt: string; audio: { src: string; seconds: number } | null; noMusic: boolean };

const SPEAK = 2.5;

const VISUAL: Record<string, { label: string; color: string }> = {
  title: { label: "Your line as type", color: "var(--text)" },
  phone: { label: "Real screen", color: "var(--primary)" },
  live: { label: "Live component", color: "var(--info)" },
  list: { label: "Guide checklist", color: "var(--warning)" },
  brand: { label: "Name reveal", color: "var(--success)" },
  cta: { label: "End card", color: "var(--muted)" },
};

const words = (t: string) => t.split(/\s+/).filter(Boolean).length;

export default function VoiceoverEditor({ products, guides, platforms, saved, lengths, limits, initial }: {
  products: { slug: string; name: string; accent: string }[];
  guides: { slug: string; title: string; product: string }[];
  platforms: { id: PlatformId; label: string; width: number; height: number }[];
  saved: { id: string; product: string; lines: number; seconds: number | null; audio: boolean }[];
  lengths: number[];
  limits: { min: number; max: number };
  initial: Initial | null;
}) {
  const router = useRouter();
  const [name, setName] = useState(initial?.id ?? "");
  const [product, setProduct] = useState(initial?.product ?? products[0].slug);
  const [guide, setGuide] = useState(initial?.guide ?? "");
  const [platform, setPlatform] = useState<PlatformId>(initial?.platform ?? "youtube-short");
  const [length, setLength] = useState(initial?.seconds ?? 30);
  const [script, setScript] = useState(initial?.script ?? "");
  const [srt, setSrt] = useState(initial?.srt ?? "");
  const [showSrt, setShowSrt] = useState(!!initial?.srt);
  const [noMusic, setNoMusic] = useState(initial?.noMusic ?? false);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioSeconds, setAudioSeconds] = useState<number | null>(initial?.audio?.seconds ?? null);
  const [plan, setPlan] = useState<Film | null>(null);
  const [error, setError] = useState("");
  const [planning, startPlan] = useTransition();
  const [saving, startSave] = useTransition();
  const fileInput = useRef<HTMLInputElement>(null);

  const total = words(script);
  const natural = Math.round(total / SPEAK + script.split(/\n+/).filter(Boolean).length * 0.35);
  const lengthFixedBy = audioSeconds ? "recording" : srt.trim() ? "caption file" : null;
  const effective = audioSeconds ?? length;

  // While the recording is not saved yet, preview it by its length: the cut is the same, the picture plays silent.
  const form: VoiceoverForm = useMemo(() => ({
    id: name || "draft", product, ...(guide ? { guide } : {}), platform, script, noMusic,
    ...(srt.trim() ? { srt } : {}),
    ...(audioSeconds && !audioFile && initial?.audio ? { audio: initial.audio } : { seconds: audioSeconds ?? length }),
  }), [name, product, guide, platform, script, noMusic, srt, audioSeconds, audioFile, initial, length]);

  useEffect(() => {
    if (!script.trim() && !srt.trim()) { setPlan(null); return; }
    const t = setTimeout(() => startPlan(async () => {
      const r = await planVoiceoverAction(form);
      if ("error" in r) { setError(r.error); setPlan(null); } else { setError(""); setPlan(r.film); }
    }), 500);
    return () => clearTimeout(t);
  }, [form, script, srt]);

  const onAudio = (f: File | null) => {
    setAudioFile(f);
    if (!f) { setAudioSeconds(initial?.audio?.seconds ?? null); return; }
    const a = new Audio(URL.createObjectURL(f));
    a.addEventListener("loadedmetadata", () => setAudioSeconds(Math.round(a.duration * 100) / 100));
  };

  const save = () => startSave(async () => {
    const fd = new FormData();
    fd.set("form", JSON.stringify({ ...form, id: name }));
    if (audioFile) fd.set("audio", audioFile);
    const r = await saveVoiceoverAction(fd);
    if ("error" in r) setError(r.error); else router.push(`/library/${r.id}`);
  });

  const timing = plan?.reasoning.find((r) => r.topic === "Timing");
  const pace = total / Math.max(1, effective - 1.5);
  const paceTone = pace > SPEAK * 1.3 ? "danger" : pace < SPEAK * 0.6 ? "warning" : "success";
  const shots = plan?.scenes ?? [];

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,440px)]">
      <div className="min-w-0 space-y-4">
        {saved.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-caption font-semibold text-[var(--muted)]">Saved:</p>
            {saved.map((v) => (
              <span key={v.id} className={`inline-flex items-center gap-1 rounded-full border px-1 py-0.5 ${initial?.id === v.id ? "border-[var(--primary)] bg-[var(--primary-soft)]" : "border-[var(--border)] bg-[var(--surface)]"}`}>
                <Link href={`/voiceover?id=${v.id}`} className="px-2 text-caption font-semibold">{v.id}{v.audio && " · recorded"}</Link>
                <button aria-label={`Delete ${v.id}`} onClick={() => { if (confirm(`Delete the voice-over "${v.id}"? Its script and film are removed.`)) startSave(async () => { await deleteVoiceoverAction(v.id); router.push("/voiceover"); }); }}
                  className="rounded-full p-1 text-[var(--faint)] hover:text-[var(--danger)]"><Trash2 size={13} /></button>
              </span>
            ))}
            {initial && <Link href="/voiceover" className="text-caption font-semibold text-[var(--primary)]">+ New</Link>}
          </div>
        )}

        <Panel title="1. The script" description="One sentence per line reads best. Each line is a shot; a long line becomes two.">
          <Textarea label="Script" rows={10} value={script} onChange={(e) => setScript(e.target.value)}
            placeholder={"How much money is safe to spend after your bills?\nOpen the account you pay bills from and write down the available balance.\n..."} />
          <p className="tabular mt-1.5 text-caption text-[var(--muted)]">{total} words · about {natural}s read at a natural pace</p>
          <div className="mt-3">
            {showSrt ? (
              <div>
                <Textarea label="Caption file (SRT), for exact timing" rows={6} value={srt} onChange={(e) => setSrt(e.target.value)} placeholder={"1\n00:00:00,400 --> 00:00:02,900\nHow much money is safe to spend after your bills?"} />
                <div className="mt-1.5 flex gap-3 text-caption">
                  <label className="cursor-pointer font-semibold text-[var(--primary)]">Load an .srt file<input type="file" accept=".srt,text/plain" className="sr-only" onChange={async (e) => { const f = e.target.files?.[0]; if (f) setSrt(await f.text()); }} /></label>
                  <button className="font-semibold text-[var(--muted)]" onClick={() => { setSrt(""); setShowSrt(false); }}>Remove</button>
                </div>
              </div>
            ) : (
              <button className="text-caption font-semibold text-[var(--primary)]" onClick={() => setShowSrt(true)}>I have a caption file (CapCut, Descript and most editors export one)</button>
            )}
          </div>
        </Panel>

        <Panel title="2. Length and shape">
          <p className="text-caption font-semibold text-[var(--muted)]">How long?</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            {lengths.map((s) => (
              <button key={s} disabled={!!lengthFixedBy} onClick={() => setLength(s)} aria-pressed={!lengthFixedBy && length === s}
                className={`tabular rounded-md border px-3 py-1.5 text-body-sm font-semibold transition disabled:opacity-40 ${!lengthFixedBy && length === s ? "border-[var(--primary)] bg-[var(--primary-soft)] text-[var(--primary)]" : "border-[var(--border)] hover:border-[var(--border-strong)]"}`}>
                {s >= 60 ? `${Math.floor(s / 60)}${s % 60 ? `:${String(s % 60).padStart(2, "0")}` : ""} min` : `${s}s`}
              </button>
            ))}
            <label className="ml-1 flex items-center gap-1.5 text-caption text-[var(--muted)]">
              or
              <input type="number" min={limits.min} max={limits.max} value={length} disabled={!!lengthFixedBy}
                onChange={(e) => setLength(Math.min(limits.max, Math.max(limits.min, Number(e.target.value) || limits.min)))}
                className="tabular h-8 w-16 rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 text-body-sm disabled:opacity-40" />
              seconds
            </label>
            {natural > 0 && !lengthFixedBy && Math.abs(natural - length) > 4 && (
              <button onClick={() => setLength(Math.min(limits.max, Math.max(limits.min, Math.round(natural / 5) * 5)))} className="ml-1 text-caption font-semibold text-[var(--primary)]">
                Fit the script: {Math.min(limits.max, Math.max(limits.min, Math.round(natural / 5) * 5))}s
              </button>
            )}
          </div>
          {lengthFixedBy && <p className="mt-1.5 text-caption text-[var(--muted)]">The {lengthFixedBy} sets the length{audioSeconds ? `: ${audioSeconds.toFixed(1)}s` : ""}.</p>}

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <label className="block">
              <span className="text-caption font-semibold text-[var(--muted)]">Product shown</span>
              <select value={product} disabled={!!guide} onChange={(e) => setProduct(e.target.value)} className="mt-1 h-9 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 text-body-sm disabled:opacity-60">
                {products.map((p) => <option key={p.slug} value={p.slug}>{p.name}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="text-caption font-semibold text-[var(--muted)]">Guide (optional)</span>
              <select value={guide} onChange={(e) => { setGuide(e.target.value); const g = guides.find((x) => x.slug === e.target.value); if (g) setProduct(g.product); }} className="mt-1 h-9 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 text-body-sm">
                <option value="">No guide</option>
                {guides.map((g) => <option key={g.slug} value={g.slug}>{g.title}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="text-caption font-semibold text-[var(--muted)]">Canvas</span>
              <select value={platform} onChange={(e) => setPlatform(e.target.value as PlatformId)} className="mt-1 h-9 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 text-body-sm">
                {platforms.map((p) => <option key={p.id} value={p.id}>{p.label} ({p.width}×{p.height})</option>)}
              </select>
            </label>
          </div>
          {guide && <p className="mt-1.5 text-caption text-[var(--muted)]">With a guide, its checklists can appear on matching lines and the film ends on the guide&apos;s address.</p>}
        </Panel>

        <Panel title="3. The recording (optional)" description="Add it now or later. With it, the film runs exactly as long as your voice, and your voice plays under the pictures.">
          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm" variant="secondary" iconLeft={<UploadSimple size={15} />} onClick={() => fileInput.current?.click()}>{audioFile ? "Choose another" : initial?.audio ? "Replace recording" : "Add recording"}</Button>
            <input ref={fileInput} type="file" accept="audio/mpeg,audio/wav,audio/x-wav,audio/mp4,audio/aac,.mp3,.wav,.m4a,.aac" className="sr-only" onChange={(e) => onAudio(e.target.files?.[0] ?? null)} />
            {audioFile ? <span className="text-caption"><Microphone size={13} className="mr-1 inline" />{audioFile.name} · {audioSeconds?.toFixed(1)}s <button className="ml-2 font-semibold text-[var(--muted)]" onClick={() => onAudio(null)}>Remove</button></span>
              : initial?.audio ? <span className="text-caption text-[var(--muted)]">Saved recording, {initial.audio.seconds.toFixed(1)}s</span>
              : <span className="text-caption text-[var(--muted)]">mp3, wav, m4a or aac, up to 3 minutes</span>}
          </div>
          <div className="mt-4"><Toggle checked={noMusic} onChange={setNoMusic} label="No music bed (I will mix my own)" /></div>
        </Panel>

        {error && <Alert tone="danger">{error}</Alert>}
        <div className="flex flex-wrap items-end gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
          <Input label="Name" hint="Lowercase letters, numbers and dashes" value={name} onChange={(e) => setName(e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, "-"))} placeholder="safe-to-spend-explainer" containerClassName="min-w-[240px] flex-1" />
          <Button variant="commit" disabled={!plan || !name || saving} onClick={save}>{saving ? "Saving" : initial ? "Save changes" : "Save to library"}</Button>
        </div>
      </div>

      <div className="space-y-4 xl:sticky xl:top-6 xl:self-start">
        <Panel title="Pace" description={timing ? timing.decision : "Write a script to see how it fits."}>
          <div className="flex items-center gap-3">
            <div className="relative h-2 flex-1 rounded-full bg-[var(--surface-muted)]">
              <div className="absolute inset-y-0 rounded-full bg-[var(--success-soft)]" style={{ left: `${(SPEAK * 0.6 / 5) * 100}%`, width: `${((SPEAK * 1.3 - SPEAK * 0.6) / 5) * 100}%` }} />
              <div className="absolute -top-1 h-4 w-1 rounded-full bg-[var(--text)]" style={{ left: `${Math.min(100, (pace / 5) * 100)}%` }} />
            </div>
            <Badge tone={paceTone}>{total ? `${pace.toFixed(1)} words/s` : "—"}</Badge>
          </div>
          {timing && <p className="mt-2 text-caption text-[var(--muted)]">{timing.because}</p>}
        </Panel>

        <Panel title="Preview" description={planning ? "Re-cutting…" : plan ? `${shots.length} shots, ${(plan.durationInFrames / 30).toFixed(1)}s` : "Appears as you type."}>
          {plan ? <FilmPlayer film={plan} maxHeight={480} /> : <div className="flex aspect-[9/16] max-h-[480px] items-center justify-center rounded-xl bg-[var(--surface-muted)] text-caption text-[var(--muted)]">No script yet</div>}
        </Panel>

        {plan && (
          <Panel title="Shot list" description="Every shot, what it shows and why. The bar is the film, to scale.">
            <div className="flex h-3 overflow-hidden rounded-full">
              {shots.map((s, i) => <div key={i} title={`${VISUAL[s.kind]?.label}: ${s.id}`} style={{ flexGrow: s.dur, background: VISUAL[s.kind]?.color ?? "var(--muted)", opacity: 0.35 + (i % 2) * 0.35 }} />)}
            </div>
            <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
              {Object.entries(VISUAL).filter(([k]) => shots.some((s) => s.kind === k)).map(([k, v]) => (
                <span key={k} className="inline-flex items-center gap-1 text-caption text-[var(--muted)]"><span className="h-2 w-2 rounded-full" style={{ background: v.color }} />{v.label}</span>
              ))}
            </div>
            <ol className="studio-scroll mt-3 max-h-[420px] space-y-2 overflow-y-auto">
              {shots.map((s, i) => (
                <li key={i} className="flex gap-2.5 rounded-lg border border-[var(--border)] p-2.5">
                  <span className="tabular w-11 shrink-0 text-caption font-semibold">{timecode(s.from)}</span>
                  {s.screen && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={`/${s.screen.src}`} alt="" className="h-[60px] w-[29px] shrink-0 rounded border border-[var(--border)] object-cover object-top" />
                  )}
                  <div className="min-w-0">
                    <p className="text-caption font-semibold">{VISUAL[s.kind]?.label ?? s.kind}</p>
                    <p className="text-caption text-[var(--muted)]">“{s.captions?.length ? s.captions.map((c) => c.text).join(" ") : s.copy[0]?.text}”</p>
                  </div>
                </li>
              ))}
            </ol>
          </Panel>
        )}
      </div>
    </div>
  );
}
