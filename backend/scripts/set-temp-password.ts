import "dotenv/config";
import "../src/ws-polyfill";
import { randomInt } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

// Sets a temporary password for the admin user and verifies it works by
// signing in with the anon key (the exact same call the login page makes).
// The admin changes it at /admin/password right after first login.

const WORDS = ["harbor", "signal", "cobalt", "meadow", "quartz", "lantern", "summit", "willow"];

function generatePassword(): string {
  const pick = () => WORDS[randomInt(WORDS.length)];
  return `${pick()}-${pick()}-${randomInt(100, 999)}-${pick()}`;
}

function anonKeyFromArg(): string {
  const key = process.argv[2];
  if (!key) throw new Error("usage: tsx scripts/set-temp-password.ts <anon-key>");
  return key;
}

async function main() {
  const url = process.env.SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const adminEmail = process.env.ADMIN_EMAIL!;
  const service = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: list, error: listError } = await service.auth.admin.listUsers();
  if (listError) throw new Error(listError.message);
  const admin = list.users.find(
    (u) => u.email?.toLowerCase() === adminEmail.toLowerCase(),
  );
  if (!admin) throw new Error(`no user for ${adminEmail}`);

  const password = generatePassword();
  const { error: updateError } = await service.auth.admin.updateUserById(admin.id, {
    password,
  });
  if (updateError) throw new Error(updateError.message);

  // Prove login works exactly as the login page does it (anon key).
  const anon = createClient(url, anonKeyFromArg(), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: signIn, error: signInError } = await anon.auth.signInWithPassword({
    email: adminEmail,
    password,
  });
  if (signInError || !signIn.session) {
    throw new Error(`sign-in check failed: ${signInError?.message}`);
  }
  await anon.auth.signOut();

  console.log(`TEMP PASSWORD for ${adminEmail}: ${password}`);
  console.log("Sign-in verified. Change it at /admin/password after logging in.");
}

main().catch((e) => {
  console.error("failed:", e);
  process.exit(1);
});
