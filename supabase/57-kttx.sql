-- ============================================================================
-- 57 · KTTX TRÊN GIẤY (SỐ HOÁ BÀI KIỂM TRA ĐÃ CHẤM BẰNG CLAUDE API)
-- Chạy sau 01-schema.sql, 51-phan-cap-truong-gv-lop.sql, 53-tinh-nang-khkt.sql.
-- Chạy lại nhiều lần an toàn (idempotent). KHÔNG xoá dữ liệu cũ.
-- ============================================================================

do $$
begin
  if to_regclass('public.students') is null
     or to_regclass('public.classes') is null then
    raise exception E'\n\n>>> DỪNG LẠI: Cần chạy 01-schema.sql TRƯỚC tệp 57. <<<\n';
  end if;
  if not exists (select 1 from pg_proc where proname = 'teaches_class')
     or not exists (select 1 from pg_proc where proname = 'teaches_student')
     or not exists (select 1 from pg_proc where proname = 'my_student_id') then
    raise exception E'\n\n>>> DỪNG LẠI: Cần chạy 51-phan-cap-truong-gv-lop.sql TRƯỚC tệp 57. <<<\n';
  end if;
end $$;

begin;

-- 1. Bài KTTX theo lớp (có thể nhập khung câu từ bảng de_kiem_tra)
create table if not exists public.kttx_bai (
  id          uuid primary key default gen_random_uuid(),
  class_id    text not null references public.classes(class_id) on delete cascade,
  de_id       uuid references public.de_kiem_tra(id) on delete set null,
  tieu_de     text not null,
  chuong      text,
  ngay_thi    date,
  thang_diem  numeric(4,2) not null default 10,
  khung_cau   jsonb not null default '[]'::jsonb,
  tao_boi     uuid references auth.users(id),
  tao_luc     timestamptz not null default now(),
  cap_nhat    timestamptz not null default now()
);

create index if not exists idx_kttx_bai_lop on public.kttx_bai (class_id, tao_luc desc);

alter table public.kttx_bai enable row level security;

drop policy if exists "hs xem kttx bai lop minh" on public.kttx_bai;
create policy "hs xem kttx bai lop minh"
  on public.kttx_bai for select to authenticated
  using (
    exists (
      select 1 from public.students s
       where s.student_id = public.my_student_id()
         and s.class_id = kttx_bai.class_id
    )
  );

drop policy if exists "gv quan ly kttx bai" on public.kttx_bai;
create policy "gv quan ly kttx bai"
  on public.kttx_bai for all to authenticated
  using (public.teaches_class(class_id))
  with check (public.teaches_class(class_id));

-- 2. Bài KTTX học sinh chụp & AI đọc (lưu tối đa 4 trang ảnh trong 30 ngày)
create table if not exists public.kttx_bai_nop (
  id                 uuid primary key default gen_random_uuid(),
  bai_id             uuid references public.kttx_bai(id) on delete set null,
  student_id         text not null references public.students(student_id) on delete cascade,
  class_id           text not null references public.classes(class_id) on delete cascade,
  ngay               text not null,
  so_trang           int not null default 1 check (so_trang between 1 and 4),
  anh_paths          jsonb not null default '[]'::jsonb,
  anh_da_xoa         boolean not null default false,
  het_han_anh        timestamptz not null default (now() + interval '30 days'),
  ten_bai_ai         text,
  ngay_thi_ai        text,
  tong_diem_ai       numeric(4,2),
  tong_diem_tren_bai numeric(4,2),
  tong_diem_gv       numeric(4,2),
  tong_diem_khop     boolean not null default true,
  can_kiem_tra       boolean not null default false,
  ly_do_kiem_tra     text[] not null default '{}',
  mo_hinh            text,
  trang_thai         text not null default 'cho-duyet' check (trang_thai in ('cho-duyet', 'da-duyet', 'tu-choi')),
  nhan_xet_gv        text,
  gv_duyet_boi       uuid references auth.users(id),
  gv_duyet_luc       timestamptz,
  da_ghi_so_loi      boolean not null default false,
  tao_luc            timestamptz not null default now(),
  cap_nhat           timestamptz not null default now()
);

