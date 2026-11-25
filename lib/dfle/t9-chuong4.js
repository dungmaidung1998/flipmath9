/**
 * NỘI DUNG TOÁN 9 — CHƯƠNG IV. HỆ THỨC LƯỢNG TRONG TAM GIÁC VUÔNG (Kết nối tri thức)
 * BẢN NHÁP do trợ lý AI soạn theo SGK Toán 9 tập một (Bài 11–12) — giáo viên duyệt trước khi dùng.
 * 22/11/2026: sửa 6 cấp độ, thay 2 phương án ngoài chương trình, thêm 48 câu (16 câu/mục) và hình tam giác vuông.
 * Quy ước trong đề: tam giác ABC vuông tại A thì BC là cạnh huyền.
 */
const SEC = { 1: 45, 2: 60, 3: 90, 4: 120 };
const B11 = 'Bài 11. Tỉ số lượng giác của góc nhọn';
const B12 = 'Bài 12. Một số hệ thức giữa cạnh, góc trong tam giác vuông và ứng dụng';
const U = (id, bai, muc, name, order, prerequisite, mucTieu, extra = {}) => ({ id, bai, muc, name, order, prerequisite, mucTieu, ...extra });

export const UNITS = [
  U('C4-B11-M1', B11, 'Mục 1', 'Khái niệm tỉ số lượng giác của góc nhọn', 50, null,
    'Xác định cạnh đối, cạnh kề, cạnh huyền theo một góc nhọn; viết sin, cos, tan, cot của góc nhọn trong tam giác vuông.'),
  U('C4-B11-M2', B11, 'Mục 1 (tiếp)', 'Tỉ số lượng giác của các góc nhọn đặc biệt', 51, 'C4-B11-M1',
    'Nhớ và vận dụng tỉ số lượng giác của các góc 30°, 45°, 60°; tìm góc khi biết tỉ số lượng giác đặc biệt.'),
  U('C4-B11-M3', B11, 'Mục 2', 'Tỉ số lượng giác của hai góc phụ nhau', 52, 'C4-B11-M2',
    'Hai góc phụ nhau thì sin góc này bằng cos góc kia, tan góc này bằng cot góc kia; vận dụng để tính, so sánh.'),
  U('C4-B12-M1', B12, 'Mục 1', 'Hệ thức giữa cạnh góc vuông và cạnh huyền', 53, 'C4-B11-M3',
    'Cạnh góc vuông = cạnh huyền × sin góc đối = cạnh huyền × cos góc kề; tính cạnh trong tam giác vuông và bài toán thực tế.'),
  U('C4-B12-M2', B12, 'Mục 1 (tiếp)', 'Hệ thức giữa hai cạnh góc vuông', 54, 'C4-B12-M1',
    'Cạnh góc vuông = cạnh góc vuông kia × tan góc đối = × cot góc kề; tính chiều cao, khoảng cách trong thực tế.'),
  U('C4-B12-M3', B12, 'Mục 2', 'Giải tam giác vuông và ứng dụng', 55, 'C4-B12-M2',
    'Giải tam giác vuông (tìm mọi cạnh, góc chưa biết) với máy tính cầm tay; ứng dụng đo đạc góc nâng, góc hạ, độ dốc.')
];

const E = (code, ku, role, cluster, ten, tieuDe, phut, misconception, viDu) =>
  ({ code, ku, role, cluster, ten, tieuDe, phut, misconception, viDu, remediation: 'VBH-' + code.slice(2) });
const LOI = [
  E('E-TSLG-01', 'C4-B11-M1', 'root', 'Tỉ số lượng giác', 'Nhầm cạnh đối với cạnh kề', 'Cạnh đối nằm đối diện góc, cạnh kề là cạnh góc vuông sát góc', 5,
    'Xác định cạnh đối, cạnh kề sai (lấy theo góc vuông hoặc theo góc kia) nên viết sin, cos, tan sai', 'Tam giác ABC vuông tại A: sin B = AB/BC'),
  E('E-TSLG-02', 'C4-B11-M1', 'mediating', 'Tỉ số lượng giác', 'Nhớ sai định nghĩa tỉ số lượng giác', 'sin = đối/huyền, cos = kề/huyền, tan = đối/kề, cot = kề/đối', 5,
    'Nhớ đảo định nghĩa (sin = kề/huyền, tan = kề/đối), lấy huyền ở tử, hoặc cho rằng sin, cos có thể lớn hơn 1', 'sin α = huyền/đối; tan B = AB/AC'),
  E('E-TSLG-03', 'C4-B11-M2', 'leaf', 'Tỉ số lượng giác', 'Nhầm giá trị lượng giác góc đặc biệt', 'sin 30° = cos 60° = 1/2; tan 45° = 1', 5,
    'Nhớ nhầm giá trị sin, cos, tan của 30°, 45°, 60° (đổi chỗ 1/2 và √3/2, √3 và √3/3)', 'sin 30° = √3/2; tan 60° = √3/3'),
  E('E-TSLG-04', 'C4-B11-M3', 'mediating', 'Tỉ số lượng giác', 'Sai quan hệ hai góc phụ nhau', 'sin α = cos(90° − α), tan α = cot(90° − α)', 5,
    'Nhầm góc phụ với góc bù, hoặc cho rằng sin α = sin(90° − α)', 'sin 50° = sin 40°; hai góc phụ nhau có tổng 180°'),
  E('E-HTL-01', 'C4-B12-M1', 'mediating', 'Hệ thức lượng', 'Dùng nhầm sin với cos khi tính cạnh', 'Cạnh góc vuông = huyền × sin góc đối = huyền × cos góc kề', 6,
    'Tính cạnh góc vuông bằng cạnh huyền nhân sai tỉ số (sin thay cos), hoặc chia thay vì nhân', 'BC = 12, góc B = 60°: AB = 12·sin 60°'),
  E('E-HTL-02', 'C4-B12-M2', 'leaf', 'Hệ thức lượng', 'Dùng nhầm tan với cot', 'Cạnh góc vuông = cạnh kia × tan góc đối = × cot góc kề', 6,
    'Tính cạnh góc vuông từ cạnh góc vuông kia mà dùng tan của góc kề (hoặc chia cho tan) sai', 'AB = 3, góc B = 60°: AC = 3·tan 30°'),
  E('E-HTL-03', 'C4-B12-M3', 'leaf', 'Hệ thức lượng', 'Sai khi tính bằng máy tính và trong bài toán thực tế', 'Máy ở chế độ độ; xác định đúng góc nâng, góc hạ', 6,
    'Bấm máy ở chế độ radian, làm tròn sai, hoặc xác định sai góc nâng, góc hạ trong bài toán thực tế', 'Góc hạ 25° từ toà nhà cao 30 m: khoảng cách = 30·tan 25°'),
  E('E-HTL-04', 'C4-B12-M3', 'root', 'Hệ thức lượng', 'Quên quan hệ hai góc nhọn của tam giác vuông', 'Hai góc nhọn của tam giác vuông có tổng 90°', 4,
    'Tính góc còn lại theo tổng 180° bỏ qua góc vuông, hoặc giải tam giác vuông còn thiếu yếu tố', 'Góc B = 35° thì góc C = 145°')
];
export const ERRORS = LOI.map(({ code, ku, misconception, viDu, remediation }) => ({ code, ku, misconception, viDu, remediation }));
export const REMEDIATION = Object.fromEntries(LOI.map((e) => [e.remediation, { ku: e.ku, title: e.tieuDe, minutes: e.phut }]));

const Q = (id, level, stem, [A, B, C, D], err, hinh) =>
  ({ id, ku: id.replace(/-Q\d+$/, ''), level, sec: SEC[level], stem, opts: { A, B, C, D }, correct: 'A', err, ...(hinh ? { hinh } : {}) });
const e3 = (c) => ({ B: c, C: c, D: c });
const ABC = 'Tam giác ABC vuông tại A';

