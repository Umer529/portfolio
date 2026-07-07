"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Field, inputClass, StatusLine } from "@/components/admin/Field";
import { PageHeader } from "@/components/PageHeader";
import { getSupabaseBrowser } from "@/lib/supabase/browser";

// Change the admin password from inside the panel — covers first login with
// a temporary password and any future rotation, no email flow required.

export default function ChangePasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      setStatus("error");
      setError("Use at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setStatus("error");
      setError("Passwords don’t match.");
      return;
    }
    setStatus("saving");
    setError(null);
    try {
      const { error: updateError } = await getSupabaseBrowser().auth.updateUser({
        password,
      });
      if (updateError) {
        setStatus("error");
        setError(updateError.message);
        return;
      }
      setStatus("success");
      setPassword("");
      setConfirm("");
    } catch {
      setStatus("error");
      setError("Could not reach Supabase.");
    }
  }

  return (
    <main>
      <PageHeader eyebrow="PUT /admin/password" title="Change password" />

      <form onSubmit={onSubmit} noValidate className="mt-8 flex max-w-sm flex-col gap-4">
        <Field label="New password" htmlFor="pw-new" hint="At least 8 characters">
          <input
            id="pw-new"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Confirm new password" htmlFor="pw-confirm">
          <input
            id="pw-confirm"
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className={inputClass}
          />
        </Field>
        <div className="mt-2">
          <Button variant="primary" type="submit" disabled={status === "saving"}>
            {status === "saving" ? "Saving…" : "Change password"}
          </Button>
        </div>
        <StatusLine status={status} error={error} successText="Password changed." />
      </form>
    </main>
  );
}
