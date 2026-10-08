// Extends the real app's tailwind.config.js as a preset, so the exact same
// type scale, font family variables and brand colors are available here.
// The `content` globs are the important addition: they must cover the real
// Draftpace source files this project imports (SafeToSpendCard.tsx,
// NextActionCard.tsx, design-system/*), because Tailwind only generates CSS
// for classes it finds by scanning files on disk, not by following imports.
import rootConfig from "../tailwind.config.js";

/** @type {import('tailwindcss').Config} */
export default {
  presets: [rootConfig],
  content: [
    "./src/**/*.{ts,tsx}",
    "../src/products/monthly-money-reset/**/*.{ts,tsx}",
    "../src/design-system/**/*.{ts,tsx}",
    "../src/lib/**/*.{ts,tsx}",
  ],
};
