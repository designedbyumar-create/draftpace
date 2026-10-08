/**
 * Which file each sound cue plays, relative to public/. Kept free of any
 * Remotion import so the guard tests (which run without creative's own
 * dependencies) can check every cue a shot uses has a real file.
 */
export const SFX_CUES = {
  "click-settle": "audio/click-settle.wav",
  "whoosh-sweep": "audio/whoosh-sweep.wav",
  "chime-reveal": "audio/chime-reveal.wav",
} as const;

export const BED = "audio/bed-relaxation-05.mp3";