const CAU_GOC = [
  // ---------- C4-B11-M1
  Q('C4-B11-M1-Q01', 1, `${ABC}. Cạnh đối của góc B là:`, ['AC', 'AB', 'BC', 'AB và BC'], e3('E-TSLG-01')),
  Q('C4-B11-M1-Q02', 1, `${ABC}. sin B bằng:`, ['AC/BC', 'AB/BC', 'AC/AB', 'BC/AC'], { B: 'E-TSLG-01', C: 'E-TSLG-02', D: 'E-TSLG-02' }),
  Q('C4-B11-M1-Q03', 2, `${ABC} có AB = 3, AC = 4, BC = 5. tan B bằng:`, ['4/3', '3/4', '4/5', '3/5'], { B: 'E-TSLG-01', C: 'E-TSLG-02', D: 'E-TSLG-02' }),
  Q('C4-B11-M1-Q04', 2, `${ABC} có AB = 3, AC = 4, BC = 5. cos C bằng:`, ['4/5', '3/5', '3/4', '4/3'], { B: 'E-TSLG-01', C: 'E-TSLG-02', D: 'E-TSLG-02' }),
  Q('C4-B11-M1-Q05', 3, 'Cho góc nhọn α có sin α = 3/5. Khi đó cos α bằng:', ['4/5', '2/5', '5/3', '3/4'], e3('E-TSLG-02')),
  Q('C4-B11-M1-Q06', 3, 'Tam giác MNP vuông tại M có MN = 6, NP = 10. sin P bằng:', ['3/5', '4/5', '3/4', '5/3'], { B: 'E-TSLG-01', C: 'E-TSLG-02', D: 'E-TSLG-02' }),
  Q('C4-B11-M1-Q07', 2, 'Với mọi góc nhọn α, khẳng định nào đúng?', ['0 < sin α < 1', 'sin α > 1', 'tan α < 1', 'cos α < 0'], e3('E-TSLG-02')),
  Q('C4-B11-M1-Q08', 4, 'Một chiếc thang dài 4 m dựa vào tường, chân thang cách chân tường 1,5 m. Gọi α là góc giữa thang và mặt đất. cos α bằng:', ['3/8', '8/3', '1,5', '√(4² − 1,5²)/4'], { B: 'E-TSLG-02', C: 'E-TSLG-02', D: 'E-TSLG-01' }),

  // ---------- C4-B11-M2
  Q('C4-B11-M2-Q01', 1, 'sin 30° bằng:', ['1/2', '√3/2', '√2/2', '√3'], e3('E-TSLG-03')),
  Q('C4-B11-M2-Q02', 1, 'tan 45° bằng:', ['1', '√2/2', '√3', '0'], e3('E-TSLG-03')),
  Q('C4-B11-M2-Q03', 2, 'cos 60° bằng:', ['1/2', '√3/2', '√3/3', '2'], e3('E-TSLG-03')),
  Q('C4-B11-M2-Q04', 2, 'tan 60° bằng:', ['√3', '√3/3', '1/2', '√3/2'], e3('E-TSLG-03')),
  Q('C4-B11-M2-Q05', 2, 'Giá trị của sin 30° + cos 60° là:', ['1', '√3', '(1 + √3)/2', '1/2'], e3('E-TSLG-03')),
  Q('C4-B11-M2-Q06', 3, 'Giá trị của tan 45° · cot 45° + sin² 45° là:', ['3/2', '2', '1', '1 + √2/2'], e3('E-TSLG-03')),
  Q('C4-B11-M2-Q07', 2, `${ABC} có góc B = 30°, BC = 10 cm. Độ dài AC là:`, ['5 cm', '5√3 cm', '10√3 cm', '20 cm'], { B: 'E-TSLG-03', C: 'E-TSLG-03', D: 'E-TSLG-02' }),
  Q('C4-B11-M2-Q08', 2, 'Góc nhọn α có tan α = √3/3. Số đo của α là:', ['30°', '60°', '45°', '90°'], e3('E-TSLG-03')),

  // ---------- C4-B11-M3
  Q('C4-B11-M3-Q01', 1, 'sin 50° bằng:', ['cos 40°', 'sin 40°', 'cos 50°', 'tan 40°'], e3('E-TSLG-04')),
  Q('C4-B11-M3-Q02', 1, 'Hai góc α và β phụ nhau khi:', ['α + β = 90°', 'α + β = 180°', 'α = β', 'α − β = 90°'], e3('E-TSLG-04')),
  Q('C4-B11-M3-Q03', 2, 'tan 35° bằng:', ['cot 55°', 'tan 55°', 'cot 35°', 'cos 55°'], e3('E-TSLG-04')),
  Q('C4-B11-M3-Q04', 2, 'Giá trị của sin 25° − cos 65° là:', ['0', '1', 'sin 40°', '−1'], e3('E-TSLG-04')),
  Q('C4-B11-M3-Q05', 3, 'Giá trị của tan 20° · tan 70° là:', ['1', '0', '2', 'tan 50°'], e3('E-TSLG-04')),
  Q('C4-B11-M3-Q06', 3, `${ABC}. Khẳng định nào đúng?`, ['sin B = cos C', 'sin B = sin C', 'tan B = tan C', 'cos B = cos C'], e3('E-TSLG-04')),
  Q('C4-B11-M3-Q07', 4, 'Sắp xếp theo thứ tự tăng dần: sin 40°, cos 30°, sin 70°.', ['sin 40°; cos 30°; sin 70°', 'cos 30°; sin 40°; sin 70°', 'sin 70°; cos 30°; sin 40°', 'sin 40°; sin 70°; cos 30°'], e3('E-TSLG-04')),
  Q('C4-B11-M3-Q08', 4, 'Giá trị của sin² 20° + sin² 70° là:', ['1', '0', '2', '1/2'], e3('E-TSLG-04')),

  // ---------- C4-B12-M1
  Q('C4-B12-M1-Q01', 1, `${ABC}, BC = a, AC = b. Hệ thức đúng là:`, ['b = a · sin B', 'b = a · cos B', 'b = a · sin C', 'b = sin B : a'], e3('E-HTL-01')),
  Q('C4-B12-M1-Q02', 1, `${ABC}, BC = a, AB = c. Hệ thức đúng là:`, ['c = a · cos B', 'c = a · sin B', 'c = a · cos C', 'c = a · tan B'], { B: 'E-HTL-01', C: 'E-HTL-01', D: 'E-HTL-02' }),
  Q('C4-B12-M1-Q03', 2, `${ABC} có BC = 12 cm, góc B = 60°. Độ dài AB là:`, ['6 cm', '6√3 cm', '12√3 cm', '24 cm'], e3('E-HTL-01')),
  Q('C4-B12-M1-Q04', 2, `${ABC} có BC = 20 cm, góc C = 30°. Độ dài AB là:`, ['10 cm', '10√3 cm', '20√3 cm', '40 cm'], e3('E-HTL-01')),
  Q('C4-B12-M1-Q05', 3, `${ABC} có AC = 6 cm, góc B = 30°. Độ dài BC là:`, ['12 cm', '3 cm', '6√3 cm', '4√3 cm'], e3('E-HTL-01')),
  Q('C4-B12-M1-Q06', 3, 'Một chiếc thang dài 5 m dựa vào tường, tạo với mặt đất góc 65°. Chân thang cách tường khoảng (làm tròn đến hàng phần mười):', ['2,1 m', '4,5 m', '10,7 m', '11,8 m'], { B: 'E-HTL-01', C: 'E-HTL-02', D: 'E-HTL-01' }),
  Q('C4-B12-M1-Q07', 3, `${ABC} có BC = 10 cm, sin B = 0,6. Độ dài AB là:`, ['8 cm', '6 cm', '16,7 cm', '4 cm'], e3('E-HTL-01')),
  Q('C4-B12-M1-Q08', 4, 'Một con diều bay với dây dài 80 m, dây tạo với phương nằm ngang góc 40°. Diều cao hơn tay người cầm dây khoảng (làm tròn đến mét):', ['51 m', '61 m', '67 m', '124 m'], { B: 'E-HTL-01', C: 'E-HTL-02', D: 'E-HTL-01' }),

  // ---------- C4-B12-M2
  Q('C4-B12-M2-Q01', 1, `${ABC}, AC = b, AB = c. Hệ thức đúng là:`, ['b = c · tan B', 'b = c · tan C', 'b = c · cot B', 'b = c · sin B'], { B: 'E-HTL-02', C: 'E-HTL-02', D: 'E-HTL-01' }),
  Q('C4-B12-M2-Q02', 1, `${ABC}, AC = b, AB = c. Hệ thức đúng là:`, ['c = b · tan C', 'c = b · tan B', 'c = b · cot C', 'c = b · cos C'], { B: 'E-HTL-02', C: 'E-HTL-02', D: 'E-HTL-01' }),
  Q('C4-B12-M2-Q03', 2, `${ABC} có AB = 5 cm, góc B = 45°. Độ dài AC là:`, ['5 cm', '5√2 cm', '5√2/2 cm', '10 cm'], e3('E-HTL-02')),
  Q('C4-B12-M2-Q04', 2, `${ABC} có AB = 3 cm, góc B = 60°. Độ dài AC là:`, ['3√3 cm', '√3 cm', '6 cm', '1,5 cm'], { B: 'E-HTL-02', C: 'E-HTL-01', D: 'E-HTL-01' }),
  Q('C4-B12-M2-Q05', 3, `${ABC} có AC = 9 cm, góc C = 30°. Độ dài AB là:`, ['3√3 cm', '9√3 cm', '4,5 cm', '18 cm'], { B: 'E-HTL-02', C: 'E-HTL-01', D: 'E-HTL-01' }),
  Q('C4-B12-M2-Q06', 3, 'Một cột cờ có bóng trên mặt đất dài 12 m, tia nắng tạo với mặt đất góc 35°. Chiều cao cột cờ khoảng (làm tròn đến hàng phần mười):', ['8,4 m', '17,1 m', '6,9 m', '9,8 m'], { B: 'E-HTL-02', C: 'E-HTL-01', D: 'E-HTL-01' }),
  Q('C4-B12-M2-Q07', 4, 'Từ nóc một toà nhà cao 30 m, một người nhìn xuống một ô tô đỗ trên mặt đất với góc hạ 25°. Ô tô cách chân toà nhà khoảng (làm tròn đến mét):', ['64 m', '14 m', '71 m', '33 m'], e3('E-HTL-03')),
  Q('C4-B12-M2-Q08', 3, `${ABC} có AB = 4 cm, AC = 4√3 cm. Số đo góc B là:`, ['60°', '30°', '45°', '90°'], { B: 'E-HTL-02', C: 'E-HTL-02', D: 'E-HTL-04' }),

  // ---------- C4-B12-M3
  Q('C4-B12-M3-Q01', 1, 'Giải tam giác vuông là:', ['Tìm tất cả các cạnh và góc chưa biết của tam giác vuông', 'Chỉ tìm cạnh huyền', 'Chỉ tìm các góc nhọn', 'Tính diện tích tam giác vuông'], e3('E-HTL-04')),
  Q('C4-B12-M3-Q02', 1, `${ABC} có góc B = 35°. Số đo góc C là:`, ['55°', '145°', '35°', '65°'], e3('E-HTL-04')),
  Q('C4-B12-M3-Q03', 2, `${ABC} có AB = 6 cm, BC = 10 cm. Khẳng định đúng là:`, ['AC = 8 cm, góc B ≈ 53°', 'AC = 8 cm, góc B ≈ 37°', 'AC = 4 cm, góc B ≈ 53°', 'AC = √136 cm, góc B ≈ 53°'], e3('E-HTL-03')),
  Q('C4-B12-M3-Q04', 2, 'Để tìm góc nhọn α biết sin α = 0,5 bằng máy tính cầm tay, ta làm:', ['Để máy ở chế độ độ (D) rồi bấm SHIFT sin 0,5', 'Bấm sin 0,5', 'Để máy ở chế độ radian (R) rồi bấm SHIFT sin 0,5', 'Bấm 1 : sin 0,5'], e3('E-HTL-03')),
  Q('C4-B12-M3-Q05', 3, `${ABC} có BC = 15 cm, góc B = 40°. Độ dài AC (làm tròn đến hàng phần mười) là:`, ['9,6 cm', '11,5 cm', '12,6 cm', '23,3 cm'], { B: 'E-HTL-01', C: 'E-HTL-02', D: 'E-HTL-01' }),
  Q('C4-B12-M3-Q06', 3, `${ABC} có AB = AC = 5 cm. Khẳng định đúng là:`, ['Góc B = góc C = 45°, BC = 5√2 cm', 'Góc B = góc C = 60°, BC = 5 cm', 'Góc B = góc C = 45°, BC = 10 cm', 'Góc B = 90°, BC = 5√2 cm'], { B: 'E-HTL-04', C: 'E-HTL-03', D: 'E-HTL-04' }),
  Q('C4-B12-M3-Q07', 4, 'Một máy bay cất cánh theo đường thẳng tạo với mặt đất góc 20°. Sau khi bay được 5 km theo đường đó, máy bay ở độ cao khoảng (làm tròn đến hàng phần trăm):', ['1,71 km', '4,70 km', '1,82 km', '14,62 km'], { B: 'E-HTL-01', C: 'E-HTL-02', D: 'E-HTL-03' }),
  Q('C4-B12-M3-Q08', 4, 'Một con dốc dài 120 m, đỉnh dốc cao hơn chân dốc 15 m. Góc giữa mặt dốc và phương nằm ngang khoảng (làm tròn đến độ):', ['7°', '83°', '0,13°', '14°'], { B: 'E-HTL-04', C: 'E-HTL-03', D: 'E-HTL-03' })
];

