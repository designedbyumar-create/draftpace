import Link from "next/link";
import Button from "@/design-system/Button";
import EmptyState from "@/design-system/EmptyState";
import Badge from "@/design-system/Badge";
import { CalendarCheck, Microphone, Sparkles, ArrowRight } from "@/design-system/Icon";
import { summaries } from "~/lib/server/catalog";
import { listGuides, listProducts, platforms } from "~/lib/server/engine";
import { readState } from "~/lib/server/store";
import { jobStatus } from "~/lib/server/jobs";
import { channelStatus } from "~/lib/channels";
import FilmPoster from "~/components/FilmPoster";
import { PageHeader, Panel, Stat, Swatch } from "~/components/ui";

export const metadata = { title: "Today" };

const day = (d: Date) => d.toISOString().slice(0, 10);

export default function TodayPage() {
  const films = summaries();
  const state = readState();
  const today = new Date();
  const in14 = day(new Date(today.getTime() + 14 * 864e5));
  const upcoming = state.schedule.filter((p) => p.status === "scheduled" && p.date >= day(today) && p.date <= in14);
  const toReview = films.filter((f) => !f.review);
  const approved = films.filter((f) => f.review?.status === "approved");
  const approvedUnscheduled = approved.filter((f) => !f.scheduled);
  const rendered = films.filter((f) => f.rendered).length;
  const guides = listGuides();
  const shortsFor = new Set(films.filter((f) => f.kind === "guide").map((f) => f.guide));
  const products = listProducts();
  const allPlatforms = platforms();
  const missing = products.flatMap((p) => allPlatforms.filter((pl) => !films.some((f) => f.kind === "product" && f.product === p.slug && f.platform === pl.id)).map((pl) => ({ product: p, platform: pl })));
  // Guides without a Short, from the areas with the fewest Shorts first, so coverage evens out.
  const perArea = new Map<string, number>();
  films.filter((f) => f.kind === "guide").forEach((f) => { const g = guides.find((x) => x.slug === f.guide); if (g) perArea.set(g.area, (perArea.get(g.area) ?? 0) + 1); });
  const nextGuides = guides
    .filter((g) => g.product && !shortsFor.has(g.slug) && g.locale !== "uk" && g.query)
    .sort((a, b) => (perArea.get(a.area) ?? 0) - (perArea.get(b.area) ?? 0) || a.title.localeCompare(b.title))
    .slice(0, 5);
  const channels = channelStatus();
  const job = jobStatus();

  return (
    <>
      <PageHeader
        eyebrow={today.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        title="Today"
        description="What needs you, what is going out, and what is worth making next."
        actions={<>
          <Button href="/voiceover" variant="secondary" size="sm" iconLeft={<Microphone size={15} />}>Voice-over</Button>
          <Button href="/make" variant="commit" size="sm" iconLeft={<Sparkles size={15} />}>Make</Button>
        </>}
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Stat label="Films planned" value={films.length} hint={`${films.filter((f) => f.kind === "product").length} product · ${films.filter((f) => f.kind === "guide").length} guide · ${films.filter((f) => f.kind === "voiceover").length} voice-over`} />
        <Stat label="Waiting for review" value={toReview.length} hint="Not yet approved or rejected" />
        <Stat label="Approved" value={approved.length} hint={`${approvedUnscheduled.length} not on the calendar`} />
        <Stat label="Rendered" value={`${rendered}`} hint={`of ${films.length}; previews need no render`} />
        <Stat label="Next 14 days" value={upcoming.length} hint="Scheduled posts" />
      </div>

      {job.running && (
        <Link href={`/library/${job.running.filmId}`} className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
          <span className="text-body-sm"><span className="font-semibold">Rendering</span> {job.running.filmId} · {job.running.message}</span>
          <span className="tabular text-caption font-semibold">{job.running.progress}%</span>
        </Link>
      )}

      <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Panel className="xl:col-span-2" title="Needs your eyes" description="Planned films nobody has reviewed yet. Rendered ones first."
          actions={<Link href="/library?status=review" className="text-caption font-semibold text-[var(--primary)]">All {toReview.length}</Link>}>
          {toReview.length ? (
            <ul className="grid grid-cols-3 gap-3 sm:grid-cols-6">
              {[...toReview].sort((a, b) => Number(b.rendered) - Number(a.rendered)).slice(0, 6).map((f) => (
                <li key={f.id}>
                  <Link href={`/library/${f.id}`} className="block rounded-lg transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]">
                    <div className="flex aspect-[9/14] items-center justify-center rounded-lg bg-[var(--surface-muted)] p-1.5"><FilmPoster film={f} compact className="max-h-full w-auto max-w-full" /></div>
                    <p className="mt-1.5 truncate text-caption font-semibold">{f.productName}</p>
                    <p className="truncate text-caption text-[var(--muted)]">{f.platformLabel}</p>
                  </Link>
                </li>
              ))}
            </ul>
          ) : <EmptyState title="All reviewed" description="Every planned film has a decision." />}
        </Panel>

        <Panel title="Going out" description="The next 14 days."
          actions={<Link href="/calendar" className="text-caption font-semibold text-[var(--primary)]">Calendar</Link>}>
          {upcoming.length ? (
            <ul className="space-y-2">
              {upcoming.slice(0, 6).map((p) => {
                const f = films.find((x) => x.id === p.filmId);
                return (
                  <li key={p.id}>
                    <Link href={`/library/${p.filmId}`} className="flex items-center gap-3 rounded-lg border border-[var(--border)] px-3 py-2 hover:border-[var(--border-strong)]">
                      <span className="tabular w-16 shrink-0 text-caption font-semibold">{new Date(`${p.date}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                      <span className="min-w-0"><span className="flex items-center gap-1.5 truncate text-caption font-semibold">{f && <Swatch color={f.accent} size={8} />}{f?.productName}</span><span className="block truncate text-caption text-[var(--muted)]">{f?.platformLabel} · {p.time}</span></span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <EmptyState icon={CalendarCheck} title="Nothing scheduled" description={approvedUnscheduled.length ? `${approvedUnscheduled.length} approved films are ready to schedule.` : "Approve a film, then put it on the calendar."} />
          )}
        </Panel>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Panel className="xl:col-span-2" title="Worth making next" description={`${guides.length - shortsFor.size} guides have no Short yet. These come from the areas with the fewest, so every area gets a voice.`}>
          <ul className="divide-y divide-[var(--border)]">
            {nextGuides.map((g) => (
              <li key={g.slug} className="flex items-center justify-between gap-3 py-2.5">
                <span className="min-w-0">
                  <span className="block truncate text-body-sm font-semibold">{g.title}</span>
                  <span className="block truncate text-caption text-[var(--muted)]">{g.areaLabel} · searched as “{g.query}” · hands over to {products.find((p) => p.slug === g.product)?.name}</span>
                </span>
                <Button href={`/make?guide=${g.slug}`} size="sm" variant="action" iconRight={<ArrowRight size={14} />}>Make a Short</Button>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-caption text-[var(--muted)]">
            {missing.length ? `${missing.length} product and placement pairs have no film yet.` : "Every product has a film on every placement."}
          </p>
        </Panel>

        <Panel title="Channels" description={`${channels.filter((c) => c.connected).length} of ${channels.filter((c) => c.kind === "api").length} posting connections live`}
          actions={<Link href="/channels" className="text-caption font-semibold text-[var(--primary)]">Set up</Link>}>
          <ul className="space-y-1.5">
            {channels.map((c) => (
              <li key={c.id} className="flex items-center justify-between text-body-sm">
                <span>{c.name}</span>
                {c.kind === "manual" ? <Badge>By hand</Badge> : c.connected ? <Badge tone="success">Connected</Badge> : <Badge tone="warning">Not connected</Badge>}
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </>
  );
}
