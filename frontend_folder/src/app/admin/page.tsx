"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/PageHeader";
import { adminFetch } from "@/lib/admin-api";

type Stats = { counts: Record<string, number> };

const tiles = [
  { key: "projects", label: "Projects", href: "/admin/projects" },
  { key: "case_studies", label: "Case Studies", href: "/admin/projects" },
  { key: "experience", label: "Experience", href: "/admin/experience" },
  { key: "testimonials", label: "Testimonials", href: "/admin/testimonials" },
  { key: "messages", label: "Messages", href: "/admin/messages" },
];

export default function AdminDashboard() {
  const [counts, setCounts] = useState<Record<string, number> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminFetch<Stats>("/api/admin/stats")
      .then((data) => setCounts(data.counts))
      .catch((err: Error) => setError(err.message));
  }, []);

  return (
    <main>
      <PageHeader eyebrow="GET /admin" title="Dashboard" />

      {error ? (
        <p className="mt-6 rounded-card border border-border-hairline bg-bg-surface p-4 text-sm text-text-secondary">
          {error}
        </p>
      ) : null}

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((tile) => (
          <Card key={tile.key} href={tile.href} className="relative flex flex-col gap-2">
            <p className="font-mono text-xs text-text-tertiary">{tile.label}</p>
            <p className="font-display text-4xl font-semibold">
              {counts ? (counts[tile.key] ?? 0) : "–"}
            </p>
            {tile.key === "messages" && counts && counts["messages_unread"] > 0 ? (
              <span className="absolute right-4 top-4 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent-teal px-1.5 font-mono text-xs font-semibold text-bg-base">
                {counts["messages_unread"]} new
              </span>
            ) : null}
          </Card>
        ))}
      </div>

      <p className="mt-8 text-sm text-text-secondary">
        Content edits show on the public site within a minute (pages revalidate
        every 60s).{" "}
        <Link href="/" className="text-text-primary underline underline-offset-4">
          View site
        </Link>
      </p>
    </main>
  );
}
