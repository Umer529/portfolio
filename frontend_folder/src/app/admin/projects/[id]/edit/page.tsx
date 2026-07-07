"use client";

import { use, useEffect, useState } from "react";
import { ProjectForm } from "@/components/admin/ProjectForm";
import { CaseStudyForm } from "@/components/admin/CaseStudyForm";
import { PageHeader } from "@/components/PageHeader";
import { adminFetch } from "@/lib/admin-api";
import type { CaseStudyRow, ProjectRow } from "@/lib/types";

type ProjectDetail = ProjectRow & { case_studies: CaseStudyRow[] };

export default function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminFetch<{ project: ProjectDetail }>(`/api/admin/projects/${id}`)
      .then((data) => setProject(data.project))
      .catch((err: Error) => setError(err.message));
  }, [id]);

  if (error) {
    return (
      <main>
        <p className="rounded-card border border-border-hairline bg-bg-surface p-4 text-sm text-text-secondary">
          {error}
        </p>
      </main>
    );
  }
  if (!project) {
    return (
      <main>
        <p className="text-sm text-text-tertiary">Loading…</p>
      </main>
    );
  }

  return (
    <main>
      <PageHeader eyebrow={`PUT /admin/projects/${project.slug}`} title="Edit Project" />
      <div className="mt-8">
        <ProjectForm initial={project} />
      </div>
      <CaseStudyForm projectId={project.id} initial={project.case_studies[0] ?? null} />
    </main>
  );
}
