-- ============================================================================
-- 51 · PHÂN CẤP TRƯỜNG → GIÁO VIÊN → LỚP → HỌC SINH  (24/11/2026)
-- Theo góp ý ban giám khảo: một giáo viên dạy nhiều lớp, thống kê theo từng lớp,
-- ban giám hiệu / tổ trưởng xem toàn trường; giáo viên bật/tắt nội dung theo lớp.
-- Chạy được nhiều lần (idempotent). KHÔNG xoá dữ liệu cũ.
-- Sau khi chạy: tạo trường của thầy ở mục [1], gán quản trị trường ở mục [9] (cuối file).
-- ============================================================================
begin;

-- [1] Trường ------------------------------------------------------------------
create table if not exists public.schools (
  school_id  text primary key,                 -- mã ngắn, ví dụ 'NPH'
  ten        text not null,                    -- 'THCS Nguyễn Phú Hường'
  tinh       text,                             -- 'Đà Nẵng'
  ma_dang_nhap text unique,                    -- mã trường học sinh/giáo viên gõ ở màn đăng nhập
  tao_luc    timestamptz not null default now()
);
insert into public.schools (school_id, ten, tinh, ma_dang_nhap)
values ('NPH', 'THCS Nguyễn Phú Hường', 'Đà Nẵng', 'NPH')
on conflict (school_id) do nothing;

-- [2] Lớp thuộc trường; tên hiển thị như 9/1, 9/2 -------------------------------
alter table public.classes add column if not exists school_id text references public.schools(school_id);
alter table public.classes add column if not exists ten_lop   text;      -- '9/1'
update public.classes set school_id = 'NPH' where school_id is null;

-- [3] Hồ sơ: thuộc trường + vai trò mới ---------------------------------------
alter table public.profiles add column if not exists school_id text references public.schools(school_id);
update public.profiles p set school_id = coalesce(
  (select c.school_id from public.classes c where c.class_id = p.class_id),
  (select c.school_id from public.classes c where c.teacher_id = p.id limit 1),
  'NPH') where p.school_id is null;
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check
  check (role in ('hoc-sinh', 'hoc-sinh-nckh', 'giao-vien', 'quan-tri-truong', 'quan-tri-he-thong'));

-- [4] Giáo viên – lớp (một giáo viên nhiều lớp, một lớp nhiều giáo viên) --------
create table if not exists public.teacher_classes (
  teacher_id uuid not null references auth.users(id) on delete cascade,
  class_id   text not null references public.classes(class_id) on delete cascade,
  vai_tro    text not null default 'bo-mon' check (vai_tro in ('bo-mon', 'chu-nhiem', 'du-gio')),
  tao_luc    timestamptz not null default now(),
  primary key (teacher_id, class_id)
);
insert into public.teacher_classes (teacher_id, class_id, vai_tro)
select teacher_id, class_id, 'bo-mon' from public.classes where teacher_id is not null
on conflict do nothing;

-- [5] Hàm phân quyền (một nguồn duy nhất cho mọi chính sách) -------------------
create or replace function public.vai_tro_cua_toi() returns text
language sql stable security definer set search_path = public as $$
  select role from profiles where id = auth.uid()
$$;

create or replace function public.la_quan_tri_truong(p_school text) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles p where p.id = auth.uid()
    and (p.role = 'quan-tri-he-thong' or (p.role = 'quan-tri-truong' and p.school_id = p_school)))
$$;

-- Giữ tên hàm cũ để mọi chính sách đang dùng tự động theo phân cấp mới.
create or replace function public.is_teacher() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select role in ('giao-vien', 'quan-tri-truong', 'quan-tri-he-thong') from profiles where id = auth.uid()), false)
$$;

create or replace function public.teaches_class(p_class text) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from classes c where c.class_id = p_class and (
      c.teacher_id = auth.uid()
      or exists (select 1 from teacher_classes t where t.class_id = c.class_id and t.teacher_id = auth.uid())
      or public.la_quan_tri_truong(c.school_id)))
$$;

create or replace function public.teaches_student(p_student text) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from students s where s.student_id = p_student and public.teaches_class(s.class_id))
$$;

-- Danh sách lớp thầy cô được xem (dùng cho thanh chọn lớp trên mọi trang giáo viên).
create or replace function public.lop_cua_toi()
returns table (class_id text, class_code text, ten_lop text, grade int, arm text, school_id text, ten_truong text, vai_tro text)
language sql stable security definer set search_path = public as $$
  select c.class_id, c.class_code, coalesce(c.ten_lop, c.class_code), c.grade, c.arm, c.school_id, s.ten,
         coalesce(t.vai_tro, case when c.teacher_id = auth.uid() then 'bo-mon' else 'quan-tri' end)
  from classes c
  left join schools s on s.school_id = c.school_id
  left join teacher_classes t on t.class_id = c.class_id and t.teacher_id = auth.uid()
  where public.teaches_class(c.class_id)
  order by c.school_id, c.grade, coalesce(c.ten_lop, c.class_code)
$$;
grant execute on function public.lop_cua_toi() to authenticated;

-- [6] Thống kê so sánh lớp (trang "So sánh lớp") ------------------------------
create or replace function public.thong_ke_lop(p_tu date default (current_date - 28))
returns table (class_id text, ten_lop text, so_hs int, hs_hoat_dong int, ti_le_lam_chu numeric,
               muc_tb numeric, loi_dang_mo int, loi_da_nho int, phut_hoc numeric)
