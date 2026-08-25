/**
 * My Trip Book.
 *
 * A standalone, modular, structured travel record. Every page is blank
 * until a person fills it in by hand: no sample data, no narrative
 * chapters, no framing that assumes the app exists. This is the printed
 * product on its own terms, sellable to someone who has never heard of
 * Travel Companion.
 *
 * A FEW CORE PAGES, THEN A LIBRARY OF REPEATABLE RECORDS
 *
 * Trip overview, trip at a glance, and quick reference appear once.
 * Everything else, destinations, travellers, bookings, transport,
 * accommodation, reservations, booking connections, threads, daily
 * operations, change-impact pages and incident pages, is a repeatable
 * record page assembled to order via TripBookManifest: a trip with 3
 * destinations and 12 bookings prints 3 destination pages and 12
 * booking pages, never a fixed page count nobody asked for.
 *
 * BOOKING CONNECTIONS AND CHANGE IMPACT ARE THE SIGNATURE PAGES
 *
 * The rest of this book is a well-organised travel binder any product
 * could print. These two are not: a page that asks, in writing, what a
 * booking depends on and what happens if it changes is this product's
 * own dependency-tree thinking, done by hand instead of by the app.
 *
 * Amber and ink. No em dashes.
 */
import { Document, Page, View, Text, StyleSheet, type DocumentProps } from "@react-pdf/renderer";
import { BOOK_TITLE, BOOK_SUBTITLE, BOOKING_TYPES, DOCUMENT_TYPES, CONTACT_TYPES, PREPARATION_CATEGORIES, SECTION_LIST } from "./bookContent";

const C = {
  paper: "#fbfaf7",
  ink: "#1a1d24",
  body: "#3b3f49",
  muted: "#666b77",
  faint: "#9a9186",
  rule: "#ded5c4",
  ruleSoft: "#ede6d8",
  write: "#d8c9ac",
  amber: "#a8611f",
  amberMid: "#c17f3e",
  amberSoft: "#f7ead9",
  cream: "#f5efe3",
};

const HEAD = "Newsreader";
const BODY = "PlexSans";
const M = { top: 62, bottom: 56, side: 58 };

export type Size = "LETTER" | "A4";

const s = StyleSheet.create({
  page: {
    paddingTop: M.top,
    paddingBottom: M.bottom,
    paddingHorizontal: M.side,
    backgroundColor: C.paper,
    color: C.body,
    fontFamily: BODY,
    fontSize: 9.6,
    lineHeight: 1.6,
  },
  bare: { backgroundColor: C.paper, fontFamily: BODY },
  spine: { position: "absolute", top: 0, left: 0, right: 0, height: 3.5, backgroundColor: C.amber },
  runningHead: {
    position: "absolute",
    top: 30,
    left: M.side,
    right: M.side,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 6.8,
    letterSpacing: 1.2,
    color: C.faint,
    textTransform: "uppercase",
  },
  folioRule: { position: "absolute", bottom: 40, left: M.side, right: M.side, height: 0.5, backgroundColor: C.ruleSoft },
  folio: { position: "absolute", bottom: 25, right: M.side, fontSize: 7.5, color: C.faint },

  eyebrow: { fontSize: 6.8, letterSpacing: 1.5, color: C.amber, textTransform: "uppercase" },
  h1: { fontFamily: HEAD, fontSize: 24, color: C.ink, marginTop: 8, lineHeight: 1.15 },
  headRule: { height: 1.2, backgroundColor: C.ink, marginTop: 16, marginBottom: 18 },
  p: { fontSize: 9.2, color: C.body, marginBottom: 8, lineHeight: 1.6 },

  writeLine: { borderBottomWidth: 0.7, borderBottomColor: C.write, height: 22 },
  writeLabel: { fontSize: 7.2, letterSpacing: 0.6, color: C.faint, textTransform: "uppercase", marginBottom: 3 },

  boxLabel: { fontSize: 6.8, letterSpacing: 1.3, color: C.amber, textTransform: "uppercase" },
  box: { borderLeftWidth: 2.5, borderLeftColor: C.amber, backgroundColor: C.amberSoft, paddingVertical: 11, paddingHorizontal: 14 },

  tableHead: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: C.ink, paddingBottom: 5 },
  th: { fontSize: 6.6, letterSpacing: 0.9, color: C.ink, textTransform: "uppercase" },
  tr: { flexDirection: "row", borderBottomWidth: 0.6, borderBottomColor: C.write, minHeight: 24 },
});

