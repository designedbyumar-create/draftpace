"use client";

import { User } from "@/design-system/Icon";
import PhaseZeroModule from "./PhaseZeroModule";

/**
 * Kids: one child at a time. Setting them up, what they are learning,
 * their plan, checking them, and their own record all live behind here,
 * because they are the same question asked at different moments. Built
 * in phase 1.
 */
export default function KidsModule() {
  return (
    <PhaseZeroModule
      eyebrow="Kids"
      title="Your children."
      icon={User}
      description="Adding a child, saying what they are learning, and checking what they have understood all happen here. You have not added anybody yet."
    />
  );
}
