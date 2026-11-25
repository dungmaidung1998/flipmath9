-- 55 · SỬA LỖI "Đang cập nhật câu hỏi" Ở BƯỚC KIỂM TRA NHANH (24/11/2026)
-- Nguyên nhân: view questions_public chạy bằng quyền của người xem (security_invoker)
-- và có điều kiện "where trang_thai <> 'can-sua'". Học sinh chưa được cấp quyền đọc cột
-- trang_thai nên truy vấn bị từ chối → trang hiện "Đang cập nhật câu hỏi".
-- Cột trang_thai chỉ là trạng thái duyệt (nhap / da-duyet / can-sua), không chứa đáp án.
-- Chạy lại nhiều lần vẫn an toàn.
alter table public.questions add column if not exists trang_thai text not null default 'nhap';
grant select (trang_thai) on public.questions to authenticated;

-- Kiểm tra nhanh: số câu học sinh nhìn thấy theo chương (phải > 0 ở cả 10 chương)
select split_part(ku_id, '-', 1) as chuong, count(*) as so_cau
from public.questions_public group by 1 order by length(split_part(ku_id, '-', 1)), 1;