function Sheet({ section, children }: { section: string; children: React.ReactNode }) {
  return (
    <>
      <View style={s.spine} fixed />
      <View style={s.runningHead} fixed>
        <Text>{BOOK_TITLE}</Text>
        <Text>{section}</Text>
      </View>
      {children}
      <View style={s.folioRule} fixed />
      <Text style={s.folio} fixed render={({ pageNumber }) => String(pageNumber)} />
    </>
  );
}

/** A single blank field: a label above a ruled line. */
function Field({ label }: { label: string }) {
  return (
    <View style={{ marginBottom: 11 }}>
      <Text style={s.writeLabel}>{label}</Text>
      <View style={s.writeLine} />
    </View>
  );
}

/** Two fields sharing a row, the layout almost every record on this book actually needs. */
function FieldRow({ fields }: { fields: string[] }) {
  return (
    <View style={{ flexDirection: "row", marginBottom: 11 }}>
      {fields.map((label, i) => (
        <View key={label} style={{ flex: 1, marginLeft: i === 0 ? 0 : 18 }}>
          <Text style={s.writeLabel}>{label}</Text>
          <View style={s.writeLine} />
        </View>
      ))}
    </View>
  );
}

/** A wider block, several ruled lines, for the field every record ends on. */
function Notes({ label = "Notes", count = 3 }: { label?: string; count?: number }) {
  return (
    <View style={{ marginTop: 4 }}>
      <Text style={s.writeLabel}>{label}</Text>
      {Array.from({ length: count }, (_, i) => (
        <View key={i} style={s.writeLine} />
      ))}
    </View>
  );
}

interface Column {
  label: string;
  flex?: number;
  width?: number;
}

/** A register: header row, then blank ruled rows, nothing filled in. */
function RegisterTable({ columns, rows = 14 }: { columns: Column[]; rows?: number }) {
  return (
    <View style={{ marginTop: 10 }}>
      <View style={s.tableHead}>
        {columns.map((c) => (
          <Text key={c.label} style={[s.th, c.flex ? { flex: c.flex } : { width: c.width }]}>
            {c.label}
          </Text>
        ))}
      </View>
      {Array.from({ length: rows }, (_, i) => (
        <View key={i} style={s.tr} />
      ))}
    </View>
  );
}

/** A small reference line of the fixed categories a field draws from. Never a dropdown, just a memory aid. */
function TypesNote({ label, items }: { label: string; items: string[] }) {
  return (
    <Text style={{ fontSize: 7.8, color: C.faint, marginTop: 12, lineHeight: 1.5 }}>
      {label}: {items.join(", ")}.
    </Text>
  );
}

function RecordPage({
  section,
  eyebrow,
  title,
  children,
  size,
}: {
  section: string;
  eyebrow: string;
  title: string;
  children: React.ReactNode;
  size: Size;
}) {
  return (
    <Page size={size} style={s.page}>
      <Sheet section={section}>
        <Text style={s.eyebrow}>{eyebrow}</Text>
        <Text style={s.h1}>{title}</Text>
        <View style={s.headRule} />
        {children}
      </Sheet>
    </Page>
  );
}

// ---------------------------------------------------------------- manifest

