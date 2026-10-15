-- FORGEIA CODE : consommation de la passerelle IA et crédit IA par apprenant.

create table if not exists public.ia_usage (
  id bigserial primary key,
  enrollment_id uuid not null references public.enrollments(id) on delete cascade,
  -- Alias de modèle utilisé (forgeia-coder…) ou « topup » pour une recharge (coût négatif).
  alias text not null,
  prompt_tokens integer not null default 0,
  cached_tokens integer not null default 0,
  completion_tokens integer not null default 0,
  -- Vrai quand le fournisseur n'a pas renvoyé d'usage et qu'on a estimé (flux interrompu).
  estimated boolean not null default false,
  cost_fcfa numeric(12, 2) not null,
  created_at timestamptz not null default now()
);

create index if not exists ia_usage_enrollment_created_idx
  on public.ia_usage (enrollment_id, created_at desc);

-- Accès uniquement côté serveur (clé service_role), comme les autres tables.
alter table public.ia_usage enable row level security;

-- Budget IA propre à un apprenant ; vide = budget par défaut de la formation.
alter table public.enrollments add column if not exists ia_budget_fcfa integer;

-- Recharge du crédit IA avec des coins.
alter table public.coin_transactions drop constraint if exists coin_transactions_type_check;
alter table public.coin_transactions add constraint coin_transactions_type_check
  check (type in ('welcome_bonus', 'fedapay_purchase', 'file_unlock', 'admin_bonus', 'quiz_reward', 'ia_topup'));

-- Totaux par apprenant (security_invoker : la vue applique le RLS de ia_usage, donc rien n'est exposé publiquement).
create or replace view public.ia_usage_totals
with (security_invoker = true) as
select
  enrollment_id,
  coalesce(sum(cost_fcfa), 0)::numeric(12, 2) as spent_fcfa,
  count(*) filter (where alias <> 'topup') as calls,
  max(created_at) filter (where alias <> 'topup') as last_at,
  -- Consommation réelle (sans les recharges), pour suivre le coût.
  coalesce(sum(cost_fcfa) filter (where alias <> 'topup'), 0)::numeric(12, 2) as consumed_fcfa
from public.ia_usage
group by enrollment_id;

-- Recharge atomique : débit des coins, transaction et crédit IA dans une seule fonction (pas de double dépense).
create or replace function public.ia_topup_from_coins(p_enrollment uuid, p_coins integer)
returns integer
language plpgsql
security invoker
set search_path = public
as $$
declare
  new_balance integer;
begin
  if p_coins is null or p_coins <= 0 or p_coins % 10 <> 0 then
    raise exception 'invalid_coins';
  end if;

  update public.student_wallets
     set balance_coins = balance_coins - p_coins, updated_at = now()
   where enrollment_id = p_enrollment and balance_coins >= p_coins
  returning balance_coins into new_balance;

  if not found then
    raise exception 'insufficient_coins';
  end if;

  insert into public.coin_transactions (enrollment_id, amount, type, description)
  values (p_enrollment, -p_coins, 'ia_topup', 'Recharge du crédit IA FORGEIA CODE');

  insert into public.ia_usage (enrollment_id, alias, cost_fcfa)
  values (p_enrollment, 'topup', -p_coins * 50);

  return new_balance;
end;
$$;

revoke execute on function public.ia_topup_from_coins(uuid, integer) from public, anon, authenticated;
