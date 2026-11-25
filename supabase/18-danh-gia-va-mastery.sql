-- ===========================================================================
-- BÀI ĐÁNH GIÁ ĐẦU VÀO / CUỐI CHƯƠNG + MỨC LÀM CHỦ PHIÊN BẢN 2
-- Chạy sau 15-view-tong-hop-va-lich-su.sql. KHÔNG xoá dữ liệu cũ nào.
--
-- Tệp này đổi ĐỊNH NGHĨA MỨC LÀM CHỦ của cả hệ thống, nên phải đọc kỹ.
--
-- Bản v1 (dfle-engine/src/mastery.js, hàm computeMastery) xét theo ĐIỂM TỔNG
-- của lượt làm: quiz = 0,7·điểm lần đầu + 0,3·điểm cao nhất, rồi so với ngưỡng.
-- Chỗ hỏng: điểm tổng trộn câu dễ với câu khó thành một con số, nên không phân
-- biệt được "đúng 8/10 câu nhận biết" với "đúng 8/10 câu vận dụng" — mà đó đúng
-- là thứ mức làm chủ phải phân biệt.
--
-- Bản v2 ở đây xét bằng chứng ở mức TỪNG CÂU:
--   · mỗi câu chỉ tính LẦN TRẢ LỜI GẦN NHẤT — làm lại thay thế bằng chứng cũ,
--     không cộng dồn, nên cày lại nhiều lần không tự đẩy mức lên;
--   · chỉ xét 12 câu KHÁC NHAU gần nhất — hồ sơ phải phản ánh em ấy HIỆN TẠI;
--   · dưới 3 câu đáng tin thì trả NULL = CHƯA ĐỦ BẰNG CHỨNG, không trả 0.
--     Mức 0 nghĩa là "đã đo và chưa đạt"; null nghĩa là "chưa đo được gì".
--   · bằng chứng gộp chung từ bài chuẩn bị, bài vận dụng VÀ bài đánh giá chương
--     — một công thức duy nhất cho cả ba, không phải ba cách tính khác nhau.
--
-- Bản JavaScript đọc được và có test của đúng công thức này nằm ở
-- dfle-engine/src/mastery.js (computeMasteryV2) và test/mastery.test.js.
-- Sửa một bên thì phải sửa bên kia.
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- KIỂM TRA ĐIỀU KIỆN TRƯỚC
-- ---------------------------------------------------------------------------
do $$
begin
  if to_regclass('public.students') is null then
    raise exception E'\n\n>>> DỪNG LẠI: Phải chạy 01-schema.sql TRƯỚC tệp này. <<<\n';
  end if;
  if to_regclass('public.mastery_history') is null then
    raise exception E'\n\n>>> DỪNG LẠI: Phải chạy 15-view-tong-hop-va-lich-su.sql TRƯỚC tệp này. Hàm refresh_mastery_v2 ghi mỗi lần đổi mức vào bảng mastery_history do tệp 15 tạo ra; chưa có bảng đó thì lịch sử tiến bộ mất trắng mà không báo gì. <<<\n';
  end if;
  if not exists (select 1 from information_schema.columns
                  where table_schema='public' and table_name='quiz_attempts' and column_name='kind') then
    raise exception E'\n\n>>> DỪNG LẠI: Phải chạy 03-pha-sau-gio-hoc.sql TRƯỚC tệp này. <<<\n';
  end if;
  if (select count(*) from questions) = 0 then
    raise exception E'\n\n>>> DỪNG LẠI: Phải chạy 07-noi-dung-chuong-1.sql TRƯỚC tệp này. Chưa có câu hỏi nào thì không ra được đề đánh giá. <<<\n';
  end if;
end $$;


