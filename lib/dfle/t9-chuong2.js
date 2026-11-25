/**
 * NỘI DUNG TOÁN 9 — CHƯƠNG II. PHƯƠNG TRÌNH VÀ BẤT PHƯƠNG TRÌNH BẬC NHẤT MỘT ẨN (Kết nối tri thức)
 * BẢN NHÁP do trợ lý AI soạn theo SGK Toán 9 tập một (Bài 4–6) — giáo viên duyệt trước khi dùng.
 */
const SEC = { 1: 45, 2: 60, 3: 90, 4: 120 };
const B4 = 'Bài 4. Phương trình quy về phương trình bậc nhất một ẩn';
const B5 = 'Bài 5. Bất đẳng thức và tính chất';
const B6 = 'Bài 6. Bất phương trình bậc nhất một ẩn';
const U = (id, bai, muc, name, order, prerequisite, mucTieu, extra = {}) => ({ id, bai, muc, name, order, prerequisite, mucTieu, ...extra });

export const UNITS = [
  U('C2-B4-M1', B4, 'Mục 1', 'Phương trình tích', 20, null,
    'Giải phương trình tích (ax + b)(cx + d) = 0; đưa phương trình về dạng tích bằng cách chuyển vế, đặt nhân tử chung.'),
  U('C2-B4-M2', B4, 'Mục 2', 'Phương trình chứa ẩn ở mẫu', 21, 'C2-B4-M1',
    'Giải phương trình chứa ẩn ở mẫu theo 4 bước: tìm điều kiện xác định, quy đồng và khử mẫu, giải, đối chiếu điều kiện để kết luận.'),
  U('C2-B5-M1', B5, 'Mục 1', 'Bất đẳng thức', 22, null,
    'Nhận biết và đọc, viết bất đẳng thức a > b, a < b, a ≥ b, a ≤ b; diễn đạt "không nhỏ hơn", "không vượt quá" bằng bất đẳng thức.'),
  U('C2-B5-M2', B5, 'Mục 2', 'Tính chất của bất đẳng thức', 23, 'C2-B5-M1',
    'Vận dụng tính chất bắc cầu, liên hệ giữa thứ tự với phép cộng và phép nhân (nhân với số âm thì đổi chiều) để so sánh, chứng minh bất đẳng thức.'),
  U('C2-B6-M1', B6, 'Mục 1', 'Bất phương trình bậc nhất một ẩn', 24, 'C2-B5-M2',
    'Nhận biết bất phương trình bậc nhất một ẩn ax + b > 0 (a ≠ 0) và các dạng ≥, <, ≤; kiểm tra một số có là nghiệm không.'),
  U('C2-B6-M2', B6, 'Mục 2', 'Giải bất phương trình bậc nhất một ẩn', 25, 'C2-B6-M1',
    'Giải bất phương trình bậc nhất một ẩn (chuyển vế đổi dấu, chia cho số âm thì đổi chiều); biểu diễn tập nghiệm trên trục số; giải bài toán thực tế.')
];

const E = (code, ku, role, cluster, ten, tieuDe, phut, misconception, viDu) =>
  ({ code, ku, role, cluster, ten, tieuDe, phut, misconception, viDu, remediation: 'VBH-' + code.slice(2) });
const LOI = [
  E('E-PTT-01', 'C2-B4-M1', 'mediating', 'Phương trình quy về bậc nhất', 'Giải phương trình tích sai, làm mất nghiệm', 'Tích bằng 0 ⇔ một thừa số bằng 0', 5,
    'Giải phương trình tích chỉ lấy một nhân tử, dùng "và" thay "hoặc", hoặc chia hai vế cho biểu thức chứa ẩn nên mất nghiệm', 'x(x − 4) = 0 chia cho x được x = 4'),
  E('E-PTT-02', 'C2-B4-M1', 'root', 'Phương trình quy về bậc nhất', 'Tách tích bằng một số khác 0', 'Chỉ tách được khi tích bằng 0', 5,
    'Áp dụng cách giải phương trình tích khi vế phải khác 0, hoặc chưa chuyển vế đưa về dạng tích bằng 0', '(x − 1)(x + 2) = 4 ⇒ x − 1 = 4 hoặc x + 2 = 4'),
  E('E-PTM-01', 'C2-B4-M2', 'root', 'Phương trình quy về bậc nhất', 'Quên hoặc sai điều kiện xác định', 'Mọi mẫu chứa ẩn phải khác 0', 5,
    'Bỏ qua bước tìm điều kiện xác định, hoặc chỉ đặt điều kiện cho một mẫu, hoặc đặt sai dấu', '1/(x − 2) + 3 = x/(x + 1): chỉ ghi x ≠ 2'),
  E('E-PTM-02', 'C2-B4-M2', 'leaf', 'Phương trình quy về bậc nhất', 'Không đối chiếu điều kiện khi kết luận', 'Loại giá trị làm mẫu bằng 0 hoặc trái điều kiện thực tế', 5,
    'Kết luận cả giá trị làm mẫu bằng 0 (hoặc trái điều kiện của bài toán thực tế) là nghiệm', 'x/(x − 3) = 3/(x − 3) có nghiệm x = 3'),
  E('E-PTM-03', 'C2-B4-M2', 'mediating', 'Phương trình quy về bậc nhất', 'Quy đồng, khử mẫu sai', 'Nhân mọi hạng tử với mẫu thức chung', 6,
    'Khử mẫu mà không nhân đủ các hạng tử với mẫu thức chung, hoặc nhân chéo khi có nhiều phân thức', '1/x + 1/(x + 1) = 1 khử mẫu thành 1 + 1 = x(x + 1)'),
  E('E-BDT-01', 'C2-B5-M1', 'root', 'Bất đẳng thức', 'Đọc, viết bất đẳng thức sai', '"Không nhỏ hơn" là ≥, "không vượt quá" là ≤', 5,
    'Nhầm dấu > với ≥, dịch "không nhỏ hơn", "tối đa", "tối thiểu" sai, hoặc so sánh hai số âm sai', '"a không nhỏ hơn b" viết a > b; −5 > −2'),
  E('E-BDT-02', 'C2-B5-M2', 'mediating', 'Bất đẳng thức', 'Nhân với số âm không đổi chiều', 'Nhân, chia với số âm thì đổi chiều', 6,
    'Nhân hoặc chia hai vế bất đẳng thức với số âm mà giữ nguyên chiều, hoặc đổi chiều cả khi cộng hay nhân với số dương', 'a < b ⇒ −2a < −2b'),
  E('E-BDT-03', 'C2-B5-M2', 'leaf', 'Bất đẳng thức', 'Cộng, trừ, nhân hai bất đẳng thức sai', 'Chỉ cộng vế với vế hai bất đẳng thức cùng chiều', 6,
    'Trừ vế với vế, nhân vế với vế hai bất đẳng thức khi không biết dấu, hoặc suy luận ngược chiều', 'a > b, c > d ⇒ a − c > b − d; a > b ⇒ a² > b²'),
  E('E-BPT-01', 'C2-B6-M1', 'mediating', 'Bất phương trình', 'Nhận dạng, kiểm tra nghiệm bất phương trình sai', 'ax + b > 0 với a ≠ 0', 5,
    'Nhận nhầm bất phương trình bậc nhất một ẩn (a = 0, có x²), kiểm tra nghiệm sai hoặc đếm nghiệm nguyên sai', '0x + 3 > 0 là bất phương trình bậc nhất; x = 1,5 là nghiệm của 2x − 3 > 0'),
  E('E-BPT-02', 'C2-B6-M2', 'leaf', 'Bất phương trình', 'Giải bất phương trình sai chiều, sai dấu', 'Chuyển vế đổi dấu; chia cho số âm đổi chiều', 6,
    'Chia hai vế cho số âm mà không đổi chiều, chuyển vế không đổi dấu, hoặc làm tròn nghiệm thực tế sai', '−2x > 6 ⇔ x > −3'),
  E('E-BPT-03', 'C2-B6-M2', 'leaf', 'Bất phương trình', 'Biểu diễn tập nghiệm trên trục số sai', 'Dấu ( khi không lấy, [ khi lấy điểm mút', 5,
    'Biểu diễn tập nghiệm trên trục số sai phía, dùng nhầm ngoặc tròn với ngoặc vuông', 'x > 2 vẽ ngoặc vuông tại 2')
];
export const ERRORS = LOI.map(({ code, ku, misconception, viDu, remediation }) => ({ code, ku, misconception, viDu, remediation }));
export const REMEDIATION = Object.fromEntries(LOI.map((e) => [e.remediation, { ku: e.ku, title: e.tieuDe, minutes: e.phut }]));

