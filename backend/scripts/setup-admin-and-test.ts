import "dotenv/config";
import "../src/ws-polyfill";
import { randomBytes } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

// One-off: ensures the single admin user exists (random discarded password —
// Umer sets his own via password recovery), then proves the admin API gate:
//   no token → 401, garbage token → 401,
//   valid session for a NON-admin user → 403,
//   valid session for the admin → 200.
// The throwaway non-admin user is deleted afterwards.

const API = process.env.API_URL ?? "http://localhost:4000";
const INTRUDER_EMAIL = "intruder-test@example.com";

async function main() {
  const url = process.env.SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const adminEmail = process.env.ADMIN_EMAIL!;
  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  async function ensureUser(email: string) {
    const { data: list } = await supabase.auth.admin.listUsers();
    const existing = list?.users.find(
      (u) => u.email?.toLowerCase() === email.toLowerCase(),
    );
    if (existing) return existing.id;
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password: randomBytes(24).toString("base64url"),
      email_confirm: true,
    });
    if (error) throw new Error(`createUser(${email}): ${error.message}`);
    console.log(`created user ${email}`);
    return data.user.id;
  }

  async function sessionTokenFor(email: string): Promise<string> {
    const { data, error } = await supabase.auth.admin.generateLink({
      type: "magiclink",
      email,
    });
    if (error) throw new Error(`generateLink(${email}): ${error.message}`);
    const { data: verified, error: verifyError } = await supabase.auth.verifyOtp({
      type: "magiclink",
      token_hash: data.properties.hashed_token,
    });
    if (verifyError || !verified.session) {
      throw new Error(`verifyOtp(${email}): ${verifyError?.message ?? "no session"}`);
    }
    return verified.session.access_token;
  }

  async function hit(label: string, token?: string) {
    const res = await fetch(`${API}/api/admin/projects`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    console.log(`${label} -> ${res.status}`);
    return res.status;
  }

  await ensureUser(adminEmail);
  const intruderId = await ensureUser(INTRUDER_EMAIL);

  const adminToken = await sessionTokenFor(adminEmail);
  const intruderToken = await sessionTokenFor(INTRUDER_EMAIL);

  const results = [
    await hit("no token           "),
    await hit("garbage token      ", "garbage"),
    await hit("non-admin session  ", intruderToken),
    await hit("admin session      ", adminToken),
  ];

  await supabase.auth.admin.deleteUser(intruderId);
  console.log("intruder user deleted");

  const expected = [401, 401, 403, 200];
  const pass = results.every((r, i) => r === expected[i]);
  console.log(pass ? "AUTH GATE: PASS" : `AUTH GATE: FAIL (expected ${expected})`);
  process.exit(pass ? 0 : 1);
}

main().catch((e) => {
  console.error("setup/test failed:", e);
  process.exit(1);
});
