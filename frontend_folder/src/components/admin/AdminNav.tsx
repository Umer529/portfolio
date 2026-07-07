"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { cn } from "@/lib/cn";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/projects", label: "Projects" },
  { href: "/admin/experience", label: "Experience" },
  { href: "/admin/testimonials", label: "Testimonials" },
  { href: "/admin/messages", label: "Messages" },
  { href: "/admin/password", label: "Password" },
];

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  // The login page shares the /admin layout but gets no nav.
  if (pathname === "/admin/login") return null;

  async function signOut() {
    await getSupabaseBrowser().auth.signOut();
    router.replace("/admin/login");
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border-hairline bg-bg-base/85 backdrop-blur">
      <nav
        aria-label="Admin"
        className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between gap-4 px-6"
      >
        <div className="flex items-center gap-1 overflow-x-auto">
          <span className="mr-2 shrink-0 font-mono text-xs text-accent-teal">/admin</span>
          {links.map((l) => {
            const active =
              l.href === "/admin" ? pathname === "/admin" : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "flex min-h-11 shrink-0 items-center rounded-chip px-3 text-sm transition-colors duration-150 ease-brand",
                  "focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-accent-teal",
                  active
                    ? "text-text-primary"
                    : "text-text-secondary hover:text-text-primary",
                )}
                aria-current={active ? "page" : undefined}
              >
                {l.label}
              </Link>
            );
          })}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/"
            className="flex min-h-11 items-center rounded-chip px-3 text-sm text-text-secondary transition-colors duration-150 ease-brand hover:text-text-primary focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-accent-teal"
          >
            View site
          </Link>
          <button
            type="button"
            onClick={signOut}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-chip border border-border-hairline px-3 text-sm text-text-secondary transition-colors duration-150 ease-brand hover:border-border-hairline-hover hover:text-text-primary focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-accent-teal"
          >
            <LogOut aria-hidden size={14} /> Sign out
          </button>
        </div>
      </nav>
    </header>
  );
}
