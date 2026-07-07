import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import type { ProjectWithCaseStudyFlag } from "@/lib/types";

// Project card for the home grid, driven by a DB row. "Case Study →" only
// when a published case_studies row exists; "Live Demo →" only when demo_url
// is set (PHASE_2.md Section 8) — links come from data, never assumed.

export function ProjectCard({
  project,
  index,
}: {
  project: ProjectWithCaseStudyFlag;
  index: number;
}) {
  return (
    <Card className="flex h-full flex-col">
      <div className="flex items-baseline justify-between gap-4">
        <p className="font-mono text-xs text-text-tertiary">
          {String(index + 1).padStart(2, "0")}
        </p>
        {project.metric_label ? (
          <p className="font-mono text-xs text-accent-teal">{project.metric_label}</p>
        ) : null}
      </div>
      <h3 className="mt-3 font-display text-xl font-medium">{project.name}</h3>
      <p className="mt-2 text-sm leading-relaxed text-text-secondary">
        {project.summary}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {project.tech_tags.map((tag) => (
          <Chip key={tag}>{tag}</Chip>
        ))}
      </div>
      {project.has_case_study || project.demo_url ? (
        <div className="mt-auto flex flex-wrap items-center gap-2 pt-5 -ml-2">
          {project.has_case_study ? (
            <Button variant="ghost" href={`/work/${project.slug}`}>
              Case Study <ArrowRight aria-hidden size={18} />
            </Button>
          ) : null}
          {project.demo_url ? (
            <Button variant="ghost" href={project.demo_url}>
              Live Demo <ArrowUpRight aria-hidden size={18} />
            </Button>
          ) : null}
        </div>
      ) : null}
    </Card>
  );
}
