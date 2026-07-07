"use client";

import { motion, useReducedMotion } from "framer-motion";

// Scroll-reveal on section entry: fade + 12px rise, the one site-wide easing
// curve (Section 7.4). Collapses to an instant state change under
// prefers-reduced-motion.

export const EASE_BRAND = [0.16, 1, 0.3, 1] as const;

export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-64px" }}
      transition={{ duration: 0.5, ease: EASE_BRAND, delay }}
    >
      {children}
    </motion.div>
  );
}
