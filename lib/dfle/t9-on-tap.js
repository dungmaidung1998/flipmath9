/**
 * LUYỆN TẬP CHUNG & BÀI TẬP CUỐI CHƯƠNG — Toán 9 (Kết nối tri thức với cuộc sống), 24/11/2026.
 * ===========================================================================
 * BẢN NHÁP do trợ lý AI soạn theo vị trí trong SGK (mục lục: Luyện tập chung sau các bài; Bài tập cuối chương).
 * Giáo viên duyệt trước khi dùng. Đáp án gốc luôn là A (web tự trộn phương án).
 *   - 13 mục Luyện tập chung mới + C3-LTC có sẵn (đổi tên thành Luyện tập chung 2 của Chương III)
 *   - 10 mục Bài tập cuối chương
 *   - Không có video: bước video thay bằng "Tổng hợp kiến thức" (tóm tắt các mục trong phạm vi).
 * Mục mới được GHÉP vào chương ở t9-noi-dung.js (chèn sau mục `sau`, đánh lại số thứ tự trong khoảng của chương);
 * không sửa các tệp t9-chuongN.js.
 */
const SEC = { 1: 45, 2: 60, 3: 90, 4: 120 };
const Q = (id, level, stem, [A, B, C, D], err) =>
  ({ id, ku: id.replace(/-Q\d+$/, ''), level, sec: SEC[level], stem, opts: { A, B, C, D }, correct: 'A', err });
const e3 = (c) => ({ B: c, C: c, D: c });
const e = (b, c, d) => ({ B: b, C: c, D: d });
const LA = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
/** Luyện tập chung: thu = 0 nếu chương chỉ có một bài, 1/2 nếu có hai. */
const LTC = (ma, thu, sau, cacBai, mucTieu) => {
  const so = Number(ma.slice(1));
  const id = thu ? `${ma}-LTC${thu}` : `${ma}-LTC`;
  return { id, bai: `Luyện tập chung${thu ? ' ' + thu : ''} (Chương ${LA[so]})`, muc: '—',
    name: `Luyện tập chung: Bài ${cacBai.join(', ')}`, sau, mucTieu, onTap: 'ltc',
    phamVi: cacBai.map((b) => `${ma}-B${b}-`), khongCanVideo: true };
};
const OTC = (ma, sau, mucTieu) => {
  const so = Number(ma.slice(1));
  return { id: `${ma}-OTC`, bai: `Bài tập cuối chương ${LA[so]}`, muc: '—', name: `Ôn tập cuối chương ${LA[so]}`,
    sau, mucTieu, onTap: 'otc', phamVi: [`${ma}-B`], khongCanVideo: true };
};

/** Đổi tên mục có sẵn cho khớp SGK (C3-LTC là Luyện tập chung sau Bài 10). */
export const DOI_TEN = {
  'C3-LTC': { bai: 'Luyện tập chung 2 (Chương III)', name: 'Luyện tập chung: Bài 9, 10', onTap: 'ltc', phamVi: ['C3-B9-', 'C3-B10-'] }
};

/* ------------------------------------------------------------ CHƯƠNG I */
const CAU_C1 = [
  // C1-LTC · Luyện tập chung (Bài 1, 2)
  Q('C1-LTC-Q01', 1, 'Phương trình nào là phương trình bậc nhất hai ẩn?', ['2x − 3y = 5', 'xy + y = 2', 'x² + y = 1', '1/x + y = 3'], e3('E-PT2-01')),
  Q('C1-LTC-Q02', 1, 'Cặp số nào là nghiệm của phương trình 3x − y = 5?', ['(2; 1)', '(1; 2)', '(0; 5)', '(2; −1)'], e3('E-PT2-02')),
  Q('C1-LTC-Q03', 2, 'Cặp số (1; −2) là nghiệm của hệ phương trình nào?', ['x + y = −1 và 2x − y = 4', 'x + y = −1 và x − y = 1', 'x − y = 3 và x + y = 3', '2x + y = 4 và x − y = 3'], e3('E-HPT-01')),
  Q('C1-LTC-Q04', 2, 'Nghiệm của hệ x + y = 5 và x − y = 1 là:', ['(3; 2)', '(2; 3)', '(4; 1)', '(6; −1)'], e('E-PT2-02', 'E-HPT-01', 'E-HPT-03')),
  Q('C1-LTC-Q05', 2, 'Giải hệ x − 2y = 3 và 2x + y = 1 bằng phương pháp thế: rút x từ phương trình thứ nhất rồi thế vào phương trình thứ hai, được:', ['2(2y + 3) + y = 1', '2(2y − 3) + y = 1', '2·2y + 3 + y = 1', '2(3 − 2y) + y = 1'], e3('E-HPT-02')),
  Q('C1-LTC-Q06', 3, 'Nghiệm của hệ 2x + 3y = 7 và 2x − y = 3 là:', ['(2; 1)', '(1; 2)', '(4; −5)', '(2; −1)'], e('E-PT2-02', 'E-HPT-03', 'E-HPT-03')),
  Q('C1-LTC-Q07', 3, 'Hệ phương trình x + 2y = 3 và 2x + 4y = 5:', ['Vô nghiệm', 'Có nghiệm duy nhất', 'Có vô số nghiệm', 'Có nghiệm (1; 1)'], e('E-HPT-04', 'E-HPT-04', 'E-HPT-01')),
  Q('C1-LTC-Q08', 3, 'Tìm a, b để hệ ax + y = 5 và x + by = 4 có nghiệm (1; 2).', ['a = 3, b = 1,5', 'a = 1,5, b = 3', 'a = 3, b = 2', 'a = 4, b = 1,5'], e3('E-PT2-02')),
  // C1-OTC · Ôn tập cuối chương I
  Q('C1-OTC-Q01', 1, 'Nghiệm tổng quát của phương trình 2x + 0y = 4 là:', ['(2; y) với y tuỳ ý', '(x; 2) với x tuỳ ý', 'Chỉ có (2; 0)', '(x; 4 − 2x) với x tuỳ ý'], e3('E-PT2-03')),
  Q('C1-OTC-Q02', 1, 'Cặp số nào là nghiệm của hệ x + y = 4 và x − y = 2?', ['(3; 1)', '(1; 3)', '(2; 2)', '(4; 0)'], e('E-PT2-02', 'E-HPT-01', 'E-HPT-01')),
  Q('C1-OTC-Q03', 1, 'Gọi x là số học sinh nam của một lớp. Điều kiện thích hợp của x là:', ['x là số tự nhiên', 'x là số thực bất kì', 'x > 0, có thể là 2,5', 'x < 0'], e3('E-BTH-01')),
  Q('C1-OTC-Q04', 2, 'Nghiệm của hệ 3x − y = 5 và x + y = 3 là:', ['(2; 1)', '(1; 2)', '(2; −1)', '(8; −5)'], e('E-PT2-02', 'E-HPT-03', 'E-HPT-03')),
  Q('C1-OTC-Q05', 2, 'Mua 2 bút và 3 vở hết 34 nghìn đồng; mua 1 bút và 2 vở hết 21 nghìn đồng. Gọi x, y (nghìn đồng) là giá một bút, một vở. Hệ phương trình đúng là:', ['2x + 3y = 34 và x + 2y = 21', '3x + 2y = 34 và 2x + y = 21', '2x + 3y = 21 và x + 2y = 34', 'x + y = 34 và x + y = 21'], e3('E-BTH-02')),
  Q('C1-OTC-Q06', 2, 'Giải hệ 2x + 3y = 34 và x + 2y = 21 (x, y là giá một bút, một vở, nghìn đồng). Giá một bút và một vở là:', ['Bút 5 nghìn, vở 8 nghìn', 'Bút 8 nghìn, vở 5 nghìn', 'Bút 7 nghìn, vở 7 nghìn', 'Bút 4 nghìn, vở 8,5 nghìn'], e('E-PT2-02', 'E-HPT-02', 'E-HPT-02')),
  Q('C1-OTC-Q07', 2, 'Hệ phương trình 2x − y = 1 và 4x − 2y = 2:', ['Có vô số nghiệm', 'Vô nghiệm', 'Có nghiệm duy nhất', 'Có đúng hai nghiệm'], e3('E-HPT-04')),
  Q('C1-OTC-Q08', 3, 'Ca nô xuôi dòng 60 km hết 2 giờ, ngược dòng 60 km hết 3 giờ. Gọi x là vận tốc riêng của ca nô, y là vận tốc dòng nước (km/h). Hệ phương trình đúng là:', ['x + y = 30 và x − y = 20', 'x − y = 30 và x + y = 20', '2x + 3y = 60 và x + y = 60', 'x + y = 120 và x − y = 180'], e3('E-BTH-03')),
  Q('C1-OTC-Q09', 3, 'Hai vòi nước cùng chảy thì đầy bể sau 4 giờ. Gọi x, y (giờ) là thời gian mỗi vòi chảy riêng đầy bể. Phương trình đúng là:', ['1/x + 1/y = 1/4', 'x + y = 4', '1/x + 1/y = 4', 'x + y = 1/4'], e3('E-BTH-04')),
  Q('C1-OTC-Q10', 3, 'Hai số có tổng bằng 50, số lớn hơn số bé 14 đơn vị. Số bé là:', ['18', '32', '36', '25'], e3('E-BTH-02'))
];

