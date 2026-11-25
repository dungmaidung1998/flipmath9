import assert from 'node:assert/strict';
import {
  danhGiaTuGiai,
  danhGiaTuGiaiChamVo,
  tinhChiSoTuLuc,
  tinhDoDocTuyenTinh,
  tinhTuLucTheoHocSinh,
  kiemTraLoDapAnGoiY,
  type GoiYSuKienRow,
} from '../lib/khkt/tuLuc.ts';

let passed = 0;
function test(name: string, fn: () => void) {
  fn();
  passed += 1;
}

const mkEv = (ov: Partial<GoiYSuKienRow> = {}): GoiYSuKienRow => ({
  id: ov.id ?? 'e1',
  student_id: ov.student_id ?? 'HS01',
  nguon: ov.nguon ?? 'goi-y-loi',
  tang: ov.tang === undefined ? 1 : ov.tang,
  ku_id: ov.ku_id ?? 'C1-B1-M1',
  question_id: ov.question_id ?? 'Q1',
  error_code: ov.error_code ?? 'E-HPT-01',
  co_ai: ov.co_ai ?? false,
  tao_luc: ov.tao_luc ?? '2026-11-10T08:00:00.000Z',
  thu_lai_luc: ov.thu_lai_luc === undefined ? '2026-11-10T09:00:00.000Z' : ov.thu_lai_luc,
  tu_giai: ov.tu_giai === undefined ? true : ov.tu_giai,
  so_goi_y_them: ov.so_goi_y_them ?? 0,
  xem_loi_giai: ov.xem_loi_giai ?? false,
});

// 1. Ca cơ bản tự giải trong 1 giờ -> đạt
test('1. Tự giải đúng sau 1h, không thêm gợi ý, không xem lời giải', () => {
  const k = danhGiaTuGiai({
    taoLucIso: '2026-11-10T08:00:00Z',
    thuLaiLucIso: '2026-11-10T09:00:00Z',
    ketQuaDung: true,
    soGoiYThem: 0,
    xemLoiGiai: false,
  });
  assert.deepEqual(k, { hopLeHan48h: true, tuGiai: true });
});

// 2. Biên chưa thử lại
test('2. Chưa có lần thử lại (null)', () => {
  const k = danhGiaTuGiai({
    taoLucIso: '2026-11-10T08:00:00Z',
    thuLaiLucIso: null,
    ketQuaDung: true,
  });
  assert.deepEqual(k, { hopLeHan48h: false, tuGiai: false });
});

// 3. Biên đúng 48h hợp lệ, quá 48h không tính
test('3. Đúng 48h tính; 48h01s không tính', () => {
  const dung48 = danhGiaTuGiai({
    taoLucIso: '2026-11-10T08:00:00Z',
    thuLaiLucIso: '2026-11-12T08:00:00Z',
    ketQuaDung: true,
  });
  const qua48 = danhGiaTuGiai({
    taoLucIso: '2026-11-10T08:00:00Z',
    thuLaiLucIso: '2026-11-12T08:00:01Z',
    ketQuaDung: true,
  });
  assert.equal(dung48.tuGiai, true);
  assert.equal(qua48.hopLeHan48h, false);
});

// 4. Xin thêm gợi ý tầng cao hơn -> không tính tự giải
test('4. Xin thêm gợi ý tầng cao hơn dù đúng vẫn tuGiai = false', () => {
  const k = danhGiaTuGiai({
    taoLucIso: '2026-11-10T08:00:00Z',
    thuLaiLucIso: '2026-11-10T10:00:00Z',
    ketQuaDung: true,
    soGoiYThem: 1,
  });
  assert.equal(k.tuGiai, false);
});

// 5. Mở xem lời giải -> không tính tự giải
test('5. Mở xem lời giải trước khi thử lại -> tuGiai = false', () => {
  const k = danhGiaTuGiai({
    taoLucIso: '2026-11-10T08:00:00Z',
    thuLaiLucIso: '2026-11-10T10:00:00Z',
    ketQuaDung: true,
    xemLoiGiai: true,
  });
  assert.equal(k.tuGiai, false);
});

// 6. Chấm vở: dòng sai lùi xuống -> tiến bộ
test('6. Chấm vở tiến bộ: dongSaiDau từ 2 sang 4', () => {
  assert.equal(
    danhGiaTuGiaiChamVo({
      taoLucIso: '2026-11-10T08:00:00Z',
      thuLaiLucIso: '2026-11-10T08:30:00Z',
      dongSaiDauCu: 2,
      dongSaiDauMoi: 4,
      trangThaiMoi: 'nua-bai',
    }),
    true
  );
});

// 7. Chấm vở: hoàn thành bài
test('7. Chấm vở hoàn thành bài (trangThai=xong)', () => {
  assert.equal(
    danhGiaTuGiaiChamVo({
      taoLucIso: '2026-11-10T08:00:00Z',
      thuLaiLucIso: '2026-11-10T08:30:00Z',
      dongSaiDauCu: 2,
      dongSaiDauMoi: null,
      trangThaiMoi: 'xong',
    }),
    true
  );
});

