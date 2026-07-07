import { supabasePublic } from "@/lib/supabase/public";
import {
  seedCaseStudies,
  seedExperience,
  seedProjects,
  seedTestimonials,
} from "@/lib/seed-data";
import type {
  CaseStudyRow,
  ExperienceRow,
  ProjectRow,
  ProjectWithCaseStudyFlag,
  TestimonialRow,
} from "@/lib/types";

// Public read layer (PHASE_2.md step 3/4). When Supabase env vars are set,
// everything comes from the DB through the anon client (RLS = published rows
// only). Until then it serves the seed content so the site stays identical
// to Phase 1 — a dev convenience, loudly logged so it can't be mistaken for
// a working production setup.

function warnFallback(fn: string) {
  console.warn(
    `[data] ${fn}: Supabase not configured, serving seed content (set NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY)`,
  );
}

// case_studies.project_id is UNIQUE, so PostgREST embeds it as a to-one
// relation: a single object or null, not an array. Normalize both shapes.
function toArray<T>(value: T | T[] | null | undefined): T[] {
  if (value == null) return [];
  return Array.isArray(value) ? value : [value];
}

export async function getPublishedProjects(): Promise<ProjectWithCaseStudyFlag[]> {
  if (!supabasePublic) {
    warnFallback("getPublishedProjects");
    return seedProjects
      .filter((p) => p.is_published)
      .map((p) => ({
        ...p,
        has_case_study: seedCaseStudies.some(
          (cs) => cs.project_id === p.id && cs.is_published,
        ),
      }));
  }

  const { data, error } = await supabasePublic
    .from("projects")
    .select("*, case_studies(id)")
    .order("order_index", { ascending: true });
  if (error) throw new Error(`getPublishedProjects: ${error.message}`);

  // RLS already filters both tables to published rows for the anon key.
  return (data ?? []).map((row) => {
    const { case_studies, ...project } = row as ProjectRow & {
      case_studies: { id: string } | { id: string }[] | null;
    };
    return { ...project, has_case_study: toArray(case_studies).length > 0 };
  });
}

export async function getProjectWithCaseStudy(
  slug: string,
): Promise<{ project: ProjectRow; caseStudy: CaseStudyRow | null } | null> {
  if (!supabasePublic) {
    warnFallback("getProjectWithCaseStudy");
    const project = seedProjects.find((p) => p.slug === slug && p.is_published);
    if (!project) return null;
    const caseStudy =
      seedCaseStudies.find(
        (cs) => cs.project_id === project.id && cs.is_published,
      ) ?? null;
    return { project, caseStudy };
  }

  const { data, error } = await supabasePublic
    .from("projects")
    .select("*, case_studies(*)")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw new Error(`getProjectWithCaseStudy: ${error.message}`);
  if (!data) return null;

  const { case_studies, ...project } = data as ProjectRow & {
    case_studies: CaseStudyRow | CaseStudyRow[] | null;
  };
  return { project, caseStudy: toArray(case_studies)[0] ?? null };
}

export async function getPublishedExperience(): Promise<ExperienceRow[]> {
  if (!supabasePublic) {
    warnFallback("getPublishedExperience");
    return seedExperience.filter((e) => e.is_published);
  }
  const { data, error } = await supabasePublic
    .from("experience")
    .select("*")
    .order("order_index", { ascending: true });
  if (error) throw new Error(`getPublishedExperience: ${error.message}`);
  return (data ?? []) as ExperienceRow[];
}

export async function getPublishedTestimonials(): Promise<TestimonialRow[]> {
  if (!supabasePublic) {
    warnFallback("getPublishedTestimonials");
    return seedTestimonials.filter((t) => t.is_published);
  }
  const { data, error } = await supabasePublic
    .from("testimonials")
    .select("*")
    .order("order_index", { ascending: true });
  if (error) throw new Error(`getPublishedTestimonials: ${error.message}`);
  return (data ?? []) as TestimonialRow[];
}
