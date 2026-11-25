-- ===========================================================================
-- ĐO ĐỘ PHỦ VIDEO THEO GIÂY KHÁC NHAU + ĐỊNH NGHĨA "HOÀN THÀNH BÀI"
-- Chạy sau 15-view-tong-hop-va-lich-su.sql.
--
-- Vì sao không dùng tổng thời gian xem: tổng thời gian không phân biệt được em
-- xem hết bài với em tua đi tua lại một phút đầu, hay em để video chạy trong
-- một tab khác. Đếm những GIÂY KHÁC NHAU của video mà em ấy thực sự đi qua thì
-- tua lại không cộng thêm, và để chạy nền cũng không cộng thêm vì không có sự
-- kiện phát nào đi kèm.
--
-- Số liệu cũ KHÔNG chuyển đổi được sang thước đo này: từ tổng giờ xem không suy
-- ngược ra được em ấy đã đi qua những giây nào. Bảng này bắt đầu từ mốc cài đặt,
-- và trang /gv/hoan-thanh nói rõ điều đó thay vì lấp bằng một con số ước lượng.
--
-- ĐÂY KHÔNG PHẢI THÀNH PHẦN VIDEO CỦA LES. LES đo MỨC ĐỘ THAM GIA (giây xem có
-- tương tác, bảng learning_events); bảng này đo ĐỘ PHỦ NỘI DUNG. Hai câu hỏi
-- khác nhau, cố ý để riêng.
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- KIỂM TRA ĐIỀU KIỆN TRƯỚC
-- ---------------------------------------------------------------------------
do $$
begin
  if to_regclass('public.students') is null or to_regclass('public.contents') is null then
    raise exception E'\n\n>>> DỪNG LẠI: Phải chạy 01-schema.sql TRƯỚC tệp này. <<<\n';
  end if;
  if not exists (select 1 from information_schema.columns
                  where table_schema='public' and table_name='knowledge_units' and column_name='co_video') then
    raise exception E'\n\n>>> DỪNG LẠI: Phải chạy 07-noi-dung-chuong-1.sql TRƯỚC tệp này. Thiếu cột knowledge_units.co_video thì không phân biệt được mục KHÔNG có video bài học (luyện tập chung, ôn tập cuối chương) với mục có video mà học sinh chưa xem. <<<\n';
  end if;
  if not exists (select 1 from information_schema.columns
                  where table_schema='public' and table_name='quiz_attempts' and column_name='kind') then
    raise exception E'\n\n>>> DỪNG LẠI: Phải chạy 03-pha-sau-gio-hoc.sql TRƯỚC tệp này. Thiếu cột quiz_attempts.kind thì không tách được bài chuẩn bị với bài vận dụng. <<<\n';
  end if;
end $$;


-- ---------------------------------------------------------------------------
-- A. Những GIÂY của video mà học sinh đã đi qua
--
-- Khoá chính gồm cả second_index, nên ghi lại cùng một giây không nhân đôi —
-- tua lại lần thứ mười vẫn chỉ là một giây đã xem.
-- video_url nằm trong khoá: thầy cô đổi link video là một video KHÁC, độ phủ cũ
-- không được tính sang video mới.
-- ---------------------------------------------------------------------------
create table if not exists public.video_seconds (
  student_id   text references public.students(student_id),
  ku_id        text references public.knowledge_units(ku_id),
  video_url    text not null,
  second_index integer not null check (second_index >= 0 and second_index < 7200),
  first_seen   timestamptz not null default now(),
  primary key (student_id, ku_id, video_url, second_index)
);

alter table public.video_seconds enable row level security;
drop policy if exists "read own video coverage" on public.video_seconds;
create policy "read own video coverage" on public.video_seconds for select to authenticated
  using (student_id = public.my_student_id() or public.teaches_student(student_id));
-- Ghi bằng service role ở phía máy chủ — không mở policy insert cho người dùng.
-- Học sinh tự ghi được vào bảng này thì con số "đã xem 90%" mất hết giá trị.

comment on table public.video_seconds is
  'Mỗi dòng là một giây khác nhau của video mà học sinh đã đi qua. Tua lại không nhân đôi; đổi link video là bắt đầu đếm lại.';

