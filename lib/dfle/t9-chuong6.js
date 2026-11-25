/**
 * NỘI DUNG TOÁN 9 — CHƯƠNG VI. HÀM SỐ y = ax² (a ≠ 0). PHƯƠNG TRÌNH BẬC HAI MỘT ẨN (Kết nối tri thức)
 * BẢN NHÁP do trợ lý AI soạn theo SGK Toán 9 tập hai (Bài 18–21) — giáo viên duyệt trước khi dùng.
 */
const SEC = { 1: 45, 2: 60, 3: 90, 4: 120 };
const B18 = 'Bài 18. Hàm số y = ax² (a ≠ 0)';
const B19 = 'Bài 19. Phương trình bậc hai một ẩn';
const B20 = 'Bài 20. Định lí Viète và ứng dụng';
const B21 = 'Bài 21. Giải bài toán bằng cách lập phương trình';
const U = (id, bai, muc, name, order, prerequisite, mucTieu, extra = {}) => ({ id, bai, muc, name, order, prerequisite, mucTieu, ...extra });

export const UNITS = [
  U('C6-B18-M1', B18, 'Mục 1', 'Hàm số y = ax² (a ≠ 0)', 80, null,
    'Nhận biết hàm số y = ax² (a ≠ 0); tính giá trị của hàm số; tìm hệ số a khi biết một điểm; vận dụng trong bài toán thực tế.'),
  U('C6-B18-M2', B18, 'Mục 2', 'Đồ thị của hàm số y = ax² (a ≠ 0)', 81, 'C6-B18-M1',
    'Vẽ và đọc đồ thị y = ax²: parabol đỉnh O, đối xứng qua Oy, nằm trên Ox khi a > 0, nằm dưới Ox khi a < 0; xác định điểm thuộc đồ thị.'),
  U('C6-B19-M1', B19, 'Mục 1', 'Phương trình bậc hai và giải phương trình đặc biệt', 82, 'C6-B18-M1',
    'Nhận biết phương trình bậc hai ax² + bx + c = 0 (a ≠ 0), xác định a, b, c; giải phương trình khuyết b, khuyết c và dạng (x + m)² = k.'),
  U('C6-B19-M2', B19, 'Mục 2', 'Công thức nghiệm của phương trình bậc hai', 83, 'C6-B19-M1',
    'Tính Δ = b² − 4ac; xét số nghiệm theo dấu của Δ; tìm nghiệm bằng công thức x = (−b ± √Δ)/(2a).'),
  U('C6-B19-M3', B19, 'Mục 2 (tiếp)', 'Công thức nghiệm thu gọn', 84, 'C6-B19-M2',
    'Với b = 2b′: tính Δ′ = b′² − ac, nghiệm x = (−b′ ± √Δ′)/a; chọn công thức phù hợp để giải nhanh.'),
  U('C6-B20-M1', B20, 'Mục 1', 'Định lí Viète', 85, 'C6-B19-M3',
    'Khi phương trình có nghiệm: x1 + x2 = −b/a, x1x2 = c/a; tính giá trị biểu thức đối xứng của hai nghiệm.'),
  U('C6-B20-M2', B20, 'Mục 2', 'Ứng dụng định lí Viète để nhẩm nghiệm', 86, 'C6-B20-M1',
    'Nhẩm nghiệm khi a + b + c = 0 (x1 = 1, x2 = c/a) hoặc a − b + c = 0 (x1 = −1, x2 = −c/a), hoặc nhẩm theo tổng – tích.'),
  U('C6-B20-M3', B20, 'Mục 3', 'Tìm hai số khi biết tổng và tích', 87, 'C6-B20-M2',
    'Hai số có tổng S, tích P là nghiệm của X² − SX + P = 0 (điều kiện S² − 4P ≥ 0); vận dụng vào bài toán hình chữ nhật.'),
  U('C6-B21-M1', B21, 'Mục 1', 'Giải bài toán bằng cách lập phương trình bậc hai', 88, 'C6-B19-M3',
    'Giải bài toán bằng cách lập phương trình bậc hai: chọn ẩn, đặt điều kiện, lập và giải phương trình, loại nghiệm không thoả mãn.'),
  U('C6-B21-M2', B21, 'Mục 1 (tiếp)', 'Bài toán dẫn đến phương trình quy về bậc hai', 89, 'C6-B21-M1',
    'Lập phương trình chứa ẩn ở mẫu cho bài toán chuyển động, năng suất, làm chung – làm riêng rồi quy về phương trình bậc hai.')
];

const E = (code, ku, role, cluster, ten, tieuDe, phut, misconception, viDu) =>
  ({ code, ku, role, cluster, ten, tieuDe, phut, misconception, viDu, remediation: 'VBH-' + code.slice(2) });
