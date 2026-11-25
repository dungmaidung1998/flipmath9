-- ===========================================================================
-- BẢNG TỔNG HỢP PHÍA MÁY CHỦ + LỊCH SỬ MASTERY
-- Chạy sau 08-vi-bai-hoc.sql. Không phụ thuộc 09–14.
--
-- Vì sao cần tệp này — ba lý do, đều là lỗi thật đã xảy ra:
--
-- 1. TRẦN 1000 DÒNG. Supabase trả tối đa 1000 dòng cho mỗi truy vấn và KHÔNG
--    báo lỗi khi cắt. Trang /gv đang tải toàn bộ learning_events của cả lớp về
--    trình duyệt rồi mới cộng. Một lớp 40 em học hết 14 mục sinh khoảng 4000–
--    6000 sự kiện, tức là từ tuần thứ hai trở đi bảng điều khiển đọc thiếu
--    dữ liệu mà vẫn hiện ra như bình thường. Cộng ở phía máy chủ thì mỗi lớp
--    chỉ còn đúng 40 dòng — số dòng bằng SĨ SỐ, không bằng số sự kiện.
--
-- 2. MÚI GIỜ. `count(distinct ts::date)` đếm theo UTC. Em học lúc 22h30 và em
--    học lúc 6h30 sáng hôm sau ở Việt Nam là HAI ngày, nhưng theo UTC lại rơi
--    vào cùng một ngày — thành phần "Đều đặn" của LES bị hụt đúng ở nhóm học
--    buổi tối, tức là nhóm đông nhất. Mọi phép đổi ngày ở đây đều quy về
--    Asia/Ho_Chi_Minh.
--
-- 3. LỊCH SỬ MASTERY. Bảng mastery_states chỉ giữ mức HIỆN TẠI. Khi em từ mức
--    1 lên mức 2, dòng cũ bị ghi đè và không còn bằng chứng nào cho biết việc
--    đó xảy ra lúc nào, nhờ đâu. Mà "hồ sơ học tập được cập nhật" chính là câu
--    mà đề tài phải chứng minh, nên nó cần một bảng riêng chỉ ghi thêm.
--
-- Cả ba view đều dùng security_invoker = true: quyền đọc vẫn là quyền của
-- người đang đăng nhập, view KHÔNG mở thêm cửa nào. Học sinh đọc view chỉ
-- thấy dòng của chính mình; giáo viên thấy học sinh lớp mình.
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- KIỂM TRA ĐIỀU KIỆN TRƯỚC
-- ---------------------------------------------------------------------------
do $$
begin
  if to_regclass('public.students') is null then
    raise exception E'\n\n>>> DỪNG LẠI: Phải chạy 01-schema.sql TRƯỚC tệp này. <<<\n';
  end if;
  if to_regclass('public.recommendations') is null then
    raise exception E'\n\n>>> DỪNG LẠI: Phải chạy 01-schema.sql TRƯỚC tệp này. <<<\n';
  end if;
  if to_regclass('public.micro_lesson_events') is null then
    raise exception E'\n\n>>> DỪNG LẠI: Phải chạy 08-vi-bai-hoc.sql TRƯỚC tệp này. View vi_bai_hoc_tong_hop đọc nhật ký vi bài học do tệp 08 tạo ra. <<<\n';
  end if;
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'quiz_attempts' and column_name = 'kind'
  ) then
    raise exception E'\n\n>>> DỪNG LẠI: Phải chạy 03-pha-sau-gio-hoc.sql TRƯỚC tệp này. Thiếu cột quiz_attempts.kind thì không tách được bài chuẩn bị với bài vận dụng. <<<\n';
  end if;
end $$;


