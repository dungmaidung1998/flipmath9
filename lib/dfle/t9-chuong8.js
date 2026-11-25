/**
 * NỘI DUNG TOÁN 9 — CHƯƠNG VIII. XÁC SUẤT CỦA BIẾN CỐ TRONG MỘT SỐ MÔ HÌNH XÁC SUẤT ĐƠN GIẢN (Kết nối tri thức)
 * BẢN NHÁP do trợ lý AI soạn theo SGK Toán 9 tập hai (Bài 25–26) — giáo viên duyệt trước khi dùng.
 * Kí hiệu: S – mặt sấp, N – mặt ngửa; xúc xắc cân đối 6 mặt.
 */
const SEC = { 1: 45, 2: 60, 3: 90, 4: 120 };
const B25 = 'Bài 25. Phép thử ngẫu nhiên và không gian mẫu';
const B26 = 'Bài 26. Xác suất của biến cố liên quan tới phép thử';
const U = (id, bai, muc, name, order, prerequisite, mucTieu, extra = {}) => ({ id, bai, muc, name, order, prerequisite, mucTieu, ...extra });

export const UNITS = [
  U('C8-B25-M1', B25, 'Mục 1–2', 'Phép thử ngẫu nhiên và không gian mẫu', 120, null,
    'Nhận biết phép thử ngẫu nhiên; liệt kê đầy đủ, không trùng lặp các kết quả có thể (không gian mẫu) bằng liệt kê, bảng, sơ đồ cây.'),
  U('C8-B26-M1', B26, 'Mục 1', 'Biến cố và kết quả thuận lợi cho biến cố', 121, 'C8-B25-M1',
    'Xác định các kết quả thuận lợi cho một biến cố; nhận biết biến cố chắc chắn, biến cố không thể.'),
  U('C8-B26-M2', B26, 'Mục 2', 'Xác suất của biến cố', 122, 'C8-B26-M1',
    'Tính xác suất P(A) = (số kết quả thuận lợi cho A) : (số phần tử của không gian mẫu) khi các kết quả đồng khả năng.')
];

const E = (code, ku, role, cluster, ten, tieuDe, phut, misconception, viDu) =>
  ({ code, ku, role, cluster, ten, tieuDe, phut, misconception, viDu, remediation: 'VBH-' + code.slice(2) });
const LOI = [
  E('E-XS-01', 'C8-B25-M1', 'root', 'Xác suất', 'Liệt kê không gian mẫu thiếu, gộp kết quả', 'Liệt kê đủ, không trùng; SN và NS là hai kết quả khác nhau', 6,
    'Liệt kê không gian mẫu thiếu hoặc thừa kết quả, gộp các kết quả có thứ tự khác nhau (SN với NS) thành một', 'Tung đồng xu hai lần: Ω = {SS; SN; NN}'),
  E('E-XS-02', 'C8-B26-M1', 'mediating', 'Xác suất', 'Xác định kết quả thuận lợi sai', 'Chỉ chọn các phần tử của Ω làm biến cố xảy ra', 5,
    'Liệt kê kết quả thuận lợi có cả giá trị nằm ngoài không gian mẫu, bỏ sót kết quả, hoặc hiểu sai điều kiện của biến cố', 'Số nguyên tố trên xúc xắc: 1; 2; 3; 5'),
  E('E-XS-03', 'C8-B26-M2', 'leaf', 'Xác suất', 'Tính xác suất sai công thức', 'P(A) = n(A) : n(Ω), luôn từ 0 đến 1', 5,
    'Lấy số kết quả thuận lợi làm xác suất, chia cho số loại thay vì số kết quả, hoặc ra xác suất lớn hơn 1', '3 bi đỏ, 5 xanh, 2 vàng: P(không xanh) = 1/3'),
  E('E-XS-04', 'C8-B25-M1', 'leaf', 'Xác suất', 'Đếm số phần tử khi phép thử gồm nhiều bước sai', 'Nhiều bước: nhân số cách mỗi bước; chú ý có/không hoàn lại', 6,
    'Đếm số phần tử của không gian mẫu khi gieo hai xúc xắc, lấy lần lượt có/không hoàn lại, lấy đồng thời sai', 'Gieo hai xúc xắc có 12 kết quả')
];
export const ERRORS = LOI.map(({ code, ku, misconception, viDu, remediation }) => ({ code, ku, misconception, viDu, remediation }));
export const REMEDIATION = Object.fromEntries(LOI.map((e) => [e.remediation, { ku: e.ku, title: e.tieuDe, minutes: e.phut }]));

