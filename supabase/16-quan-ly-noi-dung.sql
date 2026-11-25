-- ===========================================================================
-- SỬA CHƯƠNG TRÌNH VÀ NGÂN HÀNG CÂU HỎI NGAY TRONG WEB — chạy sau 07
--
-- Trước tệp này, muốn thêm một câu hỏi thì phải soạn ở soan-cau-hoi.html, xuất
-- ra SQL, rồi dán vào SQL Editor của Supabase. Giáo viên không làm được một
-- mình, nên ngân hàng câu hỏi đứng yên suốt đợt thực nghiệm.
--
-- Vì sao gom hết vào MỘT hàm thay vì để trang web gọi thẳng từng bảng: sửa một
-- câu hỏi là sửa ba bảng cùng lúc (questions, question_options,
-- distractor_errors). Làm ba lệnh riêng thì lệnh thứ hai hỏng sẽ để lại một câu
-- hỏi có đề mới mà đáp án cũ — học sinh làm bài với dữ liệu sai lệch mà không
-- ai biết. Trong một hàm thì hoặc xong cả ba, hoặc không đổi gì cả.
--
-- Hàm KHÔNG mở cho người dùng: chỉ service_role ở phía máy chủ gọi được, sau
-- khi /api/quan-ly đã kiểm tra vai trò giáo viên.
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- KIỂM TRA ĐIỀU KIỆN TRƯỚC
-- Khối này không sửa gì cả. Nó chỉ dừng lại với một câu tiếng Việt đọc được nếu
-- tệp này bị chạy trước tệp mà nó phụ thuộc vào.
-- ---------------------------------------------------------------------------
do $$
begin
  if to_regclass('public.questions') is null or to_regclass('public.question_options') is null then
    raise exception E'\n\n>>> DỪNG LẠI: Phải chạy 01-schema.sql TRƯỚC tệp này. <<<\n';
  end if;
  if to_regclass('public.distractor_errors') is null or to_regclass('public.error_dictionary') is null then
    raise exception E'\n\n>>> DỪNG LẠI: Phải chạy 01-schema.sql TRƯỚC tệp này. <<<\n';
  end if;
end $$;


-- ---------------------------------------------------------------------------
-- Lưu NGUYÊN TỬ: hoặc xong cả khối, hoặc không đổi gì.
-- ---------------------------------------------------------------------------
create or replace function public.manage_learning_content(p_kind text, p_action text, p_data jsonb)
returns void language plpgsql set search_path = public as $$
declare
  v_id text; v_parent text; v_seen text[]; v_option jsonb;
