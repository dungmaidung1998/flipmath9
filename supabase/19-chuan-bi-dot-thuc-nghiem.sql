-- ===========================================================================
-- CHUẨN BỊ ĐỢT THỰC NGHIỆM — 4 LỚP, CHƯƠNG I, THÁNG 9–10/2026
--
-- Tệp này làm ba việc trong một lần chạy:
--   A. Tạo 4 lớp và gán nhóm TN / ĐC, gắn vào tài khoản giáo viên
--   B. Khai kế hoạch 4 tuần cho cả 4 lớp  (mẫu số của thành phần Đều đặn — LES)
--   C. Sinh 160 mã học sinh + mật khẩu để dán vào trang "Tài khoản học sinh"
--
-- CHẠY LẠI ĐƯỢC NHIỀU LẦN cho phần A và B. Phần C sinh mật khẩu MỚI mỗi lần
-- chạy — chạy lại sau khi đã tạo tài khoản là vô nghĩa, vì mật khẩu cũ không
-- lấy lại được. Tải CSV ngay lần chạy đầu.
--
-- Tệp này KHÔNG tạo tài khoản đăng nhập. Xem lý do ở đầu tệp 12: viết tay vào
-- auth.users thường tạo ra tài khoản CÓ TỒN TẠI nhưng KHÔNG ĐĂNG NHẬP ĐƯỢC, và
-- chỗ hỏng chỉ lộ ra vào đúng buổi đầu cả lớp ngồi trước máy.
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- KIỂM TRA ĐIỀU KIỆN TRƯỚC
-- ---------------------------------------------------------------------------
do $$
begin
  if to_regclass('public.classes') is null then
    raise exception E'\n\n>>> DỪNG LẠI: Phải chạy 01-schema.sql TRƯỚC tệp này. <<<\n';
  end if;
  if to_regclass('public.week_plan') is null then
    raise exception E'\n\n>>> DỪNG LẠI: Phải chạy 06-do-trung-thuc.sql TRƯỚC tệp này. Thiếu bảng week_plan thì thành phần Đều đặn của LES là "chưa đo" suốt cả đợt thực nghiệm, và không sửa lại được sau khi đợt kết thúc. <<<\n';
  end if;
  if (select count(*) from knowledge_units) = 0 then
    raise exception E'\n\n>>> DỪNG LẠI: Phải chạy 07-noi-dung-chuong-1.sql TRƯỚC tệp này. <<<\n';
  end if;
end $$;


-- ===========================================================================
-- A. BỐN LỚP VÀ VIỆC GÁN NHÓM
--
-- Gán nhóm sai là hỏng toàn bộ phép so sánh, và KHÔNG sửa được sau khi đợt
-- chạy xong — vì lúc đó không còn cách nào biết em nào thật sự được dạy theo
-- mô hình nào. Đọc lại hai lần trước khi bấm Run.
-- ===========================================================================
do $$
declare
  ------------------------------------------------------------ SỬA Ở ĐÂY
  uuid_giao_vien text := 'DÁN-UUID-VÀO-ĐÂY';   -- UUID tài khoản giáo viên (Authentication → Users)
  ten_giao_vien  text := 'Nguyễn Văn A';

  -- Bốn lớp. Đổi mã lớp cho đúng lớp của trường.
  -- LƯU Ý: mã lớp là thứ học sinh GÕ KHI ĐĂNG NHẬP — không dùng dấu cách,
  -- không dùng dấu ngoặc. '7A1' đúng; '7A1 (TN)' sai.
  lop_tn_1 text := '7A1';
  lop_tn_2 text := '7A2';
  lop_dc_1 text := '7A3';
  lop_dc_2 text := '7A4';
  ------------------------------------------------------------ hết phần sửa
  uid uuid;
  lop text;
  nhom text;
  lop_co_san text;
  lop_dau_tien text;
