/**
 * Which file each sound cue plays, relative to public/. Kept free of any
 * Remotion import so the guard tests (which run without creative's own
 * dependencies) can check every cue a shot uses has a real file.
 */
export const SFX_CUES = {
  "click-settle": "audio/click-settle.wav",
  "whoosh-sweep": "audio/whoosh-sweep.wav",
  "chime-reveal": "audio/chime-reveal.wav",
  // Draftpace's own synthesized kit (scripts/synth-sfx.mjs).
  whoosh: "audio/kit/whoosh.wav",
  swish: "audio/kit/swish.wav",
  riser: "audio/kit/riser.wav",
  impact: "audio/kit/impact.wav",
  pop: "audio/kit/pop.wav",
  tap: "audio/kit/tap.wav",
  tick: "audio/kit/tick.wav",
  shimmer: "audio/kit/shimmer.wav",
  settle: "audio/kit/settle.wav",
  page: "audio/kit/page.wav",
} as const;

export const BED = "audio/bed-relaxation-05.mp3";