const Q = (id, level, stem, [A, B, C, D], err, hinh) =>
  ({ id, ku: id.replace(/-Q\d+$/, ''), level, sec: SEC[level], stem, opts: { A, B, C, D }, correct: 'A', err, ...(hinh ? { hinh } : {}) });
const e3 = (c) => ({ B: c, C: c, D: c });

const CAU_GOC = [
  // ---------- C2-B4-M1 Phương trình tích
  Q('C2-B4-M1-Q01', 1, 'Phương trình (x − 2)(x + 3) = 0 có các nghiệm là:', ['x = 2; x = −3', 'x = −2; x = 3', 'Chỉ x = 2', 'x = 2; x = 3'], e3('E-PTT-01')),
  Q('C2-B4-M1-Q02', 1, 'Phương trình (ax + b)(cx + d) = 0 tương đương với:', ['ax + b = 0 hoặc cx + d = 0', 'ax + b = 0 và cx + d = 0', 'ax + b = cx + d', 'ax + b = 1 hoặc cx + d = 1'], { B: 'E-PTT-01', C: 'E-PTT-01', D: 'E-PTT-02' }),
  Q('C2-B4-M1-Q03', 2, 'Nghiệm của phương trình (2x − 1)(x + 5) = 0 là:', ['x = 1/2; x = −5', 'x = 2; x = −5', 'x = −1/2; x = 5', 'x = 1/2; x = 5'], e3('E-PTT-01')),
  Q('C2-B4-M1-Q04', 2, 'Giải phương trình x(x − 4) = 0, bạn Nam chia hai vế cho x được x − 4 = 0 nên x = 4. Nhận xét nào đúng?', ['Nam sai vì làm mất nghiệm; nghiệm là x = 0 và x = 4', 'Nam làm đúng', 'Nam sai; nghiệm chỉ là x = 0', 'Nam sai; nghiệm là x = −4'], e3('E-PTT-01')),
  Q('C2-B4-M1-Q05', 3, 'Nghiệm của phương trình x² − 3x = 0 là:', ['x = 0; x = 3', 'Chỉ x = 3', 'x = 0; x = −3', 'x = √3'], { B: 'E-PTT-01', C: 'E-PTT-01', D: 'E-PTT-02' }),
  Q('C2-B4-M1-Q06', 3, 'Cách giải nào đúng cho phương trình (x − 1)(x + 2) = 4?', ['Khai triển, chuyển vế được x² + x − 6 = 0 ⇔ (x − 2)(x + 3) = 0', 'x − 1 = 4 hoặc x + 2 = 4', 'x − 1 = 0 hoặc x + 2 = 0', 'x − 1 = 2 và x + 2 = 2'], e3('E-PTT-02')),
  Q('C2-B4-M1-Q07', 4, 'Nghiệm của phương trình (x + 3)(x − 1) = 2(x + 3) là:', ['x = −3; x = 3', 'Chỉ x = 3', 'x = −3; x = 1', 'x = 1; x = 2'], { B: 'E-PTT-01', C: 'E-PTT-02', D: 'E-PTT-02' }),
  Q('C2-B4-M1-Q08', 4, 'Một mảnh vườn hình chữ nhật có chiều dài hơn chiều rộng 3 m và diện tích 40 m². Gọi chiều rộng là x (m, x > 0). Phương trình và chiều rộng đúng là:', ['x(x + 3) = 40; x = 5', 'x(x + 3) = 40; x = −8', 'x + x + 3 = 40; x = 18,5', 'x(x + 3) = 40; x = 5 hoặc x = −8'], { B: 'E-PTM-02', C: 'E-PTT-02', D: 'E-PTM-02' }),

  // ---------- C2-B4-M2 Phương trình chứa ẩn ở mẫu
  Q('C2-B4-M2-Q01', 1, 'Điều kiện xác định của phương trình 1/(x − 2) + 3 = x/(x + 1) là:', ['x ≠ 2 và x ≠ −1', 'x ≠ 2', 'x ≠ −2 và x ≠ 1', 'x ≠ 0'], e3('E-PTM-01')),
  Q('C2-B4-M2-Q02', 1, 'Bước đầu tiên khi giải phương trình chứa ẩn ở mẫu là:', ['Tìm điều kiện xác định', 'Khử mẫu ngay', 'Nhân chéo hai vế', 'Thử từng giá trị của x'], { B: 'E-PTM-01', C: 'E-PTM-03', D: 'E-PTM-01' }),
  Q('C2-B4-M2-Q03', 2, 'Điều kiện xác định của phương trình 2/x = 3/(x² − 4) là:', ['x ≠ 0; x ≠ 2; x ≠ −2', 'x ≠ 0; x ≠ 2', 'x ≠ 4', 'x ≠ 0; x ≠ 4'], e3('E-PTM-01')),
  Q('C2-B4-M2-Q04', 2, 'Nghiệm của phương trình (x + 1)/(x − 1) = 3 là:', ['x = 2', 'x = 1', 'x = −2', 'x = 1/2'], { B: 'E-PTM-02', C: 'E-PTM-03', D: 'E-PTM-03' }),
  Q('C2-B4-M2-Q05', 3, 'Phương trình x/(x − 3) = 3/(x − 3):', ['Vô nghiệm', 'Có nghiệm x = 3', 'Có vô số nghiệm', 'Có nghiệm x = 0'], { B: 'E-PTM-02', C: 'E-PTM-02', D: 'E-PTM-03' }),
  Q('C2-B4-M2-Q06', 3, 'Với x ≠ 0 và x ≠ −1, khử mẫu phương trình 1/x + 1/(x + 1) = 1 ta được:', ['(x + 1) + x = x(x + 1)', '1 + 1 = x(x + 1)', '(x + 1) + x = 1', 'x + (x + 1) = x + 1'], e3('E-PTM-03')),
  Q('C2-B4-M2-Q07', 4, 'Nghiệm của phương trình x/(x − 1) − 2/(x + 1) = 4/(x² − 1) là:', ['x = 2', 'x = 2; x = −1', 'x = −1', 'x = 1; x = 2'], { B: 'E-PTM-02', C: 'E-PTM-02', D: 'E-PTM-03' }),
  Q('C2-B4-M2-Q08', 4, 'Tổng của một số khác 0 và nghịch đảo của nó bằng 5/2. Số đó là:', ['2 hoặc 1/2', 'Chỉ 2', '5/2', '0 hoặc 2'], { B: 'E-PTT-01', C: 'E-PTM-03', D: 'E-PTM-01' }),

  // ---------- C2-B5-M1 Bất đẳng thức
  Q('C2-B5-M1-Q01', 1, '"a không nhỏ hơn b" được viết là:', ['a ≥ b', 'a > b', 'a ≤ b', 'a < b'], e3('E-BDT-01')),
  Q('C2-B5-M1-Q02', 1, 'Bất đẳng thức nào đúng?', ['−5 < −2', '−5 > −2', '3 ≤ −3', '0 > 1/2'], e3('E-BDT-01')),
  Q('C2-B5-M1-Q03', 2, '"x không vượt quá 10" được viết là:', ['x ≤ 10', 'x < 10', 'x ≥ 10', 'x > 10'], e3('E-BDT-01')),
  Q('C2-B5-M1-Q04', 2, 'Với mọi số thực a, bất đẳng thức nào luôn đúng?', ['a² ≥ 0', 'a² > 0', 'a > −a', '2a > a'], e3('E-BDT-01')),
  Q('C2-B5-M1-Q05', 3, 'Biết a − b = −3. So sánh a và b:', ['a < b', 'a > b', 'a = b', 'Không so sánh được'], e3('E-BDT-01')),
  Q('C2-B5-M1-Q06', 3, 'Một xe tải chở được tối đa 5 tấn hàng. Gọi khối lượng hàng xe chở là m (tấn). Ta có:', ['m ≤ 5', 'm < 5', 'm ≥ 5', 'm > 5'], e3('E-BDT-01')),
  Q('C2-B5-M1-Q07', 4, 'Cho a > b. Khẳng định nào chắc chắn đúng?', ['a − b > 0', 'a² > b²', '1/a < 1/b', 'a > 0'], { B: 'E-BDT-03', C: 'E-BDT-03', D: 'E-BDT-01' }),
  Q('C2-B5-M1-Q08', 2, 'Biển báo trên đường cao tốc ghi "tốc độ tối thiểu 60 km/h, tối đa 100 km/h". Vận tốc v (km/h) được phép thoả mãn:', ['60 ≤ v ≤ 100', '60 < v < 100', 'v ≥ 100', 'v ≤ 60'], e3('E-BDT-01')),

  // ---------- C2-B5-M2 Tính chất của bất đẳng thức
  Q('C2-B5-M2-Q01', 1, 'Cho a < b. Dấu thích hợp điền vào chỗ trống: a + 5 … b + 5 là', ['<', '>', '=', '≥'], e3('E-BDT-02')),
  Q('C2-B5-M2-Q02', 1, 'Cho a < b. Dấu thích hợp điền vào chỗ trống: −2a … −2b là', ['>', '<', '=', '≤'], e3('E-BDT-02')),
  Q('C2-B5-M2-Q03', 2, 'Cho a > b. Bất đẳng thức nào SAI?', ['−3a > −3b', 'a + 2 > b + 2', 'a/5 > b/5', 'a − 1 > b − 1'], e3('E-BDT-02')),
  Q('C2-B5-M2-Q04', 2, 'Cho a < b. So sánh 3a − 1 và 3b − 1:', ['3a − 1 < 3b − 1', '3a − 1 > 3b − 1', '3a − 1 = 3b − 1', 'Không so sánh được'], e3('E-BDT-02')),
  Q('C2-B5-M2-Q05', 3, 'Cho a < b. So sánh 2 − 5a và 2 − 5b:', ['2 − 5a > 2 − 5b', '2 − 5a < 2 − 5b', '2 − 5a = 2 − 5b', 'Không so sánh được'], e3('E-BDT-02')),
  Q('C2-B5-M2-Q06', 3, 'Cho a > b và c > d. Khẳng định nào đúng với mọi số thực a, b, c, d?', ['a + c > b + d', 'a − c > b − d', 'ac > bd', 'a/c > b/d'], e3('E-BDT-03')),
  Q('C2-B5-M2-Q07', 4, 'Cho a < b < 0. Khẳng định nào đúng?', ['a² > b²', 'a² < b²', '1/a < 1/b', 'ab < 0'], e3('E-BDT-03')),
  Q('C2-B5-M2-Q08', 4, 'Cần chứng minh: nếu a > b thì 3a + 1 > 3b − 2. Lập luận nào đúng?', ['a > b ⇒ 3a > 3b ⇒ 3a + 1 > 3b + 1 > 3b − 2', '3a + 1 > 3b − 2 ⇒ a > b', 'a > b ⇒ 3a + 1 > 3b + 1 = 3b − 2', 'a > b ⇒ −3a > −3b ⇒ 3a + 1 > 3b − 2'], { B: 'E-BDT-03', C: 'E-BDT-03', D: 'E-BDT-02' }),

  // ---------- C2-B6-M1 Bất phương trình bậc nhất một ẩn
  Q('C2-B6-M1-Q01', 1, 'Bất phương trình nào là bất phương trình bậc nhất một ẩn?', ['2x − 3 > 0', 'x² + 1 < 0', '0x + 3 > 0', '1/x − 2 ≥ 0'], e3('E-BPT-01')),
  Q('C2-B6-M1-Q02', 1, 'Số nào là nghiệm của bất phương trình 2x − 3 > 0?', ['2', '1', '0', '1,5'], e3('E-BPT-01')),
  Q('C2-B6-M1-Q03', 2, 'x = −2 là nghiệm của bất phương trình nào?', ['3x + 7 > 0', '3x + 7 < 0', 'x − 1 > 0', '−x − 3 > 0'], e3('E-BPT-01')),
  Q('C2-B6-M1-Q04', 2, 'Bất phương trình ax + b > 0 là bất phương trình bậc nhất một ẩn khi:', ['a ≠ 0', 'b ≠ 0', 'a > 0', 'a = 0'], e3('E-BPT-01')),
  Q('C2-B6-M1-Q05', 3, 'Bất phương trình x + 3 ≤ 5 có bao nhiêu nghiệm nguyên dương?', ['2', '3', '1', 'Vô số'], e3('E-BPT-01')),
  Q('C2-B6-M1-Q06', 3, 'Mua bút giá 3 000 đồng/cái với số tiền không quá 50 000 đồng. Gọi số bút mua được là x. Bất phương trình đúng là:', ['3 000x ≤ 50 000', '3 000x < 50 000', '3 000x ≥ 50 000', 'x ≤ 50 000'], { B: 'E-BDT-01', C: 'E-BDT-01', D: 'E-BPT-01' }),
  Q('C2-B6-M1-Q07', 4, 'Có 50 000 đồng, mua bút giá 3 000 đồng/cái. Số bút nhiều nhất mua được là:', ['16 cái', '17 cái', '16,6 cái', '15 cái'], { B: 'E-BPT-02', C: 'E-BPT-01', D: 'E-BPT-02' }),
  Q('C2-B6-M1-Q08', 2, 'Tìm m để (m − 2)x + 1 > 0 là bất phương trình bậc nhất một ẩn.', ['m ≠ 2', 'm = 2', 'm > 2', 'm ≠ −2'], e3('E-BPT-01')),

  // ---------- C2-B6-M2 Giải bất phương trình
  Q('C2-B6-M2-Q01', 1, 'Giải bất phương trình x − 3 > 2 được:', ['x > 5', 'x > −1', 'x < 5', 'x > 6'], e3('E-BPT-02')),
  Q('C2-B6-M2-Q02', 1, 'Nghiệm của bất phương trình −2x > 6 là:', ['x < −3', 'x > −3', 'x > 3', 'x < 3'], e3('E-BPT-02')),
  Q('C2-B6-M2-Q03', 2, 'Nghiệm của bất phương trình 3x + 4 ≤ 2x − 1 là:', ['x ≤ −5', 'x ≤ −3', 'x ≥ −5', 'x ≤ 5'], e3('E-BPT-02')),
  Q('C2-B6-M2-Q04', 2, 'Trên trục số, tập nghiệm x > 2 được biểu diễn bởi:', ['Phần bên phải điểm 2, ngoặc tròn "(" tại 2', 'Phần bên phải điểm 2, ngoặc vuông "[" tại 2', 'Phần bên trái điểm 2', 'Chỉ một điểm 2'], e3('E-BPT-03')),
  Q('C2-B6-M2-Q05', 3, 'Nghiệm của bất phương trình 5 − 2x ≥ 1 là:', ['x ≤ 2', 'x ≥ 2', 'x ≤ −2', 'x ≥ 3'], e3('E-BPT-02')),
  Q('C2-B6-M2-Q06', 3, 'Nghiệm của bất phương trình (x − 1)/2 < (x + 2)/3 là:', ['x < 7', 'x < 1', 'x > 7', 'x < 5'], e3('E-BPT-02')),
  Q('C2-B6-M2-Q07', 4, 'Giá trị nguyên lớn nhất của x thoả mãn 2(x − 3) − 1 < 3 − x là:', ['3', '4', '10/3', '2'], { B: 'E-BPT-02', C: 'E-BPT-03', D: 'E-BPT-02' }),
  Q('C2-B6-M2-Q08', 4, 'Một hãng taxi tính 15 000 đồng cho km đầu tiên và 12 000 đồng cho mỗi km tiếp theo. Với 200 000 đồng, khách đi được nhiều nhất bao nhiêu km (số nguyên)?', ['16 km', '15 km', '17 km', '13 km'], e3('E-BPT-02'))
];

