/**
 * BỘ TỔNG HỢP NỘI DUNG TOÁN 9 (FlipMath9, Kết nối tri thức với cuộc sống)
 * ===========================================================================
 * Mọi phần của bộ máy (errors.js, tutor.js, mathmind.js, web) lấy nội dung Toán 9 từ đây.
 * Thêm chương mới: tạo t9-chuongN.js + t9-vi-bai-hoc-cN.js theo khuôn t9-chuong3.js rồi gộp vào CHUONG_T9.
 */
import * as C1 from './t9-chuong1.js';
import * as C2 from './t9-chuong2.js';
import * as C3 from './t9-chuong3.js';
import { VI_BAI_HOC_T9_C3 } from './t9-vi-bai-hoc-c3.js';
import * as C4 from './t9-chuong4.js';
import * as C5 from './t9-chuong5.js';
import * as C6 from './t9-chuong6.js';
import * as C7 from './t9-chuong7.js';
import * as C8 from './t9-chuong8.js';
import * as C9 from './t9-chuong9.js';
import * as C10 from './t9-chuong10.js';
import { ON_TAP, DOI_TEN } from './t9-on-tap.js';

/** Các chương Toán 9 đã có nội dung: [mã chương, module chương, vi bài học] */
const CHUONG_GOC = [
  ['C1', C1, C1.VI_BAI_HOC], ['C2', C2, C2.VI_BAI_HOC], ['C3', C3, VI_BAI_HOC_T9_C3],
  ['C4', C4, C4.VI_BAI_HOC], ['C5', C5, C5.VI_BAI_HOC], ['C6', C6, C6.VI_BAI_HOC], ['C7', C7, C7.VI_BAI_HOC],
  ['C8', C8, C8.VI_BAI_HOC], ['C9', C9, C9.VI_BAI_HOC], ['C10', C10, C10.VI_BAI_HOC]
];

/**
 * Ghép Luyện tập chung / Bài tập cuối chương (t9-on-tap.js) vào chương: chèn sau mục `sau`,
 * đánh lại số thứ tự liên tiếp trong khoảng của chương (24/11/2026).
 */
function ghepOnTap(ma, C) {
  const ot = ON_TAP[ma];
  if (!ot) return C;
  const units = C.UNITS.map((u) => (DOI_TEN[u.id] ? { ...u, ...DOI_TEN[u.id] } : { ...u }));
  for (const n of ot.units) {
    const i = units.findIndex((u) => u.id === n.sau);
    units.splice(i < 0 ? units.length : i + 1, 0, { ...n, prerequisite: n.sau });
  }
  const goc = Math.min(...C.UNITS.map((u) => u.order));
  units.forEach((u, i) => { u.order = goc + i; });
  return { ...C, UNITS: units, UNIT_BY_ID: new Map(units.map((u) => [u.id, u])), QUESTIONS: [...C.QUESTIONS, ...ot.cau] };
}
export const CHUONG_T9 = CHUONG_GOC.map(([ma, C, V]) => [ma, ghepOnTap(ma, C), V]);

export const UNITS = CHUONG_T9.flatMap(([, C]) => C.UNITS);
export const ERRORS = CHUONG_T9.flatMap(([, C]) => C.ERRORS);
export const QUESTIONS = CHUONG_T9.flatMap(([, C]) => C.QUESTIONS);
export const REMEDIATION = Object.assign({}, ...CHUONG_T9.map(([, C]) => C.REMEDIATION));
export const HINTS = Object.assign({}, ...CHUONG_T9.map(([, C]) => C.HINTS));
export const VI_BAI_HOC = Object.assign({}, ...CHUONG_T9.map(([, , V]) => V));