const LOI = [
  E('E-HSB-01', 'C6-B18-M1', 'root', 'Hàm số y = ax²', 'Tính giá trị ax² sai', 'Bình phương x trước rồi nhân a', 5,
    'Tính ax² sai: bình phương cả a·x, quên (−x)² dương, hoặc nhân 2 thay cho bình phương', 'y = 2x², x = −3: y = −18 hoặc (2·(−3))² = 36'),
  E('E-HSB-02', 'C6-B18-M2', 'mediating', 'Hàm số y = ax²', 'Đọc đồ thị parabol sai', 'Đỉnh O, đối xứng qua Oy; a > 0 nằm trên Ox', 5,
    'Nhầm hướng parabol theo dấu của a, nhầm trục đối xứng là Ox, hoặc kiểm tra điểm thuộc đồ thị sai', 'y = −3x² có O là điểm thấp nhất'),
  E('E-PTB-01', 'C6-B19-M1', 'root', 'Phương trình bậc hai', 'Xác định a, b, c sai', 'Sắp xếp về ax² + bx + c = 0 rồi đọc hệ số kèm dấu', 5,
    'Đọc hệ số a, b, c không kèm dấu, theo thứ tự xuất hiện, hoặc khi chưa đưa về dạng ax² + bx + c = 0', '5 − 2x² + x = 0 có a = 5, b = −2, c = 1'),
  E('E-PTB-02', 'C6-B19-M1', 'leaf', 'Phương trình bậc hai', 'Giải phương trình bậc hai khuyết sai', 'x² = k > 0 có hai nghiệm ±√k; k < 0 vô nghiệm', 5,
    'Giải x² = k chỉ lấy nghiệm dương, cho x² = số âm có nghiệm, hoặc chia cho x làm mất nghiệm 0', 'x² − 9 = 0 ⇔ x = 3; x² + 4 = 0 ⇔ x = −2'),
  E('E-PTB-03', 'C6-B19-M2', 'mediating', 'Phương trình bậc hai', 'Tính Δ, Δ′ sai', 'Δ = b² − 4ac; Δ′ = b′² − ac với b = 2b′', 6,
    'Tính biệt thức sai dấu (b² + 4ac), quên b âm khi bình phương, nhầm b′ với b hoặc dùng 4ac trong Δ′', 'x² − 5x + 6 = 0: Δ = 25 + 24 = 49'),
  E('E-PTB-04', 'C6-B19-M2', 'leaf', 'Phương trình bậc hai', 'Kết luận nghiệm theo Δ sai', 'x = (−b ± √Δ)/(2a); Δ < 0 vô nghiệm', 6,
    'Áp dụng công thức nghiệm sai (quên dấu − của b, quên chia 2a, nhầm 2a với a ở công thức thu gọn) hoặc kết luận số nghiệm sai', 'x² − 5x + 6 = 0 có nghiệm −2; −3'),
  E('E-VI-01', 'C6-B20-M1', 'root', 'Định lí Viète', 'Nhầm dấu trong hệ thức Viète', 'x1 + x2 = −b/a; x1x2 = c/a', 5,
    'Viết tổng hai nghiệm là b/a (thiếu dấu trừ) hoặc tích là −c/a, đảo tổng với tích', 'x² − 7x + 10 = 0 có x1 + x2 = −7'),
  E('E-VI-02', 'C6-B20-M1', 'mediating', 'Định lí Viète', 'Áp dụng Viète thiếu điều kiện, biến đổi biểu thức sai', 'Kiểm tra Δ ≥ 0; x1² + x2² = S² − 2P', 6,
    'Dùng Viète khi phương trình vô nghiệm, hoặc biến đổi biểu thức đối xứng sai (x1² + x2² = S², 1/x1 + 1/x2 = P/S)', 'x1² + x2² = (x1 + x2)²'),
  E('E-VI-03', 'C6-B20-M2', 'leaf', 'Định lí Viète', 'Nhẩm nghiệm sai trường hợp', 'a + b + c = 0: 1 và c/a; a − b + c = 0: −1 và −c/a', 5,
    'Nhầm hai trường hợp nhẩm nghiệm, quên dấu của nghiệm thứ hai, hoặc dùng b/a thay c/a', '2x² − 5x + 3 = 0 có nghiệm 1 và 3'),
  E('E-VI-04', 'C6-B20-M3', 'leaf', 'Định lí Viète', 'Tìm hai số khi biết tổng, tích sai', 'Giải X² − SX + P = 0; cần S² − 4P ≥ 0', 6,
    'Lập phương trình X² + SX + P = 0 (sai dấu), nhầm S với P, hoặc kết luận có hai số khi S² < 4P', 'Tổng 7, tích 12: giải X² + 7X + 12 = 0 được −3, −4'),
  E('E-LPT-01', 'C6-B21-M1', 'root', 'Lập phương trình bậc hai', 'Lập phương trình và loại nghiệm sai', 'Đặt điều kiện, loại nghiệm không thoả mãn', 6,
    'Lập phương trình sai quan hệ (dùng chu vi thay diện tích, lối đi chỉ trừ một bên), hoặc giữ nghiệm âm, nghiệm không thoả điều kiện', 'Chiều rộng là 6 m hoặc −10 m'),
  E('E-LPT-02', 'C6-B21-M2', 'leaf', 'Lập phương trình bậc hai', 'Lập phương trình chuyển động, năng suất sai', 'Thời gian = quãng đường : vận tốc; đến sớm thì thời gian cũ lớn hơn', 6,
    'Lập phương trình chứa ẩn ở mẫu sai thứ tự hiệu thời gian, nhân thay vì chia, hoặc nhầm năng suất thực tế với dự định', 'Tăng tốc đến sớm 1 giờ: 120/(x + 10) − 120/x = 1')
];
export const ERRORS = LOI.map(({ code, ku, misconception, viDu, remediation }) => ({ code, ku, misconception, viDu, remediation }));
export const REMEDIATION = Object.fromEntries(LOI.map((e) => [e.remediation, { ku: e.ku, title: e.tieuDe, minutes: e.phut }]));

const Q = (id, level, stem, [A, B, C, D], err, hinh) =>
  ({ id, ku: id.replace(/-Q\d+$/, ''), level, sec: SEC[level], stem, opts: { A, B, C, D }, correct: 'A', err, ...(hinh ? { hinh } : {}) });
const e3 = (c) => ({ B: c, C: c, D: c });

