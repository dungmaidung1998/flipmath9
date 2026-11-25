/**
 * NỘI DUNG TOÁN 9 — CHƯƠNG V. ĐƯỜNG TRÒN (Kết nối tri thức)
 * BẢN NHÁP do trợ lý AI soạn theo SGK Toán 9 tập một (Bài 13–17) — giáo viên duyệt trước khi dùng.
 * Kí hiệu: (O; R) là đường tròn tâm O bán kính R; sđ là số đo cung.
 */
const SEC = { 1: 45, 2: 60, 3: 90, 4: 120 };
const B13 = 'Bài 13. Mở đầu về đường tròn';
const B14 = 'Bài 14. Cung và dây của một đường tròn';
const B15 = 'Bài 15. Độ dài của cung tròn. Diện tích hình quạt tròn và hình vành khuyên';
const B16 = 'Bài 16. Vị trí tương đối của đường thẳng và đường tròn';
const B17 = 'Bài 17. Vị trí tương đối của hai đường tròn';
const U = (id, bai, muc, name, order, prerequisite, mucTieu, extra = {}) => ({ id, bai, muc, name, order, prerequisite, mucTieu, ...extra });

export const UNITS = [
  U('C5-B13-M1', B13, 'Mục 1', 'Đường tròn và vị trí của điểm với đường tròn', 60, null,
    'Nhận biết đường tròn (O; R); xác định điểm nằm trong, trên, ngoài đường tròn bằng cách so sánh khoảng cách đến tâm với bán kính.'),
  U('C5-B13-M2', B13, 'Mục 2', 'Tính đối xứng của đường tròn', 61, 'C5-B13-M1',
    'Đường tròn có tâm đối xứng là tâm và vô số trục đối xứng là các đường thẳng đi qua tâm.'),
  U('C5-B14-M1', B14, 'Mục 1', 'Dây và đường kính của đường tròn', 62, 'C5-B13-M2',
    'Đường kính là dây lớn nhất; tính độ dài dây, khoảng cách từ tâm đến dây bằng định lí Pythagore.'),
  U('C5-B14-M2', B14, 'Mục 2', 'Góc ở tâm và cung', 63, 'C5-B14-M1',
    'Nhận biết góc ở tâm, cung bị chắn; số đo cung nhỏ bằng số đo góc ở tâm, cung lớn bằng 360° trừ cung nhỏ.'),
  U('C5-B14-M3', B14, 'Mục 2 (tiếp)', 'Số đo của một cung', 64, 'C5-B14-M2',
    'Tính số đo cung, cộng số đo cung; so sánh hai cung, liên hệ giữa cung và dây trong một đường tròn.'),
  U('C5-B15-M1', B15, 'Mục 1', 'Độ dài của cung tròn', 65, 'C5-B14-M3',
    'Vận dụng công thức độ dài cung n°: l = πRn/180 và chu vi đường tròn C = 2πR vào tính toán và thực tế.'),
  U('C5-B15-M2', B15, 'Mục 2', 'Diện tích hình quạt tròn', 66, 'C5-B15-M1',
    'Vận dụng công thức diện tích hình quạt tròn S = πR²n/360 = lR/2 vào tính toán và thực tế.'),
  U('C5-B15-M3', B15, 'Mục 3', 'Diện tích hình vành khuyên', 67, 'C5-B15-M2',
    'Vận dụng công thức diện tích hình vành khuyên S = π(R² − r²) vào tính toán và thực tế.'),
  U('C5-B16-M1', B16, 'Mục 1', 'Ba vị trí tương đối của đường thẳng và đường tròn', 68, 'C5-B14-M1',
    'Xác định vị trí tương đối của đường thẳng và đường tròn bằng cách so sánh khoảng cách d từ tâm đến đường thẳng với bán kính R.'),
  U('C5-B16-M2', B16, 'Mục 2', 'Dấu hiệu nhận biết tiếp tuyến', 69, 'C5-B16-M1',
    'Nhận biết tiếp tuyến: đường thẳng đi qua một điểm của đường tròn và vuông góc với bán kính tại điểm đó; tính độ dài đoạn tiếp tuyến.'),
  U('C5-B16-M3', B16, 'Mục 3', 'Tính chất hai tiếp tuyến cắt nhau', 70, 'C5-B16-M2',
    'Vận dụng tính chất hai tiếp tuyến cắt nhau: MA = MB, MO là phân giác góc AMB, OM là trung trực của AB.'),
  U('C5-B17-M1', B17, 'Mục 1', 'Ba vị trí tương đối của hai đường tròn', 71, 'C5-B16-M1',
    'Nhận biết hai đường tròn cắt nhau, tiếp xúc, không giao nhau theo số điểm chung; tính chất đường nối tâm.'),
  U('C5-B17-M2', B17, 'Mục 2', 'Vị trí tương đối và khoảng cách giữa hai tâm', 72, 'C5-B17-M1',
    'Xác định vị trí tương đối của hai đường tròn bằng cách so sánh d = OO′ với R + r và R − r.')
];

const E = (code, ku, role, cluster, ten, tieuDe, phut, misconception, viDu) =>
  ({ code, ku, role, cluster, ten, tieuDe, phut, misconception, viDu, remediation: 'VBH-' + code.slice(2) });
const LOI = [
  E('E-DTR-01', 'C5-B13-M1', 'root', 'Đường tròn', 'Xác định vị trí điểm, bán kính sai', 'So sánh khoảng cách đến tâm với R; R = đường kính : 2', 5,
    'So sánh khoảng cách từ điểm đến tâm với bán kính sai chiều, hoặc nhầm bán kính với đường kính', 'OM = 2 < R = 3 nhưng kết luận M nằm ngoài; đường kính 10 thì R = 10'),
  E('E-DTR-02', 'C5-B13-M2', 'mediating', 'Đường tròn', 'Hiểu sai tính đối xứng của đường tròn', 'Tâm là tâm đối xứng; mọi đường thẳng qua tâm là trục đối xứng', 4,
    'Cho rằng đường tròn chỉ có một hoặc hai trục đối xứng, hoặc trục đối xứng là dây bất kì', 'Đường tròn có 2 trục đối xứng'),
  E('E-CD-01', 'C5-B14-M1', 'mediating', 'Cung và dây', 'Tính dây, khoảng cách tâm – dây sai', 'Dây ≤ đường kính; d² + (dây/2)² = R²', 6,
    'Cho dây dài hơn đường kính, hoặc áp dụng Pythagore với cả dây thay vì nửa dây', 'R = 5, dây 8: d = √(5² − 8²)'),
  E('E-CD-02', 'C5-B14-M2', 'root', 'Cung và dây', 'Nhầm số đo cung nhỏ, cung lớn và góc ở tâm', 'sđ cung nhỏ = góc ở tâm; sđ cung lớn = 360° − sđ cung nhỏ', 5,
    'Lấy số đo cung bằng nửa góc ở tâm, nhầm cung lớn với cung nhỏ, hoặc nhầm góc ở tâm với góc có đỉnh trên đường tròn', 'Góc AOB = 70° thì cung lớn AB = 70°'),
  E('E-CD-03', 'C5-B14-M3', 'leaf', 'Cung và dây', 'Cộng, so sánh cung sai', 'Cộng cung khi điểm nằm trên cung; so sánh cung trong cùng đường tròn', 5,
    'Cộng hai cung không kề nhau, so sánh cung ở hai đường tròn khác nhau, hoặc tính tổng các cung khác 360°', 'Hai cung 60° ở hai đường tròn khác nhau là bằng nhau'),
  E('E-QH-01', 'C5-B15-M1', 'mediating', 'Độ dài cung, diện tích quạt', 'Công thức độ dài cung sai', 'l = πRn/180; C = 2πR', 5,
    'Tính độ dài cung bằng πRn/360, dùng đường kính thay bán kính, hoặc nhầm với công thức diện tích', 'Cung 60°, R = 6: l = π·6·60/360 = π'),
  E('E-QH-02', 'C5-B15-M2', 'leaf', 'Độ dài cung, diện tích quạt', 'Công thức diện tích hình quạt sai', 'S = πR²n/360 = lR/2', 5,
    'Tính diện tích hình quạt bằng πR²n/180, lấy l·R không chia 2, hoặc dùng πR thay πR²', 'R = 6, n = 60°: S = 36π·60/180 = 12π'),
  E('E-QH-03', 'C5-B15-M3', 'leaf', 'Độ dài cung, diện tích quạt', 'Diện tích hình vành khuyên sai', 'S = π(R² − r²), không phải π(R − r)²', 5,
    'Tính diện tích hình vành khuyên bằng π(R − r)², hoặc dùng đường kính thay bán kính', 'R = 5, r = 3: S = π(5 − 3)² = 4π'),
  E('E-TT-01', 'C5-B16-M1', 'mediating', 'Tiếp tuyến', 'So sánh d với R sai', 'd < R: cắt; d = R: tiếp xúc; d > R: không giao', 5,
    'Xác định vị trí tương đối của đường thẳng và đường tròn sai khi so sánh khoảng cách d với R', 'd = R thì đường thẳng cắt đường tròn tại hai điểm'),
  E('E-TT-02', 'C5-B16-M2', 'mediating', 'Tiếp tuyến', 'Nhận biết, tính toán tiếp tuyến sai', 'Tiếp tuyến ⊥ bán kính tại tiếp điểm; MA² = OM² − R²', 6,
    'Kết luận tiếp tuyến khi thiếu điều kiện điểm thuộc đường tròn hoặc vuông góc, hoặc dùng Pythagore sai cạnh huyền (OM)', 'OM = 10, R = 6: MA = √(10² + 6²)'),
  E('E-TT-03', 'C5-B16-M3', 'leaf', 'Tiếp tuyến', 'Dùng sai tính chất hai tiếp tuyến cắt nhau', 'MA = MB; MO là phân giác; OM ⊥ AB', 6,
    'Nhầm các tính chất của hai tiếp tuyến cắt nhau: cho MA = OA, lấy góc AMO bằng góc AMB, quên OM là trung trực của AB', 'Góc AMB = 60° thì góc AMO = 60°'),
  E('E-HDT-01', 'C5-B17-M1', 'mediating', 'Hai đường tròn', 'Nhầm vị trí hai đường tròn theo số điểm chung', '2 điểm chung: cắt; 1: tiếp xúc; 0: không giao', 5,
    'Liên hệ sai số điểm chung với vị trí hai đường tròn, hoặc quên tính chất đường nối tâm', 'Hai đường tròn tiếp xúc thì O, O′, A không thẳng hàng'),
  E('E-HDT-02', 'C5-B17-M2', 'leaf', 'Hai đường tròn', 'Hệ thức giữa d, R, r sai', 'Tiếp xúc ngoài: d = R + r; tiếp xúc trong: d = R − r', 6,
    'So sánh d với R + r và R − r sai, nhầm tiếp xúc ngoài với tiếp xúc trong', 'R = 5, r = 3, d = 2 thì tiếp xúc ngoài')
];
export const ERRORS = LOI.map(({ code, ku, misconception, viDu, remediation }) => ({ code, ku, misconception, viDu, remediation }));
export const REMEDIATION = Object.fromEntries(LOI.map((e) => [e.remediation, { ku: e.ku, title: e.tieuDe, minutes: e.phut }]));

const Q = (id, level, stem, [A, B, C, D], err, hinh) =>
  ({ id, ku: id.replace(/-Q\d+$/, ''), level, sec: SEC[level], stem, opts: { A, B, C, D }, correct: 'A', err, ...(hinh ? { hinh } : {}) });
const e3 = (c) => ({ B: c, C: c, D: c });
const TT2 = 'Từ điểm M nằm ngoài (O) kẻ hai tiếp tuyến MA, MB (A, B là tiếp điểm)';

