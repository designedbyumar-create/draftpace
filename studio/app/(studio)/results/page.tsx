import Link from "next/link";
import Alert from "@/design-system/Alert";
import Badge from "@/design-system/Badge";
import EmptyState from "@/design-system/EmptyState";
import { ChartBar } from "@/design-system/Icon";
import { readState } from "~/lib/server/store";
import { summaries } from "~/lib/server/catalog";
import { platformMeta } from "~/lib/publish";
import { PageHeader, Panel, Stat, Swatch } from "~/components/ui";

export const metadata = { title: "Results" };

export default function ResultsPage() {
  const { schedule } = readState();
  const films = new Map(summaries().map((f) => [f.id, f]));
  const posted = schedule.filter((p) => p.status === "posted");
  const bySource = new Map<string, number>();
  posted.forEach((p) => bySource.set(platformMeta(p.platform).label, (bySource.get(platformMeta(p.platform).label) ?? 0) + 1));
  const ga = !!process.env.GA4_PROPERTY_ID;
  return (
    <>
      <PageHeader
        title="Results"
        description="Which platform and which piece actually sends people to Draftpace. Every link Studio drafts is tagged with its platform and film, so the site's analytics can tell them apart."
      />
      {!ga && (
        <Alert tone="info" title="Visits are not connected yet">
          The tags are already on every link. Numbers appear here once Studio can read the site&apos;s Google Analytics (a GA4 property ID and a service account with read access). Until then, this page lists what has gone out and the exact link each one used.
        </Alert>
      )}
      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Posted" value={posted.length} hint="Marked posted on the calendar" />
        <Stat label="Scheduled" value={schedule.length - posted.length} />
        <Stat label="Platforms used" value={bySource.size} />
        <Stat label="Visits" value="Not connected" hint="Arrives with Google Analytics" />
      </div>
      <Panel className="mt-4" title="Tracked links" description="Each post's link, as it went out. utm_source is the platform, utm_campaign the film.">
        {schedule.length ? (
          <div className="studio-scroll overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-body-sm">
              <thead className="text-caption text-[var(--muted)]"><tr className="border-b border-[var(--border)]"><th className="py-2 pr-3 font-semibold">Day</th><th className="py-2 pr-3 font-semibold">Film</th><th className="py-2 pr-3 font-semibold">Platform</th><th className="py-2 pr-3 font-semibold">Status</th><th className="py-2 font-semibold">Link</th></tr></thead>
              <tbody className="divide-y divide-[var(--border)]">
                {schedule.map((p) => {
                  const f = films.get(p.filmId);
                  return (
                    <tr key={p.id}>
                      <td className="tabular py-2.5 pr-3">{p.date}</td>
                      <td className="py-2.5 pr-3"><Link href={`/library/${p.filmId}`} className="flex items-center gap-1.5 font-semibold hover:underline">{f && <Swatch color={f.accent} size={8} />}{f?.productName ?? p.filmId}</Link></td>
                      <td className="py-2.5 pr-3">{platformMeta(p.platform).label}</td>
                      <td className="py-2.5 pr-3">{p.status === "posted" ? <Badge tone="success">Posted</Badge> : <Badge>Scheduled</Badge>}</td>
                      <td className="max-w-[380px] truncate py-2.5 font-mono text-caption text-[var(--muted)]">{p.link}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : <EmptyState icon={ChartBar} title="Nothing has gone out yet" description="Schedule an approved film and its tracked link shows up here." />}
      </Panel>
    </>
  );
}