/* ------------------------------------------------------------ CHƯƠNG II */
const CAU_C2 = [
  // C2-LTC · Luyện tập chung (Bài 4, 5)
  Q('C2-LTC-Q01', 1, 'Tập nghiệm của phương trình (x − 3)(2x + 4) = 0 là:', ['{3; −2}', '{3}', '{−3; 2}', '{3; 2}'], e3('E-PTT-01')),
  Q('C2-LTC-Q02', 1, 'Điều kiện xác định của phương trình 2/(x − 1) = 3/(x + 2) là:', ['x ≠ 1 và x ≠ −2', 'x ≠ 1', 'x ≠ −2', 'x ≠ −1 và x ≠ 2'], e3('E-PTM-01')),
  Q('C2-LTC-Q03', 2, 'Cho a > b. Khẳng định nào đúng?', ['a − 5 > b − 5', '−3a > −3b', 'a + 2 < b + 2', '2a < 2b'], e('E-BDT-02', 'E-BDT-01', 'E-BDT-01')),
  Q('C2-LTC-Q04', 2, 'Nghiệm của phương trình x² − 4x = 0 là:', ['x = 0 hoặc x = 4', 'Chỉ x = 4', 'x = 0 hoặc x = −4', 'x = 2 hoặc x = −2'], e3('E-PTT-01')),
  Q('C2-LTC-Q05', 2, 'Số tiền x (nghìn đồng) "không vượt quá 50" được viết là:', ['x ≤ 50', 'x < 50', 'x ≥ 50', 'x > 50'], e3('E-BDT-01')),
  Q('C2-LTC-Q06', 3, 'Nghiệm của phương trình (x + 1)/(x − 1) = 2 là:', ['x = 3', 'x = 1', 'x = −3', 'Vô nghiệm'], e('E-PTM-02', 'E-PTM-03', 'E-PTM-03')),
  Q('C2-LTC-Q07', 3, 'Phương trình 2x/(x − 1) = 2/(x − 1):', ['Vô nghiệm', 'Có nghiệm x = 1', 'Có nghiệm x = 2', 'Có vô số nghiệm'], e('E-PTM-02', 'E-PTM-03', 'E-PTM-01')),
  Q('C2-LTC-Q08', 3, 'Cho a > b > 0. So sánh 2a + 3 và 2b + 1:', ['2a + 3 > 2b + 1', '2a + 3 < 2b + 1', '2a + 3 = 2b + 1', 'Không so sánh được'], e3('E-BDT-03')),
  // C2-OTC · Ôn tập cuối chương II
  Q('C2-OTC-Q01', 1, 'Bất phương trình nào là bất phương trình bậc nhất một ẩn?', ['2x − 5 > 0', '0x + 3 > 0', 'x² − 1 < 0', '1/x + 2 ≥ 0'], e3('E-BPT-01')),
  Q('C2-OTC-Q02', 1, 'Nghiệm của bất phương trình x − 3 > 0 là:', ['x > 3', 'x < 3', 'x > −3', 'x ≥ 3'], e('E-BPT-02', 'E-BPT-02', 'E-BDT-01')),
  Q('C2-OTC-Q03', 1, 'Nghiệm của phương trình (x + 5)(x − 1) = 0 là:', ['x = −5 hoặc x = 1', 'x = 5 hoặc x = −1', 'Chỉ x = −5', 'Chỉ x = 1'], e3('E-PTT-01')),
  Q('C2-OTC-Q04', 2, 'Nghiệm của bất phương trình −2x + 6 ≥ 0 là:', ['x ≤ 3', 'x ≥ 3', 'x ≤ −3', 'x ≥ −3'], e3('E-BPT-02')),
  Q('C2-OTC-Q05', 2, 'Cho a < b. Khẳng định nào đúng?', ['−2a > −2b', '−2a < −2b', 'a − 1 > b − 1', '3a > 3b'], e('E-BDT-02', 'E-BDT-01', 'E-BDT-01')),
  Q('C2-OTC-Q06', 2, 'Nghiệm của bất phương trình 3x + 2 < 11 là:', ['x < 3', 'x > 3', 'x < 13/3', 'x < 9'], e3('E-BPT-02')),
  Q('C2-OTC-Q07', 2, 'Điều kiện xác định của phương trình 1/x + 2/(x − 3) = 1 là:', ['x ≠ 0 và x ≠ 3', 'Chỉ x ≠ 3', 'Chỉ x ≠ 0', 'x ≠ −3'], e3('E-PTM-01')),
  Q('C2-OTC-Q08', 3, 'Vé vào khu vui chơi là 40 nghìn đồng, mỗi lượt chơi 15 nghìn đồng. Bin có 120 nghìn đồng. Bin chơi được nhiều nhất bao nhiêu lượt?', ['5 lượt', '6 lượt', '8 lượt', '5,3 lượt'], e('E-BDT-01', 'E-BPT-02', 'E-BDT-01')),
  Q('C2-OTC-Q09', 3, 'Nghiệm của phương trình 2x(x − 3) = 5(x − 3) là:', ['x = 3 hoặc x = 5/2', 'Chỉ x = 5/2', 'Chỉ x = 3', 'x = 0 hoặc x = 3'], e3('E-PTT-02')),
  Q('C2-OTC-Q10', 3, 'Nghiệm của bất phương trình (x − 1)/2 − 1 > x/3 là:', ['x > 9', 'x < 9', 'x > 7', 'x > 3'], e3('E-BPT-02'))
];

/* ------------------------------------------------------------ CHƯƠNG III */
const CAU_C3 = [
  // C3-LTC1 · Luyện tập chung 1 (Bài 7, 8)
  Q('C3-LTC1-Q01', 1, '√49 bằng:', ['7', '±7', '−7', '24,5'], e3('E-CBH-01')),
  Q('C3-LTC1-Q02', 1, '√(x − 2) xác định khi:', ['x ≥ 2', 'x > 2', 'x ≤ 2', 'x ≥ −2'], e3('E-CBH-03')),
  Q('C3-LTC1-Q03', 2, '√((−6)²) bằng:', ['6', '−6', '±6', '36'], e3('E-CBH-04')),
  Q('C3-LTC1-Q04', 2, '√12 · √3 bằng:', ['6', '√15', '36', '3√2'], e('E-KC-01', 'E-KC-02', 'E-KC-02')),
  Q('C3-LTC1-Q05', 2, '√50 : √2 bằng:', ['5', '25', '√48', '5√2'], e3('E-KC-03')),
  Q('C3-LTC1-Q06', 3, '√(9 + 16) bằng:', ['5', '7', '25', '√7'], e3('E-KC-01')),
  Q('C3-LTC1-Q07', 3, 'So sánh 2√5 và √19:', ['2√5 > √19', '2√5 < √19', '2√5 = √19', 'Không so sánh được'], e3('E-CBH-05')),
  Q('C3-LTC1-Q08', 3, 'Với a < 0, rút gọn √(4a²) được:', ['−2a', '2a', '4a', '±2a'], e3('E-CBH-04')),
  // C3-OTC · Ôn tập cuối chương III
  Q('C3-OTC-Q01', 1, '∛(−27) bằng:', ['−3', '3', 'Không xác định', '±3'], e3('E-CBB-01')),
  Q('C3-OTC-Q02', 1, 'Số nào KHÔNG có căn bậc hai?', ['−4', '0', '4', '0,25'], e3('E-CBH-02')),
  Q('C3-OTC-Q03', 1, '√(x + 3) xác định khi:', ['x ≥ −3', 'x > −3', 'x ≥ 3', 'x ≤ −3'], e3('E-CBH-03')),
  Q('C3-OTC-Q04', 2, 'Đưa thừa số ra ngoài dấu căn, √72 viết gọn nhất là:', ['6√2', '2√6', '36√2', '3√8'], e3('E-BD-01')),
  Q('C3-OTC-Q05', 2, 'Đưa thừa số vào trong dấu căn: 3√2 bằng:', ['√18', '√6', '√11', '√36'], e3('E-BD-02')),
  Q('C3-OTC-Q06', 2, 'Trục căn thức ở mẫu: 6/√3 bằng:', ['2√3', '6√3', '√2', '3√2'], e3('E-BD-03')),
  Q('C3-OTC-Q07', 2, '(√5 + 2)(√5 − 2) bằng:', ['1', '3', '9', '√5'], e3('E-BD-04')),
  Q('C3-OTC-Q08', 3, 'Rút gọn √18 + √8 − √32 được:', ['√2', '−√6', '√6', '5√2'], e3('E-BD-05')),
  Q('C3-OTC-Q09', 3, 'Trục căn thức ở mẫu: 1/(√3 − 1) bằng:', ['(√3 + 1)/2', '√3 + 1', '(√3 − 1)/2', '√3/2'], e3('E-BD-03')),
  Q('C3-OTC-Q10', 3, 'Một khối gỗ hình lập phương có thể tích 125 dm³. Độ dài cạnh khối gỗ là:', ['5 dm', '25 dm', '41,7 dm', '11,2 dm'], e3('E-CBB-01'))
];

