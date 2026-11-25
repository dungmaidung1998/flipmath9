/**
 * NỘI DUNG TOÁN 9 — CHƯƠNG X. MỘT SỐ HÌNH KHỐI TRONG THỰC TIỄN (Kết nối tri thức)
 * BẢN NHÁP do trợ lý AI soạn theo SGK Toán 9 tập hai (Bài 31–32) — giáo viên duyệt trước khi dùng.
 * Kí hiệu: r bán kính đáy, h chiều cao, l đường sinh, R bán kính hình cầu.
 */
const SEC = { 1: 45, 2: 60, 3: 90, 4: 120 };
const B31 = 'Bài 31. Hình trụ và hình nón';
const B32 = 'Bài 32. Hình cầu';
const U = (id, bai, muc, name, order, prerequisite, mucTieu, extra = {}) => ({ id, bai, muc, name, order, prerequisite, mucTieu, ...extra });

export const UNITS = [
  U('C10-B31-M1', B31, 'Mục 1', 'Nhận biết hình trụ', 150, null,
    'Nhận biết hình trụ và các yếu tố: bán kính đáy, chiều cao, đường sinh, trục; mặt cắt song song với đáy, mặt cắt chứa trục.'),
  U('C10-B31-M2', B31, 'Mục 1 (tiếp)', 'Diện tích xung quanh và thể tích hình trụ', 151, 'C10-B31-M1',
    'Tính diện tích xung quanh Sxq = 2πrh, diện tích toàn phần, thể tích V = πr²h của hình trụ; vận dụng vào thực tế.'),
  U('C10-B31-M3', B31, 'Mục 2', 'Nhận biết hình nón', 152, 'C10-B31-M1',
    'Nhận biết hình nón và các yếu tố: đỉnh, bán kính đáy, chiều cao, đường sinh; hệ thức l² = h² + r².'),
  U('C10-B31-M4', B31, 'Mục 2 (tiếp)', 'Diện tích xung quanh và thể tích hình nón', 153, 'C10-B31-M3',
    'Tính diện tích xung quanh Sxq = πrl và thể tích V = (1/3)πr²h của hình nón; vận dụng vào thực tế.'),
  U('C10-B32-M1', B32, 'Mục 1', 'Nhận biết hình cầu, mặt cầu', 154, 'C10-B31-M1',
    'Nhận biết hình cầu, mặt cầu, tâm, bán kính; mặt cắt của hình cầu bởi một mặt phẳng.'),
  U('C10-B32-M2', B32, 'Mục 2', 'Diện tích mặt cầu và thể tích hình cầu', 155, 'C10-B32-M1',
    'Tính diện tích mặt cầu S = 4πR² và thể tích hình cầu V = (4/3)πR³; vận dụng vào thực tế.')
];

const E = (code, ku, role, cluster, ten, tieuDe, phut, misconception, viDu) =>
  ({ code, ku, role, cluster, ten, tieuDe, phut, misconception, viDu, remediation: 'VBH-' + code.slice(2) });
