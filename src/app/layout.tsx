import type { Metadata } from "next";
import "./globals.css";
import AppProviders from "@/components/providers/AppProviders";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.draftpace.com"),
  title: {
    default: "Draftpace is launching soon",
    template: "%s | Draftpace",
  },
  description: "Join the Draftpace launch list and get a free planner when we open.",
  manifest: "/manifest.webmanifest",
  applicationName: "Draftpace",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Draftpace",
  },
  openGraph: {
    title: "Draftpace",
    description: "Join the Draftpace launch list and get a free planner when we open.",
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