export const QUESTIONS = [
  // ---------- C6-B18-M1
  Q('C6-B18-M1-Q01', 1, 'Cho hàm số y = 2x². Giá trị của y khi x = −3 là:', ['18', '−18', '36', '12'], e3('E-HSB-01')),
  Q('C6-B18-M1-Q02', 1, 'Hàm số nào có dạng y = ax² với a ≠ 0?', ['y = −0,5x²', 'y = 2x + 1', 'y = 0x²', 'y = x³'], e3('E-HSB-01')),
  Q('C6-B18-M1-Q03', 2, 'Đồ thị hàm số y = ax² đi qua điểm (2; 8). Giá trị của a là:', ['2', '4', '1/2', '32'], e3('E-HSB-01')),
  Q('C6-B18-M1-Q04', 2, 'Cho hàm số y = −x². Giá trị của y khi x = 4 là:', ['−16', '16', '−8', '8'], e3('E-HSB-01')),
  Q('C6-B18-M1-Q05', 3, 'Cho hàm số y = 3x². Các giá trị của x để y = 27 là:', ['x = 3 hoặc x = −3', 'Chỉ x = 3', 'x = 9', 'x = ±9'], { B: 'E-PTB-02', C: 'E-HSB-01', D: 'E-HSB-01' }),
  Q('C6-B18-M1-Q06', 3, 'Quãng đường rơi tự do của một vật là s = 5t² (s tính bằng mét, t bằng giây). Sau 3 giây vật rơi được:', ['45 m', '225 m', '30 m', '15 m'], e3('E-HSB-01')),
  Q('C6-B18-M1-Q07', 4, 'Một vật rơi tự do từ độ cao 80 m, quãng đường rơi s = 5t² (m). Thời gian để vật chạm đất là:', ['4 giây', '16 giây', '±4 giây', '8 giây'], { B: 'E-HSB-01', C: 'E-PTB-02', D: 'E-HSB-01' }),
  Q('C6-B18-M1-Q08', 4, 'Diện tích hình tròn S = πR². Khi bán kính tăng gấp 3 lần thì diện tích:', ['tăng gấp 9 lần', 'tăng gấp 3 lần', 'tăng gấp 6 lần', 'không đổi'], e3('E-HSB-01')),

  // ---------- C6-B18-M2
  Q('C6-B18-M2-Q01', 1, 'Đồ thị của hàm số y = ax² (a ≠ 0) là:', ['một parabol đỉnh O, nhận Oy làm trục đối xứng', 'một đường thẳng', 'một parabol nhận Ox làm trục đối xứng', 'một đường tròn'], e3('E-HSB-02')),
  Q('C6-B18-M2-Q02', 1, 'Đồ thị hàm số y = 2x² nằm:', ['phía trên trục Ox (trừ điểm O)', 'phía dưới trục Ox', 'bên phải trục Oy', 'bên trái trục Oy'], e3('E-HSB-02')),
  Q('C6-B18-M2-Q03', 2, 'Điểm nào thuộc đồ thị hàm số y = −x²?', ['(2; −4)', '(2; 4)', '(−2; 4)', '(4; −2)'], { B: 'E-HSB-01', C: 'E-HSB-01', D: 'E-HSB-02' }),
  Q('C6-B18-M2-Q04', 2, 'Đồ thị hàm số y = −3x²:', ['quay bề lõm xuống dưới, O là điểm cao nhất', 'quay bề lõm lên trên, O là điểm thấp nhất', 'nằm bên phải trục Oy', 'không có điểm cao nhất'], e3('E-HSB-02')),
  Q('C6-B18-M2-Q05', 3, 'Điểm A(1; 2) thuộc đồ thị hàm số y = 2x². Điểm nào sau đây cũng thuộc đồ thị?', ['(−1; 2)', '(1; −2)', '(−1; −2)', '(2; 1)'], e3('E-HSB-02')),
  Q('C6-B18-M2-Q06', 3, 'Đồ thị hàm số y = x² và đường thẳng y = 4 cắt nhau tại:', ['(2; 4) và (−2; 4)', 'chỉ điểm (2; 4)', '(4; 2) và (−4; 2)', '(16; 4)'], { B: 'E-PTB-02', C: 'E-HSB-02', D: 'E-HSB-01' }),
  Q('C6-B18-M2-Q07', 4, 'Điểm C thuộc đồ thị hàm số y = x² và có hoành độ √5. Độ dài đoạn OC (O là gốc toạ độ) là:', ['√30', '5', '√5', '30'], { B: 'E-HSB-02', C: 'E-HSB-02', D: 'E-HSB-01' }),
  Q('C6-B18-M2-Q08', 4, 'Một cổng có dạng parabol y = −x²/4 (đơn vị mét, gốc toạ độ ở đỉnh cổng). Hai chân cổng cách nhau 8 m. Chiều cao của cổng là:', ['4 m', '16 m', '2 m', '8 m'], { B: 'E-HSB-01', C: 'E-HSB-01', D: 'E-HSB-02' }),

  // ---------- C6-B19-M1
  Q('C6-B19-M1-Q01', 1, 'Phương trình nào là phương trình bậc hai một ẩn?', ['2x² − 3x + 1 = 0', '0x² + 2x − 1 = 0', 'x³ − x = 0', '1/x² + x = 0'], e3('E-PTB-01')),
  Q('C6-B19-M1-Q02', 1, 'Phương trình 3x² − 5x − 2 = 0 có các hệ số a, b, c lần lượt là:', ['3; −5; −2', '3; 5; 2', '3; −5; 2', '−5; 3; −2'], e3('E-PTB-01')),
  Q('C6-B19-M1-Q03', 2, 'Phương trình 5 − 2x² + x = 0 có các hệ số a, b, c lần lượt là:', ['−2; 1; 5', '5; −2; 1', '2; 1; 5', '−2; 5; 1'], e3('E-PTB-01')),
  Q('C6-B19-M1-Q04', 2, 'Nghiệm của phương trình x² − 9 = 0 là:', ['x = 3; x = −3', 'chỉ x = 3', 'x = 9', 'x = 81'], e3('E-PTB-02')),
  Q('C6-B19-M1-Q05', 3, 'Nghiệm của phương trình 2x² + 6x = 0 là:', ['x = 0; x = −3', 'chỉ x = −3', 'x = 0; x = 3', 'x = −6'], e3('E-PTB-02')),
  Q('C6-B19-M1-Q06', 3, 'Phương trình x² + 4 = 0:', ['vô nghiệm', 'có hai nghiệm x = ±2', 'có nghiệm x = −2', 'có nghiệm x = −4'], e3('E-PTB-02')),
  Q('C6-B19-M1-Q07', 4, 'Nghiệm của phương trình (x − 2)² = 9 là:', ['x = 5; x = −1', 'chỉ x = 5', 'x = 11', 'x = 3; x = −3'], e3('E-PTB-02')),
  Q('C6-B19-M1-Q08', 4, 'Biến đổi phương trình x² − 6x + 5 = 0 thành (x − 3)² = 4. Nghiệm của phương trình là:', ['x = 5; x = 1', 'chỉ x = 5', 'x = 1; x = −5', 'x = −1; x = 7'], e3('E-PTB-02')),

  // ---------- C6-B19-M2
  Q('C6-B19-M2-Q01', 1, 'Biệt thức Δ của phương trình ax² + bx + c = 0 (a ≠ 0) là:', ['Δ = b² − 4ac', 'Δ = b² + 4ac', 'Δ = b − 4ac', 'Δ = 4ac − b²'], e3('E-PTB-03')),
  Q('C6-B19-M2-Q02', 1, 'Phương trình ax² + bx + c = 0 (a ≠ 0) có hai nghiệm phân biệt khi:', ['Δ > 0', 'Δ = 0', 'Δ < 0', 'Δ ≤ 0'], e3('E-PTB-04')),
  Q('C6-B19-M2-Q03', 2, 'Phương trình x² − 5x + 6 = 0 có Δ bằng:', ['1', '49', '−1', '19'], e3('E-PTB-03')),
  Q('C6-B19-M2-Q04', 2, 'Phương trình 2x² − 3x + 5 = 0:', ['vô nghiệm', 'có hai nghiệm phân biệt', 'có nghiệm kép', 'có vô số nghiệm'], e3('E-PTB-04')),
  Q('C6-B19-M2-Q05', 3, 'Nghiệm của phương trình x² − 5x + 6 = 0 là:', ['x = 2; x = 3', 'x = −2; x = −3', 'x = 4; x = 6', 'x = 1; x = 6'], e3('E-PTB-04')),
  Q('C6-B19-M2-Q06', 3, 'Phương trình x² − 4x + 4 = 0:', ['có nghiệm kép x1 = x2 = 2', 'có nghiệm kép x1 = x2 = −2', 'có hai nghiệm phân biệt', 'vô nghiệm'], e3('E-PTB-04')),
  Q('C6-B19-M2-Q07', 4, 'Nghiệm của phương trình 2x² + x − 3 = 0 là:', ['x = 1; x = −3/2', 'x = −1; x = 3/2', 'x = 2; x = −3', 'x = 4; x = −6'], e3('E-PTB-04')),
  Q('C6-B19-M2-Q08', 4, 'Phương trình x² − 2x + m = 0 có hai nghiệm phân biệt khi:', ['m < 1', 'm > 1', 'm ≤ 1', 'm < 4'], { B: 'E-PTB-04', C: 'E-PTB-04', D: 'E-PTB-03' }),

  // ---------- C6-B19-M3
  Q('C6-B19-M3-Q01', 1, 'Với b = 2b′, biệt thức thu gọn Δ′ của phương trình ax² + bx + c = 0 là:', ['Δ′ = b′² − ac', 'Δ′ = b′² − 4ac', 'Δ′ = b² − ac', 'Δ′ = b′ − ac'], e3('E-PTB-03')),
  Q('C6-B19-M3-Q02', 1, 'Phương trình x² − 6x + 5 = 0 có b′ bằng:', ['−3', '−6', '3', '−12'], e3('E-PTB-03')),
  Q('C6-B19-M3-Q03', 2, 'Phương trình x² − 6x + 5 = 0 có Δ′ bằng:', ['4', '16', '14', '31'], e3('E-PTB-03')),
  Q('C6-B19-M3-Q04', 2, 'Khi Δ′ > 0, hai nghiệm của phương trình ax² + 2b′x + c = 0 là:', ['x = (−b′ ± √Δ′)/a', 'x = (−b′ ± √Δ′)/(2a)', 'x = (b′ ± √Δ′)/a', 'x = (−b ± √Δ′)/a'], e3('E-PTB-04')),
  Q('C6-B19-M3-Q05', 3, 'Nghiệm của phương trình x² − 6x + 5 = 0 là:', ['x = 5; x = 1', 'x = −5; x = −1', 'x = 2,5; x = 0,5', 'x = 7; x = −1'], e3('E-PTB-04')),
  Q('C6-B19-M3-Q06', 3, 'Nghiệm của phương trình 3x² + 8x + 4 = 0 là:', ['x = −2/3; x = −2', 'x = 2/3; x = 2', 'x = −1/3; x = −1', 'x = −2; x = −6'], e3('E-PTB-04')),
  Q('C6-B19-M3-Q07', 4, 'Phương trình x² − 2√3x + 3 = 0:', ['có nghiệm kép x = √3', 'có nghiệm kép x = −√3', 'có hai nghiệm phân biệt', 'vô nghiệm'], e3('E-PTB-04')),
  Q('C6-B19-M3-Q08', 4, 'Phương trình x² + 2(m − 1)x + m² = 0 có nghiệm khi:', ['m ≤ 1/2', 'm < 1/2', 'm ≥ 1/2', 'm ≤ 1'], { B: 'E-PTB-04', C: 'E-PTB-04', D: 'E-PTB-03' }),

  // ---------- C6-B20-M1
  Q('C6-B20-M1-Q01', 1, 'Nếu x1, x2 là hai nghiệm của phương trình ax² + bx + c = 0 (a ≠ 0) thì:', ['x1 + x2 = −b/a; x1x2 = c/a', 'x1 + x2 = b/a; x1x2 = c/a', 'x1 + x2 = −b/a; x1x2 = −c/a', 'x1 + x2 = c/a; x1x2 = b/a'], e3('E-VI-01')),
  Q('C6-B20-M1-Q02', 1, 'Phương trình x² − 7x + 10 = 0 có hai nghiệm x1, x2. Tổng x1 + x2 bằng:', ['7', '−7', '10', '−10'], e3('E-VI-01')),
  Q('C6-B20-M1-Q03', 2, 'Phương trình 2x² + 5x − 3 = 0 có hai nghiệm x1, x2. Tích x1x2 bằng:', ['−3/2', '3/2', '−3', '5/2'], e3('E-VI-01')),
  Q('C6-B20-M1-Q04', 2, 'Với phương trình x² + 2x + 5 = 0, bạn Lan nói: "Tổng hai nghiệm là −2, tích hai nghiệm là 5". Nhận xét đúng là:', ['Lan sai vì phương trình vô nghiệm', 'Lan nói đúng', 'Lan sai: tổng hai nghiệm là 2', 'Lan sai: tích hai nghiệm là −5'], { B: 'E-VI-02', C: 'E-VI-01', D: 'E-VI-01' }),
  Q('C6-B20-M1-Q05', 3, 'Phương trình x² − 5x + 3 = 0 có hai nghiệm x1, x2. Giá trị của x1² + x2² là:', ['19', '25', '31', '22'], e3('E-VI-02')),
  Q('C6-B20-M1-Q06', 3, 'Phương trình x² − 5x + 3 = 0 có hai nghiệm x1, x2. Giá trị của 1/x1 + 1/x2 là:', ['5/3', '3/5', '1/5', '−5/3'], { B: 'E-VI-02', C: 'E-VI-02', D: 'E-VI-01' }),
  Q('C6-B20-M1-Q07', 4, 'Phương trình x² − 2x − 1 = 0 có hai nghiệm x1, x2. Giá trị của x1/x2 + x2/x1 là:', ['−6', '6', '−2', '2'], e3('E-VI-02')),
  Q('C6-B20-M1-Q08', 4, 'Tìm m để phương trình x² − 2x + m = 0 có hai nghiệm x1, x2 thoả mãn x1² + x2² = 10.', ['m = −3', 'm = 3', 'm = −7', 'm = 7'], { B: 'E-VI-02', C: 'E-VI-02', D: 'E-VI-01' }),

  // ---------- C6-B20-M2
  Q('C6-B20-M2-Q01', 1, 'Nếu a + b + c = 0 thì phương trình ax² + bx + c = 0 (a ≠ 0) có hai nghiệm là:', ['x1 = 1; x2 = c/a', 'x1 = −1; x2 = −c/a', 'x1 = 1; x2 = −c/a', 'x1 = 1; x2 = b/a'], e3('E-VI-03')),
  Q('C6-B20-M2-Q02', 1, 'Nếu a − b + c = 0 thì phương trình ax² + bx + c = 0 (a ≠ 0) có hai nghiệm là:', ['x1 = −1; x2 = −c/a', 'x1 = 1; x2 = c/a', 'x1 = −1; x2 = c/a', 'x1 = −1; x2 = b/a'], e3('E-VI-03')),
  Q('C6-B20-M2-Q03', 2, 'Phương trình 2x² − 5x + 3 = 0 có hai nghiệm là:', ['x = 1; x = 3/2', 'x = −1; x = −3/2', 'x = 1; x = −3/2', 'x = 1; x = 3'], e3('E-VI-03')),
  Q('C6-B20-M2-Q04', 2, 'Phương trình 3x² + 7x + 4 = 0 có hai nghiệm là:', ['x = −1; x = −4/3', 'x = 1; x = 4/3', 'x = −1; x = 4/3', 'x = 1; x = −4/3'], e3('E-VI-03')),
  Q('C6-B20-M2-Q05', 3, 'Nhẩm nghiệm phương trình x² − 9x + 20 = 0, ta được:', ['x = 4; x = 5', 'x = −4; x = −5', 'x = 2; x = 10', 'x = 1; x = 20'], { B: 'E-VI-01', C: 'E-VI-03', D: 'E-VI-03' }),
  Q('C6-B20-M2-Q06', 3, 'Phương trình x² − 2025x + 2024 = 0 có hai nghiệm là:', ['x = 1; x = 2024', 'x = −1; x = −2024', 'x = 1; x = 2025', 'x = 2024; x = 2025'], e3('E-VI-03')),
  Q('C6-B20-M2-Q07', 4, 'Phương trình x² + mx − 5 = 0 có một nghiệm x1 = 1. Nghiệm còn lại x2 và giá trị m là:', ['x2 = −5; m = 4', 'x2 = 5; m = −6', 'x2 = −5; m = −4', 'x2 = 5; m = 4'], { B: 'E-VI-03', C: 'E-VI-01', D: 'E-VI-03' }),
  Q('C6-B20-M2-Q08', 4, 'Phương trình (m − 1)x² − (2m + 1)x + m + 2 = 0 (m ≠ 1) có hai nghiệm là:', ['x = 1; x = (m + 2)/(m − 1)', 'x = −1; x = −(m + 2)/(m − 1)', 'x = 1; x = (m − 1)/(m + 2)', 'x = 1; x = (2m + 1)/(m − 1)'], e3('E-VI-03')),

  // ---------- C6-B20-M3
  Q('C6-B20-M3-Q01', 1, 'Hai số có tổng bằng S và tích bằng P là nghiệm của phương trình:', ['X² − SX + P = 0', 'X² + SX + P = 0', 'X² − PX + S = 0', 'X² + SX − P = 0'], e3('E-VI-04')),
  Q('C6-B20-M3-Q02', 1, 'Điều kiện để có hai số có tổng S và tích P là:', ['S² − 4P ≥ 0', 'S² − 4P < 0', 'S > P', 'P ≥ 0'], e3('E-VI-04')),
  Q('C6-B20-M3-Q03', 2, 'Hai số có tổng bằng 7 và tích bằng 12 là:', ['3 và 4', '−3 và −4', '2 và 6', '1 và 12'], e3('E-VI-04')),
  Q('C6-B20-M3-Q04', 2, 'Hai số có tổng bằng 1 và tích bằng −6 là:', ['3 và −2', '−3 và 2', '2 và 3', '6 và −1'], e3('E-VI-04')),
  Q('C6-B20-M3-Q05', 3, 'Có hai số nào có tổng bằng 2 và tích bằng 5 không?', ['Không', 'Có, là 1 và 1', 'Có, là 1 và 5', 'Có, là −1 và −5'], e3('E-VI-04')),
  Q('C6-B20-M3-Q06', 3, 'Một hình chữ nhật có chu vi 28 m và diện tích 48 m². Độ dài hai cạnh là:', ['6 m và 8 m', '4 m và 12 m', '12 m và 16 m', '2 m và 24 m'], e3('E-VI-04')),
  Q('C6-B20-M3-Q07', 4, 'Hai số u, v thoả mãn u + v = 5 và uv = −14 là:', ['7 và −2', '−7 và 2', '7 và 2', '14 và −1'], e3('E-VI-04')),
  Q('C6-B20-M3-Q08', 4, 'Một hình chữ nhật có diện tích 300 m² và chu vi 70 m. Chiều dài hình chữ nhật là:', ['20 m', '15 m', '35 m', '30 m'], e3('E-VI-04')),

  // ---------- C6-B21-M1
  Q('C6-B21-M1-Q01', 1, 'Bước đầu tiên khi giải bài toán bằng cách lập phương trình là:', ['Chọn ẩn và đặt điều kiện cho ẩn', 'Giải phương trình', 'Trả lời bài toán', 'Tính Δ'], e3('E-LPT-01')),
  Q('C6-B21-M1-Q02', 1, 'Tích của hai số tự nhiên liên tiếp bằng 56. Gọi số nhỏ là x (x ∈ ℕ). Phương trình là:', ['x(x + 1) = 56', 'x + x + 1 = 56', 'x(x + 2) = 56', 'x² = 56'], e3('E-LPT-01')),
  Q('C6-B21-M1-Q03', 2, 'Tích của hai số tự nhiên liên tiếp bằng 56. Hai số đó là:', ['7 và 8', '−8 và −7', '8 và 9', '28 và 29'], e3('E-LPT-01')),
  Q('C6-B21-M1-Q04', 2, 'Một mảnh vườn hình chữ nhật có chiều dài hơn chiều rộng 4 m, diện tích 60 m². Gọi chiều rộng là x (m, x > 0). Phương trình là:', ['x(x + 4) = 60', '2(x + x + 4) = 60', 'x(x − 4) = 60', 'x + 4 = 60'], e3('E-LPT-01')),
  Q('C6-B21-M1-Q05', 3, 'Một mảnh vườn hình chữ nhật có chiều dài hơn chiều rộng 4 m, diện tích 60 m². Chiều rộng mảnh vườn là:', ['6 m', '10 m', '−10 m', '6 m hoặc −10 m'], e3('E-LPT-01')),
  Q('C6-B21-M1-Q06', 3, 'Một tam giác vuông có cạnh huyền 10 cm, hai cạnh góc vuông hơn kém nhau 2 cm. Cạnh góc vuông nhỏ dài:', ['6 cm', '8 cm', '4 cm', '−8 cm'], e3('E-LPT-01')),
  Q('C6-B21-M1-Q07', 4, 'Một khu vườn hình chữ nhật kích thước 20 m × 30 m. Người ta làm một lối đi rộng x m chạy quanh vườn (phía trong) sao cho phần đất còn lại có diện tích 336 m². Phương trình đúng là:', ['(20 − 2x)(30 − 2x) = 336', '(20 − x)(30 − x) = 336', '20 · 30 − 2x = 336', '(20 + 2x)(30 + 2x) = 336'], e3('E-LPT-01')),
  Q('C6-B21-M1-Q08', 4, 'Một khu vườn hình chữ nhật 20 m × 30 m có lối đi rộng x m chạy quanh (phía trong), phần đất còn lại có diện tích 336 m². Chiều rộng lối đi là:', ['3 m', '22 m', '3 m hoặc 22 m', '6 m'], e3('E-LPT-01')),

  // ---------- C6-B21-M2
  Q('C6-B21-M2-Q01', 1, 'Một xe đi quãng đường 120 km với vận tốc x (km/h). Thời gian xe đi là:', ['120/x giờ', '120x giờ', 'x/120 giờ', '(120 − x) giờ'], e3('E-LPT-02')),
  Q('C6-B21-M2-Q02', 1, 'Một đội dự định làm 480 sản phẩm trong x ngày. Mỗi ngày đội dự định làm:', ['480/x sản phẩm', '480x sản phẩm', 'x/480 sản phẩm', '(480 − x) sản phẩm'], e3('E-LPT-02')),
  Q('C6-B21-M2-Q03', 2, 'Một xe đi quãng đường 120 km. Nếu tăng vận tốc thêm 10 km/h thì đến sớm 1 giờ. Gọi vận tốc dự định là x (km/h, x > 0). Phương trình đúng là:', ['120/x − 120/(x + 10) = 1', '120/(x + 10) − 120/x = 1', '120/x + 120/(x + 10) = 1', '120(x + 10) − 120x = 1'], e3('E-LPT-02')),
  Q('C6-B21-M2-Q04', 2, 'Một xe đi quãng đường 120 km. Nếu tăng vận tốc thêm 10 km/h thì đến sớm 1 giờ. Vận tốc dự định là:', ['30 km/h', '40 km/h', '−40 km/h', '30 km/h hoặc −40 km/h'], { B: 'E-LPT-02', C: 'E-LPT-01', D: 'E-LPT-01' }),
  Q('C6-B21-M2-Q05', 3, 'Một đội may dự định may 480 bộ đồng phục. Thực tế mỗi ngày may thêm 10 bộ nên xong sớm 4 ngày. Gọi số bộ dự định may mỗi ngày là x (x ∈ ℕ*). Phương trình đúng là:', ['480/x − 480/(x + 10) = 4', '480/(x + 10) − 480/x = 4', '480/x + 480/(x + 10) = 4', '480(x + 10) − 480x = 4'], e3('E-LPT-02')),
  Q('C6-B21-M2-Q06', 3, 'Một đội may dự định may 480 bộ đồng phục. Thực tế mỗi ngày may thêm 10 bộ nên xong sớm 4 ngày. Số bộ đội dự định may mỗi ngày là:', ['30 bộ', '40 bộ', '−40 bộ', '120 bộ'], { B: 'E-LPT-02', C: 'E-LPT-01', D: 'E-LPT-02' }),
  Q('C6-B21-M2-Q07', 4, 'Hai vòi nước cùng chảy thì đầy bể sau 6 giờ. Nếu chảy riêng, vòi I đầy bể nhanh hơn vòi II 5 giờ. Thời gian vòi I chảy riêng đầy bể là:', ['10 giờ', '15 giờ', '3 giờ', '1 giờ'], { B: 'E-LPT-02', C: 'E-LPT-01', D: 'E-LPT-02' }),
  Q('C6-B21-M2-Q08', 4, 'Một ca nô xuôi dòng 48 km rồi ngược dòng 48 km hết tất cả 5 giờ; vận tốc dòng nước là 4 km/h. Vận tốc riêng của ca nô là:', ['20 km/h', '24 km/h', '16 km/h', '−0,8 km/h'], { B: 'E-LPT-02', C: 'E-LPT-02', D: 'E-LPT-01' })
];

