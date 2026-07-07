import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Anon-key client for public reads from Server Components. RLS limits it to
// published rows; it can never write (no insert/update/delete policies).
// Null until NEXT_PUBLIC_SUPABASE_URL/ANON_KEY are configured — the data
// layer falls back to seed content in that case.

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabasePublic: SupabaseClient | null =
  url && anonKey
    ? createClient(url, anonKey, { auth: { persistSession: false } })
    : null;
