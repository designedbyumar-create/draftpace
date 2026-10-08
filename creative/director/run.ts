/**
 * Plans every brief in slate.json, in order, each knowing the films before
 * it. Returns the films and their treatments; scripts/direct.mjs writes them.
 */
import SLATE from "./slate.json";
import { direct, type Brief } from "./direct";
import { buildDossier } from "./dossier";
import { treatment } from "./treatment";
import { SHOP_LISTINGS, productLine } from "../src/shop-listings";
import { PRODUCT_DEFINITIONS, THEMES } from "../src/theme-registry";
import type { Film } from "./film";

export function dossierFor(slug: string) {
  const { price, compareAt } = productLine(slug);
  return buildDossier({ listing: SHOP_LISTINGS[slug], definition: PRODUCT_DEFINITIONS[slug], accent: THEMES[slug].accent, price, compareAt });
}

export function runSlate(briefs: Brief[] = SLATE.briefs as Brief[]): { film: Film; doc: string }[] {
  const out: { film: Film; doc: string }[] = [];
  for (const b of briefs) {
    const film = direct(b, dossierFor(b.product), out.map((x) => x.film));
    out.push({ film, doc: treatment(film) });
  }
  return out;
}
