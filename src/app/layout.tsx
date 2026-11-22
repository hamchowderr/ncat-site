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
  "Pick a ready-made automation and switch it on. Every new recording comes out cut, captioned and sized for TikTok, Instagram, YouTube, LinkedIn, Facebook and X, on a server you own, with no fee for each video.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "Takewon: Your content, social media ready.", template: "%s · Takewon" },
  description,
  openGraph: { type: "website", siteName: "Takewon", title: "Takewon: Your content, social media ready.", description, url: "/" },
  robots: isIndexable() ? undefined : { index: false, follow: false },
  twitter: { card: "summary_large_image", title: "Takewon: Your content, social media ready.", description, creator: "@hamchowderr" },
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
