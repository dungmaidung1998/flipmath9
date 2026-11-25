-- ============================================================================
-- 56 · ĐO CHIỀU CAO ĐÀ NẴNG (C4), CHỈ SỐ TỰ LỰC, ÔN THI KHÔNG QUÁ TẢI & PHỤ HUYNH
-- Chạy sau 01-schema.sql, 40a-noi-dung-toan-9-tap-1.sql, 42-soat-loi-va-on-ngat-quang.sql,
-- 51-phan-cap-truong-gv-lop.sql.
-- Chạy lại nhiều lần an toàn (idempotent). KHÔNG xoá dữ liệu cũ.
-- ============================================================================

do $$
begin
  if to_regclass('public.students') is null
     or to_regclass('public.classes') is null
     or to_regclass('public.knowledge_units') is null then
    raise exception E'\n\n>>> DỪNG LẠI: Cần chạy 01-schema.sql TRƯỚC tệp 56. <<<\n';
  end if;
  if not exists (select 1 from pg_proc where proname = 'teaches_class')
     or not exists (select 1 from pg_proc where proname = 'teaches_student')
     or not exists (select 1 from pg_proc where proname = 'my_student_id') then
    raise exception E'\n\n>>> DỪNG LẠI: Cần chạy 51-phan-cap-truong-gv-lop.sql TRƯỚC tệp 56. <<<\n';
  end if;
end $$;

begin;

-- 1. Mã lỗi mới cho hoạt động đo chiều cao Chương IV (nếu chưa có)
insert into public.error_dictionary (error_code, ku_id, misconception)
values
  ('E-HTL-05', 'C4-B12-M3', 'Quên cộng chiều cao mắt người đo m khi tính chiều cao vật từ góc nâng')
on conflict (error_code) do nothing;

-- 2. Vật mốc do giáo viên khai báo chiều cao thật (cột cờ, toà nhà, Cầu Rồng...)
create table if not exists public.vat_moc (
  id           uuid primary key default gen_random_uuid(),
  class_id     text not null references public.classes(class_id) on delete cascade,
  ten          text not null,
  h_that       numeric(8,2),
  cach_do_that text,
  tao_boi      uuid references auth.users(id),
  tao_luc      timestamptz not null default now()
);

create index if not exists idx_vat_moc_lop on public.vat_moc (class_id, tao_luc desc);

alter table public.vat_moc enable row level security;

drop policy if exists "hs xem vat moc lop minh" on public.vat_moc;
create policy "hs xem vat moc lop minh"
  on public.vat_moc for select to authenticated
  using (
    exists (
      select 1 from public.students s
       where s.student_id = public.my_student_id()
         and s.class_id = vat_moc.class_id
    )
  );

drop policy if exists "gv quan ly vat moc" on public.vat_moc;
create policy "gv quan ly vat moc"
  on public.vat_moc for all to authenticated
  using (public.teaches_class(class_id))
  with check (public.teaches_class(class_id));

-- 3. Lịch sử đo chiều cao bằng điện thoại / thanh trượt (dữ liệu KHKT Chương IV)
create table if not exists public.do_chieu_cao (
  id          uuid primary key default gen_random_uuid(),
  student_id  text not null references public.students(student_id) on delete cascade,
  class_id    text not null references public.classes(class_id) on delete cascade,
  vat_id      uuid references public.vat_moc(id) on delete set null,
  ten_vat     text not null,
  cach_do     text not null check (cach_do in ('mot-diem', 'hai-diem')),
  d           numeric(8,2),
  a           numeric(8,2),
  alpha1      numeric(6,2) not null,
  alpha2      numeric(6,2),
  m           numeric(5,2) not null default 1.50,
  h_tinh      numeric(8,2) not null,
  h_hs_nhap   numeric(8,2) not null,
  hs_dung     boolean not null default false,
  nguon_goc   text not null check (nguon_goc in ('cam-bien', 'thanh-truot')),
  do_lech_goc numeric(6,2) not null default 0,
  tao_luc     timestamptz not null default now()
);

create index if not exists idx_do_chieu_cao_hs  on public.do_chieu_cao (student_id, tao_luc desc);
create index if not exists idx_do_chieu_cao_lop on public.do_chieu_cao (class_id, tao_luc desc);

alter table public.do_chieu_cao enable row level security;

drop policy if exists "hs xem do chieu cao cua minh" on public.do_chieu_cao;
create policy "hs xem do chieu cao cua minh"
  on public.do_chieu_cao for select to authenticated
  using (student_id = public.my_student_id());

-- Học sinh KHÔNG ghi thẳng vào bảng này: mọi lần đo đi qua /api/do-chieu-cao để máy chủ
-- tự tính h và tự chấm đúng/sai (tránh sửa số liệu nghiên cứu từ trình duyệt).
drop policy if exists "hs them do chieu cao cua minh" on public.do_chieu_cao;

drop policy if exists "gv xem do chieu cao lop" on public.do_chieu_cao;
create policy "gv xem do chieu cao lop"
  on public.do_chieu_cao for select to authenticated
  using (public.teaches_class(class_id) or public.teaches_student(student_id));

