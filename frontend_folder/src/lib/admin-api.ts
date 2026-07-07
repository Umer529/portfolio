"use client";

import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { site } from "@/lib/site";

// Fetch wrapper for the Express admin API: attaches the Supabase session's
// access token as a bearer header. The server re-verifies it on every call.

export async function adminFetch<T = unknown>(
  path: string,
  init?: Omit<RequestInit, "body"> & { body?: unknown },
): Promise<T> {
  const supabase = getSupabaseBrowser();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error("Not signed in.");

  const res = await fetch(`${site.apiUrl}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
      ...(init?.headers ?? {}),
    },
    body: init?.body !== undefined ? JSON.stringify(init.body) : undefined,
  });

  if (!res.ok) {
    let message = `Request failed (${res.status}).`;
    try {
      const body = (await res.json()) as { error?: string; errors?: Record<string, string[]> };
      if (body.error) message = body.error;
      else if (body.errors) {
        message = Object.entries(body.errors)
          .map(([field, msgs]) => `${field}: ${msgs.join(", ")}`)
          .join(" · ");
      }
    } catch {
      // keep the status message
    }
    throw new Error(message);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}
