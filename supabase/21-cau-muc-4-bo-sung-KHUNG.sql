-- =============================================================================
-- 21 · CÂU MỨC 4 BỔ SUNG — KHUNG ĐỂ HỌC SINH SOẠN. CHƯA CHẠY.
-- -----------------------------------------------------------------------------
-- CHỈ CHẠY SAU KHI KẾT THÚC CAN THIỆP (sau 16/10). Thêm câu hỏi giữa đợt là đổi
-- bài vận dụng mà học sinh nhóm thực nghiệm đang làm.
--
-- VÌ SAO CẦN — một lỗi hồi quy do mastery v2 gây ra
--
-- Tệp 09 thêm đúng MỘT câu mức 4 cho mỗi đơn vị, vì công thức mastery v1 lúc đó
-- chỉ cần "điểm bài mức 4 từ 6,5". Ngày 15/9 chuyển sang mastery v2, và v2 đòi
-- mức 3 phải có ÍT NHẤT 2 CÂU MỨC 4 KHÁC NHAU trong 12 câu gần nhất:
--
--     if ratio >= .8 and transfer >= 2 and tr >= .65 then lvl := 3;   -- tệp 18
--
-- Ngân hàng có nhiều nhất 1 câu mức 4 mỗi đơn vị → transfer không bao giờ đạt 2
-- → KHÔNG HỌC SINH NÀO CÓ THỂ ĐẠT MỨC 3, ở bất kỳ đơn vị nào, kể cả em làm đúng
-- tất cả. Mô phỏng 40 học sinh (dfle-engine/cli/mo-phong-v2.js) xác nhận: 0/560.
-- Đơn vị C1-B3-M3 còn tệ hơn: chỉ có 1 câu mức ≥ 3 nên trần là mức 1.
--
-- Cách sửa đúng là thêm câu hỏi, không phải hạ ngưỡng: "vận dụng trong tình
-- huống mới" đo bằng MỘT câu thì một lần đoán trúng là đủ lên mức cao nhất.
--
-- Cũng giải quyết luôn R02: quy tắc R02 hứa "giao bài toán thực tiễn" nhưng hệ
-- thống chưa có nội dung nào như vậy. Câu mức 4 đặt trong bối cảnh thực tiễn
-- chính là thứ đó, và trang /hoc/<ku>/van-dung tự lấy câu mức 3–4, không phải
-- sửa giao diện.
--
-- CẦN SOẠN 18 CÂU
--   10 đơn vị đã có Q06   → thêm Q07                        : 10 câu
--   C1-B3-M3, C1-LTC1, C1-LTC2, C1-CUOI chưa có câu mức 4   → thêm Q06, Q07 : 8 câu
--
-- ĐÂY LÀ VIỆC NÊN ĐỂ HỌC SINH LÀM. Soạn câu hỏi có phương án nhiễu gắn đúng quan
-- niệm sai là việc chứng minh rõ nhất "mức độ đóng góp độc lập của học sinh" khi
-- phỏng vấn. Ghi tên người soạn từng câu vào sổ nhật ký nghiên cứu.
--
-- Yêu cầu mỗi câu:
--   · tình huống MỚI (bối cảnh thực tiễn, hoặc nối hai đơn vị) — không phải bài
--     mức 3 làm khó thêm bằng số xấu
--   · 4 phương án, đúng 1 phương án đúng
--   · mỗi phương án nhiễu gắn một mã lỗi có trong error_dictionary nếu nó phản
--     ánh một quan niệm sai; không gán bừa cho đủ
--   · thời gian dự kiến 120–180 giây
--   · KHÔNG trùng với câu nào trong đề kiểm tra pre/post
-- =============================================================================

