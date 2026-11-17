import { EarlyAccess } from "@/components/sections/EarlyAccess";
import { Engine } from "@/components/sections/Engine";
import { Faq } from "@/components/sections/Faq";
import { Features } from "@/components/sections/Features";
import { Hero } from "@/components/sections/Hero";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { NoFees } from "@/components/sections/NoFees";
import { PlatformExpert } from "@/components/sections/PlatformExpert";
import { Proof } from "@/components/sections/Proof";
import { UseCases } from "@/components/sections/UseCases";

export default function Home() {
  return (
    <>
      <Hero />
      <Proof />
      <Features />
      <HowItWorks />
      <Engine />
      <PlatformExpert />
      <UseCases />
      <NoFees />
      <Faq />
      <EarlyAccess />
    </>
  );
}
