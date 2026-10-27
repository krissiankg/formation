\set ON_ERROR_STOP on
begin;
do $$
declare result record; balance integer;
begin
 if current_database() <> 'wallet_tests' then raise exception 'Test database required'; end if;
 update public.student_wallets set balance_coins=100;
 select * into result from public.unlock_resource_with_coins('00000000-0000-4000-8000-000000000001','html:forgeia-1:restaurant','Restaurant',10);
 if not result.success or result.new_balance<>90 or result.already_unlocked then raise exception 'First purchase failed'; end if;
 select * into result from public.unlock_resource_with_coins('00000000-0000-4000-8000-000000000001','html:forgeia-1:restaurant','Menu of same archive',10);
 if not result.success or not result.already_unlocked or result.new_balance<>90 then raise exception 'Duplicate charge'; end if;
 if (select count(*) from public.coin_transactions where type='file_unlock')<>1 then raise exception 'Duplicate journal'; end if;

 update public.student_wallets set balance_coins=0 where enrollment_id='00000000-0000-4000-8000-000000000001';
 select * into result from public.unlock_resource_with_coins('00000000-0000-4000-8000-000000000001','html:forgeia-1:restaurant','Restaurant',10);
 if not result.success or not result.already_unlocked or result.new_balance<>0 then raise exception 'Existing purchase requires coins'; end if;
 select * into result from public.unlock_resource_with_coins('00000000-0000-4000-8000-000000000001','html:forgeia-2:restaurant','Other collection',10);
 if result.success or result.new_balance<>0 then raise exception 'Insufficient funds accepted'; end if;
 if (select count(*) from public.student_unlocked_files)<>1 then raise exception 'Unpaid right created'; end if;

 balance:=public.credit_wallet_coins('00000000-0000-4000-8000-000000000001',50,'fedapay_purchase','Recharge','payment-1');
 if balance<>50 then raise exception 'Credit failed'; end if;
 balance:=public.credit_wallet_coins('00000000-0000-4000-8000-000000000001',50,'fedapay_purchase','Duplicate notification','payment-1');
 if balance<>50 then raise exception 'Duplicate payment credited'; end if;
 if has_function_privilege('anon','public.unlock_resource_with_coins(uuid,text,text,integer)','EXECUTE')
    or has_function_privilege('authenticated','public.unlock_resource_with_coins(uuid,text,text,integer)','EXECUTE')
    or has_function_privilege('anon','public.credit_wallet_coins(uuid,integer,text,text,text)','EXECUTE') then raise exception 'Public wallet function'; end if;
 if has_table_privilege('anon','public.student_unlocked_files','INSERT') then raise exception 'Public unlock table'; end if;
end $$;

create function public.test_ledger_failure() returns trigger language plpgsql as $$
begin if new.reference_id='rollback-test' then raise exception 'test failure' using errcode='23514'; end if; return new; end $$;
create trigger test_ledger_failure before insert on public.coin_transactions for each row execute function public.test_ledger_failure();
do $$
declare before_balance integer;
begin
 select balance_coins into before_balance from public.student_wallets where enrollment_id='00000000-0000-4000-8000-000000000001';
 begin
  perform public.unlock_resource_with_coins('00000000-0000-4000-8000-000000000001','rollback-test','Rollback test',10);
  raise exception 'Ledger error was expected';
 exception when check_violation then null;
 end;
 if (select balance_coins from public.student_wallets where enrollment_id='00000000-0000-4000-8000-000000000001')<>before_balance then raise exception 'Partial debit persisted'; end if;
 if exists(select 1 from public.student_unlocked_files where file_id='rollback-test') then raise exception 'Partial unlock persisted'; end if;
end $$;
set local role service_role;
select * from public.unlock_resource_with_coins('00000000-0000-4000-8000-000000000002','service-role-test','Server access',10);
reset role;
rollback;
update public.student_wallets set balance_coins=100;
