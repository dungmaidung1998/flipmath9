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
