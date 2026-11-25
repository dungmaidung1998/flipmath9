/**
 * NỘI DUNG TOÁN 9 — CHƯƠNG IX. ĐƯỜNG TRÒN NGOẠI TIẾP VÀ ĐƯỜNG TRÒN NỘI TIẾP (Kết nối tri thức)
 * BẢN NHÁP do trợ lý AI soạn theo SGK Toán 9 tập hai (Bài 27–30) — giáo viên duyệt trước khi dùng.
 */
const SEC = { 1: 45, 2: 60, 3: 90, 4: 120 };
const B27 = 'Bài 27. Góc nội tiếp';
const B28 = 'Bài 28. Đường tròn ngoại tiếp và đường tròn nội tiếp của một tam giác';
const B29 = 'Bài 29. Tứ giác nội tiếp';
const B30 = 'Bài 30. Đa giác đều';
const U = (id, bai, muc, name, order, prerequisite, mucTieu, extra = {}) => ({ id, bai, muc, name, order, prerequisite, mucTieu, ...extra });

export const UNITS = [
  U('C9-B27-M1', B27, 'Mục 1–2', 'Góc nội tiếp', 130, null,
    'Nhận biết góc nội tiếp; góc nội tiếp bằng nửa số đo cung bị chắn; các góc nội tiếp cùng chắn một cung bằng nhau; góc nội tiếp chắn nửa đường tròn là góc vuông.'),
  U('C9-B28-M1', B28, 'Mục 1', 'Đường tròn ngoại tiếp tam giác', 131, 'C9-B27-M1',
    'Xác định tâm đường tròn ngoại tiếp tam giác là giao điểm ba đường trung trực; tâm cách đều ba đỉnh.'),
  U('C9-B28-M2', B28, 'Mục 1 (tiếp)', 'Đường tròn ngoại tiếp tam giác vuông, tam giác đều', 132, 'C9-B28-M1',
    'Tam giác vuông: tâm là trung điểm cạnh huyền, R = nửa cạnh huyền; tam giác đều cạnh a: R = a√3/3.'),
  U('C9-B28-M3', B28, 'Mục 2', 'Đường tròn nội tiếp tam giác', 133, 'C9-B28-M1',
    'Xác định tâm đường tròn nội tiếp là giao điểm ba đường phân giác; tâm cách đều ba cạnh; tam giác đều cạnh a có r = a√3/6.'),
  U('C9-B29-M1', B29, 'Mục 1–2', 'Tứ giác nội tiếp', 134, 'C9-B27-M1',
    'Nhận biết tứ giác nội tiếp; tổng hai góc đối bằng 180°; chứng minh bốn điểm cùng thuộc một đường tròn.'),
  U('C9-B29-M2', B29, 'Mục 3', 'Hình chữ nhật, hình vuông nội tiếp đường tròn', 135, 'C9-B29-M1',
    'Hình chữ nhật, hình vuông nội tiếp đường tròn có tâm là giao điểm hai đường chéo, bán kính bằng nửa đường chéo.'),
  U('C9-B30-M1', B30, 'Mục 1', 'Đa giác, đa giác lồi', 136, null,
    'Nhận biết đa giác lồi; tổng các góc trong của đa giác lồi n cạnh bằng (n − 2)·180°.'),
  U('C9-B30-M2', B30, 'Mục 1 (tiếp)', 'Đa giác đều', 137, 'C9-B30-M1',
    'Nhận biết đa giác đều (mọi cạnh bằng nhau và mọi góc bằng nhau); tính số đo mỗi góc (n − 2)·180°/n; nhận biết đa giác đều trong thực tế.'),
  U('C9-B30-M3', B30, 'Mục 2', 'Phép quay', 138, 'C9-B30-M2',
    'Hiểu phép quay tâm O góc α: OA′ = OA, góc AOA′ = α theo chiều đã cho; tâm quay là điểm không đổi.'),
  U('C9-B30-M4', B30, 'Mục 2 (tiếp)', 'Phép quay giữ nguyên đa giác đều', 139, 'C9-B30-M3',
    'Xác định các phép quay tâm O giữ nguyên đa giác đều n cạnh tâm O: góc quay k·360°/n.')
];

const E = (code, ku, role, cluster, ten, tieuDe, phut, misconception, viDu) =>
  ({ code, ku, role, cluster, ten, tieuDe, phut, misconception, viDu, remediation: 'VBH-' + code.slice(2) });
