import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { travelCompanionDefinition } from "../definition";
import type { TripRecord } from "../tripRecord";

/**
 * A concluded trip's own record, as paper: the populated companion to
 * My Trip Book's blank binder. Everything below is what the trip
 * actually recorded; a section with nothing in it is left out rather
 * than printed empty.
 *
 * Colours come from the product's own definition, so the paper follows
 * the screen, the same choice as the itinerary and trip card printables.
 */

const ground = travelCompanionDefinition.theme?.ground?.light;
const accent = travelCompanionDefinition.theme?.accentScale;
if (!ground || !accent) throw new Error("Travel Companion must declare its ground and accent scale.");

const C = {
  paper: ground.surface,
  ink: ground.text,
  muted: ground.muted,
  rule: ground.border,
  strong: ground.borderStrong,
  accent: accent.base,
  wash: accent.wash ?? accent.soft,
};

const BODY = "PlexSans";
const M = { top: 56, bottom: 40, side: 58 };

export interface TripRecordPrintData {
  record: TripRecord;
  size: "LETTER" | "A4";
}

const s = StyleSheet.create({
  page: {
    paddingTop: M.top,
    paddingBottom: M.bottom,
    paddingHorizontal: M.side,
    backgroundColor: C.paper,
    color: C.ink,
    fontFamily: BODY,
    fontSize: 9.6,
    lineHeight: 1.5,
  },
  eyebrow: { fontSize: 7.5, letterSpacing: 1.6, color: C.muted, textTransform: "uppercase" },
  title: { fontSize: 26, marginTop: 6, lineHeight: 1.1, fontWeight: 700 },
  range: { fontSize: 10.5, color: C.muted, marginTop: 6 },
  headRule: { height: 1.2, backgroundColor: C.accent, marginTop: 16, marginBottom: 18 },
  section: { marginTop: 18 },
  label: { fontSize: 8, letterSpacing: 1.5, color: C.muted, textTransform: "uppercase", marginBottom: 8 },
  memory: { borderLeftWidth: 2.5, borderLeftColor: C.accent, backgroundColor: C.wash, paddingVertical: 11, paddingHorizontal: 14 },
  memoryText: { fontSize: 10, color: C.ink, lineHeight: 1.55 },
  memoryLink: { fontSize: 9, color: C.ink, marginTop: 6 },
  tableHead: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: C.ink, paddingBottom: 5 },
  th: { fontSize: 6.8, letterSpacing: 0.9, color: C.ink, textTransform: "uppercase" },
  tr: { flexDirection: "row", borderBottomWidth: 0.6, borderBottomColor: C.rule, paddingVertical: 6 },
  td: { fontSize: 9, color: C.ink },
  tdMuted: { fontSize: 8.4, color: C.muted },
  recordRow: { flexDirection: "row", borderBottomWidth: 0.6, borderBottomColor: C.rule, paddingVertical: 7 },
  recordDate: { width: 92, fontSize: 8.6, color: C.muted },
  recordBody: { flex: 1, fontSize: 9.4, color: C.ink },
  closing: { marginTop: 22, fontSize: 8.2, color: C.muted },
});

interface Column {
  label: string;
  flex: number;
}

function Table({ columns, children }: { columns: Column[]; children: React.ReactNode }) {
  return (
    <View>
      <View style={s.tableHead}>
        {columns.map((c) => (
          <Text key={c.label} style={[s.th, { flex: c.flex }]}>
            {c.label}
          </Text>
        ))}
      </View>
      {children}
    </View>
  );
}

