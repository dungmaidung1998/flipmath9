-- ===========================================================================
-- FlipMath9 · 45 · XOÁ HẲN LỚP MẪU "DEMO-9A" (dữ liệu giả lập của 44a, 44b, 44c)
--
-- Chỉ đụng tới lớp DEMO9 và học sinh mã mau01…mau40. Không đụng lớp thật.
-- Nếu đã tạo tài khoản đăng nhập cho học sinh mẫu: tệp gỡ liên kết hồ sơ của các tài khoản đó;
-- muốn xoá hẳn tài khoản thì vào Authentication → Users của Supabase, tìm email có chữ "demo-9a" và xoá.
-- ===========================================================================

begin;

do $$
declare ds text[];
begin
  select coalesce(array_agg(student_id), '{}') into ds
    from students where class_id = 'DEMO9' or student_id ~ '^mau[0-9]{2}$';

  delete from learning_recovery_records where student_id = any(ds);
  delete from quiz_answers where attempt_id in (select attempt_id from quiz_attempts where student_id = any(ds));
  delete from quiz_attempts where student_id = any(ds);
  delete from soat_loi_luot where student_id = any(ds);
  delete from student_error_log where student_id = any(ds);
  delete from student_errors where student_id = any(ds);
  delete from learning_events where student_id = any(ds);
  delete from video_seconds where student_id = any(ds);
  delete from mastery_history where student_id = any(ds);
  delete from mastery_states where student_id = any(ds);
  delete from recommendations where student_id = any(ds);
  delete from quiz_locks where student_id = any(ds);
  delete from xp_log where student_id = any(ds);
  delete from student_xp where student_id = any(ds);
  delete from student_badges where student_id = any(ds);
  delete from hint_requests where student_id = any(ds);
  delete from micro_lesson_events where student_id = any(ds);

  -- Bảng có thể có hoặc chưa có, tuỳ đã chạy tệp nào.
  if to_regclass('public.hint_feedback') is not null then delete from hint_feedback where student_id = any(ds); end if;
  if to_regclass('public.support_sessions') is not null then delete from support_sessions where student_id = any(ds); end if;
  if to_regclass('public.assessments') is not null then delete from assessments where student_id = any(ds); end if;
  if to_regclass('public.mm_exit_tickets') is not null then delete from mm_exit_tickets where student_id = any(ds); end if;
  if to_regclass('public.mm_teacher_prediagnosis') is not null then delete from mm_teacher_prediagnosis where student_id = any(ds); end if;
  if to_regclass('public.measurements') is not null then delete from measurements where student_id = any(ds); end if;

  -- Tài khoản học sinh mẫu (nếu đã tạo): bỏ liên kết hồ sơ để xoá được học sinh.
  delete from profiles where student_id = any(ds) and role in ('hoc-sinh', 'hoc-sinh-nckh');

  delete from students where student_id = any(ds);
  delete from classes where class_id = 'DEMO9';   -- lịch giao bài, nhật ký tiết, việc đã giao… xoá theo lớp

  raise notice 'Đã xoá lớp mẫu DEMO-9A và % học sinh mẫu.', coalesce(array_length(ds, 1), 0);
end $$;

commit;
