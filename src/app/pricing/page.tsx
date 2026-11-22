import type { Metadata } from "next";
import { EarlyAccess } from "@/components/sections/EarlyAccess";
import { PricingHero } from "@/components/sections/PricingHero";
import { PricingPlans } from "@/components/sections/PricingPlans";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Pay once and own your version: Takewon plus a 4-week group cohort with Chowderr. No subscription, no per-video fees.",
  alternates: { canonical: "/pricing" },
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
