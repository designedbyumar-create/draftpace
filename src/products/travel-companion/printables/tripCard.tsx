import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { travelCompanionDefinition } from "../definition";
import type { TripCard } from "../tripCard";

/**
 * The trip card as paper: one page for the fridge, or for a parent.
 *
 * Only what tripCard.ts derives, which has no place for a reference, a
 * note or a document. Colours come from the product's own definition.
 */

const ground = travelCompanionDefinition.theme?.ground?.light;
const accent = travelCompanionDefinition.theme?.accentScale;
if (!ground || !accent) throw new Error("Travel Companion must declare its ground and accent scale.");

const C = { paper: ground.surface, ink: ground.text, muted: ground.muted, rule: ground.border, strong: ground.borderStrong, accent: accent.base, stub: accent.wash ?? accent.soft };
const BODY = "PlexSans";

const s = StyleSheet.create({
  page: { padding: 56, backgroundColor: C.paper, color: C.ink, fontFamily: BODY, fontSize: 11, lineHeight: 1.45 },
  eyebrow: { fontSize: 8, letterSpacing: 1.8, color: C.muted, textTransform: "uppercase" },
  title: { fontSize: 34, marginTop: 8, lineHeight: 1.05, fontWeight: 700 },
  range: { fontSize: 13, color: C.muted, marginTop: 8 },
  rule: { height: 1.4, backgroundColor: C.accent, marginTop: 20, marginBottom: 4 },
  label: { fontSize: 8, letterSpacing: 1.5, color: C.muted, textTransform: "uppercase", marginTop: 20, marginBottom: 7 },
  who: { fontSize: 14 },
  row: { flexDirection: "row", paddingVertical: 4, borderBottomWidth: 0.6, borderBottomColor: C.rule },
  when: { width: 150, fontSize: 10.5, color: C.muted },
  what: { flex: 1, fontSize: 12 },
  stayTitle: { fontSize: 12 },
  sub: { fontSize: 9.5, color: C.muted },
  ticket: { flexDirection: "row", borderWidth: 0.8, borderColor: C.rule, borderRadius: 7, marginBottom: 5 },
  stub: { width: 128, justifyContent: "center", paddingVertical: 8, paddingHorizontal: 10, borderRightWidth: 0.8, borderRightColor: C.strong, borderStyle: "dashed" },
  stubText: { fontSize: 9.5, fontWeight: 700, backgroundColor: C.stub, paddingVertical: 2, paddingHorizontal: 5, borderRadius: 3 },
  body: { flex: 1, paddingVertical: 8, paddingHorizontal: 12 },
  closing: { marginTop: 24, fontSize: 8.5, color: C.muted },
});

export function TripCardDocument({ card, size }: { card: TripCard; size: "LETTER" | "A4" }) {
  return (
    <Document title={`${card.title}, trip card`} author="Travel Companion">
      <Page size={size} style={s.page}>
        <Text style={s.eyebrow}>Trip card</Text>
        <Text style={s.title}>{card.title}</Text>
        {card.rangeLabel && <Text style={s.range}>{card.rangeLabel}</Text>}
        <View style={s.rule} />

        {card.travellers.length > 0 && (
          <View>
            <Text style={s.label}>Who is going</Text>
            <Text style={s.who}>{card.travellers.join(", ")}</Text>
          </View>
        )}

        {card.destinations.length > 0 && (
          <View>
            <Text style={s.label}>Where</Text>
            {card.destinations.map((place) => (
              <View key={place.name} style={s.row}>
                <Text style={s.when}>{place.dates ?? ""}</Text>
                <Text style={s.what}>{place.name}</Text>
              </View>
            ))}
          </View>
        )}

        {card.getting.length > 0 && (
          <View>
            <Text style={s.label}>Getting there</Text>
            {card.getting.map((leg) => (
              <View key={leg.id} style={s.ticket} wrap={false}>
                <View style={s.stub}>
                  <Text style={s.stubText}>{leg.when}</Text>
                </View>
                <View style={s.body}>
                  <Text style={s.what}>{leg.label}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {card.staying.length > 0 && (
          <View>
            <Text style={s.label}>Staying</Text>
            {card.staying.map((stay) => (
              <View key={stay.id} style={s.row}>
                <Text style={s.when}>{stay.dates}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={s.stayTitle}>{stay.title}</Text>
                  {stay.location && <Text style={s.sub}>{stay.location}</Text>}
                </View>
              </View>
            ))}
          </View>
        )}

        <Text style={s.closing}>
          Made from what was recorded in Travel Companion. Booking references, documents and notes are not on this card.
        </Text>
      </Page>
    </Document>
  );
}