const Q = (id, level, stem, [A, B, C, D], err, hinh) =>
  ({ id, ku: id.replace(/-Q\d+$/, ''), level, sec: SEC[level], stem, opts: { A, B, C, D }, correct: 'A', err, ...(hinh ? { hinh } : {}) });
const e3 = (c) => ({ B: c, C: c, D: c });

export const QUESTIONS = [
  // ---------- C8-B25-M1
  Q('C8-B25-M1-Q01', 1, 'Gieo một con xúc xắc 6 mặt. Không gian mẫu là:', ['{1; 2; 3; 4; 5; 6}', '{1; 6}', '{6}', '{0; 1; 2; 3; 4; 5; 6}'], e3('E-XS-01')),
  Q('C8-B25-M1-Q02', 1, 'Tung một đồng xu hai lần liên tiếp. Không gian mẫu có số phần tử là:', ['4', '2', '3', '1'], e3('E-XS-01')),
  Q('C8-B25-M1-Q03', 2, 'Tung một đồng xu hai lần liên tiếp. Không gian mẫu là:', ['{SS; SN; NS; NN}', '{SS; SN; NN}', '{S; N}', '{SN; NS}'], e3('E-XS-01')),
  Q('C8-B25-M1-Q04', 2, 'Rút ngẫu nhiên 1 thẻ từ 10 thẻ đánh số 1; 2; …; 10. Không gian mẫu có số phần tử là:', ['10', '1', '9', '11'], e3('E-XS-01')),
  Q('C8-B25-M1-Q05', 3, 'Gieo đồng thời hai con xúc xắc (một xanh, một đỏ). Không gian mẫu có số phần tử là:', ['36', '12', '21', '6'], e3('E-XS-04')),
  Q('C8-B25-M1-Q06', 3, 'Hộp có 1 bi xanh, 1 bi đỏ, 1 bi vàng. Lấy lần lượt 2 viên, không hoàn lại. Không gian mẫu có số phần tử là:', ['6', '9', '3', '4'], e3('E-XS-04')),
  Q('C8-B25-M1-Q07', 4, 'Bạn An chọn ngẫu nhiên một ngày trong tuần và một buổi (sáng hoặc chiều) để đi bơi. Không gian mẫu có số phần tử là:', ['14', '9', '7', '2'], e3('E-XS-04')),
  Q('C8-B25-M1-Q08', 4, 'Túi có 2 bi đỏ Đ1, Đ2 và 1 bi xanh X. Lấy ngẫu nhiên đồng thời 2 viên. Không gian mẫu là:', ['{Đ1Đ2; Đ1X; Đ2X}', '{ĐĐ; ĐX}', '{Đ1Đ2; Đ2Đ1; Đ1X; XĐ1; Đ2X; XĐ2}', '{Đ; X}'], { B: 'E-XS-01', C: 'E-XS-04', D: 'E-XS-01' }),

  // ---------- C8-B26-M1
  Q('C8-B26-M1-Q01', 1, 'Gieo một con xúc xắc. Các kết quả thuận lợi cho biến cố "Mặt xuất hiện có số chấm chẵn" là:', ['2; 4; 6', '1; 3; 5', '2; 4', '6'], e3('E-XS-02')),
  Q('C8-B26-M1-Q02', 1, 'Rút 1 thẻ từ 10 thẻ đánh số 1 đến 10. Các kết quả thuận lợi cho biến cố "Số trên thẻ chia hết cho 3" là:', ['3; 6; 9', '3; 6; 9; 12', '3', '0; 3; 6; 9'], e3('E-XS-02')),
  Q('C8-B26-M1-Q03', 2, 'Gieo một con xúc xắc. Số kết quả thuận lợi cho biến cố "Số chấm xuất hiện là số nguyên tố" là:', ['3', '4', '2', '6'], e3('E-XS-02')),
  Q('C8-B26-M1-Q04', 2, 'Tung một đồng xu hai lần. Các kết quả thuận lợi cho biến cố "Có đúng một lần xuất hiện mặt ngửa" là:', ['SN; NS', 'SN', 'NN; SN; NS', 'NN'], { B: 'E-XS-01', C: 'E-XS-02', D: 'E-XS-02' }),
  Q('C8-B26-M1-Q05', 3, 'Gieo hai con xúc xắc. Số kết quả thuận lợi cho biến cố "Tổng số chấm bằng 7" là:', ['6', '3', '7', '1'], { B: 'E-XS-01', C: 'E-XS-02', D: 'E-XS-02' }),
  Q('C8-B26-M1-Q06', 3, 'Gieo hai con xúc xắc. Số kết quả thuận lợi cho biến cố "Hai mặt có số chấm bằng nhau" là:', ['6', '12', '36', '1'], e3('E-XS-02')),
  Q('C8-B26-M1-Q07', 4, 'Rút 1 thẻ từ 10 thẻ đánh số 1 đến 10. Biến cố "Số trên thẻ lớn hơn 10" là:', ['biến cố không thể', 'biến cố chắc chắn', 'biến cố có 1 kết quả thuận lợi', 'biến cố có 10 kết quả thuận lợi'], e3('E-XS-02')),
  Q('C8-B26-M1-Q08', 4, 'Lớp có 15 bạn nam và 20 bạn nữ. Chọn ngẫu nhiên 1 bạn làm lớp trưởng. Số kết quả thuận lợi cho biến cố "Chọn được bạn nữ" là:', ['20', '15', '35', '1'], e3('E-XS-02')),

  // ---------- C8-B26-M2
  Q('C8-B26-M2-Q01', 1, 'Gieo một con xúc xắc cân đối. Xác suất xuất hiện mặt 6 chấm là:', ['1/6', '6', '1/5', '6/6'], e3('E-XS-03')),
  Q('C8-B26-M2-Q02', 1, 'Xác suất của một biến cố là một số:', ['từ 0 đến 1', 'lớn hơn 1', 'âm', 'từ 0 đến 100'], e3('E-XS-03')),
  Q('C8-B26-M2-Q03', 2, 'Gieo một con xúc xắc cân đối. Xác suất xuất hiện mặt có số chấm chẵn là:', ['1/2', '3', '1/3', '1/6'], e3('E-XS-03')),
  Q('C8-B26-M2-Q04', 2, 'Rút 1 thẻ từ 10 thẻ đánh số 1 đến 10. Xác suất rút được thẻ ghi số chia hết cho 3 là:', ['3/10', '1/3', '3', '1/10'], e3('E-XS-03')),
  Q('C8-B26-M2-Q05', 3, 'Tung một đồng xu cân đối hai lần. Xác suất cả hai lần đều xuất hiện mặt ngửa là:', ['1/4', '1/3', '1/2', '2/4'], { B: 'E-XS-01', C: 'E-XS-03', D: 'E-XS-03' }),
  Q('C8-B26-M2-Q06', 3, 'Gieo hai con xúc xắc cân đối. Xác suất tổng số chấm bằng 7 là:', ['1/6', '7/36', '1/12', '1/11'], { B: 'E-XS-02', C: 'E-XS-01', D: 'E-XS-01' }),
  Q('C8-B26-M2-Q07', 4, 'Hộp có 3 bi đỏ, 5 bi xanh và 2 bi vàng. Lấy ngẫu nhiên 1 viên. Xác suất lấy được viên bi không phải màu xanh là:', ['1/2', '1/3', '3/10', '2/10'], { B: 'E-XS-03', C: 'E-XS-02', D: 'E-XS-02' }),
  Q('C8-B26-M2-Q08', 4, 'Rút ngẫu nhiên 1 thẻ từ 10 thẻ đánh số 1 đến 10. Xác suất để tổng các số trên 9 thẻ còn lại chia hết cho 3 là:', ['2/5', '3/10', '1/3', '4/9'], { B: 'E-XS-02', C: 'E-XS-03', D: 'E-XS-01' })
];