// ---------------------------------------------------------------------------
// BỔ SUNG 22/11/2026 (đề xuất sửa Chương IV §1.2): mỗi mục 8 → 16 câu, phân bố 4 🌱 · 5 🌿 · 4 🌳 · 3 ⭐.
// Cấp ⭐ theo dạng câu 4a đề thi vào 10 Đà Nẵng (bài toán thực tế 2–3 bước, có làm tròn).
// Đáp án đã tính lại bằng máy. Vẫn là BẢN NHÁP chờ giáo viên duyệt.
// ---------------------------------------------------------------------------
const CAU_MOI = [
  // ---------- C4-B11-M1 Khái niệm tỉ số lượng giác
  Q('C4-B11-M1-Q09', 1, `${ABC}. Cạnh kề của góc C là:`, ['AC', 'AB', 'BC', 'AB và AC'], e3('E-TSLG-01')),
  Q('C4-B11-M1-Q10', 1, `${ABC}. cos B bằng:`, ['AB/BC', 'AC/BC', 'AB/AC', 'BC/AB'], { B: 'E-TSLG-01', C: 'E-TSLG-02', D: 'E-TSLG-02' }),
  Q('C4-B11-M1-Q11', 2, `${ABC} có AB = 6, AC = 8, BC = 10. sin C bằng:`, ['3/5', '4/5', '3/4', '4/3'], { B: 'E-TSLG-01', C: 'E-TSLG-02', D: 'E-TSLG-02' }),
  Q('C4-B11-M1-Q12', 2, `${ABC} có AB = 6, AC = 8, BC = 10. cot B bằng:`, ['3/4', '4/3', '3/5', '4/5'], e3('E-TSLG-02')),
  Q('C4-B11-M1-Q13', 3, `${ABC} có AB = 5, BC = 13. tan B bằng:`, ['12/5', '5/12', '12/13', '5/13'], { B: 'E-TSLG-01', C: 'E-TSLG-02', D: 'E-TSLG-02' }),
  Q('C4-B11-M1-Q14', 3, 'Cho góc nhọn α có cos α = 0,6. Khi đó tan α bằng:', ['4/3', '3/4', '0,8', '5/3'], e3('E-TSLG-02')),
  Q('C4-B11-M1-Q15', 4, `${ABC} có AB = 5 cm, BC = 13 cm. Giá trị của tan C + cot B là:`, ['5/6', '24/5', '169/60', '5/12'], { B: 'E-TSLG-01', C: 'E-TSLG-01', D: 'E-TSLG-02' }),
  Q('C4-B11-M1-Q16', 4, 'Một con dốc có mặt dốc dài 50 m, đỉnh dốc cao hơn chân dốc 14 m. Gọi α là góc giữa mặt dốc và phương nằm ngang. tan α bằng:', ['7/24', '7/25', '24/7', '24/25'], { B: 'E-TSLG-02', C: 'E-TSLG-01', D: 'E-TSLG-02' }),
  // ---------- C4-B11-M2 Góc đặc biệt
  Q('C4-B11-M2-Q09', 1, 'cos 30° bằng:', ['√3/2', '1/2', '√2/2', '√3/3'], e3('E-TSLG-03')),
  Q('C4-B11-M2-Q10', 1, 'cot 60° bằng:', ['√3/3', '√3', '1', '1/2'], e3('E-TSLG-03')),
  Q('C4-B11-M2-Q11', 3, 'Giá trị của 2 sin 30° + tan 60° · cot 60° là:', ['2', '1 + √3', '1', '3/2'], e3('E-TSLG-03')),
  Q('C4-B11-M2-Q12', 3, 'Tam giác đều cạnh 6 cm có đường cao bằng:', ['3√3 cm', '3 cm', '6√3 cm', '2√3 cm'], { B: 'E-TSLG-03', C: 'E-TSLG-02', D: 'E-TSLG-03' }),
  Q('C4-B11-M2-Q13', 3, `${ABC} có AB = 8 cm, góc C = 30°. Độ dài BC là:`, ['16 cm', '4 cm', '8√3 cm', '16√3/3 cm'], { B: 'E-TSLG-02', C: 'E-TSLG-02', D: 'E-TSLG-03' }),
  Q('C4-B11-M2-Q14', 4, 'Một hình thoi có cạnh 10 cm và một góc bằng 60°. Diện tích hình thoi (làm tròn đến hàng phần mười) là:', ['86,6 cm²', '50,0 cm²', '173,2 cm²', '43,3 cm²'], { B: 'E-TSLG-03', C: 'E-TSLG-02', D: 'E-TSLG-02' }),
  Q('C4-B11-M2-Q15', 4, 'Một chiếc thang dài 6 m dựa vào tường, tạo với mặt đất góc 60°. Đầu thang chạm tường ở độ cao khoảng (làm tròn đến hàng phần mười):', ['5,2 m', '3,0 m', '10,4 m', '3,5 m'], { B: 'E-TSLG-03', C: 'E-TSLG-02', D: 'E-TSLG-03' }),
  Q('C4-B11-M2-Q16', 4, 'Góc nhọn α thoả mãn sin α = cos α. Giá trị của tan α + cot α là:', ['2', '1', '√2', '2√2'], e3('E-TSLG-03')),
  // ---------- C4-B11-M3 Hai góc phụ nhau
  Q('C4-B11-M3-Q09', 1, 'cos 20° bằng:', ['sin 70°', 'cos 70°', 'sin 20°', 'tan 70°'], e3('E-TSLG-04')),
  Q('C4-B11-M3-Q10', 1, 'Góc phụ với góc 35° là góc:', ['55°', '145°', '35°', '65°'], e3('E-TSLG-04')),
  Q('C4-B11-M3-Q11', 2, 'cot 72° bằng:', ['tan 18°', 'cot 18°', 'tan 72°', 'cos 18°'], e3('E-TSLG-04')),
  Q('C4-B11-M3-Q12', 2, 'Giá trị của cos 37° − sin 53° là:', ['0', '1', 'cos 16°', '−1'], e3('E-TSLG-04')),
  Q('C4-B11-M3-Q13', 2, `${ABC}. Khẳng định nào đúng?`, ['tan B = cot C', 'tan B = tan C', 'sin B = sin C', 'cot B = tan B'], e3('E-TSLG-04')),
  Q('C4-B11-M3-Q14', 3, 'Giá trị của sin 15° − cos 75° + tan 40° · tan 50° là:', ['1', '0', '2', '−1'], e3('E-TSLG-04')),
  Q('C4-B11-M3-Q15', 3, 'Sắp xếp theo thứ tự giảm dần: cos 20°, sin 50°, cos 80°.', ['cos 20°; sin 50°; cos 80°', 'cos 80°; sin 50°; cos 20°', 'sin 50°; cos 20°; cos 80°', 'cos 20°; cos 80°; sin 50°'], e3('E-TSLG-04')),
  Q('C4-B11-M3-Q16', 4, 'Giá trị của A = sin²10° + sin²20° + sin²70° + sin²80° là:', ['2', '1', '4', '0'], e3('E-TSLG-04')),
  // ---------- C4-B12-M1 Cạnh góc vuông và cạnh huyền
  Q('C4-B12-M1-Q09', 1, `${ABC}, BC = a, AC = b. Hệ thức đúng là:`, ['b = a · cos C', 'b = a · sin C', 'b = a · cos B', 'b = a · tan C'], { B: 'E-HTL-01', C: 'E-HTL-01', D: 'E-HTL-02' }),
  Q('C4-B12-M1-Q10', 1, `${ABC}, BC = a, AB = c. Hệ thức đúng là:`, ['c = a · sin C', 'c = a · cos C', 'c = a · sin B', 'c = a · cot C'], { B: 'E-HTL-01', C: 'E-HTL-01', D: 'E-HTL-02' }),
  Q('C4-B12-M1-Q11', 2, `${ABC} có BC = 8 cm, góc B = 30°. Độ dài AC là:`, ['4 cm', '4√3 cm', '16 cm', '8√3/3 cm'], { B: 'E-HTL-01', C: 'E-HTL-01', D: 'E-HTL-02' }),
  Q('C4-B12-M1-Q12', 2, `${ABC} có BC = 6 cm, góc C = 45°. Độ dài AC là:`, ['3√2 cm', '6√2 cm', '3 cm', '6 cm'], { B: 'E-HTL-01', C: 'E-TSLG-03', D: 'E-HTL-02' }),
  Q('C4-B12-M1-Q13', 2, `${ABC} có BC = 20 cm, góc B = 40°. Độ dài AB (làm tròn đến hàng phần mười) là:`, ['15,3 cm', '12,9 cm', '26,1 cm', '16,8 cm'], { B: 'E-HTL-01', C: 'E-HTL-01', D: 'E-HTL-02' }),
  Q('C4-B12-M1-Q14', 3, `${ABC} có AB = 9 cm, góc C = 60°. Độ dài BC là:`, ['6√3 cm', '9√3/2 cm', '18 cm', '3√3 cm'], { B: 'E-HTL-01', C: 'E-HTL-01', D: 'E-HTL-02' }),
  Q('C4-B12-M1-Q15', 4, 'Một chiếc thang dài 6 m. Thang an toàn khi góc giữa thang và mặt đất từ 60° đến 70°. Đặt chân thang cách tường 2,5 m thì góc đó khoảng bao nhiêu và có an toàn không?', ['Khoảng 65°, an toàn', 'Khoảng 25°, không an toàn', 'Khoảng 23°, không an toàn', 'Khoảng 65°, không an toàn'], { B: 'E-HTL-01', C: 'E-HTL-02', D: 'E-HTL-03' }),
  Q('C4-B12-M1-Q16', 4, 'Một con diều bay với dây dài 60 m, dây tạo với phương nằm ngang góc 50°. Tay người cầm dây cách mặt đất 1,5 m. Diều cách mặt đất khoảng (làm tròn đến hàng phần mười):', ['47,5 m', '46,0 m', '40,1 m', '73,0 m'], { B: 'E-HTL-03', C: 'E-HTL-01', D: 'E-HTL-02' }),
  // ---------- C4-B12-M2 Hai cạnh góc vuông
  Q('C4-B12-M2-Q09', 1, `${ABC}, AC = b, AB = c. Hệ thức đúng là:`, ['b = c · cot C', 'b = c · tan C', 'b = c · cot B', 'b = c · cos C'], { B: 'E-HTL-02', C: 'E-HTL-02', D: 'E-HTL-01' }),
  Q('C4-B12-M2-Q10', 1, `${ABC}, AC = b, AB = c. Hệ thức đúng là:`, ['c = b · cot B', 'c = b · tan B', 'c = b · cot C', 'c = b · sin B'], { B: 'E-HTL-02', C: 'E-HTL-02', D: 'E-HTL-01' }),
  Q('C4-B12-M2-Q11', 2, `${ABC} có AC = 4 cm, góc C = 60°. Độ dài AB là:`, ['4√3 cm', '4√3/3 cm', '2 cm', '8 cm'], { B: 'E-HTL-02', C: 'E-HTL-01', D: 'E-HTL-01' }),
  Q('C4-B12-M2-Q12', 2, `${ABC} có AC = 10 cm, góc B = 30°. Độ dài AB là:`, ['10√3 cm', '10√3/3 cm', '5 cm', '20 cm'], { B: 'E-HTL-02', C: 'E-HTL-01', D: 'E-HTL-01' }),
  Q('C4-B12-M2-Q13', 2, `${ABC} có AB = 15 cm, góc B = 28°. Độ dài AC (làm tròn đến hàng phần mười) là:`, ['8,0 cm', '28,2 cm', '7,0 cm', '13,2 cm'], { B: 'E-HTL-02', C: 'E-HTL-01', D: 'E-HTL-01' }),
  Q('C4-B12-M2-Q14', 3, 'Một cột đèn cao 7 m có bóng trên mặt đất dài 4 m. Góc tạo bởi tia nắng và mặt đất khoảng (làm tròn đến độ):', ['60°', '30°', '1°', '35°'], { B: 'E-HTL-02', C: 'E-HTL-03', D: 'E-HTL-01' }),
  Q('C4-B12-M2-Q15', 4, 'Hai bạn đứng cách nhau 20 m, thẳng hàng và cùng phía với chân một tháp. Bạn đứng gần nhìn đỉnh tháp với góc nâng 45°, bạn đứng xa nhìn với góc nâng 30°. Bỏ qua chiều cao của người, chiều cao tháp khoảng (làm tròn đến hàng phần mười):', ['27,3 m', '8,5 m', '11,5 m', '47,3 m'], { B: 'E-HTL-02', C: 'E-HTL-03', D: 'E-HTL-02' }),
  Q('C4-B12-M2-Q16', 4, 'Từ vị trí A cao 35 m trên một toà nhà, người ta nhìn thấy ô tô ở vị trí C dưới góc hạ 60° (góc giữa tia AC và phương nằm ngang). Khoảng cách từ ô tô đến chân toà nhà B (làm tròn đến hàng phần mười) là (Đề thi vào 10 Đà Nẵng 2026, câu 4a):', ['20,2 m', '60,6 m', '17,5 m', '40,4 m'], { B: 'E-HTL-03', C: 'E-HTL-01', D: 'E-HTL-01' }),
  // ---------- C4-B12-M3 Giải tam giác vuông
  Q('C4-B12-M3-Q09', 1, `${ABC} có góc C = 62°. Số đo góc B là:`, ['28°', '118°', '62°', '38°'], e3('E-HTL-04')),
  Q('C4-B12-M3-Q10', 1, 'Để giải được một tam giác vuông, ngoài góc vuông ta cần biết ít nhất:', ['Hai yếu tố, trong đó có ít nhất một cạnh', 'Hai góc nhọn', 'Một cạnh', 'Một góc nhọn'], e3('E-HTL-04')),
  Q('C4-B12-M3-Q11', 2, `${ABC} có AB = 5 cm, AC = 12 cm. Độ dài BC và số đo góc B (làm tròn đến độ) là:`, ['BC = 13 cm, góc B ≈ 67°', 'BC = 13 cm, góc B ≈ 23°', 'BC = 17 cm, góc B ≈ 67°', 'BC = √119 cm, góc B ≈ 67°'], { B: 'E-HTL-02', C: 'E-HTL-03', D: 'E-HTL-03' }),
  Q('C4-B12-M3-Q12', 2, 'Máy tính cầm tay đang ở chế độ độ (D). Để tìm góc nhọn α biết tan α = 1,2, ta bấm:', ['SHIFT tan 1,2', 'tan 1,2', 'SHIFT sin 1,2', '1 : tan 1,2'], e3('E-HTL-03')),
  Q('C4-B12-M3-Q13', 2, `${ABC} có BC = 10 cm, góc B = 50°. Số đo góc C và độ dài AB (làm tròn đến hàng phần mười) là:`, ['Góc C = 40°, AB ≈ 6,4 cm', 'Góc C = 40°, AB ≈ 7,7 cm', 'Góc C = 130°, AB ≈ 6,4 cm', 'Góc C = 50°, AB ≈ 6,4 cm'], { B: 'E-HTL-01', C: 'E-HTL-04', D: 'E-HTL-04' }),
  Q('C4-B12-M3-Q14', 3, `${ABC} có AC = 6 cm, góc B = 35°. Độ dài BC (làm tròn đến hàng phần mười) là:`, ['10,5 cm', '7,3 cm', '3,4 cm', '8,6 cm'], { B: 'E-HTL-01', C: 'E-HTL-01', D: 'E-HTL-02' }),
  Q('C4-B12-M3-Q15', 3, 'Một đoạn đường dốc dài 200 m, góc giữa mặt đường và phương nằm ngang là 9°. Đi hết đoạn dốc thì lên cao thêm khoảng (làm tròn đến hàng phần mười):', ['31,3 m', '31,7 m', '197,5 m', '82,4 m'], { B: 'E-HTL-02', C: 'E-HTL-01', D: 'E-HTL-03' }),
  Q('C4-B12-M3-Q16', 4, 'Giải tam giác ABC vuông tại A biết AB = 7 cm, góc C = 42° (độ dài làm tròn đến hàng phần mười). Kết quả đúng là:', ['Góc B = 48°, AC ≈ 7,8 cm, BC ≈ 10,5 cm', 'Góc B = 48°, AC ≈ 6,3 cm, BC ≈ 10,5 cm', 'Góc B = 138°, AC ≈ 7,8 cm, BC ≈ 10,5 cm', 'Góc B = 48°, AC ≈ 7,8 cm, BC ≈ 9,4 cm'], { B: 'E-HTL-02', C: 'E-HTL-04', D: 'E-HTL-01' })
];