export interface TripBookManifest {
  destinations: number;
  travellers: number;
  bookings: number;
  bookingConnections: number;
  transport: number;
  accommodation: number;
  reservations: number;
  threads: number;
  dailyOperations: number;
  changeImpacts: number;
  incidents: number;
  tripRecordPages: number;
  size: Size;
}

export const DEFAULT_MANIFEST: TripBookManifest = {
  destinations: 3,
  travellers: 4,
  bookings: 10,
  bookingConnections: 4,
  transport: 6,
  accommodation: 4,
  reservations: 4,
  threads: 6,
  dailyOperations: 10,
  changeImpacts: 3,
  incidents: 2,
  tripRecordPages: 2,
  size: "LETTER",
};

// ------------------------------------------------------------------ pages

function CoverPage({ size }: { size: Size }) {
  return (
    <Page size={size} style={s.bare}>
      <View style={{ flex: 1, backgroundColor: C.cream, paddingHorizontal: 58, paddingTop: 64, paddingBottom: 56 }}>
        <View style={s.spine} fixed />
        <Text style={{ fontSize: 7, letterSpacing: 2.2, color: C.amber, textTransform: "uppercase" }}>Draftpace</Text>

        <View style={{ marginTop: 74, flexDirection: "row", alignItems: "center" }}>
          {Array.from({ length: 9 }, (_, i) => (
            <View key={i} style={{ flexDirection: "row", alignItems: "center" }}>
              <View
                style={{
                  width: i === 4 ? 11 : 7,
                  height: i === 4 ? 11 : 7,
                  borderRadius: i === 4 ? 5.5 : 3.5,
                  borderWidth: i === 4 ? 0 : 0.9,
                  borderColor: C.amber,
                  opacity: i === 4 ? 1 : 0.35,
                  backgroundColor: i === 4 ? C.amber : "transparent",
                }}
              />
              {i < 8 && <View style={{ width: 26, height: 0.8, backgroundColor: C.amber, opacity: 0.3 }} />}
            </View>
          ))}
        </View>

        <View style={{ flex: 1, justifyContent: "flex-end" }}>
          <View style={{ height: 1.5, backgroundColor: C.ink, marginBottom: 20 }} />
          <Text style={{ fontFamily: HEAD, fontSize: 50, lineHeight: 1.02, color: C.ink }}>
            My Trip{"\n"}Book
          </Text>
          <Text style={{ fontFamily: HEAD, fontSize: 13, color: C.body, marginTop: 16, lineHeight: 1.5, maxWidth: 330 }}>
            {BOOK_SUBTITLE}
          </Text>
          <Text style={{ fontSize: 9, color: C.muted, marginTop: 24 }}>Undated. Print what you need.</Text>
        </View>
      </View>
    </Page>
  );
}

function HowThisWorksPage({ size }: { size: Size }) {
  return (
    <RecordPage section="How this works" eyebrow="Before you start" title="How this book works" size={size}>
      <Text style={s.p}>
        A few pages appear once: the trip overview, the trip at a glance, and the quick reference. Everything else is a
        repeatable record, printed as many times as your trip needs: one page per destination, one page per traveller,
        one page per booking, and so on.
      </Text>
      <Text style={s.p}>
        Every field on every page is blank. Nothing here was filled in for you, and nothing suggests what your trip
        should include.
      </Text>
      <View style={[s.box, { marginTop: 12 }]}>
        <Text style={s.boxLabel}>Booking connections and change impact</Text>
        <Text style={{ fontSize: 9, color: C.ink, marginTop: 5, lineHeight: 1.55 }}>
          These two pages are worth using even if you skip the rest of the book. One records what a booking depends on
          and what happens after it. The other records what changed and what else might be affected. Both are the same
          question written down: if this moves, what else moves with it?
        </Text>
      </View>
    </RecordPage>
  );
}

