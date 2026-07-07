import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { PageHeader } from "@/components/PageHeader";
import { Reveal } from "@/components/Reveal";
import type { ProjectRow } from "@/lib/types";

// Shared case-study template pieces (CLAUDE.md Section 5): breadcrumb
// back-link on every case study (Section 7.6), header with the project's
// tags, and uniform prose sections. Action buttons render only when the
// project row actually has a URL — no dead links.

export function CaseStudyHeader({ project }: { project: ProjectRow }) {
  return (
    <Reveal>
      <div className="mt-2">
        <PageHeader
          eyebrow={`GET /work/${project.slug}`}
          title={project.name}
          lede={project.summary}
        />
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        {project.tech_tags.map((tag) => (
          <Chip key={tag}>{tag}</Chip>
        ))}
      </div>
      {project.github_url || project.demo_url ? (
        <div className="mt-8 flex flex-wrap items-center gap-4">
          {project.github_url ? (
            <Button variant="primary" href={project.github_url}>
              View on GitHub <ArrowUpRight aria-hidden size={18} />
            </Button>
          ) : null}
          {project.demo_url ? (
            <Button
              variant={project.github_url ? "secondary" : "primary"}
              href={project.demo_url}
            >
              Live Demo <ArrowUpRight aria-hidden size={18} />
            </Button>
          ) : null}
        </div>
      ) : null}
    </Reveal>
  );
}

export function CaseSection({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Reveal>
      <section className="border-t border-border-hairline pt-10">
        <p className="font-mono text-xs text-accent-teal">{eyebrow}</p>
        <h2 className="mt-2 font-display text-3xl font-semibold">{title}</h2>
        <div className="mt-4 flex max-w-prose flex-col gap-4 leading-relaxed text-text-secondary">
          {children}
        </div>
      </section>
    </Reveal>
  );
}