// ---------------------------------------------------------------------------
// HÌNH VẼ TAM GIÁC VUÔNG cho câu có số liệu (cột `hinh`, loai 'tam-giac-vuong', vẽ SVG ở components/QuestionFigure.tsx).
// Quy ước: đỉnh góc vuông ở dưới trái; cạnh "tren" đứng, "ngang" nằm, "huyen" là cạnh huyền; góc "tren" ở đỉnh trên,
// góc "phai" ở đỉnh bên phải; '?' = cạnh/góc cần tìm. Hình chỉ minh hoạ, không đúng tỉ lệ.
// Câu kiểm tra chính việc xác định góc hạ/góc nâng thì KHÔNG kèm hình (để không lộ cách làm).
// ---------------------------------------------------------------------------
const TG = (dinh, canh = {}, goc = {}, moTaRieng, nhanCanh, tyLe) => {
  const [V, T, P] = dinh;
  const ten = { tren: T + V, ngang: V + P, huyen: T + P };
  const ds = ['tren', 'ngang', 'huyen'].filter((k) => canh[k]).map((k) => (canh[k] === '?' ? `${ten[k]} cần tìm` : `${ten[k]} = ${canh[k]}`));
  if (goc.tren) ds.push(goc.tren === '?' ? `góc ${T} cần tìm` : `góc ${T} = ${goc.tren}`);
  if (goc.phai) ds.push(goc.phai === '?' ? `góc ${P} cần tìm` : `góc ${P} = ${goc.phai}`);
  const moTa = moTaRieng ?? `Tam giác ${V}${T}${P} vuông tại ${V}${ds.length ? '; ' + ds.join(', ') : ''}.`;
  return { loai: 'tam-giac-vuong', chuong: 'C4', dinh, ...(Object.keys(canh).length ? { canh } : {}), ...(Object.keys(goc).length ? { goc } : {}), ...(nhanCanh ? { nhanCanh } : {}), ...(tyLe ? { tyLe } : {}), moTa };
};
const ABCd = ['A', 'B', 'C'], KHONG = ['', '', ''];
const THANG = { tren: 'tường', ngang: 'mặt đất', huyen: 'thang' };
const HINH = {
  'C4-B11-M1-Q01': TG(ABCd),
  'C4-B11-M1-Q02': TG(ABCd),
  'C4-B11-M1-Q03': TG(ABCd, { tren: '3', ngang: '4', huyen: '5' }, {}, undefined, undefined, { tren: 3, ngang: 4 }),
  'C4-B11-M1-Q04': TG(ABCd, { tren: '3', ngang: '4', huyen: '5' }, {}, undefined, undefined, { tren: 3, ngang: 4 }),
  'C4-B11-M1-Q06': TG(['M', 'N', 'P'], { tren: '6', huyen: '10' }, {}, undefined, undefined, { tren: 6, huyen: 10 }),
  'C4-B11-M1-Q08': TG(KHONG, { ngang: '1,5 m', huyen: '4 m' }, { phai: 'α' }, 'Thang dài 4 m dựa vào tường, chân thang cách chân tường 1,5 m, α là góc giữa thang và mặt đất.', THANG, { ngang: 1.5, huyen: 4 }),
  'C4-B11-M1-Q09': TG(ABCd),
  'C4-B11-M1-Q10': TG(ABCd),
  'C4-B11-M1-Q11': TG(ABCd, { tren: '6', ngang: '8', huyen: '10' }, {}, undefined, undefined, { tren: 6, ngang: 8 }),
  'C4-B11-M1-Q12': TG(ABCd, { tren: '6', ngang: '8', huyen: '10' }, {}, undefined, undefined, { tren: 6, ngang: 8 }),
  'C4-B11-M1-Q13': TG(ABCd, { tren: '5', huyen: '13' }, {}, undefined, undefined, { tren: 5, huyen: 13 }),
  'C4-B11-M1-Q15': TG(ABCd, { tren: '5 cm', huyen: '13 cm' }, {}, undefined, undefined, { tren: 5, huyen: 13 }),
  'C4-B11-M1-Q16': TG(KHONG, { tren: '14 m', huyen: '50 m' }, { phai: 'α' }, 'Mặt dốc dài 50 m, đỉnh dốc cao hơn chân dốc 14 m, α là góc giữa mặt dốc và phương nằm ngang.', { tren: 'độ cao', huyen: 'mặt dốc' }, { tren: 14, huyen: 50 }),
  'C4-B11-M2-Q07': TG(ABCd, { ngang: '?', huyen: '10 cm' }, { tren: '30°' }, undefined, undefined, { gocTren: 30 }),
  'C4-B11-M2-Q13': TG(ABCd, { tren: '8 cm', huyen: '?' }, { phai: '30°' }, undefined, undefined, { gocPhai: 30 }),
  'C4-B11-M2-Q15': TG(KHONG, { tren: '?', huyen: '6 m' }, { phai: '60°' }, 'Thang dài 6 m dựa vào tường, tạo với mặt đất góc 60°; cần tìm độ cao đầu thang chạm tường.', THANG, { gocPhai: 60 }),
  'C4-B11-M3-Q06': TG(ABCd),
  'C4-B11-M3-Q13': TG(ABCd),
  'C4-B12-M1-Q01': TG(ABCd, { ngang: 'b', huyen: 'a' }),
  'C4-B12-M1-Q02': TG(ABCd, { tren: 'c', huyen: 'a' }),
  'C4-B12-M1-Q03': TG(ABCd, { tren: '?', huyen: '12 cm' }, { tren: '60°' }, undefined, undefined, { gocTren: 60 }),
  'C4-B12-M1-Q04': TG(ABCd, { tren: '?', huyen: '20 cm' }, { phai: '30°' }, undefined, undefined, { gocPhai: 30 }),
  'C4-B12-M1-Q05': TG(ABCd, { ngang: '6 cm', huyen: '?' }, { tren: '30°' }, undefined, undefined, { gocTren: 30 }),
  'C4-B12-M1-Q06': TG(KHONG, { ngang: '?', huyen: '5 m' }, { phai: '65°' }, 'Thang dài 5 m dựa vào tường, tạo với mặt đất góc 65°; cần tìm khoảng cách từ chân thang đến tường.', THANG, { gocPhai: 65 }),
  'C4-B12-M1-Q07': TG(ABCd, { tren: '?', huyen: '10 cm' }),
  'C4-B12-M1-Q08': TG(KHONG, { tren: '?', huyen: '80 m' }, { phai: '40°' }, 'Dây diều dài 80 m tạo với phương nằm ngang góc 40°; cần tìm độ cao diều so với tay.', { tren: 'độ cao', ngang: 'phương ngang', huyen: 'dây diều' }, { gocPhai: 40 }),
  'C4-B12-M1-Q09': TG(ABCd, { ngang: 'b', huyen: 'a' }),
  'C4-B12-M1-Q10': TG(ABCd, { tren: 'c', huyen: 'a' }),
  'C4-B12-M1-Q11': TG(ABCd, { ngang: '?', huyen: '8 cm' }, { tren: '30°' }, undefined, undefined, { gocTren: 30 }),
  'C4-B12-M1-Q12': TG(ABCd, { ngang: '?', huyen: '6 cm' }, { phai: '45°' }, undefined, undefined, { gocPhai: 45 }),
  'C4-B12-M1-Q13': TG(ABCd, { tren: '?', huyen: '20 cm' }, { tren: '40°' }, undefined, undefined, { gocTren: 40 }),
  'C4-B12-M1-Q14': TG(ABCd, { tren: '9 cm', huyen: '?' }, { phai: '60°' }, undefined, undefined, { gocPhai: 60 }),
  'C4-B12-M1-Q15': TG(KHONG, { ngang: '2,5 m', huyen: '6 m' }, { phai: '?' }, 'Thang dài 6 m, chân thang cách tường 2,5 m; cần tìm góc giữa thang và mặt đất.', THANG, { ngang: 2.5, huyen: 6 }),
  'C4-B12-M1-Q16': TG(KHONG, { tren: '?', huyen: '60 m' }, { phai: '50°' }, 'Dây diều dài 60 m tạo với phương nằm ngang góc 50°, tay cách mặt đất 1,5 m.', { tren: 'cao so với tay', ngang: 'phương ngang', huyen: 'dây diều' }, { gocPhai: 50 }),
  'C4-B12-M2-Q01': TG(ABCd, { tren: 'c', ngang: 'b' }),
  'C4-B12-M2-Q02': TG(ABCd, { tren: 'c', ngang: 'b' }),
  'C4-B12-M2-Q03': TG(ABCd, { tren: '5 cm', ngang: '?' }, { tren: '45°' }, undefined, undefined, { gocTren: 45 }),
  'C4-B12-M2-Q04': TG(ABCd, { tren: '3 cm', ngang: '?' }, { tren: '60°' }, undefined, undefined, { gocTren: 60 }),
  'C4-B12-M2-Q05': TG(ABCd, { tren: '?', ngang: '9 cm' }, { phai: '30°' }, undefined, undefined, { gocPhai: 30 }),
  'C4-B12-M2-Q06': TG(KHONG, { tren: '?', ngang: '12 m' }, { phai: '35°' }, 'Cột cờ đứng thẳng, bóng trên mặt đất dài 12 m, tia nắng tạo với mặt đất góc 35°; cần tìm chiều cao cột cờ.', { tren: 'cột cờ', ngang: 'bóng', huyen: 'tia nắng' }, { gocPhai: 35 }),
  'C4-B12-M2-Q08': TG(ABCd, { tren: '4 cm', ngang: '4√3 cm' }, { tren: '?' }, undefined, undefined, { tren: 4, ngang: 4 * Math.SQRT2 }),
  'C4-B12-M2-Q09': TG(ABCd, { tren: 'c', ngang: 'b' }),
  'C4-B12-M2-Q10': TG(ABCd, { tren: 'c', ngang: 'b' }),
  'C4-B12-M2-Q11': TG(ABCd, { tren: '?', ngang: '4 cm' }, { phai: '60°' }, undefined, undefined, { gocPhai: 60 }),
  'C4-B12-M2-Q12': TG(ABCd, { tren: '?', ngang: '10 cm' }, { tren: '30°' }, undefined, undefined, { gocTren: 30 }),
  'C4-B12-M2-Q13': TG(ABCd, { tren: '15 cm', ngang: '?' }, { tren: '28°' }, undefined, undefined, { gocTren: 28 }),
  'C4-B12-M2-Q14': TG(KHONG, { tren: '7 m', ngang: '4 m' }, { phai: '?' }, 'Cột đèn cao 7 m, bóng trên mặt đất dài 4 m; cần tìm góc giữa tia nắng và mặt đất.', { tren: 'cột đèn', ngang: 'bóng', huyen: 'tia nắng' }, { tren: 7, ngang: 4 }),
  'C4-B12-M3-Q02': TG(ABCd, {}, { tren: '35°', phai: '?' }, undefined, undefined, { gocTren: 35 }),
  'C4-B12-M3-Q03': TG(ABCd, { tren: '6 cm', ngang: '?', huyen: '10 cm' }, { tren: '?' }, undefined, undefined, { tren: 6, huyen: 10 }),
  'C4-B12-M3-Q05': TG(ABCd, { ngang: '?', huyen: '15 cm' }, { tren: '40°' }, undefined, undefined, { gocTren: 40 }),
  'C4-B12-M3-Q06': TG(ABCd, { tren: '5 cm', ngang: '5 cm' }, {}, undefined, undefined, { tren: 5, ngang: 5 }),
  'C4-B12-M3-Q07': TG(KHONG, { tren: '?', huyen: '5 km' }, { phai: '20°' }, 'Máy bay bay theo đường thẳng tạo với mặt đất góc 20°, đã bay được 5 km; cần tìm độ cao.', { tren: 'độ cao', ngang: 'mặt đất', huyen: 'đường bay' }, { gocPhai: 20 }),
  'C4-B12-M3-Q08': TG(KHONG, { tren: '15 m', huyen: '120 m' }, { phai: '?' }, 'Mặt dốc dài 120 m, đỉnh dốc cao hơn chân dốc 15 m; cần tìm góc giữa mặt dốc và phương nằm ngang.', { tren: 'độ cao', huyen: 'mặt dốc' }, { tren: 15, huyen: 120 }),
  'C4-B12-M3-Q09': TG(ABCd, {}, { tren: '?', phai: '62°' }, undefined, undefined, { gocPhai: 62 }),
  'C4-B12-M3-Q11': TG(ABCd, { tren: '5 cm', ngang: '12 cm', huyen: '?' }, { tren: '?' }, undefined, undefined, { tren: 5, ngang: 12 }),
  'C4-B12-M3-Q13': TG(ABCd, { tren: '?', huyen: '10 cm' }, { tren: '50°', phai: '?' }, undefined, undefined, { gocTren: 50 }),
  'C4-B12-M3-Q14': TG(ABCd, { ngang: '6 cm', huyen: '?' }, { tren: '35°' }, undefined, undefined, { gocTren: 35 }),
  'C4-B12-M3-Q15': TG(KHONG, { tren: '?', huyen: '200 m' }, { phai: '9°' }, 'Đoạn đường dốc dài 200 m, góc giữa mặt đường và phương nằm ngang là 9°; cần tìm độ cao lên thêm.', { tren: 'độ cao', huyen: 'mặt đường dốc' }, { gocPhai: 9 }),
  'C4-B12-M3-Q16': TG(ABCd, { tren: '7 cm', ngang: '?', huyen: '?' }, { tren: '?', phai: '42°' }, undefined, undefined, { gocPhai: 42 })
};

