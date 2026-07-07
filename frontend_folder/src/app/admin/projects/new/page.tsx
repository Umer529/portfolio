"use client";

import { ProjectForm } from "@/components/admin/ProjectForm";
import { PageHeader } from "@/components/PageHeader";

export default function NewProjectPage() {
  return (
    <main>
      <PageHeader
        eyebrow="POST /admin/projects"
        title="New Project"
        lede="The case-study section appears after the project is saved."
      />
      <div className="mt-8">
        <ProjectForm />
      </div>
    </main>
  );
}