const LOI = [
  E('E-GNT-01', 'C9-B27-M1', 'root', 'Góc nội tiếp', 'Góc nội tiếp bằng cả số đo cung', 'Góc nội tiếp = nửa số đo cung bị chắn', 5,
    'Cho góc nội tiếp bằng số đo cung bị chắn (quên chia đôi) hoặc nhầm góc nội tiếp với góc ở tâm', 'Góc nội tiếp chắn cung 80° có số đo 80°'),
  E('E-GNT-02', 'C9-B27-M1', 'mediating', 'Góc nội tiếp', 'Quên hệ quả của góc nội tiếp', 'Chắn nửa đường tròn là góc vuông; cùng chắn một cung thì bằng nhau', 5,
    'Không dùng được hệ quả: góc nội tiếp chắn nửa đường tròn là 90°, các góc nội tiếp cùng chắn một cung bằng nhau', 'AB là đường kính nhưng không biết góc ACB = 90°'),
  E('E-NTT-01', 'C9-B28-M1', 'root', 'Đường tròn ngoại tiếp, nội tiếp', 'Nhầm tâm đường tròn ngoại tiếp', 'Tâm ngoại tiếp = giao ba đường trung trực, cách đều ba đỉnh', 5,
    'Cho tâm đường tròn ngoại tiếp là giao các đường phân giác, trung tuyến hoặc đường cao', 'Tâm ngoại tiếp là trọng tâm tam giác'),
  E('E-NTT-02', 'C9-B28-M2', 'leaf', 'Đường tròn ngoại tiếp, nội tiếp', 'Bán kính ngoại tiếp, nội tiếp tam giác đặc biệt sai', 'Tam giác vuông: R = cạnh huyền : 2; tam giác đều: R = a√3/3, r = a√3/6', 6,
    'Lấy bán kính ngoại tiếp tam giác vuông bằng cạnh huyền, nhầm a√3/3 với a√3/6 hoặc a√3/2', 'Tam giác đều cạnh 6: R = 3√3'),
  E('E-NTT-03', 'C9-B28-M3', 'mediating', 'Đường tròn ngoại tiếp, nội tiếp', 'Nhầm tâm đường tròn nội tiếp', 'Tâm nội tiếp = giao ba đường phân giác, cách đều ba cạnh', 5,
    'Cho tâm đường tròn nội tiếp là giao các đường trung trực, hoặc nhầm "cách đều ba cạnh" với "cách đều ba đỉnh"', 'Vòi phun cách đều ba bờ rào đặt ở giao ba đường trung trực'),
  E('E-TGNT-01', 'C9-B29-M1', 'mediating', 'Tứ giác nội tiếp', 'Sai tính chất góc của tứ giác nội tiếp', 'Hai góc ĐỐI có tổng 180°', 5,
    'Cho hai góc kề hoặc hai góc đối của tứ giác nội tiếp bằng nhau, hoặc tổng hai góc đối bằng 360°', 'Tứ giác nội tiếp có góc A = 70° thì góc C = 70°'),
  E('E-TGNT-02', 'C9-B29-M2', 'leaf', 'Tứ giác nội tiếp', 'Nhận biết hình nội tiếp, bán kính sai', 'Hình chữ nhật, hình vuông nội tiếp; R = đường chéo : 2', 5,
    'Cho hình thoi, hình bình hành luôn nội tiếp được, hoặc lấy bán kính bằng cạnh, bằng đường chéo', 'Hình vuông cạnh 4 nội tiếp đường tròn bán kính 4'),
  E('E-DGD-01', 'C9-B30-M1', 'root', 'Đa giác đều', 'Nhận biết đa giác lồi, đa giác đều sai', 'Đa giác đều: mọi cạnh bằng nhau VÀ mọi góc bằng nhau', 5,
    'Cho hình thoi (chỉ cạnh bằng nhau) hoặc hình chữ nhật (chỉ góc bằng nhau) là đa giác đều; nhầm đa giác lồi với đa giác lõm', 'Hình thoi là đa giác đều'),
  E('E-DGD-02', 'C9-B30-M2', 'leaf', 'Đa giác đều', 'Tính góc của đa giác sai', 'Tổng góc trong (n − 2)·180°; mỗi góc đa giác đều (n − 2)·180°/n', 6,
    'Dùng sai công thức tổng các góc trong (n·180°, 360°), hoặc quên chia cho n khi tính mỗi góc của đa giác đều', 'Mỗi góc của lục giác đều là 720°'),
  E('E-PQ-01', 'C9-B30-M3', 'root', 'Phép quay', 'Hiểu sai phép quay', 'Giữ khoảng cách đến tâm, quay đúng góc và chiều', 5,
    'Nhầm phép quay với phép đối xứng hoặc phép tịnh tiến, sai chiều quay, sai góc khi đổi thời gian ra độ', 'Phép quay 90° biến A(2; 0) thành (0; −2) khi quay ngược chiều kim đồng hồ'),
  E('E-PQ-02', 'C9-B30-M4', 'leaf', 'Phép quay', 'Sai góc quay giữ nguyên đa giác đều', 'Đa giác đều n cạnh: góc k·360°/n', 5,
    'Lấy góc trong của đa giác làm góc quay, hoặc chia 360° cho số sai', 'Phép quay 108° giữ nguyên ngũ giác đều')
];
export const ERRORS = LOI.map(({ code, ku, misconception, viDu, remediation }) => ({ code, ku, misconception, viDu, remediation }));
export const REMEDIATION = Object.fromEntries(LOI.map((e) => [e.remediation, { ku: e.ku, title: e.tieuDe, minutes: e.phut }]));

const Q = (id, level, stem, [A, B, C, D], err, hinh) =>
  ({ id, ku: id.replace(/-Q\d+$/, ''), level, sec: SEC[level], stem, opts: { A, B, C, D }, correct: 'A', err, ...(hinh ? { hinh } : {}) });
const e3 = (c) => ({ B: c, C: c, D: c });

