-- Programme, séances, todos et progression apprenant

create table if not exists public.formation_modules (
  id uuid primary key default gen_random_uuid(),
  sort_order int not null,
  month_label text not null,
  title text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.formation_lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.formation_modules(id) on delete cascade,
  sort_order int not null,
  title text not null,
  type text not null check (type in ('séance', 'outil', 'code', 'test')),
  duration text not null,
  body text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.formation_sessions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  session_date date not null,
  hours text not null,
  location text not null,
  schedule text not null check (schedule in ('saturday', 'sunday', 'both')),
  lesson_id uuid references public.formation_lessons(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.formation_todos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  sort_order int not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.student_lesson_progress (
  enrollment_id uuid not null references public.enrollments(id) on delete cascade,
  lesson_id uuid not null references public.formation_lessons(id) on delete cascade,
  status text not null check (status in ('completed', 'current')),
  completed_at timestamptz,
  primary key (enrollment_id, lesson_id)
);

create table if not exists public.student_todo_progress (
  enrollment_id uuid not null references public.enrollments(id) on delete cascade,
  todo_id uuid not null references public.formation_todos(id) on delete cascade,
  completed boolean not null default false,
  completed_at timestamptz,
  primary key (enrollment_id, todo_id)
);

create index if not exists idx_formation_lessons_module on public.formation_lessons (module_id, sort_order);
create index if not exists idx_formation_sessions_date on public.formation_sessions (session_date);
create index if not exists idx_student_lesson_progress_enrollment on public.student_lesson_progress (enrollment_id);

alter table public.formation_modules enable row level security;
alter table public.formation_lessons enable row level security;
alter table public.formation_sessions enable row level security;
alter table public.formation_todos enable row level security;
alter table public.student_lesson_progress enable row level security;
alter table public.student_todo_progress enable row level security;

-- Données initiales (programme FORGE IA)
insert into public.formation_modules (id, sort_order, month_label, title)
values
  ('a0000001-0001-4000-8000-000000000001', 1, 'Mois 1 · Octobre', 'Fondations & premiers produits'),
  ('a0000001-0001-4000-8000-000000000002', 2, 'Mois 2 · Novembre', 'Produit & monétisation'),
  ('a0000001-0001-4000-8000-000000000003', 3, 'Mois 3 · Décembre', 'Vente & autonomie')
on conflict (id) do nothing;

insert into public.formation_lessons (id, module_id, sort_order, title, type, duration)
values
  ('b0000001-0001-4000-8000-000000000001', 'a0000001-0001-4000-8000-000000000001', 1, 'Accueil & installation de ta stack IA', 'séance', '5h'),
  ('b0000001-0001-4000-8000-000000000002', 'a0000001-0001-4000-8000-000000000001', 2, 'Kit de prompts fondateurs', 'outil', '15 min'),
  ('b0000001-0001-4000-8000-000000000003', 'a0000001-0001-4000-8000-000000000001', 3, 'De l''idée au MVP en une journée', 'séance', '5h'),
  ('b0000001-0001-4000-8000-000000000004', 'a0000001-0001-4000-8000-000000000001', 4, 'Codes & snippets — interfaces', 'code', '20 min'),
  ('b0000001-0001-4000-8000-000000000005', 'a0000001-0001-4000-8000-000000000001', 5, 'Quiz — bases du builder IA', 'test', '10 min'),
  ('b0000001-0001-4000-8000-000000000006', 'a0000001-0001-4000-8000-000000000002', 1, 'Construire un SaaS complet', 'séance', '5h'),
  ('b0000001-0001-4000-8000-000000000007', 'a0000001-0001-4000-8000-000000000002', 2, 'Paiements & onboarding client', 'séance', '5h'),
  ('b0000001-0001-4000-8000-000000000008', 'a0000001-0001-4000-8000-000000000002', 3, 'Pack d''automatisations', 'outil', '25 min'),
  ('b0000001-0001-4000-8000-000000000009', 'a0000001-0001-4000-8000-000000000003', 1, 'Lancer et vendre ton produit', 'séance', '5h'),
  ('b0000001-0001-4000-8000-000000000010', 'a0000001-0001-4000-8000-000000000003', 2, 'Automatiser ta stack', 'séance', '5h'),
  ('b0000001-0001-4000-8000-000000000011', 'a0000001-0001-4000-8000-000000000003', 3, 'Plan d''autonomie — évaluation finale', 'test', '30 min')
on conflict (id) do nothing;

insert into public.formation_sessions (title, session_date, hours, location, schedule, lesson_id)
values
  ('Accueil & installation de ta stack IA', '2026-10-03', '9h – 14h', 'Présentiel — lieu à confirmer', 'both', 'b0000001-0001-4000-8000-000000000001')
on conflict do nothing;

insert into public.formation_todos (title, sort_order)
values
  ('Confirmer ta présence à la séance d''accueil', 1),
  ('Préparer ton numéro WhatsApp pour les alertes', 2),
  ('Installer les outils de base (liste à venir)', 3)
on conflict do nothing;