export const QUESTIONS = [...CAU_GOC, ...CAU_MOI]
  .map((q) => (HINH[q.id] ? { ...q, hinh: HINH[q.id] } : q))
  .sort((a, b) => a.id.localeCompare(b.id));

export const HINTS = {
  'E-TSLG-01': ['Đứng ở góc đang xét, cạnh nào nằm đối diện góc đó? Cạnh góc vuông nào nằm sát góc đó?', 'Với một góc nhọn: cạnh huyền là cạnh đối diện góc vuông; cạnh đối là cạnh góc vuông nằm đối diện góc đang xét; cạnh kề là cạnh góc vuông còn lại (một đầu nằm ở góc đó).', 'Ví dụ: tam giác ABC vuông tại A, với góc B: cạnh đối AC, cạnh kề AB, cạnh huyền BC; sin B = AC/BC.'],
  'E-TSLG-02': ['sin là tỉ số của cạnh nào chia cạnh nào? Cạnh huyền nằm ở tử hay ở mẫu?', 'sin = đối/huyền, cos = kề/huyền, tan = đối/kề, cot = kề/đối. Vì cạnh huyền lớn nhất nên 0 < sin, cos < 1. Còn sin² α + cos² α = 1.', 'Ví dụ: AB = 3, AC = 4, BC = 5: tan B = AC/AB = 4/3; sin α = 3/5 thì cos α = 4/5.'],
  'E-TSLG-03': ['Trong tam giác đều cạnh 2, kẻ đường cao thì có tam giác vuông với các góc bao nhiêu độ?', 'sin 30° = cos 60° = 1/2; sin 60° = cos 30° = √3/2; sin 45° = cos 45° = √2/2; tan 30° = √3/3, tan 45° = 1, tan 60° = √3. Góc lớn hơn thì sin lớn hơn.', 'Ví dụ: BC = 10, góc B = 30°: AC = 10·sin 30° = 5; tan α = √3/3 thì α = 30°.'],
  'E-TSLG-04': ['Hai góc phụ nhau có tổng bằng bao nhiêu độ: 90° hay 180°?', 'α và 90° − α là hai góc phụ nhau: sin α = cos(90° − α), cos α = sin(90° − α), tan α = cot(90° − α). Trong tam giác vuông, hai góc nhọn phụ nhau nên sin B = cos C.', 'Ví dụ: sin 50° = cos 40°; tan 20° · tan 70° = tan 20° · cot 20° = 1.'],
  'E-HTL-01': ['Cạnh cần tìm nằm đối diện hay nằm kề với góc đã biết?', 'Cạnh góc vuông = cạnh huyền × sin góc đối = cạnh huyền × cos góc kề. Biết cạnh góc vuông, tìm cạnh huyền thì chia cho sin (hoặc cos).', 'Ví dụ: BC = 12, góc B = 60°: AB kề góc B nên AB = 12·cos 60° = 6.'],
  'E-HTL-02': ['Cạnh cần tìm đối diện góc đã biết hay kề góc đó? Cạnh đã biết là cạnh góc vuông hay cạnh huyền?', 'Cạnh góc vuông = cạnh góc vuông kia × tan góc đối = cạnh góc vuông kia × cot góc kề.', 'Ví dụ: AB = 3, góc B = 60°: AC đối góc B nên AC = AB·tan 60° = 3√3.'],
  'E-HTL-03': ['Máy tính đang ở chế độ độ (D) chưa? Góc hạ nằm giữa tia nhìn và đường nào?', 'Để máy ở chế độ D. Góc nâng, góc hạ đều đo giữa tia nhìn và phương nằm ngang; vẽ hình, đánh dấu tam giác vuông rồi chọn tỉ số. Làm tròn ở bước cuối.', 'Ví dụ: toà nhà cao 30 m, góc hạ 25° thì khoảng cách d thoả tan 25° = 30/d, d = 30/tan 25° ≈ 64 m.'],
  'E-HTL-04': ['Trong tam giác vuông, hai góc nhọn cộng lại bằng bao nhiêu độ?', 'Tam giác vuông có góc vuông 90° nên hai góc nhọn có tổng 90°. Giải tam giác vuông là tìm mọi cạnh và góc chưa biết; cần biết ít nhất hai yếu tố (trong đó có một cạnh).', 'Ví dụ: góc B = 35° thì góc C = 90° − 35° = 55°; AB = AC thì góc B = góc C = 45°.']
};

