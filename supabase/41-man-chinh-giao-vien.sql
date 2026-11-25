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
