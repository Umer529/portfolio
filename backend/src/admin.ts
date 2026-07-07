import { Router, type NextFunction, type Request, type Response } from "express";
import { z } from "zod";
import { getAdminEmail, getServiceClient } from "./supabase";

// Admin CRUD router (PHASE_2.md Sections 5 & 7). Every endpoint re-checks
// the request's Supabase session token against the one seeded admin email —
// the frontend redirect is UX, this is the actual gate.

export const adminRouter = Router();

async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const supabase = getServiceClient();
  const adminEmail = getAdminEmail();
  if (!supabase || !adminEmail) {
    res.status(503).json({
      ok: false,
      error:
        "Admin API not configured — set SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY and ADMIN_EMAIL in backend/.env",
    });
    return;
  }

  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) {
    res.status(401).json({ ok: false, error: "Missing bearer token" });
    return;
  }

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user?.email) {
    res.status(401).json({ ok: false, error: "Invalid session" });
    return;
  }
  if (data.user.email.toLowerCase() !== adminEmail) {
    res.status(403).json({ ok: false, error: "Not the admin account" });
    return;
  }
  next();
}

adminRouter.use(requireAdmin);

// --- validation --------------------------------------------------------------

const uuid = z.string().uuid();

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .nullish()
    .transform((v) => (v ? v : null));

const optionalUrl = z
  .string()
  .trim()
  .url()
  .max(500)
  .nullish()
  .or(z.literal(""))
  .transform((v) => (v ? v : null));

const projectSchema = z.object({
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "lowercase letters, digits and hyphens")
    .max(80),
  name: z.string().trim().min(1).max(200),
  summary: z.string().trim().min(1).max(1000),
  description: z.string().trim().min(1).max(4000),
  tech_tags: z.array(z.string().trim().min(1).max(60)).max(30),
  metric_label: optionalText(80),
  github_url: optionalUrl,
  demo_url: optionalUrl,
  order_index: z.number().int().min(0).max(9999),
  is_published: z.boolean(),
});

const diagramNode = z.object({
  id: z.string().trim().min(1).max(40),
  label: z.string().trim().min(1).max(60),
  sublabel: optionalText(80),
});

const diagramEdge = z.object({
  from: z.string().trim().min(1).max(40),
  to: z.string().trim().min(1).max(40),
  label: optionalText(60),
  emphasized: z.boolean().optional(),
});

const decision = z.object({
  title: z.string().trim().min(1).max(120),
  body: z.string().trim().min(1).max(4000),
});

const caseStudySchema = z.object({
  architecture_summary: optionalText(2000),
  architecture_nodes: z.array(diagramNode).max(12),
  architecture_edges: z.array(diagramEdge).max(24),
  decisions: z.array(decision).max(12),
  challenges: optionalText(4000),
  result: optionalText(4000),
  demo_video_url: optionalUrl,
  is_published: z.boolean(),
});

const experienceSchema = z.object({
  role_title: z.string().trim().min(1).max(200),
  company: z.string().trim().min(1).max(200),
  location: optionalText(200),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  end_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullish()
    .transform((v) => v ?? null),
  description: optionalText(4000),
  order_index: z.number().int().min(0).max(9999),
  is_published: z.boolean(),
});

const testimonialSchema = z.object({
  author_name: z.string().trim().min(1).max(200),
  author_role: optionalText(200),
  author_company: optionalText(200),
  quote: z.string().trim().min(1).max(2000),
  avatar_url: optionalUrl,
  order_index: z.number().int().min(0).max(9999),
  is_published: z.boolean(),
});

// --- helpers -----------------------------------------------------------------

type Handler = (req: Request, res: Response) => Promise<void>;

function wrap(handler: Handler) {
  return (req: Request, res: Response) => {
    handler(req, res).catch((err: unknown) => {
      if (err instanceof z.ZodError) {
        res.status(400).json({ ok: false, errors: err.flatten().fieldErrors });
        return;
      }
      console.error("[admin]", err);
      res.status(500).json({ ok: false, error: "Internal error" });
    });
  };
}

function db() {
  // requireAdmin already 503'd if unconfigured
  return getServiceClient()!;
}

function fail(res: Response, status: number, message: string) {
  res.status(status).json({ ok: false, error: message });
}

// case_studies.project_id is UNIQUE, so PostgREST embeds it as a to-one
// relation (object | null). The admin UI expects an array — normalize here.
function embedToArray<T extends { case_studies: unknown }>(row: T): T {
  const value = row.case_studies;
  return {
    ...row,
    case_studies: value == null ? [] : Array.isArray(value) ? value : [value],
  };
}

// --- dashboard ----------------------------------------------------------------

adminRouter.get(
  "/stats",
  wrap(async (_req, res) => {
    const tables = ["projects", "case_studies", "experience", "testimonials", "messages"] as const;
    const counts: Record<string, number> = {};
    for (const table of tables) {
      const { count, error } = await db()
        .from(table)
        .select("*", { count: "exact", head: true });
      if (error) throw new Error(error.message);
      counts[table] = count ?? 0;
    }
    // unread count
    const { count: unread, error: unreadError } = await db()
      .from("messages")
      .select("*", { count: "exact", head: true })
      .eq("is_read", false);
    if (unreadError) throw new Error(unreadError.message);
    counts["messages_unread"] = unread ?? 0;
    res.json({ ok: true, counts });
  }),
);

// --- projects -------------------------------------------------------------------

adminRouter.get(
  "/projects",
  wrap(async (_req, res) => {
    const { data, error } = await db()
      .from("projects")
      .select("*, case_studies(id, is_published)")
      .order("order_index", { ascending: true });
    if (error) throw new Error(error.message);
    res.json({ ok: true, projects: (data ?? []).map(embedToArray) });
  }),
);