const CAU_GOC = [
  // ---------- C5-B13-M1
  Q('C5-B13-M1-Q01', 1, 'Đường tròn tâm O bán kính 5 cm là tập hợp các điểm:', ['cách O một khoảng bằng 5 cm', 'cách O một khoảng nhỏ hơn 5 cm', 'cách O một khoảng bằng 10 cm', 'cách O không quá 5 cm'], e3('E-DTR-01')),
  Q('C5-B13-M1-Q02', 1, 'Cho (O; 3 cm) và điểm M với OM = 2 cm. Điểm M nằm:', ['bên trong đường tròn', 'bên ngoài đường tròn', 'trên đường tròn', 'không xác định được'], e3('E-DTR-01')),
  Q('C5-B13-M1-Q03', 2, 'Đường tròn có đường kính 10 cm thì bán kính là:', ['5 cm', '10 cm', '20 cm', '3,14 cm'], e3('E-DTR-01')),
  Q('C5-B13-M1-Q04', 2, 'Cho (O; 4 cm), điểm A với OA = 4 cm, điểm B với OB = 5 cm. Khẳng định đúng là:', ['A nằm trên, B nằm ngoài đường tròn', 'A nằm trong, B nằm ngoài đường tròn', 'A nằm trên, B nằm trong đường tròn', 'Cả hai nằm ngoài đường tròn'], e3('E-DTR-01')),
  Q('C5-B13-M1-Q05', 3, 'Trong mặt phẳng toạ độ, đường tròn tâm O(0; 0) bán kính 5 đi qua điểm nào?', ['(3; 4)', '(3; 3)', '(5; 5)', '(2; 3)'], e3('E-DTR-01')),
  Q('C5-B13-M1-Q06', 3, 'Tam giác ABC vuông tại A có BC = 10 cm. Đường tròn đi qua ba điểm A, B, C có bán kính:', ['5 cm', '10 cm', '20 cm', 'Không xác định được'], e3('E-DTR-01')),
  Q('C5-B13-M1-Q07', 4, 'Hình chữ nhật ABCD có AB = 6 cm, BC = 8 cm. Bốn điểm A, B, C, D cùng thuộc một đường tròn có bán kính:', ['5 cm', '10 cm', '7 cm', '4 cm'], e3('E-DTR-01')),
  Q('C5-B13-M1-Q08', 2, 'Một chiếc compa mở rộng 3 cm vẽ đường tròn. Điểm M cách tâm 2,9 cm, điểm N cách tâm 3,1 cm. Khẳng định đúng là:', ['M nằm trong, N nằm ngoài đường tròn', 'M nằm ngoài, N nằm trong đường tròn', 'Cả hai nằm trên đường tròn', 'Cả hai nằm trong đường tròn'], e3('E-DTR-01')),

  // ---------- C5-B13-M2
  Q('C5-B13-M2-Q01', 1, 'Tâm đối xứng của đường tròn là:', ['Tâm của đường tròn', 'Một điểm bất kì trên đường tròn', 'Đường tròn không có tâm đối xứng', 'Trung điểm của một dây bất kì'], e3('E-DTR-02')),
  Q('C5-B13-M2-Q02', 1, 'Đường tròn có bao nhiêu trục đối xứng?', ['Vô số', '1', '2', '4'], e3('E-DTR-02')),
  Q('C5-B13-M2-Q03', 2, 'Trục đối xứng của đường tròn là:', ['Mọi đường thẳng đi qua tâm', 'Chỉ đường kính nằm ngang', 'Mọi đường thẳng chứa một dây', 'Mọi đường thẳng chỉ có một điểm chung với đường tròn'], e3('E-DTR-02')),
  Q('C5-B13-M2-Q04', 2, 'Cho (O) và điểm A thuộc (O). Điểm đối xứng với A qua O:', ['thuộc (O)', 'nằm trong (O)', 'nằm ngoài (O)', 'trùng với O'], e3('E-DTR-02')),
  Q('C5-B13-M2-Q05', 3, 'AB là một đường kính của (O), điểm M thuộc (O). Điểm M′ đối xứng với M qua đường thẳng AB:', ['thuộc (O)', 'nằm ngoài (O)', 'trùng với A', 'nằm trong (O)'], e3('E-DTR-02')),
  Q('C5-B13-M2-Q06', 3, 'Cho (O; 5 cm), điểm A thuộc (O), A′ đối xứng với A qua O. Độ dài AA′ là:', ['10 cm', '5 cm', '2,5 cm', '0 cm'], { B: 'E-DTR-01', C: 'E-DTR-02', D: 'E-DTR-02' }),
  Q('C5-B13-M2-Q07', 2, 'Hình nào có tâm đối xứng và có vô số trục đối xứng?', ['Hình tròn', 'Hình vuông', 'Tam giác đều', 'Hình chữ nhật'], e3('E-DTR-02')),
  Q('C5-B13-M2-Q08', 4, 'Dây AB của (O) không đi qua tâm. Đường thẳng nào vừa là trục đối xứng của đường tròn vừa đi qua trung điểm của AB?', ['Đường thẳng qua O vuông góc với AB', 'Đường thẳng AB', 'Đường thẳng OA', 'Không có đường thẳng nào'], e3('E-DTR-02')),

  // ---------- C5-B14-M1
  Q('C5-B14-M1-Q01', 1, 'Trong một đường tròn, dây lớn nhất là:', ['Đường kính', 'Bán kính', 'Dây bất kì', 'Không có dây lớn nhất'], e3('E-CD-01')),
  Q('C5-B14-M1-Q02', 1, 'Đường tròn (O; 6 cm) có dây AB. Khẳng định đúng là:', ['AB ≤ 12 cm', 'AB ≤ 6 cm', 'AB có thể lớn hơn 12 cm', 'AB = 6 cm'], e3('E-CD-01')),
  Q('C5-B14-M1-Q03', 2, 'Cho (O; 5 cm), dây AB = 8 cm. Khoảng cách từ O đến dây AB là:', ['3 cm', '√89 cm', '4 cm', '1 cm'], e3('E-CD-01')),
  Q('C5-B14-M1-Q04', 2, 'Đường kính vuông góc với một dây (không đi qua tâm) thì:', ['đi qua trung điểm của dây đó', 'song song với dây đó', 'bằng dây đó', 'không có tính chất gì đặc biệt'], e3('E-CD-01')),
  Q('C5-B14-M1-Q05', 3, 'Cho (O; 13 cm), khoảng cách từ O đến dây AB là 5 cm. Độ dài AB là:', ['24 cm', '12 cm', '18 cm', '8 cm'], e3('E-CD-01')),
  Q('C5-B14-M1-Q06', 3, 'Đường tròn có đường kính 10 cm. Có dây nào dài 11 cm không?', ['Không, vì dây không lớn hơn đường kính', 'Có', 'Có, nếu dây không đi qua tâm', 'Có, nếu dây đi qua tâm'], e3('E-CD-01')),
  Q('C5-B14-M1-Q07', 4, 'Cho (O; R), hai dây AB và CD bằng nhau. Khẳng định đúng là:', ['AB và CD cách đều tâm O', 'AB song song với CD', 'AB vuông góc với CD', 'AB và CD cắt nhau tại O'], e3('E-CD-01')),
  Q('C5-B14-M1-Q08', 4, 'Một miếng gỗ hình tròn bán kính 25 cm bị cắt theo dây AB; khoảng cách từ tâm đến AB là 7 cm. Độ dài vết cắt AB là:', ['48 cm', '24 cm', '50 cm', '36 cm'], e3('E-CD-01')),

  // ---------- C5-B14-M2
  Q('C5-B14-M2-Q01', 1, 'Góc ở tâm là góc:', ['có đỉnh trùng với tâm đường tròn', 'có đỉnh nằm trên đường tròn', 'có hai cạnh là hai dây', 'có đỉnh nằm ngoài đường tròn'], e3('E-CD-02')),
  Q('C5-B14-M2-Q02', 1, 'Góc ở tâm AOB = 70°. Số đo cung nhỏ AB là:', ['70°', '35°', '140°', '290°'], e3('E-CD-02')),
  Q('C5-B14-M2-Q03', 2, 'Góc ở tâm AOB = 70°. Số đo cung lớn AB là:', ['290°', '70°', '110°', '180°'], e3('E-CD-02')),
  Q('C5-B14-M2-Q04', 2, 'Một đường tròn được chia thành 6 cung bằng nhau. Số đo mỗi cung là:', ['60°', '30°', '180°', '6°'], e3('E-CD-02')),
  Q('C5-B14-M2-Q05', 3, 'Lúc 3 giờ, kim giờ và kim phút của đồng hồ tạo thành góc ở tâm có số đo:', ['90°', '30°', '45°', '180°'], e3('E-CD-02')),
  Q('C5-B14-M2-Q06', 2, 'AB là đường kính của (O). Số đo mỗi cung AB là:', ['180°', '90°', '360°', '0°'], e3('E-CD-02')),
  Q('C5-B14-M2-Q07', 4, 'Tam giác đều ABC có ba đỉnh nằm trên đường tròn (O). Số đo góc ở tâm AOB là:', ['120°', '60°', '90°', '180°'], e3('E-CD-02')),
  Q('C5-B14-M2-Q08', 2, 'Bánh xe có 12 nan hoa chia đều quanh trục. Góc giữa hai nan hoa liên tiếp là:', ['30°', '12°', '15°', '60°'], e3('E-CD-02')),

  // ---------- C5-B14-M3
  Q('C5-B14-M3-Q01', 1, 'Điểm C nằm trên cung nhỏ AB, sđ cung AC = 40°, sđ cung CB = 30°. Số đo cung nhỏ AB là:', ['70°', '10°', '35°', '290°'], { B: 'E-CD-03', C: 'E-CD-03', D: 'E-CD-02' }),
  Q('C5-B14-M3-Q02', 1, 'Hai cung bằng nhau khi:', ['chúng thuộc một đường tròn (hoặc hai đường tròn bằng nhau) và có cùng số đo', 'chúng có cùng số đo, ở hai đường tròn bất kì', 'chúng có dây bằng nhau, ở hai đường tròn bất kì', 'chúng có chung một đầu mút'], e3('E-CD-03')),
  Q('C5-B14-M3-Q03', 2, 'Trên đường tròn (O), cung nhỏ AB có số đo 100°, cung nhỏ CD có số đo 80°. Khẳng định đúng là:', ['Dây AB > dây CD', 'Dây AB < dây CD', 'Dây AB = dây CD', 'Không so sánh được'], e3('E-CD-03')),
  Q('C5-B14-M3-Q04', 2, 'Ba điểm A, B, C chia đường tròn thành ba cung có số đo 100°, 120° và x. Giá trị của x là:', ['140°', '80°', '220°', '60°'], e3('E-CD-03')),
  Q('C5-B14-M3-Q05', 3, 'Cho (O; R), dây AB = R. Số đo cung nhỏ AB là:', ['60°', '30°', '90°', '120°'], { B: 'E-CD-02', C: 'E-CD-03', D: 'E-CD-03' }),
  Q('C5-B14-M3-Q06', 3, 'Cho (O; R), dây AB = R√2. Số đo cung nhỏ AB là:', ['90°', '45°', '60°', '120°'], e3('E-CD-03')),
  Q('C5-B14-M3-Q07', 4, 'Cho (O; R), dây AB = R√3. Số đo cung lớn AB là:', ['240°', '120°', '60°', '300°'], e3('E-CD-02')),
  Q('C5-B14-M3-Q08', 4, 'Ba điểm A, B, C chia đường tròn thành ba cung AB, BC, CA (mỗi cung không chứa điểm còn lại) có số đo tỉ lệ với 3 : 4 : 5. Số đo cung AB là:', ['90°', '120°', '30°', '150°'], e3('E-CD-03')),

  // ---------- C5-B15-M1
  Q('C5-B15-M1-Q01', 1, 'Độ dài cung n° của đường tròn bán kính R là:', ['πRn/180', 'πRn/360', 'πR²n/360', '2πRn'], { B: 'E-QH-01', C: 'E-QH-02', D: 'E-QH-01' }),
  Q('C5-B15-M1-Q02', 1, 'Chu vi đường tròn bán kính 5 cm là:', ['10π cm', '25π cm', '5π cm', '20π cm'], { B: 'E-QH-02', C: 'E-QH-01', D: 'E-QH-01' }),
  Q('C5-B15-M1-Q03', 2, 'Độ dài cung 60° của đường tròn bán kính 6 cm là:', ['2π cm', 'π cm', '6π cm', '12π cm'], { B: 'E-QH-01', C: 'E-QH-02', D: 'E-QH-01' }),
  Q('C5-B15-M1-Q04', 2, 'Độ dài cung 90° của đường tròn đường kính 8 cm là:', ['2π cm', '4π cm', 'π cm', '16π cm'], { B: 'E-QH-01', C: 'E-QH-01', D: 'E-QH-02' }),
  Q('C5-B15-M1-Q05', 3, 'Một cung tròn dài 3π cm thuộc đường tròn bán kính 9 cm. Số đo cung đó là:', ['60°', '30°', '120°', '20°'], e3('E-QH-01')),
  Q('C5-B15-M1-Q06', 3, 'Bánh xe đạp có đường kính 70 cm lăn được 10 vòng thì xe đi được quãng đường (lấy π ≈ 3,14):', ['khoảng 21,98 m', 'khoảng 43,96 m', 'khoảng 10,99 m', 'khoảng 38,47 m'], { B: 'E-QH-01', C: 'E-QH-01', D: 'E-QH-02' }),
  Q('C5-B15-M1-Q07', 4, 'Kim phút của đồng hồ dài 10 cm. Trong 20 phút, đầu kim phút vạch nên một cung tròn dài:', ['20π/3 cm', '10π/3 cm', '200π cm', '100π/3 cm'], { B: 'E-QH-01', C: 'E-QH-01', D: 'E-QH-02' }),
  Q('C5-B15-M1-Q08', 4, 'Một đường chạy gồm hai đoạn thẳng dài 100 m và hai nửa đường tròn bán kính 30 m ở hai đầu. Chiều dài một vòng chạy (lấy π ≈ 3,14) là:', ['388,4 m', '294,2 m', '576,8 m', '5 852 m'], { B: 'E-QH-01', C: 'E-QH-01', D: 'E-QH-02' }),

  // ---------- C5-B15-M2
  Q('C5-B15-M2-Q01', 1, 'Diện tích hình quạt tròn bán kính R, cung n° là:', ['πR²n/360', 'πR²n/180', 'πRn/180', 'πR²'], { B: 'E-QH-02', C: 'E-QH-01', D: 'E-QH-02' }),
  Q('C5-B15-M2-Q02', 1, 'Diện tích hình tròn bán kính 4 cm là:', ['16π cm²', '8π cm²', '4π cm²', '64π cm²'], { B: 'E-QH-01', C: 'E-QH-02', D: 'E-QH-02' }),
  Q('C5-B15-M2-Q03', 2, 'Diện tích hình quạt tròn bán kính 6 cm, cung 60° là:', ['6π cm²', '12π cm²', '2π cm²', '36π cm²'], { B: 'E-QH-02', C: 'E-QH-01', D: 'E-QH-02' }),
  Q('C5-B15-M2-Q04', 2, 'Hình quạt tròn có độ dài cung 4π cm và bán kính 5 cm. Diện tích hình quạt là:', ['10π cm²', '20π cm²', '25π cm²', '2π cm²'], e3('E-QH-02')),
  Q('C5-B15-M2-Q05', 3, 'Diện tích hình quạt tròn bán kính 20 m, góc ở tâm 135° là:', ['150π m²', '300π m²', '15π m²', '400π m²'], { B: 'E-QH-02', C: 'E-QH-01', D: 'E-QH-02' }),
  Q('C5-B15-M2-Q06', 3, 'Một chiếc quạt giấy khi mở ra có dạng hình quạt tròn bán kính 30 cm, góc 120°. Diện tích mặt quạt là:', ['300π cm²', '600π cm²', '20π cm²', '900π cm²'], { B: 'E-QH-02', C: 'E-QH-01', D: 'E-QH-02' }),
  Q('C5-B15-M2-Q07', 4, 'Hình quạt tròn có diện tích 12π cm² và bán kính 6 cm. Số đo cung của hình quạt là:', ['120°', '60°', '240°', '12°'], e3('E-QH-02')),
  Q('C5-B15-M2-Q08', 3, 'Vòi tưới cây quay được góc 90° và tưới xa 8 m. Diện tích vùng đất được tưới là:', ['16π m²', '32π m²', '4π m²', '64π m²'], { B: 'E-QH-02', C: 'E-QH-01', D: 'E-QH-02' }),

  // ---------- C5-B15-M3
  Q('C5-B15-M3-Q01', 1, 'Diện tích hình vành khuyên giới hạn bởi hai đường tròn đồng tâm bán kính R và r (R > r) là:', ['π(R² − r²)', 'π(R − r)²', 'π(R + r)²', '2π(R − r)'], e3('E-QH-03')),
  Q('C5-B15-M3-Q02', 1, 'Hình vành khuyên là phần nằm giữa:', ['hai đường tròn đồng tâm', 'hai đường tròn cắt nhau', 'hai đường tròn tiếp xúc ngoài', 'một đường tròn và một dây của nó'], e3('E-QH-03')),
  Q('C5-B15-M3-Q03', 2, 'Diện tích hình vành khuyên với R = 5 cm, r = 3 cm là:', ['16π cm²', '4π cm²', '64π cm²', '34π cm²'], e3('E-QH-03')),
  Q('C5-B15-M3-Q04', 2, 'Diện tích hình vành khuyên với R = 10 cm, r = 6 cm là:', ['64π cm²', '16π cm²', '136π cm²', '8π cm²'], e3('E-QH-03')),
  Q('C5-B15-M3-Q05', 3, 'Một đĩa tròn có đường kính ngoài 12 cm, lỗ tròn ở giữa có đường kính 1,5 cm. Diện tích mặt đĩa là:', ['35,4375π cm²', '27,5625π cm²', '141,75π cm²', '36π cm²'], e3('E-QH-03')),
  Q('C5-B15-M3-Q06', 3, 'Một lối đi rộng 2 m bao quanh bồn hoa hình tròn bán kính 3 m. Diện tích lối đi là:', ['16π m²', '4π m²', '25π m²', '9π m²'], e3('E-QH-03')),
  Q('C5-B15-M3-Q07', 4, 'Hình vành khuyên có diện tích 9π cm², bán kính đường tròn trong là 4 cm. Bán kính đường tròn ngoài là:', ['5 cm', '7 cm', '√7 cm', '13 cm'], e3('E-QH-03')),
  Q('C5-B15-M3-Q08', 4, 'Một ống cống có mặt cắt là hình vành khuyên, đường kính ngoài 1 m, thành ống dày 0,1 m. Diện tích mặt cắt là:', ['0,09π m²', '0,01π m²', '0,36π m²', '0,81π m²'], e3('E-QH-03')),

  // ---------- C5-B16-M1
  Q('C5-B16-M1-Q01', 1, 'Cho (O; R) và đường thẳng a, d là khoảng cách từ O đến a. Đường thẳng a cắt đường tròn khi:', ['d < R', 'd = R', 'd > R', 'd = 2R'], e3('E-TT-01')),
  Q('C5-B16-M1-Q02', 1, 'Một đường thẳng và một đường tròn có nhiều nhất bao nhiêu điểm chung?', ['2', '1', '3', 'Vô số'], e3('E-TT-01')),
  Q('C5-B16-M1-Q03', 2, 'Cho (O; 5 cm) và đường thẳng a cách O một khoảng 5 cm. Đường thẳng a và đường tròn:', ['tiếp xúc nhau', 'cắt nhau', 'không giao nhau', 'có hai điểm chung'], e3('E-TT-01')),
  Q('C5-B16-M1-Q04', 2, 'Cho (O; 6 cm) và đường thẳng a cách O một khoảng 8 cm. Số điểm chung của a và đường tròn là:', ['0', '1', '2', '3'], e3('E-TT-01')),
  Q('C5-B16-M1-Q05', 3, 'Trong mặt phẳng toạ độ, đường tròn tâm I(3; 2) bán kính 2 và trục Ox:', ['tiếp xúc nhau', 'cắt nhau', 'không giao nhau', 'có vô số điểm chung'], e3('E-TT-01')),
  Q('C5-B16-M1-Q06', 3, 'Đường thẳng a cắt (O; 5 cm) tại hai điểm A, B với AB = 8 cm. Khoảng cách từ O đến a là:', ['3 cm', '4 cm', '√89 cm', '5 cm'], { B: 'E-CD-01', C: 'E-CD-01', D: 'E-TT-01' }),
  Q('C5-B16-M1-Q07', 4, 'Điểm A cách đường thẳng a một khoảng 3 cm. Đường tròn (A; R) cắt a tại hai điểm khi:', ['R > 3 cm', 'R = 3 cm', 'R < 3 cm', 'R ≥ 3 cm'], e3('E-TT-01')),
  Q('C5-B16-M1-Q08', 2, 'Lúc hoàng hôn, xem mặt trời là một hình tròn và đường chân trời là một đường thẳng. Khi mặt trời vừa chạm đường chân trời thì đường tròn và đường thẳng:', ['tiếp xúc nhau', 'cắt nhau', 'không giao nhau', 'trùng nhau'], e3('E-TT-01')),

  // ---------- C5-B16-M2
  Q('C5-B16-M2-Q01', 1, 'Đường thẳng a là tiếp tuyến của (O) tại A khi:', ['A thuộc (O) và a vuông góc với OA tại A', 'a vuông góc với OA', 'a đi qua A', 'a song song với OA'], e3('E-TT-02')),
  Q('C5-B16-M2-Q02', 1, 'Tiếp tuyến của đường tròn tại một điểm:', ['vuông góc với bán kính đi qua tiếp điểm', 'song song với bán kính đi qua tiếp điểm', 'đi qua tâm đường tròn', 'cắt đường tròn tại hai điểm'], e3('E-TT-02')),
  Q('C5-B16-M2-Q03', 2, 'Cho (O; 5 cm), A thuộc (O), đường thẳng a đi qua A và cách O một khoảng 5 cm. Khẳng định đúng là:', ['a là tiếp tuyến của (O) tại A', 'a cắt (O) tại hai điểm', 'a không giao (O)', 'a đi qua O'], { B: 'E-TT-01', C: 'E-TT-01', D: 'E-TT-02' }),
  Q('C5-B16-M2-Q04', 2, 'Tam giác ABC có AB = 3, AC = 4, BC = 5. Đường thẳng AC là tiếp tuyến của đường tròn nào?', ['(B; 3)', '(C; 4)', '(B; 5)', '(A; 3)'], e3('E-TT-02')),
  Q('C5-B16-M2-Q05', 3, 'MA là tiếp tuyến của (O; 6 cm) tại A, OM = 10 cm. Độ dài MA là:', ['8 cm', '4 cm', '√136 cm', '16 cm'], e3('E-TT-02')),
  Q('C5-B16-M2-Q06', 3, 'MA là tiếp tuyến của (O; 15 cm) tại A, MA = 20 cm. Độ dài OM là:', ['25 cm', '5 cm', '35 cm', '√175 cm'], e3('E-TT-02')),
  Q('C5-B16-M2-Q07', 4, 'MA là tiếp tuyến của (O; 4 cm) tại A, góc AMO = 30°. Độ dài OM là:', ['8 cm', '4√3 cm', '2 cm', '4 cm'], e3('E-TT-02')),
  Q('C5-B16-M2-Q08', 2, 'Một bánh xe (xem là đường tròn tâm O) lăn trên mặt đường thẳng. Bán kính nối tâm O với điểm tiếp xúc mặt đường:', ['vuông góc với mặt đường', 'song song với mặt đường', 'tạo với mặt đường góc 45°', 'nằm trên mặt đường'], e3('E-TT-02')),

  // ---------- C5-B16-M3
  Q('C5-B16-M3-Q01', 1, `${TT2}. Khẳng định đúng là:`, ['MA = MB', 'MA = OA', 'MA = 2MB', 'MA ⊥ MB'], e3('E-TT-03')),
  Q('C5-B16-M3-Q02', 1, `${TT2}. Tia MO là:`, ['tia phân giác của góc AMB', 'tia vuông góc với MA', 'tia song song với AB', 'một tiếp tuyến của (O)'], e3('E-TT-03')),
  Q('C5-B16-M3-Q03', 2, `${TT2}, góc AMB = 60°. Số đo góc AMO là:`, ['30°', '60°', '120°', '90°'], e3('E-TT-03')),
  Q('C5-B16-M3-Q04', 2, `${TT2}, bán kính 3 cm, MA = 4 cm. Độ dài MB và MO lần lượt là:`, ['4 cm và 5 cm', '3 cm và 5 cm', '4 cm và 7 cm', '4 cm và √7 cm'], { B: 'E-TT-03', C: 'E-TT-02', D: 'E-TT-02' }),
  Q('C5-B16-M3-Q05', 3, `${TT2}. Quan hệ giữa đường thẳng OM và dây AB là:`, ['OM vuông góc với AB tại trung điểm của AB', 'OM song song với AB', 'OM = AB', 'OM đi qua A'], e3('E-TT-03')),
  Q('C5-B16-M3-Q06', 3, `${TT2}, góc AMB = 60°, OA = 5 cm. Độ dài OM là:`, ['10 cm', '5√3 cm', '5 cm', '2,5 cm'], e3('E-TT-03')),
  Q('C5-B16-M3-Q07', 4, `${TT2}, góc AOB = 120°. Số đo góc AMB là:`, ['60°', '120°', '30°', '240°'], e3('E-TT-03')),
  Q('C5-B16-M3-Q08', 4, 'Đường tròn (I) tiếp xúc với ba cạnh của tam giác ABC; tiếp điểm trên AB, AC lần lượt là D, E. Biết AB = 7, AC = 8, BC = 9. Độ dài AD là:', ['3', '3,5', '4', '12'], e3('E-TT-03')),

  // ---------- C5-B17-M1
  Q('C5-B17-M1-Q01', 1, 'Hai đường tròn phân biệt có nhiều nhất bao nhiêu điểm chung?', ['2', '1', '3', 'Vô số'], e3('E-HDT-01')),
  Q('C5-B17-M1-Q02', 1, 'Hai đường tròn có đúng một điểm chung thì hai đường tròn:', ['tiếp xúc nhau', 'cắt nhau', 'không giao nhau', 'đồng tâm'], e3('E-HDT-01')),
  Q('C5-B17-M1-Q03', 2, 'Hai đường tròn cắt nhau có số điểm chung là:', ['2', '1', '0', '3'], e3('E-HDT-01')),
  Q('C5-B17-M1-Q04', 2, 'Hai đường tròn đồng tâm có bán kính khác nhau thì:', ['không giao nhau (đường tròn lớn đựng đường tròn nhỏ)', 'cắt nhau', 'tiếp xúc trong', 'tiếp xúc ngoài'], e3('E-HDT-01')),
  Q('C5-B17-M1-Q05', 3, 'Hai đường tròn (O) và (O′) cắt nhau tại A và B. Đường nối tâm OO′:', ['là đường trung trực của AB', 'song song với AB', 'đi qua A', 'bằng AB'], e3('E-HDT-01')),
  Q('C5-B17-M1-Q06', 3, 'Hai đường tròn (O) và (O′) tiếp xúc nhau tại A. Khẳng định đúng là:', ['O, O′, A thẳng hàng', 'OA ⊥ O′A', 'OA = O′A', 'A là trung điểm của OO′'], e3('E-HDT-01')),
  Q('C5-B17-M1-Q07', 2, 'Hai chiếc vòng tròn đặt chồng lên nhau một phần trên mặt bàn, mép hai vòng gặp nhau tại hai điểm. Hai đường tròn (mép vòng):', ['cắt nhau', 'tiếp xúc ngoài', 'tiếp xúc trong', 'không giao nhau'], e3('E-HDT-01')),
  Q('C5-B17-M1-Q08', 4, 'Ba đường tròn bằng nhau, từng đôi một tiếp xúc ngoài. Nối ba tâm được tam giác:', ['đều', 'vuông', 'tù', 'vuông cân'], e3('E-HDT-02')),

  // ---------- C5-B17-M2
  Q('C5-B17-M2-Q01', 1, 'Cho (O; R), (O′; r) với R > r và OO′ = d. Hai đường tròn tiếp xúc ngoài khi:', ['d = R + r', 'd = R − r', 'd < R + r', 'd > R + r'], e3('E-HDT-02')),
  Q('C5-B17-M2-Q02', 1, 'Cho (O; R), (O′; r) với R > r và OO′ = d. Hai đường tròn cắt nhau khi:', ['R − r < d < R + r', 'd = R + r', 'd > R + r', 'd < R − r'], e3('E-HDT-02')),
  Q('C5-B17-M2-Q03', 2, 'Cho (O; 5 cm), (O′; 3 cm), OO′ = 8 cm. Hai đường tròn:', ['tiếp xúc ngoài', 'cắt nhau', 'tiếp xúc trong', 'ở ngoài nhau'], e3('E-HDT-02')),
  Q('C5-B17-M2-Q04', 2, 'Cho (O; 5 cm), (O′; 3 cm), OO′ = 2 cm. Hai đường tròn:', ['tiếp xúc trong', 'tiếp xúc ngoài', 'cắt nhau', 'đựng nhau'], e3('E-HDT-02')),
  Q('C5-B17-M2-Q05', 3, 'Cho (O; 6 cm), (O′; 4 cm), OO′ = 7 cm. Hai đường tròn:', ['cắt nhau', 'tiếp xúc ngoài', 'ở ngoài nhau', 'đựng nhau'], e3('E-HDT-02')),
  Q('C5-B17-M2-Q06', 3, 'Cho (O; 4 cm), (O′; 1 cm), OO′ = 2 cm. Hai đường tròn:', ['(O) đựng (O′)', 'cắt nhau', 'tiếp xúc trong', 'ở ngoài nhau'], e3('E-HDT-02')),
  Q('C5-B17-M2-Q07', 4, 'Hai đường tròn (O; 7 cm) và (O′; r) tiếp xúc ngoài, OO′ = 12 cm. Bán kính r là:', ['5 cm', '19 cm', '12 cm', '7 cm'], e3('E-HDT-02')),
  Q('C5-B17-M2-Q08', 4, 'Hai đường tròn (O; R) và (O′; 3 cm) tiếp xúc trong, OO′ = 4 cm và R > 3 cm. Bán kính R là:', ['7 cm', '1 cm', '4 cm', '12 cm'], e3('E-HDT-02'))
];

