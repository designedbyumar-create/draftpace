import type { Metadata, Viewport } from "next";
import "./globals.css";
import AppProviders from "@/components/providers/AppProviders";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f2ec" },
    { media: "(prefers-color-scheme: dark)", color: "#100f0c" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL("https://draftpace.com"),
  title: {
    default: "Draftpace: A studio for living products",
    template: "%s | Draftpace",
  },
  description:
    "Draftpace is a studio that makes and sells living products: installable apps that remember you, guide you, and stay ready, instead of dying on download like a static file.",
  manifest: "/manifest.webmanifest",
  applicationName: "Draftpace",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Draftpace",
  },
  openGraph: {
    title: "Draftpace: A studio for living products",
    description:
      "A studio for living products: installable apps that remember you, guide your next step, and pick up where you left off.",
    url: "https://draftpace.com",
    siteName: "Draftpace",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Draftpace: a studio for living products" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Draftpace: A studio for living products",
    description:
      "A studio for living products: installable apps that remember you, guide your next step, and pick up where you left off.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/logo/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/logo/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/logo/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/logo/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  // Google Search Console's HTML-tag verification method. Renders no meta
  // tag at all until GOOGLE_SITE_VERIFICATION is set; never a placeholder
  // value, since a fabricated one would silently fail verification.
  ...(process.env.GOOGLE_SITE_VERIFICATION
    ? { verification: { google: process.env.GOOGLE_SITE_VERIFICATION } }
    : {}),
};

// Runs synchronously before hydration, before the browser paints anything
// else in <body>. Without this, the page paints once with no data-theme
// attribute (light, or dark only if the OS itself prefers dark), then
// ThemeProvider's own useEffect corrects it after mount - visible as a
// flash to dark or light for a frame on every load whenever the stored
// preference disagrees with the OS default. Keep this in sync with
// ThemeProvider.tsx's STORAGE_KEY and resolution logic; they must compute
// the same result from the same localStorage value.
const THEME_INIT_SCRIPT = `(function(){try{var s=localStorage.getItem("draftpace-theme");var t=(s==="light"||s==="dark"||s==="system")?s:"system";var r=t==="system"?(window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"):t;document.documentElement.dataset.theme=t;document.documentElement.style.colorScheme=r;}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <AppProviders>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
