/**
 * NỘI DUNG TOÁN 9 — CHƯƠNG III. CĂN BẬC HAI VÀ CĂN BẬC BA (Kết nối tri thức với cuộc sống)
 * ===========================================================================
 * BẢN NHÁP do trợ lý AI soạn theo SGK Toán 9 tập một (Bài 7–10) — giáo viên duyệt trước khi dùng.
 *   - 12 Đơn vị kiến thức (C3-B7-M1 đến C3-LTC, order 30–41), mỗi video OLM là một đơn vị
 *   - 15 Mã lỗi · 96 câu hỏi (12 KU x 8 câu, 2.2.2.2) · gợi ý 3 tầng · vi bài học (t9-vi-bai-hoc-c3.js)
 *   - Đồ thị lỗi gốc, ngân hàng hoạt động
 * Kí hiệu trong đề: √ căn bậc hai, ∛ căn bậc ba, |x| giá trị tuyệt đối.
 */
const SEC = { 1: 45, 2: 60, 3: 90, 4: 120 };
const B7 = 'Bài 7. Căn bậc hai và căn thức bậc hai';
const B8 = 'Bài 8. Khai căn bậc hai với phép nhân và phép chia';
const B9 = 'Bài 9. Biến đổi đơn giản và rút gọn biểu thức chứa căn thức bậc hai';
const B10 = 'Bài 10. Căn bậc ba và căn thức bậc ba';
const U = (id, bai, muc, name, order, prerequisite, mucTieu, extra = {}) => ({ id, bai, muc, name, order, prerequisite, mucTieu, ...extra });

export const UNITS = [
  U('C3-B7-M1', B7, 'Mục 1', 'Căn bậc hai của số thực không âm', 30, null,
    'Hiểu căn bậc hai của số thực không âm; phân biệt căn bậc hai với căn bậc hai số học √a; số âm không có căn bậc hai; tính, ước lượng và so sánh căn bậc hai.'),
  U('C3-B7-M2', B7, 'Mục 2', 'Căn thức bậc hai', 31, 'C3-B7-M1',
    'Nhận biết căn thức bậc hai √A; tìm điều kiện xác định A ≥ 0; vận dụng √(A²) = |A|.'),
  U('C3-B8-M1', B8, 'Mục 1', 'Khai căn bậc hai với phép nhân', 32, 'C3-B7-M2',
    'Vận dụng √(A·B) = √A · √B (A, B ≥ 0); nhân các căn bậc hai; biết căn của một tổng không bằng tổng các căn.'),
  U('C3-B8-M2', B8, 'Mục 2', 'Khai căn bậc hai với phép chia', 33, 'C3-B8-M1',
    'Vận dụng √(A/B) = √A / √B (A ≥ 0, B > 0); chia các căn bậc hai.'),
  U('C3-B9-M1', B9, 'Mục 1', 'Đưa thừa số ra ngoài dấu căn', 34, 'C3-B8-M2',
    'Đưa thừa số ra ngoài dấu căn: √(A²B) = |A|√B (B ≥ 0); cộng, trừ các căn đồng dạng.'),
  U('C3-B9-M1B', B9, 'Mục 2', 'Đưa thừa số vào trong dấu căn', 35, 'C3-B9-M1',
    'Đưa thừa số vào trong dấu căn: A√B = √(A²B) khi A ≥ 0, A√B = −√(A²B) khi A < 0; so sánh các căn.'),
  U('C3-B9-M2', B9, 'Mục 3', 'Trục căn thức ở mẫu (mẫu chứa một căn thức)', 36, 'C3-B9-M1B',
    'Trục căn thức ở mẫu dạng a/√b và a/(√b ± c) bằng cách nhân với √b hoặc với biểu thức liên hợp.'),
  U('C3-B9-M2B', B9, 'Mục 3 (tiếp)', 'Trục căn thức ở mẫu (mẫu chứa hai căn thức)', 37, 'C3-B9-M2',
    'Trục căn thức ở mẫu dạng a/(√b ± √c); vận dụng (√a + √b)(√a − √b) = a − b.'),
  U('C3-B9-M3', B9, 'Mục 4', 'Rút gọn biểu thức chứa căn thức bậc hai', 38, 'C3-B9-M2B',
    'Phối hợp các phép biến đổi để rút gọn biểu thức chứa căn thức bậc hai; chú ý điều kiện xác định.'),
  U('C3-B10-M1', B10, 'Mục 1', 'Căn bậc ba của số thực', 39, 'C3-B7-M1',
    'Hiểu căn bậc ba của số thực; mỗi số thực có đúng một căn bậc ba; căn bậc ba của số âm là số âm; tính và so sánh căn bậc ba.'),
  U('C3-B10-M2', B10, 'Mục 2', 'Căn thức bậc ba', 40, 'C3-B10-M1',
    'Nhận biết căn thức bậc ba ∛A; điều kiện xác định của ∛A là điều kiện xác định của A; ∛(A³) = A.'),
  U('C3-LTC', 'Luyện tập chung và Bài tập cuối chương III', '—', 'Luyện tập chung Chương III', 41, 'C3-B10-M2',
    'Vận dụng tổng hợp căn bậc hai, căn bậc ba và các phép biến đổi căn thức để tính toán, rút gọn.', { khongCanVideo: true })
];
export const UNIT_BY_ID = new Map(UNITS.map((u) => [u.id, u]));

/* ---------------------------------------------------------------- MÃ LỖI */
const E = (code, ku, role, cluster, ten, tieuDe, phut, misconception, viDu) =>
  ({ code, ku, role, cluster, ten, tieuDe, phut, misconception, viDu, remediation: 'VBH-' + code.slice(2) });
const LOI = [
  E('E-CBH-01', 'C3-B7-M1', 'root', 'Căn bậc hai', 'Nhầm căn bậc hai với căn bậc hai số học', 'Số dương có hai căn bậc hai, √a chỉ là căn dương', 5,
    'Nhầm căn bậc hai với căn bậc hai số học: cho rằng 16 chỉ có một căn bậc hai là 4, hoặc viết √16 = ±4', '√25 = ±5; căn bậc hai của 16 chỉ là 4'),
  E('E-CBH-02', 'C3-B7-M1', 'mediating', 'Căn bậc hai', 'Khai căn bậc hai của số âm', 'Số âm không có căn bậc hai', 5,
    'Cho rằng số âm có căn bậc hai (khai căn số âm ra số âm)', '√(−9) = −3'),
  E('E-CBH-03', 'C3-B7-M2', 'mediating', 'Căn bậc hai', 'Sai điều kiện xác định của căn thức', '√A xác định khi A ≥ 0', 6,
    'Tìm điều kiện xác định của căn thức sai: lấy A > 0 thay vì A ≥ 0, quên điều kiện mẫu khác 0, hoặc cho căn thức xác định với mọi x', '√(x − 3) xác định khi x > 3'),
  E('E-CBH-04', 'C3-B7-M2', 'mediating', 'Căn bậc hai', '√(A²) = A thay vì |A|', '√(A²) = |A|', 6,
    'Viết √(A²) = A mà không lấy giá trị tuyệt đối, nên sai khi A âm', '√((−5)²) = −5; √((2 − √5)²) = 2 − √5'),
  E('E-CBH-05', 'C3-B7-M1', 'leaf', 'Căn bậc hai', 'So sánh căn bậc hai sai', 'a < b ⇔ √a < √b (a, b ≥ 0)', 5,
    'So sánh các căn bậc hai, số với căn sai chiều (nhất là với số âm), hoặc không đưa về cùng dạng để so sánh', '−√5 > −√3 vì 5 > 3; 4 < √15'),
  E('E-KC-01', 'C3-B8-M1', 'root', 'Khai căn', 'Tách căn của tổng, hiệu', 'Căn của tổng KHÁC tổng các căn', 5,
    'Tách căn bậc hai của một tổng (hiệu) thành tổng (hiệu) các căn, hoặc cộng các căn thành căn của tổng', '√(9 + 16) = 3 + 4 = 7; √2 + √3 = √5'),
  E('E-KC-02', 'C3-B8-M1', 'leaf', 'Khai căn', 'Tách tích khi các thừa số âm', '√(AB) = √A·√B chỉ khi A, B ≥ 0', 5,
    'Áp dụng √(A·B) = √A · √B cả khi A, B âm, dẫn đến căn của số âm hoặc kết luận "không tính được"', '√((−4)(−9)) = √(−4) · √(−9), không tính được'),
  E('E-KC-03', 'C3-B8-M2', 'mediating', 'Khai căn', 'Khai căn thương sai', '√(A/B) = √A / √B, B > 0', 5,
    'Khai căn một thương chỉ khai căn tử (hoặc mẫu), hoặc quên điều kiện mẫu dương', '√(9/4) = √9 / 4 = 3/4'),
  E('E-BD-01', 'C3-B9-M1', 'mediating', 'Biến đổi căn thức', 'Đưa thừa số ra ngoài sai', '√(A²B) = |A|√B', 6,
    'Đưa thừa số ra ngoài dấu căn sai: đưa ra số không phải bình phương, quên lấy căn của thừa số, quên giá trị tuyệt đối khi thừa số âm', '√18 = 9√2; √(9x²y) = 3x√y với x < 0'),
  E('E-BD-02', 'C3-B9-M1B', 'leaf', 'Biến đổi căn thức', 'Đưa thừa số vào trong sai dấu, quên bình phương', 'Đưa vào: bình phương thừa số, giữ dấu âm ở ngoài', 6,
    'Đưa thừa số vào trong dấu căn quên bình phương thừa số, hoặc đưa cả dấu "−" vào trong căn', '2√3 = √6; −2√3 = √12'),
  E('E-BD-03', 'C3-B9-M2', 'mediating', 'Biến đổi căn thức', 'Trục căn sai biểu thức liên hợp', 'Liên hợp của √a + b là √a − b', 6,
    'Trục căn thức ở mẫu nhân với chính mẫu thay vì biểu thức liên hợp, hoặc chỉ nhân mẫu mà không nhân tử', '1/(√5 − 2): nhân cả tử và mẫu với √5 − 2'),
  E('E-BD-04', 'C3-B9-M2B', 'root', 'Biến đổi căn thức', 'Sai hằng đẳng thức hiệu hai bình phương với căn', '(√a + √b)(√a − √b) = a − b', 6,
    'Tính tích (√a + √b)(√a − √b) hoặc bình phương tổng có căn sai: ra a + b, a² − b², hoặc quên hạng tử 2√ab', '(√6 + √2)(√6 − √2) = 6² − 2² = 32; (√3 + 1)² = 4'),
  E('E-BD-05', 'C3-B9-M3', 'leaf', 'Biến đổi căn thức', 'Rút gọn gộp căn không đồng dạng', 'Chỉ cộng các căn đồng dạng', 6,
    'Rút gọn biểu thức chứa căn mà cộng các căn không đồng dạng, rút gọn chưa triệt để hoặc bỏ qua điều kiện xác định', '√20 − √45 + √5 = √(−20)'),
  E('E-CBB-01', 'C3-B10-M1', 'mediating', 'Căn bậc ba', 'Áp tính chất căn bậc hai cho căn bậc ba', 'Mọi số đều có đúng một căn bậc ba', 5,
    'Nhầm căn bậc ba với căn bậc hai: cho rằng số âm không có căn bậc ba, hoặc căn bậc ba có hai giá trị ±', '∛(−8) không xác định; ∛8 = ±2'),
  E('E-CBB-02', 'C3-B10-M2', 'leaf', 'Căn bậc ba', 'Điều kiện xác định căn thức bậc ba sai', '∛A xác định khi A xác định; ∛(A³) = A', 5,
    'Đặt điều kiện A ≥ 0 cho căn thức bậc ba, hoặc viết ∛(A³) = |A|', '∛(x − 2) xác định khi x ≥ 2; ∛((−3)³) = 3')
];
export const ERRORS = LOI.map(({ code, ku, misconception, viDu, remediation }) => ({ code, ku, misconception, viDu, remediation }));
export const LOI_THEO_MA = new Map(ERRORS.map((e) => [e.code, e]));
export const REMEDIATION = Object.fromEntries(LOI.map((e) => [e.remediation, { ku: e.ku, title: e.tieuDe, minutes: e.phut }]));

