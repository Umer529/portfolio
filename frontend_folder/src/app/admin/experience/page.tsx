"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CheckboxField, Field, inputClass, StatusLine } from "@/components/admin/Field";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { DangerButton } from "@/components/admin/DangerButton";
import { PageHeader } from "@/components/PageHeader";
import { adminFetch } from "@/lib/admin-api";
import type { ExperienceRow } from "@/lib/types";

const empty = {
  role_title: "",
  company: "",
  location: "",
  start_date: "",
  end_date: "",
  present: true,
  description: "",
  order_index: 0,
  is_published: true,
};

type Draft = typeof empty;

function toDraft(row: ExperienceRow): Draft {
  return {
    role_title: row.role_title,
    company: row.company,
    location: row.location ?? "",
    start_date: row.start_date,
    end_date: row.end_date ?? "",
    present: row.end_date === null,
    description: row.description ?? "",
    order_index: row.order_index,
    is_published: row.is_published,
  };
}

export default function AdminExperiencePage() {
  const [rows, setRows] = useState<ExperienceRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | "new" | null>(null);
  const [draft, setDraft] = useState<Draft>(empty);
  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<ExperienceRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(() => {
    adminFetch<{ experience: ExperienceRow[] }>("/api/admin/experience")
      .then((data) => setRows(data.experience))
      .catch((err: Error) => setError(err.message));
  }, []);

  useEffect(load, [load]);

  function openEditor(row: ExperienceRow | null) {
    setEditingId(row ? row.id : "new");
    setDraft(row ? toDraft(row) : empty);
    setStatus("idle");
    setSaveError(null);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.role_title.trim() || !draft.company.trim() || !draft.start_date) {
      setStatus("error");
      setSaveError("Role title, company, and start date are required.");
      return;
    }
    setStatus("saving");
    setSaveError(null);
    const body = {
      role_title: draft.role_title.trim(),
      company: draft.company.trim(),
      location: draft.location.trim() || null,
      start_date: draft.start_date,
      end_date: draft.present ? null : draft.end_date || null,
      description: draft.description.trim() || null,
      order_index: draft.order_index,
      is_published: draft.is_published,
    };
    try {
      if (editingId === "new") {
        await adminFetch("/api/admin/experience", { method: "POST", body });
      } else {
        await adminFetch(`/api/admin/experience/${editingId}`, { method: "PUT", body });
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
      await adminFetch(`/api/admin/experience/${pendingDelete.id}`, { method: "DELETE" });
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
          eyebrow="GET /admin/experience"
          title="Experience"
          lede="The public section only exists once at least one published entry is here."
        />
        <Button variant="primary" onClick={() => openEditor(null)}>
          <Plus aria-hidden size={18} /> New Entry
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
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Role title" htmlFor="x-role">
              <input
                id="x-role"
                type="text"
                value={draft.role_title}
                onChange={(e) => setDraft({ ...draft, role_title: e.target.value })}
                className={inputClass}
              />
            </Field>
            <Field label="Company" htmlFor="x-company">
              <input
                id="x-company"
                type="text"
                value={draft.company}
                onChange={(e) => setDraft({ ...draft, company: e.target.value })}
                className={inputClass}
              />
            </Field>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Location" htmlFor="x-location" hint="Optional">
              <input
                id="x-location"
                type="text"
                value={draft.location}
                onChange={(e) => setDraft({ ...draft, location: e.target.value })}
                className={inputClass}
              />
            </Field>
            <Field label="Order" htmlFor="x-order">
              <input
                id="x-order"
                type="number"
                min={0}
                value={draft.order_index}
                onChange={(e) => setDraft({ ...draft, order_index: Number(e.target.value) })}
                className={inputClass}
              />
            </Field>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Start date" htmlFor="x-start">
              <input
                id="x-start"
                type="date"
                value={draft.start_date}
                onChange={(e) => setDraft({ ...draft, start_date: e.target.value })}
                className={inputClass}
              />
            </Field>
            <div className="flex flex-col gap-1.5">
              <Field label="End date" htmlFor="x-end">
                <input
                  id="x-end"
                  type="date"
                  value={draft.end_date}
                  disabled={draft.present}
                  onChange={(e) => setDraft({ ...draft, end_date: e.target.value })}
                  className={`${inputClass} disabled:cursor-not-allowed disabled:opacity-40`}
                />
              </Field>
              <CheckboxField
                id="x-present"
                label="Present (no end date)"
                checked={draft.present}
                onChange={(present) => setDraft({ ...draft, present })}
              />
            </div>
          </div>
          <Field label="Description" htmlFor="x-desc" hint="Optional">
            <textarea
              id="x-desc"
              rows={3}
              value={draft.description}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              className={inputClass}
            />
          </Field>
          <CheckboxField
            id="x-published"
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
            <div>
              <p className="font-medium text-text-primary">
                {row.role_title} — {row.company}
                {!row.is_published ? (
                  <span className="ml-2 font-mono text-xs text-text-tertiary">(draft)</span>
                ) : null}
              </p>
              <p className="mt-1 font-mono text-xs text-text-tertiary">
                {row.start_date} → {row.end_date ?? "present"} · order {row.order_index}
              </p>
            </div>
            <div className="flex items-center gap-2">
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
            No entries — the Experience section is absent from the public site.
          </p>
        ) : null}
      </div>

      {pendingDelete ? (
        <ConfirmDialog
          title={`Delete "${pendingDelete.role_title} — ${pendingDelete.company}"?`}
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
