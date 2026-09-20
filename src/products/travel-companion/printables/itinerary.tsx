import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { travelCompanionDefinition } from "../definition";

/**
 * The itinerary as paper: the trip's own days, in order, as recorded.
 *
 * Unlike My Trip Book, which is blank on purpose, this one is filled from
 * what the person entered, and says nothing that was not entered. A day
 * with nothing recorded is printed as exactly that. No suggestions, no
 * fillers, no "things to do".
 *
 * Colours come from the product's own definition, so the paper follows
 * the screen.
 */

const ground = travelCompanionDefinition.theme?.ground?.light;
const accent = travelCompanionDefinition.theme?.accentScale;
if (!ground || !accent) throw new Error("Travel Companion must declare its ground and accent scale.");

const C = {
  paper: ground.surface,
  ink: ground.text,
  muted: ground.muted,
  rule: ground.border,
  strongRule: ground.borderStrong,
  accent: accent.base,
  stub: accent.wash ?? accent.soft,
};

const BODY = "PlexSans";
const M = { top: 56, bottom: 40, side: 58 };

export interface ItineraryPrintStop {
  id: string;
  time: string | null;
  title: string;
  note: string | null;
  location: string | null;
  awaiting: boolean;
}

export interface ItineraryPrintData {
  title: string;
  rangeLabel: string | null;
  days: { date: string; label: string; place: string | null; stops: ItineraryPrintStop[] }[];
  undated: { id: string; title: string; kindLabel: string }[];
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
    fontSize: 10,
    lineHeight: 1.5,
  },
  eyebrow: { fontSize: 7.5, letterSpacing: 1.6, color: C.muted, textTransform: "uppercase" },
  title: { fontSize: 26, marginTop: 6, lineHeight: 1.1, fontWeight: 700 },
  range: { fontSize: 10.5, color: C.muted, marginTop: 6 },
  headRule: { height: 1.2, backgroundColor: C.accent, marginTop: 16, marginBottom: 4 },
  day: { marginTop: 16 },
  dayHead: { flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", paddingBottom: 5, borderBottomWidth: 0.8, borderBottomColor: C.strongRule, marginBottom: 7 },
  dayLabel: { fontSize: 13, fontWeight: 700 },
  place: { fontSize: 8.8, color: C.muted },
  ticket: { flexDirection: "row", borderWidth: 0.8, borderColor: C.rule, borderRadius: 7, marginBottom: 5 },
  stub: { width: 62, alignItems: "center", justifyContent: "center", paddingVertical: 8, borderRightWidth: 0.8, borderRightColor: C.strongRule, borderStyle: "dashed" },
  time: { fontSize: 10.5, fontWeight: 700, backgroundColor: C.stub, paddingVertical: 2, paddingHorizontal: 5, borderRadius: 3 },
  stopBody: { flex: 1, paddingVertical: 7, paddingHorizontal: 10 },
  stopTitle: { fontSize: 11, fontWeight: 700 },
  small: { fontSize: 8.6, color: C.muted },
  empty: { fontSize: 9, color: C.muted, borderWidth: 0.8, borderColor: C.rule, borderStyle: "dashed", borderRadius: 7, paddingVertical: 7, paddingHorizontal: 10 },
  closing: { marginTop: 20, fontSize: 8.2, color: C.muted },
});

export function ItineraryDocument({ data }: { data: ItineraryPrintData }) {
  return (
    <Document title={`${data.title}, itinerary`} author="Travel Companion">
      <Page size={data.size} style={s.page} wrap>
        <View>
          <Text style={s.eyebrow}>Itinerary</Text>
          <Text style={s.title}>{data.title}</Text>
          {data.rangeLabel && <Text style={s.range}>{data.rangeLabel}</Text>}
          <View style={s.headRule} />
        </View>

        {data.days.map((day) => (
          <View key={day.date} style={s.day} wrap={false}>
            <View style={s.dayHead}>
              <Text style={s.dayLabel}>{day.label}</Text>
              {day.place && <Text style={s.place}>{day.place}</Text>}
            </View>
            {day.stops.length === 0 ? (
              <Text style={s.empty}>Nothing recorded for this day.</Text>
            ) : (
              day.stops.map((stop) => (
                <View key={stop.id} style={s.ticket} wrap={false}>
                  <View style={s.stub}>{stop.time ? <Text style={s.time}>{stop.time}</Text> : <Text />}</View>
                  <View style={s.stopBody}>
                    <Text style={s.stopTitle}>{stop.title}</Text>
                    {stop.note && <Text style={s.small}>{stop.note}</Text>}
                    {stop.location && <Text style={s.small}>{stop.location}</Text>}
                    {stop.awaiting && <Text style={s.small}>Awaiting confirmation</Text>}
                  </View>
                </View>
              ))
            )}
          </View>
        ))}

        {data.undated.length > 0 && (
          <View style={s.day} wrap={false}>
            <View style={s.dayHead}>
              <Text style={s.dayLabel}>Not on a day yet</Text>
            </View>
            {data.undated.map((booking) => (
              <Text key={booking.id} style={[s.empty, { marginBottom: 5 }]}>
                {booking.title}, {booking.kindLabel}
              </Text>
            ))}
          </View>
        )}

        <Text style={s.closing}>
          Everything here is what was recorded in Travel Companion. Times are as they were entered.
        </Text>
      </Page>
    </Document>
  );
}
