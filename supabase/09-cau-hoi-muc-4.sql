-- ===========================================================================
-- DFLE-M7 · 9 CÂU HỎI MỨC 4 (VẬN DỤNG CAO) — MỘT CÂU CHO MỖI MỤC
-- Chạy SAU tệp 07-noi-dung-chuong-1.sql.
--
-- VÌ SAO CẦN TỆP NÀY
-- Bộ 70 câu ở tệp 07 dừng ở mức 3. Mà thang mức làm chủ (mastery) quy định:
--
--   mức 3 = vận dụng được trong TÌNH HUỐNG MỚI, cần điểm bài mức 4 từ 6,5
--           trở lên VÀ điểm quiz từ 8 trở lên.
--
-- Không có câu mức 4 nào thì `transferScore` luôn là null, và KHÔNG học sinh nào
-- lên nổi mastery 3 — kể cả em làm đúng tất cả. Đúng một lỗi cùng họ với trần
-- LES 65: thang đo có bốn mức nhưng mức trên cùng không có đường nào chạm tới.
--
-- Chín câu dưới đây đều là tình huống MỚI so với bài mẫu: hoặc đặt trong bối
-- cảnh thực tiễn phải tự lập biểu thức, hoặc phải nối hai đơn vị kiến thức, chứ
-- không phải bài mức 3 làm khó thêm bằng số xấu.
--
-- Phương án nhiễu vẫn được gắn mã lỗi như các câu khác, nên một em sai ở mức 4
-- vẫn được chẩn đoán đúng quan niệm sai chứ không chỉ bị trừ điểm.
--
-- Trang /hoc/<ku>/van-dung lấy các câu mức >= 3, nên chín câu này tự động vào
-- bài vận dụng sau giờ học, không phải sửa gì thêm ở giao diện.
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- KIỂM TRA ĐIỀU KIỆN TRƯỚC
-- Khối này không sửa gì cả. Nó chỉ dừng lại với một câu tiếng Việt đọc được nếu
-- tệp này được chạy trước tệp mà nó phụ thuộc vào — thay cho thông báo kiểu
-- `relation "..." does not exist` không nói cho ai biết phải làm gì.
-- ---------------------------------------------------------------------------
do $$
begin
  if to_regclass('public.questions') is null then
    raise exception E'\n\n>>> DỪNG LẠI: Phải chạy 01-schema.sql TRƯỚC tệp này. <<<\n';
  end if;
  if (select count(*) from knowledge_units where ku_id like 'C1-%%') = 0 then
    raise exception E'\n\n>>> DỪNG LẠI: Phải chạy 07-noi-dung-chuong-1.sql TRƯỚC tệp này. 10 câu mức 4 gắn vào các mục có video của Chương I và vào các mã lỗi do tệp 07 nạp. <<<\n';
  end if;
end $$;


insert into questions (question_id, ku_id, level, stem, correct_option, expected_time_sec) values
  ('C1-B1-M1-Q06', 'C1-B1-M1', 4,
   'Nhiệt độ ở một trạm quan trắc lúc 6 giờ là −2,5 °C. Đến 12 giờ nhiệt độ tăng thêm 7/2 °C. Gọi a là nhiệt độ lúc 12 giờ và b là số đối của a. Cặp (a ; b) nào đúng?',
   'A', 120),
  ('C1-B1-M1B-Q06', 'C1-B1-M1B', 4,
   'Lúc 5 giờ nhiệt độ ngoài trời là −7/4 °C. Mỗi giờ nhiệt độ tăng thêm 1/4 °C. Đến 7 giờ, nhiệt độ là bao nhiêu và điểm biểu diễn nó trên trục số nằm giữa hai số nguyên nào?',
   'A', 150),
  ('C1-B1-M2-Q06', 'C1-B1-M2', 4,
   'Ba bạn ghi mức nước của ruộng nhà mình so với mức chuẩn: An −3/4 m, Bình −0,7 m, Chi −5/8 m. Sắp xếp mức nước của ba bạn theo thứ tự TĂNG DẦN.',
   'A', 120),
  ('C1-B2-M1-Q06', 'C1-B2-M1', 4,
   'Một bình đang chứa 3/4 lít nước. Bạn An rót ra 0,5 lít, sau đó đổ thêm vào 2/5 lít. Hỏi trong bình còn bao nhiêu lít nước?',
   'A', 120),
  ('C1-B2-M2-Q06', 'C1-B2-M2', 4,
   'Cho x = 1/2 và y = −1/3. Tính giá trị của biểu thức A = x − (y − 1/6) + (−x + y).',
   'A', 120),
  ('C1-B2-M3-Q06', 'C1-B2-M3', 4,
   'Một mảnh vải dài 9/4 m được cắt thành các đoạn bằng nhau, mỗi đoạn dài 3/8 m. Hỏi cắt được bao nhiêu đoạn?',
   'A', 120),
  ('C1-B3-M1-Q06', 'C1-B3-M1', 4,
   'Cho M = (−2/3)^4 và N = −(2/3)^4. Khẳng định nào sau đây ĐÚNG?',
   'A', 120),
  ('C1-B3-M2-Q06', 'C1-B3-M2', 4,
   'Rút gọn P = (3^5 · 3^4) : 3^3. Kết quả P bằng luỹ thừa nào của 3?',
   'A', 120),
  ('C1-B4-M1-Q06', 'C1-B4-M1', 4,
   'Một khách mua 3 gói bánh giá 12 500 đồng mỗi gói và 2 hộp sữa giá 9 000 đồng mỗi hộp, rồi đưa tờ 100 000 đồng. Cách viết biểu thức và số tiền trả lại nào ĐÚNG?',
   'A', 150),
  ('C1-B4-M2-Q06', 'C1-B4-M2', 4,
   'Tìm x, biết 2/3 · x − 1/2 = 1/6.',
   'A', 150)