export const HINTS = {
  'E-HSB-01': ['Trong ax², phép bình phương áp dụng cho x hay cho cả a·x? Bình phương một số âm ra số gì?', 'Tính x² trước (luôn không âm), rồi nhân với a. Không bình phương a. (−3)² = 9.', 'Ví dụ: y = 2x², x = −3: y = 2·9 = 18; s = 5t², t = 3: s = 5·9 = 45 m.'],
  'E-HSB-02': ['Hệ số a dương hay âm? Đồ thị đối xứng qua trục nào?', 'Đồ thị y = ax² là parabol đỉnh O, đối xứng qua Oy. a > 0: nằm trên Ox, O là điểm thấp nhất; a < 0: nằm dưới Ox, O là điểm cao nhất. Điểm (x0; y0) thuộc đồ thị khi y0 = a·x0².', 'Ví dụ: (1; 2) thuộc y = 2x² thì (−1; 2) cũng thuộc; y = −3x² có O là điểm cao nhất.'],
  'E-PTB-01': ['Phương trình đã được sắp xếp theo thứ tự x², x, số hạng tự do chưa?', 'Đưa về ax² + bx + c = 0 (sắp xếp theo luỹ thừa giảm dần), rồi đọc a, b, c kèm dấu đứng trước. Cần a ≠ 0.', 'Ví dụ: 5 − 2x² + x = 0 ⇔ −2x² + x + 5 = 0: a = −2, b = 1, c = 5.'],
  'E-PTB-02': ['Số nào bình phương lên bằng 9? Có mấy số như vậy? Có số nào bình phương ra số âm không?', 'x² = k: k > 0 thì x = ±√k; k = 0 thì x = 0; k < 0 thì vô nghiệm. Phương trình ax² + bx = 0 đặt x chung: x(ax + b) = 0.', 'Ví dụ: x² = 9 ⇔ x = ±3; 2x² + 6x = 0 ⇔ 2x(x + 3) = 0 ⇔ x = 0 hoặc x = −3.'],
  'E-PTB-03': ['Em đã thay b kèm dấu vào b² chưa? Giữa b² và 4ac là dấu gì?', 'Δ = b² − 4ac (b² luôn không âm). Nếu b = 2b′ thì Δ′ = b′² − ac (không có số 4).', 'Ví dụ: x² − 5x + 6 = 0: Δ = (−5)² − 4·1·6 = 1; x² − 6x + 5 = 0: b′ = −3, Δ′ = 9 − 5 = 4.'],
  'E-PTB-04': ['Δ dương, bằng 0 hay âm? Trong công thức nghiệm, −b nghĩa là gì và mẫu là a hay 2a?', 'Δ > 0: x1,2 = (−b ± √Δ)/(2a); Δ = 0: nghiệm kép x = −b/(2a); Δ < 0: vô nghiệm. Công thức thu gọn: x = (−b′ ± √Δ′)/a.', 'Ví dụ: x² − 5x + 6 = 0, Δ = 1: x = (5 ± 1)/2, tức x = 3; x = 2.'],
  'E-VI-01': ['Trong hệ thức Viète, tổng hai nghiệm có dấu trừ ở đâu?', 'x1 + x2 = −b/a (có dấu trừ), x1x2 = c/a. Đọc b, c kèm dấu.', 'Ví dụ: x² − 7x + 10 = 0: x1 + x2 = 7, x1x2 = 10.'],
  'E-VI-02': ['Phương trình có nghiệm không (Δ ≥ 0)? Em có thể viết x1² + x2² qua tổng và tích không?', 'Chỉ dùng Viète khi Δ ≥ 0. Biến đổi về S = x1 + x2, P = x1x2: x1² + x2² = S² − 2P; 1/x1 + 1/x2 = S/P; x1/x2 + x2/x1 = (S² − 2P)/P.', 'Ví dụ: x² − 5x + 3 = 0 (Δ = 13 > 0): S = 5, P = 3, x1² + x2² = 25 − 6 = 19.'],
  'E-VI-03': ['a + b + c bằng 0 hay a − b + c bằng 0?', 'a + b + c = 0: x1 = 1, x2 = c/a. a − b + c = 0: x1 = −1, x2 = −c/a.', 'Ví dụ: 2x² − 5x + 3 = 0 có 2 − 5 + 3 = 0 nên x = 1, x = 3/2; 3x² + 7x + 4 = 0 có 3 − 7 + 4 = 0 nên x = −1, x = −4/3.'],
  'E-VI-04': ['Phương trình nhận hai số có tổng S, tích P làm nghiệm: hệ số của X mang dấu gì?', 'Hai số cần tìm là nghiệm của X² − SX + P = 0. Có hai số như vậy khi S² − 4P ≥ 0.', 'Ví dụ: tổng 7, tích 12: X² − 7X + 12 = 0 ⇔ X = 3 hoặc X = 4; tổng 2, tích 5: 4 − 20 < 0 nên không có.'],
  'E-LPT-01': ['Ẩn có điều kiện gì (dương, nguyên)? Giải xong em đã loại nghiệm không phù hợp chưa?', 'Chọn ẩn kèm đơn vị và điều kiện; dịch đề cẩn thận (diện tích, cạnh huyền, lối đi hai bên thì trừ 2x); giải xong đối chiếu điều kiện, loại nghiệm âm hoặc vô lí.', 'Ví dụ: x(x + 4) = 60 ⇔ x = 6 hoặc x = −10; chiều rộng dương nên x = 6 m.'],
  'E-LPT-02': ['Thời gian bằng quãng đường chia cho gì? Đi nhanh hơn thì thời gian mới lớn hơn hay nhỏ hơn thời gian cũ?', 'Thời gian = quãng đường : vận tốc; năng suất = khối lượng : thời gian. "Đến sớm 1 giờ" nghĩa là thời gian cũ − thời gian mới = 1.', 'Ví dụ: 120 km, tăng 10 km/h thì sớm 1 giờ: 120/x − 120/(x + 10) = 1 ⇒ x = 30 km/h.']
};

