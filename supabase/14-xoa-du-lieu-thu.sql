-- ===========================================================================
-- DFLE-M7 · XOÁ DỮ LIỆU CỦA TÀI KHOẢN THỬ
-- Chạy sau khi đã chạy xong kịch bản KIEM-THU-DAU-CUOI.md.
--
-- Tệp này xoá VĨNH VIỄN mọi dữ liệu học tập của các mã học sinh liệt kê bên
-- dưới. Không hoàn tác được.
--
-- HAI CHỐT AN TOÀN, đều bật sẵn:
--   1. Mã nào đang ở trạng thái ĐÃ ĐỒNG THUẬN thì tệp DỪNG LẠI, không xoá gì
--      cả. Em đã đồng thuận là em có dữ liệu nghiên cứu thật.
--   2. Tệp in ra số dòng sẽ xoá TRƯỚC khi xoá, để thầy cô đối chiếu.
--
-- TỆP NÀY KHÔNG XOÁ TÀI KHOẢN ĐĂNG NHẬP. Sau khi chạy xong, vào
-- Authentication → Users trong Supabase, xoá ba dòng có đuôi
-- @7a1.hs.dfle.local. Dòng trong bảng profiles tự mất theo.
-- ===========================================================================

do $$
declare
  ------------------------------------------------------------ SỬA Ở ĐÂY
  ma_thu text[] := array['test01', 'test02', 'thu01'];
  ------------------------------------------------------------ hết phần sửa
  n_dongy   bigint;
  n_luot    bigint;
  n_su_kien bigint;
  n_goi_y   bigint;
begin
  select count(*) into n_dongy
    from students where student_id = any(ma_thu) and consent_status = 'dong-y';

  if n_dongy > 0 then
    raise exception E'\n\n>>> DỪNG LẠI: % trong số các mã liệt kê đang ở trạng thái ĐÃ ĐỒNG THUẬN. Đây là dữ liệu nghiên cứu thật, không phải dữ liệu thử. Kiểm tra lại danh sách mã ở đầu tệp. <<<\n', n_dongy;
  end if;

  select count(*) into n_luot    from quiz_attempts   where student_id = any(ma_thu);
  select count(*) into n_su_kien from learning_events where student_id = any(ma_thu);
  select count(*) into n_goi_y   from recommendations where student_id = any(ma_thu);
  raise notice 'Sẽ xoá: % lượt làm bài · % sự kiện học tập · % gợi ý', n_luot, n_su_kien, n_goi_y;

  -- Thứ tự đi ngược chiều khoá ngoại.
  delete from quiz_answers where attempt_id in (
    select attempt_id from quiz_attempts where student_id = any(ma_thu));
  delete from quiz_attempts   where student_id = any(ma_thu);
  delete from quiz_locks      where student_id = any(ma_thu);
  delete from learning_events where student_id = any(ma_thu);
  delete from mastery_states  where student_id = any(ma_thu);
  delete from recommendations where student_id = any(ma_thu);

  -- Các bảng dưới đây chỉ có khi đã chạy tệp 04, 05, 08 — bỏ qua nếu chưa có.
  if to_regclass('public.xp_log')              is not null then delete from xp_log              where student_id = any(ma_thu); end if;
  if to_regclass('public.student_badges')      is not null then delete from student_badges      where student_id = any(ma_thu); end if;
  if to_regclass('public.student_xp')          is not null then delete from student_xp          where student_id = any(ma_thu); end if;
  if to_regclass('public.hint_requests')       is not null then delete from hint_requests       where student_id = any(ma_thu); end if;
  if to_regclass('public.micro_lesson_events') is not null then delete from micro_lesson_events where student_id = any(ma_thu); end if;
  if to_regclass('public.measurements')        is not null then delete from measurements        where student_id = any(ma_thu); end if;

  delete from profiles where student_id = any(ma_thu);
  delete from students where student_id = any(ma_thu);

  raise notice 'Đã xoá xong dữ liệu học tập. Còn một việc thủ công: vào Authentication → Users xoá ba tài khoản đuôi @7a1.hs.dfle.local.';
end $$;

-- ------------------------------------------------------------- kiểm tra lại
-- Cả ba truy vấn phải ra 0.
select
  (select count(*) from students       where student_id in ('test01','test02','thu01')) as con_hoc_sinh,
  (select count(*) from quiz_attempts  where student_id in ('test01','test02','thu01')) as con_luot_lam_bai,
  (select count(*) from learning_events where student_id in ('test01','test02','thu01')) as con_su_kien;
