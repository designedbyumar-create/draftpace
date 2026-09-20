/**
 * The glove box card: one page holding what somebody needs to hand over,
 * read out, or look up at the side of a road. Registration plate, VIN, tire size, oil
 * specification, insurer, policy number, a roadside number, and the dates
 * being kept in view.
 *
 * Every line is something the owner typed. Nothing is looked up, decoded or
 * checked, and the page says so. A blank stays blank, ruled for a pen.
 *
 * This module imports @react-pdf/renderer and must therefore only ever be
 * reached via a dynamic import.
 */
import { View, Text, pdf } from "@react-pdf/renderer";
import { PrintableDocument, PrintablePage, PrintableHeader, PrintableSectionLabel, PrintableContinueFooter } from "@/design-system/PrintableDocument";
import { PALETTE, saveBlob, vehicleIdentityLine } from "./palette";

export type GloveBoxCardData = {
  generatedLabel: string;
  vehicle: {
    label: string;
    year: number | null;
    make: string | null;
    model: string | null;
    plate: string | null;
    vin: string | null;
    tyreSize: string | null;
    oilSpec: string | null;
    insurer: string | null;
    policyNumber: string | null;
    roadsidePhone: string | null;
    currentMileage: number | null;
    mileageAsOf: string | null;
  };
  /** Dates being kept in view, soonest first. */
  dates: { title: string; dueOn: string; whereKept: string | null }[];
  origin: string;
  slug: string;
};

function Line({ label, value }: { label: string; value: string | null }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "flex-end", paddingVertical: 5 }}>
      <Text style={{ width: 96, fontSize: 8, color: PALETTE.muted, letterSpacing: 0.5 }}>{label.toUpperCase()}</Text>
      <View style={{ flex: 1, borderBottom: 0.7, borderColor: PALETTE.line, borderStyle: "solid", minHeight: 15, justifyContent: "flex-end" }}>
        <Text style={{ fontSize: 11, color: PALETTE.ink }}>{value ?? ""}</Text>
      </View>
    </View>
  );
}

export function GloveBoxCardDocument({ data }: { data: GloveBoxCardData }) {
  const v = data.vehicle;
  const productUrl = (dest: string) => `${data.origin}/app/products/${data.slug}/${dest}`;
  const identity = vehicleIdentityLine(v);
  return (
    <PrintableDocument title="Vehicle Maintenance Companion: Glove box card" subject="The details to have in the car">
      <PrintablePage palette={PALETTE}>
        <PrintableHeader eyebrow="VEHICLE MAINTENANCE COMPANION" palette={PALETTE} />
        <Text style={{ fontFamily: "Times-Bold", fontSize: 24, lineHeight: 1.2, color: PALETTE.accent }}>Glove box card</Text>
        <Text style={{ fontSize: 10, color: PALETTE.muted, marginTop: 6 }}>Cut along the dashed line, or fold, and keep it in the car.</Text>

        <View style={{ marginTop: 16, padding: 16, borderWidth: 1, borderColor: PALETTE.muted, borderStyle: "dashed", borderRadius: 6 }}>
          <Text style={{ fontFamily: "Times-Bold", fontSize: 15, color: PALETTE.ink }}>
            {v.label}
            {identity !== v.label ? `  (${identity})` : ""}
          </Text>
          <View style={{ marginTop: 8 }}>
            <Line label="Registration plate" value={v.plate} />
            <Line label="VIN" value={v.vin} />
            <Line label="Tyre size" value={v.tyreSize} />
            <Line label="Oil" value={v.oilSpec} />
            <Line label="Mileage" value={v.currentMileage !== null ? `${v.currentMileage.toLocaleString()}${v.mileageAsOf ? `, on ${v.mileageAsOf}` : ""}` : null} />
          </View>
          <View style={{ marginTop: 10 }}>
            <PrintableSectionLabel palette={PALETTE}>INSURANCE AND ROADSIDE</PrintableSectionLabel>
            <Line label="Insurer" value={v.insurer} />
            <Line label="Policy number" value={v.policyNumber} />
            <Line label="Roadside help" value={v.roadsidePhone} />
          </View>
        </View>

        <View style={{ marginTop: 22 }}>
          <PrintableSectionLabel palette={PALETTE}>DATES TO KEEP IN VIEW</PrintableSectionLabel>
          {data.dates.length === 0 ? (
            <Text style={{ fontSize: 9.5, color: PALETTE.muted }}>No dates recorded for this vehicle.</Text>
          ) : (
            data.dates.map((d, i) => (
              <View key={i} style={{ flexDirection: "row", paddingVertical: 4, borderBottom: 0.7, borderColor: PALETTE.line, borderStyle: "solid" }}>
                <Text style={{ width: 130, fontSize: 9.5, color: PALETTE.ink, fontFamily: "Helvetica-Bold" }}>{d.title}</Text>
                <Text style={{ width: 80, fontSize: 9.5, color: PALETTE.ink }}>{d.dueOn}</Text>
                <Text style={{ flex: 1, fontSize: 9, color: PALETTE.muted }}>{d.whereKept ? `Kept: ${d.whereKept}` : ""}</Text>
              </View>
            ))
          )}
        </View>

        <PrintableContinueFooter
          palette={PALETTE}
          links={[{ label: "Open Paperwork", href: productUrl("paperwork") }, { label: "Open Vehicles", href: productUrl("vehicles") }]}
          note={`Made on ${data.generatedLabel}. Every line was typed by the owner; nothing was looked up or checked.`}
        />
      </PrintablePage>
    </PrintableDocument>
  );
}

export async function downloadGloveBoxCard(data: GloveBoxCardData): Promise<void> {
  const blob = await pdf(<GloveBoxCardDocument data={data} />).toBlob();
  await saveBlob(blob, "glove-box-card.pdf");
}
