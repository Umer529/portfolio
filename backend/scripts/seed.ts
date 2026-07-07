import "dotenv/config";
import "../src/ws-polyfill";
import { createClient } from "@supabase/supabase-js";
import {
  seedCaseStudies,
  seedProjects,
} from "../../frontend/src/lib/seed-data";

// One-off seed (PHASE_2.md step 2): inserts the 4 real projects and the 2
// case studies from CLAUDE.md Section 4's table verbatim. Run locally with
// the service role key in backend/.env:
//
//   cd backend && npm run seed
//
// Idempotent — upserts on fixed ids, safe to re-run. It will NOT overwrite
// edits made later in /admin unless you re-run it deliberately.

async function main() {
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    console.error(
      "Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in backend/.env first.",
    );
    process.exit(1);
  }

  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: projects, error: projectsError } = await supabase
    .from("projects")
    .upsert(seedProjects, { onConflict: "id" })
    .select("slug");
  if (projectsError) {
    console.error("projects upsert failed:", projectsError.message);
    process.exit(1);
  }
  console.log(
    `projects: ${projects.length} upserted (${projects.map((p) => p.slug).join(", ")})`,
  );

  const { data: caseStudies, error: caseStudiesError } = await supabase
    .from("case_studies")
    .upsert(seedCaseStudies, { onConflict: "id" })
    .select("id");
  if (caseStudiesError) {
    console.error("case_studies upsert failed:", caseStudiesError.message);
    process.exit(1);
  }
  console.log(`case_studies: ${caseStudies.length} upserted`);
  console.log("Done. Verify at /work — content should match Phase 1 exactly.");
}

main();