// ---------------------------------------------------------------------------
// BỔ SUNG 23/11/2026: mỗi mục 8 → 16 câu, phân bố 4 🌱 · 5 🌿 · 4 🌳 · 3 ⭐. Đáp án đã tính lại bằng máy. BẢN NHÁP chờ duyệt.
const CAU_MOI = [
  // ---------- C2-B4-M1
  Q('C2-B4-M1-Q09', 1, 'Nghiệm của phương trình (x + 4)(x − 1) = 0 là:', ['x = −4; x = 1', 'x = 4; x = −1', 'Chỉ x = 1', 'x = −4; x = −1'], e3('E-PTT-01')),
  Q('C2-B4-M1-Q10', 1, 'Nghiệm của phương trình x(x + 7) = 0 là:', ['x = 0; x = −7', 'Chỉ x = −7', 'x = 0; x = 7', 'x = 7'], e3('E-PTT-01')),
  Q('C2-B4-M1-Q11', 2, 'Nghiệm của phương trình (3x − 6)(2x + 1) = 0 là:', ['x = 2; x = −1/2', 'x = −2; x = 1/2', 'x = 6; x = −1', 'x = 2; x = 1/2'], e3('E-PTT-01')),
  Q('C2-B4-M1-Q12', 2, 'Nghiệm của phương trình x² − 16 = 0 là:', ['x = 4; x = −4', 'Chỉ x = 4', 'x = 16', 'x = 8; x = −8'], { B: 'E-PTT-01', C: 'E-PTT-02', D: 'E-PTT-02' }),
  Q('C2-B4-M1-Q13', 2, 'Đưa phương trình x² + 5x = 0 về dạng phương trình tích, ta được:', ['x(x + 5) = 0', 'x(x − 5) = 0', '(x + 5)² = 0', 'x + 5 = 0'], e3('E-PTT-02')),
  Q('C2-B4-M1-Q14', 3, 'Nghiệm của phương trình 2x(x − 3) + 5(x − 3) = 0 là:', ['x = 3; x = −5/2', 'x = −3; x = 5/2', 'Chỉ x = 3', 'x = 3; x = −5'], { B: 'E-PTT-01', C: 'E-PTT-01', D: 'E-PTT-02' }),
  Q('C2-B4-M1-Q15', 3, 'Nghiệm của phương trình x² − 4x + 4 = 0 là:', ['x = 2', 'x = −2', 'x = 2; x = −2', 'x = 4'], e3('E-PTT-02')),
  Q('C2-B4-M1-Q16', 4, 'Nghiệm của phương trình (2x − 1)² = (x + 3)² là:', ['x = 4; x = −2/3', 'Chỉ x = 4', 'x = 4; x = 2/3', 'x = −4; x = −2/3'], { B: 'E-PTT-02', C: 'E-PTT-01', D: 'E-PTT-01' }),
  // ---------- C2-B4-M2
  Q('C2-B4-M2-Q09', 1, 'Điều kiện xác định của phương trình 3/(x + 2) = 1 là:', ['x ≠ −2', 'x ≠ 2', 'x ≠ 0', 'x ≠ 3'], e3('E-PTM-01')),
  Q('C2-B4-M2-Q10', 1, 'Điều kiện xác định của phương trình x/(x − 5) + 1/x = 2 là:', ['x ≠ 5 và x ≠ 0', 'x ≠ 5', 'x ≠ 0', 'x ≠ −5 và x ≠ 0'], e3('E-PTM-01')),
  Q('C2-B4-M2-Q11', 2, 'Nghiệm của phương trình 2/(x − 1) = 1 là:', ['x = 3', 'x = 1', 'x = 2', 'x = −1'], { B: 'E-PTM-02', C: 'E-PTM-03', D: 'E-PTM-03' }),
  Q('C2-B4-M2-Q12', 2, 'Mẫu thức chung của các phân thức trong phương trình 1/(x − 2) + 3/(x + 2) = 4/(x² − 4) là:', ['x² − 4', '(x − 2)²(x + 2)²', 'x − 2', '(x² − 4)(x − 2)(x + 2)'], e3('E-PTM-03')),
  Q('C2-B4-M2-Q13', 2, 'Giá trị x = 2 có thể là nghiệm của phương trình 1/(x − 2) + x = 3 không?', ['Không, vì x = 2 làm mẫu bằng 0', 'Có', 'Có, nếu thay vào vế phải được 3', 'Không, vì 2 là số chẵn'], e3('E-PTM-02')),
  Q('C2-B4-M2-Q14', 3, 'Nghiệm của phương trình (2x + 1)/(x − 3) = 3 là:', ['x = 10', 'x = −10', 'x = 3', 'x = 2'], { B: 'E-PTM-03', C: 'E-PTM-02', D: 'E-PTM-03' }),
  Q('C2-B4-M2-Q15', 3, 'Nghiệm của phương trình (x² − 1)/(x − 1) = 0 là:', ['x = −1', 'x = 1; x = −1', 'x = 1', 'Vô nghiệm'], e3('E-PTM-02')),
  Q('C2-B4-M2-Q16', 4, 'Nghiệm của phương trình 1/(x − 1) + 2/(x + 1) = 3/(x² − 1) là:', ['x = 4/3', 'x = 1', 'x = 2/3', 'Vô nghiệm'], { B: 'E-PTM-02', C: 'E-PTM-03', D: 'E-PTM-02' }),
  // ---------- C2-B5-M1
  Q('C2-B5-M1-Q09', 1, '"a không lớn hơn b" được viết là:', ['a ≤ b', 'a < b', 'a ≥ b', 'a > b'], e3('E-BDT-01')),
  Q('C2-B5-M1-Q10', 1, 'Bất đẳng thức nào đúng?', ['−7 < −3', '−7 > −3', '2 ≥ 5', '0 < −1'], e3('E-BDT-01')),
  Q('C2-B5-M1-Q11', 2, 'Số tiền tối thiểu để tham gia chuyến đi là 100 000 đồng. Gọi x là số tiền (đồng) một bạn mang theo để được tham gia. Ta có:', ['x ≥ 100 000', 'x > 100 000', 'x ≤ 100 000', 'x < 100 000'], e3('E-BDT-01')),
  Q('C2-B5-M1-Q12', 2, 'Cho a = −2,5 và b = −2,3. Khẳng định đúng là:', ['a < b', 'a > b', 'a = b', 'a ≥ b'], e3('E-BDT-01')),
  Q('C2-B5-M1-Q13', 3, 'Cho a ≥ b và b ≥ a. Khi đó:', ['a = b', 'a > b', 'a < b', 'Không kết luận được'], e3('E-BDT-01')),
  Q('C2-B5-M1-Q14', 3, 'Với mọi số thực x, bất đẳng thức nào luôn đúng?', ['(x − 1)² ≥ 0', '(x − 1)² > 0', 'x − 1 > 0', 'x² > x'], e3('E-BDT-01')),
  Q('C2-B5-M1-Q15', 4, 'Một thang máy chở tối đa 600 kg. Trong thang có 8 người, tổng khối lượng 560 kg, mang thêm x kg hàng. Điều kiện để thang máy chở được là:', ['560 + x ≤ 600', '560 + x < 600', '560 + x ≥ 600', '8x ≤ 600'], e3('E-BDT-01')),
  Q('C2-B5-M1-Q16', 4, 'Để chứng minh a² + b² ≥ 2ab với mọi a, b, ta dựa vào bất đẳng thức:', ['(a − b)² ≥ 0', '(a + b)² ≥ 0', 'a ≥ b', 'a² + b² > 0'], e3('E-BDT-01')),
  // ---------- C2-B5-M2
  Q('C2-B5-M2-Q09', 1, 'Cho a > b. Dấu thích hợp điền vào chỗ trống: a − 3 … b − 3 là', ['>', '<', '=', '≤'], e3('E-BDT-02')),
  Q('C2-B5-M2-Q10', 1, 'Cho a > b. Dấu thích hợp điền vào chỗ trống: −a … −b là', ['<', '>', '=', '≥'], e3('E-BDT-02')),
  Q('C2-B5-M2-Q11', 2, 'Cho a < b. Khẳng định nào đúng?', ['−4a > −4b', '−4a < −4b', '4a > 4b', 'a/4 > b/4'], e3('E-BDT-02')),
  Q('C2-B5-M2-Q12', 2, 'Cho a ≥ b. So sánh 5a + 2 và 5b + 2:', ['5a + 2 ≥ 5b + 2', '5a + 2 ≤ 5b + 2', '5a + 2 < 5b + 2', 'Không so sánh được'], e3('E-BDT-02')),
  Q('C2-B5-M2-Q13', 2, 'Cho 2a + 1 > 2b + 1. So sánh a và b:', ['a > b', 'a < b', 'a = b', 'Không so sánh được'], e3('E-BDT-03')),
  Q('C2-B5-M2-Q14', 3, 'Cho a > b. So sánh 3 − 2a và 3 − 2b:', ['3 − 2a < 3 − 2b', '3 − 2a > 3 − 2b', '3 − 2a = 3 − 2b', 'Không so sánh được'], e3('E-BDT-02')),
  Q('C2-B5-M2-Q15', 3, 'Cho a > 2 và b > 3. Khẳng định nào chắc chắn đúng?', ['a + b > 5', 'a − b > −1', 'ab < 6', 'a + b < 5'], e3('E-BDT-03')),
  Q('C2-B5-M2-Q16', 4, 'Cho a > b > 0. Khẳng định nào đúng?', ['a² > b²', 'a² < b²', '1/a > 1/b', '−a > −b'], { B: 'E-BDT-03', C: 'E-BDT-03', D: 'E-BDT-02' }),
  // ---------- C2-B6-M1
  Q('C2-B6-M1-Q09', 1, 'Bất phương trình nào là bất phương trình bậc nhất một ẩn?', ['−3x + 5 ≤ 0', 'x² − 4 > 0', '0x − 1 < 0', '2/x + 1 ≥ 0'], e3('E-BPT-01')),
  Q('C2-B6-M1-Q10', 1, 'Số nào là nghiệm của bất phương trình x + 2 < 5?', ['2', '3', '4', '5'], e3('E-BPT-01')),
  Q('C2-B6-M1-Q11', 2, 'x = 3 là nghiệm của bất phương trình nào?', ['2x − 1 > 4', '2x − 1 < 4', 'x + 1 ≤ 3', '−x > 0'], e3('E-BPT-01')),
  Q('C2-B6-M1-Q12', 2, 'Bất phương trình 2x − 4 ≥ 0 có dạng ax + b ≥ 0 với:', ['a = 2; b = −4', 'a = 2; b = 4', 'a = −4; b = 2', 'a = 4; b = −2'], e3('E-BPT-01')),
  Q('C2-B6-M1-Q13', 3, 'Bất phương trình 2x < 7 có bao nhiêu nghiệm nguyên dương?', ['3', '4', '2', 'Vô số'], e3('E-BPT-01')),
  Q('C2-B6-M1-Q14', 3, 'Mỗi vé xem phim giá 60 000 đồng, bạn Hoa có 400 000 đồng. Gọi số vé Hoa mua được là x. Bất phương trình đúng là:', ['60 000x ≤ 400 000', '60 000x < 400 000', '60 000x ≥ 400 000', 'x ≤ 400 000'], e3('E-BPT-01')),
  Q('C2-B6-M1-Q15', 4, 'Mỗi vé xem phim giá 60 000 đồng, bạn Hoa có 400 000 đồng. Số vé nhiều nhất Hoa mua được là:', ['6 vé', '7 vé', '6,67 vé', '5 vé'], e3('E-BPT-01')),
  Q('C2-B6-M1-Q16', 4, 'Tìm m để x = 2 là nghiệm của bất phương trình mx − 1 > 3.', ['m > 2', 'm < 2', 'm = 2', 'm ≥ 2'], e3('E-BPT-01')),
  // ---------- C2-B6-M2
  Q('C2-B6-M2-Q09', 1, 'Nghiệm của bất phương trình x + 4 ≤ 1 là:', ['x ≤ −3', 'x ≤ 5', 'x ≥ −3', 'x ≤ 3'], e3('E-BPT-02')),
  Q('C2-B6-M2-Q10', 1, 'Nghiệm của bất phương trình 3x < 12 là:', ['x < 4', 'x > 4', 'x < 9', 'x < 36'], e3('E-BPT-02')),
  Q('C2-B6-M2-Q11', 2, 'Nghiệm của bất phương trình −5x ≥ 15 là:', ['x ≤ −3', 'x ≥ −3', 'x ≤ 3', 'x ≥ 3'], e3('E-BPT-02')),
  Q('C2-B6-M2-Q12', 2, 'Trên trục số, tập nghiệm x ≤ −1 được biểu diễn bởi:', ['Phần bên trái điểm −1, ngoặc vuông "]" tại −1', 'Phần bên trái điểm −1, ngoặc tròn ")" tại −1', 'Phần bên phải điểm −1', 'Chỉ một điểm −1'], e3('E-BPT-03')),
  Q('C2-B6-M2-Q13', 2, 'Nghiệm của bất phương trình 4x − 3 > 2x + 5 là:', ['x > 4', 'x > 1', 'x < 4', 'x > 8'], e3('E-BPT-02')),
  Q('C2-B6-M2-Q14', 3, 'Nghiệm của bất phương trình 3(x − 2) ≤ 5x + 4 là:', ['x ≥ −5', 'x ≤ −5', 'x ≥ 5', 'x ≥ −1'], e3('E-BPT-02')),
  Q('C2-B6-M2-Q15', 3, 'Nghiệm của bất phương trình (x + 3)/2 > (2x − 1)/3 là:', ['x < 11', 'x > 11', 'x < 7', 'x < 5'], e3('E-BPT-02')),
  Q('C2-B6-M2-Q16', 4, 'Bạn Minh có 1 200 000 đồng, mua một bàn phím giá 450 000 đồng, số tiền còn lại dùng mua bút giá 25 000 đồng/chiếc. Minh mua được nhiều nhất bao nhiêu chiếc bút?', ['30 chiếc', '29 chiếc', '48 chiếc', '31 chiếc'], e3('E-BPT-02'))
];

