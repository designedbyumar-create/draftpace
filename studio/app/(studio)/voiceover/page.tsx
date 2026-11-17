import { listProducts, listGuides, platforms, listVoiceovers } from "~/lib/server/engine";
import { PageHeader } from "~/components/ui";
import { LENGTHS, MIN_SECONDS, MAX_SECONDS } from "@engine/director/voiceover";
import VoiceoverEditor from "./VoiceoverEditor";

export const metadata = { title: "Voice-over" };

const srtTime = (s: number) => {
  const ms = Math.round(s * 1000);
  const h = Math.floor(ms / 3600000), m = Math.floor((ms % 3600000) / 60000), sec = Math.floor((ms % 60000) / 1000);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")},${String(ms % 1000).padStart(3, "0")}`;
};

export default async function VoiceoverPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const { id } = await searchParams;
  const saved = listVoiceovers();
  const editing = saved.find((v) => v.id === id);
  return (
    <>
      <PageHeader
        eyebrow="Voice-over"
        title="Your words, real pictures"
        description="Paste the script you will record (or have recorded). Choose a length, and each line gets the real screen, live component, guide checklist or type that matches it, with your words as captions. Nothing is drawn to illustrate a sentence."
      />
      <VoiceoverEditor
        products={listProducts().map((p) => ({ slug: p.slug, name: p.name, accent: p.accent }))}
        guides={listGuides().filter((g) => g.product).map((g) => ({ slug: g.slug, title: g.title, product: g.product! }))}
        platforms={platforms().filter((p) => p.height > p.width).map((p) => ({ id: p.id, label: p.label, width: p.width, height: p.height }))}
        saved={saved.map((v) => ({ id: v.id, product: v.product, lines: v.lines.length, seconds: v.audio?.seconds ?? v.seconds ?? null, audio: !!v.audio }))}
        lengths={[...LENGTHS]}
        limits={{ min: MIN_SECONDS, max: MAX_SECONDS }}
        initial={editing ? {
          id: editing.id, product: editing.product, guide: editing.guide ?? "", platform: editing.platform,
          seconds: editing.seconds ?? 30, script: editing.lines.join("\n"),
          srt: editing.srt?.map((c, i) => `${i + 1}\n${srtTime(c.start)} --> ${srtTime(c.end)}\n${c.text}`).join("\n\n") ?? "",
          audio: editing.audio ?? null, noMusic: !!editing.noMusic,
        } : null}
      />
    </>
  );
}
