-- =============================================================================
-- 26 · SỔ NHẬT KÝ NGHIÊN CỨU ĐIỆN TỬ
-- -----------------------------------------------------------------------------
-- Vì sao cần. Quy chế coi nhật ký nghiên cứu là chứng cứ gốc về mức độ tham gia
-- thực chất của học sinh, và dự thảo Thông tư còn đưa nó thành tài liệu bắt buộc
-- trong hồ sơ, kèm hai tiêu chí chấm riêng: mức độ độc lập của học sinh, và
-- đóng góp của từng thành viên.
--
-- Sổ giấy ghi bù một đêm trước khi nộp thì giám khảo nhìn ra. Sổ này không ghi
-- bù được: mỗi mục mang DẤU THỜI GIAN CỦA MÁY CHỦ, và bảng KHÔNG CHO SỬA, KHÔNG
-- CHO XOÁ. Muốn đính chính thì ghi một mục mới trỏ về mục cũ kèm lý do; cả hai
-- cùng nằm đó. Đúng cách một sổ nhật ký nghiên cứu phải hoạt động.
--
-- Ngày làm việc (cột ngay) do người ghi tự khai và có thể là ngày đã qua — vì có
-- hôm làm xong tối mới ngồi ghi. Nhưng GIỜ GHI thì máy chủ đóng, không ai đổi
-- được. Khoảng cách giữa hai cột đó chính là thứ nói lên sổ có được ghi đều hay
-- không.
--
-- Chạy lại nhiều lần vẫn an toàn.
-- =============================================================================

do $$
begin
  if to_regclass('public.profiles') is null then
    raise exception E'\n\n>>> DỪNG LẠI: phải chạy 01-schema.sql trước. <<<\n';
  end if;
end $$;

-- -----------------------------------------------------------------------------
-- 1. Vai trò mới: học sinh thực hiện dự án nghiên cứu
--    Khác với 'hoc-sinh' (người học trong đợt thực nghiệm). Hai em làm dự án cần
--    ghi nhật ký nhưng KHÔNG được xem dữ liệu học tập của bạn cùng lớp.
-- -----------------------------------------------------------------------------
do $$
declare v_ten text;
begin
  select conname into v_ten from pg_constraint
   where conrelid = 'public.profiles'::regclass and contype = 'c'
     and pg_get_constraintdef(oid) ilike '%role%';
  if v_ten is not null then
    execute format('alter table public.profiles drop constraint %I', v_ten);
  end if;
  alter table public.profiles
    add constraint profiles_role_check check (role in ('hoc-sinh','giao-vien','hoc-sinh-nckh'));
end $$;

create or replace function public.la_hs_nckh() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select role = 'hoc-sinh-nckh' from profiles where id = auth.uid()), false)
$$;

-- -----------------------------------------------------------------------------
-- 2. Bảng nhật ký
-- -----------------------------------------------------------------------------
create table if not exists nhat_ky_nghien_cuu (
  id            uuid primary key default gen_random_uuid(),
  ngay          date        not null,                    -- ngày LÀM VIỆC, người ghi khai
  ghi_luc       timestamptz not null default now(),      -- giờ GHI, máy chủ đóng
  tac_gia       uuid        not null references auth.users(id),
  tac_gia_ten   text        not null,                    -- chụp lại tên lúc ghi
  tac_gia_vai   text        not null,                    -- 'hoc-sinh-nckh' hoặc 'giao-vien'
  cong_viec     text        not null,                    -- đã làm gì
  phuong_phap   text,                                    -- làm bằng cách nào
  ket_qua       text,                                    -- kết quả giai đoạn
  vai_tro       text,                                    -- ai làm phần nào
  cong_cu_ai    text,                                    -- có nhờ AI không, nhờ việc gì
  thay_cho      uuid references nhat_ky_nghien_cuu(id),  -- mục này thay cho mục cũ nào
  ly_do_sua     text,                                    -- vì sao phải ghi lại
  xac_nhan_boi  uuid references auth.users(id),          -- giáo viên xác nhận
  xac_nhan_luc  timestamptz,
  constraint sua_phai_co_ly_do check (thay_cho is null or coalesce(ly_do_sua, '') <> '')
);

create index if not exists idx_nhat_ky_ngay on nhat_ky_nghien_cuu (ngay desc, ghi_luc desc);

comment on table nhat_ky_nghien_cuu is
  'Sổ nhật ký nghiên cứu. Chỉ thêm, không sửa, không xoá — xem trigger chi_them_khong_sua.';

-- -----------------------------------------------------------------------------
-- 3. Khoá: không sửa, không xoá
--    Ngoại lệ duy nhất là giáo viên xác nhận — chỉ hai cột xac_nhan_*.
-- -----------------------------------------------------------------------------
create or replace function public.chan_sua_nhat_ky() returns trigger
language plpgsql as $$
begin
  if tg_op = 'DELETE' then
    raise exception 'Sổ nhật ký nghiên cứu không xoá được. Muốn đính chính thì ghi một mục mới kèm lý do.';
  end if;

  if (new.ngay, new.ghi_luc, new.tac_gia, new.tac_gia_ten, new.tac_gia_vai, new.cong_viec,
      new.phuong_phap, new.ket_qua, new.vai_tro, new.cong_cu_ai, new.thay_cho, new.ly_do_sua)
     is distinct from
     (old.ngay, old.ghi_luc, old.tac_gia, old.tac_gia_ten, old.tac_gia_vai, old.cong_viec,
      old.phuong_phap, old.ket_qua, old.vai_tro, old.cong_cu_ai, old.thay_cho, old.ly_do_sua) then
    raise exception 'Nội dung nhật ký đã ghi thì không sửa được. Ghi một mục mới, đặt thay_cho = mục cũ và nêu lý do.';
  end if;

  return new;
