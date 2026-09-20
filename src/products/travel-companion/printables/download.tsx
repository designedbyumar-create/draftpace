/**
 * Generating My Trip Book, in the browser.
 *
 * This module imports @react-pdf/renderer and is therefore only ever
 * reached through a dynamic import, never from the main bundle. Same
 * discipline as every sibling's own printables.
 */
import { Font, pdf } from "@react-pdf/renderer";
import { TripBookDocument, type TripBookManifest } from "./document";
import { ItineraryDocument, type ItineraryPrintData } from "./itinerary";
import { PackingDocument, type PackingPrintData } from "./packing";
import { TripCardDocument } from "./tripCard";
import type { TripCard } from "../tripCard";

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

export async function downloadItinerary(data: ItineraryPrintData): Promise<void> {
  registerFonts();

  const blob = await pdf(ItineraryDocument({ data })).toBlob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `itinerary-${new Date().toISOString().slice(0, 10)}.pdf`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export async function downloadPackingList(data: PackingPrintData): Promise<void> {
  registerFonts();

  const blob = await pdf(PackingDocument({ data })).toBlob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `packing-list-${new Date().toISOString().slice(0, 10)}.pdf`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export async function downloadTripCard(card: TripCard, size: "LETTER" | "A4"): Promise<void> {
  registerFonts();

  const blob = await pdf(TripCardDocument({ card, size })).toBlob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `trip-card-${new Date().toISOString().slice(0, 10)}.pdf`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
