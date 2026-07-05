"use client";

/**
 * Reveal — subtle scroll-entry wrapper for public/marketing surfaces.
 *
 * Enhances an already-visible default: under reduced motion (or before the element
 * scrolls into view) the content is rendered at its final position with no transform,
 * so nothing is gated behind an animation. Motion materials are limited to transform +
 * opacity only. Dark-only; no glow/blur/aura.
 */

import * as React from "react";
import { motion, useReducedMotion, type HTMLMotionProps } from "motion/react";

export interface RevealProps extends Omit<HTMLMotionProps<"div">, "initial" | "whileInView" | "viewport" | "transition"> {
  /** Entry delay in seconds (use for staggered groups). */
  delay?: number;
  /** Travel distance in px for the upward slide. */
  y?: number;
  children: React.ReactNode;
}

export function Reveal({ delay = 0, y = 20, children, ...props }: RevealProps) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
