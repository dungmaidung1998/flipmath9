-- ===========================================================================
-- DFLE-M7 · KIỂM TRA ĐÃ CHẠY TỆP NÀO RỒI
--
-- Dán CẢ TỆP này vào Supabase → SQL Editor → Run. Nó KHÔNG sửa gì cả, chỉ đọc
-- và trả về một bảng: tệp nào đã chạy, tệp nào chưa, và thiếu thì hỏng cái gì.
--
-- Chạy được bất cứ lúc nào, kể cả trên cơ sở dữ liệu hoàn toàn trống. Chạy lại
-- sau mỗi lần nạp một tệp để biết mình đang ở đâu.
-- ===========================================================================

create or replace function public._kiem_tra_cai_dat()
returns table(thu_tu int, tep text, trang_thai text, ghi_chu text)
language plpgsql as $$
declare n bigint; m bigint;
begin
  ---------------------------------------------------------------- 01
  if to_regclass('public.knowledge_units') is null then
    return query select 1, '01-schema.sql'::text, '❌ CHƯA CHẠY'::text,
      'Thiếu toàn bộ bảng nền. Phải chạy tệp này TRƯỚC MỌI TỆP KHÁC.'::text;
    return;   -- chưa có lược đồ thì các câu hỏi sau đều vô nghĩa
  end if;
  return query select 1, '01-schema.sql'::text, '✅ đã chạy'::text, 'Bảng, view, phân quyền RLS'::text;

  ---------------------------------------------------------------- 02
  execute 'select count(*) from classes' into n;
  execute 'select count(*) from profiles where role = ''giao-vien''' into m;
  return query select 2, '02-seed.sql'::text,
    case when n > 0 and m > 0 then '✅ đã có lớp' else '⚠️ chưa đủ' end::text,
    (n || ' lớp · ' || m || ' tài khoản giáo viên. Tệp 02 chỉ là MẪU LỆNH — '
     || 'thầy cô tự tạo lớp và gắn teacher_id của mình, xem mục 4 phần cài đặt.')::text;

  ---------------------------------------------------------------- 03
  if exists (select 1 from information_schema.columns
              where table_schema='public' and table_name='quiz_attempts' and column_name='kind') then
    return query select 3, '03-pha-sau-gio-hoc.sql'::text, '✅ đã chạy'::text,
      'Phân biệt bài chuẩn bị với bài vận dụng'::text;
  else
    return query select 3, '03-pha-sau-gio-hoc.sql'::text, '❌ CHƯA CHẠY'::text,
      'Thiếu cột quiz_attempts.kind → quy tắc R02 không chạy, phép thử T6 không đo được.'::text;
  end if;

  ---------------------------------------------------------------- 04
  if to_regclass('public.student_xp') is null then
    return query select 4, '04-gamification-va-do-luong.sql'::text, '❌ CHƯA CHẠY'::text,
      'Thiếu bảng điểm kinh nghiệm và bảng measurements → trang /tien-do và /gv/do-luong trống.'::text;
  else
    execute 'select count(*) from measurements' into n;
    return query select 4, '04-gamification-va-do-luong.sql'::text, '✅ đã chạy'::text,
      (n || ' dòng số liệu đo (pre/post/followup)')::text;
  end if;

  ---------------------------------------------------------------- 05
  if to_regclass('public.error_hints') is null then
    return query select 5, '05-goi-y-theo-tang.sql'::text, '❌ CHƯA CHẠY'::text,
      'Thiếu bảng gợi ý → trợ giảng ba tầng không mở được tầng nào.'::text;
  else
    execute 'select count(*) from error_hints' into n;
    return query select 5, '05-goi-y-theo-tang.sql'::text, '✅ đã chạy'::text,
      (n || ' gợi ý (đủ bộ Chương I là 69)')::text;
  end if;

  ---------------------------------------------------------------- 06
  if to_regclass('public.week_plan') is null then
    return query select 6, '06-do-trung-thuc.sql'::text, '❌ CHƯA CHẠY'::text,
      'Thiếu week_plan → trang /gv/do-trung-thuc không chạy, VÀ thành phần Đều đặn của LES là "chưa đo".'::text;
  else
    execute 'select count(*) from week_plan' into n;
    return query select 6, '06-do-trung-thuc.sql'::text, '✅ đã chạy'::text,
      (n || ' tuần đã khai kế hoạch'
       || case when n = 0 then ' — CHƯA KHAI TUẦN NÀO nên Đều đặn vẫn là "chưa đo"' else '' end)::text;
  end if;

  ---------------------------------------------------------------- 07
  execute 'select count(*) from knowledge_units' into n;
  execute 'select count(*) from questions' into m;
  if n = 0 then
    return query select 7, '07-noi-dung-chuong-1.sql'::text, '❌ CHƯA CHẠY'::text,
      'Chưa có đơn vị kiến thức nào → học sinh đăng nhập vào thấy trang trắng.'::text;
  else
    return query select 7, '07-noi-dung-chuong-1.sql'::text, '✅ đã chạy'::text,
      (n || ' đơn vị kiến thức · ' || m || ' câu hỏi (đủ bộ là 14 mục, 70 câu trước khi nạp tệp 09)')::text;
  end if;

  ---------------------------------------------------------------- 08
  if to_regclass('public.micro_lessons') is null then
    return query select 8, '08-vi-bai-hoc.sql'::text, '❌ CHƯA CHẠY'::text,
      'Thiếu bảng vi bài học → quy tắc R03 giao bài mà học sinh mở ra không có nội dung.'::text;
  else
    execute 'select count(*) from micro_lessons' into n;
    return query select 8, '08-vi-bai-hoc.sql'::text, '✅ đã chạy'::text,
      (n || ' vi bài học sửa lỗi (đủ bộ là 23)')::text;
  end if;

  ---------------------------------------------------------------- 09
  execute 'select count(*) from questions where level = 4' into n;
  if n = 0 then
    return query select 9, '09-cau-hoi-muc-4.sql'::text, '❌ CHƯA CHẠY'::text,
      'Không có câu mức 4 nào → mức làm chủ 3 là BẤT KHẢ, không học sinh nào lên nổi mức cao nhất.'::text;
  else
    return query select 9, '09-cau-hoi-muc-4.sql'::text, '✅ đã chạy'::text,
      (n || ' câu mức 4 (đủ bộ là 10, mỗi mục có video một câu)')::text;
  end if;

  ---------------------------------------------------------------- 10
  if not exists (select 1 from information_schema.columns
                  where table_schema='public' and table_name='contents' and column_name='nguon') then
    return query select 10, '10-gan-link-video.sql'::text, '❌ CHƯA CHẠY'::text,
      'Thiếu cột nguon và quyền sửa contents → trang /gv/noi-dung mở được nhưng bấm Lưu sẽ báo lỗi.'::text;
  else
    execute 'select count(*) from contents where kind = ''video'' and url is not null and url <> ''''' into n;
    execute 'select count(*) from contents where kind = ''video''' into m;
    return query select 10, '10-gan-link-video.sql'::text, '✅ đã chạy'::text,
      ('Đã gắn link ' || n || '/' || m || ' video'
       || case when n = 0 then ' — CHƯA GẮN VIDEO NÀO, pha trước giờ lên lớp chưa chạy được'
               when n < m then ' — còn thiếu, vào /gv/noi-dung gắn nốt'
               else ' — đủ' end)::text;
  end if;

  ---------------------------------------------------------------- 15
  if to_regclass('public.les_tong_hop') is null then
    return query select 15, '15-view-tong-hop-va-lich-su.sql'::text, '❌ CHƯA CHẠY'::text,
      'Thiếu các bảng tổng hợp → trang /gv KHÔNG MỞ ĐƯỢC, tệp xuất dữ liệu báo lỗi 503, và tệp 18 sẽ dừng lại.'::text;
  else
    execute 'select count(*) from mastery_history' into n;
    return query select 15, '15-view-tong-hop-va-lich-su.sql'::text, '✅ đã chạy'::text,
      (n || ' mốc lịch sử mức làm chủ đã ghi'
       || case when n = 0 then ' — chưa em nào đổi mức, bình thường khi lớp mới bắt đầu' else '' end)::text;
  end if;

  ---------------------------------------------------------------- 16
  if to_regclass('public.manage_learning_content') is null then
    return query select 16, '16-quan-ly-noi-dung.sql'::text, '❌ CHƯA CHẠY'::text,
      'Trang Chương trình và Ngân hàng câu hỏi mở được nhưng bấm Lưu sẽ báo lỗi.'::text;
  else
    return query select 16, '16-quan-ly-noi-dung.sql'::text, '✅ đã chạy'::text,
      'Sửa được chương trình và câu hỏi ngay trong web'::text;
  end if;

  ---------------------------------------------------------------- 17
  if to_regclass('public.video_seconds') is null then
    return query select 17, '17-hoan-thanh-hoc-tap.sql'::text, '❌ CHƯA CHẠY'::text,
      'Không đo được độ phủ video → tỉ lệ xem luôn là "chưa đo", nên quy tắc R01 và R09 KHÔNG BAO GIỜ kích hoạt.'::text;
  else
    execute 'select count(distinct student_id) from video_seconds' into n;
    return query select 17, '17-hoan-thanh-hoc-tap.sql'::text, '✅ đã chạy'::text,
      (n || ' học sinh đã có dữ liệu độ phủ video'
       || case when n = 0 then ' — chưa em nào xem, bình thường khi lớp mới bắt đầu' else '' end)::text;
  end if;

  ---------------------------------------------------------------- 18
  if to_regclass('public.assessments') is null then
    return query select 18, '18-danh-gia-va-mastery.sql'::text, '❌ CHƯA CHẠY'::text,
      'Thiếu bài đánh giá VÀ thiếu hàm tính mức làm chủ v2 → nộp bài xong mức làm chủ không cập nhật.'::text;
  else
    execute 'select count(*) from assessments where submitted_at is not null' into n;
    execute 'select count(*) from mastery_states where mastery_level is null' into m;
    return query select 18, '18-danh-gia-va-mastery.sql'::text, '✅ đã chạy'::text,
      (n || ' bài đánh giá đã nộp · ' || m || ' mục đang ở trạng thái "chưa đủ bằng chứng"')::text;
  end if;

  ---------------------------------------------------------------- tổng kết dữ liệu
  execute 'select count(*) from students' into n;
  execute 'select count(*) from students where consent_status = ''dong-y''' into m;
  return query select 99, '— Dữ liệu hiện có —'::text, ''::text,
    (n || ' học sinh, trong đó ' || m || ' em đã đồng thuận (chỉ các em này mới được xuất dữ liệu)')::text;
end $$;

select thu_tu as "#", tep as "Tệp", trang_thai as "Trạng thái", ghi_chu as "Nghĩa là gì"
  from public._kiem_tra_cai_dat() order by thu_tu;

drop function public._kiem_tra_cai_dat();
