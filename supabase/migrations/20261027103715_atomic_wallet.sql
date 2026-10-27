-- Les écritures du portefeuille passent uniquement par le serveur FORGEIA.
alter table public.student_wallets enable row level security;
alter table public.student_unlocked_files enable row level security;
alter table public.coin_transactions enable row level security;
revoke all on public.student_wallets, public.student_unlocked_files, public.coin_transactions from anon, authenticated;
grant select, insert, update, delete on public.student_wallets, public.student_unlocked_files, public.coin_transactions to service_role;

create or replace function public.unlock_resource_with_coins(
  p_enrollment uuid, p_file_id text, p_file_name text, p_cost integer
)
returns table (success boolean, new_balance integer, already_unlocked boolean)
language plpgsql
security invoker
set search_path = ''
as $$
declare v_balance integer;
begin
  if p_cost is null or p_cost <= 0 or p_file_id is null or length(p_file_id) = 0
     or p_file_name is null or length(p_file_name) = 0 then
    raise exception 'invalid_resource_unlock';
  end if;

  -- Le même verrou sérialise tous les achats et crédits de cet apprenant.
  select w.balance_coins into v_balance
    from public.student_wallets w where w.enrollment_id = p_enrollment for update;
  if not found then raise exception 'wallet_not_found'; end if;

  if exists (select 1 from public.student_unlocked_files f
             where f.enrollment_id = p_enrollment and f.file_id = p_file_id) then
    return query select true, v_balance, true;
    return;
  end if;

  if v_balance < p_cost then
    return query select false, v_balance, false;
    return;
  end if;

  update public.student_wallets
     set balance_coins = balance_coins - p_cost, updated_at = now()
   where enrollment_id = p_enrollment
   returning balance_coins into v_balance;

  insert into public.student_unlocked_files (enrollment_id, file_id, file_name, coins_spent)
    values (p_enrollment, p_file_id, p_file_name, p_cost);
  insert into public.coin_transactions (enrollment_id, amount, type, description, reference_id)
    values (p_enrollment, -p_cost, 'file_unlock', 'Déblocage de la ressource : ' || p_file_name, p_file_id);

  return query select true, v_balance, false;
end;
$$;

create or replace function public.credit_wallet_coins(
  p_enrollment uuid, p_amount integer, p_type text, p_description text, p_reference text default null
)
returns integer
language plpgsql
security invoker
set search_path = ''
as $$
declare v_balance integer;
begin
  if p_amount is null or p_amount <= 0 then raise exception 'invalid_coin_credit'; end if;
  select w.balance_coins into v_balance
    from public.student_wallets w where w.enrollment_id = p_enrollment for update;
  if not found then raise exception 'wallet_not_found'; end if;

  -- Deux notifications FedaPay simultanées ne créditent pas deux fois le même achat.
  if p_type = 'fedapay_purchase' and p_reference is not null and exists (
    select 1 from public.coin_transactions t
    where t.enrollment_id = p_enrollment and t.type = p_type and t.reference_id = p_reference
  ) then return v_balance; end if;

  update public.student_wallets
     set balance_coins = balance_coins + p_amount, updated_at = now()
   where enrollment_id = p_enrollment returning balance_coins into v_balance;
  insert into public.coin_transactions (enrollment_id, amount, type, description, reference_id)
    values (p_enrollment, p_amount, p_type, p_description, p_reference);
  return v_balance;
end;
$$;

revoke execute on function public.unlock_resource_with_coins(uuid, text, text, integer) from public, anon, authenticated;
revoke execute on function public.credit_wallet_coins(uuid, integer, text, text, text) from public, anon, authenticated;
grant execute on function public.unlock_resource_with_coins(uuid, text, text, integer) to service_role;
grant execute on function public.credit_wallet_coins(uuid, integer, text, text, text) to service_role;
notify pgrst, 'reload schema';
