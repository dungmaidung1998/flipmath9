/**
 * NỘI DUNG TOÁN 9 — CHƯƠNG I. PHƯƠNG TRÌNH VÀ HỆ HAI PHƯƠNG TRÌNH BẬC NHẤT HAI ẨN (Kết nối tri thức)
 * BẢN NHÁP do trợ lý AI soạn theo SGK Toán 9 tập một (Bài 1–3) — giáo viên duyệt trước khi dùng.
 * Mỗi video OLM là một đơn vị kiến thức; 8 câu/đơn vị (2 câu mỗi mức 1–4), đáp án đúng luôn là A
 * (giao diện tự xáo phương án).
 */
const SEC = { 1: 45, 2: 60, 3: 90, 4: 120 };
const B1 = 'Bài 1. Khái niệm phương trình và hệ hai phương trình bậc nhất hai ẩn';
const B2 = 'Bài 2. Giải hệ hai phương trình bậc nhất hai ẩn';
const B3 = 'Bài 3. Giải bài toán bằng cách lập hệ phương trình';
const U = (id, bai, muc, name, order, prerequisite, mucTieu, extra = {}) => ({ id, bai, muc, name, order, prerequisite, mucTieu, ...extra });

export const UNITS = [
  U('C1-B1-M1', B1, 'Mục 1', 'Phương trình bậc nhất hai ẩn', 10, null,
    'Nhận biết phương trình bậc nhất hai ẩn ax + by = c (a ≠ 0 hoặc b ≠ 0); kiểm tra một cặp số có là nghiệm của phương trình hay không.'),
  U('C1-B1-M2', B1, 'Mục 1 (tiếp)', 'Biểu diễn nghiệm của phương trình bậc nhất hai ẩn', 11, 'C1-B1-M1',
    'Biết phương trình bậc nhất hai ẩn có vô số nghiệm; viết nghiệm tổng quát; biểu diễn tập nghiệm bằng đường thẳng trên mặt phẳng toạ độ.'),
  U('C1-B1-M3', B1, 'Mục 2', 'Hệ hai phương trình bậc nhất hai ẩn', 12, 'C1-B1-M2',
    'Nhận biết hệ hai phương trình bậc nhất hai ẩn; nghiệm của hệ là nghiệm chung của cả hai phương trình; kiểm tra nghiệm của hệ.'),
  U('C1-B2-M1', B2, 'Mục 1', 'Giải hệ bằng phương pháp thế', 13, 'C1-B1-M3',
    'Giải hệ hai phương trình bậc nhất hai ẩn bằng phương pháp thế; nhận biết hệ vô nghiệm, vô số nghiệm.'),
  U('C1-B2-M2', B2, 'Mục 2', 'Giải hệ bằng phương pháp cộng đại số', 14, 'C1-B2-M1',
    'Giải hệ hai phương trình bậc nhất hai ẩn bằng phương pháp cộng đại số (nhân hệ số thích hợp rồi cộng hoặc trừ từng vế).'),
  U('C1-B3-M1', B3, 'Mục 1', 'Giải bài toán bằng cách lập hệ phương trình', 15, 'C1-B2-M2',
    'Giải bài toán bằng cách lập hệ phương trình theo ba bước: chọn ẩn và đặt điều kiện, lập hệ, giải và đối chiếu điều kiện.'),
  U('C1-B3-M1B', B3, 'Mục 1 (tiếp)', 'Bài toán chuyển động', 16, 'C1-B3-M1',
    'Lập hệ phương trình cho bài toán chuyển động: s = v·t, gặp nhau, xuôi dòng – ngược dòng.'),
  U('C1-B3-M1C', B3, 'Mục 1 (tiếp)', 'Bài toán năng suất, công việc', 17, 'C1-B3-M1',
    'Lập hệ phương trình cho bài toán năng suất, làm chung – làm riêng (năng suất là phần việc làm được trong một đơn vị thời gian).')
];

/* ---------------------------------------------------------------- MÃ LỖI */
const E = (code, ku, role, cluster, ten, tieuDe, phut, misconception, viDu) =>
  ({ code, ku, role, cluster, ten, tieuDe, phut, misconception, viDu, remediation: 'VBH-' + code.slice(2) });
const LOI = [
  E('E-PT2-01', 'C1-B1-M1', 'root', 'Phương trình hai ẩn', 'Nhận dạng phương trình bậc nhất hai ẩn sai', 'Dạng ax + by = c, a ≠ 0 hoặc b ≠ 0', 5,
    'Nhận dạng phương trình bậc nhất hai ẩn sai: coi xy, x², 1/x là bậc nhất, hoặc cho rằng a và b phải cùng khác 0', 'xy + 2 = 0 là phương trình bậc nhất hai ẩn; 0x + 4y = 8 không phải'),
  E('E-PT2-02', 'C1-B1-M1', 'mediating', 'Phương trình hai ẩn', 'Thay nghiệm sai thứ tự hoặc tính sai', 'Cặp (x0; y0): x0 thay cho x, y0 thay cho y', 5,
    'Kiểm tra nghiệm hoặc tìm tham số mà thay nhầm thứ tự x, y trong cặp số, hoặc tính sai dấu khi thay', '(1; 2) với x + 2y = 5: thay 2 + 2·1 = 4'),
  E('E-PT2-03', 'C1-B1-M2', 'leaf', 'Phương trình hai ẩn', 'Biểu diễn tập nghiệm sai', 'Vô số nghiệm, nằm trên một đường thẳng', 6,
    'Cho rằng phương trình bậc nhất hai ẩn chỉ có một nghiệm, viết nghiệm tổng quát sai, hoặc nhầm đường thẳng y = c với x = c', '0x + 2y = 4 biểu diễn bởi đường thẳng x = 2'),
  E('E-HPT-01', 'C1-B1-M3', 'mediating', 'Hệ phương trình', 'Nghiệm của hệ chỉ thoả một phương trình', 'Nghiệm của hệ là nghiệm chung', 5,
    'Kết luận một cặp số là nghiệm của hệ khi nó mới thoả một trong hai phương trình', '(3; 0) là nghiệm của hệ x + y = 3, x − y = 1'),
  E('E-HPT-02', 'C1-B2-M1', 'mediating', 'Hệ phương trình', 'Thế sai dấu, thiếu ngoặc', 'Thế cả biểu thức, đặt trong ngoặc', 6,
    'Khi rút và thế, chuyển vế sai dấu hoặc thế biểu thức mà không đặt trong ngoặc nên quên đổi dấu', 'Thế y = 3 − x vào 2x − y = 0 được 2x − 3 − x = 0'),
  E('E-HPT-03', 'C1-B2-M2', 'mediating', 'Hệ phương trình', 'Cộng, trừ đại số sai', 'Nhân đủ cả hai vế, trừ thì đổi dấu mọi hạng tử', 6,
    'Cộng đại số mà nhân hệ số không đủ các hạng tử, trừ từng vế quên đổi dấu, hoặc chọn hệ số không khử được ẩn', 'Nhân 2x − y = 3 với 3 được 6x − y = 9'),
  E('E-HPT-04', 'C1-B2-M1', 'leaf', 'Hệ phương trình', 'Kết luận số nghiệm sai', '0x = c (c ≠ 0): vô nghiệm; 0x = 0: vô số nghiệm', 5,
    'Kết luận sai số nghiệm khi gặp 0x = c, hoặc tìm được một ẩn rồi kết luận thiếu, sai ẩn còn lại', 'Gặp 0y = 2 kết luận y = 0; hệ trùng nhau kết luận vô nghiệm'),
  E('E-BTH-01', 'C1-B3-M1', 'root', 'Lập hệ phương trình', 'Chọn ẩn, đặt điều kiện sai', 'Ẩn có đơn vị và điều kiện phù hợp thực tế', 5,
    'Chọn ẩn không rõ đơn vị, đặt điều kiện sai (cho số học sinh là số thực, số âm) hoặc không đối chiếu điều kiện', 'Gọi số học sinh nam là x, điều kiện x ∈ ℝ'),
  E('E-BTH-02', 'C1-B3-M1', 'mediating', 'Lập hệ phương trình', 'Dịch lời văn thành phương trình sai', '"Hơn" là hiệu, "gấp" là tích', 6,
    'Lập phương trình sai quan hệ trong đề: nhầm "hơn" với "gấp", đảo vai hai đại lượng, dùng nửa chu vi thay chu vi', 'Chu vi 34 m viết x + y = 34'),
  E('E-BTH-03', 'C1-B3-M1B', 'leaf', 'Lập hệ phương trình', 'Sai công thức chuyển động', 's = v·t; xuôi dòng v + vnước, ngược dòng v − vnước', 6,
    'Dùng sai s = v·t, nhầm vận tốc xuôi – ngược dòng, hoặc quên nhân thời gian khi hai xe đi ngược chiều gặp nhau', 'Hai xe gặp nhau sau 2 giờ: x + y = 180'),
  E('E-BTH-04', 'C1-B3-M1C', 'leaf', 'Lập hệ phương trình', 'Cộng thời gian thay vì cộng năng suất', 'Làm chung: cộng phần việc làm được trong 1 đơn vị thời gian', 6,
    'Bài toán làm chung – làm riêng mà cộng thời gian của từng đội (x + y = t) thay vì cộng năng suất (1/x + 1/y = 1/t)', 'Vòi A 4 giờ, vòi B 6 giờ thì cùng chảy hết 10 giờ')
];
export const ERRORS = LOI.map(({ code, ku, misconception, viDu, remediation }) => ({ code, ku, misconception, viDu, remediation }));
export const REMEDIATION = Object.fromEntries(LOI.map((e) => [e.remediation, { ku: e.ku, title: e.tieuDe, minutes: e.phut }]));