/* ---------------------------------------------------------------- CÂU HỎI */
const Q = (id, level, stem, [A, B, C, D], err, hinh) =>
  ({ id, ku: id.replace(/-Q\d+$/, ''), level, sec: SEC[level], stem, opts: { A, B, C, D }, correct: 'A', err, ...(hinh ? { hinh } : {}) });

const CAU_GOC = [
  // ============================ C3-B7-M1 Căn bậc hai của số thực không âm
  Q('C3-B7-M1-Q01', 1, 'Các căn bậc hai của 16 là:', ['4 và −4', 'Chỉ có 4', 'Chỉ có −4', '8'], { B: 'E-CBH-01', C: 'E-CBH-01', D: 'E-CBH-01' }),
  Q('C3-B7-M1-Q02', 1, '√25 bằng:', ['5', '±5', '−5', '12,5'], { B: 'E-CBH-01', C: 'E-CBH-01', D: 'E-CBH-01' }),
  Q('C3-B7-M1-Q03', 2, 'Số nào KHÔNG có căn bậc hai?', ['−9', '0', '9', '0,09'], { B: 'E-CBH-02', C: 'E-CBH-02', D: 'E-CBH-02' }),
  Q('C3-B7-M1-Q04', 2, '√0,49 bằng:', ['0,7', '0,07', '7', '±0,7'], { B: 'E-CBH-01', C: 'E-CBH-01', D: 'E-CBH-01' }),
  Q('C3-B7-M1-Q05', 3, 'So sánh 4 và √15:', ['4 > √15', '4 < √15', '4 = √15', 'Không so sánh được'], { B: 'E-CBH-05', C: 'E-CBH-05', D: 'E-CBH-05' }),
  Q('C3-B7-M1-Q06', 2, 'Tìm x ≥ 0, biết √x = 3.', ['x = 9', 'x = 3', 'x = √3', 'x = ±9'], { B: 'E-CBH-01', C: 'E-CBH-01', D: 'E-CBH-01' }),
  Q('C3-B7-M1-Q07', 4, 'Sắp xếp theo thứ tự tăng dần: 3; √8; −√10; −3.', ['−√10; −3; √8; 3', '−3; −√10; √8; 3', '−√10; −3; 3; √8', '√8; 3; −3; −√10'], { B: 'E-CBH-05', C: 'E-CBH-05', D: 'E-CBH-05' }),
  Q('C3-B7-M1-Q08', 4, 'Một mảnh đất hình vuông có diện tích 50 m². Độ dài cạnh mảnh đất (làm tròn đến hàng phần mười) là:', ['7,1 m', '25 m', '12,5 m', '±7,1 m'], { B: 'E-CBH-01', C: 'E-CBH-01', D: 'E-CBH-01' }),

  // ============================ C3-B7-M2 Căn thức bậc hai
  Q('C3-B7-M2-Q01', 1, '√(x − 3) xác định khi:', ['x ≥ 3', 'x > 3', 'x ≤ 3', 'Với mọi x'], { B: 'E-CBH-03', C: 'E-CBH-03', D: 'E-CBH-03' }),
  Q('C3-B7-M2-Q02', 1, '√((−5)²) bằng:', ['5', '−5', '±5', '25'], { B: 'E-CBH-04', C: 'E-CBH-04', D: 'E-CBH-04' }),
  Q('C3-B7-M2-Q03', 2, '√(2x + 4) xác định khi:', ['x ≥ −2', 'x ≥ 2', 'x ≥ −4', 'x > −2'], { B: 'E-CBH-03', C: 'E-CBH-03', D: 'E-CBH-03' }),
  Q('C3-B7-M2-Q04', 2, 'Với a < 0, √(a²) bằng:', ['−a', 'a', '±a', 'a²'], { B: 'E-CBH-04', C: 'E-CBH-04', D: 'E-CBH-04' }),
  Q('C3-B7-M2-Q05', 3, 'Rút gọn √((2 − √5)²) được:', ['√5 − 2', '2 − √5', '2 + √5', '−2 − √5'], { B: 'E-CBH-04', C: 'E-CBH-04', D: 'E-CBH-04' }),
  Q('C3-B7-M2-Q06', 3, 'Biểu thức 1/√(x − 1) xác định khi:', ['x > 1', 'x ≥ 1', 'x ≠ 1', 'x < 1'], { B: 'E-CBH-03', C: 'E-CBH-03', D: 'E-CBH-03' }),
  Q('C3-B7-M2-Q07', 4, 'Với x < 3, √((x − 3)²) bằng:', ['3 − x', 'x − 3', '±(x − 3)', '(x − 3)²'], { B: 'E-CBH-04', C: 'E-CBH-04', D: 'E-CBH-04' }),
  Q('C3-B7-M2-Q08', 4, 'Biểu thức √(−x²) xác định khi:', ['x = 0', 'Với mọi x', 'x ≤ 0', 'Không có giá trị nào của x'], { B: 'E-CBH-03', C: 'E-CBH-03', D: 'E-CBH-03' }),

  // ============================ C3-B8-M1 Khai căn với phép nhân
  Q('C3-B8-M1-Q01', 1, '√(16 · 25) bằng:', ['20', '9', '400', '200'], { B: 'E-KC-01', C: 'E-KC-01', D: 'E-KC-01' }),
  Q('C3-B8-M1-Q02', 1, '√2 · √8 bằng:', ['4', '√10', '16', '2√2'], { B: 'E-KC-01', C: 'E-KC-01', D: 'E-KC-01' }),
  Q('C3-B8-M1-Q03', 2, '√(9 + 16) bằng:', ['5', '7', '25', '12'], { B: 'E-KC-01', C: 'E-KC-01', D: 'E-KC-01' }),
  Q('C3-B8-M1-Q04', 2, '√0,4 · √10 bằng:', ['2', '4', '√10,4', '0,4'], { B: 'E-KC-01', C: 'E-KC-01', D: 'E-KC-01' }),
  Q('C3-B8-M1-Q05', 3, '√((−4) · (−9)) bằng:', ['6', '−6', 'Không tính được', '±6'], { B: 'E-KC-02', C: 'E-KC-02', D: 'E-KC-02' }),
  Q('C3-B8-M1-Q06', 3, 'Với a ≥ 0, √(3a) · √(12a) bằng:', ['6a', '6a²', '36a', '15a'], { B: 'E-KC-01', C: 'E-KC-01', D: 'E-KC-01' }),
  Q('C3-B8-M1-Q07', 4, 'Bạn Hà viết: √(25 − 9) = √25 − √9 = 2. Nhận xét nào ĐÚNG?', ['Sai: √(25 − 9) = √16 = 4', 'Đúng', 'Sai: kết quả là 8', 'Sai: kết quả là √2'], { B: 'E-KC-01', C: 'E-KC-01', D: 'E-KC-01' }),
  Q('C3-B8-M1-Q08', 4, 'Tính √2,5 · √14,4.', ['6', '16,9', '36', '3,6'], { B: 'E-KC-01', C: 'E-KC-01', D: 'E-KC-01' }),

  // ============================ C3-B8-M2 Khai căn với phép chia
  Q('C3-B8-M2-Q01', 1, '√(49/81) bằng:', ['7/9', '49/9', '7/81', '49/81'], { B: 'E-KC-03', C: 'E-KC-03', D: 'E-KC-03' }),
  Q('C3-B8-M2-Q02', 1, '√50 : √2 bằng:', ['5', '25', '√48', '5√2'], { B: 'E-KC-03', C: 'E-KC-01', D: 'E-KC-03' }),
  Q('C3-B8-M2-Q03', 2, 'Đẳng thức √(a/b) = √a / √b đúng khi:', ['a ≥ 0 và b > 0', 'a ≥ 0 và b ≥ 0', 'Với mọi a, b', 'a > 0 và b ≥ 0'], { B: 'E-KC-03', C: 'E-KC-03', D: 'E-KC-03' }),
  Q('C3-B8-M2-Q04', 2, '√(0,25/16) bằng:', ['0,125', '0,5/16', '0,0625', '0,25/4'], { B: 'E-KC-03', C: 'E-KC-03', D: 'E-KC-03' }),
  Q('C3-B8-M2-Q05', 3, '√(25/9) · √(9/4) bằng:', ['5/2', '25/4', '5/3', '15/4'], { B: 'E-KC-03', C: 'E-KC-03', D: 'E-KC-03' }),
  Q('C3-B8-M2-Q06', 3, 'Với x > 0, √(18x³) : √(2x) bằng:', ['3x', '9x²', '3x²', '3√x'], { B: 'E-KC-03', C: 'E-KC-03', D: 'E-KC-03' }),
  Q('C3-B8-M2-Q07', 4, 'Bạn Minh viết: √(9/4) = √9 / 4 = 3/4. Nhận xét nào ĐÚNG?', ['Sai: √(9/4) = 3/2', 'Đúng', 'Sai: kết quả là 9/2', 'Sai: kết quả là 3/16'], { B: 'E-KC-03', C: 'E-KC-03', D: 'E-KC-03' }),
  Q('C3-B8-M2-Q08', 4, 'Tính √72 : √2 + √48 : √3.', ['10', '√40', '15', '2√10'], { B: 'E-KC-01', C: 'E-KC-03', D: 'E-KC-03' }),

  // ============================ C3-B9-M1 Đưa thừa số ra ngoài dấu căn
  Q('C3-B9-M1-Q01', 1, '√12 bằng:', ['2√3', '3√2', '4√3', '6√2'], { B: 'E-BD-01', C: 'E-BD-01', D: 'E-BD-01' }),
  Q('C3-B9-M1-Q02', 1, 'Với b ≥ 0, √(a²b) bằng:', ['|a|√b', 'a√b', 'a²√b', 'ab'], { B: 'E-BD-01', C: 'E-BD-01', D: 'E-BD-01' }),
  Q('C3-B9-M1-Q03', 2, '√50 bằng:', ['5√2', '25√2', '2√5', '10√5'], { B: 'E-BD-01', C: 'E-BD-01', D: 'E-BD-01' }),
  Q('C3-B9-M1-Q04', 2, 'Với x < 0 và y ≥ 0, √(9x²y) bằng:', ['−3x√y', '3x√y', '9x√y', '−9x√y'], { B: 'E-BD-01', C: 'E-BD-01', D: 'E-BD-01' }),
  Q('C3-B9-M1-Q05', 3, '√18 + √8 bằng:', ['5√2', '√26', '6√2', '13√2'], { B: 'E-KC-01', C: 'E-BD-01', D: 'E-BD-01' }),
  Q('C3-B9-M1-Q06', 3, '√75 − √27 bằng:', ['2√3', '√48', '8√3', '4√3'], { B: 'E-KC-01', C: 'E-BD-01', D: 'E-BD-01' }),
  Q('C3-B9-M1-Q07', 4, 'Với x ≥ 0, √(x³) bằng:', ['x√x', 'x²√x', '3√x', 'x√(x²)'], { B: 'E-BD-01', C: 'E-BD-01', D: 'E-BD-01' }),
  Q('C3-B9-M1-Q08', 4, 'Một hình vuông có diện tích 72 cm². Độ dài cạnh viết dưới dạng a√b (b nguyên dương nhỏ nhất) là:', ['6√2 cm', '3√8 cm', '2√18 cm', '36√2 cm'], { B: 'E-BD-01', C: 'E-BD-01', D: 'E-BD-01' }),

  // ============================ C3-B9-M1B Đưa thừa số vào trong dấu căn
  Q('C3-B9-M1B-Q01', 1, '2√3 bằng:', ['√12', '√6', '√18', '√5'], { B: 'E-BD-02', C: 'E-BD-02', D: 'E-KC-01' }),
  Q('C3-B9-M1B-Q02', 1, '−3√2 bằng:', ['−√18', '√18', '−√6', '√(−18)'], { B: 'E-BD-02', C: 'E-BD-02', D: 'E-BD-02' }),
  Q('C3-B9-M1B-Q03', 2, 'So sánh 3√5 và 5√3:', ['3√5 < 5√3', '3√5 > 5√3', '3√5 = 5√3', 'Không so sánh được'], { B: 'E-BD-02', C: 'E-BD-02', D: 'E-BD-02' }),
  Q('C3-B9-M1B-Q04', 2, 'Với a ≥ 0, a√7 bằng:', ['√(7a²)', '√(7a)', '√(49a)', '7√a'], { B: 'E-BD-02', C: 'E-BD-02', D: 'E-BD-02' }),
  Q('C3-B9-M1B-Q05', 3, 'Với a < 0, a√5 bằng:', ['−√(5a²)', '√(5a²)', '√(5a)', '−√(5a)'], { B: 'E-BD-02', C: 'E-BD-02', D: 'E-BD-02' }),
  Q('C3-B9-M1B-Q06', 3, 'Sắp xếp theo thứ tự tăng dần: 2√6; 3√2; 2√5.', ['3√2; 2√5; 2√6', '2√6; 2√5; 3√2', '2√5; 3√2; 2√6', '3√2; 2√6; 2√5'], { B: 'E-BD-02', C: 'E-BD-02', D: 'E-BD-02' }),
  Q('C3-B9-M1B-Q07', 4, 'Bạn Lan viết: −2√3 = √12. Nhận xét nào ĐÚNG?', ['Sai: −2√3 = −√12 vì −2√3 là số âm', 'Đúng', 'Sai: −2√3 = √(−12)', 'Sai: −2√3 = −√6'], { B: 'E-BD-02', C: 'E-BD-02', D: 'E-BD-02' }),
  Q('C3-B9-M1B-Q08', 4, 'Với x > 0, x · √(2/x) bằng:', ['√(2x)', '√(2x³)', '√2', '2x'], { B: 'E-BD-02', C: 'E-BD-02', D: 'E-BD-02' }),

  // ============================ C3-B9-M2 Trục căn thức ở mẫu (một căn)
  Q('C3-B9-M2-Q01', 1, 'Trục căn thức ở mẫu của 1/√2 được:', ['√2/2', '√2', '2/√2', '1/2'], { B: 'E-BD-03', C: 'E-BD-03', D: 'E-BD-03' }),
  Q('C3-B9-M2-Q02', 1, '3/√3 bằng:', ['√3', '3√3', '1', '3'], { B: 'E-BD-03', C: 'E-BD-03', D: 'E-BD-03' }),
  Q('C3-B9-M2-Q03', 2, 'Biểu thức liên hợp của √5 + 2 là:', ['√5 − 2', '√5 + 2', '−√5 − 2', '5 − 2'], { B: 'E-BD-03', C: 'E-BD-03', D: 'E-BD-03' }),
  Q('C3-B9-M2-Q04', 2, 'Trục căn thức ở mẫu của 2/(√3 + 1) được:', ['√3 − 1', '√3 + 1', '(√3 − 1)/2', '2(√3 − 1)'], { B: 'E-BD-03', C: 'E-BD-04', D: 'E-BD-04' }),
  Q('C3-B9-M2-Q05', 3, '1/(2 − √3) bằng:', ['2 + √3', '2 − √3', '(2 + √3)/7', '−2 − √3'], { B: 'E-BD-03', C: 'E-BD-04', D: 'E-BD-04' }),
  Q('C3-B9-M2-Q06', 3, 'Với a ≥ 0, a ≠ 1, biểu thức (a − 1)/(√a − 1) bằng:', ['√a + 1', '√a − 1', 'a + 1', '(a − 1)(√a + 1)'], { B: 'E-BD-03', C: 'E-BD-03', D: 'E-BD-04' }),
  Q('C3-B9-M2-Q07', 4, 'Bạn Bình trục căn thức ở mẫu của 1/(√5 − 2) bằng cách nhân cả tử và mẫu với √5 − 2. Nhận xét nào ĐÚNG?', ['Sai: phải nhân với biểu thức liên hợp √5 + 2, kết quả là √5 + 2', 'Đúng', 'Sai: phải nhân với √5', 'Sai: kết quả đúng là √5 − 2'], { B: 'E-BD-03', C: 'E-BD-03', D: 'E-BD-03' }),
  Q('C3-B9-M2-Q08', 4, 'Tính 1/(√2 + 1) + 1/(√2 − 1).', ['2√2', '2', '0', '√2'], { B: 'E-BD-04', C: 'E-BD-03', D: 'E-BD-03' }),

  // ============================ C3-B9-M2B Trục căn thức ở mẫu (hai căn)
  Q('C3-B9-M2B-Q01', 1, 'Với a, b ≥ 0, (√a + √b)(√a − √b) bằng:', ['a − b', 'a + b', 'a² − b²', '√a − √b'], { B: 'E-BD-04', C: 'E-BD-04', D: 'E-BD-04' }),
  Q('C3-B9-M2B-Q02', 1, 'Biểu thức liên hợp của √3 − √2 là:', ['√3 + √2', '√3 − √2', '√2 − √3', '3 − 2'], { B: 'E-BD-03', C: 'E-BD-03', D: 'E-BD-03' }),
  Q('C3-B9-M2B-Q03', 2, '1/(√3 − √2) bằng:', ['√3 + √2', '√3 − √2', '(√3 + √2)/5', '−(√3 + √2)'], { B: 'E-BD-03', C: 'E-BD-04', D: 'E-BD-04' }),
  Q('C3-B9-M2B-Q04', 2, '(√7 − √5)(√7 + √5) bằng:', ['2', '12', '24', '√2'], { B: 'E-BD-04', C: 'E-BD-04', D: 'E-BD-04' }),
  Q('C3-B9-M2B-Q05', 3, '4/(√7 + √3) bằng:', ['√7 − √3', '√7 + √3', '2(√7 − √3)/5', '(√7 − √3)/4'], { B: 'E-BD-03', C: 'E-BD-04', D: 'E-BD-04' }),
  Q('C3-B9-M2B-Q06', 3, '(√5 + √2)/(√5 − √2) bằng:', ['(7 + 2√10)/3', '(7 + 2√10)/7', '1', '(3 + 2√10)/3'], { B: 'E-BD-04', C: 'E-BD-03', D: 'E-BD-04' }),
  Q('C3-B9-M2B-Q07', 4, 'Bạn Hùng viết: (√6 + √2)(√6 − √2) = 6² − 2² = 32. Nhận xét nào ĐÚNG?', ['Sai: kết quả là 6 − 2 = 4', 'Đúng', 'Sai: kết quả là 8', 'Sai: kết quả là √4 = 2'], { B: 'E-BD-04', C: 'E-BD-04', D: 'E-BD-04' }),
  Q('C3-B9-M2B-Q08', 4, 'Tính 1/(√3 + √2) − 1/(√3 − √2).', ['−2√2', '2√3', '0', '2√2'], { B: 'E-BD-04', C: 'E-BD-03', D: 'E-BD-04' }),

  // ============================ C3-B9-M3 Rút gọn biểu thức chứa căn
  Q('C3-B9-M3-Q01', 1, 'Khẳng định nào ĐÚNG về tổng √2 + √3?', ['Không viết gọn thành một căn được, để nguyên √2 + √3', '√2 + √3 = √5', '√2 + √3 = √6', '√2 + √3 = 5'], { B: 'E-KC-01', C: 'E-BD-05', D: 'E-BD-05' }),
  Q('C3-B9-M3-Q02', 1, '3√2 + 5√2 bằng:', ['8√2', '8√4', '15√2', '8'], { B: 'E-BD-05', C: 'E-BD-05', D: 'E-BD-05' }),
  Q('C3-B9-M3-Q03', 2, '√20 − √45 + √5 bằng:', ['0', '−√20', '2√5', '−20'], { B: 'E-KC-01', C: 'E-BD-01', D: 'E-BD-05' }),
  Q('C3-B9-M3-Q04', 2, '(√3 + 1)² bằng:', ['4 + 2√3', '4', '2 + 2√3', '4 + √3'], { B: 'E-BD-04', C: 'E-BD-04', D: 'E-BD-04' }),
  Q('C3-B9-M3-Q05', 3, 'Rút gọn (√12 + √27 − √3) : √3 được:', ['4', '4√3', '12', '2'], { B: 'E-BD-05', C: 'E-BD-05', D: 'E-BD-05' }),
  Q('C3-B9-M3-Q06', 3, 'Với x ≥ 0, x ≠ 4, rút gọn (x − 4)/(√x − 2) − √x được:', ['2', '2√x + 2', '√x + 2', '−2'], { B: 'E-BD-05', C: 'E-BD-05', D: 'E-BD-05' }),
  Q('C3-B9-M3-Q07', 4, 'Với x > 0, x ≠ 1, rút gọn A = [1/(√x − 1) − 1/(√x + 1)] · (x − 1)/2 được:', ['A = 1', 'A = √x', 'A = 2/(x − 1)', 'A = x − 1'], { B: 'E-BD-05', C: 'E-BD-05', D: 'E-BD-05' }),
  Q('C3-B9-M3-Q08', 4, 'Bạn An rút gọn √(4 − 2√3) = √4 − √(2√3). Kết quả đúng là:', ['√3 − 1', '2 − √(2√3)', '1 − √3', '√3 + 1'], { B: 'E-KC-01', C: 'E-CBH-04', D: 'E-BD-04' }),

  // ============================ C3-B10-M1 Căn bậc ba của số thực
  Q('C3-B10-M1-Q01', 1, '∛27 bằng:', ['3', '±3', '9', '−3'], { B: 'E-CBB-01', C: 'E-CBB-01', D: 'E-CBB-01' }),
  Q('C3-B10-M1-Q02', 1, '∛(−8) bằng:', ['−2', 'Không xác định', '2', '±2'], { B: 'E-CBB-01', C: 'E-CBB-01', D: 'E-CBB-01' }),
  Q('C3-B10-M1-Q03', 2, 'Mỗi số thực a có bao nhiêu căn bậc ba?', ['Đúng một', 'Hai', 'Không có nếu a < 0', 'Hai nếu a > 0'], { B: 'E-CBB-01', C: 'E-CBB-01', D: 'E-CBB-01' }),
  Q('C3-B10-M1-Q04', 2, '∛0,001 bằng:', ['0,1', '0,01', '0,03', '0,001'], { B: 'E-CBB-01', C: 'E-CBB-01', D: 'E-CBB-01' }),
  Q('C3-B10-M1-Q05', 3, 'So sánh 3 và ∛26:', ['3 > ∛26', '3 < ∛26', '3 = ∛26', 'Không so sánh được'], { B: 'E-CBB-01', C: 'E-CBB-01', D: 'E-CBB-01' }),
  Q('C3-B10-M1-Q06', 3, '∛(−64) + ∛125 bằng:', ['1', '9', '−9', 'Không xác định'], { B: 'E-CBB-01', C: 'E-CBB-01', D: 'E-CBB-01' }),
  Q('C3-B10-M1-Q07', 4, 'Một khối gỗ hình lập phương có thể tích 343 cm³. Độ dài cạnh khối gỗ là:', ['7 cm', '114,3 cm', '18,5 cm', '49 cm'], { B: 'E-CBB-01', C: 'E-CBB-01', D: 'E-CBB-01' }),
  Q('C3-B10-M1-Q08', 2, 'Tìm x, biết ∛x = −5.', ['x = −125', 'x = 125', 'x = −15', 'x = 25'], { B: 'E-CBB-01', C: 'E-CBB-01', D: 'E-CBB-01' }),

  // ============================ C3-B10-M2 Căn thức bậc ba
  Q('C3-B10-M2-Q01', 1, '∛(x − 2) xác định khi:', ['Với mọi x', 'x ≥ 2', 'x > 2', 'x ≠ 2'], { B: 'E-CBB-02', C: 'E-CBB-02', D: 'E-CBB-02' }),
  Q('C3-B10-M2-Q02', 1, 'Với mọi số thực a, ∛(a³) bằng:', ['a', '|a|', 'a²', '3a'], { B: 'E-CBB-02', C: 'E-CBB-02', D: 'E-CBB-02' }),
  Q('C3-B10-M2-Q03', 2, '∛((−3)³) bằng:', ['−3', '3', '27', '−27'], { B: 'E-CBB-02', C: 'E-CBB-02', D: 'E-CBB-02' }),
  Q('C3-B10-M2-Q04', 2, '∛(1/(x − 1)) xác định khi:', ['x ≠ 1', 'x > 1', 'x ≥ 1', 'Với mọi x'], { B: 'E-CBB-02', C: 'E-CBB-02', D: 'E-CBB-02' }),
  Q('C3-B10-M2-Q05', 3, 'Với mọi x, ∛(8x³) bằng:', ['2x', '2|x|', '8x', '2x³'], { B: 'E-CBB-02', C: 'E-CBB-02', D: 'E-CBB-02' }),
  Q('C3-B10-M2-Q06', 3, 'Với x = −2, giá trị của ∛(x³) − √(x²) là:', ['−4', '0', '4', '−8'], { B: 'E-CBH-04', C: 'E-CBB-02', D: 'E-CBB-02' }),
  Q('C3-B10-M2-Q07', 4, 'Bạn Nam nói: "∛(−x) xác định khi x ≤ 0". Nhận xét nào ĐÚNG?', ['Sai: ∛(−x) xác định với mọi x', 'Đúng', 'Sai: xác định khi x ≥ 0', 'Sai: xác định khi x ≠ 0'], { B: 'E-CBB-02', C: 'E-CBB-02', D: 'E-CBB-02' }),
  Q('C3-B10-M2-Q08', 4, 'Tìm x, biết ∛(2x − 1) = 3.', ['x = 14', 'x = 5', 'x = 13', 'x = 2'], { B: 'E-CBB-01', C: 'E-CBB-02', D: 'E-CBB-01' }),

  // ============================ C3-LTC
  Q('C3-LTC-Q01', 1, 'Căn bậc hai số học của 64 là:', ['8', '±8', '−8', '32'], { B: 'E-CBH-01', C: 'E-CBH-01', D: 'E-CBH-01' }),
  Q('C3-LTC-Q02', 1, '√(x + 5) xác định khi:', ['x ≥ −5', 'x ≥ 5', 'x > −5', 'Với mọi x'], { B: 'E-CBH-03', C: 'E-CBH-03', D: 'E-CBH-03' }),
  Q('C3-LTC-Q03', 2, '√(36 + 64) bằng:', ['10', '14', '100', '48'], { B: 'E-KC-01', C: 'E-KC-01', D: 'E-KC-01' }),
  Q('C3-LTC-Q04', 2, '√45 · √5 bằng:', ['15', '√50', '225', '3√5'], { B: 'E-KC-01', C: 'E-KC-01', D: 'E-BD-01' }),
  Q('C3-LTC-Q05', 3, '6/√6 + √24 bằng:', ['3√6', '1 + √24', '2√6', '√30'], { B: 'E-BD-03', C: 'E-BD-01', D: 'E-BD-05' }),
  Q('C3-LTC-Q06', 3, '√((1 − √2)²) + √2 bằng:', ['2√2 − 1', '1', '−1', '2√2 + 1'], { B: 'E-CBH-04', C: 'E-CBH-04', D: 'E-CBH-04' }),
  Q('C3-LTC-Q07', 4, 'Với x ≥ 0, x ≠ 9, biểu thức (√x + 3)/(x − 9) bằng:', ['1/(√x − 3)', '1/(√x + 3)', '√x + 3', '1/(x − 3)'], { B: 'E-BD-04', C: 'E-BD-04', D: 'E-BD-04' }),
  Q('C3-LTC-Q08', 4, '∛(−27) + √16 − ∛8 bằng:', ['−1', '5', '1', 'Không xác định'], { B: 'E-CBB-01', C: 'E-CBB-01', D: 'E-CBB-01' })
];

