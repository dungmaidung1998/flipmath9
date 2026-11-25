-- ===========================================================================
-- FLIPMATH9 · KHỞI TẠO CƠ SỞ DỮ LIỆU MỚI (MỘT LẦN, trên dự án Supabase MỚI) — xem HUONG-DAN-SUPABASE.md
-- Gộp theo đúng thứ tự: 01-schema.sql 02-seed.sql 03-pha-sau-gio-hoc.sql 04-gamification-va-do-luong.sql 05-goi-y-theo-tang.sql 06-do-trung-thuc.sql 07-noi-dung-chuong-1.sql 08-vi-bai-hoc.sql 09-cau-hoi-muc-4.sql 10-gan-link-video.sql 13-go-bo-muc-ngoai-chuong-1.sql 15-view-tong-hop-va-lich-su.sql 16-quan-ly-noi-dung.sql 17-hoan-thanh-hoc-tap.sql 18-danh-gia-va-mastery.sql 20-va-lo-hong-phan-quyen.sql 21-cau-muc-4-bo-sung-KHUNG.sql 23-alre-recovery-schema.sql 26-phan-hoi-goi-y.sql 27-recovery-workflow.sql 28-support-pilot.sql 30-nhat-ky-nghien-cuu.sql 31-tu-kiem-tra-he-thong.sql 32-vai-tro-nckh-gui-phan-hoi.sql 35-mathmind.sql 39-xoa-noi-dung-toan-7.sql  41-man-chinh-giao-vien.sql
-- Nội dung Toán 9 KHÔNG nằm trong tệp này: chạy tiếp 40a-noi-dung-toan-9-tap-1.sql rồi 40b-noi-dung-toan-9-tap-2.sql.
-- Sinh tự động — muốn sửa thì sửa từng tệp gốc rồi gộp lại.
-- ===========================================================================

-- >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> 01-schema.sql
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

-- >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> 02-seed.sql
-- ===========================================================================
-- DỮ LIỆU KHỞI TẠO — chạy SAU 01-schema.sql
--
-- Tệp này CỐ TÌNH KHÔNG còn chứa bài học nào nữa.
--
-- Nội dung học thật nằm ở 07-noi-dung-chuong-1.sql: 14 đơn vị kiến thức cắt
-- theo từng mục của Chương I, 23 mã lỗi, 70 câu hỏi chẩn đoán và 69 gợi ý theo
-- tầng — tất cả sinh tự động từ dfle-engine/src/chuong1.js nên luôn khớp với bộ
-- kiểm tra ở test/chuong1.test.js.
--
-- Trước đây tệp này gieo sẵn sáu đơn vị kiến thức mẫu (tỉ lệ thức, đại lượng tỉ
-- lệ). Chúng đã được bỏ đi để tránh trường hợp học sinh mở ứng dụng ra và thấy
-- lẫn lộn bài của Chương I với bài của chương khác. Tệp 07 có sẵn phần dọn dẹp
-- an toàn cho các cơ sở dữ liệu đã trót nạp bản cũ.
-- ===========================================================================

-- ------------------------------------------------------------ lớp học mẫu
-- Sau khi tạo tài khoản giáo viên trong Supabase → Authentication → Users
-- (nhớ tích "Auto Confirm User"), thay <UUID-GIAO-VIEN> bằng id của tài khoản
-- đó rồi chạy đoạn dưới.
--
-- insert into classes (class_id, class_code, grade, arm, teacher_id)
--   values ('7A1', '7A1', 7, 'TN', '<UUID-GIAO-VIEN>')
--   on conflict (class_id) do update set teacher_id = excluded.teacher_id;
-- insert into profiles (id, role, class_id, full_name)
--   values ('<UUID-GIAO-VIEN>', 'giao-vien', '7A1', 'Giáo viên chủ nhiệm')
--   on conflict (id) do update set role = excluded.role, class_id = excluded.class_id;
--
-- Học sinh được tạo bằng trang /gv/hoc-sinh trong ứng dụng, không tạo tay ở đây.
-- Và không tạo tài khoản học sinh thật trước khi Hội đồng thẩm định duyệt Phiếu 4.

-- >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> 03-pha-sau-gio-hoc.sql
-- ===========================================================================
-- BỔ SUNG CHO PHA SAU GIỜ HỌC — chạy sau 01-schema.sql và 02-seed.sql
--
-- Mục đích: phân biệt bài kiểm tra CHUẨN BỊ (trước giờ học) với bài VẬN DỤNG
-- (sau giờ học). Nhờ đó:
--   * quy tắc R02 mới hoạt động được (thuộc quy tắc nhưng chưa vận dụng được)
--   * cột post_score trong bảng recommendations mới có số để điền
--   * phép thử T6 — "gợi ý có tác dụng hay không" — mới kiểm chứng được
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- KIỂM TRA ĐIỀU KIỆN TRƯỚC
-- Khối này không sửa gì cả. Nó chỉ dừng lại với một câu tiếng Việt đọc được nếu
-- tệp này được chạy trước tệp mà nó phụ thuộc vào — thay cho thông báo kiểu
-- `relation "..." does not exist` không nói cho ai biết phải làm gì.
-- ---------------------------------------------------------------------------
do $$
begin
  if to_regclass('public.knowledge_units') is null then
    raise exception E'\n\n>>> DỪNG LẠI: Phải chạy 01-schema.sql TRƯỚC tệp này. Cơ sở dữ liệu chưa có bảng nền nào. <<<\n';
  end if;
end $$;


alter table quiz_attempts
  add column if not exists kind text not null default 'chuan-bi'
  check (kind in ('chuan-bi', 'van-dung'));

create index if not exists idx_attempts_kind on quiz_attempts(student_id, ku_id, kind);

-- Truy vấn kiểm chứng hiệu quả từng quy tắc (phép thử T6).
-- Chạy sau khi đã có dữ liệu để trả lời: quy tắc nào thực sự giúp học sinh tiến bộ?
--
-- select trigger_rule,
--        count(*)                                       as so_luot_goi_y,
--        count(post_score)                              as so_luot_da_lam_lai,
--        round(avg(post_score - pre_score)::numeric, 2) as muc_tang_trung_binh
-- from recommendations
-- where post_score is not null
-- group by trigger_rule
-- order by muc_tang_trung_binh desc;

-- >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> 04-gamification-va-do-luong.sql
-- ===========================================================================
-- GAMIFICATION VÀ CÁC LẦN ĐO — chạy sau 03-pha-sau-gio-hoc.sql
--
-- Hai phần độc lập nhau:
--   A. Điểm kinh nghiệm, chuỗi ngày học, huy hiệu (thưởng HÀNH VI, không thưởng điểm)
--   B. Bảng đo lường ba đợt pre / post / followup + phân quyền cho bảng này
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- KIỂM TRA ĐIỀU KIỆN TRƯỚC
-- Khối này không sửa gì cả. Nó chỉ dừng lại với một câu tiếng Việt đọc được nếu
-- tệp này được chạy trước tệp mà nó phụ thuộc vào — thay cho thông báo kiểu
-- `relation "..." does not exist` không nói cho ai biết phải làm gì.
-- ---------------------------------------------------------------------------
do $$
begin
  if to_regclass('public.knowledge_units') is null then
    raise exception E'\n\n>>> DỪNG LẠI: Phải chạy 01-schema.sql TRƯỚC tệp này. Cơ sở dữ liệu chưa có bảng nền nào. <<<\n';
  end if;
end $$;


-- ------------------------------------------------------------ A. Gamification

create table if not exists student_xp (
  student_id      text primary key references students(student_id) on delete cascade,
  xp              int  not null default 0,
  streak_days     int  not null default 0,
  last_active_day date,
  updated_at      timestamptz not null default now()
);

create table if not exists xp_log (
  log_id     bigserial primary key,
  student_id text references students(student_id) on delete cascade,
  ly_do      text not null,
  diem       int  not null,
  ku_id      text references knowledge_units(ku_id),
  created_at timestamptz not null default now()
);
create index if not exists idx_xp_log_student on xp_log(student_id, created_at desc);

create table if not exists student_badges (
  student_id text references students(student_id) on delete cascade,
  badge_code text not null,
  earned_at  timestamptz not null default now(),
  primary key (student_id, badge_code)
);

alter table student_xp     enable row level security;
alter table xp_log         enable row level security;
alter table student_badges enable row level security;

drop policy if exists "doc xp" on student_xp;
create policy "doc xp" on student_xp for select to authenticated
  using (student_id = my_student_id() or teaches_student(student_id));

drop policy if exists "doc nhat ky xp" on xp_log;
create policy "doc nhat ky xp" on xp_log for select to authenticated
  using (student_id = my_student_id() or teaches_student(student_id));

drop policy if exists "doc huy hieu" on student_badges;
create policy "doc huy hieu" on student_badges for select to authenticated
  using (student_id = my_student_id() or teaches_student(student_id));

-- Ghi điểm và huy hiệu chỉ thực hiện ở phía máy chủ bằng service role — không tạo
-- policy insert/update cho người dùng, để học sinh không tự cộng điểm cho mình.

-- KHÔNG có bảng xếp hạng công khai: học sinh chỉ đọc được dòng của chính mình.
-- Đây là quyết định về đạo đức nghiên cứu, không phải thiếu tính năng.

-- --------------------------------------------------- B. Các lần đo nghiên cứu

-- Bảng ba đợt đo. Bốn cột M1, M2, M3, Y đến từ bảng hỏi và bài kiểm tra Toán
-- trên giấy — hệ thống không sinh ra được, giáo viên nhập ở trang /gv/do-luong.
-- Khoá chính (student_id, wave) để dán lại cùng một đợt thì GHI ĐÈ chứ không
-- tạo dòng trùng: nhập liệu tay thì kiểu gì cũng có lần phải nhập lại.
create table if not exists measurements (
  student_id text references students(student_id) on delete cascade,
  wave       text not null check (wave in ('pre', 'post', 'followup')),
  m1_digital numeric(4,2),   -- năng lực số, trung bình thang 1–5
  m2_active  numeric(4,2),   -- học tập chủ động
  m3_srl     numeric(4,2),   -- tự điều chỉnh học tập
  y_math     numeric(4,2),   -- điểm bài kiểm tra Toán, thang 10
  recorded_at timestamptz not null default now(),
  primary key (student_id, wave)
);

alter table measurements enable row level security;

drop policy if exists "doc do luong" on measurements;
create policy "doc do luong" on measurements for select to authenticated
  using (student_id = my_student_id() or teaches_student(student_id));

-- Ghi số liệu đo do giáo viên nhập qua trang /gv/do-luong, chạy bằng service role.

create index if not exists idx_measurements_wave on measurements(wave);

-- Truy vấn nhanh: đã nhập đủ ba đợt chưa?
--
-- select wave, count(*) from measurements group by wave order by wave;

-- >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> 05-goi-y-theo-tang.sql
-- ===========================================================================
-- TRỢ GIẢNG: GỢI Ý THEO TẦNG — chạy sau 04-gamification-va-do-luong.sql
--
-- Gợi ý neo vào MÃ LỖI, không neo vào câu hỏi, nên dùng lại được cho mọi câu
-- cùng một quan niệm sai. Ba tầng, không có tầng thứ tư chứa lời giải.
--
-- Bảng này CHỈ giáo viên đọc trực tiếp. Học sinh nhận gợi ý qua API, và chỉ
-- nhận được gợi ý của đúng mã lỗi mà chính em đó vừa mắc — không liệt kê được
-- toàn bộ bảng để suy ra đáp án.
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- KIỂM TRA ĐIỀU KIỆN TRƯỚC
-- Khối này không sửa gì cả. Nó chỉ dừng lại với một câu tiếng Việt đọc được nếu
-- tệp này được chạy trước tệp mà nó phụ thuộc vào — thay cho thông báo kiểu
-- `relation "..." does not exist` không nói cho ai biết phải làm gì.
-- ---------------------------------------------------------------------------
do $$
begin
  if to_regclass('public.knowledge_units') is null then
    raise exception E'\n\n>>> DỪNG LẠI: Phải chạy 01-schema.sql TRƯỚC tệp này. Cơ sở dữ liệu chưa có bảng nền nào. <<<\n';
  end if;
end $$;


create table if not exists error_hints (
  error_code text references error_dictionary(error_code) on delete cascade,
  tier       int  not null check (tier between 1 and 3),
  hint_text  text not null,
  primary key (error_code, tier)
);

alter table error_hints enable row level security;

drop policy if exists "gv doc goi y" on error_hints;
create policy "gv doc goi y" on error_hints for select to authenticated using (is_teacher());

-- Nhật ký mở gợi ý — vừa để chống lạm dụng, vừa là dữ liệu nghiên cứu:
-- ĐỘ SÂU gợi ý học sinh cần dùng là một tín hiệu đo được.
create table if not exists hint_requests (
  req_id      bigserial primary key,
  student_id  text references students(student_id) on delete cascade,
  question_id text references questions(question_id),
  error_code  text references error_dictionary(error_code),
  tier        int not null check (tier between 1 and 3),
  created_at  timestamptz not null default now()
);
create index if not exists idx_hint_student on hint_requests(student_id, created_at desc);

alter table hint_requests enable row level security;
drop policy if exists "doc nhat ky goi y" on hint_requests;
create policy "doc nhat ky goi y" on hint_requests for select to authenticated
  using (student_id = my_student_id() or teaches_student(student_id));

-- ------------------------------------------------------- nội dung ba tầng
--
-- Nội dung gợi ý KHÔNG nằm ở đây nữa. Toàn bộ 23 mã lỗi × 3 tầng của Chương I
-- được nạp ở 07-noi-dung-chuong-1.sql, sinh tự động từ dfle-engine/src/chuong1.js
-- cùng một lượt với từ điển mã lỗi.
--
-- Lý do tách ra: gợi ý phải trỏ tới một mã lỗi có thật trong error_dictionary.
-- Để ở đây thì tệp 05 luôn chạy TRƯỚC tệp nạp từ điển, và mọi lần cài mới đều
-- dừng lại ở lỗi khoá ngoại.

-- >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> 06-do-trung-thuc.sql
-- ===========================================================================
-- ĐỘ TRUNG THỰC TRIỂN KHAI — chạy sau 05-goi-y-theo-tang.sql
--
-- Bản thiết kế nghiên cứu ghi: "chỉ đưa vào phân tích chính những lớp đạt độ
-- trung thực triển khai từ 80% trở lên". Trước tệp này, câu đó không có gì đo.
--
-- Điểm thiết kế quan trọng nhất ở đây là MẪU SỐ.
-- Nếu lấy số tiết đã ghi nhật ký làm mẫu số thì mọi giáo viên đều đạt 100% —
-- chỉ cần không ghi nhật ký những tiết dạy trượt quy trình. Vì vậy mẫu số phải
-- là SỐ TIẾT ĐÃ ĐĂNG KÝ TỪ TRƯỚC trong bảng week_plan, khai báo đầu tuần, còn
-- nhật ký chỉ đóng góp tử số.
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- KIỂM TRA ĐIỀU KIỆN TRƯỚC
-- Khối này không sửa gì cả. Nó chỉ dừng lại với một câu tiếng Việt đọc được nếu
-- tệp này được chạy trước tệp mà nó phụ thuộc vào — thay cho thông báo kiểu
-- `relation "..." does not exist` không nói cho ai biết phải làm gì.
-- ---------------------------------------------------------------------------
do $$
begin
  if to_regclass('public.knowledge_units') is null then
    raise exception E'\n\n>>> DỪNG LẠI: Phải chạy 01-schema.sql TRƯỚC tệp này. Cơ sở dữ liệu chưa có bảng nền nào. <<<\n';
  end if;
end $$;


-- ------------------------------------------------- hàm tiện dụng cho bảng lớp

create or replace function public.teaches_class(p_class text) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from classes c where c.class_id = p_class and c.teacher_id = auth.uid()
  )
$$;

-- ------------------------------------------------------- A. Kế hoạch từng tuần

create table if not exists week_plan (
  class_id         text references classes(class_id) on delete cascade,
  tuan             int  not null check (tuan between 1 and 40),
  so_tiet_ke_hoach int  not null check (so_tiet_ke_hoach between 0 and 10),
  ghi_chu          text,
  created_at       timestamptz not null default now(),
  primary key (class_id, tuan)
);

alter table week_plan enable row level security;

drop policy if exists "gv doc ke hoach tuan" on week_plan;
create policy "gv doc ke hoach tuan" on week_plan for select to authenticated
  using (teaches_class(class_id));

drop policy if exists "gv ghi ke hoach tuan" on week_plan;
create policy "gv ghi ke hoach tuan" on week_plan for insert to authenticated
  with check (teaches_class(class_id));

drop policy if exists "gv sua ke hoach tuan" on week_plan;
create policy "gv sua ke hoach tuan" on week_plan for update to authenticated
  using (teaches_class(class_id)) with check (teaches_class(class_id));

-- ------------------------------------------------------ B. Nhật ký từng tiết

-- Ba pha ghi riêng ba cột chứ không gộp thành một ô "đã dạy đủ ba pha". Gộp lại
-- thì khi độ trung thực tụt xuống, không ai biết pha nào bị bỏ.
create table if not exists lesson_log (
  log_id                    bigserial primary key,
  class_id                  text references classes(class_id) on delete cascade,
  ku_id                     text references knowledge_units(ku_id),
  tuan                      int  not null check (tuan between 1 and 40),
  ngay_day                  date not null,
  gio_bat_dau               time,                       -- để đối chiếu "mở báo cáo TRƯỚC giờ"
  pha_truoc_gio             boolean not null default false,
  pha_tren_lop              boolean not null default false,
  pha_sau_gio               boolean not null default false,
  da_chia_nhom_theo_du_lieu boolean not null default false,
  so_hs_co_mat              int,
  ghi_chu                   text,
  created_at                timestamptz not null default now(),
  unique (class_id, ku_id, ngay_day)
);
create index if not exists idx_lesson_log_tuan on lesson_log(class_id, tuan);

alter table lesson_log enable row level security;

drop policy if exists "gv doc nhat ky tiet" on lesson_log;
create policy "gv doc nhat ky tiet" on lesson_log for select to authenticated
  using (teaches_class(class_id));

drop policy if exists "gv ghi nhat ky tiet" on lesson_log;
create policy "gv ghi nhat ky tiet" on lesson_log for insert to authenticated
  with check (teaches_class(class_id));

drop policy if exists "gv sua nhat ky tiet" on lesson_log;
create policy "gv sua nhat ky tiet" on lesson_log for update to authenticated
  using (teaches_class(class_id)) with check (teaches_class(class_id));

-- ----------------------------------------- C. Bằng chứng tự động: mở báo cáo

-- Ô "đã mở báo cáo chẩn đoán trước giờ dạy" KHÔNG để giáo viên tự tích. Hệ thống
-- tự ghi mỗi lần trang /gv được mở. Tự tích thì thành phần này chỉ đo sự trung
-- thực của người điền, không đo hành vi.
create table if not exists dashboard_views (
  view_id    bigserial primary key,
  teacher_id uuid references auth.users(id) on delete cascade,
  class_id   text references classes(class_id) on delete cascade,
  ku_id      text references knowledge_units(ku_id),
  ts         timestamptz not null default now()
);
create index if not exists idx_dashboard_views on dashboard_views(class_id, ts desc);

alter table dashboard_views enable row level security;

drop policy if exists "gv doc luot mo bao cao" on dashboard_views;
create policy "gv doc luot mo bao cao" on dashboard_views for select to authenticated
  using (teaches_class(class_id));

-- Ghi bằng service role ở phía máy chủ — không mở policy insert cho người dùng,
-- để không ai tự bơm thêm lượt mở cho đẹp số liệu.

-- ------------------------------------------- D. Khung nhìn ghép sẵn cho trang

-- security_invoker: khung nhìn chạy theo quyền của người gọi, nên RLS của các
-- bảng gốc vẫn có hiệu lực — giáo viên chỉ thấy lớp của mình.
create or replace view lesson_fidelity
with (security_invoker = true) as
select
  l.log_id,
  l.class_id,
  l.ku_id,
  l.tuan,
  l.ngay_day,
  l.gio_bat_dau,
  l.pha_truoc_gio,
  l.pha_tren_lop,
  l.pha_sau_gio,
  (l.pha_truoc_gio and l.pha_tren_lop and l.pha_sau_gio) as du_ba_pha,
  l.da_chia_nhom_theo_du_lieu,
  l.so_hs_co_mat,
  l.ghi_chu,
  exists (
    select 1 from dashboard_views v
    where v.class_id = l.class_id
      and (v.ku_id is null or v.ku_id = l.ku_id)
      and v.ts < (l.ngay_day + coalesce(l.gio_bat_dau, time '23:59'))
      and v.ts > (l.ngay_day - interval '7 days')
  ) as da_mo_bao_cao_truoc_gio
from lesson_log l;

-- ------------------------------------------------------------- Kiểm tra nhanh
--
-- Độ trung thực từng tuần của một lớp, tính bằng SQL để đối chiếu với con số
-- trang web hiển thị (hai đường tính độc lập, ra lệch nhau là có lỗi):
--
-- select p.tuan,
--        p.so_tiet_ke_hoach,
--        count(f.log_id) filter (where f.du_ba_pha)                as tiet_du_ba_pha,
--        count(f.log_id) filter (where f.da_mo_bao_cao_truoc_gio)  as tiet_mo_bao_cao,
--        count(f.log_id) filter (where f.da_chia_nhom_theo_du_lieu) as tiet_chia_nhom
-- from week_plan p
-- left join lesson_fidelity f on f.class_id = p.class_id and f.tuan = p.tuan
-- where p.class_id = '7A1'
-- group by p.tuan, p.so_tiet_ke_hoach
-- order by p.tuan;

-- >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> 07-noi-dung-chuong-1.sql
-- ===========================================================================
-- NỘI DUNG CHƯƠNG I — SỐ HỮU TỈ (Toán 7, Kết nối tri thức với cuộc sống)
-- Chạy sau 06-do-trung-thuc.sql.
--
-- TỆP NÀY ĐƯỢC SINH TỰ ĐỘNG từ dfle-engine/src/chuong1.js bằng lệnh:
--     node cli/emit-chuong1.js > supabase/07-noi-dung-chuong-1.sql
-- Đừng sửa trực tiếp ở đây — sửa src/chuong1.js rồi sinh lại, nếu không lần
-- sinh sau sẽ ghi đè mất phần sửa tay.
--
-- Gồm: 14 đơn vị kiến thức (cắt theo từng mục của sách),
--      23 mã lỗi, 23 vi bài học,
--      70 câu hỏi chẩn đoán, 69 gợi ý theo tầng.
-- ===========================================================================


-- ---------------------------------------------------------------------------
-- KIỂM TRA ĐIỀU KIỆN TRƯỚC
-- Khối này không sửa gì cả. Nó chỉ dừng lại với một câu tiếng Việt đọc được nếu
-- tệp này được chạy trước tệp mà nó phụ thuộc vào — thay cho thông báo kiểu
-- `relation "..." does not exist` không nói cho ai biết phải làm gì.
-- ---------------------------------------------------------------------------
do $$
begin
  if to_regclass('public.knowledge_units') is null then
    raise exception E'\n\n>>> DỪNG LẠI: Phải chạy 01-schema.sql TRƯỚC tệp này. <<<\n';
  end if;
  if to_regclass('public.hint_requests') is null or to_regclass('public.error_hints') is null then
    raise exception E'\n\n>>> DỪNG LẠI: Phải chạy 05-goi-y-theo-tang.sql TRƯỚC tệp này. Tệp 07 nạp gợi ý ba tầng vào bảng error_hints, và bước dọn dẹp của nó phải soi bảng hint_requests để không xoá mất mã lỗi mà học sinh đã từng xin gợi ý. <<<\n';
  end if;
  if to_regclass('public.lesson_log') is null or to_regclass('public.dashboard_views') is null then
    raise exception E'\n\n>>> DỪNG LẠI: Phải chạy 06-do-trung-thuc.sql TRƯỚC tệp này. Bước dọn dẹp của tệp 07 phải soi lesson_log và dashboard_views để không xoá mất đơn vị kiến thức đã có nhật ký tiết dạy. <<<\n';
  end if;
end $$;

-- DỌN NỘI DUNG CŨ — chạy lại tệp này nhiều lần vẫn an toàn.
--
-- Nguyên tắc: chỉ xoá thứ CHƯA CÓ AI ĐỘNG TỚI. Câu hỏi đã có bài làm, đơn vị
-- kiến thức đã có mức làm chủ, mã lỗi đã xuất hiện trong bài của học sinh —
-- tất cả đều giữ nguyên, vì xoá chúng là xoá luôn dữ liệu nghiên cứu, và một
-- bộ dữ liệu thủng lỗ chỗ thì không phân tích được nữa.
--
-- Thứ tự xoá đi ngược chiều khoá ngoại: câu hỏi → mã lỗi → học liệu → đơn vị
-- kiến thức. Sai thứ tự là Postgres từ chối ngay, nên đừng đảo lại.

-- 1. Câu hỏi mức 1-3 chưa em nào làm (kể cả câu của chính Chương I, để nạp lại bản mới)
--
-- CÂU MỨC 4 ĐƯỢC GIỮ LẠI, KHÔNG XOÁ. Chúng không do tệp này sinh ra mà nằm ở
-- 09-cau-hoi-muc-4.sql. Không có điều kiện level <= 3 dưới đây thì mỗi lần chạy
-- lại tệp 07 sẽ xoá sạch câu mức 4, và mức làm chủ 3 lại thành bất khả — đúng
-- lỗi đã mất công sửa một lần rồi. Câu mức 4 của chương khác được dọn bằng
-- 13-go-bo-muc-ngoai-chuong-1.sql, nơi xoá theo đơn vị kiến thức chứ không theo mức.
delete from distractor_errors where question_id in (
  select q.question_id from questions q
  where q.level <= 3
  and not exists (select 1 from quiz_answers a where a.question_id = q.question_id));
delete from question_options where question_id in (
  select q.question_id from questions q
  where q.level <= 3
  and not exists (select 1 from quiz_answers a where a.question_id = q.question_id));
delete from questions q
  where q.level <= 3
  and not exists (select 1 from quiz_answers a where a.question_id = q.question_id);

-- 2. Mã lỗi ngoài Chương I mà chưa bài làm nào dùng
delete from error_dictionary e
  where coalesce(e.ku_id, '') not like 'C1-%'
  and not exists (select 1 from quiz_answers      a where a.error_code = e.error_code)
  and not exists (select 1 from distractor_errors d where d.error_code = e.error_code)
  and not exists (select 1 from hint_requests     h where h.error_code = e.error_code);

-- 3. Học liệu ngoài Chương I mà không còn ai trỏ tới
delete from contents c
  where coalesce(c.ku_id, '') not like 'C1-%'
  and not exists (select 1 from error_dictionary e where e.remediation_id = c.content_id)
  and not exists (select 1 from recommendations  r where r.recommended_content = c.content_id);

-- 4. Đơn vị kiến thức ngoài Chương I mà không còn gì bám vào.
--    Gỡ liên kết tiên quyết giữa các đơn vị cũ với nhau trước, nếu không thì
--    mỗi lần chạy chỉ xoá được lớp ngoài cùng của chuỗi tiên quyết và phải
--    chạy tệp này bốn năm lần mới sạch.
update knowledge_units set prerequisite_ku = null
  where ku_id not like 'C1-%' and prerequisite_ku not like 'C1-%';
delete from knowledge_units k
  where k.ku_id not like 'C1-%'
  and not exists (select 1 from contents        c where c.ku_id = k.ku_id)
  and not exists (select 1 from questions       q where q.ku_id = k.ku_id)
  and not exists (select 1 from error_dictionary e where e.ku_id = k.ku_id)
  and not exists (select 1 from mastery_states  m where m.ku_id = k.ku_id)
  and not exists (select 1 from quiz_attempts   a where a.ku_id = k.ku_id)
  and not exists (select 1 from learning_events v where v.ku_id = k.ku_id)
  and not exists (select 1 from recommendations r where r.ku_id = k.ku_id)
  and not exists (select 1 from lesson_log      l where l.ku_id = k.ku_id)
  and not exists (select 1 from dashboard_views w where w.ku_id = k.ku_id)
  and not exists (select 1 from knowledge_units x where x.prerequisite_ku = k.ku_id);

-- Cột co_video: mục luyện tập chung và ôn tập cuối chương KHÔNG có video bài
-- học mới — đó là đặc điểm của loại tiết ấy, không phải thiếu sót. Thiếu cột
-- này thì trang Học liệu báo "còn 3 mục chưa có video" mãi mãi, và một cảnh
-- báo không bao giờ tắt là một cảnh báo người ta thôi đọc.
alter table knowledge_units add column if not exists co_video boolean not null default true;

insert into knowledge_units (ku_id, lesson_id, ku_name, order_index, prerequisite_ku, co_video) values
  ('C1-B1-M1', 'Bài 1. Tập hợp các số hữu tỉ', 'Mục 1. Khái niệm số hữu tỉ', 1, null, true),
  ('C1-B1-M1B', 'Bài 1. Tập hợp các số hữu tỉ', 'Mục 1 (tiếp). Biểu diễn số hữu tỉ trên trục số', 2, 'C1-B1-M1', true),
  ('C1-B1-M2', 'Bài 1. Tập hợp các số hữu tỉ', 'Mục 2. Thứ tự trong tập hợp các số hữu tỉ', 3, 'C1-B1-M1B', true),
  ('C1-B2-M1', 'Bài 2. Cộng, trừ, nhân, chia số hữu tỉ', 'Mục 1. Cộng và trừ hai số hữu tỉ', 4, 'C1-B1-M1', true),
  ('C1-B2-M2', 'Bài 2. Cộng, trừ, nhân, chia số hữu tỉ', 'Mục 1 (tiếp). Quy tắc dấu ngoặc', 5, 'C1-B2-M1', true),
  ('C1-B2-M3', 'Bài 2. Cộng, trừ, nhân, chia số hữu tỉ', 'Mục 2. Nhân và chia hai số hữu tỉ', 6, 'C1-B1-M1', true),
  ('C1-LTC1', 'Luyện tập chung (sau Bài 2)', 'Luyện tập chung: bốn phép tính với số hữu tỉ', 7, 'C1-B2-M3', false),
  ('C1-B3-M1', 'Bài 3. Luỹ thừa với số mũ tự nhiên của một số hữu tỉ', 'Mục 1. Luỹ thừa với số mũ tự nhiên', 8, 'C1-B2-M3', true),
  ('C1-B3-M2', 'Bài 3. Luỹ thừa với số mũ tự nhiên của một số hữu tỉ', 'Mục 2. Nhân và chia hai luỹ thừa cùng cơ số', 9, 'C1-B3-M1', true),
  ('C1-B3-M3', 'Bài 3. Luỹ thừa với số mũ tự nhiên của một số hữu tỉ', 'Mục 3. Luỹ thừa của luỹ thừa', 10, 'C1-B3-M2', true),
  ('C1-B4-M1', 'Bài 4. Thứ tự thực hiện các phép tính. Quy tắc chuyển vế', 'Mục 1. Thứ tự thực hiện các phép tính', 11, 'C1-B3-M1', true),
  ('C1-B4-M2', 'Bài 4. Thứ tự thực hiện các phép tính. Quy tắc chuyển vế', 'Mục 2. Quy tắc chuyển vế', 12, 'C1-B2-M1', true),
  ('C1-LTC2', 'Luyện tập chung (sau Bài 4)', 'Luyện tập chung: luỹ thừa, thứ tự phép tính và chuyển vế', 13, 'C1-B4-M2', false),
  ('C1-CUOI', 'Bài tập cuối chương I', 'Ôn tập cuối chương I: Số hữu tỉ', 14, 'C1-LTC2', false)
on conflict (ku_id) do update set
  lesson_id = excluded.lesson_id, ku_name = excluded.ku_name,
  order_index = excluded.order_index, prerequisite_ku = excluded.prerequisite_ku,
  co_video = excluded.co_video;

-- Video bài học của từng mục. Cột url để trống — thầy cô dán link video của
-- nhà trường vào, hệ thống không tự đi tìm video trên mạng.
insert into contents (content_id, ku_id, kind, level, title, duration_sec, url) values
  ('VD-C1-B1-M1', 'C1-B1-M1', 'video', 2, 'Video bài học: Khái niệm số hữu tỉ', 480, null),
  ('HL-C1-B1-M1', 'C1-B1-M1', 'hoc-lieu', 2, 'Phiếu học tập: Khái niệm số hữu tỉ', null, null),
  ('VD-C1-B1-M1B', 'C1-B1-M1B', 'video', 2, 'Video bài học: Biểu diễn số hữu tỉ trên trục số', 480, null),
  ('HL-C1-B1-M1B', 'C1-B1-M1B', 'hoc-lieu', 2, 'Phiếu học tập: Biểu diễn số hữu tỉ trên trục số', null, null),
  ('VD-C1-B1-M2', 'C1-B1-M2', 'video', 2, 'Video bài học: Thứ tự trong tập hợp các số hữu tỉ', 480, null),
  ('HL-C1-B1-M2', 'C1-B1-M2', 'hoc-lieu', 2, 'Phiếu học tập: Thứ tự trong tập hợp các số hữu tỉ', null, null),
  ('VD-C1-B2-M1', 'C1-B2-M1', 'video', 2, 'Video bài học: Cộng và trừ hai số hữu tỉ', 480, null),
  ('HL-C1-B2-M1', 'C1-B2-M1', 'hoc-lieu', 2, 'Phiếu học tập: Cộng và trừ hai số hữu tỉ', null, null),
  ('VD-C1-B2-M2', 'C1-B2-M2', 'video', 2, 'Video bài học: Quy tắc dấu ngoặc', 480, null),
  ('HL-C1-B2-M2', 'C1-B2-M2', 'hoc-lieu', 2, 'Phiếu học tập: Quy tắc dấu ngoặc', null, null),
  ('VD-C1-B2-M3', 'C1-B2-M3', 'video', 2, 'Video bài học: Nhân và chia hai số hữu tỉ', 480, null),
  ('HL-C1-B2-M3', 'C1-B2-M3', 'hoc-lieu', 2, 'Phiếu học tập: Nhân và chia hai số hữu tỉ', null, null),
  ('HL-C1-LTC1', 'C1-LTC1', 'hoc-lieu', 2, 'Phiếu học tập: Luyện tập chung: bốn phép tính với số hữu tỉ', null, null),
  ('VD-C1-B3-M1', 'C1-B3-M1', 'video', 2, 'Video bài học: Luỹ thừa với số mũ tự nhiên', 480, null),
  ('HL-C1-B3-M1', 'C1-B3-M1', 'hoc-lieu', 2, 'Phiếu học tập: Luỹ thừa với số mũ tự nhiên', null, null),
  ('VD-C1-B3-M2', 'C1-B3-M2', 'video', 2, 'Video bài học: Nhân và chia hai luỹ thừa cùng cơ số', 480, null),
  ('HL-C1-B3-M2', 'C1-B3-M2', 'hoc-lieu', 2, 'Phiếu học tập: Nhân và chia hai luỹ thừa cùng cơ số', null, null),
  ('VD-C1-B3-M3', 'C1-B3-M3', 'video', 2, 'Video bài học: Luỹ thừa của luỹ thừa', 480, null),
  ('HL-C1-B3-M3', 'C1-B3-M3', 'hoc-lieu', 2, 'Phiếu học tập: Luỹ thừa của luỹ thừa', null, null),
  ('VD-C1-B4-M1', 'C1-B4-M1', 'video', 2, 'Video bài học: Thứ tự thực hiện các phép tính', 480, null),
  ('HL-C1-B4-M1', 'C1-B4-M1', 'hoc-lieu', 2, 'Phiếu học tập: Thứ tự thực hiện các phép tính', null, null),
  ('VD-C1-B4-M2', 'C1-B4-M2', 'video', 2, 'Video bài học: Quy tắc chuyển vế', 480, null),
  ('HL-C1-B4-M2', 'C1-B4-M2', 'hoc-lieu', 2, 'Phiếu học tập: Quy tắc chuyển vế', null, null),
  ('HL-C1-LTC2', 'C1-LTC2', 'hoc-lieu', 2, 'Phiếu học tập: Luyện tập chung: luỹ thừa, thứ tự phép tính và chuyển vế', null, null),
  ('HL-C1-CUOI', 'C1-CUOI', 'hoc-lieu', 2, 'Phiếu học tập: Ôn tập cuối chương I: Số hữu tỉ', null, null)
on conflict (content_id) do update set title = excluded.title, ku_id = excluded.ku_id;

