import type { Metadata } from "next";
import { AboutHero, AboutQuote, AboutStory, AboutWho } from "@/components/sections/AboutStory";
import { EarlyAccess } from "@/components/sections/EarlyAccess";

export const metadata: Metadata = {
  title: "About",
  description: "Why Kontentifi exists: a free open-source engine, a community of creators tired of paying for every step, and two talks that kept ending with the same question.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <>
      <AboutHero />
      <AboutStory />
      <AboutQuote />
      <AboutWho />
      <EarlyAccess />
    </>
  );
}