// ---------------------------------------------------------------------------
// BỔ SUNG 22/11/2026: mỗi mục 8 → 16 câu, phân bố 4 🌱 · 5 🌿 · 4 🌳 · 3 ⭐. Đáp án đã tính lại bằng máy. BẢN NHÁP chờ duyệt.
// ---------------------------------------------------------------------------
const CAU_MOI = [
  // ---------- C5-B13-M1
  Q('C5-B13-M1-Q09', 1, 'Cho (O; 4 cm) và điểm M với OM = 6 cm. Điểm M nằm:', ['bên ngoài đường tròn', 'bên trong đường tròn', 'trên đường tròn', 'tại tâm O'], e3('E-DTR-01')),
  Q('C5-B13-M1-Q10', 1, 'Đường tròn có bán kính 7 cm thì đường kính là:', ['14 cm', '7 cm', '3,5 cm', '49 cm'], e3('E-DTR-01')),
  Q('C5-B13-M1-Q11', 2, 'Cho (O; 5 cm). Điểm nào nằm trên đường tròn?', ['Điểm A với OA = 5 cm', 'Điểm B với OB = 10 cm', 'Điểm C với OC = 2,5 cm', 'Điểm D với OD = 0 cm'], e3('E-DTR-01')),
  Q('C5-B13-M1-Q12', 2, 'Cho đoạn thẳng AB = 6 cm. Đường tròn đường kính AB có tâm và bán kính là:', ['Trung điểm của AB; 3 cm', 'Điểm A; 6 cm', 'Trung điểm của AB; 6 cm', 'Điểm B; 3 cm'], e3('E-DTR-01')),
  Q('C5-B13-M1-Q13', 3, 'Trong mặt phẳng toạ độ, cho điểm M(6; 8) và đường tròn tâm O(0; 0) bán kính 10. Điểm M nằm:', ['trên đường tròn', 'bên trong đường tròn', 'bên ngoài đường tròn', 'tại tâm'], e3('E-DTR-01')),
  Q('C5-B13-M1-Q14', 3, 'Tam giác ABC vuông tại A có AB = 5 cm, AC = 12 cm. Bán kính đường tròn đi qua ba điểm A, B, C là:', ['6,5 cm', '13 cm', '6 cm', '8,5 cm'], e3('E-DTR-01')),
  Q('C5-B13-M1-Q15', 4, 'Hình vuông ABCD cạnh 4 cm. Bán kính đường tròn đi qua bốn đỉnh của hình vuông là:', ['2√2 cm', '4√2 cm', '2 cm', '4 cm'], e3('E-DTR-01')),
  Q('C5-B13-M1-Q16', 4, 'Một loa phát thanh đặt tại O nghe rõ trong bán kính 300 m. Nhà An cách O 0,25 km, nhà Bình cách O 350 m. Khẳng định đúng là:', ['Nhà An nghe rõ, nhà Bình không', 'Nhà Bình nghe rõ, nhà An không', 'Cả hai đều nghe rõ', 'Cả hai đều không nghe rõ'], e3('E-DTR-01')),
  // ---------- C5-B13-M2
  Q('C5-B13-M2-Q09', 1, 'Đường thẳng chứa một đường kính của đường tròn là:', ['một trục đối xứng của đường tròn', 'tâm đối xứng của đường tròn', 'một tiếp tuyến của đường tròn', 'đường thẳng không cắt đường tròn'], e3('E-DTR-02')),
  Q('C5-B13-M2-Q10', 1, 'Cho điểm A thuộc (O). Điểm đối xứng với A qua tâm O là:', ['đầu kia của đường kính đi qua A', 'chính điểm A', 'tâm O', 'một điểm nằm ngoài (O)'], e3('E-DTR-02')),
  Q('C5-B13-M2-Q11', 2, 'Hai điểm A, B thuộc (O) và đối xứng nhau qua O. Khi đó AB là:', ['một đường kính của (O)', 'một bán kính của (O)', 'một tiếp tuyến của (O)', 'một dây không đi qua tâm'], e3('E-DTR-02')),
  Q('C5-B13-M2-Q12', 2, 'Cho điểm M thuộc (O). Lấy M′ đối xứng với M qua một đường thẳng d đi qua O. Khẳng định đúng là:', ['M′ thuộc (O)', 'M′ nằm trong (O)', 'M′ nằm ngoài (O)', 'M′ trùng với O'], e3('E-DTR-02')),
  Q('C5-B13-M2-Q13', 3, 'Trên (O; 6 cm) lấy điểm A. Gọi B là điểm đối xứng với A qua O, C là điểm đối xứng với A qua một đường thẳng d đi qua O (C khác A). Khẳng định đúng là:', ['AB = 12 cm và C thuộc (O)', 'AB = 6 cm và C thuộc (O)', 'AB = 12 cm và C nằm ngoài (O)', 'AB = 6 cm và C nằm trong (O)'], e3('E-DTR-02')),
  Q('C5-B13-M2-Q14', 3, 'Cho dây AB của (O) không đi qua tâm, H là trung điểm của AB. Đường thẳng OH:', ['vuông góc với AB và là một trục đối xứng của (O)', 'song song với AB', 'đi qua điểm A', 'không phải là trục đối xứng của (O)'], e3('E-DTR-02')),
  Q('C5-B13-M2-Q15', 4, 'Gấp đôi một tờ giấy hình tròn sao cho hai nửa trùng khít nhau. Nếp gấp luôn:', ['đi qua tâm của hình tròn', 'song song với một đường kính cho trước', 'tiếp xúc với đường tròn', 'là một bán kính'], e3('E-DTR-02')),
  Q('C5-B13-M2-Q16', 4, 'Để tìm tâm của một chiếc đĩa giấy tròn, bạn Nam gấp đĩa hai lần theo hai nếp gấp khác nhau, mỗi lần hai nửa trùng khít. Tâm của đĩa là:', ['giao điểm của hai nếp gấp', 'một điểm bất kì trên nếp gấp thứ nhất', 'một điểm trên mép đĩa', 'không xác định được'], e3('E-DTR-02')),
  // ---------- C5-B14-M1
  Q('C5-B14-M1-Q09', 1, 'Dây đi qua tâm của đường tròn gọi là:', ['đường kính', 'bán kính', 'cung', 'tiếp tuyến'], e3('E-CD-01')),
  Q('C5-B14-M1-Q10', 1, 'Cho (O; 4 cm). Độ dài đường kính là:', ['8 cm', '4 cm', '2 cm', '16 cm'], e3('E-CD-01')),
  Q('C5-B14-M1-Q11', 2, 'Cho (O; 10 cm), dây AB = 12 cm. Khoảng cách từ O đến dây AB là:', ['8 cm', '6 cm', '√44 cm', '2 cm'], e3('E-CD-01')),
  Q('C5-B14-M1-Q12', 2, 'Cho (O; 5 cm), dây AB cách tâm 4 cm. Độ dài dây AB là:', ['6 cm', '3 cm', '√41 cm', '9 cm'], e3('E-CD-01')),
  Q('C5-B14-M1-Q13', 2, 'Trong (O; R), dây AB đi qua tâm O. Khi đó:', ['AB là đường kính, AB = 2R', 'AB = R', 'AB < R', 'AB > 2R'], e3('E-CD-01')),
  Q('C5-B14-M1-Q14', 3, 'Cho (O; 6 cm), dây AB = 6√3 cm. Khoảng cách từ O đến dây AB là:', ['3 cm', '6 cm', '3√3 cm', '9 cm'], e3('E-CD-01')),
  Q('C5-B14-M1-Q15', 3, 'Hai dây AB và CD của (O; 5 cm) có AB = 8 cm, CD = 6 cm. Khẳng định đúng là:', ['AB gần tâm hơn CD (3 cm so với 4 cm)', 'CD gần tâm hơn AB', 'AB và CD cách đều tâm', 'Không so sánh được'], e3('E-CD-01')),
  Q('C5-B14-M1-Q16', 4, 'Một ống nước có mặt cắt là đường tròn bán kính 13 cm. Mặt nước trong ống là một dây cung dài 24 cm. Khoảng cách từ tâm ống đến mặt nước là:', ['5 cm', '12 cm', '11 cm', '√313 cm'], e3('E-CD-01')),
  // ---------- C5-B14-M2
  Q('C5-B14-M2-Q09', 1, 'Góc ở tâm AOB = 50°. Số đo cung nhỏ AB là:', ['50°', '25°', '100°', '310°'], e3('E-CD-02')),
  Q('C5-B14-M2-Q10', 1, 'Cung nửa đường tròn có số đo:', ['180°', '90°', '360°', '100°'], e3('E-CD-02')),
  Q('C5-B14-M2-Q11', 2, 'Góc ở tâm AOB = 110°. Số đo cung lớn AB là:', ['250°', '110°', '70°', '220°'], e3('E-CD-02')),
  Q('C5-B14-M2-Q12', 3, 'Bốn đỉnh của hình vuông ABCD nằm trên (O). Số đo góc ở tâm AOB là:', ['90°', '45°', '60°', '180°'], e3('E-CD-02')),
  Q('C5-B14-M2-Q13', 3, 'Lúc 2 giờ, kim giờ và kim phút của đồng hồ tạo thành góc ở tâm có số đo:', ['60°', '30°', '120°', '90°'], e3('E-CD-02')),
  Q('C5-B14-M2-Q14', 3, 'Cung lớn AB có số đo 220°. Góc ở tâm AOB (chắn cung nhỏ AB) bằng:', ['140°', '220°', '110°', '70°'], e3('E-CD-02')),
  Q('C5-B14-M2-Q15', 4, 'Từ 12 giờ đến 12 giờ 25 phút, kim phút đã quay được một góc ở tâm bằng:', ['150°', '25°', '125°', '75°'], e3('E-CD-02')),
  Q('C5-B14-M2-Q16', 4, 'Lục giác đều ABCDEF có các đỉnh nằm trên (O). Số đo cung nhỏ AC là:', ['120°', '60°', '240°', '90°'], e3('E-CD-02')),
  // ---------- C5-B14-M3
  Q('C5-B14-M3-Q09', 1, 'Điểm C nằm trên cung nhỏ AB, sđ cung AC = 50°, sđ cung CB = 35°. Số đo cung nhỏ AB là:', ['85°', '15°', '275°', '42,5°'], e3('E-CD-03')),
  Q('C5-B14-M3-Q10', 1, 'Trong một đường tròn, hai dây bằng nhau căng hai cung nhỏ:', ['bằng nhau', 'khác nhau', 'có tổng bằng 180°', 'có tổng bằng 90°'], e3('E-CD-03')),
  Q('C5-B14-M3-Q11', 2, 'Cung nhỏ AB có số đo 70°. Số đo cung lớn AB là:', ['290°', '70°', '110°', '140°'], e3('E-CD-03')),
  Q('C5-B14-M3-Q12', 2, 'Trên (O), cung nhỏ AB = 45°, cung nhỏ CD = 75°. Khẳng định đúng là:', ['Dây CD dài hơn dây AB', 'Dây AB dài hơn dây CD', 'Hai dây bằng nhau', 'Không so sánh được'], e3('E-CD-03')),
  Q('C5-B14-M3-Q13', 2, 'Ba điểm A, B, C chia đường tròn thành ba cung bằng nhau. Số đo mỗi cung là:', ['120°', '60°', '90°', '180°'], e3('E-CD-03')),
  Q('C5-B14-M3-Q14', 3, 'Cho (O; R), dây AB = R√2. Số đo cung lớn AB là:', ['270°', '90°', '45°', '315°'], e3('E-CD-03')),
  Q('C5-B14-M3-Q15', 3, 'Bốn điểm A, B, C, D theo thứ tự trên đường tròn tạo thành bốn cung AB, BC, CD, DA có số đo lần lượt 70°, 110°, 70° và x. Khẳng định đúng là:', ['x = 110° và dây AB = dây CD', 'x = 110° và dây AB > dây CD', 'x = 70° và dây AB = dây CD', 'x = 250° và dây AB < dây CD'], e3('E-CD-03')),
  Q('C5-B14-M3-Q16', 4, 'Bánh xe có 8 nan hoa chia đều quanh trục. Nan hoa thứ 1 và nan hoa thứ 4 tạo thành góc ở tâm bằng:', ['135°', '45°', '120°', '225°'], e3('E-CD-03')),
  // ---------- C5-B15-M1
  Q('C5-B15-M1-Q09', 1, 'Chu vi đường tròn đường kính d là:', ['πd', '2πd', 'πd²', 'πd/2'], e3('E-QH-01')),
  Q('C5-B15-M1-Q10', 1, 'Độ dài cung 180° của đường tròn bán kính R là:', ['πR', '2πR', 'πR/2', 'πR²'], e3('E-QH-01')),
  Q('C5-B15-M1-Q11', 2, 'Độ dài cung 45° của đường tròn bán kính 8 cm là:', ['2π cm', 'π cm', '4π cm', '16π cm'], e3('E-QH-01')),
  Q('C5-B15-M1-Q12', 2, 'Độ dài cung 120° của đường tròn bán kính 3 cm là:', ['2π cm', 'π cm', '3π cm', '6π cm'], e3('E-QH-01')),
  Q('C5-B15-M1-Q13', 2, 'Chu vi đường tròn bán kính 10 cm (lấy π ≈ 3,14) là:', ['62,8 cm', '31,4 cm', '314 cm', '125,6 cm'], e3('E-QH-01')),
  Q('C5-B15-M1-Q14', 3, 'Một cung tròn dài 5π cm và có số đo 150°. Bán kính của đường tròn là:', ['6 cm', '12 cm', '3 cm', '5 cm'], e3('E-QH-01')),
  Q('C5-B15-M1-Q15', 3, 'Bánh xe có bán kính 35 cm. Để đi được quãng đường 1 099 m thì bánh xe phải lăn (lấy π ≈ 3,14):', ['500 vòng', '1 000 vòng', '250 vòng', '157 vòng'], e3('E-QH-01')),
  Q('C5-B15-M1-Q16', 4, 'Kim giờ của đồng hồ dài 6 cm. Từ 1 giờ đến 4 giờ, đầu kim giờ vạch nên một cung tròn dài:', ['3π cm', '6π cm', 'π cm', '12π cm'], e3('E-QH-01')),
  // ---------- C5-B15-M2
  Q('C5-B15-M2-Q09', 1, 'Diện tích hình quạt tròn bán kính R, độ dài cung l là:', ['lR/2', 'lR', 'l²R/2', '2lR'], e3('E-QH-02')),
  Q('C5-B15-M2-Q10', 1, 'Hình quạt tròn ứng với cung 360° chính là:', ['hình tròn', 'nửa hình tròn', 'hình vành khuyên', 'một phần tư hình tròn'], e3('E-QH-02')),
  Q('C5-B15-M2-Q11', 2, 'Diện tích hình quạt tròn bán kính 4 cm, cung 90° là:', ['4π cm²', '8π cm²', '16π cm²', '2π cm²'], e3('E-QH-02')),
  Q('C5-B15-M2-Q12', 2, 'Diện tích nửa hình tròn bán kính 6 cm là:', ['18π cm²', '36π cm²', '6π cm²', '12π cm²'], e3('E-QH-02')),
  Q('C5-B15-M2-Q13', 2, 'Hình quạt tròn bán kính 10 cm có độ dài cung 6π cm. Diện tích hình quạt là:', ['30π cm²', '60π cm²', '100π cm²', '3π cm²'], e3('E-QH-02')),
  Q('C5-B15-M2-Q14', 3, 'Diện tích hình quạt tròn bán kính 9 cm, cung 40° là:', ['9π cm²', '18π cm²', '81π cm²', '4π cm²'], e3('E-QH-02')),
  Q('C5-B15-M2-Q15', 4, 'Hình quạt tròn bán kính 12 cm có diện tích 24π cm². Độ dài cung của hình quạt là:', ['4π cm', '2π cm', '8π cm', 'π cm'], e3('E-QH-02')),
  Q('C5-B15-M2-Q16', 4, 'Một đèn pha chiếu sáng vùng hình quạt bán kính 30 m, góc 60°. Diện tích vùng được chiếu sáng (lấy π ≈ 3,14) là:', ['471 m²', '942 m²', '2 826 m²', '94,2 m²'], e3('E-QH-02')),
  // ---------- C5-B15-M3
  Q('C5-B15-M3-Q09', 1, 'Hai đường tròn đồng tâm là hai đường tròn:', ['có chung tâm', 'có cùng bán kính', 'tiếp xúc nhau', 'cắt nhau tại hai điểm'], e3('E-QH-03')),
  Q('C5-B15-M3-Q10', 1, 'Hình vành khuyên giới hạn bởi (O; 4 cm) và (O; 2 cm). Bán kính đường tròn ngoài là:', ['4 cm', '2 cm', '6 cm', '8 cm'], e3('E-QH-03')),
  Q('C5-B15-M3-Q11', 2, 'Diện tích hình vành khuyên với R = 6 cm, r = 4 cm là:', ['20π cm²', '4π cm²', '100π cm²', '52π cm²'], e3('E-QH-03')),
  Q('C5-B15-M3-Q12', 2, 'Diện tích hình vành khuyên giới hạn bởi hai đường tròn đồng tâm có đường kính 10 cm và 6 cm là:', ['16π cm²', '64π cm²', '4π cm²', '34π cm²'], e3('E-QH-03')),
  Q('C5-B15-M3-Q13', 2, 'Diện tích hình vành khuyên với R = 3 cm, r = 2 cm (lấy π ≈ 3,14) là:', ['15,7 cm²', '3,14 cm²', '40,82 cm²', '6,28 cm²'], e3('E-QH-03')),
  Q('C5-B15-M3-Q14', 3, 'Một sân hình tròn bán kính 10 m, ở giữa có bồn cây hình tròn bán kính 2 m cùng tâm. Diện tích phần sân còn lại là:', ['96π m²', '64π m²', '100π m²', '8π m²'], e3('E-QH-03')),
  Q('C5-B15-M3-Q15', 3, 'Hình vành khuyên có bán kính ngoài R = 2r (r là bán kính trong) và diện tích 27π cm². Bán kính r là:', ['3 cm', '√27 cm', '9 cm', '1,5 cm'], e3('E-QH-03')),
  Q('C5-B15-M3-Q16', 4, 'Mặt một chiếc nhẫn là hình vành khuyên có đường kính ngoài 2,2 cm, đường kính trong 1,8 cm. Diện tích mặt nhẫn là:', ['0,4π cm²', '0,04π cm²', '1,6π cm²', '0,16π cm²'], e3('E-QH-03')),
  // ---------- C5-B16-M1
  Q('C5-B16-M1-Q09', 1, 'Đường thẳng a tiếp xúc với (O; R) khi khoảng cách d từ O đến a thoả mãn:', ['d = R', 'd < R', 'd > R', 'd = 0'], e3('E-TT-01')),
  Q('C5-B16-M1-Q10', 1, 'Đường thẳng a và (O; R) không giao nhau khi khoảng cách d từ O đến a thoả mãn:', ['d > R', 'd < R', 'd = R', 'd = 0'], e3('E-TT-01')),
  Q('C5-B16-M1-Q11', 2, 'Cho (O; 3 cm) và đường thẳng a cách O một khoảng 2 cm. Số điểm chung của a và đường tròn là:', ['2', '1', '0', '3'], e3('E-TT-01')),
  Q('C5-B16-M1-Q12', 2, 'Đường thẳng a đi qua tâm O của (O; R). Khi đó a và (O):', ['cắt nhau tại hai điểm', 'tiếp xúc nhau', 'không giao nhau', 'có đúng một điểm chung'], e3('E-TT-01')),
  Q('C5-B16-M1-Q13', 3, 'Trong mặt phẳng toạ độ, đường tròn tâm I(−3; 4) bán kính 3 và trục Oy:', ['tiếp xúc nhau', 'cắt nhau', 'không giao nhau', 'có vô số điểm chung'], e3('E-TT-01')),
  Q('C5-B16-M1-Q14', 3, 'Đường thẳng a cắt (O; 10 cm) tại hai điểm A, B với AB = 16 cm. Khoảng cách từ O đến a là:', ['6 cm', '8 cm', '√356 cm', '2 cm'], e3('E-TT-01')),
  Q('C5-B16-M1-Q15', 4, 'Điểm O cách đường thẳng a một khoảng 4 cm. Đường tròn (O; R) và a có đúng một điểm chung khi:', ['R = 4 cm', 'R > 4 cm', 'R < 4 cm', 'R = 8 cm'], e3('E-TT-01')),
  Q('C5-B16-M1-Q16', 4, 'Một bánh xe bán kính 30 cm đứng yên trên mặt đường phẳng. Khoảng cách từ tâm bánh xe đến mặt đường là:', ['30 cm', '60 cm', '15 cm', '0 cm'], e3('E-TT-01')),
  // ---------- C5-B16-M2
  Q('C5-B16-M2-Q09', 1, 'Tại một điểm A cho trước trên (O), ta vẽ được bao nhiêu tiếp tuyến của (O)?', ['1', '2', '0', 'Vô số'], e3('E-TT-02')),
  Q('C5-B16-M2-Q10', 1, 'Tiếp tuyến của (O) tại A và bán kính OA tạo thành góc:', ['90°', '45°', '180°', '60°'], e3('E-TT-02')),
  Q('C5-B16-M2-Q11', 2, 'MA là tiếp tuyến của (O; 5 cm) tại A, OM = 13 cm. Độ dài MA là:', ['12 cm', '8 cm', '√194 cm', '18 cm'], e3('E-TT-02')),
  Q('C5-B16-M2-Q12', 2, 'Cho (O; R) và điểm A thuộc (O). Đường thẳng a đi qua A và vuông góc với OA. Khẳng định đúng là:', ['a là tiếp tuyến của (O) tại A', 'a cắt (O) tại hai điểm', 'a đi qua O', 'a không có điểm chung với (O)'], e3('E-TT-02')),
  Q('C5-B16-M2-Q13', 3, 'MA là tiếp tuyến của (O) tại A, MA = 8 cm, OM = 10 cm. Bán kính của (O) là:', ['6 cm', '2 cm', '√164 cm', '18 cm'], e3('E-TT-02')),
  Q('C5-B16-M2-Q14', 3, 'MA là tiếp tuyến của (O; 6 cm) tại A, góc AOM = 60°. Độ dài MA là:', ['6√3 cm', '12 cm', '2√3 cm', '3 cm'], e3('E-TT-02')),
  Q('C5-B16-M2-Q15', 4, 'Từ đỉnh ngọn hải đăng cao 0,05 km so với mặt biển, tầm nhìn xa nhất là đoạn tiếp tuyến kẻ từ đỉnh tới mặt Trái Đất. Xem Trái Đất là hình cầu bán kính 6 400 km. Tầm nhìn xa nhất khoảng (làm tròn đến km):', ['25 km', '80 km', '640 km', '6 km'], e3('E-TT-02')),
  Q('C5-B16-M2-Q16', 4, 'MA là tiếp tuyến của (O; 5 cm) tại A. Đoạn OM cắt (O) tại B và MB = 8 cm. Độ dài MA là:', ['12 cm', '8 cm', '√89 cm', '13 cm'], e3('E-TT-02')),
  // ---------- C5-B16-M3
  Q('C5-B16-M3-Q09', 1, 'Từ một điểm M nằm ngoài (O) kẻ được bao nhiêu tiếp tuyến với (O)?', ['2', '1', '0', 'Vô số'], e3('E-TT-03')),
  Q('C5-B16-M3-Q10', 1, 'Từ điểm M nằm ngoài (O) kẻ hai tiếp tuyến MA, MB (A, B là tiếp điểm). Tia OM là tia phân giác của góc:', ['AOB', 'OAM', 'OBM', 'MAB'], e3('E-TT-03')),
  Q('C5-B16-M3-Q11', 2, 'MA, MB là hai tiếp tuyến của (O) (A, B là tiếp điểm), MA = 7 cm. Độ dài MB là:', ['7 cm', '14 cm', '3,5 cm', 'Không tính được'], e3('E-TT-03')),
  Q('C5-B16-M3-Q12', 2, 'MA, MB là hai tiếp tuyến của (O) (A, B là tiếp điểm), góc AMB = 80°. Số đo góc AOB là:', ['100°', '80°', '40°', '160°'], e3('E-TT-03')),
  Q('C5-B16-M3-Q13', 2, 'MA, MB là hai tiếp tuyến của (O) (A, B là tiếp điểm), góc AMB = 50°. Số đo góc AMO là:', ['25°', '50°', '100°', '65°'], e3('E-TT-03')),
  Q('C5-B16-M3-Q14', 3, 'MA, MB là hai tiếp tuyến của (O; 3 cm) (A, B là tiếp điểm), OM = 5 cm. Độ dài dây AB là:', ['4,8 cm', '2,4 cm', '4 cm', '8 cm'], e3('E-TT-03')),
  Q('C5-B16-M3-Q15', 3, 'MA, MB là hai tiếp tuyến của (O; 4 cm) (A, B là tiếp điểm), góc AMB = 90°. Tứ giác OAMB là:', ['hình vuông cạnh 4 cm', 'hình chữ nhật có hai cạnh khác nhau', 'hình thoi có một góc 60°', 'hình thang vuông'], e3('E-TT-03')),
  Q('C5-B16-M3-Q16', 4, 'Đường tròn (I) tiếp xúc với ba cạnh của tam giác ABC vuông tại A có AB = 6, AC = 8; tiếp điểm trên AB là D. Độ dài AD là:', ['2', '4', '3', '5'], e3('E-TT-03')),
  // ---------- C5-B17-M1
  Q('C5-B17-M1-Q09', 1, 'Hai đường tròn không có điểm chung nào thì hai đường tròn đó:', ['không giao nhau', 'tiếp xúc nhau', 'cắt nhau', 'trùng nhau'], e3('E-HDT-01')),
  Q('C5-B17-M1-Q10', 1, 'Đường thẳng đi qua tâm của hai đường tròn gọi là:', ['đường nối tâm', 'dây chung', 'tiếp tuyến chung', 'bán kính chung'], e3('E-HDT-01')),
  Q('C5-B17-M1-Q11', 2, 'Hai đường tròn tiếp xúc nhau thì tiếp điểm:', ['nằm trên đường nối tâm', 'nằm ngoài đường nối tâm', 'luôn là trung điểm của đoạn nối tâm', 'không xác định được'], e3('E-HDT-01')),
  Q('C5-B17-M1-Q12', 2, 'Đối với hình gồm hai đường tròn có tâm khác nhau, đường nối tâm là:', ['trục đối xứng của hình', 'tâm đối xứng của hình', 'dây chung của hai đường tròn', 'một tiếp tuyến chung'], e3('E-HDT-01')),
  Q('C5-B17-M1-Q13', 3, '(O) và (O′) cắt nhau tại A và B; OO′ cắt AB tại H. Khẳng định đúng là:', ['H là trung điểm của AB và OO′ ⊥ AB', 'H trùng với O', 'AB = OO′', 'OO′ song song với AB'], e3('E-HDT-01')),
  Q('C5-B17-M1-Q14', 3, 'Hai đường tròn (O; 5 cm) và (O′; 5 cm) cắt nhau tại A, B với OO′ = 8 cm. Độ dài dây chung AB là:', ['6 cm', '3 cm', '8 cm', '10 cm'], e3('E-HDT-01')),
  Q('C5-B17-M1-Q15', 4, 'Hai bánh răng ăn khớp nhau được xem như hai đường tròn tiếp xúc ngoài. Tâm của hai bánh răng và điểm tiếp xúc:', ['thẳng hàng', 'tạo thành một tam giác vuông', 'tạo thành một tam giác đều', 'không xác định được'], e3('E-HDT-01')),
  Q('C5-B17-M1-Q16', 4, 'Vẽ (O; 3 cm) và (O′; 3 cm) sao cho O′ nằm trên (O). Hai đường tròn:', ['cắt nhau', 'tiếp xúc ngoài', 'tiếp xúc trong', 'không giao nhau'], e3('E-HDT-01')),
  // ---------- C5-B17-M2
  Q('C5-B17-M2-Q09', 1, 'Cho (O; R), (O′; r) với R > r và OO′ = d. Hai đường tròn tiếp xúc trong khi:', ['d = R − r', 'd = R + r', 'd > R + r', 'd = 0'], e3('E-HDT-02')),
  Q('C5-B17-M2-Q10', 1, 'Cho (O; R), (O′; r) với R > r và OO′ = d. Hai đường tròn ở ngoài nhau khi:', ['d > R + r', 'd < R − r', 'd = R + r', 'R − r < d < R + r'], e3('E-HDT-02')),
  Q('C5-B17-M2-Q11', 2, 'Cho (O; 4 cm), (O′; 2 cm), OO′ = 6 cm. Hai đường tròn:', ['tiếp xúc ngoài', 'cắt nhau', 'tiếp xúc trong', 'ở ngoài nhau'], e3('E-HDT-02')),
  Q('C5-B17-M2-Q12', 2, 'Cho (O; 4 cm), (O′; 2 cm), OO′ = 9 cm. Hai đường tròn:', ['ở ngoài nhau', 'tiếp xúc ngoài', 'cắt nhau', 'đựng nhau'], e3('E-HDT-02')),
  Q('C5-B17-M2-Q13', 2, 'Cho (O; 4 cm), (O′; 2 cm), OO′ = 1 cm. Hai đường tròn:', ['(O) đựng (O′)', 'cắt nhau', 'tiếp xúc trong', 'ở ngoài nhau'], e3('E-HDT-02')),
  Q('C5-B17-M2-Q14', 3, 'Hai đường tròn (O; 5 cm) và (O′; r) cắt nhau, OO′ = 7 cm. Giá trị nào của r thoả mãn?', ['r = 4 cm', 'r = 2 cm', 'r = 1 cm', 'r = 13 cm'], e3('E-HDT-02')),
  Q('C5-B17-M2-Q15', 3, 'Cho (O; 6 cm) và (O′; 2 cm) tiếp xúc trong. Độ dài OO′ là:', ['4 cm', '8 cm', '3 cm', '12 cm'], e3('E-HDT-02')),
  Q('C5-B17-M2-Q16', 4, 'Hai đồng xu bán kính 1,2 cm và 1 cm đặt trên mặt bàn, tiếp xúc ngoài nhau. Khoảng cách giữa hai tâm là:', ['2,2 cm', '0,2 cm', '1,1 cm', '4,4 cm'], e3('E-HDT-02'))
];

