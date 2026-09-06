"use client";

import { useEffect, useRef, useState } from "react";
import Button from "@/design-system/Button";
import Input from "@/design-system/Input";

const READY_COUNTDOWN_START = 5;

/**
 * The ready step, on screen: doing it now, or naming one exact time
 * today. Two answers, not a form, because a third question here ("why
 * not now?") is exactly the kind of follow-up this product does not ask.
 *
 * Its own file, not a branch inside CompanionRun.tsx: the countdown needs
 * a timer, and CompanionRun.tsx is guarded by companion.test.ts to never
 * contain useEffect at all, since a run has previously been created
 * twice from inside one. This component creates no run and saves nothing
 * itself; it only counts down and hands the two answers back up.
 *
 * The countdown is a pace, not a deadline: it counts down once, it never
 * repeats, and nothing about it is stored. Naming a time is not treated
 * as a smaller version of doing it: it ends this step and this run in
 * one action, the same as leaving does, because a time has been named
 * and there is nothing left to prepare for right now.
 */
export default function ReadyStepCard({
  pending,
  onCallNow,
  onNotNow,
}: {
  pending: boolean;
  onCallNow: () => void;
  onNotNow: (time: string) => void;
}) {
  const [phase, setPhase] = useState<"choose" | "counting" | "schedule">("choose");
  const [count, setCount] = useState(READY_COUNTDOWN_START);
  const [time, setTime] = useState("");
  const firedRef = useRef(false);

  useEffect(() => {
    if (phase !== "counting") return;
    if (count <= 0) {
      if (!firedRef.current) {
        firedRef.current = true;
        onCallNow();
      }
      return;
    }
    const timer = setTimeout(() => setCount((current) => current - 1), 1000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, count]);

  if (phase === "counting") {
    return (
      <div className="flex flex-col items-center gap-2 py-6">
        <span className="text-[56px] font-bold leading-none text-[var(--primary)]" aria-live="polite">
          {count > 0 ? count : "Go"}
        </span>
      </div>
    );
  }

  if (phase === "schedule") {
    return (
      <div className="flex flex-col gap-5">
        <Input
          type="time"
          label="What time today?"
          value={time}
          onChange={(event) => setTime(event.target.value)}
          aria-label="What time today?"
        />
        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={() => onNotNow(time)} disabled={pending || time.trim().length === 0}>
            That is the plan
          </Button>
          <Button variant="ghost" onClick={() => setPhase("choose")} disabled={pending}>
            Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        onClick={() => {
          setCount(READY_COUNTDOWN_START);
          firedRef.current = false;
          setPhase("counting");
        }}
        disabled={pending}
      >
        Call now
      </Button>
      <Button variant="secondary" onClick={() => setPhase("schedule")} disabled={pending}>
        Not now
      </Button>
    </div>
  );
}
