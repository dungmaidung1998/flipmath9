-- =============================================================================
-- 25 · LỚP MÔ PHỎNG RIÊNG, TÁCH KHỎI LỚP THỰC NGHIỆM
-- -----------------------------------------------------------------------------
-- CHẠY TỆP NÀY TRƯỚC tệp 22.
--
-- VÌ SAO
-- Bộ 40 học sinh mô phỏng là thứ cần thiết: bảng điều khiển giáo viên chỉ xem
-- được khi có dữ liệu đủ dày, mà lớp thật mới chạy được vài ngày. Vấn đề chỉ
-- nằm ở CHỖ ĐẶT: bản đầu của tệp 22 nạp 40 em đó thẳng vào lớp 7A1 với trạng
-- thái đã đồng thuận, tức là vào đúng lớp thực nghiệm thật. Khi đó chúng lọt
-- vào tệp xuất dữ liệu nghiên cứu, vào trang phân tích, và lẫn với học sinh
-- thật trên bảng điều khiển lớp.
--
-- Tệp này tạo một lớp riêng mang nhóm 'DEMO'. Mọi trang lọc theo nhóm TN/DC
-- hoặc theo đồng thuận đều tự bỏ qua lớp đó, còn giáo viên vẫn mở được lớp
-- DEMO để xem bảng điều khiển đầy đủ và chụp ảnh cho hồ sơ.
--
-- Tệp cũng DỌN LẠI nếu bản cũ đã từng chạy: chuyển các mã hs0xx về lớp DEMO và
-- trả số tiết kế hoạch của lớp thật về đúng giá trị.
--
-- Chạy lại nhiều lần vẫn an toàn.
-- =============================================================================

do $$
declare
  ma_lop_demo    text := 'DEMO';
  ma_hien_thi    text := 'DEMO-7A1';
  so_tiet_that   int  := 4;     -- số tiết/tuần tệp 19 đã khai cho lớp thật
  v_teacher      uuid;
  v_ten_rang     text;
  v_chuyen       int;
  v_sua_tuan     int;
begin
  ---------------------------------------------------------------------------
  -- 1. Cho phép nhóm 'DEMO' bên cạnh 'TN' và 'DC'
  --    Tên ràng buộc do Postgres tự đặt nên tra theo bảng hệ thống, không đoán.
  ---------------------------------------------------------------------------
  select conname into v_ten_rang
    from pg_constraint
   where conrelid = 'public.classes'::regclass
     and contype = 'c'
     and pg_get_constraintdef(oid) ilike '%arm%';

  if v_ten_rang is not null then
    execute format('alter table public.classes drop constraint %I', v_ten_rang);
  end if;
  alter table public.classes
    add constraint classes_arm_check check (arm in ('TN','DC','DEMO'));
  raise notice 'Nhóm lớp hợp lệ: TN, DC, DEMO';

  ---------------------------------------------------------------------------
  -- 2. Tạo lớp mô phỏng, gắn vào tài khoản giáo viên đang có
  ---------------------------------------------------------------------------
  select teacher_id into v_teacher from classes where arm = 'TN' and teacher_id is not null limit 1;
  if v_teacher is null then
    select id into v_teacher from profiles where role = 'giao-vien' limit 1;
  end if;

  insert into classes (class_id, class_code, grade, arm, teacher_id)
       values (ma_lop_demo, ma_hien_thi, 7, 'DEMO', v_teacher)
  on conflict (class_id) do update
       set class_code = excluded.class_code,
           arm        = 'DEMO',
           teacher_id = coalesce(excluded.teacher_id, classes.teacher_id);

  ---------------------------------------------------------------------------
  -- 3. Dọn: chuyển mọi học sinh mô phỏng đang nằm trong lớp thật về lớp DEMO,
  --    bỏ trạng thái đồng thuận và đổi tên hiển thị cho khỏi giống người thật.
  ---------------------------------------------------------------------------
  update students
     set class_id       = ma_lop_demo,
         consent_status = 'chua',
         display_name   = 'Học sinh mô phỏng ' || right(student_id, 3)
   where student_id like 'hs0%'
     and (class_id is distinct from ma_lop_demo
          or consent_status = 'dong-y'
          or display_name not like 'Học sinh mô phỏng%');
  get diagnostics v_chuyen = row_count;
  if v_chuyen > 0 then
    raise notice 'Đã chuyển % học sinh mô phỏng về lớp DEMO và bỏ trạng thái đồng thuận.', v_chuyen;
  end if;

  ---------------------------------------------------------------------------
  -- 4. Trả số tiết kế hoạch của LỚP THẬT về đúng giá trị.
  --    Bản cũ của tệp 22 ghi đè cột này thành 3 tiết/tuần cho chính lớp nó
  --    nạp vào. Số tiết kế hoạch là mẫu số của độ trung thực triển khai, sai
  --    một tiết là sai cả tỉ lệ.
  ---------------------------------------------------------------------------
  update week_plan w
     set so_tiet_ke_hoach = so_tiet_that
    from classes c
   where c.class_id = w.class_id
     and c.arm in ('TN','DC')
     and w.so_tiet_ke_hoach <> so_tiet_that;
  get diagnostics v_sua_tuan = row_count;
  if v_sua_tuan > 0 then
    raise notice 'Đã trả % dòng week_plan của lớp thật về % tiết/tuần.', v_sua_tuan, so_tiet_that;
  end if;
end $$;

---------------------------------------------------------------------------
-- KIỂM TRA SAU KHI CHẠY
---------------------------------------------------------------------------
select c.class_code as lop, c.arm as nhom,
       count(s.student_id) filter (where s.student_id like 'hs0%')     as mo_phong,
       count(s.student_id) filter (where s.student_id not like 'hs0%') as that,
       case when c.arm in ('TN','DC')
                 and count(s.student_id) filter (where s.student_id like 'hs0%') > 0
            then '❌ vẫn còn lẫn' else '✅' end as ket_luan
  from classes c left join students s on s.class_id = c.class_id
 group by c.class_code, c.arm order by c.class_code;