export const HINTS = {
  'E-XS-01': ['Em đã liệt kê hết các kết quả có thể chưa? SN và NS có phải cùng một kết quả không?', 'Không gian mẫu Ω là tập hợp tất cả các kết quả có thể, mỗi kết quả liệt kê đúng một lần. Phép thử nhiều bước thì ghi kết quả theo thứ tự từng bước (dùng bảng hoặc sơ đồ cây).', 'Ví dụ: tung đồng xu hai lần: Ω = {SS; SN; NS; NN}, có 4 phần tử.'],
  'E-XS-02': ['Kết quả em chọn có nằm trong không gian mẫu không? Nó có làm biến cố xảy ra không?', 'Kết quả thuận lợi cho A là các phần tử của Ω mà khi xảy ra thì A xảy ra. Kiểm tra từng phần tử của Ω. Biến cố không có kết quả thuận lợi nào là biến cố không thể.', 'Ví dụ: xúc xắc, biến cố "số nguyên tố": 2; 3; 5 (số 1 không phải số nguyên tố).'],
  'E-XS-03': ['Em đã chia số kết quả thuận lợi cho tổng số kết quả của không gian mẫu chưa?', 'Khi các kết quả đồng khả năng: P(A) = n(A) : n(Ω), luôn từ 0 đến 1. Đếm theo từng kết quả (từng viên bi), không theo số loại (số màu).', 'Ví dụ: 3 đỏ, 5 xanh, 2 vàng: P(không xanh) = (3 + 2) : 10 = 1/2.'],
  'E-XS-04': ['Phép thử có mấy bước? Mỗi bước có bao nhiêu khả năng? Lấy xong có trả lại không?', 'Phép thử nhiều bước: số kết quả = tích số khả năng mỗi bước (lập bảng). Lấy lần lượt không hoàn lại thì bước sau ít hơn một khả năng; lấy đồng thời thì không xét thứ tự.', 'Ví dụ: gieo hai xúc xắc: 6 · 6 = 36 kết quả; 3 bi lấy lần lượt 2 viên không hoàn lại: 3 · 2 = 6 kết quả.']
};

