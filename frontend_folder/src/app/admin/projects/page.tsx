"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CheckboxField } from "@/components/admin/Field";
import { PageHeader } from "@/components/PageHeader";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { DangerButton } from "@/components/admin/DangerButton";
import { adminFetch } from "@/lib/admin-api";
import type { ProjectRow } from "@/lib/types";

type AdminProject = ProjectRow & { case_studies: { id: string }[] };

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<AdminProject[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<AdminProject | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(() => {
    adminFetch<{ projects: AdminProject[] }>("/api/admin/projects")
      .then((data) => setProjects(data.projects))
      .catch((err: Error) => setError(err.message));
  }, []);

  useEffect(load, [load]);

  async function togglePublished(project: AdminProject, is_published: boolean) {
    try {
      await adminFetch(`/api/admin/projects/${project.id}`, {
        method: "PUT",
        body: { is_published },
      });
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed.");
    }
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await adminFetch(`/api/admin/projects/${pendingDelete.id}`, { method: "DELETE" });
      setPendingDelete(null);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed.");
      setPendingDelete(null);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <main>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <PageHeader eyebrow="GET /admin/projects" title="Projects" />
        <Button variant="primary" href="/admin/projects/new">
          <Plus aria-hidden size={18} /> New Project
        </Button>
      </div>

      {error ? (
        <p className="mt-6 rounded-card border border-border-hairline bg-bg-surface p-4 text-sm text-text-secondary">
          {error}
        </p>
      ) : null}

      <div className="mt-8 overflow-x-auto rounded-card border border-border-hairline">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-border-hairline font-mono text-xs text-text-tertiary">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Slug</th>
              <th className="px-4 py-3 font-medium">Case study</th>
              <th className="px-4 py-3 font-medium">Order</th>
              <th className="px-4 py-3 font-medium">Published</th>
              <th className="px-4 py-3 font-medium">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {projects?.map((project) => (
              <tr key={project.id} className="border-b border-border-hairline last:border-b-0">
                <td className="px-4 py-3 font-medium text-text-primary">{project.name}</td>
                <td className="px-4 py-3 font-mono text-xs text-text-secondary">
                  {project.slug}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-text-secondary">
                  {project.case_studies.length > 0 ? "yes" : "—"}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-text-secondary">
                  {project.order_index}
                </td>
                <td className="px-4 py-3">
                  <CheckboxField
                    id={`pub-${project.id}`}
                    label=""
                    checked={project.is_published}
                    onChange={(checked) => togglePublished(project, checked)}
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/admin/projects/${project.id}/edit`}
                      className="flex min-h-11 items-center rounded-chip px-3 text-sm text-text-secondary hover:text-text-primary focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-accent-teal"
                    >
                      Edit
                    </Link>
                    <DangerButton
                      className="min-h-9 px-3 py-1.5 text-sm"
                      onClick={() => setPendingDelete(project)}
                    >
                      Delete
                    </DangerButton>
                  </div>
                </td>
              </tr>
            ))}
            {projects && projects.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-text-tertiary">
                  No projects yet — run the seed script or add one.
                </td>
              </tr>
            ) : null}
            {!projects && !error ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-text-tertiary">
                  Loading…
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {pendingDelete ? (
        <ConfirmDialog
          title={`Delete "${pendingDelete.name}"?`}
          body="This can't be undone. Its case study is deleted with it."
          confirmLabel="Delete"
          busy={deleting}
          onConfirm={confirmDelete}
          onCancel={() => setPendingDelete(null)}
        />
      ) : null}
    </main>
  );
}
