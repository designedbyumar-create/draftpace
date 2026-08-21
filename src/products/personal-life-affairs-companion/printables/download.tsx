/**
 * Generating the copy, in the browser.
 *
 * This module imports @react-pdf/renderer and is therefore only ever
 * reached through a dynamic import from the handover panel, never from
 * the main bundle. Same discipline as Monthly Money Reset's own
 * printable.
 *
 * WHY THE BROWSER AND NOT THE SERVER
 *
 * The document is a person's affairs: where their will is, who decides
 * for them, who to call. Generating it client-side means that assembled
 * picture never exists on a server at all, not even briefly in memory.
 * The data is already here because the person is looking at it. Sending
 * it back out to have a PDF made would be the one moment this product
 * handled the whole picture somewhere it did not need to.
 *
 * Fonts are fetched from /fonts once and cached by the browser.
 * Monthly Money Reset uses the PDF standard faces instead, which costs
 * nothing but would make this document generic, and its typography is
 * the design rather than decoration.
 */
import { Font, pdf } from "@react-pdf/renderer";
import { InOrderDocument } from "./document";
import type { Readiness } from "../completion";

let fontsRegistered = false;

function registerFonts() {
  if (fontsRegistered) return;
  Font.register({ family: "Newsreader", src: "/fonts/Newsreader.ttf" });
  Font.register({ family: "PlexSans", src: "/fonts/IBMPlexSans.ttf" });
  // The document sets its own line breaks; hyphenation would fight the
  // measured layout the same way it did in the Home Survey.
  Font.registerHyphenationCallback((word: string) => [word]);
  fontsRegistered = true;
}

export interface DownloadInputs {
  size: "LETTER" | "A4";
  preparedBy: string;
  readiness: Readiness;
  summary: string;
}

/**
 * Produces the file and hands it to the browser. The filename carries
 * the date, because somebody will end up with more than one copy over
 * the years and needs to tell which is current at a glance.
 */
export async function downloadInOrderCopy({ size, preparedBy, readiness, summary }: DownloadInputs): Promise<void> {
  registerFonts();

  const generatedAt = new Date();
  const blob = await pdf(
    InOrderDocument({ size, preparedBy, readiness, summary, generatedAt })
  ).toBlob();

  const stamp = generatedAt.toISOString().slice(0, 10);
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `in-order-${stamp}.pdf`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
