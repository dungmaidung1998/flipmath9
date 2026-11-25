-- ===========================================================================
-- FlipMath9 · 43 · LỊCH GIAO BÀI THEO BA MỐC (SPEC M2, SCREENS GV-03 / HS-04)
--
-- Mỗi bài (lesson_id của knowledge_units) được giáo viên giao cho từng lớp với ba mốc:
--   ngay_mo       ngày mở bài (trước ngày này học sinh thấy 🔒)
--   han_chuan_bi  hạn chuẩn bị (mặc định 19:00 tối hôm trước ngày học)
--   ngay_hoc      ngày học trên lớp
-- Quá hạn vẫn làm được, bài bị ghi "nộp trễ".
-- Học sinh chỉ đọc lịch của lớp mình; giáo viên đọc và sửa lịch lớp mình dạy.
--
-- Chạy sau 00, 40a, 40b, 41, 42. Chạy lại nhiều lần được.
-- ===========================================================================

create table if not exists public.lich_bai (
  class_id     text not null references classes(class_id) on delete cascade,
  lesson_id    text not null,
  ngay_mo      date not null,
  han_chuan_bi timestamptz not null,
  ngay_hoc     date not null,
  cap_nhat     timestamptz not null default now(),
  primary key (class_id, lesson_id),
  check (ngay_mo <= ngay_hoc),
  check (han_chuan_bi <= (ngay_hoc::timestamp + interval '1 day') at time zone 'Asia/Ho_Chi_Minh')
);
create index if not exists idx_lich_bai_han on public.lich_bai(class_id, han_chuan_bi);

alter table public.lich_bai enable row level security;

drop policy if exists "doc lich bai" on public.lich_bai;
create policy "doc lich bai" on public.lich_bai for select to authenticated
  using (public.teaches_class(class_id)
         or exists (select 1 from public.students s
                     where s.student_id = public.my_student_id() and s.class_id = lich_bai.class_id));

drop policy if exists "gv sua lich bai" on public.lich_bai;
create policy "gv sua lich bai" on public.lich_bai for all to authenticated
  using (public.teaches_class(class_id)) with check (public.teaches_class(class_id));

grant select, insert, update, delete on public.lich_bai to authenticated;