export const QUESTIONS = [
  // ---------- C9-B27-M1
  Q('C9-B27-M1-Q01', 1, 'Góc nội tiếp là góc:', ['có đỉnh nằm trên đường tròn và hai cạnh chứa hai dây của đường tròn', 'có đỉnh là tâm đường tròn', 'có đỉnh nằm ngoài đường tròn', 'có một cạnh là tiếp tuyến'], e3('E-GNT-01')),
  Q('C9-B27-M1-Q02', 1, 'Góc nội tiếp chắn cung có số đo 80° thì có số đo là:', ['40°', '80°', '160°', '100°'], e3('E-GNT-01')),
  Q('C9-B27-M1-Q03', 2, 'Góc nội tiếp BAC = 35°. Số đo cung BC bị chắn là:', ['70°', '35°', '17,5°', '145°'], e3('E-GNT-01')),
  Q('C9-B27-M1-Q04', 2, 'Góc nội tiếp chắn nửa đường tròn có số đo là:', ['90°', '180°', '45°', '360°'], e3('E-GNT-02')),
  Q('C9-B27-M1-Q05', 3, 'Cho (O), góc ở tâm AOB = 100°, điểm C thuộc cung lớn AB. Số đo góc ACB là:', ['50°', '100°', '130°', '200°'], e3('E-GNT-01')),
  Q('C9-B27-M1-Q06', 3, 'Cho (O) đường kính AB, điểm C thuộc đường tròn (khác A, B), góc CAB = 30°. Số đo góc CBA là:', ['60°', '30°', '90°', '150°'], e3('E-GNT-02')),
  Q('C9-B27-M1-Q07', 4, 'Hai góc nội tiếp ACB và ADB cùng chắn cung AB (C, D nằm cùng phía đối với AB). Biết góc ACB = 42°, số đo góc ADB là:', ['42°', '84°', '138°', '21°'], e3('E-GNT-02')),
  Q('C9-B27-M1-Q08', 4, 'Tam giác ABC nội tiếp đường tròn (O; R) có góc BAC = 30° và BC = 6 cm. Bán kính R là:', ['6 cm', '3 cm', '12 cm', '3√3 cm'], e3('E-GNT-01')),

  // ---------- C9-B28-M1
  Q('C9-B28-M1-Q01', 1, 'Tâm đường tròn ngoại tiếp một tam giác là giao điểm của ba đường:', ['trung trực', 'phân giác', 'trung tuyến', 'cao'], e3('E-NTT-01')),
  Q('C9-B28-M1-Q02', 1, 'Đường tròn ngoại tiếp tam giác là đường tròn:', ['đi qua ba đỉnh của tam giác', 'tiếp xúc với ba cạnh của tam giác', 'đi qua trung điểm ba cạnh', 'có tâm là trọng tâm tam giác'], { B: 'E-NTT-03', C: 'E-NTT-01', D: 'E-NTT-01' }),
  Q('C9-B28-M1-Q03', 2, 'Tâm O của đường tròn ngoại tiếp tam giác ABC thoả mãn:', ['OA = OB = OC', 'O cách đều ba cạnh của tam giác', 'O là trọng tâm tam giác', 'OA + OB = OC'], { B: 'E-NTT-03', C: 'E-NTT-01', D: 'E-NTT-01' }),
  Q('C9-B28-M1-Q04', 2, 'Tâm đường tròn ngoại tiếp một tam giác tù nằm:', ['bên ngoài tam giác', 'bên trong tam giác', 'tại trung điểm cạnh lớn nhất', 'tại đỉnh góc tù'], e3('E-NTT-01')),
  Q('C9-B28-M1-Q05', 3, 'Điểm O thoả mãn OA = OB = OC = 5 cm với A, B, C là ba đỉnh của một tam giác. Đường tròn ngoại tiếp tam giác ABC có bán kính:', ['5 cm', '10 cm', '15 cm', '2,5 cm'], e3('E-NTT-01')),
  Q('C9-B28-M1-Q06', 3, 'Để xác định tâm đường tròn ngoại tiếp tam giác ABC, chỉ cần vẽ:', ['hai đường trung trực của hai cạnh', 'hai đường phân giác', 'một đường trung trực', 'ba đường cao'], e3('E-NTT-01')),
  Q('C9-B28-M1-Q07', 4, 'Ba ngôi nhà A, B, C không thẳng hàng. Cần đặt một trạm phát sóng cách đều ba ngôi nhà. Vị trí đặt trạm là:', ['giao điểm ba đường trung trực của tam giác ABC', 'giao điểm ba đường phân giác', 'trọng tâm tam giác ABC', 'trung điểm của đoạn AB'], { B: 'E-NTT-03', C: 'E-NTT-01', D: 'E-NTT-01' }),
  Q('C9-B28-M1-Q08', 4, 'Tam giác ABC có AB = AC = 10 cm, BC = 12 cm. Bán kính đường tròn ngoại tiếp tam giác là:', ['6,25 cm', '8 cm', '6 cm', '5 cm'], { B: 'E-NTT-01', C: 'E-NTT-02', D: 'E-NTT-02' }),

  // ---------- C9-B28-M2
  Q('C9-B28-M2-Q01', 1, 'Tâm đường tròn ngoại tiếp tam giác vuông là:', ['trung điểm cạnh huyền', 'đỉnh góc vuông', 'trọng tâm tam giác', 'trung điểm một cạnh góc vuông'], e3('E-NTT-02')),
  Q('C9-B28-M2-Q02', 1, 'Tam giác ABC vuông tại A có BC = 10 cm. Bán kính đường tròn ngoại tiếp là:', ['5 cm', '10 cm', '20 cm', '5√2 cm'], e3('E-NTT-02')),
  Q('C9-B28-M2-Q03', 2, 'Tam giác ABC vuông tại A có AB = 6 cm, AC = 8 cm. Bán kính đường tròn ngoại tiếp là:', ['5 cm', '10 cm', '7 cm', '4 cm'], e3('E-NTT-02')),
  Q('C9-B28-M2-Q04', 2, 'Bán kính đường tròn ngoại tiếp tam giác đều cạnh a là:', ['a√3/3', 'a√3/6', 'a√3/2', 'a/2'], e3('E-NTT-02')),
  Q('C9-B28-M2-Q05', 3, 'Bán kính đường tròn ngoại tiếp tam giác đều cạnh 6 cm là:', ['2√3 cm', '√3 cm', '3√3 cm', '3 cm'], e3('E-NTT-02')),
  Q('C9-B28-M2-Q06', 3, 'Với tam giác đều, tâm đường tròn ngoại tiếp:', ['trùng với trọng tâm và tâm đường tròn nội tiếp', 'nằm ngoài tam giác', 'là trung điểm một cạnh', 'trùng với một đỉnh'], { B: 'E-NTT-01', C: 'E-NTT-02', D: 'E-NTT-02' }),
  Q('C9-B28-M2-Q07', 4, 'Tam giác đều nội tiếp đường tròn bán kính 4 cm. Cạnh của tam giác đều là:', ['4√3 cm', '4 cm', '8 cm', '12 cm'], e3('E-NTT-02')),
  Q('C9-B28-M2-Q08', 4, 'Một tấm bìa hình tam giác vuông có hai cạnh góc vuông 9 cm và 12 cm. Đường tròn nhỏ nhất đi qua ba đỉnh của tấm bìa có đường kính:', ['15 cm', '7,5 cm', '21 cm', '12 cm'], e3('E-NTT-02')),

  // ---------- C9-B28-M3
  Q('C9-B28-M3-Q01', 1, 'Tâm đường tròn nội tiếp một tam giác là giao điểm của ba đường:', ['phân giác', 'trung trực', 'trung tuyến', 'cao'], e3('E-NTT-03')),
  Q('C9-B28-M3-Q02', 1, 'Đường tròn nội tiếp tam giác là đường tròn:', ['tiếp xúc với ba cạnh của tam giác', 'đi qua ba đỉnh của tam giác', 'đi qua trọng tâm', 'có bán kính bằng nửa cạnh lớn nhất'], e3('E-NTT-03')),
  Q('C9-B28-M3-Q03', 2, 'Tâm I của đường tròn nội tiếp tam giác ABC:', ['cách đều ba cạnh của tam giác', 'cách đều ba đỉnh', 'là trung điểm cạnh lớn nhất', 'nằm ngoài tam giác'], e3('E-NTT-03')),
  Q('C9-B28-M3-Q04', 2, 'Bán kính đường tròn nội tiếp tam giác đều cạnh a là:', ['a√3/6', 'a√3/3', 'a√3/2', 'a/3'], e3('E-NTT-02')),
  Q('C9-B28-M3-Q05', 3, 'Bán kính đường tròn nội tiếp tam giác đều cạnh 6 cm là:', ['√3 cm', '2√3 cm', '3 cm', '3√3 cm'], e3('E-NTT-02')),
  Q('C9-B28-M3-Q06', 3, 'Tâm đường tròn nội tiếp của một tam giác bất kì luôn nằm:', ['bên trong tam giác', 'bên ngoài tam giác', 'trên một cạnh', 'tại một đỉnh'], e3('E-NTT-03')),
  Q('C9-B28-M3-Q07', 4, 'Tam giác ABC vuông tại A có AB = 6, AC = 8, BC = 10. Bán kính đường tròn nội tiếp là:', ['2', '5', '4', '2,4'], { B: 'E-NTT-02', C: 'E-NTT-03', D: 'E-NTT-03' }),
  Q('C9-B28-M3-Q08', 4, 'Cần đặt một vòi phun nước trong khu vườn hình tam giác sao cho vòi cách đều ba bờ rào (ba cạnh). Vị trí đặt vòi là:', ['giao điểm ba đường phân giác', 'giao điểm ba đường trung trực', 'trọng tâm tam giác', 'giao điểm ba đường cao'], e3('E-NTT-03')),

  // ---------- C9-B29-M1
  Q('C9-B29-M1-Q01', 1, 'Tứ giác nội tiếp đường tròn là tứ giác:', ['có bốn đỉnh nằm trên một đường tròn', 'có bốn cạnh tiếp xúc với một đường tròn', 'có ba đỉnh nằm trên một đường tròn', 'có một đỉnh là tâm đường tròn'], e3('E-TGNT-01')),
  Q('C9-B29-M1-Q02', 1, 'Trong một tứ giác nội tiếp, tổng số đo hai góc đối nhau bằng:', ['180°', '90°', '360°', 'số đo mỗi góc'], e3('E-TGNT-01')),
  Q('C9-B29-M1-Q03', 2, 'Tứ giác ABCD nội tiếp có góc A = 70°. Số đo góc C là:', ['110°', '70°', '20°', '290°'], e3('E-TGNT-01')),
  Q('C9-B29-M1-Q04', 2, 'Tứ giác ABCD nội tiếp có góc B = 95°. Số đo góc D là:', ['85°', '95°', '265°', '5°'], e3('E-TGNT-01')),
  Q('C9-B29-M1-Q05', 3, 'Tứ giác ABCD nào sau đây nội tiếp được đường tròn?', ['Góc A = 100°, góc C = 80°', 'Góc A = 100°, góc B = 80°', 'Góc A = góc C = 100°', 'Góc A = 90°, góc C = 100°'], e3('E-TGNT-01')),
  Q('C9-B29-M1-Q06', 3, 'Tứ giác ABCD nội tiếp có góc A gấp đôi góc C. Số đo góc A là:', ['120°', '60°', '90°', '240°'], e3('E-TGNT-01')),
  Q('C9-B29-M1-Q07', 4, 'Tam giác ABC có hai đường cao BE và CF. Bốn điểm B, C, E, F cùng thuộc một đường tròn vì:', ['góc BEC và góc BFC cùng bằng 90° và cùng nhìn đoạn BC', 'góc B + góc C = 180°', 'BE = CF', 'BCEF là hình thang'], e3('E-TGNT-01')),
  Q('C9-B29-M1-Q08', 4, 'Tứ giác ABCD nội tiếp có góc ngoài tại đỉnh C bằng 75°. Số đo góc A là:', ['75°', '105°', '15°', '255°'], e3('E-TGNT-01')),

  // ---------- C9-B29-M2
  Q('C9-B29-M2-Q01', 1, 'Hình nào sau đây luôn nội tiếp được đường tròn?', ['Hình chữ nhật', 'Hình bình hành', 'Hình thoi', 'Hình thang'], e3('E-TGNT-02')),
  Q('C9-B29-M2-Q02', 1, 'Tâm đường tròn ngoại tiếp hình chữ nhật là:', ['giao điểm hai đường chéo', 'một đỉnh của hình chữ nhật', 'trung điểm một cạnh', 'chân một đường cao'], e3('E-TGNT-02')),
  Q('C9-B29-M2-Q03', 2, 'Hình vuông cạnh 4 cm nội tiếp đường tròn có bán kính:', ['2√2 cm', '4 cm', '2 cm', '4√2 cm'], e3('E-TGNT-02')),
  Q('C9-B29-M2-Q04', 2, 'Hình chữ nhật có kích thước 6 cm × 8 cm nội tiếp đường tròn có bán kính:', ['5 cm', '10 cm', '7 cm', '4 cm'], e3('E-TGNT-02')),
  Q('C9-B29-M2-Q05', 3, 'Hình vuông nội tiếp đường tròn bán kính R có cạnh bằng:', ['R√2', '2R', 'R', 'R√3'], e3('E-TGNT-02')),
  Q('C9-B29-M2-Q06', 3, 'Một hình thoi không phải hình vuông có nội tiếp được đường tròn không?', ['Không, vì tổng hai góc đối khác 180°', 'Có', 'Có, nếu cạnh bằng bán kính', 'Có, tâm là giao điểm hai đường chéo'], e3('E-TGNT-02')),
  Q('C9-B29-M2-Q07', 4, 'Mặt bàn hình chữ nhật 1,2 m × 1,6 m. Tấm khăn tròn nhỏ nhất phủ kín mặt bàn có bán kính:', ['1 m', '2 m', '0,8 m', '1,4 m'], e3('E-TGNT-02')),
  Q('C9-B29-M2-Q08', 4, 'Hình vuông nội tiếp đường tròn bán kính 5 cm có diện tích là:', ['50 cm²', '25 cm²', '100 cm²', '25π cm²'], e3('E-TGNT-02')),

  // ---------- C9-B30-M1
  Q('C9-B30-M1-Q01', 1, 'Đa giác lồi là đa giác:', ['luôn nằm về một phía của đường thẳng chứa bất kì cạnh nào của nó', 'có các cạnh bằng nhau', 'có các góc bằng nhau', 'có một góc lớn hơn 180°'], e3('E-DGD-01')),
  Q('C9-B30-M1-Q02', 1, 'Đa giác có 6 cạnh được gọi là:', ['lục giác', 'ngũ giác', 'bát giác', 'thập giác'], e3('E-DGD-01')),
  Q('C9-B30-M1-Q03', 2, 'Tổng số đo các góc trong của một ngũ giác lồi là:', ['540°', '360°', '720°', '900°'], e3('E-DGD-02')),
  Q('C9-B30-M1-Q04', 2, 'Tổng số đo các góc trong của đa giác lồi n cạnh là:', ['(n − 2) · 180°', 'n · 180°', '(n − 2) · 360°', '360°'], e3('E-DGD-02')),
  Q('C9-B30-M1-Q05', 3, 'Một đa giác lồi có tổng số đo các góc trong bằng 1 080°. Số cạnh của đa giác là:', ['8', '6', '10', '12'], e3('E-DGD-02')),
  Q('C9-B30-M1-Q06', 3, 'Hình nào sau đây là đa giác lồi?', ['Hình chữ nhật', 'Hình ngôi sao năm cánh', 'Hình chữ L', 'Hình mũi tên'], e3('E-DGD-01')),
  Q('C9-B30-M1-Q07', 4, 'Số đường chéo của một lục giác lồi là:', ['9', '6', '12', '18'], e3('E-DGD-01')),
  Q('C9-B30-M1-Q08', 4, 'Tổng các góc ngoài (tại mỗi đỉnh lấy một góc) của một đa giác lồi bất kì bằng:', ['360°', '180°', '(n − 2) · 180°', 'n · 180°'], e3('E-DGD-02')),

  // ---------- C9-B30-M2
  Q('C9-B30-M2-Q01', 1, 'Đa giác đều là đa giác lồi có:', ['tất cả các cạnh bằng nhau và tất cả các góc bằng nhau', 'tất cả các cạnh bằng nhau', 'tất cả các góc bằng nhau', 'các đường chéo bằng nhau'], e3('E-DGD-01')),
  Q('C9-B30-M2-Q02', 1, 'Hình nào sau đây là đa giác đều?', ['Hình vuông', 'Hình thoi có một góc 60°', 'Hình chữ nhật 2 cm × 3 cm', 'Tam giác vuông cân'], e3('E-DGD-01')),
  Q('C9-B30-M2-Q03', 2, 'Mỗi góc trong của lục giác đều có số đo:', ['120°', '60°', '720°', '135°'], e3('E-DGD-02')),
  Q('C9-B30-M2-Q04', 2, 'Mỗi góc trong của ngũ giác đều có số đo:', ['108°', '72°', '540°', '120°'], e3('E-DGD-02')),
  Q('C9-B30-M2-Q05', 3, 'Mỗi góc trong của bát giác đều có số đo:', ['135°', '45°', '1 080°', '120°'], e3('E-DGD-02')),
  Q('C9-B30-M2-Q06', 3, 'Một đa giác đều có mỗi góc trong bằng 150°. Số cạnh của đa giác là:', ['12', '10', '15', '6'], e3('E-DGD-02')),
  Q('C9-B30-M2-Q07', 4, 'Lục giác đều nội tiếp đường tròn bán kính R có cạnh bằng:', ['R', 'R√3', 'R√2', '2R'], e3('E-DGD-02')),
  Q('C9-B30-M2-Q08', 4, 'Viên gạch lát nền hình đa giác đều nào sau đây ghép kín được mặt phẳng (dùng các viên cùng loại)?', ['Lục giác đều', 'Ngũ giác đều', 'Bát giác đều', 'Thất giác đều'], e3('E-DGD-02')),

  // ---------- C9-B30-M3
  Q('C9-B30-M3-Q01', 1, 'Phép quay tâm O góc α (0° < α < 360°) biến điểm A (khác O) thành điểm A′ sao cho:', ['OA′ = OA và góc AOA′ = α theo chiều quay đã cho', 'OA′ = 2OA', 'A′ đối xứng với A qua O', 'AA′ = α'], e3('E-PQ-01')),
  Q('C9-B30-M3-Q02', 1, 'Trong phép quay tâm O, điểm nào không thay đổi vị trí?', ['Tâm O', 'Mọi điểm', 'Không có điểm nào', 'Các điểm trên một đường tròn tâm O'], e3('E-PQ-01')),
  Q('C9-B30-M3-Q03', 2, 'Phép quay tâm O góc 180° biến điểm A thành điểm A′. Khẳng định đúng là:', ['O là trung điểm của AA′', 'A′ trùng với A', 'OA′ = 2OA', 'OA vuông góc với OA′'], e3('E-PQ-01')),
  Q('C9-B30-M3-Q04', 2, 'Kim phút quay từ vị trí chỉ số 12 đến vị trí chỉ số 3. Kim phút đã quay một góc:', ['90° theo chiều kim đồng hồ', '90° ngược chiều kim đồng hồ', '3°', '30°'], e3('E-PQ-01')),
  Q('C9-B30-M3-Q05', 3, 'Phép quay tâm O(0; 0) góc 90° ngược chiều kim đồng hồ biến điểm A(2; 0) thành điểm:', ['(0; 2)', '(0; −2)', '(−2; 0)', '(2; 2)'], e3('E-PQ-01')),
  Q('C9-B30-M3-Q06', 3, 'Trong 15 phút, kim phút quay quanh tâm đồng hồ một góc:', ['90°', '15°', '45°', '180°'], e3('E-PQ-01')),
  Q('C9-B30-M3-Q07', 4, 'Phép quay tâm O góc 60° biến điểm A thành điểm B, OA = 3 cm. Tam giác OAB là tam giác:', ['đều', 'vuông', 'tù', 'vuông cân'], e3('E-PQ-01')),
  Q('C9-B30-M3-Q08', 4, 'Một bánh xe quay được 2,5 vòng. Mỗi điểm trên vành bánh xe đã quay quanh trục một góc:', ['900°', '250°', '450°', '360°'], e3('E-PQ-01')),

  // ---------- C9-B30-M4
  Q('C9-B30-M4-Q01', 1, 'Phép quay tâm O góc 120° giữ nguyên hình nào có tâm O?', ['Tam giác đều', 'Hình vuông', 'Ngũ giác đều', 'Hình chữ nhật'], e3('E-PQ-02')),
  Q('C9-B30-M4-Q02', 1, 'Phép quay tâm O góc 90° giữ nguyên hình nào có tâm O?', ['Hình vuông', 'Tam giác đều', 'Lục giác đều', 'Ngũ giác đều'], e3('E-PQ-02')),
  Q('C9-B30-M4-Q03', 2, 'Các phép quay tâm O góc α (0° < α ≤ 360°) giữ nguyên lục giác đều tâm O có góc quay là:', ['60°; 120°; 180°; 240°; 300°; 360°', '90°; 180°; 270°; 360°', '120°; 240°; 360°', 'chỉ 360°'], e3('E-PQ-02')),
  Q('C9-B30-M4-Q04', 2, 'Có bao nhiêu phép quay tâm O góc α (0° < α ≤ 360°) giữ nguyên ngũ giác đều tâm O?', ['5', '1', '10', '4'], e3('E-PQ-02')),
  Q('C9-B30-M4-Q05', 3, 'Góc quay dương nhỏ nhất của phép quay tâm O giữ nguyên bát giác đều tâm O là:', ['45°', '135°', '90°', '8°'], e3('E-PQ-02')),
  Q('C9-B30-M4-Q06', 3, 'Phép quay tâm O góc 72° giữ nguyên đa giác đều tâm O nào?', ['Ngũ giác đều', 'Lục giác đều', 'Hình vuông', 'Tam giác đều'], e3('E-PQ-02')),
  Q('C9-B30-M4-Q07', 4, 'Lục giác đều ABCDEF có tâm O, các đỉnh theo thứ tự ngược chiều kim đồng hồ. Phép quay tâm O góc 60° ngược chiều kim đồng hồ biến đỉnh A thành đỉnh:', ['B', 'A', 'D', 'C'], e3('E-PQ-02')),
  Q('C9-B30-M4-Q08', 4, 'Một bánh xe có 5 nan hoa chia đều. Góc quay dương nhỏ nhất để bánh xe trông giống hệt ban đầu là:', ['72°', '5°', '108°', '36°'], e3('E-PQ-02'))
];