const HINH = {};

export const QUESTIONS = [...CAU_GOC, ...CAU_MOI]
  .map((q) => (HINH[q.id] ? { ...q, hinh: HINH[q.id] } : q))
  .sort((a, b) => a.id.localeCompare(b.id));

export const HINTS = {
  'E-PTT-01': ['Tích bằng 0 khi nào: khi cả hai thừa số bằng 0 hay chỉ cần một thừa số bằng 0?', 'A·B = 0 ⇔ A = 0 hoặc B = 0. Giải từng phương trình bậc nhất rồi lấy tất cả nghiệm. Không chia hai vế cho biểu thức chứa ẩn vì có thể làm mất nghiệm.', 'Ví dụ: x(x − 4) = 0 ⇔ x = 0 hoặc x = 4; chia cho x sẽ mất nghiệm x = 0.'],
  'E-PTT-02': ['Vế phải của phương trình đã bằng 0 chưa? Nếu tích bằng 4 thì mỗi thừa số có bắt buộc bằng 4 không?', 'Chỉ khi tích bằng 0 mới tách thành từng thừa số bằng 0. Nếu vế phải khác 0: chuyển hết sang một vế, rút gọn rồi phân tích thành nhân tử.', 'Ví dụ: (x − 1)(x + 2) = 4 ⇔ x² + x − 6 = 0 ⇔ (x − 2)(x + 3) = 0 ⇔ x = 2 hoặc x = −3.'],
  'E-PTM-01': ['Phương trình có những mẫu nào chứa ẩn? Mỗi mẫu bằng 0 khi x bằng bao nhiêu?', 'Điều kiện xác định: mọi mẫu chứa ẩn đều khác 0. Phân tích mẫu thành nhân tử (x² − 4 = (x − 2)(x + 2)) để không bỏ sót.', 'Ví dụ: 1/(x − 2) + 3 = x/(x + 1) có điều kiện x ≠ 2 và x ≠ −1.'],
  'E-PTM-02': ['Giá trị vừa tìm có làm mẫu nào bằng 0 không? Có hợp với điều kiện của bài toán không?', 'Giải xong phải đối chiếu điều kiện xác định (và điều kiện thực tế); giá trị nào vi phạm thì loại. Có thể phương trình vô nghiệm.', 'Ví dụ: x/(x − 3) = 3/(x − 3) dẫn tới x = 3, nhưng x ≠ 3 nên phương trình vô nghiệm.'],
  'E-PTM-03': ['Mẫu thức chung là gì? Em đã nhân nó với mọi hạng tử ở hai vế chưa?', 'Quy đồng mẫu hai vế bằng mẫu thức chung rồi khử mẫu: mỗi tử nhân với nhân tử phụ của nó; hạng tử không có mẫu nhân với cả mẫu thức chung.', 'Ví dụ: 1/x + 1/(x + 1) = 1 (MTC x(x + 1)) ⇒ (x + 1) + x = x(x + 1).'],
  'E-BDT-01': ['"Không nhỏ hơn" nghĩa là lớn hơn, hay lớn hơn hoặc bằng?', '"Không nhỏ hơn", "tối thiểu" → ≥; "không vượt quá", "tối đa" → ≤. Với số âm: số nào có giá trị tuyệt đối lớn hơn thì nhỏ hơn.', 'Ví dụ: "a không nhỏ hơn b" là a ≥ b; −5 < −2.'],
  'E-BDT-02': ['Em đang nhân hai vế với số dương hay số âm?', 'Cộng, trừ cùng một số: giữ chiều. Nhân, chia với số dương: giữ chiều. Nhân, chia với số âm: đổi chiều.', 'Ví dụ: a < b ⇒ −2a > −2b; a < b ⇒ 2 − 5a > 2 − 5b.'],
  'E-BDT-03': ['Hai bất đẳng thức có được trừ vế với vế không? Em đã biết dấu các số chưa?', 'Chỉ cộng vế với vế hai bất đẳng thức cùng chiều. Không trừ vế với vế; nhân vế với vế chỉ khi các vế đều dương. Bắc cầu: a > b và b > c thì a > c.', 'Ví dụ: a > b, c > d ⇒ a + c > b + d; với a = −3 < b = −2 thì a² = 9 > b² = 4.'],
  'E-BPT-01': ['Hệ số của x có khác 0 không? Thay số vào thì bất đẳng thức có đúng không?', 'Bất phương trình bậc nhất một ẩn có dạng ax + b > 0 (hoặc <, ≥, ≤) với a ≠ 0. Số x0 là nghiệm nếu thay vào được bất đẳng thức đúng; dấu > không chấp nhận bằng.', 'Ví dụ: x = 1,5 thay vào 2x − 3 > 0 được 0 > 0, sai, nên 1,5 không là nghiệm.'],
  'E-BPT-02': ['Khi chia hai vế cho một số âm, chiều bất phương trình có giữ nguyên không?', 'Chuyển vế thì đổi dấu hạng tử. Nhân, chia hai vế cho số dương giữ chiều; cho số âm đổi chiều. Bài thực tế: lấy số nguyên lớn nhất (nhỏ nhất) thoả mãn.', 'Ví dụ: −2x > 6 ⇔ x < −3; 3 000x ≤ 50 000 ⇔ x ≤ 16,6… nên mua nhiều nhất 16 bút.'],
  'E-BPT-03': ['Điểm mút có thuộc tập nghiệm không? Tập nghiệm nằm bên trái hay bên phải điểm đó?', 'Dấu > hoặc < dùng ngoặc tròn (không lấy điểm mút); ≥ hoặc ≤ dùng ngoặc vuông. x > a: phần bên phải; x < a: phần bên trái.', 'Ví dụ: x > 2 là phần bên phải điểm 2 với ngoặc tròn "(" tại 2; x ≤ −5 là bên trái −5 với ngoặc "]".']
};