const LOI = [
  E('E-TRU-01', 'C10-B31-M1', 'root', 'Hình trụ, hình nón, hình cầu', 'Xác định sai bán kính đáy, chiều cao', 'Bán kính = đường kính : 2; cạnh quay quanh là chiều cao', 5,
    'Dùng đường kính thay bán kính, hoặc nhầm cạnh làm trục quay với cạnh tạo nên bán kính đáy', 'Quay hình chữ nhật 3 × 5 quanh cạnh 3 được hình trụ bán kính 3'),
  E('E-TRU-02', 'C10-B31-M2', 'leaf', 'Hình trụ, hình nón, hình cầu', 'Sai công thức diện tích, thể tích hình trụ', 'Sxq = 2πrh; Stp = 2πrh + 2πr²; V = πr²h', 5,
    'Nhầm Sxq với thể tích, quên thừa số 2, quên hai đáy khi tính diện tích toàn phần', 'r = 3, h = 5: Sxq = πrh = 15π'),
  E('E-NON-01', 'C10-B31-M3', 'mediating', 'Hình trụ, hình nón, hình cầu', 'Nhầm đường sinh với chiều cao hình nón', 'l² = h² + r²; Sxq dùng l, V dùng h', 5,
    'Dùng chiều cao thay đường sinh khi tính diện tích xung quanh (hoặc ngược lại khi tính thể tích), tính sai l từ h và r', 'h = 4, r = 3: l = 7'),
  E('E-NON-02', 'C10-B31-M4', 'leaf', 'Hình trụ, hình nón, hình cầu', 'Sai công thức hình nón', 'Sxq = πrl; V = (1/3)πr²h', 5,
    'Quên thừa số 1/3 trong thể tích hình nón, hoặc dùng 2πrl như hình trụ', 'r = 3, h = 4: V = 36π'),
  E('E-CAU-01', 'C10-B32-M1', 'mediating', 'Hình trụ, hình nón, hình cầu', 'Nhận biết hình cầu, bán kính sai', 'R = đường kính : 2; cắt qua tâm được hình tròn lớn', 5,
    'Nhầm mặt cầu với hình cầu, dùng đường kính thay bán kính, tính sai bán kính mặt cắt', 'Bóng đường kính 20 cm: S = 4π·20²'),
  E('E-CAU-02', 'C10-B32-M2', 'leaf', 'Hình trụ, hình nón, hình cầu', 'Sai công thức hình cầu', 'S = 4πR²; V = (4/3)πR³', 5,
    'Tính diện tích mặt cầu bằng πR², thể tích bằng 4πR² hoặc πR³ (thiếu 4/3)', 'R = 6: V = 4π·6² = 144π (đúng phải là 288π)')
];
export const ERRORS = LOI.map(({ code, ku, misconception, viDu, remediation }) => ({ code, ku, misconception, viDu, remediation }));
export const REMEDIATION = Object.fromEntries(LOI.map((e) => [e.remediation, { ku: e.ku, title: e.tieuDe, minutes: e.phut }]));

const Q = (id, level, stem, [A, B, C, D], err, hinh) =>
  ({ id, ku: id.replace(/-Q\d+$/, ''), level, sec: SEC[level], stem, opts: { A, B, C, D }, correct: 'A', err, ...(hinh ? { hinh } : {}) });
const e3 = (c) => ({ B: c, C: c, D: c });