export const HINTS = {
  'E-GNT-01': ['Đỉnh của góc nằm ở tâm hay trên đường tròn? Góc nội tiếp bằng cả cung hay một nửa cung?', 'Góc nội tiếp có đỉnh trên đường tròn và bằng NỬA số đo cung bị chắn. Góc ở tâm (đỉnh là tâm) mới bằng cả số đo cung.', 'Ví dụ: góc nội tiếp chắn cung 80° có số đo 40°; góc AOB = 100° thì góc nội tiếp ACB chắn cung đó bằng 50°.'],
  'E-GNT-02': ['Cung bị chắn có phải nửa đường tròn không? Hai góc có cùng chắn một cung không?', 'Góc nội tiếp chắn nửa đường tròn là góc vuông. Các góc nội tiếp cùng chắn một cung (hoặc chắn các cung bằng nhau) thì bằng nhau.', 'Ví dụ: AB là đường kính, C thuộc đường tròn thì góc ACB = 90°; góc CAB = 30° thì góc CBA = 60°.'],
  'E-NTT-01': ['Tâm đường tròn ngoại tiếp phải cách đều cái gì: ba đỉnh hay ba cạnh?', 'Tâm đường tròn ngoại tiếp cách đều ba đỉnh, là giao điểm ba đường trung trực (chỉ cần vẽ hai). Tam giác nhọn: tâm ở trong; vuông: ở trung điểm cạnh huyền; tù: ở ngoài tam giác.', 'Ví dụ: trạm phát sóng cách đều ba ngôi nhà đặt tại giao điểm các đường trung trực.'],
  'E-NTT-02': ['Tam giác là tam giác vuông hay tam giác đều? Cạnh huyền là đường kính hay bán kính?', 'Tam giác vuông: R = cạnh huyền : 2. Tam giác đều cạnh a: R = a√3/3 (bằng 2/3 đường cao), r = a√3/6 (bằng 1/3 đường cao).', 'Ví dụ: tam giác đều cạnh 6: đường cao 3√3, R = 2√3, r = √3; tam giác vuông cạnh 6, 8, 10 có R = 5.'],
  'E-NTT-03': ['Tâm đường tròn nội tiếp cách đều ba đỉnh hay ba cạnh?', 'Tâm đường tròn nội tiếp là giao điểm ba đường phân giác trong, cách đều ba cạnh và luôn nằm trong tam giác. Tam giác vuông: r = (b + c − a)/2.', 'Ví dụ: vòi phun cách đều ba bờ rào đặt tại giao ba đường phân giác; tam giác 6, 8, 10 có r = (6 + 8 − 10)/2 = 2.'],
  'E-TGNT-01': ['Hai góc em đang xét là hai góc đối (không chung cạnh) hay hai góc kề?', 'Tứ giác nội tiếp ⇔ tổng hai góc đối bằng 180°. Góc ngoài tại một đỉnh bằng góc trong của đỉnh đối diện. Hai góc vuông cùng nhìn một đoạn thì bốn điểm cùng thuộc đường tròn.', 'Ví dụ: góc A = 70° thì góc C = 110°; góc ngoài tại C bằng 75° thì góc A = 75°.'],
  'E-TGNT-02': ['Hình đó có tổng hai góc đối bằng 180° không? Bán kính bằng cạnh hay bằng nửa đường chéo?', 'Hình chữ nhật, hình vuông nội tiếp đường tròn tâm là giao hai đường chéo, R = đường chéo : 2. Hình vuông cạnh a: R = a√2/2; ngược lại cạnh = R√2. Hình thoi, hình bình hành (không phải chữ nhật) không nội tiếp được.', 'Ví dụ: hình chữ nhật 6 × 8 có đường chéo 10, R = 5.'],
  'E-DGD-01': ['Đa giác đều cần những gì bằng nhau: chỉ cạnh, chỉ góc, hay cả hai?', 'Đa giác đều: đa giác lồi có mọi cạnh bằng nhau VÀ mọi góc bằng nhau. Hình thoi chỉ có cạnh bằng nhau, hình chữ nhật chỉ có góc bằng nhau. Số đường chéo của đa giác n cạnh là n(n − 3)/2.', 'Ví dụ: hình vuông là đa giác đều; hình thoi góc 60° không phải.'],
  'E-DGD-02': ['Tổng các góc trong của đa giác n cạnh là bao nhiêu? Đa giác đều có mấy góc bằng nhau?', 'Tổng góc trong = (n − 2)·180°. Mỗi góc của đa giác đều = (n − 2)·180°/n. Mỗi góc ngoài = 360°/n; tổng các góc ngoài = 360°.', 'Ví dụ: lục giác đều: (6 − 2)·180°/6 = 120°; góc trong 150° thì góc ngoài 30°, số cạnh 360 : 30 = 12.'],
  'E-PQ-01': ['Sau phép quay, khoảng cách từ điểm đến tâm có thay đổi không? Quay theo chiều nào?', 'Phép quay tâm O góc α: OA′ = OA và góc AOA′ = α theo chiều đã cho (chiều dương là ngược chiều kim đồng hồ). Tâm O đứng yên. Một vòng = 360°; kim phút quay 6° mỗi phút.', 'Ví dụ: quay 90° ngược chiều kim đồng hồ quanh O, A(2; 0) đến (0; 2); 15 phút kim phút quay 90°.'],
  'E-PQ-02': ['Chia 360° cho số cạnh của đa giác thì được góc nào?', 'Phép quay tâm O giữ nguyên đa giác đều n cạnh tâm O có góc k·360°/n (k = 1, 2, …, n). Đó là góc ở tâm, không phải góc trong của đa giác.', 'Ví dụ: ngũ giác đều: 72°, 144°, 216°, 288°, 360°; không phải 108° (góc trong).']
};