begin
  -- Kiểm tra hình dạng dữ liệu trước khi đụng vào bảng nào.
  if p_kind is null or p_action is null or p_data is null
     or jsonb_typeof(p_data) <> 'object'
     or p_kind not in ('unit','question')
     or p_action not in ('create','update','delete') then
    raise exception 'Thao tác không hợp lệ';
  end if;

  v_id := case when p_kind = 'unit' then p_data->>'ku_id' else p_data->>'question_id' end;
  -- Mã đi vào URL và vào tên tệp xuất dữ liệu, nên giới hạn ký tự ngay từ đây.
  if v_id is null or v_id !~ '^[A-Za-z0-9_-]{1,80}$' then
    raise exception 'Mã chỉ gồm chữ, số, dấu gạch ngang và gạch dưới';
  end if;

  -- Khoá theo phiên: hai giáo viên cùng sửa quan hệ tiên quyết một lúc có thể
  -- tạo ra vòng lặp mà mỗi người kiểm tra riêng đều thấy hợp lệ.
  perform pg_advisory_xact_lock(16001);

  if p_kind = 'unit' then
    if p_action = 'delete' then
      -- Không tự kiểm tra "mục này đã dùng chưa": khoá ngoại làm việc đó chắc
      -- chắn hơn, và báo lỗi khi mục đã có bài làm hay nhật ký tiết dạy.
      delete from knowledge_units where ku_id = v_id;
      return;
    end if;
    if length(trim(coalesce(p_data->>'ku_name',''))) = 0
       or length(trim(coalesce(p_data->>'lesson_id',''))) = 0 then
      raise exception 'Nhập tên mục và bài học';
    end if;
    if coalesce((p_data->>'order_index')::int, -1) < 0 then
      raise exception 'Thứ tự phải từ 0 trở lên';
    end if;

    -- Đi ngược chuỗi tiên quyết để chặn vòng lặp. Một vòng lặp ở đây khiến quy
    -- tắc R05 ("hổng kiến thức nền") đẩy học sinh đi vòng tròn mãi không ra.
    v_parent := nullif(p_data->>'prerequisite_ku','');
    v_seen := array[v_id];
    while v_parent is not null loop
      if v_parent = any(v_seen) then raise exception 'Quan hệ tiên quyết tạo vòng lặp'; end if;
      v_seen := array_append(v_seen, v_parent);
      if not exists (select 1 from knowledge_units where ku_id = v_parent) then
        raise exception 'Mục tiên quyết không tồn tại';
      end if;
      select prerequisite_ku into v_parent from knowledge_units where ku_id = v_parent;
    end loop;

    if p_action = 'create' then
      insert into knowledge_units(ku_id, ku_name, lesson_id, order_index, prerequisite_ku)
      values (v_id, trim(p_data->>'ku_name'), trim(p_data->>'lesson_id'),
              (p_data->>'order_index')::int, nullif(p_data->>'prerequisite_ku',''));
    else
      update knowledge_units
         set ku_name = trim(p_data->>'ku_name'),
             lesson_id = trim(p_data->>'lesson_id'),
             order_index = (p_data->>'order_index')::int,
             prerequisite_ku = nullif(p_data->>'prerequisite_ku','')
       where ku_id = v_id;
      if not found then raise exception 'Mục không còn tồn tại'; end if;
    end if;

  else
    -- CÂU HỎI ĐÃ CÓ BÀI LÀM THÌ KHÔNG SỬA, KHÔNG XOÁ.
    -- Sửa đề của một câu mà học sinh đã trả lời là làm hỏng bằng chứng: bảng
    -- quiz_answers vẫn ghi "em ấy sai câu này", nhưng "câu này" giờ đã là một
    -- câu khác. Mọi phân tích về mã lỗi sau đó đều nói về một đề không tồn tại
    -- lúc học sinh làm bài.
    if exists (select 1 from quiz_answers where question_id = v_id) then
      raise exception 'Câu hỏi đã có bài làm. Hãy tạo bản sao để bảo toàn kết quả cũ.';
    end if;

    if p_action = 'delete' then delete from questions where question_id = v_id; return; end if;
    if length(trim(coalesce(p_data->>'stem',''))) = 0 then raise exception 'Nhập đề bài'; end if;
    if not exists (select 1 from knowledge_units where ku_id = p_data->>'ku_id') then
      raise exception 'Chọn mục bài học hợp lệ';
    end if;
    if coalesce((p_data->>'level')::int, 0) not between 1 and 4
       or coalesce((p_data->>'expected_time_sec')::int, 0) not between 1 and 7200 then
      raise exception 'Cấp độ hoặc thời gian không hợp lệ';
    end if;
    if coalesce(p_data->>'correct_option','') not in ('A','B','C','D') then
      raise exception 'Chọn đáp án đúng';
    end if;
    if coalesce(jsonb_typeof(p_data->'options'),'null') <> 'array'
       or jsonb_array_length(p_data->'options') <> 4 then
      raise exception 'Cần đủ 4 đáp án';
    end if;
    if (select count(distinct x->>'option_key')
          from jsonb_array_elements(p_data->'options') x
         where x->>'option_key' in ('A','B','C','D')
           and length(trim(coalesce(x->>'option_text',''))) > 0) <> 4 then
      raise exception 'Nhập đầy đủ đáp án A, B, C, D';
    end if;

    if p_action = 'create' then
      insert into questions(question_id, ku_id, stem, level, expected_time_sec, correct_option)
      values (v_id, p_data->>'ku_id', p_data->>'stem', (p_data->>'level')::int,
              (p_data->>'expected_time_sec')::int, p_data->>'correct_option');
    else
      update questions
         set ku_id = p_data->>'ku_id', stem = p_data->>'stem',
             level = (p_data->>'level')::int,
             expected_time_sec = (p_data->>'expected_time_sec')::int,
             correct_option = p_data->>'correct_option'
       where question_id = v_id;
      if not found then raise exception 'Câu hỏi không còn tồn tại'; end if;
    end if;

    -- Xoá rồi nạp lại toàn bộ phương án, để không còn sót phương án cũ.
    delete from distractor_errors where question_id = v_id;
    delete from question_options where question_id = v_id;
    for v_option in select * from jsonb_array_elements(p_data->'options') loop
      insert into question_options values (v_id, v_option->>'option_key', v_option->>'option_text');
      -- Chỉ phương án SAI mới gắn được mã lỗi. Gắn mã lỗi vào đáp án đúng thì
      -- em nào làm đúng cũng bị chẩn đoán là mắc quan niệm sai.
      if nullif(v_option->>'error_code','') is not null
         and v_option->>'option_key' <> p_data->>'correct_option' then
        insert into distractor_errors values (v_id, v_option->>'option_key', v_option->>'error_code');
      end if;
    end loop;
  end if;
end $$;

-- Không mở cho người dùng đăng nhập. Học sinh gọi được hàm này là sửa được đề
-- bài và đáp án của chính mình.
revoke all on function public.manage_learning_content(text,text,jsonb) from public, anon, authenticated;
grant execute on function public.manage_learning_content(text,text,jsonb) to service_role;

comment on function public.manage_learning_content(text,text,jsonb) is
  'Thêm/sửa/xoá đơn vị kiến thức và câu hỏi trong một giao dịch. Chỉ service_role gọi được, sau khi API đã kiểm tra vai trò giáo viên.';