// Hình đường tròn vẽ bằng SVG (QuestionFigure, loai 'duong-tron'). Chỉ gắn cho câu tính toán, không gắn cho câu
// hỏi vị trí tương đối (hình sẽ lộ đáp án). Hình minh hoạ, không đúng tỉ lệ.
const TEN_MAU = { day: 'Đường tròn tâm O, dây AB, OH vuông góc với AB tại H', 'goc-tam': 'Đường tròn tâm O, góc ở tâm AOB chắn cung AB',
  quat: 'Hình quạt tròn OAB', 'vanh-khuyen': 'Hình vành khuyên giới hạn bởi hai đường tròn đồng tâm O',
  'tiep-tuyen': 'Đường tròn tâm O, MA là tiếp tuyến tại A', 'hai-tiep-tuyen': 'Đường tròn tâm O, hai tiếp tuyến MA, MB',
  'day-chung': 'Hai đường tròn (O) và (O′) cắt nhau tại A, B; OO′ cắt AB tại H' };
const TEN_NHAN = { R: 'bán kính', r: 'bán kính trong', d: 'khoảng cách', day: 'dây', goc: 'góc', cung: 'cung', MA: 'MA', OM: 'OM', MB: 'MB' };
const DT = (mau, nhan, them = {}) => ({ loai: 'duong-tron', chuong: 'C5', mau, nhan, ...them,
  moTa: TEN_MAU[mau] + '; ' + Object.entries(nhan).map(([k, v]) => `${TEN_NHAN[k]} ${v.replace(/\s*=\s*\?$/, '').trim() === v && v !== '?' ? v : (v === '?' ? 'cần tìm' : v.replace(/\s*=\s*\?$/, '') + ' cần tìm')}`).join(', ') + '.' });
