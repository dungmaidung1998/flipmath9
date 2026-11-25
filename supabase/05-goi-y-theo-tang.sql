-- ===========================================================================
-- TRỢ GIẢNG: GỢI Ý THEO TẦNG — chạy sau 04-gamification-va-do-luong.sql
--
-- Gợi ý neo vào MÃ LỖI, không neo vào câu hỏi, nên dùng lại được cho mọi câu
-- cùng một quan niệm sai. Ba tầng, không có tầng thứ tư chứa lời giải.
--
-- Bảng này CHỈ giáo viên đọc trực tiếp. Học sinh nhận gợi ý qua API, và chỉ
-- nhận được gợi ý của đúng mã lỗi mà chính em đó vừa mắc — không liệt kê được
-- toàn bộ bảng để suy ra đáp án.
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


create table if not exists error_hints (
  error_code text references error_dictionary(error_code) on delete cascade,
  tier       int  not null check (tier between 1 and 3),
  hint_text  text not null,
  primary key (error_code, tier)
);

alter table error_hints enable row level security;

drop policy if exists "gv doc goi y" on error_hints;
create policy "gv doc goi y" on error_hints for select to authenticated using (is_teacher());

-- Nhật ký mở gợi ý — vừa để chống lạm dụng, vừa là dữ liệu nghiên cứu:
-- ĐỘ SÂU gợi ý học sinh cần dùng là một tín hiệu đo được.
create table if not exists hint_requests (
  req_id      bigserial primary key,
  student_id  text references students(student_id) on delete cascade,
  question_id text references questions(question_id),
  error_code  text references error_dictionary(error_code),
  tier        int not null check (tier between 1 and 3),
  created_at  timestamptz not null default now()
);
create index if not exists idx_hint_student on hint_requests(student_id, created_at desc);

alter table hint_requests enable row level security;
drop policy if exists "doc nhat ky goi y" on hint_requests;
create policy "doc nhat ky goi y" on hint_requests for select to authenticated
  using (student_id = my_student_id() or teaches_student(student_id));

-- ------------------------------------------------------- nội dung ba tầng
--
-- Nội dung gợi ý KHÔNG nằm ở đây nữa. Toàn bộ 23 mã lỗi × 3 tầng của Chương I
-- được nạp ở 07-noi-dung-chuong-1.sql, sinh tự động từ dfle-engine/src/chuong1.js
-- cùng một lượt với từ điển mã lỗi.
--
-- Lý do tách ra: gợi ý phải trỏ tới một mã lỗi có thật trong error_dictionary.
-- Để ở đây thì tệp 05 luôn chạy TRƯỚC tệp nạp từ điển, và mọi lần cài mới đều
-- dừng lại ở lỗi khoá ngoại.
