-- PHASE_2.md Sections 3–4 — run this once in the Supabase SQL editor
-- (dashboard → SQL Editor → New query → paste → Run).
-- Schema first, then RLS. RLS must be in place before any real data goes in.

create extension if not exists pgcrypto;

create table projects (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  summary text not null,              -- one-liner for the home page card
  description text not null,          -- fuller version for /work index
  tech_tags text[] not null default '{}',
  metric_label text,                  -- e.g. "30+ endpoints", "3 ML models"
  github_url text,
  demo_url text,                      -- nullable, only set if actually deployed
  order_index int not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table case_studies (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null unique references projects(id) on delete cascade,
  architecture_summary text,          -- one-paragraph plain-text fallback for a11y
  architecture_nodes jsonb not null default '[]',  -- [{ "id","label","sublabel" }]
  architecture_edges jsonb not null default '[]',  -- [{ "from","to","label","emphasized":bool }]
  decisions jsonb not null default '[]',           -- [{ "title","body" }]
  challenges text,
  result text,
  demo_video_url text,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table experience (
  id uuid primary key default gen_random_uuid(),
  role_title text not null,
  company text not null,
  location text,
  start_date date not null,
  end_date date,                      -- null = present
  description text,
  order_index int not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);

create table testimonials (
  id uuid primary key default gen_random_uuid(),
  author_name text not null,
  author_role text,
  author_company text,
  quote text not null,
  avatar_url text,
  order_index int not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);

create table messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

-- Row Level Security ---------------------------------------------------------

alter table projects enable row level security;
alter table case_studies enable row level security;
alter table experience enable row level security;
alter table testimonials enable row level security;
alter table messages enable row level security;

create policy "public read published projects" on projects
  for select using (is_published = true);

create policy "public read published case studies" on case_studies
  for select using (is_published = true);

create policy "public read published experience" on experience
  for select using (is_published = true);

create policy "public read published testimonials" on testimonials
  for select using (is_published = true);

-- Deliberately no insert/update/delete policy for the anon or authenticated
-- role. All writes happen through Express using the service_role key, which
-- bypasses RLS by design — that's the one door, and it's server-side only.
