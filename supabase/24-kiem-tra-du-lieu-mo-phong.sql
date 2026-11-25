-- =============================================================================
-- 24 · KIỂM TRA XEM DỮ LIỆU MÔ PHỎNG CÓ LẪN VÀO LỚP THẬT KHÔNG
-- -----------------------------------------------------------------------------
-- TỆP NÀY CHỈ ĐỌC. Không thêm, không sửa, không xoá gì cả. Chạy lúc nào cũng
-- được, kể cả giữa đợt thực nghiệm.
--
-- Bộ dữ liệu 40 học sinh mô phỏng (tệp 22) dùng mã hs001..hs040, khác hẳn mã
-- học sinh thật (tn-… và dc-…). Nhờ vậy đếm được chính xác.
-- =============================================================================

-- 1) Từng lớp có bao nhiêu học sinh thật, bao nhiêu học sinh mô phỏng
select c.class_code as lop,
       c.arm        as nhom,
       count(s.student_id) filter (where s.student_id like 'hs0%')     as hoc_sinh_mo_phong,
       count(s.student_id) filter (where s.student_id not like 'hs0%') as hoc_sinh_that,
       case
         when count(s.student_id) filter (where s.student_id like 'hs0%') = 0 then '✅ sạch'
         when c.arm in ('TN','DC') then '❌ CÓ DỮ LIỆU MÔ PHỎNG TRONG LỚP THẬT'
         else '✅ lớp mô phỏng, đúng chỗ'
       end as ket_luan
  from classes c
  left join students s on s.class_id = c.class_id
 group by c.class_code, c.arm
 order by c.class_code;

-- 2) Dữ liệu mô phỏng đã lan tới những bảng nào
select 'students' as bang, count(*) as so_dong from students where student_id like 'hs0%'
union all select 'quiz_attempts',   count(*) from quiz_attempts       where student_id like 'hs0%'
union all select 'quiz_answers',    count(*) from quiz_answers a
            where exists (select 1 from quiz_attempts t
                           where t.attempt_id = a.attempt_id and t.student_id like 'hs0%')
union all select 'mastery_states',  count(*) from mastery_states      where student_id like 'hs0%'
union all select 'recommendations', count(*) from recommendations     where student_id like 'hs0%'
union all select 'learning_events', count(*) from learning_events     where student_id like 'hs0%'
 order by so_dong desc;

-- 3) Số tiết kế hoạch từng tuần — tệp 22 bản cũ ghi đè cột này thành 3.
--    Kế hoạch thật do tệp 19 khai. Sai thì độ trung thực triển khai tính sai theo.
select c.class_code as lop, w.tuan, w.so_tiet_ke_hoach as so_tiet,
       case when c.arm in ('TN','DC') and w.so_tiet_ke_hoach <> 4
            then '⚠ kiểm tra lại: tệp 19 khai 4 tiết/tuần'
            else '' end as ghi_chu
  from week_plan w join classes c using (class_id)
 order by c.class_code, w.tuan;

-- 4) Kết luận một dòng
select case
  when not exists (select 1 from students where student_id like 'hs0%')
    then '✅ KHÔNG có dữ liệu mô phỏng nào trong cơ sở dữ liệu này.'
  when exists (select 1 from students s join classes c using (class_id)
                where s.student_id like 'hs0%' and c.arm in ('TN','DC'))
    then '❌ CÓ dữ liệu mô phỏng nằm trong lớp thực nghiệm hoặc đối chứng — chạy 25-chuan-bi-lop-demo.sql'
  else '✅ Dữ liệu mô phỏng đã nằm gọn trong lớp DEMO, không ảnh hưởng nghiên cứu.'
end as ket_luan_chung;
