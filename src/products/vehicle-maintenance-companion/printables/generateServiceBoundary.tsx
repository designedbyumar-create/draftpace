/**
 * The Service Boundary: this product's signature document. A dated,
 * mileage-stamped statement of exactly what is being requested today and
 * what is explicitly not authorized without a further conversation,
 * built on the shared PrintableDocument shell
 * (src/design-system/PrintableDocument.tsx).
 *
 * It exists because "while we had it up on the lift" is how a routine
 * oil change becomes a much larger bill, and a boundary stated in
 * writing, in advance, is worth more at the counter than a memory of
 * what was agreed on the phone. This document states a person's own
 * choice, made in the app before handing this page over; it never
 * decides that choice itself.
 *
 * This module imports @react-pdf/renderer and must therefore only ever
 * be reached via a dynamic import, same discipline as every existing
 * generatePdf.tsx in this repo.
 */
import { View, Text, pdf } from "@react-pdf/renderer";
import {
  PrintableDocument,
  PrintablePage,
  PrintableHeader,
  PrintableSectionLabel,
  PrintableContinueFooter,
  type PrintablePalette,
} from "@/design-system/PrintableDocument";

export type ServiceBoundaryVehicle = {
  label: string;
  year: number | null;
  make: string | null;
  model: string | null;
  currentMileage: number | null;
};

export type ServiceBoundaryData = {
  generatedLabel: string;
  vehicle: ServiceBoundaryVehicle;
  /** Task names the person has chosen to request today. */
  requested: string[];
  /** Task names, tracked on this vehicle, explicitly not authorized without a further conversation. */
  notAuthorized: string[];
  origin: string;
  slug: string;
};

/** This product's own steel accent (definition.ts's theme.accentScale), not a hardcoded placeholder. */
const PALETTE: PrintablePalette = {
  accent: "#565349",
  ink: "#211f1a",
  muted: "#6f6c62",
  line: "#e9e7e0",
  paper: "#fbfaf7",
};

function vehicleIdentityLine(vehicle: ServiceBoundaryVehicle): string {
  const parts = [vehicle.year, vehicle.make, vehicle.model].filter(Boolean);
  return parts.length > 0 ? parts.join(" ") : vehicle.label;
}

function ServiceBoundaryDocument({ data }: { data: ServiceBoundaryData }) {
  const productUrl = (dest: string) => `${data.origin}/app/products/${data.slug}/${dest}`;

  return (
    <PrintableDocument title="Vehicle Maintenance Companion: Service Boundary" subject="What's requested today, and what is not authorized">
      <PrintablePage palette={PALETTE}>
        <PrintableHeader eyebrow="VEHICLE MAINTENANCE COMPANION" palette={PALETTE} />

        <Text style={{ fontFamily: "Times-Bold", fontSize: 24, color: PALETTE.accent }}>Service Boundary</Text>
        <Text style={{ fontSize: 10, color: PALETTE.muted, marginTop: 3 }}>
          {data.vehicle.label}
          {vehicleIdentityLine(data.vehicle) !== data.vehicle.label ? ` (${vehicleIdentityLine(data.vehicle)})` : ""}
          {" — "}
          {data.generatedLabel}
          {data.vehicle.currentMileage !== null ? `, at ${data.vehicle.currentMileage.toLocaleString()} miles` : ""}
        </Text>

        <View style={{ marginTop: 22 }}>
          <PrintableSectionLabel palette={PALETTE}>REQUESTED TODAY</PrintableSectionLabel>
          {data.requested.length === 0 ? (
            <Text style={{ fontSize: 9.5, color: PALETTE.muted }}>Nothing is being requested today.</Text>
          ) : (
            data.requested.map((task, i) => (
              <View
                key={i}
                style={{
                  flexDirection: "row",
                  paddingVertical: 4,
                  borderBottom: 0.7,
                  borderColor: PALETTE.line,
                  borderStyle: "solid",
                }}
              >
                <Text style={{ fontSize: 9.5, color: PALETTE.ink, fontFamily: "Helvetica-Bold" }}>{task}</Text>
              </View>
            ))
          )}
        </View>

        <View style={{ marginTop: 22 }}>
          <PrintableSectionLabel palette={PALETTE}>NOT AUTHORIZED WITHOUT A FURTHER CONVERSATION</PrintableSectionLabel>
          {data.notAuthorized.length === 0 ? (
            <Text style={{ fontSize: 9.5, color: PALETTE.muted }}>Nothing else is being tracked on this vehicle right now.</Text>
          ) : (
            data.notAuthorized.map((task, i) => (
              <View
                key={i}
                style={{
                  flexDirection: "row",
                  paddingVertical: 4,
                  borderBottom: 0.7,
                  borderColor: PALETTE.line,
                  borderStyle: "solid",
                }}
              >
                <Text style={{ fontSize: 9.5, color: PALETTE.muted }}>{task}</Text>
              </View>
            ))
          )}
        </View>

        <View style={{ marginTop: 22, padding: 12, backgroundColor: "#f3f2ee" }}>
          <Text style={{ fontSize: 9, color: PALETTE.ink, lineHeight: 1.6 }}>
            Anything not listed under &quot;Requested today&quot; is not authorized. If something else comes up during
            this visit, the expectation is a phone call before any further work begins.
          </Text>
        </View>

        <PrintableContinueFooter
          palette={PALETTE}
          links={[{ label: "Open Due", href: productUrl("workspace") }, { label: "Open Vehicles", href: productUrl("vehicles") }]}
          note={`This is a snapshot from ${data.generatedLabel}. It states a choice made in the app, not a recommendation from Draftpace about what your vehicle actually needs.`}
        />
      </PrintablePage>
    </PrintableDocument>
  );
}

export async function downloadServiceBoundary(data: ServiceBoundaryData): Promise<void> {
  const blob = await pdf(<ServiceBoundaryDocument data={data} />).toBlob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "service-boundary.pdf";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