-- Gỡ dòng video của các mục không cần video, nếu bản nạp trước đã tạo ra chúng.
-- Chỉ gỡ khi không còn thứ gì trỏ tới, đúng như mọi bước dọn dẹp khác của tệp này.
delete from contents c
  where c.kind = 'video'
  and exists (select 1 from knowledge_units k where k.ku_id = c.ku_id and not k.co_video)
  and not exists (select 1 from error_dictionary e where e.remediation_id = c.content_id)
  and not exists (select 1 from recommendations  r where r.recommended_content = c.content_id);

-- Vi bài học sửa lỗi: mỗi mã lỗi trỏ tới đúng một vi bài học dưới 8 phút.
insert into contents (content_id, ku_id, kind, level, title, duration_sec, url) values
  ('VBH-HT-01', 'C1-B1-M1', 'micro-lesson', 1, 'Vi bài học: Số nào là số hữu tỉ: đưa số nguyên và số thập phân về dạng a/b', 300, null),
  ('VBH-HT-02', 'C1-B1-M1', 'micro-lesson', 1, 'Vi bài học: Số đối và số nghịch đảo — hai thứ khác nhau', 300, null),
  ('VBH-HT-03', 'C1-B1-M1B', 'micro-lesson', 1, 'Vi bài học: Đặt số hữu tỉ âm lên trục số', 360, null),
  ('VBH-TT-01', 'C1-B1-M2', 'micro-lesson', 1, 'Vi bài học: So sánh hai số hữu tỉ âm', 360, null),
  ('VBH-TT-02', 'C1-B1-M2', 'micro-lesson', 1, 'Vi bài học: Quy đồng rồi mới so sánh', 300, null),
  ('VBH-CT-01', 'C1-B2-M1', 'micro-lesson', 1, 'Vi bài học: Vì sao không cộng được tử với tử, mẫu với mẫu', 360, null),
  ('VBH-CT-02', 'C1-B2-M1', 'micro-lesson', 1, 'Vi bài học: Quy đồng: nhân cả tử và mẫu với cùng một thừa số phụ', 300, null),
  ('VBH-CT-03', 'C1-B2-M1', 'micro-lesson', 1, 'Vi bài học: Cộng hai số hữu tỉ trái dấu', 360, null),
  ('VBH-DN-01', 'C1-B2-M2', 'micro-lesson', 1, 'Vi bài học: Bỏ dấu ngoặc có dấu trừ đằng trước', 300, null),
  ('VBH-DN-02', 'C1-B2-M2', 'micro-lesson', 1, 'Vi bài học: Đặt dấu ngoặc để nhóm số hạng', 300, null),
  ('VBH-NC-01', 'C1-B2-M3', 'micro-lesson', 1, 'Vi bài học: Chia phân số: nhân với số nghịch đảo', 300, null),
  ('VBH-NC-02', 'C1-B2-M3', 'micro-lesson', 1, 'Vi bài học: Chỉ nghịch đảo số chia, không nghịch đảo số bị chia', 240, null),
  ('VBH-NC-03', 'C1-B2-M3', 'micro-lesson', 1, 'Vi bài học: Rút gọn được và không rút gọn được', 360, null),
  ('VBH-LT-01', 'C1-B3-M1', 'micro-lesson', 1, 'Vi bài học: Dấu của luỹ thừa cơ số âm: số mũ chẵn hay lẻ', 300, null),
  ('VBH-LT-02', 'C1-B3-M1', 'micro-lesson', 1, 'Vi bài học: Phân biệt (−a)^n với −a^n', 300, null),
  ('VBH-LT-03', 'C1-B3-M1', 'micro-lesson', 1, 'Vi bài học: Luỹ thừa của một tích, của một thương', 360, null),
  ('VBH-LT-04', 'C1-B3-M2', 'micro-lesson', 1, 'Vi bài học: Nhân hai luỹ thừa cùng cơ số thì cộng số mũ', 300, null),
  ('VBH-LT-05', 'C1-B3-M2', 'micro-lesson', 1, 'Vi bài học: Chia hai luỹ thừa cùng cơ số thì trừ số mũ', 300, null),
  ('VBH-LT-06', 'C1-B3-M3', 'micro-lesson', 1, 'Vi bài học: Luỹ thừa của luỹ thừa: nhân hai số mũ', 360, null),
  ('VBH-TU-01', 'C1-B4-M1', 'micro-lesson', 1, 'Vi bài học: Thứ tự thực hiện các phép tính', 420, null),
  ('VBH-TU-02', 'C1-B4-M1', 'micro-lesson', 1, 'Vi bài học: Trong ngoặc trước, ngoài ngoặc sau', 300, null),
  ('VBH-CV-01', 'C1-B4-M2', 'micro-lesson', 1, 'Vi bài học: Chuyển vế thì phải đổi dấu', 360, null),
  ('VBH-CV-02', 'C1-B4-M2', 'micro-lesson', 1, 'Vi bài học: Số hạng thì chuyển vế, thừa số thì chia hai vế', 420, null)
on conflict (content_id) do update set title = excluded.title, ku_id = excluded.ku_id;

-- Từ điển mã lỗi. Cột misconception mô tả HỌC SINH ĐANG NGHĨ SAI ĐIỀU GÌ,
-- kèm một ví dụ bài làm sai điển hình để giáo viên nhận ra ngay khi chấm.
insert into error_dictionary (error_code, ku_id, misconception, remediation_id) values
  ('E-HT-01', 'C1-B1-M1', 'Tin rằng chỉ phân số mới là số hữu tỉ, còn số nguyên và số thập phân hữu hạn thì không. Ví dụ: Trả lời "−5 không phải số hữu tỉ" vì không thấy nó ở dạng a/b', 'VBH-HT-01'),
  ('E-HT-02', 'C1-B1-M1', 'Nhầm số đối với số nghịch đảo. Ví dụ: Cho rằng số đối của 2/3 là 3/2', 'VBH-HT-02'),
  ('E-HT-03', 'C1-B1-M1B', 'Khi biểu diễn số âm trên trục số vẫn đếm về phía phải điểm O. Ví dụ: Đặt −3/4 vào giữa O và 1', 'VBH-HT-03'),
  ('E-TT-01', 'C1-B1-M2', 'So sánh hai số âm theo giá trị tuyệt đối: số nào "lớn hơn" khi bỏ dấu thì lớn hơn. Ví dụ: Kết luận −3/4 > −1/2 vì 3/4 > 1/2', 'VBH-TT-01'),
  ('E-TT-02', 'C1-B1-M2', 'So sánh hai phân số bằng cách so tử với tử và mẫu với mẫu, không đưa về cùng mẫu. Ví dụ: Kết luận 3/7 > 2/5 vì 3 > 2 và 7 > 5', 'VBH-TT-02'),
  ('E-CT-01', 'C1-B2-M1', 'Tin rằng cộng hai phân số là cộng tử với tử và mẫu với mẫu. Ví dụ: 1/2 + 1/3 = 2/5', 'VBH-CT-01'),
  ('E-CT-02', 'C1-B2-M1', 'Quy đồng mẫu nhưng giữ nguyên tử số, quên nhân tử với cùng thừa số phụ. Ví dụ: 1/2 + 1/3 = 1/6 + 1/6', 'VBH-CT-02'),
  ('E-CT-03', 'C1-B2-M1', 'Cộng hai số trái dấu thì cộng hai giá trị tuyệt đối rồi giữ dấu của số đứng trước. Ví dụ: −0,6 + 0,25 = −0,85', 'VBH-CT-03'),
  ('E-DN-01', 'C1-B2-M2', 'Bỏ dấu ngoặc có dấu trừ đằng trước thì chỉ đổi dấu số hạng đầu tiên. Ví dụ: 5 − (2 + 3) = 5 − 2 + 3', 'VBH-DN-01'),
  ('E-DN-02', 'C1-B2-M2', 'Đặt dấu ngoặc có dấu trừ đằng trước mà không đổi dấu các số hạng đưa vào ngoặc. Ví dụ: 7 − 2 − 5 = 7 − (2 − 5)', 'VBH-DN-02'),
  ('E-NC-01', 'C1-B2-M3', 'Chia hai phân số bằng cách nhân thẳng tử với tử, mẫu với mẫu, không nghịch đảo số chia. Ví dụ: 2/3 : 4/5 = 8/15', 'VBH-NC-01'),
  ('E-NC-02', 'C1-B2-M3', 'Khi chia thì nghịch đảo cả hai phân số chứ không chỉ nghịch đảo số chia. Ví dụ: 2/3 : 4/5 = 3/2 · 5/4', 'VBH-NC-02'),
  ('E-NC-03', 'C1-B2-M3', 'Rút gọn bằng cách gạch bỏ một số hạng của tổng ở tử và ở mẫu. Ví dụ: (2 + 3)/(2 + 7) = 3/7', 'VBH-NC-03'),
  ('E-LT-01', 'C1-B3-M1', 'Tin rằng luỹ thừa cơ số âm luôn mang dấu âm, không xét số mũ chẵn hay lẻ. Ví dụ: (−2)^4 = −16', 'VBH-LT-01'),
  ('E-LT-02', 'C1-B3-M1', 'Không phân biệt (−a)^n với −a^n, coi hai cách viết là một. Ví dụ: Cho rằng (−3)^2 và −3^2 đều bằng 9', 'VBH-LT-02'),
  ('E-LT-03', 'C1-B3-M1', 'Khi nâng luỹ thừa một tích hoặc một thương thì chỉ nâng cho một thừa số. Ví dụ: (2/3)^3 = 8/3', 'VBH-LT-03'),
  ('E-LT-04', 'C1-B3-M2', 'Nhân hai luỹ thừa cùng cơ số thì nhân hai số mũ. Ví dụ: x^2 · x^3 = x^6', 'VBH-LT-04'),
  ('E-LT-05', 'C1-B3-M2', 'Chia hai luỹ thừa cùng cơ số thì chia hai số mũ. Ví dụ: x^6 : x^2 = x^3', 'VBH-LT-05'),
  ('E-LT-06', 'C1-B3-M3', 'Luỹ thừa của luỹ thừa thì cộng hai số mũ, do nhầm với quy tắc nhân. Ví dụ: (x^2)^3 = x^5', 'VBH-LT-06'),
  ('E-TU-01', 'C1-B4-M1', 'Thực hiện các phép tính lần lượt từ trái sang phải, không ưu tiên luỹ thừa rồi nhân chia. Ví dụ: 2 + 3 · 4 = 20', 'VBH-TU-01'),
  ('E-TU-02', 'C1-B4-M1', 'Trong biểu thức có ngoặc thì làm phần ngoài ngoặc trước cho gọn. Ví dụ: 10 − 2 · (3 + 1) = 8 · 4', 'VBH-TU-02'),
  ('E-CV-01', 'C1-B4-M2', 'Chuyển một số hạng sang vế kia mà giữ nguyên dấu. Ví dụ: x + 3 = 7 nên x = 7 + 3', 'VBH-CV-01'),
  ('E-CV-02', 'C1-B4-M2', 'Áp dụng quy tắc chuyển vế cho một thừa số: chuyển thừa số sang vế kia bằng cách đổi dấu. Ví dụ: 3x = 12 nên x = 12 − 3', 'VBH-CV-02')
on conflict (error_code) do update set
  ku_id = excluded.ku_id, misconception = excluded.misconception,
  remediation_id = excluded.remediation_id;

-- 70 câu hỏi chẩn đoán, 5 câu cho mỗi mục.
insert into questions (question_id, ku_id, level, stem, correct_option, expected_time_sec) values
  ('C1-B1-M1-Q01', 'C1-B1-M1', 1, 'Trong các số −5 ; 0,75 ; 0 ; 2¾ có bao nhiêu số là số hữu tỉ?', 'D', 45),
  ('C1-B1-M1-Q02', 'C1-B1-M1', 1, 'Số đối của −3/5 là số nào?', 'A', 45),
  ('C1-B1-M1-Q03', 'C1-B1-M1', 2, 'Viết số −1,2 dưới dạng a/b với a, b là số nguyên và b khác 0. Kết quả nào ĐÚNG?', 'A', 60),
  ('C1-B1-M1-Q04', 'C1-B1-M1', 2, 'Khẳng định nào sau đây là SAI?', 'B', 60),
  ('C1-B1-M1-Q05', 'C1-B1-M1', 3, 'Số đối của số đối của −7/9 là số nào?', 'A', 90),
  ('C1-B1-M1B-Q01', 'C1-B1-M1B', 1, 'Trên trục số, điểm biểu diễn một số hữu tỉ ÂM nằm ở phía nào của điểm O?', 'A', 45),
  ('C1-B1-M1B-Q02', 'C1-B1-M1B', 1, 'Để biểu diễn số 3/4 trên trục số, ta làm thế nào?', 'A', 45),
  ('C1-B1-M1B-Q03', 'C1-B1-M1B', 2, 'Điểm M trên trục số biểu diễn số −3/4. Điểm M nằm ở vị trí nào?', 'A', 60),
  ('C1-B1-M1B-Q04', 'C1-B1-M1B', 2, 'Điểm N nằm chính giữa điểm −1 và điểm 0 trên trục số. N biểu diễn số nào?', 'A', 60),
  ('C1-B1-M1B-Q05', 'C1-B1-M1B', 3, 'Trên trục số, điểm A biểu diễn số −5/4. Điểm A nằm giữa hai số nguyên nào?', 'A', 90),
  ('C1-B1-M2-Q01', 'C1-B1-M2', 1, 'So sánh hai số −3/4 và −1/2.', 'A', 45),
  ('C1-B1-M2-Q02', 'C1-B1-M2', 2, 'So sánh hai số 3/7 và 2/5.', 'A', 60),
  ('C1-B1-M2-Q03', 'C1-B1-M2', 2, 'Sắp xếp các số −1/2 ; 0 ; −3/4 ; 1/4 theo thứ tự tăng dần.', 'A', 75),
  ('C1-B1-M2-Q04', 'C1-B1-M2', 2, 'Trên trục số, điểm biểu diễn số hữu tỉ a nằm bên trái điểm biểu diễn số hữu tỉ b. Khẳng định nào đúng?', 'A', 60),
  ('C1-B1-M2-Q05', 'C1-B1-M2', 3, 'Tìm số nguyên x sao cho −5/3 < x < −1/3.', 'A', 90),
  ('C1-B2-M1-Q01', 'C1-B2-M1', 1, 'Tính 1/2 + 1/3.', 'A', 45),
  ('C1-B2-M1-Q02', 'C1-B2-M1', 2, 'Tính −0,6 + 0,25.', 'A', 60),
  ('C1-B2-M1-Q03', 'C1-B2-M1', 2, 'Tính 3/4 − 5/6.', 'A', 60),
  ('C1-B2-M1-Q04', 'C1-B2-M1', 2, 'Tính hợp lí: 5/9 + 3/7 + 4/9.', 'A', 75),
  ('C1-B2-M1-Q05', 'C1-B2-M1', 3, 'Một chai đang có 3/5 lít nước. Rót thêm 0,25 lít nữa. Hỏi trong chai có bao nhiêu lít nước?', 'A', 90),
  ('C1-B2-M2-Q01', 'C1-B2-M2', 1, 'Bỏ dấu ngoặc trong biểu thức 5 − (2 + 3) ta được biểu thức nào?', 'A', 45),
  ('C1-B2-M2-Q02', 'C1-B2-M2', 2, 'Tính 7/8 − (3/8 + 1/4).', 'A', 60),
  ('C1-B2-M2-Q03', 'C1-B2-M2', 2, 'Đẳng thức nào sau đây là ĐÚNG?', 'A', 60),
  ('C1-B2-M2-Q04', 'C1-B2-M2', 2, 'Tính hợp lí: (−1/3 + 2/5) − (2/5 − 4/3).', 'A', 75),
  ('C1-B2-M2-Q05', 'C1-B2-M2', 3, 'Cho x = 3/4. Tính giá trị của A = 1/2 − (x − 1/4).', 'A', 90),
  ('C1-B2-M3-Q01', 'C1-B2-M3', 1, 'Tính 2/3 : 4/5.', 'A', 45),
  ('C1-B2-M3-Q02', 'C1-B2-M3', 1, 'Số nghịch đảo của −2/7 là số nào?', 'A', 45),
  ('C1-B2-M3-Q03', 'C1-B2-M3', 2, 'Tính (−3/5) · 10/9.', 'A', 60),
  ('C1-B2-M3-Q04', 'C1-B2-M3', 2, 'Rút gọn phân số (2 + 3)/(2 + 7).', 'A', 60),
  ('C1-B2-M3-Q05', 'C1-B2-M3', 3, 'Tính hợp lí: 5/9 · 3/7 + 5/9 · 4/7.', 'A', 90),
  ('C1-LTC1-Q01', 'C1-LTC1', 2, 'Tính 1/2 + 1/3 · 3/4.', 'A', 75),
  ('C1-LTC1-Q02', 'C1-LTC1', 2, 'Tính (−2/3) − (1/6 − 5/6).', 'A', 75),
  ('C1-LTC1-Q03', 'C1-LTC1', 2, 'So sánh hai số −2/5 và −3/7.', 'A', 60),
  ('C1-LTC1-Q04', 'C1-LTC1', 3, 'Tìm x, biết x + 2/5 = 3/4.', 'A', 90),
  ('C1-LTC1-Q05', 'C1-LTC1', 3, 'Một mảnh vườn hình chữ nhật có chiều dài 5/2 m, chiều rộng 4/3 m. Diện tích mảnh vườn là bao nhiêu?', 'A', 120),
  ('C1-B3-M1-Q01', 'C1-B3-M1', 1, 'Tính (−2)⁴.', 'A', 45),
  ('C1-B3-M1-Q02', 'C1-B3-M1', 1, 'Giá trị của −3² là bao nhiêu?', 'A', 45),
  ('C1-B3-M1-Q03', 'C1-B3-M1', 2, 'Tính (2/3)³.', 'A', 60),
  ('C1-B3-M1-Q04', 'C1-B3-M1', 2, 'So sánh (−1/2)³ và (−1/2)².', 'A', 60),
  ('C1-B3-M1-Q05', 'C1-B3-M1', 3, 'Viết số 8/125 dưới dạng luỹ thừa của một số hữu tỉ.', 'A', 90),
  ('C1-B3-M2-Q01', 'C1-B3-M2', 1, 'Viết gọn x² · x³ thành một luỹ thừa của x.', 'A', 45),
  ('C1-B3-M2-Q02', 'C1-B3-M2', 1, 'Viết gọn x⁶ : x² (với x ≠ 0) thành một luỹ thừa của x.', 'A', 45),
  ('C1-B3-M2-Q03', 'C1-B3-M2', 2, 'Tính (1/2)³ · (1/2)².', 'A', 60),
  ('C1-B3-M2-Q04', 'C1-B3-M2', 2, 'Tính (−3)⁷ : (−3)⁵.', 'A', 60),
  ('C1-B3-M2-Q05', 'C1-B3-M2', 3, 'Tìm số tự nhiên n, biết 2ⁿ · 2³ = 2⁷.', 'A', 90),
  ('C1-B3-M3-Q01', 'C1-B3-M3', 1, 'Viết gọn (x²)³ thành một luỹ thừa của x.', 'A', 45),
  ('C1-B3-M3-Q02', 'C1-B3-M3', 2, 'Tính ((−1/2)²)³.', 'A', 60),
  ('C1-B3-M3-Q03', 'C1-B3-M3', 2, 'Khẳng định nào sau đây là SAI (với x ≠ 0)?', 'C', 60),
  ('C1-B3-M3-Q04', 'C1-B3-M3', 2, 'Viết (2³)² · 2⁴ dưới dạng một luỹ thừa của 2.', 'A', 75),
  ('C1-B3-M3-Q05', 'C1-B3-M3', 3, 'Tìm số tự nhiên n, biết (3²)ⁿ = 3⁸.', 'A', 90),
  ('C1-B4-M1-Q01', 'C1-B4-M1', 1, 'Tính 2 + 3 · 4.', 'A', 45),
  ('C1-B4-M1-Q02', 'C1-B4-M1', 2, 'Tính 10 − 2 · (3 + 1).', 'A', 60),
  ('C1-B4-M1-Q03', 'C1-B4-M1', 2, 'Tính 1/2 + 1/2 · 2².', 'A', 60),
  ('C1-B4-M1-Q04', 'C1-B4-M1', 2, 'Tính (−2)² − 3 · (1 − 5).', 'A', 75),
  ('C1-B4-M1-Q05', 'C1-B4-M1', 3, 'Tính 3/4 · (2/3 + 4/3) − 1/2.', 'A', 90),
  ('C1-B4-M2-Q01', 'C1-B4-M2', 1, 'Tìm x, biết x + 3 = 7.', 'A', 45),
  ('C1-B4-M2-Q02', 'C1-B4-M2', 1, 'Tìm x, biết x − 2/5 = 1/5.', 'A', 45),
  ('C1-B4-M2-Q03', 'C1-B4-M2', 2, 'Tìm x, biết 3x = 12.', 'A', 60),
  ('C1-B4-M2-Q04', 'C1-B4-M2', 2, 'Tìm x, biết x + 1/3 = 3/4.', 'A', 75),
  ('C1-B4-M2-Q05', 'C1-B4-M2', 3, 'Tìm x, biết 2/3 − x = 1/6.', 'A', 90),
  ('C1-LTC2-Q01', 'C1-LTC2', 2, 'Tính (1/2)² + 1/2 · 3.', 'A', 75),
  ('C1-LTC2-Q02', 'C1-LTC2', 2, 'Tìm x, biết x − (2/5 − 1/2) = 1/10.', 'A', 75),
  ('C1-LTC2-Q03', 'C1-LTC2', 2, 'Tính 2³ · 2² : 2⁴.', 'A', 75),
  ('C1-LTC2-Q04', 'C1-LTC2', 3, 'Tìm x, biết 3x + 1/2 = 2.', 'A', 90),
  ('C1-LTC2-Q05', 'C1-LTC2', 3, 'Tính giá trị của A = (−1/3)² · 9 − (1/2 − 3/2).', 'A', 120),
  ('C1-CUOI-Q01', 'C1-CUOI', 2, 'Sắp xếp các số −0,5 ; 1/4 ; −3/4 ; 0 theo thứ tự tăng dần.', 'A', 60),
  ('C1-CUOI-Q02', 'C1-CUOI', 2, 'Tính hợp lí: 7/13 · 5/9 + 7/13 · 4/9.', 'A', 75),
  ('C1-CUOI-Q03', 'C1-CUOI', 2, 'Tính (−1/2)³ : (−1/2).', 'A', 75),
  ('C1-CUOI-Q04', 'C1-CUOI', 3, 'Một cửa hàng có 3/4 tấn gạo. Buổi sáng bán được 1/3 tấn, buổi chiều bán được 1/6 tấn. Hỏi cửa hàng còn lại bao nhiêu tấn gạo?', 'A', 120),
  ('C1-CUOI-Q05', 'C1-CUOI', 3, 'Tìm x, biết (x − 1/2) · 2/3 = 1/3.', 'A', 120)
on conflict (question_id) do update set stem = excluded.stem,
  correct_option = excluded.correct_option, expected_time_sec = excluded.expected_time_sec;

insert into question_options (question_id, option_key, option_text) values
  ('C1-B1-M1-Q01', 'A', '1 số'),
  ('C1-B1-M1-Q01', 'B', '2 số'),
  ('C1-B1-M1-Q01', 'C', '3 số'),
  ('C1-B1-M1-Q01', 'D', 'Cả 4 số'),
  ('C1-B1-M1-Q02', 'A', '3/5'),
  ('C1-B1-M1-Q02', 'B', '5/3'),
  ('C1-B1-M1-Q02', 'C', '−5/3'),
  ('C1-B1-M1-Q02', 'D', '−3/5'),
  ('C1-B1-M1-Q03', 'A', '−6/5'),
  ('C1-B1-M1-Q03', 'B', '−12/100'),
  ('C1-B1-M1-Q03', 'C', '−1/2'),
  ('C1-B1-M1-Q03', 'D', 'Không viết được, vì −1,2 là số thập phân chứ không phải phân số'),
  ('C1-B1-M1-Q04', 'A', 'Mọi số nguyên đều là số hữu tỉ'),
  ('C1-B1-M1-Q04', 'B', 'Mọi số hữu tỉ đều là số nguyên'),
  ('C1-B1-M1-Q04', 'C', 'Số 0 là số hữu tỉ'),
  ('C1-B1-M1-Q04', 'D', 'Số −2,5 là số hữu tỉ'),
  ('C1-B1-M1-Q05', 'A', '−7/9'),
  ('C1-B1-M1-Q05', 'B', '7/9'),
  ('C1-B1-M1-Q05', 'C', '−9/7'),
  ('C1-B1-M1-Q05', 'D', '9/7'),
  ('C1-B1-M1B-Q01', 'A', 'Bên trái điểm O'),
  ('C1-B1-M1B-Q01', 'B', 'Bên phải điểm O'),
  ('C1-B1-M1B-Q01', 'C', 'Trùng với điểm O'),
  ('C1-B1-M1B-Q01', 'D', 'Tuỳ số, có số bên trái có số bên phải'),
  ('C1-B1-M1B-Q02', 'A', 'Chia đoạn từ 0 đến 1 thành 4 phần bằng nhau, lấy 3 phần kể từ 0'),
  ('C1-B1-M1B-Q02', 'B', 'Chia đoạn từ 0 đến 1 thành 3 phần bằng nhau, lấy 4 phần kể từ 0'),
  ('C1-B1-M1B-Q02', 'C', 'Chia đoạn từ 0 đến 4 thành 3 phần bằng nhau, lấy 1 phần kể từ 0'),
  ('C1-B1-M1B-Q02', 'D', 'Đếm 3 đơn vị kể từ 0 rồi lùi lại 4 đơn vị'),
  ('C1-B1-M1B-Q03', 'A', 'Giữa điểm −1 và điểm 0'),
  ('C1-B1-M1B-Q03', 'B', 'Giữa điểm 0 và điểm 1'),
  ('C1-B1-M1B-Q03', 'C', 'Giữa điểm −4 và điểm −3'),
  ('C1-B1-M1B-Q03', 'D', 'Trùng với điểm −3'),
  ('C1-B1-M1B-Q04', 'A', '−1/2'),
  ('C1-B1-M1B-Q04', 'B', '1/2'),
  ('C1-B1-M1B-Q04', 'C', '−2'),
  ('C1-B1-M1B-Q04', 'D', '−1,5'),
  ('C1-B1-M1B-Q05', 'A', 'Giữa −2 và −1'),
  ('C1-B1-M1B-Q05', 'B', 'Giữa −1 và 0'),
  ('C1-B1-M1B-Q05', 'C', 'Giữa 1 và 2'),
  ('C1-B1-M1B-Q05', 'D', 'Giữa 0 và 1'),
  ('C1-B1-M2-Q01', 'A', '−3/4 < −1/2'),
  ('C1-B1-M2-Q01', 'B', '−3/4 > −1/2'),
  ('C1-B1-M2-Q01', 'C', '−3/4 = −1/2'),
  ('C1-B1-M2-Q01', 'D', 'Không so sánh được vì cả hai đều âm'),
  ('C1-B1-M2-Q02', 'A', '3/7 > 2/5'),
  ('C1-B1-M2-Q02', 'B', '3/7 < 2/5'),
  ('C1-B1-M2-Q02', 'C', '3/7 = 2/5'),
  ('C1-B1-M2-Q02', 'D', 'Không so sánh được vì hai phân số khác mẫu'),
  ('C1-B1-M2-Q03', 'A', '−3/4 ; −1/2 ; 0 ; 1/4'),
  ('C1-B1-M2-Q03', 'B', '−1/2 ; −3/4 ; 0 ; 1/4'),
  ('C1-B1-M2-Q03', 'C', '0 ; 1/4 ; −1/2 ; −3/4'),
  ('C1-B1-M2-Q03', 'D', '1/4 ; 0 ; −1/2 ; −3/4'),
  ('C1-B1-M2-Q04', 'A', 'a < b'),
  ('C1-B1-M2-Q04', 'B', 'a > b'),
  ('C1-B1-M2-Q04', 'C', 'a và b luôn trái dấu'),
  ('C1-B1-M2-Q04', 'D', 'Chưa kết luận được nếu chưa biết a, b âm hay dương'),
  ('C1-B1-M2-Q05', 'A', 'x = −1'),
  ('C1-B1-M2-Q05', 'B', 'x = 0'),
  ('C1-B1-M2-Q05', 'C', 'x = −2'),
  ('C1-B1-M2-Q05', 'D', 'x = 1'),
  ('C1-B2-M1-Q01', 'A', '5/6'),
  ('C1-B2-M1-Q01', 'B', '2/5'),
  ('C1-B2-M1-Q01', 'C', '1/6'),
  ('C1-B2-M1-Q01', 'D', '2/6'),
  ('C1-B2-M1-Q02', 'A', '−0,35'),
  ('C1-B2-M1-Q02', 'B', '−0,85'),
  ('C1-B2-M1-Q02', 'C', '0,85'),
  ('C1-B2-M1-Q02', 'D', '0,35'),
  ('C1-B2-M1-Q03', 'A', '−1/12'),
  ('C1-B2-M1-Q03', 'B', '1'),
  ('C1-B2-M1-Q03', 'C', '1/12'),
  ('C1-B2-M1-Q03', 'D', '−1/2'),
  ('C1-B2-M1-Q04', 'A', '10/7'),
  ('C1-B2-M1-Q04', 'B', '12/25'),
  ('C1-B2-M1-Q04', 'C', '1'),
  ('C1-B2-M1-Q04', 'D', '3/7'),
  ('C1-B2-M1-Q05', 'A', '0,85 lít'),
  ('C1-B2-M1-Q05', 'B', '0,35 lít'),
  ('C1-B2-M1-Q05', 'C', '4/9 lít'),
  ('C1-B2-M1-Q05', 'D', '3/20 lít'),
  ('C1-B2-M2-Q01', 'A', '5 − 2 − 3'),
  ('C1-B2-M2-Q01', 'B', '5 − 2 + 3'),
  ('C1-B2-M2-Q01', 'C', '5 + 2 − 3'),
  ('C1-B2-M2-Q01', 'D', '5 + 2 + 3'),
  ('C1-B2-M2-Q02', 'A', '1/4'),
  ('C1-B2-M2-Q02', 'B', '3/4'),
  ('C1-B2-M2-Q02', 'C', '1/2'),
  ('C1-B2-M2-Q02', 'D', '9/8'),
  ('C1-B2-M2-Q03', 'A', '7 − 2 − 5 = 7 − (2 + 5)'),
  ('C1-B2-M2-Q03', 'B', '7 − 2 − 5 = 7 − (2 − 5)'),
  ('C1-B2-M2-Q03', 'C', '7 − 2 − 5 = 7 + (2 − 5)'),
  ('C1-B2-M2-Q03', 'D', '7 − 2 − 5 = 7 + (2 + 5)'),
  ('C1-B2-M2-Q04', 'A', '1'),
  ('C1-B2-M2-Q04', 'B', '−5/3'),
  ('C1-B2-M2-Q04', 'C', '−1/3'),
  ('C1-B2-M2-Q04', 'D', '1/3'),
  ('C1-B2-M2-Q05', 'A', '0'),
  ('C1-B2-M2-Q05', 'B', '−1/2'),
  ('C1-B2-M2-Q05', 'C', '1/2'),
  ('C1-B2-M2-Q05', 'D', '−1'),
  ('C1-B2-M3-Q01', 'A', '5/6'),
  ('C1-B2-M3-Q01', 'B', '8/15'),
  ('C1-B2-M3-Q01', 'C', '15/8'),
  ('C1-B2-M3-Q01', 'D', '6/5'),
  ('C1-B2-M3-Q02', 'A', '−7/2'),
  ('C1-B2-M3-Q02', 'B', '2/7'),
  ('C1-B2-M3-Q02', 'C', '7/2'),
  ('C1-B2-M3-Q02', 'D', '−2/7'),
  ('C1-B2-M3-Q03', 'A', '−2/3'),
  ('C1-B2-M3-Q03', 'B', '2/3'),
  ('C1-B2-M3-Q03', 'C', '−3/2'),
  ('C1-B2-M3-Q03', 'D', '−27/50'),
  ('C1-B2-M3-Q04', 'A', '5/9'),
  ('C1-B2-M3-Q04', 'B', '3/7'),
  ('C1-B2-M3-Q04', 'C', '1/7'),
  ('C1-B2-M3-Q04', 'D', '5/7'),
  ('C1-B2-M3-Q05', 'A', '5/9'),
  ('C1-B2-M3-Q05', 'B', '5/18'),
  ('C1-B2-M3-Q05', 'C', '10/9'),
  ('C1-B2-M3-Q05', 'D', '35/126'),
  ('C1-LTC1-Q01', 'A', '3/4'),
  ('C1-LTC1-Q01', 'B', '5/8'),
  ('C1-LTC1-Q01', 'C', '1'),
  ('C1-LTC1-Q01', 'D', '7/12'),
  ('C1-LTC1-Q02', 'A', '0'),
  ('C1-LTC1-Q02', 'B', '−5/3'),
  ('C1-LTC1-Q02', 'C', '−1/3'),
  ('C1-LTC1-Q02', 'D', '2/3'),
  ('C1-LTC1-Q03', 'A', '−2/5 > −3/7'),
  ('C1-LTC1-Q03', 'B', '−2/5 < −3/7'),
  ('C1-LTC1-Q03', 'C', '−2/5 = −3/7'),
  ('C1-LTC1-Q03', 'D', 'Không so sánh được'),
  ('C1-LTC1-Q04', 'A', '7/20'),
  ('C1-LTC1-Q04', 'B', '23/20'),
  ('C1-LTC1-Q04', 'C', '1/9'),
  ('C1-LTC1-Q04', 'D', '5/9'),
  ('C1-LTC1-Q05', 'A', '10/3 m²'),
  ('C1-LTC1-Q05', 'B', '23/6 m²'),
  ('C1-LTC1-Q05', 'C', '15/8 m²'),
  ('C1-LTC1-Q05', 'D', '8/15 m²'),
  ('C1-B3-M1-Q01', 'A', '16'),
  ('C1-B3-M1-Q01', 'B', '−16'),
  ('C1-B3-M1-Q01', 'C', '−8'),
  ('C1-B3-M1-Q01', 'D', '8'),
  ('C1-B3-M1-Q02', 'A', '−9'),
  ('C1-B3-M1-Q02', 'B', '9'),
  ('C1-B3-M1-Q02', 'C', '−6'),
  ('C1-B3-M1-Q02', 'D', '6'),
  ('C1-B3-M1-Q03', 'A', '8/27'),
  ('C1-B3-M1-Q03', 'B', '8/3'),
  ('C1-B3-M1-Q03', 'C', '2/27'),
  ('C1-B3-M1-Q03', 'D', '6/9'),
  ('C1-B3-M1-Q04', 'A', '(−1/2)³ < (−1/2)²'),
  ('C1-B3-M1-Q04', 'B', '(−1/2)³ > (−1/2)²'),
  ('C1-B3-M1-Q04', 'C', 'Hai số bằng nhau'),
  ('C1-B3-M1-Q04', 'D', 'Không so sánh được'),
  ('C1-B3-M1-Q05', 'A', '(2/5)³'),
  ('C1-B3-M1-Q05', 'B', '(2/5)²'),
  ('C1-B3-M1-Q05', 'C', '(2/125)³'),
  ('C1-B3-M1-Q05', 'D', '(4/25)³'),
  ('C1-B3-M2-Q01', 'A', 'x⁵'),
  ('C1-B3-M2-Q01', 'B', 'x⁶'),
  ('C1-B3-M2-Q01', 'C', 'x²³'),
  ('C1-B3-M2-Q01', 'D', '2x⁵'),
  ('C1-B3-M2-Q02', 'A', 'x⁴'),
  ('C1-B3-M2-Q02', 'B', 'x³'),
  ('C1-B3-M2-Q02', 'C', 'x⁸'),
  ('C1-B3-M2-Q02', 'D', 'x¹²'),
  ('C1-B3-M2-Q03', 'A', '1/32'),
  ('C1-B3-M2-Q03', 'B', '1/64'),
  ('C1-B3-M2-Q03', 'C', '1/16'),
  ('C1-B3-M2-Q03', 'D', '2/32'),
  ('C1-B3-M2-Q04', 'A', '9'),
  ('C1-B3-M2-Q04', 'B', '−9'),
  ('C1-B3-M2-Q04', 'C', '3'),
  ('C1-B3-M2-Q04', 'D', '81'),
  ('C1-B3-M2-Q05', 'A', 'n = 4'),
  ('C1-B3-M2-Q05', 'B', 'n = 10'),
  ('C1-B3-M2-Q05', 'C', 'n = 21'),
  ('C1-B3-M2-Q05', 'D', 'n = 2'),
  ('C1-B3-M3-Q01', 'A', 'x⁶'),
  ('C1-B3-M3-Q01', 'B', 'x⁵'),
  ('C1-B3-M3-Q01', 'C', 'x⁸'),
  ('C1-B3-M3-Q01', 'D', 'x⁹'),
  ('C1-B3-M3-Q02', 'A', '1/64'),
  ('C1-B3-M3-Q02', 'B', '−1/64'),
  ('C1-B3-M3-Q02', 'C', '1/32'),
  ('C1-B3-M3-Q02', 'D', '−1/32'),
  ('C1-B3-M3-Q03', 'A', '(x³)² = x⁶'),
  ('C1-B3-M3-Q03', 'B', 'x³ · x² = x⁵'),
  ('C1-B3-M3-Q03', 'C', '(x³)² = x⁵'),
  ('C1-B3-M3-Q03', 'D', 'x⁶ : x³ = x³'),
  ('C1-B3-M3-Q04', 'A', '2¹⁰'),
  ('C1-B3-M3-Q04', 'B', '2⁹'),
  ('C1-B3-M3-Q04', 'C', '2²⁴'),
  ('C1-B3-M3-Q04', 'D', '2¹⁴'),
  ('C1-B3-M3-Q05', 'A', 'n = 4'),
  ('C1-B3-M3-Q05', 'B', 'n = 6'),
  ('C1-B3-M3-Q05', 'C', 'n = 16'),
  ('C1-B3-M3-Q05', 'D', 'n = 2'),
  ('C1-B4-M1-Q01', 'A', '14'),
  ('C1-B4-M1-Q01', 'B', '20'),
  ('C1-B4-M1-Q01', 'C', '24'),
  ('C1-B4-M1-Q01', 'D', '9'),
  ('C1-B4-M1-Q02', 'A', '2'),
  ('C1-B4-M1-Q02', 'B', '32'),
  ('C1-B4-M1-Q02', 'C', '12'),
  ('C1-B4-M1-Q02', 'D', '6'),
  ('C1-B4-M1-Q03', 'A', '5/2'),
  ('C1-B4-M1-Q03', 'B', '4'),
  ('C1-B4-M1-Q03', 'C', '2'),
  ('C1-B4-M1-Q03', 'D', '9/2'),
  ('C1-B4-M1-Q04', 'A', '16'),
  ('C1-B4-M1-Q04', 'B', '−8'),
  ('C1-B4-M1-Q04', 'C', '8'),
  ('C1-B4-M1-Q04', 'D', '4'),
  ('C1-B4-M1-Q05', 'A', '1'),
  ('C1-B4-M1-Q05', 'B', '4/3'),
  ('C1-B4-M1-Q05', 'C', '3/2'),
  ('C1-B4-M1-Q05', 'D', '2'),
  ('C1-B4-M2-Q01', 'A', 'x = 4'),
  ('C1-B4-M2-Q01', 'B', 'x = 10'),
  ('C1-B4-M2-Q01', 'C', 'x = −4'),
  ('C1-B4-M2-Q01', 'D', 'x = 21'),
  ('C1-B4-M2-Q02', 'A', 'x = 3/5'),
  ('C1-B4-M2-Q02', 'B', 'x = −1/5'),
  ('C1-B4-M2-Q02', 'C', 'x = 1/5'),
  ('C1-B4-M2-Q02', 'D', 'x = 2/25'),
  ('C1-B4-M2-Q03', 'A', 'x = 4'),
  ('C1-B4-M2-Q03', 'B', 'x = 9'),
  ('C1-B4-M2-Q03', 'C', 'x = 36'),
  ('C1-B4-M2-Q03', 'D', 'x = 15'),
  ('C1-B4-M2-Q04', 'A', 'x = 5/12'),
  ('C1-B4-M2-Q04', 'B', 'x = 13/12'),
  ('C1-B4-M2-Q04', 'C', 'x = 4/7'),
  ('C1-B4-M2-Q04', 'D', 'x = 1/12'),
  ('C1-B4-M2-Q05', 'A', 'x = 1/2'),
  ('C1-B4-M2-Q05', 'B', 'x = −1/2'),
  ('C1-B4-M2-Q05', 'C', 'x = 5/6'),
  ('C1-B4-M2-Q05', 'D', 'x = 1/9'),
  ('C1-LTC2-Q01', 'A', '7/4'),
  ('C1-LTC2-Q01', 'B', '9/4'),
  ('C1-LTC2-Q01', 'C', '1'),
  ('C1-LTC2-Q01', 'D', '13/4'),
  ('C1-LTC2-Q02', 'A', 'x = 0'),
  ('C1-LTC2-Q02', 'B', 'x = 1/5'),
  ('C1-LTC2-Q02', 'C', 'x = 1/2'),
  ('C1-LTC2-Q02', 'D', 'x = −1/5'),
  ('C1-LTC2-Q03', 'A', '2'),
  ('C1-LTC2-Q03', 'B', '64'),
  ('C1-LTC2-Q03', 'C', '8'),
  ('C1-LTC2-Q03', 'D', '32'),
  ('C1-LTC2-Q04', 'A', 'x = 1/2'),
  ('C1-LTC2-Q04', 'B', 'x = 3/2'),
  ('C1-LTC2-Q04', 'C', 'x = 5/2'),
  ('C1-LTC2-Q04', 'D', 'x = 15/2'),
  ('C1-LTC2-Q05', 'A', '2'),
  ('C1-LTC2-Q05', 'B', '−1'),
  ('C1-LTC2-Q05', 'C', '−2'),
  ('C1-LTC2-Q05', 'D', '1'),
  ('C1-CUOI-Q01', 'A', '−3/4 ; −0,5 ; 0 ; 1/4'),
  ('C1-CUOI-Q01', 'B', '−0,5 ; −3/4 ; 0 ; 1/4'),
  ('C1-CUOI-Q01', 'C', '0 ; 1/4 ; −0,5 ; −3/4'),
  ('C1-CUOI-Q01', 'D', '1/4 ; 0 ; −0,5 ; −3/4'),
  ('C1-CUOI-Q02', 'A', '7/13'),
  ('C1-CUOI-Q02', 'B', '14/13'),
  ('C1-CUOI-Q02', 'C', '7/26'),
  ('C1-CUOI-Q02', 'D', '35/117'),
  ('C1-CUOI-Q03', 'A', '1/4'),
  ('C1-CUOI-Q03', 'B', '−1/4'),
  ('C1-CUOI-Q03', 'C', '−1/8'),
  ('C1-CUOI-Q03', 'D', '1/16'),
  ('C1-CUOI-Q04', 'A', '1/4 tấn'),
  ('C1-CUOI-Q04', 'B', '7/12 tấn'),
  ('C1-CUOI-Q04', 'C', '1/5 tấn'),
  ('C1-CUOI-Q04', 'D', '5/12 tấn'),
  ('C1-CUOI-Q05', 'A', 'x = 1'),
  ('C1-CUOI-Q05', 'B', 'x = 2/3'),
  ('C1-CUOI-Q05', 'C', 'x = 13/18'),
  ('C1-CUOI-Q05', 'D', 'x = 1/2')
