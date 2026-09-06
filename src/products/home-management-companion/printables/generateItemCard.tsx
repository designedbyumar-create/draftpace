/**
 * The Item Card: a single printed page for one thing in the home, carrying
 * every fact worth having in hand at a hardware store or when a trade asks
 * "what have you got?" (Trump Card Memo). Built on the shared
 * PrintableDocument shell, reading directly from live item data rather
 * than encoding a link back to the app: the whole point is that the paper
 * itself is self-sufficient, not a pointer to somewhere else.
 *
 * This module imports @react-pdf/renderer and must therefore only ever be
 * reached via a dynamic import, same discipline as every existing
 * generatePdf.tsx in this repo.
 */
import { View, Text, pdf } from "@react-pdf/renderer";
import {
  PrintableDocument,
  PrintablePage,
  PrintableHeader,
  PrintableSectionLabel,
  PrintableRow,
  type PrintablePalette,
} from "@/design-system/PrintableDocument";
import type { HomeItem } from "../state";
import { HOME_ITEM_CATEGORY_LABEL, categoryOfType } from "../homeKnowledge";

/** Home Base's own accent (definition.ts's theme.accentScale). */
const PALETTE: PrintablePalette = {
  accent: "#4f7a5c",
  ink: "#1a2420",
  muted: "#6b7570",
  line: "#e4e0d5",
  paper: "#fbfaf6",
};

const FIELD_LABEL: Record<string, string> = {
  brand: "Brand",
  model: "Model",
  location: "Location",
  buySpec: "What to buy",
  purchaseDate: "Purchased",
  installDate: "Installed",
  warrantyExpiresAt: "Warranty expires",
};

function ItemCardDocument({ item, typeLabel }: { item: HomeItem; typeLabel: string }) {
  const category = categoryOfType(item.type);
  const rows: [string, string][] = (
    [
      ["brand", item.brand],
      ["model", item.model],
      ["location", item.location],
      ["buySpec", item.buySpec],
      ["purchaseDate", item.purchaseDate],
      ["installDate", item.installDate],
      ["warrantyExpiresAt", item.warrantyExpiresAt],
    ] as [string, string | null][]
  ).filter((pair): pair is [string, string] => pair[1] !== null && pair[1] !== "");

  return (
    <PrintableDocument title={`Home Base: ${item.name}`} subject="Item card">
      <PrintablePage palette={PALETTE}>
        <PrintableHeader eyebrow="HOME BASE" palette={PALETTE} />

        <Text style={{ fontSize: 9, letterSpacing: 1.2, color: PALETTE.muted, textTransform: "uppercase" }}>
          {category ? HOME_ITEM_CATEGORY_LABEL[category] : typeLabel}
        </Text>
        <Text style={{ fontFamily: "Times-Bold", fontSize: 24, color: PALETTE.ink, marginTop: 4 }}>{item.name}</Text>

        <View style={{ marginTop: 22 }}>
          {rows.length === 0 ? (
            <Text style={{ fontSize: 9.5, color: PALETTE.muted }}>Nothing recorded yet beyond the name.</Text>
          ) : (
            rows.map(([field, value]) => <PrintableRow key={field} label={FIELD_LABEL[field]} value={value} palette={PALETTE} />)
          )}
        </View>

        {item.notes && (
          <>
            <PrintableSectionLabel palette={PALETTE}>NOTES</PrintableSectionLabel>
            <Text style={{ fontSize: 9.5, color: PALETTE.ink, lineHeight: 1.5 }}>{item.notes}</Text>
          </>
        )}
      </PrintablePage>
    </PrintableDocument>
  );
}

export async function downloadItemCard(item: HomeItem, typeLabel: string): Promise<void> {
  const blob = await pdf(<ItemCardDocument item={item} typeLabel={typeLabel} />).toBlob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${item.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-card.pdf`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