/* ------------------------------------------------------------ CHƯƠNG IV */
const CAU_C4 = [
  // C4-LTC · Luyện tập chung (Bài 11, 12)
  Q('C4-LTC-Q01', 1, 'Tam giác ABC vuông tại A. sin B bằng:', ['AC/BC', 'AB/BC', 'AC/AB', 'AB/AC'], e3('E-TSLG-02')),
  Q('C4-LTC-Q02', 1, 'sin 30° bằng:', ['1/2', '√3/2', '√2/2', '√3'], e3('E-TSLG-03')),
  Q('C4-LTC-Q03', 2, 'Cho α là góc nhọn và sin α = cos 50°. Khi đó α bằng:', ['40°', '50°', '130°', '90°'], e3('E-TSLG-04')),
  Q('C4-LTC-Q04', 2, 'Tam giác ABC vuông tại A, BC = 10 cm, góc B bằng 30°. Độ dài AC là:', ['5 cm', '5√3 cm', '10√3 cm', '20 cm'], e3('E-HTL-01')),
  Q('C4-LTC-Q05', 2, 'tan 45° bằng:', ['1', '√2/2', '√3', '0'], e3('E-TSLG-03')),
  Q('C4-LTC-Q06', 3, 'Tam giác ABC vuông tại A có AB = 6 cm, AC = 8 cm. tan B bằng:', ['4/3', '3/4', '4/5', '3/5'], e('E-TSLG-01', 'E-TSLG-02', 'E-TSLG-02')),
  Q('C4-LTC-Q07', 3, 'Một chiếc thang dài 4 m dựa vào tường, tạo với mặt đất góc 60°. Chân thang cách chân tường:', ['2 m', '2√3 m', '4√3 m', '8 m'], e3('E-HTL-01')),
  Q('C4-LTC-Q08', 3, 'Tam giác ABC vuông tại A, AB = 5 cm, góc C bằng 30°. Độ dài BC là:', ['10 cm', '5√3 cm', '2,5 cm', '10√3 cm'], e3('E-HTL-01')),
  // C4-OTC · Ôn tập cuối chương IV
  Q('C4-OTC-Q01', 1, 'cos 60° bằng:', ['1/2', '√3/2', '√3', '1'], e3('E-TSLG-03')),
  Q('C4-OTC-Q02', 1, 'Hai góc phụ nhau có tổng số đo bằng:', ['90°', '180°', '60°', '360°'], e3('E-TSLG-04')),
  Q('C4-OTC-Q03', 1, 'Tam giác ABC vuông tại A. tan C bằng:', ['AB/AC', 'AC/AB', 'AB/BC', 'AC/BC'], e3('E-TSLG-02')),
  Q('C4-OTC-Q04', 2, 'Tam giác MNP vuông tại M, NP = 8 cm, góc N bằng 60°. Độ dài MN là:', ['4 cm', '4√3 cm', '8√3 cm', '16 cm'], e3('E-HTL-01')),
  Q('C4-OTC-Q05', 2, 'Tam giác ABC vuông tại A, AC = 6 cm, góc B bằng 45°. Độ dài AB là:', ['6 cm', '6√2 cm', '3√2 cm', '12 cm'], e3('E-HTL-02')),
  Q('C4-OTC-Q06', 2, 'Tam giác ABC vuông tại A có góc B bằng 35°. Góc C bằng:', ['55°', '145°', '35°', '65°'], e3('E-HTL-04')),
  Q('C4-OTC-Q07', 2, 'cos 25° bằng:', ['sin 65°', 'sin 25°', 'cos 65°', 'tan 65°'], e3('E-TSLG-04')),
  Q('C4-OTC-Q08', 3, 'Bin thả diều, dây diều căng thẳng dài 50 m và tạo với mặt đất góc 30°. Độ cao của diều so với tay Bin là:', ['25 m', '25√3 m', '50√3 m', '100 m'], e3('E-HTL-01')),
  Q('C4-OTC-Q09', 3, 'Bóng của một cột điện trên mặt đất dài 6 m, tia nắng tạo với mặt đất góc 60°. Chiều cao cột điện là:', ['6√3 m', '2√3 m', '3 m', '12 m'], e3('E-HTL-02')),
  Q('C4-OTC-Q10', 3, 'Tam giác ABC vuông tại A, AB = 3 cm, AC = 4 cm. sin B bằng:', ['4/5', '3/5', '3/4', '4/3'], e('E-TSLG-01', 'E-TSLG-02', 'E-TSLG-02'))
];

/* ------------------------------------------------------------ CHƯƠNG V */
const CAU_C5 = [
  // C5-LTC1 · Luyện tập chung 1 (Bài 13, 14, 15)
  Q('C5-LTC1-Q01', 1, 'Cho đường tròn (O; 5 cm) và điểm A với OA = 4 cm. Vị trí của điểm A là:', ['A nằm trong đường tròn', 'A nằm trên đường tròn', 'A nằm ngoài đường tròn', 'Không xác định được'], e3('E-DTR-01')),
  Q('C5-LTC1-Q02', 1, 'Đường tròn có bao nhiêu trục đối xứng?', ['Vô số', '1', '2', '4'], e3('E-DTR-02')),
  Q('C5-LTC1-Q03', 2, 'Dây dài nhất của đường tròn bán kính 6 cm dài:', ['12 cm', '6 cm', '3 cm', '36 cm'], e3('E-CD-01')),
  Q('C5-LTC1-Q04', 2, 'Góc ở tâm bằng 70° chắn cung nhỏ có số đo:', ['70°', '35°', '140°', '290°'], e3('E-CD-02')),
  Q('C5-LTC1-Q05', 2, 'Độ dài cung 60° của đường tròn bán kính 6 cm (lấy π ≈ 3,14) là:', ['6,28 cm', '3,14 cm', '18,84 cm', '12,56 cm'], e3('E-QH-01')),
  Q('C5-LTC1-Q06', 3, 'Diện tích hình quạt tròn bán kính 4 cm, cung 90° (lấy π ≈ 3,14) là:', ['12,56 cm²', '25,12 cm²', '6,28 cm²', '50,24 cm²'], e3('E-QH-02')),
  Q('C5-LTC1-Q07', 3, 'Diện tích hình vành khuyên giới hạn bởi hai đường tròn đồng tâm bán kính 5 cm và 3 cm (lấy π ≈ 3,14) là:', ['50,24 cm²', '12,56 cm²', '6,28 cm²', '25,12 cm²'], e3('E-QH-03')),
  Q('C5-LTC1-Q08', 3, 'Cho đường tròn (O; 13 cm) và dây AB cách O một khoảng 5 cm. Độ dài dây AB là:', ['24 cm', '12 cm', '8 cm', '18 cm'], e3('E-CD-01')),
  // C5-LTC2 · Luyện tập chung 2 (Bài 16, 17)
  Q('C5-LTC2-Q01', 1, 'Đường thẳng a cách tâm O của đường tròn (O; 5 cm) một khoảng 5 cm. Đường thẳng a và đường tròn (O):', ['Tiếp xúc nhau', 'Cắt nhau tại hai điểm', 'Không giao nhau', 'Có vô số điểm chung'], e3('E-TT-01')),
  Q('C5-LTC2-Q02', 1, 'Hai đường tròn có đúng một điểm chung thì hai đường tròn đó:', ['Tiếp xúc nhau', 'Cắt nhau', 'Không giao nhau', 'Đồng tâm'], e3('E-HDT-01')),
  Q('C5-LTC2-Q03', 2, 'Đường thẳng a là tiếp tuyến của đường tròn (O) tại A khi:', ['A thuộc (O) và a vuông góc với OA tại A', 'a vuông góc với OA', 'a đi qua điểm A', 'a cách O một khoảng lớn hơn bán kính'], e3('E-TT-02')),
  Q('C5-LTC2-Q04', 2, 'Cho (O; 4 cm) và (O′; 3 cm) với OO′ = 7 cm. Hai đường tròn:', ['Tiếp xúc ngoài', 'Tiếp xúc trong', 'Cắt nhau', 'Không giao nhau'], e3('E-HDT-02')),
  Q('C5-LTC2-Q05', 2, 'Từ điểm M nằm ngoài (O) kẻ hai tiếp tuyến MA, MB (A, B là tiếp điểm), MA = 6 cm. Độ dài MB là:', ['6 cm', '12 cm', '3 cm', 'Không tính được'], e3('E-TT-03')),
  Q('C5-LTC2-Q06', 3, 'Từ M kẻ tiếp tuyến MA với đường tròn (O; 5 cm), biết OM = 13 cm. Độ dài MA là:', ['12 cm', '8 cm', '18 cm', '√194 cm'], e3('E-TT-02')),
  Q('C5-LTC2-Q07', 3, 'Cho (O; 6 cm) và (O′; 2 cm) với OO′ = 5 cm. Hai đường tròn:', ['Cắt nhau', 'Tiếp xúc ngoài', 'Tiếp xúc trong', 'Không giao nhau'], e3('E-HDT-02')),
  Q('C5-LTC2-Q08', 3, 'Từ M nằm ngoài (O) kẻ hai tiếp tuyến MA, MB với góc AMB bằng 60°. Góc AOB bằng:', ['120°', '60°', '30°', '90°'], e3('E-TT-03')),
  // C5-OTC · Ôn tập cuối chương V
  Q('C5-OTC-Q01', 1, 'Đường kính của đường tròn bán kính 7 cm là:', ['14 cm', '7 cm', '3,5 cm', '49 cm'], e3('E-DTR-01')),
  Q('C5-OTC-Q02', 1, 'Số đo của nửa đường tròn là:', ['180°', '90°', '360°', '100°'], e3('E-CD-02')),
  Q('C5-OTC-Q03', 1, 'Đường thẳng cách tâm O một khoảng lớn hơn bán kính thì:', ['Không giao với đường tròn', 'Tiếp xúc với đường tròn', 'Cắt đường tròn tại hai điểm', 'Đi qua tâm O'], e3('E-TT-01')),
  Q('C5-OTC-Q04', 2, 'Chu vi đường tròn bán kính 10 cm (lấy π ≈ 3,14) là:', ['62,8 cm', '31,4 cm', '314 cm', '628 cm'], e3('E-QH-01')),
  Q('C5-OTC-Q05', 2, 'Góc ở tâm AOB bằng 100°. Số đo cung lớn AB là:', ['260°', '100°', '50°', '200°'], e3('E-CD-02')),
  Q('C5-OTC-Q06', 2, 'Diện tích hình tròn bán kính 3 cm (lấy π ≈ 3,14) là:', ['28,26 cm²', '18,84 cm²', '9,42 cm²', '113,04 cm²'], e3('E-QH-02')),
  Q('C5-OTC-Q07', 2, 'Cho (O; 5 cm) và (O′; 3 cm) với OO′ = 2 cm. Hai đường tròn:', ['Tiếp xúc trong', 'Tiếp xúc ngoài', 'Cắt nhau', 'Không giao nhau'], e3('E-HDT-02')),
  Q('C5-OTC-Q08', 3, 'Bánh xe đạp có đường kính 0,7 m. Bánh xe lăn đủ 100 vòng thì xe đi được (lấy π ≈ 3,14):', ['219,8 m', '109,9 m', '439,6 m', '70 m'], e3('E-QH-01')),
  Q('C5-OTC-Q09', 3, 'Hình quạt tròn bán kính 6 cm có độ dài cung 4π cm. Diện tích hình quạt là:', ['12π cm²', '24π cm²', '6π cm²', '36π cm²'], e3('E-QH-02')),
  Q('C5-OTC-Q10', 3, 'Từ M kẻ hai tiếp tuyến MA, MB với đường tròn (O; 3 cm), biết OM = 5 cm. Tổng MA + MB bằng:', ['8 cm', '4 cm', '10 cm', '6 cm'], e3('E-TT-03'))
];

