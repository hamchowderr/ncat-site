import type { Metadata, Viewport } from "next";
import { Archivo, Geist, JetBrains_Mono } from "next/font/google";
import { Announce } from "@/components/sections/Announce";
import { Footer } from "@/components/sections/Footer";
import { SiteHeader } from "@/components/SiteHeader";
import { isIndexable } from "./robots";
import { siteUrl } from "@/lib/site";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-geist" });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "600"], variable: "--font-jbm" });
const archivo = Archivo({ subsets: ["latin"], axes: ["wdth"], variable: "--font-archivo" });

const description =
  "Pick a ready-made automation and switch it on. From then on every recording is filed, transcribed, cut and captioned with plain editing steps on a server you own, with no AI tokens spent on each video. Built on the free NCA Toolkit.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "Kontifi: your content, organized and clipped automatically", template: "%s · Kontifi" },
  description,
  openGraph: { type: "website", siteName: "Kontifi", title: "Kontifi", description, url: "/" },
  robots: isIndexable() ? undefined : { index: false, follow: false },
  twitter: { card: "summary_large_image", title: "Kontifi", description, creator: "@hamchowderr" },
};

export const viewport: Viewport = { themeColor: "#ffffff", colorScheme: "light", viewportFit: "cover" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable} ${mono.variable} ${archivo.variable}`}>
      <body>
        <a className="skip" href="#main">Skip to content</a>
        <Announce />
        <SiteHeader />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