/* ---------------------------------------------------------------- CÂU HỎI */
const Q = (id, level, stem, [A, B, C, D], err, hinh) =>
  ({ id, ku: id.replace(/-Q\d+$/, ''), level, sec: SEC[level], stem, opts: { A, B, C, D }, correct: 'A', err, ...(hinh ? { hinh } : {}) });
const e3 = (c) => ({ B: c, C: c, D: c });

const CAU_GOC = [
  // ---------- C1-B1-M1 Phương trình bậc nhất hai ẩn
  Q('C1-B1-M1-Q01', 1, 'Phương trình nào là phương trình bậc nhất hai ẩn?', ['2x − 3y = 5', 'x² + y = 1', 'xy + 2 = 0', '1/x + y = 2'], e3('E-PT2-01')),
  Q('C1-B1-M1-Q02', 1, 'Cặp số nào là nghiệm của phương trình x + 2y = 5?', ['(1; 2)', '(2; 1)', '(5; 1)', '(0; 5)'], e3('E-PT2-02')),
  Q('C1-B1-M1-Q03', 2, 'Phương trình nào sau đây là phương trình bậc nhất hai ẩn?', ['0x + 4y = 8', 'x² − 4y = 8', '0x + 0y = 8', 'x · y = 8'], e3('E-PT2-01')),
  Q('C1-B1-M1-Q04', 2, 'Cặp số (2; −1) là nghiệm của phương trình nào?', ['3x + 2y = 4', '3x − 2y = 4', '2x + 3y = 4', 'x + y = 3'], e3('E-PT2-02')),
  Q('C1-B1-M1-Q05', 3, 'Tìm m để cặp số (1; 2) là nghiệm của phương trình mx + y = 5.', ['m = 3', 'm = 2', 'm = 7', 'm = 5'], e3('E-PT2-02')),
  Q('C1-B1-M1-Q06', 3, 'Phương trình x − y = 1 có bao nhiêu nghiệm?', ['Vô số nghiệm', 'Một nghiệm', 'Hai nghiệm', 'Vô nghiệm'], e3('E-PT2-03')),
  Q('C1-B1-M1-Q07', 4, 'Mua x quyển vở giá 8 000 đồng/quyển và y cái bút giá 5 000 đồng/cái hết 41 000 đồng. Phương trình biểu thị là:', ['8 000x + 5 000y = 41 000', '8 000y + 5 000x = 41 000', 'x + y = 41 000', '13 000(x + y) = 41 000'], e3('E-BTH-02')),
  Q('C1-B1-M1-Q08', 4, 'Với x, y là số tự nhiên, phương trình 8x + 5y = 41 có nghiệm (x; y) là:', ['(2; 5)', '(5; 2)', '(3; 3)', '(1; 6)'], e3('E-PT2-02')),

  // ---------- C1-B1-M2 Biểu diễn nghiệm
  Q('C1-B1-M2-Q01', 1, 'Nghiệm tổng quát của phương trình x + y = 3 là:', ['(x; 3 − x) với x ∈ ℝ', '(x; x − 3) với x ∈ ℝ', 'Chỉ có nghiệm (3; 0)', '(x; 3 + x) với x ∈ ℝ'], e3('E-PT2-03')),
  Q('C1-B1-M2-Q02', 1, 'Tập nghiệm của phương trình 2x − y = 1 được biểu diễn bởi đường thẳng:', ['y = 2x − 1', 'y = 1 − 2x', 'y = 2x + 1', 'y = (x − 1)/2'], e3('E-PT2-03')),
  Q('C1-B1-M2-Q03', 2, 'Tập nghiệm của phương trình 0x + 2y = 4 được biểu diễn bởi:', ['Đường thẳng y = 2, song song với trục Ox', 'Đường thẳng x = 2, song song với trục Oy', 'Chỉ một điểm (0; 2)', 'Đường thẳng y = 2x'], e3('E-PT2-03')),
  Q('C1-B1-M2-Q04', 2, 'Tập nghiệm của phương trình 3x + 0y = 6 được biểu diễn bởi:', ['Đường thẳng x = 2', 'Đường thẳng y = 2', 'Chỉ một điểm (2; 0)', 'Đường thẳng y = 3x − 6'], e3('E-PT2-03')),
  Q('C1-B1-M2-Q05', 3, 'Đường thẳng biểu diễn tập nghiệm của phương trình x − 2y = 4 cắt trục Ox tại điểm:', ['(4; 0)', '(0; −2)', '(−4; 0)', '(2; 0)'], { B: 'E-PT2-03', C: 'E-PT2-02', D: 'E-PT2-02' }),
  Q('C1-B1-M2-Q06', 3, 'Điểm nào thuộc đường thẳng biểu diễn tập nghiệm của phương trình 2x + y = 3?', ['(1; 1)', '(1; 2)', '(0; −3)', '(2; 1)'], e3('E-PT2-02')),
  Q('C1-B1-M2-Q07', 4, 'Đường thẳng đi qua hai điểm (0; 2) và (3; 0) biểu diễn tập nghiệm của phương trình nào?', ['2x + 3y = 6', '3x + 2y = 6', 'x + y = 5', '2x − 3y = 6'], e3('E-PT2-02')),
  Q('C1-B1-M2-Q08', 4, 'Nghiệm tổng quát của phương trình 2x − 3y = 6 là:', ['(x; (2x − 6)/3) với x ∈ ℝ', '(x; (6 − 2x)/3) với x ∈ ℝ', '(x; 2x − 6) với x ∈ ℝ', '(x; (2x + 6)/3) với x ∈ ℝ'], e3('E-PT2-03')),

  // ---------- C1-B1-M3 Hệ hai phương trình
  Q('C1-B1-M3-Q01', 1, 'Hệ nào là hệ hai phương trình bậc nhất hai ẩn?', ['{ x + y = 3; 2x − y = 0 }', '{ x² + y = 1; x − y = 2 }', '{ xy = 2; x + y = 3 }', '{ x + 1/y = 2; x − y = 1 }'], e3('E-PT2-01')),
  Q('C1-B1-M3-Q02', 1, 'Cặp số nào là nghiệm của hệ { x + y = 3; x − y = 1 }?', ['(2; 1)', '(1; 2)', '(3; 0)', '(1; 0)'], { B: 'E-PT2-02', C: 'E-HPT-01', D: 'E-HPT-01' }),
  Q('C1-B1-M3-Q03', 2, 'Cặp số (1; 2) là nghiệm của hệ nào?', ['{ x + y = 3; 2x − y = 0 }', '{ x + y = 3; x − y = 1 }', '{ 2x + y = 3; x + y = 3 }', '{ x − y = 1; x + 2y = 5 }'], e3('E-HPT-01')),
  Q('C1-B1-M3-Q04', 2, 'Cặp số (3; −1) là nghiệm của hệ { 2x + y = 5; x − my = 4 } khi:', ['m = 1', 'm = −1', 'm = 7', 'Không có giá trị nào của m'], { B: 'E-PT2-02', C: 'E-PT2-02', D: 'E-HPT-01' }),
  Q('C1-B1-M3-Q05', 2, 'Nghiệm của hệ { x + y = 5; y = 2 } là:', ['(3; 2)', '(2; 3)', '(5; 2)', '(7; 2)'], { B: 'E-PT2-02', C: 'E-HPT-01', D: 'E-HPT-02' }),
  Q('C1-B1-M3-Q06', 3, 'Cặp số (x0; y0) là nghiệm của một hệ hai phương trình bậc nhất hai ẩn nghĩa là:', ['(x0; y0) là nghiệm chung của cả hai phương trình', '(x0; y0) là nghiệm của ít nhất một phương trình', 'x0 là nghiệm của phương trình thứ nhất, y0 là nghiệm của phương trình thứ hai', 'x0 = y0'], e3('E-HPT-01')),
  Q('C1-B1-M3-Q07', 3, 'Hai đường thẳng 2x − y = 1 và x + y = 5 cắt nhau tại điểm:', ['(2; 3)', '(3; 2)', '(1; 1)', '(0; 5)'], { B: 'E-PT2-02', C: 'E-HPT-01', D: 'E-HPT-01' }),
  Q('C1-B1-M3-Q08', 4, 'Tổng hai số bằng 10, số thứ nhất lớn hơn số thứ hai 4. Hệ phương trình và nghiệm (số thứ nhất; số thứ hai) là:', ['{ x + y = 10; x − y = 4 }, nghiệm (7; 3)', '{ x + y = 10; x − y = 4 }, nghiệm (3; 7)', '{ x + y = 4; x − y = 10 }, nghiệm (7; −3)', '{ x + y = 10; x − y = 4 }, nghiệm (6; 4)'], { B: 'E-PT2-02', C: 'E-BTH-02', D: 'E-HPT-01' }),

  // ---------- C1-B2-M1 Phương pháp thế
  Q('C1-B2-M1-Q01', 1, 'Giải hệ { x = 2y; x + y = 6 } bằng phương pháp thế, ta được nghiệm:', ['(4; 2)', '(2; 4)', '(6; 0)', '(3; 3)'], { B: 'E-PT2-02', C: 'E-HPT-01', D: 'E-HPT-01' }),
  Q('C1-B2-M1-Q02', 1, 'Từ phương trình x − 3y = 2, rút x theo y được:', ['x = 2 + 3y', 'x = 2 − 3y', 'x = 3y − 2', 'x = (2 + y)/3'], e3('E-HPT-02')),
  Q('C1-B2-M1-Q03', 2, 'Thế y = 3 − x vào phương trình 2x − y = 0, ta được:', ['2x − (3 − x) = 0', '2x − 3 − x = 0', '2(3 − x) − y = 0', '2x + 3 − x = 0'], e3('E-HPT-02')),
  Q('C1-B2-M1-Q04', 2, 'Nghiệm của hệ { y = x + 1; 2x + y = 7 } là:', ['(2; 3)', '(3; 2)', '(2; 1)', '(3; 4)'], { B: 'E-PT2-02', C: 'E-HPT-02', D: 'E-HPT-01' }),
  Q('C1-B2-M1-Q05', 3, 'Nghiệm của hệ { 3x − y = 5; x + 2y = 4 } là:', ['(2; 1)', '(1; 2)', '(2; −1)', '(3; 4)'], { B: 'E-PT2-02', C: 'E-HPT-02', D: 'E-HPT-01' }),
  Q('C1-B2-M1-Q06', 3, 'Hệ { x − y = 1; 2x − 2y = 2 } có:', ['Vô số nghiệm', 'Vô nghiệm', 'Một nghiệm duy nhất', 'Đúng hai nghiệm'], e3('E-HPT-04')),
  Q('C1-B2-M1-Q07', 3, 'Giải hệ { x + y = 3; x + y = 5 } bằng phương pháp thế, ta đi đến 0y = 2. Kết luận đúng là:', ['Hệ vô nghiệm', 'Hệ có vô số nghiệm', 'y = 0', 'y = 2'], e3('E-HPT-04')),
  Q('C1-B2-M1-Q08', 4, 'Tìm a, b để hệ { ax + y = 5; x − by = 1 } có nghiệm (2; 1).', ['a = 2, b = 1', 'a = 1, b = 2', 'a = 3, b = −1', 'a = 2, b = −1'], { B: 'E-PT2-02', C: 'E-HPT-02', D: 'E-HPT-02' }),

  // ---------- C1-B2-M2 Phương pháp cộng đại số
  Q('C1-B2-M2-Q01', 1, 'Cộng từng vế hai phương trình của hệ { x + y = 7; x − y = 1 }, ta được:', ['2x = 8', '2y = 6', '2x = 6', '0x = 8'], e3('E-HPT-03')),
  Q('C1-B2-M2-Q02', 1, 'Nghiệm của hệ { x + y = 7; x − y = 1 } là:', ['(4; 3)', '(3; 4)', '(8; −1)', '(4; 4)'], { B: 'E-PT2-02', C: 'E-HPT-01', D: 'E-HPT-04' }),
  Q('C1-B2-M2-Q03', 2, 'Trừ từng vế phương trình thứ nhất cho phương trình thứ hai của hệ { 3x + 2y = 7; x + 2y = 5 }, ta được:', ['2x = 2', '2x = 12', '4x = 12', '2x + 4y = 2'], e3('E-HPT-03')),
  Q('C1-B2-M2-Q04', 2, 'Để khử ẩn x trong hệ { 2x + 3y = 8; x − y = −1 } bằng phương pháp cộng đại số, ta nhân hai vế phương trình thứ hai với:', ['2', '3', '−3', '8'], e3('E-HPT-03')),
  Q('C1-B2-M2-Q05', 3, 'Nghiệm của hệ { 2x + 3y = 8; x − y = −1 } là:', ['(1; 2)', '(2; 1)', '(1; −2)', '(−1; 0)'], { B: 'E-PT2-02', C: 'E-HPT-03', D: 'E-HPT-01' }),
  Q('C1-B2-M2-Q06', 3, 'Nhân hai vế phương trình 2x − y = 3 với 3, bạn An được 6x − y = 9. Nhận xét nào đúng?', ['An sai: phải là 6x − 3y = 9', 'An làm đúng', 'An sai: phải là 6x − 3y = 3', 'An sai: phải là 5x − y = 6'], e3('E-HPT-03')),
  Q('C1-B2-M2-Q07', 4, 'Nghiệm của hệ { 3x + 2y = 1; 2x − 3y = 5 } là:', ['(1; −1)', '(−1; 1)', '(1; 1)', '(13; −19)'], { B: 'E-PT2-02', C: 'E-HPT-03', D: 'E-HPT-01' }),
  Q('C1-B2-M2-Q08', 4, 'Hệ { 2x − 4y = 6; −x + 2y = −3 } có:', ['Vô số nghiệm', 'Vô nghiệm', 'Nghiệm duy nhất (3; 0)', 'Nghiệm duy nhất (0; 0)'], e3('E-HPT-04')),

  // ---------- C1-B3-M1 Giải bài toán bằng cách lập hệ
  Q('C1-B3-M1-Q01', 1, 'Hai số có tổng bằng 50, số lớn hơn số nhỏ 8. Gọi số lớn là x, số nhỏ là y. Hệ phương trình là:', ['{ x + y = 50; x − y = 8 }', '{ x + y = 50; y − x = 8 }', '{ x − y = 50; x + y = 8 }', '{ x + y = 50; x = 8y }'], e3('E-BTH-02')),
  Q('C1-B3-M1-Q02', 1, 'Lớp 9A có 40 học sinh, số nữ nhiều hơn số nam 4 em. Gọi số học sinh nam là x. Điều kiện của x là:', ['x ∈ ℕ*, x < 40', 'x ∈ ℝ', 'x > 40', 'x < 0'], e3('E-BTH-01')),
  Q('C1-B3-M1-Q03', 2, 'Hai số có tổng bằng 50 và số lớn hơn số nhỏ 8. Hai số đó là:', ['29 và 21', '25 và 25', '42 và 8', '30 và 22'], e3('E-BTH-02')),
  Q('C1-B3-M1-Q04', 2, 'Mua 3 quyển vở và 2 cái bút hết 34 000 đồng; mua 2 quyển vở và 3 cái bút hết 31 000 đồng. Gọi giá một quyển vở là x, một cái bút là y (đồng). Hệ phương trình là:', ['{ 3x + 2y = 34 000; 2x + 3y = 31 000 }', '{ 3x + 2y = 31 000; 2x + 3y = 34 000 }', '{ 3x + 3y = 34 000; 2x + 2y = 31 000 }', '{ x + y = 34 000; x + y = 31 000 }'], e3('E-BTH-02')),
  Q('C1-B3-M1-Q05', 3, 'Mua 3 quyển vở và 2 cái bút hết 34 000 đồng; mua 2 quyển vở và 3 cái bút hết 31 000 đồng. Giá một quyển vở là:', ['8 000 đồng', '5 000 đồng', '13 000 đồng', '3 000 đồng'], { B: 'E-PT2-02', C: 'E-HPT-04', D: 'E-HPT-04' }),
  Q('C1-B3-M1-Q06', 3, 'Một mảnh vườn hình chữ nhật có chu vi 34 m, chiều dài hơn chiều rộng 7 m. Gọi chiều dài là x, chiều rộng là y (m). Hệ phương trình đúng là:', ['{ x + y = 17; x − y = 7 }', '{ x + y = 34; x − y = 7 }', '{ 2(x + y) = 17; x − y = 7 }', '{ x + y = 17; y − x = 7 }'], e3('E-BTH-02')),
  Q('C1-B3-M1-Q07', 4, 'Một mảnh vườn hình chữ nhật có chu vi 34 m, chiều dài hơn chiều rộng 7 m. Diện tích mảnh vườn là:', ['60 m²', '17 m²', '84 m²', '120 m²'], { B: 'E-BTH-02', C: 'E-HPT-04', D: 'E-BTH-01' }),
  Q('C1-B3-M1-Q08', 4, 'Một số có hai chữ số, tổng các chữ số bằng 9; đổi chỗ hai chữ số thì được số mới lớn hơn số cũ 27. Số đó là:', ['36', '63', '45', '27'], { B: 'E-BTH-02', C: 'E-BTH-02', D: 'E-BTH-01' }),

  // ---------- C1-B3-M1B Bài toán chuyển động
  Q('C1-B3-M1B-Q01', 1, 'Một ô tô đi với vận tốc v (km/h) trong t (giờ) thì được quãng đường s (km) là:', ['s = v · t', 's = v : t', 's = v + t', 's = t : v'], e3('E-BTH-03')),
  Q('C1-B3-M1B-Q02', 1, 'Ca nô có vận tốc riêng x km/h, vận tốc dòng nước y km/h. Vận tốc của ca nô khi xuôi dòng là:', ['x + y (km/h)', 'x − y (km/h)', 'x · y (km/h)', 'x (km/h)'], e3('E-BTH-03')),
  Q('C1-B3-M1B-Q03', 2, 'Hai xe khởi hành cùng lúc từ hai địa điểm cách nhau 180 km, đi ngược chiều và gặp nhau sau 2 giờ. Gọi vận tốc hai xe là x, y (km/h). Phương trình đúng là:', ['2x + 2y = 180', 'x + y = 180', '2x − 2y = 180', 'x + y = 360'], e3('E-BTH-03')),
  Q('C1-B3-M1B-Q04', 2, 'Một ca nô xuôi dòng với vận tốc 30 km/h, ngược dòng với vận tốc 24 km/h. Vận tốc dòng nước là:', ['3 km/h', '6 km/h', '27 km/h', '54 km/h'], e3('E-BTH-03')),
  Q('C1-B3-M1B-Q05', 3, 'Hai xe đi ngược chiều từ A và B cách nhau 180 km, gặp nhau sau 2 giờ; xe đi từ A nhanh hơn xe đi từ B là 10 km/h. Vận tốc xe đi từ A là:', ['50 km/h', '40 km/h', '95 km/h', '90 km/h'], { B: 'E-PT2-02', C: 'E-BTH-03', D: 'E-BTH-03' }),
  Q('C1-B3-M1B-Q06', 3, 'Một người đi xe đạp từ A đến B với vận tốc 15 km/h rồi quay về với vận tốc 12 km/h, cả đi và về hết 3 giờ. Gọi quãng đường AB là x (km). Phương trình đúng là:', ['x/15 + x/12 = 3', '15x + 12x = 3', 'x/15 − x/12 = 3', 'x/(15 + 12) = 3'], e3('E-BTH-03')),
  Q('C1-B3-M1B-Q07', 4, 'Một người đi xe đạp từ A đến B với vận tốc 15 km/h rồi quay về với vận tốc 12 km/h, cả đi và về hết 3 giờ. Quãng đường AB dài:', ['20 km', '40 km', '81 km', '6,75 km'], e3('E-BTH-03')),
  Q('C1-B3-M1B-Q08', 4, 'Một ca nô xuôi dòng 60 km rồi ngược dòng 40 km, hết tất cả 5 giờ; vận tốc dòng nước là 4 km/h. Gọi vận tốc riêng của ca nô là x (km/h, x > 4). Phương trình đúng là:', ['60/(x + 4) + 40/(x − 4) = 5', '60/(x − 4) + 40/(x + 4) = 5', '60(x + 4) + 40(x − 4) = 5', '100/x = 5'], e3('E-BTH-03')),

  // ---------- C1-B3-M1C Bài toán năng suất, công việc
  Q('C1-B3-M1C-Q01', 1, 'Một đội làm xong một công việc trong x ngày. Trong 1 ngày, đội đó làm được:', ['1/x công việc', 'x công việc', 'x − 1 công việc', '1 − x công việc'], e3('E-BTH-04')),
  Q('C1-B3-M1C-Q02', 1, 'Vòi A chảy đầy bể trong 4 giờ, vòi B chảy đầy bể trong 6 giờ. Trong 1 giờ, cả hai vòi cùng chảy được:', ['5/12 bể', '1/10 bể', '10 bể', '1/24 bể'], e3('E-BTH-04')),
  Q('C1-B3-M1C-Q03', 2, 'Vòi A chảy đầy bể trong 4 giờ, vòi B chảy đầy bể trong 6 giờ. Hai vòi cùng chảy thì đầy bể sau:', ['2,4 giờ', '10 giờ', '5 giờ', '24 giờ'], e3('E-BTH-04')),
  Q('C1-B3-M1C-Q04', 2, 'Hai đội cùng làm thì xong công việc trong 12 ngày. Gọi thời gian đội I, đội II làm một mình xong việc lần lượt là x, y (ngày). Phương trình đúng là:', ['1/x + 1/y = 1/12', 'x + y = 12', '1/x + 1/y = 12', 'x · y = 12'], e3('E-BTH-04')),
  Q('C1-B3-M1C-Q05', 3, 'Theo kế hoạch, hai tổ sản xuất 600 sản phẩm. Thực tế tổ I vượt mức 10%, tổ II vượt mức 20% nên làm được 685 sản phẩm. Gọi số sản phẩm theo kế hoạch của tổ I, tổ II là x, y. Hệ phương trình đúng là:', ['{ x + y = 600; 1,1x + 1,2y = 685 }', '{ x + y = 600; 0,1x + 0,2y = 685 }', '{ x + y = 685; 1,1x + 1,2y = 600 }', '{ x + y = 600; 1,1x + 1,2y = 85 }'], e3('E-BTH-02')),
  Q('C1-B3-M1C-Q06', 3, 'Theo kế hoạch, hai tổ sản xuất 600 sản phẩm. Thực tế tổ I vượt mức 10%, tổ II vượt mức 20% nên làm được 685 sản phẩm. Số sản phẩm theo kế hoạch của tổ I là:', ['350', '250', '385', '300'], { B: 'E-PT2-02', C: 'E-BTH-02', D: 'E-BTH-01' }),
  Q('C1-B3-M1C-Q07', 4, 'Hai đội cùng làm thì xong việc trong 12 ngày. Làm chung 8 ngày thì đội I nghỉ, đội II làm tiếp 7 ngày nữa thì xong. Đội II làm một mình thì xong việc sau:', ['21 ngày', '7 ngày', '19 ngày', '28 ngày'], e3('E-BTH-04')),
  Q('C1-B3-M1C-Q08', 4, 'Hai vòi cùng chảy thì đầy bể sau 2 giờ 24 phút. Chảy riêng thì vòi I đầy bể nhanh hơn vòi II 2 giờ. Gọi thời gian vòi I chảy riêng đầy bể là x giờ (x > 0). Phương trình đúng là:', ['1/x + 1/(x + 2) = 5/12', 'x + (x + 2) = 2,4', '1/x + 1/(x − 2) = 5/12', '1/x + 1/(x + 2) = 1/2,24'], e3('E-BTH-04'))
];

