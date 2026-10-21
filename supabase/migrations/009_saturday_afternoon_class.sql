-- Troisième classe : samedi après-midi (16h – 20h30), en plus du samedi matin et du dimanche matin.
alter table public.enrollments drop constraint if exists enrollments_schedule_check;
alter table public.enrollments add constraint enrollments_schedule_check
  check (schedule in ('saturday', 'saturday_pm', 'sunday'));

alter table public.formation_sessions drop constraint if exists formation_sessions_schedule_check;
alter table public.formation_sessions add constraint formation_sessions_schedule_check
  check (schedule in ('saturday', 'saturday_pm', 'sunday', 'both'));
