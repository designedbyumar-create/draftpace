import type { NextConfig } from "next";

/**
 * No app-level host redirect here. The canonical apex-vs-www redirect is
 * owned entirely by the Vercel project's own domain configuration (a single
 * edge-level rule) — see docs note in the launch report. Adding a second,
 * opposite-direction redirect at this layer created a live apex<->www
 * infinite redirect loop the moment both hostnames pointed at the same
 * deployment, so this layer must never also redirect on host.
 */
const nextConfig: NextConfig = {};

export default nextConfig;