// ---------------------------------------------------------------------------
// BỔ SUNG 23/11/2026: mỗi mục 8 → 16 câu, phân bố 4 🌱 · 5 🌿 · 4 🌳 · 3 ⭐. Đáp án đã tính lại bằng máy. BẢN NHÁP chờ duyệt.
const e3 = (c) => ({ B: c, C: c, D: c });
const CAU_MOI = [
  // ---------- C3-B7-M1
  Q('C3-B7-M1-Q09', 1, 'Căn bậc hai số học của 81 là:', ['9', '±9', '−9', '40,5'], e3('E-CBH-01')),
  Q('C3-B7-M1-Q10', 1, 'Các căn bậc hai của 0,36 là:', ['0,6 và −0,6', 'Chỉ có 0,6', '0,06 và −0,06', '0,18'], e3('E-CBH-01')),
  Q('C3-B7-M1-Q11', 2, '√144 bằng:', ['12', '±12', '72', '−12'], e3('E-CBH-01')),
  Q('C3-B7-M1-Q12', 2, 'Số nào có căn bậc hai?', ['0,25', '−0,25', '−1', '−100'], e3('E-CBH-02')),
  Q('C3-B7-M1-Q13', 3, 'So sánh 7 và √50:', ['7 < √50', '7 > √50', '7 = √50', 'Không so sánh được'], e3('E-CBH-05')),
  Q('C3-B7-M1-Q14', 3, 'So sánh −√7 và −2,5:', ['−√7 < −2,5', '−√7 > −2,5', '−√7 = −2,5', 'Không so sánh được'], e3('E-CBH-05')),
  Q('C3-B7-M1-Q15', 3, 'Tìm x, biết x² = 13.', ['x = √13 hoặc x = −√13', 'x = √13', 'x = 6,5', 'x = 169'], e3('E-CBH-01')),
  Q('C3-B7-M1-Q16', 4, 'Một tấm kính hình vuông có diện tích 2,25 m². Độ dài cạnh tấm kính là:', ['1,5 m', '1,125 m', '0,15 m', '±1,5 m'], e3('E-CBH-01')),
  // ---------- C3-B7-M2
  Q('C3-B7-M2-Q09', 1, '√(2x) xác định khi:', ['x ≥ 0', 'x > 0', 'x ≤ 0', 'Với mọi x'], e3('E-CBH-03')),
  Q('C3-B7-M2-Q10', 1, '√(7²) bằng:', ['7', '−7', '±7', '49'], e3('E-CBH-04')),
  Q('C3-B7-M2-Q11', 2, '√(5 − x) xác định khi:', ['x ≤ 5', 'x ≥ 5', 'x < 5', 'x ≥ −5'], e3('E-CBH-03')),
  Q('C3-B7-M2-Q12', 2, 'Với a ≥ 0, √(9a²) bằng:', ['3a', '−3a', '9a', '3a²'], e3('E-CBH-04')),
  Q('C3-B7-M2-Q13', 2, '√((−0,4)²) bằng:', ['0,4', '−0,4', '±0,4', '0,16'], e3('E-CBH-04')),
  Q('C3-B7-M2-Q14', 3, 'Biểu thức √(x² + 1) xác định khi:', ['Với mọi x', 'x ≥ −1', 'x ≥ 1', 'x ≥ 0'], e3('E-CBH-03')),
  Q('C3-B7-M2-Q15', 3, 'Rút gọn √((3 − √10)²) được:', ['√10 − 3', '3 − √10', '3 + √10', '−3 − √10'], e3('E-CBH-04')),
  Q('C3-B7-M2-Q16', 4, 'Với x ≥ 2, rút gọn √(x² − 4x + 4) được:', ['x − 2', '2 − x', '±(x − 2)', '(x − 2)²'], e3('E-CBH-04')),
  // ---------- C3-B8-M1
  Q('C3-B8-M1-Q09', 1, '√(4 · 49) bằng:', ['14', '53', '196', '28'], e3('E-KC-01')),
  Q('C3-B8-M1-Q10', 1, '√3 · √12 bằng:', ['6', '√15', '36', '3√2'], e3('E-KC-01')),
  Q('C3-B8-M1-Q11', 2, '√(16 · 0,09) bằng:', ['1,2', '0,12', '12', '1,44'], e3('E-KC-01')),
  Q('C3-B8-M1-Q12', 2, '√(169 − 25) bằng:', ['12', '8', '144', '18'], e3('E-KC-01')),
  Q('C3-B8-M1-Q13', 2, '√12,1 · √10 bằng:', ['11', '121', '1,1', '110'], e3('E-KC-01')),
  Q('C3-B8-M1-Q14', 3, 'Với a ≥ 0, √(5a) · √(45a³) bằng:', ['15a²', '15a', '225a⁴', '50a²'], e3('E-KC-01')),
  Q('C3-B8-M1-Q15', 3, 'Bạn Tú viết: √((−4) · (−25)) = √(−4) · √(−25). Nhận xét nào ĐÚNG?', ['Sai: √((−4) · (−25)) = √100 = 10', 'Đúng', 'Sai: kết quả là −10', 'Sai: biểu thức không xác định'], e3('E-KC-02')),
  Q('C3-B8-M1-Q16', 4, 'Tính √(4,9 · 360).', ['42', '4,2', '420', '1 764'], e3('E-KC-01')),
  // ---------- C3-B8-M2
  Q('C3-B8-M2-Q09', 1, '√(16/25) bằng:', ['4/5', '16/5', '4/25', '16/25'], e3('E-KC-03')),
  Q('C3-B8-M2-Q10', 1, '√72 : √8 bằng:', ['3', '9', '8', '√64'], e3('E-KC-03')),
  Q('C3-B8-M2-Q11', 2, '√(0,09/0,25) bằng:', ['0,6', '0,36', '1,2', '0,06'], e3('E-KC-03')),
  Q('C3-B8-M2-Q12', 2, '√18 : √50 bằng:', ['3/5', '9/25', '5/3', '1/5'], e3('E-KC-03')),
  Q('C3-B8-M2-Q13', 2, 'Với x > 0, √(x³) : √x bằng:', ['x', 'x²', '√x', 'x³'], e3('E-KC-03')),
  Q('C3-B8-M2-Q14', 3, '√(49/64) − √(9/16) bằng:', ['1/8', '1/2', '7/12', '5/4'], { B: 'E-KC-01', C: 'E-KC-03', D: 'E-KC-03' }),
  Q('C3-B8-M2-Q15', 3, 'Với a > 0, √(50a⁵) : √(2a) bằng:', ['5a²', '25a⁴', '5a', '5a³'], e3('E-KC-03')),
  Q('C3-B8-M2-Q16', 4, 'Tính (√12 + √27) : √3.', ['5', '√13', '13', '39'], { B: 'E-KC-01', C: 'E-KC-03', D: 'E-KC-03' }),
  // ---------- C3-B9-M1
  Q('C3-B9-M1-Q09', 1, '√20 bằng:', ['2√5', '5√2', '4√5', '10√2'], e3('E-BD-01')),
  Q('C3-B9-M1-Q10', 1, '√27 bằng:', ['3√3', '9√3', '2√7', '3√2'], e3('E-BD-01')),
  Q('C3-B9-M1-Q11', 2, '√48 bằng:', ['4√3', '16√3', '2√6', '3√4'], e3('E-BD-01')),
  Q('C3-B9-M1-Q12', 2, 'Với a ≥ 0, √(25a) bằng:', ['5√a', '25√a', '5a', '5a²'], e3('E-BD-01')),
  Q('C3-B9-M1-Q13', 2, 'Với x < 0 và y ≥ 0, √(4x²y) bằng:', ['−2x√y', '2x√y', '4x√y', '−4x√y'], e3('E-BD-01')),
  Q('C3-B9-M1-Q14', 3, '√12 + √75 − √27 bằng:', ['4√3', '√60', '10√3', '2√3'], e3('E-BD-01')),
  Q('C3-B9-M1-Q15', 3, '2√8 − √32 + √50 bằng:', ['5√2', '√26', '13√2', '3√2'], e3('E-BD-01')),
  Q('C3-B9-M1-Q16', 4, 'Một hình chữ nhật có chiều dài √45 cm và chiều rộng √20 cm. Chu vi hình chữ nhật là:', ['10√5 cm', '5√5 cm', '2√65 cm', '30 cm'], e3('E-BD-01')),
  // ---------- C3-B9-M1B
  Q('C3-B9-M1B-Q09', 1, '3√5 bằng:', ['√45', '√15', '√75', '√8'], e3('E-BD-02')),
  Q('C3-B9-M1B-Q10', 1, '5√2 bằng:', ['√50', '√10', '√20', '√7'], e3('E-BD-02')),
  Q('C3-B9-M1B-Q11', 2, '−2√7 bằng:', ['−√28', '√28', '−√14', '√(−28)'], e3('E-BD-02')),
  Q('C3-B9-M1B-Q12', 2, 'Với a ≥ 0, 3√a bằng:', ['√(9a)', '√(3a)', '√(6a)', '9√a'], e3('E-BD-02')),
  Q('C3-B9-M1B-Q13', 2, 'So sánh 4√2 và 2√7:', ['4√2 > 2√7', '4√2 < 2√7', '4√2 = 2√7', 'Không so sánh được'], e3('E-BD-02')),
  Q('C3-B9-M1B-Q14', 3, 'Với a < 0, a√3 bằng:', ['−√(3a²)', '√(3a²)', '√(3a)', '−√(3a)'], e3('E-BD-02')),
  Q('C3-B9-M1B-Q15', 3, 'Sắp xếp theo thứ tự giảm dần: 3√3; 2√6; 4√2.', ['4√2; 3√3; 2√6', '3√3; 2√6; 4√2', '2√6; 3√3; 4√2', '4√2; 2√6; 3√3'], e3('E-BD-02')),
  Q('C3-B9-M1B-Q16', 4, 'Với x > 0, 2x · √(1/(2x)) bằng:', ['√(2x)', '√(4x)', '√x', '2√x'], e3('E-BD-02')),
  // ---------- C3-B9-M2
  Q('C3-B9-M2-Q09', 1, 'Trục căn thức ở mẫu của 1/√5 được:', ['√5/5', '√5', '5/√5', '1/5'], e3('E-BD-03')),
  Q('C3-B9-M2-Q10', 1, '6/√6 bằng:', ['√6', '6√6', '1', '36'], e3('E-BD-03')),
  Q('C3-B9-M2-Q11', 2, '2/√8 bằng:', ['√2/2', '√2', '4√2', '1/4'], e3('E-BD-03')),
  Q('C3-B9-M2-Q12', 2, 'Biểu thức liên hợp của 3 − √2 là:', ['3 + √2', '3 − √2', '−3 − √2', '√2 − 3'], e3('E-BD-03')),
  Q('C3-B9-M2-Q13', 2, '1/(√3 − 1) bằng:', ['(√3 + 1)/2', '√3 + 1', '(√3 − 1)/2', '(√3 + 1)/4'], e3('E-BD-03')),
  Q('C3-B9-M2-Q14', 3, '4/(3 + √5) bằng:', ['3 − √5', '3 + √5', '(3 − √5)/4', '4(3 − √5)'], e3('E-BD-03')),
  Q('C3-B9-M2-Q15', 3, 'Với a > 0, a/√a bằng:', ['√a', 'a√a', '1', 'a'], e3('E-BD-03')),
  Q('C3-B9-M2-Q16', 4, 'Tính 2/(√3 − 1) − 2/(√3 + 1).', ['2', '2√3', '0', '4'], e3('E-BD-03')),
  // ---------- C3-B9-M2B
  Q('C3-B9-M2B-Q09', 1, '(√5 + √3)(√5 − √3) bằng:', ['2', '8', '16', '√2'], e3('E-BD-04')),
  Q('C3-B9-M2B-Q10', 1, 'Biểu thức liên hợp của √7 + √5 là:', ['√7 − √5', '√7 + √5', '−√7 − √5', '7 − 5'], e3('E-BD-04')),
  Q('C3-B9-M2B-Q11', 2, '1/(√5 + √3) bằng:', ['(√5 − √3)/2', '√5 − √3', '(√5 + √3)/2', '(√5 − √3)/8'], e3('E-BD-04')),
  Q('C3-B9-M2B-Q12', 2, '(√11 − √7)(√11 + √7) bằng:', ['4', '18', '72', '2'], e3('E-BD-04')),
  Q('C3-B9-M2B-Q13', 2, '(√3 + √2)² bằng:', ['5 + 2√6', '5', '5 + √6', '1 + 2√6'], e3('E-BD-04')),
  Q('C3-B9-M2B-Q14', 3, '2/(√5 − √3) bằng:', ['√5 + √3', '√5 − √3', '(√5 + √3)/2', '2(√5 + √3)'], e3('E-BD-04')),
  Q('C3-B9-M2B-Q15', 3, '(√7 − √3)/(√7 + √3) bằng:', ['(5 − √21)/2', '(10 − 2√21)/10', '1', '(5 + √21)/2'], e3('E-BD-04')),
  Q('C3-B9-M2B-Q16', 4, 'Tính 1/(√5 + √3) + 1/(√5 − √3).', ['√5', '2√5', '√3', '0'], e3('E-BD-04')),
  // ---------- C3-B9-M3
  Q('C3-B9-M3-Q09', 1, '2√3 + 4√3 − √3 bằng:', ['5√3', '6√3', '5√9', '5'], e3('E-BD-05')),
  Q('C3-B9-M3-Q10', 1, '√5 + √5 bằng:', ['2√5', '√10', '5', '10'], e3('E-BD-05')),
  Q('C3-B9-M3-Q11', 2, '√27 − √12 + √3 bằng:', ['2√3', '√18', '0', '4√3'], e3('E-BD-05')),
  Q('C3-B9-M3-Q12', 2, '(√5 − 1)² bằng:', ['6 − 2√5', '4', '6 − √5', '4 − 2√5'], e3('E-BD-05')),
  Q('C3-B9-M3-Q13', 2, '(2 + √3)(2 − √3) bằng:', ['1', '7', '4 − √3', '2'], e3('E-BD-05')),
  Q('C3-B9-M3-Q14', 3, 'Rút gọn (√50 − √18 + √8) : √2 được:', ['4', '4√2', '8', '2'], e3('E-BD-05')),
  Q('C3-B9-M3-Q15', 3, 'Với a > 0, (a + √a)/√a bằng:', ['√a + 1', '√a', 'a + 1', '2√a'], e3('E-BD-05')),
  Q('C3-B9-M3-Q16', 4, 'Với x > 0, x ≠ 1, rút gọn A = (x − 1)/(√x − 1) − (x − √x)/√x được:', ['A = 2', 'A = 2√x', 'A = 0', 'A = √x + 1'], e3('E-BD-05')),
  // ---------- C3-B10-M1
  Q('C3-B10-M1-Q09', 1, '∛125 bằng:', ['5', '±5', '25', '−5'], e3('E-CBB-01')),
  Q('C3-B10-M1-Q10', 1, '∛(−1) bằng:', ['−1', 'Không xác định', '1', '±1'], e3('E-CBB-01')),
  Q('C3-B10-M1-Q11', 2, '∛(−0,008) bằng:', ['−0,2', '0,2', 'Không xác định', '−0,02'], e3('E-CBB-01')),
  Q('C3-B10-M1-Q12', 2, '∛(8/27) bằng:', ['2/3', '8/9', '4/9', '2/9'], e3('E-CBB-01')),
  Q('C3-B10-M1-Q13', 3, 'So sánh ∛(−9) và −2:', ['∛(−9) < −2', '∛(−9) > −2', '∛(−9) = −2', 'Không so sánh được'], e3('E-CBB-01')),
  Q('C3-B10-M1-Q14', 3, '∛216 − ∛(−27) bằng:', ['9', '3', '−9', 'Không xác định'], e3('E-CBB-01')),
  Q('C3-B10-M1-Q15', 4, 'Một thùng hình lập phương chứa đầy được 1 000 dm³ nước. Độ dài cạnh của thùng là:', ['10 dm', '100 dm', '31,6 dm', '333,3 dm'], e3('E-CBB-01')),
  Q('C3-B10-M1-Q16', 4, 'Tìm x, biết ∛(x + 1) = −2.', ['x = −9', 'x = −7', 'x = 9', 'x = −3'], e3('E-CBB-01')),
  // ---------- C3-B10-M2
  Q('C3-B10-M2-Q09', 1, '∛(x + 7) xác định khi:', ['Với mọi x', 'x ≥ −7', 'x > −7', 'x ≠ −7'], e3('E-CBB-02')),
  Q('C3-B10-M2-Q10', 1, '∛((−5)³) bằng:', ['−5', '5', '125', '−125'], e3('E-CBB-02')),
  Q('C3-B10-M2-Q11', 2, 'Với mọi số thực a, ∛(−27a³) bằng:', ['−3a', '3a', '−3|a|', '3|a|'], e3('E-CBB-02')),
  Q('C3-B10-M2-Q12', 2, '∛(2/(x + 3)) xác định khi:', ['x ≠ −3', 'x > −3', 'x ≥ −3', 'Với mọi x'], e3('E-CBB-02')),
  Q('C3-B10-M2-Q13', 2, 'Với mọi số thực a, ∛(64a⁶) bằng:', ['4a²', '8a³', '4a³', '64a²'], e3('E-CBB-02')),
  Q('C3-B10-M2-Q14', 3, '∛54 · ∛4 bằng:', ['6', '∛58', '216', '12'], e3('E-CBB-02')),
  Q('C3-B10-M2-Q15', 3, 'Với x = −3, giá trị của ∛(x³) + √(x²) là:', ['0', '−6', '6', '−9'], e3('E-CBB-02')),
  Q('C3-B10-M2-Q16', 4, 'Tìm x, biết ∛(3x − 2) = −2.', ['x = −2', 'x = 2', 'x = −10/3', 'x = 0'], e3('E-CBB-02')),
  // ---------- C3-LTC
  Q('C3-LTC-Q09', 1, '√0,64 bằng:', ['0,8', '0,08', '8', '±0,8'], e3('E-CBH-01')),
  Q('C3-LTC-Q10', 1, '∛(−125) bằng:', ['−5', '5', 'Không xác định', '±5'], e3('E-CBB-01')),
  Q('C3-LTC-Q11', 2, '√(x − 7) xác định khi:', ['x ≥ 7', 'x > 7', 'x ≤ 7', 'x ≥ −7'], e3('E-CBH-03')),
  Q('C3-LTC-Q12', 2, '√32 − √8 bằng:', ['2√2', '√24', '4', '3√2'], { B: 'E-KC-01', C: 'E-BD-05', D: 'E-BD-01' }),
  Q('C3-LTC-Q13', 2, '10/√5 bằng:', ['2√5', '10√5', '√5/2', '5√2'], e3('E-BD-03')),
  Q('C3-LTC-Q14', 3, '√((√3 − 2)²) + √3 bằng:', ['2', '2√3 − 2', '−2', '2 + 2√3'], e3('E-CBH-04')),
  Q('C3-LTC-Q15', 3, '(√20 + √45) : √5 bằng:', ['5', '√13', '13', '25'], { B: 'E-KC-01', C: 'E-KC-03', D: 'E-BD-05' }),
  Q('C3-LTC-Q16', 4, 'Với x ≥ 0, x ≠ 4, biểu thức (x − 4)/(√x + 2) bằng:', ['√x − 2', '√x + 2', 'x − 2', '1/(√x − 2)'], e3('E-BD-05'))
];

