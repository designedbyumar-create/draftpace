/**
 * Generating the record, in the browser.
 *
 * This module imports @react-pdf/renderer and is therefore only ever
 * reached through a dynamic import, never from the main bundle. Same
 * discipline as both siblings' printables.
 *
 * WHY THE BROWSER AND NOT THE SERVER
 *
 * The document is a child's education: what they did, what their parent
 * noticed, and how short checks went. Generating it client side means
 * that assembled picture never exists on a server at all, not even
 * briefly in memory. The data is already here because the parent is
 * looking at it. Sending it back out to have a PDF made would be the one
 * moment this product handled the whole picture of a minor somewhere it
 * did not need to.
 */
import { Font, pdf } from "@react-pdf/renderer";
import { HomeschoolRecordDocument } from "./document";
import type { Book } from "../book";

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

/**
 * The name the file lands under.
 *
 * Carries the child's name only where the parent made it shareable,
 * because a filename is the one part of a document that shows up in a
 * list somebody else may be looking at.
 */
export function recordFilename(book: Book): string {
  const stamp = book.generatedAt.toISOString().slice(0, 10);
  const who = book.name ? book.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") : "";
  return who ? `homeschool-record-${who}-${stamp}.pdf` : `homeschool-record-${stamp}.pdf`;
}

export async function downloadHomeschoolRecord(book: Book, size: "LETTER" | "A4"): Promise<void> {
  registerFonts();

  const blob = await pdf(HomeschoolRecordDocument({ book, size })).toBlob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = recordFilename(book);
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