const V = (dan, quyTac, viDu, tuLam) => ({ dan, quyTac, viDu: viDu.map(([de, giai]) => ({ de, giai })), tuLam: tuLam.map(([de, dapAn, giaiThich]) => ({ de, dapAn, giaiThich })) });
export const VI_BAI_HOC = {
  'VBH-XS-01': V('Xác suất đúng hay sai phụ thuộc trước hết vào việc liệt kê đủ không gian mẫu.',
    'Ω gồm mọi kết quả có thể, mỗi kết quả một lần. Phép thử hai bước: viết kết quả theo thứ tự (lần 1, lần 2); SN khác NS.',
    [['Tung đồng xu hai lần, viết Ω.', 'Cách nghĩ sai: {SS; SN; NN}. Cách đúng: {SS; SN; NS; NN}, vì "sấp rồi ngửa" khác "ngửa rồi sấp".'],
     ['Rút 1 thẻ từ thẻ số 1 đến 10.', 'Ω = {1; 2; …; 10}, có 10 phần tử.']],
    [['Gieo xúc xắc, n(Ω)?', '6', '1 đến 6.'],
     ['Tung đồng xu 3 lần, n(Ω)?', '8', '2 · 2 · 2.']]),
  'VBH-XS-02': V('Kết quả thuận lợi phải "đến từ" không gian mẫu và làm biến cố xảy ra.',
    'Duyệt từng phần tử của Ω, giữ lại phần tử làm A xảy ra. Không có phần tử nào: biến cố không thể; mọi phần tử: biến cố chắc chắn.',
    [['Xúc xắc, biến cố "số nguyên tố".', 'Cách nghĩ sai: 1; 2; 3; 5. Cách đúng: 1 không là số nguyên tố, kết quả thuận lợi là 2; 3; 5.'],
     ['Hai xúc xắc, tổng 7.', '(1;6), (2;5), (3;4), (4;3), (5;2), (6;1): 6 kết quả.']],
    [['Thẻ 1–10 chia hết cho 3?', '3; 6; 9', 'Trong Ω.'],
     ['Thẻ 1–10 lớn hơn 10?', 'Không có (biến cố không thể)', 'Không phần tử nào.']]),
  'VBH-XS-03': V('Xác suất là một tỉ số — luôn nằm giữa 0 và 1.',
    'P(A) = n(A) : n(Ω) khi các kết quả đồng khả năng. Đếm theo từng kết quả, không theo số loại.',
    [['3 đỏ, 5 xanh, 2 vàng, P(không xanh)?', 'Cách nghĩ sai: 2 màu trên 3 màu nên 2/3, hoặc 1/3. Cách đúng: 5 viên không xanh trên 10 viên: 1/2.'],
     ['Xúc xắc, P(chẵn)?', '3/6 = 1/2.']],
    [['P(mặt 6)?', '1/6', '1 : 6.'],
     ['Thẻ 1–10, P(chia hết cho 3)?', '3/10', '3 : 10.']]),
  'VBH-XS-04': V('Phép thử có nhiều bước thì "nhân" số khả năng, và để ý có trả lại hay không.',
    'Số kết quả = tích số khả năng mỗi bước. Không hoàn lại: bước sau giảm 1. Lấy đồng thời: không phân biệt thứ tự.',
    [['Gieo hai xúc xắc, n(Ω)?', 'Cách nghĩ sai: 6 + 6 = 12. Cách đúng: 6 · 6 = 36 (lập bảng 6 × 6).'],
     ['3 bi khác màu, lấy lần lượt 2 viên không hoàn lại.', '3 · 2 = 6 kết quả có thứ tự.']],
    [['7 ngày, 2 buổi?', '14', '7 · 2.'],
     ['3 bi, lấy đồng thời 2 viên?', '3', 'Không xét thứ tự.']])
};

