import "./ws-polyfill";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Service-role client — server-side only, bypasses RLS by design. The key
// lives exclusively in backend/.env (PHASE_2.md Section 2); it must never
// appear in any client-bundled file.

let client: SupabaseClient | null | undefined;

export function getServiceClient(): SupabaseClient | null {
  if (client !== undefined) return client;
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  client =
    url && serviceKey
      ? createClient(url, serviceKey, {
          auth: { persistSession: false, autoRefreshToken: false },
        })
      : null;
  return client;
}

export function getAdminEmail(): string | null {
  return process.env.ADMIN_EMAIL?.trim().toLowerCase() || null;
}
