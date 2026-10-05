import { shopRegistry } from "@/shop/registry";
import { registerRealShopProducts } from "@/shop/products";
import { getAreaForProduct } from "@/content/areas";

/**
 * /feeds/pinterest.csv: the product data source for Draftpace's Pinterest
 * Business catalog (URL feed, CSV format, refreshed on whatever schedule
 * Pinterest's own Catalog config polls at).
 *
 * Generated from shopRegistry.listPublished() on every request, the same
 * source of truth the Shop page itself reads, never a hand-maintained
 * CSV, so the feed can't drift out of sync with what's actually for sale.
 * Only registerRealShopProducts() is called, not fixtures (same choice
 * sitemap.ts already makes): a dev-only internal fixture must never reach
 * a public commerce feed, whatever areDevFixturesEnabled() says locally.
 *
 * Monthly Money Reset is deliberately excluded. It's free, and its own
 * /shop page already permanently redirects to /free rather than render a
 * listing. Representing it as a $0.00 retail item would be inventing a
 * product that doesn't exist in the data model (it has no `price` field
 * at all) to satisfy a column this feed doesn't otherwise need. /free
 * stays the funnel for it, same as everywhere else on the site.
 *
 * image_link reads from /store/pinterest/<slug>.webp (public/store/
 * pinterest/), a Pinterest-only image set, not the Shop grid's own
 * /store/<slug>-1-cover.webp: Pinterest's catalog spec requires the
 * image_link asset to be at least 1000x1500 pixels (portrait, 2:3),
 * while the Shop grid covers are 1600x1200 (landscape, 4:3) and the
 * product's own `media` field is empty for every paid listing today.
 * The Pinterest images are built from the same real cover and app
 * screen assets already produced for the Etsy listing images (see
 * scripts/pinterest-images/render.mjs), not a new design invented from
 * scratch, and are generated separately rather than at request time
 * since they're a fixed per-product composite, not live data.
 *
 * product_type reads from the life-area a product belongs to
 * (getAreaForProduct, src/content/areas.ts), not from `needGroups`:
 * needGroups is almost entirely "getting-organized" for every listing,
 * far too coarse to be a useful category, while the area taxonomy
 * already gives each product a specific, real label (Money, Home,
 * Travel, ...).
 *
 * google_product_category is the same value, "927 - Office Supplies >
 * Filing & Organization > Calendars, Organizers & Planners", for every
 * row, because every one of these 8 products is the same kind of thing:
 * an undated, fill-in-yourself printable organizer/planner PDF, paired
 * with a companion app. Google's own taxonomy (fetched from
 * google.com/basepages/producttype/taxonomy-with-ids.en-US.txt, version
 * 2021-09-21, the current file at that URL) has no leaf more specific
 * than this one, no per-subject split (a travel organizer and a finance
 * organizer are both just "Calendars, Organizers & Planners") and no
 * separate "digital" or "printable" variant of it, so splitting this
 * per product would invent a distinction the taxonomy itself doesn't
 * draw. ID 927 is a genuine, current category ID, not invented.
 */

const GOOGLE_PRODUCT_CATEGORY =
  "Office Supplies > Filing & Organization > Calendars, Organizers & Planners";

const REQUIRED_HEADERS = [
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
] as const;

/**
 * RFC 4180: a field is quoted, with internal quotes doubled, whenever it
 * contains the delimiter, a quote, or a line break, which covers every
 * column here, since product copy is free text that can contain a comma
 * or a quote without warning.
 */
function csvField(value: string): string {
  if (/[",\n\r]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

function csvRow(values: string[]): string {
  return values.map(csvField).join(",") + "\r\n";
}

const AVAILABILITY_MAP: Record<string, string> = {
  available: "in stock",
  "coming-soon": "preorder",
};

export async function GET() {
  registerRealShopProducts();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://draftpace.com";

  const products = shopRegistry
    .listPublished()
    .filter((product) => product.access !== "free");

  const rows = products.map((product) => {
    const area = getAreaForProduct(product.slug);
    // Every row here comes from a paid listing, which the schema's own
    // refinement guarantees always carries a `price`. This is a type
    // narrowing, not a fallback for data that might really be missing.
    const price = product.price ? `${product.price.amount.toFixed(2)} ${product.price.currency}` : "";

    return csvRow([
      product.slug,
      product.title,
      product.seo.description,
      `${siteUrl}/shop/${product.slug}`,
      `${siteUrl}/store/pinterest/${product.slug}.webp`,
      price,
      AVAILABILITY_MAP[product.availability] ?? "out of stock",
      "new",
      "Draftpace",
      area?.label ?? "Draftpace",
      GOOGLE_PRODUCT_CATEGORY,
    ]);
  });

  const csv = csvRow([...REQUIRED_HEADERS]) + rows.join("");

  return new Response(csv, {
    headers: { "Content-Type": "text/csv; charset=utf-8" },
  });
}
