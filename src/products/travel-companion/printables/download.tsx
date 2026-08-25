/**
 * Generating My Trip Book, in the browser.
 *
 * This module imports @react-pdf/renderer and is therefore only ever
 * reached through a dynamic import, never from the main bundle. Same
 * discipline as every sibling's own printables.
 *
 * WHY THE BROWSER AND NOT THE SERVER
 *
 * Generating client side means the assembled trip, travellers,
 * documents and threads never exist on a server at all, not even
 * briefly in memory, beyond what is already there because the person
 * is looking at it in the app.
 */
import { Font, pdf } from "@react-pdf/renderer";
import { TripBookDocument, type TripBookInputs } from "./document";
import type { Trip } from "../trip";

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

function bookFilename(trip: Trip | null): string {
  const stamp = new Date().toISOString().slice(0, 10);
  const named = trip ? trip.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") : "";
  return named ? `my-trip-book-${named}-${stamp}.pdf` : `my-trip-book-${stamp}.pdf`;
}

export async function downloadTripBook(inputs: TripBookInputs): Promise<void> {
  registerFonts();

  const blob = await pdf(TripBookDocument(inputs)).toBlob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = bookFilename(inputs.trip);
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
