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
}: {
  children: React.ReactNode;
  className?: string;
  padded?: boolean;
  elevated?: boolean;
}) {
  return (
    <section
      className={`rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] ${
        elevated ? "shadow-[var(--shadow-soft)]" : "shadow-[var(--shadow-xs)]"
      } ${padded ? "p-5" : ""} ${className}`}
    >
      {children}
    </section>
  );
}
