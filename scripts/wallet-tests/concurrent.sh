#!/usr/bin/env bash
set -euo pipefail
psql -X -v ON_ERROR_STOP=1 -Atc "select current_database()" | grep -qx wallet_tests
pids=()
for i in {1..10}; do
  psql -X -v ON_ERROR_STOP=1 -q -c "select * from public.unlock_resource_with_coins('00000000-0000-4000-8000-000000000001','same-archive','Same archive',10)" >/dev/null &
  pids+=("$!")
done
for pid in "${pids[@]}"; do wait "$pid"; done
pids=()
for i in {1..10}; do
  psql -X -v ON_ERROR_STOP=1 -q -c "select * from public.unlock_resource_with_coins('00000000-0000-4000-8000-000000000002','archive-$i','Different archive',15)" >/dev/null &
  pids+=("$!")
done
for pid in "${pids[@]}"; do wait "$pid"; done
psql -X -v ON_ERROR_STOP=1 <<'SQL'
do $$ begin
 if (select balance_coins from public.student_wallets where enrollment_id='00000000-0000-4000-8000-000000000001')<>90 then raise exception 'Concurrent duplicate debit'; end if;
 if (select count(*) from public.coin_transactions where enrollment_id='00000000-0000-4000-8000-000000000001' and type='file_unlock')<>1 then raise exception 'Concurrent duplicate ledger'; end if;
 if (select balance_coins from public.student_wallets where enrollment_id='00000000-0000-4000-8000-000000000002')<>10 then raise exception 'Concurrent overspend'; end if;
 if (select count(*) from public.student_unlocked_files where enrollment_id='00000000-0000-4000-8000-000000000002')<>6 then raise exception 'Concurrent rights inconsistent'; end if;
end $$;
SQL
pids=()
for i in {1..8}; do
  psql -X -v ON_ERROR_STOP=1 -q -c "select public.credit_wallet_coins('00000000-0000-4000-8000-000000000001',50,'fedapay_purchase','Recharge','simultaneous-payment')" >/dev/null &
  pids+=("$!")
done
for i in {1..4}; do
  psql -X -v ON_ERROR_STOP=1 -q -c "select * from public.unlock_resource_with_coins('00000000-0000-4000-8000-000000000001','mixed-archive-$i','Archive during recharge',10)" >/dev/null &
  pids+=("$!")
done
for pid in "${pids[@]}"; do wait "$pid"; done
psql -X -v ON_ERROR_STOP=1 <<'SQL'
do $$ begin
 if (select balance_coins from public.student_wallets where enrollment_id='00000000-0000-4000-8000-000000000001')<>100 then raise exception 'Concurrent credit and debit lost'; end if;
 if (select count(*) from public.coin_transactions where reference_id='simultaneous-payment')<>1 then raise exception 'Concurrent payment replay'; end if;
end $$;
select 'Wallet SQL tests passed: rollback, insufficient funds, idempotence, concurrent purchases and recharge' as result;
SQL
