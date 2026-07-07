"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CheckboxField, Field, inputClass, StatusLine } from "@/components/admin/Field";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { DangerButton } from "@/components/admin/DangerButton";
import { PageHeader } from "@/components/PageHeader";
import { adminFetch } from "@/lib/admin-api";
import type { TestimonialRow } from "@/lib/types";

const empty = {
  author_name: "",
  author_role: "",
  author_company: "",
  quote: "",
  avatar_url: "",
  order_index: 0,
  is_published: true,
};

type Draft = typeof empty;

function toDraft(row: TestimonialRow): Draft {
  return {
    author_name: row.author_name,
    author_role: row.author_role ?? "",
    author_company: row.author_company ?? "",
    quote: row.quote,
    avatar_url: row.avatar_url ?? "",
    order_index: row.order_index,
    is_published: row.is_published,
  };
}

export default function AdminTestimonialsPage() {
  const [rows, setRows] = useState<TestimonialRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | "new" | null>(null);
  const [draft, setDraft] = useState<Draft>(empty);
  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<TestimonialRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(() => {
    adminFetch<{ testimonials: TestimonialRow[] }>("/api/admin/testimonials")
      .then((data) => setRows(data.testimonials))
      .catch((err: Error) => setError(err.message));
  }, []);

  useEffect(load, [load]);

  function openEditor(row: TestimonialRow | null) {
    setEditingId(row ? row.id : "new");
    setDraft(row ? toDraft(row) : empty);
    setStatus("idle");
    setSaveError(null);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.author_name.trim() || !draft.quote.trim()) {
      setStatus("error");
      setSaveError("Author name and quote are required.");
      return;
    }
    setStatus("saving");
    setSaveError(null);
    const body = {
      author_name: draft.author_name.trim(),
      author_role: draft.author_role.trim() || null,
      author_company: draft.author_company.trim() || null,
      quote: draft.quote.trim(),
      avatar_url: draft.avatar_url.trim() || null,
      order_index: draft.order_index,
      is_published: draft.is_published,
    };
    try {
      if (editingId === "new") {
        await adminFetch("/api/admin/testimonials", { method: "POST", body });
      } else {
        await adminFetch(`/api/admin/testimonials/${editingId}`, { method: "PUT", body });
      }
      setStatus("success");
      setEditingId(null);
      load();
    } catch (err) {
      setStatus("error");
      setSaveError(err instanceof Error ? err.message : "Save failed.");
    }
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await adminFetch(`/api/admin/testimonials/${pendingDelete.id}`, { method: "DELETE" });
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
        <PageHeader
          eyebrow="GET /admin/testimonials"
          title="Testimonials"
          lede="The public section only exists once at least one published entry is here."
        />
        <Button variant="primary" onClick={() => openEditor(null)}>
          <Plus aria-hidden size={18} /> New Testimonial
        </Button>
      </div>

      {error ? (
        <p className="mt-6 rounded-card border border-border-hairline bg-bg-surface p-4 text-sm text-text-secondary">
          {error}
        </p>
      ) : null}

      {editingId !== null ? (
        <form
          onSubmit={save}
          noValidate
          className="mt-8 flex max-w-2xl flex-col gap-5 rounded-card border border-border-hairline bg-bg-surface p-6"
        >
          <Field label="Author name" htmlFor="t-name">
            <input
              id="t-name"
              type="text"
              value={draft.author_name}
              onChange={(e) => setDraft({ ...draft, author_name: e.target.value })}
              className={inputClass}
            />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Author role" htmlFor="t-role" hint="Optional">
              <input
                id="t-role"
                type="text"
                value={draft.author_role}
                onChange={(e) => setDraft({ ...draft, author_role: e.target.value })}
                className={inputClass}
              />
            </Field>
            <Field label="Author company" htmlFor="t-company" hint="Optional">
              <input
                id="t-company"
                type="text"
                value={draft.author_company}
                onChange={(e) => setDraft({ ...draft, author_company: e.target.value })}
                className={inputClass}
              />
            </Field>
          </div>
          <Field label="Quote" htmlFor="t-quote">
            <textarea
              id="t-quote"
              rows={4}
              value={draft.quote}
              onChange={(e) => setDraft({ ...draft, quote: e.target.value })}
              className={inputClass}
            />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label="Avatar URL"
              htmlFor="t-avatar"
              hint="Optional — a Supabase Storage upload can come later (PHASE_2.md §9)"
            >
              <input
                id="t-avatar"
                type="url"
                value={draft.avatar_url}
                onChange={(e) => setDraft({ ...draft, avatar_url: e.target.value })}
                className={inputClass}
              />
            </Field>
            <Field label="Order" htmlFor="t-order">
              <input
                id="t-order"
                type="number"
                min={0}
                value={draft.order_index}
                onChange={(e) => setDraft({ ...draft, order_index: Number(e.target.value) })}
                className={inputClass}
              />
            </Field>
          </div>
          <CheckboxField
            id="t-published"
            label="Published"
            checked={draft.is_published}
            onChange={(is_published) => setDraft({ ...draft, is_published })}
          />
          <div className="mt-2 flex items-center gap-3">
            <Button variant="primary" type="submit" disabled={status === "saving"}>
              {status === "saving" ? "Saving…" : "Save"}
            </Button>
            <Button variant="secondary" onClick={() => setEditingId(null)}>
              Cancel
            </Button>
          </div>
          <StatusLine status={status} error={saveError} />
        </form>
      ) : null}

      <div className="mt-8 flex flex-col gap-3">
        {rows?.map((row) => (
          <div
            key={row.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-border-hairline bg-bg-surface p-4"
          >
            <div className="min-w-0 flex-1">
              <p className="font-medium text-text-primary">
                {row.author_name}
                {!row.is_published ? (
                  <span className="ml-2 font-mono text-xs text-text-tertiary">(draft)</span>
                ) : null}
              </p>
              <p className="mt-1 truncate text-sm text-text-secondary">“{row.quote}”</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Button variant="secondary" onClick={() => openEditor(row)}>
                Edit
              </Button>
              <DangerButton
                className="min-h-9 px-3 py-1.5 text-sm"
                onClick={() => setPendingDelete(row)}
              >
                Delete
              </DangerButton>
            </div>
          </div>
        ))}
        {rows && rows.length === 0 && editingId === null ? (
          <p className="rounded-card border border-border-hairline p-6 text-center text-sm text-text-tertiary">
            No testimonials — the section is absent from the public site.
          </p>
        ) : null}
      </div>

      {pendingDelete ? (
        <ConfirmDialog
          title={`Delete the testimonial from "${pendingDelete.author_name}"?`}
          body="This can't be undone."
          confirmLabel="Delete"
          busy={deleting}
          onConfirm={confirmDelete}
          onCancel={() => setPendingDelete(null)}
        />
      ) : null}
    </main>
  );
}