-- ===========================================================================
-- A. les_tong_hop — mỗi học sinh một dòng, đủ số liệu để tính LES
--
-- Đây là năm mẫu số/tử số của công thức LES, cộng sẵn ở phía máy chủ. Trang
-- /gv chỉ việc đọc và đưa thẳng vào componentScores() — vẫn dùng chung đúng
-- một công thức với bản CLI, không chép lại phép tính vào SQL.
--
-- Cố ý KHÔNG tính luôn LES trong view: trọng số còn phải hiệu chỉnh (xem
-- calibrateWeights trong les.js), và quy tắc "thiếu dữ liệu KHÔNG phải là số 0"
-- nằm ở hàm pct() bên JavaScript. Đưa công thức xuống SQL là tự tạo ra bản
-- thứ hai sẽ lệch dần với bản thứ nhất.
-- ===========================================================================
drop view if exists les_tong_hop;
create view les_tong_hop with (security_invoker = true) as
select
  s.student_id,
  s.class_id,

  -- TỬ SỐ của Video: giây xem CÓ TƯƠNG TÁC, cộng trên mọi mục.
  coalesce((
    select sum(e.duration_active_sec)
    from learning_events e
    where e.student_id = s.student_id and e.event_type = 'video_active'
  ), 0)::int as giay_xem_co_tuong_tac,

  -- TỬ SỐ của Đều đặn: số NGÀY có hoạt động, tính theo giờ Việt Nam.
  (
    select count(distinct (e.ts at time zone 'Asia/Ho_Chi_Minh')::date)
    from learning_events e
    where e.student_id = s.student_id
  )::int as so_ngay_co_hoat_dong,

  -- TỬ SỐ của Bài tập.
  (
    select count(*)
    from learning_events e
    where e.student_id = s.student_id and e.event_type = 'assignment_submit'
  )::int as so_bai_tap_da_nop,

  -- TỬ SỐ và MẪU SỐ của Kiên trì: chủ động làm lại / số lần nhận phản hồi.
  (
    select count(*)
    from learning_events e
    where e.student_id = s.student_id and e.event_type = 'voluntary_retry'
  )::int as so_lan_tu_lam_lai,
  (
    select count(*)
    from learning_events e
    where e.student_id = s.student_id and e.event_type = 'feedback_with_hint'
  )::int as so_lan_nhan_phan_hoi,

  -- MẪU SỐ của Bài tập: số mục em ấy ĐÃ BẮT ĐẦU học. Mỗi mục giao đúng một
  -- bài vận dụng, nên đây chính là số bài được giao. Em mới học 2 mục thì
  -- không bị chấm như em đã học 14 mục.
  (
    select count(distinct a.ku_id)
    from quiz_attempts a
    where a.student_id = s.student_id
  )::int as so_muc_da_bat_dau,

  -- Điểm LẦN ĐẦU của các bài CHUẨN BỊ, mỗi mục một số. Bài vận dụng (kind =
  -- 'van-dung') không vào đây: thành phần Quiz của LES đo mức chuẩn bị TRƯỚC
  -- giờ học, trộn bài sau giờ học vào sẽ làm chỉ số tự khen chính nó.
  coalesce((
    select array_agg(a.score order by a.ku_id)
    from quiz_attempts a
    where a.student_id = s.student_id
      and a.attempt_no = 1
      and coalesce(a.kind, 'chuan-bi') = 'chuan-bi'
  ), '{}')::numeric[] as diem_quiz_lan_dau

from students s;

comment on view les_tong_hop is
  'Số liệu thô để tính LES, mỗi học sinh một dòng. Cộng ở máy chủ để không chạm trần 1000 dòng của PostgREST; ngày tính theo Asia/Ho_Chi_Minh.';


-- ===========================================================================
-- B. vi_bai_hoc_tong_hop — mỗi lớp × mỗi vi bài học một dòng
--
-- Trả lời câu "vi bài học nào đang bị bỏ dở nhiều nhất", tức là nội dung nào
-- cần viết lại trước tiên. Đếm theo HỌC SINH chứ không theo lượt: một em mở
-- đi mở lại năm lần vẫn là một em.
-- ===========================================================================
drop view if exists vi_bai_hoc_tong_hop;
create view vi_bai_hoc_tong_hop with (security_invoker = true) as
select
  s.class_id,
  r.recommended_content as content_id,
  count(distinct r.student_id)::int as so_em_duoc_giao,
  count(distinct m.student_id) filter (where m.kind = 'mo')::int          as so_em_da_mo,
  count(distinct m.student_id) filter (where m.kind = 'hoan-thanh')::int  as so_em_lam_xong,
  -- Điểm tự kiểm chỉ tính trên lượt HOÀN THÀNH. Thấp nghĩa là đọc xong vẫn
  -- chưa hiểu — lỗi ở cách giảng của vi bài học, không ở học sinh.
  coalesce(sum(m.so_cau_dung) filter (where m.kind = 'hoan-thanh'), 0)::int as tong_cau_dung,
  coalesce(sum(m.so_cau)      filter (where m.kind = 'hoan-thanh'), 0)::int as tong_cau
from recommendations r
join students s on s.student_id = r.student_id
left join micro_lesson_events m
       on m.content_id = r.recommended_content
      and m.student_id = r.student_id
where r.recommended_content is not null
group by s.class_id, r.recommended_content;

comment on view vi_bai_hoc_tong_hop is
  'Đường đi của từng vi bài học trong một lớp: được giao / đã mở / làm xong, và tỉ lệ câu tự kiểm đúng. Đếm theo học sinh, không theo lượt.';


-- ===========================================================================
-- C. hieu_qua_quy_tac — phép thử T6, mỗi lớp × mỗi quy tắc một dòng
--
-- "Quy tắc nào thực sự có tác dụng" — so điểm bài chuẩn bị trước khi giao
-- nội dung bổ trợ với điểm bài vận dụng sau đó. Chỉ những lượt ĐÃ ĐÓNG VÒNG
-- (có cả pre lẫn post) mới vào phép trung bình; lượt chưa đóng vòng vẫn được
-- đếm ở cột so_luot_goi_y để thấy mẫu số thật.
-- ===========================================================================
drop view if exists hieu_qua_quy_tac;
create view hieu_qua_quy_tac with (security_invoker = true) as
select
  s.class_id,
  r.trigger_rule,
  count(*)::int as so_luot_goi_y,
  count(*) filter (where r.pre_score is not null and r.post_score is not null)::int
    as so_luot_da_dong_vong,
  avg(r.pre_score)  filter (where r.pre_score is not null and r.post_score is not null)
    as diem_truoc_tb,
  avg(r.post_score) filter (where r.pre_score is not null and r.post_score is not null)
    as diem_sau_tb,
  avg(r.post_score - r.pre_score) filter (where r.pre_score is not null and r.post_score is not null)
    as muc_tang_tb