create index if not exists idx_kttx_nop_hs_ngay on public.kttx_bai_nop (student_id, ngay);
create index if not exists idx_kttx_nop_bai on public.kttx_bai_nop (bai_id, trang_thai, tao_luc desc);
create index if not exists idx_kttx_nop_lop on public.kttx_bai_nop (class_id, tao_luc desc);

alter table public.kttx_bai_nop enable row level security;

drop policy if exists "hs xem kttx bai nop cua minh" on public.kttx_bai_nop;
create policy "hs xem kttx bai nop cua minh"
  on public.kttx_bai_nop for select to authenticated
  using (student_id = public.my_student_id());

drop policy if exists "gv xem va duyet kttx bai nop" on public.kttx_bai_nop;
create policy "gv xem va duyet kttx bai nop"
  on public.kttx_bai_nop for all to authenticated
  using (public.teaches_class(class_id) or public.teaches_student(student_id))
  with check (public.teaches_class(class_id) or public.teaches_student(student_id));

-- 3. Chi tiết từng câu của bài KTTX
create table if not exists public.kttx_cau_chi_tiet (
  id            uuid primary key default gen_random_uuid(),
  bai_nop_id    uuid not null references public.kttx_bai_nop(id) on delete cascade,
  so_cau        int not null check (so_cau between 1 and 40),
  noi_dung_ngan text not null default '',
  ku_id         text,
  ma_loi_goi_y  text,
  ma_loi_duyet  text,
  diem_dat      numeric(4,2),
  diem_toi_da   numeric(4,2),
  diem_gv_sua   numeric(4,2),
  nhan_xet_gv   text,
  do_tin_cay    numeric(3,2) not null default 0.80,
  ghi_chu_hs    text,
  unique (bai_nop_id, so_cau)
);

create index if not exists idx_kttx_cau_nop on public.kttx_cau_chi_tiet (bai_nop_id, so_cau);

alter table public.kttx_cau_chi_tiet enable row level security;

drop policy if exists "hs xem kttx cau cua minh" on public.kttx_cau_chi_tiet;
create policy "hs xem kttx cau cua minh"
  on public.kttx_cau_chi_tiet for select to authenticated
  using (
    exists (
      select 1 from public.kttx_bai_nop n
       where n.id = kttx_cau_chi_tiet.bai_nop_id
         and n.student_id = public.my_student_id()
    )
  );

drop policy if exists "gv quan ly kttx cau lop" on public.kttx_cau_chi_tiet;
create policy "gv quan ly kttx cau lop"
  on public.kttx_cau_chi_tiet for all to authenticated
  using (
    exists (
      select 1 from public.kttx_bai_nop n
       where n.id = kttx_cau_chi_tiet.bai_nop_id
         and (public.teaches_class(n.class_id) or public.teaches_student(n.student_id))
    )
  )
  with check (
    exists (
      select 1 from public.kttx_bai_nop n
       where n.id = kttx_cau_chi_tiet.bai_nop_id
         and (public.teaches_class(n.class_id) or public.teaches_student(n.student_id))
    )
  );

-- 4. Bucket riêng tư kttx (ảnh chụp KTTX, xoá sau 30 ngày)
insert into storage.buckets (id, name, public)
values ('kttx', 'kttx', false)
on conflict (id) do nothing;

drop policy if exists "hs xem anh kttx cua minh" on storage.objects;
create policy "hs xem anh kttx cua minh"
  on storage.objects for select to authenticated
  using (bucket_id = 'kttx' and (storage.foldername(name))[1] = public.my_student_id());

drop policy if exists "gv xem anh kttx cua lop" on storage.objects;
create policy "gv xem anh kttx cua lop"
  on storage.objects for select to authenticated
  using (bucket_id = 'kttx' and public.teaches_student((storage.foldername(name))[1]));

-- 5. Hàm đánh dấu hết hạn ảnh quá 30 ngày
create or replace function public.don_anh_kttx_het_han()
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  so_dong int;
begin
  update public.kttx_bai_nop
     set anh_da_xoa = true,
         anh_paths = '[]'::jsonb
   where anh_da_xoa = false
     and jsonb_array_length(anh_paths) > 0
     and het_han_anh <= now();
  get diagnostics so_dong = row_count;
  return so_dong;
end;
$$;

commit;
