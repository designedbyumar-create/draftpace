"use client";

import {
  Armchair,
  Blueprint,
  Bug,
  CookingPot,
  Drop,
  Home,
  Key,
  Lightning,
  Plant,
  ShieldCheck,
  Thermometer,
  TShirt,
  type DraftpaceIcon,
} from "@/design-system/Icon";
import { HOME_ITEM_TYPE_BY_ID, type HomeItemCategory } from "../../homeKnowledge";

/**
 * One icon per category, twelve in total.
 *
 * The design system forbids a decorative icon per card, and it is right
 * to: 122 types with 122 glyphs would be noise. Twelve is different,
 * because it encodes a real and stable taxonomy and answers a genuine
 * question at a glance, which of these is the plumbing one, when
 * somebody is scanning a list of thirty things.
 *
 * Phosphor throughout, per the platform's one-icon-library rule. The
 * product's own character comes from the treatment (a soft accent-tinted
 * tile, a single restrained hue) rather than from bespoke artwork, which
 * would drift out of step with every other icon in the app and need
 * maintaining forever.
 *
 * Deliberately not used on care rows or problems. Those are about
 * urgency, not category, and an icon there would be exactly the
 * decoration the rule bans.
 */
const CATEGORY_ICON: Record<HomeItemCategory, DraftpaceIcon> = {
  kitchen: CookingPot,
  laundry: TShirt,
  climate: Thermometer,
  water: Drop,
  power: Lightning,
  safety: ShieldCheck,
  structure: Home,
  grounds: Plant,
  pests: Bug,
  everyday: Armchair,
  records: Blueprint,
  renting: Key,
};

/** Anything unrecognised falls back to the house itself, which is always true. */
export function categoryIconFor(type: string): DraftpaceIcon {
  const category = HOME_ITEM_TYPE_BY_ID[type]?.category;
  return category ? CATEGORY_ICON[category] : Home;
}

export default function CategoryIcon({ type, size = 16 }: { type: string; size?: number }) {
  const Icon = categoryIconFor(type);
  return (
    <span
      aria-hidden
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--primary-soft)] text-[var(--primary)]"
    >
      <Icon size={size} aria-hidden />
    </span>
  );
}
