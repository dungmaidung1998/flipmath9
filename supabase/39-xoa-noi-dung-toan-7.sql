-- ===========================================================================
-- FLIPMATH9 · XOÁ NỘI DUNG TOÁN 7 MẪU KHỎI CƠ SỞ DỮ LIỆU MỚI
-- Chạy MỘT LẦN trên dự án Supabase MỚI của FlipMath9, sau các tệp cấu trúc
-- (một số tệp cấu trúc 07, 08, 09, 21 nạp kèm nội dung Toán 7 Chương I).
-- Tệp này gỡ toàn bộ nội dung Toán 7 đó, GIỮ cấu trúc bảng và 7 hoạt động
-- dùng chung HD-CHUNG-*. Sau tệp này chạy 40-noi-dung-toan-9.sql.
--
-- CHỐT AN TOÀN: tệp DỪNG nếu cơ sở dữ liệu đã có học sinh hoặc bài làm —
-- tức là KHÔNG BAO GIỜ được chạy nhầm trên cơ sở dữ liệu MathFlip Toán 7.
-- ===========================================================================
do $$
begin
  if exists (select 1 from public.students) or exists (select 1 from public.quiz_attempts) then
    raise exception E'\n\n>>> DỪNG LẠI: Cơ sở dữ liệu này đã có học sinh / bài làm. Tệp 39 chỉ dùng cho dự án Supabase MỚI của FlipMath9. <<<\n';
  end if;
end $$;

begin;
delete from public.distractor_errors;
delete from public.question_options;
delete from public.questions;
delete from public.error_hints;
delete from public.micro_lessons;
delete from public.error_dictionary;
delete from public.contents;
delete from public.mm_activities where activity_id not like 'HD-CHUNG-%';
delete from public.knowledge_units;
commit;

select 'knowledge_units' as bang, count(*) as con_lai from public.knowledge_units
union all select 'questions', count(*) from public.questions
union all select 'mm_activities (dùng chung)', count(*) from public.mm_activities;