const DT_DAY = (cfg) => ({ loai: 'duong-tron-day', chuong: 'C5', ...cfg });
const QVK = (kieu, R, goc, r, nhan, moTa, extra = {}) => ({
  loai: 'quat-vanh-khuyen', chuong: 'C5', kieu, R, ...(goc != null ? { goc } : {}), ...(r != null ? { r } : {}), nhan, moTa, ...extra
});
const TT = (kieu, cfg) => ({ loai: 'tiep-tuyen', chuong: 'C5', kieu, ...cfg });
const HDT = (R, r, d, nhan, moTa, extra = {}) => ({ loai: 'hai-duong-tron', chuong: 'C5', R, r, d, nhan, moTa, ...extra });

const HINH = {
  // ---------- Bài 13 (mới bổ sung 6 câu)
  'C5-B13-M1-Q06': DT_DAY({
    diem: [{ ten: 'B', goc: 180 }, { ten: 'C', goc: 0 }, { ten: 'A', goc: 112 }],
    daGiac: { dinh: ['A', 'B', 'C'], chinh: true },
    doan: [{ tu: 'B', den: 'C', chinh: true, nhan: '10 cm' }, { tu: 'O', den: 'A', netDut: true, nhan: 'R = ?' }],
    vuongTai: [{ dinh: 'A', a: 'B', b: 'C' }],
    moTa: 'Tam giác ABC vuông tại A nội tiếp đường tròn (O), cạnh huyền BC = 10 cm, bán kính R cần tìm.'
  }),
  'C5-B13-M1-Q07': DT_DAY({
    diem: [{ ten: 'A', goc: 127 }, { ten: 'B', goc: 53 }, { ten: 'C', goc: 307 }, { ten: 'D', goc: 233 }],
    daGiac: { dinh: ['A', 'B', 'C', 'D'], chinh: true },
    doan: [{ tu: 'A', den: 'B', nhan: '6 cm' }, { tu: 'B', den: 'C', nhan: '8 cm' }, { tu: 'O', den: 'A', netDut: true, nhan: 'R = ?' }],
    vuongTai: [{ dinh: 'B', a: 'A', b: 'C' }],
    moTa: 'Hình chữ nhật ABCD với AB = 6 cm, BC = 8 cm nội tiếp (O); cần tìm bán kính R.'
  }),
  'C5-B13-M1-Q12': DT_DAY({
    anTam: true,
    diem: [{ ten: 'A', goc: 180 }, { ten: 'B', goc: 0 }],
    doan: [{ tu: 'A', den: 'B', chinh: true, nhan: 'AB = 6 cm' }],
    moTa: 'Đoạn thẳng AB = 6 cm là đường kính của đường tròn cần xác định tâm và bán kính.'
  }),
  'C5-B13-M1-Q14': DT_DAY({
    diem: [{ ten: 'B', goc: 180 }, { ten: 'C', goc: 0 }, { ten: 'A', goc: 135 }],
    daGiac: { dinh: ['A', 'B', 'C'], chinh: true },
    doan: [{ tu: 'A', den: 'B', nhan: '5 cm' }, { tu: 'A', den: 'C', nhan: '12 cm' }, { tu: 'O', den: 'A', netDut: true, nhan: 'R = ?' }],
    vuongTai: [{ dinh: 'A', a: 'B', b: 'C' }],
    moTa: 'Tam giác ABC vuông tại A, AB = 5 cm, AC = 12 cm nội tiếp (O); cần tìm bán kính R.'
  }),
  'C5-B13-M1-Q15': DT_DAY({
    diem: [{ ten: 'A', goc: 135 }, { ten: 'B', goc: 45 }, { ten: 'C', goc: 315 }, { ten: 'D', goc: 225 }],
    daGiac: { dinh: ['A', 'B', 'C', 'D'], chinh: true },
    doan: [{ tu: 'A', den: 'B', nhan: '4 cm' }, { tu: 'O', den: 'B', netDut: true, nhan: 'R = ?' }],
    vuongTai: [{ dinh: 'A', a: 'D', b: 'B' }],
    moTa: 'Hình vuông ABCD cạnh 4 cm nội tiếp đường tròn (O); cần tìm bán kính R.'
  }),
  'C5-B13-M2-Q06': DT_DAY({
    diem: [{ ten: 'A', goc: 35 }, { ten: 'A′', goc: 215 }],
    doan: [{ tu: 'O', den: 'A', chinh: true, nhan: '5 cm' }, { tu: 'O', den: 'A′', netDut: true, nhan: '5 cm' }],
    moTa: 'Đường tròn (O; 5 cm), A thuộc (O) và A′ đối xứng với A qua O; cần tìm độ dài AA′.'
  }),

  // ---------- Bài 14 (giữ cũ + bổ sung 22 câu)
  'C5-B14-M1-Q03': DT('day', { R: '5 cm', day: '8 cm', d: '?' }),
  'C5-B14-M1-Q05': DT('day', { R: '13 cm', d: '5 cm', day: '?' }),
  'C5-B14-M1-Q08': DT('day', { R: '25 cm', d: '7 cm', day: '?' }),
  'C5-B14-M1-Q11': DT('day', { R: '10 cm', day: '12 cm', d: '?' }),
  'C5-B14-M1-Q12': DT('day', { R: '5 cm', d: '4 cm', day: '?' }),
  'C5-B14-M1-Q14': DT('day', { R: '6 cm', day: '6√3 cm', d: '?' }),
  'C5-B14-M1-Q16': DT('day', { R: '13 cm', day: '24 cm', d: '?' }),
  'C5-B14-M2-Q02': DT('goc-tam', { goc: '70°', cung: '?' }),
  'C5-B14-M2-Q03': DT_DAY({
    diem: [{ ten: 'A', goc: 125 }, { ten: 'B', goc: 55 }],
    doan: [{ tu: 'O', den: 'A' }, { tu: 'O', den: 'B' }],
    cung: [{ tuGoc: 55, denGoc: 125, cungGoc: true, nhanGoc: '70°' }, { tuGoc: 55, denGoc: 125, cungLon: true, toNhe: true, cungGoc: false, nhanCung: 'Cung lớn = ?' }],
    moTa: 'Góc ở tâm AOB = 70°; cần tìm số đo cung lớn AB.'
  }),
  'C5-B14-M2-Q04': DT_DAY({
    diem: [{ ten: 'A', goc: 90 }, { ten: 'B', goc: 30 }, { ten: 'C', goc: 330 }, { ten: 'D', goc: 270 }, { ten: 'E', goc: 210 }, { ten: 'F', goc: 150 }],
    doan: [{ tu: 'O', den: 'A', netDut: true }, { tu: 'O', den: 'B', netDut: true }, { tu: 'O', den: 'C', netDut: true }, { tu: 'O', den: 'D', netDut: true }, { tu: 'O', den: 'E', netDut: true }, { tu: 'O', den: 'F', netDut: true }],
    cung: [{ tuGoc: 30, denGoc: 90, toNhe: true, nhanCung: '?' }],
    moTa: 'Đường tròn chia thành 6 cung bằng nhau; cần tìm số đo mỗi cung.'
  }),
  'C5-B14-M2-Q05': DT_DAY({
    diem: [{ ten: 'A', goc: 90 }, { ten: 'B', goc: 0 }],
    doan: [{ tu: 'O', den: 'A', chinh: true }, { tu: 'O', den: 'B', chinh: true }],
    cung: [{ tuGoc: 0, denGoc: 90, cungGoc: true, nhanGoc: '?' }],
    nhanThem: [{ goc: 90, t: 0.78, text: '12' }, { goc: 0, t: 0.78, text: '3' }, { goc: 270, t: 0.78, text: '6' }, { goc: 180, t: 0.78, text: '9' }],
    moTa: 'Mặt đồng hồ lúc 3 giờ: góc ở tâm giữa kim giờ và kim phút.'
  }),
  'C5-B14-M2-Q06': DT_DAY({
    diem: [{ ten: 'A', goc: 180 }, { ten: 'B', goc: 0 }],
    doan: [{ tu: 'A', den: 'B', chinh: true }],
    cung: [{ tuGoc: 0, denGoc: 180, toNhe: true, cungGoc: false, nhanCung: 'Mỗi cung AB = ?' }],
    moTa: 'AB là đường kính của đường tròn (O); cần tìm số đo mỗi cung AB.'
  }),
  'C5-B14-M2-Q07': DT_DAY({
    diem: [{ ten: 'A', goc: 90 }, { ten: 'B', goc: 210 }, { ten: 'C', goc: 330 }],
    daGiac: { dinh: ['A', 'B', 'C'] },
    doan: [{ tu: 'O', den: 'A', chinh: true }, { tu: 'O', den: 'B', chinh: true }],
    cung: [{ tuGoc: 90, denGoc: 210, cungGoc: true, nhanGoc: '?' }],
    moTa: 'Tam giác đều ABC nội tiếp (O); cần tìm số đo góc ở tâm AOB.'
  }),
  'C5-B14-M2-Q09': DT('goc-tam', { goc: '50°', cung: '?' }),
  'C5-B14-M2-Q11': DT_DAY({
    diem: [{ ten: 'A', goc: 145 }, { ten: 'B', goc: 35 }],
    doan: [{ tu: 'O', den: 'A' }, { tu: 'O', den: 'B' }],
    cung: [{ tuGoc: 35, denGoc: 145, cungGoc: true, nhanGoc: '110°' }, { tuGoc: 35, denGoc: 145, cungLon: true, toNhe: true, cungGoc: false, nhanCung: 'Cung lớn = ?' }],
    moTa: 'Góc ở tâm AOB = 110°; cần tìm số đo cung lớn AB.'
  }),
  'C5-B14-M2-Q12': DT_DAY({
    diem: [{ ten: 'A', goc: 135 }, { ten: 'B', goc: 45 }, { ten: 'C', goc: 315 }, { ten: 'D', goc: 225 }],
    daGiac: { dinh: ['A', 'B', 'C', 'D'] },
    doan: [{ tu: 'O', den: 'A', chinh: true }, { tu: 'O', den: 'B', chinh: true }],
    cung: [{ tuGoc: 45, denGoc: 135, cungGoc: true, nhanGoc: '?' }],
    moTa: 'Hình vuông ABCD nội tiếp (O); cần tìm số đo góc ở tâm AOB.'
  }),
  'C5-B14-M2-Q13': DT_DAY({
    diem: [{ ten: 'A', goc: 90 }, { ten: 'B', goc: 30 }],
    doan: [{ tu: 'O', den: 'A', chinh: true }, { tu: 'O', den: 'B', chinh: true }],
    cung: [{ tuGoc: 30, denGoc: 90, cungGoc: true, nhanGoc: '?' }],
    nhanThem: [{ goc: 90, t: 0.78, text: '12' }, { goc: 30, t: 0.78, text: '2' }, { goc: 270, t: 0.78, text: '6' }, { goc: 180, t: 0.78, text: '9' }],
    moTa: 'Mặt đồng hồ lúc 2 giờ: góc ở tâm tạo bởi kim giờ và kim phút.'
  }),
  'C5-B14-M2-Q14': DT_DAY({
    diem: [{ ten: 'A', goc: 160 }, { ten: 'B', goc: 20 }],
    doan: [{ tu: 'O', den: 'A' }, { tu: 'O', den: 'B' }],
    cung: [{ tuGoc: 20, denGoc: 160, cungLon: true, toNhe: true, cungGoc: false, nhanCung: '220°' }, { tuGoc: 20, denGoc: 160, cungGoc: true, nhanGoc: '?' }],
    moTa: 'Cung lớn AB có số đo 220°; cần tìm góc ở tâm AOB.'
  }),
  'C5-B14-M2-Q15': DT_DAY({
    diem: [{ ten: 'A', goc: 90 }, { ten: 'B', goc: 300 }],
    doan: [{ tu: 'O', den: 'A', chinh: true }, { tu: 'O', den: 'B', chinh: true }],
    cung: [{ tuGoc: 300, denGoc: 90, cungGoc: true, toNhe: true, nhanGoc: '?' }],
    nhanThem: [{ goc: 90, t: 0.78, text: '12' }, { goc: 300, t: 0.78, text: '5' }, { goc: 270, t: 0.78, text: '6' }],
    moTa: 'Từ 12 giờ đến 12 giờ 25 phút, kim phút quay góc ở tâm từ vị trí số 12 đến số 5.'
  }),
  'C5-B14-M2-Q16': DT_DAY({
    diem: [{ ten: 'A', goc: 150 }, { ten: 'B', goc: 90 }, { ten: 'C', goc: 30 }, { ten: 'D', goc: 330 }, { ten: 'E', goc: 270 }, { ten: 'F', goc: 210 }],
    daGiac: { dinh: ['A', 'B', 'C', 'D', 'E', 'F'] },
    cung: [{ tuGoc: 30, denGoc: 150, toNhe: true, cungGoc: false, nhanCung: 'Cung nhỏ AC = ?' }],
    moTa: 'Lục giác đều ABCDEF nội tiếp đường tròn (O); cần tìm số đo cung nhỏ AC.'
  }),
  'C5-B14-M3-Q01': DT_DAY({
    diem: [{ ten: 'A', goc: 145 }, { ten: 'C', goc: 105 }, { ten: 'B', goc: 75 }],
    cung: [{ tuGoc: 105, denGoc: 145, cungGoc: false, nhanCung: '40°' }, { tuGoc: 75, denGoc: 105, cungGoc: false, nhanCung: '30°' }],
    moTa: 'Điểm C nằm trên cung nhỏ AB với sđ AC = 40°, sđ CB = 30°; cần tìm sđ cung nhỏ AB.'
  }),
  'C5-B14-M3-Q04': DT_DAY({
    diem: [{ ten: 'A', goc: 160 }, { ten: 'B', goc: 60 }, { ten: 'C', goc: 300 }],
    doan: [{ tu: 'O', den: 'A', netDut: true }, { tu: 'O', den: 'B', netDut: true }, { tu: 'O', den: 'C', netDut: true }],
    cung: [{ tuGoc: 60, denGoc: 160, cungGoc: false, nhanCung: '100°' }, { tuGoc: 300, denGoc: 60, cungGoc: false, nhanCung: '120°' }, { tuGoc: 160, denGoc: 300, cungGoc: false, nhanCung: 'x = ?' }],
    moTa: 'Ba điểm A, B, C chia đường tròn thành ba cung 100°, 120° và x.'
  }),
  'C5-B14-M3-Q05': DT_DAY({
    diem: [{ ten: 'A', goc: 120 }, { ten: 'B', goc: 60 }],
    doan: [{ tu: 'A', den: 'B', chinh: true, nhan: 'R' }, { tu: 'O', den: 'A', nhan: 'R' }, { tu: 'O', den: 'B', nhan: 'R' }],
    cung: [{ tuGoc: 60, denGoc: 120, cungGoc: false, nhanCung: '?' }],
    moTa: 'Đường tròn (O; R) có dây AB = R; cần tìm số đo cung nhỏ AB.'
  }),
  'C5-B14-M3-Q06': DT_DAY({
    diem: [{ ten: 'A', goc: 135 }, { ten: 'B', goc: 45 }],
    doan: [{ tu: 'A', den: 'B', chinh: true, nhan: 'R√2' }, { tu: 'O', den: 'A', nhan: 'R' }, { tu: 'O', den: 'B', nhan: 'R' }],
    cung: [{ tuGoc: 45, denGoc: 135, cungGoc: false, nhanCung: '?' }],
    moTa: 'Đường tròn (O; R) có dây AB = R√2; cần tìm số đo cung nhỏ AB.'
  }),
  'C5-B14-M3-Q07': DT_DAY({
    diem: [{ ten: 'A', goc: 150 }, { ten: 'B', goc: 30 }],
    doan: [{ tu: 'A', den: 'B', chinh: true, nhan: 'R√3' }, { tu: 'O', den: 'A', nhan: 'R' }, { tu: 'O', den: 'B', nhan: 'R' }],
    cung: [{ tuGoc: 30, denGoc: 150, cungLon: true, toNhe: true, cungGoc: false, nhanCung: 'Cung lớn = ?' }],
    moTa: 'Đường tròn (O; R) có dây AB = R√3; cần tìm số đo cung lớn AB.'
  }),
  'C5-B14-M3-Q08': DT_DAY({
    diem: [{ ten: 'A', goc: 140 }, { ten: 'B', goc: 50 }, { ten: 'C', goc: 290 }],
    doan: [{ tu: 'O', den: 'A', netDut: true }, { tu: 'O', den: 'B', netDut: true }, { tu: 'O', den: 'C', netDut: true }],
    cung: [{ tuGoc: 50, denGoc: 140, toNhe: true, cungGoc: false, nhanCung: 'Cung AB = ?' }],
    moTa: 'Ba điểm A, B, C chia đường tròn theo tỉ lệ 3 : 4 : 5; cần tìm số đo cung AB.'
  }),
  'C5-B14-M3-Q09': DT_DAY({
    diem: [{ ten: 'A', goc: 150 }, { ten: 'C', goc: 100 }, { ten: 'B', goc: 65 }],
    cung: [{ tuGoc: 100, denGoc: 150, cungGoc: false, nhanCung: '50°' }, { tuGoc: 65, denGoc: 100, cungGoc: false, nhanCung: '35°' }],
    moTa: 'Điểm C nằm trên cung nhỏ AB với sđ AC = 50°, sđ CB = 35°; cần tìm sđ cung nhỏ AB.'
  }),
  'C5-B14-M3-Q11': DT_DAY({
    diem: [{ ten: 'A', goc: 125 }, { ten: 'B', goc: 55 }],
    cung: [{ tuGoc: 55, denGoc: 125, cungGoc: false, nhanCung: '70°' }, { tuGoc: 55, denGoc: 125, cungLon: true, toNhe: true, cungGoc: false, nhanCung: 'Cung lớn = ?' }],
    moTa: 'Cung nhỏ AB có số đo 70°; cần tìm số đo cung lớn AB.'
  }),
  'C5-B14-M3-Q13': DT_DAY({
    diem: [{ ten: 'A', goc: 90 }, { ten: 'B', goc: 210 }, { ten: 'C', goc: 330 }],
    doan: [{ tu: 'O', den: 'A', netDut: true }, { tu: 'O', den: 'B', netDut: true }, { tu: 'O', den: 'C', netDut: true }],
    cung: [{ tuGoc: 330, denGoc: 90, toNhe: true, cungGoc: false, nhanCung: '?' }],
    moTa: 'Ba điểm A, B, C chia đường tròn thành ba cung bằng nhau; cần tìm số đo mỗi cung.'
  }),
  'C5-B14-M3-Q14': DT_DAY({
    diem: [{ ten: 'A', goc: 135 }, { ten: 'B', goc: 45 }],
    doan: [{ tu: 'A', den: 'B', chinh: true, nhan: 'R√2' }, { tu: 'O', den: 'A', nhan: 'R' }],
    cung: [{ tuGoc: 45, denGoc: 135, cungLon: true, toNhe: true, cungGoc: false, nhanCung: 'Cung lớn = ?' }],
    moTa: 'Đường tròn (O; R) có dây AB = R√2; cần tìm số đo cung lớn AB.'
  }),
  'C5-B14-M3-Q15': DT_DAY({
    diem: [{ ten: 'A', goc: 155 }, { ten: 'B', goc: 85 }, { ten: 'C', goc: 335 }, { ten: 'D', goc: 265 }],
    daGiac: { dinh: ['A', 'B', 'C', 'D'] },
    cung: [
      { tuGoc: 85, denGoc: 155, cungGoc: false, nhanCung: '70°' },
      { tuGoc: 335, denGoc: 85, cungGoc: false, nhanCung: '110°' },
      { tuGoc: 265, denGoc: 335, cungGoc: false, nhanCung: '70°' },
      { tuGoc: 155, denGoc: 265, toNhe: true, cungGoc: false, nhanCung: 'x = ?' }
    ],
    moTa: 'Bốn điểm A, B, C, D chia đường tròn thành 4 cung 70°, 110°, 70° và x.'
  }),

  // ---------- Bài 15 (giữ cũ + bổ sung 10 câu)
  'C5-B15-M1-Q03': DT('quat', { R: '6 cm', goc: '60°', cung: 'l = ?' }),
  'C5-B15-M1-Q04': QVK('cung', 4, 90, undefined, { duongKinh: 'd = 8 cm', goc: '90°', cung: 'l = ?' }, 'Cung 90° của đường tròn đường kính 8 cm; cần tìm độ dài cung.', { veGocVuong: true }),
  'C5-B15-M1-Q05': DT('quat', { R: '9 cm', cung: 'l = 3π cm', goc: '?' }),
  'C5-B15-M1-Q07': QVK('cung', 10, 120, undefined, { R: '10 cm', cung: 'l = ?' }, 'Kim phút dài 10 cm quay trong 20 phút vạch nên cung tròn; cần tìm độ dài cung.'),
  'C5-B15-M1-Q10': QVK('cung', 6, 180, undefined, { R: 'R', goc: '180°', cung: 'l = ?' }, 'Cung 180° (nửa đường tròn) bán kính R; cần tìm độ dài cung.'),
  'C5-B15-M1-Q11': DT('quat', { R: '8 cm', goc: '45°', cung: 'l = ?' }),
  'C5-B15-M1-Q12': DT('quat', { R: '3 cm', goc: '120°', cung: 'l = ?' }),
  'C5-B15-M1-Q14': DT('quat', { R: '?', goc: '150°', cung: 'l = 5π cm' }),
  'C5-B15-M1-Q16': QVK('cung', 6, 90, undefined, { R: '6 cm', cung: 'l = ?' }, 'Kim giờ dài 6 cm quay từ 1 giờ đến 4 giờ; cần tìm độ dài cung vạch nên.'),
  'C5-B15-M2-Q03': DT('quat', { R: '6 cm', goc: '60°' }),
  'C5-B15-M2-Q04': DT('quat', { R: '5 cm', cung: 'l = 4π cm' }),
  'C5-B15-M2-Q05': DT('quat', { R: '20 m', goc: '135°' }),
  'C5-B15-M2-Q06': QVK('quat', 30, 120, undefined, { R: '30 cm', goc: '120°', S: 'S = ?' }, 'Hình quạt tròn bán kính 30 cm, góc 120°; cần tìm diện tích mặt quạt.'),
  'C5-B15-M2-Q07': DT('quat', { R: '6 cm', goc: '?' }),
  'C5-B15-M2-Q11': DT('quat', { R: '4 cm', goc: '90°' }),
  'C5-B15-M2-Q13': DT('quat', { R: '10 cm', cung: 'l = 6π cm' }),
  'C5-B15-M2-Q14': DT('quat', { R: '9 cm', goc: '40°' }),
  'C5-B15-M2-Q15': DT('quat', { R: '12 cm', cung: 'l = ?' }),
  'C5-B15-M2-Q16': QVK('quat', 30, 60, undefined, { R: '30 m', goc: '60°', S: 'S = ?' }, 'Vùng chiếu sáng hình quạt bán kính 30 m, góc 60°; cần tìm diện tích.'),
  'C5-B15-M3-Q03': DT('vanh-khuyen', { R: '5 cm', r: '3 cm' }),
  'C5-B15-M3-Q04': DT('vanh-khuyen', { R: '10 cm', r: '6 cm' }),
  'C5-B15-M3-Q07': DT('vanh-khuyen', { R: '?', r: '4 cm' }),
  'C5-B15-M3-Q08': QVK('vanh-khuyen', 0.5, undefined, 0.4, { duongKinhNgoai: 'd = 1 m', doDay: 'dày 0,1 m' }, 'Mặt cắt ống cống hình vành khuyên đường kính ngoài 1 m, thành ống dày 0,1 m.'),
  'C5-B15-M3-Q11': DT('vanh-khuyen', { R: '6 cm', r: '4 cm' }),
  'C5-B15-M3-Q12': QVK('vanh-khuyen', 5, undefined, 3, { duongKinhNgoai: 'd₁ = 10 cm', duongKinhTrong: 'd₂ = 6 cm' }, 'Hình vành khuyên có đường kính ngoài 10 cm và đường kính trong 6 cm.'),
  'C5-B15-M3-Q13': DT('vanh-khuyen', { R: '3 cm', r: '2 cm' }),
  'C5-B15-M3-Q15': QVK('vanh-khuyen', 6, undefined, 3, { R: 'R = 2r', r: 'r = ?' }, 'Hình vành khuyên diện tích 27π cm², bán kính ngoài R = 2r; cần tìm bán kính trong r.'),
  'C5-B15-M3-Q16': QVK('vanh-khuyen', 1.1, undefined, 0.9, { duongKinhNgoai: 'd₁ = 2,2 cm', duongKinhTrong: 'd₂ = 1,8 cm' }, 'Mặt nhẫn hình vành khuyên có đường kính ngoài 2,2 cm và đường kính trong 1,8 cm.'),

  // ---------- Bài 16 (giữ cũ + bổ sung 10 câu)
  'C5-B16-M1-Q06': DT('day', { R: '5 cm', day: '8 cm', d: '?' }),
  'C5-B16-M1-Q14': DT('day', { R: '10 cm', day: '16 cm', d: '?' }),
  'C5-B16-M2-Q05': DT('tiep-tuyen', { R: '6 cm', OM: '10 cm', MA: '?' }),
  'C5-B16-M2-Q06': DT('tiep-tuyen', { R: '15 cm', MA: '20 cm', OM: '?' }),
  'C5-B16-M2-Q07': TT('mot', { R: 4, gocAMO: 30, nhan: { R: '4 cm', goc: '30°', OM: 'OM = ?' }, moTa: 'MA là tiếp tuyến của (O; 4 cm) tại A, góc AMO = 30°; cần tìm OM.' }),
  'C5-B16-M2-Q11': DT('tiep-tuyen', { R: '5 cm', OM: '13 cm', MA: '?' }),
  'C5-B16-M2-Q13': DT('tiep-tuyen', { R: '?', MA: '8 cm', OM: '10 cm' }),
  'C5-B16-M2-Q14': DT('tiep-tuyen', { R: '6 cm', goc: '60°', MA: '?' }),
  'C5-B16-M2-Q16': DT('tiep-tuyen', { R: '5 cm', MB: '8 cm', MA: '?' }, { diemB: true }),
  'C5-B16-M3-Q01': TT('hai', { veOM: false, nhan: {}, moTa: 'Hai tiếp tuyến MA, MB kẻ từ M tới đường tròn (O).' }),
  'C5-B16-M3-Q02': TT('hai', { veOM: true, nhan: {}, moTa: 'Hai tiếp tuyến MA, MB của (O) và tia MO.' }),
  'C5-B16-M3-Q03': TT('hai', { gocAMB: 60, veOM: true, nhan: { goc: '∠AMB = 60°' }, moTa: 'Hai tiếp tuyến MA, MB của (O) tạo góc AMB = 60°, vẽ tia MO.' }),
  'C5-B16-M3-Q04': DT('hai-tiep-tuyen', { R: '3 cm', MA: '4 cm', OM: '?' }),
  'C5-B16-M3-Q05': TT('hai', { veOM: true, veDayAB: true, nhan: {}, moTa: 'Hai tiếp tuyến MA, MB của (O), đường thẳng OM và dây AB.' }),
  'C5-B16-M3-Q06': DT('hai-tiep-tuyen', { R: '5 cm', goc: '60°', OM: '?' }),
  'C5-B16-M3-Q07': TT('hai', { gocAOB: 120, veOM: false, nhan: { gocTam: '120°', goc: '∠AMB = ?' }, moTa: 'Hai tiếp tuyến MA, MB của (O) với góc AOB = 120°; cần tìm góc AMB.' }),
  'C5-B16-M3-Q08': TT('noi-tiep', { tamGiac: { a: 9, b: 8, c: 7 }, nhan: { AB: '7', AC: '8', BC: '9', AD: '?' }, moTa: 'Đường tròn (I) nội tiếp tam giác ABC với AB = 7, AC = 8, BC = 9; tiếp điểm D trên AB, cần tìm AD.' }),
  'C5-B16-M3-Q10': TT('hai', { veOM: true, nhan: {}, moTa: 'Hai tiếp tuyến MA, MB của (O) và tia phân giác xuất phát từ M hoặc O.' }),
  'C5-B16-M3-Q11': TT('hai', { R: 4, MA: 7, veOM: false, nhan: { MA: '7 cm', MB: '?' }, moTa: 'Hai tiếp tuyến MA, MB của (O) với MA = 7 cm; cần tìm MB.' }),
  'C5-B16-M3-Q12': DT('hai-tiep-tuyen', { goc: '80°' }),
  'C5-B16-M3-Q13': DT('hai-tiep-tuyen', { goc: '50°' }),
  'C5-B16-M3-Q14': DT('hai-tiep-tuyen', { R: '3 cm', OM: '5 cm', day: 'AB = ?' }),
  'C5-B16-M3-Q16': TT('noi-tiep', { tamGiac: { a: 10, b: 8, c: 6, vuongTaiA: true }, nhan: { AB: '6', AC: '8', AD: '?' }, moTa: 'Đường tròn (I) nội tiếp tam giác ABC vuông tại A có AB = 6, AC = 8; cần tìm AD.' }),

  // ---------- Bài 17 (giữ cũ + bổ sung 4 câu tính toán)
  'C5-B17-M1-Q14': DT('day-chung', { R: '5 cm', d: 'OO′ = 8 cm', day: 'AB = ?' }),
  'C5-B17-M2-Q07': HDT(7, 5, 12, { R: '7 cm', r: 'r = ?', d: 'OO′ = 12 cm' }, 'Hai đường tròn (O; 7 cm) và (O′; r) tiếp xúc ngoài với OO′ = 12 cm.'),
  'C5-B17-M2-Q08': HDT(7, 3, 4, { R: 'R = ?', r: '3 cm', d: 'OO′ = 4 cm' }, 'Hai đường tròn (O; R) và (O′; 3 cm) tiếp xúc trong với OO′ = 4 cm.'),
  'C5-B17-M2-Q14': HDT(5, 4, 7, { R: '5 cm', r: 'r = ?', d: 'OO′ = 7 cm' }, 'Hai đường tròn (O; 5 cm) và (O′; r) cắt nhau với OO′ = 7 cm.'),
  'C5-B17-M2-Q15': HDT(6, 2, 4, { R: '6 cm', r: '2 cm', d: 'OO′ = ?' }, 'Hai đường tròn (O; 6 cm) và (O′; 2 cm) tiếp xúc trong; cần tìm OO′.')
};

