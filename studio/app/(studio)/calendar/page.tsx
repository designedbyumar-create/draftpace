import Link from "next/link";
import Button from "@/design-system/Button";
import EmptyState from "@/design-system/EmptyState";
import { ArrowLeft, ArrowRight, CalendarCheck } from "@/design-system/Icon";
import { summaries } from "~/lib/server/catalog";
import { readState } from "~/lib/server/store";
import FilmPoster from "~/components/FilmPoster";
import { PageHeader, Panel, Swatch } from "~/components/ui";
import PostActions from "./PostActions";

export const metadata = { title: "Calendar" };

const SHORT: Record<string, string> = {
  "instagram-reel": "IG Reel", "instagram-feed": "IG feed", "facebook-feed": "FB feed", "facebook-reel": "FB Reel",
  tiktok: "TikTok", "youtube-short": "YT Short", "pinterest-video": "Pin",
};

export default async function CalendarPage({ searchParams }: { searchParams: Promise<{ m?: string }> }) {
  const { m } = await searchParams;
  const now = new Date();
  const [y, mo] = m && /^\d{4}-\d{2}$/.test(m) ? m.split("-").map(Number) : [now.getFullYear(), now.getMonth() + 1];
  const first = new Date(Date.UTC(y, mo - 1, 1));
  const daysIn = new Date(Date.UTC(y, mo, 0)).getUTCDate();
  const lead = (first.getUTCDay() + 6) % 7; // weeks start on Monday
  const key = (d: number) => `${y}-${String(mo).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  const prev = mo === 1 ? `${y - 1}-12` : `${y}-${String(mo - 1).padStart(2, "0")}`;
  const next = mo === 12 ? `${y + 1}-01` : `${y}-${String(mo + 1).padStart(2, "0")}`;
  const today = now.toISOString().slice(0, 10);

  const films = summaries();
  const byId = new Map(films.map((f) => [f.id, f]));
  const { schedule } = readState();
  const month = schedule.filter((p) => p.date.startsWith(key(1).slice(0, 7)));
  const waiting = films.filter((f) => f.review?.status === "approved" && !f.scheduled);
  const cells = Array.from({ length: Math.ceil((lead + daysIn) / 7) * 7 }, (_, i) => i - lead + 1);

  return (
    <>
      <PageHeader
        title="Calendar"
        description="What goes out, where and when. Posting is by hand until a channel is connected: open a post to download the film and copy its caption and tracked link."
        actions={<div className="flex items-center gap-1">
          <Button href={`/calendar?m=${prev}`} size="sm" variant="ghost" iconLeft={<ArrowLeft size={14} />}>Previous</Button>
          <span className="tabular min-w-[120px] text-center text-body-sm font-semibold">{first.toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" })}</span>
          <Button href={`/calendar?m=${next}`} size="sm" variant="ghost" iconRight={<ArrowRight size={14} />}>Next</Button>
        </div>}
      />
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]">
          <div className="grid grid-cols-7 border-b border-[var(--border)] text-caption font-semibold text-[var(--muted)]">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => <div key={d} className="px-2 py-2">{d}</div>)}
          </div>
          <div className="grid grid-cols-7">
            {cells.map((d, i) => {
              const inMonth = d >= 1 && d <= daysIn;
              const posts = inMonth ? month.filter((p) => p.date === key(d)) : [];
              return (
                <div key={i} className={`min-h-[112px] border-b border-r border-[var(--border)] p-1.5 ${inMonth ? "" : "bg-[var(--surface-muted)]"} ${(i + 1) % 7 === 0 ? "border-r-0" : ""}`}>
                  {inMonth && <p className={`tabular mb-1 inline-flex h-6 w-6 items-center justify-center rounded-full text-caption font-semibold ${key(d) === today ? "bg-[var(--primary)] text-[var(--primary-contrast)]" : "text-[var(--muted)]"}`}>{d}</p>}
                  <ul className="space-y-1">
                    {posts.map((p) => {
                      const f = byId.get(p.filmId);
                      return (
                        <li key={p.id} className={`group rounded-md border px-1.5 py-1 text-[11px] leading-tight ${p.status === "posted" ? "border-[var(--success)] bg-[var(--success-soft)]" : "border-[var(--border)] bg-[var(--surface)]"}`}>
                          <Link href={`/library/${p.filmId}`} className="block">
                            <span className="flex items-center gap-1 font-semibold">{f && <Swatch color={f.accent} size={6} />}<span className="truncate">{f?.productName ?? p.filmId}</span></span>
                            <span className="text-[var(--muted)]">{SHORT[p.platform] ?? p.platform} · {p.time}</span>
                          </Link>
                          <PostActions id={p.id} status={p.status} />
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>

        <Panel title="Approved, not scheduled" description="Ready to go out. Open one to pick its day.">
          {waiting.length ? (
            <ul className="space-y-2">
              {waiting.map((f) => (
                <li key={f.id}>
                  <Link href={`/library/${f.id}`} className="flex items-center gap-3 rounded-lg border border-[var(--border)] p-2 hover:border-[var(--border-strong)]">
                    <div className="w-10 shrink-0"><FilmPoster film={f} compact /></div>
                    <span className="min-w-0"><span className="block truncate text-caption font-semibold">{f.productName}</span><span className="block truncate text-caption text-[var(--muted)]">{f.platformLabel}</span></span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : <EmptyState icon={CalendarCheck} title="Nothing waiting" description="Approve films in the Library and they wait here for a day." />}
        </Panel>
      </div>
    </>
  );
}
