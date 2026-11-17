// The website's own Tailwind config as a preset: the same type scale, font
// variables and tokens. Content covers Studio, the design-system
// primitives it uses, and the real product components a film preview
// mounts (as creative/tailwind.config.mjs does for renders).
import rootConfig from "../tailwind.config.js";

/** @type {import('tailwindcss').Config} */
const config = {
  presets: [rootConfig],
  // Relative to this file: `next dev studio` runs from the repo root.
  content: { relative: true, files: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "../src/design-system/**/*.{ts,tsx}",
    "../src/products/monthly-money-reset/**/*.{ts,tsx}",
    "../src/lib/**/*.{ts,tsx}",
    "../creative/src/**/*.{ts,tsx}",
  ] },
};

export default config;
