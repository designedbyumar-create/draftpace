import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Canonical host redirect: www.draftpace.com -> draftpace.com. The
   * canonical domain everywhere else in this app (metadataBase, sitemap,
   * robots, canonical tags) is the apex, so a visitor or crawler landing on
   * www must never see a second, duplicate-content host. This is evaluated
   * by Next's own routing layer, independent of the Vercel project's domain
   * settings, so it holds even if that configuration ever changes.
   */
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.draftpace.com" }],
        destination: "https://draftpace.com/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