export const ERROR_NODES = LOI.map((e) => ({ id: e.code, name: e.ten, role: e.role, kuId: e.ku, cluster: e.cluster }));
export const CAUSAL_EDGES = [
  { from: 'E-XS-01', to: 'E-XS-04', weight: 0.6, reason: 'Không liệt kê có thứ tự nên đếm phép thử nhiều bước sai' },
  { from: 'E-XS-01', to: 'E-XS-02', weight: 0.6, reason: 'Không gian mẫu thiếu nên bỏ sót kết quả thuận lợi' },
  { from: 'E-XS-02', to: 'E-XS-03', weight: 0.65, reason: 'Đếm kết quả thuận lợi sai nên xác suất sai' },
  { from: 'E-XS-04', to: 'E-XS-03', weight: 0.55, reason: 'Đếm n(Ω) sai nên mẫu số của xác suất sai' }
];
export const ROOT_ERROR_IDS = ['E-XS-01'];

const NHAP = 'Bản nháp do trợ lý AI soạn theo từ điển mã lỗi — giáo viên cần duyệt, sửa trước khi dùng';
const A = (id, ten, errorCodes, nhom, hinhThuc, mucNhanThuc, phut, moTa, hocLieu) => ({ id, ten, errorCodes, nhom, hinhThuc, mucNhanThuc, phut, moTa, hocLieu, trangThai: 'nhap', nguon: NHAP });
export const ACTIVITIES = [
  A('HD-XS-01', 'Sơ đồ cây và bảng 6 × 6', ['E-XS-01', 'E-XS-04'], ['loi'], 'nhom-dong-chat', 1, [8, 10],
    'Nhóm vẽ sơ đồ cây cho phép tung đồng xu 2 lần, 3 lần và lập bảng 6 × 6 cho phép gieo hai xúc xắc; đếm số phần tử và so sánh với lời giải "6 + 6 = 12" để chỉ ra chỗ sai.', 'Phiếu sơ đồ cây, bảng 6 × 6'),
  A('HD-XS-02', 'Khoanh kết quả thuận lợi', ['E-XS-02', 'E-XS-03'], ['loi'], 'ca-nhan', 2, [6, 8],
    'Trên bảng 6 × 6 đã có, học sinh khoanh các ô thuận lợi cho 4 biến cố (tổng bằng 7, hai mặt bằng nhau, tích chẵn, tổng lớn hơn 12) rồi tính xác suất; bạn cùng bàn kiểm tra.', 'Bảng 6 × 6'),
  A('HD-XS-03', 'Thực nghiệm gieo xúc xắc', ['E-XS-03'], ['san-sang', 'loi'], 'nhom-dong-chat', 3, [10, 12],
    'Mỗi nhóm gieo hai xúc xắc 60 lần, ghi tần số tổng bằng 7, so tần số tương đối với xác suất lí thuyết 1/6; cả lớp gộp số liệu để thấy hai số tiến gần nhau.', 'Xúc xắc, phiếu ghi'),
  A('HD-C8-MR', 'Trò chơi có công bằng không?', [], ['san-sang'], 'nhom-dong-chat', 4, [12, 15],
    'Nhóm phân tích một trò chơi (rút thẻ, gieo xúc xắc) do giáo viên đưa ra, tính xác suất thắng của mỗi người và đề xuất sửa luật để trò chơi công bằng.', 'Thẻ số, xúc xắc')
];
