/**
 * TRÒ CHƠI ÔN KIẾN THỨC NỀN — Toán 9 (FlipMath9)
 * ---------------------------------------------------------------------------
 * Mỗi mục kiến thức có MỘT trò chơi chơi trước khi xem video bài mới.
 * Trò chơi chỉ ôn KIẾN THỨC NỀN (Toán 6–8 và các mục Toán 9 đã học trước đó),
 * KHÔNG dạy kiến thức mới của mục.
 *
 * Kiểu trò chơi và dữ liệu:
 *   latThe   Lật thẻ tìm cặp      : cap: 6 × [a, b]                     (a, b có cùng giá trị)
 *   noiCot   Nối dây              : cap: 5 × [trái, phải]
 *   dungSai  Đúng hay sai siêu tốc: cau: 8 × [mệnh đề, true|false, giải thích]
 *   banBong  Bắn bóng bay         : cau: 6 × [hỏi, đúng, sai1, sai2, sai3]
 *   leoNui   Leo núi              : cau: 5 × [hỏi, đúng, sai1, sai2]
 *   dienSo   Mật mã số            : cau: 5 × [hỏi, đáp số, giải thích]
 *   sapXep   Xếp bậc thang        : bai: 2 × { de, buoc: [các bước đúng thứ tự] }
 *   phanLoai Phân loại vào giỏ    : gio: [tên giỏ 0, tên giỏ 1], muc: 8 × [nội dung, 0|1]
 *
 * Viết công thức bằng Unicode (x², √, −, π…); web tự đổi sang LaTeX khi hiển thị.
 */

export const KIEU_TRO_CHOI = {
  latThe: { ten: 'Lật thẻ tìm cặp', bieuTuong: '🃏', cach: 'Lật hai thẻ có cùng giá trị. Tìm đủ các cặp.' },
  noiCot: { ten: 'Nối dây', bieuTuong: '🔗', cach: 'Chọn một ô bên trái rồi chọn ô bên phải hợp với nó.' },
  dungSai: { ten: 'Đúng hay sai siêu tốc', bieuTuong: '⚡', cach: 'Đọc nhanh từng câu rồi bấm Đúng hoặc Sai trước khi hết giờ.' },
  banBong: { ten: 'Bắn bóng bay', bieuTuong: '🎈', cach: 'Bấm vào quả bóng mang đáp án đúng.' },
  leoNui: { ten: 'Leo núi', bieuTuong: '⛰️', cach: 'Mỗi câu đúng đưa bạn nhỏ lên một chặng. Lên tới đỉnh là thắng.' },
  dienSo: { ten: 'Mật mã số', bieuTuong: '🔐', cach: 'Gõ đúng đáp số để mở từng ổ khoá của rương báu.' },
  sapXep: { ten: 'Xếp bậc thang', bieuTuong: '🪜', cach: 'Kéo thả hoặc bấm mũi tên để xếp các bước giải theo đúng thứ tự.' },
  phanLoai: { ten: 'Phân loại vào giỏ', bieuTuong: '🧺', cach: 'Chọn một thẻ rồi bấm vào giỏ đúng của nó.' }
};

const T = (ku, kieu, nen, du) => ({ ku, kieu, nen, ...du });