export const QUESTIONS = [
  // ---------- C10-B31-M1
  Q('C10-B31-M1-Q01', 1, 'Quay một hình chữ nhật một vòng quanh một cạnh cố định, ta được:', ['hình trụ', 'hình nón', 'hình cầu', 'hình hộp chữ nhật'], e3('E-TRU-01')),
  Q('C10-B31-M1-Q02', 1, 'Một hình trụ có đường kính đáy 10 cm. Bán kính đáy là:', ['5 cm', '10 cm', '20 cm', '2,5 cm'], e3('E-TRU-01')),
  Q('C10-B31-M1-Q03', 2, 'Quay hình chữ nhật ABCD (AB = 3 cm, BC = 5 cm) một vòng quanh cạnh AB cố định, ta được hình trụ có:', ['bán kính đáy 5 cm, chiều cao 3 cm', 'bán kính đáy 3 cm, chiều cao 5 cm', 'bán kính đáy 2,5 cm, chiều cao 3 cm', 'bán kính đáy 5 cm, chiều cao 5 cm'], e3('E-TRU-01')),
  Q('C10-B31-M1-Q04', 2, 'Trong hình trụ, đường sinh:', ['bằng chiều cao và vuông góc với hai mặt đáy', 'bằng bán kính đáy', 'bằng đường kính đáy', 'song song với mặt đáy'], e3('E-TRU-01')),
  Q('C10-B31-M1-Q05', 3, 'Cắt hình trụ bởi một mặt phẳng song song với mặt đáy, mặt cắt là:', ['hình tròn bằng hình tròn đáy', 'hình chữ nhật', 'hình tròn nhỏ hơn hình tròn đáy', 'hình tam giác'], e3('E-TRU-01')),
  Q('C10-B31-M1-Q06', 3, 'Cắt hình trụ (bán kính đáy r, chiều cao h) bởi mặt phẳng chứa trục, mặt cắt là hình chữ nhật có kích thước:', ['2r × h', 'r × h', '2r × 2h', 'πr × h'], e3('E-TRU-01')),
  Q('C10-B31-M1-Q07', 4, 'Vật nào sau đây có dạng hình trụ?', ['Lon nước ngọt', 'Quả bóng', 'Cái phễu', 'Hộp sữa hình hộp chữ nhật'], e3('E-TRU-01')),
  Q('C10-B31-M1-Q08', 4, 'Một ống cống hình trụ rỗng có đường kính ngoài 1 m, thành ống dày 0,1 m. Bán kính trong của ống là:', ['0,4 m', '0,9 m', '0,5 m', '0,8 m'], e3('E-TRU-01')),

  // ---------- C10-B31-M2
  Q('C10-B31-M2-Q01', 1, 'Diện tích xung quanh của hình trụ bán kính đáy r, chiều cao h là:', ['2πrh', 'πrh', 'πr²h', '2πr²h'], e3('E-TRU-02')),
  Q('C10-B31-M2-Q02', 1, 'Thể tích của hình trụ bán kính đáy r, chiều cao h là:', ['πr²h', '2πrh', '(1/3)πr²h', 'πrh'], e3('E-TRU-02')),
  Q('C10-B31-M2-Q03', 2, 'Hình trụ có bán kính đáy 3 cm, chiều cao 5 cm. Diện tích xung quanh là:', ['30π cm²', '15π cm²', '45π cm²', '90π cm²'], e3('E-TRU-02')),
  Q('C10-B31-M2-Q04', 2, 'Hình trụ có bán kính đáy 3 cm, chiều cao 5 cm. Thể tích là:', ['45π cm³', '30π cm³', '15π cm³', '75π cm³'], e3('E-TRU-02')),
  Q('C10-B31-M2-Q05', 3, 'Hình trụ có bán kính đáy 3 cm, chiều cao 5 cm. Diện tích toàn phần là:', ['48π cm²', '30π cm²', '39π cm²', '78π cm²'], e3('E-TRU-02')),
  Q('C10-B31-M2-Q06', 3, 'Một lon nước hình trụ có đường kính đáy 6 cm, chiều cao 12 cm. Thể tích của lon (lấy π ≈ 3,14) khoảng:', ['339,12 cm³', '1 356,48 cm³', '226,08 cm³', '113,04 cm³'], { B: 'E-TRU-01', C: 'E-TRU-02', D: 'E-TRU-02' }),
  Q('C10-B31-M2-Q07', 4, 'Một ống cống hình trụ rỗng có đường kính ngoài 1 m, thành dày 0,1 m, dài 2 m. Thể tích bê tông làm ống là:', ['0,18π m³', '0,02π m³', '0,5π m³', '0,32π m³'], e3('E-TRU-02')),
  Q('C10-B31-M2-Q08', 4, 'Một bồn nước hình trụ có thể tích 3,14 m³, bán kính đáy 1 m (lấy π = 3,14). Chiều cao của bồn là:', ['1 m', '0,5 m', '3,14 m', '2 m'], e3('E-TRU-02')),

  // ---------- C10-B31-M3
  Q('C10-B31-M3-Q01', 1, 'Quay một tam giác vuông một vòng quanh một cạnh góc vuông cố định, ta được:', ['hình nón', 'hình trụ', 'hình cầu', 'hình chóp'], e3('E-NON-01')),
  Q('C10-B31-M3-Q02', 1, 'Trong hình nón, đoạn thẳng nối đỉnh với một điểm của đường tròn đáy gọi là:', ['đường sinh', 'chiều cao', 'bán kính đáy', 'trục'], e3('E-NON-01')),
  Q('C10-B31-M3-Q03', 2, 'Hình nón có chiều cao h, bán kính đáy r, đường sinh l. Hệ thức đúng là:', ['l² = h² + r²', 'h² = l² + r²', 'l = h + r', 'l = h'], e3('E-NON-01')),
  Q('C10-B31-M3-Q04', 2, 'Hình nón có chiều cao 4 cm, bán kính đáy 3 cm. Độ dài đường sinh là:', ['5 cm', '7 cm', '√7 cm', '1 cm'], e3('E-NON-01')),
  Q('C10-B31-M3-Q05', 3, 'Quay tam giác ABC vuông tại A (AB = 6 cm, AC = 8 cm) quanh cạnh AB cố định, ta được hình nón có:', ['bán kính đáy 8 cm, chiều cao 6 cm, đường sinh 10 cm', 'bán kính đáy 6 cm, chiều cao 8 cm, đường sinh 10 cm', 'bán kính đáy 8 cm, chiều cao 10 cm, đường sinh 6 cm', 'bán kính đáy 10 cm, chiều cao 6 cm, đường sinh 8 cm'], { B: 'E-TRU-01', C: 'E-NON-01', D: 'E-NON-01' }),
  Q('C10-B31-M3-Q06', 3, 'Hình nón có đường sinh 13 cm, bán kính đáy 5 cm. Chiều cao hình nón là:', ['12 cm', '√194 cm', '8 cm', '18 cm'], e3('E-NON-01')),
  Q('C10-B31-M3-Q07', 4, 'Vật nào sau đây có dạng hình nón?', ['Chiếc nón lá', 'Lon nước', 'Quả bóng', 'Viên gạch'], e3('E-NON-01')),
  Q('C10-B31-M3-Q08', 4, 'Cắt hình nón bởi một mặt phẳng chứa trục, mặt cắt là:', ['tam giác cân', 'hình tròn', 'hình chữ nhật', 'hình thang'], e3('E-NON-01')),

  // ---------- C10-B31-M4
  Q('C10-B31-M4-Q01', 1, 'Diện tích xung quanh của hình nón bán kính đáy r, đường sinh l là:', ['πrl', '2πrl', 'πr²l', '(1/3)πrl'], e3('E-NON-02')),
  Q('C10-B31-M4-Q02', 1, 'Thể tích của hình nón bán kính đáy r, chiều cao h là:', ['(1/3)πr²h', 'πr²h', 'πrh', '(1/3)πrh'], e3('E-NON-02')),
  Q('C10-B31-M4-Q03', 2, 'Hình nón có bán kính đáy 3 cm, đường sinh 5 cm. Diện tích xung quanh là:', ['15π cm²', '30π cm²', '45π cm²', '12π cm²'], { B: 'E-NON-02', C: 'E-NON-02', D: 'E-NON-01' }),
  Q('C10-B31-M4-Q04', 2, 'Hình nón có bán kính đáy 3 cm, chiều cao 4 cm. Thể tích là:', ['12π cm³', '36π cm³', '15π cm³', '4π cm³'], { B: 'E-NON-02', C: 'E-NON-01', D: 'E-NON-02' }),
  Q('C10-B31-M4-Q05', 3, 'Hình nón có bán kính đáy 6 cm, chiều cao 8 cm. Diện tích xung quanh là:', ['60π cm²', '48π cm²', '120π cm²', '96π cm²'], { B: 'E-NON-01', C: 'E-NON-02', D: 'E-NON-02' }),
  Q('C10-B31-M4-Q06', 3, 'Một chiếc nón lá có đường kính vành nón 40 cm, đường sinh 30 cm. Diện tích lá phủ mặt xung quanh của nón là:', ['600π cm²', '1 200π cm²', '300π cm²', '1 200 cm²'], { B: 'E-TRU-01', C: 'E-NON-02', D: 'E-NON-02' }),
  Q('C10-B31-M4-Q07', 4, 'Một hình nón và một hình trụ có cùng bán kính đáy và cùng chiều cao. Tỉ số thể tích của hình nón và hình trụ là:', ['1/3', '1', '1/2', '3'], e3('E-NON-02')),
  Q('C10-B31-M4-Q08', 4, 'Một đống cát hình nón có chu vi đáy 12,56 m, chiều cao 1,5 m (lấy π = 3,14). Thể tích đống cát là:', ['6,28 m³', '18,84 m³', '3,14 m³', '9,42 m³'], e3('E-NON-02')),

  // ---------- C10-B32-M1
  Q('C10-B32-M1-Q01', 1, 'Quay nửa hình tròn một vòng quanh đường kính cố định, ta được:', ['hình cầu', 'hình nón', 'hình trụ', 'hình tròn'], e3('E-CAU-01')),
  Q('C10-B32-M1-Q02', 1, 'Một quả bóng có đường kính 22 cm. Bán kính quả bóng là:', ['11 cm', '22 cm', '44 cm', '5,5 cm'], e3('E-CAU-01')),
  Q('C10-B32-M1-Q03', 2, 'Cắt hình cầu bởi một mặt phẳng đi qua tâm, mặt cắt là:', ['hình tròn có bán kính bằng bán kính hình cầu', 'hình tròn có bán kính nhỏ hơn bán kính hình cầu', 'một đường tròn không có phần bên trong', 'hình vuông'], e3('E-CAU-01')),
  Q('C10-B32-M1-Q04', 2, 'Phát biểu nào phân biệt đúng mặt cầu và hình cầu?', ['Mặt cầu là phần vỏ bên ngoài; hình cầu gồm mặt cầu và phần bên trong', 'Mặt cầu và hình cầu là một', 'Hình cầu chỉ là phần vỏ bên ngoài', 'Mặt cầu là mặt cắt đi qua tâm'], e3('E-CAU-01')),
  Q('C10-B32-M1-Q05', 3, 'Cắt hình cầu bán kính 5 cm bởi một mặt phẳng cách tâm 3 cm, mặt cắt là hình tròn có bán kính:', ['4 cm', '2 cm', '5 cm', '8 cm'], e3('E-CAU-01')),
  Q('C10-B32-M1-Q06', 3, 'Vật nào sau đây có dạng hình cầu?', ['Viên bi', 'Lon nước', 'Nón lá', 'Hộp bút'], e3('E-CAU-01')),
  Q('C10-B32-M1-Q07', 4, 'Một quả địa cầu có chu vi đường xích đạo 94,2 cm (lấy π = 3,14). Bán kính quả địa cầu là:', ['15 cm', '30 cm', '7,5 cm', '47,1 cm'], e3('E-CAU-01')),
  Q('C10-B32-M1-Q08', 4, 'Một hình cầu nằm trong hình lập phương cạnh 10 cm và tiếp xúc với cả 6 mặt. Bán kính hình cầu là:', ['5 cm', '10 cm', '5√2 cm', '5√3 cm'], e3('E-CAU-01')),

  // ---------- C10-B32-M2
  Q('C10-B32-M2-Q01', 1, 'Diện tích mặt cầu bán kính R là:', ['4πR²', 'πR²', '(4/3)πR³', '2πR²'], e3('E-CAU-02')),
  Q('C10-B32-M2-Q02', 1, 'Thể tích hình cầu bán kính R là:', ['(4/3)πR³', '4πR²', 'πR³', '(1/3)πR³'], e3('E-CAU-02')),
  Q('C10-B32-M2-Q03', 2, 'Diện tích mặt cầu bán kính 3 cm là:', ['36π cm²', '9π cm²', '12π cm²', '36π cm³'], e3('E-CAU-02')),
  Q('C10-B32-M2-Q04', 2, 'Thể tích hình cầu bán kính 3 cm là:', ['36π cm³', '108π cm³', '27π cm³', '12π cm³'], e3('E-CAU-02')),
  Q('C10-B32-M2-Q05', 3, 'Một quả bóng có đường kính 20 cm. Diện tích mặt quả bóng là:', ['400π cm²', '1 600π cm²', '100π cm²', '4 000π/3 cm²'], { B: 'E-CAU-01', C: 'E-CAU-02', D: 'E-CAU-02' }),
  Q('C10-B32-M2-Q06', 3, 'Một hình cầu có thể tích 288π cm³. Bán kính hình cầu là:', ['6 cm', '216 cm', '12 cm', '√72 cm'], e3('E-CAU-02')),
  Q('C10-B32-M2-Q07', 4, 'Khi bán kính hình cầu tăng gấp 2 lần thì thể tích hình cầu tăng:', ['8 lần', '2 lần', '4 lần', '6 lần'], e3('E-CAU-02')),
  Q('C10-B32-M2-Q08', 4, 'Một bồn chứa gồm phần hình trụ bán kính 1 m, cao 3 m và hai nửa hình cầu bán kính 1 m gắn ở hai đầu. Thể tích của bồn là:', ['13π/3 m³', '7π m³', '5π m³', '11π/3 m³'], e3('E-CAU-02'))
];