const V = (dan, quyTac, viDu, tuLam) => ({ dan, quyTac, viDu: viDu.map(([de, giai]) => ({ de, giai })), tuLam: tuLam.map(([de, dapAn, giaiThich]) => ({ de, dapAn, giaiThich })) });
export const VI_BAI_HOC = {
  'VBH-PTT-01': V('Tích bằng 0 chỉ cần một thừa số bằng 0 — nên phương trình tích thường có nhiều nghiệm.',
    'A·B = 0 ⇔ A = 0 hoặc B = 0. Giải lần lượt từng phương trình rồi gom tất cả nghiệm. Không chia hai vế cho biểu thức chứa ẩn.',
    [['Giải x(x − 4) = 0.', 'Cách nghĩ sai: chia cho x được x = 4. Cách đúng: x = 0 hoặc x − 4 = 0, nghiệm x = 0; x = 4.'],
     ['Giải (2x − 1)(x + 5) = 0.', '2x − 1 = 0 ⇔ x = 1/2; x + 5 = 0 ⇔ x = −5.']],
    [['Giải (x − 2)(x + 3) = 0.', 'x = 2; x = −3', 'Mỗi thừa số bằng 0.'],
     ['Giải x² − 3x = 0.', 'x = 0; x = 3', 'x(x − 3) = 0.']]),
  'VBH-PTT-02': V('Cách tách "từng thừa số bằng 0" chỉ dùng được khi vế phải là số 0.',
    'Nếu tích bằng một số khác 0: chuyển hết về một vế, rút gọn, phân tích thành nhân tử rồi mới dùng A·B = 0.',
    [['Giải (x − 1)(x + 2) = 4.', 'Cách nghĩ sai: x − 1 = 4 hoặc x + 2 = 4. Cách đúng: x² + x − 6 = 0 ⇔ (x − 2)(x + 3) = 0 ⇔ x = 2 hoặc x = −3.'],
     ['Giải (x + 3)(x − 1) = 2(x + 3).', '(x + 3)(x − 1) − 2(x + 3) = 0 ⇔ (x + 3)(x − 3) = 0 ⇔ x = ±3.']],
    [['Giải x(x + 1) = 2.', 'x = 1; x = −2', 'x² + x − 2 = 0 ⇔ (x − 1)(x + 2) = 0.'],
     ['Giải (x − 2)² = x − 2.', 'x = 2; x = 3', '(x − 2)(x − 3) = 0.']]),
  'VBH-PTM-01': V('Mẫu bằng 0 thì phân thức vô nghĩa. Vì thế bước đầu tiên luôn là "cấm" các giá trị đó.',
    'Điều kiện xác định: mọi mẫu chứa ẩn khác 0. Phân tích mẫu thành nhân tử để tìm đủ các giá trị bị loại.',
    [['Tìm ĐKXĐ của 1/(x − 2) + 3 = x/(x + 1).', 'Cách nghĩ sai: chỉ x ≠ 2. Cách đúng: x − 2 ≠ 0 và x + 1 ≠ 0 ⇔ x ≠ 2 và x ≠ −1.'],
     ['Tìm ĐKXĐ của 2/x = 3/(x² − 4).', 'x ≠ 0 và (x − 2)(x + 2) ≠ 0 ⇔ x ≠ 0; x ≠ ±2.']],
    [['ĐKXĐ của 5/(2x − 6)?', 'x ≠ 3', '2x − 6 ≠ 0.'],
     ['ĐKXĐ của 1/(x² − 1)?', 'x ≠ ±1', 'x² − 1 = (x − 1)(x + 1).']]),
  'VBH-PTM-02': V('Giải ra x chưa phải là xong: còn bước "soát vé" với điều kiện.',
    'Sau khi giải phương trình đã khử mẫu, loại các giá trị vi phạm điều kiện xác định (và điều kiện thực tế). Không còn giá trị nào thì phương trình vô nghiệm.',
    [['Giải x/(x − 3) = 3/(x − 3).', 'Cách nghĩ sai: x = 3 là nghiệm. Cách đúng: ĐKXĐ x ≠ 3; khử mẫu được x = 3, bị loại, phương trình vô nghiệm.'],
     ['Chiều rộng x > 0 thoả x(x + 3) = 40.', 'x = 5 hoặc x = −8; loại −8 vì x > 0, chiều rộng 5 m.']],
    [['ĐKXĐ x ≠ 1, giải được x = 1 và x = 2. Nghiệm?', 'x = 2', 'Loại x = 1.'],
     ['ĐKXĐ x ≠ ±1, giải được x = −1. Kết luận?', 'Vô nghiệm', 'Giá trị duy nhất bị loại.']]),
  'VBH-PTM-03': V('Khử mẫu giống "nhân cả nhà" với mẫu thức chung: không được sót hạng tử nào.',
    'Tìm mẫu thức chung (MTC), quy đồng hai vế, rồi khử mẫu: mỗi tử nhân với nhân tử phụ; hạng tử không có mẫu nhân với cả MTC.',
    [['Khử mẫu 1/x + 1/(x + 1) = 1.', 'Cách nghĩ sai: 1 + 1 = x(x + 1). Cách đúng: MTC x(x + 1): (x + 1) + x = x(x + 1).'],
     ['Giải (x + 1)/(x − 1) = 3.', 'x + 1 = 3(x − 1) ⇔ x = 2 (thoả x ≠ 1).']],
    [['Khử mẫu x/2 + 1/3 = 1.', '3x + 2 = 6', 'MTC 6.'],
     ['Giải 2/x = 1.', 'x = 2', 'x ≠ 0; 2 = x.']]),
  'VBH-BDT-01': V('Mỗi cụm từ trong lời văn ứng với đúng một dấu. Đọc đúng là viết đúng.',
    '"Lớn hơn" >, "nhỏ hơn" <, "không nhỏ hơn / tối thiểu / ít nhất" ≥, "không lớn hơn / không vượt quá / tối đa" ≤. Với hai số âm, số có giá trị tuyệt đối lớn hơn thì nhỏ hơn.',
    [['Viết "a không nhỏ hơn b".', 'Cách nghĩ sai: a > b. Cách đúng: a ≥ b (a lớn hơn hoặc bằng b).'],
     ['So sánh −5 và −2.', '−5 nằm bên trái −2 trên trục số nên −5 < −2.']],
    [['"Tối đa 5 tấn" với m?', 'm ≤ 5', 'Không vượt quá.'],
     ['a − b = −3 thì?', 'a < b', 'Hiệu âm.']]),
  'VBH-BDT-02': V('Có đúng một phép làm bất đẳng thức "lộn chiều": nhân hoặc chia với số âm.',
    'a < b ⇒ a + c < b + c (mọi c). a < b, c > 0 ⇒ ac < bc. a < b, c < 0 ⇒ ac > bc (đổi chiều).',
    [['Cho a < b, so sánh −2a và −2b.', 'Cách nghĩ sai: −2a < −2b. Cách đúng: nhân với −2 < 0 nên đổi chiều: −2a > −2b.'],
     ['Cho a < b, so sánh 3a − 1 và 3b − 1.', 'Nhân 3 > 0 giữ chiều rồi trừ 1: 3a − 1 < 3b − 1.']],
    [['a > b thì −a … −b?', '<', 'Nhân −1.'],
     ['a < b thì a/4 … b/4?', '<', 'Chia số dương.']]),
  'VBH-BDT-03': V('Hai bất đẳng thức chỉ "cộng" được với nhau. Trừ hay nhân thì phải rất cẩn thận.',
    'a > b và c > d ⇒ a + c > b + d. Không có quy tắc trừ vế với vế. Nhân vế với vế chỉ đúng khi các vế đều dương. Muốn chứng minh, đi từ giả thiết đến kết luận.',
    [['a > b, c > d có suy ra a − c > b − d?', 'Cách nghĩ sai: có. Phản ví dụ: 5 > 1, 10 > 0 nhưng 5 − 10 = −5 < 1 − 0 = 1.'],
     ['a < b < 0, so sánh a² và b².', 'Ví dụ a = −3, b = −2: 9 > 4. Thật vậy a² − b² = (a − b)(a + b) > 0 vì cả hai thừa số âm.']],
    [['3 > 1 và 2 > 0 thì 3 + 2 … 1 + 0?', '>', 'Cộng vế với vế.'],
     ['a > b có suy ra a² > b² với mọi a, b?', 'Không', 'a = 1, b = −2.']]),
  'VBH-BPT-01': V('Bất phương trình bậc nhất một ẩn: giống phương trình bậc nhất, chỉ thay dấu "=" bằng dấu so sánh.',
    'Dạng ax + b > 0 (hoặc <, ≥, ≤) với a ≠ 0. Số x0 là nghiệm nếu thay vào được bất đẳng thức đúng. Dấu > không nhận trường hợp bằng.',
    [['x = 1,5 có là nghiệm của 2x − 3 > 0?', 'Cách nghĩ sai: có. Cách đúng: 2·1,5 − 3 = 0 và 0 > 0 sai, nên không.'],
     ['0x + 3 > 0 có phải bất phương trình bậc nhất một ẩn?', 'Không vì a = 0.']],
    [['x = 2 có là nghiệm của 2x − 3 > 0?', 'Có', '1 > 0.'],
     ['Nghiệm nguyên dương của x ≤ 2?', '1; 2', 'Số nguyên dương nhỏ hơn hoặc bằng 2.']]),
  'VBH-BPT-02': V('Giải bất phương trình như giải phương trình — trừ một chỗ: chia cho số âm.',
    'Chuyển vế: đổi dấu hạng tử. Chia hai vế cho a > 0: giữ chiều; cho a < 0: đổi chiều. Bài thực tế: chọn số nguyên phù hợp.',
    [['Giải −2x > 6.', 'Cách nghĩ sai: x > −3. Cách đúng: chia cho −2 < 0, đổi chiều: x < −3.'],
     ['Giải 5 − 2x ≥ 1.', '−2x ≥ −4 ⇔ x ≤ 2.']],
    [['Giải x − 3 > 2.', 'x > 5', 'Chuyển vế.'],
     ['Giải 3x + 4 ≤ 2x − 1.', 'x ≤ −5', 'Chuyển vế.']]),
  'VBH-BPT-03': V('Trục số giúp "nhìn thấy" tập nghiệm — nhưng ngoặc và phía phải đúng.',
    '> hoặc <: ngoặc tròn, không lấy điểm mút. ≥ hoặc ≤: ngoặc vuông, lấy điểm mút. x > a: phía phải a; x < a: phía trái a.',
    [['Biểu diễn x > 2.', 'Cách nghĩ sai: ngoặc vuông tại 2. Cách đúng: ngoặc tròn "(" tại 2, gạch bỏ phần bên trái.'],
     ['Biểu diễn x ≤ −5.', 'Ngoặc vuông "]" tại −5, lấy phần bên trái.']],
    [['x ≥ 1 dùng ngoặc nào tại 1?', '[', 'Lấy điểm 1.'],
     ['x < 0 lấy phía nào?', 'Bên trái 0', 'Nhỏ hơn 0.']])
};

