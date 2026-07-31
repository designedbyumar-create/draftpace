/**
 * A restrained bordered surface. Used deliberately, not as the default
 * wrapper for every section — most platform content should sit directly on
 * the page background with typographic hierarchy doing the separating work.
 */
export default function Surface({
  children,
  className = "",
  padded = true,
}: {
  children: React.ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <section
      className={`rounded-xl border border-[var(--border)] bg-[var(--surface)] ${padded ? "p-5" : ""} ${className}`}
    >
      {children}
    </section>
  );
}