const V = (dan, quyTac, viDu, tuLam) => ({ dan, quyTac, viDu: viDu.map(([de, giai]) => ({ de, giai })), tuLam: tuLam.map(([de, dapAn, giaiThich]) => ({ de, dapAn, giaiThich })) });
export const VI_BAI_HOC = {
  'VBH-HSB-01': V('y = ax²: "bình phương trước, nhân sau" — đổi thứ tự là sai.',
    'Tính x², rồi nhân với a. (−x)² = x² luôn không âm.',
    [['y = 2x², x = −3.', 'Cách nghĩ sai: y = −18 hoặc (2·(−3))² = 36. Cách đúng: y = 2·9 = 18.'],
     ['Đồ thị y = ax² qua (2; 8), tìm a.', '8 = a·4 ⇔ a = 2.']],
    [['y = −x², x = 4?', '−16', '−(16).'],
     ['s = 5t², t = 3?', '45', '5·9.']]),
  'VBH-HSB-02': V('Parabol y = ax² luôn "mở" theo dấu của a và luôn cân đối qua trục tung.',
    'Đỉnh O, trục đối xứng Oy. a > 0: nằm trên Ox, O thấp nhất; a < 0: nằm dưới Ox, O cao nhất. Điểm (x; y) thuộc đồ thị thì (−x; y) cũng thuộc.',
    [['y = −3x² có điểm thấp nhất là O?', 'Cách nghĩ sai: có. Cách đúng: a = −3 < 0 nên O là điểm cao nhất.'],
     ['(1; 2) thuộc y = 2x², điểm nào cũng thuộc?', '(−1; 2) (đối xứng qua Oy).']],
    [['y = 2x² nằm phía nào của Ox?', 'Phía trên', 'a > 0.'],
     ['(2; −4) có thuộc y = −x²?', 'Có', '−(2²) = −4.']]),
  'VBH-PTB-01': V('Đọc hệ số chỉ đúng khi phương trình đã "xếp hàng" ax² + bx + c = 0.',
    'Chuyển hết về một vế, sắp xếp theo x², x, số hạng tự do; a, b, c lấy kèm dấu. a ≠ 0.',
    [['5 − 2x² + x = 0.', 'Cách nghĩ sai: a = 5, b = −2, c = 1. Cách đúng: −2x² + x + 5 = 0 nên a = −2, b = 1, c = 5.'],
     ['3x² − 5x − 2 = 0.', 'a = 3, b = −5, c = −2.']],
    [['x² − 4 = 0 có b = ?', '0', 'Khuyết x.'],
     ['0x² + 2x − 1 = 0 có phải bậc hai?', 'Không', 'a = 0.']]),
  'VBH-PTB-02': V('Phương trình khuyết giải nhanh, nhưng dễ bỏ sót nghiệm âm hoặc nghiệm 0.',
    'x² = k: k > 0 → x = ±√k; k < 0 → vô nghiệm. ax² + bx = 0 → x(ax + b) = 0 → x = 0 hoặc x = −b/a. (x + m)² = k > 0 → x + m = ±√k.',
    [['x² − 9 = 0.', 'Cách nghĩ sai: x = 3. Cách đúng: x² = 9 ⇔ x = 3 hoặc x = −3.'],
     ['2x² + 6x = 0.', '2x(x + 3) = 0 ⇔ x = 0 hoặc x = −3.']],
    [['x² + 4 = 0?', 'Vô nghiệm', 'x² không âm.'],
     ['(x − 2)² = 9?', 'x = 5; x = −1', 'x − 2 = ±3.']]),
  'VBH-PTB-03': V('Δ là "máy dò" số nghiệm. Tính sai Δ là mọi bước sau đều sai.',
    'Δ = b² − 4ac (b² không âm dù b âm). Khi b chẵn, b = 2b′: Δ′ = b′² − ac (không có số 4).',
    [['x² − 5x + 6 = 0, tính Δ.', 'Cách nghĩ sai: 25 + 24 = 49. Cách đúng: 25 − 24 = 1.'],
     ['x² − 6x + 5 = 0, tính Δ′.', 'b′ = −3, Δ′ = 9 − 5 = 4.']],
    [['2x² − 3x + 5: Δ?', '−31', '9 − 40.'],
     ['x² + 8x + 7: Δ′?', '9', '16 − 7.']]),
  'VBH-PTB-04': V('Có Δ rồi, chỉ cần lắp đúng công thức — nhớ dấu trừ trước b và mẫu 2a.',
    'Δ > 0: x = (−b ± √Δ)/(2a). Δ = 0: nghiệm kép −b/(2a). Δ < 0: vô nghiệm. Thu gọn: x = (−b′ ± √Δ′)/a.',
    [['x² − 5x + 6 = 0 (Δ = 1).', 'Cách nghĩ sai: x = −2; −3. Cách đúng: x = (5 ± 1)/2, tức x = 3; x = 2.'],
     ['x² − 4x + 4 = 0.', 'Δ = 0, nghiệm kép x = 4/2 = 2.']],
    [['2x² + x − 3 = 0?', 'x = 1; x = −3/2', 'Δ = 25.'],
     ['x² − 2x + m = 0 có 2 nghiệm phân biệt khi?', 'm < 1', 'Δ′ = 1 − m > 0.']]),
  'VBH-VI-01': V('Hệ thức Viète có một dấu trừ rất dễ quên — ở tổng.',
    'x1 + x2 = −b/a, x1x2 = c/a.',
    [['x² − 7x + 10 = 0, tổng hai nghiệm?', 'Cách nghĩ sai: −7. Cách đúng: −(−7)/1 = 7 (nghiệm 2 và 5).'],
     ['2x² + 5x − 3 = 0, tích hai nghiệm?', 'c/a = −3/2.']],
    [['x² + 3x − 4 = 0: S?', '−3', '−b/a.'],
     ['Cùng phương trình, P?', '−4', 'c/a.']]),
  'VBH-VI-02': V('Trước khi dùng Viète, kiểm tra phương trình có nghiệm. Sau đó, mọi biểu thức đối xứng đều đưa được về S và P.',
    'Cần Δ ≥ 0. x1² + x2² = S² − 2P; 1/x1 + 1/x2 = S/P; x1/x2 + x2/x1 = (S² − 2P)/P.',
    [['x² − 5x + 3 = 0, tính x1² + x2².', 'Cách nghĩ sai: S² = 25. Cách đúng: 25 − 2·3 = 19.'],
     ['x² + 2x + 5 = 0 có tổng nghiệm −2?', 'Δ′ = 1 − 5 < 0, vô nghiệm, không dùng Viète.']],
    [['S = 5, P = 3: 1/x1 + 1/x2?', '5/3', 'S/P.'],
     ['S = 2, P = −1: x1/x2 + x2/x1?', '−6', '(4 + 2)/(−1).']]),
  'VBH-VI-03': V('Hai mẹo nhẩm nghiệm: cộng a + b + c, hoặc a − b + c.',
    'a + b + c = 0 → nghiệm 1 và c/a. a − b + c = 0 → nghiệm −1 và −c/a.',
    [['2x² − 5x + 3 = 0.', 'Cách nghĩ sai: 1 và 3. Cách đúng: 2 − 5 + 3 = 0, nghiệm 1 và c/a = 3/2.'],
     ['3x² + 7x + 4 = 0.', '3 − 7 + 4 = 0, nghiệm −1 và −4/3.']],
    [['x² − 2025x + 2024 = 0?', '1; 2024', 'a + b + c = 0.'],
     ['x² + 5x + 4 = 0?', '−1; −4', 'a − b + c = 0.']]),
  'VBH-VI-04': V('Biết tổng và tích là dựng được phương trình bậc hai có hai số đó làm nghiệm.',
    'Hai số có tổng S, tích P là nghiệm của X² − SX + P = 0; tồn tại khi S² − 4P ≥ 0.',
    [['Tổng 7, tích 12.', 'Cách nghĩ sai: X² + 7X + 12 = 0 nên −3, −4. Cách đúng: X² − 7X + 12 = 0 nên 3 và 4.'],
     ['Chu vi 28, diện tích 48.', 'S = 14, P = 48: X² − 14X + 48 = 0, hai cạnh 6 và 8.']],
    [['Tổng 1, tích −6?', '3 và −2', 'X² − X − 6 = 0.'],
     ['Tổng 2, tích 5 có không?', 'Không', '4 − 20 < 0.']]),
  'VBH-LPT-01': V('Phương trình bậc hai thường cho hai nghiệm — nhưng bài toán thực tế có thể chỉ nhận một.',
    'Chọn ẩn, đơn vị, điều kiện. Lập phương trình theo đúng đại lượng (diện tích, cạnh huyền…). Giải, rồi loại nghiệm không thoả điều kiện.',
    [['Dài hơn rộng 4 m, diện tích 60 m².', 'Cách nghĩ sai: rộng 6 m hoặc −10 m. Cách đúng: x > 0 nên loại −10, chiều rộng 6 m.'],
     ['Vườn 20 × 30, lối đi rộng x quanh vườn, còn 336 m².', '(20 − 2x)(30 − 2x) = 336 ⇔ x = 3 hoặc x = 22; 30 − 2x > 0 và 20 − 2x > 0 nên x = 3.']],
    [['Hai số tự nhiên liên tiếp có tích 56?', '7 và 8', 'x(x + 1) = 56.'],
     ['Nghiệm x = −8 cho cạnh tam giác được không?', 'Không', 'Độ dài dương.']]),
  'VBH-LPT-02': V('Bài toán "đến sớm", "xong sớm": thời gian cũ trừ thời gian mới.',
    'Thời gian = quãng đường : vận tốc; số ngày = khối lượng : năng suất. Đi nhanh hơn thì thời gian ngắn hơn: t cũ − t mới = số giờ sớm.',
    [['120 km, tăng 10 km/h thì sớm 1 giờ.', 'Cách nghĩ sai: 120/(x + 10) − 120/x = 1. Cách đúng: 120/x − 120/(x + 10) = 1 ⇒ x = 30.'],
     ['480 bộ, mỗi ngày thêm 10 bộ thì xong sớm 4 ngày.', '480/x − 480/(x + 10) = 4 ⇒ x = 30 bộ/ngày.']],
    [['Quãng 60 km, vận tốc x, thời gian?', '60/x', 's : v.'],
     ['Cùng chảy 6 giờ, vòi I nhanh hơn 5 giờ, vòi I?', '10 giờ', '1/x + 1/(x + 5) = 1/6.']])
};

