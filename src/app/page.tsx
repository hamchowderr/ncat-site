import { AroundTheClip } from "@/components/sections/AroundTheClip";
import { EarlyAccess } from "@/components/sections/EarlyAccess";
import { Engine } from "@/components/sections/Engine";
import { Faq } from "@/components/sections/Faq";
import { Features } from "@/components/sections/Features";
import { Hero } from "@/components/sections/Hero";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { NoFees } from "@/components/sections/NoFees";
import { PlatformExpert } from "@/components/sections/PlatformExpert";
import { Proof } from "@/components/sections/Proof";
import { SplitScene } from "@/components/sections/SplitScene";
import { TryIt } from "@/components/sections/TryIt";
import { UseCases } from "@/components/sections/UseCases";
import { demoEnabled } from "@/lib/demo/deps";
import { mailSetup } from "@/lib/mail";

export default function Home() {
  return (
    <>
      <Hero />
      <Proof />
      <SplitScene />
      <Features />
      <AroundTheClip />
      <HowItWorks />
      <TryIt enabled={demoEnabled()} emails={!!mailSetup()} />
      <Engine />
      <PlatformExpert />
      <UseCases />
      <NoFees />
      <Faq />
      <EarlyAccess />
    </>
  );
}
