/**
 * The service record: everything the owner recorded as done to one
 * vehicle, oldest first, the order a buyer reads a service history in.
 *
 * It says who made it. This is the owner's own record, kept in Draftpace,
 * and the page states that plainly instead of dressing up as a dealer or
 * shop history. What it offers a buyer is dates, mileages and who did the
 * work, written down at the time. Cost is shown only where the owner
 * entered one, and the total says how many entries it covers.
 *
 * This module imports @react-pdf/renderer and must therefore only ever be
 * reached via a dynamic import.
 */
import { View, Text, pdf } from "@react-pdf/renderer";
import { PrintableDocument, PrintablePage, PrintableHeader, PrintableSectionLabel, PrintableContinueFooter } from "@/design-system/PrintableDocument";
import { PALETTE, saveBlob, vehicleIdentityLine } from "./palette";
import { formatCost } from "../serviceHistory";

export type ServiceRecordData = {
  generatedLabel: string;
  vehicle: { label: string; year: number | null; make: string | null; model: string | null; plate: string | null; vin: string | null; currentMileage: number | null; mileageAsOf: string | null };
  /** Oldest first. */
  rows: { doneOn: string; mileage: number | null; taskName: string; shop: string | null; costMinorUnits: number | null; note: string | null }[];
  origin: string;
  slug: string;
};

const RULE = { borderBottom: 0.7, borderColor: PALETTE.line, borderStyle: "solid" } as const;

export function ServiceRecordDocument({ data }: { data: ServiceRecordData }) {
  const productUrl = (dest: string) => `${data.origin}/app/products/${data.slug}/${dest}`;
  const identity = vehicleIdentityLine(data.vehicle);
  const costed = data.rows.filter((r) => r.costMinorUnits !== null);
  const total = costed.reduce((sum, r) => sum + (r.costMinorUnits ?? 0), 0);
  const facts = [
    data.vehicle.plate ? `Registration plate ${data.vehicle.plate}` : null,
    data.vehicle.vin ? `VIN ${data.vehicle.vin}` : null,
    data.vehicle.currentMileage !== null ? `${data.vehicle.currentMileage.toLocaleString()} miles${data.vehicle.mileageAsOf ? ` on ${data.vehicle.mileageAsOf}` : ""}` : null,
  ].filter(Boolean);

  return (
    <PrintableDocument title="Vehicle Maintenance Companion: Service record" subject="What was done to this vehicle, and when">
      <PrintablePage palette={PALETTE}>
        <PrintableHeader eyebrow="VEHICLE MAINTENANCE COMPANION" palette={PALETTE} />
        <Text style={{ fontFamily: "Times-Bold", fontSize: 24, lineHeight: 1.2, color: PALETTE.accent }}>Service record</Text>
        <Text style={{ fontSize: 11, color: PALETTE.ink, marginTop: 6 }}>
          {data.vehicle.label}
          {identity !== data.vehicle.label ? ` (${identity})` : ""}
        </Text>
        {facts.length > 0 && <Text style={{ fontSize: 9.5, color: PALETTE.muted, marginTop: 2 }}>{facts.join(" · ")}</Text>}

        <View style={{ marginTop: 20 }}>
          <PrintableSectionLabel palette={PALETTE}>WHAT WAS DONE</PrintableSectionLabel>
          {data.rows.length === 0 ? (
            <Text style={{ fontSize: 9.5, color: PALETTE.muted }}>Nothing has been recorded for this vehicle yet.</Text>
          ) : (
            <>
              <View style={{ flexDirection: "row", paddingBottom: 3, borderBottom: 0.7, borderColor: PALETTE.ink, borderStyle: "solid" }}>
                <Text style={{ width: 62, fontSize: 7.5, color: PALETTE.muted }}>DATE</Text>
                <Text style={{ width: 52, fontSize: 7.5, color: PALETTE.muted }}>MILES</Text>
                <Text style={{ flex: 1, fontSize: 7.5, color: PALETTE.muted }}>WORK DONE</Text>
                <Text style={{ width: 90, fontSize: 7.5, color: PALETTE.muted }}>BY</Text>
                <Text style={{ width: 52, fontSize: 7.5, color: PALETTE.muted, textAlign: "right" }}>COST</Text>
              </View>
              {data.rows.map((row, i) => (
                <View key={i} wrap={false} style={{ paddingVertical: 4, ...RULE }}>
                  <View style={{ flexDirection: "row" }}>
                    <Text style={{ width: 62, fontSize: 9, color: PALETTE.ink }}>{row.doneOn}</Text>
                    <Text style={{ width: 52, fontSize: 9, color: PALETTE.ink }}>{row.mileage !== null ? row.mileage.toLocaleString() : ""}</Text>
                    <Text style={{ flex: 1, fontSize: 9, color: PALETTE.ink, fontFamily: "Helvetica-Bold" }}>{row.taskName}</Text>
                    <Text style={{ width: 90, fontSize: 9, color: PALETTE.ink }}>{row.shop ?? ""}</Text>
                    <Text style={{ width: 52, fontSize: 9, color: PALETTE.ink, textAlign: "right" }}>{row.costMinorUnits !== null ? formatCost(row.costMinorUnits) : ""}</Text>
                  </View>
                  {row.note && <Text style={{ fontSize: 8, color: PALETTE.muted, marginLeft: 114, marginTop: 1 }}>{row.note}</Text>}
                </View>
              ))}
              {costed.length > 0 && (
                <Text style={{ fontSize: 9, color: PALETTE.ink, marginTop: 8, textAlign: "right" }}>
                  Total of the costs entered: {formatCost(total)}, across {costed.length} of {data.rows.length} entries
                </Text>
              )}
            </>
          )}
        </View>

        <PrintableContinueFooter
          palette={PALETTE}
          links={[{ label: "Open History", href: productUrl("history") }, { label: "Open Vehicles", href: productUrl("vehicles") }]}
          note={`Made on ${data.generatedLabel} from the owner's own record in Draftpace. It is not a dealer or shop history, and nothing here was checked against a receipt.`}
        />
      </PrintablePage>
    </PrintableDocument>
  );
}

export async function downloadServiceRecord(data: ServiceRecordData): Promise<void> {
  const blob = await pdf(<ServiceRecordDocument data={data} />).toBlob();
  await saveBlob(blob, "service-record.pdf");
}
