import type { Metadata } from "next";
import "./globals.css";
import AppProviders from "@/components/providers/AppProviders";

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