const HINH = {};

export const QUESTIONS = [...CAU_GOC, ...CAU_MOI]
  .map((q) => (HINH[q.id] ? { ...q, hinh: HINH[q.id] } : q))
  .sort((a, b) => a.id.localeCompare(b.id));

/* ---------------------------------------------------------------- GỢI Ý 3 TẦNG */
export const HINTS = {
  'E-CBH-01': ['Số nào bình phương lên bằng 16? Có mấy số như vậy?', 'Số dương a có hai căn bậc hai đối nhau: √a (dương, gọi là căn bậc hai số học) và −√a. Kí hiệu √a chỉ số không âm.', 'Ví dụ: 16 có hai căn bậc hai là 4 và −4; còn √16 = 4 (không viết ±4).'],
  'E-CBH-02': ['Có số nào bình phương lên ra số âm không?', 'Bình phương của mọi số đều không âm, nên số âm không có căn bậc hai. √(−9) không xác định.', 'Ví dụ: 3² = 9 và (−3)² = 9, không có số nào bình phương bằng −9.'],
  'E-CBH-03': ['Biểu thức dưới dấu căn được phép bằng 0 không? Có mẫu số không?', '√A xác định khi A ≥ 0 (được bằng 0). Nếu căn nằm ở mẫu thì thêm điều kiện mẫu khác 0, tức A > 0.', 'Ví dụ: √(x − 3) xác định khi x − 3 ≥ 0 ⇔ x ≥ 3; còn 1/√(x − 1) cần x − 1 > 0 ⇔ x > 1.'],
  'E-CBH-04': ['Biểu thức trong ngoặc mang dấu âm hay dương?', '√(A²) = |A|: bằng A khi A ≥ 0 và bằng −A khi A < 0. Kết quả của căn bậc hai số học luôn không âm.', 'Ví dụ: √((−5)²) = |−5| = 5; √((2 − √5)²) = |2 − √5| = √5 − 2 vì 2 < √5.'],
  'E-CBH-05': ['Nếu bình phương hai số (đều không âm) thì số nào lớn hơn?', 'Với a, b ≥ 0: a < b ⇔ √a < √b. Muốn so sánh số với căn, viết số đó thành căn (4 = √16). Với số âm, chiều so sánh đổi ngược.', 'Ví dụ: 4 = √16 > √15. Còn −√5 < −√3 vì √5 > √3.'],
  'E-KC-01': ['Quy tắc khai căn áp dụng cho tích hay cho tổng?', 'Chỉ có √(A·B) = √A · √B (và với thương). Không có quy tắc cho tổng, hiệu: √(a + b) ≠ √a + √b. Phải tính tổng dưới căn trước.', 'Ví dụ: √(9 + 16) = √25 = 5, không phải 3 + 4 = 7.'],
  'E-KC-02': ['Các thừa số dưới căn có âm không? Em đã tính tích của chúng chưa?', 'Quy tắc √(A·B) = √A · √B chỉ dùng khi A, B ≥ 0. Nếu các thừa số âm thì tính tích trước (tích hai số âm là số dương).', 'Ví dụ: √((−4)(−9)) = √36 = 6, không viết √(−4) · √(−9).'],
  'E-KC-03': ['Em đã khai căn cả tử và mẫu chưa?', '√(A/B) = √A / √B với A ≥ 0, B > 0: khai căn tử và khai căn mẫu.', 'Ví dụ: √(9/4) = √9 / √4 = 3/2; √50 : √2 = √25 = 5.'],
  'E-BD-01': ['Trong số dưới dấu căn có thừa số nào là số chính phương không? Thừa số đưa ra có thể âm không?', '√(A²B) = |A|√B (B ≥ 0): tách số dưới căn thành (số chính phương) × (phần còn lại), đưa căn của số chính phương ra ngoài; nếu A âm thì lấy |A|.', 'Ví dụ: √18 = √(9 · 2) = 3√2; với x < 0: √(9x²y) = 3|x|√y = −3x√y.'],
  'E-BD-02': ['Khi đưa số vào trong căn, số đó phải biến thành gì? Dấu "−" đi đâu?', 'A√B = √(A²B) khi A ≥ 0; A√B = −√(A²B) khi A < 0. Bình phương thừa số khi đưa vào; dấu "−" giữ ở ngoài căn.', 'Ví dụ: 2√3 = √(4 · 3) = √12; −2√3 = −√12.'],
  'E-BD-03': ['Nhân với biểu thức nào thì mẫu hết căn?', 'Mẫu √b: nhân cả tử và mẫu với √b. Mẫu √b ± c: nhân cả tử và mẫu với biểu thức liên hợp √b ∓ c (đổi dấu ở giữa).', 'Ví dụ: 1/(√5 − 2) = (√5 + 2)/((√5)² − 2²) = (√5 + 2)/1 = √5 + 2.'],
  'E-BD-04': ['(x + y)(x − y) bằng bao nhiêu? Ở đây x = √a thì x² bằng gì?', '(√a + √b)(√a − √b) = (√a)² − (√b)² = a − b. Còn (√a + b)² = a + 2b√a + b² — đừng quên hạng tử giữa.', 'Ví dụ: (√6 + √2)(√6 − √2) = 6 − 2 = 4; (√3 + 1)² = 3 + 2√3 + 1 = 4 + 2√3.'],
  'E-BD-05': ['Các căn em đang cộng có cùng biểu thức dưới dấu căn không?', 'Đưa các căn về dạng a√b (b nhỏ nhất), rồi chỉ cộng, trừ các căn đồng dạng (cùng √b). √2 + √3 không gộp được.', 'Ví dụ: √20 − √45 + √5 = 2√5 − 3√5 + √5 = 0.'],
  'E-CBB-01': ['Số nào lập phương lên bằng −8? Số đó âm hay dương?', 'Mọi số thực đều có đúng một căn bậc ba; căn bậc ba của số âm là số âm, của số dương là số dương.', 'Ví dụ: ∛(−8) = −2 vì (−2)³ = −8; ∛27 = 3 (không phải ±3).'],
  'E-CBB-02': ['Căn bậc ba có cần biểu thức dưới căn không âm không?', '∛A xác định khi A xác định (không cần A ≥ 0). ∛(A³) = A (không lấy giá trị tuyệt đối).', 'Ví dụ: ∛(x − 2) xác định với mọi x; ∛((−3)³) = −3.']
};