-- ---------------------------------------------------------------------------
-- A. Bài đánh giá — đề được CHỤP LẠI vào lúc phát đề
--
-- Cột questions giữ nguyên đề đã phát, kể cả khi sau đó giáo viên sửa ngân hàng
-- câu hỏi. Không chụp lại thì một em làm bài hôm nay, giáo viên sửa đề ngày mai,
-- và kết quả cũ trở thành không giải thích được.
-- ---------------------------------------------------------------------------
create table if not exists public.assessments (
  id           uuid primary key default gen_random_uuid(),
  student_id   text not null references students(student_id),
  chapter_id   text not null,
  kind         text not null check (kind in ('dau-vao','chuong')),
  started_at   timestamptz not null default now(),
  submitted_at timestamptz,
  questions    jsonb not null,   -- đề đã chụp, CÓ chứa đáp án đúng
  answers      jsonb,
  result       jsonb,
  active_seconds integer,
  version      text not null default 'assessment-v1'
);

alter table assessments enable row level security;
-- Bản chụp đề CÓ chứa correct_option. Học sinh đọc được bảng này là đọc được
-- đáp án của chính bài mình đang làm, nên KHÔNG mở cho người dùng đăng nhập:
-- đề đi tới học sinh qua API, đã cắt bỏ cột đáp án.
revoke all on assessments from anon, authenticated;
grant all on assessments to service_role;

create index if not exists assessment_student on assessments(student_id, started_at desc);
-- Mỗi học sinh chỉ có MỘT bài đang mở cho mỗi chương và mỗi loại. Mở hai tab thì
-- tab thứ hai nhận lại đúng bài đang làm dở, không sinh đề mới.
create unique index if not exists assessment_one_open
  on assessments(student_id, chapter_id, kind) where submitted_at is null;

-- Mức làm chủ nay CÓ THỂ là null (chưa đủ bằng chứng) — xem khối đầu tệp.
alter table mastery_states  alter column mastery_level drop not null;
alter table mastery_history alter column mastery_level drop not null;

comment on table assessments is
  'Bài đánh giá đầu vào và cuối chương. Đề được chụp lại lúc phát, nên kết quả cũ vẫn giải thích được sau khi ngân hàng câu hỏi thay đổi.';


-- ---------------------------------------------------------------------------
-- B. Tính lại mức làm chủ — MỘT công thức cho cả ba loại bài
-- ---------------------------------------------------------------------------
create or replace function public.refresh_mastery_v2(p_student text, p_ku text)
returns jsonb language plpgsql set search_path = public as $$
declare ev jsonb; n integer; applied integer; transfer integer;
        ratio numeric; ar numeric; tr numeric; lvl integer; state text; out_data jsonb;
