"use client";

import { BookOpen } from "@/design-system/Icon";
import PhaseZeroModule from "./PhaseZeroModule";

/**
 * Record: across time, and the Book. Top level rather than inside a
 * child, because the Book is one of the Companion's most valuable
 * durable outputs and two taps deep is where valuable outputs go to be
 * forgotten. Built in phases 3 and 6.
 */
export default function RecordModule() {
  return (
    <PhaseZeroModule
      eyebrow="Record"
      title="What has happened, and what you could show somebody."
      icon={BookOpen}
      description="Completed work, observations and checks are kept here, and the printable record is made from them. There is nothing recorded yet."
    />
  );
}
