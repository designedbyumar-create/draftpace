/**
 * Generating My Trip Book, in the browser.
 *
 * This module imports @react-pdf/renderer and is therefore only ever
 * reached through a dynamic import, never from the main bundle. Same
 * discipline as every sibling's own printables.
 */
import { Font, pdf } from "@react-pdf/renderer";
import { TripBookDocument, type TripBookManifest } from "./document";

let fontsRegistered = false;

function registerFonts() {
  if (fontsRegistered) return;
  Font.register({ family: "Newsreader", src: "/fonts/Newsreader.ttf" });
  Font.register({ family: "PlexSans", src: "/fonts/IBMPlexSans.ttf" });
  // The document sets its own line breaks; hyphenation would fight the
  // measured layout.
  Font.registerHyphenationCallback((word: string) => [word]);
  fontsRegistered = true;
}

function bookFilename(): string {
  const stamp = new Date().toISOString().slice(0, 10);
  return `my-trip-book-${stamp}.pdf`;
}

export async function downloadTripBook(manifest: TripBookManifest): Promise<void> {
  registerFonts();

  const blob = await pdf(TripBookDocument({ manifest })).toBlob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = bookFilename();
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
