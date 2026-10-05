import { describe, expect, it } from "vitest";
import { shopRegistry } from "@/shop/registry";
import { registerRealShopProducts } from "@/shop/products";
import { GET } from "./route";

const HEADERS = [
  "id",
  "title",
  "description",
  "link",
  "image_link",
  "price",
  "availability",
  "condition",
  "brand",
  "product_type",
  "google_product_category",
];

/**
 * A small, correct RFC 4180 reader (quotes respected, "" inside a quoted
 * field means a literal quote), so these tests check that the feed is
 * genuinely valid CSV once parsed back, not just that some expected
 * substring appears in the raw text, the same discipline the RSS feed's
 * own test applies to its XML escaping.
 */
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (inQuotes) {
      if (char === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        field += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\r" && text[i + 1] === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      i++;
    } else {
      field += char;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

describe("Pinterest catalog feed", () => {
  it("serves CSV with the required header row, one row per paid published product", async () => {
    registerRealShopProducts();
    const paidProducts = shopRegistry.listPublished().filter((p) => p.access !== "free");

    const res = await GET();
    expect(res.headers.get("Content-Type")).toBe("text/csv; charset=utf-8");

    const rows = parseCsv(await res.text());
    expect(rows[0]).toEqual(HEADERS);
    expect(rows.length - 1).toBe(paidProducts.length);
    expect(paidProducts.length).toBeGreaterThan(0);
  });

  it("never includes Monthly Money Reset, the free product with no retail price", async () => {
    const res = await GET();
    const rows = parseCsv(await res.text());
    const ids = rows.slice(1).map((r) => r[0]);
    expect(ids).not.toContain("monthly-money-reset");
  });

  it("gives every row a non-empty value in every required column", async () => {
    const res = await GET();
    const rows = parseCsv(await res.text());
    for (const row of rows.slice(1)) {
      expect(row).toHaveLength(HEADERS.length);
      for (const [i, value] of row.entries()) {
        expect(value.length, `${HEADERS[i]} on row ${JSON.stringify(row)}`).toBeGreaterThan(0);
      }
    }
  });

  it("links and images are absolute, public draftpace.com URLs, never a relative path", async () => {
    const res = await GET();
    const rows = parseCsv(await res.text());
    const linkCol = HEADERS.indexOf("link");
    const imageCol = HEADERS.indexOf("image_link");
    for (const row of rows.slice(1)) {
      expect(row[linkCol]).toBe(`https://draftpace.com/shop/${row[0]}`);
      expect(row[imageCol]).toBe(`https://draftpace.com/store/pinterest/${row[0]}.webp`);
    }
  });

  it("formats every price as a decimal amount and a currency code", async () => {
    const res = await GET();
    const rows = parseCsv(await res.text());
    const priceCol = HEADERS.indexOf("price");
    for (const row of rows.slice(1)) {
      expect(row[priceCol]).toMatch(/^\d+\.\d{2} [A-Z]{3}$/);
    }
  });

  it("maps availability to Pinterest's own vocabulary, never the internal enum value", async () => {
    const res = await GET();
    const rows = parseCsv(await res.text());
    const availabilityCol = HEADERS.indexOf("availability");
    for (const row of rows.slice(1)) {
      expect(["in stock", "preorder", "out of stock"]).toContain(row[availabilityCol]);
    }
  });

  it("gives every row a real Google Product Taxonomy path for google_product_category", async () => {
    // "Office Supplies > Filing & Organization > Calendars, Organizers &
    // Planners" (category ID 927) is a genuine leaf in Google's own
    // taxonomy, not an invented string; see route.ts's own doc comment
    // for how that was confirmed. This only guards the shape (present,
    // a real "A > B > C" path, identical across every row since all 8
    // products are the same kind of thing), not Google's taxonomy
    // itself changing out from under us.
    const res = await GET();
    const rows = parseCsv(await res.text());
    const categoryCol = HEADERS.indexOf("google_product_category");
    for (const row of rows.slice(1)) {
      expect(row[categoryCol]).toBe(
        "Office Supplies > Filing & Organization > Calendars, Organizers & Planners"
      );
    }
  });

  it("round-trips a description that contains a comma without breaking the column count", async () => {
    // Real product copy in this catalogue already contains commas (lists
    // of what a product tracks), so this is exercised by the real data,
    // not a synthetic case. This just asserts that exercise actually
    // worked rather than assuming it.
    const res = await GET();
    const rows = parseCsv(await res.text());
    const hasCommaInSource = shopRegistry
      .listPublished()
      .filter((p) => p.access !== "free")
      .some((p) => p.seo.description.includes(","));
    expect(hasCommaInSource).toBe(true);
    for (const row of rows.slice(1)) expect(row).toHaveLength(HEADERS.length);
  });
});
