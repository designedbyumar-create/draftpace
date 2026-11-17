import { summaries } from "~/lib/server/catalog";
import { listProducts, platforms } from "~/lib/server/engine";
import { PageHeader } from "~/components/ui";
import Button from "@/design-system/Button";
import { Sparkles } from "@/design-system/Icon";
import LibraryGrid from "./LibraryGrid";

export const metadata = { title: "Library" };

export default async function LibraryPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const q = await searchParams;
  const films = summaries();
  return (
    <>
      <PageHeader
        title="Library"
        description="Every film the engine has planned: product films, guide Shorts and voice-over cuts. Open one to watch it live, read its script and reasons, approve it, render it and schedule it."
        actions={<Button href="/make" variant="commit" size="sm" iconLeft={<Sparkles size={15} />}>Make something</Button>}
      />
      <LibraryGrid
        films={films}
        products={listProducts().map((p) => ({ slug: p.slug, name: p.name }))}
        platforms={platforms().map((p) => ({ id: p.id, label: p.label }))}
        initial={{ kind: q.kind ?? "all", product: q.product ?? "all", platform: q.platform ?? "all", status: q.status ?? "all", q: q.q ?? "" }}
      />
    </>
  );
}
