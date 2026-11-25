/**
 * DANH MỤC KỸ NĂNG NỀN (SPEC M13) — mã dạng NEN-L{lớp}-{TÊN}.
 * Mỗi mục Toán 9 (đơn vị kiến thức) gắn đúng MỘT kỹ năng nền: chính là kỹ năng mà trò chơi ôn nền của mục đó kiểm tra.
 * Một kỹ năng dùng chung cho nhiều mục, nên kết quả trò chơi ở các mục khác nhau cộng dồn về cùng một kỹ năng.
 * Mỗi kỹ năng có thẻ ÔN NHANH: công thức cần nhớ + một ví dụ (đọc trong 1 phút).
 * Nội dung viết bằng Unicode; web tự đổi sang LaTeX khi hiển thị.
 */
const K = (ten, lop, congThuc, viDu, muc) => ({ ten, lop, congThuc, viDu, muc });

export const KY_NANG_NEN = {
  'NEN-L7-BIEUTHUC': K('Tính giá trị biểu thức', 7,
    'Thay số vào chữ rồi tính theo thứ tự: luỹ thừa → nhân, chia → cộng, trừ. Số âm khi thay phải đặt trong ngoặc.',
    'Với a = 1, b = −3, c = 2: b² − 4ac = (−3)² − 4·1·2 = 9 − 8 = 1.',
    ['C1-B1-M1', 'C6-B18-M1', 'C6-B19-M2', 'C6-B20-M1', 'C6-B20-M2']),
  'NEN-L7-TOADO': K('Toạ độ của điểm', 7,
    'Điểm M(x; y): x là hoành độ (đọc trên trục Ox), y là tung độ (đọc trên trục Oy). Hai điểm đối xứng qua Oy có hoành độ đối nhau, tung độ bằng nhau.',
    'Điểm A(−2; 3) có hoành độ −2, tung độ 3. Điểm đối xứng với A qua Oy là (2; 3).',
    ['C1-B1-M2', 'C6-B18-M2']),
  'NEN-L8-PTBN': K('Phương trình bậc nhất một ẩn', 8,
    'Dạng ax + b = 0 (a ≠ 0). Cách giải: bỏ ngoặc, chuyển vế (đổi dấu), thu gọn, chia hai vế cho hệ số của x.',
    '3x − 6 = 0 ⇔ 3x = 6 ⇔ x = 2.',
    ['C1-B2-M1', 'C2-B6-M1', 'C2-B6-M2']),
  'NEN-L8-DATHUC': K('Đa thức và lập biểu thức từ lời văn', 8,
    'Cộng, trừ đa thức: bỏ ngoặc (trước ngoặc có dấu trừ thì đổi dấu mọi hạng tử) rồi thu gọn hạng tử đồng dạng. Lập biểu thức: gọi ẩn, viết từng đại lượng theo ẩn.',
    '(2x + y) − (x − 3y) = 2x + y − x + 3y = x + 4y. "Số lớn hơn x là 5" viết là x + 5.',
    ['C1-B2-M2', 'C1-B3-M1', 'C6-B21-M1']),
  'NEN-L5-CHUYENDONG': K('Chuyển động, năng suất, phần công việc', 5,
    'Quãng đường = vận tốc × thời gian; thời gian = quãng đường : vận tốc. Làm xong việc trong n giờ thì mỗi giờ làm được 1/n công việc.',
    'Xe đi 120 km với vận tốc 40 km/h hết 120 : 40 = 3 giờ. Vòi chảy đầy bể trong 6 giờ thì mỗi giờ chảy được 1/6 bể.',
    ['C1-B3-M1B', 'C1-B3-M1C', 'C6-B21-M2']),
  'NEN-L8-PTNT': K('Phân tích đa thức thành nhân tử', 8,
    'Đặt nhân tử chung: ab + ac = a(b + c). Dùng hằng đẳng thức: a² − b² = (a − b)(a + b). Tích bằng 0 khi một thừa số bằng 0.',
    'x² − 3x = x(x − 3). Vậy x² − 3x = 0 khi x = 0 hoặc x = 3.',
    ['C2-B4-M1', 'C6-B19-M1']),
  'NEN-L8-PHANTHUC': K('Phân thức: điều kiện xác định, quy đồng', 8,
    'Phân thức xác định khi mẫu khác 0. Quy đồng: tìm mẫu chung, nhân cả tử và mẫu với nhân tử phụ.',
    '1/(x − 2) xác định khi x ≠ 2. 1/x + 1/(x + 1) = (x + 1 + x)/(x(x + 1)) = (2x + 1)/(x(x + 1)).',
    ['C2-B4-M2']),
  'NEN-L6-SOSANH': K('So sánh số, quy tắc dấu, tổng và tích', 6,
    'Số âm luôn nhỏ hơn số dương. Nhân hai số cùng dấu được số dương, khác dấu được số âm. Nhân hai vế với số âm thì thứ tự đảo lại.',
    '−5 < −2. (−3)·(−4) = 12; (−3)·4 = −12. Hai số có tổng 5, tích 6 là 2 và 3.',
    ['C2-B5-M1', 'C2-B5-M2', 'C5-B17-M2', 'C6-B19-M3', 'C6-B20-M3']),
  'NEN-L7-LUYTHUA': K('Luỹ thừa, bình phương, lập phương', 7,
    'a² = a·a; a³ = a·a·a. Bình phương của số âm là số dương; lập phương của số âm là số âm. Số chính phương: 1, 4, 9, 16, 25, 36, 49, 64, 81, 100…',
    '(−3)² = 9; (−2)³ = −8. 12 = 4·3 (4 là số chính phương).',
    ['C3-B7-M1', 'C3-B8-M1', 'C3-B9-M1', 'C3-B9-M1B', 'C3-B10-M1', 'C10-B32-M2']),
  'NEN-L7-GTTD': K('Giá trị tuyệt đối', 7,
    '|a| = a nếu a ≥ 0; |a| = −a nếu a < 0. Giá trị tuyệt đối không bao giờ âm.',
    '|5| = 5; |−5| = 5. Nếu x < 2 thì |x − 2| = 2 − x.',
    ['C3-B7-M2']),
  'NEN-L6-PHANSO': K('Phân số: rút gọn, nhân, đổi số thập phân', 6,
    'Rút gọn: chia cả tử và mẫu cho ước chung lớn nhất. Nhân phân số với số: nhân tử với số đó. Đổi số thập phân: 0,25 = 25/100 = 1/4.',
    '6/8 = 3/4. (4/3)·6 = 24/3 = 8. 0,5 = 1/2.',
    ['C3-B8-M2', 'C8-B26-M2', 'C10-B31-M4']),
  'NEN-L8-HDT': K('Hằng đẳng thức đáng nhớ', 8,
    '(a + b)² = a² + 2ab + b²; (a − b)² = a² − 2ab + b²; a² − b² = (a − b)(a + b).',
    '(x − 3)² = x² − 6x + 9. x² − 4 = (x − 2)(x + 2). (√5 − 1)(√5 + 1) = 5 − 1 = 4.',
    ['C3-B9-M2', 'C3-B9-M2B', 'C5-B15-M3']),
  'NEN-L8-PYTAGO': K('Định lí Pythagore', 8,
    'Tam giác vuông: bình phương cạnh huyền bằng tổng bình phương hai cạnh góc vuông. BC² = AB² + AC² (vuông tại A).',
    'AB = 3, AC = 4 thì BC² = 9 + 16 = 25, BC = 5. Cạnh huyền 13, một cạnh góc vuông 5 thì cạnh kia bằng 12.',
    ['C4-B11-M1', 'C5-B14-M1', 'C5-B16-M2', 'C9-B29-M2', 'C10-B31-M3']),
  'NEN-L7-TAMGIAC': K('Tam giác: tổng ba góc, tam giác đặc biệt, các đường đồng quy', 7,
    'Tổng ba góc của tam giác bằng 180°. Hai góc nhọn của tam giác vuông phụ nhau. Ba đường trung trực đồng quy tại điểm cách đều ba đỉnh; ba đường phân giác đồng quy tại điểm cách đều ba cạnh.',
    'Tam giác vuông có một góc 35° thì góc nhọn kia bằng 90° − 35° = 55°. Tam giác đều có ba góc 60°.',
    ['C4-B11-M2', 'C4-B11-M3', 'C4-B12-M3', 'C5-B16-M1', 'C5-B16-M3', 'C9-B28-M1', 'C9-B28-M2', 'C9-B28-M3']),
  'NEN-L6-DUONGTRON': K('Đường tròn, hình tròn: chu vi và diện tích', 6,
    'Đường kính d = 2R. Chu vi C = 2πR = πd. Diện tích S = πR². Diện tích hình chữ nhật = dài × rộng.',
    'R = 5 cm: C = 10π cm, S = 25π cm². Đường kính 8 cm thì R = 4 cm.',
    ['C5-B13-M1', 'C5-B13-M2', 'C5-B15-M1', 'C5-B15-M2', 'C10-B31-M1', 'C10-B31-M2', 'C10-B32-M1']),
  'NEN-L6-GOC': K('Góc, số đo góc, tổng các góc của tứ giác', 6,
    'Góc bẹt 180°, góc vuông 90°, cả vòng 360°. Tổng bốn góc của tứ giác bằng 360°. Chia đều 360° cho n phần: mỗi phần 360° : n.',
    'Tứ giác có ba góc 90°, 80°, 100° thì góc thứ tư bằng 360° − 270° = 90°. 360° : 6 = 60°.',
    ['C5-B14-M2', 'C9-B29-M1', 'C9-B30-M1', 'C9-B30-M3', 'C9-B30-M4']),
  'NEN-L6-THONGKE': K('Thu thập dữ liệu và đọc biểu đồ', 6,
    'Kiểm đếm: đếm số lần mỗi giá trị xuất hiện. Biểu đồ cột so sánh số lượng; biểu đồ đoạn thẳng cho thấy sự thay đổi theo thời gian; biểu đồ hình quạt tròn cho thấy tỉ lệ phần trăm.',
    'Điểm 7, 8, 7, 9, 7, 8: điểm 7 xuất hiện 3 lần, điểm 8 xuất hiện 2 lần, điểm 9 xuất hiện 1 lần.',
    ['C7-B22-M1', 'C7-B22-M2', 'C7-B24-M4']),
  'NEN-L6-PHANTRAM': K('Tỉ số phần trăm', 6,
    'Tỉ số phần trăm của a và b: (a : b)·100%. Tìm p% của một số: nhân số đó với p rồi chia 100.',
    '8 trong 40 học sinh là 8 : 40 = 0,2 = 20%. 25% của 80 là 80·25 : 100 = 20.',
    ['C7-B23-M1', 'C7-B23-M2', 'C7-B24-M3']),
  'NEN-L7-TRUNGBINH': K('Số trung bình cộng', 7,
    'Trung bình cộng = tổng các số : số các số. Trung bình cộng của hai số a và b là (a + b) : 2.',
    'Trung bình cộng của 150 và 155 là 152,5. Điểm 7, 8, 9 có trung bình (7 + 8 + 9) : 3 = 8.',
    ['C7-B24-M1', 'C7-B24-M2']),
  'NEN-L7-XACSUAT': K('Kết quả có thể và biến cố', 7,
    'Tung đồng xu có 2 kết quả; gieo xúc xắc có 6 kết quả. Biến cố chắc chắn luôn xảy ra; biến cố không thể không bao giờ xảy ra; còn lại là biến cố ngẫu nhiên.',
    'Gieo xúc xắc: "ra số nhỏ hơn 7" là biến cố chắc chắn; "ra số 8" là biến cố không thể.',
    ['C8-B25-M1', 'C8-B26-M1']),
  'NEN-L9-C1': K('Toán 9 Chương I: nghiệm của phương trình bậc nhất hai ẩn', 9,
    'Cặp số (x0; y0) là nghiệm của ax + by = c khi thay vào được đẳng thức đúng.',
    '(1; 2) là nghiệm của x + 2y = 5 vì 1 + 2·2 = 5.',
    ['C1-B1-M3']),
  'NEN-L9-C3': K('Toán 9 Chương III: căn bậc hai, căn bậc ba đã học', 9,
    '√(A²) = |A|. Căn thức đồng dạng (cùng biểu thức dưới dấu căn) thì cộng trừ được. ∛(a³) = a với mọi a.',
    '3√2 + 5√2 = 8√2. ∛(−8) = −2. √((−3)²) = 3.',
    ['C3-B9-M3', 'C3-B10-M2', 'C3-LTC']),
  'NEN-L9-C4': K('Toán 9 Chương IV: tỉ số lượng giác của góc nhọn', 9,
    'sin = đối : huyền; cos = kề : huyền; tan = đối : kề; cot = kề : đối. sin 30° = 1/2; cos 60° = 1/2; tan 45° = 1.',
    'Tam giác ABC vuông tại A: sin B = AC/BC, cos B = AB/BC, tan B = AC/AB.',
    ['C4-B12-M1', 'C4-B12-M2']),
  'NEN-L9-C5': K('Toán 9 Chương V: góc ở tâm, cung và vị trí tương đối', 9,
    'Số đo cung nhỏ bằng số đo góc ở tâm chắn cung đó. Góc nội tiếp bằng nửa số đo cung bị chắn. Đường thẳng tiếp xúc đường tròn khi khoảng cách từ tâm đến nó bằng bán kính.',
    'Góc ở tâm 80° chắn cung 80°; nửa số đo cung đó là 40°.',
    ['C5-B14-M3', 'C5-B17-M1', 'C9-B27-M1']),
  'NEN-L9-C9': K('Toán 9 Chương IX: tổng các góc của đa giác', 9,
    'Tổng các góc của đa giác lồi n cạnh bằng (n − 2)·180°. Đa giác đều n cạnh có mỗi góc bằng (n − 2)·180° : n.',
    'Lục giác: (6 − 2)·180° = 720°, mỗi góc của lục giác đều bằng 120°.',
    ['C9-B30-M2'])
};

