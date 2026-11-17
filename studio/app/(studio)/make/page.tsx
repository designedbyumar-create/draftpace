import { listProducts, listGuides, platforms, areas } from "~/lib/server/engine";
import { summaries } from "~/lib/server/catalog";
import { PageHeader } from "~/components/ui";
import Maker from "./Maker";

export const metadata = { title: "Make" };

export default async function MakePage({ searchParams }: { searchParams: Promise<{ product?: string; guide?: string }> }) {
  const q = await searchParams;
  const made = summaries();
  const guidesMade = new Set(made.filter((f) => f.guide && f.kind === "guide").map((f) => f.guide!));
  return (
    <>
      <PageHeader
        eyebrow="Make"
        title="What should this piece be about?"
        description="Pick a product or a guide, where it will go and what it is for. The director plans a film from real copy and real screens, avoiding everything already in the library. Watch it before you save it."
      />
      <Maker
        products={listProducts()}
        guides={listGuides().filter((g) => g.product).map((g) => ({ ...g, made: guidesMade.has(g.slug) }))}
        platforms={platforms()}
        areas={areas()}
        initial={{ product: q.product, guide: q.guide }}
      />
    </>
  );
}