/* ------------------------------------------------------------ CHƯƠNG VI */
const CAU_C6 = [
  // C6-LTC1 · Luyện tập chung 1 (Bài 18, 19)
  Q('C6-LTC1-Q01', 1, 'Cho hàm số y = 2x². Giá trị của y khi x = −3 là:', ['18', '−18', '36', '12'], e3('E-HSB-01')),
  Q('C6-LTC1-Q02', 1, 'Phương trình 3x² − 5x + 2 = 0 có hệ số b là:', ['−5', '5', '2', '3'], e3('E-PTB-01')),
  Q('C6-LTC1-Q03', 2, 'Đồ thị hàm số y = −x² có đặc điểm:', ['Nằm phía dưới trục hoành, O là điểm cao nhất', 'Nằm phía trên trục hoành, O là điểm thấp nhất', 'Nhận trục hoành làm trục đối xứng', 'Nằm bên phải trục tung'], e3('E-HSB-02')),
  Q('C6-LTC1-Q04', 2, 'Nghiệm của phương trình x² = 16 là:', ['x = 4 hoặc x = −4', 'Chỉ x = 4', 'x = 8 hoặc x = −8', 'Vô nghiệm'], e3('E-PTB-02')),
  Q('C6-LTC1-Q05', 2, 'Biệt thức Δ của phương trình x² − 3x − 4 = 0 là:', ['25', '−7', '7', '−25'], e3('E-PTB-03')),
  Q('C6-LTC1-Q06', 3, 'Nghiệm của phương trình x² − 3x − 4 = 0 là:', ['x = 4 hoặc x = −1', 'x = −4 hoặc x = 1', 'x = 3 hoặc x = 4', 'Vô nghiệm'], e3('E-PTB-04')),
  Q('C6-LTC1-Q07', 3, 'Đồ thị hàm số y = ax² đi qua điểm (2; 12). Giá trị của a là:', ['3', '6', '24', '1/3'], e3('E-HSB-01')),
  Q('C6-LTC1-Q08', 3, 'Phương trình x² − 6x + 9 = 0 có:', ['Nghiệm kép x = 3', 'Hai nghiệm phân biệt', 'Vô nghiệm', 'Nghiệm kép x = −3'], e('E-PTB-03', 'E-PTB-03', 'E-PTB-04')),
  // C6-LTC2 · Luyện tập chung 2 (Bài 20, 21)
  Q('C6-LTC2-Q01', 1, 'Phương trình x² − 5x + 6 = 0 có tổng hai nghiệm bằng:', ['5', '−5', '6', '−6'], e3('E-VI-01')),
  Q('C6-LTC2-Q02', 1, 'Phương trình x² − 5x + 6 = 0 có tích hai nghiệm bằng:', ['6', '−6', '5', '−5'], e3('E-VI-01')),
  Q('C6-LTC2-Q03', 2, 'Phương trình 2x² − 7x + 5 = 0 có a + b + c = 0. Hai nghiệm của phương trình là:', ['x = 1 và x = 5/2', 'x = −1 và x = −5/2', 'x = 1 và x = −5/2', 'x = 2 và x = 5'], e3('E-VI-03')),
  Q('C6-LTC2-Q04', 2, 'Hai số có tổng bằng 7 và tích bằng 12 là hai nghiệm của phương trình:', ['X² − 7X + 12 = 0', 'X² + 7X + 12 = 0', 'X² − 12X + 7 = 0', 'X² + 12X − 7 = 0'], e3('E-VI-04')),
  Q('C6-LTC2-Q05', 2, 'Mảnh vườn hình chữ nhật có chiều dài hơn chiều rộng 3 m và diện tích 40 m². Gọi x (m) là chiều rộng. Phương trình đúng là:', ['x(x + 3) = 40', '2(x + x + 3) = 40', 'x + (x + 3) = 40', 'x(x − 3) = 40'], e3('E-LPT-01')),
  Q('C6-LTC2-Q06', 3, 'Giải phương trình x(x + 3) = 40 với x > 0 (x là chiều rộng mảnh vườn, tính bằng mét). Chiều rộng mảnh vườn là:', ['5 m', '8 m', '−8 m', '10 m'], e('E-LPT-01', 'E-PTB-04', 'E-LPT-01')),
  Q('C6-LTC2-Q07', 3, 'Gọi x₁, x₂ là hai nghiệm của phương trình x² − 4x + 1 = 0. Giá trị của x₁² + x₂² là:', ['14', '16', '18', '12'], e3('E-VI-02')),
  Q('C6-LTC2-Q08', 3, 'Ô tô đi quãng đường 120 km với vận tốc x (km/h). Nếu đi nhanh hơn 10 km/h thì đến sớm hơn 1 giờ. Phương trình đúng là:', ['120/x − 120/(x + 10) = 1', '120/(x + 10) − 120/x = 1', '120x − 120(x + 10) = 1', '120/x + 120/(x + 10) = 1'], e3('E-LPT-02')),
  // C6-OTC · Ôn tập cuối chương VI
  Q('C6-OTC-Q01', 1, 'Với mọi a ≠ 0, đồ thị hàm số y = ax² luôn đi qua điểm:', ['O(0; 0)', '(1; 1)', '(0; 1)', '(1; 0)'], e3('E-HSB-02')),
  Q('C6-OTC-Q02', 1, 'Phương trình nào là phương trình bậc hai một ẩn?', ['2x² − 3x + 1 = 0', '0x² + 2x − 1 = 0', 'x³ − x = 0', '1/x² + x = 2'], e3('E-PTB-01')),
  Q('C6-OTC-Q03', 1, 'Nghiệm của phương trình x² − 9 = 0 là:', ['x = 3 hoặc x = −3', 'Chỉ x = 3', 'x = 9 hoặc x = −9', 'Vô nghiệm'], e3('E-PTB-02')),
  Q('C6-OTC-Q04', 2, 'Phương trình x² + 2x + 5 = 0:', ['Vô nghiệm', 'Có hai nghiệm phân biệt', 'Có nghiệm kép', 'Có vô số nghiệm'], e3('E-PTB-03')),
  Q('C6-OTC-Q05', 2, 'Nghiệm của phương trình x² + 5x + 4 = 0 là:', ['x = −1 hoặc x = −4', 'x = 1 hoặc x = 4', 'x = −1 hoặc x = 4', 'x = 1 hoặc x = −4'], e3('E-PTB-04')),
  Q('C6-OTC-Q06', 2, 'Cho hàm số y = −2x². Khi x = −2 thì y bằng:', ['−8', '8', '16', '−16'], e3('E-HSB-01')),
  Q('C6-OTC-Q07', 2, 'Phương trình x² − 6x + 5 = 0 có hai nghiệm x₁, x₂. Tổng và tích hai nghiệm là:', ['x₁ + x₂ = 6, x₁x₂ = 5', 'x₁ + x₂ = −6, x₁x₂ = 5', 'x₁ + x₂ = 5, x₁x₂ = 6', 'x₁ + x₂ = 6, x₁x₂ = −5'], e3('E-VI-01')),
  Q('C6-OTC-Q08', 3, 'Quãng đường rơi tự do là s = 5t² (s tính bằng mét, t bằng giây). Một vật rơi từ độ cao 80 m thì chạm đất sau:', ['4 giây', '16 giây', '8 giây', '±4 giây'], e('E-PTB-02', 'E-HSB-01', 'E-PTB-02')),
  Q('C6-OTC-Q09', 3, 'Tìm m để phương trình x² − 2x + m = 0 có nghiệm kép.', ['m = 1', 'm = −1', 'm = 4', 'm = 0'], e3('E-PTB-03')),
  Q('C6-OTC-Q10', 3, 'Một khu đất hình chữ nhật có chu vi 28 m và diện tích 48 m². Chiều dài và chiều rộng của khu đất là:', ['8 m và 6 m', '12 m và 4 m', '7 m và 7 m', '16 m và 3 m'], e3('E-LPT-01'))
];

