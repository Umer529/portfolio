import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { ArchDiagram } from "@/components/ArchDiagram";
import { CaseSection, CaseStudyHeader } from "@/components/CaseStudy";
import { Modal } from "@/components/Modal";
import { Reveal } from "@/components/Reveal";
import { Button } from "@/components/ui/Button";
import { getProjectWithCaseStudy } from "@/lib/data";

type Params = { slug: string };

export default async function CaseStudyModal({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const result = await getProjectWithCaseStudy(slug);
  if (!result || !result.caseStudy) notFound();
  const { project, caseStudy } = result;

  return (
    <Modal>
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
    </Modal>
  );
}
