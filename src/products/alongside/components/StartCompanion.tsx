"use client";

import SharedStartCompanion from "@/components/product-shell/companion/StartCompanion";
import type { Playbook } from "../playbook";
import { PLAYBOOKS } from "../playbooks";

/**
 * Alongside's own binding of the shared front door. See
 * src/components/product-shell/companion/StartCompanion.tsx for the
 * actual screen; this file only supplies this product's library and
 * copy.
 */
export default function StartCompanion({
  onStart,
  onCancel,
}: {
  onStart: (playbook: Playbook, title: string | null) => void;
  onCancel?: () => void;
}) {
  return (
    <SharedStartCompanion
      playbooks={PLAYBOOKS}
      placeholder="Call the landlord about the leak"
      onStart={onStart}
      onCancel={onCancel}
    />
  );
}
