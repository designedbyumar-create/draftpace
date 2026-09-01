/**
 * The one skeleton every product sub-route's loading.tsx renders while its
 * RSC payload streams in. Generic on purpose - a page title bar, a stat
 * row, and a few record rows - not tailored to any one section, since
 * Next's file convention needs a loading.tsx per route but they all share
 * this. Rendered inside ProductShell's <main>, so it already inherits the
 * correct width/padding from that shell - no Container/width logic here.
 * Without this, navigating between product sub-pages showed a blank flash
 * while the new page's data loaded - one of the clearest "is this an app
 * or a website" tells on mobile.
 */
export default function ProductPageSkeleton() {
  return (
    <div className="animate-pulse" aria-hidden>
      <div className="h-7 w-40 rounded-md bg-[var(--surface-muted)]" />
      <div className="mt-2.5 h-4 w-64 max-w-full rounded-md bg-[var(--surface-muted)]" />

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-4">
            <div className="h-3 w-16 rounded bg-[var(--surface-muted)]" />
            <div className="mt-2.5 h-5 w-20 rounded bg-[var(--surface-muted)]" />
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-col gap-2.5">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-16 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)]" />
        ))}
      </div>
    </div>
  );
}
