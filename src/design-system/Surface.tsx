/**
 * A material surface: a clean raised plane with a hairline border and a subtle
 * contact shadow, so it reads as a real card lifted off the warm page rather
 * than an outline drawn on a flat background. Still used deliberately, not as
 * the default wrapper for every section. Pass `elevated` for a focal card that
 * should sit further forward.
 */
export default function Surface({
  children,
  className = "",
  padded = true,
  elevated = false,
  id,
}: {
  children: React.ReactNode;
  className?: string;
  padded?: boolean;
  elevated?: boolean;
  /** Optional DOM id — e.g. so a guided tour or "scroll to" action can target this surface. */
  id?: string;
}) {
  return (
    <section
      id={id}
      className={`rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] ${
        elevated ? "shadow-[shadow:var(--shadow-soft)]" : "shadow-[shadow:var(--shadow-xs)]"
      } ${padded ? "p-5" : ""} ${className}`}
    >
      {children}
    </section>
  );
}