begin
  if uuid_giao_vien !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
    raise exception E'\n\n>>> DỪNG LẠI: Chưa dán UUID giáo viên. Vào Authentication → Users, bấm vào tài khoản giáo viên, chép cột User UID rồi dán vào biến uuid_giao_vien. <<<\n';
  end if;
  uid := uuid_giao_vien::uuid;

  if not exists (select 1 from auth.users where id = uid) then
    raise exception E'\n\n>>> DỪNG LẠI: Không có tài khoản nào mang UUID này. Kiểm tra lại. <<<\n';
  end if;

  foreach lop in array array[lop_tn_1, lop_tn_2, lop_dc_1, lop_dc_2] loop
    if lop !~ '^[A-Za-z0-9]{1,20}$' then
      raise exception E'\n\n>>> DỪNG LẠI: Mã lớp "%" có ký tự không hợp lệ. Chỉ dùng chữ và số, không dấu cách. <<<\n', lop;
    end if;
  end loop;

  foreach lop in array array[lop_tn_1, lop_tn_2, lop_dc_1, lop_dc_2] loop
    nhom := case when lop in (lop_tn_1, lop_tn_2) then 'TN' else 'DC' end;

    -- Lớp có thể đã tồn tại sẵn với class_id KHÁC mã lớp — ví dụ tệp 02-seed
    -- tạo lớp 'L1' mang mã lớp '7A1'. Khi đó `on conflict (class_id)` không bắt
    -- được, và Postgres báo `duplicate key ... classes_class_code_key` —
    -- một câu không nói cho ai biết phải làm gì. Tra theo MÃ LỚP trước.
    select c.class_id into lop_co_san from classes c where c.class_code = lop;

    if lop_co_san is not null then
      update classes
         set arm = nhom, teacher_id = uid, grade = 7
       where class_id = lop_co_san;
      if lop_co_san <> lop then
        raise notice 'Lớp mã "%" đã có sẵn với định danh nội bộ "%" — đã cập nhật dòng đó, không tạo dòng mới.', lop, lop_co_san;
      end if;
    else
      lop_co_san := lop;
      insert into classes (class_id, class_code, grade, arm, teacher_id)
           values (lop, lop, 7, nhom, uid)
      on conflict (class_id) do update
           set teacher_id = excluded.teacher_id, arm = excluded.arm, class_code = excluded.class_code;
    end if;

    -- Giữ lại định danh nội bộ của lớp đầu tiên để gắn vào hồ sơ giáo viên.
    -- Dùng thẳng mã lớp ở đây sẽ hỏng khoá ngoại khi lớp có định danh khác mã.
    if lop_dau_tien is null then lop_dau_tien := lop_co_san; end if;
    lop_co_san := null;
  end loop;

  insert into profiles (id, role, class_id, full_name)
       values (uid, 'giao-vien', lop_dau_tien, ten_giao_vien)
  on conflict (id) do update
       set role = 'giao-vien', class_id = excluded.class_id, full_name = excluded.full_name;

  raise notice 'Đã gán: % và % là nhóm THỰC NGHIỆM; % và % là nhóm ĐỐI CHỨNG.',
    lop_tn_1, lop_tn_2, lop_dc_1, lop_dc_2;
end $$;


-- ===========================================================================
-- B. KẾ HOẠCH 4 TUẦN
--
-- Đây là MẪU SỐ của thành phần Đều đặn trong LES: số buổi lớp ĐƯỢC GIAO BÀI,
-- khai từ đầu tuần. Cùng lập luận với chỉ số độ trung thực: lấy chính số buổi
-- học sinh có hoạt động làm mẫu số thì em nào cũng ra 100%.
--
-- Lớp chưa khai tuần nào thì Đều đặn là "chưa đo" — và sau khi đợt kết thúc
-- thì không khai bù được một cách trung thực nữa.
-- ===========================================================================
do $$
declare
  ------------------------------------------------------------ SỬA Ở ĐÂY
  so_tiet_moi_tuan int := 4;    -- số tiết Toán mỗi tuần theo thời khoá biểu
  tuan_bat_dau     int := 3;    -- tuần thứ mấy của năm học khi bắt đầu can thiệp
  so_tuan          int := 4;    -- Chương I dạy trọn trong 4 tuần
  ------------------------------------------------------------ hết phần sửa
  lop text;
  i   int;
begin
  for lop in select class_id from classes where arm in ('TN','DC') loop  -- theo định danh nội bộ
    for i in 0 .. so_tuan - 1 loop
      insert into week_plan (class_id, tuan, so_tiet_ke_hoach, ghi_chu)
           values (lop, tuan_bat_dau + i, so_tiet_moi_tuan,
                   'Chương I – Số hữu tỉ, tuần can thiệp ' || (i + 1))
      on conflict (class_id, tuan) do update
           set so_tiet_ke_hoach = excluded.so_tiet_ke_hoach,
               ghi_chu = excluded.ghi_chu;
    end loop;
  end loop;
  raise notice 'Đã khai % tuần × % tiết cho tất cả các lớp.', so_tuan, so_tiet_moi_tuan;
