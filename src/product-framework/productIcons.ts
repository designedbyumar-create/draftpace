import {
  Compass,
  GraduationCap,
  Heart,
  Home,
  Layers3,
  Shield,
  TrendingUp,
  Wallet,
  type DraftpaceIcon,
} from "@/design-system/Icon";

/**
 * The one slug-to-icon map for owned products, shared by every surface
 * that draws one (Home's summary tiles, Library's shelf cards, a
 * product's manual page). Kept here rather than copied per component so a
 * product can never appear as a wallet in one place and a stack in
 * another.
 *
 * A product with no entry falls back to the neutral stack icon rather
 * than being given a guessed one — an unregistered product is a real
 * state, not something to paper over.
 */
const PRODUCT_ICON: Record<string, DraftpaceIcon> = {
  "monthly-money-reset": TrendingUp,
  "personal-finance-companion": Wallet,
  "home-management-companion": Home,
  alongside: Heart,
  "homeschooling-companion": GraduationCap,
  "personal-life-affairs-companion": Shield,
  "travel-companion": Compass,
};

export function iconForProduct(slug: string): DraftpaceIcon {
  return PRODUCT_ICON[slug] ?? Layers3;
}
