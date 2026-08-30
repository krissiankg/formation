-- FORGE IA — schéma principal
create extension if not exists "pgcrypto";

create table if not exists public.enrollments (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null unique,
  whatsapp text not null,
  schedule text not null check (schedule in ('saturday', 'sunday')),
  status text not null default 'awaiting_registration_payment',
  payments jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.published_content (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  kind text not null check (kind in ('outil', 'code', 'programme', 'annonce')),
  published boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_enrollments_email on public.enrollments (email);
create index if not exists idx_content_published on public.published_content (published);

alter table public.enrollments enable row level security;
alter table public.published_content enable row level security;
