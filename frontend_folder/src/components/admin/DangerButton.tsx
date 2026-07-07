"use client";

import { cn } from "@/lib/cn";

// Admin-only destructive action (PHASE_2.md Section 7): flat --admin-danger
// fill, same structural pattern as the public primary button, full state set.
// Never used on the public site.

export function DangerButton({
  className,
  children,
  disabled,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-card px-6 py-3",
        "bg-(--admin-danger) font-medium text-base text-bg-base",
        "transition-[background-color,transform,opacity] duration-150 ease-brand",
        "focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-(--admin-danger)",
        !disabled &&
          "hover:-translate-y-0.5 hover:bg-(--admin-danger-hover) active:translate-y-0 active:bg-(--admin-danger-active)",
        disabled && "cursor-not-allowed opacity-40",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