export const HINTS = {
  'E-TRU-01': ['Đề cho đường kính hay bán kính? Khi quay, cạnh nào đứng yên làm trục?', 'Bán kính = đường kính : 2. Quay hình chữ nhật quanh một cạnh: cạnh đó là chiều cao (trục), cạnh kề với nó trở thành bán kính đáy.', 'Ví dụ: quay hình chữ nhật AB = 3, BC = 5 quanh AB được hình trụ cao 3 cm, bán kính đáy 5 cm.'],
  'E-TRU-02': ['Mặt xung quanh trải phẳng ra là hình gì? Chiều dài của nó bằng gì?', 'Trải mặt xung quanh được hình chữ nhật có chiều dài bằng chu vi đáy 2πr: Sxq = 2πrh. Stp = Sxq + 2 đáy = 2πrh + 2πr². V = diện tích đáy × chiều cao = πr²h.', 'Ví dụ: r = 3, h = 5: Sxq = 30π cm², Stp = 48π cm², V = 45π cm³.'],
  'E-NON-01': ['Chiều cao đi từ đỉnh xuống tâm đáy hay xuống vành đáy? Tam giác vuông nào chứa h, r, l?', 'Chiều cao h vuông góc với đáy; đường sinh l nối đỉnh với vành đáy. Ba đoạn h, r, l tạo thành tam giác vuông với cạnh huyền l: l² = h² + r². Diện tích xung quanh dùng l, thể tích dùng h.', 'Ví dụ: h = 4, r = 3 thì l = √(16 + 9) = 5 cm.'],
  'E-NON-02': ['Thể tích hình nón so với hình trụ cùng đáy, cùng chiều cao thì bằng bao nhiêu phần?', 'Sxq nón = πrl. V nón = (1/3)πr²h, bằng một phần ba thể tích hình trụ cùng đáy, cùng chiều cao.', 'Ví dụ: r = 3, h = 4: V = (1/3)·π·9·4 = 12π cm³; r = 3, l = 5: Sxq = 15π cm².'],
  'E-CAU-01': ['Em đang dùng bán kính hay đường kính? Mặt phẳng cắt có đi qua tâm không?', 'R = đường kính : 2. Cắt hình cầu qua tâm được hình tròn lớn bán kính R; cách tâm d thì bán kính mặt cắt r = √(R² − d²). Mặt cầu là vỏ, hình cầu gồm vỏ và phần bên trong.', 'Ví dụ: R = 5, cắt cách tâm 3 cm: r = √(25 − 9) = 4 cm.'],
  'E-CAU-02': ['Diện tích mặt cầu gấp mấy lần diện tích hình tròn lớn? Thể tích có thừa số nào?', 'S mặt cầu = 4πR² (gấp 4 lần hình tròn lớn). V hình cầu = (4/3)πR³. Bán kính tăng k lần thì S tăng k² lần, V tăng k³ lần.', 'Ví dụ: R = 3: S = 36π cm², V = (4/3)·π·27 = 36π cm³.']
};

