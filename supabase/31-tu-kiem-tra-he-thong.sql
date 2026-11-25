-- =============================================================================
-- 27 · HÀM TỰ KIỂM TRA HỆ THỐNG
-- -----------------------------------------------------------------------------
-- Gom mọi phép kiểm tra rải rác ở các tệp 00, 20, 24 vào một hàm, để trang
-- /gv/tu-kiem-tra gọi một lần là ra cả bảng. Mở trang, chụp màn hình — đó là
-- bằng chứng "nguyên mẫu đã kiểm tra trong nhiều điều kiện" cho hồ sơ kỹ thuật,
-- và là cách nhanh nhất để biết hệ thống có đang hỏng chỗ nào không.
--
-- Hàm CHỈ ĐỌC. Không sửa gì. Chạy lúc nào cũng được, kể cả giữa đợt thực nghiệm.
--
-- Chạy lại nhiều lần vẫn an toàn.
-- =============================================================================

create or replace function public.kiem_tra_he_thong()
returns table (nhom text, muc text, trang_thai text, chi_tiet text)
language plpgsql security definer set search_path = public as $$
declare
  v int;
  v2 int;
begin
  ---------------------------------------------------------------- cài đặt
  return query
  select 'Cài đặt', 'Bảng và khung nhìn nền',
         case when count(*) filter (where thieu) = 0 then 'ok' else 'loi' end,
         case when count(*) filter (where thieu) = 0
              then 'Đủ ' || count(*) || ' đối tượng'
              else 'Thiếu: ' || string_agg(ten, ', ') filter (where thieu) end
    from (
      select t.ten, to_regclass('public.' || t.ten) is null as thieu
        from unnest(array['students','classes','questions','quiz_attempts','quiz_answers',
                          'mastery_states','mastery_history','recommendations','week_plan',
                          'les_tong_hop','nhat_ky_nghien_cuu']) as t(ten)
    ) x;

  return query
  select 'Cài đặt', 'Hàm tính mức làm chủ v2',
         case when to_regprocedure('public.refresh_mastery_v2(text,text)') is null then 'loi' else 'ok' end,
         case when to_regprocedure('public.refresh_mastery_v2(text,text)') is null
              then 'Thiếu — chạy 18-danh-gia-va-mastery.sql'
              else 'Có' end;

  ---------------------------------------------------------------- phân quyền
  return query
  select 'Phân quyền', 'Học sinh không đọc được cột đáp án',
         case when has_column_privilege('authenticated', 'public.questions', 'correct_option', 'select')
              then 'loi' else 'ok' end,
         case when has_column_privilege('authenticated', 'public.questions', 'correct_option', 'select')
              then 'CHƯA VÁ — chạy 20-va-lo-hong-phan-quyen.sql'
              else 'Đã vá' end;

  select count(*) into v
    from pg_class c join pg_namespace n on n.oid = c.relnamespace
   where n.nspname = 'public' and c.relkind = 'r' and not c.relrowsecurity;
  return query
  select 'Phân quyền', 'Mọi bảng đã bật RLS',
         case when v = 0 then 'ok' else 'loi' end,
         case when v = 0 then 'Tất cả đã bật' else v || ' bảng chưa bật RLS' end;

  ---------------------------------------------------------------- dữ liệu mô phỏng
  select count(*) into v
    from students s join classes c using (class_id)
   where s.student_id like 'hs0%' and c.arm in ('TN', 'DC');
  return query
  select 'Dữ liệu', 'Không có dữ liệu mô phỏng trong lớp thật',
         case when v = 0 then 'ok' else 'loi' end,
         case when v = 0 then 'Sạch'
              else v || ' học sinh mô phỏng đang nằm trong lớp TN/DC — chạy 25-chuan-bi-lop-demo.sql' end;

  ---------------------------------------------------------------- kế hoạch tuần
  select count(*) into v
    from week_plan w join classes c using (class_id)
   where c.arm in ('TN', 'DC') and w.so_tiet_ke_hoach <> 4;
  return query
  select 'Dữ liệu', 'Số tiết kế hoạch của lớp thật',
         case when v = 0 then 'ok' else 'canh_bao' end,
         case when v = 0 then 'Đúng 4 tiết/tuần'
              else v || ' tuần khác 4 tiết — kiểm tra lại, độ trung thực tính theo cột này' end;

  ---------------------------------------------------------------- ngân hàng câu hỏi
  select count(*) into v
    from knowledge_units k
   where (select count(*) from questions q where q.ku_id = k.ku_id and q.level = 4) < 2;
  return query
  select 'Ngân hàng câu hỏi', 'Đơn vị đạt được mức làm chủ 3',
         case when v = 0 then 'ok' else 'canh_bao' end,
         case when v = 0 then 'Mọi đơn vị đều có từ 2 câu mức 4'
              else v || ' đơn vị có dưới 2 câu mức 4 → KHÔNG đạt được mức 3. Xem 21-cau-muc-4-bo-sung-KHUNG.sql' end;

  select count(*) into v from questions q
   where (select count(*) from question_options o where o.question_id = q.question_id) < 4;
  return query
  select 'Ngân hàng câu hỏi', 'Mỗi câu đủ 4 phương án',
         case when v = 0 then 'ok' else 'loi' end,
         case when v = 0 then 'Đủ' else v || ' câu thiếu phương án' end;

  select count(*) into v from questions q
   where not exists (select 1 from question_options o
                      where o.question_id = q.question_id and o.option_key = q.correct_option);
  return query
  select 'Ngân hàng câu hỏi', 'Đáp án đúng có trong danh sách phương án',
         case when v = 0 then 'ok' else 'loi' end,
         case when v = 0 then 'Khớp' else v || ' câu có đáp án không nằm trong phương án nào' end;

  ---------------------------------------------------------------- học liệu
  select count(*) into v from knowledge_units k
   where coalesce(k.co_video, true)
     and not exists (select 1 from contents c
                      where c.ku_id = k.ku_id and c.kind = 'video'
                        and coalesce(c.url, '') <> '' and coalesce(c.duration_sec, 0) > 0);
  return query
  select 'Học liệu', 'Video đã gắn link và có thời lượng',
         case when v = 0 then 'ok' else 'loi' end,
         case when v = 0 then 'Đủ'
              else v || ' mục thiếu link hoặc thiếu thời lượng → R01 và R09 không kích hoạt được' end;

  ---------------------------------------------------------------- đồng thuận
  select count(*), count(*) filter (where s.consent_status = 'dong-y') into v, v2
    from students s join classes c using (class_id) where c.arm in ('TN', 'DC');
  return query
  select 'Đợt thực nghiệm', 'Học sinh đã đồng thuận',
         case when v = 0 then 'canh_bao' when v2 = v then 'ok' else 'canh_bao' end,
         v2 || '/' || v || ' học sinh lớp thật đã đồng thuận'
         || case when v2 < v then ' — số còn lại không ra tệp xuất dữ liệu' else '' end;

  ---------------------------------------------------------------- nhật ký nghiên cứu
  if to_regclass('public.nhat_ky_nghien_cuu') is not null then
    select count(*) into v from nhat_ky_nghien_cuu;
    select count(*) into v2 from nhat_ky_nghien_cuu where ghi_luc > now() - interval '7 days';
    return query
    select 'Nhật ký nghiên cứu', 'Có ghi đều không',
           case when v = 0 then 'loi' when v2 = 0 then 'canh_bao' else 'ok' end,
           v || ' mục, ' || v2 || ' mục trong 7 ngày gần nhất'
           || case when v2 = 0 then ' — một tuần chưa ghi mục nào' else '' end;
  end if;
end $$;

revoke all on function public.kiem_tra_he_thong() from public, anon, authenticated;

-- -----------------------------------------------------------------------------
-- Xem thử ngay
-- -----------------------------------------------------------------------------
select * from public.kiem_tra_he_thong();
