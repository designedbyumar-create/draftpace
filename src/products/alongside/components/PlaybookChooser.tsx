"use client";

import SharedPlaybookChooser from "@/components/product-shell/companion/PlaybookChooser";
import { KIND_LABEL, type LifeItem } from "../life";
import type { Playbook } from "../playbook";
import { playbooksFor } from "../playbooks";

/**
 * Alongside's own binding of the shared chooser. See
 * src/components/product-shell/companion/PlaybookChooser.tsx for the
 * actual screen; this file only supplies this product's own idea of
 * "which playbooks are available", keyed by the item's shape.
 */
export default function PlaybookChooser({
  item,
  onPick,
  onCancel,
}: {
  item: LifeItem;
  onPick: (playbook: Playbook) => void;
  onCancel: () => void;
}) {
  return (
    <SharedPlaybookChooser
      available={playbooksFor(item.kind)}
      emptyLabel={`Nothing here opens for ${KIND_LABEL[item.kind].toLowerCase()}.`}
      onPick={onPick}
      onCancel={onCancel}
    />
  );
}
