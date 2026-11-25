-- Apply after 23. Distinguish teacher contact from verified learning gains.
alter table public.learning_recovery_records add column if not exists source_attempt_id bigint references public.quiz_attempts(attempt_id);
alter table public.learning_recovery_records add column if not exists teacher_contacted_at timestamptz;
create unique index if not exists recovery_attempt_error_unique on public.learning_recovery_records(source_attempt_id,manifest_error);
alter view public.teacher_intervention_queue set (security_invoker=true);
drop policy if exists "Hoc sinh xem ho so phuc hoi cua chinh minh" on public.learning_recovery_records;
create policy "Hoc sinh xem ho so phuc hoi cua chinh minh" on public.learning_recovery_records for select to authenticated
using(student_id=(select p.student_id from public.profiles p where p.id=auth.uid()));
create or replace function public.mark_recovery_contact(p_id uuid,p_contacted boolean) returns void
language plpgsql security definer set search_path=public as $$
begin
 if not exists(select 1 from profiles where id=auth.uid() and role='giao-vien') or not exists(select 1 from learning_recovery_records r where r.recovery_id=p_id and teaches_student(r.student_id)) then
 raise exception 'Not authorized'; end if;
 update learning_recovery_records set teacher_contacted_at=case when p_contacted then now() else null end,updated_at=now() where recovery_id=p_id;
end;$$;
revoke all on function public.mark_recovery_contact(uuid,boolean) from public,anon;
grant execute on function public.mark_recovery_contact(uuid,boolean) to authenticated;