on conflict (question_id, option_key) do update set option_text = excluded.option_text;

-- Mỗi phương án nhiễu gắn một quan niệm sai — đây là gốc của cơ chế chẩn đoán.
-- Phương án nhiễu chỉ là số sai ngẫu nhiên thì KHÔNG gắn mã, để quy tắc R03
-- không báo động sai.
insert into distractor_errors (question_id, option_key, error_code) values
  ('C1-B1-M1-Q01', 'A', 'E-HT-01'),
  ('C1-B1-M1-Q01', 'B', 'E-HT-01'),
  ('C1-B1-M1-Q01', 'C', 'E-HT-01'),
  ('C1-B1-M1-Q02', 'B', 'E-HT-02'),
  ('C1-B1-M1-Q02', 'C', 'E-HT-02'),
  ('C1-B1-M1-Q02', 'D', 'E-HT-02'),
  ('C1-B1-M1-Q03', 'D', 'E-HT-01'),
  ('C1-B1-M1-Q04', 'A', 'E-HT-01'),
  ('C1-B1-M1-Q04', 'C', 'E-HT-01'),
  ('C1-B1-M1-Q04', 'D', 'E-HT-01'),
  ('C1-B1-M1-Q05', 'B', 'E-HT-02'),
  ('C1-B1-M1-Q05', 'C', 'E-HT-02'),
  ('C1-B1-M1-Q05', 'D', 'E-HT-02'),
  ('C1-B1-M1B-Q01', 'B', 'E-HT-03'),
  ('C1-B1-M1B-Q01', 'D', 'E-HT-03'),
  ('C1-B1-M1B-Q03', 'B', 'E-HT-03'),
  ('C1-B1-M1B-Q03', 'C', 'E-HT-03'),
  ('C1-B1-M1B-Q03', 'D', 'E-HT-03'),
  ('C1-B1-M1B-Q04', 'B', 'E-HT-03'),
  ('C1-B1-M1B-Q05', 'C', 'E-HT-03'),
  ('C1-B1-M1B-Q05', 'D', 'E-HT-03'),
  ('C1-B1-M2-Q01', 'B', 'E-TT-01'),
  ('C1-B1-M2-Q01', 'C', 'E-TT-02'),
  ('C1-B1-M2-Q01', 'D', 'E-TT-02'),
  ('C1-B1-M2-Q02', 'B', 'E-TT-02'),
  ('C1-B1-M2-Q02', 'C', 'E-TT-02'),
  ('C1-B1-M2-Q02', 'D', 'E-TT-02'),
  ('C1-B1-M2-Q03', 'B', 'E-TT-01'),
  ('C1-B1-M2-Q03', 'D', 'E-TT-01'),
  ('C1-B1-M2-Q04', 'B', 'E-TT-01'),
  ('C1-B1-M2-Q04', 'C', 'E-TT-01'),
  ('C1-B1-M2-Q04', 'D', 'E-TT-01'),
  ('C1-B1-M2-Q05', 'B', 'E-TT-01'),
  ('C1-B1-M2-Q05', 'C', 'E-TT-01'),
  ('C1-B1-M2-Q05', 'D', 'E-TT-01'),
  ('C1-B2-M1-Q01', 'B', 'E-CT-01'),
  ('C1-B2-M1-Q01', 'C', 'E-CT-02'),
  ('C1-B2-M1-Q01', 'D', 'E-CT-02'),
  ('C1-B2-M1-Q02', 'B', 'E-CT-03'),
  ('C1-B2-M1-Q02', 'C', 'E-CT-03'),
  ('C1-B2-M1-Q02', 'D', 'E-CT-03'),
  ('C1-B2-M1-Q03', 'B', 'E-CT-01'),
  ('C1-B2-M1-Q03', 'C', 'E-CT-03'),
  ('C1-B2-M1-Q04', 'B', 'E-CT-01'),
  ('C1-B2-M1-Q05', 'B', 'E-CT-03'),
  ('C1-B2-M1-Q05', 'C', 'E-CT-01'),
  ('C1-B2-M2-Q01', 'B', 'E-DN-01'),
  ('C1-B2-M2-Q01', 'D', 'E-DN-01'),
  ('C1-B2-M2-Q02', 'B', 'E-DN-01'),
  ('C1-B2-M2-Q03', 'B', 'E-DN-02'),
  ('C1-B2-M2-Q03', 'C', 'E-DN-02'),
  ('C1-B2-M2-Q03', 'D', 'E-DN-02'),
  ('C1-B2-M2-Q04', 'B', 'E-DN-01'),
  ('C1-B2-M2-Q05', 'B', 'E-DN-01'),
  ('C1-B2-M3-Q01', 'B', 'E-NC-01'),
  ('C1-B2-M3-Q01', 'C', 'E-NC-02'),
  ('C1-B2-M3-Q02', 'B', 'E-HT-02'),
  ('C1-B2-M3-Q02', 'C', 'E-HT-02'),
  ('C1-B2-M3-Q02', 'D', 'E-HT-02'),
  ('C1-B2-M3-Q03', 'C', 'E-NC-02'),
  ('C1-B2-M3-Q04', 'B', 'E-NC-03'),
  ('C1-B2-M3-Q04', 'C', 'E-NC-03'),
  ('C1-B2-M3-Q04', 'D', 'E-NC-03'),
  ('C1-B2-M3-Q05', 'B', 'E-CT-01'),
  ('C1-LTC1-Q01', 'B', 'E-TU-01'),
  ('C1-LTC1-Q02', 'B', 'E-DN-01'),
  ('C1-LTC1-Q03', 'B', 'E-TT-01'),
  ('C1-LTC1-Q03', 'C', 'E-TT-02'),
  ('C1-LTC1-Q03', 'D', 'E-TT-02'),
  ('C1-LTC1-Q04', 'B', 'E-CV-01'),
  ('C1-LTC1-Q04', 'C', 'E-CT-01'),
  ('C1-LTC1-Q05', 'C', 'E-NC-02'),
  ('C1-LTC1-Q05', 'D', 'E-NC-01'),
  ('C1-B3-M1-Q01', 'B', 'E-LT-01'),
  ('C1-B3-M1-Q01', 'C', 'E-LT-01'),
  ('C1-B3-M1-Q02', 'B', 'E-LT-02'),
  ('C1-B3-M1-Q02', 'D', 'E-LT-02'),
  ('C1-B3-M1-Q03', 'B', 'E-LT-03'),
  ('C1-B3-M1-Q03', 'C', 'E-LT-03'),
  ('C1-B3-M1-Q03', 'D', 'E-LT-03'),
  ('C1-B3-M1-Q04', 'B', 'E-LT-01'),
  ('C1-B3-M1-Q04', 'C', 'E-LT-01'),
  ('C1-B3-M1-Q05', 'C', 'E-LT-03'),
  ('C1-B3-M1-Q05', 'D', 'E-LT-03'),
  ('C1-B3-M2-Q01', 'B', 'E-LT-04'),
  ('C1-B3-M2-Q02', 'B', 'E-LT-05'),
  ('C1-B3-M2-Q02', 'C', 'E-LT-04'),
  ('C1-B3-M2-Q02', 'D', 'E-LT-04'),
  ('C1-B3-M2-Q03', 'B', 'E-LT-04'),
  ('C1-B3-M2-Q04', 'B', 'E-LT-01'),
  ('C1-B3-M2-Q04', 'D', 'E-LT-04'),
  ('C1-B3-M2-Q05', 'B', 'E-CV-01'),
  ('C1-B3-M2-Q05', 'C', 'E-LT-04'),
  ('C1-B3-M3-Q01', 'B', 'E-LT-06'),
  ('C1-B3-M3-Q02', 'B', 'E-LT-01'),
  ('C1-B3-M3-Q02', 'C', 'E-LT-06'),
  ('C1-B3-M3-Q02', 'D', 'E-LT-06'),
  ('C1-B3-M3-Q03', 'A', 'E-LT-06'),
  ('C1-B3-M3-Q03', 'B', 'E-LT-04'),
  ('C1-B3-M3-Q03', 'D', 'E-LT-05'),
  ('C1-B3-M3-Q04', 'B', 'E-LT-06'),
  ('C1-B3-M3-Q04', 'C', 'E-LT-04'),
  ('C1-B3-M3-Q05', 'B', 'E-LT-06'),
  ('C1-B3-M3-Q05', 'C', 'E-LT-04'),
  ('C1-B4-M1-Q01', 'B', 'E-TU-01'),
  ('C1-B4-M1-Q01', 'C', 'E-TU-01'),
  ('C1-B4-M1-Q02', 'B', 'E-TU-02'),
  ('C1-B4-M1-Q02', 'C', 'E-TU-01'),
  ('C1-B4-M1-Q03', 'B', 'E-TU-01'),
  ('C1-B4-M1-Q04', 'B', 'E-TU-01'),
  ('C1-B4-M1-Q04', 'C', 'E-LT-01'),
  ('C1-B4-M1-Q05', 'B', 'E-TU-02'),
  ('C1-B4-M2-Q01', 'B', 'E-CV-01'),
  ('C1-B4-M2-Q01', 'C', 'E-CV-01'),
  ('C1-B4-M2-Q02', 'B', 'E-CV-01'),
  ('C1-B4-M2-Q03', 'B', 'E-CV-02'),
  ('C1-B4-M2-Q03', 'D', 'E-CV-02'),
  ('C1-B4-M2-Q04', 'B', 'E-CV-01'),
  ('C1-B4-M2-Q04', 'C', 'E-CT-01'),
  ('C1-B4-M2-Q05', 'B', 'E-CV-01'),
  ('C1-B4-M2-Q05', 'C', 'E-CV-01'),
  ('C1-LTC2-Q01', 'B', 'E-TU-01'),
  ('C1-LTC2-Q02', 'B', 'E-CV-01'),
  ('C1-LTC2-Q02', 'D', 'E-DN-01'),
  ('C1-LTC2-Q03', 'B', 'E-LT-04'),
  ('C1-LTC2-Q03', 'D', 'E-LT-05'),
  ('C1-LTC2-Q04', 'B', 'E-CV-02'),
  ('C1-LTC2-Q04', 'C', 'E-CV-01'),
  ('C1-LTC2-Q05', 'B', 'E-DN-01'),
  ('C1-LTC2-Q05', 'C', 'E-LT-01'),
  ('C1-CUOI-Q01', 'B', 'E-TT-01'),
  ('C1-CUOI-Q01', 'D', 'E-TT-01'),
  ('C1-CUOI-Q02', 'C', 'E-CT-01'),
  ('C1-CUOI-Q03', 'B', 'E-LT-01'),
  ('C1-CUOI-Q03', 'D', 'E-LT-04'),
  ('C1-CUOI-Q04', 'B', 'E-DN-01'),
  ('C1-CUOI-Q04', 'C', 'E-CT-01'),
  ('C1-CUOI-Q05', 'B', 'E-NC-01'),
  ('C1-CUOI-Q05', 'D', 'E-CV-01')
on conflict (question_id, option_key) do update set error_code = excluded.error_code;

-- Gợi ý ba tầng cho từng mã lỗi. Tầng 1 là một câu hỏi, tầng 2 nhắc quy tắc,
-- tầng 3 làm mẫu trên ví dụ khác. Không có tầng nào chứa đáp án của chính bài đó.
insert into error_hints (error_code, tier, hint_text) values
  ('E-HT-01', 1, 'Số hữu tỉ là số viết được dưới dạng a/b. Em thử viết −5 và 0,75 về dạng đó xem có viết được không?'),
  ('E-HT-01', 2, 'Số hữu tỉ là số viết được dưới dạng a/b với a, b là số nguyên và b khác 0. Mọi số nguyên n đều viết được thành n/1, mọi số thập phân hữu hạn đều viết được thành phân số.'),
  ('E-HT-01', 3, 'Ví dụ khác: 4 = 4/1 nên 4 là số hữu tỉ; 0,3 = 3/10 nên 0,3 là số hữu tỉ; −1,25 = −5/4 nên −1,25 cũng là số hữu tỉ. Bây giờ em xét lại từng số trong đề bài theo cách đó.'),
  ('E-HT-02', 1, 'Số đối và số nghịch đảo là hai thứ khác nhau. Cộng một số với số đối của nó thì được bao nhiêu?'),
  ('E-HT-02', 2, 'Số đối của x là số cộng với x cho ra 0, tức là −x — chỉ đổi dấu, giữ nguyên phân số. Số nghịch đảo là số nhân với x cho ra 1, tức là lật ngược tử và mẫu.'),
  ('E-HT-02', 3, 'Ví dụ khác: số đối của 2/7 là −2/7 vì 2/7 + (−2/7) = 0; còn số nghịch đảo của 2/7 là 7/2 vì 2/7 · 7/2 = 1. Đề bài đang hỏi loại nào, em đọc lại rồi làm.'),
  ('E-HT-03', 1, 'Trên trục số, các số âm nằm ở phía nào của điểm O?'),
  ('E-HT-03', 2, 'Số âm nằm bên TRÁI điểm O, số dương nằm bên phải. Với −3/4, em chia đoạn từ 0 đến −1 thành 4 phần bằng nhau rồi lấy 3 phần, đi về phía trái.'),
  ('E-HT-03', 3, 'Ví dụ khác: để đặt −2/5, chia đoạn từ 0 đến −1 thành 5 phần rồi lấy 2 phần về bên trái, điểm đó nằm giữa −1 và 0, gần 0 hơn. Em làm y như vậy với số trong đề.'),
  ('E-TT-01', 1, 'Trên trục số, số nào nằm bên trái thì nhỏ hơn. Em thử đặt hai số âm đó lên trục số xem số nào bên trái?'),
  ('E-TT-01', 2, 'Với hai số âm, số nào có giá trị tuyệt đối LỚN hơn thì lại NHỎ hơn, vì nó nằm xa 0 hơn về phía trái. Bỏ dấu đi rồi so sánh là làm ngược.'),
  ('E-TT-01', 3, 'Ví dụ khác: −5 và −2. Ta có 5 > 2 nhưng −5 < −2, vì −5 nằm xa 0 hơn về bên trái. Em áp dụng đúng lối nghĩ đó cho hai số trong đề.'),
  ('E-TT-02', 1, 'Hai phân số này khác mẫu. Có so sánh trực tiếp tử với tử được không?'),
  ('E-TT-02', 2, 'Muốn so sánh hai phân số thì phải đưa về cùng một mẫu dương rồi mới so tử với tử. So riêng tử với tử hoặc mẫu với mẫu là không có căn cứ.'),
  ('E-TT-02', 3, 'Ví dụ khác: so sánh 2/3 và 3/5. Quy đồng: 2/3 = 10/15 và 3/5 = 9/15, mà 10 > 9 nên 2/3 > 3/5 — dù tử 2 < 3. Em quy đồng hai phân số trong đề rồi so lại.'),
  ('E-CT-01', 1, 'Em thử vẽ hình: nửa cái bánh cộng một phần ba cái bánh thì được bao nhiêu phần bánh? Có bằng 2/5 cái bánh không?'),
  ('E-CT-01', 2, 'Cộng hai phân số thì phải quy đồng mẫu trước, rồi cộng TỬ với nhau và GIỮ NGUYÊN mẫu chung. Cộng cả tử lẫn mẫu là không đúng.'),
  ('E-CT-01', 3, 'Ví dụ khác: 1/4 + 1/2 = 1/4 + 2/4 = 3/4, chứ không phải 2/6. Em quy đồng hai phân số trong đề rồi cộng lại.'),
  ('E-CT-02', 1, 'Khi em nhân mẫu số với 3 để quy đồng, phân số có còn bằng phân số cũ nữa không nếu tử giữ nguyên?'),
  ('E-CT-02', 2, 'Quy đồng là nhân CẢ TỬ VÀ MẪU với cùng một thừa số phụ, vì chỉ khi đó phân số mới không đổi giá trị.'),
  ('E-CT-02', 3, 'Ví dụ khác: quy đồng 1/3 và 1/4 về mẫu 12: 1/3 = 4/12 (nhân cả tử và mẫu với 4), 1/4 = 3/12 (nhân cả tử và mẫu với 3). Em làm lại bước quy đồng của mình theo cách đó.'),
  ('E-CT-03', 1, 'Hai số này một âm một dương. Kết quả sẽ lớn hơn hay nhỏ hơn số âm ban đầu?'),
  ('E-CT-03', 2, 'Cộng hai số trái dấu thì lấy giá trị tuyệt đối LỚN trừ giá trị tuyệt đối NHỎ, rồi đặt dấu của số có giá trị tuyệt đối lớn hơn.'),
  ('E-CT-03', 3, 'Ví dụ khác: −0,9 + 0,4. Ta có 0,9 − 0,4 = 0,5, và số có giá trị tuyệt đối lớn hơn là −0,9 nên kết quả mang dấu âm: −0,5. Em làm lại phép tính trong đề theo đúng hai bước đó.'),
  ('E-DN-01', 1, 'Dấu trừ đằng trước ngoặc tác dụng lên MẤY số hạng trong ngoặc?'),
  ('E-DN-01', 2, 'Khi bỏ dấu ngoặc có dấu trừ đằng trước, phải đổi dấu TẤT CẢ các số hạng bên trong, không chỉ số hạng đầu tiên.'),
  ('E-DN-01', 3, 'Ví dụ khác: 10 − (4 + 3 − 1) = 10 − 4 − 3 + 1 = 4. Cả ba số hạng đều đổi dấu. Em viết lại bước bỏ ngoặc của mình cho đủ.'),
  ('E-DN-02', 1, 'Em thử tính giá trị hai vế bằng số cụ thể xem chúng có thật sự bằng nhau không?'),
  ('E-DN-02', 2, 'Khi đưa các số hạng vào trong ngoặc có dấu trừ đằng trước, phải đổi dấu tất cả các số hạng đó. Kiểm tra lại bằng cách bỏ ngoặc ra là biết ngay đúng hay sai.'),
  ('E-DN-02', 3, 'Ví dụ khác: 9 − 3 − 4 = 9 − (3 + 4) — hai số hạng 3 và 4 vốn mang dấu trừ, vào trong ngoặc thì thành dấu cộng. Em kiểm tra lại đẳng thức mình chọn theo cách đó.'),
  ('E-NC-01', 1, 'Phép chia phân số biến thành phép nhân với số nào?'),
  ('E-NC-01', 2, 'Chia cho một phân số là nhân với số nghịch đảo của phân số ĐÓ: a/b : c/d = a/b · d/c.'),
  ('E-NC-01', 3, 'Ví dụ khác: 1/2 : 3/4 = 1/2 · 4/3 = 4/6 = 2/3. Em viết lại phép chia trong đề thành phép nhân rồi tính.'),
  ('E-NC-02', 1, 'Trong phép chia, số nào là số bị chia và số nào là số chia? Số nào cần lật ngược?'),
  ('E-NC-02', 2, 'Chỉ nghịch đảo SỐ CHIA (số đứng sau dấu chia), giữ nguyên số bị chia.'),
  ('E-NC-02', 3, 'Ví dụ khác: 3/5 : 2/7 = 3/5 · 7/2 = 21/10. Phân số 3/5 giữ nguyên, chỉ 2/7 bị lật thành 7/2. Em làm lại phép tính trong đề.'),
  ('E-NC-03', 1, 'Em thử thay số vào tính giá trị của cả hai biểu thức xem chúng có bằng nhau không?'),
  ('E-NC-03', 2, 'Chỉ được rút gọn khi tử và mẫu là những TÍCH có chung thừa số. Trong một TỔNG thì không được gạch bỏ từng số hạng.'),
  ('E-NC-03', 3, 'Ví dụ khác: (2·3)/(2·7) = 3/7 vì 2 là thừa số chung — rút gọn được. Nhưng (2+3)/(2+7) = 5/9, không rút gọn được. Em xét xem biểu thức trong đề là tổng hay tích.'),
  ('E-LT-01', 1, 'Em thử viết (−2)⁴ thành tích của bốn thừa số rồi nhân từng bước xem dấu ra sao?'),
  ('E-LT-01', 2, 'Luỹ thừa của một số âm mang dấu DƯƠNG khi số mũ chẵn và dấu ÂM khi số mũ lẻ, vì cứ hai thừa số âm nhân nhau lại cho một kết quả dương.'),
  ('E-LT-01', 3, 'Ví dụ khác: (−2)³ = (−2)·(−2)·(−2) = 4·(−2) = −8 (số mũ lẻ, kết quả âm); còn (−2)² = 4 (số mũ chẵn, kết quả dương). Em xét số mũ trong đề là chẵn hay lẻ rồi kết luận.'),
  ('E-LT-02', 1, 'Trong biểu thức −3², cơ số là 3 hay là −3?'),
  ('E-LT-02', 2, 'Ở −a², phép luỹ thừa làm trước rồi mới lấy dấu trừ, nên cơ số là a. Còn (−a)² thì cả −a mới là cơ số. Dấu ngoặc là thứ phân biệt hai trường hợp.'),
  ('E-LT-02', 3, 'Ví dụ khác: −4² = −(4·4) = −16, còn (−4)² = (−4)·(−4) = 16. Em xem biểu thức trong đề có dấu ngoặc hay không rồi tính lại.'),
  ('E-LT-03', 1, 'Khi nâng một phân số lên luỹ thừa, tử và mẫu có được đối xử như nhau không?'),
  ('E-LT-03', 2, 'Công thức là (x/y)ⁿ = xⁿ/yⁿ và (x·y)ⁿ = xⁿ·yⁿ: số mũ áp cho CẢ tử và mẫu, cho cả hai thừa số.'),
  ('E-LT-03', 3, 'Ví dụ khác: (3/4)² = 3²/4² = 9/16, chứ không phải 9/4. Em áp số mũ cho cả tử và mẫu của phân số trong đề.'),
  ('E-LT-04', 1, 'Em thử viết x² · x³ ra thành tích các thừa số x rồi đếm xem có bao nhiêu chữ x?'),
  ('E-LT-04', 2, 'Nhân hai luỹ thừa cùng cơ số thì giữ nguyên cơ số và CỘNG hai số mũ: xᵐ · xⁿ = xᵐ⁺ⁿ.'),
  ('E-LT-04', 3, 'Ví dụ khác: 2² · 2³ = (2·2)·(2·2·2) = 2⁵ = 32, đúng bằng 2^(2+3). Em cộng hai số mũ trong đề rồi viết lại kết quả.'),
  ('E-LT-05', 1, 'Em thử viết x⁶ : x² ra dạng phân số rồi rút gọn bớt các thừa số x xem còn lại mấy chữ x?'),
  ('E-LT-05', 2, 'Chia hai luỹ thừa cùng cơ số thì giữ nguyên cơ số và TRỪ hai số mũ: xᵐ : xⁿ = xᵐ⁻ⁿ (x khác 0, m ≥ n).'),
  ('E-LT-05', 3, 'Ví dụ khác: 3⁵ : 3² = 3³ = 27. Kiểm tra: 243 : 9 = 27, đúng. Em trừ hai số mũ trong đề rồi viết lại kết quả.'),
  ('E-LT-06', 1, 'Trong (x²)³, luỹ thừa bậc ba nghĩa là x² được nhân với chính nó mấy lần?'),
  ('E-LT-06', 2, 'Luỹ thừa của luỹ thừa thì giữ nguyên cơ số và NHÂN hai số mũ: (xᵐ)ⁿ = xᵐ·ⁿ. Cộng số mũ là quy tắc của phép nhân hai luỹ thừa, không phải của trường hợp này.'),
  ('E-LT-06', 3, 'Ví dụ khác: (2²)³ = 2² · 2² · 2² = 2⁶ = 64. Em nhân hai số mũ trong đề rồi viết lại kết quả.'),
  ('E-TU-01', 1, 'Trong một biểu thức có cả cộng và nhân, phép nào được làm trước?'),
  ('E-TU-01', 2, 'Thứ tự là: trong ngoặc trước; rồi luỹ thừa; rồi nhân và chia; cuối cùng mới cộng và trừ. Cùng một mức thì làm từ trái sang phải.'),
  ('E-TU-01', 3, 'Ví dụ khác: 5 + 2 · 3 = 5 + 6 = 11, chứ không phải 7 · 3 = 21. Em xác định lại phép nào phải làm trước trong biểu thức của đề.'),
  ('E-TU-02', 1, 'Dấu ngoặc trong biểu thức có ý nghĩa gì về thứ tự tính?'),
  ('E-TU-02', 2, 'Phần trong ngoặc luôn được tính TRƯỚC, kể cả khi phần ngoài trông dễ tính hơn.'),
  ('E-TU-02', 3, 'Ví dụ khác: 12 − 3 · (2 + 2) = 12 − 3 · 4 = 12 − 12 = 0. Tính (2+2) trước, rồi nhân, rồi mới trừ. Em làm lại theo đúng thứ tự đó.'),
  ('E-CV-01', 1, 'Em thử thay giá trị vừa tìm được vào đẳng thức ban đầu xem hai vế có bằng nhau không?'),
  ('E-CV-01', 2, 'Khi chuyển một số hạng từ vế này sang vế kia của đẳng thức thì phải ĐỔI DẤU số hạng đó: dấu cộng thành dấu trừ và ngược lại.'),
  ('E-CV-01', 3, 'Ví dụ khác: x + 5 = 9 thì x = 9 − 5 = 4. Thử lại: 4 + 5 = 9, đúng. Em làm lại bước chuyển vế của mình rồi thử lại y như vậy.'),
  ('E-CV-02', 1, 'Trong 3x = 12, số 3 là một SỐ HẠNG được cộng vào hay là một THỪA SỐ nhân với x?'),
  ('E-CV-02', 2, 'Quy tắc chuyển vế chỉ dùng cho SỐ HẠNG (thứ được cộng hoặc trừ). Với một THỪA SỐ nhân với x thì phải CHIA cả hai vế cho thừa số đó.'),
  ('E-CV-02', 3, 'Ví dụ khác: 5x = 20 thì x = 20 : 5 = 4, chứ không phải x = 20 − 5. Còn x + 5 = 20 mới là x = 20 − 5 = 15. Em xét xem bài của mình thuộc trường hợp nào.')
on conflict (error_code, tier) do update set hint_text = excluded.hint_text;

-- ------------------------------------------------------------- kiểm tra nhanh
-- Chạy sau khi nạp xong, ba con số phải khớp với phần chú thích ở đầu tệp:
--
-- select 'đơn vị kiến thức' as bang, count(*) from knowledge_units where ku_id like 'C1-%'
-- union all select 'câu hỏi',  count(*) from questions        where question_id like 'C1-%'
-- union all select 'mã lỗi',   count(*) from error_dictionary
-- union all select 'gợi ý',    count(*) from error_hints;

-- >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> 08-vi-bai-hoc.sql
-- ===========================================================================
-- NỘI DUNG 23 VI BÀI HỌC SỬA LỖI — chạy sau 07-noi-dung-chuong-1.sql
--
-- TỆP NÀY ĐƯỢC SINH TỰ ĐỘNG từ dfle-engine/src/vi-bai-hoc.js bằng lệnh:
--     node cli/emit-vi-bai-hoc.js > supabase/08-vi-bai-hoc.sql
-- Đừng sửa trực tiếp ở đây — sửa src/vi-bai-hoc.js rồi sinh lại.
--
-- Vì sao cần tệp này: trước nó, quy tắc R03 chẩn đoán đúng rồi giao cho học
-- sinh "Vi bài học VBH-DN-01" — một cái mã, một cái tên, và không có gì bên
-- trong. Vòng lặp thích ứng dừng lại đúng ở chỗ đáng lẽ nó bắt đầu có ích.
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- KIỂM TRA ĐIỀU KIỆN TRƯỚC — xem chú thích cùng tên ở tệp 07.
-- ---------------------------------------------------------------------------
do $$
begin
  if to_regclass('public.contents') is null then
    raise exception E'\n\n>>> DỪNG LẠI: Phải chạy 01-schema.sql TRƯỚC tệp này. <<<\n';
  end if;
  if (select count(*) from error_dictionary) = 0 then
    raise exception E'\n\n>>> DỪNG LẠI: Phải chạy 07-noi-dung-chuong-1.sql TRƯỚC tệp này. Các vi bài học ở đây gắn vào mã lỗi do tệp 07 nạp; chưa có mã lỗi thì không gắn vào đâu được. <<<\n';
  end if;
end $$;


-- ------------------------------------------------------------ A. Bảng nội dung

-- Bốn phần của một vi bài học. viDu và tuLam để dạng jsonb vì số lượng ví dụ
-- có thể khác nhau giữa các bài, và giáo viên sửa được bằng trình soạn JSON
-- của Supabase mà không cần đổi cấu trúc bảng.
create table if not exists micro_lessons (
  content_id text primary key references contents(content_id) on delete cascade,
  dan        text not null,   -- vì sao em được giao bài này
  quy_tac    text not null,   -- quy tắc đúng, viết ngắn nhất có thể
  vi_du      jsonb not null,  -- [{de, giai}] — ví dụ đầu đối chiếu cách sai với cách đúng
  tu_lam     jsonb not null,  -- [{de, dapAn, giaiThich}] — câu tự kiểm
  updated_at timestamptz not null default now()
);

alter table micro_lessons enable row level security;

