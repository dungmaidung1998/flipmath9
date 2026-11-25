-- ===========================================================================
-- BỔ SUNG CHO PHA SAU GIỜ HỌC — chạy sau 01-schema.sql và 02-seed.sql
--
-- Mục đích: phân biệt bài kiểm tra CHUẨN BỊ (trước giờ học) với bài VẬN DỤNG
-- (sau giờ học). Nhờ đó:
--   * quy tắc R02 mới hoạt động được (thuộc quy tắc nhưng chưa vận dụng được)
--   * cột post_score trong bảng recommendations mới có số để điền
--   * phép thử T6 — "gợi ý có tác dụng hay không" — mới kiểm chứng được
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- KIỂM TRA ĐIỀU KIỆN TRƯỚC
-- Khối này không sửa gì cả. Nó chỉ dừng lại với một câu tiếng Việt đọc được nếu
-- tệp này được chạy trước tệp mà nó phụ thuộc vào — thay cho thông báo kiểu
-- `relation "..." does not exist` không nói cho ai biết phải làm gì.
-- ---------------------------------------------------------------------------
do $$
begin
  if to_regclass('public.knowledge_units') is null then
    raise exception E'\n\n>>> DỪNG LẠI: Phải chạy 01-schema.sql TRƯỚC tệp này. Cơ sở dữ liệu chưa có bảng nền nào. <<<\n';
  end if;
end $$;


alter table quiz_attempts
  add column if not exists kind text not null default 'chuan-bi'
  check (kind in ('chuan-bi', 'van-dung'));

create index if not exists idx_attempts_kind on quiz_attempts(student_id, ku_id, kind);

-- Truy vấn kiểm chứng hiệu quả từng quy tắc (phép thử T6).
-- Chạy sau khi đã có dữ liệu để trả lời: quy tắc nào thực sự giúp học sinh tiến bộ?
--
-- select trigger_rule,
--        count(*)                                       as so_luot_goi_y,
--        count(post_score)                              as so_luot_da_lam_lai,
--        round(avg(post_score - pre_score)::numeric, 2) as muc_tang_trung_binh
-- from recommendations
-- where post_score is not null
-- group by trigger_rule
-- order by muc_tang_trung_binh desc;