function ContentsPage({ size }: { size: Size }) {
  return (
    <RecordPage section="Contents" eyebrow="What is in here" title="Contents" size={size}>
      <Text style={s.p}>No page numbers here, on purpose: a modular book's contents change with what you print.</Text>
      {SECTION_LIST.map((line) => (
        <View key={line} style={{ paddingVertical: 4.5, borderBottomWidth: 0.5, borderBottomColor: C.ruleSoft }}>
          <Text style={{ fontSize: 10, color: C.ink }}>{line}</Text>
        </View>
      ))}
    </RecordPage>
  );
}

function TripOverviewPage({ size }: { size: Size }) {
  return (
    <RecordPage section="Trip overview" eyebrow="Core page" title="Trip overview" size={size}>
      <FieldRow fields={["Trip name", "Trip status"]} />
      <Field label="Destination / destinations" />
      <FieldRow fields={["Start date", "End date"]} />
      <FieldRow fields={["Primary traveller / trip organiser", "Total travellers"]} />
      <Notes label="General notes" count={5} />
    </RecordPage>
  );
}

function TripAtAGlancePage({ size }: { size: Size }) {
  return (
    <RecordPage section="Trip at a glance" eyebrow="Core page, a single summary" title="Trip at a glance" size={size}>
      <Field label="Trip" />
      <Field label="Dates" />
      <Field label="Destinations" />
      <Field label="Travellers" />
      <Field label="Key transport" />
      <Field label="Accommodation" />
      <Field label="Important reservations" />
      <Field label="Open items" />
      <Notes label="Important information" count={3} />
    </RecordPage>
  );
}

function DestinationPage({ size, index, total }: { size: Size; index: number; total: number }) {
  return (
    <RecordPage section="Destinations" eyebrow={`Destination ${index} of ${total}`} title="Destination" size={size}>
      <Field label="Destination name" />
      <FieldRow fields={["Arrival date", "Arrival time"]} />
      <FieldRow fields={["Departure date", "Departure time"]} />
      <Field label="Accommodation" />
      <FieldRow fields={["Arrival transport", "Departure transport"]} />
      <FieldRow fields={["Local contact", "Address"]} />
      <Notes count={3} />
    </RecordPage>
  );
}

function TravellerPage({ size, index, total }: { size: Size; index: number; total: number }) {
  return (
    <RecordPage section="Travellers" eyebrow={`Traveller ${index} of ${total}`} title="Traveller" size={size}>
      <FieldRow fields={["Name", "Relationship"]} />
      <FieldRow fields={["Contact", "Date of birth"]} />
      <FieldRow fields={["Nationality", "Emergency contact"]} />
      <Field label="Requirements" />
      <Notes count={3} />
    </RecordPage>
  );
}

function TravellerDocumentsPage({ size }: { size: Size }) {
  return (
    <RecordPage section="Traveller documents" eyebrow="Register" title="Traveller documents" size={size}>
      <RegisterTable
        columns={[
          { label: "Document", flex: 1.1 },
          { label: "Number / reference", flex: 1 },
          { label: "Issue date", flex: 0.7 },
          { label: "Expiry date", flex: 0.7 },
          { label: "Where stored", flex: 1 },
          { label: "Notes", flex: 1 },
        ]}
        rows={16}
      />
      <TypesNote label="Document types" items={DOCUMENT_TYPES} />
    </RecordPage>
  );
}

function BookingRegisterPage({ size }: { size: Size }) {
  return (
    <RecordPage section="Bookings" eyebrow="Register" title="Booking register" size={size}>
      <RegisterTable
        columns={[
          { label: "Booking", flex: 1.3 },
          { label: "Type", flex: 0.8 },
          { label: "Date", flex: 0.7 },
          { label: "Time", flex: 0.6 },
          { label: "Provider", flex: 1 },
          { label: "Reference", flex: 0.9 },
          { label: "Status", flex: 0.7 },
        ]}
        rows={18}
      />
      <TypesNote label="Booking types" items={BOOKING_TYPES} />
    </RecordPage>
  );
}