-- Học sinh KHÔNG đọc trực tiếp bảng này: nếu đọc được cả bảng thì đọc luôn
-- được đáp án của mọi câu tự kiểm. Nội dung đi tới học sinh qua API, và chỉ
-- đúng vi bài học mà chính em đó được giao.
drop policy if exists "gv doc vi bai hoc" on micro_lessons;
create policy "gv doc vi bai hoc" on micro_lessons for select to authenticated
  using (is_teacher());

drop policy if exists "gv sua vi bai hoc" on micro_lessons;
create policy "gv sua vi bai hoc" on micro_lessons for update to authenticated
  using (is_teacher()) with check (is_teacher());

-- ------------------------------------------- B. Nhật ký mở và hoàn thành vi bài học

-- Đây là nguồn dữ liệu cho thành phần "mức đáp ứng" của độ trung thực triển
-- khai, và cho cột post_score của phép thử T6. Trước bảng này, thành phần đó
-- không có gì để đo.
create table if not exists micro_lesson_events (
  event_id   bigserial primary key,
  student_id text references students(student_id) on delete cascade,
  content_id text references contents(content_id),
  ku_id      text references knowledge_units(ku_id),
  kind       text not null check (kind in ('mo', 'hoan-thanh')),
  so_cau_dung int,             -- chỉ có ở bản ghi hoan-thanh
  so_cau     int,
  ts         timestamptz not null default now()
);
create index if not exists idx_mle_student on micro_lesson_events(student_id, ts desc);

alter table micro_lesson_events enable row level security;
drop policy if exists "doc nhat ky vi bai hoc" on micro_lesson_events;
create policy "doc nhat ky vi bai hoc" on micro_lesson_events for select to authenticated
  using (student_id = my_student_id() or teaches_student(student_id));

-- Ghi bằng service role ở phía máy chủ — không mở policy insert cho người dùng.

-- --------------------------------------------------------------- C. Nội dung

-- 23 vi bài học, tất cả đều dưới 8 phút.
insert into micro_lessons (content_id, dan, quy_tac, vi_du, tu_lam) values
  ('VBH-HT-01', 'Em đang nghĩ chỉ có phân số mới là số hữu tỉ. Cách nghĩ này rất hay gặp, vì khi nghe "số hữu tỉ" ta liên tưởng ngay tới hình ảnh một phân số có gạch ngang.', 'Số hữu tỉ là số VIẾT ĐƯỢC dưới dạng a/b với a, b là số nguyên và b khác 0. Chữ "viết được" mới là chỗ quan trọng: số đó không cần đang ở sẵn dạng phân số.', '[{"de":"Số −5 có phải số hữu tỉ không?","giai":"Cách nghĩ sai: \"−5 không có gạch ngang nên không phải phân số, không phải số hữu tỉ.\" Cách đúng: −5 = −5/1, có a = −5 và b = 1, b khác 0. Vậy −5 LÀ số hữu tỉ. Thật ra mọi số nguyên n đều viết được thành n/1."},{"de":"Số 0,75 có phải số hữu tỉ không?","giai":"0,75 = 75/100 = 3/4. Viết được dưới dạng a/b nên 0,75 là số hữu tỉ. Mọi số thập phân HỮU HẠN đều làm được như vậy: lấy phần số bỏ dấu phẩy làm tử, mẫu là 10, 100, 1000... tuỳ số chữ số sau dấu phẩy."}]'::jsonb, '[{"de":"Số 3 có phải số hữu tỉ không? Viết nó dưới dạng a/b.","dapAn":"Có. 3 = 3/1","giaiThich":"Mọi số nguyên n đều bằng n/1 nên đều là số hữu tỉ."},{"de":"Số −1,2 có phải số hữu tỉ không? Viết nó dưới dạng a/b.","dapAn":"Có. −1,2 = −12/10 = −6/5","giaiThich":"Một chữ số sau dấu phẩy nên mẫu là 10, rồi rút gọn cho 2."}]'::jsonb),
  ('VBH-HT-02', 'Em đang nhầm SỐ ĐỐI với SỐ NGHỊCH ĐẢO. Hai khái niệm này học gần nhau, tên lại đều nghe như "số ngược lại", nên nhầm là chuyện thường.', 'Số đối của x là số CỘNG với x cho ra 0, tức là −x: chỉ đổi dấu, giữ nguyên phân số. Số nghịch đảo của x là số NHÂN với x cho ra 1, tức là 1/x: lật ngược tử và mẫu.', '[{"de":"Tìm số đối và số nghịch đảo của 2/3.","giai":"Số đối: −2/3, vì 2/3 + (−2/3) = 0. Số nghịch đảo: 3/2, vì 2/3 · 3/2 = 6/6 = 1. Cách nghĩ sai hay gặp là trả lời \"số đối của 2/3 là 3/2\" — nhưng thử cộng lại: 2/3 + 3/2 = 4/6 + 9/6 = 13/6, không phải 0."},{"de":"Tìm số đối của −3/5.","giai":"Chỉ đổi dấu, giữ nguyên phân số: số đối là 3/5. Kiểm tra bằng phép cộng: −3/5 + 3/5 = 0, đúng. Nếu trả lời −5/3 thì đó là số nghịch đảo, và cộng lại được −3/5 + (−5/3) = −9/15 − 25/15 = −34/15, khác 0."}]'::jsonb, '[{"de":"Số đối của 7/4 là số nào?","dapAn":"−7/4","giaiThich":"Đổi dấu, giữ nguyên phân số. Cộng lại được 0."},{"de":"Số nghịch đảo của −5/2 là số nào?","dapAn":"−2/5","giaiThich":"Lật tử và mẫu, giữ nguyên dấu. Nhân lại: (−5/2)·(−2/5) = 10/10 = 1."}]'::jsonb),
  ('VBH-HT-03', 'Khi đặt một số ÂM lên trục số, em vẫn đếm về phía bên phải điểm O. Trên trục số, chiều đi quyết định dấu, nên bước này sai thì mọi bài về trục số đều sai theo.', 'Số dương nằm bên PHẢI điểm O, số âm nằm bên TRÁI. Muốn đặt phân số a/b, chia đoạn đơn vị thành b phần bằng nhau rồi lấy a phần, đi về phía tương ứng với dấu.', '[{"de":"Đặt số −3/4 lên trục số.","giai":"Cách nghĩ sai: chia đoạn từ 0 đến 1 thành 4 phần, lấy 3 phần — điểm đó là 3/4, nằm bên phải O, không phải −3/4. Cách đúng: chia đoạn từ 0 đến −1 (bên TRÁI) thành 4 phần bằng nhau, lấy 3 phần. Điểm thu được nằm giữa −1 và 0, gần −1 hơn."},{"de":"Đặt số −2/5 lên trục số.","giai":"Chia đoạn từ 0 đến −1 thành 5 phần, lấy 2 phần về bên trái. Điểm này nằm giữa −1 và 0, và GẦN 0 hơn vì 2/5 nhỏ hơn một nửa."}]'::jsonb, '[{"de":"Điểm biểu diễn số −5/4 nằm giữa hai số nguyên nào?","dapAn":"Giữa −2 và −1","giaiThich":"5/4 = 1,25 nên −5/4 = −1,25, nằm bên trái −1 và bên phải −2."},{"de":"Điểm biểu diễn số −1/3 nằm giữa hai số nguyên nào?","dapAn":"Giữa −1 và 0","giaiThich":"1/3 nhỏ hơn 1 nên −1/3 chưa đi tới −1."}]'::jsonb),
  ('VBH-TT-01', 'Khi so sánh hai số ÂM, em bỏ dấu đi rồi so sánh. Cách này đúng với số dương nên rất dễ mang sang dùng cho số âm — nhưng với số âm thì nó cho kết quả ngược hoàn toàn.', 'Trên trục số, số nào nằm bên TRÁI thì NHỎ hơn. Với hai số âm: số nào có giá trị tuyệt đối LỚN hơn thì lại NHỎ hơn, vì nó nằm xa 0 hơn về phía trái.', '[{"de":"So sánh −5 và −2.","giai":"Cách nghĩ sai: 5 > 2 nên −5 > −2. Cách đúng: đặt lên trục số, −5 nằm bên trái −2, nên −5 < −2. Nghĩ theo cách khác cho dễ nhớ: nợ 5 nghìn thì tệ hơn nợ 2 nghìn, tức là ít tiền hơn."},{"de":"So sánh −3/4 và −1/2.","giai":"Quy đồng: −3/4 và −2/4. Với hai số âm, số có giá trị tuyệt đối lớn hơn thì nhỏ hơn: 3/4 > 2/4 nên −3/4 < −1/2."}]'::jsonb, '[{"de":"So sánh −7 và −9.","dapAn":"−7 > −9","giaiThich":"9 > 7 nên −9 nằm xa 0 hơn về bên trái, tức là nhỏ hơn."},{"de":"So sánh −2/3 và −1/3.","dapAn":"−2/3 < −1/3","giaiThich":"Cùng mẫu, 2 > 1 nên −2/3 nằm bên trái −1/3."}]'::jsonb),
  ('VBH-TT-02', 'Em so sánh hai phân số bằng cách so tử với tử, mẫu với mẫu. Cách này thỉnh thoảng ra kết quả đúng nên rất khó tự phát hiện là sai — nó đúng do may, không do lý.', 'Muốn so sánh hai phân số thì đưa về CÙNG MỘT MẪU DƯƠNG rồi mới so tử với tử. Cùng mẫu thì tử lớn hơn là phân số lớn hơn.', '[{"de":"So sánh 3/7 và 2/5.","giai":"Cách nghĩ sai: 3 > 2 và 7 > 5 nên... không kết luận được gì cả, vì mẫu lớn hơn lại làm phân số nhỏ đi. Cách đúng: quy đồng về mẫu 35. Ta có 3/7 = 15/35 và 2/5 = 14/35. Vì 15 > 14 nên 3/7 > 2/5."},{"de":"So sánh 2/3 và 3/5.","giai":"Quy đồng về mẫu 15: 2/3 = 10/15 và 3/5 = 9/15. Vì 10 > 9 nên 2/3 > 3/5 — dù tử số 2 nhỏ hơn 3. Đây chính là ví dụ cho thấy so tử với tử là không có căn cứ."}]'::jsonb, '[{"de":"So sánh 5/8 và 3/4.","dapAn":"5/8 < 3/4","giaiThich":"Quy đồng mẫu 8: 5/8 và 6/8. Vì 5 < 6 nên 5/8 < 3/4."},{"de":"So sánh 4/9 và 1/2.","dapAn":"4/9 < 1/2","giaiThich":"Quy đồng mẫu 18: 8/18 và 9/18. Vì 8 < 9 nên 4/9 < 1/2."}]'::jsonb),
  ('VBH-CT-01', 'Em đang cộng phân số bằng cách cộng tử với tử và mẫu với mẫu. Đây là quan niệm sai phổ biến nhất của cả chương, và nó có lý do: phép NHÂN phân số đúng là nhân tử với tử, mẫu với mẫu, nên bộ não rất tự nhiên mang quy tắc đó sang phép cộng.', 'Muốn cộng hoặc trừ hai phân số, phải QUY ĐỒNG MẪU trước. Sau khi cùng mẫu thì cộng TỬ với nhau và GIỮ NGUYÊN mẫu chung.', '[{"de":"Tính 1/2 + 1/2.","giai":"Cách nghĩ sai cho: (1+1)/(2+2) = 2/4 = 1/2. Nhưng nửa cái bánh cộng nửa cái bánh phải là CẢ cái bánh, tức là 1, chứ không phải vẫn nửa cái. Cách đúng: hai phân số đã cùng mẫu nên cộng tử, giữ mẫu: (1+1)/2 = 2/2 = 1."},{"de":"Tính 1/2 + 1/3.","giai":"Quy đồng về mẫu 6: 1/2 = 3/6 và 1/3 = 2/6. Cộng tử, giữ mẫu: (3+2)/6 = 5/6. Lưu ý 5/6 lớn hơn cả 1/2 lẫn 1/3 — hợp lý, vì cộng thêm thì phải nhiều lên. Còn cách sai cho 2/5, nhỏ hơn 1/2, vô lý ngay."}]'::jsonb, '[{"de":"Tính 1/4 + 1/2.","dapAn":"3/4","giaiThich":"Quy đồng mẫu 4: 1/4 + 2/4 = 3/4."},{"de":"Tính 2/5 + 1/3.","dapAn":"11/15","giaiThich":"Quy đồng mẫu 15: 6/15 + 5/15 = 11/15."}]'::jsonb),
  ('VBH-CT-02', 'Em có quy đồng mẫu — bước này đúng — nhưng chỉ nhân MẪU với thừa số phụ mà giữ nguyên tử. Làm vậy thì phân số đã bị đổi giá trị trước cả khi cộng.', 'Quy đồng là nhân CẢ TỬ VÀ MẪU với cùng một thừa số phụ. Chỉ khi nhân cả hai thì phân số mới giữ nguyên giá trị.', '[{"de":"Quy đồng 1/2 và 1/3 về mẫu 6.","giai":"Cách nghĩ sai: 1/2 = 1/6 và 1/3 = 1/6 (chỉ đổi mẫu). Nhưng 1/2 mà bằng 1/6 thì nửa cái bánh bằng một phần sáu cái bánh — vô lý. Cách đúng: 1/2 = (1·3)/(2·3) = 3/6 và 1/3 = (1·2)/(3·2) = 2/6."},{"de":"Quy đồng 3/4 và 5/6.","giai":"Mẫu chung nhỏ nhất là 12. Với 3/4 thừa số phụ là 3: 3/4 = 9/12. Với 5/6 thừa số phụ là 2: 5/6 = 10/12. Kiểm tra nhanh: 9/12 rút gọn cho 3 được lại 3/4, đúng."}]'::jsonb, '[{"de":"Viết 2/3 thành phân số có mẫu 12.","dapAn":"8/12","giaiThich":"Thừa số phụ là 4, nhân cả tử và mẫu: (2·4)/(3·4) = 8/12."},{"de":"Viết 3/5 thành phân số có mẫu 20.","dapAn":"12/20","giaiThich":"Thừa số phụ là 4: (3·4)/(5·4) = 12/20."}]'::jsonb),
  ('VBH-CT-03', 'Khi cộng hai số TRÁI DẤU, em cộng hai giá trị tuyệt đối rồi giữ dấu của số đứng trước. Cách này đúng cho hai số CÙNG dấu, nên mang sang dùng cho trái dấu là bước trượt rất tự nhiên.', 'Cộng hai số trái dấu: lấy giá trị tuyệt đối LỚN TRỪ giá trị tuyệt đối NHỎ, rồi đặt dấu của số có giá trị tuyệt đối LỚN hơn.', '[{"de":"Tính (−5) + 3.","giai":"Cách nghĩ sai: 5 + 3 = 8, giữ dấu số đứng trước, được −8. Nhưng nợ 5 nghìn rồi trả được 3 nghìn thì phải còn nợ ÍT hơn chứ không nhiều hơn. Cách đúng: 5 − 3 = 2; số có giá trị tuyệt đối lớn hơn là −5 nên kết quả mang dấu âm: −2."},{"de":"Tính −0,6 + 0,25.","giai":"Hai giá trị tuyệt đối là 0,6 và 0,25. Lấy 0,6 − 0,25 = 0,35. Số có giá trị tuyệt đối lớn hơn là −0,6, mang dấu âm, nên kết quả là −0,35. Thử lại bằng cảm giác: −0,6 cộng thêm một ít thì phải nhích lên gần 0 hơn, đúng là −0,35."}]'::jsonb, '[{"de":"Tính (−8) + 3.","dapAn":"−5","giaiThich":"8 − 3 = 5; số có giá trị tuyệt đối lớn hơn là −8 nên kết quả âm."},{"de":"Tính 7 + (−2,5).","dapAn":"4,5","giaiThich":"7 − 2,5 = 4,5; số có giá trị tuyệt đối lớn hơn là 7 nên kết quả dương."}]'::jsonb),
  ('VBH-DN-01', 'Khi bỏ dấu ngoặc có dấu trừ đằng trước, em chỉ đổi dấu số hạng ĐẦU TIÊN. Đây là lỗi rất khó tự phát hiện, vì kết quả trông vẫn "có vẻ hợp lý" — chỉ lệch vài đơn vị.', 'Bỏ dấu ngoặc có dấu trừ đằng trước thì phải ĐỔI DẤU TẤT CẢ các số hạng bên trong. Dấu trừ ấy tác động lên cả cụm, không phải chỉ lên số đầu.', '[{"de":"Tính 10 − (3 + 2) bằng hai cách và so sánh.","giai":"Cách 1 — tính trong ngoặc trước: 10 − 5 = 5. Cách 2 — bỏ ngoặc rồi tính. Nếu chỉ đổi dấu số đầu: 10 − 3 + 2 = 9, KHÁC 5, nên cách bỏ ngoặc đó sai. Nếu đổi dấu cả hai: 10 − 3 − 2 = 5, KHỚP. Bao giờ nghi ngờ, em cứ tính trong ngoặc trước rồi đối chiếu như vậy."},{"de":"Tính 7/8 − (3/8 + 1/4).","giai":"Trong ngoặc: 3/8 + 2/8 = 5/8. Vậy 7/8 − 5/8 = 2/8 = 1/4. Nếu bỏ ngoặc thì phải đổi dấu cả hai: 7/8 − 3/8 − 1/4 = 4/8 − 2/8 = 2/8 = 1/4. Hai cách khớp nhau."}]'::jsonb, '[{"de":"Bỏ dấu ngoặc rồi tính: 12 − (5 + 4 − 1).","dapAn":"12 − 5 − 4 + 1 = 4","giaiThich":"Cả ba số hạng đều đổi dấu. Kiểm tra: trong ngoặc bằng 8, và 12 − 8 = 4."},{"de":"Tính 5/6 − (1/2 + 1/4).","dapAn":"1/12","giaiThich":"Trong ngoặc: 2/4 + 1/4 = 3/4. Quy đồng mẫu 12: 10/12 − 9/12 = 1/12."}]'::jsonb),
  ('VBH-DN-02', 'Khi ĐƯA các số hạng vào trong ngoặc có dấu trừ đằng trước, em giữ nguyên dấu của chúng. Đây là chiều ngược của quy tắc bỏ ngoặc, và cũng phải đổi dấu y như vậy.', 'Đặt các số hạng vào ngoặc có dấu trừ đằng trước thì phải ĐỔI DẤU tất cả các số hạng đó. Muốn kiểm tra, cứ bỏ ngoặc ra xem có về được biểu thức ban đầu không.', '[{"de":"Viết 7 − 2 − 5 dưới dạng có ngoặc.","giai":"Cách nghĩ sai: 7 − (2 − 5). Kiểm tra bằng cách bỏ ngoặc: 7 − 2 + 5, khác biểu thức ban đầu. Cách đúng: 7 − (2 + 5). Kiểm tra: bỏ ngoặc được 7 − 2 − 5, khớp. Hai số hạng 2 và 5 vốn mang dấu trừ, vào trong ngoặc thì thành dấu cộng."},{"de":"Nhóm 9 − 3 − 4 để tính nhanh.","giai":"9 − 3 − 4 = 9 − (3 + 4) = 9 − 7 = 2. Nhóm lại như vậy chỉ cần một phép trừ thay vì hai."}]'::jsonb, '[{"de":"Viết 20 − 6 − 4 dưới dạng có một dấu ngoặc.","dapAn":"20 − (6 + 4) = 10","giaiThich":"Cả 6 và 4 đều mang dấu trừ, vào ngoặc thì đổi thành dấu cộng."},{"de":"Đẳng thức 15 − 8 − 2 = 15 − (8 − 2) đúng hay sai?","dapAn":"Sai","giaiThich":"Vế trái bằng 5, vế phải bằng 15 − 6 = 9. Phải viết là 15 − (8 + 2)."}]'::jsonb),
  ('VBH-NC-01', 'Em đang chia hai phân số bằng cách nhân thẳng tử với tử, mẫu với mẫu — tức là làm y như phép nhân. Dấu chia và dấu nhân đứng cạnh nhau trong cùng một bài nên rất dễ trượt.', 'Chia cho một phân số là NHÂN với số nghịch đảo của nó: a/b : c/d = a/b · d/c.', '[{"de":"Tính 1/2 : 1/4.","giai":"Cách nghĩ sai cho 1/8. Nhưng câu hỏi thật sự là \"nửa cái bánh chia được thành mấy phần một phần tư?\" — câu trả lời là 2 phần, chứ không thể là 1/8 phần. Cách đúng: 1/2 : 1/4 = 1/2 · 4/1 = 4/2 = 2. Khớp."},{"de":"Tính 2/3 : 4/5.","giai":"Nghịch đảo số chia rồi nhân: 2/3 · 5/4 = 10/12 = 5/6. Kiểm tra bằng cảm giác: chia cho một số nhỏ hơn 1 thì kết quả phải LỚN hơn số bị chia; 5/6 > 2/3, đúng."}]'::jsonb, '[{"de":"Tính 3/4 : 1/2.","dapAn":"3/2","giaiThich":"3/4 · 2/1 = 6/4 = 3/2."},{"de":"Tính 5/6 : 2/3.","dapAn":"5/4","giaiThich":"5/6 · 3/2 = 15/12 = 5/4."}]'::jsonb),
  ('VBH-NC-02', 'Em nhớ đúng là phép chia có liên quan tới nghịch đảo — nhưng lại nghịch đảo CẢ HAI phân số. Nhớ được một nửa quy tắc thường khó sửa hơn là quên hẳn, nên ta làm rõ luôn: nghịch đảo cái nào.', 'Chỉ nghịch đảo SỐ CHIA — số đứng SAU dấu chia. Số bị chia giữ nguyên.', '[{"de":"Tính 2/3 : 4/5.","giai":"Cách nghĩ sai: 3/2 · 5/4 = 15/8. Cách đúng: giữ nguyên 2/3, chỉ lật 4/5 thành 5/4, được 2/3 · 5/4 = 10/12 = 5/6. Cách kiểm tra: 2/3 chưa tới 1, chia cho 4/5 cũng chưa tới 1 thì kết quả phải quanh quẩn dưới 1 — 5/6 hợp lý, còn 15/8 gần 2 thì không."},{"de":"Tính 3/5 : 2/7.","giai":"Giữ nguyên số bị chia 3/5, chỉ lật số chia 2/7 thành 7/2, rồi đổi phép chia thành phép nhân: 3/5 · 7/2 = 21/10. Nếu lật cả hai thì được 5/3 · 7/2 = 35/6, lớn gấp hơn ba lần kết quả đúng — sai lệch rất xa chứ không phải một chút."}]'::jsonb, '[{"de":"Tính 1/3 : 2/5.","dapAn":"5/6","giaiThich":"Giữ 1/3, lật 2/5 thành 5/2: 1/3 · 5/2 = 5/6."},{"de":"Trong phép 4/7 : 3/8, phân số nào bị lật ngược?","dapAn":"Phân số 3/8, thành 8/3","giaiThich":"Chỉ số chia bị lật; 4/7 giữ nguyên."}]'::jsonb),
  ('VBH-NC-03', 'Em rút gọn bằng cách gạch bỏ một số hạng giống nhau ở tử và ở mẫu. Với một TÍCH thì làm vậy đúng, nhưng với một TỔNG thì không — và hai trường hợp này nhìn rất giống nhau trên giấy.', 'Chỉ được rút gọn khi tử và mẫu là những TÍCH có chung một thừa số. Trong một TỔNG thì không gạch bỏ từng số hạng được.', '[{"de":"Rút gọn (2 + 3)/(2 + 7).","giai":"Cách nghĩ sai: gạch hai số 2, còn 3/7. Kiểm tra bằng số: (2+3)/(2+7) = 5/9, mà 3/7 khác 5/9. Vậy cách đó sai. Biểu thức này KHÔNG rút gọn được vì 5 và 9 không có ước chung nào ngoài 1."},{"de":"Rút gọn (2 · 3)/(2 · 7).","giai":"Ở đây tử và mẫu đều là TÍCH và có chung thừa số 2, nên rút gọn được: (2·3)/(2·7) = 3/7. Kiểm tra: 6/14 = 3/7, đúng. So hai ví dụ này cạnh nhau là thấy ngay dấu cộng và dấu nhân khác nhau ở chỗ nào."}]'::jsonb, '[{"de":"Phân số (4 + 5)/(4 + 1) rút gọn được không? Bằng bao nhiêu?","dapAn":"Không rút gọn được; bằng 9/5","giaiThich":"Tử và mẫu là tổng, không phải tích, nên không gạch bỏ số 4 được."},{"de":"Rút gọn (5 · 6)/(5 · 9).","dapAn":"2/3","giaiThich":"Gạch thừa số chung 5 được 6/9, rút gọn tiếp cho 3 được 2/3."}]'::jsonb),
  ('VBH-LT-01', 'Em cho rằng luỹ thừa của một số âm thì lúc nào cũng ra số âm. Cách nghĩ này đúng một nửa — nó chỉ đúng khi số mũ lẻ.', 'Cơ số ÂM với số mũ CHẴN cho kết quả DƯƠNG; với số mũ LẺ cho kết quả ÂM. Lý do: cứ hai thừa số âm nhân với nhau lại thành dương.', '[{"de":"Tính (−2)⁴.","giai":"Cách nghĩ sai cho −16, vì thấy cơ số âm là kết luận luôn kết quả âm. Cách đúng: viết ra thành tích (−2)·(−2)·(−2)·(−2), rồi nhân từng đôi: (−2)·(−2) = 4 và (−2)·(−2) = 4, còn 4 · 4 = 16. Vậy (−2)⁴ = 16, DƯƠNG. Số mũ 4 là số chẵn nên các thừa số âm ghép đủ thành từng đôi, không còn dấu âm nào lẻ ra."},{"de":"Tính (−2)³.","giai":"(−2)·(−2)·(−2) = 4·(−2) = −8. Số mũ 3 lẻ nên sau khi ghép đôi vẫn thừa một dấu âm, kết quả mang dấu âm."}]'::jsonb, '[{"de":"Tính (−3)².","dapAn":"9","giaiThich":"Số mũ chẵn nên kết quả dương: (−3)·(−3) = 9."},{"de":"(−1/2)⁵ mang dấu gì?","dapAn":"Dấu âm","giaiThich":"Số mũ 5 là số lẻ nên kết quả âm."}]'::jsonb),
  ('VBH-LT-02', 'Em coi (−a)ⁿ và −aⁿ là một. Hai cách viết này chỉ khác nhau ở cặp dấu ngoặc, mà cặp ngoặc đó lại đổi hẳn kết quả.', 'Ở (−a)ⁿ, cơ số là −a: cả dấu trừ cùng được nâng lên luỹ thừa. Ở −aⁿ, cơ số chỉ là a: nâng luỹ thừa trước, LẤY DẤU TRỪ SAU.', '[{"de":"So sánh (−4)² và −4².","giai":"Cách nghĩ sai coi hai biểu thức này là một. So sánh thử: (−4)² = (−4)·(−4) = 16, còn −4² = −(4·4) = −16. Hai kết quả trái dấu nhau, nên chúng không thể là một. Cặp ngoặc chính là thứ quyết định dấu trừ có nằm trong cơ số hay không."},{"de":"Tính −3² và (−3)².","giai":"−3² = −(3·3) = −9. (−3)² = (−3)·(−3) = 9. Khi làm bài, việc đầu tiên phải làm là nhìn xem có dấu ngoặc hay không, rồi mới tính."}]'::jsonb, '[{"de":"Tính −2⁴.","dapAn":"−16","giaiThich":"Không có ngoặc nên cơ số là 2: tính 2⁴ = 16 rồi lấy dấu trừ."},{"de":"Tính (−2)⁴.","dapAn":"16","giaiThich":"Có ngoặc nên cơ số là −2, số mũ chẵn cho kết quả dương."}]'::jsonb),
  ('VBH-LT-03', 'Khi nâng một phân số hoặc một tích lên luỹ thừa, em chỉ nâng cho MỘT phần — thường là tử số. Số mũ đứng ngoài ngoặc thì nó áp cho mọi thứ bên trong.', '(x/y)ⁿ = xⁿ/yⁿ và (x·y)ⁿ = xⁿ·yⁿ. Số mũ áp cho CẢ tử và mẫu, cho CẢ hai thừa số.', '[{"de":"Tính (2/3)³.","giai":"Cách nghĩ sai: 8/3. Kiểm tra bằng cách viết ra tích: (2/3)·(2/3)·(2/3) = (2·2·2)/(3·3·3) = 8/27. Mẫu cũng bị nhân ba lần, nên không thể vẫn là 3."},{"de":"Tính (3/4)².","giai":"(3/4)² = 3²/4² = 9/16. Kiểm tra bằng cảm giác: 3/4 nhỏ hơn 1 nên bình phương phải nhỏ đi; 9/16 quả thật nhỏ hơn 3/4."}]'::jsonb, '[{"de":"Tính (1/2)⁴.","dapAn":"1/16","giaiThich":"Số mũ áp cho cả tử và mẫu: 1⁴/2⁴ = 1/16."},{"de":"Tính (−2/5)².","dapAn":"4/25","giaiThich":"Số mũ chẵn nên dương: (−2)²/5² = 4/25."}]'::jsonb),
  ('VBH-LT-04', 'Nhân hai luỹ thừa cùng cơ số, em nhân hai số mũ với nhau. Cách nghĩ này có lý do: đề bài có dấu nhân, nên tay tự nhân luôn cả số mũ.', 'xᵐ · xⁿ = xᵐ⁺ⁿ. Nhân hai luỹ thừa cùng cơ số thì giữ nguyên cơ số và CỘNG hai số mũ.', '[{"de":"Tính 2² · 2³ bằng hai cách.","giai":"Cách 1 — tính thẳng: 4 · 8 = 32 = 2⁵. Cách 2 — dùng quy tắc: nếu nhân số mũ thì ra 2⁶ = 64, KHÔNG khớp; nếu cộng số mũ thì ra 2⁵ = 32, KHỚP. Vậy quy tắc đúng là cộng."},{"de":"Viết gọn x² · x³.","giai":"Viết ra thành tích: (x·x)·(x·x·x). Đếm được 5 chữ x, nên bằng x⁵. Số 5 chính là 2 + 3, tức tổng hai số mũ."}]'::jsonb, '[{"de":"Viết gọn a⁴ · a³.","dapAn":"a⁷","giaiThich":"Cộng hai số mũ: 4 + 3 = 7."},{"de":"Tính (1/2)² · (1/2)³.","dapAn":"(1/2)⁵ = 1/32","giaiThich":"Cộng số mũ được (1/2)⁵ = 1/32."}]'::jsonb),
  ('VBH-LT-05', 'Chia hai luỹ thừa cùng cơ số, em chia hai số mũ. Cũng như trường hợp phép nhân, đề bài có dấu chia nên tay tự chia luôn cả số mũ.', 'xᵐ : xⁿ = xᵐ⁻ⁿ (với x khác 0, m ≥ n). Chia hai luỹ thừa cùng cơ số thì giữ nguyên cơ số và TRỪ hai số mũ.', '[{"de":"Tính 2⁶ : 2² bằng hai cách.","giai":"Cách 1 — tính thẳng: 64 : 4 = 16 = 2⁴. Cách 2 — nếu chia số mũ thì ra 2³ = 8, KHÔNG khớp; nếu trừ số mũ thì ra 2⁴ = 16, KHỚP."},{"de":"Viết gọn x⁶ : x².","giai":"Viết dạng phân số: (x·x·x·x·x·x)/(x·x). Rút gọn bớt hai chữ x ở tử và mẫu, còn lại 4 chữ x, tức x⁴. Số 4 chính là 6 − 2."}]'::jsonb, '[{"de":"Viết gọn a⁷ : a³.","dapAn":"a⁴","giaiThich":"Trừ hai số mũ: 7 − 3 = 4."},{"de":"Tính 3⁵ : 3³.","dapAn":"9","giaiThich":"3⁵⁻³ = 3² = 9. Kiểm tra: 243 : 27 = 9."}]'::jsonb),
  ('VBH-LT-06', 'Với (xᵐ)ⁿ, em cộng hai số mũ. Đây là quy tắc của phép NHÂN hai luỹ thừa, bị mang nhầm sang trường hợp luỹ thừa của luỹ thừa.', '(xᵐ)ⁿ = xᵐ·ⁿ. Luỹ thừa của luỹ thừa thì giữ nguyên cơ số và NHÂN hai số mũ.', '[{"de":"Tính (2²)³ bằng hai cách.","giai":"Cách 1 — tính thẳng: 2² = 4, rồi 4³ = 64. Cách 2 — nếu cộng số mũ thì ra 2⁵ = 32, KHÔNG khớp; nếu nhân số mũ thì ra 2⁶ = 64, KHỚP."},{"de":"Vì sao lại là nhân?","giai":"(x²)³ nghĩa là x² nhân với chính nó ba lần: x² · x² · x². Theo quy tắc nhân luỹ thừa cùng cơ số, ta cộng ba số mũ: 2 + 2 + 2 = 6, mà cộng ba lần số 2 chính là 2 · 3. Vậy hai quy tắc không mâu thuẫn — quy tắc nhân số mũ được suy ra từ quy tắc cộng số mũ."}]'::jsonb, '[{"de":"Viết gọn (a³)².","dapAn":"a⁶","giaiThich":"Luỹ thừa của luỹ thừa thì nhân hai số mũ: 3 · 2 = 6."},{"de":"Viết (3²)⁴ dưới dạng một luỹ thừa của 3.","dapAn":"3⁸","giaiThich":"Giữ nguyên cơ số 3, nhân hai số mũ: 2 · 4 = 8."}]'::jsonb),
  ('VBH-TU-01', 'Em tính lần lượt từ trái sang phải. Cách này giống hệt cách ta đọc chữ nên rất tự nhiên — nhưng trong toán, một số phép được ưu tiên hơn các phép khác.', 'Thứ tự: (1) trong ngoặc, (2) luỹ thừa, (3) nhân và chia, (4) cộng và trừ. Cùng một mức thì làm từ trái sang phải.', '[{"de":"Tính 2 + 3 · 4.","giai":"Cách nghĩ sai: 2 + 3 = 5, rồi 5 · 4 = 20. Cách đúng: nhân trước, 3 · 4 = 12, rồi 2 + 12 = 14. Nghĩ theo tình huống thật cho dễ nhớ: em có 2 nghìn, mua thêm 3 gói kẹo mỗi gói 4 nghìn thì tiêu 12 nghìn — phép nhân là một cụm riêng, không được cắt đôi."},{"de":"Tính 1/2 + 1/2 · 2².","giai":"Luỹ thừa trước: 2² = 4. Rồi nhân: 1/2 · 4 = 2. Cuối cùng cộng: 1/2 + 2 = 5/2."}]'::jsonb, '[{"de":"Tính 5 + 2 · 3.","dapAn":"11","giaiThich":"Nhân trước: 2 · 3 = 6, rồi 5 + 6 = 11."},{"de":"Tính 10 − 4 : 2.","dapAn":"8","giaiThich":"Chia trước: 4 : 2 = 2, rồi 10 − 2 = 8."}]'::jsonb),
  ('VBH-TU-02', 'Trong biểu thức có ngoặc, em làm phần ngoài ngoặc trước cho gọn. Dấu ngoặc sinh ra chính là để chặn việc đó lại.', 'Phần TRONG NGOẶC luôn được tính TRƯỚC, kể cả khi phần ngoài trông dễ tính hơn.', '[{"de":"Tính 10 − 2 · (3 + 1).","giai":"Cách nghĩ sai: 10 − 2 = 8 rồi 8 · 4 = 32. Cách đúng: trong ngoặc trước, 3 + 1 = 4; rồi nhân, 2 · 4 = 8; cuối cùng trừ, 10 − 8 = 2. Hai kết quả 32 và 2 cách nhau rất xa, nên lỗi này làm sai hẳn bài chứ không lệch một chút."},{"de":"Tính 3/4 · (2/3 + 4/3) − 1/2.","giai":"Trong ngoặc: 2/3 + 4/3 = 6/3 = 2. Rồi nhân: 3/4 · 2 = 3/2. Cuối cùng trừ: 3/2 − 1/2 = 1."}]'::jsonb, '[{"de":"Tính 12 − 3 · (2 + 2).","dapAn":"0","giaiThich":"Trong ngoặc bằng 4; 3 · 4 = 12; 12 − 12 = 0."},{"de":"Tính (5 − 2) · 4.","dapAn":"12","giaiThich":"Trong ngoặc bằng 3, rồi 3 · 4 = 12."}]'::jsonb),
  ('VBH-CV-01', 'Em chuyển một số hạng sang vế kia mà giữ nguyên dấu. Đây là lỗi có cách tự kiểm tra rất nhanh, và ta sẽ dùng cách đó ngay dưới đây.', 'Chuyển một số hạng từ vế này sang vế kia thì phải ĐỔI DẤU: dấu cộng thành dấu trừ, dấu trừ thành dấu cộng.', '[{"de":"Tìm x, biết x + 3 = 7.","giai":"Cách nghĩ sai: x = 7 + 3 = 10. Thử lại: 10 + 3 = 13, khác 7, nên sai. Cách đúng: chuyển số 3 sang vế phải và đổi dấu, x = 7 − 3 = 4. Thử lại: 4 + 3 = 7, đúng. THỬ LẠI là thói quen nên giữ suốt chương này — nó bắt được lỗi chuyển vế trong vài giây."},{"de":"Tìm x, biết x − 2/5 = 1/5.","giai":"Số hạng −2/5 chuyển sang vế phải thành +2/5: x = 1/5 + 2/5 = 3/5. Thử lại: 3/5 − 2/5 = 1/5, đúng."}]'::jsonb, '[{"de":"Tìm x, biết x + 5 = 12.","dapAn":"x = 7","giaiThich":"x = 12 − 5 = 7. Thử lại: 7 + 5 = 12."},{"de":"Tìm x, biết x − 1/4 = 1/2.","dapAn":"x = 3/4","giaiThich":"x = 1/2 + 1/4 = 3/4. Thử lại: 3/4 − 1/4 = 1/2."}]'::jsonb),
  ('VBH-CV-02', 'Em áp dụng quy tắc chuyển vế cho một THỪA SỐ. Quy tắc chuyển vế chỉ dùng được cho số hạng — thứ được cộng hoặc trừ, không phải thứ được nhân.', 'Số HẠNG (được cộng, trừ) thì chuyển vế và đổi dấu. THỪA SỐ (nhân với x) thì phải CHIA cả hai vế cho thừa số đó.', '[{"de":"Tìm x, biết 3x = 12.","giai":"Cách nghĩ sai: x = 12 − 3 = 9. Thử lại: 3 · 9 = 27, khác 12, nên sai. Cách đúng: số 3 nhân với x nên chia cả hai vế cho 3: x = 12 : 3 = 4. Thử lại: 3 · 4 = 12, đúng."},{"de":"Phân biệt hai bài: x + 5 = 20 và 5x = 20.","giai":"Bài đầu, số 5 là số HẠNG: x = 20 − 5 = 15. Bài sau, số 5 là THỪA SỐ: x = 20 : 5 = 4. Cách nhận ra: giữa số và chữ x có dấu cộng hay dấu trừ thì là số hạng; viết dính liền hoặc có dấu nhân thì là thừa số."}]'::jsonb, '[{"de":"Tìm x, biết 4x = 20.","dapAn":"x = 5","giaiThich":"Chia cả hai vế cho 4: x = 20 : 4 = 5."},{"de":"Tìm x, biết 2x + 1 = 9.","dapAn":"x = 4","giaiThich":"Chuyển số hạng 1 sang phải: 2x = 8. Rồi chia hai vế cho thừa số 2: x = 4."}]'::jsonb)
