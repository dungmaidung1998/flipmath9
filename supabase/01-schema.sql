-- ===========================================================================
-- DFLE-M7 · LƯỢC ĐỒ CƠ SỞ DỮ LIỆU + PHÂN QUYỀN
-- Chạy trong Supabase → SQL Editor. Chạy file này TRƯỚC 02-seed.sql.
--
-- Nguyên tắc bảo vệ dữ liệu người chưa thành niên (theo Phiếu 4):
--   * Bảng students KHÔNG chứa họ tên và KHÔNG chứa email thật của học sinh.
--   * Tài khoản đăng nhập của học sinh dùng email nội bộ dạng
--     <ma_hoc_sinh>@<ma_lop>.hs.dfle.local — không phải email cá nhân.
--   * Bảng khoá nối mã nghiên cứu với danh tính do người hướng dẫn giữ NGOÀI hệ thống.
--   * Học sinh KHÔNG đọc được đáp án đúng và bảng mã lỗi (xem phần RLS bên dưới).
-- ===========================================================================

-- --------------------------------------------------------------- cấu trúc

create table if not exists classes (
  class_id      text primary key,
  class_code    text unique not null,          -- mã lớp học sinh gõ khi đăng nhập
  grade         int  not null default 7,
  arm           text not null check (arm in ('TN','DC')),
  teacher_id    uuid references auth.users(id)
);

create table if not exists students (
  student_id       text primary key,           -- MÃ NGHIÊN CỨU
  class_id         text references classes(class_id),
  display_name     text,                       -- tên hiển thị trong lớp (có thể là biệt danh)
  gender           text check (gender in ('nam','nu','khac')),
  baseline_math    numeric(4,2),
  device_type      text,
  internet_access  text,
  consent_status   text not null default 'chua'
                   check (consent_status in ('chua','dong-y','tu-choi','rut-lui'))
);

-- Nối tài khoản đăng nhập với vai trò và mã nghiên cứu
create table if not exists profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  role        text not null check (role in ('hoc-sinh','giao-vien')),
  student_id  text unique references students(student_id),
  class_id    text references classes(class_id),
  full_name   text
);

create table if not exists knowledge_units (
  ku_id           text primary key,
  lesson_id       text,
  ku_name         text not null,
  order_index     int  not null,
  prerequisite_ku text references knowledge_units(ku_id)
);

create table if not exists contents (
  content_id   text primary key,
  ku_id        text references knowledge_units(ku_id),
  kind         text not null,       -- 'video' | 'hoc-lieu' | 'bai-tap' | 'micro-lesson'
  level        int check (level between 1 and 4),
  title        text not null,
  duration_sec int,
  url          text                 -- link video (YouTube) hoặc học liệu
);

create table if not exists error_dictionary (
  error_code     text primary key,
  ku_id          text references knowledge_units(ku_id),
  misconception  text not null,
  remediation_id text references contents(content_id)
);

create table if not exists questions (
  question_id       text primary key,
  ku_id             text references knowledge_units(ku_id),
  level             int  not null check (level between 1 and 4),
  stem              text not null,
  correct_option    text not null,   -- KHÔNG cho học sinh đọc cột này
  expected_time_sec int  not null
);

create table if not exists question_options (
  question_id text references questions(question_id) on delete cascade,
  option_key  text not null,
  option_text text not null,
  primary key (question_id, option_key)
);

create table if not exists distractor_errors (
  question_id text references questions(question_id) on delete cascade,
  option_key  text not null,
  error_code  text references error_dictionary(error_code),
  primary key (question_id, option_key)
);

create table if not exists learning_events (
  event_id            bigserial primary key,
  student_id          text references students(student_id),
  ku_id               text references knowledge_units(ku_id),
  event_type          text not null,
  ts                  timestamptz not null default now(),
  duration_active_sec int,
  payload             jsonb
);
create index if not exists idx_events_student_ts on learning_events(student_id, ts);

create table if not exists quiz_attempts (
  attempt_id       bigserial primary key,
  student_id       text references students(student_id),
  ku_id            text references knowledge_units(ku_id),
  attempt_no       int  not null,
  score            numeric(4,2) not null,
  time_on_task_sec int,
  started_at       timestamptz,
  submitted_at     timestamptz default now()
);

create table if not exists quiz_answers (
  attempt_id      bigint references quiz_attempts(attempt_id) on delete cascade,
  question_id     text references questions(question_id),
  chosen_option   text,
  is_correct      boolean not null,
  error_code      text references error_dictionary(error_code),
  answer_time_sec int,
  primary key (attempt_id, question_id)
);

create table if not exists mastery_states (
  student_id    text references students(student_id),
  ku_id         text references knowledge_units(ku_id),
  mastery_level int not null check (mastery_level between 0 and 3),
  updated_at    timestamptz not null default now(),
  evidence      jsonb,
  primary key (student_id, ku_id)
);

create table if not exists recommendations (
  rec_id              bigserial primary key,
  student_id          text references students(student_id),
  ku_id               text references knowledge_units(ku_id),
  trigger_rule        text not null,
  diagnosis           text,
  action              text,
  recommended_content text references contents(content_id),
  created_at          timestamptz not null default now(),
  accepted            boolean,
  pre_score           numeric(4,2),
  post_score          numeric(4,2)
);
create index if not exists idx_rec_student on recommendations(student_id, created_at desc);