create or replace view public.video_coverage with (security_invoker = true) as
select v.student_id, v.ku_id, v.video_url, count(*)::integer as unique_seconds
from public.video_seconds v
group by v.student_id, v.ku_id, v.video_url;


-- ---------------------------------------------------------------------------
-- B. "Hoàn thành bài" theo chuẩn flipped-v1
--
-- Ba hoạt động bắt buộc: xem đủ video, nộp bài chuẩn bị, nộp bài vận dụng.
-- Mục không có video bài học thì chỉ còn hai.
--
-- Tham số p_before cho phép hỏi "tính tới TRƯỚC GIỜ VÀO TIẾT thì em ấy đã chuẩn
-- bị chưa" — đó mới đúng là câu hỏi của mô hình lớp học đảo ngược. Hỏi "tới giờ
-- đã xem chưa" thì em xem sau tiết học vẫn được tính là đã chuẩn bị trước.
--
-- Trả về null (chứ không phải false) khi CHƯA ĐO ĐƯỢC: chưa gắn link video,
-- hoặc video chưa có thời lượng. Trả false ở đó là khẳng định em ấy không xem,
-- trong khi lỗi nằm ở phía nội dung chưa soạn xong.
-- ---------------------------------------------------------------------------
create or replace function public.learning_completion(
  p_student text, p_ku text, p_before timestamptz default now())
returns jsonb language plpgsql stable security invoker set search_path = public as $$
declare u record; v record; watched integer; prep boolean; applied boolean; video_ok boolean;
begin
  -- Học sinh chỉ hỏi được về chính mình; giáo viên hỏi được học sinh lớp mình.
  if not (p_student = my_student_id() or teaches_student(p_student)) then
    raise exception 'Không có quyền';
  end if;

  select * into u from knowledge_units where ku_id = p_ku;
  if not found then raise exception 'Không có mục bài học'; end if;

  -- Một mục có thể có nhiều dòng video (bản dự phòng, bản quay lại). Lấy dòng
  -- đầu theo content_id để câu trả lời ổn định giữa các lần gọi.
  select * into v from contents where ku_id = p_ku and kind = 'video' order by content_id limit 1;

  select count(*) into watched
    from video_seconds
   where student_id = p_student and ku_id = p_ku
     and video_url = v.url and second_index < v.duration_sec
     and first_seen < p_before;

  video_ok := case
                when u.co_video = false then true          -- mục không giao video
                when v.url is null or v.duration_sec is null or v.duration_sec <= 0 then null  -- CHƯA ĐO
                else watched >= ceil(v.duration_sec * .9)
              end;

  select exists (select 1 from quiz_attempts
                  where student_id = p_student and ku_id = p_ku
                    and kind = 'chuan-bi' and submitted_at < p_before),
         exists (select 1 from quiz_attempts
                  where student_id = p_student and ku_id = p_ku
                    and kind = 'van-dung' and submitted_at < p_before)
    into prep, applied;

  return jsonb_build_object(
    'video_complete',        video_ok,
    'unique_seconds',        watched,
    'video_percent',         case when v.duration_sec > 0
                                  then least(100, round(watched * 100.0 / v.duration_sec))
                                  else null end,
    'preparation_submitted', prep,
    'application_submitted', applied,
    -- "Đã chuẩn bị trước giờ học" = xem đủ video VÀ đã nộp bài chuẩn bị.
    'prepared',              video_ok and prep,
    'lesson_complete',       video_ok and prep and applied,
    'activities_complete',   case when u.co_video = false then 0
                                  when video_ok then 1 else 0 end + prep::int + applied::int,
    'activities_required',   case when u.co_video = false then 2 else 3 end,
    'definition_version',    'flipped-v1');
end $$;

revoke all on function public.learning_completion(text,text,timestamptz) from public;
grant execute on function public.learning_completion(text,text,timestamptz) to authenticated;

comment on function public.learning_completion(text,text,timestamptz) is
  'Chuẩn flipped-v1: xem đủ 90% số giây khác nhau của video, nộp bài chuẩn bị, nộp bài vận dụng. p_before để hỏi tình trạng TRƯỚC giờ vào tiết.';


-- ---------------------------------------------------------------------------
-- KIỂM TRA SAU KHI CHẠY
-- ---------------------------------------------------------------------------
select 'video_seconds' as bang, count(*) as so_dong from video_seconds;
