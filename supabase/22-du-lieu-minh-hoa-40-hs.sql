-- ===========================================================================
-- DFLE-M7 · BỘ DỮ LIỆU MÔ PHỎNG 40 HỌC SINH (LỚP 7A1)
--
-- Dùng để kiểm thử, tinh chỉnh giao diện và minh họa toàn diện các bảng điều
-- khiển giáo viên:
--   1. /gv           (Chỉ số LES 5 thành phần, phễu vi bài học, phân loại 4 nhóm)
--   2. /gv/chuan-bi  (Cockpit 3 phút trước giờ dạy, Class Heatmap 40x14, Bản đồ lỗi,
--                     Kịch bản 45' 3 pha, Đo lường can thiệp T6)
--   3. /gv/chia-nhom (Chia nhóm thích ứng Đa mục tiêu AI - Thuật toán 7)
--   4. /gv/phan-tich (Phân tích Năng lực Rasch IRT 1PL - Thuật toán 1)
--   5. /gv/ho-so     (Hồ sơ học tập 360 độ từng học sinh)
--
-- TÍNH NĂNG AN TOÀN:
--   - Chạy lại NHIỀU LẦN không gây lỗi trùng khoá hay nhân đôi dữ liệu.
--   - Có cờ do_wipe: Đổi thành true để XOÁ SẠCH 40 học sinh mẫu khi cần.
--   - Tự động nhận diện lớp 7A1 hoặc lớp đầu tiên của giáo viên đang có trong máy.
-- ===========================================================================

do $$
declare
  ----------------------------------------------------------------------------
  -- CẤU HÌNH ĐIỀU HÀNH
  ----------------------------------------------------------------------------
  ma_lop_target   text := 'DEMO';        -- LỚP MÔ PHỎNG RIÊNG — KHÔNG PHẢI LỚP THỰC NGHIỆM
  ma_lop_hien_thi text := 'DEMO-7A1';    -- mã lớp hiện trên giao diện
  i               int;                   -- biến đếm cho các vòng lặp foreach
  d               int;                   -- biến đếm ngày
  v_hs            record;                -- bản ghi cho các vòng lặp for ... in select
  do_wipe        boolean := false;       -- Đặt true nếu chỉ muốn xoá sạch dữ liệu mẫu
  ----------------------------------------------------------------------------

  v_class_id text;
  v_teacher_id uuid;
  ma_hs_arr text[] := array[
    'hs001','hs002','hs003','hs004','hs005','hs006','hs007','hs008',
    'hs009','hs010','hs011','hs012','hs013','hs014','hs015','hs016',
    'hs017','hs018','hs019','hs020','hs021','hs022','hs023','hs024',
    'hs025','hs026','hs027','hs028','hs029','hs030','hs031','hs032',
    'hs033','hs034','hs035','hs036','hs037','hs038','hs039','hs040'
  ];
  now_ts timestamptz := now();
  att_id bigint;
begin
  -- 1. XÁC ĐỊNH LỚP HỌC MỤC TIÊU
  select class_id, teacher_id into v_class_id, v_teacher_id
    from classes where class_code = ma_lop_target or class_id = ma_lop_target limit 1;

  if v_class_id is null then
    -- Tìm lớp bất kỳ có giáo viên
    select class_id, teacher_id into v_class_id, v_teacher_id
      from classes where teacher_id is not null limit 1;
  end if;

  if v_class_id is null then
    -- Tìm tài khoản giáo viên trong profiles
    select id into v_teacher_id from profiles where role = 'giao-vien' limit 1;
    v_class_id := ma_lop_target;
    insert into classes (class_id, class_code, grade, arm, teacher_id)
         values (v_class_id, ma_lop_hien_thi, 7, 'DEMO', v_teacher_id)
    on conflict (class_id) do update
         set arm = 'DEMO', teacher_id = coalesce(excluded.teacher_id, classes.teacher_id);
  end if;

  -- CHẶN AN TOÀN: không bao giờ nạp dữ liệu mô phỏng vào lớp thực nghiệm hay
  -- lớp đối chứng. Đây là lớp chắn cuối cùng, phòng khi ai đó sửa ma_lop_target
  -- ở trên thành '7A1' cho tiện.
  if exists (select 1 from classes where class_id = v_class_id and arm in ('TN','DC')) then
    raise exception E'\n\n>>> DỪNG LẠI: lớp % mang nhóm TN hoặc DC, tức là lớp thật của đợt thực nghiệm.\n'
      '    Tệp này chỉ được nạp vào lớp mô phỏng (arm = DEMO). Chạy 25-chuan-bi-lop-demo.sql trước. <<<\n', v_class_id;
  end if;

  raise notice 'Đang thao tác trên lớp ID: % (Mã: %)', v_class_id, ma_lop_target;

  -- 2. XOÁ DỮ LIỆU CŨ CỦA 40 HỌC SINH NÀY (ĐẢM BẢO CHẠY LẠI SẠCH SẼ)
  delete from quiz_answers where attempt_id in (
    select attempt_id from quiz_attempts where student_id = any(ma_hs_arr));
  delete from quiz_attempts where student_id = any(ma_hs_arr);
  delete from learning_events where student_id = any(ma_hs_arr);
  delete from mastery_states where student_id = any(ma_hs_arr);
  if to_regclass('public.mastery_history') is not null then
    delete from mastery_history where student_id = any(ma_hs_arr);
  end if;
  delete from recommendations where student_id = any(ma_hs_arr);
  if to_regclass('public.micro_lesson_events') is not null then
    delete from micro_lesson_events where student_id = any(ma_hs_arr);
  end if;
  if to_regclass('public.xp_log') is not null then
    delete from xp_log where student_id = any(ma_hs_arr);
  end if;
  if to_regclass('public.student_xp') is not null then
    delete from student_xp where student_id = any(ma_hs_arr);
  end if;
  if to_regclass('public.student_badges') is not null then
    delete from student_badges where student_id = any(ma_hs_arr);
  end if;
  if to_regclass('public.hint_requests') is not null then
    delete from hint_requests where student_id = any(ma_hs_arr);
  end if;
  if to_regclass('public.quiz_locks') is not null then
    delete from quiz_locks where student_id = any(ma_hs_arr);
  end if;
  delete from profiles where student_id = any(ma_hs_arr);
  delete from students where student_id = any(ma_hs_arr);

  if do_wipe then
    raise notice 'ĐÃ XOÁ SẠCH TOÀN BỘ 40 học sinh mẫu (hs001 .. hs040). Cờ do_wipe đang BẬT nên dừng tại đây.';
    return;
  end if;

  -- 3. ĐẢM BẢO KẾ HOẠCH TUẦN ĐẦY ĐỦ (CHO THÀNH PHẦN ĐỀU ĐẶN - LES)
  if to_regclass('public.week_plan') is not null then
    insert into week_plan (class_id, tuan, so_tiet_ke_hoach)
    values
      (v_class_id, 1, 3),
      (v_class_id, 2, 3),
      (v_class_id, 3, 3),
      (v_class_id, 4, 3)
    on conflict (class_id, tuan) do update set so_tiet_ke_hoach = excluded.so_tiet_ke_hoach;
  end if;

  -- 4. TẠO 40 HỌC SINH MÔ PHỎNG
  -- Tên hiển thị cố ý KHÔNG giống tên người thật, và consent_status để 'chua' —
  -- hai lớp chắn để dữ liệu này không bao giờ lẫn vào tệp xuất nghiên cứu.
  insert into students (student_id, class_id, display_name, gender, baseline_math, consent_status) values
    ('hs001', v_class_id, 'Học sinh mô phỏng 001',   'nam', 9.5, 'chua'),
    ('hs002', v_class_id, 'Học sinh mô phỏng 002',     'nu',  9.5, 'chua'),
    ('hs003', v_class_id, 'Học sinh mô phỏng 003',    'nam', 9.0, 'chua'),
    ('hs004', v_class_id, 'Học sinh mô phỏng 004',   'nu',  9.0, 'chua'),
    ('hs005', v_class_id, 'Học sinh mô phỏng 005',     'nam', 8.5, 'chua'),
    ('hs006', v_class_id, 'Học sinh mô phỏng 006',     'nu',  8.5, 'chua'),
    ('hs007', v_class_id, 'Học sinh mô phỏng 007',      'nam', 8.5, 'chua'),
    ('hs008', v_class_id, 'Học sinh mô phỏng 008',  'nu',  8.5, 'chua'),
    ('hs009', v_class_id, 'Học sinh mô phỏng 009',   'nam', 8.0, 'chua'),
    ('hs010', v_class_id, 'Học sinh mô phỏng 010',     'nu',  8.0, 'chua'),
    ('hs011', v_class_id, 'Học sinh mô phỏng 011',  'nam', 8.0, 'chua'),
    ('hs012', v_class_id, 'Học sinh mô phỏng 012',      'nu',  7.5, 'chua'),
    ('hs013', v_class_id, 'Học sinh mô phỏng 013',     'nam', 7.5, 'chua'),
    ('hs014', v_class_id, 'Học sinh mô phỏng 014',    'nu',  7.5, 'chua'),
    ('hs015', v_class_id, 'Học sinh mô phỏng 015',      'nam', 7.5, 'chua'),
    ('hs016', v_class_id, 'Học sinh mô phỏng 016',   'nu',  7.0, 'chua'),
    ('hs017', v_class_id, 'Học sinh mô phỏng 017', 'nam', 7.0, 'chua'),
    ('hs018', v_class_id, 'Học sinh mô phỏng 018',  'nu',  7.0, 'chua'),
    ('hs019', v_class_id, 'Học sinh mô phỏng 019',   'nam', 7.0, 'chua'),
    ('hs020', v_class_id, 'Học sinh mô phỏng 020',   'nu',  6.5, 'chua'),
    ('hs021', v_class_id, 'Học sinh mô phỏng 021',   'nam', 6.5, 'chua'),
    ('hs022', v_class_id, 'Học sinh mô phỏng 022',     'nu',  6.5, 'chua'),
    ('hs023', v_class_id, 'Học sinh mô phỏng 023',     'nu',  6.5, 'chua'),
    ('hs024', v_class_id, 'Học sinh mô phỏng 024',   'nam', 6.5, 'chua'),
    ('hs025', v_class_id, 'Học sinh mô phỏng 025',  'nam', 6.0, 'chua'),
    ('hs026', v_class_id, 'Học sinh mô phỏng 026',  'nu',  6.0, 'chua'),
    ('hs027', v_class_id, 'Học sinh mô phỏng 027',     'nam', 5.5, 'chua'),
    ('hs028', v_class_id, 'Học sinh mô phỏng 028',    'nu',  5.0, 'chua'),
    ('hs029', v_class_id, 'Học sinh mô phỏng 029',    'nam', 5.0, 'chua'),
    ('hs030', v_class_id, 'Học sinh mô phỏng 030',   'nam', 4.5, 'chua'),
    ('hs031', v_class_id, 'Học sinh mô phỏng 031',    'nam', 4.5, 'chua'),
    ('hs032', v_class_id, 'Học sinh mô phỏng 032',     'nu',  4.0, 'chua'),
    ('hs033', v_class_id, 'Học sinh mô phỏng 033',    'nam', 4.0, 'chua'),
    ('hs034', v_class_id, 'Học sinh mô phỏng 034',  'nu',  4.0, 'chua'),
    ('hs035', v_class_id, 'Học sinh mô phỏng 035',    'nam', 3.5, 'chua'),
    ('hs036', v_class_id, 'Học sinh mô phỏng 036',     'nam', 3.5, 'chua'),
    ('hs037', v_class_id, 'Học sinh mô phỏng 037',    'nam', 3.0, 'chua'),
    ('hs038', v_class_id, 'Học sinh mô phỏng 038',     'nam', 3.5, 'chua'),
    ('hs039', v_class_id, 'Học sinh mô phỏng 039',     'nam', 3.0, 'chua'),
    ('hs040', v_class_id, 'Học sinh mô phỏng 040',       'nu',  3.0, 'chua');

  -- 5. NẠP BẢN ĐỒ NHIỆT MASTERY CHO CẢ 14 ĐƠN VỊ KIẾN THỨC (40 HS x 14 KU)
  -- Phân bổ hợp lý: Các bài đầu học sinh làm chủ cao, bài hiện tại (C1-B2-M2) phân hóa rõ
  insert into mastery_states (student_id, ku_id, mastery_level, updated_at)
  select
    s.student_id,
    k.ku_id,
    case
      -- 8 em Làm chủ (hs001 - hs008): Mức 3 hầu hết các bài
      when s.student_id in ('hs001','hs002','hs003','hs004','hs005','hs006','hs007','hs008') then
        case when k.order_index <= 5 then 3
             when k.order_index <= 8 then 2
             else 1 end

      -- 18 em Khá / Tiến bộ (hs009 - hs026): Mức 2 ở bài hiện tại, mức 2-3 ở bài trước
      when s.student_id between 'hs009' and 'hs026' then
        case when k.order_index <= 3 then (case when (s.student_id in ('hs009','hs010','hs011','hs012')) then 3 else 2 end)
             when k.ku_id in ('C1-B2-M1', 'C1-B2-M2') then 2
             when k.order_index <= 7 then 1
             else 0 end

      -- 10 em Cần hỗ trợ (hs027 - hs036): Mức 0 hoặc 1 ở bài hiện tại
      when s.student_id between 'hs027' and 'hs036' then
        case
          -- 5 em hổng tiên quyết C1-B2-M1 (R05)
          when s.student_id in ('hs029','hs032','hs034','hs035','hs036') and k.ku_id = 'C1-B2-M1' then 0
          when k.order_index <= 3 then 1
          when k.ku_id = 'C1-B2-M2' then (case when s.student_id in ('hs027','hs028','hs030','hs031') then 1 else 0 end)
          else 0 end

      -- 4 em Nguy cơ (hs037 - hs040): Mức 0 ở bài hiện tại
      else
        case when k.order_index <= 2 then 1 else 0 end
    end as mastery_level,
    now_ts - (k.order_index * interval '1 day')
  from students s
  cross join knowledge_units k
  where s.student_id = any(ma_hs_arr) and k.ku_id like 'C1-%';

  -- 6. NẠP LỊCH SỬ MASTERY (CHO BẢNG mastery_history)
  if to_regclass('public.mastery_history') is not null then
    insert into mastery_history (student_id, ku_id, mastery_level, evidence, ts)
    select student_id, ku_id, mastery_level,
           jsonb_build_object('nguon', 'mo-phong-he-thong', 'diem', mastery_level * 3.3),
           updated_at
    from mastery_states
    where student_id = any(ma_hs_arr);
  end if;

  -- 7. BÀI QUIZ CHUẨN BỊ CHO BÀI HIỆN TẠI (C1-B2-M2: Quy tắc dấu ngoặc)
  -- 36 em đã nộp bài trước giờ học (Chuẩn bị 90%)
  -- Điểm số phân bổ từ 2.0 tới 10.0, điểm trung bình ~7.1

  -- 7.1. Nhóm 1: Trợ giảng nhí (8 em) -> Điểm 9.0 - 10.0
  -- hs001 .. hs004: 10.0 (đúng 5/5)
  for i in 1..4 loop
    insert into quiz_attempts (student_id, ku_id, attempt_no, score, time_on_task_sec, started_at, submitted_at, kind)
    values (ma_hs_arr[i], 'C1-B2-M2', 1, 10.0, 390 + i*15, now_ts - interval '18 hours', now_ts - interval '18 hours' + interval '400 seconds', 'chuan-bi')
    returning attempt_id into att_id;

    insert into quiz_answers (attempt_id, question_id, chosen_option, is_correct, error_code, answer_time_sec) values
      (att_id, 'C1-B2-M2-Q01', 'A', true, null, 50),
      (att_id, 'C1-B2-M2-Q02', 'A', true, null, 65),
      (att_id, 'C1-B2-M2-Q03', 'A', true, null, 70),
      (att_id, 'C1-B2-M2-Q04', 'A', true, null, 80),
      (att_id, 'C1-B2-M2-Q05', 'A', true, null, 120);
  end loop;

  -- hs005 .. hs008: 9.0 (đúng 4/5 hoặc 5/5 chấm điểm)
  for i in 5..8 loop
    insert into quiz_attempts (student_id, ku_id, attempt_no, score, time_on_task_sec, started_at, submitted_at, kind)
    values (ma_hs_arr[i], 'C1-B2-M2', 1, 9.0, 440 + i*10, now_ts - interval '17 hours', now_ts - interval '17 hours' + interval '480 seconds', 'chuan-bi')
    returning attempt_id into att_id;

    insert into quiz_answers (attempt_id, question_id, chosen_option, is_correct, error_code, answer_time_sec) values
      (att_id, 'C1-B2-M2-Q01', 'A', true, null, 55),
      (att_id, 'C1-B2-M2-Q02', 'A', true, null, 70),
      (att_id, 'C1-B2-M2-Q03', 'A', true, null, 75),
      (att_id, 'C1-B2-M2-Q04', 'A', true, null, 85),
      (att_id, 'C1-B2-M2-Q05', 'A', true, null, 130);
  end loop;

  -- 7.2. Nhóm 2: Khá & Đang tiến bộ (18 em) -> Điểm 6.5 - 8.5
  -- Mắc một số lỗi E-DN-02 hoặc E-DN-01
  for i in 9..26 loop
    declare
      v_sc numeric := case
        when i in (9,10,11) then 8.5
        when i in (12,13)   then 8.0
        when i in (14,15,16) then 7.5
        when i in (17,18,19,20) then 7.0
        else 6.5 end;
      v_err text := case when i % 2 = 0 then 'E-DN-02' else 'E-DN-01' end;
    begin
      insert into quiz_attempts (student_id, ku_id, attempt_no, score, time_on_task_sec, started_at, submitted_at, kind)
      values (ma_hs_arr[i], 'C1-B2-M2', 1, v_sc, 500 + (i-8)*10, now_ts - interval '16 hours', now_ts - interval '16 hours' + interval '540 seconds', 'chuan-bi')
      returning attempt_id into att_id;

      insert into quiz_answers (attempt_id, question_id, chosen_option, is_correct, error_code, answer_time_sec) values
        (att_id, 'C1-B2-M2-Q01', 'A', true, null, 60),
        (att_id, 'C1-B2-M2-Q02', case when v_sc <= 7.0 then 'B' else 'A' end, v_sc > 7.0, case when v_sc <= 7.0 then 'E-DN-01' else null end, 80),
        (att_id, 'C1-B2-M2-Q03', case when v_err = 'E-DN-02' and v_sc < 8.5 then 'B' else 'A' end, not (v_err = 'E-DN-02' and v_sc < 8.5), case when v_err = 'E-DN-02' and v_sc < 8.5 then 'E-DN-02' else null end, 90),
        (att_id, 'C1-B2-M2-Q04', 'A', true, null, 95),
        (att_id, 'C1-B2-M2-Q05', case when v_sc <= 7.5 then 'B' else 'A' end, v_sc > 7.5, case when v_sc <= 7.5 then 'E-DN-01' else null end, 140);
    end;
  end loop;

  -- 7.3. Nhóm 3: Cần hỗ trợ (10 em) -> Điểm 3.5 - 5.5
  -- Mắc quan niệm sai E-DN-02 lặp lại và E-DN-01
  for i in 27..36 loop
    declare
      v_sc numeric := case
        when i = 27 then 5.5
        when i in (28,29) then 5.0
        when i in (30,31) then 4.5
        when i in (32,33) then 4.0
        else 3.5 end;
    begin
      insert into quiz_attempts (student_id, ku_id, attempt_no, score, time_on_task_sec, started_at, submitted_at, kind)
      values (ma_hs_arr[i], 'C1-B2-M2', 1, v_sc, 650 + (i-26)*15, now_ts - interval '14 hours', now_ts - interval '14 hours' + interval '700 seconds', 'chuan-bi')
      returning attempt_id into att_id;

      insert into quiz_answers (attempt_id, question_id, chosen_option, is_correct, error_code, answer_time_sec) values
        (att_id, 'C1-B2-M2-Q01', 'B', false, 'E-DN-01', 90),
        (att_id, 'C1-B2-M2-Q02', 'B', false, 'E-DN-01', 110),
        (att_id, 'C1-B2-M2-Q03', 'B', false, 'E-DN-02', 120),  -- 10 lượt mắc E-DN-02 tại đây
        (att_id, 'C1-B2-M2-Q04', case when v_sc >= 5.0 then 'A' else 'B' end, v_sc >= 5.0, case when v_sc < 5.0 then 'E-DN-01' else null end, 130),
        (att_id, 'C1-B2-M2-Q05', 'B', false, 'E-DN-01', 160);
    end;
  end loop;

  -- 7.4. Nhóm 4: Bất thường (hs037 đoán mò, hs038 xem thụ động)
  -- hs037: R04 Đoán mò (32 giây, điểm 2.0)
  insert into quiz_attempts (student_id, ku_id, attempt_no, score, time_on_task_sec, started_at, submitted_at, kind)
  values ('hs037', 'C1-B2-M2', 1, 2.0, 32, now_ts - interval '5 hours', now_ts - interval '5 hours' + interval '32 seconds', 'chuan-bi')
  returning attempt_id into att_id;
  insert into quiz_answers (attempt_id, question_id, chosen_option, is_correct, error_code, answer_time_sec) values
    (att_id, 'C1-B2-M2-Q01', 'C', false, null, 6),
    (att_id, 'C1-B2-M2-Q02', 'C', false, null, 7),
    (att_id, 'C1-B2-M2-Q03', 'B', false, 'E-DN-02', 6),
    (att_id, 'C1-B2-M2-Q04', 'C', false, null, 6),
    (att_id, 'C1-B2-M2-Q05', 'A', true,  null, 7);

  -- hs038: R01 Xem thụ động (video 480s, làm bài 700s, điểm 2.5)
  insert into quiz_attempts (student_id, ku_id, attempt_no, score, time_on_task_sec, started_at, submitted_at, kind)
  values ('hs038', 'C1-B2-M2', 1, 2.5, 700, now_ts - interval '6 hours', now_ts - interval '6 hours' + interval '700 seconds', 'chuan-bi')
  returning attempt_id into att_id;
  insert into quiz_answers (attempt_id, question_id, chosen_option, is_correct, error_code, answer_time_sec) values
    (att_id, 'C1-B2-M2-Q01', 'B', false, 'E-DN-01', 120),
    (att_id, 'C1-B2-M2-Q02', 'B', false, 'E-DN-01', 130),
    (att_id, 'C1-B2-M2-Q03', 'C', false, 'E-DN-02', 140),
    (att_id, 'C1-B2-M2-Q04', 'B', false, 'E-DN-01', 150),
    (att_id, 'C1-B2-M2-Q05', 'A', true,  null, 160);

  -- (hs039 bỏ học, hs040 chưa làm bài -> không insert attempt)

  -- 8. THÊM BÀI LÀM MỤC C1-B2-M1 ĐỂ TẠO LỖI E-CT-01 VÀ HỔNG TIÊN QUYẾT
  for i in 27..36 loop
    insert into quiz_attempts (student_id, ku_id, attempt_no, score, time_on_task_sec, started_at, submitted_at, kind)
    values (ma_hs_arr[i], 'C1-B2-M1', 1, case when i in (29,32,34,35,36) then 3.0 else 5.0 end, 600, now_ts - interval '3 days', now_ts - interval '3 days' + interval '600s', 'chuan-bi')
    returning attempt_id into att_id;

    insert into quiz_answers (attempt_id, question_id, chosen_option, is_correct, error_code, answer_time_sec) values
      (att_id, 'C1-B2-M1-Q01', 'B', false, 'E-CT-01', 80),
      (att_id, 'C1-B2-M1-Q02', 'B', false, 'E-CT-03', 90),
      (att_id, 'C1-B2-M1-Q03', 'B', false, 'E-CT-01', 110),
      (att_id, 'C1-B2-M1-Q04', 'B', false, 'E-CT-01', 100),
      (att_id, 'C1-B2-M1-Q05', 'A', true,  null, 120);
  end loop;

  -- 9. BÀI VẬN DỤNG SAU GIỜ HỌC (POST-TEST CHO PHÉP THỬ T6)
  -- Cho 13 em đã học vi bài học bổ trợ làm lại để chứng minh hiệu quả can thiệp
  foreach i in array array[11,14,17,20,24,28,29,32,33,34,38] loop
    declare
      v_pre numeric;
      v_post numeric;
    begin
      select score into v_pre from quiz_attempts
        where student_id = ma_hs_arr[i] and ku_id = 'C1-B2-M2' and kind = 'chuan-bi' limit 1;
      v_post := least(10.0, v_pre + 2.5);

      insert into quiz_attempts (student_id, ku_id, attempt_no, score, time_on_task_sec, started_at, submitted_at, kind)
      values (ma_hs_arr[i], 'C1-B2-M2', 2, v_post, 520, now_ts - interval '2 hours', now_ts - interval '2 hours' + interval '520s', 'van-dung')
      returning attempt_id into att_id;

      insert into quiz_answers (attempt_id, question_id, chosen_option, is_correct, error_code, answer_time_sec) values
        (att_id, 'C1-B2-M2-Q01', 'A', true, null, 50),
        (att_id, 'C1-B2-M2-Q02', 'A', true, null, 70),
        (att_id, 'C1-B2-M2-Q03', 'A', true, null, 80),
        (att_id, 'C1-B2-M2-Q04', 'A', true, null, 85),
        (att_id, 'C1-B2-M2-Q05', 'A', true, null, 110);
    end;
  end loop;

  -- 10. NẠP CÁC KHUYẾN NGHỊ QUY TẮC (RECOMMENDATIONS: R01, R02, R03, R04, R05, R06)
  -- 10.1. R06 (8 trợ giảng nhí)
  for i in 1..8 loop
    insert into recommendations (student_id, ku_id, trigger_rule, diagnosis, action, created_at, accepted)
    values (
      ma_hs_arr[i], 'C1-B2-M2', 'R06',
      'Đã làm chủ quy tắc dấu ngoặc (điểm >= 9.0). Đề xuất làm hạt nhân hỗ trợ nhóm.',
      'Giao nhiệm vụ trưởng nhóm tương trợ Jigsaw trong tiết học trên lớp.',
      now_ts - interval '17 hours', true
    );
  end loop;

  -- 10.2. R03 (Quan niệm sai dai dẳng - hs028, hs033)
  insert into recommendations (student_id, ku_id, trigger_rule, diagnosis, action, recommended_content, created_at, accepted, pre_score, post_score)
  values
    ('hs028', 'C1-B2-M2', 'R03', 'Quan niệm sai lặp lại: Đặt dấu ngoặc có dấu trừ đằng trước không đổi dấu (E-DN-02)', 'Giao vi bài học sửa lỗi VBH-DN-02', 'VBH-DN-02', now_ts - interval '13 hours', true, 5.0, 8.0),
    ('hs033', 'C1-B2-M2', 'R03', 'Quan niệm sai lặp lại: Đặt dấu ngoặc có dấu trừ đằng trước không đổi dấu (E-DN-02)', 'Giao vi bài học sửa lỗi VBH-DN-02', 'VBH-DN-02', now_ts - interval '13 hours', true, 4.0, 7.0);

  -- 10.3. R05 (Hổng tiên quyết C1-B2-M1 - 5 em)
  for v_hs in select unnest(array['hs029','hs032','hs034','hs035','hs036']) as id loop
    insert into recommendations (student_id, ku_id, trigger_rule, diagnosis, action, recommended_content, created_at, accepted, pre_score, post_score)
    values (
      v_hs.id, 'C1-B2-M2', 'R05',
      'Hổng kiến thức nền tiên quyết: Chưa thành thạo cộng trừ phân số khác mẫu (C1-B2-M1)',
      'Giao vi bài học ôn tập tiên quyết VBH-CT-01',
      'VBH-CT-01', now_ts - interval '12 hours', true, 4.0, 6.5
    );
  end loop;

  -- 10.4. R04 (Đoán mò - hs037)
  insert into recommendations (student_id, ku_id, trigger_rule, diagnosis, action, created_at, accepted, pre_score)
  values ('hs037', 'C1-B2-M2', 'R04', 'Làm bài trong 32 giây (dưới 1/3 thời gian chuẩn), điểm thấp (2.0/10). Nghi đoán mò.', 'Khoá làm lại tạm thời, yêu cầu xem lại video bài học trước khi mở khoá.', now_ts - interval '5 hours', true, 2.0);

  -- 10.5. R01 (Xem thụ động - hs038)
  insert into recommendations (student_id, ku_id, trigger_rule, diagnosis, action, recommended_content, created_at, accepted, pre_score, post_score)
  values ('hs038', 'C1-B2-M2', 'R01', 'Đã xem 100% thời lượng video bài học nhưng quiz chuẩn bị chỉ đạt 2.5/10. Xem thụ động.', 'Giao vi bài học chẩn đoán khái niệm VBH-DN-01', 'VBH-DN-01', now_ts - interval '6 hours', true, 2.5, 5.5);

  -- 10.6. R02 (Thuộc quy tắc nhưng chưa vận dụng thành thạo)
  for v_hs in select unnest(array['hs011','hs014','hs017','hs020','hs024']) as id loop
    insert into recommendations (student_id, ku_id, trigger_rule, diagnosis, action, created_at, accepted, pre_score, post_score)
    values (
      v_hs.id, 'C1-B2-M2', 'R02',
      'Nắm chắc quy tắc nhưng lúng túng khi gặp bài toán thực tế rút gọn biểu thức',
      'Gợi ý luyện tập thêm câu hỏi mức 3',
      now_ts - interval '10 hours', true, 7.0, 8.5
    );
  end loop;

  -- 11. NẠP CÁC SỰ KIỆN HỌC TẬP (LEARNING EVENTS CHO les_tong_hop)
  -- 11.1. Sự kiện xem video (video_active)
  for i in 1..38 loop
    declare
      v_sec int := case
        when i <= 8  then 480 + (i * 10)
        when i <= 26 then 420 + (i * 5)
        when i <= 36 then 360 + (i * 5)
        when i = 37  then 60  -- đoán mò
        when i = 38  then 480 -- thụ động
        else 0 end;
    begin
      insert into learning_events (student_id, ku_id, event_type, duration_active_sec, ts)
      values (ma_hs_arr[i], 'C1-B2-M2', 'video_active', v_sec, now_ts - interval '1 day');
    end;
  end loop;

  -- 11.2. Sự kiện nộp bài tập (assignment_submit)
  for i in 1..36 loop
    for d in 1..3 loop
      insert into learning_events (student_id, ku_id, event_type, ts)
      values (ma_hs_arr[i], 'C1-B2-M2', 'assignment_submit', now_ts - (d * interval '2 days'));
    end loop;
  end loop;

  -- 11.3. Sự kiện nhận gợi ý và tự giác làm lại (Kiên trì)
  for i in 9..36 loop
    insert into learning_events (student_id, ku_id, event_type, ts)
    values (ma_hs_arr[i], 'C1-B2-M2', 'feedback_with_hint', now_ts - interval '15 hours');

    if i % 2 = 1 or i between 27 and 36 then
      insert into learning_events (student_id, ku_id, event_type, ts)
      values (ma_hs_arr[i], 'C1-B2-M2', 'voluntary_retry', now_ts - interval '14 hours');
    end if;
  end loop;

  -- 12. NẠP NHẬT KÝ VI BÀI HỌC (CHO vi_bai_hoc_tong_hop)
  if to_regclass('public.micro_lesson_events') is not null then
    -- VBH-DN-02: 12 em mở, 10 em hoàn thành
    foreach i in array array[9,11,13,15,17,19,21,23,25,28,30,33] loop
      insert into micro_lesson_events (student_id, content_id, ku_id, kind, ts)
      values (ma_hs_arr[i], 'VBH-DN-02', 'C1-B2-M2', 'mo', now_ts - interval '10 hours');

      if i != 30 and i != 19 then
        insert into micro_lesson_events (student_id, content_id, ku_id, kind, so_cau_dung, so_cau, ts)
        values (ma_hs_arr[i], 'VBH-DN-02', 'C1-B2-M2', 'hoan-thanh', 2, 2, now_ts - interval '9 hours');
      end if;
    end loop;

    -- VBH-CT-01: 5 em mở, 5 em hoàn thành
    for v_hs in select unnest(array['hs029','hs032','hs034','hs035','hs036']) as id loop
      insert into micro_lesson_events (student_id, content_id, ku_id, kind, ts)
      values (v_hs.id, 'VBH-CT-01', 'C1-B2-M1', 'mo', now_ts - interval '11 hours');

      insert into micro_lesson_events (student_id, content_id, ku_id, kind, so_cau_dung, so_cau, ts)
      values (v_hs.id, 'VBH-CT-01', 'C1-B2-M1', 'hoan-thanh', 2, 2, now_ts - interval '10 hours');
    end loop;
  end if;

  raise notice '===========================================================================';
  raise notice 'NẠP THÀNH CÔNG 40 HỌC SINH MÔ PHỎNG VÀO LỚP %!', v_class_id;
  raise notice '  - 40 học sinh trong students (hs001 .. hs040)';
  raise notice '  - 560 dòng mastery_states (40 HS x 14 KU) cho Class Heatmap';
  raise notice '  - 36 lượt quiz chuẩn bị C1-B2-M2 (90%% chuẩn bị, TB: 7.08/10)';
  raise notice '  - Bản đồ lỗi: E-DN-02 (12 lượt), E-CT-01 (8 lượt), E-DN-01 (7 lượt)';
  raise notice '  - Cảnh báo: R06 (8 em), R05 (5 em), R04 (1 em), R01 (1 em)';
  raise notice '  - Đóng vòng can thiệp T6: 11 lượt làm bài vận dụng sau giờ học (Gain TB: +2.5đ)';
  raise notice '===========================================================================';
end $$;

-- ---------------------------------------------------------------------------
-- KIỂM TRA NHANH KẾT QUẢ SAU KHI NẠP
-- ---------------------------------------------------------------------------
select 'students'               as bang, count(*) as so_dong from students where student_id like 'hs%'
union all select 'mastery_states', count(*) from mastery_states where student_id like 'hs%'
union all select 'quiz_attempts',  count(*) from quiz_attempts where student_id like 'hs%'
union all select 'quiz_answers',   count(*) from quiz_answers qa join quiz_attempts q on q.attempt_id = qa.attempt_id where q.student_id like 'hs%'
union all select 'recommendations', count(*) from recommendations where student_id like 'hs%'
union all select 'learning_events', count(*) from learning_events where student_id like 'hs%';
