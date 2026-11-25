/**
 * FILE NÀY LÀM GÌ: Tệp dữ liệu tĩnh chứa danh sách mục kiến thức, lỗi sai thường gặp hoặc nội dung bài học Toán 9.
 * AI DÙNG: dùng chung
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: không gọi mô-đun nội bộ khác
 * CẤU TRÚC DỮ LIỆU: mảng các đối tượng bài/mục kiến thức Toán 9 (ví dụ { id, bai, muc, name, ... }).
 */
/**
 * GỢI Ý KHI LÀM SAI — trò chơi ôn kiến thức nền (Toán 9)
 * ---------------------------------------------------------------------------
 * Mỗi mục: mảng gợi ý theo đúng thứ tự câu/cặp/thẻ trong t9-tro-choi-nen.js.
 *   noiCot  : gợi ý cho từng ô bên TRÁI (cap[i])
 *   banBong, leoNui : gợi ý cho từng câu (cau[i])
 *   phanLoai: gợi ý cho từng thẻ (muc[i])
 * Gợi ý nhắc lại quy tắc / cách nghĩ, KHÔNG nói thẳng đáp án.
 * dienSo, dungSai, sapXep, latThe dùng gợi ý tự sinh trong TroChoiNen.tsx.
 */
export const GOI_Y_NEN = {
  /* ----- Chương I ----- */
  'C1-B1-M2': [
    'Điểm có hoành độ x = 0 thì nằm trên trục tung.',
    'Điểm có tung độ y = 0 thì nằm trên trục hoành.',
    'x âm, y dương: bên TRÁI trục Oy, phía TRÊN trục Ox.',
    'x dương, y âm: bên PHẢI trục Oy, phía DƯỚI trục Ox.',
    'x dương, y dương: góc trên bên phải.'
  ],
  'C1-B3-M1': [
    '"Tổng" là phép cộng.',
    '"x hơn y 4 đơn vị" nghĩa là lấy x trừ y được 4.',
    '"Gấp đôi số x" là 2 nhân x.',
    'Tiền vở = 3 · giá một quyển; tiền bút = 2 · giá một cái; cộng lại.',
    '"Một nửa" là chia cho 2.',
    '"Giảm đi 5" là trừ 5 từ chính số x.'
  ],
  'C1-B3-M1C': [
    'Làm hết việc trong n giờ thì mỗi giờ làm 1/n công việc.',
    'Làm hết việc trong n giờ thì mỗi giờ làm 1/n công việc.',
    'Mỗi giờ làm 1/n công việc thì cần n giờ để xong.',
    'Cộng hai phân số cùng mẫu: cộng tử, giữ mẫu, rồi rút gọn.',
    'Quy đồng mẫu 6: 1/2 = 3/6, 1/3 = 2/6.'
  ],
  /* ----- Chương II ----- */
  'C2-B5-M1': [
    'Với hai số âm, số nào gần 0 hơn thì lớn hơn.',
    'Đổi 1/2 ra số thập phân rồi so sánh.',
    'Với hai số âm, số nào gần 0 hơn thì lớn hơn. So sánh 1/3 và 1/4 trước.',
    'Số 0 lớn hơn mọi số âm.',
    'Đổi 5/2 ra số thập phân: chia 5 cho 2.'
  ],
  'C2-B6-M1': [
    'Dạng ax + b = 0 với a ≠ 0, ẩn có số mũ 1.',
    'Ẩn có số mũ 2 thì không còn là bậc nhất.',
    'Hệ số của x bằng 0 thì không phải bậc nhất.',
    'a = −1 vẫn khác 0.',
    'Ẩn nằm ở mẫu thì không có dạng ax + b = 0.',
    '3x = 0 chính là 3x + 0 = 0 với a = 3.',
    'Có hai ẩn x, y thì không phải phương trình MỘT ẩn.',
    'x/2 chính là (1/2)·x, a = 1/2 ≠ 0.'
  ],
  /* ----- Chương III ----- */
  'C3-B7-M2': [
    'Giá trị tuyệt đối là khoảng cách tới 0, luôn không âm.',
    'Tính 3 − 7 trước rồi lấy giá trị tuyệt đối.',
    'Khoảng cách từ 0 tới chính nó là bao nhiêu?',
    'Bỏ dấu trừ đi, giá trị tuyệt đối không âm.',
    'x âm thì |x| là số đối của x.'
  ],
  'C3-B8-M1': [
    'Số chính phương là bình phương của một số tự nhiên: 1, 4, 9, 16, 25, 36, 49…',
    'Lấy 12 chia cho 4.',
    'Căn bậc hai số học là số KHÔNG ÂM có bình phương bằng 16.',
    'Tính trong ngoặc trước: 2 · 3, rồi bình phương.',
    'Nhân 25 với 4 (bốn lần 25).',
    'Liệt kê: 6² = 36, 7² = 49, 8² = 64.'
  ],
  'C3-B9-M1': [
    'Tìm số chính phương lớn nhất chia hết 12.',
    'Tìm số chính phương lớn nhất chia hết 18.',
    'Tìm số chính phương lớn nhất chia hết 50.',
    'Tìm số chính phương lớn nhất chia hết 75.',
    'Tìm số chính phương lớn nhất chia hết 45.'
  ],
  'C3-LTC': [
    'Số không âm nào bình phương lên bằng 49?',
    'Căn bậc ba của số âm là số âm: số nào lập phương bằng −125?',
    '√(a²) = |a|.',
    '√(a²) = |a|, kết quả không âm.',
    '√a · √b = √(ab). Tính 2 · 8 trước.',
    '√a : √b = √(a : b). Tính 50 : 2 trước.'
  ],
  'C3-B9-M3': [
    'Đồng dạng với 2√3 khi biểu thức dưới dấu căn cũng là 3.',
    'Dưới dấu căn có phải là 3 không?',
    'Dưới dấu căn là 2, không phải 3.',
    'Dưới dấu căn là 6, không phải 3.',
    'Dưới dấu căn có phải là 3 không?',
    'Dưới dấu căn là 5, không phải 3.',
    'Số 3 không có dấu căn.',
    '√3/2 = (1/2)·√3, dưới dấu căn là 3.'
  ],
  /* ----- Chương IV ----- */
  'C4-B12-M1': [
    'Cạnh huyền là cạnh đối diện góc vuông A.',
    'Cạnh đối là cạnh không chứa đỉnh B.',
    'sin = đối / huyền (nhớ: "sin đi học").',
    'cos = kề / huyền (nhớ: "cos không hư").',
    'Nhìn nửa tam giác đều: cạnh đối góc 30° bằng nửa cạnh huyền.',
    'cos 30° = sin 60°.'
  ],
  'C4-B12-M2': [
    'tan = đối / kề (nhớ: "tan đoàn kết").',
    'cot = kề / đối, là nghịch đảo của tan.',
    'Tam giác vuông cân: hai cạnh góc vuông bằng nhau.',
    'tan 60° = sin 60° : cos 60°.',
    'cot 60° = 1 : tan 60°, rồi trục căn ở mẫu.'
  ],
  /* ----- Chương V ----- */
  'C5-B13-M2': [
    'Quay hình 180° quanh giao điểm hai đường chéo, hình có trùng lại không?',
    'Quay 180° quanh giao điểm hai đường chéo.',
    'Quay tam giác 180° thì đỉnh chĩa xuống — có trùng không?',
    'Hình bình hành: giao điểm hai đường chéo là tâm đối xứng.',
    'Hai đáy dài khác nhau thì quay 180° có trùng không?',
    'Hình thoi cũng là hình bình hành đặc biệt.',
    'Quay chữ A ngược 180°, nó còn đọc là A không?',
    'Quay chữ H ngược 180°, nó còn là H không?'
  ],
  'C5-B14-M2': [
    'Hai tia đối nhau tạo thành góc bẹt — nửa vòng quay.',
    'Góc vuông là một phần tư vòng quay.',
    'Đi trọn một vòng tròn.',
    'Lớn hơn 90° và nhỏ hơn 180° là góc gì?',
    'Nhỏ hơn 90° là góc gì?'
  ],
  'C5-B15-M3': [
    'Tính 5² và 3² rồi trừ.',
    'Giữ π, trừ hai hệ số: 25 − 9.',
    'Tính 6² và 4² rồi trừ.',
    'Tính 10² và 8² rồi trừ.',
    'Tính 4² và 1² rồi trừ.'
  ],
  'C5-B16-M2': [
    'Cạnh huyền là OM: AM² = OM² − OA².',
    'Cạnh huyền là OM: OM² = OA² + AM².',
    'AM² = OM² − OA² = 100 − 36.',
    'Tính 8² và 6² rồi cộng.',
    'Cạnh huyền luôn nằm đối diện góc nào?',
    'Vuông góc nghĩa là tạo góc vuông.'
  ],
  'C5-B16-M3': [
    'Trung trực đi qua trung điểm và vuông góc với đoạn thẳng.',
    '"Phân giác" = chia đôi góc.',
    'Trường hợp bằng nhau riêng của tam giác vuông: cạnh huyền – cạnh góc vuông.',
    'Tam giác cân có gì bằng nhau?',
    'Mọi điểm trên trung trực có tính chất gì với hai đầu đoạn thẳng?'
  ],
  'C5-B17-M2': [
    'Cộng hai bán kính.',
    'Lấy bán kính lớn trừ bán kính nhỏ.',
    'Trên trục số, 7 đứng trước 8.',
    'Cộng hai bán kính.',
    'Tính 6 − 4 trước rồi so sánh.'
  ],
  /* ----- Chương VI ----- */
  'C6-B18-M2': [
    'Đối xứng qua Oy: đổi dấu x, giữ nguyên y.',
    'Đối xứng qua Oy: đổi dấu x, giữ nguyên y.',
    'Điểm nằm trên Ox có tung độ bằng 0.',
    'Gốc toạ độ có cả x và y bằng 0.',
    'Phía dưới Ox thì tung độ âm.'
  ],
  'C6-B20-M1': [
    '−b/a = −(−6)/2. Chú ý hai dấu trừ.',
    'c/a = −5 : 1.',
    'Tính S² = 25 rồi trừ 2P = 12.',
    'Có nghiệm khi biệt thức không âm.',
    '−b/a = −9 : 3.',
    'c/a = 2 : 4, rút gọn.'
  ],
  'C6-B20-M3': [
    'Tổng là phép cộng.',
    'Tích là phép nhân.',
    'Thử từng cặp: cặp nào cộng được 7 VÀ nhân được 10?',
    'Âm nhân dương được số âm.',
    'Tổng bằng 0 thì hai số đối nhau.'
  ],
  'C6-B21-M1': [
    '"Hơn 3 m" là cộng thêm 3.',
    'Diện tích = dài × rộng.',
    'Số liền sau lớn hơn 1 đơn vị.',
    'Tích là phép nhân hai số.',
    'Chu vi = 2 × (dài + rộng). Cộng (x + 3) + x trước.',
    'Hai số chẵn liên tiếp cách nhau 2 đơn vị.'
  ],
  'C6-B21-M2': [
    'Thời gian = quãng đường : vận tốc.',
    'Làm hết việc trong x giờ thì mỗi giờ làm 1/x công việc.',
    'Xuôi dòng: nước đẩy thêm, vận tốc được cộng.',
    'Ngược dòng: nước cản lại, vận tốc bị trừ.',
    'Mẫu số phải khác 0.'
  ],
  /* ----- Chương VII ----- */
  'C7-B24-M2': [
    'Cộng các số rồi chia cho số lượng số (3).',
    'Cộng hai số rồi chia 2.',
    'Cộng bốn số rồi chia 4.',
    'Lấy tổng điểm chia cho số bạn.',
    'Các số bằng nhau thì trung bình bằng chính số đó.'
  ],
  'C7-B24-M3': [
    'Tỉ số phần trăm = 5 : 20 × 100%.',
    '8 : 40 × 100%.',
    '14 : 40 × 100%.',
    '9 : 30 × 100%.',
    '12 : 48 × 100%. Rút gọn 12/48 trước.',
    '1 : 4 × 100%.'
  ],
  'C7-B24-M4': [
    'Tên biểu đồ nói lên hình vẽ của nó.',
    'Tên biểu đồ nói lên hình vẽ của nó.',
    '"Hình quạt tròn": vẽ trên hình gì?',
    'Trục ngang là nơi đặt chân các cột.',
    'Chiều cao cột cho biết bao nhiêu lần xuất hiện.'
  ],
  /* ----- Chương VIII ----- */
  'C8-B25-M1': [
    'Đồng xu có mấy mặt?',
    'Xúc xắc có mấy mặt?',
    'Số chẵn là số chia hết cho 2, từ 1 đến 6.',
    'Đếm số thẻ.',
    'Lớn hơn 4 thì không tính chính số 4.',
    'Viết theo thứ tự: lần đầu trước, lần sau sau.'
  ],
  'C8-B26-M1': [
    'Xúc xắc có tối đa mấy chấm?',
    'Xúc xắc có mặt 7 chấm không?',
    'Đồng xu chỉ có hai mặt đó.',
    'Trong hộp có bi xanh không?',
    'Một ngày có bao nhiêu giờ?',
    'Mặt ít chấm nhất có mấy chấm?',
    'Có thẻ số 0 trong các thẻ không?',
    'Trong hộp toàn bi màu gì?'
  ],
  /* ----- Chương IX ----- */
  'C9-B27-M1': [
    'Một nửa là chia 2.',
    'Số đo cung nhỏ bằng số đo góc ở tâm chắn cung đó.',
    'Nửa đường tròn là nửa của 360°.',
    'Chia 180° cho 2.',
    'Số đo cung bằng số đo góc ở tâm chắn cung đó.'
  ],
  'C9-B28-M3': [
    'Điểm nằm trên phân giác cách đều hai cạnh của góc.',
    'Điểm nằm trên trung trực cách đều hai đầu đoạn thẳng.',
    'Trọng tâm là giao điểm của các đường nào?',
    'Trực tâm là giao điểm của các đường nào?',
    '"Phân giác" = chia đôi góc.'
  ],
  'C9-B30-M1': [
    'Tam giác có 3 góc.',
    'Tứ giác chia được thành 2 tam giác.',
    'Hình vuông có 4 cạnh.',
    'Tam giác đều vẫn là tam giác.',
    'Hình thang có 4 cạnh.',
    'Hình bình hành có 4 cạnh.',
    'Tam giác vuông vẫn là tam giác.',
    'Tam giác cân vẫn là tam giác.'
  ],
  'C9-B30-M2': [
    'Tính 3 · 180°.',
    'Chia 540 cho 5.',
    'Tính 4 · 180°.',
    'Chia 720 cho 6.',
    'Tổng 180° chia đều cho 3 góc.'
  ],
  'C9-B30-M3': [
    'Mỗi phút kim phút quay 6° (360° : 60).',
    'Mỗi phút kim phút quay 6°.',
    'Một vòng tròn đầy đủ.',
    'Kim giờ đi 12 giờ hết một vòng 360°.',
    'Mỗi phút kim phút quay 6°.',
    'Mỗi phút kim phút quay 6°.'
  ],
  'C9-B30-M4': [
    'Chia 360 cho 6.',
    'Chia 360 cho 5.',
    'Chia 360 cho 4.',
    'Chia 360 cho 3.',
    'Nhân 72 với 2.'
  ],
  /* ----- Chương X ----- */
  'C10-B31-M1': [
    'Chu vi = đường kính × π, đường kính = 2r.',
    'Diện tích có bình phương bán kính.',
    'Diện tích = dài × rộng.',
    'Thể tích = tích ba kích thước.',
    'Lăng trụ đứng có cạnh bên vuông góc với đáy.',
    'Đường kính đi qua tâm, gồm hai bán kính.'
  ]
};