const V = (dan, quyTac, viDu, tuLam) => ({ dan, quyTac, viDu: viDu.map(([de, giai]) => ({ de, giai })), tuLam: tuLam.map(([de, dapAn, giaiThich]) => ({ de, dapAn, giaiThich })) });
export const VI_BAI_HOC = {
  'VBH-TRU-01': V('Mọi công thức hình khối đều dùng bán kính — nên đọc đúng bán kính là bước đầu tiên.',
    'Bán kính = đường kính : 2. Quay hình chữ nhật quanh cạnh nào thì cạnh đó là chiều cao, cạnh còn lại là bán kính đáy.',
    [['Quay hình chữ nhật 3 × 5 quanh cạnh 3.', 'Cách nghĩ sai: bán kính 3, cao 5. Cách đúng: cạnh 3 là trục nên cao 3, bán kính đáy 5.'],
     ['Lon có đường kính 6 cm.', 'Bán kính 3 cm.']],
    [['Đường kính 10, bán kính?', '5', 'Chia đôi.'],
     ['Ống đường kính ngoài 1 m, dày 0,1 m, bán kính trong?', '0,4 m', '0,5 − 0,1.']]),
  'VBH-TRU-02': V('Bóc vỏ hình trụ ra là một hình chữ nhật: dài bằng chu vi đáy, rộng bằng chiều cao.',
    'Sxq = 2πrh; Stp = 2πrh + 2πr²; V = πr²h.',
    [['r = 3, h = 5, Sxq?', 'Cách nghĩ sai: πrh = 15π. Cách đúng: 2π·3·5 = 30π cm².'],
     ['Cùng hình trụ, Stp?', '30π + 2·9π = 48π cm².']],
    [['r = 3, h = 5, V?', '45π', 'π·9·5.'],
     ['V = 3,14, r = 1, h?', '1 m', 'π·1·h = 3,14.']]),
  'VBH-NON-01': V('Hình nón có hai "chiều dài" dễ nhầm: chiều cao (thẳng đứng) và đường sinh (nghiêng).',
    'h ⊥ đáy, l nối đỉnh với vành đáy; l² = h² + r². Sxq dùng l; V dùng h.',
    [['h = 4, r = 3, tìm l.', 'Cách nghĩ sai: l = 4 + 3 = 7. Cách đúng: l = √(16 + 9) = 5.'],
     ['l = 13, r = 5, tìm h.', 'h = √(169 − 25) = 12.']],
    [['Quay tam giác vuông cạnh 6, 8 quanh cạnh 6: r?', '8', 'Cạnh còn lại.'],
     ['Mặt cắt chứa trục là hình gì?', 'Tam giác cân', 'Hai đường sinh bằng nhau.']]),
  'VBH-NON-02': V('Hình nón "nhỏ" bằng một phần ba hình trụ cùng đáy, cùng chiều cao.',
    'Sxq = πrl; V = (1/3)πr²h.',
    [['r = 3, h = 4, V?', 'Cách nghĩ sai: πr²h = 36π. Cách đúng: (1/3)·36π = 12π cm³.'],
     ['Nón lá: đường kính 40, đường sinh 30.', 'r = 20: Sxq = π·20·30 = 600π cm².']],
    [['r = 3, l = 5, Sxq?', '15π', 'πrl.'],
     ['Tỉ số V nón : V trụ (cùng r, h)?', '1/3', 'Công thức.']]),
  'VBH-CAU-01': V('Hình cầu chỉ có một kích thước: bán kính R. Lấy sai R là sai cả bài.',
    'R = đường kính : 2. Cắt qua tâm: hình tròn bán kính R. Cắt cách tâm d: r = √(R² − d²). Mặt cầu là vỏ; hình cầu gồm vỏ và ruột.',
    [['Bóng đường kính 20 cm, R?', 'Cách nghĩ sai: R = 20. Cách đúng: R = 10 cm.'],
     ['R = 5, cắt cách tâm 3.', 'r = √(25 − 9) = 4 cm.']],
    [['Xích đạo dài 94,2 cm, R?', '15 cm', '94,2 : (2·3,14).'],
     ['Cầu nằm trong lập phương cạnh 10, chạm 6 mặt, R?', '5', 'Nửa cạnh.']]),
  'VBH-CAU-02': V('Hai công thức hình cầu: diện tích có R², thể tích có R³ và phân số 4/3.',
    'S = 4πR²; V = (4/3)πR³. R tăng k lần thì S tăng k², V tăng k³ lần.',
    [['R = 6, V?', 'Cách nghĩ sai: 4π·36 = 144π (dùng công thức diện tích). Cách đúng: (4/3)·π·216 = 288π cm³.'],
     ['Bóng đường kính 20, S?', 'R = 10: S = 400π cm².']],
    [['R = 3, S?', '36π cm²', '4π·9.'],
     ['V = 288π, R?', '6', 'R³ = 216.']])
};

