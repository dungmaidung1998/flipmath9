import assert from 'node:assert/strict';
import {
  chieuCaoMotDiem,
  chieuCaoHaiDiem,
  saiSoTuongDoi,
  trungViGoc,
  doDaoDongGoc,
  doLechHieuChinh,
  tinhGocNangTuCamBien,
  phanTichSoNhap,
  kiemTraKetQuaHS,
  nhanDienMaLoiDoChieuCao,
  khoangCachGanHaiDiem,
} from '../lib/do-chieu-cao/tinh.ts';

let passed = 0;
function test(name: string, fn: () => void) {
  fn();
  passed += 1;
}

// 1-4: Cách đo 1 điểm chuẩn xác
test('1. d=10, alpha=45, m=1.5 => h=11.5', () => {
  assert.equal(chieuCaoMotDiem(10, 45, 1.5), 11.5);
});
test('2. d=20, alpha=30, m=1.5 => h≈13.05', () => {
  assert.equal(chieuCaoMotDiem(20, 30, 1.5), 13.05);
});
test('3. d=15, alpha=60, m=0 => h≈25.98', () => {
  assert.equal(chieuCaoMotDiem(15, 60, 0), 25.98);
});
test('4. d=12, alpha=40, m=1.4 => h≈11.47', () => {
  assert.equal(chieuCaoMotDiem(12, 40, 1.4), 11.47);
});

// 5-7: Cách đo 2 điểm
test('5. a=10, a1=60, a2=30, m=0 => h≈8.66', () => {
  assert.equal(chieuCaoHaiDiem(10, 60, 30, 0), 8.66);
});
test('6. a=20, a1=45, a2=30, m=1.5 => h≈28.82', () => {
  const expected = Math.round(((20 * Math.tan(Math.PI / 4) * Math.tan(Math.PI / 6)) / (Math.tan(Math.PI / 4) - Math.tan(Math.PI / 6)) + 1.5) * 100) / 100;
  assert.equal(chieuCaoHaiDiem(20, 45, 30, 1.5), expected);
});
test('7. khoangCachGanHaiDiem a=10, a1=60, a2=30 => 5', () => {
  assert.equal(khoangCachGanHaiDiem(10, 60, 30), 5);
});

// 8-12: Biên lỗi đầu vào
test('8. alpha = 0 báo lỗi', () => {
  assert.throws(() => chieuCaoMotDiem(10, 0, 1.5));
});
test('9. alpha = 90 báo lỗi', () => {
  assert.throws(() => chieuCaoMotDiem(10, 90, 1.5));
});
test('10. d <= 0 báo lỗi', () => {
  assert.throws(() => chieuCaoMotDiem(0, 45, 1.5));
  assert.throws(() => chieuCaoMotDiem(-5, 45, 1.5));
});
test('11. hai điểm a1 <= a2 báo lỗi', () => {
  assert.throws(() => chieuCaoHaiDiem(10, 30, 45, 1.5));
  assert.throws(() => chieuCaoHaiDiem(10, 40, 40, 1.5));
});
test('12. chiều cao mắt âm báo lỗi', () => {
  assert.throws(() => chieuCaoMotDiem(10, 45, -0.5));
});

// 13-16: Cảm biến, trung vị, hiệu chỉnh 0°, dao động
test('13. trung vị danh sách lẻ [34.8, 35.1, 35.0, 42.0, 34.9] = 35', () => {
  assert.equal(trungViGoc([34.8, 35.1, 35.0, 42.0, 34.9]), 35);
});
test('14. trung vị danh sách chẵn [30, 32, 31, 33] = 31.5', () => {
  assert.equal(trungViGoc([30, 32, 31, 33]), 31.5);
});
test('15. độ dao động nhỏ < 1 độ', () => {
  assert.ok(doDaoDongGoc([44.9, 45.1, 45.2, 45.0]) < 1);
  assert.ok(doDaoDongGoc([43.5, 45.0, 46.2]) >= 1);
});
test('16. doLechHieuChinh và cảm biến xoay màn hình', () => {
  assert.equal(doLechHieuChinh(37.5, 2.5), 35);
  assert.equal(tinhGocNangTuCamBien(125, 0, 0), 35);
  assert.equal(tinhGocNangTuCamBien(90, -120, 90), 30);
});

// 17-20: Số nhập kiểu VN, sai số tương đối, kiểm tra HS (<= 2%), nhận diện mã lỗi
test('17. phanTichSoNhap chấp nhận dấu phẩy và khoảng trắng', () => {
  assert.equal(phanTichSoNhap(' 13,05 '), 13.05);
  assert.equal(phanTichSoNhap('11.5'), 11.5);
  assert.equal(phanTichSoNhap('abc'), null);
});
test('18. saiSoTuongDoi tính chuẩn % làm tròn 0.1', () => {
  assert.equal(saiSoTuongDoi(12.8, 13.2), 3);
  assert.equal(saiSoTuongDoi(10, 10), 0);
});
test('19. kiemTraKetQuaHS sai lệch <= 2% đạt', () => {
  assert.equal(kiemTraKetQuaHS(13.0, 13.05), true);
  assert.equal(kiemTraKetQuaHS(13.6, 13.05), false);
});
test('20. nhận diện quên cộng m -> E-HTL-05', () => {
  const loi = nhanDienMaLoiDoChieuCao({
    cachDo: 'mot-diem',
    hHsNhap: 10,
    hTinh: 11.5,
    d: 10,
    alpha1: 45,
    m: 1.5,
  });
  assert.equal(loi?.maLoi, 'E-HTL-05');
});
test('21. nhận diện dùng cot thay tan -> E-HTL-02', () => {
  const loi = nhanDienMaLoiDoChieuCao({
    cachDo: 'mot-diem',
    hHsNhap: 20 / Math.tan((30 * Math.PI) / 180) + 1.5,
    hTinh: 13.05,
    d: 20,
    alpha1: 30,
    m: 1.5,
  });
  assert.equal(loi?.maLoi, 'E-HTL-02');
});
test('22. nhận diện bấm máy RAD thay DEG -> E-HTL-03', () => {
  const hRad = 10 * Math.tan(45) + 1.5;
  const loi = nhanDienMaLoiDoChieuCao({
    cachDo: 'mot-diem',
    hHsNhap: hRad,
    hTinh: 11.5,
    d: 10,
    alpha1: 45,
    m: 1.5,
  });
  assert.equal(loi?.maLoi, 'E-HTL-03');
});

console.log(`kiem-thu-do-chieu-cao: ${passed} phép thử đạt.`);