function BookingRecordPage({ size, index, total }: { size: Size; index: number; total: number }) {
  return (
    <RecordPage section="Bookings" eyebrow={`Booking ${index} of ${total}`} title="Booking record" size={size}>
      <FieldRow fields={["Booking name", "Booking type"]} />
      <FieldRow fields={["Provider", "Confirmation / reference"]} />
      <FieldRow fields={["Date", "Start time"]} />
      <FieldRow fields={["End time", "Status"]} />
      <Field label="Location" />
      <FieldRow fields={["Address", "Contact"]} />
      <Field label="Participants" />
      <Notes count={2} />
    </RecordPage>
  );
}

function BookingConnectionPage({ size, index, total }: { size: Size; index: number; total: number }) {
  return (
    <RecordPage section="Booking connections" eyebrow={`Connection ${index} of ${total}`} title="Booking connection" size={size}>
      <Field label="Current booking" />
      <Field label="Depends on" />
      <Field label="Because" />
      <Notes label="What happens after this?" count={2} />
      <Notes label="If this changes, what else may be affected?" count={3} />
    </RecordPage>
  );
}

function TransportRegisterPage({ size }: { size: Size }) {
  return (
    <RecordPage section="Transport" eyebrow="Register" title="Transport register" size={size}>
      <RegisterTable
        columns={[
          { label: "From", flex: 1 },
          { label: "To", flex: 1 },
          { label: "Type", flex: 0.7 },
          { label: "Date", flex: 0.7 },
          { label: "Time", flex: 0.6 },
          { label: "Provider", flex: 1 },
          { label: "Reference", flex: 0.9 },
          { label: "Status", flex: 0.7 },
        ]}
        rows={16}
      />
    </RecordPage>
  );
}

function TransportRecordPage({ size, index, total }: { size: Size; index: number; total: number }) {
  return (
    <RecordPage section="Transport" eyebrow={`Transport ${index} of ${total}`} title="Transport record" size={size}>
      <FieldRow fields={["Transport type", "Provider"]} />
      <FieldRow fields={["From", "To"]} />
      <FieldRow fields={["Date", "Reference"]} />
      <FieldRow fields={["Departure", "Arrival"]} />
      <FieldRow fields={["Pickup location", "Drop off location"]} />
      <FieldRow fields={["Participants", "Contact"]} />
      <Notes count={2} />
    </RecordPage>
  );
}

function AccommodationPage({ size, index, total }: { size: Size; index: number; total: number }) {
  return (
    <RecordPage section="Accommodation" eyebrow={`Accommodation ${index} of ${total}`} title="Accommodation" size={size}>
      <Field label="Property" />
      <Field label="Address" />
      <FieldRow fields={["Check in date", "Check in time"]} />
      <FieldRow fields={["Check out date", "Check out time"]} />
      <FieldRow fields={["Confirmation", "Provider"]} />
      <FieldRow fields={["Contact", "Guests"]} />
      <FieldRow fields={["Room / unit", "Payment status"]} />
      <Notes count={2} />
    </RecordPage>
  );
}

function ReservationPage({ size, index, total }: { size: Size; index: number; total: number }) {
  return (
    <RecordPage section="Reservations" eyebrow={`Reservation ${index} of ${total}`} title="Reservation" size={size}>
      <FieldRow fields={["Reservation", "Type"]} />
      <FieldRow fields={["Provider / venue", "Status"]} />
      <FieldRow fields={["Date", "Time"]} />
      <FieldRow fields={["Location", "Reference"]} />
      <FieldRow fields={["Participants", "Contact"]} />
      <Notes count={3} />
    </RecordPage>
  );
}

