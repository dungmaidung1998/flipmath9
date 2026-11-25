import assert from 'node:assert/strict';
import {
  chuanHoaVanBan,
  kiemTraNoiDungToan,
  tachTuKhoa,
  timTrongNganHang,
  type HoiDapMuc,
} from '../lib/ai/hoiBinMatch.ts';

const NGAN_HANG_MAU: HoiDapMuc[] = [
  {
    id: 'hd-1',
    ku_id: 'C1-B1-M1',
    cau_hoi: 'Cách phân tích đa thức thành nhân tử để giải phương trình tích?',
    tra_loi: 'Phân tích vế trái thành tích $A(x)B(x)=0$ rồi giải $A(x)=0$ hoặc $B(x)=0$.',
    tu_khoa: ['phan tich', 'nhan tu', 'phuong trinh tich'],
  },
  {
    id: 'hd-2',
    ku_id: 'C6-B19-M1',
    cau_hoi: 'Khi nào phương trình bậc hai có hai nghiệm phân biệt',
    tra_loi: 'Khi $\\Delta = b^2 - 4ac > 0$ (hoặc $\\Delta\' > 0$) và $a \\ne 0$.',
    tu_khoa: ['delta duong', 'phuong trinh bac hai', 'hai nghiem phan biet'],
  },
  {
    id: 'hd-3',
    ku_id: 'C3-B7-M1',
    cau_hoi: 'Điều kiện xác định của căn thức bậc hai và phân thức?',
    tra_loi: 'Biểu thức dưới dấu căn không âm và mẫu thức khác $0$.',
    tu_khoa: ['dieu kien xac dinh', 'can thuc', 'phan thuc'],
  },
  {
    id: 'hd-4',
    ku_id: 'C5-B16-M3',
    cau_hoi: 'Tính chất tia phân giác và hai tiếp tuyến cắt nhau của đường tròn',
    tra_loi: '$MA = MB$, $MO$ là tia phân giác $\\widehat{AMB}$ và $OM \\perp AB$.',
    tu_khoa: ['phan giac', 'hai tiep tuyen'],
  },
  {
    id: 'hd-5',
    ku_id: 'C1-B2-M2',
    cau_hoi: 'Cách giải hệ phương trình bậc nhất hai ẩn bằng phương pháp cộng đại số',
    tra_loi: 'Nhân hệ số thích hợp rồi cộng hoặc trừ hai phương trình để khử một ẩn.',
    tu_khoa: ['he phuong trinh', 'cong dai so'],
  },
];

// 1. Bỏ 'phan' khỏi TU_DUNG nên tách từ khoá giữ được 'phan'
const tkPhan = tachTuKhoa('phân tích đa thức thành nhân tử');
assert.ok(tkPhan.includes('phan'), 'tachTuKhoa phải giữ lại từ "phan"');
assert.ok(!tkPhan.includes('la') && !tkPhan.includes('gi'), 'vẫn loại bỏ từ dừng thật sự');

// 2. Ca bắt buộc theo spec: "phân tích đa thức thành nhân tử" khớp câu ngân hàng tương ứng
const kq1 = timTrongNganHang('phân tích đa thức thành nhân tử', NGAN_HANG_MAU, 'C1-B1-M1');
assert.ok(kq1 && kq1.muc.id === 'hd-1' && kq1.diem >= 0.42, `Khớp phân tích đa thức: ${kq1?.muc.id} (${kq1?.diem})`);

// 3. Ca bắt buộc theo spec: "delta dương thì phương trình bậc hai có mấy nghiệm" khớp "Khi nào phương trình bậc hai có hai nghiệm phân biệt" với điểm >= 0.42
const kq2 = timTrongNganHang('delta dương thì phương trình bậc hai có mấy nghiệm', NGAN_HANG_MAU);
assert.ok(
  kq2 && kq2.muc.id === 'hd-2' && kq2.diem >= 0.42,
  `Kỳ vọng khớp hd-2 với điểm >= 0.42, thực tế: ${kq2?.muc.id} (diem=${kq2?.diem})`
);

// 4. Câu hỏi về phân thức khớp ngân hàng
const kq3 = timTrongNganHang('điều kiện phân thức và căn thức bậc hai', NGAN_HANG_MAU);
assert.ok(kq3 && kq3.muc.id === 'hd-3' && kq3.diem >= 0.42);

// 5. Câu hỏi về phân giác & tiếp tuyến khớp ngân hàng
const kq4 = timTrongNganHang('MO có phải tia phân giác khi hai tiếp tuyến cắt nhau không', NGAN_HANG_MAU);
assert.ok(kq4 && kq4.muc.id === 'hd-4' && kq4.diem >= 0.42);

// 6. Khớp câu hệ phương trình bằng cộng đại số
const kq5 = timTrongNganHang('giải hệ phương trình cộng đại số làm sao', NGAN_HANG_MAU);
assert.ok(kq5 && kq5.muc.id === 'hd-5' && kq5.diem >= 0.42);

// 7. Khớp chính xác trả điểm = 1
const kqExact = timTrongNganHang('Khi nào phương trình bậc hai có hai nghiệm phân biệt', NGAN_HANG_MAU);
assert.equal(kqExact?.diem, 1);

// 8. Chuẩn hoá tiếng Việt (đ -> d, bỏ dấu)
assert.equal(chuanHoaVanBan('Đường tròn & Phương trình!'), 'duong tron phuong trinh');

// 9. Chặn câu quá ngắn / quá dài / ngoài bài Toán
assert.equal(kiemTraNoiDungToan('ab').hopLe, false);
assert.equal(kiemTraNoiDungToan('x'.repeat(501)).hopLe, false);
assert.equal(kiemTraNoiDungToan('chơi free fire xem phim anime đi').hopLe, false);
assert.equal(kiemTraNoiDungToan('chào buổi sáng hôm nay trời đẹp quá').hopLe, false);

// 10. Câu hỏi Toán hợp lệ được cho qua
assert.equal(kiemTraNoiDungToan('Vì sao phải bình phương hai vế rồi thử lại nghiệm?').hopLe, true);

// 11. Câu không khớp ngân hàng trả null
assert.equal(timTrongNganHang('Hình lăng trụ đứng tam giác có mấy cạnh bên?', NGAN_HANG_MAU), null);

// 12. Vẫn giữ từ dừng 'co' nhưng không chặn tìm bằng từ khoá khác
assert.ok(!tachTuKhoa('phương trình có nghiệm').includes('co'));

console.log(`kiem-thu-hoi-bin: 12 phép thử đạt (điểm câu delta dương = ${kq2?.diem.toFixed(3)}).`);