/* ------------------------------------------------------------ CHƯƠNG VII */
const CAU_C7 = [
  // C7-LTC · Luyện tập chung (Bài 22, 23)
  Q('C7-LTC-Q01', 1, 'Điểm kiểm tra của 10 bạn: 7, 8, 7, 9, 7, 8, 10, 9, 7, 8. Tần số của điểm 7 là:', ['4', '7', '3', '5'], e3('E-TS-01')),
  Q('C7-LTC-Q02', 1, 'Một bảng tần số có các tần số 3, 5, 8, 4. Cỡ mẫu là:', ['20', '4', '8', '5'], e3('E-TS-01')),
  Q('C7-LTC-Q03', 2, 'Lớp có 40 học sinh, trong đó 10 bạn đi học bằng xe buýt. Tần số tương đối của nhóm đi xe buýt là:', ['25%', '10%', '40%', '4%'], e3('E-TSTD-01')),
  Q('C7-LTC-Q04', 2, 'Trên biểu đồ hình quạt tròn, nhóm chiếm 25% được biểu diễn bởi hình quạt có góc ở tâm:', ['90°', '25°', '45°', '180°'], e3('E-TSTD-02')),
  Q('C7-LTC-Q05', 2, 'Biểu đồ cột cho số bạn yêu thích từng loại trái cây: cam 12, xoài 8, ổi 5, chuối 15. Loại được yêu thích nhất là:', ['Chuối', 'Cam', 'Xoài', 'Ổi'], e3('E-TS-02')),
  Q('C7-LTC-Q06', 3, 'Tung một đồng xu 50 lần thấy 28 lần mặt ngửa. Tần số tương đối của mặt ngửa là:', ['56%', '28%', '44%', '50%'], e3('E-TSTD-01')),
  Q('C7-LTC-Q07', 3, 'Một nhóm chiếm 30% mẫu số liệu. Góc ở tâm của hình quạt biểu diễn nhóm đó là:', ['108°', '30°', '54°', '120°'], e3('E-TSTD-02')),
  Q('C7-LTC-Q08', 3, 'Khảo sát 200 khách tắm biển Mỹ Khê thấy 50 người đến từ ngoài thành phố. Tần số tương đối của nhóm này là:', ['25%', '50%', '20%', '75%'], e3('E-TSTD-01')),
  // C7-OTC · Ôn tập cuối chương VII
  Q('C7-OTC-Q01', 1, 'Trong một mẫu số liệu, số lần xuất hiện của một giá trị được gọi là:', ['Tần số', 'Tần số tương đối', 'Cỡ mẫu', 'Giá trị trung bình'], e3('E-TS-01')),
  Q('C7-OTC-Q02', 1, 'Giá trị 15 thuộc nhóm nào trong các nhóm [10; 15), [15; 20), [20; 25)?', ['[15; 20)', '[10; 15)', 'Cả [10; 15) và [15; 20)', '[20; 25)'], e3('E-GN-01')),
  Q('C7-OTC-Q03', 1, 'Tổng các tần số tương đối của một mẫu số liệu bằng:', ['100%', '50%', 'Cỡ mẫu', '1%'], e3('E-TSTD-01')),
  Q('C7-OTC-Q04', 2, 'Mẫu số liệu có cỡ mẫu 50, giá trị 6 có tần số 10. Tần số tương đối của giá trị 6 là:', ['20%', '10%', '5%', '60%'], e3('E-TSTD-01')),
  Q('C7-OTC-Q05', 2, 'Chiều cao (cm) của 8 bạn: 150, 152, 155, 158, 160, 161, 163, 165. Số bạn thuộc nhóm [155; 160) là:', ['2', '3', '4', '1'], e3('E-GN-01')),
  Q('C7-OTC-Q06', 2, 'Bảng tần số ghép nhóm: [0; 10) có 4, [10; 20) có 6, [20; 30) có 10. Tần số tương đối của nhóm [20; 30) là:', ['50%', '10%', '30%', '20%'], e3('E-GN-02')),
  Q('C7-OTC-Q07', 2, 'Trên biểu đồ hình quạt, nhóm A chiếm 40%, nhóm B chiếm 35%, còn lại là nhóm C. Nhóm C chiếm:', ['25%', '75%', '35%', '15%'], e3('E-TSTD-02')),
  Q('C7-OTC-Q08', 3, 'Giá trị đại diện của nhóm [20; 30) là:', ['25', '20', '30', '10'], e3('E-GN-02')),
  Q('C7-OTC-Q09', 3, 'Khảo sát 400 học sinh, trên biểu đồ hình quạt nhóm thích bóng đá ứng với góc ở tâm 108°. Số học sinh thích bóng đá là:', ['120', '108', '30', '150'], e3('E-TSTD-02')),
  Q('C7-OTC-Q10', 3, 'Biểu đồ cột tần số tương đối ghép nhóm được vẽ đúng khi:', ['Các cột liền nhau, mỗi cột ứng với một nhóm', 'Các cột tách rời và cách đều nhau', 'Mỗi cột đặt tại đầu mút trái của nhóm', 'Chiều cao cột bằng độ dài nhóm'], e3('E-GN-03'))
];

/* ------------------------------------------------------------ CHƯƠNG VIII */
const CAU_C8 = [
  // C8-LTC · Luyện tập chung (Bài 25, 26)
  Q('C8-LTC-Q01', 1, 'Gieo một con xúc xắc. Số phần tử của không gian mẫu là:', ['6', '1', '12', '36'], e3('E-XS-01')),
  Q('C8-LTC-Q02', 1, 'Tung một đồng xu hai lần (S: sấp, N: ngửa). Không gian mẫu là:', ['{SS; SN; NS; NN}', '{SS; SN; NN}', '{S; N}', '{SN; NS}'], e3('E-XS-01')),
  Q('C8-LTC-Q03', 2, 'Gieo một con xúc xắc. Xác suất ra mặt có số chấm chẵn là:', ['1/2', '1/3', '1/6', '3'], e3('E-XS-03')),
  Q('C8-LTC-Q04', 2, 'Hộp có 3 bi đỏ và 2 bi xanh. Lấy ngẫu nhiên 1 viên. Xác suất lấy được bi đỏ là:', ['3/5', '3/2', '1/2', '2/5'], e3('E-XS-03')),
  Q('C8-LTC-Q05', 2, 'Gieo hai con xúc xắc. Số phần tử của không gian mẫu là:', ['36', '12', '6', '11'], e3('E-XS-04')),
  Q('C8-LTC-Q06', 3, 'Gieo một con xúc xắc. Các kết quả thuận lợi cho biến cố "số chấm lớn hơn 4" là:', ['5; 6', '4; 5; 6', '6', '5; 6; 7'], e3('E-XS-02')),
  Q('C8-LTC-Q07', 3, 'Rút ngẫu nhiên một thẻ trong 10 thẻ đánh số từ 1 đến 10. Xác suất rút được thẻ ghi số chia hết cho 3 là:', ['3/10', '1/3', '3/9', '1/10'], e3('E-XS-03')),
  Q('C8-LTC-Q08', 3, 'Tung hai đồng xu. Xác suất cả hai đồng xu đều sấp là:', ['1/4', '1/2', '1/3', '1'], e3('E-XS-03')),
  // C8-OTC · Ôn tập cuối chương VIII
  Q('C8-OTC-Q01', 1, 'Tung một đồng xu (S: sấp, N: ngửa). Không gian mẫu là:', ['{S; N}', '{S}', '{N}', '{SS; NN}'], e3('E-XS-01')),
  Q('C8-OTC-Q02', 1, 'Xác suất của một biến cố luôn là một số:', ['Từ 0 đến 1', 'Từ 0 đến 100', 'Từ −1 đến 1', 'Lớn hơn 1'], e3('E-XS-03')),
  Q('C8-OTC-Q03', 1, 'Gieo một con xúc xắc. Biến cố "ra mặt 7 chấm" có xác suất bằng:', ['0', '1/7', '1/6', '1'], e3('E-XS-02')),
  Q('C8-OTC-Q04', 2, 'Túi có 4 viên kẹo cam và 6 viên kẹo dâu. Lấy ngẫu nhiên 1 viên. Xác suất lấy được kẹo dâu là:', ['3/5', '2/5', '6/4', '1/2'], e3('E-XS-03')),
  Q('C8-OTC-Q05', 2, 'Gieo hai con xúc xắc. Số kết quả thuận lợi cho biến cố "tổng số chấm bằng 7" là:', ['6', '7', '5', '12'], e3('E-XS-02')),
  Q('C8-OTC-Q06', 2, 'Lấy lần lượt 2 viên bi (không trả lại) từ hộp có 3 viên bi đánh số 1, 2, 3. Số phần tử của không gian mẫu là:', ['6', '9', '3', '5'], e3('E-XS-04')),
  Q('C8-OTC-Q07', 2, 'Gieo hai con xúc xắc. Xác suất tổng số chấm bằng 7 là:', ['1/6', '7/36', '1/7', '1/12'], e3('E-XS-03')),
  Q('C8-OTC-Q08', 3, 'Lớp có 18 bạn nam và 22 bạn nữ. Chọn ngẫu nhiên 1 bạn làm lớp trưởng. Xác suất chọn được bạn nữ là:', ['11/20', '22/18', '9/20', '1/2'], e3('E-XS-03')),
  Q('C8-OTC-Q09', 3, 'Vòng quay may mắn chia thành 8 ô bằng nhau, trong đó 3 ô ghi "Thưởng". Quay một lần, xác suất kim chỉ vào ô "Thưởng" là:', ['3/8', '1/3', '3/5', '5/8'], e3('E-XS-03')),
  Q('C8-OTC-Q10', 3, 'Tung một đồng xu hai lần. Xác suất có ít nhất một lần ngửa là:', ['3/4', '1/2', '1/4', '2/3'], e3('E-XS-02'))
];

