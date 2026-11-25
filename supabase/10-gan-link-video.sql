-- ===========================================================================
-- DFLE-M7 · GẮN LINK VIDEO VÀ HỌC LIỆU — CỘT NGUỒN VÀ QUYỀN SỬA
-- Chạy SAU 07-noi-dung-chuong-1.sql. Chạy được nhiều lần, không hỏng dữ liệu cũ.
--
-- VÌ SAO CẦN TỆP NÀY
-- 13 video và 13 phiếu học tập của Chương I đã có TÊN trong bảng contents nhưng
-- cột url đều rỗng, nên pha học trước giờ lên lớp chưa chạy được: học sinh mở
-- bài ra không có gì để xem. Tệp này không tự điền link — nó chuẩn bị ba thứ để
-- giáo viên tự điền ở trang /gv/noi-dung:
--
--   1. Cột `nguon` — bắt buộc khi dùng video của người khác, xem chú thích dưới.
--   2. Cột `cap_nhat_luc` — biết link được sửa lần cuối lúc nào.
--   3. Quyền cho giáo viên sửa contents (trước đây chỉ đọc).
--
-- CỘT `nguon` KHÔNG PHẢI THỦ TỤC HÀNH CHÍNH
-- Dùng video công khai của kênh khác thì hồ sơ dự thi PHẢI ghi rõ nguồn. Thiếu
-- phần này, hội đồng có quyền hiểu là nhóm tự nhận đã làm ra học liệu — đó là
-- lỗi liêm chính, không phải lỗi kỹ thuật, và nó nặng hơn mọi lỗi phần mềm
-- trong dự án. Cột này ép việc khai nguồn xảy ra ngay lúc gắn link, chứ không
-- để tới lúc viết báo cáo mới cố nhớ lại.
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- KIỂM TRA ĐIỀU KIỆN TRƯỚC
-- Khối này không sửa gì cả. Nó chỉ dừng lại với một câu tiếng Việt đọc được nếu
-- tệp này được chạy trước tệp mà nó phụ thuộc vào — thay cho thông báo kiểu
-- `relation "..." does not exist` không nói cho ai biết phải làm gì.
-- ---------------------------------------------------------------------------
do $$
begin
  if to_regclass('public.contents') is null then
    raise exception E'\n\n>>> DỪNG LẠI: Phải chạy 01-schema.sql TRƯỚC tệp này. <<<\n';
  end if;
end $$;


alter table contents add column if not exists nguon        text;
alter table contents add column if not exists cap_nhat_luc timestamptz;

comment on column contents.nguon is
  'Nguồn học liệu: tên kênh/tác giả và đường dẫn gốc nếu không phải do nhóm tự làm. '
  'Để trống nghĩa là nhóm tự sản xuất. Nội dung cột này đi thẳng vào mục học liệu của báo cáo.';

-- ------------------------------------------------- quyền sửa nội dung cho GV
-- Trước đây contents chỉ có chính sách SELECT, nên không ai sửa được link qua
-- ứng dụng — phải mở Supabase. Nay giáo viên sửa được, học sinh thì không.
drop policy if exists "gv sua noi dung" on contents;
create policy "gv sua noi dung" on contents for update to authenticated
  using (is_teacher()) with check (is_teacher());

-- ---------------------------------------------------------- kiểm tra nhanh
-- Chạy sau khi gắn link, để biết còn mục nào chưa có video:
--
-- select ku_id, kind, title,
--        case when url is null or url = '' then 'CHƯA GẮN' else 'đã gắn' end as trang_thai,
--        duration_sec, nguon
--   from contents
--  where kind in ('video','hoc-lieu')
--  order by kind, ku_id;

-- ===========================================================================
-- CẢNH BÁO VỀ CỘT duration_sec — ĐỌC TRƯỚC KHI GẮN LINK
--
-- 13 dòng video đang để duration_sec = 480 như một con số tạm. Đây KHÔNG phải
-- một trường trang trí: nó là MẪU SỐ của tỉ lệ hoàn thành video
--
--     videoCompletionRate = thời gian xem có tương tác / duration_sec
--
-- và tỉ lệ đó là điều kiện của cả R01 lẫn R09. Video thật dài 6 phút 12 giây mà
-- cơ sở dữ liệu vẫn ghi 480 giây thì một em xem TRỌN VẸN chỉ được tính 78% —
-- dưới ngưỡng 90% — và bị chẩn đoán "chưa xem hết bài". Cả lớp bị chẩn đoán sai
-- vì một con số điền tạm.
--
-- Trang /gv/noi-dung tự đọc thời lượng thật từ trình phát YouTube khi dán link,
-- nên nếu gắn link ở đó thì không phải lo chuyện này. Còn nếu gắn bằng SQL thì
-- PHẢI sửa duration_sec cùng lúc, ví dụ:
--
-- update contents
--    set url = 'https://www.youtube.com/watch?v=XXXXXXXXXXX',
--        duration_sec = 372,                       -- 6 phút 12 giây = 372 giây
--        nguon = 'Kênh ABC — dùng lại, có ghi nguồn trong báo cáo',
--        cap_nhat_luc = now()
--  where content_id = 'VD-C1-B1-M1';
-- ===========================================================================
