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
  metadataBase: new URL("https://www.draftpace.com"),
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
    url: "https://www.draftpace.com",
    siteName: "Draftpace",
    type: "website",
  },
  icons: {
    icon: [
      { url: "/logo/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/logo/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/logo/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/logo/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AppProviders>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
