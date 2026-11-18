"use client";

// Not from itshover, which has no TikTok icon: the TikTok outline from Tabler Icons
// (MIT, the set itshover's icons are drawn from), moving the same way they do.
import { forwardRef, useImperativeHandle, useCallback } from "react";
import type { AnimatedIconHandle, AnimatedIconProps } from "./types";
import { motion, useAnimate } from "motion/react";

const TiktokIcon = forwardRef<AnimatedIconHandle, AnimatedIconProps>(
  ({ size = 24, color = "currentColor", strokeWidth = 2, className = "" }, ref) => {
    const [scope, animate] = useAnimate();

    const start = useCallback(async () => {
      await animate(".tiktok-note", { pathLength: [0, 1] }, { duration: 0.45, ease: "easeInOut" });
      animate(".tiktok-note", { rotate: [0, -8, 6, 0], scale: [1, 1.06, 1] }, { duration: 0.45, ease: "easeInOut" });
    }, [animate]);

    const stop = useCallback(async () => {
      animate(".tiktok-note", { rotate: 0, scale: 1, pathLength: 1 }, { duration: 0.25, ease: "easeOut" });
    }, [animate]);

    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }));

    return (
      <motion.svg
        ref={scope}
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`cursor-pointer ${className}`}
        onHoverStart={start}
        onHoverEnd={stop}
      >
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <motion.path
          d="M21 7.917v4.034a9.948 9.948 0 0 1 -5 -1.951v4.5a6.5 6.5 0 1 1 -8 -6.326v4.326a2.5 2.5 0 1 0 4 2v-11.5h4.083a6.005 6.005 0 0 0 4.917 4.917z"
          className="tiktok-note"
          style={{ transformOrigin: "50% 50%" }}
        />
      </motion.svg>
    );
  },
);

TiktokIcon.displayName = "TiktokIcon";
export default TiktokIcon;
