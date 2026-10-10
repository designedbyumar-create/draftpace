import path from "node:path";
import type { NextConfig } from "next";

/**
 * Draftpace Studio runs on the website's toolchain (the root node_modules)
 * and drives the Creative Engine in ../creative directly, so it imports
 * from outside its own folder:
 *
 *   @/...         the website's src/ (design system, tokens, guides, listings), as the engine itself does
 *   @engine/...   creative/ (the director, the Film composition)
 *   ~/...         Studio's own code
 *
 * remotion and @remotion/player live in creative/node_modules. They are
 * pinned to that one copy so the Player and the Film composition share a
 * single Remotion; React stays Next's own.
 */
const ROOT = path.resolve(__dirname, "..");
const CREATIVE_MODULES = path.join(ROOT, "creative", "node_modules");

const config: NextConfig = {
  outputFileTracingRoot: ROOT,
  // Where the engine's files are; the engine cannot tell from inside a bundle (creative/director/write.ts).
  env: { DRAFTPACE_CREATIVE_DIR: path.join(ROOT, "creative") },
  // A voice-over recording is uploaded through a server action; 3 minutes of audio fits well inside this.
  experimental: { externalDir: true, serverActions: { bodySizeLimit: "60mb" } },
  devIndicators: false,
  async rewrites() {
    // staticFile("screens/x.png") inside a film resolves to /screens/x.png: serve the engine's public/ there.
    return ["screens", "audio", "fonts", "voiceover"].map((dir) => ({ source: `/${dir}/:path*`, destination: `/api/engine-public/${dir}/:path*` }));
  },
  webpack(config) {
    config.resolve.alias = {
      ...config.resolve.alias,
      remotion: path.join(CREATIVE_MODULES, "remotion"),
      "@remotion/player": path.join(CREATIVE_MODULES, "@remotion", "player"),
    };
    return config;
  },
};

export default config;
