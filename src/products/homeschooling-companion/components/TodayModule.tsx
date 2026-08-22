"use client";

import { CalendarCheck } from "@/design-system/Icon";
import PhaseZeroModule from "./PhaseZeroModule";

/**
 * Today: the household, this morning. The one surface where children
 * meet, because "what are we doing today" is a household question.
 * Grouped by child, never interleaved. Built in phase 2.
 */
export default function TodayModule() {
  return (
    <PhaseZeroModule
      eyebrow="Today"
      title="What are we doing today?"
      icon={CalendarCheck}
      description="Once you have added a child and said what they are learning, today's work appears here, grouped by child. Nothing is scheduled for anybody yet."
    />
  );
}
