"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CheckboxField, Field, inputClass, StatusLine } from "@/components/admin/Field";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { DangerButton } from "@/components/admin/DangerButton";
import { adminFetch } from "@/lib/admin-api";
import type { CaseStudyRow, Decision, DiagramEdge, DiagramNode } from "@/lib/types";

// Inline case-study editor on the project edit page (PHASE_2.md Section 7):
// repeatable node rows (label + sublabel), edge rows with from/to dropdowns
// fed by the node list, repeatable decision blocks. Node ids are generated
// once and kept stable so edges survive label edits.

const removeRowClass =
  "inline-flex min-h-11 min-w-11 items-center justify-center rounded-card text-text-tertiary hover:text-text-primary focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-accent-teal";

function nextNodeId(nodes: DiagramNode[]): string {
  const max = nodes.reduce((acc, n) => {
    const m = /^n(\d+)$/.exec(n.id);
    return m ? Math.max(acc, Number(m[1])) : acc;
  }, 0);
  return `n${max + 1}`;
}

export function CaseStudyForm({
  projectId,
  initial,
}: {
  projectId: string;
  initial: CaseStudyRow | null;
}) {
  const [editing, setEditing] = useState(Boolean(initial));
  const [exists, setExists] = useState(Boolean(initial));

  const [summary, setSummary] = useState(initial?.architecture_summary ?? "");
  const [nodes, setNodes] = useState<DiagramNode[]>(initial?.architecture_nodes ?? []);
  const [edges, setEdges] = useState<DiagramEdge[]>(initial?.architecture_edges ?? []);
  const [decisions, setDecisions] = useState<Decision[]>(initial?.decisions ?? []);
  const [challenges, setChallenges] = useState(initial?.challenges ?? "");
  const [result, setResult] = useState(initial?.result ?? "");
  const [videoUrl, setVideoUrl] = useState(initial?.demo_video_url ?? "");
  const [isPublished, setIsPublished] = useState(initial?.is_published ?? true);

  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  function updateNode(i: number, patch: Partial<DiagramNode>) {
    setNodes(nodes.map((n, idx) => (idx === i ? { ...n, ...patch } : n)));
  }

  function removeNode(i: number) {
    const removed = nodes[i];
    setNodes(nodes.filter((_, idx) => idx !== i));
    setEdges(edges.filter((e) => e.from !== removed.id && e.to !== removed.id));
  }

  function updateEdge(i: number, patch: Partial<DiagramEdge>) {
    setEdges(edges.map((e, idx) => (idx === i ? { ...e, ...patch } : e)));
  }

  function updateDecision(i: number, patch: Partial<Decision>) {
    setDecisions(decisions.map((d, idx) => (idx === i ? { ...d, ...patch } : d)));
  }

  async function save() {
    setStatus("saving");
    setError(null);
    try {
      await adminFetch(`/api/admin/projects/${projectId}/case-study`, {
        method: "PUT",
        body: {
          architecture_summary: summary.trim() || null,
          architecture_nodes: nodes
            .filter((n) => n.label.trim())
            .map((n) => ({
              id: n.id,
              label: n.label.trim(),
              sublabel: n.sublabel?.trim() || null,
            })),
          architecture_edges: edges.filter((e) => e.from && e.to && e.from !== e.to),
          decisions: decisions.filter((d) => d.title.trim() && d.body.trim()),
          challenges: challenges.trim() || null,
          result: result.trim() || null,
          demo_video_url: videoUrl.trim() || null,
          is_published: isPublished,
        },
      });
      setExists(true);
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Save failed.");
    }
  }

  async function deleteCaseStudy() {
    setDeleting(true);
    try {
      await adminFetch(`/api/admin/projects/${projectId}/case-study`, {
        method: "DELETE",
      });
      setExists(false);
      setEditing(false);
      setConfirmingDelete(false);
      setSummary("");
      setNodes([]);
      setEdges([]);
      setDecisions([]);
      setChallenges("");
      setResult("");
      setVideoUrl("");
      setIsPublished(true);
      setStatus("idle");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Delete failed.");
      setConfirmingDelete(false);
    } finally {
      setDeleting(false);
    }
  }

  if (!editing) {
    return (
      <section className="mt-12 border-t border-border-hairline pt-8">
        <h2 className="font-display text-xl font-semibold">Case Study</h2>
        <p className="mt-2 text-sm text-text-secondary">
          No case study yet — the “Case Study →” link stays hidden on the
          public site until one is published here.
        </p>
        <div className="mt-4">
          <Button variant="secondary" onClick={() => setEditing(true)}>
            <Plus aria-hidden size={16} /> Add Case Study
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="mt-12 border-t border-border-hairline pt-8">
      <h2 className="font-display text-xl font-semibold">Case Study</h2>

      <div className="mt-6 flex max-w-2xl flex-col gap-5">
        <Field
          label="Architecture summary"
          htmlFor="cs-summary"
          hint="Plain-text description of the diagram — screen readers get this"
        >
          <textarea
            id="cs-summary"
            rows={3}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            className={inputClass}
          />
        </Field>

        {/* Nodes */}
        <fieldset className="flex flex-col gap-3">
          <legend className="text-sm text-text-secondary">Architecture nodes</legend>
          {nodes.map((node, i) => (
            <div key={node.id} className="flex items-center gap-2">
              <input
                type="text"
                aria-label={`Node ${i + 1} label`}
                placeholder="Label"
                value={node.label}
                onChange={(e) => updateNode(i, { label: e.target.value })}
                className={inputClass}
              />
              <input
                type="text"
                aria-label={`Node ${i + 1} sublabel`}
                placeholder="Sublabel (optional)"
                value={node.sublabel ?? ""}
                onChange={(e) => updateNode(i, { sublabel: e.target.value })}
                className={inputClass}
              />
              <button
                type="button"
                aria-label={`Remove node ${node.label || i + 1}`}
                onClick={() => removeNode(i)}
                className={removeRowClass}
              >
                <Trash2 aria-hidden size={16} />
              </button>
            </div>
          ))}
          <div>
            <Button
              variant="ghost"
              onClick={() =>
                setNodes([...nodes, { id: nextNodeId(nodes), label: "", sublabel: "" }])
              }
            >
              <Plus aria-hidden size={16} /> Add node
            </Button>
          </div>
        </fieldset>

        {/* Edges */}
        <fieldset className="flex flex-col gap-3">
          <legend className="text-sm text-text-secondary">
            Architecture edges (arrows)
          </legend>
          {edges.map((edge, i) => (
            <div key={i} className="flex flex-wrap items-center gap-2">
              <select
                aria-label={`Edge ${i + 1} from`}
                value={edge.from}
                onChange={(e) => updateEdge(i, { from: e.target.value })}
                className={`${inputClass} w-auto min-w-36`}
              >
                <option value="">From…</option>
                {nodes.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.label || n.id}
                  </option>
                ))}
              </select>
              <span aria-hidden className="font-mono text-xs text-text-tertiary">
                →
              </span>
              <select
                aria-label={`Edge ${i + 1} to`}
                value={edge.to}
                onChange={(e) => updateEdge(i, { to: e.target.value })}
                className={`${inputClass} w-auto min-w-36`}
              >
                <option value="">To…</option>
                {nodes.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.label || n.id}
                  </option>
                ))}
              </select>
              <input
                type="text"
                aria-label={`Edge ${i + 1} label`}
                placeholder="Label (optional)"
                value={edge.label ?? ""}
                onChange={(e) => updateEdge(i, { label: e.target.value })}
                className={`${inputClass} w-auto flex-1`}
              />
              <CheckboxField
                id={`edge-emph-${i}`}
                label="Emphasized"
                checked={Boolean(edge.emphasized)}
                onChange={(checked) => updateEdge(i, { emphasized: checked })}
              />
              <button
                type="button"
                aria-label={`Remove edge ${i + 1}`}
                onClick={() => setEdges(edges.filter((_, idx) => idx !== i))}
                className={removeRowClass}
              >
                <Trash2 aria-hidden size={16} />
              </button>
            </div>
          ))}
          <div>
            <Button
              variant="ghost"
              onClick={() => setEdges([...edges, { from: "", to: "", label: "" }])}
              disabled={nodes.length < 2}
            >
              <Plus aria-hidden size={16} /> Add edge
            </Button>
          </div>
        </fieldset>

        {/* Decisions */}
        <fieldset className="flex flex-col gap-3">
          <legend className="text-sm text-text-secondary">
            Key decisions (“why it’s built this way”)
          </legend>
          {decisions.map((decision, i) => (
            <div
              key={i}
              className="flex flex-col gap-2 rounded-card border border-border-hairline p-4"
            >
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  aria-label={`Decision ${i + 1} title`}
                  placeholder="Title"
                  value={decision.title}
                  onChange={(e) => updateDecision(i, { title: e.target.value })}
                  className={inputClass}
                />
                <button
                  type="button"
                  aria-label={`Remove decision ${i + 1}`}
                  onClick={() => setDecisions(decisions.filter((_, idx) => idx !== i))}
                  className={removeRowClass}
                >
                  <Trash2 aria-hidden size={16} />
                </button>
              </div>
              <textarea
                aria-label={`Decision ${i + 1} body`}
                placeholder="Body"
                rows={3}
                value={decision.body}
                onChange={(e) => updateDecision(i, { body: e.target.value })}
                className={inputClass}
              />
            </div>
          ))}
          <div>
            <Button
              variant="ghost"
              onClick={() => setDecisions([...decisions, { title: "", body: "" }])}
            >
              <Plus aria-hidden size={16} /> Add decision
            </Button>
          </div>
        </fieldset>

        <Field label="Challenges" htmlFor="cs-challenges">
          <textarea
            id="cs-challenges"
            rows={3}
            value={challenges}
            onChange={(e) => setChallenges(e.target.value)}
            className={inputClass}
          />
        </Field>

        <Field label="Result" htmlFor="cs-result">
          <textarea
            id="cs-result"
            rows={3}
            value={result}
            onChange={(e) => setResult(e.target.value)}
            className={inputClass}
          />
        </Field>

        <Field label="Demo video URL" htmlFor="cs-video" hint="Optional">
          <input
            id="cs-video"
            type="url"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            className={inputClass}
          />
        </Field>

        <CheckboxField
          id="cs-published"
          label="Published"
          checked={isPublished}
          onChange={setIsPublished}
        />

        <div className="mt-2 flex flex-wrap items-center gap-3">
          <Button variant="primary" onClick={save} disabled={status === "saving"}>
            {status === "saving" ? "Saving…" : "Save case study"}
          </Button>
          {exists ? (
            <DangerButton onClick={() => setConfirmingDelete(true)}>
              Delete case study
            </DangerButton>
          ) : (
            <Button variant="ghost" onClick={() => setEditing(false)}>
              Cancel
            </Button>
          )}
        </div>
        <StatusLine status={status} error={error} successText="Case study saved." />
      </div>

      {confirmingDelete ? (
        <ConfirmDialog
          title="Delete this case study?"
          body="This can’t be undone. The project keeps its card, but /work/<slug> stops existing."
          confirmLabel="Delete"
          busy={deleting}
          onConfirm={deleteCaseStudy}
          onCancel={() => setConfirmingDelete(false)}
        />
      ) : null}
    </section>
  );
}
