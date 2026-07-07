import "dotenv/config";
import "../src/ws-polyfill";
import { createClient } from "@supabase/supabase-js";

// Read-only state check: which tables exist, row counts, admin user presence.

async function main() {
  const url = process.env.SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  for (const table of ["projects", "case_studies", "experience", "testimonials"]) {
    const { count, error } = await supabase
      .from(table)
      .select("*", { count: "exact", head: true });
    if (error) {
      console.log(`table:${table} ERROR: ${error.code ?? ""} ${error.message}`);
    } else {
      console.log(`table:${table} rows:${count}`);
    }
  }

  const { data, error } = await supabase.auth.admin.listUsers();
  if (error) {
    console.log(`auth users ERROR: ${error.message}`);
  } else {
    console.log(`auth users: ${data.users.length}`);
    for (const u of data.users) {
      console.log(
        `  user: ${u.email} confirmed:${Boolean(u.email_confirmed_at)} last_sign_in:${u.last_sign_in_at ?? "never"}`,
      );
    }
  }
}

main().catch((e) => {
  console.error("check failed:", e);
  process.exit(1);
});
