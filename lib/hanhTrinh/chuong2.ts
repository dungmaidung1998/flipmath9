/**
 * FILE NÀY LÀM GÌ: Mô-đun TypeScript/JavaScript hỗ trợ xử lý dữ liệu và nghiệp vụ trong hệ thống FlipMath 9.
 * AI DÙNG: dùng chung
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: ./mau
 */
import { bai, buoc, so } from './mau';

/**
 * Hàm `nganSach`: nhận (ten, hang, donVi, tien, gia, hoiBpt, traTruoc), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
function nganSach(ten: string, hang: string, donVi: string, tien: number, gia: number, hoiBpt: boolean, traTruoc = 0) {
  const gioiHan = tien - traTruoc;
  // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
  const x = Math.floor(gioiHan / gia);
  const p = so(gia) + 'x ≤ ' + so(gioiHan);
  const duKien = ['Có ' + so(tien) + ' đồng', 'Giá mỗi ' + hang + ' là ' + so(gia) + ' đồng'];
  if (traTruoc) duKien.push('Bàn phím giá ' + so(traTruoc) + ' đồng');
  const moHinh = [buoc(p, p.replace('≤', '<'), p.replace('≤', '≥'), 'Tiền mua = số lượng × đơn giá. Số tiền này không vượt quá ngân sách còn lại.', 0, 1)];
  if (traTruoc) {
    moHinh[0].dungDuKien.push(2);
    moHinh.unshift(buoc('Còn ' + so(gioiHan) + ' đồng', 'Còn ' + so(tien) + ' đồng', 'Còn ' + so(traTruoc) + ' đồng',
      'Số tiền còn lại = số tiền ban đầu − giá bàn phím.', 0, 2));
  }
  return bai(ten, 'x là số ' + hang + ' mua được', donVi, 'x là số nguyên không âm', duKien, moHinh,
    'Chia hai vế cho ' + so(gia) + ' (số dương). ' + x + ' ' + donVi + ' hết ' + so(x * gia) + ' đồng và ' + (x + 1) + ' ' + donVi + ' vượt ngân sách còn lại.',
    () => hoiBpt ? p : x + ' ' + donVi);
}

export const chuong2 = {
  'C2-B4-M1-Q08': bai('Chiều rộng vườn', 'x là chiều rộng', 'm', 'x > 0',
    ['Chiều dài hơn chiều rộng 3 m', 'Diện tích 40 m²'],
    [buoc('x(x + 3) = 40', 'x + (x + 3) = 40', 'x(x − 3) = 40', 'Chiều dài bằng x + 3. Diện tích bằng chiều rộng nhân chiều dài.', 0, 1)],
    'Chuyển vế và phân tích: (x − 5)(x + 8) = 0. Nghiệm −8 không thoả x > 0.',
    () => 'x(x + 3) = 40; x = ' + (-3 + Math.sqrt(3 ** 2 + 4 * 40)) / 2),
  'C2-B5-M1-Q06': bai('Tải trọng xe tải', 'm là khối lượng hàng', 'tấn', 'm ≥ 0',
    ['Xe chở tối đa 5 tấn hàng', 'm biểu thị khối lượng hàng'],
    [buoc('m ≤ 5', 'm < 5', 'm ≥ 5', 'Tối đa a nghĩa là giá trị không vượt quá a, kể cả bằng a.', 0, 1)],
    'Kết hợp với m ≥ 0, được 0 ≤ m ≤ 5. Xe có thể chở đúng 5 tấn.', () => 'm ≤ ' + 5),
  'C2-B5-M1-Q08': bai('Giới hạn tốc độ', 'v là vận tốc được phép', 'km/h', 'v phải thoả đồng thời cả hai giới hạn',
    ['Tốc độ tối thiểu 60 km/h', 'Tốc độ tối đa 100 km/h'],
    [buoc('v ≥ 60', 'v > 60', 'v ≤ 60', 'Tối thiểu a nghĩa là v ≥ a.', 0),
      buoc('v ≤ 100', 'v < 100', 'v ≥ 100', 'Tối đa b nghĩa là v ≤ b.', 1)],
    'Lấy giao của v ≥ 60 và v ≤ 100. Cả hai mốc đều được phép.', () => 60 + ' ≤ v ≤ ' + 100),
  'C2-B5-M1-Q15': bai('Tải trọng thang máy', 'x là khối lượng hàng mang thêm', 'kg', 'x ≥ 0',
    ['Thang chở tối đa 600 kg', '8 người có tổng khối lượng 560 kg', 'Mang thêm x kg hàng'],
    [buoc('560 + x ≤ 600', '560 + x < 600', '8x ≤ 600', 'Tổng tải = khối lượng người + khối lượng hàng. Tổng tải không vượt quá 600 kg.', 0, 1, 2)],
    'Trừ 560 ở hai vế. Kết hợp x ≥ 0 được 0 ≤ x ≤ ' + (600 - 560) + ' kg.', () => 560 + ' + x ≤ ' + 600),
  'C2-B6-M1-Q06': nganSach('Mua bút', 'bút', 'cái', 50000, 3000, true),
  'C2-B6-M1-Q07': nganSach('Mua bút', 'bút', 'cái', 50000, 3000, false),
  'C2-B6-M1-Q14': nganSach('Mua vé xem phim', 'vé', 'vé', 400000, 60000, true),
  'C2-B6-M1-Q15': nganSach('Mua vé xem phim', 'vé', 'vé', 400000, 60000, false),
  'C2-B6-M2-Q16': nganSach('Mua bàn phím và bút', 'bút', 'chiếc', 1200000, 25000, false, 450000),
};

