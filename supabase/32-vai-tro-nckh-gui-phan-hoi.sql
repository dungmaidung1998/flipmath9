-- =============================================================================
-- 32. CHO HAI HỌC SINH LÀM DỰ ÁN GỬI ĐƯỢC PHẢN HỒI GỢI Ý
--
-- Chạy SAU 26-phan-hoi-goi-y.sql và SAU 30-nhat-ky-nghien-cuu.sql.
--
-- VẤN ĐỀ. Tệp 26 đặt điều kiện ghi phản hồi là `p.role = 'hoc-sinh'`. Vai trò
-- mới `hoc-sinh-nckh` (hai em thực hiện dự án) vì thế bị chặn: các em bấm gửi
-- phản hồi thì bị RLS từ chối mà không hiểu vì sao. Đúng lúc cần các em thử
-- nghiêm túc từng chức năng để tìm lỗi trước khi giao cho lớp thật.
--
-- CÁCH SỬA. Đổi điều kiện thành "một trong hai vai trò học sinh". Không nới
-- lỏng gì khác: khoá vẫn là `student_id` của chính người đang đăng nhập, nên
-- không ai ghi hộ được cho người khác.
--
-- CHẠY LẠI NHIỀU LẦN KHÔNG SAO. Tệp chỉ tạo lại một chính sách.
-- =============================================================================

do $$
begin
  if to_regclass('public.hint_feedback') is null then
    raise exception E'\n\n>>> DỪNG LẠI: chưa có bảng hint_feedback. Chạy 26-phan-hoi-goi-y.sql trước. <<<\n';
  end if;
  if not exists (
    select 1 from pg_constraint
     where conrelid = 'public.profiles'::regclass
       and pg_get_constraintdef(oid) like '%hoc-sinh-nckh%'
  ) then
    raise exception E'\n\n>>> DỪNG LẠI: vai trò hoc-sinh-nckh chưa được khai báo. Chạy 30-nhat-ky-nghien-cuu.sql trước. <<<\n';
  end if;
end $$;

drop policy if exists feedback_own_insert on public.hint_feedback;
create policy feedback_own_insert on public.hint_feedback
  for insert to authenticated
  with check (
    student_id = (
      select p.student_id from public.profiles p
       where p.id = auth.uid()
         and p.role in ('hoc-sinh', 'hoc-sinh-nckh')
    )
  );

-- -----------------------------------------------------------------------------
-- KIỂM TRA
-- -----------------------------------------------------------------------------
select case
  when pg_get_expr(polwithcheck, polrelid) like '%hoc-sinh-nckh%'
  then '✅ Hai em làm dự án gửi được phản hồi gợi ý'
  else '❌ Chính sách chưa nhận vai trò hoc-sinh-nckh'
end as ket_qua
from pg_policy
where polrelid = 'public.hint_feedback'::regclass
  and polname = 'feedback_own_insert';
