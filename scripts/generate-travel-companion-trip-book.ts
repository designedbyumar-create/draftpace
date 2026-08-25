/**
 * Renders My Trip Book, both a personalised sample and the blank,
 * sellable template, so every page can be proofed before anybody can
 * buy or generate one.
 *
 *   node scripts/run-tsx.mjs scripts/generate-travel-companion-trip-book.ts
 */
import { Font, renderToFile } from "@react-pdf/renderer";
import { mkdir, readFile, access, writeFile } from "node:fs/promises";
import path from "node:path";
import { TripBookDocument } from "../src/products/travel-companion/printables/document";
import type { Booking, Person, Place, PreparationItem, RecordEntry, Thread, TravelDocument, Trip } from "../src/products/travel-companion/trip";

const OUT = process.env.OUT_DIR ?? "./.workbook";
const FONTS = path.join(OUT, "fonts");
const FONT_SOURCES: Record<string, string> = {
  "Newsreader.ttf": "https://raw.githubusercontent.com/google/fonts/main/ofl/newsreader/Newsreader%5Bopsz%2Cwght%5D.ttf",
  "IBMPlexSans.ttf": "https://raw.githubusercontent.com/google/fonts/main/ofl/ibmplexsans/IBMPlexSans%5Bwdth%2Cwght%5D.ttf",
};

await mkdir(FONTS, { recursive: true });
for (const [name, url] of Object.entries(FONT_SOURCES)) {
  const file = path.join(FONTS, name);
  try {
    await access(file);
  } catch {
    const res = await fetch(url);
    await writeFile(file, Buffer.from(await res.arrayBuffer()));
  }
}
Font.register({ family: "Newsreader", src: path.resolve(FONTS, "Newsreader.ttf") });
Font.register({ family: "PlexSans", src: path.resolve(FONTS, "IBMPlexSans.ttf") });
Font.registerHyphenationCallback((word: string) => [word]);

const trip: Trip = {
  id: "t1",
  title: "Japan",
  destinationSummary: "Tokyo, Kyoto",
  startsAt: "2026-10-08",
  endsAt: "2026-10-21",
  status: "planning",
  createdAt: "2026-08-01T00:00:00Z",
};

const people: Person[] = [
  { id: "p1", tripId: "t1", name: "Umar", isChild: false, relationshipNote: null, requirements: null, status: "active" },
  { id: "p2", tripId: "t1", name: "Minha", isChild: true, relationshipNote: "Umar's daughter", requirements: "Vegetarian meals, aisle seat", status: "active" },
];

const places: Place[] = [
  { id: "pl1", tripId: "t1", name: "Tokyo", ordinal: 0, arrivesAt: "2026-10-08", departsAt: "2026-10-14", status: "active" },
  { id: "pl2", tripId: "t1", name: "Kyoto", ordinal: 1, arrivesAt: "2026-10-14", departsAt: "2026-10-21", status: "active" },
];

const bookings: Booking[] = [
  {
    id: "b1", tripId: "t1", placeId: "pl1", kind: "flight", title: "Flight PK123", provider: "PIA", reference: "PK123XY",
    startsAt: "2026-10-08T07:30:00Z", endsAt: "2026-10-08T23:45:00Z", location: null, bookingStatus: "confirmed",
    dependsOnBookingId: null, notes: "Sorted.", status: "active",
  },
  {
    id: "b2", tripId: "t1", placeId: "pl1", kind: "transfer", title: "Airport transfer", provider: "Klook", reference: "KL-9981",
    startsAt: "2026-10-08T14:00:00Z", endsAt: null, location: "Narita Airport", bookingStatus: "confirmed",
    dependsOnBookingId: "b1", notes: null, status: "active",
  },
  {
    id: "b3", tripId: "t1", placeId: "pl2", kind: "hotel", title: "Kyoto Ryokan Sakura", provider: null, reference: "RSV-4471",
    startsAt: "2026-10-14T15:00:00Z", endsAt: "2026-10-21T10:00:00Z", location: "Kyoto", bookingStatus: "confirmed",
    dependsOnBookingId: null, notes: null, status: "active",
  },
];

const documents: TravelDocument[] = [
  { id: "d1", tripId: "t1", personId: "p1", bookingId: null, kind: "passport", label: "Umar's passport", keptWhere: "Front pocket of the carry-on", status: "active" },
  { id: "d2", tripId: "t1", personId: "p2", bookingId: null, kind: "passport", label: "Minha's passport", keptWhere: "Photo in Umar's phone", status: "active" },
];

const preparation: PreparationItem[] = [
  { id: "pr1", tripId: "t1", category: "documents", title: "Renew Minha's passport", completionStatus: "done", notes: null, status: "active" },
  { id: "pr2", tripId: "t1", category: "packing", title: "Pack the power adapter", completionStatus: "open", notes: null, status: "active" },
];

const threads: Thread[] = [
  { id: "th1", tripId: "t1", bookingId: "b3", personId: null, title: "Waiting on the ryokan to confirm late check in", whoIsInvolved: null, expectedBy: null, status: "open", createdAt: "2026-09-01T00:00:00Z", resolvedAt: null },
];

const recordEntries: RecordEntry[] = [
  { id: "r1", tripId: "t1", category: "lesson", placeName: "Kyoto", body: "Book the ryokan at least two months ahead, they sell out fast.", createdAt: "2026-08-20T00:00:00Z" },
];

for (const size of ["LETTER", "A4"] as const) {
  const filled = path.join(OUT, `trip-book-filled-${size.toLowerCase()}.pdf`);
  await renderToFile(
    TripBookDocument({ trip, people, places, bookings, documents, preparation, threads, recordEntries, generatedAt: new Date("2026-08-28T12:00:00Z"), size }),
    filled
  );
  const filledBytes = await readFile(filled);
  console.log(`${path.basename(filled)}  ${filledBytes.length.toLocaleString()} bytes`);

  const blank = path.join(OUT, `trip-book-template-${size.toLowerCase()}.pdf`);
  await renderToFile(
    TripBookDocument({
      trip: null, people: [], places: [], bookings: [], documents: [], preparation: [], threads: [], recordEntries: [],
      generatedAt: new Date("2026-08-28T12:00:00Z"), size,
    }),
    blank
  );
  const blankBytes = await readFile(blank);
  console.log(`${path.basename(blank)}  ${blankBytes.length.toLocaleString()} bytes`);
}