export const ERROR_NODES = LOI.map((e) => ({ id: e.code, name: e.ten, role: e.role, kuId: e.ku, cluster: e.cluster }));
export const CAUSAL_EDGES = [
  { from: 'E-HSB-01', to: 'E-HSB-02', weight: 0.55, reason: 'Tính ax² sai nên xác định điểm thuộc đồ thị sai' },
  { from: 'E-HSB-01', to: 'E-PTB-02', weight: 0.4, reason: 'Quên (−x)² = x² nên bỏ sót nghiệm âm của x² = k' },
  { from: 'E-PTB-01', to: 'E-PTB-02', weight: 0.4, reason: 'Xác định hệ số sai nên giải phương trình khuyết sai' },
  { from: 'E-PTB-01', to: 'E-PTB-03', weight: 0.65, reason: 'Hệ số sai dấu nên Δ sai' },
  { from: 'E-PTB-03', to: 'E-PTB-04', weight: 0.7, reason: 'Δ sai nên kết luận nghiệm sai' },
  { from: 'E-PTB-04', to: 'E-VI-02', weight: 0.45, reason: 'Không xét Δ nên dùng Viète cho phương trình vô nghiệm' },
  { from: 'E-VI-01', to: 'E-VI-02', weight: 0.55, reason: 'Sai dấu tổng nên biểu thức đối xứng sai' },
  { from: 'E-VI-01', to: 'E-VI-03', weight: 0.5, reason: 'Nhầm hệ thức Viète nên nhẩm nghiệm sai' },
  { from: 'E-VI-01', to: 'E-VI-04', weight: 0.55, reason: 'Nhầm dấu tổng nên lập X² + SX + P = 0' },
  { from: 'E-LPT-01', to: 'E-LPT-02', weight: 0.55, reason: 'Lập phương trình sai quan hệ nên bài chuyển động, năng suất sai' }
];
export const ROOT_ERROR_IDS = ['E-HSB-01', 'E-PTB-01', 'E-VI-01', 'E-LPT-01'];

