-- =============================================================================
-- 35 · MATHMIND AI — VÒNG QUYẾT ĐỊNH CỦA GIÁO VIÊN
-- =============================================================================
-- Chạy SAU các tệp 01–34. Chạy lại nhiều lần không lỗi.
--
-- Năm bảng, tất cả có tiền tố mm_ để không đụng bảng nghiên cứu của dự án KHKT:
--   mm_activities          ngân hàng hoạt động dạy học (giáo viên soạn, duyệt)
--   mm_lesson_sessions     mỗi lần giáo viên chuẩn bị một tiết; lưu nguyên chẩn đoán
--   mm_plan_options        3 phương án hệ thống sinh ra — lưu nguyên, KHÔNG sửa được
--   mm_teacher_decisions   giáo viên chọn / sửa / bỏ từng phương án, lý do, điểm hữu ích
--   mm_teacher_prediagnosis  nhận định độc lập của giáo viên TRƯỚC khi xem hệ thống (NT1)
--   mm_exit_tickets        phiếu cuối tiết: em còn mắc lỗi mục tiêu không (NT6)
--
-- Nguyên tắc: phương án gốc và quyết định là dữ liệu nghiệm thu, nên chỉ GHI THÊM.
-- Không có chính sách update/delete cho người dùng — sửa được thì tỉ lệ chấp nhận
-- mất giá trị làm bằng chứng.
-- =============================================================================

-- ------------------------------------------------------------ 1. Ngân hàng hoạt động
create table if not exists mm_activities (
  activity_id   text primary key,
  ten           text not null,
  error_codes   text[] not null default '{}',
  nhom          text[] not null default '{}',
  hinh_thuc     text not null check (hinh_thuc in ('ca-lop','nhom-dong-chat','jigsaw','ca-nhan','tram')),
  muc_nhan_thuc int  not null check (muc_nhan_thuc between 1 and 4),
  phut_min      int  not null check (phut_min between 1 and 45),
  phut_max      int  not null check (phut_max between 1 and 45),
  mo_ta         text not null,
  hoc_lieu      text,
  trang_thai    text not null default 'nhap' check (trang_thai in ('nhap','da-duyet','an')),
  nguon         text,
  tac_gia       uuid references auth.users(id),
  updated_at    timestamptz not null default now(),
  check (phut_min <= phut_max)
);

alter table mm_activities enable row level security;
drop policy if exists "gv doc hoat dong" on mm_activities;
create policy "gv doc hoat dong" on mm_activities for select to authenticated using (public.is_teacher());
drop policy if exists "gv them hoat dong" on mm_activities;
create policy "gv them hoat dong" on mm_activities for insert to authenticated with check (public.is_teacher());
drop policy if exists "gv sua hoat dong" on mm_activities;
create policy "gv sua hoat dong" on mm_activities for update to authenticated
  using (public.is_teacher()) with check (public.is_teacher());

-- ------------------------------------------------------------ 2. Phiên chuẩn bị tiết
create table if not exists mm_lesson_sessions (
  session_id  uuid primary key default gen_random_uuid(),
  class_id    text not null references classes(class_id) on delete cascade,
  ku_id       text not null references knowledge_units(ku_id),
  teacher_id  uuid not null default auth.uid() references auth.users(id),
  che_do      text not null default 'tiet-that' check (che_do in ('tiet-that','thu-nghiem-a')),
  phien_ban   text not null,                 -- phiên bản bộ máy đề xuất
  chan_doan   jsonb not null,                -- kết quả diagnoseClass, lưu nguyên
  started_at  timestamptz not null default now()
);
create index if not exists idx_mm_sessions on mm_lesson_sessions(class_id, ku_id, started_at desc);

alter table mm_lesson_sessions enable row level security;
drop policy if exists "gv doc phien" on mm_lesson_sessions;
create policy "gv doc phien" on mm_lesson_sessions for select to authenticated
  using (public.teaches_class(class_id));
drop policy if exists "gv tao phien" on mm_lesson_sessions;
create policy "gv tao phien" on mm_lesson_sessions for insert to authenticated
  with check (public.teaches_class(class_id) and teacher_id = auth.uid());

create or replace function public.owns_mm_session(p_session uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from mm_lesson_sessions s
    where s.session_id = p_session and s.teacher_id = auth.uid() and public.teaches_class(s.class_id)
  )
$$;

