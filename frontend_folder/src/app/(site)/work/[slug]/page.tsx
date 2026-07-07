import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { ArchDiagram } from "@/components/ArchDiagram";
import { CaseSection, CaseStudyHeader } from "@/components/CaseStudy";
import { Reveal } from "@/components/Reveal";
import { Button } from "@/components/ui/Button";
import { getProjectWithCaseStudy } from "@/lib/data";

// Dynamic case-study route (PHASE_2.md Section 1): any project with a
// published case_studies row gets a page here — decided by data, not code.
// A project without one 404s.

export const revalidate = 60;

type Params = { slug: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const result = await getProjectWithCaseStudy(slug);
  if (!result || !result.caseStudy) return { title: "Not found" };
  return {
    title: `${result.project.name} — Case Study — Umer Farooq`,
    description: result.project.summary,
  };
}

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const result = await getProjectWithCaseStudy(slug);
  if (!result || !result.caseStudy) notFound();
  const { project, caseStudy } = result;

  return (
    <main id="main" className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-12 px-6 py-16">
      <Reveal>
        <a
          href="/"
          className="inline-flex items-center gap-2 font-mono text-sm text-text-secondary hover:text-text-primary transition-colors"
        >
          <ArrowLeft size={15} aria-hidden /> back to home
        </a>
      </Reveal>
      <CaseStudyHeader project={project} />

      {caseStudy.architecture_nodes.length > 0 ? (
        <Reveal>
          <p className="mb-3 font-mono text-xs text-text-tertiary">ARCHITECTURE</p>
          <ArchDiagram
            summary={caseStudy.architecture_summary}
            nodes={caseStudy.architecture_nodes}
            edges={caseStudy.architecture_edges}
          />
        </Reveal>
      ) : null}

      {caseStudy.decisions.length > 0 ? (
        <CaseSection eyebrow="SECTION /decisions" title="Key Decisions">
          {caseStudy.decisions.map((decision) => (
            <div key={decision.title}>
              <h3 className="font-display text-lg font-medium text-text-primary">
                {decision.title}
              </h3>
              <p className="mt-2">{decision.body}</p>
            </div>
          ))}
        </CaseSection>
      ) : null}

      {caseStudy.challenges ? (
        <CaseSection eyebrow="SECTION /challenges" title="Challenges">
          <p>{caseStudy.challenges}</p>
        </CaseSection>
      ) : null}

      {caseStudy.result ? (
        <CaseSection eyebrow="SECTION /result" title="Result">
          <p>{caseStudy.result}</p>
        </CaseSection>
      ) : null}

      {caseStudy.demo_video_url ? (
        <Reveal>
          <div className="-ml-2 border-t border-border-hairline pt-10">
            <Button variant="ghost" href={caseStudy.demo_video_url}>
              Watch the demo video <ArrowUpRight aria-hidden size={18} />
            </Button>
          </div>
        </Reveal>
      ) : null}
    </main>
  );
}