/* ------------------------------------------------------------ CHƯƠNG IX */
const CAU_C9 = [
  // C9-LTC1 · Luyện tập chung 1 (Bài 27, 28)
  Q('C9-LTC1-Q01', 1, 'Góc nội tiếp chắn cung 80° có số đo:', ['40°', '80°', '160°', '100°'], e3('E-GNT-01')),
  Q('C9-LTC1-Q02', 1, 'Góc nội tiếp chắn nửa đường tròn có số đo:', ['90°', '180°', '45°', '60°'], e3('E-GNT-02')),
  Q('C9-LTC1-Q03', 2, 'Tâm đường tròn ngoại tiếp tam giác là giao điểm của ba đường:', ['Trung trực', 'Phân giác', 'Trung tuyến', 'Cao'], e3('E-NTT-01')),
  Q('C9-LTC1-Q04', 2, 'Tam giác ABC vuông tại A có cạnh huyền BC = 10 cm. Bán kính đường tròn ngoại tiếp tam giác là:', ['5 cm', '10 cm', '20 cm', '5√2 cm'], e3('E-NTT-02')),
  Q('C9-LTC1-Q05', 2, 'Tâm đường tròn nội tiếp tam giác là giao điểm của ba đường:', ['Phân giác trong', 'Trung trực', 'Trung tuyến', 'Cao'], e3('E-NTT-03')),
  Q('C9-LTC1-Q06', 3, 'Trong một đường tròn, hai góc nội tiếp cùng chắn một cung thì:', ['Bằng nhau', 'Bù nhau', 'Phụ nhau', 'Hơn kém nhau 90°'], e3('E-GNT-02')),
  Q('C9-LTC1-Q07', 3, 'Tam giác đều cạnh 6 cm có bán kính đường tròn ngoại tiếp là:', ['2√3 cm', '√3 cm', '3√3 cm', '6√3 cm'], e3('E-NTT-02')),
  Q('C9-LTC1-Q08', 3, 'Tam giác đều cạnh 6 cm có bán kính đường tròn nội tiếp là:', ['√3 cm', '2√3 cm', '3 cm', '3√3 cm'], e3('E-NTT-02')),
  // C9-LTC2 · Luyện tập chung 2 (Bài 29, 30)
  Q('C9-LTC2-Q01', 1, 'Tứ giác ABCD nội tiếp đường tròn có góc A bằng 70°. Góc C bằng:', ['110°', '70°', '20°', '290°'], e3('E-TGNT-01')),
  Q('C9-LTC2-Q02', 1, 'Hình nào sau đây luôn nội tiếp được một đường tròn?', ['Hình chữ nhật', 'Hình thoi', 'Hình bình hành', 'Hình thang bất kì'], e3('E-TGNT-02')),
  Q('C9-LTC2-Q03', 2, 'Đa giác đều là đa giác có:', ['Tất cả các cạnh bằng nhau và tất cả các góc bằng nhau', 'Tất cả các cạnh bằng nhau', 'Tất cả các góc bằng nhau', 'Ít nhất hai cạnh bằng nhau'], e3('E-DGD-01')),
  Q('C9-LTC2-Q04', 2, 'Mỗi góc của ngũ giác đều bằng:', ['108°', '72°', '120°', '90°'], e3('E-DGD-02')),
  Q('C9-LTC2-Q05', 2, 'Hình vuông cạnh 4 cm nội tiếp một đường tròn. Bán kính đường tròn đó là:', ['2√2 cm', '4√2 cm', '2 cm', '4 cm'], e3('E-TGNT-02')),
  Q('C9-LTC2-Q06', 3, 'Phép quay tâm O biến lục giác đều tâm O thành chính nó có góc quay dương nhỏ nhất là:', ['60°', '120°', '30°', '90°'], e3('E-PQ-02')),
  Q('C9-LTC2-Q07', 3, 'Tổng các góc trong của một bát giác (đa giác 8 cạnh) là:', ['1 080°', '1 440°', '720°', '360°'], e3('E-DGD-02')),
  Q('C9-LTC2-Q08', 3, 'Phép quay tâm O góc 90° biến điểm A thành điểm B. Khi đó:', ['OA = OB và góc AOB = 90°', 'OA = 2OB', 'A và B đối xứng nhau qua O', 'Đường thẳng AB đi qua O'], e3('E-PQ-01')),
  // C9-OTC · Ôn tập cuối chương IX
  Q('C9-OTC-Q01', 1, 'Góc nội tiếp có số đo 35° thì cung bị chắn có số đo:', ['70°', '35°', '17,5°', '145°'], e3('E-GNT-01')),
  Q('C9-OTC-Q02', 1, 'Trong tứ giác nội tiếp, tổng hai góc đối nhau bằng:', ['180°', '90°', '360°', '120°'], e3('E-TGNT-01')),
  Q('C9-OTC-Q03', 1, 'Mỗi góc của lục giác đều bằng:', ['120°', '60°', '108°', '135°'], e3('E-DGD-02')),
  Q('C9-OTC-Q04', 2, 'Tam giác ABC vuông tại A có AB = 6 cm, AC = 8 cm. Bán kính đường tròn ngoại tiếp tam giác là:', ['5 cm', '10 cm', '7 cm', '4 cm'], e3('E-NTT-02')),
  Q('C9-OTC-Q05', 2, 'Cho đường tròn (O) có đường kính AB, điểm C thuộc đường tròn (C khác A, B). Góc ACB bằng:', ['90°', '180°', '60°', '45°'], e3('E-GNT-02')),
  Q('C9-OTC-Q06', 2, 'Đường tròn nội tiếp tam giác là đường tròn:', ['Tiếp xúc với cả ba cạnh của tam giác', 'Đi qua ba đỉnh của tam giác', 'Có tâm là giao ba đường trung trực', 'Có tâm là trọng tâm tam giác'], e3('E-NTT-03')),
  Q('C9-OTC-Q07', 2, 'Tứ giác ABCD nội tiếp đường tròn có góc B bằng 95°, góc C bằng 70°. Góc D bằng:', ['85°', '110°', '95°', '70°'], e3('E-TGNT-01')),
  Q('C9-OTC-Q08', 3, 'Mặt bàn hình lục giác đều cạnh 50 cm đặt vừa trong một khăn tròn sao cho 6 đỉnh nằm trên mép khăn. Bán kính khăn là:', ['50 cm', '25 cm', '100 cm', '50√3 cm'], e3('E-NTT-02')),
  Q('C9-OTC-Q09', 3, 'Phép quay tâm O biến tam giác đều tâm O thành chính nó có góc quay dương nhỏ nhất là:', ['120°', '60°', '90°', '180°'], e3('E-PQ-02')),
  Q('C9-OTC-Q10', 3, 'Tứ giác ABCD nội tiếp đường tròn có góc ADB bằng 40°. Góc ACB bằng:', ['40°', '80°', '140°', '20°'], e3('E-GNT-02'))
];