on conflict (content_id) do update set
  dan = excluded.dan, quy_tac = excluded.quy_tac,
  vi_du = excluded.vi_du, tu_lam = excluded.tu_lam, updated_at = now();

-- ------------------------------------------------------------- Kiểm tra nhanh
--
-- Mã lỗi nào trỏ tới một vi bài học CHƯA CÓ NỘI DUNG? Kết quả phải rỗng —
-- mỗi dòng trả về là một lần học sinh mắc lỗi rồi mở ra thấy trang trắng.
--
-- select e.error_code, e.remediation_id
-- from error_dictionary e
-- left join micro_lessons m on m.content_id = e.remediation_id
-- where m.content_id is null;
--
-- Mức đáp ứng của lớp trong một tuần (dùng cho trang Độ trung thực):
--
-- select count(*) filter (where kind = 'hoan-thanh')::float
--        / nullif(count(*) filter (where kind = 'mo'), 0) as ti_le_hoan_thanh
-- from micro_lesson_events where ts > now() - interval '7 days';

-- >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> 09-cau-hoi-muc-4.sql
-- ===========================================================================
-- DFLE-M7 · 9 CÂU HỎI MỨC 4 (VẬN DỤNG CAO) — MỘT CÂU CHO MỖI MỤC
-- Chạy SAU tệp 07-noi-dung-chuong-1.sql.
--
-- VÌ SAO CẦN TỆP NÀY
-- Bộ 70 câu ở tệp 07 dừng ở mức 3. Mà thang mức làm chủ (mastery) quy định:
--
--   mức 3 = vận dụng được trong TÌNH HUỐNG MỚI, cần điểm bài mức 4 từ 6,5
--           trở lên VÀ điểm quiz từ 8 trở lên.
--
-- Không có câu mức 4 nào thì `transferScore` luôn là null, và KHÔNG học sinh nào
-- lên nổi mastery 3 — kể cả em làm đúng tất cả. Đúng một lỗi cùng họ với trần
-- LES 65: thang đo có bốn mức nhưng mức trên cùng không có đường nào chạm tới.
--
-- Chín câu dưới đây đều là tình huống MỚI so với bài mẫu: hoặc đặt trong bối
-- cảnh thực tiễn phải tự lập biểu thức, hoặc phải nối hai đơn vị kiến thức, chứ
-- không phải bài mức 3 làm khó thêm bằng số xấu.
--
-- Phương án nhiễu vẫn được gắn mã lỗi như các câu khác, nên một em sai ở mức 4
-- vẫn được chẩn đoán đúng quan niệm sai chứ không chỉ bị trừ điểm.
--
-- Trang /hoc/<ku>/van-dung lấy các câu mức >= 3, nên chín câu này tự động vào
-- bài vận dụng sau giờ học, không phải sửa gì thêm ở giao diện.
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- KIỂM TRA ĐIỀU KIỆN TRƯỚC
-- Khối này không sửa gì cả. Nó chỉ dừng lại với một câu tiếng Việt đọc được nếu
-- tệp này được chạy trước tệp mà nó phụ thuộc vào — thay cho thông báo kiểu
-- `relation "..." does not exist` không nói cho ai biết phải làm gì.
-- ---------------------------------------------------------------------------
do $$
begin
  if to_regclass('public.questions') is null then
    raise exception E'\n\n>>> DỪNG LẠI: Phải chạy 01-schema.sql TRƯỚC tệp này. <<<\n';
  end if;
  if (select count(*) from knowledge_units where ku_id like 'C1-%%') = 0 then
    raise exception E'\n\n>>> DỪNG LẠI: Phải chạy 07-noi-dung-chuong-1.sql TRƯỚC tệp này. 10 câu mức 4 gắn vào các mục có video của Chương I và vào các mã lỗi do tệp 07 nạp. <<<\n';
  end if;
end $$;


insert into questions (question_id, ku_id, level, stem, correct_option, expected_time_sec) values
  ('C1-B1-M1-Q06', 'C1-B1-M1', 4,
   'Nhiệt độ ở một trạm quan trắc lúc 6 giờ là −2,5 °C. Đến 12 giờ nhiệt độ tăng thêm 7/2 °C. Gọi a là nhiệt độ lúc 12 giờ và b là số đối của a. Cặp (a ; b) nào đúng?',
   'A', 120),
  ('C1-B1-M1B-Q06', 'C1-B1-M1B', 4,
   'Lúc 5 giờ nhiệt độ ngoài trời là −7/4 °C. Mỗi giờ nhiệt độ tăng thêm 1/4 °C. Đến 7 giờ, nhiệt độ là bao nhiêu và điểm biểu diễn nó trên trục số nằm giữa hai số nguyên nào?',
   'A', 150),
  ('C1-B1-M2-Q06', 'C1-B1-M2', 4,
   'Ba bạn ghi mức nước của ruộng nhà mình so với mức chuẩn: An −3/4 m, Bình −0,7 m, Chi −5/8 m. Sắp xếp mức nước của ba bạn theo thứ tự TĂNG DẦN.',
   'A', 120),
  ('C1-B2-M1-Q06', 'C1-B2-M1', 4,
   'Một bình đang chứa 3/4 lít nước. Bạn An rót ra 0,5 lít, sau đó đổ thêm vào 2/5 lít. Hỏi trong bình còn bao nhiêu lít nước?',
   'A', 120),
  ('C1-B2-M2-Q06', 'C1-B2-M2', 4,
   'Cho x = 1/2 và y = −1/3. Tính giá trị của biểu thức A = x − (y − 1/6) + (−x + y).',
   'A', 120),
  ('C1-B2-M3-Q06', 'C1-B2-M3', 4,
   'Một mảnh vải dài 9/4 m được cắt thành các đoạn bằng nhau, mỗi đoạn dài 3/8 m. Hỏi cắt được bao nhiêu đoạn?',
   'A', 120),
  ('C1-B3-M1-Q06', 'C1-B3-M1', 4,
   'Cho M = (−2/3)^4 và N = −(2/3)^4. Khẳng định nào sau đây ĐÚNG?',
   'A', 120),
  ('C1-B3-M2-Q06', 'C1-B3-M2', 4,
   'Rút gọn P = (3^5 · 3^4) : 3^3. Kết quả P bằng luỹ thừa nào của 3?',
   'A', 120),
  ('C1-B4-M1-Q06', 'C1-B4-M1', 4,
   'Một khách mua 3 gói bánh giá 12 500 đồng mỗi gói và 2 hộp sữa giá 9 000 đồng mỗi hộp, rồi đưa tờ 100 000 đồng. Cách viết biểu thức và số tiền trả lại nào ĐÚNG?',
   'A', 150),
  ('C1-B4-M2-Q06', 'C1-B4-M2', 4,
   'Tìm x, biết 2/3 · x − 1/2 = 1/6.',
   'A', 150)
on conflict (question_id) do update set
  ku_id = excluded.ku_id, level = excluded.level, stem = excluded.stem,
  correct_option = excluded.correct_option, expected_time_sec = excluded.expected_time_sec;

insert into question_options (question_id, option_key, option_text) values
  ('C1-B1-M1-Q06', 'A', 'a = 1 °C ; b = −1'),
  ('C1-B1-M1-Q06', 'B', 'a = −6 °C ; b = 6'),
  ('C1-B1-M1-Q06', 'C', 'a = 1 °C ; b = 1'),
  ('C1-B1-M1-Q06', 'D', 'a = −1 °C ; b = 1'),

  ('C1-B1-M1B-Q06', 'A', '−5/4 °C ; nằm giữa −2 và −1'),
  ('C1-B1-M1B-Q06', 'B', '−5/4 °C ; nằm giữa −1 và 0'),
  ('C1-B1-M1B-Q06', 'C', '5/4 °C ; nằm giữa 1 và 2'),
  ('C1-B1-M1B-Q06', 'D', '−9/4 °C ; nằm giữa −3 và −2'),

  ('C1-B1-M2-Q06', 'A', 'An, Bình, Chi'),
  ('C1-B1-M2-Q06', 'B', 'Chi, Bình, An'),
  ('C1-B1-M2-Q06', 'C', 'Bình, An, Chi'),
  ('C1-B1-M2-Q06', 'D', 'An, Chi, Bình'),

  ('C1-B2-M1-Q06', 'A', '13/20 lít'),
  ('C1-B2-M1-Q06', 'B', '1/3 lít'),
  ('C1-B2-M1-Q06', 'C', '1/5 lít'),
  ('C1-B2-M1-Q06', 'D', '33/20 lít'),

  ('C1-B2-M2-Q06', 'A', '1/6'),
  ('C1-B2-M2-Q06', 'B', '−1/6'),
  ('C1-B2-M2-Q06', 'C', '1'),
  ('C1-B2-M2-Q06', 'D', '−1'),

  ('C1-B2-M3-Q06', 'A', '6 đoạn'),
  ('C1-B2-M3-Q06', 'B', '27/32 đoạn'),
  ('C1-B2-M3-Q06', 'C', '32/27 đoạn'),
  ('C1-B2-M3-Q06', 'D', '3 đoạn'),

  ('C1-B3-M1-Q06', 'A', 'M > N, và M với N là hai số đối nhau'),
  ('C1-B3-M1-Q06', 'B', 'M = N, cả hai cùng bằng −16/81'),
  ('C1-B3-M1-Q06', 'C', 'M > N, với M = 16/3 và N = −16/3'),
  ('C1-B3-M1-Q06', 'D', 'M < N, vì luỹ thừa của một số âm luôn là số âm'),

  ('C1-B3-M2-Q06', 'A', 'P = 3^6'),
  ('C1-B3-M2-Q06', 'B', 'P = 3^17'),
  ('C1-B3-M2-Q06', 'C', 'P = 3^3'),
  ('C1-B3-M2-Q06', 'D', 'P = 3^12'),

  ('C1-B4-M1-Q06', 'A', '100 000 − (3 · 12 500 + 2 · 9 000) = 44 500 đồng'),
  ('C1-B4-M1-Q06', 'B', '100 000 − 3 · 12 500 + 2 · 9 000 = 80 500 đồng'),
  ('C1-B4-M1-Q06', 'C', '100 000 − (12 500 + 9 000) · 3 = 35 500 đồng'),
  ('C1-B4-M1-Q06', 'D', '100 000 − (3 + 2) · (12 500 + 9 000) = −7 500 đồng'),

  ('C1-B4-M2-Q06', 'A', 'x = 1'),
  ('C1-B4-M2-Q06', 'B', 'x = −1/2'),
  ('C1-B4-M2-Q06', 'C', 'x = 0'),
  ('C1-B4-M2-Q06', 'D', 'x = 4/9')
on conflict (question_id, option_key) do update set option_text = excluded.option_text;

-- Phương án nhiễu -> mã lỗi. Chỉ gắn cho phương án thật sự sinh ra từ một quan
-- niệm sai có trong từ điển; phương án chỉ là nhầm lẫn tính toán thì để trống,
-- vì gắn bừa một mã lỗi sẽ làm quy tắc R03 chẩn đoán sai.
insert into distractor_errors (question_id, option_key, error_code) values
  ('C1-B1-M1-Q06', 'B', 'E-CT-03'),   -- cộng hai số trái dấu: cộng giá trị tuyệt đối, giữ dấu số trước
  ('C1-B1-M1-Q06', 'C', 'E-HT-02'),   -- nhầm số đối với số nghịch đảo (nghịch đảo của 1 là 1)

  ('C1-B1-M1B-Q06', 'B', 'E-HT-03'),   -- đọc đúng số nhưng đặt nhầm khoảng trên trục số
  ('C1-B1-M1B-Q06', 'C', 'E-HT-03'),   -- bỏ dấu âm rồi đếm về phía phải điểm O

  ('C1-B1-M2-Q06', 'B', 'E-TT-01'),   -- so sánh số âm theo giá trị tuyệt đối nên đảo ngược thứ tự
  ('C1-B1-M2-Q06', 'D', 'E-TT-02'),   -- so tử với tử, mẫu với mẫu, không đưa về cùng mẫu

  ('C1-B2-M1-Q06', 'B', 'E-CT-01'),   -- 1/4 + 2/5 = 3/9
  ('C1-B2-M1-Q06', 'C', 'E-CT-02'),   -- quy đồng mẫu nhưng giữ nguyên tử số

  ('C1-B2-M2-Q06', 'B', 'E-DN-01'),   -- bỏ ngoặc có dấu trừ, chỉ đổi dấu số hạng đầu

  ('C1-B2-M3-Q06', 'B', 'E-NC-01'),   -- chia phân số nhưng nhân thẳng, không nghịch đảo
  ('C1-B2-M3-Q06', 'C', 'E-NC-02'),   -- nghịch đảo cả hai phân số

  ('C1-B3-M1-Q06', 'B', 'E-LT-02'),   -- không phân biệt (−a)^n với −a^n
  ('C1-B3-M1-Q06', 'C', 'E-LT-03'),   -- luỹ thừa của một thương chỉ nâng cho tử
  ('C1-B3-M1-Q06', 'D', 'E-LT-01'),   -- tin luỹ thừa cơ số âm luôn âm

  ('C1-B3-M2-Q06', 'B', 'E-LT-04'),   -- nhân hai luỹ thừa cùng cơ số thì nhân số mũ
  ('C1-B3-M2-Q06', 'C', 'E-LT-05'),   -- chia hai luỹ thừa cùng cơ số thì chia số mũ

  ('C1-B4-M1-Q06', 'B', 'E-TU-02'),   -- bỏ ngoặc gộp, làm phần ngoài trước

  ('C1-B4-M2-Q06', 'B', 'E-CV-01'),   -- chuyển vế mà giữ nguyên dấu
  ('C1-B4-M2-Q06', 'C', 'E-CV-02')    -- chuyển thừa số sang vế kia bằng cách trừ
on conflict (question_id, option_key) do update set error_code = excluded.error_code;

-- ------------------------------------------------------------- kiểm tra nhanh
-- select level, count(*) from questions where question_id like 'C1-%' group by level order by level;
--   kỳ vọng: 1 -> 17 câu, 2 -> 36 câu, 3 -> 17 câu, 4 -> 10 câu  (tổng 80)
--
-- Mỗi mục hiện có ĐÚNG MỘT câu mức 4, nên điểm tình huống mới của một mục chỉ
-- nhận hai giá trị: 0 hoặc 10. Em làm đúng câu mức 4 của mục đó VÀ có điểm quiz
-- từ 8 trở lên thì đạt mastery 3 — trước khi có tệp này, mức 3 là bất khả.
-- Muốn thang mịn hơn thì soạn thêm câu mức 4 cho từng mục bằng công cụ
-- soan-cau-hoi.html; công thức không phải sửa gì.

-- >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> 10-gan-link-video.sql
-- ===========================================================================
-- DFLE-M7 · GẮN LINK VIDEO VÀ HỌC LIỆU — CỘT NGUỒN VÀ QUYỀN SỬA
-- Chạy SAU 07-noi-dung-chuong-1.sql. Chạy được nhiều lần, không hỏng dữ liệu cũ.
--
-- VÌ SAO CẦN TỆP NÀY
-- 13 video và 13 phiếu học tập của Chương I đã có TÊN trong bảng contents nhưng
-- cột url đều rỗng, nên pha học trước giờ lên lớp chưa chạy được: học sinh mở
-- bài ra không có gì để xem. Tệp này không tự điền link — nó chuẩn bị ba thứ để
-- giáo viên tự điền ở trang /gv/noi-dung:
--
--   1. Cột `nguon` — bắt buộc khi dùng video của người khác, xem chú thích dưới.
--   2. Cột `cap_nhat_luc` — biết link được sửa lần cuối lúc nào.
--   3. Quyền cho giáo viên sửa contents (trước đây chỉ đọc).
--
-- CỘT `nguon` KHÔNG PHẢI THỦ TỤC HÀNH CHÍNH
-- Dùng video công khai của kênh khác thì hồ sơ dự thi PHẢI ghi rõ nguồn. Thiếu
-- phần này, hội đồng có quyền hiểu là nhóm tự nhận đã làm ra học liệu — đó là
-- lỗi liêm chính, không phải lỗi kỹ thuật, và nó nặng hơn mọi lỗi phần mềm
-- trong dự án. Cột này ép việc khai nguồn xảy ra ngay lúc gắn link, chứ không
-- để tới lúc viết báo cáo mới cố nhớ lại.
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- KIỂM TRA ĐIỀU KIỆN TRƯỚC
-- Khối này không sửa gì cả. Nó chỉ dừng lại với một câu tiếng Việt đọc được nếu
-- tệp này được chạy trước tệp mà nó phụ thuộc vào — thay cho thông báo kiểu
-- `relation "..." does not exist` không nói cho ai biết phải làm gì.
-- ---------------------------------------------------------------------------
do $$
begin
  if to_regclass('public.contents') is null then
    raise exception E'\n\n>>> DỪNG LẠI: Phải chạy 01-schema.sql TRƯỚC tệp này. <<<\n';
  end if;
end $$;


alter table contents add column if not exists nguon        text;
alter table contents add column if not exists cap_nhat_luc timestamptz;

comment on column contents.nguon is
  'Nguồn học liệu: tên kênh/tác giả và đường dẫn gốc nếu không phải do nhóm tự làm. '
  'Để trống nghĩa là nhóm tự sản xuất. Nội dung cột này đi thẳng vào mục học liệu của báo cáo.';

-- ------------------------------------------------- quyền sửa nội dung cho GV
-- Trước đây contents chỉ có chính sách SELECT, nên không ai sửa được link qua
-- ứng dụng — phải mở Supabase. Nay giáo viên sửa được, học sinh thì không.
drop policy if exists "gv sua noi dung" on contents;
create policy "gv sua noi dung" on contents for update to authenticated
  using (is_teacher()) with check (is_teacher());

-- ---------------------------------------------------------- kiểm tra nhanh
-- Chạy sau khi gắn link, để biết còn mục nào chưa có video:
--
-- select ku_id, kind, title,
--        case when url is null or url = '' then 'CHƯA GẮN' else 'đã gắn' end as trang_thai,
--        duration_sec, nguon
--   from contents
--  where kind in ('video','hoc-lieu')
--  order by kind, ku_id;

-- ===========================================================================
-- CẢNH BÁO VỀ CỘT duration_sec — ĐỌC TRƯỚC KHI GẮN LINK
--
-- 13 dòng video đang để duration_sec = 480 như một con số tạm. Đây KHÔNG phải
-- một trường trang trí: nó là MẪU SỐ của tỉ lệ hoàn thành video
--
--     videoCompletionRate = thời gian xem có tương tác / duration_sec
--
-- và tỉ lệ đó là điều kiện của cả R01 lẫn R09. Video thật dài 6 phút 12 giây mà
-- cơ sở dữ liệu vẫn ghi 480 giây thì một em xem TRỌN VẸN chỉ được tính 78% —
-- dưới ngưỡng 90% — và bị chẩn đoán "chưa xem hết bài". Cả lớp bị chẩn đoán sai
-- vì một con số điền tạm.
--
-- Trang /gv/noi-dung tự đọc thời lượng thật từ trình phát YouTube khi dán link,
-- nên nếu gắn link ở đó thì không phải lo chuyện này. Còn nếu gắn bằng SQL thì
-- PHẢI sửa duration_sec cùng lúc, ví dụ:
--
-- update contents
--    set url = 'https://www.youtube.com/watch?v=XXXXXXXXXXX',
--        duration_sec = 372,                       -- 6 phút 12 giây = 372 giây
--        nguon = 'Kênh ABC — dùng lại, có ghi nguồn trong báo cáo',
--        cap_nhat_luc = now()
--  where content_id = 'VD-C1-B1-M1';
-- ===========================================================================

-- >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> 13-go-bo-muc-ngoai-chuong-1.sql
-- ===========================================================================
-- DFLE-M7 · GỠ BỎ CÁC ĐƠN VỊ KIẾN THỨC NGOÀI CHƯƠNG I
-- Chạy SAU 07-noi-dung-chuong-1.sql. Chạy lại nhiều lần được.
--
-- VÌ SAO CẦN TỆP NÀY
-- Bản gieo dữ liệu đầu tiên của dự án có sáu đơn vị kiến thức mẫu thuộc chương
-- khác (tỉ lệ thức, đại lượng tỉ lệ thuận/nghịch). Tệp 07 có sẵn bước dọn dẹp,
-- nhưng nó CỐ TÌNH THẬN TRỌNG: chỉ xoá những gì không còn thứ gì bám vào, để
-- không bao giờ xoá nhầm dữ liệu học tập thật. Vì thận trọng như vậy, vài mục cũ
-- sống sót — thường vì còn một dòng học liệu hoặc một bản ghi mức làm chủ trỏ
-- tới. Kết quả: trang "Học liệu" hiện 15 mục thay vì 13 đúng của Chương I.
--
-- Tệp này gỡ CHÍNH XÁC hai mục đó và mọi thứ treo trên chúng, theo đúng thứ tự
-- khoá ngoại. Nó KHÔNG đụng tới bất cứ mục nào có mã bắt đầu bằng 'C1-'.
--
-- CÓ MẤT DỮ LIỆU NGHIÊN CỨU KHÔNG
-- Có — nếu đã có học sinh làm bài ở hai mục đó. Khối kiểm tra bên dưới đếm trước
-- và DỪNG LẠI nếu thấy có lượt làm bài thật, thay vì lặng lẽ xoá. Muốn xoá bằng
-- được thì đổi `cho_phep_mat_du_lieu` thành true, nhưng hãy chắc là mình hiểu
-- mình đang bỏ đi cái gì.
-- ===========================================================================

do $$
declare
  ------------------------------------------------------------ SỬA Ở ĐÂY
  cho_phep_mat_du_lieu boolean := false;
  ------------------------------------------------------------ hết phần sửa
  so_luot   bigint;
  so_muc    bigint;
  ds        text;
begin
  if to_regclass('public.knowledge_units') is null then
    raise exception E'\n\n>>> DỪNG LẠI: Phải chạy 01-schema.sql TRƯỚC tệp này. <<<\n';
  end if;

  select count(*), coalesce(string_agg(ku_id || ' (' || ku_name || ')', ', '), '')
    into so_muc, ds
    from knowledge_units where ku_id not like 'C1-%';

  if so_muc = 0 then
    raise notice 'Không có mục nào ngoài Chương I. Không phải làm gì cả.';
    return;
  end if;

  select count(*) into so_luot
    from quiz_attempts a
    join knowledge_units k on k.ku_id = a.ku_id
   where k.ku_id not like 'C1-%';

  if so_luot > 0 and not cho_phep_mat_du_lieu then
    raise exception E'\n\n>>> DỪNG LẠI: % mục ngoài Chương I đang có % lượt làm bài của học sinh. Xoá là mất số liệu đó vĩnh viễn. Nếu đây chỉ là dữ liệu thử và chắc chắn muốn xoá, đổi cho_phep_mat_du_lieu thành true ở đầu tệp. <<<\n', so_muc, so_luot;
  end if;

  -- NHẬT KÝ TIẾT DẠY KHÔNG BAO GIỜ BỊ XOÁ TỰ ĐỘNG. Đó là bằng chứng cho chỉ số
  -- độ trung thực triển khai — thứ không dựng lại được. Có dòng nào trỏ tới mục
  -- sắp gỡ thì dừng hẳn, để thầy cô tự quyết định.
  select count(*) into so_luot from lesson_log where ku_id not like 'C1-%';
  if so_luot > 0 then
    raise exception E'\n\n>>> DỪNG LẠI: có % dòng nhật ký tiết dạy đang trỏ tới mục ngoài Chương I. Nhật ký tiết dạy là bằng chứng của chỉ số độ trung thực, tệp này không tự xoá. Vào bảng lesson_log sửa hoặc xoá những dòng đó trước, rồi chạy lại. <<<\n', so_luot;
  end if;

  raise notice 'Sẽ gỡ % mục: %', so_muc, ds;

  -- Thứ tự đi ngược chiều khoá ngoại. Sai thứ tự là Postgres từ chối ngay.
  delete from quiz_answers where attempt_id in (
    select attempt_id from quiz_attempts where ku_id not like 'C1-%');
  delete from quiz_attempts   where ku_id not like 'C1-%';
  delete from quiz_locks      where ku_id not like 'C1-%';
  delete from learning_events where ku_id not like 'C1-%';
  delete from mastery_states  where ku_id not like 'C1-%';
  delete from recommendations where ku_id not like 'C1-%';

  delete from distractor_errors where question_id in (
    select question_id from questions where ku_id not like 'C1-%');
  delete from question_options  where question_id in (
    select question_id from questions where ku_id not like 'C1-%');
  delete from questions where ku_id not like 'C1-%';

  -- Nhật ký MỞ BÁO CÁO thì giữ lại dòng, chỉ gỡ liên kết tới mục sắp xoá: việc
  -- thầy cô đã mở báo cáo chẩn đoán vẫn là bằng chứng có giá trị, kể cả khi mục
  -- được xem lúc đó không còn nữa.
  update dashboard_views set ku_id = null where ku_id not like 'C1-%';

  delete from error_dictionary where coalesce(ku_id, '') not like 'C1-%';
  delete from contents         where coalesce(ku_id, '') not like 'C1-%';

  -- Gỡ liên kết tiên quyết trước, nếu không chỉ xoá được lớp ngoài cùng của chuỗi.
  update knowledge_units set prerequisite_ku = null
   where prerequisite_ku in (select ku_id from knowledge_units where ku_id not like 'C1-%');
  delete from knowledge_units where ku_id not like 'C1-%';

  raise notice 'Đã gỡ xong. Giờ chỉ còn các mục của Chương I.';
end $$;

-- ------------------------------------------------------------- kiểm tra lại
-- Phải ra đúng 14 dòng, tất cả bắt đầu bằng C1-.
select order_index as thu_tu, ku_id, ku_name, lesson_id, prerequisite_ku
  from knowledge_units order by order_index;

-- >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> 15-view-tong-hop-va-lich-su.sql
-- ===========================================================================
-- BẢNG TỔNG HỢP PHÍA MÁY CHỦ + LỊCH SỬ MASTERY
-- Chạy sau 08-vi-bai-hoc.sql. Không phụ thuộc 09–14.
--
-- Vì sao cần tệp này — ba lý do, đều là lỗi thật đã xảy ra:
--
-- 1. TRẦN 1000 DÒNG. Supabase trả tối đa 1000 dòng cho mỗi truy vấn và KHÔNG
--    báo lỗi khi cắt. Trang /gv đang tải toàn bộ learning_events của cả lớp về
--    trình duyệt rồi mới cộng. Một lớp 40 em học hết 14 mục sinh khoảng 4000–
--    6000 sự kiện, tức là từ tuần thứ hai trở đi bảng điều khiển đọc thiếu
--    dữ liệu mà vẫn hiện ra như bình thường. Cộng ở phía máy chủ thì mỗi lớp
--    chỉ còn đúng 40 dòng — số dòng bằng SĨ SỐ, không bằng số sự kiện.
--
-- 2. MÚI GIỜ. `count(distinct ts::date)` đếm theo UTC. Em học lúc 22h30 và em
--    học lúc 6h30 sáng hôm sau ở Việt Nam là HAI ngày, nhưng theo UTC lại rơi
--    vào cùng một ngày — thành phần "Đều đặn" của LES bị hụt đúng ở nhóm học
--    buổi tối, tức là nhóm đông nhất. Mọi phép đổi ngày ở đây đều quy về
--    Asia/Ho_Chi_Minh.
--
-- 3. LỊCH SỬ MASTERY. Bảng mastery_states chỉ giữ mức HIỆN TẠI. Khi em từ mức
--    1 lên mức 2, dòng cũ bị ghi đè và không còn bằng chứng nào cho biết việc
--    đó xảy ra lúc nào, nhờ đâu. Mà "hồ sơ học tập được cập nhật" chính là câu
--    mà đề tài phải chứng minh, nên nó cần một bảng riêng chỉ ghi thêm.
--
-- Cả ba view đều dùng security_invoker = true: quyền đọc vẫn là quyền của
-- người đang đăng nhập, view KHÔNG mở thêm cửa nào. Học sinh đọc view chỉ
-- thấy dòng của chính mình; giáo viên thấy học sinh lớp mình.
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- KIỂM TRA ĐIỀU KIỆN TRƯỚC
-- ---------------------------------------------------------------------------
do $$
begin
  if to_regclass('public.students') is null then
    raise exception E'\n\n>>> DỪNG LẠI: Phải chạy 01-schema.sql TRƯỚC tệp này. <<<\n';
  end if;
  if to_regclass('public.recommendations') is null then
    raise exception E'\n\n>>> DỪNG LẠI: Phải chạy 01-schema.sql TRƯỚC tệp này. <<<\n';
  end if;
  if to_regclass('public.micro_lesson_events') is null then
    raise exception E'\n\n>>> DỪNG LẠI: Phải chạy 08-vi-bai-hoc.sql TRƯỚC tệp này. View vi_bai_hoc_tong_hop đọc nhật ký vi bài học do tệp 08 tạo ra. <<<\n';
  end if;
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'quiz_attempts' and column_name = 'kind'
  ) then
    raise exception E'\n\n>>> DỪNG LẠI: Phải chạy 03-pha-sau-gio-hoc.sql TRƯỚC tệp này. Thiếu cột quiz_attempts.kind thì không tách được bài chuẩn bị với bài vận dụng. <<<\n';
  end if;
end $$;


-- ===========================================================================
-- A. les_tong_hop — mỗi học sinh một dòng, đủ số liệu để tính LES
--
-- Đây là năm mẫu số/tử số của công thức LES, cộng sẵn ở phía máy chủ. Trang
-- /gv chỉ việc đọc và đưa thẳng vào componentScores() — vẫn dùng chung đúng
-- một công thức với bản CLI, không chép lại phép tính vào SQL.
--
-- Cố ý KHÔNG tính luôn LES trong view: trọng số còn phải hiệu chỉnh (xem
-- calibrateWeights trong les.js), và quy tắc "thiếu dữ liệu KHÔNG phải là số 0"
-- nằm ở hàm pct() bên JavaScript. Đưa công thức xuống SQL là tự tạo ra bản
-- thứ hai sẽ lệch dần với bản thứ nhất.
-- ===========================================================================
drop view if exists les_tong_hop;
create view les_tong_hop with (security_invoker = true) as
select
  s.student_id,
  s.class_id,

  -- TỬ SỐ của Video: giây xem CÓ TƯƠNG TÁC, cộng trên mọi mục.
  coalesce((
    select sum(e.duration_active_sec)
    from learning_events e
    where e.student_id = s.student_id and e.event_type = 'video_active'
  ), 0)::int as giay_xem_co_tuong_tac,

  -- TỬ SỐ của Đều đặn: số NGÀY có hoạt động, tính theo giờ Việt Nam.
  (
    select count(distinct (e.ts at time zone 'Asia/Ho_Chi_Minh')::date)
    from learning_events e
    where e.student_id = s.student_id
  )::int as so_ngay_co_hoat_dong,

  -- TỬ SỐ của Bài tập.
  (
    select count(*)
    from learning_events e
    where e.student_id = s.student_id and e.event_type = 'assignment_submit'
  )::int as so_bai_tap_da_nop,

  -- TỬ SỐ và MẪU SỐ của Kiên trì: chủ động làm lại / số lần nhận phản hồi.
  (
    select count(*)
    from learning_events e
    where e.student_id = s.student_id and e.event_type = 'voluntary_retry'
  )::int as so_lan_tu_lam_lai,
  (
    select count(*)
    from learning_events e
    where e.student_id = s.student_id and e.event_type = 'feedback_with_hint'
  )::int as so_lan_nhan_phan_hoi,

  -- MẪU SỐ của Bài tập: số mục em ấy ĐÃ BẮT ĐẦU học. Mỗi mục giao đúng một
  -- bài vận dụng, nên đây chính là số bài được giao. Em mới học 2 mục thì
  -- không bị chấm như em đã học 14 mục.
  (
    select count(distinct a.ku_id)
    from quiz_attempts a
    where a.student_id = s.student_id
  )::int as so_muc_da_bat_dau,

  -- Điểm LẦN ĐẦU của các bài CHUẨN BỊ, mỗi mục một số. Bài vận dụng (kind =
  -- 'van-dung') không vào đây: thành phần Quiz của LES đo mức chuẩn bị TRƯỚC
  -- giờ học, trộn bài sau giờ học vào sẽ làm chỉ số tự khen chính nó.
  coalesce((
    select array_agg(a.score order by a.ku_id)
    from quiz_attempts a
    where a.student_id = s.student_id
      and a.attempt_no = 1
      and coalesce(a.kind, 'chuan-bi') = 'chuan-bi'
  ), '{}')::numeric[] as diem_quiz_lan_dau

from students s;

comment on view les_tong_hop is
  'Số liệu thô để tính LES, mỗi học sinh một dòng. Cộng ở máy chủ để không chạm trần 1000 dòng của PostgREST; ngày tính theo Asia/Ho_Chi_Minh.';


