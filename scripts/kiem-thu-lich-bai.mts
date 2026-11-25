// Kiểm thử lịch giao bài ba mốc. Chạy: node --experimental-strip-types scripts/kiem-thu-lich-bai.mts
import assert from 'node:assert/strict';
import { trangThaiBai, tuDienChuong, gioVN, ngayDep, gioDep } from '../lib/lichBai.ts';

// Thứ Hai 16/11/2026 và thứ Năm: tiết Toán thứ 2 và thứ 5
const l = tuDienChuong(['B1', 'B2', 'B3'], '2026-11-15', [1, 4]);
assert.deepEqual(l.map((x) => x.ngay_hoc), ['2026-11-16', '2026-11-19', '2026-11-23']);
assert.deepEqual(l.map((x) => x.ngay_mo), ['2026-11-13', '2026-11-16', '2026-11-19']);
assert.equal(l[0].han_chuan_bi, '2026-11-15T12:00:00.000Z'); // 19:00 Chủ nhật giờ Việt Nam
assert.equal(gioDep(l[0].han_chuan_bi), '19:00 15/11');
assert.equal(ngayDep('2026-11-16'), '16/11');
assert.deepEqual(tuDienChuong(['B1'], '2026-11-15', []), []);

const lich = l[0], muc = ['M1', 'M2'];
const t = (s: string) => Date.parse(s);
assert.equal(trangThaiBai(undefined, muc, new Map()), 'chua-giao');
assert.equal(trangThaiBai(lich, muc, new Map(), t('2026-11-12T10:00:00+07:00')), 'chua-mo');
assert.equal(trangThaiBai(lich, muc, new Map([['M1', '2026-11-14T10:00:00Z']]), t('2026-11-14T20:00:00+07:00')), 'dang-mo');
assert.equal(trangThaiBai(lich, muc, new Map([['M1', '2026-11-14T10:00:00Z']]), t('2026-11-15T19:01:00+07:00')), 'qua-han');
assert.equal(trangThaiBai(lich, muc, new Map([['M1', '2026-11-14T10:00:00Z'], ['M2', gioVN('2026-11-15', '18:59')]]), t('2026-11-16T08:00:00+07:00')), 'da-chuan-bi');
assert.equal(trangThaiBai(lich, muc, new Map([['M1', '2026-11-14T10:00:00Z'], ['M2', gioVN('2026-11-15', '19:30')]]), t('2026-11-16T08:00:00+07:00')), 'nop-tre');
console.log('ok');