language sql stable security definer set search_path = public as $$
  with lop as (select l.class_id, l.ten_lop from public.lop_cua_toi() l),
  hs as (select s.student_id, s.class_id from students s join lop on lop.class_id = s.class_id)
  select lop.class_id, lop.ten_lop,
    (select count(*) from hs where hs.class_id = lop.class_id)::int,
    (select count(distinct e.student_id) from learning_events e join hs on hs.student_id = e.student_id
       where hs.class_id = lop.class_id and e.ts >= p_tu)::int,
    (select round(100.0 * avg((m.mastery_level >= 2)::int), 1) from mastery_states m join hs on hs.student_id = m.student_id where hs.class_id = lop.class_id),
    (select round(avg(m.mastery_level)::numeric, 2) from mastery_states m join hs on hs.student_id = m.student_id where hs.class_id = lop.class_id),
    (select count(*) from student_errors x join hs on hs.student_id = x.student_id where hs.class_id = lop.class_id and x.trang_thai <> 'da-nho')::int,
    (select count(*) from student_errors x join hs on hs.student_id = x.student_id where hs.class_id = lop.class_id and x.trang_thai = 'da-nho')::int,
    (select round(coalesce(sum(e.duration_active_sec), 0) / 60.0, 0) from learning_events e join hs on hs.student_id = e.student_id
       where hs.class_id = lop.class_id and e.ts >= p_tu)
  from lop order by lop.ten_lop
$$;
grant execute on function public.thong_ke_lop(date) to authenticated;

-- [7] Bật/tắt nội dung theo lớp ----------------------------------------------
-- dao_nguoc = tiết dạy đảo ngược (bắt buộc chuẩn bị trước giờ); an = ẩn với học sinh lớp đó.
create table if not exists public.class_content (
  class_id   text not null references public.classes(class_id) on delete cascade,
  ku_id      text not null references public.knowledge_units(ku_id) on delete cascade,
  dao_nguoc  boolean not null default false,
  an         boolean not null default false,
  an_game    boolean not null default false,
  an_video   boolean not null default false,
  cap_nhat   timestamptz not null default now(),
  primary key (class_id, ku_id)
);
-- Mặc định: bật đảo ngược cho Luyện tập chung + Ôn tập cuối chương ở mọi lớp hiện có.
insert into public.class_content (class_id, ku_id, dao_nguoc)
select c.class_id, k.ku_id, true from public.classes c cross join public.knowledge_units k
where k.ku_id like '%-LTC%' or k.ku_id like '%-OTC'
on conflict do nothing;

-- [8] RLS cho bảng mới + lớp ---------------------------------------------------
alter table public.schools enable row level security;
drop policy if exists "doc truong" on public.schools;
create policy "doc truong" on public.schools for select to anon, authenticated using (true);
drop policy if exists "qt sua truong" on public.schools;
create policy "qt sua truong" on public.schools for all to authenticated
  using (public.la_quan_tri_truong(school_id)) with check (public.la_quan_tri_truong(school_id));

alter table public.teacher_classes enable row level security;
drop policy if exists "doc gv lop" on public.teacher_classes;
create policy "doc gv lop" on public.teacher_classes for select to authenticated
  using (teacher_id = auth.uid() or public.teaches_class(class_id));
drop policy if exists "qt gan gv lop" on public.teacher_classes;
create policy "qt gan gv lop" on public.teacher_classes for all to authenticated
  using (public.la_quan_tri_truong((select c.school_id from public.classes c where c.class_id = teacher_classes.class_id)))
  with check (public.la_quan_tri_truong((select c.school_id from public.classes c where c.class_id = teacher_classes.class_id)));

drop policy if exists "doc lop cua minh" on public.classes;
create policy "doc lop cua minh" on public.classes for select to authenticated
  using (public.teaches_class(class_id) or class_id = (select class_id from public.profiles where id = auth.uid()));
drop policy if exists "qt tao lop" on public.classes;
create policy "qt tao lop" on public.classes for all to authenticated
  using (public.la_quan_tri_truong(school_id)) with check (public.la_quan_tri_truong(school_id));

alter table public.class_content enable row level security;
drop policy if exists "doc noi dung lop" on public.class_content;
create policy "doc noi dung lop" on public.class_content for select to authenticated
  using (public.teaches_class(class_id) or class_id = (select class_id from public.profiles where id = auth.uid()));
drop policy if exists "gv bat tat noi dung" on public.class_content;
create policy "gv bat tat noi dung" on public.class_content for all to authenticated
  using (public.teaches_class(class_id)) with check (public.teaches_class(class_id));

commit;

-- [9] VIỆC THẦY LÀM TAY SAU KHI CHẠY (bỏ dấu -- rồi chạy từng dòng) -------------
-- Đặt tên lớp hiển thị:
--   update classes set ten_lop = '9/1' where class_code = '<mã lớp 9/1>';
--   update classes set ten_lop = '9/2' where class_code = '<mã lớp 9/2>';
-- Gán một giáo viên thêm vào lớp (dạy chung / dự giờ):
--   insert into teacher_classes (teacher_id, class_id, vai_tro)
--   select id, '<class_id>', 'bo-mon' from auth.users where email = '<email giáo viên>';
-- Cấp quyền quản trị trường (ban giám hiệu / tổ trưởng):
--   update profiles set role = 'quan-tri-truong', school_id = 'NPH'
--   where id = (select id from auth.users where email = '<email>');

-- KIỂM TRA
select class_id, coalesce(ten_lop, class_code) as lop, school_id from classes order by 1;
select count(*) as so_gan_gv_lop from teacher_classes;
select count(*) as so_tiet_dao_nguoc_mac_dinh from class_content where dao_nguoc;
