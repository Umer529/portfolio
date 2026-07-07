"use client";

import { cn } from "@/lib/cn";

// Admin form field primitives — same input treatment as the public contact
// form (CLAUDE.md Section 3 focus rules apply everywhere).

export const inputClass = cn(
  "w-full rounded-card border border-border-hairline bg-bg-surface px-4 py-3",
  "text-base text-text-primary transition-colors duration-150 ease-brand",
  "placeholder:text-text-tertiary hover:border-border-hairline-hover",
  "focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-accent-teal",
);

export function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm text-text-secondary">
        {label}
      </label>
      {children}
      {hint ? <p className="text-xs text-text-tertiary">{hint}</p> : null}
    </div>
  );
}

export function CheckboxField({
  label,
  id,
  checked,
  onChange,
}: {
  label: string;
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label
      htmlFor={id}
      className="flex min-h-11 w-fit cursor-pointer items-center gap-2.5 text-sm text-text-primary"
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 accent-(--accent-teal) focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-accent-teal"
      />
      {label}
    </label>
  );
}

/** Form status line with the loading/success/error pattern from CLAUDE.md 7.1. */
export function StatusLine({
  status,
  error,
  successText = "Saved.",
}: {
  status: "idle" | "saving" | "success" | "error";
  error?: string | null;
  successText?: string;
}) {
  return (
    <p role="status" aria-live="polite" className="min-h-5 text-sm">
      {status === "success" ? (
        <span className="text-accent-teal">{successText}</span>
      ) : status === "error" ? (
        <span className="font-medium text-text-primary">
          {error ?? "Something went wrong."}
        </span>
      ) : null}
    </p>
  );
}