const V = (dan, quyTac, viDu, tuLam) => ({ dan, quyTac, viDu: viDu.map(([de, giai]) => ({ de, giai })), tuLam: tuLam.map(([de, dapAn, giaiThich]) => ({ de, dapAn, giaiThich })) });
export const VI_BAI_HOC = {
  'VBH-TSLG-01': V('"Đối" hay "kề" luôn tính theo góc đang xét, không phải theo góc vuông.',
    'Đứng ở góc nhọn đang xét: cạnh đối nằm đối diện góc; cạnh kề là cạnh góc vuông có một đầu ở góc đó; cạnh huyền đối diện góc vuông.',
    [['Tam giác ABC vuông tại A, viết sin B.', 'Cách nghĩ sai: sin B = AB/BC. Cách đúng: với góc B, cạnh đối là AC, nên sin B = AC/BC.'],
     ['Với góc C trong tam giác trên, cạnh kề là gì?', 'Cạnh kề góc C là AC.']],
    [['Cạnh đối góc C?', 'AB', 'Đối diện C.'],
     ['cos B = ?', 'AB/BC', 'Kề/huyền.']]),
  'VBH-TSLG-02': V('Bốn tỉ số, bốn công thức — và một mẹo nhớ: "Sin đi học, Cos không hư, Tan đoàn kết, Cot kết đoàn".',
    'sin = đối/huyền, cos = kề/huyền, tan = đối/kề, cot = kề/đối. Cạnh huyền luôn ở mẫu của sin, cos nên 0 < sin, cos < 1; sin² α + cos² α = 1.',
    [['AB = 3, AC = 4, BC = 5. tan B?', 'Cách nghĩ sai: tan B = 3/4 (kề/đối). Cách đúng: tan B = đối/kề = AC/AB = 4/3.'],
     ['sin α = 3/5, tìm cos α.', 'cos² α = 1 − 9/25 = 16/25, cos α = 4/5.']],
    [['cot B trong tam giác trên?', '3/4', 'Kề/đối.'],
     ['sin α có thể bằng 1,2?', 'Không', 'Đối < huyền.']]),
  'VBH-TSLG-03': V('Chỉ cần nhớ tam giác đều và tam giác vuông cân là dựng lại được bảng góc đặc biệt.',
    'sin 30° = 1/2, sin 45° = √2/2, sin 60° = √3/2; cos thì ngược lại (cos 30° = √3/2, cos 60° = 1/2); tan 30° = √3/3, tan 45° = 1, tan 60° = √3.',
    [['sin 30° bằng bao nhiêu?', 'Cách nghĩ sai: √3/2. Cách đúng: trong nửa tam giác đều cạnh 2, cạnh đối góc 30° bằng 1, huyền bằng 2: sin 30° = 1/2.'],
     ['Tìm α biết tan α = √3/3.', 'tan 30° = √3/3 nên α = 30°.']],
    [['cos 45°?', '√2/2', 'Tam giác vuông cân.'],
     ['tan 60°?', '√3', '√3/2 : 1/2.']]),
  'VBH-TSLG-04': V('Hai góc nhọn của tam giác vuông "đổi vai" cho nhau: sin góc này là cos góc kia.',
    'α + β = 90° thì sin α = cos β, cos α = sin β, tan α = cot β, cot α = tan β. Phụ nhau là tổng 90°, bù nhau mới là tổng 180°.',
    [['sin 50° bằng?', 'Cách nghĩ sai: sin 40°. Cách đúng: 50° và 40° phụ nhau nên sin 50° = cos 40°.'],
     ['Tính tan 20° · tan 70°.', 'tan 70° = cot 20° nên tích bằng tan 20° · cot 20° = 1.']],
    [['cos 65° = sin ?', '25°', '90° − 65°.'],
     ['sin² 20° + sin² 70°?', '1', 'sin 70° = cos 20°.']]),
  'VBH-HTL-01': V('Biết cạnh huyền và một góc là tính được cả hai cạnh góc vuông — chỉ cần chọn đúng sin hay cos.',
    'Cạnh góc vuông = cạnh huyền × sin góc đối = cạnh huyền × cos góc kề. Ngược lại, cạnh huyền = cạnh góc vuông : sin góc đối.',
    [['BC = 12, góc B = 60°, tìm AB.', 'Cách nghĩ sai: AB = 12·sin 60° = 6√3. Cách đúng: AB kề góc B nên AB = 12·cos 60° = 6.'],
     ['AC = 6, góc B = 30°, tìm BC.', 'AC đối góc B: AC = BC·sin 30° nên BC = 6 : 0,5 = 12.']],
    [['BC = 20, góc C = 30°, AB = ?', '10', 'AB đối C: 20·sin 30°.'],
     ['BC = 10, cos B = 0,8, AB = ?', '8', '10·0,8.']]),
  'VBH-HTL-02': V('Khi không có cạnh huyền, dùng tan hoặc cot để đi từ cạnh góc vuông này sang cạnh góc vuông kia.',
    'Cạnh góc vuông = cạnh góc vuông kia × tan góc đối = × cot góc kề.',
    [['AB = 3, góc B = 60°, tìm AC.', 'Cách nghĩ sai: AC = 3·tan 30° = √3. Cách đúng: AC đối góc B nên AC = AB·tan 60° = 3√3.'],
     ['Bóng cột cờ 12 m, nắng nghiêng 35°, cột cao?', 'h = 12·tan 35° ≈ 8,4 m.']],
    [['AB = 5, góc B = 45°, AC = ?', '5', 'tan 45° = 1.'],
     ['AC = 9, góc C = 30°, AB = ?', '3√3', '9·tan 30°.']]),
  'VBH-HTL-03': V('Bài đo đạc thực tế hay sai ở hai chỗ: chế độ máy tính và cách hiểu góc nâng, góc hạ.',
    'Máy để chế độ độ (D). Góc nâng, góc hạ đo giữa tia nhìn và phương nằm ngang. Vẽ hình, đánh dấu tam giác vuông, chọn tỉ số, làm tròn ở bước cuối.',
    [['Từ nóc nhà cao 30 m nhìn ô tô với góc hạ 25°.', 'Cách nghĩ sai: khoảng cách = 30·tan 25° ≈ 14 m. Cách đúng: góc ở ô tô bằng 25° (so le trong), tan 25° = 30/d nên d = 30/tan 25° ≈ 64 m.'],
     ['Tìm α biết sin α = 0,5 bằng máy.', 'Chế độ D, bấm SHIFT sin 0,5 = 30°.']],
    [['BC = 15, góc B = 40°, AC ≈ ?', '9,6', '15·sin 40°.'],
     ['Máy hiện 0,52 khi tìm góc có sin = 0,5 là do?', 'Chế độ radian', 'Chuyển sang D.']]),
  'VBH-HTL-04': V('Tam giác vuông đã có sẵn một góc 90°, nên hai góc còn lại chỉ "chia nhau" 90°.',
    'Hai góc nhọn của tam giác vuông có tổng 90°. Giải tam giác vuông: tìm đủ 3 cạnh và 2 góc nhọn, cần biết ít nhất 2 yếu tố trong đó có một cạnh.',
    [['Góc B = 35°, tìm góc C.', 'Cách nghĩ sai: 180° − 35° = 145°. Cách đúng: 90° − 35° = 55°.'],
     ['AB = AC = 5, giải tam giác.', 'Vuông cân: góc B = góc C = 45°, BC = 5√2.']],
    [['Góc C = 62°, góc B = ?', '28°', '90° − 62°.'],
     ['Biết hai góc nhọn có giải được tam giác vuông không?', 'Không', 'Cần ít nhất một cạnh.']])
};

