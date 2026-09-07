"use client";

import { useState } from "react";
import Button from "@/design-system/Button";
import { Download } from "@/design-system/Icon";
import type { HomeItem } from "../../state";

/**
 * Generates and downloads a one-page Item Card for this item on demand,
 * client-side, from its live data. Only ever reaches @react-pdf/renderer
 * via this dynamic import, matching every other generatePdf.tsx in this
 * repo. A self-sufficient printed record (Trump Card Memo's reframe of
 * the founder's original QR-code idea): the card carries every fact
 * itself rather than pointing back at the app.
 */
export default function PrintItemCardButton({ item, typeLabel }: { item: HomeItem; typeLabel: string }) {
  const [working, setWorking] = useState(false);

  async function handleDownload() {
    setWorking(true);
    const { downloadItemCard } = await import("../../printables/generateItemCard");
    await downloadItemCard(item, typeLabel);
    setWorking(false);
  }

  return (
    <Button size="sm" variant="secondary" onClick={handleDownload} disabled={working} iconLeft={<Download size={13} aria-hidden />}>
      {working ? "Preparing…" : "Print card"}
    </Button>
  );
}
