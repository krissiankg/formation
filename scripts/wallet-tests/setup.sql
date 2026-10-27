\set ON_ERROR_STOP on
do $$ begin if current_database() <> 'wallet_tests' then raise exception 'Test database required'; end if; end $$;
create role anon nologin;
create role authenticated nologin;
create role service_role nologin bypassrls;
grant usage on schema public to anon, authenticated, service_role;
create table public.enrollments (id uuid primary key);
insert into public.enrollments values
 ('00000000-0000-4000-8000-000000000001'),
 ('00000000-0000-4000-8000-000000000002');