-- 4. Sự kiện chỉ số tự lực khi nhận gợi ý / AI
create table if not exists public.goi_y_su_kien (
  id            uuid primary key default gen_random_uuid(),
  student_id    text not null references public.students(student_id) on delete cascade,
  class_id      text references public.classes(class_id) on delete set null,
  nguon         text not null check (nguon in ('goi-y-loi', 'hoi-bin', 'cham-vo', 'do-chieu-cao', 'tro-choi')),
  tang          smallint check (tang in (1, 2, 3)),
  ku_id         text,
  question_id   text,
  error_code    text,
  co_ai         boolean not null default false,
  tao_luc       timestamptz not null default now(),
  thu_lai_luc   timestamptz,
  tu_giai       boolean,
  so_goi_y_them smallint not null default 0,
  xem_loi_giai  boolean not null default false
);

create index if not exists idx_goi_y_su_kien_hs  on public.goi_y_su_kien (student_id, tao_luc);
create index if not exists idx_goi_y_su_kien_lop on public.goi_y_su_kien (class_id, tao_luc);

alter table public.goi_y_su_kien enable row level security;

drop policy if exists "hs xem su kien tu luc cua minh" on public.goi_y_su_kien;
create policy "hs xem su kien tu luc cua minh"
  on public.goi_y_su_kien for select to authenticated
  using (student_id = public.my_student_id());

drop policy if exists "gv xem su kien tu luc lop" on public.goi_y_su_kien;
create policy "gv xem su kien tu luc lop"
  on public.goi_y_su_kien for select to authenticated
  using (public.teaches_class(class_id) or public.teaches_student(student_id));

-- 5. Cấu hình ngưỡng & giới hạn học không quá tải theo lớp (GV chỉnh)
create table if not exists public.gioi_han_lop (
  class_id          text primary key references public.classes(class_id) on delete cascade,
  phut_ngay         int not null default 90,
  gio_khuya         text not null default '22:30',
  gio_sang          text not null default '05:30',
  phut_lien_tuc     int not null default 50,
  sai_lien_tiep     int not null default 5,
  don_dap_so_cau    int not null default 12,
  don_dap_ti_le     numeric(4,2) not null default 0.50,
  bat_khuya         boolean not null default true,
  bat_lien_tuc      boolean not null default true,
  bat_sai_lien_tiep boolean not null default true,
  bat_don_dap       boolean not null default true,
  bat_vuot_ngay     boolean not null default true,
  cap_nhat_boi      uuid references auth.users(id),
  cap_nhat          timestamptz not null default now()
);

alter table public.gioi_han_lop enable row level security;

drop policy if exists "gv quan ly gioi han lop" on public.gioi_han_lop;
create policy "gv quan ly gioi han lop"
  on public.gioi_han_lop for all to authenticated
  using (public.teaches_class(class_id))
  with check (public.teaches_class(class_id));

drop policy if exists "hs xem gioi han lop minh" on public.gioi_han_lop;
create policy "hs xem gioi han lop minh"
  on public.gioi_han_lop for select to authenticated
  using (
    exists (
      select 1 from public.students s
       where s.student_id = public.my_student_id()
         and s.class_id = gioi_han_lop.class_id
    )
  );

-- 6. Giới hạn theo từng học sinh (GV hoặc phụ huynh đặt; áp dụng mức chặt hơn)
create table if not exists public.gioi_han_hoc (
  student_id text primary key references public.students(student_id) on delete cascade,
  phut_ngay  int not null default 90,
  gio_khuya  text not null default '22:30',
  gio_sang   text not null default '05:30',
  dat_boi    text not null check (dat_boi in ('gv', 'phu-huynh')),
  cap_nhat   timestamptz not null default now()
);

alter table public.gioi_han_hoc enable row level security;

drop policy if exists "hs xem gioi han cua minh" on public.gioi_han_hoc;
create policy "hs xem gioi han cua minh"
  on public.gioi_han_hoc for select to authenticated
  using (student_id = public.my_student_id());

drop policy if exists "gv quan ly gioi han hs" on public.gioi_han_hoc;
create policy "gv quan ly gioi han hs"
  on public.gioi_han_hoc for all to authenticated
  using (public.teaches_student(student_id))
  with check (public.teaches_student(student_id));

-- 7. Mã phụ huynh 6 chữ số (CHỈ lưu bản băm SHA-256, không lưu mã thô)
create table if not exists public.ma_phu_huynh (
  id         uuid primary key default gen_random_uuid(),
  student_id text not null references public.students(student_id) on delete cascade,
  ma_bam     text not null,
  tao_luc    timestamptz not null default now(),
  thu_hoi    boolean not null default false
);

create index if not exists idx_ma_phu_huynh_hs on public.ma_phu_huynh (student_id, thu_hoi);

alter table public.ma_phu_huynh enable row level security;

drop policy if exists "gv quan ly ma phu huynh" on public.ma_phu_huynh;
create policy "gv quan ly ma phu huynh"
  on public.ma_phu_huynh for all to authenticated
  using (public.teaches_student(student_id))
  with check (public.teaches_student(student_id));

-- 8. Nhật ký chặn đoán mã phụ huynh theo IP (tối đa 5 lần sai/giờ, truy cập qua service role)
create table if not exists public.phu_huynh_thu_ma (
  id         uuid primary key default gen_random_uuid(),
  ip_hash    text not null,
  thanh_cong boolean not null default false,
  tao_luc    timestamptz not null default now()
);

create index if not exists idx_ph_thu_ma_ip on public.phu_huynh_thu_ma (ip_hash, tao_luc desc);

alter table public.phu_huynh_thu_ma enable row level security;

commit;