on conflict (question_id) do update set
  ku_id = excluded.ku_id, level = excluded.level, stem = excluded.stem,
  correct_option = excluded.correct_option, expected_time_sec = excluded.expected_time_sec;

insert into question_options (question_id, option_key, option_text) values
  ('C1-B1-M1-Q06', 'A', 'a = 1 °C ; b = −1'),
  ('C1-B1-M1-Q06', 'B', 'a = −6 °C ; b = 6'),
  ('C1-B1-M1-Q06', 'C', 'a = 1 °C ; b = 1'),
  ('C1-B1-M1-Q06', 'D', 'a = −1 °C ; b = 1'),

  ('C1-B1-M1B-Q06', 'A', '−5/4 °C ; nằm giữa −2 và −1'),
  ('C1-B1-M1B-Q06', 'B', '−5/4 °C ; nằm giữa −1 và 0'),
  ('C1-B1-M1B-Q06', 'C', '5/4 °C ; nằm giữa 1 và 2'),
  ('C1-B1-M1B-Q06', 'D', '−9/4 °C ; nằm giữa −3 và −2'),

  ('C1-B1-M2-Q06', 'A', 'An, Bình, Chi'),
  ('C1-B1-M2-Q06', 'B', 'Chi, Bình, An'),
  ('C1-B1-M2-Q06', 'C', 'Bình, An, Chi'),
  ('C1-B1-M2-Q06', 'D', 'An, Chi, Bình'),

  ('C1-B2-M1-Q06', 'A', '13/20 lít'),
  ('C1-B2-M1-Q06', 'B', '1/3 lít'),
  ('C1-B2-M1-Q06', 'C', '1/5 lít'),
  ('C1-B2-M1-Q06', 'D', '33/20 lít'),

  ('C1-B2-M2-Q06', 'A', '1/6'),
  ('C1-B2-M2-Q06', 'B', '−1/6'),
  ('C1-B2-M2-Q06', 'C', '1'),
  ('C1-B2-M2-Q06', 'D', '−1'),

  ('C1-B2-M3-Q06', 'A', '6 đoạn'),
  ('C1-B2-M3-Q06', 'B', '27/32 đoạn'),
  ('C1-B2-M3-Q06', 'C', '32/27 đoạn'),
  ('C1-B2-M3-Q06', 'D', '3 đoạn'),

  ('C1-B3-M1-Q06', 'A', 'M > N, và M với N là hai số đối nhau'),
  ('C1-B3-M1-Q06', 'B', 'M = N, cả hai cùng bằng −16/81'),
  ('C1-B3-M1-Q06', 'C', 'M > N, với M = 16/3 và N = −16/3'),
  ('C1-B3-M1-Q06', 'D', 'M < N, vì luỹ thừa của một số âm luôn là số âm'),

  ('C1-B3-M2-Q06', 'A', 'P = 3^6'),
  ('C1-B3-M2-Q06', 'B', 'P = 3^17'),
  ('C1-B3-M2-Q06', 'C', 'P = 3^3'),
  ('C1-B3-M2-Q06', 'D', 'P = 3^12'),

  ('C1-B4-M1-Q06', 'A', '100 000 − (3 · 12 500 + 2 · 9 000) = 44 500 đồng'),
  ('C1-B4-M1-Q06', 'B', '100 000 − 3 · 12 500 + 2 · 9 000 = 80 500 đồng'),
  ('C1-B4-M1-Q06', 'C', '100 000 − (12 500 + 9 000) · 3 = 35 500 đồng'),
  ('C1-B4-M1-Q06', 'D', '100 000 − (3 + 2) · (12 500 + 9 000) = −7 500 đồng'),

  ('C1-B4-M2-Q06', 'A', 'x = 1'),
  ('C1-B4-M2-Q06', 'B', 'x = −1/2'),
  ('C1-B4-M2-Q06', 'C', 'x = 0'),
  ('C1-B4-M2-Q06', 'D', 'x = 4/9')