/* ------------------------------------------------------------ CHƯƠNG X */
const CAU_C10 = [
  // C10-LTC · Luyện tập chung (Bài 31, 32)
  Q('C10-LTC-Q01', 1, 'Hình trụ có bán kính đáy r, chiều cao h. Diện tích xung quanh là:', ['2πrh', 'πrh', 'πr²h', '2πr²h'], e3('E-TRU-01')),
  Q('C10-LTC-Q02', 1, 'Hình nón có bán kính đáy r, chiều cao h. Thể tích là:', ['(1/3)πr²h', 'πr²h', '(1/3)πrh', '2πr²h'], e3('E-NON-02')),
  Q('C10-LTC-Q03', 2, 'Hình trụ có bán kính đáy 3 cm, chiều cao 5 cm. Thể tích là:', ['45π cm³', '15π cm³', '30π cm³', '75π cm³'], e3('E-TRU-02')),
  Q('C10-LTC-Q04', 2, 'Hình nón có bán kính đáy 3 cm, đường sinh 5 cm. Diện tích xung quanh là:', ['15π cm²', '30π cm²', '9π cm²', '45π cm²'], e3('E-NON-01')),
  Q('C10-LTC-Q05', 2, 'Hình nón có bán kính đáy 6 cm, chiều cao 8 cm. Độ dài đường sinh là:', ['10 cm', '14 cm', '√28 cm', '2 cm'], e3('E-NON-01')),
  Q('C10-LTC-Q06', 3, 'Một lon nước hình trụ đường kính đáy 6 cm, cao 12 cm. Thể tích lon là:', ['108π cm³', '432π cm³', '72π cm³', '36π cm³'], e3('E-TRU-02')),
  Q('C10-LTC-Q07', 3, 'Chiếc nón lá có đường kính vành 40 cm, đường sinh 30 cm. Diện tích lá cần lợp (mặt xung quanh) là:', ['600π cm²', '1 200π cm²', '400π cm²', '300π cm²'], e3('E-NON-01')),
  Q('C10-LTC-Q08', 3, 'Hình trụ và hình nón có cùng bán kính đáy và cùng chiều cao. Thể tích hình trụ gấp thể tích hình nón:', ['3 lần', '2 lần', '1,5 lần', '9 lần'], e3('E-NON-02')),
  // C10-OTC · Ôn tập cuối chương X
  Q('C10-OTC-Q01', 1, 'Mặt cầu bán kính R có diện tích là:', ['4πR²', 'πR²', '2πR²', '(4/3)πR³'], e3('E-CAU-01')),
  Q('C10-OTC-Q02', 1, 'Hình cầu bán kính R có thể tích là:', ['(4/3)πR³', '4πR²', '(1/3)πR³', '4πR³'], e3('E-CAU-02')),
  Q('C10-OTC-Q03', 1, 'Hình trụ bán kính đáy r, chiều cao h có thể tích là:', ['πr²h', '2πrh', '(1/3)πr²h', 'πrh'], e3('E-TRU-02')),
  Q('C10-OTC-Q04', 2, 'Quả bóng hình cầu bán kính 10 cm. Diện tích mặt bóng là:', ['400π cm²', '100π cm²', '200π cm²', '4 000π/3 cm²'], e3('E-CAU-01')),
  Q('C10-OTC-Q05', 2, 'Hình cầu có đường kính 6 cm. Thể tích hình cầu là:', ['36π cm³', '288π cm³', '12π cm³', '108π cm³'], e3('E-CAU-02')),
  Q('C10-OTC-Q06', 2, 'Hình trụ bán kính đáy 2 cm, chiều cao 7 cm. Diện tích xung quanh là:', ['28π cm²', '14π cm²', '56π cm²', '36π cm²'], e3('E-TRU-01')),
  Q('C10-OTC-Q07', 2, 'Hình nón bán kính đáy 3 cm, chiều cao 4 cm. Thể tích là:', ['12π cm³', '36π cm³', '4π cm³', '15π cm³'], e3('E-NON-02')),
  Q('C10-OTC-Q08', 3, 'Bồn nước hình trụ bán kính đáy 0,5 m, cao 2 m. Bồn chứa được khoảng (lấy π ≈ 3,14):', ['1,57 m³', '3,14 m³', '6,28 m³', '0,785 m³'], e3('E-TRU-02')),
  Q('C10-OTC-Q09', 3, 'Nếu bán kính hình cầu tăng gấp đôi thì thể tích hình cầu tăng:', ['8 lần', '2 lần', '4 lần', '6 lần'], e3('E-CAU-02')),
  Q('C10-OTC-Q10', 3, 'Cây kem ốc quế gồm phần nón bán kính 2 cm, cao 9 cm. Thể tích phần nón là:', ['12π cm³', '36π cm³', '18π cm³', '6π cm³'], e3('E-NON-02'))
];

const HINH_ON_TAP = {
  // ---------- Chương IV (Luyện tập chung & Ôn tập chương)
  'C4-LTC-Q01': { loai: 'tam-giac-vuong', chuong: 'C4', dinh: ['A', 'B', 'C'], moTa: 'Tam giác ABC vuông tại A.' },
  'C4-LTC-Q04': { loai: 'tam-giac-vuong', chuong: 'C4', dinh: ['A', 'B', 'C'], canh: { huyen: '10 cm', ngang: '?' }, goc: { tren: '30°' }, tyLe: { gocTren: 30 }, moTa: 'Tam giác ABC vuông tại A, BC = 10 cm, góc B = 30°; cần tìm AC.' },
  'C4-LTC-Q06': { loai: 'tam-giac-vuong', chuong: 'C4', dinh: ['A', 'B', 'C'], canh: { tren: '6 cm', ngang: '8 cm' }, tyLe: { tren: 6, ngang: 8 }, moTa: 'Tam giác ABC vuông tại A, AB = 6 cm, AC = 8 cm.' },
  'C4-LTC-Q07': { loai: 'tam-giac-vuong', chuong: 'C4', dinh: ['', '', ''], canh: { huyen: '4 m', ngang: '?' }, goc: { phai: '60°' }, nhanCanh: { tren: 'tường', ngang: 'mặt đất', huyen: 'thang' }, tyLe: { gocPhai: 60 }, moTa: 'Chiếc thang dài 4 m dựa vào tường, tạo với mặt đất góc 60°; cần tìm khoảng cách chân thang đến chân tường.' },
  'C4-LTC-Q08': { loai: 'tam-giac-vuong', chuong: 'C4', dinh: ['A', 'B', 'C'], canh: { tren: '5 cm', huyen: '?' }, goc: { phai: '30°' }, tyLe: { gocPhai: 30 }, moTa: 'Tam giác ABC vuông tại A, AB = 5 cm, góc C = 30°; cần tìm BC.' },
  'C4-OTC-Q03': { loai: 'tam-giac-vuong', chuong: 'C4', dinh: ['A', 'B', 'C'], moTa: 'Tam giác ABC vuông tại A.' },
  'C4-OTC-Q04': { loai: 'tam-giac-vuong', chuong: 'C4', dinh: ['M', 'N', 'P'], canh: { huyen: '8 cm', tren: '?' }, goc: { tren: '60°' }, tyLe: { gocTren: 60 }, moTa: 'Tam giác MNP vuông tại M, NP = 8 cm, góc N = 60°; cần tìm MN.' },
  'C4-OTC-Q05': { loai: 'tam-giac-vuong', chuong: 'C4', dinh: ['A', 'B', 'C'], canh: { ngang: '6 cm', tren: '?' }, goc: { tren: '45°' }, tyLe: { gocTren: 45 }, moTa: 'Tam giác ABC vuông tại A, AC = 6 cm, góc B = 45°; cần tìm AB.' },
  'C4-OTC-Q06': { loai: 'tam-giac-vuong', chuong: 'C4', dinh: ['A', 'B', 'C'], goc: { tren: '35°', phai: '?' }, tyLe: { gocTren: 35 }, moTa: 'Tam giác ABC vuông tại A, góc B = 35°; cần tìm góc C.' },
  'C4-OTC-Q08': { loai: 'tam-giac-vuong', chuong: 'C4', dinh: ['', '', ''], canh: { huyen: '50 m', tren: '?' }, goc: { phai: '30°' }, nhanCanh: { tren: 'độ cao', ngang: 'mặt đất', huyen: 'dây diều' }, tyLe: { gocPhai: 30 }, moTa: 'Dây diều dài 50 m tạo với mặt đất góc 30°; cần tìm độ cao của diều.' },
  'C4-OTC-Q09': { loai: 'tam-giac-vuong', chuong: 'C4', dinh: ['', '', ''], canh: { ngang: '6 m', tren: '?' }, goc: { phai: '60°' }, nhanCanh: { tren: 'cột điện', ngang: 'bóng', huyen: 'tia nắng' }, tyLe: { gocPhai: 60 }, moTa: 'Bóng cột điện dài 6 m, tia nắng tạo với mặt đất góc 60°; cần tìm chiều cao cột điện.' },
  'C4-OTC-Q10': { loai: 'tam-giac-vuong', chuong: 'C4', dinh: ['A', 'B', 'C'], canh: { tren: '3 cm', ngang: '4 cm' }, tyLe: { tren: 3, ngang: 4 }, moTa: 'Tam giác ABC vuông tại A, AB = 3 cm, AC = 4 cm.' },

  // ---------- Chương V (Luyện tập chung & Ôn tập chương; không vẽ câu hỏi vị trí tương đối)
  'C5-LTC1-Q04': { loai: 'duong-tron-day', chuong: 'C5', diem: [{ ten: 'A', goc: 125 }, { ten: 'B', goc: 55 }], doan: [{ tu: 'O', den: 'A' }, { tu: 'O', den: 'B' }], cung: [{ tuGoc: 55, denGoc: 125, cungGoc: true, nhanGoc: '70°', nhanCung: '?', toNhe: true }], moTa: 'Góc ở tâm AOB = 70° chắn cung nhỏ AB.' },
  'C5-LTC1-Q05': { loai: 'quat-vanh-khuyen', chuong: 'C5', kieu: 'cung', R: 6, goc: 60, nhan: { R: '6 cm', goc: '60°', cung: 'l = ?' }, moTa: 'Cung 60° của đường tròn bán kính 6 cm; cần tìm độ dài cung.' },
  'C5-LTC1-Q06': { loai: 'quat-vanh-khuyen', chuong: 'C5', kieu: 'quat', R: 4, goc: 90, veGocVuong: true, nhan: { R: '4 cm', goc: '90°', S: 'S = ?' }, moTa: 'Hình quạt tròn bán kính 4 cm, cung 90°; cần tìm diện tích.' },
  'C5-LTC1-Q07': { loai: 'quat-vanh-khuyen', chuong: 'C5', kieu: 'vanh-khuyen', R: 5, r: 3, nhan: { R: '5 cm', r: '3 cm', S: 'S = ?' }, moTa: 'Hình vành khuyên giới hạn bởi hai đường tròn đồng tâm bán kính 5 cm và 3 cm.' },
  'C5-LTC1-Q08': { loai: 'duong-tron-day', chuong: 'C5', diem: [{ ten: 'A', goc: 157 }, { ten: 'B', goc: 23 }, { ten: 'H', goc: 90, t: 0.39, dx: 10, dy: -8 }], doan: [{ tu: 'O', den: 'A', nhan: '13 cm' }, { tu: 'O', den: 'H', netDut: true, nhan: '5 cm' }, { tu: 'A', den: 'B', chinh: true, nhan: 'AB = ?' }], vuongTai: [{ dinh: 'H', a: 'O', b: 'B' }], moTa: 'Đường tròn (O; 13 cm), dây AB cách O một khoảng 5 cm; cần tìm độ dài dây AB.' },
  'C5-LTC2-Q05': { loai: 'tiep-tuyen', chuong: 'C5', kieu: 'hai', R: 4, OM: 8, diemB: true, veOM: false, hienVuong: true, nhan: { MA: '6 cm', MB: '?' }, moTa: 'Từ M kẻ hai tiếp tuyến MA, MB tới (O) với MA = 6 cm; cần tìm MB.' },
  'C5-LTC2-Q06': { loai: 'tiep-tuyen', chuong: 'C5', kieu: 'mot', R: 5, OM: 13, veOM: true, hienVuong: true, nhan: { R: '5 cm', OM: '13 cm', MA: '?' }, moTa: 'Tiếp tuyến MA của (O; 5 cm) với OM = 13 cm; cần tìm MA.' },
  'C5-LTC2-Q08': { loai: 'tiep-tuyen', chuong: 'C5', kieu: 'hai', R: 4, OM: 8, gocAMB: 60, diemB: true, veOM: false, hienVuong: true, nhan: { goc: '60°', gocTam: '?' }, moTa: 'Hai tiếp tuyến MA, MB tạo góc AMB = 60°; cần tìm góc AOB.' },
  'C5-OTC-Q05': { loai: 'duong-tron-day', chuong: 'C5', diem: [{ ten: 'A', goc: 140 }, { ten: 'B', goc: 40 }], doan: [{ tu: 'O', den: 'A' }, { tu: 'O', den: 'B' }], cung: [{ tuGoc: 40, denGoc: 140, cungGoc: true, nhanGoc: '100°' }, { tuGoc: 40, denGoc: 140, cungLon: true, toNhe: true, cungGoc: false, nhanCung: 'Cung lớn = ?' }], moTa: 'Góc ở tâm AOB = 100°; cần tìm số đo cung lớn AB.' },
  'C5-OTC-Q09': { loai: 'quat-vanh-khuyen', chuong: 'C5', kieu: 'quat', R: 6, goc: 120, nhan: { R: '6 cm', cung: '4π cm', S: '?' }, moTa: 'Hình quạt tròn bán kính 6 cm có độ dài cung 4π cm; cần tìm diện tích hình quạt.' },
  'C5-OTC-Q10': { loai: 'tiep-tuyen', chuong: 'C5', kieu: 'hai', R: 3, OM: 5, diemB: true, veOM: true, hienVuong: true, nhan: { R: '3 cm', OM: '5 cm', MA: '?', MB: '?' }, moTa: 'Từ M kẻ hai tiếp tuyến MA, MB tới (O; 3 cm) với OM = 5 cm; cần tìm MA + MB.' }
};

