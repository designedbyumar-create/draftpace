import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { travelCompanionDefinition } from "../definition";
import type { PackingSection } from "../packingLists";

/**
 * The packing list as paper: one page a traveller can tick with a pen.
 *
 * Filled from the trip's own list, so it carries exactly what the person
 * chose and edited, with an empty box beside each item, or a ticked one
 * for anything already done. It says nothing that was not on the list.
 *
 * Colours come from the product's own definition, so the paper follows the
 * screen.
 */

const ground = travelCompanionDefinition.theme?.ground?.light;
const accent = travelCompanionDefinition.theme?.accentScale;
if (!ground || !accent) throw new Error("Travel Companion must declare its ground and accent scale.");

const C = { paper: ground.surface, ink: ground.text, muted: ground.muted, rule: ground.border, strong: ground.borderStrong, accent: accent.base, stub: accent.wash ?? accent.soft };
const BODY = "PlexSans";
const M = { top: 56, bottom: 40, side: 50 };

export interface PackingPrintData {
  title: string;
  sections: PackingSection[];
  size: "LETTER" | "A4";
}

const s = StyleSheet.create({
  page: { paddingTop: M.top, paddingBottom: M.bottom, paddingHorizontal: M.side, backgroundColor: C.paper, color: C.ink, fontFamily: BODY, fontSize: 10.5, lineHeight: 1.45 },
  eyebrow: { fontSize: 7.5, letterSpacing: 1.6, color: C.muted, textTransform: "uppercase" },
  title: { fontSize: 24, marginTop: 6, lineHeight: 1.1, fontWeight: 700 },
  headRule: { height: 1.2, backgroundColor: C.accent, marginTop: 14, marginBottom: 2 },
  section: { marginTop: 14 },
  who: { fontSize: 13, fontWeight: 700, paddingBottom: 4, borderBottomWidth: 0.8, borderBottomColor: C.strong, marginBottom: 6 },
  columns: { flexDirection: "row", flexWrap: "wrap" },
  group: { width: "50%", paddingRight: 14, marginBottom: 10 },
  groupName: { fontSize: 7.5, letterSpacing: 1.3, color: C.muted, textTransform: "uppercase", marginBottom: 3 },
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 2.5 },
  box: { width: 9.5, height: 9.5, borderWidth: 0.9, borderColor: C.strong, borderRadius: 2, marginRight: 8 },
  boxDone: { width: 9.5, height: 9.5, backgroundColor: C.accent, borderRadius: 2, marginRight: 8 },
  item: { flex: 1, fontSize: 10.5 },
  itemDone: { flex: 1, fontSize: 10.5, color: C.muted, textDecoration: "line-through" },
  closing: { marginTop: 12, fontSize: 8.2, color: C.muted },
});

export function PackingDocument({ data }: { data: PackingPrintData }) {
  return (
    <Document title={`${data.title}, packing list`} author="Travel Companion">
      <Page size={data.size} style={s.page} wrap>
        <View>
          <Text style={s.eyebrow}>Packing list</Text>
          <Text style={s.title}>{data.title}</Text>
          <View style={s.headRule} />
        </View>
        {data.sections.map((section) => (
          <View key={section.key} style={s.section}>
            <Text style={s.who}>{section.heading}</Text>
            <View style={s.columns}>
              {section.groups.map((group) => (
                <View key={group.group} style={s.group} wrap={false}>
                  <Text style={s.groupName}>{group.group}</Text>
                  {group.items.map((item) => (
                    <View key={item.id} style={s.row}>
                      <View style={item.done ? s.boxDone : s.box} />
                      <Text style={item.done ? s.itemDone : s.item}>{item.title}</Text>
                    </View>
                  ))}
                </View>
              ))}
            </View>
          </View>
        ))}
        <Text style={s.closing}>Everything here is what was on the list in Travel Companion.</Text>
      </Page>
    </Document>
  );
}