export const QUESTIONS = [...CAU_GOC, ...CAU_MOI]
  .map((q) => (HINH[q.id] ? { ...q, hinh: HINH[q.id] } : q))
  .sort((a, b) => a.id.localeCompare(b.id));

export const HINTS = {
  'E-DTR-01': ['Khoảng cách từ điểm đến tâm lớn hơn, bằng hay nhỏ hơn bán kính?', 'OM < R: M nằm trong; OM = R: M nằm trên; OM > R: M nằm ngoài đường tròn. Bán kính bằng một nửa đường kính.', 'Ví dụ: (O; 3 cm), OM = 2 cm < 3 cm nên M nằm trong; đường kính 10 cm thì R = 5 cm.'],
  'E-DTR-02': ['Gấp đôi một tờ giấy hình tròn theo đường qua tâm thì hai nửa có trùng nhau không? Có bao nhiêu cách gấp như vậy?', 'Đường tròn nhận tâm làm tâm đối xứng; mọi đường thẳng đi qua tâm (chứa một đường kính) đều là trục đối xứng, nên có vô số trục.', 'Ví dụ: A thuộc (O) thì điểm đối xứng của A qua O và qua mọi đường kính đều thuộc (O).'],
  'E-CD-01': ['Kẻ OH vuông góc với dây AB thì H là điểm gì của AB? Tam giác vuông nào xuất hiện?', 'Đường kính là dây lớn nhất. Kẻ OH ⊥ AB thì H là trung điểm AB và OH² + (AB/2)² = R² (dùng NỬA dây).', 'Ví dụ: R = 5, AB = 8 thì AH = 4, OH = √(25 − 16) = 3 cm.'],
  'E-CD-02': ['Đỉnh của góc nằm ở tâm hay trên đường tròn? Em đang tính cung nhỏ hay cung lớn?', 'Góc ở tâm có đỉnh là tâm. Số đo cung nhỏ bằng số đo góc ở tâm chắn cung đó; cung lớn = 360° − cung nhỏ; nửa đường tròn là 180°.', 'Ví dụ: góc AOB = 70° thì cung nhỏ AB = 70°, cung lớn AB = 290°.'],
  'E-CD-03': ['Điểm C có nằm trên cung AB không? Hai cung có cùng một đường tròn không?', 'Nếu C nằm trên cung AB thì sđ AB = sđ AC + sđ CB. Tổng các cung tạo bởi các điểm chia đường tròn là 360°. Chỉ so sánh cung trong cùng một đường tròn (hoặc hai đường tròn bằng nhau); cung lớn hơn căng dây lớn hơn.', 'Ví dụ: ba cung 100°, 120°, x thì x = 360° − 220° = 140°.'],
  'E-QH-01': ['Cả đường tròn (360°) dài 2πR. Vậy 1° dài bao nhiêu?', 'Độ dài cung n°: l = 2πR·n/360 = πRn/180. Dùng bán kính, không dùng đường kính (đường kính thì chia đôi trước).', 'Ví dụ: R = 6, n = 60°: l = π·6·60/180 = 2π cm.'],
  'E-QH-02': ['Cả hình tròn có diện tích bao nhiêu? Hình quạt n° chiếm mấy phần của 360°?', 'Diện tích hình quạt: S = πR²·n/360, hoặc S = l·R/2 (nhớ chia 2).', 'Ví dụ: R = 6, n = 60°: S = 36π·60/360 = 6π cm²; l = 4π, R = 5: S = 4π·5/2 = 10π cm².'],
  'E-QH-03': ['Hình vành khuyên là hình tròn lớn trừ đi hình gì?', 'S = πR² − πr² = π(R² − r²). Không được viết π(R − r)². Nếu đề cho đường kính thì chia đôi để có bán kính.', 'Ví dụ: R = 5, r = 3: S = π(25 − 9) = 16π cm², không phải π(5 − 3)² = 4π.'],
  'E-TT-01': ['Khoảng cách từ tâm đến đường thẳng nhỏ hơn, bằng hay lớn hơn bán kính?', 'd < R: cắt nhau (2 điểm chung); d = R: tiếp xúc (1 điểm chung); d > R: không giao nhau.', 'Ví dụ: R = 5, d = 5: tiếp xúc; đường tròn tâm I(3; 2) bán kính 2 cách Ox một khoảng 2 nên tiếp xúc với Ox.'],
  'E-TT-02': ['Điểm A có thuộc đường tròn không? Đường thẳng có vuông góc với OA tại A không?', 'a là tiếp tuyến tại A ⇔ A thuộc (O) và a ⊥ OA tại A. Khi đó tam giác OAM vuông tại A, cạnh huyền là OM: MA² = OM² − R².', 'Ví dụ: OM = 10, R = 6: MA = √(100 − 36) = 8 cm.'],
  'E-TT-03': ['Hai tiếp tuyến từ M có độ dài thế nào? Tia MO chia góc AMB ra sao?', 'MA = MB; MO là tia phân giác của góc AMB; OM là đường trung trực của AB. Góc AMB + góc AOB = 180°.', 'Ví dụ: góc AMB = 60° thì góc AMO = 30°; góc AOB = 120° thì góc AMB = 60°.'],
  'E-HDT-01': ['Hai đường tròn có mấy điểm chung?', 'Hai điểm chung: cắt nhau (OO′ là trung trực của dây chung); một điểm chung: tiếp xúc (tiếp điểm nằm trên đường nối tâm); không có điểm chung: ở ngoài nhau hoặc đựng nhau.', 'Ví dụ: (O), (O′) tiếp xúc tại A thì O, O′, A thẳng hàng.'],
  'E-HDT-02': ['So sánh d = OO′ với R + r và R − r: d rơi vào khoảng nào?', 'd > R + r: ngoài nhau; d = R + r: tiếp xúc ngoài; R − r < d < R + r: cắt nhau; d = R − r: tiếp xúc trong; d < R − r: đựng nhau.', 'Ví dụ: R = 5, r = 3, d = 2 = R − r nên tiếp xúc trong; d = 8 = R + r thì tiếp xúc ngoài.']
};

