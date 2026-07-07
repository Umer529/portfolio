import { site } from "@/lib/site";

export function Footer() {
  return (
    <footer className="border-t border-border-hairline">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-2 px-6 py-8 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-text-secondary">
          © {new Date().getFullYear()} {site.name} · {site.location}
        </p>
        <p className="font-mono text-xs text-text-tertiary">
          next.js + express · no trackers, no cookies
        </p>
      </div>
    </footer>
  );
}
