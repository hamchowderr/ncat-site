import type { Metadata } from "next";
import { AboutHero, AboutQuote, AboutStory, AboutWho } from "@/components/sections/AboutStory";
import { Engine } from "@/components/sections/Engine";
import { EarlyAccess } from "@/components/sections/EarlyAccess";

export const metadata: Metadata = {
  title: "About",
  description: "Why Takewon exists: a free open-source engine, creators tired of paying for every step, and two talks that kept ending with the same question.",
  alternates: { canonical: "/about" },
  openGraph: { type: "website", siteName: "Takewon", title: "About Takewon", description: "Why Takewon exists: a free open-source engine, creators tired of paying for every step, and two talks that kept ending with the same question.", url: "/about" },
  twitter: { card: "summary_large_image", title: "About Takewon", description: "Why Takewon exists: a free open-source engine, creators tired of paying for every step, and two talks that kept ending with the same question.", creator: "@hamchowderr" },
};

export default function AboutPage() {
  return (
    <>
      <AboutHero />
      <AboutStory />
      <AboutQuote />
      <Engine />
      <AboutWho />
      <EarlyAccess />
    </>
  );
}