begin
  -- Hai lượt nộp gần nhau của cùng một em, cùng một mục, có thể đọc cùng một
  -- tập bằng chứng rồi ghi đè lẫn nhau. Khoá theo (học sinh, mục).
  perform pg_advisory_xact_lock(hashtext(p_student || '|' || p_ku));

  with evidence as (
    -- (1) bằng chứng từ bài chuẩn bị và bài vận dụng
    select q.question_id, q.level, a.is_correct, t.submitted_at as ts,
      -- LƯỢT KHÔNG ĐÁNG TIN: vừa điểm thấp vừa làm quá nhanh — dấu hiệu bấm bừa.
      -- Bằng chứng của lượt đó bị LOẠI, không bị tính là sai.
      --
      -- coalesce(..., true) là một sửa lỗi, không phải cho đẹp: thiếu
      -- time_on_task_sec thì vế so sánh ra NULL, `where valid` loại luôn dòng
      -- đó, và bằng chứng của ĐÚNG nhóm học sinh yếu (điểm dưới 5) bị vứt đi —
      -- các em ấy mắc kẹt ở "chưa đủ dữ liệu" và không bao giờ được chẩn đoán.
      -- Thiếu số đo thời gian phải hiểu là KHÔNG có căn cứ nghi bấm bừa.
      coalesce(
        not (t.score < 5
             and t.time_on_task_sec < .3 * (select sum(z.expected_time_sec)
                                              from quiz_answers za
                                              join questions z using (question_id)
                                             where za.attempt_id = t.attempt_id)),
        true) as valid
    from quiz_answers a
    join quiz_attempts t using (attempt_id)
    join questions q using (question_id)
    where t.student_id = p_student and q.ku_id = p_ku and t.ku_id = p_ku

    union all

    -- (2) bằng chứng từ bài đánh giá đầu vào / cuối chương
    select x->>'question_id', (x->>'level')::int, (x->>'is_correct')::boolean, s.submitted_at,
      coalesce(
        not ((s.result->>'score')::numeric < 5
             and s.active_seconds < .3 * (select sum((q->>'expected_time_sec')::int)
                                            from jsonb_array_elements(s.questions) q)),
        true)
    from assessments s
    cross join lateral jsonb_array_elements(s.result->'answers') x
    where s.student_id = p_student and s.submitted_at is not null and x->>'ku_id' = p_ku
  ), latest as (
    -- mỗi câu giữ lần trả lời GẦN NHẤT
    select distinct on (question_id) * from evidence where valid order by question_id, ts desc
  ), recent as (
    -- chỉ xét 12 câu khác nhau gần nhất
    select * from latest order by ts desc, question_id limit 12
  )
  select count(*), count(*) filter (where level >= 3), count(*) filter (where level = 4),
         avg(is_correct::int),
         avg(is_correct::int) filter (where level >= 3),
         avg(is_correct::int) filter (where level = 4),
         jsonb_agg(jsonb_build_object('question_id', question_id, 'level', level,
                                      'correct', is_correct, 'at', ts)
                   order by ts desc, question_id)
    into n, applied, transfer, ratio, ar, tr, ev
    from recent;

  if n < 3 then
    lvl := null; state := 'insufficient';   -- CHƯA ĐỦ BẰNG CHỨNG, không phải mức 0
  else
    state := 'measured';
    lvl := 0;
    if ratio >= .5 then lvl := 1; end if;
    -- Mức 2 phải có ít nhất 2 câu VẬN DỤNG (mức >= 3) đúng từ 65%: điểm cao
    -- trên toàn câu dễ không chứng minh được em ấy vận dụng được.
    if ratio >= .65 and applied  >= 2 and ar >= .65 then lvl := 2; end if;
    -- Mức 3 phải có ít nhất 2 câu TÌNH HUỐNG MỚI (mức 4).
    if ratio >= .8  and transfer >= 2 and tr >= .65 then lvl := 3; end if;
  end if;

  out_data := jsonb_build_object(
    'version','mastery-v2', 'status', state,
    'index', case when n >= 3 then round(ratio, 3) else null end,
    'question_count', n, 'applied_count', applied, 'transfer_count', transfer,
    'observations', coalesce(ev, '[]'::jsonb));

  insert into mastery_states(student_id, ku_id, mastery_level, evidence, updated_at)
  values (p_student, p_ku, lvl, out_data, now())
  on conflict (student_id, ku_id) do update
     set mastery_level = excluded.mastery_level,
         evidence = excluded.evidence,
         updated_at = excluded.updated_at
   where mastery_states.evidence is distinct from excluded.evidence
      or mastery_states.mastery_level is distinct from excluded.mastery_level;

  -- Chỉ ghi lịch sử khi bằng chứng THỰC SỰ đổi (mệnh đề where ở trên). Ghi mọi
  -- lượt chấm sẽ biến bảng lịch sử thành bản sao của quiz_attempts.
  if found then
    insert into mastery_history(student_id, ku_id, mastery_level, evidence)
    values (p_student, p_ku, lvl, out_data);
  end if;

  return out_data || jsonb_build_object('level', lvl);
end $$;

comment on function public.refresh_mastery_v2(text,text) is
  'Mức làm chủ v2: 12 câu khác nhau gần nhất, mỗi câu tính lần trả lời mới nhất, dưới 3 câu đáng tin thì trả null. Bản JavaScript đối chiếu: dfle-engine/src/mastery.js.';


-- ---------------------------------------------------------------------------
-- C. Nộp bài đánh giá — chấm ở máy chủ, rồi tính lại mức cho từng mục
-- ---------------------------------------------------------------------------
create or replace function public.submit_assessment(
  p_id uuid, p_student text, p_answers jsonb, p_active integer)
