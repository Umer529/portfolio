# CLAUDE.md — Umer Farooq Portfolio

Read this fully before writing any code. This file is the source of truth for design system, content accuracy, and acceptance criteria. If anything you're about to build contradicts this file, stop and follow this file.

## 0. What this project is

A personal portfolio for Umer Farooq, a CS student (BS, FAST-NUCES, expected June 2027, Lahore, Pakistan) with four real full-stack/mobile projects. Audience is recruiters and hiring managers screening for internships. Positioning: *"builds systems with more than one kind of user in them — backend, API, and UI."* Tone is plain and factual, never "enterprise-grade" marketing copy.

**Frontend:** Next.js (App Router) + TypeScript + Tailwind CSS + Framer Motion.
**Backend:** Express (Node/TypeScript), separate service, see Section 6 for scope.
**Icons:** `lucide-react` only — do not use Material Symbols/Material Icons anywhere, they read as generic Android/admin-dashboard and are part of why the last draft looked dated.

---

## 1. Design tokens — KEEP THESE, they're approved

Do not change hue, only reuse. No gradients anywhere in this project — no gradient fills, borders, or text — that rule is absolute, not a style guideline.

```css
--bg-base: #0B0F14;
--bg-surface: #121820;
--bg-surface-raised: #1A222B;
--border-hairline: #26303A;
--border-hairline-hover: #3A4653;
--text-primary: #E7ECF1;
--text-secondary: #8B98A5;
--text-tertiary: #5A6673;
--accent-teal: #4FD1C5;
--accent-teal-hover: #3FBDB1;   /* darkened ~8% for primary button hover */
--accent-amber: #F2B84B;       /* one use only: "expected" date chip */
```

Light mode (token swap only, same structure): `--bg-base:#F7F8FA; --bg-surface:#FFFFFF; --border-hairline:#E3E7EB; --text-primary:#12181F; --accent-teal:#0F9E92` (darkened for AA contrast on white — never use the raw dark-mode teal as text on a light background).

Typography: Display = **Hanken Grotesk** (500/600, headings only). Body = **Inter** (400/500). Mono/utility = **IBM Plex Mono** (labels, tags, stats, route-style eyebrows like `GET /work`).

Radius: 8px for cards and buttons, 4px for chips/tags — do not mix (last draft used a rounded-full pill on one chip; every chip is 4px, no exceptions). Spacing unit: 8px base grid.

---

## 2. Why the last draft felt "old school" — and the fixes to actually build

Diagnosis: every element (cards, buttons, links, chips) had identical visual weight — one border style, one hover treatment, static icons from Material Symbols, a purely centered hero. Nothing signaled hierarchy or responded to interaction beyond a color swap. Build these fixes in:

1. **Real elevation on interaction, not at rest.** Cards and the primary button get a soft single-color shadow (`0 8px 20px rgba(0,0,0,0.28)`) and a **2px translateY(-2px)** *only on hover/focus*, transitioning back on mouse-leave. At rest, everything stays flat — the motion is what signals interactivity, not a shadow sitting there doing nothing.
2. **Lucide icons, not Material Symbols.** Swap every icon. This alone removes a lot of the "generic admin panel" feeling.
3. **Scrollspy nav.** The current section's nav link gets a small animated underline (Framer Motion `layoutId` shared-element transition) that slides between links as you scroll — not just a static hover color. This is a real HCI fix: it's "recognition rather than recall," the user always sees where they are.
4. **Asymmetric hero.** Don't center a text block alone — add a slim right-side panel (desktop only, hidden below `lg`) styled like a small terminal/status readout inside a bordered surface box:
   ```
   $ whoami
   umer_farooq

   $ status
   available_for_internships

   $ building
   this_portfolio
   ```
   Mono type, blinking cursor on the last line (respects `prefers-reduced-motion` — no blink if set). This gives the hero real asymmetry and reinforces the systems-engineer identity physically, not just as a copy line.
5. **Command menu (optional but recommended signature element).** A small `⌘K` hint in the nav opens a `cmdk`-based palette: "Jump to Work," "Jump to Contact," "Copy email," "Download résumé." This is functional, not decorative — it's the one place a Raycast-style touch is earned, because it actually does something a recruiter can use.

---

## 3. Button system — the actual fix for "buttons suck"

The old draft had one button style at one visual weight everywhere, so there was no hierarchy and no real interaction feedback. Build **three tiers**, used consistently, every state defined — this is non-negotiable, it's most of the HCI fix:

