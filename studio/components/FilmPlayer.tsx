"use client";

/**
 * The real Film composition, playing live in the browser: the same
 * component the renderer uses, with the same real screens, live product
 * components and sound. What plays here is what renders.
 */
import { Player, type PlayerRef } from "@remotion/player";
import { forwardRef } from "react";
import { FilmComposition } from "@engine/src/compositions/formats/film";
import type { Film } from "@engine/director/film";
import "@engine/src/fonts-inline.css";

// The renderer runs product components in their reduced-motion mode, which is frame-exact (creative/src/index.ts). Match it.
if (typeof window !== "undefined" && !(window as unknown as { __studioReducedMotion?: boolean }).__studioReducedMotion) {
  (window as unknown as { __studioReducedMotion?: boolean }).__studioReducedMotion = true;
  const real = window.matchMedia?.bind(window);
  window.matchMedia = (query: string) =>
    query.includes("prefers-reduced-motion")
      ? ({ matches: true, media: query, onchange: null, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {}, dispatchEvent: () => true } as MediaQueryList)
      : real(query);
}

const FilmPlayer = forwardRef<PlayerRef, { film: Film; autoPlay?: boolean; className?: string; maxHeight?: number }>(function FilmPlayer({ film, autoPlay = false, className = "", maxHeight = 720 }, ref) {
  return (
    <div className={`overflow-hidden rounded-xl bg-black shadow-[0_24px_60px_-30px_rgba(0,0,0,0.6)] ${className}`} style={{ aspectRatio: `${film.width} / ${film.height}`, maxHeight, marginInline: "auto" }}>
      <Player
        ref={ref}
        component={FilmComposition}
        inputProps={{ film }}
        durationInFrames={film.durationInFrames}
        fps={film.fps}
        compositionWidth={film.width}
        compositionHeight={film.height}
        style={{ width: "100%", height: "100%" }}
        controls
        loop
        autoPlay={autoPlay}
        // Open on the first moment the hook is fully on screen, not on frame 0 before any word has arrived.
        initialFrame={Math.min(Math.round(film.scenes[0].dur * 0.7), 60)}
        clickToPlay
        doubleClickToFullscreen
        spaceKeyToPlayOrPause
        acknowledgeRemotionLicense
      />
    </div>
  );
});

export default FilmPlayer;
