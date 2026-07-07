import type { Metadata } from "next";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { PageHeader } from "@/components/PageHeader";
import { Reveal } from "@/components/Reveal";
import { getPublishedProjects } from "@/lib/data";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Work — Umer Farooq",
  description: "All projects: mobile, web, and the backends behind them.",
};

// Work index: published projects as full-width list rows. Case-study links
// appear only for projects with a published case_studies row.

export default async function WorkPage() {
  const projects = await getPublishedProjects();

  return (
    <main id="main" className="mx-auto w-full max-w-5xl flex-1 px-6 py-16">
      <Reveal>
        <a
          href="/"
          className="mb-8 inline-flex items-center gap-2 font-mono text-sm text-text-secondary hover:text-text-primary transition-colors"
        >
          <ArrowLeft size={15} aria-hidden /> back to home
        </a>
        <PageHeader
          eyebrow="GET /work"
          title="Work"
          lede={`${projects.length} projects — mobile, web, and the backends behind them.`}
        />
      </Reveal>

      <div className="mt-12 border-t border-border-hairline">
        {projects.map((project, i) => (
          <Reveal key={project.id}>
            <article className="grid gap-4 border-b border-border-hairline py-10 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
              <div>
                <p className="font-mono text-xs text-text-tertiary">
                  {String(i + 1).padStart(2, "0")}
                  {project.metric_label ? (
                    <span className="ml-3 text-accent-teal">{project.metric_label}</span>
                  ) : null}
                </p>
                <h2 className="mt-2 font-display text-2xl font-medium">
                  {project.name}
                </h2>
              </div>
              <div className="flex flex-col items-start gap-4">
                <p className="text-text-secondary">{project.description}</p>
                <div className="flex flex-wrap gap-2">
                  {project.tech_tags.map((tag) => (
                    <Chip key={tag}>{tag}</Chip>
                  ))}
                </div>
                {project.has_case_study || project.demo_url ? (
                  <div className="flex flex-wrap items-center gap-2 -ml-2">
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
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </main>
  );
}
