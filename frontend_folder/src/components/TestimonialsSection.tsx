import Image from "next/image";
import { Reveal } from "@/components/Reveal";
import { SectionHeading } from "@/components/SectionHeading";
import { Card } from "@/components/ui/Card";
import type { TestimonialRow } from "@/lib/types";

// Same conditional rule as ExperienceSection: zero published rows → the
// section does not exist in the DOM at all.

export function TestimonialsSection({ entries }: { entries: TestimonialRow[] }) {
  if (entries.length === 0) return null;

  return (
    <section id="testimonials" className="mx-auto w-full max-w-5xl scroll-mt-20 px-6 py-16">
      <Reveal>
        <SectionHeading eyebrow="GET /testimonials" title="Testimonials" />
      </Reveal>
      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {entries.map((entry, i) => (
          <Reveal key={entry.id} delay={i * 0.06} className="h-full">
            <Card className="flex h-full flex-col gap-4">
              <blockquote className="text-sm leading-relaxed text-text-secondary">
                “{entry.quote}”
              </blockquote>
              <div className="mt-auto flex items-center gap-3">
                {entry.avatar_url ? (
                  <Image
                    src={entry.avatar_url}
                    alt=""
                    width={36}
                    height={36}
                    unoptimized
                    className="h-9 w-9 rounded-full border border-border-hairline object-cover"
                  />
                ) : null}
                <div>
                  <p className="text-sm font-medium text-text-primary">
                    {entry.author_name}
                  </p>
                  {entry.author_role || entry.author_company ? (
                    <p className="font-mono text-xs text-text-tertiary">
                      {[entry.author_role, entry.author_company]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  ) : null}
                </div>
              </div>
            </Card>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
