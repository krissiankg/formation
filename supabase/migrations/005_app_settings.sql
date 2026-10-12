-- 005_app_settings.sql
-- Réglages applicatifs persistants (ex. jeton OAuth Google Drive), indépendants du serveur qui exécute l'appli.

create table if not exists public.app_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

-- Aucun accès anon/authenticated : seule la clé service_role (serveur) lit et écrit.
alter table public.app_settings enable row level security;