function DocumentRegistryPage({ size }: { size: Size }) {
  return (
    <RecordPage section="Document registry" eyebrow="Register, no files, just records" title="Document registry" size={size}>
      <RegisterTable
        columns={[
          { label: "Document", flex: 1.1 },
          { label: "Belongs to", flex: 0.9 },
          { label: "Purpose", flex: 1 },
          { label: "Reference", flex: 0.9 },
          { label: "Expiry", flex: 0.7 },
          { label: "Where kept", flex: 1 },
          { label: "Status", flex: 0.7 },
        ]}
        rows={16}
      />
      <TypesNote label="Document types" items={DOCUMENT_TYPES} />
    </RecordPage>
  );
}

function PreparationPage({ size, categories }: { size: Size; categories: string[] }) {
  return (
    <RecordPage section="Preparation" eyebrow="What needs to be ready" title="Preparation" size={size}>
      {categories.map((category) => (
        <View key={category} wrap={false} style={{ marginTop: 4 }}>
          <Text style={{ fontSize: 8.6, letterSpacing: 0.8, color: C.amber, textTransform: "uppercase" }}>{category}</Text>
          <View style={{ marginTop: 6 }}>
            <View style={s.tableHead}>
              {["Item", "Required by", "Status", "Notes"].map((label, i) => (
                <Text key={label} style={[s.th, { flex: [1.4, 0.8, 0.7, 1.2][i] }]}>
                  {label}
                </Text>
              ))}
            </View>
            {Array.from({ length: 2 }, (_, i) => (
              <View key={i} style={[s.tr, { minHeight: 19 }]} />
            ))}
          </View>
        </View>
      ))}
    </RecordPage>
  );
}

function OpenThreadsRegisterPage({ size }: { size: Size }) {
  return (
    <RecordPage section="Open threads" eyebrow="Register" title="Open threads" size={size}>
      <RegisterTable
        columns={[
          { label: "Situation", flex: 1.4 },
          { label: "Person / provider", flex: 1 },
          { label: "Expected by", flex: 0.8 },
          { label: "Status", flex: 0.7 },
        ]}
        rows={16}
      />
    </RecordPage>
  );
}

function ThreadRecordPage({ size, index, total }: { size: Size; index: number; total: number }) {
  return (
    <RecordPage section="Open threads" eyebrow={`Thread ${index} of ${total}`} title="Thread record" size={size}>
      <Field label="What is unresolved?" />
      <FieldRow fields={["Who is involved?", "Expected response date"]} />
      <Notes label="What has happened?" count={2} />
      <Notes label="What are we waiting for?" count={2} />
      <Field label="Next action" />
      <FieldRow fields={["Outcome", "Notes"]} />
    </RecordPage>
  );
}

function ContactsPage({ size }: { size: Size }) {
  return (
    <RecordPage section="Contacts" eyebrow="Register" title="Contacts" size={size}>
      <RegisterTable
        columns={[
          { label: "Person / provider", flex: 1.2 },
          { label: "Type", flex: 0.8 },
          { label: "Contact", flex: 1.1 },
          { label: "Booking", flex: 1 },
          { label: "Notes", flex: 1 },
        ]}
        rows={18}
      />
      <TypesNote label="Contact types" items={CONTACT_TYPES} />
    </RecordPage>
  );
}

function DailyOperationsPage({ size, index, total }: { size: Size; index: number; total: number }) {
  return (
    <RecordPage section="Daily operations" eyebrow={`Day ${index} of ${total}`} title="Today" size={size}>
      <FieldRow fields={["Date", "Where"]} />

      <Text style={{ fontSize: 8, letterSpacing: 0.7, color: C.amber, textTransform: "uppercase", marginTop: 8, marginBottom: 2 }}>
        Arrivals / departures
      </Text>
      <RegisterTable columns={[{ label: "Time", flex: 0.6 }, { label: "What", flex: 1.2 }, { label: "From / to", flex: 1 }, { label: "Reference", flex: 1 }]} rows={2} />

      <Text style={{ fontSize: 8, letterSpacing: 0.7, color: C.amber, textTransform: "uppercase", marginTop: 10, marginBottom: 2 }}>Bookings</Text>
      <RegisterTable columns={[{ label: "Time", flex: 0.6 }, { label: "Booking", flex: 1.3 }, { label: "Location", flex: 1 }, { label: "Participants", flex: 1 }]} rows={3} />

      <Text style={{ fontSize: 8, letterSpacing: 0.7, color: C.amber, textTransform: "uppercase", marginTop: 10, marginBottom: 2 }}>Open / waiting</Text>
      <RegisterTable columns={[{ label: "Item", flex: 1.4 }, { label: "Who", flex: 1 }, { label: "Expected by", flex: 0.8 }]} rows={2} />

      <Notes label="Important information" count={1} />
      <Notes label="Notes" count={2} />
    </RecordPage>
  );
}

