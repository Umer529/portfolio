"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { EASE_BRAND } from "@/components/Reveal";
import { site } from "@/lib/site";

// Asymmetric hero (Section 2.4): text block left, slim terminal/status
// readout right (desktop only). One orchestrated load-in with ~80ms stagger —
// this plus scroll reveals is most of the site's motion budget (Section 8).

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const line = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: EASE_BRAND },
  },
};

const terminalLines = [
  { prompt: "$ whoami", output: "umer_farooq" },
  { prompt: "$ status", output: "available_for_internships" },
  { prompt: "$ building", output: "this_portfolio" },
];

export function Hero() {
  const reduceMotion = useReducedMotion();

  return (
    <section id="top" className="mx-auto w-full max-w-5xl px-6 pb-24 pt-20 lg:pt-28">
      <motion.div
        variants={container}
        initial={reduceMotion ? false : "hidden"}
        animate="show"
        className="grid items-center gap-12 lg:grid-cols-[1fr_320px]"
      >
        <div className="flex flex-col items-start gap-5">
          <motion.p variants={line} className="font-mono text-xs text-accent-teal">
            GET / — {site.location.toLowerCase().replace(", ", "_")}
          </motion.p>
          <motion.h1
            variants={line}
            className="font-display text-4xl font-semibold leading-tight sm:text-5xl"
          >
            {site.name}
          </motion.h1>
          <motion.p variants={line} className="max-w-xl text-lg text-text-secondary">
            {site.positioning} Four shipped full-stack and mobile projects; BS
            Computer Science at FAST-NUCES, expected June 2027.
          </motion.p>
          <motion.div variants={line} className="mt-2 flex flex-wrap items-center gap-4">
            <Button variant="primary" href="#work">
              View Work <ArrowRight aria-hidden size={18} />
            </Button>
            <Button variant="ghost" href="#contact">
              Get in touch
            </Button>
          </motion.div>
        </div>

        {/* Terminal/status readout — hidden below lg */}
        <motion.div
          variants={line}
          className="hidden rounded-card border border-border-hairline bg-bg-surface p-5 lg:block"
          aria-hidden
        >
          <div className="flex gap-1.5 pb-4">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
          </div>
          <div className="flex flex-col gap-3 font-mono text-sm">
            {terminalLines.map((l, i) => (
              <div key={l.prompt} className="flex flex-col gap-1">
                <span className="text-text-tertiary">{l.prompt}</span>
                <span className="text-text-primary">
                  {l.output}
                  {i === terminalLines.length - 1 ? (
                    <span className="cursor-blink ml-1 inline-block h-4 w-2 translate-y-0.5 bg-accent-teal" />
                  ) : null}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
