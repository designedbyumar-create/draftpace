/**
 * The Service Boundary: this product's signature document. A dated,
 * mileage-stamped statement of exactly what is being requested today and
 * what is not authorized without a call first, that a person hands over
 * before a shop touches the car.
 *
 * It exists because "while we had it up on the lift" is how a routine oil
 * change becomes a much larger bill, and a boundary stated in writing, in
 * advance, is worth more at the counter than a memory of what was agreed
 * on the phone. This document states a person's own choice, made in the
 * app before handing this page over; it never decides that choice itself.
 *
 * This module imports @react-pdf/renderer and must therefore only ever be
 * reached via a dynamic import, same discipline as every existing
 * generatePdf.tsx in this repo.
 */
import { View, Text, pdf } from "@react-pdf/renderer";
import { PrintableDocument, PrintablePage, PrintableHeader, PrintableSectionLabel, PrintableContinueFooter } from "@/design-system/PrintableDocument";
import { PALETTE, saveBlob, vehicleIdentityLine } from "./palette";

export type ServiceBoundaryData = {
  generatedLabel: string;
  vehicle: { label: string; year: number | null; make: string | null; model: string | null; currentMileage: number | null };
  /** The shop's name, or empty to leave a line to write it on. */
  shop: string;
  /** A phone number the shop should call before doing anything else, or empty to leave a line. */
  callNumber: string;
  /** The most the person will agree to without a call, as typed, or empty to leave a line. */
  ceiling: string;
  /** Tracked jobs the person is requesting today. */
  requested: string[];
  /** Anything else requested that is not a tracked job, one per entry. */
  alsoRequested: string[];
  askForOldParts: boolean;
  origin: string;
  slug: string;
};

const RULE = { borderBottom: 0.7, borderColor: PALETTE.line, borderStyle: "solid" } as const;

function Field({ label, value, width }: { label: string; value: string; width?: number | string }) {
  return (
    <View style={{ width: width ?? "100%", marginBottom: 8 }}>
      <Text style={{ fontSize: 7.5, color: PALETTE.muted, letterSpacing: 0.6 }}>{label.toUpperCase()}</Text>
      <View style={{ borderBottom: 0.7, borderColor: PALETTE.ink, borderStyle: "solid", minHeight: 15, justifyContent: "flex-end" }}>
        <Text style={{ fontSize: 10.5, color: PALETTE.ink }}>{value}</Text>
      </View>
    </View>
  );
}

export function ServiceBoundaryDocument({ data }: { data: ServiceBoundaryData }) {
  const productUrl = (dest: string) => `${data.origin}/app/products/${data.slug}/${dest}`;
  const identity = vehicleIdentityLine(data.vehicle);
  const allRequested = [...data.requested, ...data.alsoRequested];

  return (
    <PrintableDocument title="Vehicle Maintenance Companion: Service Boundary" subject="What is requested today, and what is not authorized">
      <PrintablePage palette={PALETTE}>
        <PrintableHeader eyebrow="VEHICLE MAINTENANCE COMPANION" palette={PALETTE} />

        <Text style={{ fontFamily: "Times-Bold", fontSize: 24, lineHeight: 1.2, color: PALETTE.accent }}>Service Boundary</Text>
        <Text style={{ fontSize: 10, color: PALETTE.muted, marginTop: 6 }}>
          {data.vehicle.label}
          {identity !== data.vehicle.label ? ` (${identity})` : ""}
          {" · "}
          {data.generatedLabel}
          {data.vehicle.currentMileage !== null ? ` · ${data.vehicle.currentMileage.toLocaleString()} miles` : ""}
        </Text>

        <View style={{ marginTop: 18, flexDirection: "row", gap: 16 }}>
          <View style={{ flex: 1 }}>
            <Field label="Shop" value={data.shop} />
          </View>
          <View style={{ flex: 1 }}>
            <Field label="Call me on" value={data.callNumber} />
          </View>
        </View>

        <View style={{ marginTop: 8 }}>
          <PrintableSectionLabel palette={PALETTE}>REQUESTED TODAY</PrintableSectionLabel>
          {allRequested.length === 0 ? (
            <Text style={{ fontSize: 9.5, color: PALETTE.muted }}>Nothing is being requested today.</Text>
          ) : (
            allRequested.map((task, i) => (
              <View key={i} style={{ flexDirection: "row", paddingVertical: 4, ...RULE }}>
                <Text style={{ fontSize: 9.5, color: PALETTE.ink, fontFamily: "Helvetica-Bold" }}>{task}</Text>
              </View>
            ))
          )}
        </View>

        <View style={{ marginTop: 20, padding: 12, backgroundColor: "#f4f3ee" }}>
          <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 9.5, color: PALETTE.ink }}>Anything not listed above is not authorized.</Text>
          <Text style={{ fontSize: 9, color: PALETTE.ink, lineHeight: 1.6, marginTop: 4 }}>
            If something else comes up during this visit, please call me before any further work begins, and wait for my answer. Please give me a written
            estimate for anything you find.
          </Text>
          <View style={{ marginTop: 10, flexDirection: "row", gap: 16 }}>
            <View style={{ flex: 1 }}>
              <Field label="Please do not go over, without a call" value={data.ceiling} />
            </View>
            <View style={{ flex: 1 }} />
          </View>
          {data.askForOldParts && <Text style={{ fontSize: 9, color: PALETTE.ink }}>Please keep any parts you replace so that I can see them.</Text>}
        </View>

        <View style={{ marginTop: 28, flexDirection: "row", gap: 24 }}>
          <View style={{ flex: 1 }}>
            <Field label="Owner initials" value="" />
          </View>
          <View style={{ flex: 1 }}>
            <Field label="Shop initials" value="" />
          </View>
        </View>

        <PrintableContinueFooter
          palette={PALETTE}
          links={[{ label: "Open Due", href: productUrl("workspace") }, { label: "Open Vehicles", href: productUrl("vehicles") }]}
          note={`A snapshot from ${data.generatedLabel}. It states a choice made in the app, not a recommendation from Draftpace about what your vehicle needs.`}
        />
      </PrintablePage>
    </PrintableDocument>
  );
}

export async function downloadServiceBoundary(data: ServiceBoundaryData): Promise<void> {
  const blob = await pdf(<ServiceBoundaryDocument data={data} />).toBlob();
  await saveBlob(blob, "service-boundary.pdf");
}
