-- Apply after 27. Pilot evidence stays separate from research tests and mastery.
create table if not exists public.support_approvals (
 teacher_id uuid not null references auth.users(id),
 version text not null,
 arm text not null check(arm in ('visual','steps','game')),
 approved boolean not null default false,
 updated_at timestamptz not null default now(),
 primary key(teacher_id,version,arm)
);
alter table public.support_approvals enable row level security;
create policy support_approval_read on public.support_approvals for select to authenticated using(teacher_id=auth.uid());
create policy support_approval_write on public.support_approvals for all to authenticated
 using(teacher_id=auth.uid() and public.is_teacher()) with check(teacher_id=auth.uid() and public.is_teacher());
grant select,insert,update on public.support_approvals to authenticated;

create table if not exists public.support_sessions (
 id uuid primary key default gen_random_uuid(),
 recovery_id uuid not null unique references public.learning_recovery_records(recovery_id),
 student_id text not null references public.students(student_id),
 version text not null,
 revision integer not null default 0,
 state jsonb not null,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 unique(student_id,version)
);
alter table public.support_sessions enable row level security;
create policy support_session_read on public.support_sessions for select to authenticated
 using(student_id=public.my_student_id() or public.teaches_student(student_id));
grant select on public.support_sessions to authenticated;
-- All grading and writes use authenticated, ownership-checked server routes.
grant all on public.support_sessions to service_role;