export const ERROR_NODES = LOI.map((e) => ({ id: e.code, name: e.ten, role: e.role, kuId: e.ku, cluster: e.cluster }));
export const CAUSAL_EDGES = [
  { from: 'E-TSLG-01', to: 'E-TSLG-02', weight: 0.6, reason: 'Xác định cạnh đối, kề sai nên viết tỉ số sai' },
  { from: 'E-TSLG-01', to: 'E-HTL-01', weight: 0.65, reason: 'Nhầm đối – kề nên chọn sin thay cos khi tính cạnh' },
  { from: 'E-TSLG-02', to: 'E-HTL-01', weight: 0.55, reason: 'Nhớ sai định nghĩa nên lập hệ thức sai' },
  { from: 'E-TSLG-02', to: 'E-HTL-02', weight: 0.55, reason: 'Nhớ sai tan, cot nên tính cạnh góc vuông sai' },
  { from: 'E-TSLG-04', to: 'E-HTL-01', weight: 0.4, reason: 'Không biết sin B = cos C nên chọn sai góc' },
  { from: 'E-TSLG-03', to: 'E-HTL-03', weight: 0.4, reason: 'Nhầm giá trị góc đặc biệt nên tính toán thực tế sai' },
  { from: 'E-HTL-01', to: 'E-HTL-03', weight: 0.5, reason: 'Chọn tỉ số sai trong bài toán thực tế' },
  { from: 'E-HTL-04', to: 'E-TSLG-04', weight: 0.5, reason: 'Không nắm hai góc nhọn có tổng 90° nên sai quan hệ góc phụ nhau' }
];
export const ROOT_ERROR_IDS = ['E-TSLG-01', 'E-HTL-04'];