-- ------------------------------------------------------------ 3. Phương án gốc
create table if not exists mm_plan_options (
  option_id  uuid primary key default gen_random_uuid(),
  session_id uuid not null references mm_lesson_sessions(session_id) on delete cascade,
  rank       int  not null check (rank between 1 and 9),
  strategy   text not null,
  diem       numeric,
  payload    jsonb not null,
  unique (session_id, rank)
);
alter table mm_plan_options enable row level security;
drop policy if exists "gv doc phuong an" on mm_plan_options;
create policy "gv doc phuong an" on mm_plan_options for select to authenticated
  using (public.owns_mm_session(session_id));
drop policy if exists "gv ghi phuong an" on mm_plan_options;
create policy "gv ghi phuong an" on mm_plan_options for insert to authenticated
  with check (public.owns_mm_session(session_id));

-- ------------------------------------------------------------ 4. Quyết định của giáo viên
create table if not exists mm_teacher_decisions (
  decision_id   bigserial primary key,
  session_id    uuid not null references mm_lesson_sessions(session_id) on delete cascade,
  option_id     uuid not null references mm_plan_options(option_id) on delete cascade,
  hanh_dong     text not null check (hanh_dong in ('chon','sua','bo')),
  payload_sua   jsonb,                       -- bản giáo viên đã sửa (chỉ khi hanh_dong = 'sua')
  truong_da_sua text[] not null default '{}',
  ly_do         text,
  huu_ich       int check (huu_ich between 1 and 5),
  prep_seconds  int check (prep_seconds >= 0),            -- thời gian chuẩn bị CÓ hệ thống (kế hoạch B)
  prep_seconds_a int check (prep_seconds_a >= 0),         -- Thử nghiệm A: thời gian lập kế hoạch A KHÔNG có hệ thống
  created_at    timestamptz not null default now(),
  unique (session_id, option_id)
);
-- Mỗi phiên chỉ có MỘT phương án được dùng (chọn nguyên hoặc chọn rồi sửa)
create unique index if not exists uq_mm_mot_lua_chon
  on mm_teacher_decisions(session_id) where hanh_dong in ('chon','sua');

alter table mm_teacher_decisions enable row level security;
drop policy if exists "gv doc quyet dinh" on mm_teacher_decisions;
create policy "gv doc quyet dinh" on mm_teacher_decisions for select to authenticated
  using (public.owns_mm_session(session_id));
drop policy if exists "gv ghi quyet dinh" on mm_teacher_decisions;
create policy "gv ghi quyet dinh" on mm_teacher_decisions for insert to authenticated
  with check (public.owns_mm_session(session_id));

-- ------------------------------------------------------------ 5. Nhận định độc lập (NT1)
create table if not exists mm_teacher_prediagnosis (
  session_id  uuid not null references mm_lesson_sessions(session_id) on delete cascade,
  student_id  text not null references students(student_id),
  nhom_gv     text not null,                 -- 'loi:E-CT-01', 'chua-chuan-bi', 'san-sang', ...
  ghi_chu     text,
  created_at  timestamptz not null default now(),
  primary key (session_id, student_id)
);
alter table mm_teacher_prediagnosis enable row level security;
drop policy if exists "gv doc nhan dinh" on mm_teacher_prediagnosis;
create policy "gv doc nhan dinh" on mm_teacher_prediagnosis for select to authenticated
  using (public.owns_mm_session(session_id));
drop policy if exists "gv ghi nhan dinh" on mm_teacher_prediagnosis;
create policy "gv ghi nhan dinh" on mm_teacher_prediagnosis for insert to authenticated
  with check (public.owns_mm_session(session_id) and public.teaches_student(student_id));

-- ------------------------------------------------------------ 6. Phiếu cuối tiết (NT6)
create table if not exists mm_exit_tickets (
  session_id  uuid not null references mm_lesson_sessions(session_id) on delete cascade,
  student_id  text not null references students(student_id),
  error_code  text not null,
  con_mac     boolean not null,
  created_at  timestamptz not null default now(),
  primary key (session_id, student_id, error_code)
);
alter table mm_exit_tickets enable row level security;
drop policy if exists "gv doc phieu cuoi tiet" on mm_exit_tickets;
create policy "gv doc phieu cuoi tiet" on mm_exit_tickets for select to authenticated
  using (public.owns_mm_session(session_id));
drop policy if exists "gv ghi phieu cuoi tiet" on mm_exit_tickets;
create policy "gv ghi phieu cuoi tiet" on mm_exit_tickets for insert to authenticated
  with check (public.owns_mm_session(session_id) and public.teaches_student(student_id));

