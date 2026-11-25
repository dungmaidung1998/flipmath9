-- =============================================================================
-- 20 · VÁ HAI LỖ HỔNG PHÂN QUYỀN
-- -----------------------------------------------------------------------------
-- Phát hiện ngày 22/9/2026 khi kiểm thử phân quyền trên PostgreSQL 16 cục bộ,
-- với 2 giáo viên, 3 học sinh thuộc 2 lớp. Kết quả đầy đủ:
--   02-Nhat-ky-nghien-cuu/KET-QUA-KIEM-THU-PHAN-QUYEN-22-09-2026.md
--
-- CHẠY NGAY, dù đang giữa đợt thực nghiệm. Lỗ hổng 1 cho phép học sinh xem đáp
-- án đúng của cả 80 câu — tức là làm sai chính số liệu đang thu. Đây đúng là
-- trường hợp ngoại lệ "lỗi làm sai số liệu thì sửa ngay". Ghi ngày chạy vào sổ
-- nhật ký nghiên cứu.
--
-- Tệp này KHÔNG đổi giao diện, KHÔNG đổi cách chấm, KHÔNG đổi thuật toán. Học
-- sinh dùng hệ thống sẽ không thấy khác gì.
--
-- Chạy lại nhiều lần vẫn an toàn.
-- =============================================================================


-- -----------------------------------------------------------------------------
-- LỖ HỔNG 1 · Học sinh đọc được cột đáp án đúng (correct_option) của 80 câu.
--
-- Chính sách "doc de bai" cho mọi tài khoản đã đăng nhập đọc bảng questions,
-- và chú thích ở tệp 01 đã nói rõ: RLS của Postgres không lọc theo cột, nên
-- "ứng dụng chỉ truy vấn qua view" questions_public. Nhưng khoá anon nằm
-- công khai trong trình duyệt. Một em mở DevTools, gõ
--     supabase.from('questions').select('question_id, correct_option')
-- là có đủ đáp án — không cần đi qua ứng dụng.
--
-- Cách vá: phân quyền THEO CỘT. Học sinh và giáo viên (vai authenticated) chỉ
-- được đọc 5 cột không phải đáp án. Mọi chỗ trong ứng dụng cần đáp án đều đọc
-- bằng khoá service_role phía máy chủ (quiz/submit, danh-gia, quan-ly, goi-y)
-- — đã rà từng tệp — nên không chỗ nào bị ảnh hưởng. View questions_public
-- chỉ lấy đúng 5 cột này nên vẫn chạy như cũ.
-- -----------------------------------------------------------------------------

revoke select on public.questions from anon, authenticated;
grant  select (question_id, ku_id, level, stem, expected_time_sec)
       on public.questions to authenticated;


-- -----------------------------------------------------------------------------
-- LỖ HỔNG 2 · Giáo viên đọc được lịch sử mức làm chủ của học sinh LỚP KHÁC.
--
-- Mọi bảng khác dùng teaches_student() — chỉ lớp mình dạy. Riêng bảng
-- mastery_history dùng is_teacher() — hễ là giáo viên là đọc được hết. Nhẹ
-- hơn lỗ hổng 1, nhưng lệch khỏi quy tắc chung của cả hệ thống, và là dữ liệu
-- của học sinh chưa thành niên.
-- -----------------------------------------------------------------------------

drop policy if exists "doc lich su mastery" on public.mastery_history;
create policy "doc lich su mastery" on public.mastery_history
  for select to authenticated
  using (student_id = my_student_id() or teaches_student(student_id));


-- -----------------------------------------------------------------------------
-- KIỂM TRA SAU KHI CHẠY — kết quả phải là hai dòng "ĐÃ VÁ".
-- -----------------------------------------------------------------------------

select case when has_column_privilege('authenticated', 'public.questions', 'correct_option', 'select')
            then '❌ CHƯA VÁ: học sinh vẫn đọc được đáp án'
            else '✅ ĐÃ VÁ: học sinh không đọc được cột đáp án' end as lo_hong_1
union all
select case when exists (select 1 from pg_policies
                         where tablename = 'mastery_history'
                           and qual like '%teaches_student%')
            then '✅ ĐÃ VÁ: giáo viên chỉ đọc lịch sử lớp mình'
            else '❌ CHƯA VÁ: giáo viên đọc được lịch sử mọi lớp' end;