-- ===========================================================================
-- B. vi_bai_hoc_tong_hop — mỗi lớp × mỗi vi bài học một dòng
--
-- Trả lời câu "vi bài học nào đang bị bỏ dở nhiều nhất", tức là nội dung nào
-- cần viết lại trước tiên. Đếm theo HỌC SINH chứ không theo lượt: một em mở
-- đi mở lại năm lần vẫn là một em.
-- ===========================================================================
drop view if exists vi_bai_hoc_tong_hop;
create view vi_bai_hoc_tong_hop with (security_invoker = true) as
select
  s.class_id,
  r.recommended_content as content_id,
  count(distinct r.student_id)::int as so_em_duoc_giao,
  count(distinct m.student_id) filter (where m.kind = 'mo')::int          as so_em_da_mo,
  count(distinct m.student_id) filter (where m.kind = 'hoan-thanh')::int  as so_em_lam_xong,
  -- Điểm tự kiểm chỉ tính trên lượt HOÀN THÀNH. Thấp nghĩa là đọc xong vẫn
  -- chưa hiểu — lỗi ở cách giảng của vi bài học, không ở học sinh.
  coalesce(sum(m.so_cau_dung) filter (where m.kind = 'hoan-thanh'), 0)::int as tong_cau_dung,
  coalesce(sum(m.so_cau)      filter (where m.kind = 'hoan-thanh'), 0)::int as tong_cau
from recommendations r
join students s on s.student_id = r.student_id
left join micro_lesson_events m
       on m.content_id = r.recommended_content
      and m.student_id = r.student_id
where r.recommended_content is not null
group by s.class_id, r.recommended_content;

comment on view vi_bai_hoc_tong_hop is
  'Đường đi của từng vi bài học trong một lớp: được giao / đã mở / làm xong, và tỉ lệ câu tự kiểm đúng. Đếm theo học sinh, không theo lượt.';


-- ===========================================================================
-- C. hieu_qua_quy_tac — phép thử T6, mỗi lớp × mỗi quy tắc một dòng
--
-- "Quy tắc nào thực sự có tác dụng" — so điểm bài chuẩn bị trước khi giao
-- nội dung bổ trợ với điểm bài vận dụng sau đó. Chỉ những lượt ĐÃ ĐÓNG VÒNG
-- (có cả pre lẫn post) mới vào phép trung bình; lượt chưa đóng vòng vẫn được
-- đếm ở cột so_luot_goi_y để thấy mẫu số thật.
-- ===========================================================================
drop view if exists hieu_qua_quy_tac;
create view hieu_qua_quy_tac with (security_invoker = true) as
select
  s.class_id,
  r.trigger_rule,
  count(*)::int as so_luot_goi_y,
  count(*) filter (where r.pre_score is not null and r.post_score is not null)::int
    as so_luot_da_dong_vong,
  avg(r.pre_score)  filter (where r.pre_score is not null and r.post_score is not null)
    as diem_truoc_tb,
  avg(r.post_score) filter (where r.pre_score is not null and r.post_score is not null)
    as diem_sau_tb,
  avg(r.post_score - r.pre_score) filter (where r.pre_score is not null and r.post_score is not null)
    as muc_tang_tb
from recommendations r
join students s on s.student_id = r.student_id
group by s.class_id, r.trigger_rule;

comment on view hieu_qua_quy_tac is
  'Phép thử T6: mức tăng điểm trung bình sau mỗi quy tắc, tính trên các lượt đã đóng vòng.';


-- ===========================================================================
-- D. loi_pho_bien — mỗi lớp × mỗi đơn vị kiến thức × mỗi mã lỗi một dòng
--
-- Trước đây trang /gv lấy về từng dòng quiz_answers của cả lớp rồi mới đếm.
-- Một lớp 40 em, mỗi em làm tới 3 lượt, mỗi lượt 5 câu là 600 dòng cho MỘT
-- mục — chưa chạm trần 1000 nhưng đã sát, và lớp ghép hai ca thì vượt. Đếm ở
-- máy chủ thì mỗi mục chỉ còn vài dòng, đúng bằng số mã lỗi có thật.
-- ===========================================================================
drop view if exists loi_pho_bien;
create view loi_pho_bien with (security_invoker = true) as
select
  s.class_id,
  a.ku_id,
  qa.error_code,
  count(*)::int as so_luot
from quiz_answers qa
join quiz_attempts a on a.attempt_id = qa.attempt_id
join students s      on s.student_id = a.student_id
where qa.error_code is not null
group by s.class_id, a.ku_id, qa.error_code;

comment on view loi_pho_bien is
  'Số lượt mắc từng mã lỗi trong một lớp ở một đơn vị kiến thức. Đếm ở máy chủ thay vì tải toàn bộ quiz_answers về trình duyệt.';


-- ===========================================================================
-- E. mastery_history — bảng CHỈ GHI THÊM, giữ lại từng lần đổi mức
--
-- mastery_states giữ mức hiện tại (ghi đè). Bảng này giữ đường đi. Không có
-- nó thì câu "hồ sơ học tập được cập nhật liên tục" chỉ là lời nói: hội đồng
-- hỏi "em này lên mức 2 lúc nào, nhờ bài nào" là không trả lời được.
--
-- Cột evidence chép lại đúng khối bằng chứng đã dùng để quyết định mức, nên
-- mỗi dòng tự đứng được mà không cần suy ngược từ quiz_attempts.
-- ===========================================================================
create table if not exists mastery_history (
  history_id    bigserial primary key,
  student_id    text references students(student_id) on delete cascade,
  ku_id         text references knowledge_units(ku_id),
  mastery_level int not null check (mastery_level between 0 and 3),
  evidence      jsonb,
  ts            timestamptz not null default now()
);
create index if not exists idx_mastery_history_student
  on mastery_history(student_id, ku_id, ts desc);

alter table mastery_history enable row level security;

drop policy if exists "doc lich su mastery" on mastery_history;
create policy "doc lich su mastery" on mastery_history for select to authenticated
  using (student_id = my_student_id() or is_teacher());

-- Ghi bằng service role ở phía máy chủ (route /api/quiz/submit) — không mở
-- policy insert cho người dùng. Học sinh tự ghi được vào bảng này thì mọi
-- con số về tiến bộ đều mất giá trị làm bằng chứng.

comment on table mastery_history is
  'Lịch sử mức mastery — chỉ ghi thêm, không sửa, không xoá. Mỗi dòng là một lần hệ thống kết luận lại về một đơn vị kiến thức của một học sinh.';


-- ---------------------------------------------------------------------------
-- Nạp mốc đầu tiên cho những em đã có mức mastery trước khi có bảng này, để
-- lịch sử không bắt đầu bằng một khoảng trống. Chạy lại tệp không nhân đôi.
-- ---------------------------------------------------------------------------
insert into mastery_history (student_id, ku_id, mastery_level, evidence, ts)
select m.student_id, m.ku_id, m.mastery_level,
       coalesce(m.evidence, '{}'::jsonb) || jsonb_build_object('nguon', 'nap-lai-tu-mastery_states'),
       m.updated_at
from mastery_states m
where not exists (
  select 1 from mastery_history h
  where h.student_id = m.student_id and h.ku_id = m.ku_id
);


-- ---------------------------------------------------------------------------
-- KIỂM TRA SAU KHI CHẠY — dán kết quả vào sổ nhật ký nghiên cứu.
-- ---------------------------------------------------------------------------
select 'les_tong_hop'          as bang, count(*) as so_dong from les_tong_hop
union all select 'vi_bai_hoc_tong_hop', count(*) from vi_bai_hoc_tong_hop
union all select 'hieu_qua_quy_tac',    count(*) from hieu_qua_quy_tac
union all select 'loi_pho_bien',        count(*) from loi_pho_bien
union all select 'mastery_history',     count(*) from mastery_history;

-- >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> 16-quan-ly-noi-dung.sql
-- ===========================================================================
-- SỬA CHƯƠNG TRÌNH VÀ NGÂN HÀNG CÂU HỎI NGAY TRONG WEB — chạy sau 07
--
-- Trước tệp này, muốn thêm một câu hỏi thì phải soạn ở soan-cau-hoi.html, xuất
-- ra SQL, rồi dán vào SQL Editor của Supabase. Giáo viên không làm được một
-- mình, nên ngân hàng câu hỏi đứng yên suốt đợt thực nghiệm.
--
-- Vì sao gom hết vào MỘT hàm thay vì để trang web gọi thẳng từng bảng: sửa một
-- câu hỏi là sửa ba bảng cùng lúc (questions, question_options,
-- distractor_errors). Làm ba lệnh riêng thì lệnh thứ hai hỏng sẽ để lại một câu
-- hỏi có đề mới mà đáp án cũ — học sinh làm bài với dữ liệu sai lệch mà không
-- ai biết. Trong một hàm thì hoặc xong cả ba, hoặc không đổi gì cả.
--
-- Hàm KHÔNG mở cho người dùng: chỉ service_role ở phía máy chủ gọi được, sau
-- khi /api/quan-ly đã kiểm tra vai trò giáo viên.
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- KIỂM TRA ĐIỀU KIỆN TRƯỚC
-- Khối này không sửa gì cả. Nó chỉ dừng lại với một câu tiếng Việt đọc được nếu
-- tệp này bị chạy trước tệp mà nó phụ thuộc vào.
-- ---------------------------------------------------------------------------
do $$
begin
  if to_regclass('public.questions') is null or to_regclass('public.question_options') is null then
    raise exception E'\n\n>>> DỪNG LẠI: Phải chạy 01-schema.sql TRƯỚC tệp này. <<<\n';
  end if;
  if to_regclass('public.distractor_errors') is null or to_regclass('public.error_dictionary') is null then
    raise exception E'\n\n>>> DỪNG LẠI: Phải chạy 01-schema.sql TRƯỚC tệp này. <<<\n';
  end if;
end $$;


-- ---------------------------------------------------------------------------
-- Lưu NGUYÊN TỬ: hoặc xong cả khối, hoặc không đổi gì.
-- ---------------------------------------------------------------------------
create or replace function public.manage_learning_content(p_kind text, p_action text, p_data jsonb)
returns void language plpgsql set search_path = public as $$
declare
  v_id text; v_parent text; v_seen text[]; v_option jsonb;
begin
  -- Kiểm tra hình dạng dữ liệu trước khi đụng vào bảng nào.
  if p_kind is null or p_action is null or p_data is null
     or jsonb_typeof(p_data) <> 'object'
     or p_kind not in ('unit','question')
     or p_action not in ('create','update','delete') then
    raise exception 'Thao tác không hợp lệ';
  end if;

  v_id := case when p_kind = 'unit' then p_data->>'ku_id' else p_data->>'question_id' end;
  -- Mã đi vào URL và vào tên tệp xuất dữ liệu, nên giới hạn ký tự ngay từ đây.
  if v_id is null or v_id !~ '^[A-Za-z0-9_-]{1,80}$' then
    raise exception 'Mã chỉ gồm chữ, số, dấu gạch ngang và gạch dưới';
  end if;

  -- Khoá theo phiên: hai giáo viên cùng sửa quan hệ tiên quyết một lúc có thể
  -- tạo ra vòng lặp mà mỗi người kiểm tra riêng đều thấy hợp lệ.
  perform pg_advisory_xact_lock(16001);

  if p_kind = 'unit' then
    if p_action = 'delete' then
      -- Không tự kiểm tra "mục này đã dùng chưa": khoá ngoại làm việc đó chắc
      -- chắn hơn, và báo lỗi khi mục đã có bài làm hay nhật ký tiết dạy.
      delete from knowledge_units where ku_id = v_id;
      return;
    end if;
    if length(trim(coalesce(p_data->>'ku_name',''))) = 0
       or length(trim(coalesce(p_data->>'lesson_id',''))) = 0 then
      raise exception 'Nhập tên mục và bài học';
    end if;
    if coalesce((p_data->>'order_index')::int, -1) < 0 then
      raise exception 'Thứ tự phải từ 0 trở lên';
    end if;

    -- Đi ngược chuỗi tiên quyết để chặn vòng lặp. Một vòng lặp ở đây khiến quy
    -- tắc R05 ("hổng kiến thức nền") đẩy học sinh đi vòng tròn mãi không ra.
    v_parent := nullif(p_data->>'prerequisite_ku','');
    v_seen := array[v_id];
    while v_parent is not null loop
      if v_parent = any(v_seen) then raise exception 'Quan hệ tiên quyết tạo vòng lặp'; end if;
      v_seen := array_append(v_seen, v_parent);
      if not exists (select 1 from knowledge_units where ku_id = v_parent) then
        raise exception 'Mục tiên quyết không tồn tại';
      end if;
      select prerequisite_ku into v_parent from knowledge_units where ku_id = v_parent;
    end loop;

    if p_action = 'create' then
      insert into knowledge_units(ku_id, ku_name, lesson_id, order_index, prerequisite_ku)
      values (v_id, trim(p_data->>'ku_name'), trim(p_data->>'lesson_id'),
              (p_data->>'order_index')::int, nullif(p_data->>'prerequisite_ku',''));
    else
      update knowledge_units
         set ku_name = trim(p_data->>'ku_name'),
             lesson_id = trim(p_data->>'lesson_id'),
             order_index = (p_data->>'order_index')::int,
             prerequisite_ku = nullif(p_data->>'prerequisite_ku','')
       where ku_id = v_id;
      if not found then raise exception 'Mục không còn tồn tại'; end if;
    end if;

  else
    -- CÂU HỎI ĐÃ CÓ BÀI LÀM THÌ KHÔNG SỬA, KHÔNG XOÁ.
    -- Sửa đề của một câu mà học sinh đã trả lời là làm hỏng bằng chứng: bảng
    -- quiz_answers vẫn ghi "em ấy sai câu này", nhưng "câu này" giờ đã là một
    -- câu khác. Mọi phân tích về mã lỗi sau đó đều nói về một đề không tồn tại
    -- lúc học sinh làm bài.
    if exists (select 1 from quiz_answers where question_id = v_id) then
      raise exception 'Câu hỏi đã có bài làm. Hãy tạo bản sao để bảo toàn kết quả cũ.';
    end if;

    if p_action = 'delete' then delete from questions where question_id = v_id; return; end if;
    if length(trim(coalesce(p_data->>'stem',''))) = 0 then raise exception 'Nhập đề bài'; end if;
    if not exists (select 1 from knowledge_units where ku_id = p_data->>'ku_id') then
      raise exception 'Chọn mục bài học hợp lệ';
    end if;
    if coalesce((p_data->>'level')::int, 0) not between 1 and 4
       or coalesce((p_data->>'expected_time_sec')::int, 0) not between 1 and 7200 then
      raise exception 'Cấp độ hoặc thời gian không hợp lệ';
    end if;
    if coalesce(p_data->>'correct_option','') not in ('A','B','C','D') then
      raise exception 'Chọn đáp án đúng';
    end if;
    if coalesce(jsonb_typeof(p_data->'options'),'null') <> 'array'
       or jsonb_array_length(p_data->'options') <> 4 then
      raise exception 'Cần đủ 4 đáp án';
    end if;
    if (select count(distinct x->>'option_key')
          from jsonb_array_elements(p_data->'options') x
         where x->>'option_key' in ('A','B','C','D')
           and length(trim(coalesce(x->>'option_text',''))) > 0) <> 4 then
      raise exception 'Nhập đầy đủ đáp án A, B, C, D';
    end if;

    if p_action = 'create' then
      insert into questions(question_id, ku_id, stem, level, expected_time_sec, correct_option)
      values (v_id, p_data->>'ku_id', p_data->>'stem', (p_data->>'level')::int,
              (p_data->>'expected_time_sec')::int, p_data->>'correct_option');
    else
      update questions
         set ku_id = p_data->>'ku_id', stem = p_data->>'stem',
             level = (p_data->>'level')::int,
             expected_time_sec = (p_data->>'expected_time_sec')::int,
             correct_option = p_data->>'correct_option'
       where question_id = v_id;
      if not found then raise exception 'Câu hỏi không còn tồn tại'; end if;
    end if;

    -- Xoá rồi nạp lại toàn bộ phương án, để không còn sót phương án cũ.
    delete from distractor_errors where question_id = v_id;
    delete from question_options where question_id = v_id;
    for v_option in select * from jsonb_array_elements(p_data->'options') loop
      insert into question_options values (v_id, v_option->>'option_key', v_option->>'option_text');
      -- Chỉ phương án SAI mới gắn được mã lỗi. Gắn mã lỗi vào đáp án đúng thì
      -- em nào làm đúng cũng bị chẩn đoán là mắc quan niệm sai.
      if nullif(v_option->>'error_code','') is not null
         and v_option->>'option_key' <> p_data->>'correct_option' then
        insert into distractor_errors values (v_id, v_option->>'option_key', v_option->>'error_code');
      end if;
    end loop;
  end if;
end $$;

-- Không mở cho người dùng đăng nhập. Học sinh gọi được hàm này là sửa được đề
-- bài và đáp án của chính mình.
revoke all on function public.manage_learning_content(text,text,jsonb) from public, anon, authenticated;
grant execute on function public.manage_learning_content(text,text,jsonb) to service_role;

comment on function public.manage_learning_content(text,text,jsonb) is
  'Thêm/sửa/xoá đơn vị kiến thức và câu hỏi trong một giao dịch. Chỉ service_role gọi được, sau khi API đã kiểm tra vai trò giáo viên.';

-- >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> 17-hoan-thanh-hoc-tap.sql
-- ===========================================================================
-- ĐO ĐỘ PHỦ VIDEO THEO GIÂY KHÁC NHAU + ĐỊNH NGHĨA "HOÀN THÀNH BÀI"
-- Chạy sau 15-view-tong-hop-va-lich-su.sql.
--
-- Vì sao không dùng tổng thời gian xem: tổng thời gian không phân biệt được em
-- xem hết bài với em tua đi tua lại một phút đầu, hay em để video chạy trong
-- một tab khác. Đếm những GIÂY KHÁC NHAU của video mà em ấy thực sự đi qua thì
-- tua lại không cộng thêm, và để chạy nền cũng không cộng thêm vì không có sự
-- kiện phát nào đi kèm.
--
-- Số liệu cũ KHÔNG chuyển đổi được sang thước đo này: từ tổng giờ xem không suy
-- ngược ra được em ấy đã đi qua những giây nào. Bảng này bắt đầu từ mốc cài đặt,
-- và trang /gv/hoan-thanh nói rõ điều đó thay vì lấp bằng một con số ước lượng.
--
-- ĐÂY KHÔNG PHẢI THÀNH PHẦN VIDEO CỦA LES. LES đo MỨC ĐỘ THAM GIA (giây xem có
-- tương tác, bảng learning_events); bảng này đo ĐỘ PHỦ NỘI DUNG. Hai câu hỏi
-- khác nhau, cố ý để riêng.
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- KIỂM TRA ĐIỀU KIỆN TRƯỚC
-- ---------------------------------------------------------------------------
do $$
begin
  if to_regclass('public.students') is null or to_regclass('public.contents') is null then
    raise exception E'\n\n>>> DỪNG LẠI: Phải chạy 01-schema.sql TRƯỚC tệp này. <<<\n';
  end if;
  if not exists (select 1 from information_schema.columns
                  where table_schema='public' and table_name='knowledge_units' and column_name='co_video') then
    raise exception E'\n\n>>> DỪNG LẠI: Phải chạy 07-noi-dung-chuong-1.sql TRƯỚC tệp này. Thiếu cột knowledge_units.co_video thì không phân biệt được mục KHÔNG có video bài học (luyện tập chung, ôn tập cuối chương) với mục có video mà học sinh chưa xem. <<<\n';
  end if;
  if not exists (select 1 from information_schema.columns
                  where table_schema='public' and table_name='quiz_attempts' and column_name='kind') then
    raise exception E'\n\n>>> DỪNG LẠI: Phải chạy 03-pha-sau-gio-hoc.sql TRƯỚC tệp này. Thiếu cột quiz_attempts.kind thì không tách được bài chuẩn bị với bài vận dụng. <<<\n';
  end if;
end $$;


-- ---------------------------------------------------------------------------
-- A. Những GIÂY của video mà học sinh đã đi qua
--
-- Khoá chính gồm cả second_index, nên ghi lại cùng một giây không nhân đôi —
-- tua lại lần thứ mười vẫn chỉ là một giây đã xem.
-- video_url nằm trong khoá: thầy cô đổi link video là một video KHÁC, độ phủ cũ
-- không được tính sang video mới.
-- ---------------------------------------------------------------------------
create table if not exists public.video_seconds (
  student_id   text references public.students(student_id),
  ku_id        text references public.knowledge_units(ku_id),
  video_url    text not null,
  second_index integer not null check (second_index >= 0 and second_index < 7200),
  first_seen   timestamptz not null default now(),
  primary key (student_id, ku_id, video_url, second_index)
);

alter table public.video_seconds enable row level security;
drop policy if exists "read own video coverage" on public.video_seconds;
create policy "read own video coverage" on public.video_seconds for select to authenticated
  using (student_id = public.my_student_id() or public.teaches_student(student_id));
-- Ghi bằng service role ở phía máy chủ — không mở policy insert cho người dùng.
-- Học sinh tự ghi được vào bảng này thì con số "đã xem 90%" mất hết giá trị.

comment on table public.video_seconds is
  'Mỗi dòng là một giây khác nhau của video mà học sinh đã đi qua. Tua lại không nhân đôi; đổi link video là bắt đầu đếm lại.';

create or replace view public.video_coverage with (security_invoker = true) as
select v.student_id, v.ku_id, v.video_url, count(*)::integer as unique_seconds
from public.video_seconds v
group by v.student_id, v.ku_id, v.video_url;


-- ---------------------------------------------------------------------------
-- B. "Hoàn thành bài" theo chuẩn flipped-v1
--
-- Ba hoạt động bắt buộc: xem đủ video, nộp bài chuẩn bị, nộp bài vận dụng.
-- Mục không có video bài học thì chỉ còn hai.
--
-- Tham số p_before cho phép hỏi "tính tới TRƯỚC GIỜ VÀO TIẾT thì em ấy đã chuẩn
-- bị chưa" — đó mới đúng là câu hỏi của mô hình lớp học đảo ngược. Hỏi "tới giờ
-- đã xem chưa" thì em xem sau tiết học vẫn được tính là đã chuẩn bị trước.
--
-- Trả về null (chứ không phải false) khi CHƯA ĐO ĐƯỢC: chưa gắn link video,
-- hoặc video chưa có thời lượng. Trả false ở đó là khẳng định em ấy không xem,
-- trong khi lỗi nằm ở phía nội dung chưa soạn xong.
-- ---------------------------------------------------------------------------
create or replace function public.learning_completion(
  p_student text, p_ku text, p_before timestamptz default now())
returns jsonb language plpgsql stable security invoker set search_path = public as $$
declare u record; v record; watched integer; prep boolean; applied boolean; video_ok boolean;
begin
  -- Học sinh chỉ hỏi được về chính mình; giáo viên hỏi được học sinh lớp mình.
  if not (p_student = my_student_id() or teaches_student(p_student)) then
    raise exception 'Không có quyền';
  end if;

  select * into u from knowledge_units where ku_id = p_ku;
  if not found then raise exception 'Không có mục bài học'; end if;

  -- Một mục có thể có nhiều dòng video (bản dự phòng, bản quay lại). Lấy dòng
  -- đầu theo content_id để câu trả lời ổn định giữa các lần gọi.
  select * into v from contents where ku_id = p_ku and kind = 'video' order by content_id limit 1;

  select count(*) into watched
    from video_seconds
   where student_id = p_student and ku_id = p_ku
     and video_url = v.url and second_index < v.duration_sec
     and first_seen < p_before;

  video_ok := case
                when u.co_video = false then true          -- mục không giao video
                when v.url is null or v.duration_sec is null or v.duration_sec <= 0 then null  -- CHƯA ĐO
                else watched >= ceil(v.duration_sec * .9)
              end;

  select exists (select 1 from quiz_attempts
                  where student_id = p_student and ku_id = p_ku
                    and kind = 'chuan-bi' and submitted_at < p_before),
         exists (select 1 from quiz_attempts
                  where student_id = p_student and ku_id = p_ku
                    and kind = 'van-dung' and submitted_at < p_before)
    into prep, applied;

  return jsonb_build_object(
    'video_complete',        video_ok,
    'unique_seconds',        watched,
    'video_percent',         case when v.duration_sec > 0
                                  then least(100, round(watched * 100.0 / v.duration_sec))
                                  else null end,
    'preparation_submitted', prep,
    'application_submitted', applied,
    -- "Đã chuẩn bị trước giờ học" = xem đủ video VÀ đã nộp bài chuẩn bị.
    'prepared',              video_ok and prep,
    'lesson_complete',       video_ok and prep and applied,
    'activities_complete',   case when u.co_video = false then 0
                                  when video_ok then 1 else 0 end + prep::int + applied::int,
    'activities_required',   case when u.co_video = false then 2 else 3 end,
    'definition_version',    'flipped-v1');
end $$;

revoke all on function public.learning_completion(text,text,timestamptz) from public;
grant execute on function public.learning_completion(text,text,timestamptz) to authenticated;

comment on function public.learning_completion(text,text,timestamptz) is
  'Chuẩn flipped-v1: xem đủ 90% số giây khác nhau của video, nộp bài chuẩn bị, nộp bài vận dụng. p_before để hỏi tình trạng TRƯỚC giờ vào tiết.';


-- ---------------------------------------------------------------------------
-- KIỂM TRA SAU KHI CHẠY
-- ---------------------------------------------------------------------------
select 'video_seconds' as bang, count(*) as so_dong from video_seconds;

-- >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> 18-danh-gia-va-mastery.sql
-- ===========================================================================
-- BÀI ĐÁNH GIÁ ĐẦU VÀO / CUỐI CHƯƠNG + MỨC LÀM CHỦ PHIÊN BẢN 2
-- Chạy sau 15-view-tong-hop-va-lich-su.sql. KHÔNG xoá dữ liệu cũ nào.
--
-- Tệp này đổi ĐỊNH NGHĨA MỨC LÀM CHỦ của cả hệ thống, nên phải đọc kỹ.
--
-- Bản v1 (dfle-engine/src/mastery.js, hàm computeMastery) xét theo ĐIỂM TỔNG
-- của lượt làm: quiz = 0,7·điểm lần đầu + 0,3·điểm cao nhất, rồi so với ngưỡng.
-- Chỗ hỏng: điểm tổng trộn câu dễ với câu khó thành một con số, nên không phân
-- biệt được "đúng 8/10 câu nhận biết" với "đúng 8/10 câu vận dụng" — mà đó đúng
-- là thứ mức làm chủ phải phân biệt.
--
-- Bản v2 ở đây xét bằng chứng ở mức TỪNG CÂU:
--   · mỗi câu chỉ tính LẦN TRẢ LỜI GẦN NHẤT — làm lại thay thế bằng chứng cũ,
--     không cộng dồn, nên cày lại nhiều lần không tự đẩy mức lên;
--   · chỉ xét 12 câu KHÁC NHAU gần nhất — hồ sơ phải phản ánh em ấy HIỆN TẠI;
--   · dưới 3 câu đáng tin thì trả NULL = CHƯA ĐỦ BẰNG CHỨNG, không trả 0.
--     Mức 0 nghĩa là "đã đo và chưa đạt"; null nghĩa là "chưa đo được gì".
--   · bằng chứng gộp chung từ bài chuẩn bị, bài vận dụng VÀ bài đánh giá chương
--     — một công thức duy nhất cho cả ba, không phải ba cách tính khác nhau.
--
-- Bản JavaScript đọc được và có test của đúng công thức này nằm ở
-- dfle-engine/src/mastery.js (computeMasteryV2) và test/mastery.test.js.
-- Sửa một bên thì phải sửa bên kia.
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- KIỂM TRA ĐIỀU KIỆN TRƯỚC
-- ---------------------------------------------------------------------------
do $$
begin
  if to_regclass('public.students') is null then
    raise exception E'\n\n>>> DỪNG LẠI: Phải chạy 01-schema.sql TRƯỚC tệp này. <<<\n';
  end if;
  if to_regclass('public.mastery_history') is null then
    raise exception E'\n\n>>> DỪNG LẠI: Phải chạy 15-view-tong-hop-va-lich-su.sql TRƯỚC tệp này. Hàm refresh_mastery_v2 ghi mỗi lần đổi mức vào bảng mastery_history do tệp 15 tạo ra; chưa có bảng đó thì lịch sử tiến bộ mất trắng mà không báo gì. <<<\n';
  end if;
  if not exists (select 1 from information_schema.columns
                  where table_schema='public' and table_name='quiz_attempts' and column_name='kind') then
    raise exception E'\n\n>>> DỪNG LẠI: Phải chạy 03-pha-sau-gio-hoc.sql TRƯỚC tệp này. <<<\n';
  end if;
  if (select count(*) from questions) = 0 then
    raise exception E'\n\n>>> DỪNG LẠI: Phải chạy 07-noi-dung-chuong-1.sql TRƯỚC tệp này. Chưa có câu hỏi nào thì không ra được đề đánh giá. <<<\n';
  end if;
end $$;


-- ---------------------------------------------------------------------------
-- A. Bài đánh giá — đề được CHỤP LẠI vào lúc phát đề
--
-- Cột questions giữ nguyên đề đã phát, kể cả khi sau đó giáo viên sửa ngân hàng
-- câu hỏi. Không chụp lại thì một em làm bài hôm nay, giáo viên sửa đề ngày mai,
-- và kết quả cũ trở thành không giải thích được.
-- ---------------------------------------------------------------------------
create table if not exists public.assessments (
  id           uuid primary key default gen_random_uuid(),
  student_id   text not null references students(student_id),
  chapter_id   text not null,
  kind         text not null check (kind in ('dau-vao','chuong')),
  started_at   timestamptz not null default now(),
  submitted_at timestamptz,
  questions    jsonb not null,   -- đề đã chụp, CÓ chứa đáp án đúng
  answers      jsonb,
  result       jsonb,
  active_seconds integer,
  version      text not null default 'assessment-v1'
);

alter table assessments enable row level security;
-- Bản chụp đề CÓ chứa correct_option. Học sinh đọc được bảng này là đọc được
-- đáp án của chính bài mình đang làm, nên KHÔNG mở cho người dùng đăng nhập:
-- đề đi tới học sinh qua API, đã cắt bỏ cột đáp án.
revoke all on assessments from anon, authenticated;
grant all on assessments to service_role;

create index if not exists assessment_student on assessments(student_id, started_at desc);
-- Mỗi học sinh chỉ có MỘT bài đang mở cho mỗi chương và mỗi loại. Mở hai tab thì
-- tab thứ hai nhận lại đúng bài đang làm dở, không sinh đề mới.
create unique index if not exists assessment_one_open
  on assessments(student_id, chapter_id, kind) where submitted_at is null;

-- Mức làm chủ nay CÓ THỂ là null (chưa đủ bằng chứng) — xem khối đầu tệp.
alter table mastery_states  alter column mastery_level drop not null;
alter table mastery_history alter column mastery_level drop not null;

comment on table assessments is
  'Bài đánh giá đầu vào và cuối chương. Đề được chụp lại lúc phát, nên kết quả cũ vẫn giải thích được sau khi ngân hàng câu hỏi thay đổi.';


-- ---------------------------------------------------------------------------
-- B. Tính lại mức làm chủ — MỘT công thức cho cả ba loại bài
-- ---------------------------------------------------------------------------
create or replace function public.refresh_mastery_v2(p_student text, p_ku text)
returns jsonb language plpgsql set search_path = public as $$
declare ev jsonb; n integer; applied integer; transfer integer;
        ratio numeric; ar numeric; tr numeric; lvl integer; state text; out_data jsonb;
begin
  -- Hai lượt nộp gần nhau của cùng một em, cùng một mục, có thể đọc cùng một
  -- tập bằng chứng rồi ghi đè lẫn nhau. Khoá theo (học sinh, mục).
  perform pg_advisory_xact_lock(hashtext(p_student || '|' || p_ku));

  with evidence as (
    -- (1) bằng chứng từ bài chuẩn bị và bài vận dụng
    select q.question_id, q.level, a.is_correct, t.submitted_at as ts,
      -- LƯỢT KHÔNG ĐÁNG TIN: vừa điểm thấp vừa làm quá nhanh — dấu hiệu bấm bừa.
      -- Bằng chứng của lượt đó bị LOẠI, không bị tính là sai.
      --
      -- coalesce(..., true) là một sửa lỗi, không phải cho đẹp: thiếu
      -- time_on_task_sec thì vế so sánh ra NULL, `where valid` loại luôn dòng
      -- đó, và bằng chứng của ĐÚNG nhóm học sinh yếu (điểm dưới 5) bị vứt đi —
      -- các em ấy mắc kẹt ở "chưa đủ dữ liệu" và không bao giờ được chẩn đoán.
      -- Thiếu số đo thời gian phải hiểu là KHÔNG có căn cứ nghi bấm bừa.
      coalesce(
        not (t.score < 5
             and t.time_on_task_sec < .3 * (select sum(z.expected_time_sec)
                                              from quiz_answers za
                                              join questions z using (question_id)
                                             where za.attempt_id = t.attempt_id)),
        true) as valid
    from quiz_answers a
    join quiz_attempts t using (attempt_id)
    join questions q using (question_id)
    where t.student_id = p_student and q.ku_id = p_ku and t.ku_id = p_ku

    union all

    -- (2) bằng chứng từ bài đánh giá đầu vào / cuối chương
    select x->>'question_id', (x->>'level')::int, (x->>'is_correct')::boolean, s.submitted_at,
      coalesce(
        not ((s.result->>'score')::numeric < 5
             and s.active_seconds < .3 * (select sum((q->>'expected_time_sec')::int)
                                            from jsonb_array_elements(s.questions) q)),
        true)
    from assessments s
    cross join lateral jsonb_array_elements(s.result->'answers') x
    where s.student_id = p_student and s.submitted_at is not null and x->>'ku_id' = p_ku
  ), latest as (
    -- mỗi câu giữ lần trả lời GẦN NHẤT
    select distinct on (question_id) * from evidence where valid order by question_id, ts desc
  ), recent as (
    -- chỉ xét 12 câu khác nhau gần nhất
    select * from latest order by ts desc, question_id limit 12
  )
  select count(*), count(*) filter (where level >= 3), count(*) filter (where level = 4),
         avg(is_correct::int),
         avg(is_correct::int) filter (where level >= 3),
         avg(is_correct::int) filter (where level = 4),
         jsonb_agg(jsonb_build_object('question_id', question_id, 'level', level,
                                      'correct', is_correct, 'at', ts)
                   order by ts desc, question_id)
    into n, applied, transfer, ratio, ar, tr, ev
    from recent;

  if n < 3 then
    lvl := null; state := 'insufficient';   -- CHƯA ĐỦ BẰNG CHỨNG, không phải mức 0
  else
    state := 'measured';
    lvl := 0;
    if ratio >= .5 then lvl := 1; end if;
    -- Mức 2 phải có ít nhất 2 câu VẬN DỤNG (mức >= 3) đúng từ 65%: điểm cao
    -- trên toàn câu dễ không chứng minh được em ấy vận dụng được.
    if ratio >= .65 and applied  >= 2 and ar >= .65 then lvl := 2; end if;
    -- Mức 3 phải có ít nhất 2 câu TÌNH HUỐNG MỚI (mức 4).
    if ratio >= .8  and transfer >= 2 and tr >= .65 then lvl := 3; end if;
  end if;

  out_data := jsonb_build_object(
    'version','mastery-v2', 'status', state,
    'index', case when n >= 3 then round(ratio, 3) else null end,
    'question_count', n, 'applied_count', applied, 'transfer_count', transfer,
    'observations', coalesce(ev, '[]'::jsonb));

  insert into mastery_states(student_id, ku_id, mastery_level, evidence, updated_at)
  values (p_student, p_ku, lvl, out_data, now())
  on conflict (student_id, ku_id) do update
     set mastery_level = excluded.mastery_level,
         evidence = excluded.evidence,
         updated_at = excluded.updated_at
   where mastery_states.evidence is distinct from excluded.evidence
      or mastery_states.mastery_level is distinct from excluded.mastery_level;

  -- Chỉ ghi lịch sử khi bằng chứng THỰC SỰ đổi (mệnh đề where ở trên). Ghi mọi
  -- lượt chấm sẽ biến bảng lịch sử thành bản sao của quiz_attempts.
  if found then
    insert into mastery_history(student_id, ku_id, mastery_level, evidence)
    values (p_student, p_ku, lvl, out_data);
  end if;

  return out_data || jsonb_build_object('level', lvl);
end $$;

comment on function public.refresh_mastery_v2(text,text) is
  'Mức làm chủ v2: 12 câu khác nhau gần nhất, mỗi câu tính lần trả lời mới nhất, dưới 3 câu đáng tin thì trả null. Bản JavaScript đối chiếu: dfle-engine/src/mastery.js.';


-- ---------------------------------------------------------------------------
-- C. Nộp bài đánh giá — chấm ở máy chủ, rồi tính lại mức cho từng mục
-- ---------------------------------------------------------------------------
create or replace function public.submit_assessment(
  p_id uuid, p_student text, p_answers jsonb, p_active integer)
