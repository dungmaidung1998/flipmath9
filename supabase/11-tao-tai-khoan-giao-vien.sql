-- ===========================================================================
-- DFLE-M7 · GẮN TÀI KHOẢN GIÁO VIÊN VỚI LỚP
-- Chạy SAU 01-schema.sql. Chạy lại nhiều lần được, không hỏng gì.
--
-- TRƯỚC KHI CHẠY TỆP NÀY, phải tạo tài khoản trong giao diện Supabase:
--   Authentication → Users → Add user → Create new user
--     · Email: email thật của thầy cô
--     · Password: tự đặt, nhớ lấy — đây là mật khẩu đăng nhập vào ứng dụng
--     · TÍCH Ô "Auto Confirm User"   ← quên ô này là không đăng nhập được
--   Tạo xong, bấm vào dòng tài khoản đó, chép chuỗi UUID (dạng
--   123e4567-e89b-12d3-a456-426614174000) rồi dán vào biến bên dưới.
--
-- CHỈ SỬA BA DÒNG TRONG KHUNG "SỬA Ở ĐÂY". Phần còn lại để nguyên.
-- ===========================================================================

do $$
declare
  ------------------------------------------------------------ SỬA Ở ĐÂY
  uuid_giao_vien text := 'DÁN-UUID-VÀO-ĐÂY';
  ma_lop         text := '9A1';                 -- mã lớp, học sinh sẽ gõ khi đăng nhập
  ten_giao_vien  text := 'Nguyễn Văn A';        -- tên hiển thị
  nhom_lop       text := 'TN';                  -- 'TN' = thực nghiệm · 'DC' = đối chứng
  ------------------------------------------------------------ hết phần sửa
  uid uuid;
begin
  -- Nhận diện bằng HÌNH DẠNG chuỗi, không so với chữ mẫu. So với chữ mẫu thì chỉ
  -- cần thầy cô lỡ bấm "Replace All" trong Notepad là câu kiểm tra này tự hỏng theo.
  if uuid_giao_vien !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
    raise exception E'\n\n>>> DỪNG LẠI: Chưa dán UUID, hoặc chuỗi vừa dán không đúng dạng. UUID trông như 123e4567-e89b-12d3-a456-426614174000 — 36 ký tự, 4 dấu gạch ngang. Lấy ở Authentication → Users, bấm vào tài khoản giáo viên. Đừng dán email vào đây. <<<\n';
  end if;
  uid := uuid_giao_vien::uuid;

  if not exists (select 1 from auth.users u where u.id = uid) then
    raise exception E'\n\n>>> DỪNG LẠI: Không có tài khoản nào mang UUID này. Kiểm tra lại: đã bấm Add user trong Authentication → Users chưa, và có chép nhầm UUID của tài khoản khác không? <<<\n';
  end if;

  if nhom_lop not in ('TN','DC') then
    raise exception E'\n\n>>> DỪNG LẠI: nhom_lop chỉ nhận TN (thực nghiệm) hoặc DC (đối chứng). <<<\n';
  end if;

  insert into classes (class_id, class_code, grade, arm, teacher_id)
       values (ma_lop, ma_lop, 9, nhom_lop, uid)
  on conflict (class_id) do update
       set teacher_id = excluded.teacher_id, arm = excluded.arm;

  insert into profiles (id, role, class_id, full_name)
       values (uid, 'giao-vien', ma_lop, ten_giao_vien)
  on conflict (id) do update
       set role = excluded.role, class_id = excluded.class_id, full_name = excluded.full_name;

  raise notice 'Xong. Tài khoản % đã là giáo viên của lớp % (nhóm %).', ten_giao_vien, ma_lop, nhom_lop;
end $$;

-- ------------------------------------------------------------- kiểm tra lại
-- Phải ra đúng một dòng, cột vai_tro là 'giao-vien'.
select p.full_name as ho_ten, p.role as vai_tro, c.class_id as lop, c.class_code as ma_lop,
       case c.arm when 'TN' then 'thực nghiệm' else 'đối chứng' end as nhom,
       u.email
  from profiles p
  join auth.users u on u.id = p.id
  left join classes c on c.teacher_id = p.id
 where p.role = 'giao-vien';

-- ===========================================================================
-- CÓ LỚP ĐỐI CHỨNG THÌ CHẠY LẠI TỆP NÀY LẦN NỮA, đổi ma_lop thành '7A2' và
-- nhom_lop thành 'DC'. Cùng một tài khoản giáo viên dạy được nhiều lớp.
--
-- HỌC SINH KHÔNG TẠO Ở ĐÂY. Tạo bằng trang "Tài khoản học sinh" trong ứng dụng,
-- và KHÔNG tạo tài khoản học sinh thật trước khi Hội đồng thẩm định duyệt Phiếu 4.
-- ===========================================================================
