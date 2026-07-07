"use client";

import { useState } from "react";
import { Mail, Copy, Check } from "lucide-react";
import { site } from "@/lib/site";

export function CopyEmail() {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(site.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex items-center gap-2">
      <a
        href={`mailto:${site.email}`}
        className="flex items-center gap-2 text-text-primary hover:text-accent-teal transition-colors"
      >
        <Mail size={14} aria-hidden />
        {site.email}
      </a>
      <button
        onClick={copy}
        aria-label={copied ? "Copied" : "Copy email"}
        className="text-text-tertiary hover:text-accent-teal transition-colors"
      >
        {copied ? <Check size={13} aria-hidden /> : <Copy size={13} aria-hidden />}
      </button>
    </div>
  );
}
