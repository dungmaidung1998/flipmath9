/**
 * FILE NÀY LÀM GÌ: Mô-đun TypeScript/JavaScript hỗ trợ xử lý dữ liệu và nghiệp vụ trong hệ thống FlipMath 9.
 * AI DÙNG: dùng chung
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: ./mau
 */
import { bai, buoc, lamTron, so } from './mau';

/**
 * Hàm `chiaVong`: nhận (ten, n, khoang, dongHo), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
function chiaVong(ten: string, n: number, khoang: number, dongHo: boolean) {
  const gocMoi = 360 / n;
  return bai(ten, 'Số đo góc ở tâm cần tìm', 'độ', 'Mỗi khoảng chia đều có cùng số đo góc',
    dongHo ? ['Mặt đồng hồ chia đều thành 12 khoảng', 'Kim phút ở vạch trên cùng', 'Kim giờ cách kim phút ' + khoang + ' khoảng'] :
      ['Bánh xe có ' + n + ' nan hoa chia đều', khoang === 1 ? 'Xét hai nan liền nhau' : 'Từ nan thứ nhất đến nan thứ tư có 3 khoảng'],
    [buoc('Một khoảng bằng 360° / ' + n, 'Một khoảng bằng 180° / ' + n, 'Một khoảng bằng 360° × ' + n,
      'Một vòng quay có 360°. Chia cho số khoảng bằng nhau trên cả vòng.', 0),
      ...(khoang > 1 ? [buoc('Góc cần tìm bằng ' + khoang + ' × ' + gocMoi + '°', 'Góc cần tìm bằng ' + (khoang + 1) + ' × ' + gocMoi + '°',
        'Góc cần tìm bằng ' + gocMoi + '° / ' + khoang, 'Đếm số khoảng giữa hai vị trí và nhân với số đo của một khoảng.', 1, ...(dongHo ? [2] : []))] : [])],
    'Một khoảng là ' + gocMoi + '°. Lấy ' + khoang + ' khoảng được ' + gocMoi * khoang + '°.', () => gocMoi * khoang + '°');
}

/**
 * Hàm `cungKim`: nhận (kim, r, t, chuKy, donViTg), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
function cungKim(kim: string, r: number, t: number, chuKy: number, donViTg: string) {
  const tu = 2 * r * t;
  let uoc = chuKy;
  while (tu % uoc !== 0 || chuKy % uoc !== 0) uoc--;
  const l = tu / uoc + 'π' + (chuKy === uoc ? '' : '/' + chuKy / uoc);
  return bai('Cung tròn đầu kim ' + kim, 'Độ dài cung do đầu kim vạch ra', 'cm', 'Dùng ℓ = 2πr × phần vòng quay',
    ['Kim ' + kim + ' dài ' + r + ' cm', 'Khoảng thời gian là ' + t + ' ' + donViTg, 'Kim ' + kim + ' quay một vòng trong ' + chuKy + ' ' + donViTg],
    [buoc('Phần vòng quay = ' + t + '/' + chuKy, 'Phần vòng quay = ' + chuKy + '/' + t, 'Phần vòng quay = ' + t + '/360',
      'Lấy thời gian chuyển động chia thời gian quay trọn vòng, cùng đơn vị.', 1, 2),
      buoc('ℓ = 2π · ' + r + ' · (' + t + '/' + chuKy + ')', 'ℓ = π · ' + r + '² · (' + t + '/' + chuKy + ')', 'ℓ = 2π · ' + r,
        'Chu vi đường tròn là 2πr. Cung bằng chu vi nhân phần vòng quay.', 0, 1, 2)],
    'Nhân và rút gọn hệ số của π, được ℓ = ' + l + ' cm.', () => l + ' cm');
}

/**
 * Hàm `banh`: nhận (r, n, duong), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
function banh(r: number, n: number | null, duong: number | null) {
  const c = 2 * 3.14 * r / 100;
  return bai('Bánh xe lăn', n !== null ? 'Quãng đường bánh xe lăn được' : 'Số vòng bánh xe lăn', n !== null ? 'm' : 'vòng', 'Lăn không trượt, một vòng đi đúng một chu vi',
    [n !== null ? 'Đường kính bánh xe ' + 2 * r + ' cm' : 'Bán kính bánh xe ' + r + ' cm', n !== null ? 'Bánh xe lăn ' + n + ' vòng' : 'Quãng đường ' + so(duong!) + ' m', 'Lấy π ≈ 3,14'],
    [buoc('C = 2πr', 'C = πr', 'C = πr²', 'Chu vi C = πd = 2πr. Đổi từ cm sang m bằng cách chia cho 100.', 0, 2),
      n !== null ? buoc('s = số vòng × C', 's = số vòng / C', 's = C / số vòng', 'Mỗi vòng đi đúng một chu vi.', 0, 1, 2) :
        buoc('Số vòng = s / C', 'Số vòng = s × C', 'Số vòng = C / s', 'Quãng đường bằng số vòng nhân với chu vi, cùng đơn vị độ dài.', 0, 1, 2)],
    'Một vòng đi được ' + so(c) + ' m. ' + (n !== null ? 'Nhân với ' + n + ' vòng.' : 'Chia ' + so(duong!) + ' cho ' + so(c) + '.'),
    () => n !== null ? 'khoảng ' + lamTron(n * c, 2) + ' m' : so(duong! / c) + ' vòng');
}

/**
 * Hàm `tiepXuc`: nhận (hoiDoDai), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
function tiepXuc(hoiDoDai: boolean) {
  return bai('Bánh xe tiếp xúc mặt đường', hoiDoDai ? 'Khoảng cách từ tâm bánh xe đến đường' : 'Quan hệ của bán kính tại điểm tiếp xúc với mặt đường',
    hoiDoDai ? 'cm' : 'quan hệ hình học', 'Bán kính qua tiếp điểm vuông góc với tiếp tuyến',
    ['Mặt đường là đường thẳng tiếp xúc bánh xe', hoiDoDai ? 'Bánh xe có bán kính 30 cm' : 'Bán kính nối tâm O với điểm tiếp xúc'],
    [buoc('Bán kính tại tiếp điểm vuông góc với mặt đường', 'Bán kính tại tiếp điểm song song với mặt đường', 'Bán kính nằm trên mặt đường',
      'Tiếp tuyến vuông góc với bán kính đi qua tiếp điểm.', 0, 1)],
    hoiDoDai ? 'Khoảng cách từ tâm đến mặt đường là độ dài đường vuông góc, bằng bán kính 30 cm.' : 'Bán kính tại điểm tiếp xúc tạo góc vuông với mặt đường.',
    () => hoiDoDai ? 30 + ' cm' : 'vuông góc với mặt đường');
}

/**
 * Hàm `quat`: nhận (ten, r, alpha, donVi, ganDung), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
function quat(ten: string, r: number, alpha: number, donVi: string, ganDung = false) {
  const k = alpha * r ** 2 / 360;
  return bai(ten, 'Diện tích vùng hình quạt', donVi + '²', 'Dùng S = (α/360°) · πr²',
    ['Bán kính ' + r + ' ' + donVi, 'Góc ở tâm ' + alpha + '°', ...(ganDung ? ['Lấy π ≈ 3,14'] : [])],
    [buoc('S = (' + alpha + '/360) · π · ' + r + '²', 'S = π · ' + r + '²', 'S = (' + alpha + '/360) · 2π · ' + r,
      'Lấy diện tích cả hình tròn πr² nhân với tỉ phần α/360°.', 0, 1)],
    'Rút gọn hệ số ' + alpha + ' · ' + r + '² / 360 = ' + k + '. ' + (ganDung ? 'Nhân hệ số với 3,14.' : 'Giữ π trong kết quả chính xác.'),
    () => (ganDung ? so(k * 3.14) : so(k) + 'π') + ' ' + donVi + '²');
}

/**
 * Hàm `vanh`: nhận (cong), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
function vanh(cong: boolean) {
  const R = cong ? 1 / 2 : 10;
  const r = cong ? R - 0.1 : 2;
  return bai(cong ? 'Mặt cắt ống cống' : 'Sân tròn có bồn cây', 'Diện tích vành khuyên', 'm²', 'Dùng S = π(R² − r²) với R > r',
    cong ? ['Đường kính ngoài 1 m', 'Thành ống dày 0,1 m'] : ['Sân tròn bán kính 10 m', 'Bồn cây đồng tâm, bán kính 2 m'],
    [...(cong ? [buoc('R = 0,5 m và r = 0,4 m', 'R = 1 m và r = 0,9 m', 'R = 0,5 m và r = 0,1 m',
      'Bán kính ngoài bằng nửa đường kính. Bán kính trong = bán kính ngoài − bề dày.', 0, 1)] : []),
      buoc('S = π(R² − r²)', 'S = π(R − r)²', 'S = π(R² + r²)', 'Diện tích phần vành bằng diện tích hình tròn lớn trừ diện tích hình tròn nhỏ.', 0, 1)],
    'Thay R = ' + so(R) + ' và r = ' + so(r) + ' vào, được S = ' + so(R ** 2 - r ** 2) + 'π m².',
    () => so(R ** 2 - r ** 2) + 'π m²');
}

export const chuong5 = {
  'C5-B13-M1-Q16': bai('Vùng nghe rõ của loa', 'Vị trí mỗi nhà so với vùng phủ âm', 'm', 'Nghe rõ nếu cách loa không quá bán kính phủ âm',
    ['Bán kính nghe rõ là 300 m', 'Nhà An cách O 0,25 km', 'Nhà Bình cách O 350 m'],
    [buoc('Nhà An cách 250 m', 'Nhà An cách 25 m', 'Nhà An cách 2 500 m', 'Đổi từ km sang m bằng cách nhân với 1 000.', 1),
      buoc('250 < 300 < 350', '300 < 250 < 350', '250 < 350 < 300', 'So sánh khoảng cách theo cùng đơn vị với bán kính 300 m.', 0, 1, 2)],
    'Nhà An cách loa 250 m nên nằm trong vùng. Nhà Bình cách loa 350 m nên nằm ngoài.',
    () => 'Nhà An ' + (0.25 * 1000 <= 300 ? 'nghe rõ' : 'không') + ', nhà Bình ' + (350 <= 300 ? 'nghe rõ' : 'không')),
  'C5-B14-M2-Q05': chiaVong('Góc giữa hai kim', 12, 3, true),
  'C5-B14-M2-Q13': chiaVong('Góc giữa hai kim', 12, 2, true),
  'C5-B15-M1-Q07': cungKim('phút', 10, 20, 60, 'phút'),
  'C5-B15-M1-Q16': cungKim('giờ', 6, 3, 12, 'giờ'),
  'C5-B14-M2-Q08': chiaVong('Góc giữa hai nan hoa', 12, 1, false),
  'C5-B14-M3-Q16': chiaVong('Góc giữa hai nan hoa', 8, 3, false),
  'C5-B15-M1-Q06': banh(35, 10, null),
  'C5-B15-M1-Q15': banh(35, null, 1099),
  'C5-B16-M1-Q16': tiepXuc(true),
  'C5-B16-M2-Q08': tiepXuc(false),
  'C5-B15-M2-Q06': quat('Quạt giấy mở ra', 30, 120, 'cm'),
  'C5-B15-M2-Q08': quat('Vùng tưới của vòi', 8, 90, 'm'),
  'C5-B15-M2-Q16': quat('Vùng sáng đèn pha', 30, 60, 'm', true),
  'C5-B15-M3-Q08': vanh(true),
  'C5-B15-M3-Q14': vanh(false),
  'C5-B16-M2-Q15': bai('Tầm nhìn từ hải đăng', 'd là chiều dài đoạn tiếp tuyến từ đỉnh hải đăng', 'km', 'Dùng định lý Pythagore trong tam giác vuông tại tiếp điểm',
    ['Bán kính Trái Đất 6 400 km', 'Hải đăng cao hơn mặt biển 0,05 km', 'Tầm nhìn xa nhất là tiếp tuyến tại mặt biển'],
    [buoc('d² = (6 400 + 0,05)² − 6 400²', 'd² = (6 400 + 0,05)² + 6 400²', 'd = 6 400 + 0,05',
      'Bán kính vuông góc với tiếp tuyến tại tiếp điểm. Cạnh huyền nối tâm với đỉnh hải đăng, dài R + h.', 0, 1, 2)],
    'Khai triển hiệu hai bình phương được d² = 2Rh + h² = 640,0025 km². Lấy căn dương rồi làm tròn đến km.',
    () => lamTron(Math.sqrt(2 * 6400 * 0.05 + 0.05 ** 2)) + ' km'),
};

