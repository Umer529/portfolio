"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { Command, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { EASE_BRAND } from "@/components/Reveal";
import { site } from "@/lib/site";

// Scrollspy nav (Section 2.3): the current section's link carries a small
// underline that slides between links via a shared layoutId — recognition
// rather than recall. Mobile overlay closes on Escape and backdrop click
// (Section 7.3), not just the X.

const sections = [
  { id: "work", label: "Work", href: "/work" },
  { id: "stack", label: "Stack", href: null },
  { id: "education", label: "Education", href: null },
  { id: "contact", label: "Contact", href: null },
];

function trackResumeDownload() {
  fetch(`${site.apiUrl}/api/resume/track`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ referrer: window.location.pathname }),
    keepalive: true,
  }).catch(() => {});
}

export function Nav({ onOpenCommandMenu }: { onOpenCommandMenu: () => void }) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  // Scrollspy — only meaningful on the home page where the sections live.
  // `active` is only rendered when pathname === "/", so no reset is needed
  // when navigating away.
  useEffect(() => {
    if (pathname !== "/") return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(entry.target.id === "top" ? null : entry.target.id);
          }
        }
      },
      // A narrow band around the viewport's upper-middle decides the section.
      { rootMargin: "-35% 0px -55% 0px" },
    );
    for (const id of ["top", ...sections.map((s) => s.id)]) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [pathname]);

  // Escape closes the mobile overlay (Section 7.3).
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const sectionHref = (s: typeof sections[0]) => {
    if (pathname === "/") return `#${s.id}`;
    if (s.href) return s.href;
    return `/#${s.id}`;
  };
  const activeSection = pathname === "/" ? active : pathname === "/work" ? "work" : null;

  return (
    <header className="sticky top-0 z-40 border-b border-border-hairline bg-bg-base/85 backdrop-blur">
      <nav
        aria-label="Main"
        className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between gap-4 px-6"
      >
        <Link
          href="/"
          className="rounded-chip font-display text-base font-semibold focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-accent-teal"
        >
          {site.name}
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-1 md:flex">
          {sections.map((s) => (
            <a
              key={s.id}
              href={sectionHref(s)}
              className={`relative rounded-chip px-3 py-2 text-sm transition-colors duration-150 ease-brand focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-accent-teal ${
                activeSection === s.id
                  ? "text-text-primary"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              {s.label}
              {activeSection === s.id ? (
                <motion.span
                  layoutId="nav-underline"
                  className="absolute inset-x-3 -bottom-0.5 h-0.5 bg-accent-teal"
                  transition={
                    reduceMotion
                      ? { duration: 0 }
                      : { duration: 0.3, ease: EASE_BRAND }
                  }
                />
              ) : null}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <button
            type="button"
            onClick={onOpenCommandMenu}
            aria-label="Open command menu (Ctrl+K)"
            className="inline-flex min-h-11 items-center gap-1.5 rounded-chip border border-border-hairline px-2.5 font-mono text-xs text-text-secondary transition-colors duration-150 ease-brand hover:border-border-hairline-hover hover:text-text-primary focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-accent-teal"
          >
            <Command aria-hidden size={13} />K
          </button>
          <Button variant="secondary" href={site.resumePath} onClick={trackResumeDownload}>
            Resume
          </Button>
        </div>

        {/* Mobile menu button — 44px tap target */}
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
          aria-expanded={menuOpen}
          className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-card text-text-primary focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-accent-teal md:hidden"
        >
          <Menu aria-hidden size={22} />
        </button>
      </nav>

      {/* Mobile overlay */}
      {menuOpen ? (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop click closes (Section 7.3) */}
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
            className="absolute inset-0 bg-bg-base/70"
          />
          <div className="absolute inset-x-0 top-0 border-b border-border-hairline bg-bg-surface p-6">
            <div className="flex items-center justify-between">
              <p className="font-display text-base font-semibold">{site.name}</p>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
                className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-card text-text-primary focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-accent-teal"
              >
                <X aria-hidden size={22} />
              </button>
            </div>
            <div className="mt-4 flex flex-col">
              {sections.map((s) => (
                <a
                  key={s.id}
                  href={sectionHref(s)}
                  onClick={() => setMenuOpen(false)}
                  className="flex min-h-11 items-center rounded-card px-2 text-text-primary focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-accent-teal"
                >
                  {s.label}
                </a>
              ))}
              <div className="mt-4">
                <Button
                  variant="secondary"
                  href={site.resumePath}
                  onClick={() => {
                    trackResumeDownload();
                    setMenuOpen(false);
                  }}
                >
                  Resume
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