returns jsonb language plpgsql set search_path = public as $$
declare s assessments%rowtype; q jsonb; chosen text; graded jsonb := '[]'; r jsonb;
        totals jsonb; mastery jsonb := '{}'; ku text; m jsonb; total integer; correct integer;
begin
  select * into s from assessments where id = p_id and student_id = p_student for update;
  if not found then raise exception 'Không tìm thấy bài làm'; end if;
  -- Nộp lại lần hai trả về đúng kết quả lần đầu, không chấm lại và không cộng
  -- thêm bằng chứng.
  if s.submitted_at is not null then return s.result; end if;

  if jsonb_typeof(p_answers) is distinct from 'object' then raise exception 'Câu trả lời không hợp lệ'; end if;
  if (select count(*) from jsonb_object_keys(p_answers)) <> jsonb_array_length(s.questions) then
    raise exception 'Cần nộp đủ các câu trong đề';
  end if;

  -- Chấm theo BẢN ĐỀ ĐÃ CHỤP, không đọc lại bảng questions: đề có thể đã bị sửa
  -- sau lúc phát, và học sinh phải được chấm theo đúng đề mình đã nhìn thấy.
  for q in select * from jsonb_array_elements(s.questions) loop
    if not p_answers ? (q->>'question_id') then raise exception 'Thiếu câu trả lời'; end if;
    chosen := p_answers->>(q->>'question_id');
    if chosen is not null
       and not exists (select 1 from jsonb_array_elements(q->'options') o where o->>'option_key' = chosen) then
      raise exception 'Phương án không hợp lệ';
    end if;
    graded := graded || jsonb_build_array(jsonb_build_object(
      'question_id', q->>'question_id', 'ku_id', q->>'ku_id', 'level', (q->>'level')::int,
      'chosen_option', chosen, 'is_correct', coalesce(chosen = q->>'correct_option', false)));
  end loop;

  select count(*), count(*) filter (where (x->>'is_correct')::boolean)
    into total, correct from jsonb_array_elements(graded) x;
  select jsonb_agg(z) into totals from (
    select x->>'ku_id' as ku_id, count(*) as total,
           count(*) filter (where (x->>'is_correct')::boolean) as correct,
           round(10.0 * count(*) filter (where (x->>'is_correct')::boolean) / count(*), 1) as score
      from jsonb_array_elements(graded) x group by x->>'ku_id') z;

  r := jsonb_build_object('score', round(correct * 10.0 / total, 1),
                          'total', total, 'correct', correct,
                          'answers', graded, 'by_unit', totals);

  update assessments
     set submitted_at = now(), answers = p_answers,
         -- Thời gian tương tác do trình duyệt báo, nhưng không được vượt quá
         -- thời gian thật từ lúc phát đề: đó là chặn khai khống.
         active_seconds = greatest(0, least(coalesce(p_active, 0),
                                            extract(epoch from now() - started_at)::integer)),
         result = r
   where id = p_id;

  -- Tính lại mức làm chủ cho TỪNG mục có câu trong đề.
  for ku in select distinct x->>'ku_id' from jsonb_array_elements(graded) x order by 1 loop
    m := refresh_mastery_v2(p_student, ku);
    mastery := mastery || jsonb_build_object(ku, m);
  end loop;

  r := r || jsonb_build_object('mastery', mastery);
  update assessments set result = r where id = p_id;
  return r;
end $$;

-- Hai hàm này chấm bài và ghi mức làm chủ, nên chỉ máy chủ gọi được.
revoke all on function public.refresh_mastery_v2(text,text) from public, anon, authenticated;
revoke all on function public.submit_assessment(uuid,text,jsonb,integer) from public, anon, authenticated;
grant execute on function public.refresh_mastery_v2(text,text) to service_role;
grant execute on function public.submit_assessment(uuid,text,jsonb,integer) to service_role;


-- ---------------------------------------------------------------------------
-- KIỂM TRA SAU KHI CHẠY
-- ---------------------------------------------------------------------------
select 'assessments' as bang, count(*) as so_dong from assessments
union all select 'mastery_history', count(*) from mastery_history;
