import type { Metadata } from "next";
import "@/app/globals.css";
import "./studio.css";
import { fraunces, inter, newsreader, spaceMono } from "@/lib/fonts";
import { ThemeProvider } from "@/design-system/theme/ThemeProvider";

export const metadata: Metadata = {
  title: { default: "Draftpace Studio", template: "%s · Draftpace Studio" },
  robots: { index: false, follow: false },
};

// The website's theme bootstrap (src/app/layout.tsx, THEME_INIT_SCRIPT), same storage key, so Studio
// opens in the theme you chose on the site without a flash. Keep the two in step.
const THEME_INIT_SCRIPT = `(function(){try{var s=localStorage.getItem("draftpace-theme");var t=(s==="light"||s==="dark"||s==="system")?s:"system";var r=t==="system"?(window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"):t;document.documentElement.dataset.theme=t;document.documentElement.style.colorScheme=r;}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${fraunces.variable} ${inter.variable} ${newsreader.variable} ${spaceMono.variable}`}>
      <body>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
