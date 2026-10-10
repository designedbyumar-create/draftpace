import Badge from "@/design-system/Badge";
import { CheckCircle2, Lock } from "@/design-system/Icon";
import { channelStatus } from "~/lib/channels";
import { PageHeader } from "~/components/ui";

export const metadata = { title: "Channels" };

export default function ChannelsPage() {
  const channels = channelStatus();
  return (
    <>
      <PageHeader
        title="Channels"
        description="Where Draftpace content goes, what each place is for, and what connecting it takes. A channel shows as connected only when its credentials are actually set. Until then, every piece downloads with its drafted caption and tracked link, ready to post by hand."
      />
      <ul className="grid gap-4 lg:grid-cols-2">
        {channels.map((c) => (
          <li key={c.id} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-body font-semibold">{c.name}</h2>
                <p className="mt-0.5 text-body-sm text-[var(--muted)]">{c.job}</p>
              </div>
              <span className="shrink-0 whitespace-nowrap">{c.kind === "manual" ? <Badge>By hand, on purpose</Badge> : c.connected ? <Badge tone="success">Connected</Badge> : <Badge tone="warning">Not connected</Badge>}</span>
            </div>
            <p className="mt-3 text-body-sm"><span className="font-semibold">Posts:</span> {c.posts}</p>
            <p className="mt-3 text-caption font-semibold text-[var(--muted)]">{c.kind === "manual" ? "The rules" : "To connect"}</p>
            <ul className="mt-1 space-y-1">
              {c.needs.map((n) => (
                <li key={n} className="flex gap-2 text-body-sm">
                  {c.connected ? <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-[var(--success)]" /> : <Lock size={15} className="mt-0.5 shrink-0 text-[var(--faint)]" />}
                  {n}
                </li>
              ))}
            </ul>
            {c.env.length > 0 && (
              <p className="mt-3 text-caption text-[var(--faint)]">Studio reads <span className="font-mono">{c.env.join(", ")}</span> from its environment.</p>
            )}
            {!c.connected && <p className="mt-3 rounded-md bg-[var(--surface-muted)] px-3 py-2 text-caption text-[var(--muted)]"><span className="font-semibold text-[var(--text)]">Meanwhile:</span> {c.meanwhile}</p>}
          </li>
        ))}
      </ul>
    </>
  );
}
