import "dotenv/config";
import "../src/ws-polyfill";
import { readFileSync } from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

// Live verification helpers (PHASE_2.md DoD):
//   tsx scripts/live-verify.ts rls        — anon key can read published rows,
//                                           cannot write anything (verified)
//   tsx scripts/live-verify.ts add-cs     — temp case study on TrustLock
//   tsx scripts/live-verify.ts remove-cs  — remove it again

const TRUSTLOCK_ID = "00000000-0000-4000-8000-000000000003";

function anonKeyFromFrontendEnv(): string {
  const envPath = path.resolve(__dirname, "../../frontend/.env.local");
  const match = /NEXT_PUBLIC_SUPABASE_ANON_KEY=(\S+)/.exec(readFileSync(envPath, "utf8"));
  if (!match) throw new Error("anon key not found in frontend/.env.local");
  return match[1];
}

async function main() {
  const url = process.env.SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const service = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const command = process.argv[2];

  if (command === "rls") {
    const anon = createClient(url, anonKeyFromFrontendEnv(), {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    let pass = true;

    // 1. anon can read published rows
    const { data: readRows, error: readError } = await anon.from("projects").select("slug");
    console.log(
      `anon SELECT published projects: ${readError ? `ERROR ${readError.message}` : `${readRows!.length} rows`}`,
    );
    if (readError || readRows!.length < 4) pass = false;

    // 2. anon cannot INSERT
    const { error: insertError } = await anon.from("projects").insert({
      slug: "rls-test-should-fail",
      name: "x",
      summary: "x",
      description: "x",
    });
    console.log(
      `anon INSERT: ${insertError ? `blocked (${insertError.code} ${insertError.message})` : "SUCCEEDED — RLS HOLE!"}`,
    );
    if (!insertError) pass = false;

    // 3. anon UPDATE affects nothing
    const { data: updated, error: updateError } = await anon
      .from("projects")
      .update({ name: "hacked" })
      .eq("id", TRUSTLOCK_ID)
      .select();
    console.log(
      `anon UPDATE: ${updateError ? `blocked (${updateError.message})` : `${updated!.length} rows affected`}`,
    );
    if (!updateError && updated!.length > 0) pass = false;

    // 4. anon DELETE affects nothing
    const { data: deleted, error: deleteError } = await anon
      .from("projects")
      .delete()
      .eq("id", TRUSTLOCK_ID)
      .select();
    console.log(
      `anon DELETE: ${deleteError ? `blocked (${deleteError.message})` : `${deleted!.length} rows affected`}`,
    );
    if (!deleteError && deleted!.length > 0) pass = false;

    // 5. anon cannot see unpublished rows
    const { data: draft, error: draftInsertError } = await service
      .from("testimonials")
      .insert({ author_name: "RLS Draft Test", quote: "unpublished", is_published: false })
      .select()
      .single();
    if (draftInsertError) throw new Error(draftInsertError.message);
    const { data: anonSees } = await anon
      .from("testimonials")
      .select("id")
      .eq("id", draft.id);
    console.log(
      `anon SELECT unpublished row: ${anonSees!.length === 0 ? "hidden" : "VISIBLE — RLS HOLE!"}`,
    );
    if (anonSees!.length !== 0) pass = false;
    await service.from("testimonials").delete().eq("id", draft.id);

    // sanity: the row TrustLock is intact
    const { data: intact } = await service
      .from("projects")
      .select("name")
      .eq("id", TRUSTLOCK_ID)
      .single();
    console.log(`TrustLock intact: ${intact?.name === "TrustLock"}`);
    if (intact?.name !== "TrustLock") pass = false;

    console.log(pass ? "RLS: PASS" : "RLS: FAIL");
    process.exit(pass ? 0 : 1);
  }

  if (command === "add-cs") {
    const { error } = await service.from("case_studies").upsert(
      {
        project_id: TRUSTLOCK_ID,
        architecture_summary:
          "TEMP third-project verification: an Android app syncs parent and child devices in real time through Supabase.",
        architecture_nodes: [
          { id: "n1", label: "Parent app", sublabel: "Android · Java" },
          { id: "n2", label: "Child app", sublabel: "Android · Java" },
          { id: "n3", label: "Supabase", sublabel: "PostgreSQL · realtime" },
        ],
        architecture_edges: [
          { from: "n1", to: "n3", label: "policies" },
          { from: "n2", to: "n3", label: "usage sync", emphasized: true },
        ],
        decisions: [
          {
            title: "Third-project test decision",
            body: "Temporary row proving case studies scale past the original two without code changes.",
          },
        ],
        is_published: true,
      },
      { onConflict: "project_id" },
    );
    if (error) throw new Error(error.message);
    console.log("temp TrustLock case study inserted");
    process.exit(0);
  }

  if (command === "remove-cs") {
    const { error } = await service
      .from("case_studies")
      .delete()
      .eq("project_id", TRUSTLOCK_ID);
    if (error) throw new Error(error.message);
    console.log("temp TrustLock case study removed");
    process.exit(0);
  }

  console.error("usage: tsx scripts/live-verify.ts <rls|add-cs|remove-cs>");
  process.exit(1);
}

main().catch((e) => {
  console.error("live-verify failed:", e);
  process.exit(1);
});
