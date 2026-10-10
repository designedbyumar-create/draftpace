import { notFound } from "next/navigation";
import { getFilm } from "~/lib/server/engine";
import { readState } from "~/lib/server/store";
import { jobStatus } from "~/lib/server/jobs";
import { publishCopy } from "~/lib/publish";
import { STRUCTURE_NAMES } from "~/lib/server/catalog";
import { productLine } from "@engine/src/shop-listings";
import { THEMES } from "@engine/src/theme-registry";
import { PLATFORMS } from "@engine/director/platforms";
import { GUIDES } from "@/content/guides";
import FilmWorkspace from "./FilmWorkspace";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return { title: getFilm(id)?.film.angle.text ?? "Film" };
}

export default async function FilmPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const entry = getFilm(id);
  if (!entry) notFound();
  const { film } = entry;
  const state = readState();
  const productName = productLine(film.product).name;
  const guide = film.guide ? GUIDES.find((g) => g.slug === film.guide) : undefined;
  return (
    <FilmWorkspace
      film={film}
      kind={entry.kind}
      doc={entry.doc}
      rendered={entry.rendered}
      review={state.reviews[film.id] ?? null}
      schedule={state.schedule.filter((p) => p.filmId === film.id)}
      job={jobStatus(film.id).latest}
      copy={publishCopy(film, { productName, guideDek: guide?.dek })}
      meta={{
        productName, accent: THEMES[film.product].accent, platformLabel: PLATFORMS[film.platform].label,
        structureName: STRUCTURE_NAMES[film.structure] ?? film.structure, guideTitle: guide?.title ?? null,
      }}
    />
  );
}