do $$
begin
  if to_regclass('public.questions') is null then
    raise exception E'\n\n>>> DỪNG LẠI: Phải chạy 01, 07, 09 trước tệp này. <<<\n';
  end if;
  if current_date < date '2026-10-17' then
    raise exception E'\n\n>>> DỪNG LẠI: Tệp này chỉ chạy SAU khi kết thúc can thiệp (sau 16/10/2026). <<<\n'
      '    Thêm câu hỏi giữa đợt là thay đổi bài vận dụng của nhóm thực nghiệm.\n';
  end if;
end $$;

-- -----------------------------------------------------------------------------
-- MẪU — một câu soạn sẵn để xem định dạng. Bỏ dấu -- ở đầu dòng khi dùng.
-- Câu này đã kiểm tra đáp án: 2/5 · 3/4 = 3/10 ; 3/10 < 1/3 nên cần mua thêm.
-- -----------------------------------------------------------------------------
-- insert into questions (question_id, ku_id, level, stem, correct_option, expected_time_sec) values
--   ('C1-B2-M2-Q07', 'C1-B2-M2', 4,
--    'Bạn Lan có 3/4 kg bột. Lan dùng 2/5 số bột đó để làm bánh. Công thức cần 1/3 kg bột. Lan đã dùng đủ bột theo công thức chưa?',
--    'A', 150)
-- on conflict (question_id) do nothing;
--
-- insert into question_options (question_id, option_key, option_text) values
--   ('C1-B2-M2-Q07', 'A', 'Chưa đủ: Lan mới dùng 3/10 kg, ít hơn 1/3 kg'),
--   ('C1-B2-M2-Q07', 'B', 'Đủ: Lan dùng 2/5 kg, nhiều hơn 1/3 kg'),
--   ('C1-B2-M2-Q07', 'C', 'Đủ: Lan dùng 23/20 kg'),
--   ('C1-B2-M2-Q07', 'D', 'Chưa đủ: Lan mới dùng 7/20 kg')
-- on conflict (question_id, option_key) do nothing;
--
-- insert into distractor_errors (question_id, option_key, error_code) values
--   ('C1-B2-M2-Q07', 'C', '<mã lỗi cộng thay vì nhân — tra error_dictionary>')
-- on conflict (question_id, option_key) do nothing;

-- -----------------------------------------------------------------------------
-- 18 CHỖ TRỐNG — học sinh soạn vào đây theo đúng mẫu trên
-- -----------------------------------------------------------------------------
--   C1-B1-M1-Q07     ☐ người soạn: ______   ngày: ______
--   C1-B1-M1B-Q07    ☐
--   C1-B1-M2-Q07     ☐
--   C1-B2-M1-Q07     ☐
--   C1-B2-M2-Q07     ☐   (có thể dùng câu mẫu ở trên)
--   C1-B2-M3-Q07     ☐
--   C1-B3-M1-Q07     ☐
--   C1-B3-M2-Q07     ☐
--   C1-B4-M1-Q07     ☐
--   C1-B4-M2-Q07     ☐
--   C1-B3-M3-Q06     ☐       C1-B3-M3-Q07     ☐
--   C1-LTC1-Q06      ☐       C1-LTC1-Q07      ☐
--   C1-LTC2-Q06      ☐       C1-LTC2-Q07      ☐
--   C1-CUOI-Q06      ☐       C1-CUOI-Q07      ☐

-- -----------------------------------------------------------------------------
-- KIỂM TRA — mọi dòng phải là ✅ thì mức 3 mới đạt được ở mọi đơn vị
-- -----------------------------------------------------------------------------
select k.ku_id,
       count(q.*) filter (where q.level = 4) as cau_muc_4,
       count(q.*) filter (where q.level >= 3) as cau_muc_3_4,
       case when count(q.*) filter (where q.level = 4) >= 2 then '✅ đạt được mức 3'
            when count(q.*) filter (where q.level >= 3) >= 2 then '⚠ trần là mức 2'
            else '❌ trần là mức 1' end as tran_mastery
  from knowledge_units k left join questions q using (ku_id)
 where k.ku_id like 'C1-%'
 group by k.ku_id, k.order_index
 order by k.order_index;