returns jsonb language plpgsql set search_path = public as $$
declare s assessments%rowtype; q jsonb; chosen text; graded jsonb := '[]'; r jsonb;
        totals jsonb; mastery jsonb := '{}'; ku text; m jsonb; total integer; correct integer;
begin
  select * into s from assessments where id = p_id and student_id = p_student for update;
  if not found then raise exception 'Không tìm thấy bài làm'; end if;
  -- Nộp lại lần hai trả về đúng kết quả lần đầu, không chấm lại và không cộng
  -- thêm bằng chứng.
  if s.submitted_at is not null then return s.result; end if;

  if jsonb_typeof(p_answers) is distinct from 'object' then raise exception 'Câu trả lời không hợp lệ'; end if;
  if (select count(*) from jsonb_object_keys(p_answers)) <> jsonb_array_length(s.questions) then
    raise exception 'Cần nộp đủ các câu trong đề';
  end if;

  -- Chấm theo BẢN ĐỀ ĐÃ CHỤP, không đọc lại bảng questions: đề có thể đã bị sửa
  -- sau lúc phát, và học sinh phải được chấm theo đúng đề mình đã nhìn thấy.
  for q in select * from jsonb_array_elements(s.questions) loop
    if not p_answers ? (q->>'question_id') then raise exception 'Thiếu câu trả lời'; end if;
    chosen := p_answers->>(q->>'question_id');
    if chosen is not null
       and not exists (select 1 from jsonb_array_elements(q->'options') o where o->>'option_key' = chosen) then
      raise exception 'Phương án không hợp lệ';
    end if;
    graded := graded || jsonb_build_array(jsonb_build_object(
      'question_id', q->>'question_id', 'ku_id', q->>'ku_id', 'level', (q->>'level')::int,
      'chosen_option', chosen, 'is_correct', coalesce(chosen = q->>'correct_option', false)));
  end loop;

  select count(*), count(*) filter (where (x->>'is_correct')::boolean)
    into total, correct from jsonb_array_elements(graded) x;
  select jsonb_agg(z) into totals from (
    select x->>'ku_id' as ku_id, count(*) as total,
           count(*) filter (where (x->>'is_correct')::boolean) as correct,
           round(10.0 * count(*) filter (where (x->>'is_correct')::boolean) / count(*), 1) as score
      from jsonb_array_elements(graded) x group by x->>'ku_id') z;

  r := jsonb_build_object('score', round(correct * 10.0 / total, 1),
                          'total', total, 'correct', correct,
                          'answers', graded, 'by_unit', totals);

  update assessments
     set submitted_at = now(), answers = p_answers,
         -- Thời gian tương tác do trình duyệt báo, nhưng không được vượt quá
         -- thời gian thật từ lúc phát đề: đó là chặn khai khống.
         active_seconds = greatest(0, least(coalesce(p_active, 0),
                                            extract(epoch from now() - started_at)::integer)),
         result = r
   where id = p_id;

  -- Tính lại mức làm chủ cho TỪNG mục có câu trong đề.
  for ku in select distinct x->>'ku_id' from jsonb_array_elements(graded) x order by 1 loop
    m := refresh_mastery_v2(p_student, ku);
    mastery := mastery || jsonb_build_object(ku, m);
  end loop;

  r := r || jsonb_build_object('mastery', mastery);
  update assessments set result = r where id = p_id;
  return r;
end $$;

-- Hai hàm này chấm bài và ghi mức làm chủ, nên chỉ máy chủ gọi được.
revoke all on function public.refresh_mastery_v2(text,text) from public, anon, authenticated;
revoke all on function public.submit_assessment(uuid,text,jsonb,integer) from public, anon, authenticated;
grant execute on function public.refresh_mastery_v2(text,text) to service_role;
grant execute on function public.submit_assessment(uuid,text,jsonb,integer) to service_role;


-- ---------------------------------------------------------------------------
-- KIỂM TRA SAU KHI CHẠY
-- ---------------------------------------------------------------------------
select 'assessments' as bang, count(*) as so_dong from assessments
union all select 'mastery_history', count(*) from mastery_history;

-- >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> 20-va-lo-hong-phan-quyen.sql
-- =============================================================================
-- 20 · VÁ HAI LỖ HỔNG PHÂN QUYỀN
-- -----------------------------------------------------------------------------
-- Phát hiện ngày 22/9/2026 khi kiểm thử phân quyền trên PostgreSQL 16 cục bộ,
-- với 2 giáo viên, 3 học sinh thuộc 2 lớp. Kết quả đầy đủ:
--   02-Nhat-ky-nghien-cuu/KET-QUA-KIEM-THU-PHAN-QUYEN-22-09-2026.md
--
-- CHẠY NGAY, dù đang giữa đợt thực nghiệm. Lỗ hổng 1 cho phép học sinh xem đáp
-- án đúng của cả 80 câu — tức là làm sai chính số liệu đang thu. Đây đúng là
-- trường hợp ngoại lệ "lỗi làm sai số liệu thì sửa ngay". Ghi ngày chạy vào sổ
-- nhật ký nghiên cứu.
--
-- Tệp này KHÔNG đổi giao diện, KHÔNG đổi cách chấm, KHÔNG đổi thuật toán. Học
-- sinh dùng hệ thống sẽ không thấy khác gì.
--
-- Chạy lại nhiều lần vẫn an toàn.
-- =============================================================================


-- -----------------------------------------------------------------------------
-- LỖ HỔNG 1 · Học sinh đọc được cột đáp án đúng (correct_option) của 80 câu.
--
-- Chính sách "doc de bai" cho mọi tài khoản đã đăng nhập đọc bảng questions,
-- và chú thích ở tệp 01 đã nói rõ: RLS của Postgres không lọc theo cột, nên
-- "ứng dụng chỉ truy vấn qua view" questions_public. Nhưng khoá anon nằm
-- công khai trong trình duyệt. Một em mở DevTools, gõ
--     supabase.from('questions').select('question_id, correct_option')
-- là có đủ đáp án — không cần đi qua ứng dụng.
--
-- Cách vá: phân quyền THEO CỘT. Học sinh và giáo viên (vai authenticated) chỉ
-- được đọc 5 cột không phải đáp án. Mọi chỗ trong ứng dụng cần đáp án đều đọc
-- bằng khoá service_role phía máy chủ (quiz/submit, danh-gia, quan-ly, goi-y)
-- — đã rà từng tệp — nên không chỗ nào bị ảnh hưởng. View questions_public
-- chỉ lấy đúng 5 cột này nên vẫn chạy như cũ.
-- -----------------------------------------------------------------------------

revoke select on public.questions from anon, authenticated;
grant  select (question_id, ku_id, level, stem, expected_time_sec)
       on public.questions to authenticated;


-- -----------------------------------------------------------------------------
-- LỖ HỔNG 2 · Giáo viên đọc được lịch sử mức làm chủ của học sinh LỚP KHÁC.
--
-- Mọi bảng khác dùng teaches_student() — chỉ lớp mình dạy. Riêng bảng
-- mastery_history dùng is_teacher() — hễ là giáo viên là đọc được hết. Nhẹ
-- hơn lỗ hổng 1, nhưng lệch khỏi quy tắc chung của cả hệ thống, và là dữ liệu
-- của học sinh chưa thành niên.
-- -----------------------------------------------------------------------------

drop policy if exists "doc lich su mastery" on public.mastery_history;
create policy "doc lich su mastery" on public.mastery_history
  for select to authenticated
  using (student_id = my_student_id() or teaches_student(student_id));


-- -----------------------------------------------------------------------------
-- KIỂM TRA SAU KHI CHẠY — kết quả phải là hai dòng "ĐÃ VÁ".
-- -----------------------------------------------------------------------------

select case when has_column_privilege('authenticated', 'public.questions', 'correct_option', 'select')
            then '❌ CHƯA VÁ: học sinh vẫn đọc được đáp án'
            else '✅ ĐÃ VÁ: học sinh không đọc được cột đáp án' end as lo_hong_1
union all
select case when exists (select 1 from pg_policies
                         where tablename = 'mastery_history'
                           and qual like '%teaches_student%')
            then '✅ ĐÃ VÁ: giáo viên chỉ đọc lịch sử lớp mình'
            else '❌ CHƯA VÁ: giáo viên đọc được lịch sử mọi lớp' end;

-- >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> 21-cau-muc-4-bo-sung-KHUNG.sql
-- =============================================================================
-- 21 · CÂU MỨC 4 BỔ SUNG — KHUNG ĐỂ HỌC SINH SOẠN. CHƯA CHẠY.
-- -----------------------------------------------------------------------------
-- CHỈ CHẠY SAU KHI KẾT THÚC CAN THIỆP (sau 16/10). Thêm câu hỏi giữa đợt là đổi
-- bài vận dụng mà học sinh nhóm thực nghiệm đang làm.
--
-- VÌ SAO CẦN — một lỗi hồi quy do mastery v2 gây ra
--
-- Tệp 09 thêm đúng MỘT câu mức 4 cho mỗi đơn vị, vì công thức mastery v1 lúc đó
-- chỉ cần "điểm bài mức 4 từ 6,5". Ngày 15/9 chuyển sang mastery v2, và v2 đòi
-- mức 3 phải có ÍT NHẤT 2 CÂU MỨC 4 KHÁC NHAU trong 12 câu gần nhất:
--
--     if ratio >= .8 and transfer >= 2 and tr >= .65 then lvl := 3;   -- tệp 18
--
-- Ngân hàng có nhiều nhất 1 câu mức 4 mỗi đơn vị → transfer không bao giờ đạt 2
-- → KHÔNG HỌC SINH NÀO CÓ THỂ ĐẠT MỨC 3, ở bất kỳ đơn vị nào, kể cả em làm đúng
-- tất cả. Mô phỏng 40 học sinh (dfle-engine/cli/mo-phong-v2.js) xác nhận: 0/560.
-- Đơn vị C1-B3-M3 còn tệ hơn: chỉ có 1 câu mức ≥ 3 nên trần là mức 1.
--
-- Cách sửa đúng là thêm câu hỏi, không phải hạ ngưỡng: "vận dụng trong tình
-- huống mới" đo bằng MỘT câu thì một lần đoán trúng là đủ lên mức cao nhất.
--
-- Cũng giải quyết luôn R02: quy tắc R02 hứa "giao bài toán thực tiễn" nhưng hệ
-- thống chưa có nội dung nào như vậy. Câu mức 4 đặt trong bối cảnh thực tiễn
-- chính là thứ đó, và trang /hoc/<ku>/van-dung tự lấy câu mức 3–4, không phải
-- sửa giao diện.
--
-- CẦN SOẠN 18 CÂU
--   10 đơn vị đã có Q06   → thêm Q07                        : 10 câu
--   C1-B3-M3, C1-LTC1, C1-LTC2, C1-CUOI chưa có câu mức 4   → thêm Q06, Q07 : 8 câu
--
-- ĐÂY LÀ VIỆC NÊN ĐỂ HỌC SINH LÀM. Soạn câu hỏi có phương án nhiễu gắn đúng quan
-- niệm sai là việc chứng minh rõ nhất "mức độ đóng góp độc lập của học sinh" khi
-- phỏng vấn. Ghi tên người soạn từng câu vào sổ nhật ký nghiên cứu.
--
-- Yêu cầu mỗi câu:
--   · tình huống MỚI (bối cảnh thực tiễn, hoặc nối hai đơn vị) — không phải bài
--     mức 3 làm khó thêm bằng số xấu
--   · 4 phương án, đúng 1 phương án đúng
--   · mỗi phương án nhiễu gắn một mã lỗi có trong error_dictionary nếu nó phản
--     ánh một quan niệm sai; không gán bừa cho đủ
--   · thời gian dự kiến 120–180 giây
--   · KHÔNG trùng với câu nào trong đề kiểm tra pre/post
-- =============================================================================

do $$
begin
  if to_regclass('public.questions') is null then
    raise exception E'\n\n>>> DỪNG LẠI: Phải chạy 01, 07, 09 trước tệp này. <<<\n';
  end if;
  if current_date < date '2026-10-17' then
    raise exception E'\n\n>>> DỪNG LẠI: Tệp này chỉ chạy SAU khi kết thúc can thiệp (sau 16/10/2026). <<<\n'
      '    Thêm câu hỏi giữa đợt là thay đổi bài vận dụng của nhóm thực nghiệm.\n';
  end if;
end $$;

-- -----------------------------------------------------------------------------
-- MẪU — một câu soạn sẵn để xem định dạng. Bỏ dấu -- ở đầu dòng khi dùng.
-- Câu này đã kiểm tra đáp án: 2/5 · 3/4 = 3/10 ; 3/10 < 1/3 nên cần mua thêm.
-- -----------------------------------------------------------------------------
-- insert into questions (question_id, ku_id, level, stem, correct_option, expected_time_sec) values
--   ('C1-B2-M2-Q07', 'C1-B2-M2', 4,
--    'Bạn Lan có 3/4 kg bột. Lan dùng 2/5 số bột đó để làm bánh. Công thức cần 1/3 kg bột. Lan đã dùng đủ bột theo công thức chưa?',
--    'A', 150)
-- on conflict (question_id) do nothing;
--
-- insert into question_options (question_id, option_key, option_text) values
--   ('C1-B2-M2-Q07', 'A', 'Chưa đủ: Lan mới dùng 3/10 kg, ít hơn 1/3 kg'),
--   ('C1-B2-M2-Q07', 'B', 'Đủ: Lan dùng 2/5 kg, nhiều hơn 1/3 kg'),
--   ('C1-B2-M2-Q07', 'C', 'Đủ: Lan dùng 23/20 kg'),
--   ('C1-B2-M2-Q07', 'D', 'Chưa đủ: Lan mới dùng 7/20 kg')
-- on conflict (question_id, option_key) do nothing;
--
-- insert into distractor_errors (question_id, option_key, error_code) values
--   ('C1-B2-M2-Q07', 'C', '<mã lỗi cộng thay vì nhân — tra error_dictionary>')
-- on conflict (question_id, option_key) do nothing;

-- -----------------------------------------------------------------------------
-- 18 CHỖ TRỐNG — học sinh soạn vào đây theo đúng mẫu trên
-- -----------------------------------------------------------------------------
--   C1-B1-M1-Q07     ☐ người soạn: ______   ngày: ______
--   C1-B1-M1B-Q07    ☐
--   C1-B1-M2-Q07     ☐
--   C1-B2-M1-Q07     ☐
--   C1-B2-M2-Q07     ☐   (có thể dùng câu mẫu ở trên)
--   C1-B2-M3-Q07     ☐
--   C1-B3-M1-Q07     ☐
--   C1-B3-M2-Q07     ☐
--   C1-B4-M1-Q07     ☐
--   C1-B4-M2-Q07     ☐
--   C1-B3-M3-Q06     ☐       C1-B3-M3-Q07     ☐
--   C1-LTC1-Q06      ☐       C1-LTC1-Q07      ☐
--   C1-LTC2-Q06      ☐       C1-LTC2-Q07      ☐
--   C1-CUOI-Q06      ☐       C1-CUOI-Q07      ☐

-- -----------------------------------------------------------------------------
-- KIỂM TRA — mọi dòng phải là ✅ thì mức 3 mới đạt được ở mọi đơn vị
-- -----------------------------------------------------------------------------
select k.ku_id,
       count(q.*) filter (where q.level = 4) as cau_muc_4,
       count(q.*) filter (where q.level >= 3) as cau_muc_3_4,
       case when count(q.*) filter (where q.level = 4) >= 2 then '✅ đạt được mức 3'
            when count(q.*) filter (where q.level >= 3) >= 2 then '⚠ trần là mức 2'
            else '❌ trần là mức 1' end as tran_mastery
  from knowledge_units k left join questions q using (ku_id)
 where k.ku_id like 'C1-%'
 group by k.ku_id, k.order_index
 order by k.order_index;

-- >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> 23-alre-recovery-schema.sql
-- ============================================================================
-- DFLE-M7 · HỆ THỐNG PHỤC HỒI NHẬN THỨC THÍCH ỨNG (ALRE RECOVERY SCHEMA)
-- ============================================================================
-- File: 23-alre-recovery-schema.sql
-- Mục đích:
--   1. Tạo bảng learning_recovery_records lưu trữ chu trình 4 pha của ALRE:
--      (GDVM Lọc đoán mò -> RCGT Truy vết lỗi gốc -> ARIO Bandit Can thiệp -> CLVT Đo lường Gain)
--   2. Tạo view teacher_intervention_queue phục vụ buồng lái giáo viên (Human-in-the-loop)
--   3. Cấp quyền RLS cho giáo viên và học sinh
-- ============================================================================

-- 1. BẢNG LƯU TRỮ HỒ SƠ PHỤC HỒI NHẬN THỨC (learning_recovery_records)
CREATE TABLE IF NOT EXISTS learning_recovery_records (
  recovery_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id TEXT NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
  ku_id TEXT NOT NULL REFERENCES knowledge_units(ku_id),
  manifest_error TEXT NOT NULL,                         -- Lỗi biểu hiện bề mặt (vd: E-TT-01)
  root_cause_error TEXT,                                -- Lỗi gốc chẩn đoán từ DAG (vd: E-HT-02)
  target_ku_id TEXT REFERENCES knowledge_units(ku_id),   -- Đơn vị kiến thức cần bù đắp (vd: C1-B1-M1)
  guess_score NUMERIC(4, 3) DEFAULT 0.000,              -- Điểm đoán mò G in [0, 1]
  is_rapid_guess BOOLEAN DEFAULT FALSE,                 -- Cờ làm bài siêu tốc bất thường
  selected_arm TEXT NOT NULL CHECK (
    selected_arm IN ('micro_lesson', 'scaffold_hint', 'jigsaw_peer', 'teacher_queue')
  ),                                                    -- Cánh tay can thiệp LinUCB
  status TEXT NOT NULL DEFAULT 'detected' CHECK (
    status IN ('detected', 'in_remediation', 'verified_success', 'escalated')
  ),                                                    -- Trạng thái máy phục hồi
  attempt_count INT DEFAULT 1,                          -- Số lượt can thiệp đã thử
  pre_score NUMERIC(4, 2) DEFAULT 0.00,                 -- Điểm trước can thiệp (0-10)
  post_score NUMERIC(4, 2),                             -- Điểm kiểm chứng sau can thiệp (0-10)
  learning_gain NUMERIC(4, 3),                          -- Chỉ số tiến bộ g của Hake
  teacher_pedagogical_prompt TEXT,                      -- Gợi ý câu hỏi sư phạm 1-1 cho giáo viên
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Chỉ mục tối ưu truy vấn
CREATE INDEX IF NOT EXISTS idx_recovery_student ON learning_recovery_records(student_id);
CREATE INDEX IF NOT EXISTS idx_recovery_ku ON learning_recovery_records(ku_id);
CREATE INDEX IF NOT EXISTS idx_recovery_status ON learning_recovery_records(status);

-- 2. VIEW HÀNG ĐỢI CAN THIỆP CỦA GIÁO VIÊN (teacher_intervention_queue)
-- Tự động tổng hợp các ca khẩn cấp cần giáo viên can thiệp 1-1 trực tiếp trên lớp:
-- Bao gồm các ca trạng thái 'escalated' HOẶC 'teacher_queue' HOẶC tái phát nhiều lần
CREATE OR REPLACE VIEW teacher_intervention_queue AS
SELECT
  r.recovery_id,
  r.student_id,
  s.display_name AS student_name,
  s.class_id,
  c.class_code,
  r.ku_id,
  ku.ku_name,
  r.manifest_error,
  ed_manifest.misconception AS manifest_error_name,
  r.root_cause_error,
  COALESCE(ed_root.misconception, r.root_cause_error) AS root_cause_name,
  r.target_ku_id,
  target_ku.ku_name AS target_ku_name,
  r.guess_score,
  r.is_rapid_guess,
  r.selected_arm,
  r.status,
  r.attempt_count,
  r.pre_score,
  r.post_score,
  r.learning_gain,
  r.teacher_pedagogical_prompt,
  r.created_at,
  -- Điểm ưu tiên can thiệp sư phạm (Priority Score):
  -- Ưu tiên cao hơn nếu tái phát nhiều lần, điểm đoán mò cao hoặc thụt lùi
  ROUND(
    (CASE WHEN r.status = 'escalated' THEN 5.0 ELSE 2.0 END) +
    (r.attempt_count * 1.5) +
    (r.guess_score * 2.0) -
    COALESCE(r.learning_gain * 3.0, 0),
    2
  ) AS priority_score
FROM learning_recovery_records r
JOIN students s ON r.student_id = s.student_id
JOIN classes c ON s.class_id = c.class_id
JOIN knowledge_units ku ON r.ku_id = ku.ku_id
LEFT JOIN knowledge_units target_ku ON r.target_ku_id = target_ku.ku_id
LEFT JOIN error_dictionary ed_manifest ON r.manifest_error = ed_manifest.error_code
LEFT JOIN error_dictionary ed_root ON r.root_cause_error = ed_root.error_code
WHERE r.status = 'escalated' OR r.selected_arm = 'teacher_queue' OR r.attempt_count >= 2
ORDER BY priority_score DESC, r.created_at DESC;

-- 3. CHÍNH SÁCH BẢO MẬT HÀNG (RLS)
ALTER TABLE learning_recovery_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Giao vien xem ho so phuc hoi cua lop minh" ON learning_recovery_records;
CREATE POLICY "Giao vien xem ho so phuc hoi cua lop minh"
  ON learning_recovery_records
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM students s
      JOIN classes c ON s.class_id = c.class_id
      WHERE s.student_id = learning_recovery_records.student_id
        AND c.teacher_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Giao vien cap nhat trang thai ho so phuc hoi" ON learning_recovery_records;
CREATE POLICY "Giao vien cap nhat trang thai ho so phuc hoi"
  ON learning_recovery_records
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM students s
      JOIN classes c ON s.class_id = c.class_id
      WHERE s.student_id = learning_recovery_records.student_id
        AND c.teacher_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Hoc sinh xem ho so phuc hoi cua chinh minh" ON learning_recovery_records;
CREATE POLICY "Hoc sinh xem ho so phuc hoi cua chinh minh"
  ON learning_recovery_records
  FOR SELECT
  USING (student_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Không tự chèn hồ sơ giả vào học sinh. Dữ liệu minh họa chỉ được nạp riêng vào lớp DEMO.

-- >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> 26-phan-hoi-goi-y.sql
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

-- >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> 27-recovery-workflow.sql
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

-- >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> 28-support-pilot.sql
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

-- >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> 30-nhat-ky-nghien-cuu.sql
-- =============================================================================
-- 26 · SỔ NHẬT KÝ NGHIÊN CỨU ĐIỆN TỬ
-- -----------------------------------------------------------------------------
-- Vì sao cần. Quy chế coi nhật ký nghiên cứu là chứng cứ gốc về mức độ tham gia
-- thực chất của học sinh, và dự thảo Thông tư còn đưa nó thành tài liệu bắt buộc
-- trong hồ sơ, kèm hai tiêu chí chấm riêng: mức độ độc lập của học sinh, và
-- đóng góp của từng thành viên.
--
-- Sổ giấy ghi bù một đêm trước khi nộp thì giám khảo nhìn ra. Sổ này không ghi
-- bù được: mỗi mục mang DẤU THỜI GIAN CỦA MÁY CHỦ, và bảng KHÔNG CHO SỬA, KHÔNG
-- CHO XOÁ. Muốn đính chính thì ghi một mục mới trỏ về mục cũ kèm lý do; cả hai
-- cùng nằm đó. Đúng cách một sổ nhật ký nghiên cứu phải hoạt động.
--
-- Ngày làm việc (cột ngay) do người ghi tự khai và có thể là ngày đã qua — vì có
-- hôm làm xong tối mới ngồi ghi. Nhưng GIỜ GHI thì máy chủ đóng, không ai đổi
-- được. Khoảng cách giữa hai cột đó chính là thứ nói lên sổ có được ghi đều hay
-- không.
--
-- Chạy lại nhiều lần vẫn an toàn.
-- =============================================================================

do $$
begin
  if to_regclass('public.profiles') is null then
    raise exception E'\n\n>>> DỪNG LẠI: phải chạy 01-schema.sql trước. <<<\n';
  end if;
end $$;

-- -----------------------------------------------------------------------------
-- 1. Vai trò mới: học sinh thực hiện dự án nghiên cứu
--    Khác với 'hoc-sinh' (người học trong đợt thực nghiệm). Hai em làm dự án cần
--    ghi nhật ký nhưng KHÔNG được xem dữ liệu học tập của bạn cùng lớp.
-- -----------------------------------------------------------------------------
do $$
declare v_ten text;
begin
  select conname into v_ten from pg_constraint
   where conrelid = 'public.profiles'::regclass and contype = 'c'
     and pg_get_constraintdef(oid) ilike '%role%';
  if v_ten is not null then
    execute format('alter table public.profiles drop constraint %I', v_ten);
  end if;
  alter table public.profiles
    add constraint profiles_role_check check (role in ('hoc-sinh','giao-vien','hoc-sinh-nckh'));
end $$;

create or replace function public.la_hs_nckh() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select role = 'hoc-sinh-nckh' from profiles where id = auth.uid()), false)
$$;

-- -----------------------------------------------------------------------------
-- 2. Bảng nhật ký
-- -----------------------------------------------------------------------------
create table if not exists nhat_ky_nghien_cuu (
  id            uuid primary key default gen_random_uuid(),
  ngay          date        not null,                    -- ngày LÀM VIỆC, người ghi khai
  ghi_luc       timestamptz not null default now(),      -- giờ GHI, máy chủ đóng
  tac_gia       uuid        not null references auth.users(id),
  tac_gia_ten   text        not null,                    -- chụp lại tên lúc ghi
  tac_gia_vai   text        not null,                    -- 'hoc-sinh-nckh' hoặc 'giao-vien'
  cong_viec     text        not null,                    -- đã làm gì
  phuong_phap   text,                                    -- làm bằng cách nào
  ket_qua       text,                                    -- kết quả giai đoạn
  vai_tro       text,                                    -- ai làm phần nào
  cong_cu_ai    text,                                    -- có nhờ AI không, nhờ việc gì
  thay_cho      uuid references nhat_ky_nghien_cuu(id),  -- mục này thay cho mục cũ nào
  ly_do_sua     text,                                    -- vì sao phải ghi lại
  xac_nhan_boi  uuid references auth.users(id),          -- giáo viên xác nhận
  xac_nhan_luc  timestamptz,
  constraint sua_phai_co_ly_do check (thay_cho is null or coalesce(ly_do_sua, '') <> '')
);

create index if not exists idx_nhat_ky_ngay on nhat_ky_nghien_cuu (ngay desc, ghi_luc desc);

comment on table nhat_ky_nghien_cuu is
  'Sổ nhật ký nghiên cứu. Chỉ thêm, không sửa, không xoá — xem trigger chi_them_khong_sua.';

-- -----------------------------------------------------------------------------
-- 3. Khoá: không sửa, không xoá
--    Ngoại lệ duy nhất là giáo viên xác nhận — chỉ hai cột xac_nhan_*.
-- -----------------------------------------------------------------------------
create or replace function public.chan_sua_nhat_ky() returns trigger
language plpgsql as $$
begin
  if tg_op = 'DELETE' then
    raise exception 'Sổ nhật ký nghiên cứu không xoá được. Muốn đính chính thì ghi một mục mới kèm lý do.';
  end if;

  if (new.ngay, new.ghi_luc, new.tac_gia, new.tac_gia_ten, new.tac_gia_vai, new.cong_viec,
      new.phuong_phap, new.ket_qua, new.vai_tro, new.cong_cu_ai, new.thay_cho, new.ly_do_sua)
     is distinct from
     (old.ngay, old.ghi_luc, old.tac_gia, old.tac_gia_ten, old.tac_gia_vai, old.cong_viec,
      old.phuong_phap, old.ket_qua, old.vai_tro, old.cong_cu_ai, old.thay_cho, old.ly_do_sua) then
    raise exception 'Nội dung nhật ký đã ghi thì không sửa được. Ghi một mục mới, đặt thay_cho = mục cũ và nêu lý do.';
  end if;

  return new;
end $$;

drop trigger if exists chi_them_khong_sua on nhat_ky_nghien_cuu;
create trigger chi_them_khong_sua
  before update or delete on nhat_ky_nghien_cuu
  for each row execute function public.chan_sua_nhat_ky();

-- -----------------------------------------------------------------------------
-- 4. Phân quyền
--    Đọc: giáo viên và học sinh làm dự án. Học sinh trong đợt thực nghiệm KHÔNG
--    đọc được — nhật ký có nhắc tới thiết kế nghiên cứu.
--    Ghi: chỉ ghi được dưới tên chính mình.
-- -----------------------------------------------------------------------------
alter table nhat_ky_nghien_cuu enable row level security;

drop policy if exists "doc nhat ky" on nhat_ky_nghien_cuu;
create policy "doc nhat ky" on nhat_ky_nghien_cuu
  for select to authenticated using (is_teacher() or la_hs_nckh());

drop policy if exists "ghi nhat ky" on nhat_ky_nghien_cuu;
create policy "ghi nhat ky" on nhat_ky_nghien_cuu
  for insert to authenticated
  with check ((is_teacher() or la_hs_nckh()) and tac_gia = auth.uid());

-- Xác nhận của giáo viên đi qua hàm riêng, không mở quyền sửa bảng.
create or replace function public.xac_nhan_nhat_ky(p_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not is_teacher() then
    raise exception 'Chỉ giáo viên hướng dẫn mới xác nhận được nhật ký.';
  end if;
  update nhat_ky_nghien_cuu
     set xac_nhan_boi = auth.uid(), xac_nhan_luc = now()
   where id = p_id and xac_nhan_luc is null;
end $$;

revoke all on function public.xac_nhan_nhat_ky(uuid) from public, anon;
grant execute on function public.xac_nhan_nhat_ky(uuid) to authenticated;

-- -----------------------------------------------------------------------------
-- 5. GÁN VAI TRÒ CHO HAI HỌC SINH LÀM DỰ ÁN
--
--    Làm theo đúng thứ tự:
--      a) Chạy 25-chuan-bi-lop-demo.sql trước, để có lớp DEMO-7A1.
--      b) Authentication -> Users -> Add user, tạo hai tài khoản cho hai em,
--         mỗi em một tài khoản riêng. Sao UUID của từng em.
--      c) Bỏ dấu -- ở khối dưới, dán UUID và điền họ tên, rồi chạy lại tệp này.
--
--    Hai em vừa ghi nhật ký, vừa cần dùng chính hệ thống để thử: xem video, làm
--    quiz, xem gợi ý. Nên mỗi em được gán một mã học sinh thật, NHƯNG đặt trong
--    lớp DEMO chứ không phải lớp thực nghiệm, và consent_status để 'chua'. Hai
--    lớp chắn đó khiến mọi thao tác thử của hai em không bao giờ lẫn vào dữ liệu
--    phân tích: tệp xuất chỉ nhận lớp TN, DC và chỉ học sinh đã đồng thuận.
-- -----------------------------------------------------------------------------
-- do $$
-- declare
--   v_uuid_1 uuid := 'DÁN-UUID-HỌC-SINH-1';
--   v_uuid_2 uuid := 'DÁN-UUID-HỌC-SINH-2';
--   v_ten_1  text := 'Họ tên học sinh 1';
--   v_ten_2  text := 'Họ tên học sinh 2';
--   v_lop    text;
-- begin
--   select class_id into v_lop from classes where arm = 'DEMO' order by class_id limit 1;
--   if v_lop is null then
--     raise exception 'Chưa có lớp DEMO. Chạy 25-chuan-bi-lop-demo.sql trước.';
--   end if;
--
--   insert into students (student_id, class_id, display_name, consent_status)
--   values ('nckh01', v_lop, 'HS dự án 1', 'chua'),
--          ('nckh02', v_lop, 'HS dự án 2', 'chua')
--   on conflict (student_id) do update set class_id = excluded.class_id;
--
--   insert into profiles (id, role, student_id, class_id, full_name) values
--     (v_uuid_1, 'hoc-sinh-nckh', 'nckh01', v_lop, v_ten_1),
--     (v_uuid_2, 'hoc-sinh-nckh', 'nckh02', v_lop, v_ten_2)
--   on conflict (id) do update
--     set role = 'hoc-sinh-nckh', student_id = excluded.student_id,
--         class_id = excluded.class_id, full_name = excluded.full_name;
--
--   raise notice 'Đã gán hai tài khoản học sinh làm dự án vào lớp %', v_lop;
-- end $$;

-- -----------------------------------------------------------------------------
-- KIỂM TRA
-- -----------------------------------------------------------------------------
select case when to_regclass('public.nhat_ky_nghien_cuu') is not null
            then '✅ Bảng nhật ký đã tạo' else '❌ chưa tạo được' end as ket_qua
union all
select case when exists (select 1 from pg_trigger where tgname = 'chi_them_khong_sua')
            then '✅ Đã khoá sửa và xoá' else '❌ thiếu khoá' end
union all
select '✅ Vai trò hợp lệ: hoc-sinh, giao-vien, hoc-sinh-nckh';

-- >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> 31-tu-kiem-tra-he-thong.sql
-- =============================================================================
-- 27 · HÀM TỰ KIỂM TRA HỆ THỐNG
-- -----------------------------------------------------------------------------
-- Gom mọi phép kiểm tra rải rác ở các tệp 00, 20, 24 vào một hàm, để trang
-- /gv/tu-kiem-tra gọi một lần là ra cả bảng. Mở trang, chụp màn hình — đó là
-- bằng chứng "nguyên mẫu đã kiểm tra trong nhiều điều kiện" cho hồ sơ kỹ thuật,
-- và là cách nhanh nhất để biết hệ thống có đang hỏng chỗ nào không.
--
-- Hàm CHỈ ĐỌC. Không sửa gì. Chạy lúc nào cũng được, kể cả giữa đợt thực nghiệm.
--
-- Chạy lại nhiều lần vẫn an toàn.
-- =============================================================================

create or replace function public.kiem_tra_he_thong()
returns table (nhom text, muc text, trang_thai text, chi_tiet text)
language plpgsql security definer set search_path = public as $$
declare
  v int;
  v2 int;
