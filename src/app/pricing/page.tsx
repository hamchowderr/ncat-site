import type { Metadata } from "next";
import { EarlyAccess } from "@/components/sections/EarlyAccess";
import { PricingHero } from "@/components/sections/PricingHero";
import { PricingPlans } from "@/components/sections/PricingPlans";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Pay once and own your version of Takewon, with a 4-week group cohort with Chowderr to build it out. It runs on your own server or always-on machine, with no fee for each video.",
  alternates: { canonical: "/pricing" },
  openGraph: { type: "website", siteName: "Takewon", title: "Takewon pricing", description: "Pay once and own your version of Takewon, with a 4-week group cohort with Chowderr to build it out. It runs on your own server or always-on machine, with no fee for each video.", url: "/pricing" },
  twitter: { card: "summary_large_image", title: "Takewon pricing", description: "Pay once and own your version of Takewon, with a 4-week group cohort with Chowderr to build it out. It runs on your own server or always-on machine, with no fee for each video.", creator: "@hamchowderr" },
};

export default function PricingPage() {
  return (
    <>
      <PricingHero />
      <PricingPlans />
      <EarlyAccess />
    </>
  );
}
