/**
 * Sound cue registry. Real, licensed files now (see public/audio/
 * ATTRIBUTION.md): Mixkit, free commercial license, no attribution
 * required. Downloaded deliberately, four specific files, not a bulk
 * import — nothing here is a placeholder.
 */
import { staticFile } from "remotion";

import { SFX_CUES, BED } from "./sound-cues";

export type SfxCueId = keyof typeof SFX_CUES;

export const SFX_FILES = Object.fromEntries(
  Object.entries(SFX_CUES).map(([cue, file]) => [cue, staticFile(file)]),
) as Record<SfxCueId, string>;

export const BED_FILE = staticFile(BED);

export function hasAudioAsset(cue: string | null | undefined): cue is SfxCueId {
  return Boolean(cue && cue in SFX_FILES);
}