adminRouter.get(
  "/projects/:id",
  wrap(async (req, res) => {
    const id = uuid.parse(req.params.id);
    const { data, error } = await db()
      .from("projects")
      .select("*, case_studies(*)")
      .eq("id", id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) return fail(res, 404, "Project not found");
    res.json({ ok: true, project: embedToArray(data) });
  }),
);

adminRouter.post(
  "/projects",
  wrap(async (req, res) => {
    const body = projectSchema.parse(req.body);
    const { data, error } = await db().from("projects").insert(body).select().single();
    if (error) throw new Error(error.message);
    res.status(201).json({ ok: true, project: data });
  }),
);

adminRouter.put(
  "/projects/:id",
  wrap(async (req, res) => {
    const id = uuid.parse(req.params.id);
    const body = projectSchema.partial().parse(req.body);
    const { data, error } = await db()
      .from("projects")
      .update({ ...body, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) return fail(res, 404, "Project not found");
    res.json({ ok: true, project: data });
  }),
);

adminRouter.delete(
  "/projects/:id",
  wrap(async (req, res) => {
    const id = uuid.parse(req.params.id);
    const { error } = await db().from("projects").delete().eq("id", id);
    if (error) throw new Error(error.message);
    res.status(204).end();
  }),
);

// --- case study (1:1 with project) ---------------------------------------------

adminRouter.put(
  "/projects/:id/case-study",
  wrap(async (req, res) => {
    const projectId = uuid.parse(req.params.id);
    const body = caseStudySchema.parse(req.body);
    const { data, error } = await db()
      .from("case_studies")
      .upsert(
        { ...body, project_id: projectId, updated_at: new Date().toISOString() },
        { onConflict: "project_id" },
      )
      .select()
      .single();
    if (error) throw new Error(error.message);
    res.json({ ok: true, caseStudy: data });
  }),
);

adminRouter.delete(
  "/projects/:id/case-study",
  wrap(async (req, res) => {
    const projectId = uuid.parse(req.params.id);
    const { error } = await db().from("case_studies").delete().eq("project_id", projectId);
    if (error) throw new Error(error.message);
    res.status(204).end();
  }),
);

// --- experience -----------------------------------------------------------------

adminRouter.get(
  "/experience",
  wrap(async (_req, res) => {
    const { data, error } = await db()
      .from("experience")
      .select("*")
      .order("order_index", { ascending: true });
    if (error) throw new Error(error.message);
    res.json({ ok: true, experience: data });
  }),
);

adminRouter.post(
  "/experience",
  wrap(async (req, res) => {
    const body = experienceSchema.parse(req.body);
    const { data, error } = await db().from("experience").insert(body).select().single();
    if (error) throw new Error(error.message);
    res.status(201).json({ ok: true, entry: data });
  }),
);

adminRouter.put(
  "/experience/:id",
  wrap(async (req, res) => {
    const id = uuid.parse(req.params.id);
    const body = experienceSchema.partial().parse(req.body);
    const { data, error } = await db()
      .from("experience")
      .update(body)
      .eq("id", id)
      .select()
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) return fail(res, 404, "Entry not found");
    res.json({ ok: true, entry: data });
  }),
);

adminRouter.delete(
  "/experience/:id",
  wrap(async (req, res) => {
    const id = uuid.parse(req.params.id);
    const { error } = await db().from("experience").delete().eq("id", id);
    if (error) throw new Error(error.message);
    res.status(204).end();
  }),
);

// --- testimonials -----------------------------------------------------------------

adminRouter.get(
  "/testimonials",
  wrap(async (_req, res) => {
    const { data, error } = await db()
      .from("testimonials")
      .select("*")
      .order("order_index", { ascending: true });
    if (error) throw new Error(error.message);
    res.json({ ok: true, testimonials: data });
  }),
);

adminRouter.post(
  "/testimonials",
  wrap(async (req, res) => {
    const body = testimonialSchema.parse(req.body);
    const { data, error } = await db().from("testimonials").insert(body).select().single();
    if (error) throw new Error(error.message);
    res.status(201).json({ ok: true, entry: data });
  }),
);

adminRouter.put(
  "/testimonials/:id",
  wrap(async (req, res) => {
    const id = uuid.parse(req.params.id);
    const body = testimonialSchema.partial().parse(req.body);
    const { data, error } = await db()
      .from("testimonials")
      .update(body)
      .eq("id", id)
      .select()
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) return fail(res, 404, "Entry not found");
    res.json({ ok: true, entry: data });
  }),
);

adminRouter.delete(
  "/testimonials/:id",
  wrap(async (req, res) => {
    const id = uuid.parse(req.params.id);
    const { error } = await db().from("testimonials").delete().eq("id", id);
    if (error) throw new Error(error.message);
    res.status(204).end();
  }),
);

// --- messages -----------------------------------------------------------------

adminRouter.get(
  "/messages",
  wrap(async (_req, res) => {
    const { data, error } = await db()
      .from("messages")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    res.json({ ok: true, messages: data });
  }),
);

adminRouter.patch(
  "/messages/:id/read",
  wrap(async (req, res) => {
    const id = uuid.parse(req.params.id);
    const { error } = await db()
      .from("messages")
      .update({ is_read: true })
      .eq("id", id);
    if (error) throw new Error(error.message);
    res.status(204).end();
  }),
);

adminRouter.delete(
  "/messages/:id",
  wrap(async (req, res) => {
    const id = uuid.parse(req.params.id);
    const { error } = await db().from("messages").delete().eq("id", id);
    if (error) throw new Error(error.message);
    res.status(204).end();
  }),
);
