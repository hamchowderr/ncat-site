"use client";

import type { ReactNode } from "react";
import AnimatedContent from "@/components/reactbits/AnimatedContent/AnimatedContent";

/** Content that rises gently into place the first time it scrolls into view. */
export function Reveal({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  return (
    <AnimatedContent className={className} distance={36} duration={0.8} ease="power3.out" initialOpacity={0} threshold={0.15} delay={delay} once>
      {children}
    </AnimatedContent>
  );
}