/** Mục (ku_id) → mã kỹ năng nền. */
export const KY_NANG_THEO_MUC = Object.fromEntries(Object.entries(KY_NANG_NEN).flatMap(([ma, k]) => k.muc.map((m) => [m, ma])));

/**
 * Mức nắm vững một kỹ năng (SPEC M13.2): tính từ 10 câu trả lời gần nhất, lượt càng mới trọng số càng cao.
 * `luot`: các lượt chơi của kỹ năng đó, MỚI NHẤT TRƯỚC, mỗi lượt { dung, tong }.
 * Trả { muc: 'vung' | 'chua-chac' | 'hong' | 'chua-du', tiLe, soCau, xuHuong: 1 | 0 | -1 }.
 */
export function mucNamVung(luot) {
  const tinh = (ds) => {
    let con = 10, w = 1, tu = 0, mau = 0, soCau = 0;
    for (const l of ds) {
      if (con <= 0) break;
      const tong = Math.max(0, Math.min(con, l.tong | 0));
      if (!tong) continue;
      const dung = Math.max(0, Math.min(l.dung | 0, l.tong | 0)) * tong / l.tong;
      tu += w * dung; mau += w * tong; soCau += tong; con -= tong; w *= 0.8;
    }
    return { tiLe: mau ? tu / mau : null, soCau };
  };
  const nay = tinh(luot);
  if (nay.soCau < 3 || nay.tiLe == null) return { muc: 'chua-du', tiLe: nay.tiLe, soCau: nay.soCau, xuHuong: 0 };
  const truoc = tinh(luot.slice(1));
  const xuHuong = truoc.soCau < 3 || truoc.tiLe == null ? 0 : nay.tiLe - truoc.tiLe > 0.05 ? 1 : nay.tiLe - truoc.tiLe < -0.05 ? -1 : 0;
  return { muc: nay.tiLe >= 0.8 ? 'vung' : nay.tiLe >= 0.5 ? 'chua-chac' : 'hong', tiLe: nay.tiLe, soCau: nay.soCau, xuHuong };
}
