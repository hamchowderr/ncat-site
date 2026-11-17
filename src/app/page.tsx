import { HomeEffects } from "@/components/HomeEffects";
import { Automations } from "@/components/sections/Automations";
import { EarlyAccess } from "@/components/sections/EarlyAccess";
import { Faq } from "@/components/sections/Faq";
import { Features } from "@/components/sections/Features";
import { FloatBar } from "@/components/sections/FloatBar";
import { Hero } from "@/components/sections/Hero";
import { NoFees } from "@/components/sections/NoFees";
import { PlatformExpert } from "@/components/sections/PlatformExpert";
import { Proof } from "@/components/sections/Proof";
import { ScaleOutput } from "@/components/sections/ScaleOutput";
import { SetupOnce } from "@/components/sections/SetupOnce";
import { Templates } from "@/components/sections/Templates";
import { UseCases } from "@/components/sections/UseCases";

export default function Home() {
  return (
    <div className="page" data-page="home">
      <Hero />
      <Proof />
      <Features />
      <Automations />
      <Templates />
      <SetupOnce />
      <PlatformExpert />
      <ScaleOutput />
      <NoFees />
      <UseCases />
      <Faq />
      <EarlyAccess />
      <FloatBar />
      <HomeEffects />
    </div>
  );
}
