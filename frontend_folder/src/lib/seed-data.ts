// Relative import on purpose — backend/scripts/seed.ts imports this module
// across packages, where the "@/" alias doesn't resolve.
import type {
  CaseStudyRow,
  ExperienceRow,
  ProjectRow,
  TestimonialRow,
} from "./types";

// Seed content — CLAUDE.md Section 4's table, verbatim. This module is the
// single source used by both the one-off Supabase seed script and the local
// fallback the data layer serves until Supabase env vars are configured.
//
// summary === description on purpose: the table gives exactly one approved
// line per project, and inventing a "fuller version" is what Section 4
// forbids. Umer can expand description later in /admin.
// metric_label only where the table states the number; the rest stay null.

export const seedProjects: ProjectRow[] = [
  {
    id: "00000000-0000-4000-8000-000000000001",
    slug: "focusflow-ai",
    name: "FocusFlow AI",
    summary:
      "Productivity platform with a React Native app, a Node/Express API, and a separate Python service that runs 3 scikit-learn regression models to predict study schedules.",
    description:
      "Productivity platform with a React Native app, a Node/Express API, and a separate Python service that runs 3 scikit-learn regression models to predict study schedules.",
    tech_tags: [
      "React Native (Expo)",
      "TypeScript",
      "Node.js",
      "Express",
      "JWT",
      "Python",
      "scikit-learn",
      "SQLite",
    ],
    metric_label: "3 ML models",
    github_url: null, // TODO: confirm with Umer
    demo_url: null,
    order_index: 0,
    is_published: true,
  },
  {
    id: "00000000-0000-4000-8000-000000000002",
    slug: "lms",
    name: "Learning Management System",
    summary:
      "Role-based LMS for students, teachers, and management — 30+ REST endpoints covering enrollment, grading, attendance, notices, and fees.",
    description:
      "Role-based LMS for students, teachers, and management — 30+ REST endpoints covering enrollment, grading, attendance, notices, and fees.",
    tech_tags: ["React", "Node.js", "Express", "Microsoft SQL Server", "JWT"],
    metric_label: "30+ endpoints",
    github_url: null, // TODO: confirm with Umer
    demo_url: null,
    order_index: 1,
    is_published: true,
  },
  {
    id: "00000000-0000-4000-8000-000000000003",
    slug: "trustlock",
    name: "TrustLock",
    summary:
      "Native Android screen-time manager with real-time parent/child sync via Supabase.",
    description:
      "Native Android screen-time manager with real-time parent/child sync via Supabase.",
    tech_tags: ["Java", "Android (Gradle)", "XML", "Supabase (PostgreSQL)"],
    metric_label: null,
    github_url: null, // TODO: confirm with Umer
    demo_url: null,
    order_index: 2,
    is_published: true,
  },
  {
    id: "00000000-0000-4000-8000-000000000004",
    slug: "activityconnect",
    name: "ActivityConnect (Linkup)",
    summary:
      "Community platform for discovering and joining real-world activities.",
    description:
      "Community platform for discovering and joining real-world activities.",
    tech_tags: ["React", "TypeScript", "Supabase", "PostgreSQL"],
    metric_label: null,
    github_url: null, // TODO: confirm with Umer
    demo_url: null,
    order_index: 3,
    is_published: true,
  },
];

// The two Phase-1 case studies, converted to the data-driven shape.
// Prose stays conservative — specifics still pending from Umer (the Phase-1
// TODOs), replaceable in /admin without code changes.
export const seedCaseStudies: CaseStudyRow[] = [
  {
    id: "00000000-0000-4000-9000-000000000001",
    project_id: "00000000-0000-4000-8000-000000000001",
    architecture_summary:
      "A React Native (Expo) app talks to a Node/Express API secured with JWT. The API stores data in SQLite and works with a separate Python service that runs three scikit-learn regression models to predict study schedules.",
    architecture_nodes: [
      { id: "app", label: "React Native app", sublabel: "Expo · TypeScript" },
      { id: "api", label: "Node/Express API", sublabel: "JWT auth" },
      { id: "ml", label: "Python ML service", sublabel: "3× scikit-learn" },
      { id: "db", label: "SQLite" },
    ],
    architecture_edges: [
      { from: "app", to: "api" },
      // TODO: confirm with Umer — label this edge with the real Node→Python
      // mechanism once known (HTTP? something else?).
      { from: "api", to: "ml", emphasized: true },
      { from: "api", to: "db" },
    ],
    decisions: [
      {
        title: "Three runtimes, one product",
        body: "The system is deliberately three parts, not one: a React Native (Expo) app for students, a Node/Express API that owns auth and data, and a separate Python service that runs the machine learning. The Express API stays a focused CRUD-and-auth service, and the prediction logic lives behind its own service boundary where Python and scikit-learn are the right tools.",
      },
      {
        title: "Predictions as a service, JWT and SQLite for the rest",
        body: "Predictions come from three scikit-learn regression models that predict study schedules. Auth between the app and the API uses JWT, and SQLite is the datastore.",
      },
    ],
    challenges:
      "The hard part of a three-runtime system is the seams: keeping the mobile app, the API, and the ML service in agreement about data shapes while each side evolves.",
    result:
      "A working end-to-end platform: a React Native app backed by a Node/Express API, with a separate Python service generating predicted study schedules from three regression models.",
    demo_video_url: null,
    is_published: true,
  },
  {
    id: "00000000-0000-4000-9000-000000000002",
    project_id: "00000000-0000-4000-8000-000000000002",
    architecture_summary:
      "A React client serving three roles — students, teachers, and management — calls an Express API with 30+ REST endpoints enforcing role-based access with JWT, backed by Microsoft SQL Server.",
    architecture_nodes: [
      { id: "client", label: "React client", sublabel: "student · teacher · mgmt" },
      { id: "api", label: "Express API", sublabel: "30+ endpoints · JWT" },
      { id: "db", label: "SQL Server", sublabel: "Microsoft" },
    ],
    architecture_edges: [
      { from: "client", to: "api" },
      { from: "api", to: "db" },
    ],
    decisions: [
      {
        title: "Authorization is the spine",
        body: "This is a system with three kinds of user in it — students, teachers, and management — so authorization is the spine of the design. Each role sees a different slice of the same data, enforced with JWT on the API rather than hidden in the UI.",
      },
      {
        title: "A relational domain on a relational database",
        body: "The domain is classically relational — enrollment, grading, attendance, notices, and fees all reference the same students, courses, and terms — which is why it sits on Microsoft SQL Server. The API surface grew to 30+ REST endpoints organized around those five domains.",
      },
    ],
    challenges:
      "The width of the API was the challenge: 30+ endpoints across five domains, each needing consistent role checks, error shapes, and validation so the three client roles could rely on uniform behavior.",
    result:
      "A role-based LMS where students, teachers, and management each work against the same Express API — 30+ REST endpoints covering enrollment, grading, attendance, notices, and fees.",
    demo_video_url: null,
    is_published: true,
  },
];

// Phase 2 launches with no experience/testimonials rows — the sections stay
// absent until Umer adds real entries in /admin (PHASE_2.md Section 8).
export const seedExperience: ExperienceRow[] = [];
export const seedTestimonials: TestimonialRow[] = [];
