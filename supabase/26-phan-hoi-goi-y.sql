-- Phản hồi do học sinh gửi; giáo viên chỉ xem học sinh mình phụ trách.
create table if not exists public.hint_feedback (
 id uuid primary key default gen_random_uuid(),
 student_id text not null references public.students(student_id),
 question_id text not null references public.questions(question_id),
 tier integer not null check(tier between 1 and 3),
 hint_text text not null check(length(hint_text) between 1 and 2000),
 created_at timestamptz not null default now(),
 unique(student_id,question_id,tier)
);
alter table public.hint_feedback enable row level security;
drop policy if exists feedback_own_insert on public.hint_feedback;
create policy feedback_own_insert on public.hint_feedback for insert to authenticated
with check(student_id=(select p.student_id from public.profiles p where p.id=auth.uid() and p.role='hoc-sinh'));
drop policy if exists feedback_teacher_read on public.hint_feedback;
create policy feedback_teacher_read on public.hint_feedback for select to authenticated
using(public.teaches_student(student_id));
grant select,insert on public.hint_feedback to authenticated;
