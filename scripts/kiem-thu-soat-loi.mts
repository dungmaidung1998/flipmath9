// Kiểm thử quy tắc soát lỗi và ôn ngắt quãng. Chạy: node --experimental-strip-types scripts/kiem-thu-soat-loi.mts
import { chonLoi, chonCau, chuyenTrangThai, saiLai, congNgay } from '../lib/soatLoi.ts';
import assert from 'node:assert/strict';
const now = Date.parse('2026-11-10T05:00:00Z'), hn = '2026-11-10';
const L = (c, tt, han, n = 1, ku = 'K1', cuoi = '2026-11-09T00:00:00Z') => ({ error_code: c, trang_thai: tt, han_on: han, so_lan_sai: n, tai_phat: 0, lan_sai_cuoi: cuoi, ku_goc: ku, chu_ky_tu: cuoi });
const ds = [L('A', 'can-sua', null, 1), L('B', 'can-sua', null, 4, 'K0', '2026-09-01T00:00:00Z'), L('C', 'cho-on-1', '2026-11-08'), L('D', 'cho-on-2', '2026-11-10'), L('E', 'cho-on-1', '2026-11-11'), L('F', 'da-nho', null), L('G', 'cho-on-1', '2026-11-09'), L('H', 'cho-on-1', '2026-11-10', 9), L('I', 'can-sua', null, 2, 'K2'), L('J', 'can-sua', null, 1, 'K9')];
const c = chonLoi(ds, hn, 'K9', now);
assert.deepEqual(c.map((x) => x.ma.error_code + ':' + x.loai), ['C:on-1', 'G:on-1', 'H:on-1', 'J:sua', 'I:sua']); // 3 ôn (hạn cũ trước; D và H cùng hạn → H lặp nhiều hơn), rồi lỗi bài liền trước, rồi điểm ưu tiên (I: 2×1 = B: 5×0,4 → theo mã)
const nh = [{ question_id: 'q1', level: 1, ma: ['J'] }, { question_id: 'q2', level: 2, ma: ['J', 'I'] }, { question_id: 'q3', level: 1, ma: ['I'] }, { question_id: 'q4', level: 1, ma: ['C'] }, { question_id: 'q5', level: 2, ma: ['C'] }];
const r = chonCau(c, nh, { C: ['q4'] }, new Set(['q1']));
assert.deepEqual(r.cau.map((x) => x.question_id + ':' + x.error_code), ['q5:C', 'q2:J', 'q1:J', 'q3:I']);
assert.deepEqual(r.thieu, ['G', 'H']);
assert.deepEqual(chuyenTrangThai('J', 'sua', 2, 2, hn), { error_code: 'J', loai: 'sua', dung: 2, tong: 2, danhGia: 'da-khac-phuc', trangThaiMoi: 'cho-on-1', hanMoi: '2026-11-13' });
assert.equal(chuyenTrangThai('J', 'sua', 1, 2, hn).trangThaiMoi, 'can-sua');
assert.equal(chuyenTrangThai('J', 'sua', 1, 2, hn).danhGia, 'dang-sua');
assert.deepEqual([chuyenTrangThai('C', 'on-1', 1, 1, hn).trangThaiMoi, chuyenTrangThai('C', 'on-1', 1, 1, hn).hanMoi], ['cho-on-2', '2026-11-17']);
assert.deepEqual([chuyenTrangThai('C', 'on-1', 0, 1, hn).trangThaiMoi, chuyenTrangThai('C', 'on-1', 0, 1, hn).hanMoi], ['cho-on-1', '2026-11-11']);
assert.equal(chuyenTrangThai('D', 'on-2', 1, 1, hn).trangThaiMoi, 'da-nho');
assert.equal(chuyenTrangThai('D', 'on-2', 0, 1, hn).trangThaiMoi, 'cho-on-1');
assert.deepEqual(saiLai({ trang_thai: 'da-nho', so_lan_sai: 2, tai_phat: 0 }), { trang_thai: 'can-sua', so_lan_sai: 3, tai_phat: 1, moChuKy: true });
assert.equal(saiLai({ trang_thai: 'can-sua', so_lan_sai: 2, tai_phat: 0 }).moChuKy, false);
assert.equal(congNgay('2026-12-30', 3), '2027-01-02');
console.log('ok');
