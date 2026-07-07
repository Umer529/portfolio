"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { DangerButton } from "@/components/admin/DangerButton";

// Delete confirmation (PHASE_2.md Section 7): never delete on a single
// click. Ghost "Cancel", danger-filled confirm. Escape and backdrop click
// both cancel.

export function ConfirmDialog({
  title,
  body,
  confirmLabel,
  busy,
  onConfirm,
  onCancel,
}: {
  title: string;
  body: string;
  confirmLabel: string;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const cancelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    // Focus lands on Cancel — the safe default.
    cancelRef.current?.querySelector("button")?.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  return (
    <div className="fixed inset-0 z-50" role="alertdialog" aria-modal="true" aria-label={title}>
      <button
        type="button"
        aria-label="Cancel"
        onClick={onCancel}
        className="absolute inset-0 bg-bg-base/70"
      />
      <div className="absolute inset-x-4 top-1/3 mx-auto max-w-md rounded-card border border-border-hairline bg-bg-surface p-6 shadow-lift">
        <h2 className="font-display text-lg font-semibold">{title}</h2>
        <p className="mt-2 text-sm text-text-secondary">{body}</p>
        <div className="mt-6 flex items-center justify-end gap-3" ref={cancelRef}>
          <Button variant="ghost" onClick={onCancel} disabled={busy}>
            Cancel
          </Button>
          <DangerButton onClick={onConfirm} disabled={busy}>
            {busy ? "Deleting…" : confirmLabel}
          </DangerButton>
        </div>
      </div>
    </div>
  );
}
