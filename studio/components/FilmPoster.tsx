import type { FilmSummary } from "~/lib/server/catalog";

/**
 * A film's card art: its real hook, set in the product's own colours, at
 * the film's own shape. Not a frame of the film (that needs a render) and
 * not an invented image: the words are the film's first words.
 */
export default function FilmPoster({ film, className = "", compact = false }: { film: Pick<FilmSummary, "hook" | "accent" | "bg" | "ink" | "width" | "height" | "productName" | "kind">; className?: string; compact?: boolean }) {
  const dark = film.kind === "guide";
  return (
    <div
      className={`relative flex flex-col justify-between overflow-hidden rounded-lg ${compact ? "p-2" : "p-3"} ${className}`}
      style={{ aspectRatio: `${film.width} / ${film.height}`, background: dark ? film.ink : film.bg, color: dark ? film.bg : film.ink }}
    >
      <span className="h-1.5 w-8 rounded-full" style={{ background: film.accent }} />
      <p className={`line-clamp-5 font-serif font-semibold leading-snug ${compact ? "text-[11px]" : "text-[15px]"}`} style={{ textWrap: "balance" }}>{film.hook}</p>
      {!compact && <p className="truncate text-[10px] font-semibold uppercase tracking-[0.12em] opacity-70">{film.productName}</p>}
    </div>
  );
}