from recommendations r
join students s on s.student_id = r.student_id
group by s.class_id, r.trigger_rule;

comment on view hieu_qua_quy_tac is
  'Phép thử T6: mức tăng điểm trung bình sau mỗi quy tắc, tính trên các lượt đã đóng vòng.';


-- ===========================================================================
-- D. loi_pho_bien — mỗi lớp × mỗi đơn vị kiến thức × mỗi mã lỗi một dòng
--
-- Trước đây trang /gv lấy về từng dòng quiz_answers của cả lớp rồi mới đếm.
-- Một lớp 40 em, mỗi em làm tới 3 lượt, mỗi lượt 5 câu là 600 dòng cho MỘT
-- mục — chưa chạm trần 1000 nhưng đã sát, và lớp ghép hai ca thì vượt. Đếm ở
-- máy chủ thì mỗi mục chỉ còn vài dòng, đúng bằng số mã lỗi có thật.
-- ===========================================================================
drop view if exists loi_pho_bien;
create view loi_pho_bien with (security_invoker = true) as
select
  s.class_id,
  a.ku_id,
  qa.error_code,
  count(*)::int as so_luot
from quiz_answers qa
join quiz_attempts a on a.attempt_id = qa.attempt_id
join students s      on s.student_id = a.student_id
where qa.error_code is not null
group by s.class_id, a.ku_id, qa.error_code;

comment on view loi_pho_bien is
  'Số lượt mắc từng mã lỗi trong một lớp ở một đơn vị kiến thức. Đếm ở máy chủ thay vì tải toàn bộ quiz_answers về trình duyệt.';


-- ===========================================================================
-- E. mastery_history — bảng CHỈ GHI THÊM, giữ lại từng lần đổi mức
--
-- mastery_states giữ mức hiện tại (ghi đè). Bảng này giữ đường đi. Không có
-- nó thì câu "hồ sơ học tập được cập nhật liên tục" chỉ là lời nói: hội đồng
-- hỏi "em này lên mức 2 lúc nào, nhờ bài nào" là không trả lời được.
--
-- Cột evidence chép lại đúng khối bằng chứng đã dùng để quyết định mức, nên
-- mỗi dòng tự đứng được mà không cần suy ngược từ quiz_attempts.
-- ===========================================================================
create table if not exists mastery_history (
  history_id    bigserial primary key,
  student_id    text references students(student_id) on delete cascade,
  ku_id         text references knowledge_units(ku_id),
  mastery_level int not null check (mastery_level between 0 and 3),
  evidence      jsonb,
  ts            timestamptz not null default now()
);
create index if not exists idx_mastery_history_student
  on mastery_history(student_id, ku_id, ts desc);

alter table mastery_history enable row level security;

drop policy if exists "doc lich su mastery" on mastery_history;
create policy "doc lich su mastery" on mastery_history for select to authenticated
  using (student_id = my_student_id() or is_teacher());

-- Ghi bằng service role ở phía máy chủ (route /api/quiz/submit) — không mở
-- policy insert cho người dùng. Học sinh tự ghi được vào bảng này thì mọi
-- con số về tiến bộ đều mất giá trị làm bằng chứng.

comment on table mastery_history is
  'Lịch sử mức mastery — chỉ ghi thêm, không sửa, không xoá. Mỗi dòng là một lần hệ thống kết luận lại về một đơn vị kiến thức của một học sinh.';


-- ---------------------------------------------------------------------------
-- Nạp mốc đầu tiên cho những em đã có mức mastery trước khi có bảng này, để
-- lịch sử không bắt đầu bằng một khoảng trống. Chạy lại tệp không nhân đôi.
-- ---------------------------------------------------------------------------
insert into mastery_history (student_id, ku_id, mastery_level, evidence, ts)
select m.student_id, m.ku_id, m.mastery_level,
       coalesce(m.evidence, '{}'::jsonb) || jsonb_build_object('nguon', 'nap-lai-tu-mastery_states'),
       m.updated_at
from mastery_states m
where not exists (
  select 1 from mastery_history h
  where h.student_id = m.student_id and h.ku_id = m.ku_id
);


-- ---------------------------------------------------------------------------
-- KIỂM TRA SAU KHI CHẠY — dán kết quả vào sổ nhật ký nghiên cứu.
-- ---------------------------------------------------------------------------
select 'les_tong_hop'          as bang, count(*) as so_dong from les_tong_hop
union all select 'vi_bai_hoc_tong_hop', count(*) from vi_bai_hoc_tong_hop
union all select 'hieu_qua_quy_tac',    count(*) from hieu_qua_quy_tac
union all select 'loi_pho_bien',        count(*) from loi_pho_bien
union all select 'mastery_history',     count(*) from mastery_history;