const V = (dan, quyTac, viDu, tuLam) => ({ dan, quyTac, viDu: viDu.map(([de, giai]) => ({ de, giai })), tuLam: tuLam.map(([de, dapAn, giaiThich]) => ({ de, dapAn, giaiThich })) });
export const VI_BAI_HOC = {
  'VBH-DTR-01': V('Điểm nằm ở đâu so với đường tròn chỉ phụ thuộc một con số: khoảng cách đến tâm.',
    'So sánh OM với R: OM < R thì M nằm trong, OM = R thì M nằm trên, OM > R thì M nằm ngoài. Bán kính = đường kính : 2.',
    [['(O; 3 cm), OM = 2 cm. M nằm đâu?', 'Cách nghĩ sai: nằm ngoài. Cách đúng: 2 < 3 nên M nằm trong đường tròn.'],
     ['Hình chữ nhật 6 × 8 nội tiếp đường tròn bán kính?', 'Đường chéo 10 là đường kính, R = 5.']],
    [['Đường kính 14 cm, R = ?', '7 cm', 'Chia đôi.'],
     ['(O; 5), điểm (3; 4) ở đâu?', 'Trên đường tròn', 'Khoảng cách 5.']]),
  'VBH-DTR-02': V('Xoay hay gấp đường tròn quanh tâm, nó vẫn trùng khít — đó là tính đối xứng.',
    'Tâm O là tâm đối xứng; mọi đường thẳng qua tâm là trục đối xứng (vô số trục). Điểm thuộc đường tròn đối xứng qua tâm hay qua trục vẫn thuộc đường tròn.',
    [['Đường tròn có mấy trục đối xứng?', 'Cách nghĩ sai: 2 (ngang và dọc). Cách đúng: vô số, mọi đường kính đều là trục.'],
     ['A thuộc (O; 5), A′ đối xứng A qua O. AA′ = ?', 'AA′ là đường kính, bằng 10.']],
    [['Tâm đối xứng của đường tròn?', 'Tâm O', 'Định nghĩa.'],
     ['Dây AB có là trục đối xứng?', 'Không (trừ khi qua tâm)', 'Trục phải qua tâm.']]),
  'VBH-CD-01': V('Mọi bài tính dây đều quy về một tam giác vuông: bán kính – nửa dây – khoảng cách đến tâm.',
    'Đường kính là dây lớn nhất. Kẻ OH ⊥ AB: H là trung điểm AB và OH² + AH² = R² (AH là NỬA dây). Hai dây bằng nhau thì cách đều tâm.',
    [['R = 5, AB = 8, tính OH.', 'Cách nghĩ sai: dùng cả dây 8. Cách đúng: AH = 4, OH = √(25 − 16) = 3.'],
     ['R = 13, OH = 5, tính AB.', 'AH = √(169 − 25) = 12, AB = 24.']],
    [['R = 25, OH = 7, AB = ?', '48', 'AH = 24.'],
     ['Đường kính 10, dây 11 được không?', 'Không', 'Dây ≤ đường kính.']]),
  'VBH-CD-02': V('Góc ở tâm "mở" bao nhiêu độ thì cung nhỏ bị chắn có bấy nhiêu độ.',
    'Góc ở tâm: đỉnh trùng tâm. sđ cung nhỏ = góc ở tâm; sđ cung lớn = 360° − sđ cung nhỏ; nửa đường tròn 180°.',
    [['Góc AOB = 70°, cung lớn AB?', 'Cách nghĩ sai: 70°. Cách đúng: cung nhỏ 70°, cung lớn 360° − 70° = 290°.'],
     ['Chia đường tròn thành 6 cung bằng nhau.', 'Mỗi cung 360° : 6 = 60°.']],
    [['Lúc 3 giờ, góc giữa hai kim?', '90°', '3 khoảng 30°.'],
     ['Tam giác đều nội tiếp, góc AOB?', '120°', '360° : 3.']]),
  'VBH-CD-03': V('Các cung "nối đuôi" nhau thì cộng được; đi hết một vòng thì đúng 360°.',
    'C nằm trên cung AB thì sđ AB = sđ AC + sđ CB. Các cung chia kín đường tròn có tổng 360°. Trong một đường tròn, hai cung bằng nhau căng hai dây bằng nhau; cung lớn hơn căng dây lớn hơn.',
    [['Hai cung 60° ở hai đường tròn bán kính khác nhau có bằng nhau?', 'Cách nghĩ sai: có. Cách đúng: chỉ so sánh trong cùng một đường tròn hoặc hai đường tròn bằng nhau.'],
     ['Ba cung tỉ lệ 3 : 4 : 5, tính cung đầu.', '360° : 12 · 3 = 90°.']],
    [['Cung 40° + cung 30° kề nhau?', '70°', 'Cộng cung.'],
     ['Ba cung 100°, 120°, x thì x?', '140°', '360° − 220°.']]),
  'VBH-QH-01': V('Độ dài cung chỉ là "một phần" của chu vi đường tròn.',
    'Chu vi C = 2πR. Cung n° chiếm n/360 chu vi: l = 2πR·n/360 = πRn/180. Đề cho đường kính thì lấy R = d/2.',
    [['R = 6, cung 60°, tính l.', 'Cách nghĩ sai: π·6·60/360 = π. Cách đúng: π·6·60/180 = 2π cm.'],
     ['Bánh xe đường kính 70 cm lăn 10 vòng.', 'Mỗi vòng π·0,7 m, 10 vòng ≈ 21,98 m.']],
    [['Chu vi R = 5?', '10π', '2πR.'],
     ['Cung 90°, đường kính 8?', '2π', 'R = 4.']]),
  'VBH-QH-02': V('Hình quạt là "một miếng bánh" của hình tròn: lấy diện tích hình tròn nhân với phần chiếm.',
    'S quạt = πR²·n/360 = l·R/2 (l là độ dài cung).',
    [['R = 6, n = 60°, tính S.', 'Cách nghĩ sai: 36π·60/180 = 12π. Cách đúng: 36π·60/360 = 6π cm².'],
     ['l = 4π, R = 5.', 'S = 4π·5/2 = 10π cm².']],
    [['R = 20 m, n = 135°?', '150π m²', '400π·135/360.'],
     ['Vòi tưới 90°, xa 8 m?', '16π m²', '64π/4.']]),
  'VBH-QH-03': V('Hình vành khuyên là "chiếc nhẫn": hình tròn lớn khoét đi hình tròn nhỏ.',
    'S = πR² − πr² = π(R² − r²). Đề cho đường kính thì chia đôi. Không viết π(R − r)².',
    [['R = 5, r = 3.', 'Cách nghĩ sai: π(5 − 3)² = 4π. Cách đúng: π(25 − 9) = 16π cm².'],
     ['Lối đi rộng 2 m quanh bồn hoa bán kính 3 m.', 'R = 5, r = 3: S = 16π m².']],
    [['R = 10, r = 6?', '64π', '100 − 36.'],
     ['S = 9π, r = 4, R?', '5', 'R² = 25.']]),
  'VBH-TT-01': V('Đường thẳng "chạm" hay "xuyên" đường tròn: so khoảng cách từ tâm với bán kính.',
    'd < R: cắt nhau tại 2 điểm; d = R: tiếp xúc (1 điểm); d > R: không giao nhau.',
    [['R = 5, d = 5.', 'Cách nghĩ sai: cắt tại 2 điểm. Cách đúng: d = R nên tiếp xúc.'],
     ['Tâm I(3; 2), R = 2 và trục Ox.', 'Khoảng cách từ I đến Ox là 2 = R: tiếp xúc.']],
    [['R = 6, d = 8?', 'Không giao', 'd > R.'],
     ['R = 6, d = 4?', 'Cắt nhau', 'd < R.']]),
  'VBH-TT-02': V('Tiếp tuyến luôn "đứng thẳng góc" với bán kính tại tiếp điểm.',
    'a là tiếp tuyến tại A ⇔ A ∈ (O) và a ⊥ OA. Khi đó tam giác OAM vuông tại A, cạnh huyền OM: MA² = OM² − R².',
    [['OM = 10, R = 6, tìm MA.', 'Cách nghĩ sai: √(100 + 36). Cách đúng: OM là cạnh huyền, MA = √(100 − 36) = 8.'],
     ['Tam giác ABC vuông tại A, AC là tiếp tuyến của đường tròn nào?', 'AC ⊥ AB tại A nên AC tiếp xúc (B; BA).']],
    [['R = 15, MA = 20, OM?', '25', '√(225 + 400).'],
     ['Góc AMO = 30°, R = 4, OM?', '8', 'sin 30° = 4/OM.']]),
  'VBH-TT-03': V('Hai tiếp tuyến từ một điểm ngoài giống "hai cánh tay bằng nhau" ôm lấy đường tròn.',
    'MA = MB; MO là phân giác góc AMB và góc AOB; OM là trung trực của AB; góc AMB + góc AOB = 180°.',
    [['Góc AMB = 60°, góc AMO?', 'Cách nghĩ sai: 60°. Cách đúng: MO là phân giác nên góc AMO = 30°.'],
     ['Góc AOB = 120°, góc AMB?', '180° − 120° = 60°.']],
    [['MA = 4, MB = ?', '4', 'MA = MB.'],
     ['R = 3, MA = 4, MO?', '5', 'Pythagore.']]),
  'VBH-HDT-01': V('Đếm điểm chung là biết ngay hai đường tròn đang "đứng" thế nào.',
    '2 điểm chung: cắt nhau (OO′ là trung trực dây chung); 1 điểm chung: tiếp xúc (tiếp điểm nằm trên OO′); 0 điểm chung: ngoài nhau hoặc đựng nhau.',
    [['Hai đường tròn tiếp xúc tại A, O, O′, A có thẳng hàng?', 'Cách nghĩ sai: không cần. Cách đúng: tiếp điểm luôn nằm trên đường nối tâm nên thẳng hàng.'],
     ['Hai đường tròn đồng tâm bán kính khác nhau?', 'Không có điểm chung: đựng nhau.']],
    [['Cắt nhau có mấy điểm chung?', '2', 'Định nghĩa.'],
     ['Tiếp xúc có mấy điểm chung?', '1', 'Định nghĩa.']]),
  'VBH-HDT-02': V('Một trục số nhỏ với hai mốc R − r và R + r là đủ để xếp mọi trường hợp.',
    'd > R + r: ngoài nhau; d = R + r: tiếp xúc ngoài; R − r < d < R + r: cắt nhau; d = R − r: tiếp xúc trong; d < R − r: đựng nhau.',
    [['R = 5, r = 3, d = 2.', 'Cách nghĩ sai: tiếp xúc ngoài. Cách đúng: d = R − r nên tiếp xúc trong.'],
     ['R = 6, r = 4, d = 7.', '2 < 7 < 10: cắt nhau.']],
    [['R = 5, r = 3, d = 8?', 'Tiếp xúc ngoài', 'd = R + r.'],
     ['Tiếp xúc ngoài, R = 7, d = 12, r?', '5', 'r = d − R.']])
};

