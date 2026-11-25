/**
 * ĐỒ THỊ LỖI GỐC VÀ NGÂN HÀNG HOẠT ĐỘNG GỘP — TOÁN 9 (FlipMath9)
 * Bộ đề xuất MathMind (mathmind.js) dùng tệp này để biết vai trò lỗi gốc / lỗi kéo theo của mọi mã lỗi.
 * Nội dung là BẢN NHÁP — giáo viên duyệt.
 */
import { ERROR_NODES_C3, CAUSAL_EDGES_C3, ACTIVITIES_C3 } from './t9-chuong3.js';
import * as C1 from './t9-chuong1.js';
import * as C2 from './t9-chuong2.js';
import * as C4 from './t9-chuong4.js';
import * as C5 from './t9-chuong5.js';
import * as C6 from './t9-chuong6.js';
import * as C7 from './t9-chuong7.js';
import * as C8 from './t9-chuong8.js';
import * as C9 from './t9-chuong9.js';
import * as C10 from './t9-chuong10.js';

const KHAC = [C1, C2, C4, C5, C6, C7, C8, C9, C10];
export const ALL_ERROR_NODES = [...ERROR_NODES_C3, ...KHAC.flatMap((C) => C.ERROR_NODES)];
export const ALL_CAUSAL_EDGES = [...CAUSAL_EDGES_C3, ...KHAC.flatMap((C) => C.CAUSAL_EDGES)];
/** Hoạt động trên lớp theo mã lỗi Toán 9 (hoạt động dùng chung nằm trong mathmind.js). */
export const ACTIVITIES_T9 = [...ACTIVITIES_C3, ...KHAC.flatMap((C) => C.ACTIVITIES)];