export const ERROR_NODES = LOI.map((e) => ({ id: e.code, name: e.ten, role: e.role, kuId: e.ku, cluster: e.cluster }));
export const CAUSAL_EDGES = [
  { from: 'E-PTT-02', to: 'E-PTT-01', weight: 0.55, reason: 'Chưa hiểu bản chất "tích bằng 0" nên giải phương trình tích sai' },
  { from: 'E-PTM-01', to: 'E-PTM-02', weight: 0.7, reason: 'Không tìm điều kiện xác định thì không có gì để đối chiếu' },
  { from: 'E-PTM-03', to: 'E-PTM-02', weight: 0.45, reason: 'Khử mẫu sai sinh nghiệm lạ' },
  { from: 'E-BDT-01', to: 'E-BDT-02', weight: 0.5, reason: 'Chưa vững thứ tự trên trục số nên đổi chiều sai' },
  { from: 'E-BDT-02', to: 'E-BDT-03', weight: 0.5, reason: 'Không nắm khi nào đổi chiều nên biến đổi hai bất đẳng thức sai' },
  { from: 'E-BDT-02', to: 'E-BPT-02', weight: 0.75, reason: 'Nhân, chia số âm không đổi chiều nên giải bất phương trình sai' },
  { from: 'E-BDT-01', to: 'E-BPT-01', weight: 0.5, reason: 'Đọc dấu sai nên kiểm tra nghiệm sai' },
  { from: 'E-BDT-01', to: 'E-BPT-03', weight: 0.5, reason: 'Nhầm > với ≥ nên chọn ngoặc sai trên trục số' },
  { from: 'E-BPT-01', to: 'E-BPT-03', weight: 0.4, reason: 'Chưa hiểu nghiệm là gì nên biểu diễn tập nghiệm sai' }
];
export const ROOT_ERROR_IDS = ['E-PTT-02', 'E-PTM-01', 'E-BDT-01'];

