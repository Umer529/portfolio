// Row shapes matching supabase/schema.sql — snake_case on purpose so a DB row
// flows through untouched and there's no mapping layer to drift.

export type ProjectRow = {
  id: string;
  slug: string;
  name: string;
  summary: string;
  description: string;
  tech_tags: string[];
  metric_label: string | null;
  github_url: string | null;
  demo_url: string | null;
  order_index: number;
  is_published: boolean;
};

export type DiagramNode = {
  id: string;
  label: string;
  sublabel?: string;
};

export type DiagramEdge = {
  from: string;
  to: string;
  label?: string;
  emphasized?: boolean;
};

export type Decision = {
  title: string;
  body: string;
};

export type CaseStudyRow = {
  id: string;
  project_id: string;
  architecture_summary: string | null;
  architecture_nodes: DiagramNode[];
  architecture_edges: DiagramEdge[];
  decisions: Decision[];
  challenges: string | null;
  result: string | null;
  demo_video_url: string | null;
  is_published: boolean;
};

export type ExperienceRow = {
  id: string;
  role_title: string;
  company: string;
  location: string | null;
  start_date: string; // ISO date
  end_date: string | null; // null = present
  description: string | null;
  order_index: number;
  is_published: boolean;
};

export type TestimonialRow = {
  id: string;
  author_name: string;
  author_role: string | null;
  author_company: string | null;
  quote: string;
  avatar_url: string | null;
  order_index: number;
  is_published: boolean;
};

/** Project plus whether a published case study exists (drives the card link). */
export type ProjectWithCaseStudyFlag = ProjectRow & { has_case_study: boolean };
