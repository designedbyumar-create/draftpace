/**
 * The pieces every Family Health Binder page is built from, so the five of
 * them look like one set: US Letter, this product's rose, a person's name
 * and age up top, plain label and value rows, and one closing note that
 * says what the page is and how much it left off.
 *
 * Imports @react-pdf/renderer, so it is only ever reached by a dynamic
 * import, same discipline as every other generator in the repo.
 */
import { Text, View, pdf } from "@react-pdf/renderer";
import type { ReactElement, ReactNode } from "react";
import { PrintableHeader, PrintablePage, type PrintablePalette } from "@/design-system/PrintableDocument";
import type { SheetContact, SheetLine, SheetPerson } from "../printSheets";

export const PALETTE: PrintablePalette = {
  accent: "#b23a5b",
  ink: "#241a1b",
  muted: "#64565a",
  line: "#eaddd6",
  paper: "#fffdfb",
};
export const SOFT = "#f9e3ea";
export const WASH = "#f6efea";

export function Page({ eyebrow, children }: { eyebrow: string; children: ReactNode }) {
  return (
    <PrintablePage palette={PALETTE} size="LETTER">
      <PrintableHeader eyebrow={eyebrow} palette={PALETTE} />
      {children}
    </PrintablePage>
  );
}

export function Title({ children, person, sub }: { children: string; person: SheetPerson; sub?: string }) {
  const meta = [person.age, person.dateOfBirth ? `born ${person.dateOfBirth}` : null].filter(Boolean).join(", ");
  return (
    <View>
      <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 24, color: PALETTE.ink, lineHeight: 1.2 }}>{children}</Text>
      <Text style={{ fontSize: 11, color: PALETTE.muted, marginTop: 4 }}>{[person.name, meta, sub].filter(Boolean).join("  ·  ")}</Text>
    </View>
  );
}

export function Block({ label, children, top = 9 }: { label: string; children: ReactNode; top?: number }) {
  return (
    <View style={{ marginTop: top }} wrap={false}>
      <Text style={{ fontSize: 8, letterSpacing: 1.2, color: PALETTE.accent, fontFamily: "Helvetica-Bold", marginBottom: 6 }}>{label.toUpperCase()}</Text>
      {children}
    </View>
  );
}

const rowStyle = { paddingVertical: 2, borderBottomWidth: 0.7, borderBottomColor: PALETTE.line, borderBottomStyle: "solid" as const };

/** Lines with a bold label and an optional detail beneath, or one muted sentence when there are none. */
export function Lines({ items, empty }: { items: SheetLine[]; empty: string }) {
  if (items.length === 0) return <Text style={{ fontSize: 10, color: PALETTE.muted }}>{empty}</Text>;
  return (
    <>
      {items.map((item, i) => (
        <View key={i} style={{ ...rowStyle, paddingVertical: 3 }}>
          <Text style={{ fontSize: 10.5, color: PALETTE.ink }}>
            <Text style={{ fontFamily: "Helvetica-Bold" }}>{item.label}</Text>
            {item.detail ? <Text style={{ fontSize: 9.5, color: PALETTE.muted }}>{`   ${item.detail}`}</Text> : null}
          </Text>
        </View>
      ))}
    </>
  );
}

/** A label and a value on one row. A missing value is said plainly, never left blank or invented. */
export function Field({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <View style={{ ...rowStyle, flexDirection: "row" }}>
      <Text style={{ width: 110, fontSize: 9.5, color: PALETTE.muted }}>{label}</Text>
      {value ? (
        <Text style={{ flex: 1, fontSize: 10.5, color: PALETTE.ink, fontFamily: "Helvetica-Bold" }}>{value}</Text>
      ) : (
        <Text style={{ flex: 1, fontSize: 10, color: PALETTE.muted, fontFamily: "Helvetica-Oblique" }}>Not recorded</Text>
      )}
    </View>
  );
}

export const contactText = (c: SheetContact | null): string | null => (c ? [c.name, c.phone].filter(Boolean).join(", ") : null);

/** The closing note: when the page was made, how many private records it left off, and what it is and is not. */
export function Note({ generatedLabel, hiddenCount }: { generatedLabel: string; hiddenCount: number }) {
  const left = hiddenCount > 0 ? ` ${hiddenCount === 1 ? "One record marked private is" : `${hiddenCount} records marked private are`} left off.` : "";
  return (
    <View style={{ marginTop: 10, padding: 7, backgroundColor: WASH }} wrap={false}>
      <Text style={{ fontSize: 7, color: PALETTE.ink, lineHeight: 1.4 }}>
        Typed in by the family, as of {generatedLabel}.{left} Supplements the paperwork a clinic, school or camp gives you and does not replace it. Not medical advice. Draftpace is not a HIPAA
        covered entity; where the FTC Health Breach Notification Rule or a state health-privacy law applies to what you store here, Draftpace follows it.
      </Text>
    </View>
  );
}

/** Hand a finished document to the browser as a download. */
export async function download(element: ReactElement, filename: string): Promise<void> {
  const blob = await pdf(element as Parameters<typeof pdf>[0]).toBlob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export const slug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "person";
