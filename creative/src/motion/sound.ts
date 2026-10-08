/**
 * Sound cue registry. Real, licensed files now (see public/audio/
 * ATTRIBUTION.md): Mixkit, free commercial license, no attribution
 * required. Downloaded deliberately, four specific files, not a bulk
 * import — nothing here is a placeholder.
 */
import { staticFile } from "remotion";

export type SfxCueId = "click-settle" | "whoosh-sweep" | "chime-reveal";

export const SFX_FILES: Record<SfxCueId, string> = {
  "click-settle": staticFile("audio/click-settle.wav"),
  "whoosh-sweep": staticFile("audio/whoosh-sweep.wav"),
  "chime-reveal": staticFile("audio/chime-reveal.wav"),
};

export const BED_FILE = staticFile("audio/bed-relaxation-05.mp3");

export function hasAudioAsset(cue: string | null | undefined): cue is SfxCueId {
  return Boolean(cue && cue in SFX_FILES);
}