// 8. Chấm vở: vẫn sai ở dòng cũ hoặc sớm hơn -> false
test('8. Chấm vở giậm chân ở dòng 2 -> false', () => {
  assert.equal(
    danhGiaTuGiaiChamVo({
      taoLucIso: '2026-11-10T08:00:00Z',
      thuLaiLucIso: '2026-11-10T08:30:00Z',
      dongSaiDauCu: 2,
      dongSaiDauMoi: 2,
      trangThaiMoi: 'sai',
    }),
    false
  );
});

// 9. Tuần < 5 lượt gợi ý -> TL tuần = null ("chưa đủ dữ liệu")
test('9. Tuần có 4 lượt nhận gợi ý -> tl tuần phải là null', () => {
  const ds = [1, 2, 3, 4].map((i) => mkEv({ id: `w1-${i}`, tao_luc: `2026-11-0${i + 1}T08:00:00Z`, thu_lai_luc: `2026-11-0${i + 1}T09:00:00Z` }));
  const kq = tinhChiSoTuLuc(ds);
  assert.equal(kq.theoTuan[0].tl, null);
  assert.equal(kq.tongHop.tl, 100);
});

// 10. Tuần >= 5 lượt tính TL chính xác
test('10. Tuần có 5 lượt (3 tự giải, 2 không) -> TL = 60%', () => {
  const ds = [
    mkEv({ id: 'a1', tu_giai: true }),
    mkEv({ id: 'a2', tu_giai: true }),
    mkEv({ id: 'a3', tu_giai: true }),
    mkEv({ id: 'a4', tu_giai: false }),
    mkEv({ id: 'a5', tu_giai: true, so_goi_y_them: 1 }),
  ];
  const kq = tinhChiSoTuLuc(ds);
  assert.equal(kq.theoTuan[0].tl, 60);
  assert.equal(kq.tongHop.tl, 60);
});

// 11. So sánh AI vs không AI
test('11. Tách đúng nhóm co_ai=true và co_ai=false', () => {
  const ds = [
    mkEv({ id: '1', co_ai: true, tu_giai: true }),
    mkEv({ id: '2', co_ai: true, tu_giai: false }),
    mkEv({ id: '3', co_ai: false, tu_giai: true }),
    mkEv({ id: '4', co_ai: false, tu_giai: true }),
  ];
  const kq = tinhChiSoTuLuc(ds);
  assert.equal(kq.coAi.tl, 50);
  assert.equal(kq.khongAi.tl, 100);
});

// 12. Lọc theo nguồn
test('12. Lọc theo nguồn hoi-bin', () => {
  const ds = [
    mkEv({ id: '1', nguon: 'hoi-bin', tu_giai: true }),
    mkEv({ id: '2', nguon: 'goi-y-loi', tu_giai: false }),
  ];
  const kq = tinhChiSoTuLuc(ds, 'hoi-bin');
  assert.equal(kq.tongHop.tongNhan, 1);
  assert.equal(kq.tongHop.tl, 100);
});

// 13. Hồi quy tuyến tính xu hướng
test('13. Độ dốc tăng dần [40, 60, 80] = +20%/tuần (↑)', () => {
  assert.equal(tinhDoDocTuyenTinh([40, 60, 80]), 20);
  assert.equal(tinhDoDocTuyenTinh([70, 50, 30]), -20);
});

// 14. Tỉ lệ xem lời giải và mức gợi ý TB
test('14. Tính đúng mức gợi ý TB và tỉ lệ xem lời giải', () => {
  const ds = [
    mkEv({ id: '1', tang: 1, xem_loi_giai: true, tu_giai: false }),
    mkEv({ id: '2', tang: 3, xem_loi_giai: false, tu_giai: true }),
  ];
  const kq = tinhChiSoTuLuc(ds);
  assert.equal(kq.tongHop.mucGoiYTB, 2);
  assert.equal(kq.tongHop.tiLeXemLoiGiai, 50);
});

// 15. Cảnh báo lộ đáp án ở Hỏi Bin / Gợi ý AI
test('15. kiemTraLoDapAnGoiY phát hiện lộ đáp án cuối', () => {
  assert.ok(kiemTraLoDapAnGoiY('Vậy đáp án đúng là x = 5 nhé.', ['5']));
  assert.ok(kiemTraLoDapAnGoiY('Kết quả là nghiệm (2; 1).', ['(2; 1)']));
  assert.equal(kiemTraLoDapAnGoiY('Em thử đặt nhân tử chung rồi xét từng thừa số bằng 0 nhé.', ['x = 5']), null);
});

// 16. Thống kê từng học sinh
test('16. tinhTuLucTheoHocSinh trả về đúng danh sách theo HS', () => {
  const res = tinhTuLucTheoHocSinh(
    [mkEv({ student_id: 'HS1', tu_giai: true }), mkEv({ student_id: 'HS2', tu_giai: false })],
    ['HS1', 'HS2', 'HS3']
  );
  assert.equal(res[0].tl, 100);
  assert.equal(res[1].tl, 0);
  assert.equal(res[2].tl, null);
});

console.log(`kiem-thu-tu-luc: ${passed} phép thử đạt.`);