const NHAP = 'Bản nháp do trợ lý AI soạn theo từ điển mã lỗi — giáo viên cần duyệt, sửa trước khi dùng';
const A = (id, ten, errorCodes, nhom, hinhThuc, mucNhanThuc, phut, moTa, hocLieu) => ({ id, ten, errorCodes, nhom, hinhThuc, mucNhanThuc, phut, moTa, hocLieu, trangThai: 'nhap', nguon: NHAP });
export const ACTIVITIES = [
  A('HD-HSB-01', 'Bảng giá trị và parabol', ['E-HSB-01', 'E-HSB-02'], ['loi'], 'nhom-dong-chat', 1, [8, 10],
    'Nhóm lập bảng giá trị y = 2x² và y = −x² với x từ −3 đến 3 (bắt buộc ghi bước bình phương), chấm điểm lên giấy kẻ ô và nối thành parabol; nhận xét trục đối xứng, hướng bề lõm.', 'Giấy kẻ ô, phiếu bảng giá trị'),
  A('HD-PTB-01', 'Xếp hàng rồi mới tính Δ', ['E-PTB-01', 'E-PTB-03'], ['loi'], 'ca-lop', 2, [6, 8],
    'Giáo viên chiếu 6 phương trình viết lộn xộn. Học sinh viết lại dạng chuẩn, ghi a, b, c (hoặc b′) lên bảng con và tính Δ; giáo viên dừng ở các phương trình có b âm.', 'Bảng con, slide 6 phương trình'),
  A('HD-PTB-02', 'Ba ngã rẽ của Δ', ['E-PTB-02', 'E-PTB-04'], ['loi'], 'nhom-dong-chat', 2, [10, 12],
    'Mỗi nhóm nhận 8 thẻ phương trình (có khuyết b, khuyết c, Δ âm, Δ = 0), phân loại theo số nghiệm rồi giải; kiểm tra lại một nghiệm bằng cách thay vào phương trình.', '8 thẻ phương trình'),
  A('HD-VI-01', 'Đoán nghiệm nhanh', ['E-VI-01', 'E-VI-03', 'E-VI-04'], ['loi'], 'ca-lop', 2, [6, 8],
    'Thi nhẩm nghiệm theo đội: giáo viên chiếu phương trình, đội nêu tổng – tích hoặc dấu hiệu a + b + c = 0, a − b + c = 0 rồi đọc nghiệm; đội khác kiểm tra bằng Viète.', 'Slide, bảng điểm'),
  A('HD-VI-02', 'Biểu thức đối xứng qua S và P', ['E-VI-02'], ['loi'], 'nhom-dong-chat', 3, [8, 10],
    'Nhóm biến đổi 4 biểu thức đối xứng (x1² + x2², 1/x1 + 1/x2, x1/x2 + x2/x1, (x1 − x2)²) về S, P; áp dụng cho một phương trình có Δ > 0 và một phương trình vô nghiệm để thấy vì sao phải xét Δ.', 'Phiếu 4 biểu thức'),
  A('HD-LPT-01', 'Bảng ba dòng cho bài toán thực tế', ['E-LPT-01', 'E-LPT-02'], ['loi'], 'nhom-dong-chat', 3, [10, 15],
    'Nhóm lập bảng "dự định – thực tế – quan hệ" cho bài toán xe đi sớm và đội may xong sớm, lập phương trình, giải và loại nghiệm; trình bày lí do loại nghiệm.', 'Giấy A3, 2 đề bài'),
  A('HD-C6-MR', 'Cổng parabol của trường', [], ['san-sang'], 'nhom-dong-chat', 4, [12, 15],
    'Nhóm đo (hoặc dùng số liệu giả định) chiều rộng chân và chiều cao một cổng dạng parabol, tìm hệ số a của y = ax², kiểm tra một điểm trên cổng và đề xuất chiều cao xe tối đa đi qua.', 'Thước dây, giấy kẻ ô')
];