// ---------------------------------------------------------------------------
// BỔ SUNG 23/11/2026: mỗi mục 8 → 16 câu, phân bố 4 🌱 · 5 🌿 · 4 🌳 · 3 ⭐. Đáp án đã tính lại bằng máy. BẢN NHÁP chờ duyệt.
const CAU_MOI = [
  // ---------- C1-B1-M1
  Q('C1-B1-M1-Q09', 1, 'Trong phương trình 3x − 4y = 7, hệ số b là:', ['−4', '4', '3', '7'], e3('E-PT2-01')),
  Q('C1-B1-M1-Q10', 1, 'Cặp số nào là nghiệm của phương trình 2x − y = 3?', ['(2; 1)', '(1; 2)', '(0; 3)', '(3; 0)'], e3('E-PT2-02')),
  Q('C1-B1-M1-Q11', 2, 'Phương trình nào KHÔNG phải là phương trình bậc nhất hai ẩn?', ['x² + y = 2', '0x + 3y = 1', 'x − 0y = 4', '−x + 5y = 0'], e3('E-PT2-01')),
  Q('C1-B1-M1-Q12', 2, 'Cặp số (−1; 3) là nghiệm của phương trình nào?', ['2x + y = 1', 'x + 2y = 1', '2x − y = 1', 'x − y = 4'], e3('E-PT2-02')),
  Q('C1-B1-M1-Q13', 2, 'Tìm m để cặp số (2; m) là nghiệm của phương trình 3x − 2y = 4.', ['m = 1', 'm = −1', 'm = 5', 'm = 2'], e3('E-PT2-02')),
  Q('C1-B1-M1-Q14', 3, 'Tìm a để cặp số (1; −2) là nghiệm của phương trình ax + 3y = 4.', ['a = 10', 'a = −2', 'a = 2', 'a = −10'], e3('E-PT2-02')),
  Q('C1-B1-M1-Q15', 3, 'Phương trình nào nhận cả hai cặp số (1; 1) và (3; 0) làm nghiệm?', ['x + 2y = 3', '2x + y = 3', 'x − y = 0', 'x + y = 2'], e3('E-PT2-02')),
  Q('C1-B1-M1-Q16', 4, 'Vé người lớn giá 50 000 đồng, vé trẻ em giá 30 000 đồng. Một nhóm mua x vé người lớn và y vé trẻ em hết 260 000 đồng. Cặp số (x; y) nào phù hợp?', ['(4; 2)', '(2; 4)', '(3; 3)', '(5; 1)'], e3('E-PT2-02')),
  // ---------- C1-B1-M2
  Q('C1-B1-M2-Q09', 1, 'Phương trình bậc nhất hai ẩn có bao nhiêu nghiệm?', ['Vô số nghiệm', 'Đúng một nghiệm', 'Hai nghiệm', 'Không có nghiệm'], e3('E-PT2-03')),
  Q('C1-B1-M2-Q10', 1, 'Tập nghiệm của phương trình x + y = 2 được biểu diễn bởi đường thẳng:', ['y = −x + 2', 'y = x + 2', 'y = x − 2', 'y = 2x'], e3('E-PT2-03')),
  Q('C1-B1-M2-Q11', 2, 'Tập nghiệm của phương trình 0x − y = 3 được biểu diễn bởi:', ['Đường thẳng y = −3, song song với trục Ox', 'Đường thẳng x = 3, song song với trục Oy', 'Đường thẳng y = 3, song song với trục Ox', 'Đường thẳng x = −3, song song với trục Oy'], e3('E-PT2-03')),
  Q('C1-B1-M2-Q12', 2, 'Nghiệm tổng quát của phương trình 3x + y = 5 là:', ['(x; 5 − 3x) với x ∈ ℝ', '(x; 3x − 5) với x ∈ ℝ', '(x; 5 + 3x) với x ∈ ℝ', 'Chỉ có nghiệm (1; 2)'], e3('E-PT2-03')),
  Q('C1-B1-M2-Q13', 2, 'Đường thẳng biểu diễn tập nghiệm của phương trình 2x + 3y = 6 cắt trục Oy tại điểm:', ['(0; 2)', '(3; 0)', '(0; 3)', '(0; 6)'], e3('E-PT2-03')),
  Q('C1-B1-M2-Q14', 3, 'Đường thẳng biểu diễn tập nghiệm của phương trình x − 3y = 3 đi qua hai điểm:', ['(3; 0) và (0; −1)', '(0; 3) và (−1; 0)', '(3; 0) và (0; 1)', '(1; 0) và (0; −3)'], e3('E-PT2-03')),
  Q('C1-B1-M2-Q15', 3, 'Điểm M(a; 2) thuộc đường thẳng biểu diễn tập nghiệm của phương trình 2x − y = 4. Giá trị của a là:', ['3', '1', '−1', '6'], { B: 'E-PT2-03', C: 'E-PT2-02', D: 'E-PT2-02' }),
  Q('C1-B1-M2-Q16', 4, 'Đường thẳng biểu diễn tập nghiệm của phương trình ax + by = 6 đi qua hai điểm (2; 0) và (0; 3). Giá trị của a và b là:', ['a = 3, b = 2', 'a = 2, b = 3', 'a = 2, b = 0', 'a = 6, b = 6'], e3('E-PT2-03')),
  // ---------- C1-B1-M3
  Q('C1-B1-M3-Q09', 1, 'Cặp số nào là nghiệm của hệ { x + y = 4; x − y = 2 }?', ['(3; 1)', '(1; 3)', '(2; 2)', '(4; 0)'], e3('E-HPT-01')),
  Q('C1-B1-M3-Q10', 1, 'Hệ hai phương trình bậc nhất hai ẩn có dạng:', ['{ ax + by = c; a′x + b′y = c′ }', '{ ax² + by = c; a′x + b′y² = c′ }', '{ axy = c; a′x + b′y = c′ }', '{ a/x + b/y = c; a′x + b′y = c′ }'], e3('E-HPT-01')),
  Q('C1-B1-M3-Q11', 2, 'Cặp số (2; −1) là nghiệm của hệ nào?', ['{ x + y = 1; x − y = 3 }', '{ x + y = 1; 2x + y = 5 }', '{ x − y = 3; x + 2y = 2 }', '{ 2x + y = 3; x + y = 3 }'], e3('E-HPT-01')),
  Q('C1-B1-M3-Q12', 2, 'Cặp số (1; 1) thoả mãn phương trình x + y = 2 nhưng không thoả mãn phương trình 2x − y = 3. Với hệ { x + y = 2; 2x − y = 3 }, khẳng định đúng là:', ['(1; 1) không phải là nghiệm của hệ', '(1; 1) là nghiệm của hệ', 'Hệ vô nghiệm', 'Hệ có vô số nghiệm'], e3('E-HPT-01')),
  Q('C1-B1-M3-Q13', 3, 'Tìm m để cặp số (1; 2) là nghiệm của hệ { mx + y = 5; 2x − y = 0 }.', ['m = 3', 'm = 5', 'm = 1', 'Không có giá trị nào của m'], e3('E-HPT-01')),
  Q('C1-B1-M3-Q14', 3, 'Cặp số (a; 1) là nghiệm của hệ { x + 2y = 5; 2x − y = b }. Giá trị của a và b là:', ['a = 3, b = 5', 'a = 3, b = 7', 'a = 5, b = 9', 'a = 1, b = 1'], e3('E-HPT-01')),
  Q('C1-B1-M3-Q15', 4, 'Hai đường thẳng 3x + y = 7 và x − y = 1 cắt nhau tại điểm:', ['(2; 1)', '(1; 2)', '(2; −1)', '(3; −2)'], e3('E-HPT-01')),
  Q('C1-B1-M3-Q16', 4, 'Lớp 9B có 35 học sinh, số học sinh nữ nhiều hơn số học sinh nam 5 em. Gọi số học sinh nam là x, số học sinh nữ là y. Hệ phương trình và nghiệm (x; y) là:', ['{ x + y = 35; y − x = 5 }, nghiệm (15; 20)', '{ x + y = 35; x − y = 5 }, nghiệm (20; 15)', '{ x + y = 35; y − x = 5 }, nghiệm (20; 15)', '{ x + y = 5; y − x = 35 }, nghiệm (15; 20)'], { B: 'E-BTH-02', C: 'E-HPT-01', D: 'E-BTH-02' }),
  // ---------- C1-B2-M1
  Q('C1-B2-M1-Q09', 1, 'Từ phương trình 2x + y = 7, rút y theo x được:', ['y = 7 − 2x', 'y = 2x − 7', 'y = 7 + 2x', 'y = (7 − x)/2'], e3('E-HPT-02')),
  Q('C1-B2-M1-Q10', 1, 'Nghiệm của hệ { x = 3; x + y = 5 } là:', ['(3; 2)', '(2; 3)', '(3; 5)', '(5; 3)'], e3('E-HPT-04')),
  Q('C1-B2-M1-Q11', 2, 'Thế x = 2y + 1 vào phương trình 3x − y = 8, ta được:', ['3(2y + 1) − y = 8', '6y + 1 − y = 8', '3 · 2y + 1 − y = 8', '3x − (2y + 1) = 8'], e3('E-HPT-02')),
  Q('C1-B2-M1-Q12', 2, 'Nghiệm của hệ { y = 2x; x + y = 9 } là:', ['(3; 6)', '(6; 3)', '(2; 4)', '(4; 5)'], e3('E-HPT-02')),
  Q('C1-B2-M1-Q13', 2, 'Nghiệm của hệ { x − y = 2; 2x + y = 7 } là:', ['(3; 1)', '(1; 3)', '(3; −1)', '(2; 0)'], e3('E-HPT-02')),
  Q('C1-B2-M1-Q14', 3, 'Hệ { x + 2y = 3; 2x + 4y = 5 } có:', ['Vô nghiệm', 'Vô số nghiệm', 'Nghiệm duy nhất (1; 1)', 'Nghiệm duy nhất (3; 0)'], e3('E-HPT-04')),
  Q('C1-B2-M1-Q15', 4, 'Nghiệm của hệ { 2x − 3y = 1; x + 4y = 6 } là:', ['(2; 1)', '(1; 2)', '(−2; 1)', '(10; −1)'], e3('E-HPT-02')),
  Q('C1-B2-M1-Q16', 4, 'Hệ { x − 2y = 1; 2x − 4y = m } có vô số nghiệm khi:', ['m = 2', 'm = 1', 'm ≠ 2', 'm = 0'], e3('E-HPT-04')),
  // ---------- C1-B2-M2
  Q('C1-B2-M2-Q09', 1, 'Cộng từng vế hai phương trình của hệ { 2x + y = 5; x − y = 1 }, ta được:', ['3x = 6', '3x = 4', 'x = 6', '3x + 2y = 6'], e3('E-HPT-03')),
  Q('C1-B2-M2-Q10', 1, 'Nghiệm của hệ { x + y = 5; x − y = 3 } là:', ['(4; 1)', '(1; 4)', '(8; −3)', '(2; 3)'], e3('E-HPT-03')),
  Q('C1-B2-M2-Q11', 2, 'Trừ từng vế phương trình thứ nhất cho phương trình thứ hai của hệ { 2x + 3y = 13; 2x − y = 1 }, ta được:', ['4y = 12', '2y = 12', '4y = 14', '4x + 2y = 14'], e3('E-HPT-03')),
  Q('C1-B2-M2-Q12', 2, 'Nghiệm của hệ { 2x + 3y = 13; 2x − y = 1 } là:', ['(2; 3)', '(3; 2)', '(2; −3)', '(5; 1)'], e3('E-HPT-03')),
  Q('C1-B2-M2-Q13', 2, 'Để khử ẩn y trong hệ { 3x + 2y = 7; 5x − y = 3 }, ta nhân hai vế phương trình thứ hai với số nào rồi cộng từng vế với phương trình thứ nhất?', ['2', '−2', '3', '7'], e3('E-HPT-03')),
  Q('C1-B2-M2-Q14', 3, 'Nghiệm của hệ { 3x + 2y = 7; 5x − y = 3 } là:', ['(1; 2)', '(2; 1)', '(1; −2)', '(−1; 5)'], e3('E-HPT-03')),
  Q('C1-B2-M2-Q15', 3, 'Nghiệm của hệ { 2x + 3y = 1; 3x − 2y = 8 } là:', ['(2; −1)', '(−1; 2)', '(2; 1)', '(−2; 5/3)'], { B: 'E-HPT-03', C: 'E-HPT-03', D: 'E-HPT-04' }),
  Q('C1-B2-M2-Q16', 4, 'Nghiệm của hệ { 0,3x + 0,5y = 3; 1,5x − 2y = 1,5 } là:', ['(5; 3)', '(3; 5)', '(5; −3)', '(10; 0)'], { B: 'E-HPT-03', C: 'E-HPT-03', D: 'E-HPT-04' }),
  // ---------- C1-B3-M1
  Q('C1-B3-M1-Q09', 1, 'Hai số có hiệu bằng 6. Gọi số lớn là x, số nhỏ là y. Phương trình đúng là:', ['x − y = 6', 'y − x = 6', 'x + y = 6', 'x = 6y'], e3('E-BTH-02')),
  Q('C1-B3-M1-Q10', 1, 'Gọi số cây bạn An trồng được là x. Điều kiện thích hợp của x là:', ['x ∈ ℕ', 'x ∈ ℝ', 'x < 0', 'x là một phân số'], e3('E-BTH-01')),
  Q('C1-B3-M1-Q11', 2, 'Số thứ nhất gấp 3 lần số thứ hai. Gọi số thứ nhất là x, số thứ hai là y. Phương trình đúng là:', ['x = 3y', 'y = 3x', 'x − y = 3', 'x + 3 = y'], e3('E-BTH-02')),
  Q('C1-B3-M1-Q12', 2, 'Hai số có tổng bằng 40, số thứ nhất gấp 3 lần số thứ hai. Số thứ nhất và số thứ hai lần lượt là:', ['30 và 10', '10 và 30', '37 và 3', '20 và 20'], e3('E-BTH-02')),
  Q('C1-B3-M1-Q13', 2, 'Mua 2 kg táo và 3 kg cam hết 170 000 đồng; mua 3 kg táo và 2 kg cam hết 180 000 đồng. Gọi giá 1 kg táo là x, giá 1 kg cam là y (đồng). Hệ phương trình là:', ['{ 2x + 3y = 170 000; 3x + 2y = 180 000 }', '{ 2x + 3y = 180 000; 3x + 2y = 170 000 }', '{ 2x + 2y = 170 000; 3x + 3y = 180 000 }', '{ 5x = 170 000; 5y = 180 000 }'], e3('E-BTH-02')),
  Q('C1-B3-M1-Q14', 3, 'Mua 2 kg táo và 3 kg cam hết 170 000 đồng; mua 3 kg táo và 2 kg cam hết 180 000 đồng. Giá 1 kg táo là:', ['40 000 đồng', '30 000 đồng', '70 000 đồng', '35 000 đồng'], e3('E-BTH-02')),
  Q('C1-B3-M1-Q15', 3, 'Một số có hai chữ số, chữ số hàng chục gấp đôi chữ số hàng đơn vị và tổng hai chữ số bằng 9. Số đó là:', ['63', '36', '93', '81'], e3('E-BTH-02')),
  Q('C1-B3-M1-Q16', 4, 'Một mảnh vườn hình chữ nhật có chu vi 46 m. Nếu tăng chiều rộng thêm 3 m và giảm chiều dài 2 m thì mảnh vườn trở thành hình vuông. Diện tích mảnh vườn ban đầu là:', ['126 m²', '144 m²', '23 m²', '46 m²'], { B: 'E-BTH-02', C: 'E-BTH-01', D: 'E-BTH-01' }),
  // ---------- C1-B3-M1B
  Q('C1-B3-M1B-Q09', 1, 'Ca nô có vận tốc riêng x km/h, vận tốc dòng nước y km/h. Vận tốc của ca nô khi ngược dòng là:', ['x − y (km/h)', 'x + y (km/h)', 'y − x (km/h)', 'x · y (km/h)'], e3('E-BTH-03')),
  Q('C1-B3-M1B-Q10', 1, 'Một xe đi quãng đường 120 km với vận tốc 40 km/h. Thời gian xe đi là:', ['3 giờ', '80 giờ', '160 giờ', '4 800 giờ'], e3('E-BTH-03')),
  Q('C1-B3-M1B-Q11', 2, 'Hai xe khởi hành cùng lúc từ hai địa điểm cách nhau 150 km, đi ngược chiều và gặp nhau sau 1,5 giờ. Tổng vận tốc của hai xe là:', ['100 km/h', '225 km/h', '75 km/h', '150 km/h'], e3('E-BTH-03')),
  Q('C1-B3-M1B-Q12', 2, 'Một ca nô xuôi dòng với vận tốc 28 km/h, ngược dòng với vận tốc 22 km/h. Vận tốc riêng của ca nô là:', ['25 km/h', '3 km/h', '50 km/h', '6 km/h'], e3('E-BTH-03')),
  Q('C1-B3-M1B-Q13', 2, 'Xe thứ nhất đi trong 3 giờ và xe thứ hai đi trong 2 giờ thì tổng quãng đường hai xe đi được là 260 km. Gọi vận tốc xe thứ nhất, xe thứ hai lần lượt là x, y (km/h). Phương trình đúng là:', ['3x + 2y = 260', '2x + 3y = 260', '5(x + y) = 260', 'x + y = 260'], e3('E-BTH-03')),
  Q('C1-B3-M1B-Q14', 3, 'Hai xe khởi hành cùng lúc từ hai địa điểm cách nhau 150 km, đi ngược chiều và gặp nhau sau 1,5 giờ; xe thứ nhất nhanh hơn xe thứ hai 10 km/h. Vận tốc xe thứ hai là:', ['45 km/h', '55 km/h', '50 km/h', '90 km/h'], e3('E-BTH-03')),
  Q('C1-B3-M1B-Q15', 3, 'Một ca nô xuôi dòng trong 3 giờ được 81 km, ngược dòng trong 2 giờ được 42 km. Vận tốc dòng nước là:', ['3 km/h', '24 km/h', '6 km/h', '21 km/h'], e3('E-BTH-03')),
  Q('C1-B3-M1B-Q16', 4, 'Một người đi từ A đến B. Nếu đi với vận tốc 40 km/h thì đến muộn 1 giờ so với dự định; nếu đi với vận tốc 60 km/h thì đến sớm 1 giờ. Quãng đường AB dài:', ['240 km', '120 km', '200 km', '100 km'], { B: 'E-BTH-03', C: 'E-BTH-02', D: 'E-BTH-02' }),
  // ---------- C1-B3-M1C
  Q('C1-B3-M1C-Q09', 1, 'Một vòi nước chảy riêng thì đầy bể trong 5 giờ. Trong 2 giờ, vòi chảy được:', ['2/5 bể', '5/2 bể', '1/5 bể', '10 bể'], e3('E-BTH-04')),
  Q('C1-B3-M1C-Q10', 1, 'Hai đội cùng làm thì mỗi ngày làm được 1/8 công việc. Hai đội cùng làm thì xong công việc trong:', ['8 ngày', '1/8 ngày', '16 ngày', '4 ngày'], e3('E-BTH-04')),
  Q('C1-B3-M1C-Q11', 2, 'Đội I làm một mình xong việc trong 10 ngày, đội II trong 15 ngày. Một ngày cả hai đội cùng làm được:', ['1/6 công việc', '1/25 công việc', '25 công việc', '2/25 công việc'], e3('E-BTH-04')),
  Q('C1-B3-M1C-Q12', 2, 'Đội I làm một mình xong việc trong 10 ngày, đội II trong 15 ngày. Hai đội cùng làm thì xong việc trong:', ['6 ngày', '25 ngày', '12,5 ngày', '5 ngày'], e3('E-BTH-04')),
  Q('C1-B3-M1C-Q13', 2, 'Theo kế hoạch tổ I làm x sản phẩm. Thực tế tổ I vượt mức 15%. Số sản phẩm thực tế tổ I làm được là:', ['1,15x', '0,15x', 'x + 15', '15x'], e3('E-BTH-04')),
  Q('C1-B3-M1C-Q14', 3, 'Hai vòi nước cùng chảy thì đầy bể sau 6 giờ. Nếu vòi I chảy 2 giờ và vòi II chảy 3 giờ thì được 2/5 bể. Gọi thời gian vòi I, vòi II chảy riêng đầy bể lần lượt là x, y (giờ). Hệ phương trình đúng là:', ['{ 1/x + 1/y = 1/6; 2/x + 3/y = 2/5 }', '{ x + y = 6; 2x + 3y = 2/5 }', '{ 1/x + 1/y = 6; 2/x + 3/y = 2/5 }', '{ 1/x + 1/y = 1/6; 2x + 3y = 2/5 }'], e3('E-BTH-04')),
  Q('C1-B3-M1C-Q15', 3, 'Hai vòi nước cùng chảy thì đầy bể sau 6 giờ. Nếu vòi I chảy 2 giờ và vòi II chảy 3 giờ thì được 2/5 bể. Thời gian vòi I chảy riêng đầy bể là:', ['10 giờ', '15 giờ', '6 giờ', '12 giờ'], e3('E-BTH-04')),
  Q('C1-B3-M1C-Q16', 4, 'Theo kế hoạch, hai tổ sản xuất 900 sản phẩm. Thực tế tổ I vượt mức 20%, tổ II vượt mức 15% nên làm được 1 055 sản phẩm. Số sản phẩm theo kế hoạch của tổ II là:', ['500', '400', '575', '480'], e3('E-BTH-04'))
];

