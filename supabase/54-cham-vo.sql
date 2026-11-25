-- ============================================================================
-- 54 · CHẤM VỞ TỰ LUẬN & HỎI BIN BẰNG AI (GEMINI / CLAUDE API)
-- Chạy sau 01-schema.sql, 42-soat-loi-va-on-ngat-quang.sql, 51-phan-cap-truong-gv-lop.sql.
-- Chạy được nhiều lần (idempotent). KHÔNG tự xoá dữ liệu cũ.
--
-- RÀNG BUỘC AN TOÀN:
--   1. Chỉ học sinh có students.consent_status = 'dong-y' mới được gửi ảnh chấm vở.
--   2. Giới hạn 5 ảnh/ngày/học sinh (chấm vở) và 10 câu/ngày/học sinh (Hỏi Bin).
--   3. Không gửi tên/mã học sinh sang AI; hỗ trợ cả Gemini (GEMINI_API_KEY) và Claude (ANTHROPIC_API_KEY).
--   4. Ảnh chấm vở lưu private Supabase Storage tối đa 30 ngày rồi xoá.
-- ============================================================================

do $$
begin
  if to_regclass('public.students') is null
     or to_regclass('public.classes') is null
     or to_regclass('public.knowledge_units') is null then
    raise exception E'\n\n>>> DỪNG LẠI: Cần chạy 01-schema.sql TRƯỚC tệp 54. <<<\n';
  end if;
  if not exists (select 1 from pg_proc where proname = 'teaches_class')
     or not exists (select 1 from pg_proc where proname = 'teaches_student')
     or not exists (select 1 from pg_proc where proname = 'my_student_id') then
    raise exception E'\n\n>>> DỪNG LẠI: Cần chạy 51-phan-cap-truong-gv-lop.sql TRƯỚC tệp 54. <<<\n';
  end if;
end $$;

begin;

-- 1. Bucket Storage riêng tư cho ảnh chụp vở (tối đa 1,5 MB; mặc định hết hạn sau 30 ngày)
do $$
begin
  if to_regclass('storage.buckets') is not null then
    insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    values (
      'cham-vo',
      'cham-vo',
      false,
      1572864,
      array['image/jpeg', 'image/webp', 'image/png']
    )
    on conflict (id) do nothing;
  end if;
end $$;

-- 2. Bảng lưu các lượt đọc & chấm vở tự luận
create table if not exists public.cham_vo_luot (
  id               uuid primary key default gen_random_uuid(),
  student_id       text not null references public.students(student_id) on delete cascade,
  class_id         text not null references public.classes(class_id) on delete cascade,
  nguon            text not null check (nguon in ('on-thi-10', 'van-dung')),
  bai_id           text not null,
  ku_id            text references public.knowledge_units(ku_id) on delete set null,
  de_bai           text not null,
  anh_path         text,
  het_han_anh      timestamptz not null default (now() + interval '30 days'),
  anh_da_xoa       boolean not null default false,
  dong_ai_doc      jsonb not null default '[]'::jsonb,
  dong_hs_sua      jsonb not null default '[]'::jsonb,
  ket_qua          jsonb,
  diem_ai          numeric(4,2),
  diem_toi_da      numeric(4,2) not null default 1.00,
  trang_thai_bai   text check (trang_thai_bai in ('xong', 'nua-bai', 'sai')),
  ma_loi           text[] not null default '{}',
  trang_thai_luot  text not null default 'da-doc'
                   check (trang_thai_luot in ('da-doc', 'da-cham', 'loi-doc')),
  mo_hinh          text,
  nha_cung_cap     text not null default 'gemini',
  diem_gv          numeric(4,2),
  nhan_xet_gv      text,
  ai_cham_sai      boolean not null default false,
  ly_do_ai_sai     text,
  gv_xac_nhan_boi  uuid references auth.users(id),
  gv_xac_nhan_luc  timestamptz,
  tao_luc          timestamptz not null default now()
);

create index if not exists idx_cham_vo_hs  on public.cham_vo_luot (student_id, tao_luc desc);
create index if not exists idx_cham_vo_lop on public.cham_vo_luot (class_id, tao_luc desc);
create index if not exists idx_cham_vo_het_han
  on public.cham_vo_luot (het_han_anh)
  where anh_path is not null and not anh_da_xoa;

alter table public.cham_vo_luot enable row level security;

drop policy if exists "hs doc cham vo" on public.cham_vo_luot;
create policy "hs doc cham vo"
  on public.cham_vo_luot for select to authenticated
  using (student_id = public.my_student_id());

drop policy if exists "gv doc cham vo" on public.cham_vo_luot;
create policy "gv doc cham vo"
  on public.cham_vo_luot for select to authenticated
  using (public.teaches_class(class_id) or public.teaches_student(student_id));

drop policy if exists "gv sua cham vo" on public.cham_vo_luot;
create policy "gv sua cham vo"
  on public.cham_vo_luot for update to authenticated
  using (public.teaches_class(class_id) or public.teaches_student(student_id))
  with check (public.teaches_class(class_id) or public.teaches_student(student_id));

-- 3. Hàm đánh dấu bản ghi quá hạn 30 ngày (kèm xoá file vật lý trong Storage từ tầng API)
create or replace function public.danh_dau_anh_cham_vo_het_han()
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  so_dong int;
begin
  update public.cham_vo_luot
     set anh_da_xoa = true,
         anh_path = null
   where anh_path is not null
     and not anh_da_xoa
     and het_han_anh <= now();
  get diagnostics so_dong = row_count;
  return so_dong;
end $$;

-- 4. Mở rộng cột hoi_bin.nguon để ghi nhận câu trả lời trực tiếp từ Gemini ('ai-truc-tiep')
do $$
declare
  r record;
begin
  if to_regclass('public.hoi_bin') is not null then
    for r in
      select c.conname
        from pg_constraint c
        join pg_class t on t.oid = c.conrelid
        join pg_namespace n on n.oid = t.relnamespace
       where n.nspname = 'public'
         and t.relname = 'hoi_bin'
         and c.contype = 'c'
         and pg_get_constraintdef(c.oid) ilike '%nguon%'
    loop
      execute format('alter table public.hoi_bin drop constraint if exists %I', r.conname);
    end loop;

    alter table public.hoi_bin
      add constraint hoi_bin_nguon_check
      check (nguon is null or nguon in ('gv', 'ai-duyet', 'ai-truc-tiep'));
  end if;
end $$;

commit;
