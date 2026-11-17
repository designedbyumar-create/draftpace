"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import type { PlayerRef } from "@remotion/player";
import Button from "@/design-system/Button";
import Badge from "@/design-system/Badge";
import Textarea from "@/design-system/Textarea";
import Input from "@/design-system/Input";
import Tabs, { TabPanel } from "@/design-system/Tabs";
import { ArrowLeft, CalendarCheck, Check, Download, FilmStrip, Play, Trash2, X } from "@/design-system/Icon";
import FilmPlayer from "~/components/FilmPlayer";
import { KindBadge, Panel, Swatch, timecode, seconds } from "~/components/ui";
import CopyField from "~/components/CopyField";
import type { Film } from "@engine/director/film";
import type { Review, ScheduleItem, JobRecord, ReviewStatus } from "~/lib/server/store";
import type { PublishCopy } from "~/lib/publish";
import { setReview, renderFilm, scheduleFilm, unschedule } from "../../actions";

type Meta = { productName: string; accent: string; platformLabel: string; structureName: string; guideTitle: string | null };

const KIND_LABEL: Record<string, string> = { title: "Type", list: "List", phone: "Real screen", split: "Split", live: "Live component", brand: "Name reveal", cta: "End card", contrast: "Contrast" };

function sourceLabel(source: string): string {
  if (source === "micro") return "connective";
  if (source === "title") return "product name";
  if (source.startsWith("guide:")) return "guide";
  if (source.startsWith("vo:")) return "your script";
  if (source.startsWith("screen:")) return "on the screen";
  return "listing";
}

