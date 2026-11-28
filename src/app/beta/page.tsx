import type { Metadata } from "next";
import { BetaAfter, BetaApply, BetaDeal, BetaFaq, BetaHero, BetaRoadmap } from "@/components/sections/Beta";

const description =
  "Takewon is free while it’s in beta. What testers get, what we ask, what happens after you apply, where Takewon is going, and the form to apply.";

export const metadata: Metadata = {
  title: "Beta",
  description,
  alternates: { canonical: "/beta" },
  openGraph: { type: "website", siteName: "Takewon", title: "The Takewon beta", description, url: "/beta" },
  twitter: { card: "summary_large_image", title: "The Takewon beta", description, creator: "@hamchowderr" },
};

export default function BetaPage() {
  return (
    <>
      <BetaHero />
      <BetaDeal />
      <BetaAfter />
      <BetaRoadmap />
      <BetaFaq />
      <BetaApply />
    </>
  );
}