function ChangeImpactPage({ size, index, total }: { size: Size; index: number; total: number }) {
  return (
    <RecordPage section="Change impact" eyebrow={`Change ${index} of ${total}`} title="Something changed" size={size}>
      <Field label="What changed?" />
      <Field label="Booking / item affected" />
      <FieldRow fields={["Before", "After"]} />
      <Text style={{ fontSize: 8, letterSpacing: 0.7, color: C.amber, textTransform: "uppercase", marginTop: 10, marginBottom: 2 }}>
        What depends on this?
      </Text>
      <RegisterTable columns={[{ label: "Item", flex: 1.2 }, { label: "Relationship", flex: 1 }, { label: "Potential impact", flex: 1.4 }]} rows={5} />
      <Text style={{ fontSize: 8, letterSpacing: 0.7, color: C.amber, textTransform: "uppercase", marginTop: 12, marginBottom: 2 }}>
        What needs to be reviewed?
      </Text>
      <RegisterTable columns={[{ label: "Item", flex: 1.2 }, { label: "Reviewed", flex: 0.7 }, { label: "Action", flex: 1.4 }]} rows={5} />
    </RecordPage>
  );
}

function IncidentPage({ size, index, total }: { size: Size; index: number; total: number }) {
  return (
    <RecordPage section="Problem / incident" eyebrow={`Incident ${index} of ${total}`} title="Something went wrong" size={size}>
      <Field label="Situation" />
      <FieldRow fields={["Date / time", "Location"]} />
      <FieldRow fields={["Booking involved", "Provider involved"]} />
      <Field label="People involved" />
      <Notes label="What happened" count={2} />
      <Notes label="What was expected" count={2} />
      <Field label="Information available" />
      <Field label="Contact made" />
      <Notes label="Resolution" count={2} />
      <FieldRow fields={["Final outcome", "Notes"]} />
    </RecordPage>
  );
}

function QuickReferencePage({ size }: { size: Size }) {
  return (
    <RecordPage section="Trip quick reference" eyebrow="Core page, keep this one accessible" title="Trip quick reference" size={size}>
      <Field label="Trip" />
      <Field label="Dates" />
      <Field label="Destinations" />
      <Field label="Travellers" />
      <Field label="Accommodation" />
      <Field label="Key bookings" />
      <Field label="Important references" />
      <Field label="Important contacts" />
      <Field label="Open issues" />
      <Notes label="Critical information" count={2} />
    </RecordPage>
  );
}

function TripRecordPage({ size, index, total }: { size: Size; index: number; total: number }) {
  return (
    <RecordPage section="Trip record" eyebrow={`Page ${index} of ${total}, chronological`} title="Trip record" size={size}>
      <Text style={s.p}>What happened, dated, as it happened. Not what was planned: what actually took place.</Text>
      <RegisterTable
        columns={[{ label: "Date", flex: 0.7 }, { label: "Event / note", flex: 1.8 }, { label: "Related place", flex: 0.9 }, { label: "Related booking", flex: 1 }]}
        rows={20}
      />
    </RecordPage>
  );
}

