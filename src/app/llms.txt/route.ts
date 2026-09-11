import { NEEDS } from "@/content/needs";
import { LIFE_AREAS } from "@/content/areas";
import { areasWithGuides, guidesForArea } from "@/content/guides";
import { shopRegistry } from "@/shop/registry";
import { registerRealShopProducts } from "@/shop/products";
import { formatPrice } from "@/shop/definition";
import { ensureShopRegistered } from "@/shop/ensureRegistered";

/**
 * /llms.txt: the emerging convention (llmstxt.org) for a short, plain
 * markdown summary of a site aimed at an LLM-based crawler or agent,
 * rather than the full HTML a person would read. Distinct from robots.ts
 * (which only says what a crawler MAY fetch) and sitemap.ts (which only
 * lists URLs): this is the one file that actually explains what
 * Draftpace is and names the real catalogue, in the format these
 * systems are built to parse quickly.
 *
 * Generated from the same registries sitemap.ts and the real pages
 * read, never a hand-maintained second copy of the catalogue: a product
 * added, retired, or repriced anywhere else on the site updates this
 * file for free and cannot let it drift into naming a product that no
 * longer exists or a price nobody charges.
 *
 * A route handler rather than a static public/llms.txt file because the
 * catalogue and prices are computed, not fixed text.
 */
export async function GET() {
  ensureShopRegistered();
  registerRealShopProducts();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://draftpace.com";
  const products = shopRegistry.listPublished();
  const productBySlug = new Map(products.map((product) => [product.slug, product]));

  const lines: string[] = [];
  const push = (line = "") => lines.push(line);

  push("# Draftpace");
  push();
  push(
    "> The Companion Series: products for the parts of everyday life that are hardest to stay on top of. " +
      "Each one remembers your situation, tells you what actually needs you now, and stays quiet when nothing does. " +
      "No AI runs inside any product; what each one suggests was written by a person, derived from what you recorded " +
      "yourself, never invented or guessed."
  );
  push();
  push(
    "There is no streak, completion percentage, or activity you did not record yourself, in any product. " +
      "Every paid product is billed once, not a subscription, unless its own listing says otherwise."
  );
  push();

  push("## Products");
  push();
  for (const area of LIFE_AREAS) {
    const areaProducts = area.productSlugs.map((slug) => productBySlug.get(slug)).filter((p): p is NonNullable<typeof p> => Boolean(p));
    if (areaProducts.length === 0) continue;
    push(`### ${area.label}`);
    push(area.situation);
    push();
    for (const product of areaProducts) {
      push(`- [${product.title}](${siteUrl}/shop/${product.slug}): ${product.promise} (${formatPrice(product)})`);
    }
    push();
  }

  push("## Guides");
  push();
  push(`Short, situation-specific guides, organised by the same areas as the products. Full index: ${siteUrl}/guides`);
  push();
  for (const area of areasWithGuides()) {
    const guides = guidesForArea(area.slug);
    if (guides.length === 0) continue;
    push(`### ${area.label}`);
    for (const guide of guides) {
      push(`- [${guide.title}](${siteUrl}/guides/${guide.slug}): ${guide.dek}`);
    }
    push();
  }

  const publishedSlugs = new Set(products.flatMap((product) => product.needGroups));
  const needLinks = NEEDS.filter((need) => publishedSlugs.has(need.slug));
  if (needLinks.length > 0) {
    push("## Find the right product by situation");
    push();
    for (const need of needLinks) {
      push(`- [${need.label}](${siteUrl}/help-with/${need.slug})`);
    }
    push();
  }

  push("## Company");
  push();
  push(`- [About](${siteUrl}/about)`);
  push(`- [How it works](${siteUrl}/how-it-works)`);
  push(`- [Trust and privacy](${siteUrl}/trust)`);
  push(`- [Shop, the full catalogue](${siteUrl}/shop)`);

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
}
