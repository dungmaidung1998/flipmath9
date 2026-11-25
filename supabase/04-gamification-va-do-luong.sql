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
