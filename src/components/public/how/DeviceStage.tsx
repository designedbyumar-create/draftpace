"use client";

import { useRef } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion";

const MAX_TILT_DEG = 7;

/**
 * Stages a device mockup with a restrained, pointer-driven 3D tilt: the
 * device leans slightly toward the cursor, spring-damped rather than
 * snapping, over a soft ambient glow (the same bg-[var(--primary)]
 * blur-blob language already used in RichSection/detail-page heroes, not
 * a new visual system) and a floating shadow that stays flat on the
 * "ground" while the device above it tilts. Reduced motion: no pointer
 * tracking, no transform at all - the device just sits there, fully
 * visible and static.
 */
export default function DeviceStage({ children }: { children: React.ReactNode }) {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const rotateXRaw = useMotionValue(0);
  const rotateYRaw = useMotionValue(0);
  const rotateX = useSpring(rotateXRaw, { stiffness: 150, damping: 20, mass: 0.5 });
  const rotateY = useSpring(rotateYRaw, { stiffness: 150, damping: 20, mass: 0.5 });

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (reduceMotion || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;
    rotateYRaw.set((px - 0.5) * 2 * MAX_TILT_DEG);
    rotateXRaw.set(-(py - 0.5) * 2 * MAX_TILT_DEG);
  }

  function handlePointerLeave() {
    rotateXRaw.set(0);
    rotateYRaw.set(0);
  }

  return (
    <div className="relative flex items-center justify-center py-4" style={{ perspective: 1200 }}>
      <div
        aria-hidden
        className="pointer-events-none absolute h-[300px] w-[300px] rounded-full bg-[var(--primary)] opacity-[0.09] blur-[100px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-2 h-8 w-[60%] rounded-full bg-black/20 blur-xl dark:bg-black/40"
      />
      <div
        ref={ref}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        className="relative w-full max-w-[260px]"
      >
        <motion.div style={reduceMotion ? undefined : { rotateX, rotateY }}>{children}</motion.div>
      </div>
    </div>
  );
}