export default function FilmWorkspace({ film, kind, doc, rendered, review, schedule, job, copy, meta }: {
  film: Film; kind: string; doc: string; rendered: { bytes: number; at: string } | null; review: Review | null;
  schedule: ScheduleItem[]; job: JobRecord | null; copy: PublishCopy; meta: Meta;
}) {
  const player = useRef<PlayerRef>(null);
  const [frame, setFrame] = useState(0);
  const [tab, setTab] = useState("script");
  const [view, setView] = useState<"live" | "file">("live");

  useEffect(() => {
    const p = player.current;
    if (!p) return;
    const on = (e: { detail: { frame: number } }) => setFrame(e.detail.frame);
    p.addEventListener("frameupdate", on);
    return () => p.removeEventListener("frameupdate", on);
  }, [view]);

  const current = film.scenes.reduce((at, s, i) => (frame >= s.from ? i : at), 0);
  const seek = (f: number) => { setView("live"); player.current?.seekTo(f); player.current?.play(); };

  return (
    <div>
      <Link href="/library" className="inline-flex items-center gap-1.5 text-caption font-semibold text-[var(--muted)] hover:text-[var(--text)]"><ArrowLeft size={14} />Library</Link>
      <div className="mt-3 flex flex-col gap-1">
        <h1 className="max-w-[60ch] text-heading-sm font-semibold tracking-tight">{film.angle.text}</h1>
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-body-sm text-[var(--muted)]">
          <span className="inline-flex items-center gap-1.5 font-semibold text-[var(--text)]"><Swatch color={meta.accent} />{meta.productName}</span>
          <span>·</span><span>{meta.platformLabel}</span><span>·</span><span className="tabular">{seconds(film.durationInFrames)}</span>
          <span>·</span><span>{meta.structureName}</span>
          <KindBadge kind={kind} />
        </p>
        {meta.guideTitle && <p className="text-caption text-[var(--muted)]">Teaches from the guide “{meta.guideTitle}”</p>}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,400px)_minmax(0,1fr)] xl:grid-cols-[minmax(0,440px)_minmax(0,1fr)]">
        <div className="lg:sticky lg:top-6 lg:self-start">
          {rendered && (
            <div role="tablist" aria-label="Preview" className="mb-3 flex rounded-lg border border-[var(--border)] bg-[var(--surface)] p-0.5">
              {(["live", "file"] as const).map((v) => (
                <button key={v} role="tab" aria-selected={view === v} onClick={() => setView(v)}
                  className={`flex-1 rounded-md px-3 py-1.5 text-caption font-semibold ${view === v ? "bg-[var(--primary-soft)] text-[var(--primary)]" : "text-[var(--muted)]"}`}>
                  {v === "live" ? "Live preview" : "Rendered file"}
                </button>
              ))}
            </div>
          )}
          {view === "live" || !rendered ? (
            <FilmPlayer ref={player} film={film} maxHeight={680} />
          ) : (
            <video src={`/api/films/${film.id}/video`} controls playsInline className="mx-auto max-h-[680px] rounded-xl bg-black" style={{ aspectRatio: `${film.width} / ${film.height}` }} />
          )}
          <p className="mt-2 text-center text-caption text-[var(--faint)]">
            {view === "live" ? "The real composition, playing live. What plays here is what renders." : `Mastered file, rendered ${new Date(rendered!.at).toLocaleString()}.`}
          </p>
        </div>

        <div className="min-w-0 space-y-4">
          <ReviewPanel filmId={film.id} review={review} />
          <div className="grid gap-4 xl:grid-cols-2">
            <RenderPanel filmId={film.id} rendered={rendered} initialJob={job} />
            <SchedulePanel filmId={film.id} schedule={schedule} caption={copy.caption} />
          </div>

          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)]">
            <div className="border-b border-[var(--border)] px-3 pt-2">
              <Tabs
                tabs={[{ id: "script", label: `Script · ${film.scenes.length} scenes` }, { id: "decisions", label: "Decisions" }, { id: "publish", label: "Publish copy" }, { id: "treatment", label: "Treatment" }]}
                activeId={tab}
                onChange={setTab}
                idPrefix="film"
              />
            </div>
            <div className="p-4">
              <TabPanel id="script" activeId={tab} idPrefix="film">
                <ol className="space-y-2">
                  {film.scenes.map((s, i) => {
                    const words = [s.eyebrow, ...s.copy, s.caption].filter(Boolean) as { text: string; source: string }[];
                    return (
                      <li key={s.id + i}>
                        <button onClick={() => seek(s.from)} aria-current={current === i ? "step" : undefined}
                          className={`flex w-full gap-3 rounded-lg border p-3 text-left transition ${current === i ? "border-[var(--primary)] bg-[var(--primary-soft)]" : "border-[var(--border)] hover:border-[var(--border-strong)]"}`}>
                          <div className="w-14 shrink-0">
                            <p className="tabular text-caption font-semibold">{timecode(s.from)}</p>
                            <p className="tabular text-caption text-[var(--faint)]">{(s.dur / 30).toFixed(1)}s</p>
                          </div>
                          {s.screen && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={`/${s.screen.src}`} alt="" className="h-[84px] w-[40px] shrink-0 rounded-[6px] border border-[var(--border)] object-cover object-top" />
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="flex flex-wrap items-center gap-1.5 text-caption font-semibold">
                              <span>{i + 1}. {KIND_LABEL[s.kind] ?? s.kind}</span>
                              <span className="font-normal text-[var(--faint)]">{s.variant} · {s.ground} ground · in by {s.transition}</span>
                            </p>
                            {words.map((w, k) => (
                              <p key={k} className="mt-1 text-body-sm">“{w.text}” <span className="text-caption text-[var(--faint)]">{sourceLabel(w.source)}</span></p>
                            ))}
                            {s.live && <p className="mt-1 text-body-sm">Live {s.live === "safeToSpendCard" ? "safe-to-spend card" : "next-action card"}, computing the demo month</p>}
                            {!!s.captions?.length && <p className="mt-1 text-body-sm text-[var(--muted)]">Voice: “{s.captions.map((c) => c.text).join(" ")}”</p>}
                            <p className="mt-1.5 text-caption text-[var(--muted)]">{s.why}</p>
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ol>
              </TabPanel>
              <TabPanel id="decisions" activeId={tab} idPrefix="film">
                <dl className="divide-y divide-[var(--border)]">
                  {film.reasoning.map((r, i) => (
                    <div key={i} className="grid gap-1 py-2.5 sm:grid-cols-[120px_1fr]">
                      <dt className="text-caption font-semibold text-[var(--muted)]">{r.topic}</dt>
                      <dd><p className="text-body-sm font-semibold">{r.decision}</p><p className="mt-0.5 text-caption text-[var(--muted)]">{r.because}</p></dd>
                    </div>
                  ))}
                </dl>
              </TabPanel>
              <TabPanel id="publish" activeId={tab} idPrefix="film">
                <p className="mb-3 text-caption text-[var(--muted)]">Drafted from the film&apos;s own words for {copy.platform}. Edit before posting. {copy.linkNote}</p>
                <div className="space-y-3">
                  {copy.title && <CopyField label="Title" value={copy.title} />}
                  <CopyField label="Caption" value={copy.caption} multiline />
                  <CopyField label="Alt text" value={copy.altText} multiline />
                  <CopyField label="Tracked link" value={copy.link} />
                </div>
              </TabPanel>
              <TabPanel id="treatment" activeId={tab} idPrefix="film">
                <pre className="studio-scroll max-h-[560px] overflow-auto whitespace-pre-wrap rounded-lg bg-[var(--surface-muted)] p-3 font-mono text-caption leading-relaxed">{doc}</pre>
              </TabPanel>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const REVIEW_LABEL: Record<ReviewStatus, { label: string; tone: "success" | "warning" | "danger" }> = {
  approved: { label: "Approved", tone: "success" },
  changes: { label: "Changes asked", tone: "warning" },
  rejected: { label: "Rejected", tone: "danger" },
};

function ReviewPanel({ filmId, review }: { filmId: string; review: Review | null }) {
  const [note, setNote] = useState(review?.note ?? "");
  const [pending, start] = useTransition();
  const act = (status: ReviewStatus | null) => start(() => setReview(filmId, status, note));
  return (
    <Panel
      title="Review"
      description={review ? <>Marked <Badge tone={REVIEW_LABEL[review.status].tone}>{REVIEW_LABEL[review.status].label}</Badge> {new Date(review.at).toLocaleString()}</> : "Watch it, read the script, then decide."}
      actions={review && <Button size="sm" variant="ghost" onClick={() => act(null)} disabled={pending}>Clear</Button>}
    >
      <Textarea label="Note (optional)" rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="What to change, or why it is good to go" />
      <div className="mt-3 flex flex-wrap gap-2">
        <Button size="sm" variant="commit" iconLeft={<Check size={15} />} onClick={() => act("approved")} disabled={pending}>Approve</Button>
        <Button size="sm" variant="secondary" onClick={() => act("changes")} disabled={pending}>Ask for changes</Button>
        <Button size="sm" variant="ghost" iconLeft={<X size={15} />} onClick={() => act("rejected")} disabled={pending}>Reject</Button>
      </div>
    </Panel>
  );
}

function RenderPanel({ filmId, rendered, initialJob }: { filmId: string; rendered: { bytes: number; at: string } | null; initialJob: JobRecord | null }) {
  const [job, setJob] = useState(initialJob);
  const [file, setFile] = useState(rendered);
  const [pending, start] = useTransition();
  const running = job?.status === "running";

  useEffect(() => {
    if (!running && !pending) return;
    const t = setInterval(async () => {
      const r = await fetch(`/api/jobs?film=${filmId}`).then((x) => x.json());
      setJob(r.latest);
      setFile(r.rendered);
    }, 1500);
    return () => clearInterval(t);
  }, [running, pending, filmId]);

  return (
    <Panel title="Render" description={file ? `Mastered mp4, ${(file.bytes / 1e6).toFixed(1)} MB` : "Not rendered yet. The live preview needs no render."}>
      {running && job ? (
        <div>
          <div className="h-2 overflow-hidden rounded-full bg-[var(--surface-muted)]"><div className="h-full rounded-full bg-[var(--primary)] transition-[width]" style={{ width: `${job.progress}%` }} /></div>
          <p className="tabular mt-2 text-caption text-[var(--muted)]">{job.message}</p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {file && <Button size="sm" variant="commit" href={`/api/films/${filmId}/video?download=1`} iconLeft={<Download size={15} />}>Download mp4</Button>}
          <Button size="sm" variant={file ? "secondary" : "commit"} iconLeft={<FilmStrip size={15} />} disabled={pending}
            onClick={() => start(async () => { await renderFilm(filmId); setJob({ id: "", filmId, startedAt: new Date().toISOString(), status: "running", progress: 0, message: "Queued" }); })}>
            {file ? "Render again" : "Render"}
          </Button>
          {job?.status === "failed" && <p className="w-full text-caption text-[var(--danger)]">Last render failed: {job.message}</p>}
        </div>
      )}
    </Panel>
  );
}

function SchedulePanel({ filmId, schedule, caption }: { filmId: string; schedule: ScheduleItem[]; caption: string }) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("09:00");
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  return (
    <Panel title="Schedule" description={schedule.length ? `${schedule.length} on the calendar` : "Put it on the calendar with its caption."}>
      {schedule.length > 0 && (
        <ul className="mb-3 space-y-1.5">
          {schedule.map((p) => (
            <li key={p.id} className="flex items-center justify-between gap-2 rounded-md bg-[var(--surface-muted)] px-2.5 py-1.5 text-caption">
              <span className="tabular font-semibold">{p.date} {p.time}</span>
              <span className="flex items-center gap-2">
                {p.status === "posted" ? <Badge tone="success">Posted</Badge> : <Badge>Scheduled</Badge>}
                <button aria-label="Remove from calendar" onClick={() => start(() => unschedule(p.id))} className="text-[var(--faint)] hover:text-[var(--danger)]"><Trash2 size={14} /></button>
              </span>
            </li>
          ))}
        </ul>
      )}
      {open ? (
        <form className="space-y-2" onSubmit={(e) => { e.preventDefault(); start(async () => { await scheduleFilm({ filmId, date, time, caption }); setOpen(false); }); }}>
          <div className="grid grid-cols-2 gap-2">
            <Input label="Day" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            <Input label="Time" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
          </div>
          <div className="flex gap-2">
            <Button size="sm" type="submit" variant="commit" disabled={pending || !date}>Add to calendar</Button>
            <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          </div>
        </form>
      ) : (
        <Button size="sm" variant="secondary" iconLeft={<CalendarCheck size={15} />} onClick={() => setOpen(true)}>Schedule</Button>
      )}
      <p className="mt-2 flex items-center gap-1.5 text-caption text-[var(--faint)]"><Play size={12} />Posting is manual until a channel is connected.</p>
    </Panel>
  );
}
