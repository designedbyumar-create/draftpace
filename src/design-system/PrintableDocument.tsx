/**
 * Shared `@react-pdf/renderer` primitives for every product's printable
 * (see docs/DESIGN-SYSTEM.md). Before this existed, each product's
 * `printables/*.tsx` hand-rolled its own topbar, rule, footer, and page
 * shell from scratch, this is the one place that shape lives now: a
 * product still owns everything between the header and footer (that's
 * where its real identity is), but never re-derives "how a Draftpace
 * printable opens, closes, and paginates" on its own.
 *
 * Deliberately colour-agnostic: every primitive takes a `palette` so a
 * themed product's own accent renders here, never a hardcoded platform
 * colour. This module imports `@react-pdf/renderer` and must therefore
 * only ever be reached via a dynamic import, same discipline as every
 * existing `generatePdf.tsx`.
 */
import { Document, Page, View, Text, Link } from "@react-pdf/renderer";
import type { ReactNode } from "react";

export type PrintablePalette = {
  /** The one identity colour for this document, labels, links, the eyebrow row. */
  accent: string;
  /** Primary text colour. */
  ink: string;
  /** Secondary/caption text colour. */
  muted: string;
  /** Hairline rule/border colour. */
  line: string;
  /** Page background. Defaults to near-white when omitted. */
  paper?: string;
};

export function PrintableDocument({
  title,
  subject,
  children,
}: {
  title: string;
  subject: string;
  children: ReactNode;
}) {
  return (
    <Document title={title} author="Draftpace" subject={subject}>
      {children}
    </Document>
  );
}

/** The one page shell, with a running "page X of Y" footer that costs nothing to leave on a single-page document. */
export function PrintablePage({ palette, children }: { palette: PrintablePalette; children: ReactNode }) {
  return (
    <Page
      size="A4"
      style={{
        paddingVertical: 44,
        paddingHorizontal: 48,
        backgroundColor: palette.paper ?? "#fffdf9",
        color: palette.ink,
        fontFamily: "Helvetica",
        fontSize: 10,
        lineHeight: 1.5,
      }}
    >
      {children}
      <Text
        fixed
        style={{ position: "absolute", bottom: 24, right: 48, fontSize: 8, color: palette.muted }}
        render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
      />
    </Page>
  );
}

/** The shared cover row: an all-caps eyebrow naming the document, the Draftpace wordmark, and a hairline rule beneath both. */
export function PrintableHeader({ eyebrow, palette }: { eyebrow: string; palette: PrintablePalette }) {
  return (
    <>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Text style={{ fontSize: 8, letterSpacing: 1.4, color: palette.accent, fontFamily: "Helvetica-Bold" }}>
          {eyebrow}
        </Text>
        <Text style={{ fontSize: 9, color: palette.muted, fontFamily: "Times-Bold" }}>Draftpace</Text>
      </View>
      <View style={{ height: 1, backgroundColor: palette.line, marginTop: 10, marginBottom: 24 }} />
    </>
  );
}

/** A labelled section heading for a printable's own content, the one recurring pattern ("WHAT IS PROTECTED", "UPCOMING BILLS") every product's printable already reaches for. */
export function PrintableSectionLabel({ children, palette }: { children: ReactNode; palette: PrintablePalette }) {
  return (
    <Text style={{ fontSize: 8, letterSpacing: 1.2, color: palette.accent, fontFamily: "Helvetica-Bold", marginBottom: 8 }}>
      {children}
    </Text>
  );
}

/** A label/value row, a bill, a line in a calculation, an item in a list. */
export function PrintableRow({
  label,
  value,
  sign,
  palette,
}: {
  label: string;
  value: string;
  sign?: string;
  palette: PrintablePalette;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 4,
        borderBottom: 0.7,
        borderColor: palette.line,
        borderStyle: "solid",
      }}
    >
      <Text style={{ fontSize: 9.5, color: palette.muted, flex: 1, marginRight: 8 }}>
        {sign && sign !== "=" ? `${sign} ` : ""}
        {label}
      </Text>
      <Text style={{ fontSize: 9.5, color: palette.ink, fontFamily: "Helvetica-Bold" }}>{value}</Text>
    </View>
  );
}

/** The shared closing block: links back into the product's own app destinations, plus a fine-print note. Every printable's real reason to exist is to point back home, not to stand alone. */
export function PrintableContinueFooter({
  palette,
  links,
  note,
}: {
  palette: PrintablePalette;
  links: { label: string; href: string }[];
  note: string;
}) {
  return (
    <View style={{ marginTop: 26, paddingTop: 16, borderTop: 1, borderColor: palette.line, borderStyle: "solid" }}>
      <PrintableSectionLabel palette={palette}>CONTINUE IN THE APP</PrintableSectionLabel>
      <View style={{ flexDirection: "row", gap: 18, marginBottom: 14, flexWrap: "wrap" }}>
        {links.map((link) => (
          <Link
            key={link.href}
            style={{ fontSize: 10, color: palette.accent, fontFamily: "Helvetica-Bold", textDecoration: "underline" }}
            src={link.href}
          >
            {link.label}
          </Link>
        ))}
      </View>
      <Text style={{ fontSize: 8.5, color: palette.muted, lineHeight: 1.5 }}>{note}</Text>
    </View>
  );
}
