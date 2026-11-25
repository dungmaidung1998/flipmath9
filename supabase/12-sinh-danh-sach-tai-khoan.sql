-- ===========================================================================
-- DFLE-M7 · SINH DANH SÁCH TÀI KHOẢN HỌC SINH ĐỂ DÁN VÀO ỨNG DỤNG
--
-- Tệp này KHÔNG tạo tài khoản. Nó chỉ sinh ra ba cột đã ghép sẵn thành từng
-- dòng `mã, mật khẩu, tên` để thầy cô chép và dán vào ô "Danh sách" ở trang
-- "Tài khoản học sinh" trong ứng dụng. Việc tạo tài khoản do trang đó làm.
--
-- VÌ SAO KHÔNG TẠO THẲNG BẰNG SQL
-- `auth.users` không phải một bảng bình thường. Ngoài email nó còn cần mật khẩu
-- đã băm đúng thuật toán, một dòng tương ứng trong `auth.identities`, và vài cột
-- nội bộ mà Supabase đổi giữa các phiên bản. Viết tay thì thường tạo ra tài
-- khoản CÓ TỒN TẠI nhưng KHÔNG ĐĂNG NHẬP ĐƯỢC — và chỗ hỏng chỉ lộ ra vào đúng
-- buổi đầu tiên cả lớp ngồi trước máy.
--
-- Trang "Tài khoản học sinh" gọi Admin API của Supabase, là đường chính thức.
-- Nó cũng làm hai việc mà SQL viết tay hay quên: kiểm tra lớp có đúng của thầy
-- cô không, và ghi đủ ba bảng auth.users + students + profiles.
--
-- Việc thật sự mệt là nghĩ ra 40 mật khẩu khác nhau. Tệp này làm đúng việc đó.
-- ===========================================================================

do $$ begin
  if (select count(*) from classes) = 0 then
    raise exception E'\n\n>>> DỪNG LẠI: Chưa có lớp nào. Chạy 11-tao-tai-khoan-giao-vien.sql trước. <<<\n';
  end if;
end $$;

with tham_so as (
  select
    ------------------------------------------------------------ SỬA Ở ĐÂY
    40          as so_hoc_sinh,   -- sĩ số
    '7A1'       as ma_lop,        -- phải trùng mã lớp đã tạo ở tệp 11
    'hs'        as tien_to,       -- mã sẽ là hs001, hs002, …
    'Học sinh'  as ten_mau        -- tên hiển thị: "Học sinh 01", đổi tay sau nếu muốn
    ------------------------------------------------------------ hết phần sửa
),
danh_sach as (
  select
    t.ma_lop,
    t.tien_to || lpad(i::text, 3, '0')                             as ma_hoc_sinh,
    substring(replace(gen_random_uuid()::text, '-', '') from 1 for 8) as mat_khau,
    t.ten_mau || ' ' || lpad(i::text, 2, '0')                      as ten_hien_thi
  from tham_so t, generate_series(1, t.so_hoc_sinh) as i
)
select
  ma_hoc_sinh,
  mat_khau,
  ten_hien_thi,
  -- CỘT NÀY LÀ CỘT ĐỂ CHÉP: bôi đen cả cột, chép, dán vào ô Danh sách
  ma_hoc_sinh || ', ' || mat_khau || ', ' || ten_hien_thi          as dong_de_dan,
  -- Phiếu phát cho từng em — in ra, cắt rời, phát riêng
  'Lớp: ' || ma_lop || '  ·  Mã học sinh: ' || ma_hoc_sinh
           || '  ·  Mật khẩu: ' || mat_khau                        as phieu_phat
from danh_sach
order by ma_hoc_sinh;

-- ===========================================================================
-- LÀM GÌ VỚI KẾT QUẢ
--
-- 1. Bấm "Download CSV" ở góc bảng kết quả để LƯU LẠI NGAY. Chạy lại tệp này
--    sẽ sinh ra mật khẩu KHÁC — không có cách nào lấy lại mật khẩu cũ.
-- 2. Bôi đen cột `dong_de_dan`, chép, dán vào ô "Danh sách" ở trang
--    "Tài khoản học sinh", chọn đúng lớp, bấm "Tạo tài khoản".
-- 3. In cột `phieu_phat`, cắt rời, phát riêng cho từng em. Không đọc mật khẩu
--    trước lớp, không dán danh sách lên bảng.
--
-- MÃ HỌC SINH LÀ MÃ NGHIÊN CỨU, KHÔNG PHẢI HỌ TÊN.
-- Cả hệ thống không có chỗ nào chứa họ tên thật của các em. Bảng nối mã với
-- danh tính do người hướng dẫn giữ NGOÀI hệ thống, trên giấy hoặc một tệp riêng
-- không nằm trong cơ sở dữ liệu này. Đây là cam kết ở Phiếu 4, và nó chỉ có giá
-- trị nếu được giữ ngay từ dòng đầu tiên.
--
-- CHƯA ĐƯỢC TẠO TÀI KHOẢN HỌC SINH THẬT trước khi Hội đồng thẩm định duyệt
-- Phiếu 4. Trước mốc đó chỉ tạo vài tài khoản THỬ cho kịch bản kiểm thử, và xoá
-- đi sau khi thử xong.
-- ===========================================================================
