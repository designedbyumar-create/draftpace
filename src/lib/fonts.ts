import { Fraunces, Inter, Space_Mono } from "next/font/google";

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