function TripNotesPage({ size }: { size: Size }) {
  return (
    <RecordPage section="Trip notes" eyebrow="Structured, not lined paper" title="Trip notes" size={size}>
      <Notes label="Important information" count={2} />
      <Notes label="Things we learned" count={2} />
      <Notes label="Things to remember" count={2} />
      <Notes label="Things to do differently" count={2} />
      <Notes label="Useful information" count={2} />
      <Notes label="Other notes" count={2} />
    </RecordPage>
  );
}

function EndOfTripRecordPage({ size }: { size: Size }) {
  return (
    <RecordPage section="End of trip record" eyebrow="Last page" title="End of trip record" size={size}>
      <FieldRow fields={["Trip completed", "Actual end date"]} />
      <Notes label="Outstanding items" count={2} />
      <Notes label="Resolved issues" count={2} />
      <Notes label="Important outcomes" count={2} />
      <Field label="Useful contacts" />
      <Notes label="Notes for future trips" count={3} />
    </RecordPage>
  );
}

// -------------------------------------------------------------- document

export function TripBookDocument({ manifest = DEFAULT_MANIFEST }: { manifest?: TripBookManifest }): React.ReactElement<DocumentProps> {
  const { size } = manifest;
  const repeat = <T,>(count: number, render: (index: number, total: number) => T): T[] =>
    Array.from({ length: count }, (_, i) => render(i + 1, count));

  return (
    <Document title={BOOK_TITLE} author="Draftpace" subject={BOOK_TITLE} creator="Travel Companion by Draftpace" producer="Travel Companion by Draftpace">
      <CoverPage size={size} />
      <HowThisWorksPage size={size} />
      <ContentsPage size={size} />

      <TripOverviewPage size={size} />
      <TripAtAGlancePage size={size} />

      {repeat(manifest.destinations, (i, t) => <DestinationPage key={`d${i}`} size={size} index={i} total={t} />)}

      {repeat(manifest.travellers, (i, t) => <TravellerPage key={`t${i}`} size={size} index={i} total={t} />)}
      <TravellerDocumentsPage size={size} />

      <BookingRegisterPage size={size} />
      {repeat(manifest.bookings, (i, t) => <BookingRecordPage key={`b${i}`} size={size} index={i} total={t} />)}
      {repeat(manifest.bookingConnections, (i, t) => <BookingConnectionPage key={`c${i}`} size={size} index={i} total={t} />)}

      <TransportRegisterPage size={size} />
      {repeat(manifest.transport, (i, t) => <TransportRecordPage key={`tr${i}`} size={size} index={i} total={t} />)}

      {repeat(manifest.accommodation, (i, t) => <AccommodationPage key={`a${i}`} size={size} index={i} total={t} />)}
      {repeat(manifest.reservations, (i, t) => <ReservationPage key={`r${i}`} size={size} index={i} total={t} />)}

      <DocumentRegistryPage size={size} />
      <PreparationPage size={size} categories={PREPARATION_CATEGORIES} />

      <OpenThreadsRegisterPage size={size} />
      {repeat(manifest.threads, (i, t) => <ThreadRecordPage key={`th${i}`} size={size} index={i} total={t} />)}

      <ContactsPage size={size} />

      {repeat(manifest.dailyOperations, (i, t) => <DailyOperationsPage key={`do${i}`} size={size} index={i} total={t} />)}
      {repeat(manifest.changeImpacts, (i, t) => <ChangeImpactPage key={`ci${i}`} size={size} index={i} total={t} />)}
      {repeat(manifest.incidents, (i, t) => <IncidentPage key={`in${i}`} size={size} index={i} total={t} />)}

      <QuickReferencePage size={size} />
      {repeat(manifest.tripRecordPages, (i, t) => <TripRecordPage key={`rec${i}`} size={size} index={i} total={t} />)}
      <TripNotesPage size={size} />
      <EndOfTripRecordPage size={size} />
    </Document>
  );
}