const HINH = {};

export const QUESTIONS = [...CAU_GOC, ...CAU_MOI]
  .map((q) => (HINH[q.id] ? { ...q, hinh: HINH[q.id] } : q))
  .sort((a, b) => a.id.localeCompare(b.id));

/* ---------------------------------------------------------------- GỢI Ý 3 TẦNG */
export const HINTS = {
  'E-PT2-01': ['Mỗi hạng tử chứa ẩn có đúng một ẩn với số mũ 1 không? Có ẩn nằm ở mẫu không?', 'Phương trình bậc nhất hai ẩn có dạng ax + by = c, trong đó a ≠ 0 hoặc b ≠ 0 (chỉ cần một hệ số khác 0). Các hạng tử xy, x², 1/x đều không phải bậc nhất.', 'Ví dụ: 0x + 4y = 8 là phương trình bậc nhất hai ẩn (b = 4 ≠ 0); xy + 2 = 0 thì không.'],
  'E-PT2-02': ['Trong cặp số (x0; y0), số nào thay cho x, số nào thay cho y?', 'Số đứng trước trong cặp là giá trị của x, số đứng sau là giá trị của y. Thay đúng vị trí, đặt số âm trong ngoặc rồi tính hai vế.', 'Ví dụ: (1; 2) với x + 2y = 5: 1 + 2·2 = 5, đúng, nên (1; 2) là nghiệm.'],
  'E-PT2-03': ['Chọn x = 0, x = 1, x = 2 thì mỗi lần có tìm được y không? Vậy có bao nhiêu nghiệm?', 'Phương trình bậc nhất hai ẩn có vô số nghiệm; tập nghiệm là một đường thẳng. Khi a = 0: y = c/b, đường thẳng song song Ox; khi b = 0: x = c/a, song song Oy.', 'Ví dụ: 0x + 2y = 4 ⇔ y = 2, đường thẳng song song với trục Ox, cắt Oy tại (0; 2).'],
  'E-HPT-01': ['Cặp số này đã thoả phương trình thứ hai chưa, hay mới thoả phương trình thứ nhất?', 'Nghiệm của hệ phải là nghiệm chung của cả hai phương trình. Thay cặp số vào lần lượt từng phương trình; chỉ cần một phương trình sai là không phải nghiệm của hệ.', 'Ví dụ: (3; 0) thoả x + y = 3 nhưng 3 − 0 = 3 ≠ 1 nên không phải nghiệm của hệ x + y = 3, x − y = 1.'],
  'E-HPT-02': ['Khi thế một biểu thức vào chỗ của y, em đã đặt biểu thức đó trong ngoặc chưa?', 'Rút một ẩn rồi thay cả biểu thức (đặt trong ngoặc) vào phương trình còn lại; khi bỏ ngoặc có dấu "−" đứng trước thì đổi dấu mọi hạng tử. Chuyển vế phải đổi dấu.', 'Ví dụ: thế y = 3 − x vào 2x − y = 0: 2x − (3 − x) = 0 ⇔ 3x = 3 ⇔ x = 1.'],
  'E-HPT-03': ['Khi nhân một phương trình với một số, em đã nhân với mọi hạng tử ở cả hai vế chưa?', 'Nhân hai vế với cùng một số: nhân mọi hạng tử. Chọn số nhân sao cho hệ số của một ẩn bằng nhau (rồi trừ) hoặc đối nhau (rồi cộng). Trừ từng vế thì đổi dấu mọi hạng tử của phương trình bị trừ.', 'Ví dụ: 2x − y = 3 nhân 3 được 6x − 3y = 9, không phải 6x − y = 9.'],
  'E-HPT-04': ['Phương trình 0y = 2 có số y nào thoả mãn không? Còn 0y = 0 thì sao?', 'Gặp 0x = c: nếu c ≠ 0 thì hệ vô nghiệm; nếu c = 0 thì hệ có vô số nghiệm. Tìm được một ẩn thì phải thay lại để tìm ẩn kia rồi mới kết luận cặp nghiệm.', 'Ví dụ: hệ x + y = 3, x + y = 5 dẫn đến 0y = 2, không có y nào thoả nên hệ vô nghiệm.'],
  'E-BTH-01': ['Ẩn em chọn chỉ đại lượng gì, đơn vị gì? Nó có thể là số âm hay số lẻ không?', 'Chọn ẩn: ghi rõ đại lượng và đơn vị. Đặt điều kiện theo thực tế (số người là số tự nhiên khác 0, độ dài dương…). Giải xong phải đối chiếu điều kiện rồi mới trả lời.', 'Ví dụ: gọi số học sinh nam là x (em), điều kiện x ∈ ℕ*, x < 40.'],
  'E-BTH-02': ['Câu nào trong đề cho em phương trình thứ nhất, câu nào cho phương trình thứ hai?', 'Dịch từng câu: "tổng" → cộng; "hơn … là a" → hiệu bằng a; "gấp k lần" → nhân k; chu vi hình chữ nhật = 2(dài + rộng). Kiểm tra lại bằng cách thay nghiệm vào lời văn.', 'Ví dụ: chu vi 34 m, dài hơn rộng 7 m: 2(x + y) = 34 tức x + y = 17, và x − y = 7.'],
  'E-BTH-03': ['Quãng đường bằng vận tốc nhân với gì? Dòng nước giúp hay cản ca nô khi xuôi dòng?', 's = v·t, t = s/v. Xuôi dòng: v + vnước; ngược dòng: v − vnước. Hai xe đi ngược chiều gặp nhau: tổng quãng đường hai xe đi được bằng khoảng cách ban đầu.', 'Ví dụ: hai xe gặp nhau sau 2 giờ trên quãng 180 km: 2x + 2y = 180.'],
  'E-BTH-04': ['Trong 1 giờ, mỗi vòi chảy được bao nhiêu phần bể? Cùng chảy thì cộng thời gian hay cộng phần bể?', 'Làm xong việc trong x đơn vị thời gian thì năng suất là 1/x công việc mỗi đơn vị. Làm chung: cộng năng suất, 1/x + 1/y = 1/t. Đổi giờ – phút về cùng đơn vị trước khi lập phương trình.', 'Ví dụ: vòi A 4 giờ, vòi B 6 giờ: 1/4 + 1/6 = 5/12 bể mỗi giờ, nên cùng chảy đầy bể sau 12/5 = 2,4 giờ.']
};