begin
  ---------------------------------------------------------------- cài đặt
  return query
  select 'Cài đặt', 'Bảng và khung nhìn nền',
         case when count(*) filter (where thieu) = 0 then 'ok' else 'loi' end,
         case when count(*) filter (where thieu) = 0
              then 'Đủ ' || count(*) || ' đối tượng'
              else 'Thiếu: ' || string_agg(ten, ', ') filter (where thieu) end
    from (
      select t.ten, to_regclass('public.' || t.ten) is null as thieu
        from unnest(array['students','classes','questions','quiz_attempts','quiz_answers',
                          'mastery_states','mastery_history','recommendations','week_plan',
                          'les_tong_hop','nhat_ky_nghien_cuu']) as t(ten)
    ) x;

  return query
  select 'Cài đặt', 'Hàm tính mức làm chủ v2',
         case when to_regprocedure('public.refresh_mastery_v2(text,text)') is null then 'loi' else 'ok' end,
         case when to_regprocedure('public.refresh_mastery_v2(text,text)') is null
              then 'Thiếu — chạy 18-danh-gia-va-mastery.sql'
              else 'Có' end;

  ---------------------------------------------------------------- phân quyền
  return query
  select 'Phân quyền', 'Học sinh không đọc được cột đáp án',
         case when has_column_privilege('authenticated', 'public.questions', 'correct_option', 'select')
              then 'loi' else 'ok' end,
         case when has_column_privilege('authenticated', 'public.questions', 'correct_option', 'select')
              then 'CHƯA VÁ — chạy 20-va-lo-hong-phan-quyen.sql'
              else 'Đã vá' end;

  select count(*) into v
    from pg_class c join pg_namespace n on n.oid = c.relnamespace
   where n.nspname = 'public' and c.relkind = 'r' and not c.relrowsecurity;
  return query
  select 'Phân quyền', 'Mọi bảng đã bật RLS',
         case when v = 0 then 'ok' else 'loi' end,
         case when v = 0 then 'Tất cả đã bật' else v || ' bảng chưa bật RLS' end;

  ---------------------------------------------------------------- dữ liệu mô phỏng
  select count(*) into v
    from students s join classes c using (class_id)
   where s.student_id like 'hs0%' and c.arm in ('TN', 'DC');
  return query
  select 'Dữ liệu', 'Không có dữ liệu mô phỏng trong lớp thật',
         case when v = 0 then 'ok' else 'loi' end,
         case when v = 0 then 'Sạch'
              else v || ' học sinh mô phỏng đang nằm trong lớp TN/DC — chạy 25-chuan-bi-lop-demo.sql' end;

  ---------------------------------------------------------------- kế hoạch tuần
  select count(*) into v
    from week_plan w join classes c using (class_id)
   where c.arm in ('TN', 'DC') and w.so_tiet_ke_hoach <> 4;
  return query
  select 'Dữ liệu', 'Số tiết kế hoạch của lớp thật',
         case when v = 0 then 'ok' else 'canh_bao' end,
         case when v = 0 then 'Đúng 4 tiết/tuần'
              else v || ' tuần khác 4 tiết — kiểm tra lại, độ trung thực tính theo cột này' end;

  ---------------------------------------------------------------- ngân hàng câu hỏi
  select count(*) into v
    from knowledge_units k
   where (select count(*) from questions q where q.ku_id = k.ku_id and q.level = 4) < 2;
  return query
  select 'Ngân hàng câu hỏi', 'Đơn vị đạt được mức làm chủ 3',
         case when v = 0 then 'ok' else 'canh_bao' end,
         case when v = 0 then 'Mọi đơn vị đều có từ 2 câu mức 4'
              else v || ' đơn vị có dưới 2 câu mức 4 → KHÔNG đạt được mức 3. Xem 21-cau-muc-4-bo-sung-KHUNG.sql' end;

  select count(*) into v from questions q
   where (select count(*) from question_options o where o.question_id = q.question_id) < 4;
  return query
  select 'Ngân hàng câu hỏi', 'Mỗi câu đủ 4 phương án',
         case when v = 0 then 'ok' else 'loi' end,
         case when v = 0 then 'Đủ' else v || ' câu thiếu phương án' end;

  select count(*) into v from questions q
   where not exists (select 1 from question_options o
                      where o.question_id = q.question_id and o.option_key = q.correct_option);
  return query
  select 'Ngân hàng câu hỏi', 'Đáp án đúng có trong danh sách phương án',
         case when v = 0 then 'ok' else 'loi' end,
         case when v = 0 then 'Khớp' else v || ' câu có đáp án không nằm trong phương án nào' end;

  ---------------------------------------------------------------- học liệu
  select count(*) into v from knowledge_units k
   where coalesce(k.co_video, true)
     and not exists (select 1 from contents c
                      where c.ku_id = k.ku_id and c.kind = 'video'
                        and coalesce(c.url, '') <> '' and coalesce(c.duration_sec, 0) > 0);
  return query
  select 'Học liệu', 'Video đã gắn link và có thời lượng',
         case when v = 0 then 'ok' else 'loi' end,
         case when v = 0 then 'Đủ'
              else v || ' mục thiếu link hoặc thiếu thời lượng → R01 và R09 không kích hoạt được' end;

  ---------------------------------------------------------------- đồng thuận
  select count(*), count(*) filter (where s.consent_status = 'dong-y') into v, v2
    from students s join classes c using (class_id) where c.arm in ('TN', 'DC');
  return query
  select 'Đợt thực nghiệm', 'Học sinh đã đồng thuận',
         case when v = 0 then 'canh_bao' when v2 = v then 'ok' else 'canh_bao' end,
         v2 || '/' || v || ' học sinh lớp thật đã đồng thuận'
         || case when v2 < v then ' — số còn lại không ra tệp xuất dữ liệu' else '' end;

  ---------------------------------------------------------------- nhật ký nghiên cứu
  if to_regclass('public.nhat_ky_nghien_cuu') is not null then
    select count(*) into v from nhat_ky_nghien_cuu;
    select count(*) into v2 from nhat_ky_nghien_cuu where ghi_luc > now() - interval '7 days';
    return query
    select 'Nhật ký nghiên cứu', 'Có ghi đều không',
           case when v = 0 then 'loi' when v2 = 0 then 'canh_bao' else 'ok' end,
           v || ' mục, ' || v2 || ' mục trong 7 ngày gần nhất'
           || case when v2 = 0 then ' — một tuần chưa ghi mục nào' else '' end;
  end if;
end $$;

revoke all on function public.kiem_tra_he_thong() from public, anon, authenticated;

-- -----------------------------------------------------------------------------
-- Xem thử ngay
-- -----------------------------------------------------------------------------
select * from public.kiem_tra_he_thong();

-- >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> 32-vai-tro-nckh-gui-phan-hoi.sql
-- =============================================================================
-- 32. CHO HAI HỌC SINH LÀM DỰ ÁN GỬI ĐƯỢC PHẢN HỒI GỢI Ý
--
-- Chạy SAU 26-phan-hoi-goi-y.sql và SAU 30-nhat-ky-nghien-cuu.sql.
--
-- VẤN ĐỀ. Tệp 26 đặt điều kiện ghi phản hồi là `p.role = 'hoc-sinh'`. Vai trò
-- mới `hoc-sinh-nckh` (hai em thực hiện dự án) vì thế bị chặn: các em bấm gửi
-- phản hồi thì bị RLS từ chối mà không hiểu vì sao. Đúng lúc cần các em thử
-- nghiêm túc từng chức năng để tìm lỗi trước khi giao cho lớp thật.
--
-- CÁCH SỬA. Đổi điều kiện thành "một trong hai vai trò học sinh". Không nới
-- lỏng gì khác: khoá vẫn là `student_id` của chính người đang đăng nhập, nên
-- không ai ghi hộ được cho người khác.
--
-- CHẠY LẠI NHIỀU LẦN KHÔNG SAO. Tệp chỉ tạo lại một chính sách.
-- =============================================================================

do $$
begin
  if to_regclass('public.hint_feedback') is null then
    raise exception E'\n\n>>> DỪNG LẠI: chưa có bảng hint_feedback. Chạy 26-phan-hoi-goi-y.sql trước. <<<\n';
  end if;
  if not exists (
    select 1 from pg_constraint
     where conrelid = 'public.profiles'::regclass
       and pg_get_constraintdef(oid) like '%hoc-sinh-nckh%'
  ) then
    raise exception E'\n\n>>> DỪNG LẠI: vai trò hoc-sinh-nckh chưa được khai báo. Chạy 30-nhat-ky-nghien-cuu.sql trước. <<<\n';
  end if;
end $$;

drop policy if exists feedback_own_insert on public.hint_feedback;
create policy feedback_own_insert on public.hint_feedback
  for insert to authenticated
  with check (
    student_id = (
      select p.student_id from public.profiles p
       where p.id = auth.uid()
         and p.role in ('hoc-sinh', 'hoc-sinh-nckh')
    )
  );

-- -----------------------------------------------------------------------------
-- KIỂM TRA
-- -----------------------------------------------------------------------------
select case
  when pg_get_expr(polwithcheck, polrelid) like '%hoc-sinh-nckh%'
  then '✅ Hai em làm dự án gửi được phản hồi gợi ý'
  else '❌ Chính sách chưa nhận vai trò hoc-sinh-nckh'
end as ket_qua
from pg_policy
where polrelid = 'public.hint_feedback'::regclass
  and polname = 'feedback_own_insert';

-- >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> 35-mathmind.sql
-- =============================================================================
-- 35 · MATHMIND AI — VÒNG QUYẾT ĐỊNH CỦA GIÁO VIÊN
-- =============================================================================
-- Chạy SAU các tệp 01–34. Chạy lại nhiều lần không lỗi.
--
-- Năm bảng, tất cả có tiền tố mm_ để không đụng bảng nghiên cứu của dự án KHKT:
--   mm_activities          ngân hàng hoạt động dạy học (giáo viên soạn, duyệt)
--   mm_lesson_sessions     mỗi lần giáo viên chuẩn bị một tiết; lưu nguyên chẩn đoán
--   mm_plan_options        3 phương án hệ thống sinh ra — lưu nguyên, KHÔNG sửa được
--   mm_teacher_decisions   giáo viên chọn / sửa / bỏ từng phương án, lý do, điểm hữu ích
--   mm_teacher_prediagnosis  nhận định độc lập của giáo viên TRƯỚC khi xem hệ thống (NT1)
--   mm_exit_tickets        phiếu cuối tiết: em còn mắc lỗi mục tiêu không (NT6)
--
-- Nguyên tắc: phương án gốc và quyết định là dữ liệu nghiệm thu, nên chỉ GHI THÊM.
-- Không có chính sách update/delete cho người dùng — sửa được thì tỉ lệ chấp nhận
-- mất giá trị làm bằng chứng.
-- =============================================================================

-- ------------------------------------------------------------ 1. Ngân hàng hoạt động
create table if not exists mm_activities (
  activity_id   text primary key,
  ten           text not null,
  error_codes   text[] not null default '{}',
  nhom          text[] not null default '{}',
  hinh_thuc     text not null check (hinh_thuc in ('ca-lop','nhom-dong-chat','jigsaw','ca-nhan','tram')),
  muc_nhan_thuc int  not null check (muc_nhan_thuc between 1 and 4),
  phut_min      int  not null check (phut_min between 1 and 45),
  phut_max      int  not null check (phut_max between 1 and 45),
  mo_ta         text not null,
  hoc_lieu      text,
  trang_thai    text not null default 'nhap' check (trang_thai in ('nhap','da-duyet','an')),
  nguon         text,
  tac_gia       uuid references auth.users(id),
  updated_at    timestamptz not null default now(),
  check (phut_min <= phut_max)
);

alter table mm_activities enable row level security;
drop policy if exists "gv doc hoat dong" on mm_activities;
create policy "gv doc hoat dong" on mm_activities for select to authenticated using (public.is_teacher());
drop policy if exists "gv them hoat dong" on mm_activities;
create policy "gv them hoat dong" on mm_activities for insert to authenticated with check (public.is_teacher());
drop policy if exists "gv sua hoat dong" on mm_activities;
create policy "gv sua hoat dong" on mm_activities for update to authenticated
  using (public.is_teacher()) with check (public.is_teacher());

-- ------------------------------------------------------------ 2. Phiên chuẩn bị tiết
create table if not exists mm_lesson_sessions (
  session_id  uuid primary key default gen_random_uuid(),
  class_id    text not null references classes(class_id) on delete cascade,
  ku_id       text not null references knowledge_units(ku_id),
  teacher_id  uuid not null default auth.uid() references auth.users(id),
  che_do      text not null default 'tiet-that' check (che_do in ('tiet-that','thu-nghiem-a')),
  phien_ban   text not null,                 -- phiên bản bộ máy đề xuất
  chan_doan   jsonb not null,                -- kết quả diagnoseClass, lưu nguyên
  started_at  timestamptz not null default now()
);
create index if not exists idx_mm_sessions on mm_lesson_sessions(class_id, ku_id, started_at desc);

alter table mm_lesson_sessions enable row level security;
drop policy if exists "gv doc phien" on mm_lesson_sessions;
create policy "gv doc phien" on mm_lesson_sessions for select to authenticated
  using (public.teaches_class(class_id));
drop policy if exists "gv tao phien" on mm_lesson_sessions;
create policy "gv tao phien" on mm_lesson_sessions for insert to authenticated
  with check (public.teaches_class(class_id) and teacher_id = auth.uid());

create or replace function public.owns_mm_session(p_session uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from mm_lesson_sessions s
    where s.session_id = p_session and s.teacher_id = auth.uid() and public.teaches_class(s.class_id)
  )
$$;

-- ------------------------------------------------------------ 3. Phương án gốc
create table if not exists mm_plan_options (
  option_id  uuid primary key default gen_random_uuid(),
  session_id uuid not null references mm_lesson_sessions(session_id) on delete cascade,
  rank       int  not null check (rank between 1 and 9),
  strategy   text not null,
  diem       numeric,
  payload    jsonb not null,
  unique (session_id, rank)
);
alter table mm_plan_options enable row level security;
drop policy if exists "gv doc phuong an" on mm_plan_options;
create policy "gv doc phuong an" on mm_plan_options for select to authenticated
  using (public.owns_mm_session(session_id));
drop policy if exists "gv ghi phuong an" on mm_plan_options;
create policy "gv ghi phuong an" on mm_plan_options for insert to authenticated
  with check (public.owns_mm_session(session_id));

-- ------------------------------------------------------------ 4. Quyết định của giáo viên
create table if not exists mm_teacher_decisions (
  decision_id   bigserial primary key,
  session_id    uuid not null references mm_lesson_sessions(session_id) on delete cascade,
  option_id     uuid not null references mm_plan_options(option_id) on delete cascade,
  hanh_dong     text not null check (hanh_dong in ('chon','sua','bo')),
  payload_sua   jsonb,                       -- bản giáo viên đã sửa (chỉ khi hanh_dong = 'sua')
  truong_da_sua text[] not null default '{}',
  ly_do         text,
  huu_ich       int check (huu_ich between 1 and 5),
  prep_seconds  int check (prep_seconds >= 0),            -- thời gian chuẩn bị CÓ hệ thống (kế hoạch B)
  prep_seconds_a int check (prep_seconds_a >= 0),         -- Thử nghiệm A: thời gian lập kế hoạch A KHÔNG có hệ thống
  created_at    timestamptz not null default now(),
  unique (session_id, option_id)
);
-- Mỗi phiên chỉ có MỘT phương án được dùng (chọn nguyên hoặc chọn rồi sửa)
create unique index if not exists uq_mm_mot_lua_chon
  on mm_teacher_decisions(session_id) where hanh_dong in ('chon','sua');

alter table mm_teacher_decisions enable row level security;
drop policy if exists "gv doc quyet dinh" on mm_teacher_decisions;
create policy "gv doc quyet dinh" on mm_teacher_decisions for select to authenticated
  using (public.owns_mm_session(session_id));
drop policy if exists "gv ghi quyet dinh" on mm_teacher_decisions;
create policy "gv ghi quyet dinh" on mm_teacher_decisions for insert to authenticated
  with check (public.owns_mm_session(session_id));

-- ------------------------------------------------------------ 5. Nhận định độc lập (NT1)
create table if not exists mm_teacher_prediagnosis (
  session_id  uuid not null references mm_lesson_sessions(session_id) on delete cascade,
  student_id  text not null references students(student_id),
  nhom_gv     text not null,                 -- 'loi:E-CT-01', 'chua-chuan-bi', 'san-sang', ...
  ghi_chu     text,
  created_at  timestamptz not null default now(),
  primary key (session_id, student_id)
);
alter table mm_teacher_prediagnosis enable row level security;
drop policy if exists "gv doc nhan dinh" on mm_teacher_prediagnosis;
create policy "gv doc nhan dinh" on mm_teacher_prediagnosis for select to authenticated
  using (public.owns_mm_session(session_id));
drop policy if exists "gv ghi nhan dinh" on mm_teacher_prediagnosis;
create policy "gv ghi nhan dinh" on mm_teacher_prediagnosis for insert to authenticated
  with check (public.owns_mm_session(session_id) and public.teaches_student(student_id));

-- ------------------------------------------------------------ 6. Phiếu cuối tiết (NT6)
create table if not exists mm_exit_tickets (
  session_id  uuid not null references mm_lesson_sessions(session_id) on delete cascade,
  student_id  text not null references students(student_id),
  error_code  text not null,
  con_mac     boolean not null,
  created_at  timestamptz not null default now(),
  primary key (session_id, student_id, error_code)
);
alter table mm_exit_tickets enable row level security;
drop policy if exists "gv doc phieu cuoi tiet" on mm_exit_tickets;
create policy "gv doc phieu cuoi tiet" on mm_exit_tickets for select to authenticated
  using (public.owns_mm_session(session_id));
drop policy if exists "gv ghi phieu cuoi tiet" on mm_exit_tickets;
create policy "gv ghi phieu cuoi tiet" on mm_exit_tickets for insert to authenticated
  with check (public.owns_mm_session(session_id) and public.teaches_student(student_id));

-- ------------------------------------------------------------ 7. Học sinh không đọc được gì
revoke all on mm_activities, mm_lesson_sessions, mm_plan_options, mm_teacher_decisions,
  mm_teacher_prediagnosis, mm_exit_tickets from anon;
grant select, insert, update on mm_activities to authenticated;
grant select, insert on mm_lesson_sessions, mm_plan_options, mm_teacher_decisions,
  mm_teacher_prediagnosis, mm_exit_tickets to authenticated;
grant usage, select on sequence mm_teacher_decisions_decision_id_seq to authenticated;

-- ------------------------------------------------------------ 8. Nạp ngân hàng hoạt động nháp
-- Sinh từ dfle-engine/src/mathmind.js bằng: node cli/emit-mathmind.js
-- "on conflict do nothing": chạy lại KHÔNG đè lên hoạt động giáo viên đã sửa.
insert into mm_activities
  (activity_id, ten, error_codes, nhom, hinh_thuc, muc_nhan_thuc, phut_min, phut_max, mo_ta, hoc_lieu, trang_thai, nguon)
values
  ('HD-CHUNG-01', 'Bắt sâu tìm lỗi', array['*']::text[], array['loi']::text[], 'ca-lop', 2, 7, 10, 'Chiếu một lời giải sai lấy từ chính bài chuẩn bị của lớp (ẩn tên). Học sinh cá nhân tìm chỗ sai trong 2 phút, cặp đôi thống nhất, một em trình bày, một em phản biện. Giáo viên chỉ chốt sau khi lớp đã tự sửa.', 'Ảnh chụp 1–2 lời giải sai điển hình', 'nhap', 'Bản nháp do trợ lý AI soạn theo từ điển mã lỗi — giáo viên cần duyệt, sửa trước khi dùng'),
  ('HD-CHUNG-02', 'Phiếu luyện tập phân tầng 3 mức', array['*']::text[], array['loi', 'on-dinh', 'hong-nen']::text[], 'nhom-dong-chat', 2, 10, 20, 'Mỗi nhóm nhận phiếu đúng tầng của mình: Bồi dưỡng (sửa lỗi), Luyện tập (bài SGK), Thử thách (vận dụng). Em xong tầng mình được làm tiếp tầng trên.', 'Bộ phiếu học tập phân tầng của đơn vị kiến thức', 'nhap', 'Bản nháp do trợ lý AI soạn theo từ điển mã lỗi — giáo viên cần duyệt, sửa trước khi dùng'),
  ('HD-CHUNG-03', 'Nhắc lại cốt lõi 5 phút', array[]::text[], array['chua-chuan-bi']::text[], 'nhom-dong-chat', 1, 5, 8, 'Nhóm chưa xem bài ngồi gần bàn giáo viên, xem đoạn chốt của video (≤ 2 phút) rồi làm 2 câu nhận biết. Đúng cả 2 câu thì nhập vào nhóm luyện tập chung.', 'Đoạn chốt của video bài học, 2 câu mức 1', 'nhap', 'Bản nháp do trợ lý AI soạn theo từ điển mã lỗi — giáo viên cần duyệt, sửa trước khi dùng'),
  ('HD-CHUNG-04', 'Làm lại có giải thích', array[]::text[], array['doan-mo']::text[], 'ca-nhan', 2, 5, 8, 'Học sinh làm lại 3 câu của bài chuẩn bị, mỗi lựa chọn phải viết một dòng "vì sao". Giáo viên đi qua kiểm tra tại chỗ — dữ liệu đoán mò chưa đủ để kết luận em yếu hay không.', '3 câu của bài chuẩn bị, in trên giấy', 'nhap', 'Bản nháp do trợ lý AI soạn theo từ điển mã lỗi — giáo viên cần duyệt, sửa trước khi dùng'),
  ('HD-CHUNG-05', 'Bậc thang tiên quyết', array[]::text[], array['hong-nen']::text[], 'nhom-dong-chat', 1, 8, 12, 'Ba câu tăng dần lấy từ đơn vị kiến thức tiên quyết, rồi một câu nối sang bài hôm nay. Giáo viên hỗ trợ trực tiếp nhóm này trong 5 phút đầu.', '3 câu mức 1–2 của đơn vị tiên quyết', 'nhap', 'Bản nháp do trợ lý AI soạn theo từ điển mã lỗi — giáo viên cần duyệt, sửa trước khi dùng'),
  ('HD-CHUNG-06', 'Bài toán thực tiễn mở rộng', array[]::text[], array['san-sang']::text[], 'nhom-dong-chat', 4, 10, 15, 'Nhóm đã làm chủ giải một bài toán gắn thực tế (nhiệt độ, tài chính gia đình, đo lường), trình bày lời giải trên bảng phụ trong 2 phút cuối.', 'Một bài toán mức 4 có dữ kiện thực tế', 'nhap', 'Bản nháp do trợ lý AI soạn theo từ điển mã lỗi — giáo viên cần duyệt, sửa trước khi dùng'),
  ('HD-CHUNG-07', 'Trợ giảng nhí', array['*']::text[], array['san-sang', 'loi']::text[], 'jigsaw', 3, 12, 20, 'Nhóm hỗn hợp 4 em, mỗi nhóm một em đã làm chủ làm nhóm trưởng. Nhóm trưởng không giải hộ: chỉ được hỏi gợi mở và chỉ vào bước sai. Giáo viên phát thẻ "câu hỏi gợi mở" cho nhóm trưởng.', 'Thẻ câu hỏi gợi mở, phiếu bài tập chung', 'nhap', 'Bản nháp do trợ lý AI soạn theo từ điển mã lỗi — giáo viên cần duyệt, sửa trước khi dùng'),
  ('HD-HT-01', 'Phân loại thẻ số: viết được dạng a/b không?', array['E-HT-01', 'E-TT-02']::text[], array['loi']::text[], 'nhom-dong-chat', 1, 8, 10, 'Mỗi nhóm nhận 12 thẻ số (−5; 0,75; 3/4; 0; −2 1/3 …), xếp vào hai cột "viết được dạng a/b" và "không viết được", ghi cách viết lên mặt sau thẻ.', 'Bộ 12 thẻ số', 'nhap', 'Bản nháp do trợ lý AI soạn theo từ điển mã lỗi — giáo viên cần duyệt, sửa trước khi dùng'),
  ('HD-HT-02', 'Gấp trục số: đối xứng qua điểm O', array['E-HT-02', 'E-HT-03', 'E-TT-01']::text[], array['loi']::text[], 'nhom-dong-chat', 2, 8, 12, 'Học sinh vẽ trục số trên băng giấy, đánh dấu một số dương rồi gấp đôi tại O để tìm số đối. So sánh với số nghịch đảo của cùng số đó để thấy hai khái niệm khác nhau.', 'Băng giấy, thước', 'nhap', 'Bản nháp do trợ lý AI soạn theo từ điển mã lỗi — giáo viên cần duyệt, sửa trước khi dùng'),
  ('HD-TT-01', 'Xếp hàng nhiệt độ âm', array['E-TT-01', 'E-TT-02']::text[], array['loi']::text[], 'ca-lop', 2, 7, 10, '6 học sinh cầm 6 thẻ nhiệt độ (−3/4 °C, −1/2 °C, …) đứng xếp theo thứ tự từ lạnh nhất đến ấm nhất. Cả lớp phát hiện chỗ đứng sai và giải thích bằng trục số.', '6 thẻ nhiệt độ cỡ lớn', 'nhap', 'Bản nháp do trợ lý AI soạn theo từ điển mã lỗi — giáo viên cần duyệt, sửa trước khi dùng'),
  ('HD-CT-01', 'Vì sao 1/2 + 1/3 không bằng 2/5', array['E-CT-01', 'E-CT-02', 'E-NC-03']::text[], array['loi']::text[], 'nhom-dong-chat', 2, 10, 12, 'Mỗi nhóm tô 1/2 và 1/3 của cùng một hình chữ nhật chia 6 ô, đếm số ô đã tô rồi so với 2/5. Sau đó tự viết quy tắc quy đồng bằng lời của nhóm.', 'Phiếu hình chữ nhật 6 ô và 10 ô', 'nhap', 'Bản nháp do trợ lý AI soạn theo từ điển mã lỗi — giáo viên cần duyệt, sửa trước khi dùng'),
  ('HD-CT-03', 'Cộng trái dấu bằng bước đi trên trục số', array['E-CT-03']::text[], array['loi']::text[], 'nhom-dong-chat', 2, 8, 10, 'Mỗi phép cộng là hai lần đi trên trục số: đi trái với số âm, đi phải với số dương. Nhóm ghi điểm dừng rồi đối chiếu với quy tắc "lấy hiệu hai giá trị tuyệt đối".', 'Trục số dán trên bàn', 'nhap', 'Bản nháp do trợ lý AI soạn theo từ điển mã lỗi — giáo viên cần duyệt, sửa trước khi dùng'),
  ('HD-DN-01', 'Thẻ "dấu trừ là nhân với −1"', array['E-DN-01', 'E-DN-02', 'E-CV-01']::text[], array['loi']::text[], 'nhom-dong-chat', 2, 8, 12, 'Mỗi số hạng trong ngoặc là một thẻ. Khi bỏ ngoặc có dấu trừ, học sinh lật từng thẻ (đổi dấu) — không thẻ nào được giữ nguyên. Làm ngược lại khi đặt ngoặc.', 'Thẻ hai mặt +/−', 'nhap', 'Bản nháp do trợ lý AI soạn theo từ điển mã lỗi — giáo viên cần duyệt, sửa trước khi dùng'),
  ('HD-NC-01', 'Chia là nhân với nghịch đảo số chia — thử lại bằng phép nhân', array['E-NC-01', 'E-NC-02']::text[], array['loi']::text[], 'nhom-dong-chat', 2, 8, 10, 'Nhóm tính 4 phép chia theo hai cách (cách đúng và cách sai thường gặp), rồi nhân kết quả với số chia để xem cách nào quay về số bị chia.', 'Phiếu 4 phép chia', 'nhap', 'Bản nháp do trợ lý AI soạn theo từ điển mã lỗi — giáo viên cần duyệt, sửa trước khi dùng'),
  ('HD-LT-01', 'Bảng dấu luỹ thừa: chẵn, lẻ và vị trí ngoặc', array['E-LT-01', 'E-LT-02', 'E-LT-03']::text[], array['loi']::text[], 'ca-lop', 2, 8, 10, 'Cả lớp điền bảng (−2)^n và −2^n với n = 1…4, tìm quy luật dấu. Học sinh tự phát biểu khi nào kết quả âm, khi nào dương.', 'Bảng điền chiếu trên màn hình', 'nhap', 'Bản nháp do trợ lý AI soạn theo từ điển mã lỗi — giáo viên cần duyệt, sửa trước khi dùng'),
  ('HD-LT-04', 'Viết dài ra rồi đếm', array['E-LT-04', 'E-LT-05', 'E-LT-06']::text[], array['loi']::text[], 'nhom-dong-chat', 1, 8, 10, 'Mỗi tích luỹ thừa được viết thành tích các thừa số rồi đếm số chữ a. Nhóm tự rút ra phải cộng, trừ hay nhân số mũ cho từng loại phép tính.', 'Phiếu 6 biểu thức luỹ thừa', 'nhap', 'Bản nháp do trợ lý AI soạn theo từ điển mã lỗi — giáo viên cần duyệt, sửa trước khi dùng'),
  ('HD-TU-01', 'Hai đội, hai thứ tự tính', array['E-TU-01', 'E-TU-02']::text[], array['loi']::text[], 'ca-lop', 2, 8, 10, 'Cùng một biểu thức, đội A tính từ trái sang phải, đội B tính theo thứ tự ưu tiên. Hai kết quả khác nhau là điểm xuất phát để cả lớp thống nhất quy ước.', '3 biểu thức có luỹ thừa, nhân chia, ngoặc', 'nhap', 'Bản nháp do trợ lý AI soạn theo từ điển mã lỗi — giáo viên cần duyệt, sửa trước khi dùng'),
  ('HD-CV-01', 'Cân thăng bằng: thêm bớt hai vế', array['E-CV-01', 'E-CV-02']::text[], array['loi']::text[], 'nhom-dong-chat', 2, 8, 12, 'Dùng trò chơi cân thăng bằng trên web hoặc hình vẽ cân: mỗi bước chuyển vế phải làm cùng một việc ở cả hai đĩa cân. Phân biệt bớt một số hạng với chia cho một thừa số.', 'Trò chơi cân thăng bằng (BalanceGame) hoặc phiếu hình cân', 'nhap', 'Bản nháp do trợ lý AI soạn theo từ điển mã lỗi — giáo viên cần duyệt, sửa trước khi dùng')
on conflict (activity_id) do nothing;

select count(*) as so_hoat_dong, count(*) filter (where trang_thai = 'nhap') as con_nhap from mm_activities;

-- >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> 39-xoa-noi-dung-toan-7.sql
-- ===========================================================================
-- FLIPMATH9 · XOÁ NỘI DUNG TOÁN 7 MẪU KHỎI CƠ SỞ DỮ LIỆU MỚI
-- Chạy MỘT LẦN trên dự án Supabase MỚI của FlipMath9, sau các tệp cấu trúc
-- (một số tệp cấu trúc 07, 08, 09, 21 nạp kèm nội dung Toán 7 Chương I).
-- Tệp này gỡ toàn bộ nội dung Toán 7 đó, GIỮ cấu trúc bảng và 7 hoạt động
-- dùng chung HD-CHUNG-*. Sau tệp này chạy 40-noi-dung-toan-9.sql.
--
-- CHỐT AN TOÀN: tệp DỪNG nếu cơ sở dữ liệu đã có học sinh hoặc bài làm —
-- tức là KHÔNG BAO GIỜ được chạy nhầm trên cơ sở dữ liệu MathFlip Toán 7.
-- ===========================================================================
do $$
begin
  if exists (select 1 from public.students) or exists (select 1 from public.quiz_attempts) then
    raise exception E'\n\n>>> DỪNG LẠI: Cơ sở dữ liệu này đã có học sinh / bài làm. Tệp 39 chỉ dùng cho dự án Supabase MỚI của FlipMath9. <<<\n';
  end if;
end $$;

begin;
delete from public.distractor_errors;
delete from public.question_options;
delete from public.questions;
delete from public.error_hints;
delete from public.micro_lessons;
delete from public.error_dictionary;
delete from public.contents;
delete from public.mm_activities where activity_id not like 'HD-CHUNG-%';
delete from public.knowledge_units;
commit;

select 'knowledge_units' as bang, count(*) as con_lai from public.knowledge_units
union all select 'questions', count(*) from public.questions
union all select 'mm_activities (dùng chung)', count(*) from public.mm_activities;

-- >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> 41-man-chinh-giao-vien.sql
-- ===========================================================================
-- FlipMath9 · 41 · BA MÀN CHÍNH CỦA GIÁO VIÊN (SCREENS GV-15, GV-16, GV-17)
--
-- Thêm 4 bảng:
--   class_settings     ngưỡng khối B, C của GV-16 (Cài đặt lớp, GV-13)
--   gv_giao_viec       nhắc nhở, Gói sửa lỗi, Gói lấp nền GV giao cho HS
--   gv_bo_qua          HS được GV "Bỏ qua lần này" ở khối Học chưa chăm
--   gv_ke_hoach_tiet   bản gợi ý tiết dạy GV đã chỉnh (GV-17)
--
-- Chạy sau 00-FLIPMATH9-KHOI-TAO.sql. Chạy lại nhiều lần được.
-- ===========================================================================

create table if not exists public.class_settings (
  class_id   text primary key references classes(class_id) on delete cascade,
  nguong     jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.class_settings enable row level security;
drop policy if exists "gv doc cai dat lop" on public.class_settings;
create policy "gv doc cai dat lop" on public.class_settings for select to authenticated using (public.teaches_class(class_id));
drop policy if exists "gv ghi cai dat lop" on public.class_settings;
create policy "gv ghi cai dat lop" on public.class_settings for insert to authenticated with check (public.teaches_class(class_id));
drop policy if exists "gv sua cai dat lop" on public.class_settings;
create policy "gv sua cai dat lop" on public.class_settings for update to authenticated
  using (public.teaches_class(class_id)) with check (public.teaches_class(class_id));

-- Việc GV giao cho từng HS. Lời nhắn là chữ GV đã duyệt; KHÔNG lưu nhãn
-- "học chưa chăm" ở đây, vì HS đọc được bảng này.
create table if not exists public.gv_giao_viec (
  id          bigserial primary key,
  class_id    text not null references classes(class_id) on delete cascade,
  student_id  text not null references students(student_id) on delete cascade,
  loai        text not null check (loai in ('nhac-nho','goi-sua-loi','goi-lap-nen')),
  loi_nhan    text not null check (char_length(loi_nhan) between 1 and 300),
  muc_tieu    text[] not null default '{}',     -- mã lỗi (gói sửa lỗi) hoặc mã mục (gói lấp nền)
  tao_boi     uuid not null default auth.uid() references auth.users(id),
  created_at  timestamptz not null default now(),
  da_xem_at   timestamptz,
  xong_at     timestamptz
);
create index if not exists idx_gv_giao_viec_hs on public.gv_giao_viec(student_id, created_at desc);
create index if not exists idx_gv_giao_viec_lop on public.gv_giao_viec(class_id, created_at desc);
alter table public.gv_giao_viec enable row level security;
drop policy if exists "gv doc giao viec" on public.gv_giao_viec;
create policy "gv doc giao viec" on public.gv_giao_viec for select to authenticated
  using (public.teaches_class(class_id) or student_id = public.my_student_id());
drop policy if exists "gv tao giao viec" on public.gv_giao_viec;
create policy "gv tao giao viec" on public.gv_giao_viec for insert to authenticated
  with check (public.teaches_class(class_id) and public.teaches_student(student_id) and tao_boi = auth.uid());
drop policy if exists "hs danh dau da xem" on public.gv_giao_viec;
create policy "hs danh dau da xem" on public.gv_giao_viec for update to authenticated
  using (student_id = public.my_student_id()) with check (student_id = public.my_student_id());
-- HS chỉ được sửa hai cột thời điểm, không sửa được lời nhắn hay người giao.
revoke update on public.gv_giao_viec from authenticated;
grant update (da_xem_at, xong_at) on public.gv_giao_viec to authenticated;
grant usage, select on sequence public.gv_giao_viec_id_seq to authenticated;

create table if not exists public.gv_bo_qua (
  class_id   text not null references classes(class_id) on delete cascade,
  student_id text not null references students(student_id) on delete cascade,
  den_ngay   date not null,
  created_at timestamptz not null default now(),
  primary key (class_id, student_id)
);
alter table public.gv_bo_qua enable row level security;
drop policy if exists "gv doc bo qua" on public.gv_bo_qua;
create policy "gv doc bo qua" on public.gv_bo_qua for select to authenticated using (public.teaches_class(class_id));
drop policy if exists "gv ghi bo qua" on public.gv_bo_qua;
create policy "gv ghi bo qua" on public.gv_bo_qua for insert to authenticated
  with check (public.teaches_class(class_id) and public.teaches_student(student_id));
drop policy if exists "gv sua bo qua" on public.gv_bo_qua;
create policy "gv sua bo qua" on public.gv_bo_qua for update to authenticated
  using (public.teaches_class(class_id)) with check (public.teaches_class(class_id));

create table if not exists public.gv_ke_hoach_tiet (
  class_id    text not null references classes(class_id) on delete cascade,
  lesson_id   text not null,
  loi_dua_vao text[] not null default '{}',     -- lỗi GV bấm "Đưa vào tiết dạy" ở GV-15
  ban_sua     jsonb,                            -- 4 hoạt động sau khi GV chấp nhận/sửa/bỏ
  updated_at  timestamptz not null default now(),
  primary key (class_id, lesson_id)
);
alter table public.gv_ke_hoach_tiet enable row level security;
drop policy if exists "gv doc ke hoach tiet" on public.gv_ke_hoach_tiet;
create policy "gv doc ke hoach tiet" on public.gv_ke_hoach_tiet for select to authenticated using (public.teaches_class(class_id));
drop policy if exists "gv ghi ke hoach tiet" on public.gv_ke_hoach_tiet;
create policy "gv ghi ke hoach tiet" on public.gv_ke_hoach_tiet for insert to authenticated with check (public.teaches_class(class_id));
drop policy if exists "gv sua ke hoach tiet" on public.gv_ke_hoach_tiet;
create policy "gv sua ke hoach tiet" on public.gv_ke_hoach_tiet for update to authenticated
  using (public.teaches_class(class_id)) with check (public.teaches_class(class_id));

grant select, insert, update on public.class_settings, public.gv_bo_qua, public.gv_ke_hoach_tiet to authenticated;
grant select, insert on public.gv_giao_viec to authenticated;

select 'Xong tệp 41: ' || count(*) || ' bảng màn chính giáo viên' as ket_qua
  from information_schema.tables
 where table_schema = 'public'
   and table_name in ('class_settings','gv_giao_viec','gv_bo_qua','gv_ke_hoach_tiet');
