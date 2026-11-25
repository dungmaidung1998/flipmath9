-- ============================================================================
-- 53 · 5 TÍNH NĂNG BỔ SUNG CHO VÒNG THI KHKT (24/11/2026)
-- Chạy sau 01-schema.sql, 18-danh-gia-va-mastery.sql, 42-soat-loi-va-on-ngat-quang.sql,
-- 51-phan-cap-truong-gv-lop.sql.
-- Chạy được nhiều lần (idempotent). KHÔNG xoá dữ liệu cũ.
-- ============================================================================

do $$
begin
  if to_regclass('public.classes') is null
     or to_regclass('public.students') is null
     or to_regclass('public.knowledge_units') is null
     or to_regclass('public.questions') is null
     or to_regclass('public.quiz_attempts') is null then
    raise exception E'\n\n>>> DỪNG LẠI: Cần chạy 01-schema.sql và các bảng nền tảng TRƯỚC tệp 53. <<<\n';
  end if;
  if not exists (select 1 from pg_proc where proname = 'teaches_class')
     or not exists (select 1 from pg_proc where proname = 'teaches_student')
     or not exists (select 1 from pg_proc where proname = 'my_student_id')
     or not exists (select 1 from pg_proc where proname = 'is_teacher') then
    raise exception E'\n\n>>> DỪNG LẠI: Cần chạy 51-phan-cap-truong-gv-lop.sql TRƯỚC tệp 53 để có teaches_class / teaches_student / my_student_id / is_teacher. <<<\n';
  end if;
end $$;

begin;

-- ---------------------------------------------------------------------------
-- 1. MỞ RỘNG quiz_attempts: thêm loại bài (trình chiếu, phiếu giấy, đề thử),
--    cột nguon và mã lượt làm chống gửi trùng khi mất mạng (client_submission_id).
-- ---------------------------------------------------------------------------
do $$
declare
  r record;
begin
  for r in
    select c.conname
      from pg_constraint c
      join pg_class t on t.oid = c.conrelid
      join pg_namespace n on n.oid = t.relnamespace
     where n.nspname = 'public'
       and t.relname = 'quiz_attempts'
       and c.contype = 'c'
       and pg_get_constraintdef(c.oid) ilike '%kind%'
  loop
    execute format('alter table public.quiz_attempts drop constraint if exists %I', r.conname);
  end loop;
end $$;

alter table public.quiz_attempts
  add constraint quiz_attempts_kind_check
  check (kind in ('chuan-bi', 'van-dung', 'trinh-chieu', 'phieu-giay', 'de-thu'));

alter table public.quiz_attempts
  add column if not exists nguon text not null default 'web';

alter table public.quiz_attempts
  add column if not exists client_submission_id text;

create unique index if not exists idx_quiz_attempts_client_sub
  on public.quiz_attempts (student_id, client_submission_id)
  where client_submission_id is not null;

-- ---------------------------------------------------------------------------
-- 2. TÍNH NĂNG 1: ĐỀ KIỂM TRA THƯỜNG XUYÊN THEO MA TRẬN 4 CẤP ĐỘ
-- ---------------------------------------------------------------------------
create table if not exists public.de_kiem_tra (
  id             uuid primary key default gen_random_uuid(),
  class_id       text not null references public.classes(class_id) on delete cascade,
  chuong         text not null,
  ku_ids         text[] not null,
  tieu_de        text not null,
  thoi_gian_phut int not null default 15 check (thoi_gian_phut between 5 and 120),
  ma_tran        jsonb not null,
  cau_hoi        jsonb not null,
  cho_lam_thu    boolean not null default true,
  canh_bao       text,
  tao_boi        uuid not null references auth.users(id),
  tao_luc        timestamptz not null default now()
);

create index if not exists idx_de_kt_lop on public.de_kiem_tra (class_id, tao_luc desc);

alter table public.de_kiem_tra enable row level security;

-- Chỉ giáo viên phụ trách lớp được đọc/tạo/sửa/xoá trực tiếp bảng này
-- vì cột cau_hoi có chứa correct_option. Học sinh nhận đề đã lược đáp án qua API.
drop policy if exists "gv quan ly de kiem tra" on public.de_kiem_tra;
create policy "gv quan ly de kiem tra"
  on public.de_kiem_tra for all to authenticated
  using (public.teaches_class(class_id))
  with check (public.teaches_class(class_id));

create table if not exists public.de_kiem_tra_lam (
  id              uuid primary key default gen_random_uuid(),
  de_id           uuid not null references public.de_kiem_tra(id) on delete cascade,
  student_id      text not null references public.students(student_id) on delete cascade,
  class_id        text not null references public.classes(class_id) on delete cascade,
  tra_loi         jsonb not null,
  diem            numeric(4,2) not null,
  so_dung         int not null,
  tong_cau        int not null,
  thoi_gian_giay  int,
  nop_luc         timestamptz not null default now()
);

create index if not exists idx_de_kt_lam_de on public.de_kiem_tra_lam (de_id, nop_luc desc);
create index if not exists idx_de_kt_lam_hs on public.de_kiem_tra_lam (student_id, nop_luc desc);

alter table public.de_kiem_tra_lam enable row level security;

drop policy if exists "doc bai lam de kiem tra" on public.de_kiem_tra_lam;
create policy "doc bai lam de kiem tra"
  on public.de_kiem_tra_lam for select to authenticated
  using (
    student_id = public.my_student_id()
    or public.teaches_class(class_id)
    or public.teaches_student(student_id)
  );