/* ---------------------------------------------------------------- VI BÀI HỌC */
const V = (dan, quyTac, viDu, tuLam) => ({ dan, quyTac, viDu: viDu.map(([de, giai]) => ({ de, giai })), tuLam: tuLam.map(([de, dapAn, giaiThich]) => ({ de, dapAn, giaiThich })) });
export const VI_BAI_HOC = {
  'VBH-PT2-01': V('Phương trình bậc nhất hai ẩn có một "khuôn" rất rõ. Nhìn đúng khuôn là nhận ra ngay.',
    'Dạng ax + by = c với a, b, c là số đã biết và a ≠ 0 hoặc b ≠ 0. Mỗi hạng tử chứa ẩn chỉ có một ẩn, số mũ 1, không nằm ở mẫu.',
    [['xy + 2 = 0 có phải phương trình bậc nhất hai ẩn?', 'Cách nghĩ sai: có hai ẩn x, y nên đúng. Cách đúng: hạng tử xy chứa hai ẩn nhân nhau (bậc 2), nên không phải.'],
     ['0x + 4y = 8 có phải phương trình bậc nhất hai ẩn?', 'Có: a = 0 nhưng b = 4 ≠ 0.']],
    [['3x − y = 2 có phải phương trình bậc nhất hai ẩn?', 'Có', 'a = 3, b = −1.'],
     ['x² + y = 4 có phải không?', 'Không', 'Có x².']]),
  'VBH-PT2-02': V('Kiểm tra nghiệm chỉ là "thay số rồi tính" — nhưng thay nhầm chỗ là sai cả bài.',
    'Cặp (x0; y0): số đứng trước thay cho x, số đứng sau thay cho y. Đặt số âm trong ngoặc. Hai vế bằng nhau thì là nghiệm.',
    [['(1; 2) có là nghiệm của x + 2y = 5?', 'Cách nghĩ sai: thay 2 + 2·1 = 4 ≠ 5 nên không. Cách đúng: x = 1, y = 2: 1 + 2·2 = 5, là nghiệm.'],
     ['Tìm m để (1; 2) là nghiệm của mx + y = 5.', 'm·1 + 2 = 5 ⇔ m = 3.']],
    [['(2; −1) có là nghiệm của 3x + 2y = 4?', 'Có', '6 + 2·(−1) = 4.'],
     ['(0; 5) có là nghiệm của x + 2y = 5?', 'Không', '0 + 10 = 10.']]),
  'VBH-PT2-03': V('Một phương trình bậc nhất hai ẩn không có "một đáp số" — nó có cả một đường thẳng nghiệm.',
    'Cho x một giá trị bất kì luôn tìm được y, nên có vô số nghiệm; nghiệm tổng quát (x; y theo x). Tập nghiệm là đường thẳng ax + by = c: a = 0 → y = c/b song song Ox; b = 0 → x = c/a song song Oy.',
    [['Biểu diễn tập nghiệm của 0x + 2y = 4.', 'Cách nghĩ sai: đường thẳng x = 2. Cách đúng: 2y = 4 ⇔ y = 2, đường thẳng song song với Ox, cắt Oy tại (0; 2).'],
     ['Viết nghiệm tổng quát của x + y = 3.', 'y = 3 − x, nghiệm tổng quát (x; 3 − x), x ∈ ℝ.']],
    [['3x + 0y = 6 biểu diễn bởi đường thẳng nào?', 'x = 2', 'b = 0, song song Oy.'],
     ['x − y = 1 có bao nhiêu nghiệm?', 'Vô số', 'Mỗi x cho một y.']]),
  'VBH-HPT-01': V('Nghiệm của hệ phải "qua được hai cửa": cả hai phương trình.',
    'Cặp (x0; y0) là nghiệm của hệ khi nó là nghiệm của cả hai phương trình. Thay vào phương trình thứ nhất, rồi thay vào phương trình thứ hai.',
    [['(3; 0) có là nghiệm của hệ x + y = 3, x − y = 1?', 'Cách nghĩ sai: 3 + 0 = 3 đúng nên là nghiệm. Cách đúng: còn phương trình thứ hai 3 − 0 = 3 ≠ 1, nên không phải nghiệm của hệ.'],
     ['(2; 1) có là nghiệm của hệ trên?', '2 + 1 = 3 và 2 − 1 = 1, đúng cả hai: là nghiệm.']],
    [['(1; 2) có là nghiệm của hệ x + y = 3, 2x − y = 0?', 'Có', '3 = 3 và 0 = 0.'],
     ['(1; 0) có là nghiệm của hệ x + y = 3, x − y = 1?', 'Không', '1 + 0 ≠ 3.']]),
  'VBH-HPT-02': V('Phương pháp thế hay sai ở đúng một chỗ: quên ngoặc khi thế.',
    'Rút một ẩn từ phương trình đơn giản (chuyển vế nhớ đổi dấu), thay cả biểu thức trong ngoặc vào phương trình còn lại, giải phương trình một ẩn, rồi thay ngược để tìm ẩn kia.',
    [['Thế y = 3 − x vào 2x − y = 0.', 'Cách nghĩ sai: 2x − 3 − x = 0. Cách đúng: 2x − (3 − x) = 0 ⇔ 2x − 3 + x = 0 ⇔ x = 1, y = 2.'],
     ['Giải hệ y = x + 1, 2x + y = 7.', '2x + (x + 1) = 7 ⇔ x = 2, y = 3.']],
    [['Từ x − 3y = 2 rút x.', 'x = 2 + 3y', 'Chuyển −3y sang vế phải thành +3y.'],
     ['Giải hệ x = 2y, x + y = 6.', '(4; 2)', '3y = 6.']]),
  'VBH-HPT-03': V('Cộng đại số nhanh, nhưng nhân thiếu một hạng tử là lệch cả hệ.',
    'Nhân hai vế của phương trình với cùng một số: nhân mọi hạng tử. Hệ số của một ẩn bằng nhau thì trừ từng vế, đối nhau thì cộng từng vế. Trừ thì đổi dấu mọi hạng tử bị trừ.',
    [['Nhân 2x − y = 3 với 3.', 'Cách nghĩ sai: 6x − y = 9. Cách đúng: 6x − 3y = 9.'],
     ['Giải hệ x + y = 7, x − y = 1.', 'Cộng từng vế: 2x = 8 ⇔ x = 4, y = 3.']],
    [['Trừ từng vế 3x + 2y = 7 cho x + 2y = 5.', '2x = 2', 'y bị khử.'],
     ['Giải hệ 3x + 2y = 1, 2x − 3y = 5.', '(1; −1)', 'Nhân 3 và 2 rồi cộng: 13x = 13.']]),
  'VBH-HPT-04': V('Có hệ không có nghiệm, có hệ nghiệm "nhiều vô kể". Đọc đúng dấu hiệu là kết luận đúng.',
    'Khi biến đổi được 0x = c: c ≠ 0 thì hệ vô nghiệm, c = 0 thì hệ có vô số nghiệm. Hệ có nghiệm duy nhất thì phải ghi đủ cặp (x; y).',
    [['Hệ x + y = 3, x + y = 5 dẫn đến 0y = 2.', 'Cách nghĩ sai: y = 0. Cách đúng: không có y nào để 0·y = 2, hệ vô nghiệm.'],
     ['Hệ x − y = 1, 2x − 2y = 2.', 'Phương trình thứ hai gấp đôi phương trình thứ nhất: vô số nghiệm (x; x − 1).']],
    [['0x = 0 thì hệ có bao nhiêu nghiệm?', 'Vô số', 'Mọi x đều thoả.'],
     ['0x = 5 thì sao?', 'Vô nghiệm', 'Không x nào thoả.']]),
  'VBH-BTH-01': V('Bước chọn ẩn tưởng đơn giản nhưng quyết định cả lời giải có hợp lí hay không.',
    'Chọn ẩn: ghi rõ đại lượng và đơn vị. Đặt điều kiện theo thực tế (số người: số tự nhiên khác 0; độ dài, vận tốc: số dương; nhỏ hơn tổng nếu có). Cuối bài đối chiếu điều kiện.',
    [['Gọi số học sinh nam là x trong lớp 40 em.', 'Cách nghĩ sai: x ∈ ℝ. Cách đúng: x ∈ ℕ*, x < 40.'],
     ['Giải ra chiều rộng âm thì sao?', 'Không thoả điều kiện, loại nghiệm đó.']],
    [['Ẩn là vận tốc (km/h), điều kiện?', 'x > 0', 'Vận tốc dương.'],
     ['Ẩn là số sản phẩm, điều kiện?', 'x ∈ ℕ', 'Số sản phẩm là số tự nhiên.']]),
  'VBH-BTH-02': V('Lời văn có "từ khoá". Dịch từng câu sang ngôn ngữ toán là lập được hệ.',
    '"Tổng" → cộng; "hơn a" → hiệu bằng a; "gấp k lần" → nhân k; chu vi hình chữ nhật = 2(dài + rộng); tăng 10% → nhân 1,1. Lập xong thì thử nghiệm vào lời văn.',
    [['Chu vi 34 m, dài hơn rộng 7 m.', 'Cách nghĩ sai: x + y = 34. Cách đúng: 2(x + y) = 34 ⇔ x + y = 17; x − y = 7.'],
     ['Tổ I vượt mức 10% so với kế hoạch x.', 'Thực tế tổ I làm 1,1x sản phẩm.']],
    [['Số lớn hơn số nhỏ 8 (x lớn, y nhỏ)?', 'x − y = 8', 'Hiệu bằng 8.'],
     ['Tổng hai số 50?', 'x + y = 50', 'Cộng.']]),
  'VBH-BTH-03': V('Mọi bài chuyển động đều quay về một công thức: s = v·t.',
    's = v·t, t = s/v, v = s/t. Xuôi dòng: v + vnước; ngược dòng: v − vnước. Ngược chiều gặp nhau: tổng quãng đường = khoảng cách ban đầu.',
    [['Hai xe cách 180 km đi ngược chiều, gặp nhau sau 2 giờ.', 'Cách nghĩ sai: x + y = 180. Cách đúng: mỗi xe đi 2 giờ: 2x + 2y = 180.'],
     ['Xuôi 30 km/h, ngược 24 km/h.', 'x + y = 30, x − y = 24 nên vnước = 3 km/h.']],
    [['Đi 15 km/h hết 2 giờ được bao xa?', '30 km', 's = v·t.'],
     ['Vận tốc riêng 20, nước 3, ngược dòng?', '17 km/h', '20 − 3.']]),
  'VBH-BTH-04': V('Hai người làm chung thì nhanh hơn — nên không thể cộng thời gian.',
    'Làm xong việc trong x đơn vị thời gian → mỗi đơn vị làm được 1/x công việc. Làm chung: cộng năng suất: 1/x + 1/y = 1/t. Đổi 2 giờ 24 phút = 2,4 giờ = 12/5 giờ.',
    [['Vòi A 4 giờ, vòi B 6 giờ, cùng chảy?', 'Cách nghĩ sai: 4 + 6 = 10 giờ. Cách đúng: 1/4 + 1/6 = 5/12 bể/giờ, đầy bể sau 12/5 = 2,4 giờ.'],
     ['Cùng làm 12 ngày xong việc.', 'Năng suất chung 1/12 công việc mỗi ngày.']],
    [['Làm xong trong 5 ngày, mỗi ngày làm?', '1/5 công việc', 'Năng suất.'],
     ['Hai đội 1/10 và 1/15 mỗi ngày, cùng làm?', '6 ngày', '1/10 + 1/15 = 1/6.']])
};