const V = (dan, quyTac, viDu, tuLam) => ({ dan, quyTac, viDu: viDu.map(([de, giai]) => ({ de, giai })), tuLam: tuLam.map(([de, dapAn, giaiThich]) => ({ de, dapAn, giaiThich })) });
export const VI_BAI_HOC = {
  'VBH-GNT-01': V('Góc ở tâm "thấy" trọn cung, góc nội tiếp đứng xa hơn nên chỉ "thấy" một nửa.',
    'Góc nội tiếp = 1/2 số đo cung bị chắn = 1/2 góc ở tâm cùng chắn cung đó.',
    [['Góc nội tiếp chắn cung 80°.', 'Cách nghĩ sai: 80°. Cách đúng: 80° : 2 = 40°.'],
     ['Góc nội tiếp BAC = 35°, cung BC?', 'Cung BC = 2 · 35° = 70°.']],
    [['Góc AOB = 100°, góc nội tiếp ACB chắn cung đó?', '50°', 'Nửa góc ở tâm.'],
     ['Góc A = 30°, BC = 6, R?', '6', 'Góc BOC = 60°, tam giác OBC đều.']]),
  'VBH-GNT-02': V('Hai hệ quả "vàng": đường kính tạo góc vuông, cùng cung thì bằng nhau.',
    'Góc nội tiếp chắn nửa đường tròn bằng 90°. Các góc nội tiếp cùng chắn một cung thì bằng nhau.',
    [['AB là đường kính, góc CAB = 30°, góc CBA?', 'Cách nghĩ sai: không tính được. Cách đúng: góc ACB = 90° nên góc CBA = 60°.'],
     ['ACB = 42°, ADB cùng chắn cung AB.', 'ADB = 42°.']],
    [['Góc chắn nửa đường tròn?', '90°', 'Hệ quả.'],
     ['Hai góc cùng chắn một cung có bằng nhau?', 'Có', 'Hệ quả.']]),
  'VBH-NTT-01': V('"Ngoại tiếp" là vòng tròn đi qua các đỉnh — nên tâm phải cách đều các đỉnh.',
    'Tâm đường tròn ngoại tiếp = giao điểm ba đường trung trực, OA = OB = OC. Chỉ cần vẽ hai đường trung trực.',
    [['Tâm ngoại tiếp là trọng tâm?', 'Cách nghĩ sai: đúng. Cách đúng: trọng tâm là giao các trung tuyến; tâm ngoại tiếp là giao các trung trực (chỉ trùng nhau ở tam giác đều).'],
     ['Trạm cách đều ba nhà A, B, C.', 'Đặt tại giao các đường trung trực của tam giác ABC.']],
    [['Tam giác tù, tâm ngoại tiếp ở đâu?', 'Ngoài tam giác', 'Tính chất.'],
     ['OA = OB = OC = 5, R?', '5', 'Định nghĩa.']]),
  'VBH-NTT-02': V('Hai tam giác đặc biệt có bán kính tính nhanh: tam giác vuông và tam giác đều.',
    'Tam giác vuông: R = cạnh huyền : 2. Tam giác đều cạnh a: đường cao h = a√3/2, R = 2h/3 = a√3/3, r = h/3 = a√3/6.',
    [['Tam giác đều cạnh 6, tìm R.', 'Cách nghĩ sai: R = 3√3 (đường cao). Cách đúng: h = 3√3, R = 2h/3 = 2√3.'],
     ['Tam giác vuông 6, 8, 10, tìm R.', 'R = 10 : 2 = 5.']],
    [['Tam giác đều cạnh 6, r?', '√3', 'h/3.'],
     ['Tam giác đều nội tiếp đường tròn R = 4, cạnh?', '4√3', 'a = R√3.']]),
  'VBH-NTT-03': V('"Nội tiếp" là vòng tròn nằm trong, chạm ba cạnh — nên tâm phải cách đều ba cạnh.',
    'Tâm đường tròn nội tiếp = giao điểm ba đường phân giác trong, cách đều ba cạnh, luôn ở trong tam giác.',
    [['Vòi phun cách đều ba bờ rào đặt ở đâu?', 'Cách nghĩ sai: giao các trung trực. Cách đúng: "cách đều ba cạnh" là giao các đường phân giác.'],
     ['Tam giác vuông 6, 8, 10, tìm r.', 'r = (6 + 8 − 10)/2 = 2.']],
    [['Tâm nội tiếp là giao đường gì?', 'Phân giác', 'Tính chất.'],
     ['Tâm nội tiếp có thể nằm ngoài tam giác?', 'Không', 'Luôn ở trong.']]),
  'VBH-TGNT-01': V('Tứ giác nội tiếp có "luật cân bằng": hai góc đối cộng lại đúng 180°.',
    'ABCD nội tiếp ⇔ góc A + góc C = 180° (hoặc góc B + góc D = 180°). Hai đỉnh cùng nhìn một đoạn dưới góc vuông thì cùng nằm trên đường tròn đường kính đó.',
    [['Góc A = 70°, góc C?', 'Cách nghĩ sai: 70°. Cách đúng: 180° − 70° = 110°.'],
     ['BE, CF là đường cao của tam giác ABC.', 'Góc BEC = góc BFC = 90° cùng nhìn BC nên B, C, E, F cùng thuộc đường tròn đường kính BC.']],
    [['Góc B = 95°, góc D?', '85°', '180° − 95°.'],
     ['Góc A = 2 góc C, góc A?', '120°', 'A + C = 180°.']]),
  'VBH-TGNT-02': V('Hình chữ nhật, hình vuông luôn "vừa khít" trong một đường tròn có đường kính là đường chéo.',
    'Tâm = giao điểm hai đường chéo; R = đường chéo : 2. Hình vuông cạnh a: R = a√2/2, ngược lại a = R√2. Hình thoi, hình bình hành (không phải chữ nhật) không nội tiếp được.',
    [['Hình vuông cạnh 4, R?', 'Cách nghĩ sai: R = 4. Cách đúng: đường chéo 4√2, R = 2√2.'],
     ['Hình thoi góc 60° có nội tiếp được?', 'Không: hai góc đối 60° + 60° ≠ 180°.']],
    [['Chữ nhật 6 × 8, R?', '5', 'Chéo 10.'],
     ['Hình vuông nội tiếp R = 5, diện tích?', '50', 'Cạnh 5√2.']]),
  'VBH-DGD-01': V('Đa giác đều cần "hai chữ đều": đều cạnh và đều góc.',
    'Đa giác đều là đa giác lồi có mọi cạnh bằng nhau và mọi góc bằng nhau. Thiếu một điều kiện là không phải.',
    [['Hình thoi có là đa giác đều?', 'Cách nghĩ sai: có vì 4 cạnh bằng nhau. Cách đúng: các góc không bằng nhau (trừ hình vuông) nên không phải.'],
     ['Số đường chéo lục giác lồi?', '6 · 3 : 2 = 9.']],
    [['Hình vuông có là đa giác đều?', 'Có', 'Đủ hai điều kiện.'],
     ['Hình chữ nhật 2 × 3?', 'Không', 'Cạnh khác nhau.']]),
  'VBH-DGD-02': V('Một công thức cho tổng, chia n cho từng góc.',
    'Tổng góc trong = (n − 2)·180°. Đa giác đều: mỗi góc = (n − 2)·180°/n; mỗi góc ngoài = 360°/n.',
    [['Mỗi góc lục giác đều?', 'Cách nghĩ sai: 720° (là tổng). Cách đúng: 720° : 6 = 120°.'],
     ['Góc trong 150°, mấy cạnh?', 'Góc ngoài 30°, n = 360 : 30 = 12.']],
    [['Mỗi góc ngũ giác đều?', '108°', '540° : 5.'],
     ['Tổng góc trong 1 080°, n?', '8', '(n − 2)·180 = 1 080.']]),
  'VBH-PQ-01': V('Quay là "xoay quanh một chốt": khoảng cách tới chốt giữ nguyên, chỉ góc thay đổi.',
    'Phép quay tâm O góc α: OA′ = OA, góc AOA′ = α, theo chiều đã cho (ngược chiều kim đồng hồ là chiều dương). Tâm O không đổi.',
    [['Quay A(2; 0) quanh O góc 90° ngược chiều kim đồng hồ.', 'Cách nghĩ sai: (0; −2). Cách đúng: ngược chiều kim đồng hồ đi lên: (0; 2).'],
     ['Kim phút 15 phút quay bao nhiêu?', '15 · 6° = 90°.']],
    [['Quay 180° quanh O, O là gì của AA′?', 'Trung điểm', 'OA = OA′, thẳng hàng.'],
     ['2,5 vòng bằng?', '900°', '2,5 · 360°.']]),
  'VBH-PQ-02': V('Đa giác đều n cạnh "trùng lại chính nó" sau mỗi lần quay 360°/n.',
    'Phép quay tâm O giữ nguyên đa giác đều n cạnh: góc k·360°/n (k = 1…n). Đây là góc ở tâm, không phải góc trong.',
    [['Ngũ giác đều: phép quay 108° có giữ nguyên?', 'Cách nghĩ sai: có (108° là góc trong). Cách đúng: góc quay phải là bội của 360°/5 = 72°.'],
     ['Lục giác đều, quay 60°.', 'Mỗi đỉnh chuyển sang đỉnh kế tiếp.']],
    [['Bát giác đều, góc nhỏ nhất?', '45°', '360 : 8.'],
     ['Hình vuông có mấy phép quay (0° < α ≤ 360°)?', '4', '90°, 180°, 270°, 360°.']])
};