export const TRO_CHOI_NEN = [
  /* ============================ CHƯƠNG I ============================ */
  T('C1-B1-M1', 'dienSo', 'Toán 7: tính giá trị biểu thức đại số khi thay số.', { cau: [
    ['Tính 2x + 3y khi x = 1, y = 2.', '8', '2·1 + 3·2 = 2 + 6 = 8.'],
    ['Tính x − 4y khi x = 5, y = 1.', '1', '5 − 4·1 = 1.'],
    ['Tính 3x − y khi x = 2, y = −1.', '7', '3·2 − (−1) = 6 + 1 = 7.'],
    ['Giải phương trình 2x − 6 = 0. x = ?', '3', '2x = 6 nên x = 3.'],
    ['Tính 5x + 2y khi x = 0, y = 4.', '8', '5·0 + 2·4 = 8.']
  ] }),
  T('C1-B1-M2', 'noiCot', 'Toán 7–8: toạ độ của một điểm trên mặt phẳng toạ độ.', { cap: [
    ['Điểm (0; 3)', 'nằm trên trục Oy'],
    ['Điểm (2; 0)', 'nằm trên trục Ox'],
    ['Điểm (−1; 2)', 'thuộc góc phần tư thứ II'],
    ['Điểm (3; −1)', 'thuộc góc phần tư thứ IV'],
    ['Điểm (1; 4)', 'thuộc góc phần tư thứ I']
  ] }),
  T('C1-B1-M3', 'dungSai', 'Mục trước: nghiệm của phương trình bậc nhất hai ẩn.', { cau: [
    ['(1; 1) là nghiệm của x + y = 2.', true, '1 + 1 = 2.'],
    ['(2; 0) là nghiệm của x + y = 3.', false, '2 + 0 = 2 ≠ 3.'],
    ['(0; 5) là nghiệm của 2x + y = 5.', true, '2·0 + 5 = 5.'],
    ['(1; 2) là nghiệm của x − y = 1.', false, '1 − 2 = −1 ≠ 1.'],
    ['(3; 1) là nghiệm của x − 2y = 1.', true, '3 − 2·1 = 1.'],
    ['Phương trình x + y = 4 chỉ có một nghiệm.', false, 'Phương trình bậc nhất hai ẩn có vô số nghiệm.'],
    ['(−1; 3) là nghiệm của x + y = 2.', true, '−1 + 3 = 2.'],
    ['(2; 2) là nghiệm của 3x − y = 5.', false, '3·2 − 2 = 4 ≠ 5.']
  ] }),
  T('C1-B2-M1', 'sapXep', 'Toán 8: giải phương trình bậc nhất một ẩn, bỏ dấu ngoặc.', { bai: [
    { de: 'Giải phương trình 2x − 5 = 7.', buoc: ['2x − 5 = 7', '2x = 7 + 5', '2x = 12', 'x = 6'] },
    { de: 'Giải phương trình 3x − 2(x − 1) = 5.', buoc: ['3x − 2(x − 1) = 5', '3x − 2x + 2 = 5', 'x + 2 = 5', 'x = 3'] }
  ] }),
  T('C1-B2-M2', 'latThe', 'Toán 7–8: cộng, trừ đa thức; nhân một số với đa thức.', { cap: [
    ['(2x + y) + (x − y)', '3x'],
    ['(3x + 2y) − (3x − y)', '3y'],
    ['2(x − 3y)', '2x − 6y'],
    ['−(x − y)', '−x + y'],
    ['3(2x + y)', '6x + 3y'],
    ['(x + 4y) − (x + 2y)', '2y']
  ] }),
  T('C1-B3-M1', 'banBong', 'Toán 7–8: viết biểu thức, đẳng thức từ lời văn.', { cau: [
    ['Tổng của x và y bằng 30.', 'x + y = 30', 'xy = 30', 'x − y = 30', 'x = 30y'],
    ['Số x hơn số y là 4 đơn vị.', 'x − y = 4', 'y − x = 4', 'x + y = 4', 'x = 4y'],
    ['Gấp đôi số x thì bằng số y.', '2x = y', 'x = 2y', 'x + 2 = y', 'x² = y'],
    ['3 quyển vở giá x đồng và 2 cái bút giá y đồng hết 40 000 đồng.', '3x + 2y = 40000', '2x + 3y = 40000', '5(x + y) = 40000', '3x · 2y = 40000'],
    ['Một nửa số x.', 'x/2', '2x', 'x − 2', 'x²'],
    ['Số x giảm đi 5 thì bằng số y.', 'x − 5 = y', 'x + 5 = y', '5x = y', 'y − 5 = x']
  ] }),
  T('C1-B3-M1B', 'dienSo', 'Toán 5–7: quãng đường = vận tốc × thời gian; đổi đơn vị thời gian.', { cau: [
    ['Đi trong 3 giờ với vận tốc 40 km/h. Quãng đường dài bao nhiêu km?', '120', 's = v·t = 40·3 = 120 km.'],
    ['Quãng đường 150 km, vận tốc 50 km/h. Đi hết bao nhiêu giờ?', '3', 't = s : v = 150 : 50 = 3 giờ.'],
    ['30 phút bằng bao nhiêu giờ?', '0,5', '30 : 60 = 0,5 giờ.'],
    ['Xuồng đi 20 km/h khi nước yên lặng, dòng nước chảy 3 km/h. Vận tốc xuôi dòng là bao nhiêu km/h?', '23', 'Xuôi dòng: 20 + 3 = 23 km/h.'],
    ['Cũng xuồng đó đi ngược dòng. Vận tốc là bao nhiêu km/h?', '17', 'Ngược dòng: 20 − 3 = 17 km/h.']
  ] }),
  T('C1-B3-M1C', 'noiCot', 'Toán 6: phân số chỉ phần công việc; cộng phân số.', { cap: [
    ['Làm xong công việc trong 4 giờ', 'mỗi giờ làm 1/4 công việc'],
    ['Làm xong công việc trong 6 giờ', 'mỗi giờ làm 1/6 công việc'],
    ['Mỗi giờ làm 1/3 công việc', 'làm xong trong 3 giờ'],
    ['1/4 + 1/4', '1/2'],
    ['1/2 + 1/3', '5/6']
  ] }),

  /* ============================ CHƯƠNG II ============================ */
  T('C2-B4-M1', 'latThe', 'Toán 8: phân tích đa thức thành nhân tử.', { cap: [
    ['x² − 2x', 'x(x − 2)'],
    ['x² − 9', '(x − 3)(x + 3)'],
    ['x² + 6x + 9', '(x + 3)²'],
    ['3x + 6', '3(x + 2)'],
    ['x² − 4x + 4', '(x − 2)²'],
    ['2x² + 4x', '2x(x + 2)']
  ] }),
  T('C2-B4-M2', 'dungSai', 'Toán 8: phân thức đại số, điều kiện xác định, quy đồng mẫu.', { cau: [
    ['Phân thức 1/(x − 2) xác định khi x ≠ 2.', true, 'Mẫu x − 2 ≠ 0 khi x ≠ 2.'],
    ['Phân thức 3/(x + 1) xác định khi x ≠ 1.', false, 'Cần x + 1 ≠ 0, tức x ≠ −1.'],
    ['Mẫu thức chung của 1/x và 1/(x − 1) là x(x − 1).', true, 'Nhân hai mẫu không có nhân tử chung.'],
    ['(x − 1)/(x − 1) = 1 với mọi giá trị của x.', false, 'Chỉ đúng khi x ≠ 1; với x = 1 phân thức không xác định.'],
    ['Phân thức 5/(x² + 1) xác định với mọi giá trị của x.', true, 'x² + 1 ≥ 1 > 0 nên mẫu luôn khác 0.'],
    ['1/2 + 1/x = (x + 2)/(2x) với x ≠ 0.', true, 'Quy đồng mẫu 2x: x/(2x) + 2/(2x).'],
    ['Phân thức x/(x − 3) bằng 0 khi x = 3.', false, 'Khi x = 3 mẫu bằng 0, phân thức không xác định. Phân thức bằng 0 khi x = 0.'],
    ['Nhân hai vế của một đẳng thức với cùng một số khác 0 thì được đẳng thức mới.', true, 'Đó là quy tắc nhân của đẳng thức.']
  ] }),
  T('C2-B5-M1', 'leoNui', 'Toán 6–7: so sánh số nguyên, phân số, số thập phân.', { cau: [
    ['So sánh −3 và −5.', '−3 > −5', '−3 < −5', '−3 = −5'],
    ['So sánh 1/2 và 0,5.', '1/2 = 0,5', '1/2 > 0,5', '1/2 < 0,5'],
    ['So sánh −1/3 và −1/4.', '−1/3 < −1/4', '−1/3 > −1/4', '−1/3 = −1/4'],
    ['So sánh 0 và −7.', '0 > −7', '0 < −7', '0 = −7'],
    ['So sánh 2,5 và 5/2.', '2,5 = 5/2', '2,5 > 5/2', '2,5 < 5/2']
  ] }),
  T('C2-B5-M2', 'dungSai', 'Toán 6: nhân số nguyên, quy tắc dấu.', { cau: [
    ['(−2) · 3 = −6.', true, 'Âm nhân dương được âm.'],
    ['(−4) · (−5) = −20.', false, 'Âm nhân âm được dương: 20.'],
    ['Nếu a > 0 thì −a < 0.', true, 'Số đối của số dương là số âm.'],
    ['(−1) · (−1) · (−1) = 1.', false, 'Có ba thừa số âm nên tích âm: −1.'],
    ['Mọi số âm đều nhỏ hơn mọi số dương.', true, 'Trên trục số, số âm nằm bên trái số 0, số dương nằm bên phải.'],
    ['−7 > −2.', false, '−7 nằm bên trái −2 nên −7 < −2.'],
    ['0 · (−9) = 0.', true, 'Số nào nhân với 0 cũng bằng 0.'],
    ['−a luôn là số âm.', false, 'Nếu a âm thì −a dương, ví dụ a = −3 thì −a = 3.']
  ] }),
  T('C2-B6-M1', 'phanLoai', 'Toán 8: nhận biết phương trình bậc nhất một ẩn ax + b = 0 (a ≠ 0).', { gio: ['Phương trình bậc nhất một ẩn', 'Không phải'], muc: [
    ['2x − 1 = 0', 0], ['x² + 1 = 0', 1], ['0x + 3 = 0', 1], ['−x + 5 = 0', 0],
    ['1/x + 2 = 0', 1], ['3x = 0', 0], ['x + y = 1', 1], ['x/2 − 4 = 0', 0]
  ] }),
  T('C2-B6-M2', 'sapXep', 'Toán 8: giải phương trình bậc nhất một ẩn bằng chuyển vế.', { bai: [
    { de: 'Giải phương trình 3x + 4 = 10.', buoc: ['3x + 4 = 10', '3x = 10 − 4', '3x = 6', 'x = 2'] },
    { de: 'Giải phương trình 5 − 2x = 11.', buoc: ['5 − 2x = 11', '−2x = 11 − 5', '−2x = 6', 'x = −3'] }
  ] }),

  /* ============================ CHƯƠNG III ============================ */
  T('C3-B7-M1', 'latThe', 'Toán 6–7: luỹ thừa bậc hai (bình phương).', { cap: [
    ['3²', '9'], ['(−4)²', '16'], ['0,5²', '0,25'], ['(2/3)²', '4/9'], ['11²', '121'], ['1,2²', '1,44']
  ] }),
  T('C3-B7-M2', 'noiCot', 'Toán 7: giá trị tuyệt đối.', { cap: [
    ['|−5|', '5'], ['|3 − 7|', '4'], ['|0|', '0'], ['|−2,5|', '2,5'], ['|x| với x < 0', '−x']
  ] }),
  T('C3-B8-M1', 'banBong', 'Toán 6–7: số chính phương, căn bậc hai số học của số chính phương.', { cau: [
    ['Số nào là số chính phương?', '49', '50', '27', '12'],
    ['12 = 4 · ?', '3', '8', '2', '6'],
    ['√16 = ?', '4', '8', '−4', '16'],
    ['(2 · 3)² = ?', '36', '12', '13', '18'],
    ['25 · 4 = ?', '100', '29', '90', '45'],
    ['Số chính phương lớn nhất nhỏ hơn 50 là:', '49', '48', '36', '25']
  ] }),
  T('C3-B8-M2', 'latThe', 'Toán 6: rút gọn phân số, đổi số thập phân ra phân số.', { cap: [
    ['12/27', '4/9'], ['50/2', '25'], ['18/8', '9/4'], ['0,09', '9/100'], ['48/3', '16'], ['8/50', '4/25']
  ] }),
  T('C3-B9-M1', 'noiCot', 'Toán 6: viết một số thành tích của một số chính phương với một số khác.', { cap: [
    ['12', '4 · 3'], ['18', '9 · 2'], ['50', '25 · 2'], ['75', '25 · 3'], ['45', '9 · 5']
  ] }),
  T('C3-B9-M1B', 'dienSo', 'Toán 6–7: bình phương rồi nhân.', { cau: [
    ['2² · 3 = ?', '12', '4 · 3 = 12.'],
    ['3² · 2 = ?', '18', '9 · 2 = 18.'],
    ['5² · 2 = ?', '50', '25 · 2 = 50.'],
    ['(−2)² = ?', '4', 'Bình phương của số âm là số dương.'],
    ['4² · 5 = ?', '80', '16 · 5 = 80.']
  ] }),
  T('C3-B9-M2', 'latThe', 'Toán 8: hằng đẳng thức hiệu hai bình phương; (√a)² = a.', { cap: [
    ['(a − b)(a + b)', 'a² − b²'], ['√3 · √3', '3'], ['(√5)²', '5'], ['(x + 2)(x − 2)', 'x² − 4'], ['(3 − 1)(3 + 1)', '8'], ['2 · √2 · √2', '4']
  ] }),
  T('C3-B9-M2B', 'dungSai', 'Toán 8 và mục trước: hiệu hai bình phương với căn thức.', { cau: [
    ['(√5 − √3)(√5 + √3) = 2.', true, '5 − 3 = 2.'],
    ['(√7 + √2)(√7 − √2) = 5.', true, '7 − 2 = 5.'],
    ['√2 + √3 = √5.', false, 'Căn của một tổng không bằng tổng các căn.'],
    ['(√6 − √2)(√6 + √2) = 4.', true, '6 − 2 = 4.'],
    ['√8 − √2 = √6.', false, '√8 − √2 = 2√2 − √2 = √2.'],
    ['(1 + √2)(1 − √2) = 1.', false, '1 − 2 = −1.'],
    ['(√a)² = a với mọi a ≥ 0.', true, 'Đó là định nghĩa căn bậc hai số học.'],
    ['(√3 + 1)(√3 − 1) = 2.', true, '3 − 1 = 2.']
  ] }),
  T('C3-B9-M3', 'phanLoai', 'Mục trước: căn thức đồng dạng (cùng biểu thức dưới dấu căn).', { gio: ['Đồng dạng với 2√3', 'Không đồng dạng'], muc: [
    ['5√3', 0], ['−√3', 0], ['3√2', 1], ['√6', 1], ['7√3', 0], ['2√5', 1], ['3', 1], ['√3/2', 0]
  ] }),
  T('C3-B10-M1', 'latThe', 'Toán 6–7: luỹ thừa bậc ba (lập phương).', { cap: [
    ['2³', '8'], ['(−3)³', '−27'], ['4³', '64'], ['(−1)³', '−1'], ['5³', '125'], ['0,1³', '0,001']
  ] }),
  T('C3-B10-M2', 'dungSai', 'Mục trước: căn bậc ba của một số.', { cau: [
    ['∛8 = 2.', true, '2³ = 8.'],
    ['∛(−27) = −3.', true, '(−3)³ = −27.'],
    ['Số âm không có căn bậc ba.', false, 'Mọi số thực đều có đúng một căn bậc ba.'],
    ['∛64 = 8.', false, '4³ = 64 nên ∛64 = 4.'],
    ['∛1 = 1.', true, '1³ = 1.'],
    ['∛0 = 0.', true, '0³ = 0.'],
    ['∛(−8) = 2.', false, '(−2)³ = −8 nên ∛(−8) = −2.'],
    ['(∛5)³ = 5.', true, 'Lập phương của căn bậc ba trả lại số ban đầu.']
  ] }),
  T('C3-LTC', 'banBong', 'Các mục đã học của Chương III.', { cau: [
    ['√49 = ?', '7', '−7', '24,5', '49'],
    ['∛(−125) = ?', '−5', '5', 'Không có', '−25'],
    ['√(3²) = ?', '3', '9', '−3', '6'],
    ['√((−6)²) = ?', '6', '−6', '36', '12'],
    ['√2 · √8 = ?', '4', '√10', '16', '2√2'],
    ['√50 : √2 = ?', '5', '25', '√48', '2,5']
  ] }),

  /* ============================ CHƯƠNG IV ============================ */
  T('C4-B11-M1', 'dienSo', 'Toán 7–8: định lí Pythagore; tổng ba góc của tam giác.', { cau: [
    ['Tam giác vuông có hai cạnh góc vuông 3 và 4. Cạnh huyền bằng?', '5', '3² + 4² = 25 = 5².'],
    ['Hai cạnh góc vuông 6 và 8. Cạnh huyền bằng?', '10', '36 + 64 = 100 = 10².'],
    ['Cạnh huyền 13, một cạnh góc vuông 5. Cạnh góc vuông còn lại?', '12', '169 − 25 = 144 = 12².'],
    ['Tam giác vuông có một góc nhọn 30°. Góc nhọn còn lại bằng bao nhiêu độ?', '60', 'Hai góc nhọn của tam giác vuông có tổng 90°.'],
    ['Cạnh huyền 10, một cạnh góc vuông 6. Cạnh còn lại?', '8', '100 − 36 = 64 = 8².']
  ] }),
  T('C4-B11-M2', 'dungSai', 'Toán 7–8: tam giác đều, tam giác vuông cân; mục trước: định nghĩa tỉ số lượng giác.', { cau: [
    ['Tam giác vuông cân có hai góc nhọn bằng 45°.', true, '(180° − 90°) : 2 = 45°.'],
    ['Mỗi góc của tam giác đều bằng 60°.', true, '180° : 3 = 60°.'],
    ['Trong tam giác vuông có góc 30°, cạnh đối diện góc 30° bằng nửa cạnh huyền.', true, 'Tam giác đó là nửa tam giác đều.'],
    ['Đường chéo hình vuông cạnh 1 bằng 2.', false, 'Theo Pythagore, đường chéo bằng √2.'],
    ['Đường cao của tam giác đều cạnh 2 bằng √3.', true, '2² − 1² = 3.'],
    ['Tổng ba góc của một tam giác bằng 360°.', false, 'Tổng ba góc của tam giác bằng 180°.'],
    ['sin của góc nhọn bằng cạnh kề chia cạnh huyền.', false, 'Cạnh kề chia cạnh huyền là cos; sin là cạnh đối chia cạnh huyền.'],
    ['tan của góc nhọn bằng cạnh đối chia cạnh kề.', true, 'Đúng định nghĩa.']
  ] }),
  T('C4-B11-M3', 'latThe', 'Toán 7: hai góc phụ nhau có tổng 90°.', { cap: [
    ['30°', '60°'], ['25°', '65°'], ['40°', '50°'], ['15°', '75°'], ['10°', '80°'], ['38°', '52°']
  ] }),
  T('C4-B12-M1', 'banBong', 'Mục trước: sin, cos trong tam giác ABC vuông tại A.', { cau: [
    ['Tam giác ABC vuông tại A. Cạnh huyền là:', 'BC', 'AB', 'AC', 'AH'],
    ['Cạnh đối diện với góc B là:', 'AC', 'AB', 'BC', 'CA + AB'],
    ['sin B = ?', 'AC/BC', 'AB/BC', 'AC/AB', 'BC/AC'],
    ['cos B = ?', 'AB/BC', 'AC/BC', 'AB/AC', 'BC/AB'],
    ['sin 30° = ?', '1/2', '√3/2', '√2/2', '1'],
    ['cos 30° = ?', '√3/2', '1/2', '√3', '√2/2']
  ] }),
  T('C4-B12-M2', 'noiCot', 'Mục trước: tan, cot trong tam giác ABC vuông tại A và giá trị đặc biệt.', { cap: [
    ['tan B', 'AC/AB'], ['cot B', 'AB/AC'], ['tan 45°', '1'], ['tan 60°', '√3'], ['cot 60°', '√3/3']
  ] }),
  T('C4-B12-M3', 'sapXep', 'Toán 7: tổng ba góc của tam giác; làm tròn số thập phân.', { bai: [
    { de: 'Tam giác ABC vuông tại A có góc B = 35°. Tìm góc C.', buoc: ['A + B + C = 180°', '90° + 35° + C = 180°', 'C = 180° − 125°', 'C = 55°'] },
    { de: 'Làm tròn 2,347 đến hàng phần trăm.', buoc: ['Chữ số hàng phần nghìn là 7', '7 ≥ 5 nên cộng thêm 1 vào chữ số hàng phần trăm', 'Bỏ các chữ số sau hàng phần trăm', '2,347 ≈ 2,35'] }
  ] }),

  /* ============================ CHƯƠNG V ============================ */
  T('C5-B13-M1', 'dienSo', 'Toán 6: đường tròn, tâm, bán kính, đường kính.', { cau: [
    ['Đường tròn có đường kính 10 cm. Bán kính bằng bao nhiêu cm?', '5', 'Bán kính bằng nửa đường kính.'],
    ['Bán kính 3,5 cm. Đường kính bằng bao nhiêu cm?', '7', 'Đường kính bằng hai lần bán kính.'],
    ['Điểm A nằm trên đường tròn tâm O bán kính 6 cm. OA bằng bao nhiêu cm?', '6', 'Mọi điểm trên đường tròn cách tâm một khoảng bằng bán kính.'],
    ['Mở compa 2 cm để vẽ đường tròn. Đường kính bằng bao nhiêu cm?', '4', 'Độ mở compa là bán kính; đường kính gấp đôi.'],
    ['Đường kính 9 cm. Bán kính bằng bao nhiêu cm?', '4,5', '9 : 2 = 4,5.']
  ] }),
  T('C5-B13-M2', 'phanLoai', 'Toán 6: hình có tâm đối xứng.', { gio: ['Có tâm đối xứng', 'Không có tâm đối xứng'], muc: [
    ['Hình vuông', 0], ['Hình chữ nhật', 0], ['Tam giác đều', 1], ['Hình bình hành', 0],
    ['Hình thang cân', 1], ['Hình thoi', 0], ['Chữ cái A', 1], ['Chữ cái H', 0]
  ] }),
  T('C5-B14-M1', 'dienSo', 'Toán 8: định lí Pythagore; Toán 6: trung điểm đoạn thẳng.', { cau: [
    ['Tam giác vuông có hai cạnh góc vuông 6 và 8. Cạnh huyền?', '10', '36 + 64 = 100.'],
    ['Cạnh huyền 5, một cạnh góc vuông 3. Cạnh còn lại?', '4', '25 − 9 = 16.'],
    ['Đoạn AB dài 8 cm, M là trung điểm. AM bằng bao nhiêu cm?', '4', 'Trung điểm chia đôi đoạn thẳng.'],
    ['Cạnh huyền 13, một cạnh góc vuông 12. Cạnh còn lại?', '5', '169 − 144 = 25.'],
    ['Đoạn CD dài 10 cm, H là trung điểm. CH bằng bao nhiêu cm?', '5', '10 : 2 = 5.']
  ] }),
  T('C5-B14-M2', 'leoNui', 'Toán 6: góc và số đo góc.', { cau: [
    ['Góc bẹt bằng bao nhiêu độ?', '180°', '90°', '360°'],
    ['Góc vuông bằng bao nhiêu độ?', '90°', '180°', '45°'],
    ['Quay đủ một vòng là bao nhiêu độ?', '360°', '180°', '100°'],
    ['Góc 120° là góc gì?', 'Góc tù', 'Góc nhọn', 'Góc vuông'],
    ['Góc 45° là góc gì?', 'Góc nhọn', 'Góc tù', 'Góc bẹt']
  ] }),
  T('C5-B14-M3', 'dienSo', 'Mục trước: góc ở tâm và cung; cộng, trừ số đo góc.', { cau: [
    ['360° − 120° = ? (độ)', '240', 'Phép trừ số đo góc.'],
    ['Góc ở tâm bằng 70°. Cung nhỏ bị chắn bằng bao nhiêu độ?', '70', 'Số đo cung nhỏ bằng số đo góc ở tâm chắn cung đó.'],
    ['50° + 80° = ? (độ)', '130', 'Phép cộng số đo góc.'],
    ['Cung nhỏ AB bằng 100°. Cung lớn AB bằng bao nhiêu độ?', '260', '360° − 100° = 260°.'],
    ['Nửa đường tròn có số đo bao nhiêu độ?', '180', 'Nửa của 360°.']
  ] }),
  T('C5-B15-M1', 'dienSo', 'Toán 6–7: chu vi hình tròn C = 2πR = πd; phân số của 360°.', { cau: [
    ['Chu vi đường tròn bán kính 5 là ?π. Điền số.', '10', 'C = 2π·5 = 10π.'],
    ['Chu vi đường tròn đường kính 8 là ?π. Điền số.', '8', 'C = πd = 8π.'],
    ['1/4 của 360° là bao nhiêu độ?', '90', '360 : 4 = 90.'],
    ['120/360 rút gọn bằng 1/? . Điền số.', '3', '120/360 = 1/3.'],
    ['Chu vi đường tròn là 12π. Bán kính bằng bao nhiêu?', '6', '2πR = 12π nên R = 6.']
  ] }),
  T('C5-B15-M2', 'latThe', 'Toán 6–7: diện tích hình tròn S = πR².', { cap: [
    ['Hình tròn R = 3', '9π'], ['Hình tròn R = 5', '25π'], ['Hình tròn R = 1', 'π'],
    ['Nửa hình tròn R = 2', '2π'], ['1/4 hình tròn R = 4', '4π'], ['Hình tròn R = 10', '100π']
  ] }),
  T('C5-B15-M3', 'leoNui', 'Toán 6–8: hiệu hai bình phương, hiệu hai diện tích.', { cau: [
    ['5² − 3² = ?', '16', '4', '2'],
    ['25π − 9π = ?', '16π', '16', '34π'],
    ['6² − 4² = ?', '20', '4', '52'],
    ['10² − 8² = ?', '36', '4', '2'],
    ['4² − 1² = ?', '15', '9', '3']
  ] }),
  T('C5-B16-M1', 'dungSai', 'Toán 7: khoảng cách từ một điểm đến đường thẳng; đường vuông góc và đường xiên.', { cau: [
    ['Khoảng cách từ một điểm đến một đường thẳng là độ dài đường vuông góc kẻ từ điểm đó.', true, 'Đúng định nghĩa.'],
    ['Đường vuông góc ngắn hơn mọi đường xiên kẻ từ cùng một điểm.', true, 'Quan hệ giữa đường vuông góc và đường xiên.'],
    ['Đường xiên ngắn hơn đường vuông góc.', false, 'Ngược lại: đường vuông góc là ngắn nhất.'],
    ['Mọi điểm trên đường tròn cách tâm một khoảng bằng bán kính.', true, 'Đúng định nghĩa đường tròn.'],
    ['Khoảng cách từ một điểm nằm trên đường thẳng đến chính đường thẳng đó bằng 1.', false, 'Bằng 0.'],
    ['Điểm M nằm trong đường tròn (O; R) thì OM < R.', true, 'Đã học ở Bài 13.'],
    ['Đường kính dài gấp ba lần bán kính.', false, 'Đường kính gấp đôi bán kính.'],
    ['Hai đường thẳng vuông góc tạo thành bốn góc vuông.', true, 'Mỗi góc bằng 90°.']
  ] }),
  T('C5-B16-M2', 'banBong', 'Toán 8: định lí Pythagore trong tam giác OAM vuông tại A.', { cau: [
    ['OA = 3, OM = 5. Tính AM.', '4', '2', '8', '√34'],
    ['OA = 5, AM = 12. Tính OM.', '13', '17', '7', '√119'],
    ['OA = 6, OM = 10. Tính AM.', '8', '4', '16', '√136'],
    ['8² + 6² = ?', '100', '14', '48', '28'],
    ['Trong tam giác vuông, cạnh huyền đối diện với góc:', 'vuông', 'nhọn lớn hơn', 'nhọn nhỏ hơn', 'bất kì'],
    ['Hai đường thẳng vuông góc tạo với nhau góc:', '90°', '180°', '45°', '60°']
  ] }),
  T('C5-B16-M3', 'noiCot', 'Toán 7: tam giác cân, tia phân giác, đường trung trực, tam giác vuông bằng nhau.', { cap: [
    ['Đường trung trực của đoạn AB', 'vuông góc với AB tại trung điểm'],
    ['Tia phân giác của một góc', 'chia góc thành hai góc bằng nhau'],
    ['Hai tam giác vuông bằng nhau khi', 'có cạnh huyền và một cạnh góc vuông bằng nhau'],
    ['Tam giác cân', 'có hai cạnh bằng nhau'],
    ['Điểm nằm trên trung trực của AB', 'cách đều A và B']
  ] }),
  T('C5-B17-M1', 'dungSai', 'Bài 13, 16: đường tròn, đối xứng, vị trí của đường thẳng và đường tròn.', { cau: [
    ['Đường thẳng và đường tròn có nhiều nhất 2 điểm chung.', true, 'Cắt nhau thì có 2 điểm chung.'],
    ['Tiếp tuyến có đúng một điểm chung với đường tròn.', true, 'Điểm chung đó là tiếp điểm.'],
    ['Đường thẳng không giao đường tròn khi d < R.', false, 'Khi d < R đường thẳng cắt đường tròn; không giao khi d > R.'],
    ['Mỗi đường thẳng đi qua tâm là một trục đối xứng của đường tròn.', true, 'Đường tròn có vô số trục đối xứng.'],
    ['d = R thì đường thẳng cắt đường tròn tại 2 điểm.', false, 'd = R thì đường thẳng tiếp xúc với đường tròn.'],
    ['Tâm là tâm đối xứng của đường tròn.', true, 'Đã học ở Bài 13.'],
    ['Một đường tròn có đúng 2 trục đối xứng.', false, 'Có vô số trục đối xứng.'],
    ['Tiếp tuyến vuông góc với bán kính đi qua tiếp điểm.', true, 'Tính chất của tiếp tuyến.']
  ] }),
  T('C5-B17-M2', 'leoNui', 'Toán 6: cộng, trừ, so sánh số.', { cau: [
    ['R = 5, r = 3. R + r = ?', '8', '2', '15'],
    ['R = 5, r = 3. R − r = ?', '2', '8', '−2'],
    ['So sánh 7 và 8.', '7 < 8', '7 > 8', '7 = 8'],
    ['R = 6, r = 4. R + r = ?', '10', '2', '24'],
    ['So sánh 2 và 6 − 4.', '2 = 6 − 4', '2 < 6 − 4', '2 > 6 − 4']
  ] }),

  /* ============================ CHƯƠNG VI ============================ */
  T('C6-B18-M1', 'dienSo', 'Toán 7–8: tính giá trị của biểu thức, luỹ thừa của số âm.', { cau: [
    ['Tính 2x² khi x = 3.', '18', '2 · 9 = 18.'],
    ['Tính −x² khi x = 2.', '−4', '−(2²) = −4.'],
    ['(−3)² = ?', '9', 'Bình phương của số âm là số dương.'],
    ['Tính x²/2 khi x = 4.', '8', '16 : 2 = 8.'],
    ['Tính 3x² khi x = −1.', '3', '3 · 1 = 3.']
  ] }),
  T('C6-B18-M2', 'noiCot', 'Toán 7–8: toạ độ điểm; điểm đối xứng qua trục Oy.', { cap: [
    ['Điểm đối xứng với (2; 4) qua Oy', '(−2; 4)'],
    ['Điểm đối xứng với (−1; 3) qua Oy', '(1; 3)'],
    ['Một điểm nằm trên trục Ox', '(5; 0)'],
    ['Gốc toạ độ O', '(0; 0)'],
    ['Một điểm nằm phía dưới trục Ox', '(1; −2)']
  ] }),
  T('C6-B19-M1', 'sapXep', 'Chương II: phương trình tích; Toán 8: đặt nhân tử chung.', { bai: [
    { de: 'Giải phương trình x² − 4x = 0.', buoc: ['x² − 4x = 0', 'x(x − 4) = 0', 'x = 0 hoặc x − 4 = 0', 'x = 0 hoặc x = 4'] },
    { de: 'Giải phương trình x² − 9 = 0.', buoc: ['x² − 9 = 0', '(x − 3)(x + 3) = 0', 'x − 3 = 0 hoặc x + 3 = 0', 'x = 3 hoặc x = −3'] }
  ] }),
  T('C6-B19-M2', 'dienSo', 'Toán 7: tính giá trị biểu thức b² − 4ac; căn bậc hai số học.', { cau: [
    ['a = 1, b = 5, c = 6. Tính b² − 4ac.', '1', '25 − 24 = 1.'],
    ['a = 2, b = 3, c = 1. Tính b² − 4ac.', '1', '9 − 8 = 1.'],
    ['a = 1, b = −4, c = 4. Tính b² − 4ac.', '0', '16 − 16 = 0.'],
    ['√25 = ?', '5', '5² = 25.'],
    ['a = 1, b = 2, c = 5. Tính b² − 4ac.', '−16', '4 − 20 = −16.']
  ] }),
  T('C6-B19-M3', 'latThe', 'Toán 6: chia đôi một số (b = 2b′).', { cap: [
    ['b = 6', 'b′ = 3'], ['b = −8', 'b′ = −4'], ['b = 10', 'b′ = 5'], ['b = 2√3', 'b′ = √3'], ['b = −2', 'b′ = −1'], ['b = 14', 'b′ = 7']
  ] }),
  T('C6-B20-M1', 'banBong', 'Bài 19: điều kiện có nghiệm; Toán 7: tính −b/a, c/a; Toán 8: hằng đẳng thức.', { cau: [
    ['a = 2, b = −6. Tính −b/a.', '3', '−3', '−12', '4'],
    ['a = 1, c = −5. Tính c/a.', '−5', '5', '−1/5', '−6'],
    ['S = 5, P = 6. Tính S² − 2P.', '13', '19', '37', '−1'],
    ['Phương trình bậc hai có nghiệm khi:', 'Δ ≥ 0', 'Δ < 0', 'a > 0', 'c ≠ 0'],
    ['a = 3, b = 9. Tính −b/a.', '−3', '3', '−27', '6'],
    ['a = 4, c = 2. Tính c/a.', '1/2', '2', '8', '6']
  ] }),
  T('C6-B20-M2', 'dienSo', 'Toán 7: tính tổng các hệ số a + b + c và a − b + c.', { cau: [
    ['2x² − 5x + 3. Tính a + b + c.', '0', '2 − 5 + 3 = 0.'],
    ['x² + 4x + 3. Tính a − b + c.', '0', '1 − 4 + 3 = 0.'],
    ['x² + x + 1. Tính a + b + c.', '3', '1 + 1 + 1 = 3.'],
    ['3x² − 7x + 4. Tính a + b + c.', '0', '3 − 7 + 4 = 0.'],
    ['2x² + 3x − 1. Tính a − b + c.', '−2', '2 − 3 − 1 = −2.']
  ] }),
  T('C6-B20-M3', 'leoNui', 'Toán 6: tổng và tích của hai số.', { cau: [
    ['Hai số 2 và 3 có tổng bằng?', '5', '6', '1'],
    ['Hai số 2 và 3 có tích bằng?', '6', '5', '23'],
    ['Hai số có tổng 7 và tích 10 là:', '2 và 5', '3 và 4', '1 và 10'],
    ['Hai số −1 và 4 có tích bằng?', '−4', '3', '4'],
    ['Hai số có tổng 0 và tích −9 là:', '3 và −3', '9 và −1', '−3 và −3']
  ] }),
  T('C6-B21-M1', 'banBong', 'Toán 6–8: biểu thị đại lượng bằng biểu thức chứa ẩn.', { cau: [
    ['Chiều rộng x m, chiều dài hơn chiều rộng 3 m. Chiều dài là:', 'x + 3', '3x', 'x − 3', 'x/3'],
    ['Diện tích hình chữ nhật dài a, rộng b là:', 'ab', 'a + b', '2(a + b)', 'a²b'],
    ['Số tự nhiên liền sau x là:', 'x + 1', 'x − 1', '2x', 'x²'],
    ['Tích của hai số tự nhiên liên tiếp x và x + 1 là:', 'x(x + 1)', 'x + x + 1', '2x + 1', 'x² + 1 + x + 1'],
    ['Chu vi hình chữ nhật dài x + 3, rộng x là:', '2(2x + 3)', 'x(x + 3)', '2x + 3', '4x + 3'],
    ['Số chẵn liền sau số chẵn x là:', 'x + 2', 'x + 1', '2x', 'x − 2']
  ] }),
  T('C6-B21-M2', 'noiCot', 'Chương I–II: thời gian = quãng đường : vận tốc; năng suất; điều kiện xác định.', { cap: [
    ['Quãng đường 120 km, vận tốc x km/h', 'thời gian 120/x giờ'],
    ['Làm xong việc trong x giờ', 'mỗi giờ làm 1/x công việc'],
    ['Xuồng x km/h, nước 2 km/h, đi xuôi dòng', 'vận tốc x + 2'],
    ['Xuồng x km/h, nước 2 km/h, đi ngược dòng', 'vận tốc x − 2'],
    ['Điều kiện để 1/x có nghĩa', 'x ≠ 0']
  ] }),

  /* ============================ CHƯƠNG VII ============================ */
  T('C7-B22-M1', 'dienSo', 'Toán 6–7: thu thập, kiểm đếm dữ liệu. Điểm của 6 bạn: 7, 8, 7, 9, 7, 8.', { cau: [
    ['Điểm: 7, 8, 7, 9, 7, 8. Có bao nhiêu bạn được 7 điểm?', '3', 'Đếm số 7: ba lần.'],
    ['Có bao nhiêu bạn được 8 điểm?', '2', 'Đếm số 8: hai lần.'],
    ['Danh sách có bao nhiêu bạn?', '6', 'Có 6 số liệu.'],
    ['Điểm cao nhất là?', '9', 'Số lớn nhất trong danh sách.'],
    ['Có bao nhiêu mức điểm khác nhau?', '3', 'Gồm 7, 8, 9.']
  ] }),
  T('C7-B22-M2', 'dungSai', 'Toán 6–7: biểu đồ tranh, biểu đồ cột, biểu đồ đoạn thẳng.', { cau: [
    ['Trong biểu đồ cột, chiều cao của cột biểu diễn số lượng.', true, 'Cột càng cao số lượng càng lớn.'],
    ['Cột cao hơn biểu diễn số lượng ít hơn.', false, 'Ngược lại.'],
    ['Các cột trong một biểu đồ cột có độ rộng bằng nhau.', true, 'Chỉ chiều cao thay đổi.'],
    ['Biểu đồ cần có tên biểu đồ.', true, 'Tên cho biết biểu đồ nói về điều gì.'],
    ['Biểu đồ đoạn thẳng nối các điểm liên tiếp bằng đoạn thẳng.', true, 'Đúng như tên gọi.'],
    ['Biểu đồ tranh dùng biểu tượng để biểu diễn số lượng.', true, 'Mỗi biểu tượng ứng với một số lượng.'],
    ['Biểu đồ cột không cần ghi đơn vị trên trục đứng.', false, 'Cần ghi để đọc đúng số liệu.'],
    ['Có thể đọc số liệu từ biểu đồ cột bằng cách dóng đỉnh cột sang trục đứng.', true, 'Đó là cách đọc biểu đồ cột.']
  ] }),
  T('C7-B23-M1', 'latThe', 'Toán 6: tỉ số phần trăm.', { cap: [
    ['1/2', '50%'], ['1/4', '25%'], ['3/4', '75%'], ['1/5', '20%'], ['3/10', '30%'], ['2/25', '8%']
  ] }),
  T('C7-B23-M2', 'dienSo', 'Toán 6–7: tỉ số phần trăm của một số; biểu đồ hình quạt tròn.', { cau: [
    ['25% của 360° là bao nhiêu độ?', '90', '360 · 25 : 100 = 90.'],
    ['50% của 360° là bao nhiêu độ?', '180', 'Một nửa của 360°.'],
    ['10% của 360° là bao nhiêu độ?', '36', '360 : 10 = 36.'],
    ['20% của 360° là bao nhiêu độ?', '72', '360 · 20 : 100 = 72.'],
    ['Tổng các phần trong một biểu đồ hình quạt tròn bằng bao nhiêu phần trăm?', '100', 'Cả hình tròn là 100%.']
  ] }),
  T('C7-B24-M1', 'dienSo', 'Toán 6–7: trung bình cộng của hai số; hiệu hai số.', { cau: [
    ['Số chính giữa 10 và 20 (trung bình cộng) là?', '15', '(10 + 20) : 2 = 15.'],
    ['(150 + 155) : 2 = ?', '152,5', '305 : 2 = 152,5.'],
    ['20 − 10 = ?', '10', 'Hiệu hai số.'],
    ['(0 + 5) : 2 = ?', '2,5', '5 : 2 = 2,5.'],
    ['(40 + 50) : 2 = ?', '45', '90 : 2 = 45.']
  ] }),
  T('C7-B24-M2', 'leoNui', 'Toán 7: số trung bình cộng.', { cau: [
    ['Trung bình cộng của 4, 6, 8 là?', '6', '18', '5'],
    ['Trung bình cộng của 10 và 20 là?', '15', '30', '10'],
    ['Trung bình cộng của 1, 2, 3, 4 là?', '2,5', '10', '2'],
    ['Ba bạn có tổng điểm 24. Điểm trung bình là?', '8', '24', '6'],
    ['Trung bình cộng của 7, 7, 7 là?', '7', '21', '3']
  ] }),
  T('C7-B24-M3', 'banBong', 'Toán 6: tỉ số phần trăm của hai số.', { cau: [
    ['5 so với 20 bằng:', '25%', '4%', '15%', '40%'],
    ['8 so với 40 bằng:', '20%', '5%', '32%', '8%'],
    ['14 so với 40 bằng:', '35%', '14%', '26%', '40%'],
    ['9 so với 30 bằng:', '30%', '9%', '21%', '3%'],
    ['12 so với 48 bằng:', '25%', '4%', '36%', '12%'],
    ['1 so với 4 bằng:', '25%', '4%', '14%', '40%']
  ] }),
  T('C7-B24-M4', 'noiCot', 'Toán 6–7 và Bài 22–23: các loại biểu đồ.', { cap: [
    ['Biểu đồ cột', 'dùng các cột hình chữ nhật'],
    ['Biểu đồ đoạn thẳng', 'nối các điểm bằng đoạn thẳng'],
    ['Biểu đồ hình quạt tròn', 'chia hình tròn thành các hình quạt'],
    ['Trục ngang của biểu đồ cột', 'ghi các giá trị hoặc các nhóm'],
    ['Trục đứng của biểu đồ cột', 'ghi tần số hoặc tần số tương đối']
  ] }),

  /* ============================ CHƯƠNG VIII ============================ */
  T('C8-B25-M1', 'banBong', 'Toán 6–7: kết quả có thể của trò chơi tung đồng xu, gieo xúc xắc, rút thẻ.', { cau: [
    ['Tung một đồng xu. Có mấy kết quả có thể?', '2', '1', '3', '4'],
    ['Gieo một con xúc xắc. Có mấy kết quả có thể?', '6', '5', '12', '3'],
    ['Gieo xúc xắc. Các mặt có số chấm chẵn là:', '2; 4; 6', '1; 3; 5', '2; 4', '4; 6'],
    ['Rút một thẻ từ 5 thẻ ghi số 1 đến 5. Có mấy kết quả?', '5', '4', '6', '10'],
    ['Gieo xúc xắc. Các mặt có số chấm lớn hơn 4 là:', '5; 6', '4; 5; 6', '6', '1; 2; 3; 4'],
    ['Tung đồng xu hai lần, lần đầu sấp (S), lần sau ngửa (N). Viết kết quả:', 'SN', 'NS', 'SS', 'NN']
  ] }),
  T('C8-B26-M1', 'phanLoai', 'Toán 7: biến cố chắc chắn, biến cố không thể.', { gio: ['Chắc chắn xảy ra', 'Không thể xảy ra'], muc: [
    ['Gieo xúc xắc được số chấm nhỏ hơn 7', 0], ['Gieo xúc xắc được 7 chấm', 1],
    ['Tung đồng xu được mặt sấp hoặc mặt ngửa', 0], ['Rút từ hộp chỉ có bi đỏ được bi xanh', 1],
    ['Một ngày có 25 giờ', 1], ['Số chấm gieo được lớn hơn 0', 0],
    ['Rút từ các thẻ số 1 đến 10 được thẻ số 0', 1], ['Rút từ hộp chỉ có bi đỏ được bi đỏ', 0]
  ] }),
  T('C8-B26-M2', 'latThe', 'Toán 6: rút gọn phân số.', { cap: [
    ['2/6', '1/3'], ['3/6', '1/2'], ['2/8', '1/4'], ['6/9', '2/3'], ['4/20', '1/5'], ['10/16', '5/8']
  ] }),

  /* ============================ CHƯƠNG IX ============================ */
  T('C9-B27-M1', 'leoNui', 'Bài 14: góc ở tâm và số đo cung; tính một nửa số đo.', { cau: [
    ['Một nửa của 80° là?', '40°', '160°', '80°'],
    ['Góc ở tâm chắn cung 100° có số đo?', '100°', '50°', '200°'],
    ['Nửa đường tròn có số đo cung?', '180°', '90°', '360°'],
    ['Một nửa của 180° là?', '90°', '60°', '45°'],
    ['Góc ở tâm 60° chắn cung có số đo?', '60°', '30°', '120°']
  ] }),
  T('C9-B28-M1', 'dungSai', 'Toán 7: đường trung trực; sự đồng quy của ba đường trung trực.', { cau: [
    ['Ba đường trung trực của một tam giác cùng đi qua một điểm.', true, 'Ba đường trung trực đồng quy.'],
    ['Giao điểm ba đường trung trực cách đều ba đỉnh của tam giác.', true, 'Vì mỗi điểm trên trung trực cách đều hai đầu đoạn thẳng.'],
    ['Giao điểm ba đường trung trực cách đều ba cạnh của tam giác.', false, 'Điểm cách đều ba cạnh là giao điểm ba đường phân giác.'],
    ['Mỗi điểm nằm trên trung trực của AB cách đều A và B.', true, 'Tính chất đường trung trực.'],
    ['Đường trung trực của đoạn thẳng vuông góc với đoạn thẳng tại trung điểm.', true, 'Đúng định nghĩa.'],
    ['Giao điểm ba đường phân giác cách đều ba đỉnh.', false, 'Nó cách đều ba cạnh.'],
    ['Một tam giác chỉ có hai đường trung trực.', false, 'Mỗi cạnh có một trung trực, tam giác có ba.'],
    ['Giao điểm ba đường trung tuyến là trọng tâm.', true, 'Đúng định nghĩa trọng tâm.']
  ] }),
  T('C9-B28-M2', 'dienSo', 'Toán 8: đường trung tuyến ứng với cạnh huyền; đường cao tam giác đều.', { cau: [
    ['Tam giác vuông có cạnh huyền 10. Trung tuyến ứng với cạnh huyền bằng?', '5', 'Bằng nửa cạnh huyền.'],
    ['Cạnh huyền 13. Nửa cạnh huyền bằng?', '6,5', '13 : 2 = 6,5.'],
    ['Đường cao tam giác đều cạnh 2 bằng √a. Tìm a.', '3', '2² − 1² = 3.'],
    ['2/3 của 6 bằng?', '4', '6 · 2 : 3 = 4.'],
    ['Tam giác vuông có hai cạnh góc vuông 6 và 8. Nửa cạnh huyền bằng?', '5', 'Cạnh huyền 10, nửa là 5.']
  ] }),
  T('C9-B28-M3', 'noiCot', 'Toán 7: các điểm đồng quy trong tam giác.', { cap: [
    ['Giao điểm ba đường phân giác', 'cách đều ba cạnh'],
    ['Giao điểm ba đường trung trực', 'cách đều ba đỉnh'],
    ['Giao điểm ba đường trung tuyến', 'trọng tâm'],
    ['Giao điểm ba đường cao', 'trực tâm'],
    ['Tia phân giác của một góc', 'chia góc thành hai góc bằng nhau']
  ] }),
  T('C9-B29-M1', 'dienSo', 'Toán 8: tổng các góc của tứ giác; Bài 27: góc nội tiếp.', { cau: [
    ['Tổng bốn góc của một tứ giác bằng bao nhiêu độ?', '360', 'Tứ giác chia được thành hai tam giác.'],
    ['Tứ giác có ba góc 80°, 90°, 100°. Góc còn lại bằng bao nhiêu độ?', '90', '360 − 270 = 90.'],
    ['180° − 75° = ? (độ)', '105', 'Phép trừ số đo góc.'],
    ['Góc nội tiếp chắn cung 140° có số đo bao nhiêu độ?', '70', 'Bằng nửa số đo cung bị chắn.'],
    ['Hai góc bù nhau, một góc 110°. Góc kia bằng bao nhiêu độ?', '70', 'Hai góc bù nhau có tổng 180°.']
  ] }),
  T('C9-B29-M2', 'dienSo', 'Toán 8: đường chéo hình chữ nhật, hình vuông (Pythagore).', { cau: [
    ['Hình chữ nhật 6 × 8. Đường chéo dài bao nhiêu?', '10', '36 + 64 = 100.'],
    ['Nửa đường chéo đó dài bao nhiêu?', '5', '10 : 2 = 5.'],
    ['Hình vuông cạnh 1 có đường chéo bằng √a. Tìm a.', '2', '1² + 1² = 2.'],
    ['Hình chữ nhật 5 × 12. Đường chéo dài bao nhiêu?', '13', '25 + 144 = 169.'],
    ['Đường chéo hình chữ nhật dài 14. Hai đường chéo cắt nhau tại trung điểm. Nửa đường chéo bằng?', '7', '14 : 2 = 7.']
  ] }),
  T('C9-B30-M1', 'phanLoai', 'Toán 7–8: tổng các góc của tam giác (180°) và của tứ giác (360°).', { gio: ['Tổng các góc 180°', 'Tổng các góc 360°'], muc: [
    ['Tam giác', 0], ['Tứ giác', 1], ['Hình vuông', 1], ['Tam giác đều', 0],
    ['Hình thang', 1], ['Hình bình hành', 1], ['Tam giác vuông', 0], ['Tam giác cân', 0]
  ] }),
  T('C9-B30-M2', 'leoNui', 'Mục trước: tổng các góc của đa giác lồi; phép chia.', { cau: [
    ['(5 − 2) · 180° = ?', '540°', '900°', '360°'],
    ['540° : 5 = ?', '108°', '120°', '90°'],
    ['(6 − 2) · 180° = ?', '720°', '1080°', '540°'],
    ['720° : 6 = ?', '120°', '108°', '135°'],
    ['Mỗi góc của tam giác đều bằng?', '60°', '90°', '180°']
  ] }),
  T('C9-B30-M3', 'banBong', 'Toán 6: số đo góc; góc quay của kim đồng hồ.', { cau: [
    ['Kim phút quay 15 phút được một góc:', '90°', '15°', '45°', '180°'],
    ['Kim phút quay 30 phút được một góc:', '180°', '30°', '90°', '360°'],
    ['Quay đủ một vòng là:', '360°', '180°', '100°', '60°'],
    ['Kim giờ quay trong 1 giờ được một góc:', '30°', '60°', '1°', '15°'],
    ['Kim phút quay 10 phút được một góc:', '60°', '10°', '36°', '100°'],
    ['Kim phút quay 20 phút được một góc:', '120°', '20°', '200°', '60°']
  ] }),
  T('C9-B30-M4', 'noiCot', 'Toán 6: phép chia 360° cho số cạnh; nhân số đo góc.', { cap: [
    ['360° : 6', '60°'], ['360° : 5', '72°'], ['360° : 4', '90°'], ['360° : 3', '120°'], ['2 · 72°', '144°']
  ] }),

  /* ============================ CHƯƠNG X ============================ */
  T('C10-B31-M1', 'banBong', 'Toán 6–8: chu vi, diện tích hình tròn; hình chữ nhật; hình hộp, lăng trụ.', { cau: [
    ['Chu vi hình tròn bán kính r là:', '2πr', 'πr²', 'πr', '4πr'],
    ['Diện tích hình tròn bán kính r là:', 'πr²', '2πr', '2πr²', 'πr'],
    ['Diện tích hình chữ nhật dài a, rộng b là:', 'ab', 'a + b', '2(a + b)', 'a² + b²'],
    ['Thể tích hình hộp chữ nhật có ba kích thước a, b, c là:', 'abc', 'a + b + c', '2(ab + bc + ca)', 'ab + c'],
    ['Mặt bên của hình lăng trụ đứng là hình:', 'chữ nhật', 'tam giác', 'tròn', 'thang'],
    ['Đường kính của hình tròn bằng:', '2 lần bán kính', 'nửa bán kính', 'bán kính', '3 lần bán kính']
  ] }),
  T('C10-B31-M2', 'dienSo', 'Toán 6–8: chu vi, diện tích hình tròn; diện tích hình chữ nhật.', { cau: [
    ['Chu vi đường tròn bán kính 3 là ?π. Điền số.', '6', '2π·3 = 6π.'],
    ['Diện tích hình tròn bán kính 3 là ?π. Điền số.', '9', 'π·3² = 9π.'],
    ['6π · 5 = ?π. Điền số.', '30', '6 · 5 = 30.'],
    ['9π · 4 = ?π. Điền số.', '36', '9 · 4 = 36.'],
    ['Diện tích hình chữ nhật 6 × 10 bằng?', '60', '6 · 10 = 60.']
  ] }),
  T('C10-B31-M3', 'dienSo', 'Toán 8: định lí Pythagore.', { cau: [
    ['Tam giác vuông có hai cạnh góc vuông 3 và 4. Cạnh huyền?', '5', '9 + 16 = 25.'],
    ['Hai cạnh góc vuông 5 và 12. Cạnh huyền?', '13', '25 + 144 = 169.'],
    ['Cạnh huyền 10, một cạnh góc vuông 6. Cạnh còn lại?', '8', '100 − 36 = 64.'],
    ['Cạnh huyền 5, một cạnh góc vuông 4. Cạnh còn lại?', '3', '25 − 16 = 9.'],
    ['Hai cạnh góc vuông 6 và 8. Cạnh huyền?', '10', '36 + 64 = 100.']
  ] }),
  T('C10-B31-M4', 'latThe', 'Toán 6–7: nhân phân số với số; giữ π trong kết quả.', { cap: [
    ['1/3 · 9π · 4', '12π'], ['π · 3 · 5', '15π'], ['1/3 · 27', '9'], ['π · 4 · 6', '24π'], ['1/3 · 25π · 6', '50π'], ['2π · 5 · 4', '40π']
  ] }),
  T('C10-B32-M1', 'dungSai', 'Toán 6 và Bài 31: đường tròn, hình tròn, hình trụ, hình nón.', { cau: [
    ['Bán kính 5 cm thì đường kính 10 cm.', true, 'Đường kính gấp đôi bán kính.'],
    ['Dây lớn nhất của đường tròn là đường kính.', true, 'Đã học ở Bài 14.'],
    ['Hình tròn bán kính 3 có diện tích 6π.', false, 'S = π·3² = 9π.'],
    ['Lon nước ngọt có dạng hình trụ.', true, 'Đã học ở Bài 31.'],
    ['Chiếc nón lá có dạng hình nón.', true, 'Đã học ở Bài 31.'],
    ['Chu vi đường tròn bán kính 2 bằng 4π.', true, 'C = 2π·2 = 4π.'],
    ['Đường tròn có đúng một trục đối xứng.', false, 'Có vô số trục đối xứng.'],
    ['Mọi điểm trên đường tròn cách đều tâm.', true, 'Đúng định nghĩa.']
  ] }),
  T('C10-B32-M2', 'latThe', 'Toán 6–7: luỹ thừa; nhân với phân số.', { cap: [
    ['3³', '27'], ['4 · 5²', '100'], ['4/3 · 27', '36'], ['2³', '8'], ['5³', '125'], ['4 · 2²', '16']
  ] })
];

export const TRO_CHOI_THEO_MUC = Object.fromEntries(TRO_CHOI_NEN.map((t) => [t.ku, t]));

/** So sánh đáp số gõ vào với đáp án (bỏ dấu cách, dấu phẩy thập phân như dấu chấm, mọi kiểu dấu trừ). */
export function soKhopDapSo(go, dapAn) {
  const chuan = (s) => String(s ?? '').trim().toLowerCase().replace(/\s+/g, '').replace(/[−–—]/g, '-').replace(/,/g, '.').replace(/°$/, '').replace(/^\+/, '');
  const a = chuan(go), b = chuan(dapAn);
  if (!a) return false;
  if (a === b) return true;
  const na = Number(a), nb = Number(b);
  return Number.isFinite(na) && Number.isFinite(nb) && Math.abs(na - nb) < 1e-9;
}