end $$;


-- ===========================================================================
-- C. SINH 160 MÃ HỌC SINH VÀ MẬT KHẨU
--
-- Mã học sinh là MÃ NGHIÊN CỨU, không phải họ tên. Cả hệ thống không có chỗ nào
-- chứa họ tên thật. Bảng nối mã với danh tính do người hướng dẫn giữ NGOÀI hệ
-- thống — đây là cam kết ở Phiếu 4, và nó chỉ có giá trị nếu giữ ngay từ dòng
-- đầu tiên.
--
-- Mã có tiền tố theo nhóm (TN/DC) để khi xuất dữ liệu phân tích, nhìn mã là
-- biết ngay thuộc nhóm nào mà không phải nối bảng.
-- ===========================================================================
with tham_so as (
  ------------------------------------------------------------ SỬA Ở ĐÂY
  select 40 as si_so   -- sĩ số mỗi lớp
  ------------------------------------------------------------ hết phần sửa
),
danh_sach as (
  select
    c.class_id,
    c.class_code,
    c.arm,
    lower(c.arm) || '-' || c.class_code || '-' || lpad(i::text, 2, '0') as ma_hoc_sinh,
    substring(replace(gen_random_uuid()::text, '-', '') from 1 for 8)   as mat_khau,
    'HS ' || c.class_code || '-' || lpad(i::text, 2, '0')               as ten_hien_thi,
    i as so_thu_tu
  from classes c, tham_so t, generate_series(1, t.si_so) as i
  where c.arm in ('TN','DC')
)
select
  class_code                                              as lop,
  case arm when 'TN' then 'thực nghiệm' else 'đối chứng' end as nhom,
  ma_hoc_sinh,
  mat_khau,
  ten_hien_thi,
  -- CỘT ĐỂ CHÉP: lọc theo từng lớp, bôi đen cả cột, chép, dán vào ô "Danh sách"
  -- ở trang Tài khoản học sinh (nhớ chọn đúng lớp trước khi dán).
  ma_hoc_sinh || ', ' || mat_khau || ', ' || ten_hien_thi  as dong_de_dan,
  -- Phiếu phát cho từng em — in, cắt rời, phát riêng.
  'Lớp: ' || class_code || '   Mã học sinh: ' || ma_hoc_sinh
           || '   Mật khẩu: ' || mat_khau                  as phieu_phat
from danh_sach
order by class_code, so_thu_tu;


-- ===========================================================================
-- D. KIỂM TRA SAU KHI CHẠY — dán kết quả vào sổ nhật ký nghiên cứu
-- ===========================================================================
-- Chạy riêng khối dưới đây sau khi đã tạo xong tài khoản ở trang web.

-- select c.class_id as lop,
--        case c.arm when 'TN' then 'thực nghiệm' else 'đối chứng' end as nhom,
--        (select count(*) from students s where s.class_id = c.class_id)        as so_tai_khoan,
--        (select count(*) from students s where s.class_id = c.class_id
--                                          and s.consent_status = 'dong-y')     as da_dong_thuan,
--        (select coalesce(sum(w.so_tiet_ke_hoach), 0) from week_plan w
--          where w.class_id = c.class_id)                                       as tong_tiet_da_khai
--   from classes c
--  where c.arm in ('TN','DC')
--  order by c.arm desc, c.class_id;

-- ===========================================================================
-- BA VIỆC PHẢI LÀM NGAY SAU KHI CHẠY TỆP NÀY
--
-- 1. Bấm "Download CSV" ở bảng kết quả phần C. LƯU NGAY. Chạy lại tệp này sinh
--    mật khẩu KHÁC và không có cách nào lấy lại mật khẩu cũ.
-- 2. Vào trang "Tài khoản học sinh", chọn từng lớp, dán cột dong_de_dan của
--    ĐÚNG lớp đó, bấm Tạo tài khoản. Làm lần lượt bốn lớp.
-- 3. Đổi consent_status sang 'dong-y' cho những em đã có phiếu đồng thuận của
--    cha mẹ. Chưa đổi thì dữ liệu của em đó KHÔNG ra tệp xuất — đúng như cam
--    kết ở Phiếu 4, và đó là chủ ý.
--
--    update students set consent_status = 'dong-y'
--     where class_id in ('7A1','7A2','7A3','7A4');
--
--    Chỉ chạy lệnh trên khi đã cầm đủ phiếu trong tay.
-- ===========================================================================