export const ERROR_NODES = LOI.map((e) => ({ id: e.code, name: e.ten, role: e.role, kuId: e.ku, cluster: e.cluster }));
export const CAUSAL_EDGES = [
  { from: 'E-GNT-01', to: 'E-GNT-02', weight: 0.6, reason: 'Không nắm góc nội tiếp = nửa cung nên không suy ra được góc vuông, góc bằng nhau' },
  { from: 'E-GNT-01', to: 'E-TGNT-01', weight: 0.55, reason: 'Không nắm số đo góc nội tiếp nên không hiểu tổng hai góc đối 180°' },
  { from: 'E-GNT-02', to: 'E-NTT-02', weight: 0.5, reason: 'Không biết góc vuông chắn nửa đường tròn nên không biết cạnh huyền là đường kính' },
  { from: 'E-NTT-01', to: 'E-NTT-02', weight: 0.5, reason: 'Nhầm tâm ngoại tiếp nên tính bán kính sai' },
  { from: 'E-NTT-01', to: 'E-NTT-03', weight: 0.5, reason: 'Nhầm trung trực với phân giác' },
  { from: 'E-TGNT-01', to: 'E-TGNT-02', weight: 0.5, reason: 'Không nắm điều kiện góc đối nên nhận biết hình nội tiếp sai' },
  { from: 'E-DGD-01', to: 'E-DGD-02', weight: 0.5, reason: 'Không nắm đa giác đều nên tính góc sai' },
  { from: 'E-PQ-01', to: 'E-PQ-02', weight: 0.6, reason: 'Hiểu sai phép quay nên tìm góc quay giữ nguyên đa giác sai' },
  { from: 'E-DGD-02', to: 'E-PQ-02', weight: 0.45, reason: 'Nhầm góc trong với góc ở tâm' }
];
export const ROOT_ERROR_IDS = ['E-GNT-01', 'E-NTT-01', 'E-DGD-01', 'E-PQ-01'];