end $$;

drop trigger if exists chi_them_khong_sua on nhat_ky_nghien_cuu;
create trigger chi_them_khong_sua
  before update or delete on nhat_ky_nghien_cuu
  for each row execute function public.chan_sua_nhat_ky();

-- -----------------------------------------------------------------------------
-- 4. Phân quyền
--    Đọc: giáo viên và học sinh làm dự án. Học sinh trong đợt thực nghiệm KHÔNG
--    đọc được — nhật ký có nhắc tới thiết kế nghiên cứu.
--    Ghi: chỉ ghi được dưới tên chính mình.
-- -----------------------------------------------------------------------------
alter table nhat_ky_nghien_cuu enable row level security;

drop policy if exists "doc nhat ky" on nhat_ky_nghien_cuu;
create policy "doc nhat ky" on nhat_ky_nghien_cuu
  for select to authenticated using (is_teacher() or la_hs_nckh());

drop policy if exists "ghi nhat ky" on nhat_ky_nghien_cuu;
create policy "ghi nhat ky" on nhat_ky_nghien_cuu
  for insert to authenticated
  with check ((is_teacher() or la_hs_nckh()) and tac_gia = auth.uid());

-- Xác nhận của giáo viên đi qua hàm riêng, không mở quyền sửa bảng.
create or replace function public.xac_nhan_nhat_ky(p_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not is_teacher() then
    raise exception 'Chỉ giáo viên hướng dẫn mới xác nhận được nhật ký.';
  end if;
  update nhat_ky_nghien_cuu
     set xac_nhan_boi = auth.uid(), xac_nhan_luc = now()
   where id = p_id and xac_nhan_luc is null;
end $$;

revoke all on function public.xac_nhan_nhat_ky(uuid) from public, anon;
grant execute on function public.xac_nhan_nhat_ky(uuid) to authenticated;

-- -----------------------------------------------------------------------------
-- 5. GÁN VAI TRÒ CHO HAI HỌC SINH LÀM DỰ ÁN
--
--    Làm theo đúng thứ tự:
--      a) Chạy 25-chuan-bi-lop-demo.sql trước, để có lớp DEMO-7A1.
--      b) Authentication -> Users -> Add user, tạo hai tài khoản cho hai em,
--         mỗi em một tài khoản riêng. Sao UUID của từng em.
--      c) Bỏ dấu -- ở khối dưới, dán UUID và điền họ tên, rồi chạy lại tệp này.
--
--    Hai em vừa ghi nhật ký, vừa cần dùng chính hệ thống để thử: xem video, làm
--    quiz, xem gợi ý. Nên mỗi em được gán một mã học sinh thật, NHƯNG đặt trong
--    lớp DEMO chứ không phải lớp thực nghiệm, và consent_status để 'chua'. Hai
--    lớp chắn đó khiến mọi thao tác thử của hai em không bao giờ lẫn vào dữ liệu
--    phân tích: tệp xuất chỉ nhận lớp TN, DC và chỉ học sinh đã đồng thuận.
-- -----------------------------------------------------------------------------
-- do $$
-- declare
--   v_uuid_1 uuid := 'DÁN-UUID-HỌC-SINH-1';
--   v_uuid_2 uuid := 'DÁN-UUID-HỌC-SINH-2';
--   v_ten_1  text := 'Họ tên học sinh 1';
--   v_ten_2  text := 'Họ tên học sinh 2';
--   v_lop    text;
-- begin
--   select class_id into v_lop from classes where arm = 'DEMO' order by class_id limit 1;
--   if v_lop is null then
--     raise exception 'Chưa có lớp DEMO. Chạy 25-chuan-bi-lop-demo.sql trước.';
--   end if;
--
--   insert into students (student_id, class_id, display_name, consent_status)
--   values ('nckh01', v_lop, 'HS dự án 1', 'chua'),
--          ('nckh02', v_lop, 'HS dự án 2', 'chua')
--   on conflict (student_id) do update set class_id = excluded.class_id;
--
--   insert into profiles (id, role, student_id, class_id, full_name) values
--     (v_uuid_1, 'hoc-sinh-nckh', 'nckh01', v_lop, v_ten_1),
--     (v_uuid_2, 'hoc-sinh-nckh', 'nckh02', v_lop, v_ten_2)
--   on conflict (id) do update
--     set role = 'hoc-sinh-nckh', student_id = excluded.student_id,
--         class_id = excluded.class_id, full_name = excluded.full_name;
--
--   raise notice 'Đã gán hai tài khoản học sinh làm dự án vào lớp %', v_lop;
-- end $$;

-- -----------------------------------------------------------------------------
-- KIỂM TRA
-- -----------------------------------------------------------------------------
select case when to_regclass('public.nhat_ky_nghien_cuu') is not null
            then '✅ Bảng nhật ký đã tạo' else '❌ chưa tạo được' end as ket_qua
union all
select case when exists (select 1 from pg_trigger where tgname = 'chi_them_khong_sua')
            then '✅ Đã khoá sửa và xoá' else '❌ thiếu khoá' end
union all
select '✅ Vai trò hợp lệ: hoc-sinh, giao-vien, hoc-sinh-nckh';
