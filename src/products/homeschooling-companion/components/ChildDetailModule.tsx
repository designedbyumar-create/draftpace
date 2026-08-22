"use client";

import { User } from "@/design-system/Icon";
import PhaseZeroModule from "./PhaseZeroModule";

/**
 * One child, on their own page.
 *
 * Product-local by construction, exactly like Home Base's item detail
 * page: the destination registry has no per-entity detail pattern, and
 * inventing one for a second consumer that does not exist yet would be
 * designing for a hypothetical. Reached only from Kids.
 *
 * This is where "Check Emma" lives, at the top and not in a menu,
 * because checking is a feature of the Companion reached where the
 * parent is already looking at that child. Built in phases 1 and 5.
 */
export default function ChildDetailModule({ childId }: { childId: string }) {
  return (
    <PhaseZeroModule
      eyebrow="Kids"
      title="One child."
      icon={User}
      // The id is deliberately not shown to the parent. It is carried so
      // the route is real and provably scoped from phase 0 onward.
      description={`What this child is learning, their plan, their record, and checking what they have understood all live here. Nothing is set up for them yet (${childId.slice(0, 8)}).`}
    />
  );
}
