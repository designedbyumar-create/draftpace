import type { NextConfig } from "next";

/**
 * No app-level host redirect here. The canonical apex-vs-www redirect is
 * owned entirely by the Vercel project's own domain configuration (a single
 * edge-level rule) — see docs note in the launch report. Adding a second,
 * opposite-direction redirect at this layer created a live apex<->www
 * infinite redirect loop the moment both hostnames pointed at the same
 * deployment, so this layer must never also redirect on host.
 *
 * Path redirects are safe and are used below: two early guides were
 * retired when the Companion Series taxonomy replaced the old needs one,
 * and their URLs had been live and indexed. Each points at the area hub
 * that now covers the same ground rather than at /guides, so the link
 * equity lands somewhere specific.
 */
const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/guides/planning-a-move-without-losing-the-details",
        destination: "/guides/home",
        permanent: true,
      },
      {
        source: "/guides/deciding-when-every-option-feels-risky",
        destination: "/guides/mind-and-focus",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
