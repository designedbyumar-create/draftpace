/**
 * The loading-state primitive: a shimmering placeholder shaped like the
 * content that's coming, never bare "Loading…" text. A page that shows
 * a sentence of grey text while real content is a fully-laid-out block
 * reads as a website refreshing; a page that shows the shape of what's
 * about to appear reads as an app that already knows what it's about to
 * show you. Pairs with EmptyState (the "nothing here" primitive) and
 * Alert (the "something's wrong" primitive) as the third honest state
 * every async surface needs.
 */
export default function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-[var(--surface-muted)] ${className}`} aria-hidden />;
}

/** A row shaped like SettingsRow/Billing/Notifications' real rows: label + description, maybe a trailing control. */
export function SkeletonRow({ withControl = false }: { withControl?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-3.5 w-32" />
        <Skeleton className="h-3 w-48" />
      </div>
      {withControl && <Skeleton className="h-8 w-20 shrink-0 rounded-lg" />}
    </div>
  );
}

/** A row shaped like LibraryShelfCard: icon, title + description, action. */
export function SkeletonProductRow() {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3.5 py-3">
      <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-3 w-56" />
      </div>
      <Skeleton className="h-8 w-8 shrink-0 rounded-lg" />
      <Skeleton className="h-8 w-20 shrink-0 rounded-lg" />
    </div>
  );
}