export function TripRecordDocument({ data }: { data: TripRecordPrintData }) {
  const { record } = data;
  return (
    <Document title={`${record.title}, trip record`} author="Travel Companion">
      <Page size={data.size} style={s.page} wrap>
        <View>
          <Text style={s.eyebrow}>Trip record · {record.statusLabel}</Text>
          <Text style={s.title}>{record.title}</Text>
          {(record.rangeLabel || record.destinationSummary) && (
            <Text style={s.range}>{[record.rangeLabel, record.destinationSummary].filter(Boolean).join(" · ")}</Text>
          )}
          <View style={s.headRule} />
        </View>

        {(record.memoryNote || record.memoryLink) && (
          <View style={s.section} wrap={false}>
            <Text style={s.label}>Memories</Text>
            <View style={s.memory}>
              {record.memoryNote && <Text style={s.memoryText}>{record.memoryNote}</Text>}
              {record.memoryLink && <Text style={s.memoryLink}>{record.memoryLink}</Text>}
            </View>
          </View>
        )}

        {record.travellers.length > 0 && (
          <View style={s.section} wrap={false}>
            <Text style={s.label}>Travellers</Text>
            <Table columns={[{ label: "Name", flex: 1 }, { label: "Relationship", flex: 1 }]}>
              {record.travellers.map((t) => (
                <View key={t.name} style={s.tr}>
                  <Text style={[s.td, { flex: 1 }]}>{t.name}</Text>
                  <Text style={[s.tdMuted, { flex: 1 }]}>{t.relationshipNote ?? ""}</Text>
                </View>
              ))}
            </Table>
          </View>
        )}

        {record.destinations.length > 0 && (
          <View style={s.section} wrap={false}>
            <Text style={s.label}>Destinations</Text>
            <Table columns={[{ label: "Destination", flex: 1.4 }, { label: "Dates", flex: 1 }]}>
              {record.destinations.map((d) => (
                <View key={d.name} style={s.tr}>
                  <Text style={[s.td, { flex: 1.4 }]}>{d.name}</Text>
                  <Text style={[s.tdMuted, { flex: 1 }]}>{d.dates ?? ""}</Text>
                </View>
              ))}
            </Table>
          </View>
        )}

        {record.bookings.length > 0 && (
          <View style={s.section}>
            <Text style={s.label}>Bookings</Text>
            <Table columns={[{ label: "Booking", flex: 1.4 }, { label: "When", flex: 1 }, { label: "Provider", flex: 0.9 }, { label: "Reference", flex: 0.8 }, { label: "Status", flex: 0.9 }]}>
              {record.bookings.map((b) => (
                <View key={b.id} style={s.tr} wrap={false}>
                  <Text style={[s.td, { flex: 1.4 }]}>
                    {b.title} <Text style={s.tdMuted}>· {b.kindLabel}</Text>
                  </Text>
                  <Text style={[s.tdMuted, { flex: 1 }]}>{b.when ?? ""}</Text>
                  <Text style={[s.tdMuted, { flex: 0.9 }]}>{b.provider ?? ""}</Text>
                  <Text style={[s.tdMuted, { flex: 0.8 }]}>{b.reference ?? ""}</Text>
                  <Text style={[s.tdMuted, { flex: 0.9 }]}>{b.statusLabel}</Text>
                </View>
              ))}
            </Table>
          </View>
        )}

        {record.documents.length > 0 && (
          <View style={s.section}>
            <Text style={s.label}>Document registry</Text>
            <Table columns={[{ label: "Document", flex: 1 }, { label: "Type", flex: 0.7 }, { label: "Kept where", flex: 1 }]}>
              {record.documents.map((d) => (
                <View key={d.id} style={s.tr} wrap={false}>
                  <Text style={[s.td, { flex: 1 }]}>{d.label}</Text>
                  <Text style={[s.tdMuted, { flex: 0.7 }]}>{d.kindLabel}</Text>
                  <Text style={[s.tdMuted, { flex: 1 }]}>{d.keptWhere ?? ""}</Text>
                </View>
              ))}
            </Table>
          </View>
        )}

        {record.record.length > 0 && (
          <View style={s.section}>
            <Text style={s.label}>What happened</Text>
            {record.record.map((entry) => (
              <View key={entry.id} style={s.recordRow} wrap={false}>
                <Text style={s.recordDate}>{entry.date}</Text>
                <View style={s.recordBody}>
                  <Text style={s.recordBody}>{entry.body}</Text>
                  {entry.placeName && <Text style={s.tdMuted}>{entry.placeName}</Text>}
                </View>
              </View>
            ))}
          </View>
        )}

        <Text style={s.closing}>
          Made from what was recorded in Travel Companion. Nothing here was suggested or filled in for you.
        </Text>
      </Page>
    </Document>
  );
}
