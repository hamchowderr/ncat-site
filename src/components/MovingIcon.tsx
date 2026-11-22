"use client";

import { useEffect, useRef, type ForwardRefExoticComponent, type RefAttributes } from "react";
import type { AnimatedIconHandle, AnimatedIconProps } from "@/components/itshover/types";

type Icon = ForwardRefExoticComponent<AnimatedIconProps & RefAttributes<AnimatedIconHandle>>;

/**
 * An itshover icon that plays its motion when you hover it, or when you hover the card it sits in
 * (`trigger` is a selector for that card). With `inView` it also plays once as the card scrolls into view.
 * Stays still for people who turn motion off.
 */
export function MovingIcon({
  icon: Icon,
  size = 20,
  strokeWidth = 2,
  trigger,
  className,
  inView,
}: {
  icon: Icon;
  size?: number;
  strokeWidth?: number;
  trigger?: string;
  className?: string;
  inView?: boolean;
}) {
  const icon = useRef<AnimatedIconHandle>(null);
  const holder = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const host = trigger ? holder.current?.closest<HTMLElement>(trigger) : null;
    if (!host) return;
    const on = () => icon.current?.startAnimation();
    const off = () => icon.current?.stopAnimation();
    host.addEventListener("pointerenter", on);
    host.addEventListener("pointerleave", off);
    host.addEventListener("focusin", on);
    host.addEventListener("focusout", off);
    let io: IntersectionObserver | undefined;
    let stop: ReturnType<typeof setTimeout> | undefined;
    if (inView && typeof IntersectionObserver !== "undefined") {
      io = new IntersectionObserver(
        ([e]) => {
          if (!e?.isIntersecting) return;
          io?.disconnect();
          // after the card has settled in
          stop = setTimeout(() => {
            on();
            stop = setTimeout(off, 1400);
          }, 500);
        },
        { threshold: 0.4 },
      );
      io.observe(host);
    }
    return () => {
      io?.disconnect();
      clearTimeout(stop);
      host.removeEventListener("pointerenter", on);
      host.removeEventListener("pointerleave", off);
      host.removeEventListener("focusin", on);
      host.removeEventListener("focusout", off);
    };
  }, [trigger, inView]);

  return (
    <span ref={holder} className={`mi ${className ?? ""}`} aria-hidden="true">
      <Icon ref={icon} size={size} strokeWidth={strokeWidth} />
    </span>
  );
}
