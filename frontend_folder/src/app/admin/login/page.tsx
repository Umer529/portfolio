"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Field, inputClass, StatusLine } from "@/components/admin/Field";
import { PageHeader } from "@/components/PageHeader";

// /admin/login (PHASE_2.md Section 5): plain email/password against Supabase
// Auth. Only the one seeded admin account can do anything useful — the
// Express API refuses every other email even with a valid session.

const supabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) {
      setStatus("error");
      setError("Enter your email and password.");
      return;
    }
    setStatus("saving");
    setError(null);
    try {
      const { getSupabaseBrowser } = await import("@/lib/supabase/browser");
      const { error: signInError } = await getSupabaseBrowser().auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (signInError) {
        setStatus("error");
        setError("Wrong email or password.");
        return;
      }
      setStatus("success");
      router.replace("/admin");
      router.refresh();
    } catch {
      setStatus("error");
      setError("Could not reach Supabase. Check the configuration.");
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-16">
      <PageHeader eyebrow="POST /admin/login" title="Sign in" />

      {!supabaseConfigured ? (
        <p className="mt-6 rounded-card border border-border-hairline bg-bg-surface p-4 text-sm text-text-secondary">
          Supabase isn’t configured yet. Set{" "}
          <code className="font-mono text-xs">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
          <code className="font-mono text-xs">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in{" "}
          <code className="font-mono text-xs">frontend/.env.local</code>, then restart
          the dev server.
        </p>
      ) : (
        <form onSubmit={onSubmit} noValidate className="mt-8 flex flex-col gap-4">
          <Field label="Email" htmlFor="admin-email">
            <input
              id="admin-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Password" htmlFor="admin-password">
            <input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
            />
          </Field>
          <div className="mt-2">
            <Button variant="primary" type="submit" disabled={status === "saving"}>
              {status === "saving" ? "Signing in…" : "Sign in"}
            </Button>
          </div>
          <StatusLine status={status} error={error} successText="Signed in." />
        </form>
      )}
    </main>
  );
}
