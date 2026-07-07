"use client";

import { createBrowserClient } from "@supabase/ssr";

// Browser client for /admin only: cookie-based session so proxy.ts can gate
// admin routes server-side. Public pages never import this.

export function getSupabaseBrowser() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error(
      "Supabase is not configured — set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in frontend/.env.local",
    );
  }
  return createBrowserClient(url, anonKey);
}
