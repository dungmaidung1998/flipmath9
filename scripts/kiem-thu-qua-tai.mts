import assert from 'node:assert/strict';
import {
  CAU_HINH_QUA_TAI_MAC_DINH,
  phatHienDauHieuQuaTai,
  canGiamTaiDe,
  biKhoaMemBaiMoi,
  hopNhatGioiHan,
  laGioKhuya,
  gioPhutThanhSo,
  type LuotCauGanDay,
} from '../lib/quaTai.ts';

let passed = 0;
function test(name: string, fn: () => void) {
  fn();
  passed += 1;
}

const now = Date.UTC(2026, 10, 24, 12, 0, 0);

// 1-3: Giờ khuya (22:30..05:30 VN)
test('1. 22:30 là giờ khuya', () => {
  assert.equal(laGioKhuya(22 * 60 + 30), true);
});
test('2. 05:29 là quá sớm (khuya)', () => {
  assert.equal(laGioKhuya(5 * 60 + 29), true);
});
test('3. 05:30 và 22:29 không phải giờ khuya', () => {
  assert.equal(laGioKhuya(5 * 60 + 30), false);
  assert.equal(laGioKhuya(22 * 60 + 29), false);
});

// 4-5: Học liên tục >= 50 phút
test('4. Học liên tục 50 phút bật dấu hiệu lien-tuc', () => {
  const ds = phatHienDauHieuQuaTai({
    phutTrongNgayVN: 19 * 60,
    phutLienTuc: 50,
    phutTrongNgay: 50,
    cauGanDay: [],
    nowMs: now,
  });
  assert.ok(ds.includes('lien-tuc'));
});
test('5. Học liên tục 49 phút chưa bật lien-tuc', () => {
  const ds = phatHienDauHieuQuaTai({
    phutTrongNgayVN: 19 * 60,
    phutLienTuc: 49,
    phutTrongNgay: 49,
    cauGanDay: [],
    nowMs: now,
  });
  assert.equal(ds.includes('lien-tuc'), false);
});

// 6-7: Sai >= 5 câu liền nhau
test('6. Sai 5 câu liền nhau kích hoạt sai-lien-tiep & canGiamTaiDe', () => {
  const cauGanDay: LuotCauGanDay[] = [1, 2, 3, 4, 5].map((i) => ({ tsMs: now - i * 20_000, dung: false }));
  const ds = phatHienDauHieuQuaTai({
    phutTrongNgayVN: 15 * 60,
    phutLienTuc: 10,
    phutTrongNgay: 10,
    cauGanDay,
    nowMs: now,
  });
  assert.ok(ds.includes('sai-lien-tiep'));
  assert.equal(canGiamTaiDe(ds), true);
});
test('7. Sai 4 câu rồi đúng 1 câu rồi sai 2 câu không kích hoạt sai-lien-tiep', () => {
  const seq = [false, false, false, false, true, false, false].map((dung, i) => ({ tsMs: now - (10 - i) * 30_000, dung }));
  const ds = phatHienDauHieuQuaTai({
    phutTrongNgayVN: 15 * 60,
    phutLienTuc: 10,
    phutTrongNgay: 10,
    cauGanDay: seq,
    nowMs: now,
  });
  assert.equal(ds.includes('sai-lien-tiep'), false);
});

// 8-9: Làm dồn dập >= 12 câu trong 5 phút và đúng < 50%
test('8. 12 câu trong 5 phút với 5 đúng (<50%) -> bật don-dap & canGiamTaiDe', () => {
  const seq: LuotCauGanDay[] = Array.from({ length: 12 }, (_, i) => ({
    tsMs: now - i * 20_000,
    dung: i < 5, // 5/12 = 41.7% < 50%
  }));
  const ds = phatHienDauHieuQuaTai({
    phutTrongNgayVN: 15 * 60,
    phutLienTuc: 10,
    phutTrongNgay: 10,
    cauGanDay: seq,
    nowMs: now,
  });
  assert.ok(ds.includes('don-dap'));
  assert.equal(canGiamTaiDe(ds), true);
});
test('9. 12 câu trong 5 phút nhưng đúng 6/12 (50%) -> không bật don-dap', () => {
  const seq: LuotCauGanDay[] = Array.from({ length: 12 }, (_, i) => ({
    tsMs: now - i * 20_000,
    dung: i < 6,
  }));
  const ds = phatHienDauHieuQuaTai({
    phutTrongNgayVN: 15 * 60,
    phutLienTuc: 10,
    phutTrongNgay: 10,
    cauGanDay: seq,
    nowMs: now,
  });
  assert.equal(ds.includes('don-dap'), false);
});

// 10-11: Vượt giới hạn ngày & khoá mềm
test('10. Tổng phút ngày >= 90 -> bật vuot-ngay & biKhoaMemBaiMoi', () => {
  const ds = phatHienDauHieuQuaTai({
    phutTrongNgayVN: 16 * 60,
    phutLienTuc: 20,
    phutTrongNgay: 90,
    cauGanDay: [],
    nowMs: now,
  });
  assert.ok(ds.includes('vuot-ngay'));
  assert.equal(biKhoaMemBaiMoi(ds), true);
});
test('11. Tắt dấu hiệu khuya trong cấu hình lớp thì 23:00 không báo khuya', () => {
  const ds = phatHienDauHieuQuaTai(
    { phutTrongNgayVN: 23 * 60, phutLienTuc: 5, phutTrongNgay: 5, cauGanDay: [], nowMs: now },
    { ...CAU_HINH_QUA_TAI_MAC_DINH, bat_khuya: false }
  );
  assert.equal(ds.includes('khuya'), false);
});

// 12-14: Hợp nhất giới hạn GV và Phụ huynh (lấy mức chặt hơn)
test('12. Hợp nhất phút ngày giữa GV (90) và PH (60) -> lấy 60', () => {
  const hd = hopNhatGioiHan({ phut_ngay: 90 }, { phut_ngay: 60 });
  assert.equal(hd.phut_ngay, 60);
});
test('13. Hợp nhất phút ngày giữa GV (45) và PH (90) -> lấy 45 (GV chặt hơn)', () => {
  const hd = hopNhatGioiHan({ phut_ngay: 45 }, { phut_ngay: 90 });
  assert.equal(hd.phut_ngay, 45);
});
test('14. Hợp nhất giờ khuya PH 21:30 vs GV 22:30 -> lấy 21:30', () => {
  const hd = hopNhatGioiHan({ gio_khuya: '22:30', gio_sang: '05:30' }, { gio_khuya: '21:30', gio_sang: '06:00' });
  assert.equal(hd.gio_khuya, '21:30');
  assert.equal(hd.gio_sang, '06:00');
});

// 15. Parse giờ HH:MM
test('15. gioPhutThanhSo xử lý chuỗi sai quay về mặc định', () => {
  assert.equal(gioPhutThanhSo('21:45', 1350), 21 * 60 + 45);
  assert.equal(gioPhutThanhSo('bad', 1350), 1350);
});

// 16. Tổng phút học 89 chưa khoá khi giới hạn 90
test('16. 89 phút < 90 phút chưa kích hoạt vuot-ngay', () => {
  const ds = phatHienDauHieuQuaTai({
    phutTrongNgayVN: 14 * 60,
    phutLienTuc: 10,
    phutTrongNgay: 89,
    cauGanDay: [],
    nowMs: now,
  });
  assert.equal(biKhoaMemBaiMoi(ds), false);
});

console.log(`kiem-thu-qua-tai: ${passed} phép thử đạt.`);
