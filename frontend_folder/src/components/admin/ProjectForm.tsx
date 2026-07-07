"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { CheckboxField, Field, inputClass, StatusLine } from "@/components/admin/Field";
import { TagInput } from "@/components/admin/TagInput";
import { adminFetch } from "@/lib/admin-api";
import type { ProjectRow } from "@/lib/types";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function ProjectForm({ initial }: { initial?: ProjectRow }) {
  const router = useRouter();
  const isEdit = Boolean(initial);

  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [summary, setSummary] = useState(initial?.summary ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [techTags, setTechTags] = useState<string[]>(initial?.tech_tags ?? []);
  const [metricLabel, setMetricLabel] = useState(initial?.metric_label ?? "");
  const [githubUrl, setGithubUrl] = useState(initial?.github_url ?? "");
  const [demoUrl, setDemoUrl] = useState(initial?.demo_url ?? "");
  const [orderIndex, setOrderIndex] = useState(initial?.order_index ?? 0);
  const [isPublished, setIsPublished] = useState(initial?.is_published ?? true);
  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    setError(null);
    const body = {
      name: name.trim(),
      slug: slug.trim(),
      summary: summary.trim(),
      description: description.trim(),
      tech_tags: techTags,
      metric_label: metricLabel.trim() || null,
      github_url: githubUrl.trim() || null,
      demo_url: demoUrl.trim() || null,
      order_index: orderIndex,
      is_published: isPublished,
    };
    try {
      if (isEdit) {
        await adminFetch(`/api/admin/projects/${initial!.id}`, { method: "PUT", body });
        setStatus("success");
      } else {
        const created = await adminFetch<{ project: ProjectRow }>("/api/admin/projects", {
          method: "POST",
          body,
        });
        setStatus("success");
        router.replace(`/admin/projects/${created.project.id}/edit`);
      }
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Save failed.");
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex max-w-2xl flex-col gap-5">
      <Field label="Name" htmlFor="p-name">
        <input
          id="p-name"
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (!slugTouched) setSlug(slugify(e.target.value));
          }}
          className={inputClass}
        />
      </Field>

      <Field label="Slug" htmlFor="p-slug" hint="Case-study URL: /work/<slug>">
        <input
          id="p-slug"
          type="text"
          value={slug}
          onChange={(e) => {
            setSlugTouched(true);
            setSlug(e.target.value);
          }}
          className={`${inputClass} font-mono text-sm`}
        />
      </Field>

      <Field label="Summary" htmlFor="p-summary" hint="One-liner for the home page card">
        <textarea
          id="p-summary"
          rows={2}
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          className={inputClass}
        />
      </Field>

      <Field label="Description" htmlFor="p-description" hint="Fuller version for the /work index">
        <textarea
          id="p-description"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={inputClass}
        />
      </Field>

      <Field label="Tech tags" htmlFor="p-tags">
        <TagInput id="p-tags" tags={techTags} onChange={setTechTags} />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Metric label" htmlFor="p-metric" hint='e.g. "30+ endpoints" — optional'>
          <input
            id="p-metric"
            type="text"
            value={metricLabel}
            onChange={(e) => setMetricLabel(e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Order" htmlFor="p-order">
          <input
            id="p-order"
            type="number"
            min={0}
            value={orderIndex}
            onChange={(e) => setOrderIndex(Number(e.target.value))}
            className={inputClass}
          />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="GitHub URL" htmlFor="p-github" hint="Optional — button hidden when empty">
          <input
            id="p-github"
            type="url"
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Demo URL" htmlFor="p-demo" hint="Only set if actually deployed">
          <input
            id="p-demo"
            type="url"
            value={demoUrl}
            onChange={(e) => setDemoUrl(e.target.value)}
            className={inputClass}
          />
        </Field>
      </div>

      <CheckboxField
        id="p-published"
        label="Published"
        checked={isPublished}
        onChange={setIsPublished}
      />

      <div className="mt-2 flex items-center gap-3">
        <Button variant="primary" type="submit" disabled={status === "saving"}>
          {status === "saving" ? "Saving…" : "Save"}
        </Button>
        <Button variant="secondary" href="/admin/projects">
          Cancel
        </Button>
      </div>
      <StatusLine status={status} error={error} />
    </form>
  );
}
