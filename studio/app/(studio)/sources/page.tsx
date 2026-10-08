import { listProducts, listGuides, areas } from "~/lib/server/engine";
import { summaries } from "~/lib/server/catalog";
import { PageHeader } from "~/components/ui";
import SourcesView from "./SourcesView";

export const metadata = { title: "Sources" };

export default async function SourcesPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab } = await searchParams;
  const films = summaries();
  const count = (pred: (f: (typeof films)[number]) => boolean) => films.filter(pred).length;
  return (
    <>
      <PageHeader
        title="Sources"
        description="Everything Studio makes comes from here: the 9 products (their Shop listings, screens and live components) and the guides on the site. Edit them on the website, and the engine re-plans from the new words."
      />
      <SourcesView
        tab={tab === "guides" ? "guides" : "products"}
        products={listProducts().map((p) => ({
          ...p,
          productFilms: count((f) => f.kind === "product" && f.product === p.slug),
          guideFilms: count((f) => f.kind === "guide" && f.product === p.slug),
          voiceFilms: count((f) => f.kind === "voiceover" && f.product === p.slug),
          approved: count((f) => f.product === p.slug && f.review?.status === "approved"),
        }))}
        guides={listGuides().map((g) => ({ ...g, films: films.filter((f) => f.guide === g.slug).map((f) => f.id) }))}
        areas={areas()}
      />
    </>
  );
}