/* ---------------------------------------------------------------- ĐỒ THỊ LỖI GỐC */
export const ERROR_NODES = LOI.map((e) => ({ id: e.code, name: e.ten, role: e.role, kuId: e.ku, cluster: e.cluster }));
export const CAUSAL_EDGES = [
  { from: 'E-PT2-01', to: 'E-PT2-03', weight: 0.5, reason: 'Không nắm dạng ax + by = c nên biểu diễn tập nghiệm sai khi a hoặc b bằng 0' },
  { from: 'E-PT2-02', to: 'E-HPT-01', weight: 0.6, reason: 'Thay nghiệm cẩu thả nên chỉ kiểm tra một phương trình' },
  { from: 'E-PT2-03', to: 'E-HPT-04', weight: 0.55, reason: 'Không hiểu vô số nghiệm của một phương trình nên kết luận số nghiệm của hệ sai' },
  { from: 'E-HPT-01', to: 'E-HPT-04', weight: 0.5, reason: 'Chưa hiểu nghiệm của hệ là nghiệm chung nên kết luận thiếu ẩn' },
  { from: 'E-HPT-02', to: 'E-HPT-04', weight: 0.45, reason: 'Thế sai dấu dẫn đến 0x = c sai, kết luận sai' },
  { from: 'E-HPT-03', to: 'E-HPT-04', weight: 0.45, reason: 'Cộng, trừ đại số sai dẫn đến kết luận nghiệm sai' },
  { from: 'E-BTH-01', to: 'E-BTH-02', weight: 0.6, reason: 'Chọn ẩn không rõ đại lượng nên dịch lời văn sai' },
  { from: 'E-BTH-02', to: 'E-BTH-03', weight: 0.55, reason: 'Dịch lời văn sai nên lập phương trình chuyển động sai' },
  { from: 'E-BTH-02', to: 'E-BTH-04', weight: 0.55, reason: 'Dịch lời văn sai nên lập phương trình năng suất sai' }
];
export const ROOT_ERROR_IDS = ['E-PT2-01', 'E-BTH-01'];