const NHAP = 'Bản nháp do trợ lý AI soạn theo từ điển mã lỗi — giáo viên cần duyệt, sửa trước khi dùng';
const A = (id, ten, errorCodes, nhom, hinhThuc, mucNhanThuc, phut, moTa, hocLieu) => ({ id, ten, errorCodes, nhom, hinhThuc, mucNhanThuc, phut, moTa, hocLieu, trangThai: 'nhap', nguon: NHAP });
export const ACTIVITIES = [
  A('HD-PTT-01', 'Tích bằng 0 hay bằng số khác?', ['E-PTT-01', 'E-PTT-02'], ['loi'], 'nhom-dong-chat', 2, [8, 10],
    'Nhóm nhận 6 phương trình (3 có vế phải bằng 0, 3 có vế phải khác 0) cùng lời giải của "bạn Nam" có lỗi chia cho x hoặc tách khi vế phải khác 0. Nhóm khoanh lỗi, giải lại và thử nghiệm bằng cách thay số.', '6 phương trình, lời giải có lỗi'),
  A('HD-PTM-01', 'Bốn bước có soát vé', ['E-PTM-01', 'E-PTM-02', 'E-PTM-03'], ['loi'], 'nhom-dong-chat', 2, [10, 12],
    'Mỗi nhóm giải 3 phương trình chứa ẩn ở mẫu trên phiếu có 4 ô bắt buộc: ĐKXĐ – khử mẫu – giải – đối chiếu. Có một phương trình vô nghiệm cài sẵn; nhóm nào kết luận đúng được điểm thưởng.', 'Phiếu 4 ô, 3 phương trình'),
  A('HD-BDT-01', 'Dấu nào cho lời nào?', ['E-BDT-01'], ['loi'], 'ca-lop', 1, [5, 7],
    'Giáo viên đọc các câu đời sống (tốc độ tối đa, chiều cao tối thiểu, không quá 2 giờ…). Cả lớp giơ thẻ >, <, ≥, ≤ và giải thích một vài lựa chọn.', 'Bộ thẻ 4 dấu'),
  A('HD-BDT-02', 'Nhân số âm – lật chiều', ['E-BDT-02', 'E-BDT-03', 'E-BPT-02'], ['loi'], 'nhom-dong-chat', 2, [8, 10],
    'Nhóm thử với cặp số cụ thể (2 < 5): cộng, trừ, nhân với 3, nhân với −3, chia −1 và ghi kết quả vào bảng, tự rút ra quy tắc đổi chiều; sau đó giải 4 bất phương trình có hệ số âm.', 'Bảng thử số, 4 bất phương trình'),
  A('HD-BPT-01', 'Trục số sống', ['E-BPT-01', 'E-BPT-03'], ['loi'], 'ca-lop', 1, [6, 8],
    'Một dãy học sinh đứng thành trục số (−3 đến 5). Giáo viên đọc bất phương trình, các bạn là nghiệm bước lên; bạn ở điểm mút cầm thẻ ngoặc tròn hoặc vuông.', 'Thẻ số, thẻ ngoặc'),
  A('HD-C2-MR', 'Lập kế hoạch chi tiêu', [], ['san-sang'], 'nhom-dong-chat', 4, [12, 15],
    'Nhóm có ngân sách cố định cho buổi ngoại khoá, lập bất phương trình cho số vé, số suất ăn tối đa, so sánh hai phương án thuê xe và trình bày lựa chọn.', 'Bảng giá giả định')
];
