"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

export function Modal({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const close = useCallback(() => router.back(), [router]);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      {/* Backdrop */}
      <button
        aria-label="Close"
        onClick={close}
        className="absolute inset-0 bg-bg-base/80 backdrop-blur-sm"
      />

      {/* Panel */}
      <div className="relative z-10 flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-2xl border border-border-hairline bg-bg-surface sm:max-h-[85dvh] sm:max-w-5xl sm:rounded-2xl">
        {/* Drag handle (mobile) */}
        <div className="flex shrink-0 items-center justify-between border-b border-border-hairline px-5 py-4">
          <div className="mx-auto h-1 w-10 rounded-full bg-border-hairline sm:hidden" />
          <button
            onClick={close}
            aria-label="Close"
            className="ml-auto inline-flex h-8 w-8 items-center justify-center rounded-full text-text-tertiary hover:bg-bg-base hover:text-text-primary transition-colors"
          >
            <X size={18} aria-hidden />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto px-6 py-8">
          {children}
        </div>
      </div>
    </div>
  );
}
