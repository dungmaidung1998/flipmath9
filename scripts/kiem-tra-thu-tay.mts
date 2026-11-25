import assert from 'node:assert/strict';
import { THI_NGHIEM, thiNghiemCuaMuc } from '../lib/thiNghiem.ts';
// @ts-ignore
import { UNITS as C5_UNITS } from '../lib/dfle/t9-chuong5.js';

const C5_IDS = C5_UNITS.map((u: any) => String(u.id));
assert.equal(C5_IDS.length, 13, 'Chương V phải có đúng 13 mục kiến thức');

const c5Items = THI_NGHIEM.filter((t) => t.ku.startsWith('C5-'));
assert.equal(c5Items.length, 13, 'Phòng thí nghiệm Chương V phải có đủ 13 mục C5');

const c5Set = new Set(c5Items.map((t) => t.ku));
for (const id of C5_IDS) {
  assert.ok(c5Set.has(id), `Thiếu mục Thử tay cho ${id}`);
  assert.ok(thiNghiemCuaMuc(id) !== null, `thiNghiemCuaMuc(${id}) không được trả null`);
}

// Theo HANG-CHO-GIAO-VIEC.md: Chương VI-X đang tạm hoãn, không tạo mục thử tay C6-C10
for (const c of ['C6-', 'C7-', 'C8-', 'C9-', 'C10-']) {
  const dem = THI_NGHIEM.filter((t) => t.ku.startsWith(c)).length;
  assert.equal(dem, 0, `Không được triển khai ${c} khi Chương VI–X đang tạm hoãn`);
}

const LOAI_C5 = new Set([
  'tron-diem',
  'tron-doi-xung',
  'day-cung',
  'cung-quat',
  'thang-tron',
  'hai-tron',
]);

for (const item of c5Items) {
  assert.ok(LOAI_C5.has(item.khung.loai), `${item.ku} phải dùng khung Chương V hợp lệ`);
  assert.ok(item.ten.trim().length >= 5, `${item.ku} thiếu tên thí nghiệm`);
  assert.ok(item.viec.trim().length >= 10, `${item.ku} thiếu hướng dẫn thao tác`);
  assert.equal(item.cauHoi.luaChon.length, 4, `${item.ku} phải có đủ 4 phương án trả lời`);
  assert.ok(
    item.cauHoi.dung >= 0 && item.cauHoi.dung <= 3,
    `${item.ku} có chỉ số đáp án đúng không hợp lệ`
  );
  assert.ok(item.cauHoi.giaiThich.trim().length >= 10, `${item.ku} thiếu giải thích đáp án`);
}

// Kiểm tra không có dấu $ lẻ làm vỡ KaTeX trong tất cả mục C5
for (const item of c5Items) {
  for (const s of [item.ten, item.viec, item.goiY ?? '', item.cauHoi.hoi, item.cauHoi.giaiThich, ...item.cauHoi.luaChon]) {
    const soDollar = (s.match(/\$/g) ?? []).length;
    assert.equal(soDollar % 2, 0, `${item.ku} có chuỗi lệch dấu $ KaTeX: ${s}`);
  }
}

console.log(`kiem-tra-thu-tay: Đạt đủ ${c5Items.length}/13 mục Chương V (C5-B13-M1..C5-B17-M2), tổng ${THI_NGHIEM.length} thí nghiệm.`);
