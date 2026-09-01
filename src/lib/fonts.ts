import { Fraunces, Inter, Newsreader, Space_Mono } from "next/font/google";

/**
 * Self-hosted, preloaded replacement for globals.css's old @import to
 * Google's CDN - that @import was a render-blocking cross-origin fetch
 * before the browser even discovered the font files, the same flash-risk
 * class as the theme FOUC fixed earlier, just for text instead of color.
 * next/font downloads these at build time and serves them from Draftpace's
 * own origin. Each font exposes its family via a CSS variable so
 * tailwind.config.js can reference var(--font-*) instead of a literal
 * family string, matching the html/body font-family declarations in
 * globals.css exactly.
 */
export const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-fraunces",
  display: "swap",
});

export const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-inter",
  display: "swap",
});

export const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-space-mono",
  display: "swap",
});

/**
 * Home Base's narrative voice, and the only place a second serif is
 * allowed in an application surface.
 *
 * Deliberately not Fraunces: that face is reserved for marketing and
 * editorial precisely so the product does not look like the landing
 * page, and the distinction is worth keeping. Newsreader is quieter,
 * reads as domestic rather than promotional, and holds up at the one or
 * two large lines per screen it is used for.
 *
 * Loaded here rather than in the product folder because next/font must
 * be initialised at module scope in a shared place, but it is applied
 * only through Home Base's own theme extension, so no other product's
 * rendering changes.
 */
export const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-newsreader",
  display: "swap",
});