export const ERROR_NODES = LOI.map((e) => ({ id: e.code, name: e.ten, role: e.role, kuId: e.ku, cluster: e.cluster }));
export const CAUSAL_EDGES = [
  { from: 'E-DTR-01', to: 'E-CD-01', weight: 0.5, reason: 'Nhầm bán kính, đường kính nên tính dây sai' },
  { from: 'E-DTR-02', to: 'E-CD-01', weight: 0.4, reason: 'Không thấy đường kính vuông góc dây là trục đối xứng nên không biết chia đôi dây' },
  { from: 'E-DTR-01', to: 'E-TT-01', weight: 0.6, reason: 'Không vững cách so khoảng cách với bán kính nên xét vị trí đường thẳng sai' },
  { from: 'E-TT-01', to: 'E-TT-02', weight: 0.55, reason: 'Không hiểu d = R nên nhận biết tiếp tuyến sai' },
  { from: 'E-TT-02', to: 'E-TT-03', weight: 0.6, reason: 'Chưa nắm tiếp tuyến ⊥ bán kính nên dùng sai tính chất hai tiếp tuyến' },
  { from: 'E-CD-02', to: 'E-CD-03', weight: 0.6, reason: 'Nhầm cung nhỏ, cung lớn nên cộng cung sai' },
  { from: 'E-CD-02', to: 'E-QH-01', weight: 0.5, reason: 'Hiểu sai số đo cung nên tính độ dài cung sai' },
  { from: 'E-QH-01', to: 'E-QH-02', weight: 0.6, reason: 'Nhầm công thức độ dài cung nên nhầm luôn diện tích quạt' },
  { from: 'E-QH-02', to: 'E-QH-03', weight: 0.4, reason: 'Không vững diện tích hình tròn nên tính vành khuyên sai' },
  { from: 'E-TT-01', to: 'E-HDT-01', weight: 0.45, reason: 'Chưa vững vị trí đường thẳng – đường tròn nên nhầm vị trí hai đường tròn' },
  { from: 'E-HDT-01', to: 'E-HDT-02', weight: 0.6, reason: 'Nhầm tên các vị trí nên lập hệ thức d, R, r sai' }
];
export const ROOT_ERROR_IDS = ['E-DTR-01', 'E-CD-02'];

const NHAP = 'Bản nháp do trợ lý AI soạn theo từ điển mã lỗi — giáo viên cần duyệt, sửa trước khi dùng';
const A = (id, ten, errorCodes, nhom, hinhThuc, mucNhanThuc, phut, moTa, hocLieu) => ({ id, ten, errorCodes, nhom, hinhThuc, mucNhanThuc, phut, moTa, hocLieu, trangThai: 'nhap', nguon: NHAP });
export const ACTIVITIES = [
  A('HD-DTR-01', 'Trong – trên – ngoài', ['E-DTR-01', 'E-DTR-02'], ['loi'], 'ca-lop', 1, [5, 7],
    'Giáo viên vẽ đường tròn bằng dây thừng trên sân hoặc bảng lớn. Học sinh nhận thẻ khoảng cách, đứng vào đúng vùng trong – trên – ngoài; sau đó gấp giấy hình tròn để đếm trục đối xứng.', 'Dây thừng, thẻ số, giấy tròn'),
  A('HD-CD-01', 'Nửa dây – bán kính – khoảng cách', ['E-CD-01'], ['loi'], 'nhom-dong-chat', 2, [8, 10],
    'Nhóm vẽ đường tròn bằng compa, kẻ 3 dây, đo khoảng cách từ tâm và nửa dây rồi kiểm nghiệm OH² + AH² = R²; giải 3 bài tính dây.', 'Compa, thước, phiếu'),
  A('HD-CD-02', 'Đồng hồ cung tròn', ['E-CD-02', 'E-CD-03'], ['loi'], 'nhom-dong-chat', 1, [6, 8],
    'Dùng mặt đồng hồ, nhóm xác định số đo cung nhỏ, cung lớn giữa hai kim ở 6 thời điểm; cộng các cung liên tiếp để kiểm tra tổng 360°.', 'Mô hình đồng hồ'),
  A('HD-QH-01', 'Ba công thức – ba tấm bìa', ['E-QH-01', 'E-QH-02', 'E-QH-03'], ['loi'], 'nhom-dong-chat', 2, [10, 12],
    'Nhóm cắt từ bìa một cung (sợi dây), một hình quạt và một vành khuyên; đo rồi so với kết quả tính theo l = πRn/180, S = πR²n/360, S = π(R² − r²). Ghi lại sai số.', 'Bìa, compa, kéo, dây'),
  A('HD-TT-01', 'Thước thẳng chạm đường tròn', ['E-TT-01', 'E-TT-02', 'E-TT-03'], ['loi'], 'nhom-dong-chat', 2, [8, 12],
    'Nhóm đặt thước ở các khoảng cách khác nhau so với tâm, ghi d và số điểm chung; dựng tiếp tuyến bằng ê ke tại một điểm; kẻ hai tiếp tuyến từ một điểm ngoài, đo MA, MB và các góc để rút ra tính chất.', 'Compa, thước, ê ke, thước đo góc'),
  A('HD-HDT-01', 'Hai vòng tròn trượt', ['E-HDT-01', 'E-HDT-02'], ['loi'], 'ca-lop', 2, [6, 8],
    'Dùng hai vòng bìa bán kính 5 cm và 3 cm, giáo viên trượt dần tâm này về phía tâm kia trên máy chiếu vật thể; học sinh ghi d và vị trí tương ứng để lập bảng so sánh với R + r, R − r.', 'Hai vòng bìa, máy chiếu vật thể'),
  A('HD-C5-MR', 'Thiết kế logo từ đường tròn', [], ['san-sang'], 'nhom-dong-chat', 4, [12, 15],
    'Nhóm thiết kế một logo chỉ dùng đường tròn và tiếp tuyến (có ít nhất một cặp tiếp xúc ngoài, một tiếp tuyến chung), tính độ dài các cung và diện tích phần tô màu.', 'Giấy A4, compa')
];