-- Khoá quyền làm lại sau khi quy tắc R04 kích hoạt
create table if not exists quiz_locks (
  student_id text references students(student_id),
  ku_id      text references knowledge_units(ku_id),
  locked_until timestamptz not null,
  primary key (student_id, ku_id)
);

-- ---------------------------------------------------------- hàm tiện dụng

create or replace function public.my_student_id() returns text
language sql stable security definer set search_path = public as $$
  select student_id from profiles where id = auth.uid()
$$;

create or replace function public.is_teacher() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select role = 'giao-vien' from profiles where id = auth.uid()), false)
$$;

create or replace function public.teaches_student(p_student text) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from students s
    join classes c on c.class_id = s.class_id
    where s.student_id = p_student and c.teacher_id = auth.uid()
  )
$$;

-- ------------------------------------------------------------------- RLS

alter table classes            enable row level security;
alter table students           enable row level security;
alter table profiles           enable row level security;
alter table knowledge_units    enable row level security;
alter table contents           enable row level security;
alter table error_dictionary   enable row level security;
alter table questions          enable row level security;
alter table question_options   enable row level security;
alter table distractor_errors  enable row level security;
alter table learning_events    enable row level security;
alter table quiz_attempts      enable row level security;
alter table quiz_answers       enable row level security;
alter table mastery_states     enable row level security;
alter table recommendations    enable row level security;
alter table quiz_locks         enable row level security;

-- Nội dung học tập: ai đăng nhập cũng đọc được
drop policy if exists "doc noi dung" on knowledge_units;
create policy "doc noi dung" on knowledge_units for select to authenticated using (true);
drop policy if exists "doc hoc lieu" on contents;
create policy "doc hoc lieu"  on contents        for select to authenticated using (true);
drop policy if exists "doc phuong an" on question_options;
create policy "doc phuong an" on question_options for select to authenticated using (true);

-- Đề bài: học sinh đọc được đề, nhưng cột correct_option thì KHÔNG.
-- Vì Postgres RLS không lọc theo cột, ứng dụng chỉ truy vấn qua view dưới đây.
drop policy if exists "doc de bai" on questions;
create policy "doc de bai" on questions for select to authenticated using (true);

create or replace view public.questions_public
with (security_invoker = true) as
  select question_id, ku_id, level, stem, expected_time_sec from public.questions;

-- Bảng đáp án theo mã lỗi và từ điển lỗi: CHỈ giáo viên đọc.
-- Học sinh không đọc được, nên không suy ra được đáp án đúng.
drop policy if exists "gv doc ma loi" on distractor_errors;
create policy "gv doc ma loi"    on distractor_errors for select to authenticated using (is_teacher());
drop policy if exists "gv doc tu dien" on error_dictionary;
create policy "gv doc tu dien"   on error_dictionary  for select to authenticated using (is_teacher());

-- Hồ sơ và lớp
drop policy if exists "doc ho so cua minh" on profiles;
create policy "doc ho so cua minh" on profiles for select to authenticated using (id = auth.uid());
drop policy if exists "doc lop cua minh" on classes;
create policy "doc lop cua minh"   on classes  for select to authenticated
  using (teacher_id = auth.uid() or class_id = (select class_id from profiles where id = auth.uid()));
drop policy if exists "doc hs cua minh" on students;
create policy "doc hs cua minh"    on students for select to authenticated
  using (student_id = my_student_id() or teaches_student(student_id));

-- Dữ liệu học tập: học sinh đọc và ghi của chính mình; giáo viên đọc của lớp mình
drop policy if exists "hs ghi su kien" on learning_events;
create policy "hs ghi su kien" on learning_events for insert to authenticated
  with check (student_id = my_student_id());
drop policy if exists "doc su kien" on learning_events;
create policy "doc su kien"    on learning_events for select to authenticated
  using (student_id = my_student_id() or teaches_student(student_id));

drop policy if exists "doc luot lam" on quiz_attempts;
create policy "doc luot lam"   on quiz_attempts for select to authenticated
  using (student_id = my_student_id() or teaches_student(student_id));
drop policy if exists "doc cau tra loi" on quiz_answers;
create policy "doc cau tra loi" on quiz_answers for select to authenticated
  using (exists (select 1 from quiz_attempts a where a.attempt_id = quiz_answers.attempt_id
                 and (a.student_id = my_student_id() or teaches_student(a.student_id))));

drop policy if exists "doc mastery" on mastery_states;
create policy "doc mastery"    on mastery_states for select to authenticated
  using (student_id = my_student_id() or teaches_student(student_id));
drop policy if exists "doc goi y" on recommendations;
create policy "doc goi y"      on recommendations for select to authenticated
  using (student_id = my_student_id() or teaches_student(student_id));
drop policy if exists "hs cap nhat goi y" on recommendations;
create policy "hs cap nhat goi y" on recommendations for update to authenticated
  using (student_id = my_student_id()) with check (student_id = my_student_id());
drop policy if exists "doc khoa lam lai" on quiz_locks;
create policy "doc khoa lam lai" on quiz_locks for select to authenticated
  using (student_id = my_student_id() or teaches_student(student_id));

-- Ghi kết quả chấm bài (quiz_attempts, quiz_answers, mastery_states, recommendations,
-- quiz_locks) chỉ thực hiện ở phía máy chủ bằng service role key — service role bỏ qua
-- RLS, nên KHÔNG tạo policy insert/update cho các bảng đó ở phía người dùng.