export const ERROR_NODES = LOI.map((e) => ({ id: e.code, name: e.ten, role: e.role, kuId: e.ku, cluster: e.cluster }));
export const CAUSAL_EDGES = [
  { from: 'E-TRU-01', to: 'E-TRU-02', weight: 0.55, reason: 'Lấy sai bán kính nên diện tích, thể tích hình trụ sai' },
  { from: 'E-TRU-01', to: 'E-NON-01', weight: 0.5, reason: 'Nhầm cạnh làm trục nên nhầm bán kính, chiều cao hình nón' },
  { from: 'E-NON-01', to: 'E-NON-02', weight: 0.6, reason: 'Nhầm h với l nên dùng sai công thức hình nón' },
  { from: 'E-TRU-02', to: 'E-NON-02', weight: 0.45, reason: 'Quen công thức hình trụ nên quên thừa số 1/3' },
  { from: 'E-TRU-01', to: 'E-CAU-01', weight: 0.45, reason: 'Thói quen dùng đường kính thay bán kính' },
  { from: 'E-CAU-01', to: 'E-CAU-02', weight: 0.55, reason: 'Lấy sai bán kính nên diện tích, thể tích hình cầu sai' }
];
export const ROOT_ERROR_IDS = ['E-TRU-01'];

const NHAP = 'Bản nháp do trợ lý AI soạn theo từ điển mã lỗi — giáo viên cần duyệt, sửa trước khi dùng';
const A = (id, ten, errorCodes, nhom, hinhThuc, mucNhanThuc, phut, moTa, hocLieu) => ({ id, ten, errorCodes, nhom, hinhThuc, mucNhanThuc, phut, moTa, hocLieu, trangThai: 'nhap', nguon: NHAP });
export const ACTIVITIES = [
  A('HD-TRU-01', 'Bóc vỏ lon nước', ['E-TRU-01', 'E-TRU-02'], ['loi'], 'nhom-dong-chat', 1, [8, 10],
    'Nhóm cắt nhãn giấy quanh một lon hình trụ, trải phẳng thành hình chữ nhật, đo chiều dài và so với 2πr để tự rút ra Sxq = 2πrh; đo đường kính, tính bán kính và thể tích, so với dung tích ghi trên lon.', 'Lon nước, thước dây, kéo'),
  A('HD-NON-01', 'Chiều cao hay đường sinh?', ['E-NON-01', 'E-NON-02'], ['loi'], 'nhom-dong-chat', 2, [8, 10],
    'Nhóm cuộn hình quạt giấy thành hình nón, đo chiều cao bằng que thẳng đứng và đo đường sinh dọc mặt nón, kiểm tra l² = h² + r²; đổ gạo từ hình nón sang hình trụ cùng đáy, cùng cao để thấy tỉ số 1/3.', 'Giấy bìa, gạo, cốc hình trụ'),
  A('HD-CAU-01', 'Quả cam và công thức hình cầu', ['E-CAU-01', 'E-CAU-02'], ['loi'], 'nhom-dong-chat', 2, [8, 10],
    'Nhóm đo chu vi quả cam để tính bán kính, bóc vỏ trải vào 4 hình tròn lớn vẽ sẵn (bán kính bằng bán kính quả cam) để kiểm nghiệm S = 4πR²; tính thể tích quả cam.', 'Quả cam, thước dây, giấy vẽ 4 hình tròn'),
  A('HD-C10-MR', 'Thiết kế bồn chứa nước', [], ['san-sang'], 'nhom-dong-chat', 4, [12, 15],
    'Nhóm thiết kế bồn chứa gồm hình trụ và hai nửa hình cầu có dung tích cho trước, tính kích thước và diện tích tôn cần dùng, so sánh hai phương án.', 'Phiếu đề bài')
];
