/**
 * The shapes the homepage's product sections are built from: a product's own
 * colours and type (PosterTheme), and what is said about it (PosterData).
 * The theme is worked out on the server from the product's definition, so a
 * re-theme of a product moves its section with it.
 */
export interface Hero {
  from: string;
  mid: string;
  to: string;
  ink: string;
}

export interface PosterTheme {
  bg: string;
  surface: string;
  text: string;
  muted: string;
  border: string;
  accent: string;
  accentContrast: string;
  soft: string;
  radius: number;
  /** The face the product's own headings speak in. */
  headlineFont: string;
  /** Some products (a vehicle's dashboard) label everything in monospace. */
  monoLabels: boolean;
  hero?: Hero;
}

export interface PosterData {
  productSlug: string;
  title: string;
  area: string;
  priceLabel: string;
  headline: string;
  beats: { lead: string; text: string }[];
  theme: PosterTheme;
}

export interface SceneData {
  id: string;
  title: string;
  posters: [PosterData, PosterData];
}
