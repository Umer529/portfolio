import "dotenv/config";
import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { adminRouter } from "./admin";
import { getServiceClient } from "./supabase";

// Portfolio API — CLAUDE.md Section 6. Three endpoints, all validated with
// zod, rate-limited, CORS locked to the frontend origin. Analytics is a
// privacy-respecting counter: no cookies, no fingerprinting, no PII beyond
// what the visitor already sent.

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

// CORS locked to the frontend origin only — no wildcard.
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN ?? "http://localhost:3000";
app.use(cors({ origin: FRONTEND_ORIGIN }));
app.use(express.json({ limit: "16kb" }));

// When deployed behind a reverse proxy (Render/Railway/nginx), set
// TRUST_PROXY=1 so express-rate-limit sees the real client IP.
if (process.env.TRUST_PROXY) app.set("trust proxy", Number(process.env.TRUST_PROXY));

const DATA_DIR = path.join(process.cwd(), "data");
async function appendJsonl(file: string, record: Record<string, unknown>) {
  await mkdir(DATA_DIR, { recursive: true });
  await appendFile(
    path.join(DATA_DIR, file),
    `${JSON.stringify(record)}\n`,
    "utf8",
  );
}

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

// --- POST /api/contact -----------------------------------------------------

const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5, // 5 requests/hour/IP (Section 6.1)
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, error: "Too many messages — try again in an hour." },
});

const contactSchema = z.object({
  name: z.string().trim().min(1, "Enter your name.").max(100),
  email: z.string().trim().email("Enter a valid email.").max(200),
  message: z.string().trim().min(1, "Enter a message.").max(5000),
});

app.post("/api/contact", contactLimiter, async (req, res) => {
  const parsed = contactSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ ok: false, errors: parsed.error.flatten().fieldErrors });
    return;
  }
  const { name, email, message } = parsed.data;

  try {
    // 1. Persist to Supabase messages table
    const supabase = getServiceClient();
    if (supabase) {
      const { error: dbError } = await supabase
        .from("messages")
        .insert({ name, email, message });
      if (dbError) console.error("[contact] supabase insert failed:", dbError.message);
    }

    // 2. Send email notification via Resend
    if (process.env.RESEND_API_KEY && process.env.CONTACT_TO) {
      const r = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.CONTACT_FROM ?? "Portfolio <onboarding@resend.dev>",
          to: process.env.CONTACT_TO,
          reply_to: email,
          subject: `New message from ${name}`,
          html: `<p><strong>From:</strong> ${name} &lt;${email}&gt;</p><p><strong>Message:</strong></p><p>${message.replace(/\n/g, "<br/>")}</p>`,
          text: `From: ${name} <${email}>\n\n${message}`,
        }),
      });
      if (!r.ok) {
        const body = await r.text();
        console.error(`[contact] resend error ${r.status}:`, body);
      } else {
        console.log(`[contact] email sent to ${process.env.CONTACT_TO}`);
      }
    } else {
      console.log(`[contact] ${name} <${email}>: ${message.slice(0, 200)}`);
    }

    // 3. JSONL fallback
    await appendJsonl("messages.jsonl", {
      ts: new Date().toISOString(),
      name,
      email,
      message,
    });
    res.json({ ok: true });
  } catch (err) {
    console.error("[contact] delivery failed:", err);
    res.status(502).json({ ok: false, error: "Could not send the message." });
  }
});

// --- Tracking endpoints (fire-and-forget) ----------------------------------

const trackLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 60,
  standardHeaders: true,
  legacyHeaders: false,
});

const resumeTrackSchema = z.object({
  referrer: z.string().max(500).optional(),
});

app.post("/api/resume/track", trackLimiter, async (req, res) => {
  const parsed = resumeTrackSchema.safeParse(req.body ?? {});
  const referrer = parsed.success ? parsed.data.referrer : undefined;
  try {
    await appendJsonl("resume-downloads.jsonl", {
      ts: new Date().toISOString(),
      referrer: referrer ?? req.get("referer") ?? null,
    });
  } catch (err) {
    console.error("[resume/track] write failed:", err);
  }
  res.status(204).end();
});

const pageviewSchema = z.object({
  path: z
    .string()
    .max(200)
    .regex(/^\/[a-zA-Z0-9\-_/]*$/, "not a route path"),
});

app.post("/api/analytics/pageview", trackLimiter, async (req, res) => {
  const parsed = pageviewSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ ok: false });
    return;
  }
  try {
    await appendJsonl("pageviews.jsonl", {
      ts: new Date().toISOString(),
      path: parsed.data.path,
    });
  } catch (err) {
    console.error("[analytics] write failed:", err);
  }
  res.status(204).end();
});

// --- Admin CRUD (PHASE_2.md) — session-token gated, service-role writes ----

app.use("/api/admin", adminRouter);

// ---------------------------------------------------------------------------

app.use((_req, res) => {
  res.status(404).json({ ok: false, error: "Not found" });
});

app.listen(PORT, () => {
  console.log(`portfolio-backend listening on http://localhost:${PORT}`);
});
