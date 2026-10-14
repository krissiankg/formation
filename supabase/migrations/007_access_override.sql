-- 007_access_override.sql
-- Accès à la formation : choix manuel de l'admin, prioritaire sur la règle des paiements.
-- null = automatique (selon les paiements), 'full' = accès complet forcé, 'blocked' = accès bloqué.

alter table public.enrollments
  add column if not exists access_override text
  check (access_override in ('full', 'blocked'));

comment on column public.enrollments.access_override is
  'Choix admin : null = automatique (selon les paiements), full = accès complet forcé, blocked = accès bloqué';
