-- ===========================================================================
-- FlipMath9 · 42 · SOÁT LỖI CŨ + ÔN LỖI NGẮT QUÃNG + KHOÁ CHUỖI TRƯỚC GIỜ
-- (SPEC M2, M5 · docs/THUAT-TOAN-ON-LOI-NGAT-QUANG.md)
--
-- Thêm:
--   student_errors     trạng thái từng mã lỗi của từng học sinh và hạn ôn
--   student_error_log  lịch sử chuyển trạng thái (theo dõi lỗi tái diễn, số liệu KHKT)
--   soat_loi_luot      mỗi lượt soát lỗi: danh sách câu ĐÃ PHÁT (máy chủ dùng để xác minh lúc nộp)
--   soat_loi_tra_loi   câu trả lời trong lượt soát lỗi
-- Sửa:
--   learning_completion: ngưỡng "xem đủ video" 80% theo SPEC M2 (trước đây 90%).
--
-- Vòng đời một mã lỗi:
--   can-sua ──(soát đúng hết)──► cho-on-1 (hạn +3 ngày) ──(ôn đúng)──► cho-on-2 (hạn +7 ngày) ──(ôn đúng)──► da-nho
--   ôn sai ở cho-on-1/2 ──► cho-on-1, hạn ngày kế tiếp
--   sai lại ở bài làm thường ──► can-sua; nếu đang da-nho thì tăng tai_phat
-- Học sinh chỉ ĐỌC dữ liệu của mình, giáo viên đọc lớp mình; mọi thao tác GHI đi qua API máy chủ.
--
-- Chạy sau 00-FLIPMATH9-KHOI-TAO.sql (và 40a, 40b, 41). Chạy lại nhiều lần được.
-- ===========================================================================

create table if not exists public.student_errors (
  student_id   text not null references students(student_id) on delete cascade,
  error_code   text not null references error_dictionary(error_code) on delete cascade,
  trang_thai   text not null default 'can-sua'
               check (trang_thai in ('can-sua', 'cho-on-1', 'cho-on-2', 'da-nho')),
  han_on       date,                 -- ngày đến hạn ôn theo lịch Việt Nam; null khi can-sua (luôn đến hạn)
  so_lan_sai   int not null default 1,
  tai_phat     int not null default 0,
  lan_sai_dau  timestamptz not null default now(),
  lan_sai_cuoi timestamptz not null default now(),
  ku_goc       text references knowledge_units(ku_id),
  chu_ky_tu    timestamptz not null default now(),   -- lúc bắt đầu chu kỳ sửa lỗi hiện tại (câu đã dùng trong chu kỳ không phát lại)
  cap_nhat     timestamptz not null default now(),
  primary key (student_id, error_code)
);
create index if not exists idx_student_errors_han on public.student_errors(student_id, trang_thai, han_on);

create table if not exists public.student_error_log (
  id         bigserial primary key,
  student_id text not null references students(student_id) on delete cascade,
  error_code text not null,
  tu         text,
  den        text not null,
  ly_do      text not null,          -- 'bai-lam' | 'soat-loi' | 'on-1' | 'on-2'
  luot_id    bigint,
  ts         timestamptz not null default now()
);
create index if not exists idx_student_error_log on public.student_error_log(student_id, ts);

create table if not exists public.soat_loi_luot (
  luot_id    bigserial primary key,
  student_id text not null references students(student_id) on delete cascade,
  ku_id      text references knowledge_units(ku_id),   -- bài đang mở khi soát (null = soát ở Sổ lỗi)
  ngay       date not null,                            -- ngày phát đề (giờ Việt Nam)
  cau        jsonb not null,                           -- [{question_id, error_code, loai: 'sua'|'on-1'|'on-2'}]
  thieu_cau  jsonb not null default '[]'::jsonb,       -- mã lỗi đến hạn nhưng thiếu câu phù hợp
  tao_luc    timestamptz not null default now(),
  nop_luc    timestamptz,
  ket_qua    jsonb
);
create index if not exists idx_soat_loi_luot on public.soat_loi_luot(student_id, ngay);

