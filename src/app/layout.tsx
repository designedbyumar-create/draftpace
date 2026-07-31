import type { Metadata } from "next";
import "./globals.css";
import AppProviders from "@/components/providers/AppProviders";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.draftpace.com"),
  title: {
    default: "Draftpace — Digital products that remember you",
    template: "%s | Draftpace",
  },
  description:
    "Draftpace is a platform for personalized, adaptive digital products — Companions, learning products, automation tools, guided programs, and trackers.",
  manifest: "/manifest.webmanifest",
  applicationName: "Draftpace",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Draftpace",
  },
  openGraph: {
    title: "Draftpace — Digital products that remember you",
    description:
      "A platform for personalized, adaptive digital products that adapt, guide the next action, and pick up where you left off.",
    url: "https://www.draftpace.com",
    siteName: "Draftpace",
    type: "website",
  },
  icons: {
    icon: "/logo/dp-monogram-indigo.svg",
    apple: "/logo/dp-monogram-indigo.svg",
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
