/**
 * FILE NÀY LÀM GÌ: Mô-đun TypeScript/JavaScript hỗ trợ xử lý dữ liệu và nghiệp vụ trong hệ thống FlipMath 9.
 * AI DÙNG: dùng chung
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: ./mau
 */
import { bai, buoc, haiAn, he, lamTron, so } from './mau';

/**
 * Hàm `muaBan`: nhận (hang1, hang2, a, b, c, d, e, f, hoiHe), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
function muaBan(hang1: string, hang2: string, a: number, b: number, c: number, d: number, e: number, f: number, hoiHe: boolean) {
  const p = a + 'x + ' + b + 'y = ' + so(c);
  const q = d + 'x + ' + e + 'y = ' + so(f);
  const [x, y] = haiAn(a, b, c, d, e, f);
  return bai('Tính tiền mua hàng', 'x là giá một đơn vị ' + hang1 + ', y là giá một đơn vị ' + hang2, 'đồng', 'x > 0 và y > 0',
    ['Lần đầu mua ' + a + ' đơn vị ' + hang1 + ' và ' + b + ' đơn vị ' + hang2, 'Lần đầu hết ' + so(c) + ' đồng',
      'Lần sau mua ' + d + ' đơn vị ' + hang1 + ' và ' + e + ' đơn vị ' + hang2, 'Lần sau hết ' + so(f) + ' đồng'],
    [buoc(p, b + 'x + ' + a + 'y = ' + so(c), p.replace(so(c), so(f)), 'Số lượng từng mặt hàng nhân đơn giá tương ứng, rồi cộng lại.', 0, 1),
      buoc(q, e + 'x + ' + d + 'y = ' + so(f), q.replace(so(f), so(c)), 'Tiền lần sau bằng tổng tiền của hai mặt hàng trong lần sau.', 2, 3)],
    'Khử một ẩn bằng phương pháp cộng đại số, được x = ' + so(x) + ' và y = ' + so(y) + '. Hai đơn giá đều dương.',
    () => hoiHe ? he(p, q) : so(x) + ' đồng');
}

/**
 * Hàm `vuon`: nhận (chuVi, chenh, hoiHe, thanhVuong), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
function vuon(chuVi: number, chenh: number, hoiHe = false, thanhVuong = false) {
  const nua = chuVi / 2;
  const p = 'x + y = ' + nua;
  const q = 'x − y = ' + chenh;
  const [x, y] = haiAn(1, 1, nua, 1, -1, chenh);
  return bai('Vườn hình chữ nhật', 'x là chiều dài, y là chiều rộng', 'm', 'x > y > 0',
    ['Chu vi ' + chuVi + ' m', thanhVuong ? 'Rộng tăng 3 m, dài giảm 2 m thì thành hình vuông' : 'Chiều dài hơn chiều rộng ' + chenh + ' m'],
    [buoc(p, 'x + y = ' + chuVi, '2(x + y) = ' + nua, 'Chu vi P = 2(x + y), nên x + y = P/2.', 0),
      buoc(q, 'y − x = ' + chenh, 'x + y = ' + chenh, thanhVuong ? 'Hình vuông có hai cạnh bằng nhau: x − 2 = y + 3.' : 'Chiều dài trừ chiều rộng bằng độ chênh đã cho.', 1)],
    'Cộng hai phương trình để tìm x = ' + x + ' m, rồi suy ra y = ' + y + ' m. Diện tích là xy = ' + x * y + ' m².',
    () => hoiHe ? he(p, q) : x * y + ' m²');
}

/**
 * Hàm `haiXe`: nhận (s, t, hoi, hon), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
function haiXe(s: number, t: number, hoi: 'pt' | 'tong' | 'xe1' | 'xe2', hon = 0) {
  const p = so(t) + 'x + ' + so(t) + 'y = ' + s;
  const [x, y] = haiAn(t, t, s, 1, -1, hon);
  const coHieu = hoi === 'xe1' || hoi === 'xe2';
  const moHinh = [buoc(p, 'x + y = ' + s, so(t) + 'x − ' + so(t) + 'y = ' + s, 's = v · t. Hai xe đi ngược chiều tới khi gặp nhau nên s₁ + s₂ bằng khoảng cách ban đầu.', 0, 1, 2)];
  if (coHieu) moHinh.push(buoc('x − y = ' + hon, 'y − x = ' + hon, 'x + y = ' + hon, 'Vận tốc xe nhanh trừ vận tốc xe chậm bằng độ chênh.', 3));
  const an = hoi === 'xe1' ? 'x là vận tốc xe đi từ A, y là vận tốc xe đi từ B' : 'x là vận tốc xe thứ nhất, y là vận tốc xe thứ hai';
  return bai('Hai xe ngược chiều', an, 'km/h', coHieu ? 'x > ' + hon + ' và y > 0' : 'x > 0 và y > 0',
    ['Hai nơi cách nhau ' + s + ' km', 'Xuất phát cùng lúc và ngược chiều', 'Gặp nhau sau ' + so(t) + ' giờ', ...(coHieu ? ['Xe thứ nhất nhanh hơn ' + hon + ' km/h'] : [])],
    moHinh, 'Chia phương trình quãng đường cho ' + so(t) + ', được x + y = ' + s / t + '.' + (coHieu ? ' Dùng x − y = ' + hon + ' để tìm x = ' + x + ' và y = ' + y + ' km/h.' : ''),
    () => hoi === 'pt' ? p : (hoi === 'tong' ? s / t : hoi === 'xe1' ? x : y) + ' km/h');
}

/**
 * Hàm `xeDap`: nhận (vDi, vVe, t, hoiPt), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
function xeDap(vDi: number, vVe: number, t: number, hoiPt: boolean) {
  const p = 'x/' + vDi + ' + x/' + vVe + ' = ' + t;
  const x = t / (1 / vDi + 1 / vVe);
  return bai('Xe đạp đi và về', 'x là quãng đường AB', 'km', 'x > 0',
    ['Lượt đi ' + vDi + ' km/h', 'Lượt về ' + vVe + ' km/h', 'Cả hai lượt hết ' + t + ' giờ'],
    [buoc(p, vDi + 'x + ' + vVe + 'x = ' + t, p.replace('+', '−'), 't = s/v. Hai lượt có cùng quãng đường AB, và thời gian của chúng được cộng lại.', 0, 1, 2)],
    'Gom hệ số của x: x(1/' + vDi + ' + 1/' + vVe + ') = ' + t + '. Suy ra x = ' + so(x) + ' km.',
    () => hoiPt ? p : so(x) + ' km');
}

/**
 * Hàm `haiVoiBietRieng`: nhận (hoiLuong), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
function haiVoiBietRieng(hoiLuong: boolean) {
  const a = 4, b = 6;
  const phanBe = (b + a) / (a * b);
  const p = '1/4 + 1/6 = 5/12';
  return bai('Hai vòi cùng chảy', hoiLuong ? 'Lượng nước cả hai vòi chảy trong một giờ' : 'Thời gian hai vòi cùng chảy đầy bể',
    hoiLuong ? 'phần bể' : 'giờ', hoiLuong ? 'Lượng nước trong một giờ lớn hơn 0 và nhỏ hơn 1 bể' : 'Thời gian cùng chảy dương và nhỏ hơn 4 giờ',
    ['Vòi A chảy riêng đầy bể sau 4 giờ', 'Vòi B chảy riêng đầy bể sau 6 giờ'],
    [buoc(p, '1/(4 + 6) = 1/10', '1/4 × 1/6 = 1/24', 'Nếu đầy bể sau t giờ, mỗi giờ chảy được 1/t bể. Cộng hai năng suất.', 0, 1)],
    'Mỗi giờ được 5/12 bể. Để đầy bể cần 1 : (5/12) = ' + so(1 / phanBe) + ' giờ.',
    () => hoiLuong ? so(phanBe * 12) + '/12 bể' : so(1 / phanBe) + ' giờ');
}

/**
 * Hàm `haiVoiLapHe`: nhận (hoiHe), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
function haiVoiLapHe(hoiHe: boolean) {
  const p = '1/x + 1/y = 1/6';
  const q = '2/x + 3/y = 2/5';
  const [u, v] = haiAn(1, 1, 1 / 6, 2, 3, 2 / 5);
  return bai('Hai vòi và hai chế độ chảy', 'x là thời gian đầy bể của vòi I, y là thời gian đầy bể của vòi II khi chảy riêng', 'giờ',
    'x > 6 và y > 6', ['Chảy cùng nhau đầy bể sau 6 giờ', 'Vòi I chảy 2 giờ và vòi II chảy 3 giờ', 'Tổng lượng nước trong lần sau là 2/5 bể'],
    [buoc(p, 'x + y = 6', '1/x + 1/y = 6', 'Trong một giờ, hai vòi chảy 1/x + 1/y bể, bằng 1/6 bể.', 0),
      buoc(q, '2x + 3y = 2/5', '3/x + 2/y = 2/5', 'Lượng nước = thời gian × năng suất. Nhân 2 với 1/x và nhân 3 với 1/y.', 1, 2)],
    'Đặt u = 1/x và v = 1/y. Lấy phương trình sau trừ hai lần phương trình đầu được v = 1/15. Suy ra u = 1/10, x = ' + so(1 / u) + ' và y = ' + so(1 / v) + ' giờ.',
    () => hoiHe ? he(p, q) : so(1 / u) + ' giờ');
}

export const chuong1 = {
  'C1-B1-M1-Q07': bai('Mua vở và bút', 'x là số vở, y là số bút', 'quyển vở và cái bút', 'x, y là các số nguyên không âm',
    ['Vở giá 8 000 đồng/quyển', 'Bút giá 5 000 đồng/cái', 'Tổng tiền 41 000 đồng'],
    [buoc('8 000x + 5 000y = 41 000', '8 000y + 5 000x = 41 000', 'x + y = 41 000', 'Tiền từng loại = đơn giá × số lượng. Cộng tiền hai loại.', 0, 1, 2)],
    'Chia cả hai vế cho 1 000 được 8x + 5y = 41. Chẳng hạn, (2; 5) phù hợp vì 8 · 2 + 5 · 5 = 41.',
    () => so(8000) + 'x + ' + so(5000) + 'y = ' + so(41000)),
  'C1-B1-M1-Q16': bai('Mua vé theo nhóm', 'x là số vé người lớn, y là số vé trẻ em', 'vé', 'x, y là các số nguyên không âm',
    ['Vé người lớn giá 50 000 đồng', 'Vé trẻ em giá 30 000 đồng', 'Nhóm trả 260 000 đồng'],
    [buoc('50 000x + 30 000y = 260 000', '30 000x + 50 000y = 260 000', 'x + y = 260 000', 'Tổng tiền bằng số vé từng loại nhân giá vé tương ứng rồi cộng lại.', 0, 1, 2)],
    'Chia cho 10 000, được 5x + 3y = 26. Vì x ≤ 5 và 26 − 5x chia hết cho 3 nên x có thể là 1 hoặc 4. Trong các lựa chọn của đề, chỉ (4; 2) phù hợp.',
    () => { const x = 4; return '(' + x + '; ' + (260000 - 50000 * x) / 30000 + ')'; }),
  'C1-B3-M1-Q04': muaBan('vở', 'bút', 3, 2, 34000, 2, 3, 31000, true),
  'C1-B3-M1-Q05': muaBan('vở', 'bút', 3, 2, 34000, 2, 3, 31000, false),
  'C1-B3-M1-Q06': vuon(34, 7, true),
  'C1-B3-M1-Q07': vuon(34, 7),
  'C1-B3-M1-Q16': vuon(46, 3 + 2, false, true),
  'C1-B3-M1-Q10': bai('Đếm số cây', 'x là số cây An trồng được', 'cây', 'x là số nguyên không âm',
    ['An trồng cây', 'x biểu thị số cây An trồng được'],
    [buoc('x ∈ ℕ', 'x < 0', '0 < x < 1', 'Số đếm thuộc tập các số tự nhiên ℕ = {0, 1, 2, …}.', 0, 1)],
    'Số cây phải nguyên và không âm. Đề chưa cho đủ dữ kiện để xác định một giá trị cụ thể.', () => 'x ∈ ℕ'),
  'C1-B3-M1-Q13': muaBan('kg táo', 'kg cam', 2, 3, 170000, 3, 2, 180000, true),
  'C1-B3-M1-Q14': muaBan('kg táo', 'kg cam', 2, 3, 170000, 3, 2, 180000, false),
  'C1-B3-M1B-Q01': bai('Quãng đường ô tô', 's là quãng đường ô tô đi được', 'km', 'v > 0 và t ≥ 0',
    ['Vận tốc v tính bằng km/h', 'Thời gian t tính bằng giờ'],
    [buoc('s = v · t', 's = v : t', 's = v + t', 'Mỗi giờ đi được v km, nên t giờ đi được v · t km.', 0, 1)],
    'Đơn vị km/h nhân giờ cho ra km. Vì đề cho v và t dưới dạng chữ nên ta giữ biểu thức v · t.', () => 's = v · t'),
  'C1-B3-M1B-Q10': bai('Thời gian ô tô chạy', 't là thời gian xe đi', 'giờ', 't > 0',
    ['Xe đi 120 km', 'Vận tốc 40 km/h'], [buoc('40t = 120', '120t = 40', '40 + t = 120', 'Quãng đường s = v · t.', 0, 1)],
    'Chia hai vế cho 40: t = 120/40 = 3 giờ.', () => 120 / 40 + ' giờ'),
  'C1-B3-M1B-Q03': haiXe(180, 2, 'pt'),
  'C1-B3-M1B-Q05': haiXe(180, 2, 'xe1', 10),
  'C1-B3-M1B-Q11': haiXe(150, 1.5, 'tong'),
  'C1-B3-M1B-Q13': bai('Tổng quãng đường hai xe', 'x là vận tốc xe thứ nhất, y là vận tốc xe thứ hai', 'km/h', 'x > 0 và y > 0',
    ['Xe thứ nhất đi 3 giờ', 'Xe thứ hai đi 2 giờ', 'Hai quãng đường có tổng 260 km'],
    [buoc('3x + 2y = 260', '2x + 3y = 260', '5(x + y) = 260', 'Quãng đường từng xe = vận tốc × thời gian của chính xe đó.', 0, 1, 2)],
    'Từ phương trình, y = (260 − 3x)/2 với 0 < x < 260/3 để cả hai vận tốc dương.', () => 3 + 'x + ' + 2 + 'y = ' + 260),
  'C1-B3-M1B-Q14': haiXe(150, 1.5, 'xe2', 10),
  'C1-B3-M1B-Q06': xeDap(15, 12, 3, true),
  'C1-B3-M1B-Q07': xeDap(15, 12, 3, false),
  'C1-B3-M1C-Q02': haiVoiBietRieng(true),
  'C1-B3-M1C-Q03': haiVoiBietRieng(false),
  'C1-B3-M1C-Q08': bai('Hai vòi chảy lệch thời gian', 'x là thời gian vòi I chảy riêng đầy bể', 'giờ', 'x > 0',
    ['Hai vòi cùng chảy đầy bể sau 2 giờ 24 phút', 'Vòi I chảy riêng nhanh hơn vòi II 2 giờ'],
    [buoc('1/x + 1/(x + 2) = 5/12', '1/x + 1/(x − 2) = 5/12', '1/x + 1/(x + 2) = 1/2,24', '2 giờ 24 phút là 12/5 giờ. Năng suất hai vòi cộng lại bằng 5/12 bể/giờ.', 0, 1)],
    'Nhân với 12x(x + 2), được 5x² − 14x − 24 = 0, tức (x − 4)(5x + 6) = 0. Điều kiện x > 0 cho x = 4, vòi II cần 6 giờ.',
    () => { const t = 2 + 24 / 60; const x = (2 * t - 2 + Math.sqrt((2 - 2 * t) ** 2 + 8 * t)) / 2;
      if (lamTron(x) !== '4') throw new Error('Sai nghiệm thời gian vòi I');
      return '1/x + 1/(x + 2) = ' + so(12 / t) + '/12';
    }),
  'C1-B3-M1C-Q14': haiVoiLapHe(true),
  'C1-B3-M1C-Q15': haiVoiLapHe(false),
  'C1-B3-M1C-Q09': bai('Một vòi chảy vào bể', 'x là phần bể được bơm trong hai giờ', 'phần bể', '0 < x < 1',
    ['Vòi chảy riêng đầy bể sau 5 giờ', 'Vòi chảy trong 2 giờ'],
    [buoc('x = 2 · (1/5)', 'x = 1/5', 'x = 2 · 5', 'Phần bể đã chảy = thời gian × năng suất. Năng suất là 1/5 bể/giờ.', 0, 1)],
    'Nhân 2 với 1/5, được x = 2/5 bể.', () => 2 + '/' + 5 + ' bể'),
};