const NHAP = 'Bản nháp do trợ lý AI soạn theo từ điển mã lỗi — giáo viên cần duyệt, sửa trước khi dùng';
const A = (id, ten, errorCodes, nhom, hinhThuc, mucNhanThuc, phut, moTa, hocLieu) => ({ id, ten, errorCodes, nhom, hinhThuc, mucNhanThuc, phut, moTa, hocLieu, trangThai: 'nhap', nguon: NHAP });
export const ACTIVITIES = [
  A('HD-GNT-01', 'Đo góc nội tiếp và góc ở tâm', ['E-GNT-01', 'E-GNT-02'], ['loi'], 'nhom-dong-chat', 1, [8, 10],
    'Nhóm vẽ đường tròn, chọn một cung, vẽ góc ở tâm và ba góc nội tiếp cùng chắn cung đó, đo bằng thước đo góc để rút ra "bằng nửa" và "cùng chắn thì bằng nhau"; vẽ thêm góc chắn nửa đường tròn.', 'Compa, thước đo góc'),
  A('HD-NTT-01', 'Trung trực hay phân giác?', ['E-NTT-01', 'E-NTT-03'], ['loi'], 'nhom-dong-chat', 2, [8, 12],
    'Mỗi nhóm có một tam giác bằng giấy: gấp các đường trung trực để tìm tâm ngoại tiếp và gấp các đường phân giác để tìm tâm nội tiếp, vẽ hai đường tròn và so sánh vị trí hai tâm.', 'Tam giác giấy, compa'),
  A('HD-NTT-02', 'Bán kính nhanh của tam giác đặc biệt', ['E-NTT-02'], ['loi'], 'ca-nhan', 2, [6, 8],
    'Học sinh tính đường cao, R, r của tam giác đều cạnh 6 và R, r của tam giác vuông 6, 8, 10; so với đường tròn vẽ thật để kiểm tra.', 'Phiếu, compa'),
  A('HD-TGNT-01', 'Góc đối cộng 180°', ['E-TGNT-01', 'E-TGNT-02'], ['loi'], 'nhom-dong-chat', 2, [8, 10],
    'Nhóm vẽ 3 tứ giác nội tiếp, đo bốn góc, cộng từng cặp góc đối; sau đó thử vẽ hình thoi, hình bình hành, hình chữ nhật nội tiếp và giải thích hình nào làm được.', 'Compa, thước đo góc'),
  A('HD-DGD-01', 'Xoay đa giác đều', ['E-DGD-01', 'E-DGD-02', 'E-PQ-01', 'E-PQ-02'], ['loi'], 'nhom-dong-chat', 2, [10, 12],
    'Nhóm cắt tam giác đều, hình vuông, lục giác đều bằng bìa, ghim tâm lên giấy và xoay; ghi các góc quay làm hình trùng lại chính nó và so với 360°/n; tính góc trong để phân biệt với góc quay.', 'Bìa, ghim, thước đo góc'),
  A('HD-C9-MR', 'Hoa văn từ đa giác đều', [], ['san-sang'], 'nhom-dong-chat', 4, [12, 15],
    'Nhóm dựng một hoa văn lát nền từ lục giác đều và tam giác đều nội tiếp đường tròn, giải thích vì sao các viên ghép kín mặt phẳng dựa vào số đo góc.', 'Compa, giấy A4')
];