const ganHinh = (ds) => ds.map((q) => (HINH_ON_TAP[q.id] ? { ...q, hinh: HINH_ON_TAP[q.id] } : q));

export const ON_TAP = {
  C1: { units: [
    LTC('C1', 0, 'C1-B2-M2', [1, 2], 'Vận dụng tổng hợp: nghiệm của phương trình và hệ hai phương trình bậc nhất hai ẩn; giải hệ bằng phương pháp thế và cộng đại số.'),
    OTC('C1', 'C1-B3-M1C', 'Ôn tập Chương I: hệ hai phương trình bậc nhất hai ẩn, cách giải và giải bài toán bằng cách lập hệ phương trình.')
  ], cau: CAU_C1 },
  C2: { units: [
    LTC('C2', 0, 'C2-B5-M2', [4, 5], 'Vận dụng tổng hợp: phương trình tích, phương trình chứa ẩn ở mẫu; bất đẳng thức và tính chất.'),
    OTC('C2', 'C2-B6-M2', 'Ôn tập Chương II: phương trình quy về bậc nhất một ẩn, bất đẳng thức, bất phương trình bậc nhất một ẩn.')
  ], cau: CAU_C2 },
  C3: { units: [
    LTC('C3', 1, 'C3-B8-M2', [7, 8], 'Vận dụng tổng hợp: căn bậc hai, căn thức bậc hai; khai căn với phép nhân và phép chia.'),
    OTC('C3', 'C3-LTC', 'Ôn tập Chương III: căn bậc hai, căn bậc ba và các phép biến đổi, rút gọn biểu thức chứa căn.')
  ], cau: CAU_C3 },
  C4: { units: [
    LTC('C4', 0, 'C4-B12-M3', [11, 12], 'Vận dụng tổng hợp: tỉ số lượng giác của góc nhọn; hệ thức giữa cạnh và góc, giải tam giác vuông.'),
    OTC('C4', 'C4-LTC', 'Ôn tập Chương IV: tỉ số lượng giác, hệ thức lượng trong tam giác vuông và ứng dụng thực tế.')
  ], cau: ganHinh(CAU_C4) },
  C5: { units: [
    LTC('C5', 1, 'C5-B15-M3', [13, 14, 15], 'Vận dụng tổng hợp: đường tròn, cung và dây, độ dài cung, diện tích hình quạt và hình vành khuyên.'),
    LTC('C5', 2, 'C5-B17-M2', [16, 17], 'Vận dụng tổng hợp: vị trí tương đối của đường thẳng và đường tròn, tiếp tuyến; vị trí tương đối của hai đường tròn.'),
    OTC('C5', 'C5-LTC2', 'Ôn tập Chương V: đường tròn, cung, dây, độ dài cung, diện tích hình quạt, tiếp tuyến và vị trí tương đối.')
  ], cau: ganHinh(CAU_C5) },
  C6: { units: [
    LTC('C6', 1, 'C6-B19-M3', [18, 19], 'Vận dụng tổng hợp: hàm số y = ax² và đồ thị; giải phương trình bậc hai một ẩn.'),
    LTC('C6', 2, 'C6-B21-M2', [20, 21], 'Vận dụng tổng hợp: định lí Viète và ứng dụng; giải bài toán bằng cách lập phương trình.'),
    OTC('C6', 'C6-LTC2', 'Ôn tập Chương VI: hàm số y = ax², phương trình bậc hai, định lí Viète, giải bài toán bằng cách lập phương trình.')
  ], cau: CAU_C6 },
  C7: { units: [
    LTC('C7', 0, 'C7-B23-M2', [22, 23], 'Vận dụng tổng hợp: bảng và biểu đồ tần số, tần số tương đối.'),
    OTC('C7', 'C7-B24-M4', 'Ôn tập Chương VII: tần số, tần số tương đối, bảng và biểu đồ ghép nhóm.')
  ], cau: CAU_C7 },
  C8: { units: [
    LTC('C8', 0, 'C8-B26-M2', [25, 26], 'Vận dụng tổng hợp: phép thử, không gian mẫu, xác suất của biến cố.'),
    OTC('C8', 'C8-LTC', 'Ôn tập Chương VIII: không gian mẫu và xác suất của biến cố trong các mô hình đơn giản.')
  ], cau: CAU_C8 },
  C9: { units: [
    LTC('C9', 1, 'C9-B28-M3', [27, 28], 'Vận dụng tổng hợp: góc nội tiếp; đường tròn ngoại tiếp và nội tiếp tam giác.'),
    LTC('C9', 2, 'C9-B30-M4', [29, 30], 'Vận dụng tổng hợp: tứ giác nội tiếp; đa giác đều và phép quay.'),
    OTC('C9', 'C9-LTC2', 'Ôn tập Chương IX: góc nội tiếp, đường tròn ngoại tiếp, nội tiếp, tứ giác nội tiếp, đa giác đều.')
  ], cau: CAU_C9 },
  C10: { units: [
    LTC('C10', 0, 'C10-B32-M2', [31, 32], 'Vận dụng tổng hợp: hình trụ, hình nón, hình cầu: diện tích và thể tích.'),
    OTC('C10', 'C10-LTC', 'Ôn tập Chương X: hình trụ, hình nón, hình cầu và các bài toán thực tế.')
  ], cau: CAU_C10 }
};

/** Mục ôn tập (mới + C3-LTC): id → { loai, phamVi, name }. Web dùng để thay bước video bằng "Tổng hợp kiến thức". */
export const ON_TAP_THEO_MUC = Object.fromEntries([
  ...Object.values(ON_TAP).flatMap((c) => c.units.map((u) => [u.id, { loai: u.onTap, phamVi: u.phamVi, name: u.name }])),
  ...Object.entries(DOI_TEN).map(([id, d]) => [id, { loai: d.onTap, phamVi: d.phamVi, name: d.name }])
]);
export const laOnTap = (ku) => Object.prototype.hasOwnProperty.call(ON_TAP_THEO_MUC, ku);
/** Các mục (theo thứ tự trong chương) nằm trong phạm vi một mục ôn tập; bỏ chính các mục ôn tập. */
export const mucTrongPhamVi = (ku, tatCaMuc) => {
  const p = ON_TAP_THEO_MUC[ku]?.phamVi ?? [];
  return tatCaMuc.filter((id) => !laOnTap(id) && p.some((x) => id.startsWith(x)));
};