-- ------------------------------------------------------------ 7. Học sinh không đọc được gì
revoke all on mm_activities, mm_lesson_sessions, mm_plan_options, mm_teacher_decisions,
  mm_teacher_prediagnosis, mm_exit_tickets from anon;
grant select, insert, update on mm_activities to authenticated;
grant select, insert on mm_lesson_sessions, mm_plan_options, mm_teacher_decisions,
  mm_teacher_prediagnosis, mm_exit_tickets to authenticated;
grant usage, select on sequence mm_teacher_decisions_decision_id_seq to authenticated;

-- ------------------------------------------------------------ 8. Nạp ngân hàng hoạt động nháp
-- Sinh từ dfle-engine/src/mathmind.js bằng: node cli/emit-mathmind.js
-- "on conflict do nothing": chạy lại KHÔNG đè lên hoạt động giáo viên đã sửa.
insert into mm_activities
  (activity_id, ten, error_codes, nhom, hinh_thuc, muc_nhan_thuc, phut_min, phut_max, mo_ta, hoc_lieu, trang_thai, nguon)
values
  ('HD-CHUNG-01', 'Bắt sâu tìm lỗi', array['*']::text[], array['loi']::text[], 'ca-lop', 2, 7, 10, 'Chiếu một lời giải sai lấy từ chính bài chuẩn bị của lớp (ẩn tên). Học sinh cá nhân tìm chỗ sai trong 2 phút, cặp đôi thống nhất, một em trình bày, một em phản biện. Giáo viên chỉ chốt sau khi lớp đã tự sửa.', 'Ảnh chụp 1–2 lời giải sai điển hình', 'nhap', 'Bản nháp do trợ lý AI soạn theo từ điển mã lỗi — giáo viên cần duyệt, sửa trước khi dùng'),
  ('HD-CHUNG-02', 'Phiếu luyện tập phân tầng 3 mức', array['*']::text[], array['loi', 'on-dinh', 'hong-nen']::text[], 'nhom-dong-chat', 2, 10, 20, 'Mỗi nhóm nhận phiếu đúng tầng của mình: Bồi dưỡng (sửa lỗi), Luyện tập (bài SGK), Thử thách (vận dụng). Em xong tầng mình được làm tiếp tầng trên.', 'Bộ phiếu học tập phân tầng của đơn vị kiến thức', 'nhap', 'Bản nháp do trợ lý AI soạn theo từ điển mã lỗi — giáo viên cần duyệt, sửa trước khi dùng'),
  ('HD-CHUNG-03', 'Nhắc lại cốt lõi 5 phút', array[]::text[], array['chua-chuan-bi']::text[], 'nhom-dong-chat', 1, 5, 8, 'Nhóm chưa xem bài ngồi gần bàn giáo viên, xem đoạn chốt của video (≤ 2 phút) rồi làm 2 câu nhận biết. Đúng cả 2 câu thì nhập vào nhóm luyện tập chung.', 'Đoạn chốt của video bài học, 2 câu mức 1', 'nhap', 'Bản nháp do trợ lý AI soạn theo từ điển mã lỗi — giáo viên cần duyệt, sửa trước khi dùng'),
  ('HD-CHUNG-04', 'Làm lại có giải thích', array[]::text[], array['doan-mo']::text[], 'ca-nhan', 2, 5, 8, 'Học sinh làm lại 3 câu của bài chuẩn bị, mỗi lựa chọn phải viết một dòng "vì sao". Giáo viên đi qua kiểm tra tại chỗ — dữ liệu đoán mò chưa đủ để kết luận em yếu hay không.', '3 câu của bài chuẩn bị, in trên giấy', 'nhap', 'Bản nháp do trợ lý AI soạn theo từ điển mã lỗi — giáo viên cần duyệt, sửa trước khi dùng'),
  ('HD-CHUNG-05', 'Bậc thang tiên quyết', array[]::text[], array['hong-nen']::text[], 'nhom-dong-chat', 1, 8, 12, 'Ba câu tăng dần lấy từ đơn vị kiến thức tiên quyết, rồi một câu nối sang bài hôm nay. Giáo viên hỗ trợ trực tiếp nhóm này trong 5 phút đầu.', '3 câu mức 1–2 của đơn vị tiên quyết', 'nhap', 'Bản nháp do trợ lý AI soạn theo từ điển mã lỗi — giáo viên cần duyệt, sửa trước khi dùng'),
  ('HD-CHUNG-06', 'Bài toán thực tiễn mở rộng', array[]::text[], array['san-sang']::text[], 'nhom-dong-chat', 4, 10, 15, 'Nhóm đã làm chủ giải một bài toán gắn thực tế (nhiệt độ, tài chính gia đình, đo lường), trình bày lời giải trên bảng phụ trong 2 phút cuối.', 'Một bài toán mức 4 có dữ kiện thực tế', 'nhap', 'Bản nháp do trợ lý AI soạn theo từ điển mã lỗi — giáo viên cần duyệt, sửa trước khi dùng'),
  ('HD-CHUNG-07', 'Trợ giảng nhí', array['*']::text[], array['san-sang', 'loi']::text[], 'jigsaw', 3, 12, 20, 'Nhóm hỗn hợp 4 em, mỗi nhóm một em đã làm chủ làm nhóm trưởng. Nhóm trưởng không giải hộ: chỉ được hỏi gợi mở và chỉ vào bước sai. Giáo viên phát thẻ "câu hỏi gợi mở" cho nhóm trưởng.', 'Thẻ câu hỏi gợi mở, phiếu bài tập chung', 'nhap', 'Bản nháp do trợ lý AI soạn theo từ điển mã lỗi — giáo viên cần duyệt, sửa trước khi dùng'),
  ('HD-HT-01', 'Phân loại thẻ số: viết được dạng a/b không?', array['E-HT-01', 'E-TT-02']::text[], array['loi']::text[], 'nhom-dong-chat', 1, 8, 10, 'Mỗi nhóm nhận 12 thẻ số (−5; 0,75; 3/4; 0; −2 1/3 …), xếp vào hai cột "viết được dạng a/b" và "không viết được", ghi cách viết lên mặt sau thẻ.', 'Bộ 12 thẻ số', 'nhap', 'Bản nháp do trợ lý AI soạn theo từ điển mã lỗi — giáo viên cần duyệt, sửa trước khi dùng'),
  ('HD-HT-02', 'Gấp trục số: đối xứng qua điểm O', array['E-HT-02', 'E-HT-03', 'E-TT-01']::text[], array['loi']::text[], 'nhom-dong-chat', 2, 8, 12, 'Học sinh vẽ trục số trên băng giấy, đánh dấu một số dương rồi gấp đôi tại O để tìm số đối. So sánh với số nghịch đảo của cùng số đó để thấy hai khái niệm khác nhau.', 'Băng giấy, thước', 'nhap', 'Bản nháp do trợ lý AI soạn theo từ điển mã lỗi — giáo viên cần duyệt, sửa trước khi dùng'),
  ('HD-TT-01', 'Xếp hàng nhiệt độ âm', array['E-TT-01', 'E-TT-02']::text[], array['loi']::text[], 'ca-lop', 2, 7, 10, '6 học sinh cầm 6 thẻ nhiệt độ (−3/4 °C, −1/2 °C, …) đứng xếp theo thứ tự từ lạnh nhất đến ấm nhất. Cả lớp phát hiện chỗ đứng sai và giải thích bằng trục số.', '6 thẻ nhiệt độ cỡ lớn', 'nhap', 'Bản nháp do trợ lý AI soạn theo từ điển mã lỗi — giáo viên cần duyệt, sửa trước khi dùng'),
  ('HD-CT-01', 'Vì sao 1/2 + 1/3 không bằng 2/5', array['E-CT-01', 'E-CT-02', 'E-NC-03']::text[], array['loi']::text[], 'nhom-dong-chat', 2, 10, 12, 'Mỗi nhóm tô 1/2 và 1/3 của cùng một hình chữ nhật chia 6 ô, đếm số ô đã tô rồi so với 2/5. Sau đó tự viết quy tắc quy đồng bằng lời của nhóm.', 'Phiếu hình chữ nhật 6 ô và 10 ô', 'nhap', 'Bản nháp do trợ lý AI soạn theo từ điển mã lỗi — giáo viên cần duyệt, sửa trước khi dùng'),
  ('HD-CT-03', 'Cộng trái dấu bằng bước đi trên trục số', array['E-CT-03']::text[], array['loi']::text[], 'nhom-dong-chat', 2, 8, 10, 'Mỗi phép cộng là hai lần đi trên trục số: đi trái với số âm, đi phải với số dương. Nhóm ghi điểm dừng rồi đối chiếu với quy tắc "lấy hiệu hai giá trị tuyệt đối".', 'Trục số dán trên bàn', 'nhap', 'Bản nháp do trợ lý AI soạn theo từ điển mã lỗi — giáo viên cần duyệt, sửa trước khi dùng'),
  ('HD-DN-01', 'Thẻ "dấu trừ là nhân với −1"', array['E-DN-01', 'E-DN-02', 'E-CV-01']::text[], array['loi']::text[], 'nhom-dong-chat', 2, 8, 12, 'Mỗi số hạng trong ngoặc là một thẻ. Khi bỏ ngoặc có dấu trừ, học sinh lật từng thẻ (đổi dấu) — không thẻ nào được giữ nguyên. Làm ngược lại khi đặt ngoặc.', 'Thẻ hai mặt +/−', 'nhap', 'Bản nháp do trợ lý AI soạn theo từ điển mã lỗi — giáo viên cần duyệt, sửa trước khi dùng'),
  ('HD-NC-01', 'Chia là nhân với nghịch đảo số chia — thử lại bằng phép nhân', array['E-NC-01', 'E-NC-02']::text[], array['loi']::text[], 'nhom-dong-chat', 2, 8, 10, 'Nhóm tính 4 phép chia theo hai cách (cách đúng và cách sai thường gặp), rồi nhân kết quả với số chia để xem cách nào quay về số bị chia.', 'Phiếu 4 phép chia', 'nhap', 'Bản nháp do trợ lý AI soạn theo từ điển mã lỗi — giáo viên cần duyệt, sửa trước khi dùng'),
  ('HD-LT-01', 'Bảng dấu luỹ thừa: chẵn, lẻ và vị trí ngoặc', array['E-LT-01', 'E-LT-02', 'E-LT-03']::text[], array['loi']::text[], 'ca-lop', 2, 8, 10, 'Cả lớp điền bảng (−2)^n và −2^n với n = 1…4, tìm quy luật dấu. Học sinh tự phát biểu khi nào kết quả âm, khi nào dương.', 'Bảng điền chiếu trên màn hình', 'nhap', 'Bản nháp do trợ lý AI soạn theo từ điển mã lỗi — giáo viên cần duyệt, sửa trước khi dùng'),
  ('HD-LT-04', 'Viết dài ra rồi đếm', array['E-LT-04', 'E-LT-05', 'E-LT-06']::text[], array['loi']::text[], 'nhom-dong-chat', 1, 8, 10, 'Mỗi tích luỹ thừa được viết thành tích các thừa số rồi đếm số chữ a. Nhóm tự rút ra phải cộng, trừ hay nhân số mũ cho từng loại phép tính.', 'Phiếu 6 biểu thức luỹ thừa', 'nhap', 'Bản nháp do trợ lý AI soạn theo từ điển mã lỗi — giáo viên cần duyệt, sửa trước khi dùng'),
  ('HD-TU-01', 'Hai đội, hai thứ tự tính', array['E-TU-01', 'E-TU-02']::text[], array['loi']::text[], 'ca-lop', 2, 8, 10, 'Cùng một biểu thức, đội A tính từ trái sang phải, đội B tính theo thứ tự ưu tiên. Hai kết quả khác nhau là điểm xuất phát để cả lớp thống nhất quy ước.', '3 biểu thức có luỹ thừa, nhân chia, ngoặc', 'nhap', 'Bản nháp do trợ lý AI soạn theo từ điển mã lỗi — giáo viên cần duyệt, sửa trước khi dùng'),
  ('HD-CV-01', 'Cân thăng bằng: thêm bớt hai vế', array['E-CV-01', 'E-CV-02']::text[], array['loi']::text[], 'nhom-dong-chat', 2, 8, 12, 'Dùng trò chơi cân thăng bằng trên web hoặc hình vẽ cân: mỗi bước chuyển vế phải làm cùng một việc ở cả hai đĩa cân. Phân biệt bớt một số hạng với chia cho một thừa số.', 'Trò chơi cân thăng bằng (BalanceGame) hoặc phiếu hình cân', 'nhap', 'Bản nháp do trợ lý AI soạn theo từ điển mã lỗi — giáo viên cần duyệt, sửa trước khi dùng')
on conflict (activity_id) do nothing;

select count(*) as so_hoat_dong, count(*) filter (where trang_thai = 'nhap') as con_nhap from mm_activities;