/* ---------------------------------------------------------------- ĐỒ THỊ LỖI GỐC */
export const ERROR_NODES_C3 = LOI.map((e) => ({ id: e.code, name: e.ten, role: e.role, kuId: e.ku, cluster: e.cluster }));
export const CAUSAL_EDGES_C3 = [
  { from: 'E-CBH-01', to: 'E-CBH-02', weight: 0.60, reason: 'Chưa hiểu căn bậc hai là số bình phương bằng a nên khai căn cả số âm' },
  { from: 'E-CBH-01', to: 'E-CBH-05', weight: 0.50, reason: 'Chưa nắm √a không âm nên so sánh căn sai' },
  { from: 'E-CBH-02', to: 'E-CBH-03', weight: 0.65, reason: 'Không biết số âm không có căn bậc hai nên đặt điều kiện xác định sai' },
  { from: 'E-CBH-01', to: 'E-CBH-04', weight: 0.60, reason: 'Không nắm √ luôn không âm nên viết √(A²) = A' },
  { from: 'E-CBH-02', to: 'E-KC-02', weight: 0.60, reason: 'Chưa hiểu căn của số âm nên tách tích các số âm sai' },
  { from: 'E-CBH-03', to: 'E-KC-03', weight: 0.55, reason: 'Không để ý điều kiện nên khai căn thương sai' },
  { from: 'E-CBH-04', to: 'E-BD-01', weight: 0.75, reason: 'Viết √(A²) = A nên đưa thừa số âm ra ngoài thiếu giá trị tuyệt đối' },
  { from: 'E-BD-01', to: 'E-BD-02', weight: 0.60, reason: 'Chưa vững phép đưa ra nên làm ngược (đưa vào) cũng sai' },
  { from: 'E-KC-03', to: 'E-BD-03', weight: 0.50, reason: 'Chưa vững khai căn thương nên trục căn ở mẫu sai' },
  { from: 'E-BD-04', to: 'E-BD-03', weight: 0.70, reason: 'Không nắm (√a + √b)(√a − √b) = a − b nên chọn sai biểu thức liên hợp' },
  { from: 'E-KC-01', to: 'E-BD-05', weight: 0.65, reason: 'Tách căn của tổng nên cộng các căn không đồng dạng' },
  { from: 'E-BD-01', to: 'E-BD-05', weight: 0.60, reason: 'Không đưa được về căn đồng dạng nên rút gọn sai' },
  { from: 'E-BD-03', to: 'E-BD-05', weight: 0.60, reason: 'Trục căn sai nên rút gọn biểu thức có mẫu chứa căn sai' },
  { from: 'E-CBH-01', to: 'E-CBB-01', weight: 0.55, reason: 'Mang tính chất "±" và "không có căn số âm" của căn bậc hai sang căn bậc ba' },
  { from: 'E-CBB-01', to: 'E-CBB-02', weight: 0.60, reason: 'Nhầm căn bậc ba với căn bậc hai nên đặt điều kiện A ≥ 0' },
  { from: 'E-CBH-04', to: 'E-CBB-02', weight: 0.55, reason: 'Quen √(A²) = |A| nên viết ∛(A³) = |A|' }
];
export const ROOT_ERROR_IDS_C3 = ['E-CBH-01', 'E-KC-01', 'E-BD-04'];

