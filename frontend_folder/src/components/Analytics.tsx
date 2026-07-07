"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { site } from "@/lib/site";

// Privacy-respecting pageview counter (CLAUDE.md Section 6.3): one
// fire-and-forget POST per route change. No cookies, no fingerprinting,
// and a failed request is silently ignored.

export function Analytics() {
  const pathname = usePathname();

  useEffect(() => {
    fetch(`${site.apiUrl}/api/analytics/pageview`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: pathname }),
      keepalive: true,
    }).catch(() => {});
  }, [pathname]);

  return null;
}