create table if not exists public.soat_loi_tra_loi (
  luot_id         bigint not null references soat_loi_luot(luot_id) on delete cascade,
  question_id     text not null references questions(question_id),
  error_code      text not null,
  chosen_option   text,
  is_correct      boolean not null,
  answer_time_sec int,
  primary key (luot_id, question_id)
);

alter table public.student_errors    enable row level security;
alter table public.student_error_log enable row level security;
alter table public.soat_loi_luot     enable row level security;
alter table public.soat_loi_tra_loi  enable row level security;

drop policy if exists "doc loi cua minh" on public.student_errors;
create policy "doc loi cua minh" on public.student_errors for select to authenticated
  using (student_id = public.my_student_id() or public.teaches_student(student_id));
drop policy if exists "doc lich su loi" on public.student_error_log;
create policy "doc lich su loi" on public.student_error_log for select to authenticated
  using (student_id = public.my_student_id() or public.teaches_student(student_id));
drop policy if exists "doc luot soat loi" on public.soat_loi_luot;
create policy "doc luot soat loi" on public.soat_loi_luot for select to authenticated
  using (student_id = public.my_student_id() or public.teaches_student(student_id));
drop policy if exists "doc tra loi soat loi" on public.soat_loi_tra_loi;
create policy "doc tra loi soat loi" on public.soat_loi_tra_loi for select to authenticated
  using (exists (select 1 from public.soat_loi_luot l where l.luot_id = soat_loi_tra_loi.luot_id
                 and (l.student_id = public.my_student_id() or public.teaches_student(l.student_id))));

-- Nạp các lỗi đã ghi trước khi có bảng này: mỗi mã lỗi em từng chọn sai → "Cần sửa".
insert into public.student_errors (student_id, error_code, trang_thai, so_lan_sai, lan_sai_dau, lan_sai_cuoi, ku_goc)
select a.student_id, qa.error_code, 'can-sua', count(*), min(a.submitted_at), max(a.submitted_at), min(ed.ku_id)
  from public.quiz_answers qa
  join public.quiz_attempts a on a.attempt_id = qa.attempt_id
  join public.error_dictionary ed on ed.error_code = qa.error_code
 where not qa.is_correct and qa.error_code is not null and a.student_id is not null
 group by a.student_id, qa.error_code
on conflict (student_id, error_code) do nothing;

-- ---------------------------------------------------------------------------
-- Ngưỡng xem video 80% (SPEC M2: "Thời gian xem thực ≥ 80% thời lượng video").
create or replace function public.learning_completion(
  p_student text, p_ku text, p_before timestamptz default now())
returns jsonb language plpgsql stable security invoker set search_path = public as $$
declare u record; v record; watched integer; prep boolean; applied boolean; video_ok boolean;
begin
  if not (p_student = my_student_id() or teaches_student(p_student)) then
    raise exception 'Không có quyền';
  end if;

  select * into u from knowledge_units where ku_id = p_ku;
  if not found then raise exception 'Không có mục bài học'; end if;

  select * into v from contents where ku_id = p_ku and kind = 'video' order by content_id limit 1;

  select count(*) into watched
    from video_seconds
   where student_id = p_student and ku_id = p_ku
     and video_url = v.url and second_index < v.duration_sec
     and first_seen < p_before;

  video_ok := case
                when u.co_video = false then true
                when v.url is null or v.duration_sec is null or v.duration_sec <= 0 then null
                else watched >= ceil(v.duration_sec * .8)
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
    'prepared',              video_ok and prep,
    'lesson_complete',       video_ok and prep and applied,
    'activities_complete',   case when u.co_video = false then 0
                                  when video_ok then 1 else 0 end + prep::int + applied::int,
    'activities_required',   case when u.co_video = false then 2 else 3 end,
    'definition_version',    'flipped-v2-video80');
end $$;
revoke all on function public.learning_completion(text,text,timestamptz) from public;
grant execute on function public.learning_completion(text,text,timestamptz) to authenticated;
