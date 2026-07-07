import { Reveal } from "@/components/Reveal";
import { SectionHeading } from "@/components/SectionHeading";
import { Card } from "@/components/ui/Card";
import type { ExperienceRow } from "@/lib/types";

// Renders only when there is real published data (PHASE_2.md Section 8):
// zero rows → the section does not exist in the DOM at all, no header, no
// placeholder, no reserved space.

function formatMonth(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

export function ExperienceSection({ entries }: { entries: ExperienceRow[] }) {
  if (entries.length === 0) return null;

  return (
    <section id="experience" className="mx-auto w-full max-w-5xl scroll-mt-20 px-6 py-16">
      <Reveal>
        <SectionHeading eyebrow="GET /experience" title="Experience" />
      </Reveal>
      <div className="mt-10 flex flex-col gap-6">
        {entries.map((entry, i) => (
          <Reveal key={entry.id} delay={i * 0.06}>
            <Card className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="font-display text-lg font-medium">
                  {entry.role_title} — {entry.company}
                </h3>
                {entry.location ? (
                  <p className="mt-1 text-sm text-text-secondary">{entry.location}</p>
                ) : null}
                {entry.description ? (
                  <p className="mt-2 max-w-prose text-sm leading-relaxed text-text-secondary">
                    {entry.description}
                  </p>
                ) : null}
              </div>
              <p className="shrink-0 font-mono text-xs text-text-tertiary">
                {formatMonth(entry.start_date)} —{" "}
                {entry.end_date ? formatMonth(entry.end_date) : "Present"}
              </p>
            </Card>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
