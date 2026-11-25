-- ===========================================================================
-- DFLE-M7 · GỠ BỎ CÁC ĐƠN VỊ KIẾN THỨC NGOÀI CHƯƠNG I
-- Chạy SAU 07-noi-dung-chuong-1.sql. Chạy lại nhiều lần được.
--
-- VÌ SAO CẦN TỆP NÀY
-- Bản gieo dữ liệu đầu tiên của dự án có sáu đơn vị kiến thức mẫu thuộc chương
-- khác (tỉ lệ thức, đại lượng tỉ lệ thuận/nghịch). Tệp 07 có sẵn bước dọn dẹp,
-- nhưng nó CỐ TÌNH THẬN TRỌNG: chỉ xoá những gì không còn thứ gì bám vào, để
-- không bao giờ xoá nhầm dữ liệu học tập thật. Vì thận trọng như vậy, vài mục cũ
-- sống sót — thường vì còn một dòng học liệu hoặc một bản ghi mức làm chủ trỏ
-- tới. Kết quả: trang "Học liệu" hiện 15 mục thay vì 13 đúng của Chương I.
--
-- Tệp này gỡ CHÍNH XÁC hai mục đó và mọi thứ treo trên chúng, theo đúng thứ tự
-- khoá ngoại. Nó KHÔNG đụng tới bất cứ mục nào có mã bắt đầu bằng 'C1-'.
--
-- CÓ MẤT DỮ LIỆU NGHIÊN CỨU KHÔNG
-- Có — nếu đã có học sinh làm bài ở hai mục đó. Khối kiểm tra bên dưới đếm trước
-- và DỪNG LẠI nếu thấy có lượt làm bài thật, thay vì lặng lẽ xoá. Muốn xoá bằng
-- được thì đổi `cho_phep_mat_du_lieu` thành true, nhưng hãy chắc là mình hiểu
-- mình đang bỏ đi cái gì.
-- ===========================================================================

do $$
declare
  ------------------------------------------------------------ SỬA Ở ĐÂY
  cho_phep_mat_du_lieu boolean := false;
  ------------------------------------------------------------ hết phần sửa
  so_luot   bigint;
  so_muc    bigint;
  ds        text;
begin
  if to_regclass('public.knowledge_units') is null then
    raise exception E'\n\n>>> DỪNG LẠI: Phải chạy 01-schema.sql TRƯỚC tệp này. <<<\n';
  end if;

  select count(*), coalesce(string_agg(ku_id || ' (' || ku_name || ')', ', '), '')
    into so_muc, ds
    from knowledge_units where ku_id not like 'C1-%';

  if so_muc = 0 then
    raise notice 'Không có mục nào ngoài Chương I. Không phải làm gì cả.';
    return;
  end if;

  select count(*) into so_luot
    from quiz_attempts a
    join knowledge_units k on k.ku_id = a.ku_id
   where k.ku_id not like 'C1-%';

  if so_luot > 0 and not cho_phep_mat_du_lieu then
    raise exception E'\n\n>>> DỪNG LẠI: % mục ngoài Chương I đang có % lượt làm bài của học sinh. Xoá là mất số liệu đó vĩnh viễn. Nếu đây chỉ là dữ liệu thử và chắc chắn muốn xoá, đổi cho_phep_mat_du_lieu thành true ở đầu tệp. <<<\n', so_muc, so_luot;
  end if;

  -- NHẬT KÝ TIẾT DẠY KHÔNG BAO GIỜ BỊ XOÁ TỰ ĐỘNG. Đó là bằng chứng cho chỉ số
  -- độ trung thực triển khai — thứ không dựng lại được. Có dòng nào trỏ tới mục
  -- sắp gỡ thì dừng hẳn, để thầy cô tự quyết định.
  select count(*) into so_luot from lesson_log where ku_id not like 'C1-%';
  if so_luot > 0 then
    raise exception E'\n\n>>> DỪNG LẠI: có % dòng nhật ký tiết dạy đang trỏ tới mục ngoài Chương I. Nhật ký tiết dạy là bằng chứng của chỉ số độ trung thực, tệp này không tự xoá. Vào bảng lesson_log sửa hoặc xoá những dòng đó trước, rồi chạy lại. <<<\n', so_luot;
  end if;

  raise notice 'Sẽ gỡ % mục: %', so_muc, ds;

  -- Thứ tự đi ngược chiều khoá ngoại. Sai thứ tự là Postgres từ chối ngay.
  delete from quiz_answers where attempt_id in (
    select attempt_id from quiz_attempts where ku_id not like 'C1-%');
  delete from quiz_attempts   where ku_id not like 'C1-%';
  delete from quiz_locks      where ku_id not like 'C1-%';
  delete from learning_events where ku_id not like 'C1-%';
  delete from mastery_states  where ku_id not like 'C1-%';
  delete from recommendations where ku_id not like 'C1-%';

  delete from distractor_errors where question_id in (
    select question_id from questions where ku_id not like 'C1-%');
  delete from question_options  where question_id in (
    select question_id from questions where ku_id not like 'C1-%');
  delete from questions where ku_id not like 'C1-%';

  -- Nhật ký MỞ BÁO CÁO thì giữ lại dòng, chỉ gỡ liên kết tới mục sắp xoá: việc
  -- thầy cô đã mở báo cáo chẩn đoán vẫn là bằng chứng có giá trị, kể cả khi mục
  -- được xem lúc đó không còn nữa.
  update dashboard_views set ku_id = null where ku_id not like 'C1-%';

  delete from error_dictionary where coalesce(ku_id, '') not like 'C1-%';
  delete from contents         where coalesce(ku_id, '') not like 'C1-%';

  -- Gỡ liên kết tiên quyết trước, nếu không chỉ xoá được lớp ngoài cùng của chuỗi.
  update knowledge_units set prerequisite_ku = null
   where prerequisite_ku in (select ku_id from knowledge_units where ku_id not like 'C1-%');
  delete from knowledge_units where ku_id not like 'C1-%';

  raise notice 'Đã gỡ xong. Giờ chỉ còn các mục của Chương I.';
end $$;

-- ------------------------------------------------------------- kiểm tra lại
-- Phải ra đúng 14 dòng, tất cả bắt đầu bằng C1-.
select order_index as thu_tu, ku_id, ku_name, lesson_id, prerequisite_ku
  from knowledge_units order by order_index;
