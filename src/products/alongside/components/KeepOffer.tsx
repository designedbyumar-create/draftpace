import Button from "@/design-system/Button";

/**
 * Asked after a run that started from nothing, and only ever asked. Somebody
 * who opened this to get one call done has not asked for a system, and
 * silently starting one for them is how a helpful product becomes another
 * list to feel behind on.
 */
export default function KeepOffer({
  title,
  pending,
  onKeep,
  onDecline,
}: {
  title: string;
  pending: boolean;
  onKeep: () => void;
  onDecline: () => void;
}) {
  return (
    <section aria-label="Keep this" className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
      <p className="text-[15px] leading-6 text-[var(--text)]">Want me to hold on to this?</p>
      <p className="mt-1.5 text-[14px] leading-6 text-[var(--muted)]">{title}</p>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button variant="commit" size="sm" onClick={onKeep} disabled={pending}>
          Keep it
        </Button>
        <Button size="sm" variant="ghost" onClick={onDecline} disabled={pending}>
          No need
        </Button>
      </div>
    </section>
  );
}