-- ---------------------------------------------------------------------------
-- 3. TÍNH NĂNG 2: CHẾ ĐỘ TRÌNH CHIẾU TRÊN LỚP
-- ---------------------------------------------------------------------------
create table if not exists public.phong_trinh_chieu (
  ma_phong        text primary key,
  class_id        text not null references public.classes(class_id) on delete cascade,
  ku_id           text not null references public.knowledge_units(ku_id),
  chuong          text not null,
  giao_vien       uuid not null references auth.users(id),
  trang_thai      text not null default 'cho'
                  check (trang_thai in ('cho', 'dang-hoi', 'hien-dap-an', 'ket-thuc')),
  chi_so_cau      int not null default 0,
  giay_moi_cau    int not null default 30 check (giay_moi_cau between 10 and 300),
  bat_dau_cau_luc timestamptz,
  cau_hoi         jsonb not null, -- KHÔNG chứa correct_option
  tao_luc         timestamptz not null default now(),
  cap_nhat        timestamptz not null default now()
);

create index if not exists idx_phong_tc_lop on public.phong_trinh_chieu (class_id, tao_luc desc);

alter table public.phong_trinh_chieu enable row level security;

drop policy if exists "doc phong trinh chieu" on public.phong_trinh_chieu;
create policy "doc phong trinh chieu"
  on public.phong_trinh_chieu for select to authenticated
  using (
    public.teaches_class(class_id)
    or class_id = (select s.class_id from public.students s where s.student_id = public.my_student_id())
  );

drop policy if exists "gv quan ly phong trinh chieu" on public.phong_trinh_chieu;
create policy "gv quan ly phong trinh chieu"
  on public.phong_trinh_chieu for all to authenticated
  using (public.teaches_class(class_id))
  with check (public.teaches_class(class_id));

-- Đáp án phòng trình chiếu tách riêng để học sinh không đọc được qua Realtime/SELECT.
create table if not exists public.phong_dap_an (
  ma_phong text primary key references public.phong_trinh_chieu(ma_phong) on delete cascade,
  dap_an   jsonb not null
);

alter table public.phong_dap_an enable row level security;

drop policy if exists "gv doc dap an phong" on public.phong_dap_an;
create policy "gv doc dap an phong"
  on public.phong_dap_an for all to authenticated
  using (
    exists (
      select 1 from public.phong_trinh_chieu p
      where p.ma_phong = phong_dap_an.ma_phong
        and public.teaches_class(p.class_id)
    )
  )
  with check (
    exists (
      select 1 from public.phong_trinh_chieu p
      where p.ma_phong = phong_dap_an.ma_phong
        and public.teaches_class(p.class_id)
    )
  );

create table if not exists public.phong_tra_loi (
  id            bigserial primary key,
  ma_phong      text not null references public.phong_trinh_chieu(ma_phong) on delete cascade,
  student_id    text not null references public.students(student_id) on delete cascade,
  chi_so_cau    int not null,
  question_id   text not null,
  chosen_option text not null,
  nhan_hien_thi text not null,
  is_correct    boolean not null,
  error_code    text,
  diem          int not null default 0,
  thoi_gian_ms  int not null default 0,
  tao_luc       timestamptz not null default now(),
  unique (ma_phong, student_id, chi_so_cau)
);

create index if not exists idx_phong_tl_phong on public.phong_tra_loi (ma_phong, chi_so_cau);

alter table public.phong_tra_loi enable row level security;

drop policy if exists "doc tra loi phong" on public.phong_tra_loi;
create policy "doc tra loi phong"
  on public.phong_tra_loi for select to authenticated
  using (
    student_id = public.my_student_id()
    or exists (
      select 1 from public.phong_trinh_chieu p
      where p.ma_phong = phong_tra_loi.ma_phong
        and public.teaches_class(p.class_id)
    )
  );

-- ---------------------------------------------------------------------------
-- 4. TÍNH NĂNG 9: NHẬN XÉT GIÁO VIÊN CHO HỒ SƠ NĂNG LỰC THEO CHƯƠNG
-- ---------------------------------------------------------------------------
create table if not exists public.ho_so_nhan_xet (
  student_id text not null references public.students(student_id) on delete cascade,
  chuong     text not null,
  nhan_xet   text not null default '',
  giao_vien  uuid references auth.users(id),
  cap_nhat   timestamptz not null default now(),
  primary key (student_id, chuong)
);

alter table public.ho_so_nhan_xet enable row level security;

drop policy if exists "doc nhan xet ho so" on public.ho_so_nhan_xet;
create policy "doc nhan xet ho so"
  on public.ho_so_nhan_xet for select to authenticated
  using (
    student_id = public.my_student_id()
    or public.teaches_student(student_id)
  );

drop policy if exists "gv sua nhan xet ho so" on public.ho_so_nhan_xet;
create policy "gv sua nhan xet ho so"
  on public.ho_so_nhan_xet for all to authenticated
  using (public.teaches_student(student_id))
  with check (public.teaches_student(student_id));

-- Bật Supabase Realtime cho phòng trình chiếu (an toàn nếu đã bật hoặc chưa có publication)
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    begin
      alter publication supabase_realtime add table public.phong_trinh_chieu;
    exception when duplicate_object then null;
    end;
    begin
      alter publication supabase_realtime add table public.phong_tra_loi;
    exception when duplicate_object then null;
    end;
  end if;
end $$;

commit;
