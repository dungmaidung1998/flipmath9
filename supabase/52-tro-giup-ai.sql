-- ===========================================================================
-- TRỢ GIẢNG AI CHO FLIPMATH9 — chạy sau 05-goi-y-theo-tang.sql & 51-phan-cap-truong-gv-lop.sql
--
-- RÀNG BUỘC PHÁP LÝ & AN TOÀN:
--   1. Học sinh (< 18 tuổi) KHÔNG BAO GIỜ gọi Gemini trực tiếp hay gián tiếp.
--   2. Chỉ giáo viên / quản trị (is_teacher()) mới tạo/duyệt gợi ý (error_hints)
--      và trả lời / lưu ngân hàng (hoi_dap).
--   3. Mọi câu trả lời có AI hỗ trợ đều đánh dấu nguon = 'ai-duyet' và do giáo
--      viên duyệt trước khi học sinh nhìn thấy.
-- ===========================================================================

do $$
begin
  if to_regclass('public.error_hints') is null
     or to_regclass('public.classes') is null
     or to_regclass('public.students') is null then
    raise exception E'\n\n>>> DỪNG LẠI: Cần chạy 01-schema.sql và 05-goi-y-theo-tang.sql TRƯỚC tệp 52. <<<\n';
  end if;
  if not exists (select 1 from pg_proc where proname = 'teaches_class') then
    raise exception E'\n\n>>> DỪNG LẠI: Cần chạy 51-phan-cap-truong-gv-lop.sql TRƯỚC tệp 52 để có teaches_class / teaches_student. <<<\n';
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- 1. MỞ RỘNG BẢNG error_hints (gợi ý theo tầng do GV hoặc AI+GV duyệt)
-- ---------------------------------------------------------------------------
alter table error_hints
  add column if not exists nguon text not null default 'gv'
  check (nguon in ('gv', 'ai-duyet'));

alter table error_hints
  add column if not exists duyet_boi uuid references auth.users(id);

alter table error_hints
  add column if not exists cap_nhat timestamptz not null default now();

alter table error_hints enable row level security;

drop policy if exists "gv doc goi y" on error_hints;
create policy "gv doc goi y"
  on error_hints for select to authenticated
  using (public.is_teacher());

drop policy if exists "gv sua goi y" on error_hints;
create policy "gv sua goi y"
  on error_hints for all to authenticated
  using (public.is_teacher())
  with check (public.is_teacher());

-- ---------------------------------------------------------------------------
-- 2. NGÂN HÀNG HỎI–ĐÁP ĐÃ DUYỆT (hoi_dap) — học sinh tra cứu KHÔNG AI
-- ---------------------------------------------------------------------------
create table if not exists hoi_dap (
  id         uuid primary key default gen_random_uuid(),
  ku_id      text references knowledge_units(ku_id) on delete set null,
  cau_hoi    text not null,
  tra_loi    text not null,
  tu_khoa    text[] not null default '{}',
  nguon      text not null default 'gv' check (nguon in ('gv', 'ai-duyet')),
  duyet_boi  uuid references auth.users(id),
  so_lan_dung int not null default 0,
  tao_luc    timestamptz not null default now(),
  cap_nhat   timestamptz not null default now()
);

create index if not exists idx_hoi_dap_ku on hoi_dap (ku_id);

alter table hoi_dap enable row level security;

drop policy if exists "hoi dap doc" on hoi_dap;
create policy "hoi dap doc"
  on hoi_dap for select to authenticated
  using (true);

drop policy if exists "hoi dap gv" on hoi_dap;
create policy "hoi dap gv"
  on hoi_dap for all to authenticated
  using (public.is_teacher())
  with check (public.is_teacher());

-- ---------------------------------------------------------------------------
-- 3. HỘP THƯ HỎI BIN (hoi_bin) — câu hỏi của học sinh & phản hồi đã duyệt
-- ---------------------------------------------------------------------------
create table if not exists hoi_bin (
  id          uuid primary key default gen_random_uuid(),
  student_id  text not null references students(student_id) on delete cascade,
  class_id    text not null references classes(class_id) on delete cascade,
  ku_id       text references knowledge_units(ku_id) on delete set null,
  cau_hoi     text not null,
  trang_thai  text not null default 'cho' check (trang_thai in ('cho', 'da-tra-loi', 'tu-choi')),
  tra_loi     text,
  nguon       text check (nguon in ('gv', 'ai-duyet')),
  tra_loi_boi uuid references auth.users(id),
  tra_loi_luc timestamptz,
  tao_luc     timestamptz not null default now()
);

create index if not exists idx_hoi_bin_lop on hoi_bin (class_id, trang_thai, tao_luc desc);
create index if not exists idx_hoi_bin_hs  on hoi_bin (student_id, tao_luc desc);

alter table hoi_bin enable row level security;

drop policy if exists "hs doc hoi bin" on hoi_bin;
create policy "hs doc hoi bin"
  on hoi_bin for select to authenticated
  using (student_id = public.my_student_id());

drop policy if exists "hs gui hoi bin" on hoi_bin;
create policy "hs gui hoi bin"
  on hoi_bin for insert to authenticated
  with check (
    student_id = public.my_student_id()
    and exists (
      select 1 from students s
      where s.student_id = public.my_student_id()
        and s.class_id = hoi_bin.class_id
    )
  );

drop policy if exists "gv doc hoi bin" on hoi_bin;
create policy "gv doc hoi bin"
  on hoi_bin for select to authenticated
  using (public.teaches_class(class_id) or public.teaches_student(student_id));

drop policy if exists "gv tra loi hoi bin" on hoi_bin;
create policy "gv tra loi hoi bin"
  on hoi_bin for update to authenticated
  using (public.teaches_class(class_id) or public.teaches_student(student_id))
  with check (public.teaches_class(class_id) or public.teaches_student(student_id));

-- ---------------------------------------------------------------------------
-- 4. NHẬT KÝ SỬ DỤNG AI (ai_nhat_ky) — phục vụ minh bạch & giám khảo
-- ---------------------------------------------------------------------------
create table if not exists ai_nhat_ky (
  id         bigserial primary key,
  giao_vien  uuid not null references auth.users(id),
  loai       text not null check (loai in ('goi-y-loi', 'soan-nhap-hoi-bin')),
  doi_tuong  text,
  mo_hinh    text,
  thanh_cong boolean not null default true,
  ghi_chu    text,
  tao_luc    timestamptz not null default now()
);

create index if not exists idx_ai_nhat_ky_luc on ai_nhat_ky (tao_luc desc);
create index if not exists idx_ai_nhat_ky_gv  on ai_nhat_ky (giao_vien, tao_luc desc);

alter table ai_nhat_ky enable row level security;

drop policy if exists "gv doc ai nhat ky" on ai_nhat_ky;
create policy "gv doc ai nhat ky"
  on ai_nhat_ky for select to authenticated
  using (public.is_teacher());

drop policy if exists "gv ghi ai nhat ky" on ai_nhat_ky;
create policy "gv ghi ai nhat ky"
  on ai_nhat_ky for insert to authenticated
  with check (public.is_teacher() and giao_vien = auth.uid());