/* ---------------------------------------------------------------- HOẠT ĐỘNG */
const NHAP = 'Bản nháp do trợ lý AI soạn theo từ điển mã lỗi — giáo viên cần duyệt, sửa trước khi dùng';
const A = (id, ten, errorCodes, nhom, hinhThuc, mucNhanThuc, phut, moTa, hocLieu) => ({ id, ten, errorCodes, nhom, hinhThuc, mucNhanThuc, phut, moTa, hocLieu, trangThai: 'nhap', nguon: NHAP });
export const ACTIVITIES = [
  A('HD-PT2-01', 'Thẻ phương trình: đúng khuôn hay không?', ['E-PT2-01', 'E-PT2-03'], ['loi'], 'nhom-dong-chat', 1, [6, 8],
    'Nhóm nhận 10 thẻ phương trình, xếp vào hai cột "bậc nhất hai ẩn" và "không phải", ghi a, b, c; với mỗi phương trình có a = 0 hoặc b = 0, vẽ nhanh đường thẳng nghiệm lên giấy kẻ ô.', '10 thẻ phương trình, giấy kẻ ô'),
  A('HD-HPT-01', 'Hai cửa kiểm tra', ['E-PT2-02', 'E-HPT-01'], ['loi'], 'ca-lop', 1, [5, 7],
    'Giáo viên chiếu một hệ và 6 cặp số. Mỗi em giơ thẻ Đ/S cho từng phương trình rồi mới kết luận cặp số có là nghiệm của hệ không.', 'Thẻ Đ/S, slide 6 cặp số'),
  A('HD-HPT-02', 'Thế có ngoặc, cộng đủ hạng tử', ['E-HPT-02', 'E-HPT-03', 'E-HPT-04'], ['loi'], 'nhom-dong-chat', 2, [10, 12],
    'Mỗi nhóm có 4 lời giải mẫu có lỗi cài sẵn (quên ngoặc khi thế, nhân thiếu hạng tử, kết luận 0x = c sai). Nhóm khoanh lỗi, sửa và giải lại bằng cách còn lại để đối chiếu.', '4 lời giải có lỗi'),
  A('HD-BTH-01', 'Dịch đề sang hệ', ['E-BTH-01', 'E-BTH-02'], ['loi'], 'nhom-dong-chat', 2, [10, 12],
    'Nhóm nhận 3 đề bài, gạch chân từ khoá (tổng, hơn, gấp, chu vi, vượt mức), lập bảng "đại lượng – ẩn – điều kiện – phương trình" rồi trao đổi chéo để nhóm khác kiểm tra.', 'Phiếu bảng 4 cột, 3 đề bài'),
  A('HD-BTH-02', 'Sơ đồ chuyển động và bảng năng suất', ['E-BTH-03', 'E-BTH-04'], ['loi'], 'nhom-dong-chat', 3, [10, 15],
    'Nhóm vẽ sơ đồ đoạn thẳng cho bài hai xe gặp nhau và bài ca nô xuôi – ngược dòng; lập bảng năng suất cho bài hai vòi nước. Từ sơ đồ, bảng lập hệ và giải.', 'Giấy A3, 3 đề bài'),
  A('HD-C1-MR', 'Bài toán thực tế của lớp', [], ['san-sang'], 'nhom-dong-chat', 4, [12, 15],
    'Nhóm tự đặt một bài toán giải bằng hệ phương trình từ số liệu thật của lớp (giá đồ dùng, quãng đường đến trường), giải và đổi đề cho nhóm khác giải.', 'Giấy A4')
];