/* ---------------------------------------------------------------- NGÂN HÀNG HOẠT ĐỘNG */
const NHAP = 'Bản nháp do trợ lý AI soạn theo từ điển mã lỗi — giáo viên cần duyệt, sửa trước khi dùng';
const A = (id, ten, errorCodes, nhom, hinhThuc, mucNhanThuc, phut, moTa, hocLieu) => ({ id, ten, errorCodes, nhom, hinhThuc, mucNhanThuc, phut, moTa, hocLieu, trangThai: 'nhap', nguon: NHAP });
export const ACTIVITIES_C3 = [
  A('HD-CBH-01', 'Hai căn hay một căn?', ['E-CBH-01', 'E-CBH-02'], ['loi'], 'nhom-dong-chat', 1, [7, 10],
    'Nhóm nhận 12 thẻ (16; 0,25; −9; 0; √49; "căn bậc hai của 49"…). Xếp vào ba cột: có hai căn bậc hai – có một – không có; với mỗi thẻ ghi rõ √a và −√a. Nhóm tự phát biểu sự khác nhau giữa "căn bậc hai" và "căn bậc hai số học".', '12 thẻ số, bảng ba cột'),
  A('HD-CBH-02', 'Trị tuyệt đối dưới dấu căn', ['E-CBH-03', 'E-CBH-04'], ['loi'], 'nhom-dong-chat', 2, [8, 12],
    'Nhóm thay lần lượt x = 5; 0; −5 vào √(x²) và vào x, ghi bảng so sánh, rồi phát biểu √(x²) = |x|. Sau đó tìm điều kiện xác định cho 4 căn thức (có căn ở mẫu) và kiểm tra bằng cách thay một giá trị biên.', 'Bảng thay số, 4 căn thức'),
  A('HD-KC-01', 'Căn của tổng có bằng tổng các căn?', ['E-KC-01', 'E-KC-02', 'E-BD-05'], ['loi'], 'ca-lop', 2, [6, 8],
    'Cả lớp dùng máy tính cầm tay so sánh √(9 + 16) với √9 + √16, √(4 · 9) với √4 · √9, √2 + √3 với √5. Mỗi em giơ thẻ "bằng" hoặc "khác" trước khi bấm máy; giáo viên chốt quy tắc chỉ đúng với tích và thương.', 'Máy tính cầm tay, thẻ Bằng/Khác'),
  A('HD-KC-02', 'Khai căn thương từng bước', ['E-KC-03'], ['loi'], 'ca-nhan', 2, [5, 8],
    'Học sinh làm 4 phép khai căn thương, bắt buộc viết bước trung gian √a / √b, rồi bạn cùng bàn kiểm tra bằng phép nhân ngược.', 'Phiếu 4 phép tính'),
  A('HD-BD-01', 'Ra – vào dấu căn', ['E-BD-01', 'E-BD-02'], ['loi'], 'nhom-dong-chat', 2, [8, 12],
    'Mỗi nhóm nhận 8 thẻ cặp (√18 ↔ 3√2, −2√3 ↔ −√12, √(9x²y) ↔ …) có 3 thẻ ghép sai cài sẵn. Nhóm ghép, tìm thẻ sai và sửa, ghi rõ chỗ phải lấy |A| hoặc giữ dấu "−" ngoài căn.', '8 thẻ cặp biến đổi'),
  A('HD-BD-02', 'Bảng liên hợp', ['E-BD-03', 'E-BD-04'], ['loi'], 'nhom-dong-chat', 2, [8, 12],
    'Nhóm điền bảng: mẫu → biểu thức liên hợp → tích của chúng (dạng a − b), cho 6 mẫu khác nhau; sau đó trục căn 3 biểu thức và đối chiếu với máy tính.', 'Phiếu bảng liên hợp, máy tính cầm tay'),
  A('HD-BD-03', 'Rút gọn tiếp sức', ['E-BD-05', 'E-BD-01', 'E-BD-03'], ['loi'], 'nhom-dong-chat', 3, [10, 15],
    'Mỗi nhóm 4 em rút gọn một biểu thức theo kiểu tiếp sức: em 1 tìm điều kiện, em 2 đưa về căn đồng dạng hoặc trục căn, em 3 thu gọn, em 4 kiểm tra bằng thay số. Sai bước nào thì quay lại bước đó.', '3 biểu thức rút gọn, giấy A3'),
  A('HD-CBB-01', 'Căn bậc hai – căn bậc ba: giống và khác', ['E-CBB-01', 'E-CBB-02'], ['loi'], 'nhom-dong-chat', 1, [7, 10],
    'Nhóm lập bảng so sánh căn bậc hai và căn bậc ba: số căn của số dương, của số âm, điều kiện xác định, √(A²) và ∛(A³). Kiểm tra bằng máy tính với các số −8, 8, −27, 0.', 'Phiếu bảng so sánh, máy tính cầm tay'),
  A('HD-C3-MR', 'Thiết kế hộp và sân chơi', [], ['san-sang'], 'nhom-dong-chat', 4, [12, 15],
    'Nhóm đã làm chủ giải hai bài toán thực tế: tìm cạnh một sân hình vuông có diện tích cho trước (căn bậc hai) và cạnh một thùng hình lập phương có thể tích cho trước (căn bậc ba); làm tròn hợp lí và trình bày trên bảng phụ.', 'Hai bài toán thực tế, bảng phụ')
];