**Primary** (exactly one per view — the single most important action):
- Rest: solid fill `--accent-teal`, text `--bg-base` (dark text on light teal, passes AA), 8px radius, 12px/24px padding, Inter 500, min-height 44px.
- Hover: fill → `--accent-teal-hover`, `translateY(-2px)`, shadow `0 8px 20px rgba(79,209,197,0.15)`.
- Active/pressed: `translateY(0)`, fill darkens further, shadow removed (gives a tactile "press" feel).
- Focus-visible: 2px `--accent-teal` outline, 2px offset — always visible on keyboard focus, not just mouse hover.
- Disabled: 40% opacity, `cursor-not-allowed`, no hover transform.
- Use for: hero "View Work," contact "Send message" (if the form exists), case-study "View on GitHub."

**Secondary** (supporting action next to a primary, or standalone list actions):
- Rest: transparent fill, 1px `--border-hairline` border, `--text-primary` text.
- Hover: border → `--border-hairline-hover`, background → `--bg-surface-raised`.
- Same focus/disabled states as primary, ring color still teal.
- Use for: nav "Resume" button, "GitHub Source" links.

**Ghost/text** (lowest emphasis, paired action or inline link):
- Rest: no border, `--text-secondary` text.
- Hover: text → `--text-primary`, underline draws left-to-right 150ms.
- Use for: "Get in touch," in-card "Case Study →" links.

Every button — all three tiers — needs the full state set (rest/hover/active/focus-visible/disabled) actually implemented in code, not just rest+hover. Missing focus-visible rings was an accessibility failure in the last draft (buttons were mouse-only in practice).

---

## 4. Content accuracy — do not deviate from this table

The single biggest problem in the last AI-generated draft: it invented technologies Umer never used (PyTorch, Next.js on the ML project, Docker, Kotlin, Firebase, GraphQL, AWS, Redis). **Every tag, chip, and stack list must come only from this table.** If you want to describe a project and you're not sure a technology belongs, check here first — do not infer or embellish.

| Project | Actual stack (only these tags) | One-line description (plain, no "enterprise-grade"/"utilizing"/"leverage") |
|---|---|---|
| FocusFlow AI | React Native (Expo), TypeScript, Node.js, Express, JWT, Python, scikit-learn, SQLite | Productivity platform with a React Native app, a Node/Express API, and a separate Python service that runs 3 scikit-learn regression models to predict study schedules. |
| Learning Management System | React, Node.js, Express, Microsoft SQL Server, JWT | Role-based LMS for students, teachers, and management — 30+ REST endpoints covering enrollment, grading, attendance, notices, and fees. |
| TrustLock | Java, Android (Gradle), XML, Supabase (PostgreSQL) | Native Android screen-time manager with real-time parent/child sync via Supabase. |
| ActivityConnect (Linkup) | React, TypeScript, Supabase, PostgreSQL | Community platform for discovering and joining real-world activities. |

Stack section on the home page (grouped by function) — only these, nothing added:
- Frontend: React.js, Next.js, TypeScript, Tailwind CSS
- Backend: Node.js, Express.js, FastAPI, JWT Auth
- Databases: Microsoft SQL Server, PostgreSQL, SQLite, Supabase
- Mobile: React Native, Expo, Java, Android

Education timeline has **one entry only** — FAST-NUCES, BS Computer Science, expected June 2027 — do not invent a second "pre-university" entry.

Case-study "Key Decisions" prose must not assert implementation details that aren't confirmed (e.g. don't say "child-process bridge" unless that's literally how the Node→Python call works — ask Umer for the real mechanism, e.g. HTTP call to a small Flask/FastAPI wrapper, before writing that paragraph). Leave a `<!-- TODO: confirm with Umer -->` comment in the code anywhere you're inferring a technical detail not stated in the source table above.

---

## 5. Pages & routes

```
/                    Home — Nav, Hero, Selected Work (4 cards), Stack, Education, Contact, Footer
/work                Work index — all 4 projects, full-width list rows
/work/focusflow-ai   Case study — architecture diagram, decisions, challenges, result
/work/lms            Case study — same template, LMS content
/resume.pdf           Static file served from /public
```

TrustLock and Linkup get strong cards on `/` and `/work` but no dedicated case-study page — don't build thin/padded case studies for them.

---

## 6. Backend (Express) — proposed scope

Assuming a real backend is being added for these reasons (adjust if the actual intent differs):

1. **Contact endpoint** — `POST /api/contact` — replaces a plain `mailto:` with a real form (name, email, message), server validates input, sends via a mail-relay (Resend/Nodemailer), rate-limited (e.g. 5 requests/hour/IP) to prevent spam abuse.
2. **Resume download tracking** — `POST /api/resume/track` — fire-and-forget log (timestamp, referrer) so Umer can see if the resume link is actually being used. No PII beyond what's already public.
3. **Page-view analytics** — `POST /api/analytics/pageview` — minimal, privacy-respecting counter per route, no cookies/fingerprinting.