on conflict (question_id, option_key) do update set option_text = excluded.option_text;

-- Phương án nhiễu -> mã lỗi. Chỉ gắn cho phương án thật sự sinh ra từ một quan
-- niệm sai có trong từ điển; phương án chỉ là nhầm lẫn tính toán thì để trống,
-- vì gắn bừa một mã lỗi sẽ làm quy tắc R03 chẩn đoán sai.
insert into distractor_errors (question_id, option_key, error_code) values
  ('C1-B1-M1-Q06', 'B', 'E-CT-03'),   -- cộng hai số trái dấu: cộng giá trị tuyệt đối, giữ dấu số trước
  ('C1-B1-M1-Q06', 'C', 'E-HT-02'),   -- nhầm số đối với số nghịch đảo (nghịch đảo của 1 là 1)

  ('C1-B1-M1B-Q06', 'B', 'E-HT-03'),   -- đọc đúng số nhưng đặt nhầm khoảng trên trục số
  ('C1-B1-M1B-Q06', 'C', 'E-HT-03'),   -- bỏ dấu âm rồi đếm về phía phải điểm O

  ('C1-B1-M2-Q06', 'B', 'E-TT-01'),   -- so sánh số âm theo giá trị tuyệt đối nên đảo ngược thứ tự
  ('C1-B1-M2-Q06', 'D', 'E-TT-02'),   -- so tử với tử, mẫu với mẫu, không đưa về cùng mẫu

  ('C1-B2-M1-Q06', 'B', 'E-CT-01'),   -- 1/4 + 2/5 = 3/9
  ('C1-B2-M1-Q06', 'C', 'E-CT-02'),   -- quy đồng mẫu nhưng giữ nguyên tử số

  ('C1-B2-M2-Q06', 'B', 'E-DN-01'),   -- bỏ ngoặc có dấu trừ, chỉ đổi dấu số hạng đầu

  ('C1-B2-M3-Q06', 'B', 'E-NC-01'),   -- chia phân số nhưng nhân thẳng, không nghịch đảo
  ('C1-B2-M3-Q06', 'C', 'E-NC-02'),   -- nghịch đảo cả hai phân số

  ('C1-B3-M1-Q06', 'B', 'E-LT-02'),   -- không phân biệt (−a)^n với −a^n
  ('C1-B3-M1-Q06', 'C', 'E-LT-03'),   -- luỹ thừa của một thương chỉ nâng cho tử
  ('C1-B3-M1-Q06', 'D', 'E-LT-01'),   -- tin luỹ thừa cơ số âm luôn âm

  ('C1-B3-M2-Q06', 'B', 'E-LT-04'),   -- nhân hai luỹ thừa cùng cơ số thì nhân số mũ
  ('C1-B3-M2-Q06', 'C', 'E-LT-05'),   -- chia hai luỹ thừa cùng cơ số thì chia số mũ

  ('C1-B4-M1-Q06', 'B', 'E-TU-02'),   -- bỏ ngoặc gộp, làm phần ngoài trước

  ('C1-B4-M2-Q06', 'B', 'E-CV-01'),   -- chuyển vế mà giữ nguyên dấu
  ('C1-B4-M2-Q06', 'C', 'E-CV-02')    -- chuyển thừa số sang vế kia bằng cách trừ
on conflict (question_id, option_key) do update set error_code = excluded.error_code;

-- ------------------------------------------------------------- kiểm tra nhanh
-- select level, count(*) from questions where question_id like 'C1-%' group by level order by level;
--   kỳ vọng: 1 -> 17 câu, 2 -> 36 câu, 3 -> 17 câu, 4 -> 10 câu  (tổng 80)
--
-- Mỗi mục hiện có ĐÚNG MỘT câu mức 4, nên điểm tình huống mới của một mục chỉ
-- nhận hai giá trị: 0 hoặc 10. Em làm đúng câu mức 4 của mục đó VÀ có điểm quiz
-- từ 8 trở lên thì đạt mastery 3 — trước khi có tệp này, mức 3 là bất khả.
-- Muốn thang mịn hơn thì soạn thêm câu mức 4 cho từng mục bằng công cụ
-- soan-cau-hoi.html; công thức không phải sửa gì.
