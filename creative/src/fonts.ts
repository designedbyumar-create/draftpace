/**
 * Injects @font-face rules pointing at the self-hosted files in
 * public/fonts/, using Remotion's staticFile() so the URL resolves
 * correctly in both Studio preview and a real render. See style.css for
 * why this can't just be a CSS @font-face block.
 */
import { staticFile } from "remotion";

export function injectFonts() {
  if (typeof document === "undefined") return;
  if (document.getElementById("draftpace-fonts")) return; // idempotent across Fast Refresh in Studio
  const style = document.createElement("style");
  style.id = "draftpace-fonts";
  style.textContent = `
    @font-face {
      font-family: "Inter";
      font-style: normal;
      font-weight: 400 800;
      font-display: swap;
      src: url("${staticFile("fonts/inter-latin.woff2")}") format("woff2");
    }
    @font-face {
      font-family: "Space Mono";
      font-style: normal;
      font-weight: 400;
      font-display: swap;
      src: url("${staticFile("fonts/space-mono-400.woff2")}") format("woff2");
    }
    @font-face {
      font-family: "Space Mono";
      font-style: normal;
      font-weight: 700;
      font-display: swap;
      src: url("${staticFile("fonts/space-mono-700.woff2")}") format("woff2");
    }
  `;
  document.head.appendChild(style);
}
