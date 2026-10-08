/**
 * Remotion entry point.
 *
 * Forces `prefers-reduced-motion: reduce` before anything else imports
 * React, because SafeToSpendCard.tsx (the real component this project
 * renders) calls framer-motion's useReducedMotion() and, in that state,
 * already defines its own deterministic, zero-duration animation path
 * (see design-system/motion.ts: hidden === visible when reduceMotion).
 * That is a real, intentional, already-shipped accessibility mode of the
 * real component — using it here is how a frame-by-frame renderer gets a
 * deterministic result, not a workaround or a fork of the component.
 * Framer-motion's own real-time spring physics are not frame-seekable by
 * Remotion's capture model, so without this, the card's entrance would
 * render inconsistently between frames.
 */
if (typeof window !== "undefined") {
  const realMatchMedia = window.matchMedia?.bind(window);
  window.matchMedia = (query: string) => {
    if (query.includes("prefers-reduced-motion")) {
      return {
        matches: true,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => true,
      } as MediaQueryList;
    }
    return realMatchMedia ? realMatchMedia(query) : ({ matches: false, media: query } as MediaQueryList);
  };
}

import { registerRoot } from "remotion";
import "./style.css";
import "./fonts-inline.css";
import { RemotionRoot } from "./Root";

registerRoot(RemotionRoot);