const NHAP = 'Bản nháp do trợ lý AI soạn theo từ điển mã lỗi — giáo viên cần duyệt, sửa trước khi dùng';
const A = (id, ten, errorCodes, nhom, hinhThuc, mucNhanThuc, phut, moTa, hocLieu) => ({ id, ten, errorCodes, nhom, hinhThuc, mucNhanThuc, phut, moTa, hocLieu, trangThai: 'nhap', nguon: NHAP });
export const ACTIVITIES = [
  A('HD-TSLG-01', 'Tô màu đối – kề – huyền', ['E-TSLG-01', 'E-TSLG-02'], ['loi'], 'nhom-dong-chat', 1, [6, 8],
    'Mỗi nhóm nhận 4 tam giác vuông đặt ở các tư thế khác nhau. Với góc được đánh dấu, tô đỏ cạnh đối, xanh cạnh kề, vàng cạnh huyền rồi viết 4 tỉ số. Đổi phiếu kiểm tra chéo.', 'Phiếu 4 tam giác, bút màu'),
  A('HD-TSLG-02', 'Dựng bảng góc đặc biệt', ['E-TSLG-03', 'E-TSLG-04'], ['loi'], 'nhom-dong-chat', 2, [8, 10],
    'Nhóm cắt đôi một tam giác đều cạnh 2 và một hình vuông cạnh 1 bằng giấy, đo hoặc tính các cạnh để tự lập bảng sin, cos, tan của 30°, 45°, 60°; phát hiện quy luật sin α = cos(90° − α).', 'Giấy bìa, thước, kéo'),
  A('HD-HTL-01', 'Chọn đúng công cụ', ['E-HTL-01', 'E-HTL-02', 'E-HTL-04'], ['loi'], 'ca-lop', 2, [6, 8],
    'Giáo viên chiếu 6 tam giác vuông với hai yếu tố đã biết và cạnh cần tìm. Học sinh giơ thẻ sin, cos, tan, cot (và nhân hay chia) trước khi tính; giáo viên hỏi lại vì sao.', 'Thẻ sin/cos/tan/cot, slide'),
  A('HD-HTL-02', 'Đo chiều cao cây trong sân trường', ['E-HTL-03'], ['san-sang', 'loi'], 'nhom-dong-chat', 3, [15, 20],
    'Nhóm dùng giác kế tự chế (thước đo góc + dây dọi) đo góc nâng tới ngọn cây và khoảng cách đến gốc, tính chiều cao, so sánh kết quả giữa các nhóm và bàn về sai số.', 'Thước đo góc, dây dọi, thước dây')
];