If the backend's actual purpose is something else (e.g. serving project data from a DB instead of static content, so Umer can update projects without redeploying), say so before building — that changes the API shape substantially (would need `GET /api/projects`, `GET /api/projects/:slug` instead of the above).

All endpoints: input validation (`zod`), rate limiting (`express-rate-limit`), CORS locked to the deployed frontend origin only, no secrets in client code.

---

## 7. HCI heuristics — explicit acceptance criteria (Nielsen's 10, applied)

Every one of these must be true before this ships. Treat this as a checklist, not inspiration.

1. **Visibility of system status** — every button/link has a hover, active, and focus state (Section 3). Form submission shows a loading state on the button itself (text changes to "Sending…", disabled during request) and a success/error message after — never a silent submit.
2. **Match between system and real world** — plain verbs on every button ("Send message," not "Submit"); no invented jargon in copy.
3. **User control and freedom** — mobile nav overlay closes on Escape key and on backdrop click, not just an X button. Command menu (if built) closes on Escape.
4. **Consistency and standards** — the three-tier button system (Section 3) used identically everywhere; chip radius always 4px, card radius always 8px; one animation easing curve (`cubic-bezier(0.16,1,0.3,1)`) reused across every scroll-reveal and hover transition, not a different curve per component.
5. **Error prevention** — contact form validates client-side before submit (real email format, non-empty message) in addition to server-side validation; disable the submit button while a request is in flight so it can't be double-submitted.
6. **Recognition rather than recall** — scrollspy nav (Section 2.3) always shows current section; breadcrumb-style "← All Work" back-link on every case study page.
7. **Flexibility and efficiency of use** — command menu (Section 2.5) for power users; all interactive elements reachable and operable by keyboard alone (tab order follows visual order, no keyboard traps).
8. **Aesthetic and minimalist design** — no unused CSS/design tokens shipped (the last draft carried a full unused Material Design 3 color-role palette alongside the real tokens — don't scaffold anything you're not using).
9. **Help users recognize, diagnose, and recover from errors** — a real custom 404 page (not framework default) matching the design system, with a link back home; form errors state specifically what's wrong ("Enter a valid email," not "Error").
10. **Help and documentation** — N/A for a portfolio at this scope, skip.

Additional non-negotiable accessibility floor: color contrast per Section 1 ratios, visible focus rings on literally everything interactive, `prefers-reduced-motion` collapses all animation to instant state changes (including the hero terminal-cursor blink and the nav underline slide), semantic heading order (one H1 per page), 44×44px minimum tap targets on mobile.

---

## 8. Motion — restraint is intentional, not a gap

One orchestrated load-in on the hero (staggered line reveal, ~80ms stagger), scroll-reveal on section entry (fade + 12px rise, single easing curve, see Section 7.4), the scrollspy underline, the button hover/active states, and the case-study architecture diagram's sequential arrow-draw on scroll-into-view. **That's the full motion budget.** No parallax anywhere (the last draft added parallax to the architecture diagram nodes — remove it, replace with the sequential draw-in). No cursor-follow effects. No card scale-on-hover (translateY only, per Section 2.1).

---

## 9. Build order

Suggest building in this sequence so there's something reviewable at each step:

1. Scaffold Next.js + Tailwind, load design tokens as CSS variables + Tailwind theme extension, load fonts.
2. Build the button/chip/card component primitives with full state sets (Section 3) in isolation — get these right before they're used everywhere.
3. Home page: nav (with scrollspy) → hero (with terminal panel) → Selected Work grid → Stack → Education → Contact → Footer.
4. `/work` index page.
5. Case study template, then both real case studies (FocusFlow AI, LMS) using only Section 4's content table.
6. Express backend: contact endpoint first (highest value), then tracking endpoints.
7. Wire the contact form to the real endpoint, with full loading/success/error states per Section 7.1.
8. Accessibility pass against Section 7's checklist explicitly, item by item.
9. Responsive pass: 375px, 768px, 1024px, 1440px — confirm real restructuring per breakpoint, not just shrinking.

## 10. Definition of done

- [ ] No gradients anywhere (grep the codebase for `gradient` before calling this done)
- [ ] Every button has rest/hover/active/focus-visible/disabled states implemented
- [ ] Every tech tag/chip traces back to Section 4's table — nothing invented
- [ ] Lucide icons only, zero Material Symbols
- [ ] Scrollspy nav working, command menu working (if built)
- [ ] Contact form has real loading/success/error states, server-validated, rate-limited
- [ ] `prefers-reduced-motion` verified to collapse every animation
- [ ] Custom 404 page exists and matches the design system
- [ ] Lighthouse accessibility score checked, not assumed
