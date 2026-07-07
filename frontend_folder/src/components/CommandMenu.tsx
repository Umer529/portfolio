"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Command } from "cmdk";
import {
  ArrowRight,
  Copy,
  Check,
  Download,
  GraduationCap,
  Layers,
  Mail,
} from "lucide-react";
import { site } from "@/lib/site";

// Command menu (Section 2.5) — functional, not decorative: jump to sections,
// copy email, download the résumé. Opens on Ctrl/⌘K, closes on Escape and
// backdrop click. The panel unmounts on close, so per-open state (like the
// "Copied" flash) resets naturally.

export function CommandMenu({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!open) return null;
  return <CommandMenuPanel onClose={() => onOpenChange(false)} />;
}

function CommandMenuPanel({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const pathname = usePathname();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const jumpTo = useCallback(
    (id: string) => {
      onClose();
      if (pathname === "/") {
        document.getElementById(id)?.scrollIntoView();
      } else {
        router.push(`/#${id}`);
      }
    },
    [pathname, router, onClose],
  );

  const copyEmail = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(site.email);
      setCopied(true);
      setTimeout(onClose, 600);
    } catch {
      onClose();
    }
  }, [onClose]);

  const downloadResume = useCallback(() => {
    onClose();
    fetch(`${site.apiUrl}/api/resume/track`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ referrer: window.location.pathname }),
      keepalive: true,
    }).catch(() => {});
    window.open(site.resumePath, "_blank", "noopener");
  }, [onClose]);

  const itemClass =
    "flex min-h-11 cursor-pointer items-center gap-3 rounded-chip px-3 text-sm text-text-secondary data-[selected=true]:bg-bg-surface-raised data-[selected=true]:text-text-primary";
  const groupClass =
    "[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:text-text-tertiary";

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Close command menu"
        onClick={onClose}
        className="absolute inset-0 bg-bg-base/70"
      />
      <div className="absolute inset-x-4 top-24 mx-auto max-w-lg">
        <Command
          label="Command menu"
          className="overflow-hidden rounded-card border border-border-hairline bg-bg-surface shadow-lift"
        >
          <Command.Input
            autoFocus
            placeholder="Type a command…"
            className="w-full border-b border-border-hairline bg-transparent px-4 py-3 text-base text-text-primary outline-none placeholder:text-text-tertiary"
          />
          <Command.List className="max-h-72 overflow-y-auto p-2">
            <Command.Empty className="px-3 py-6 text-center text-sm text-text-tertiary">
              No results.
            </Command.Empty>
            <Command.Group heading="Navigate" className={groupClass}>
              <Command.Item className={itemClass} onSelect={() => jumpTo("work")}>
                <ArrowRight aria-hidden size={16} /> Jump to Work
              </Command.Item>
              <Command.Item className={itemClass} onSelect={() => jumpTo("stack")}>
                <Layers aria-hidden size={16} /> Jump to Stack
              </Command.Item>
              <Command.Item className={itemClass} onSelect={() => jumpTo("education")}>
                <GraduationCap aria-hidden size={16} /> Jump to Education
              </Command.Item>
              <Command.Item className={itemClass} onSelect={() => jumpTo("contact")}>
                <Mail aria-hidden size={16} /> Jump to Contact
              </Command.Item>
            </Command.Group>
            <Command.Group heading="Actions" className={groupClass}>
              <Command.Item className={itemClass} onSelect={copyEmail}>
                {copied ? (
                  <>
                    <Check aria-hidden size={16} className="text-accent-teal" /> Copied
                  </>
                ) : (
                  <>
                    <Copy aria-hidden size={16} /> Copy email
                  </>
                )}
              </Command.Item>
              <Command.Item className={itemClass} onSelect={downloadResume}>
                <Download aria-hidden size={16} /> Download résumé
              </Command.Item>
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </div>
  );
}
