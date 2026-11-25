/**
 * FILE NÀY LÀM GÌ: Mô-đun TypeScript/JavaScript hỗ trợ xử lý dữ liệu và nghiệp vụ trong hệ thống FlipMath 9.
 * AI DÙNG: dùng chung
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: ./t9-noi-dung.js
 * CẤU TRÚC DỮ LIỆU: mảng các đối tượng bài/mục kiến thức Toán 9 (ví dụ { id, bai, muc, name, ... }).
 */
/**
 * BỘ TỔNG HỢP NỘI DUNG CHO WEB — TOÁN 9 (FlipMath9)
 * Lấy từ t9-noi-dung.js (đồng bộ với dfle-engine). Giữ tên ALL_* để các trang cũ dùng tiếp.
 */
import { UNITS, ERRORS, QUESTIONS, REMEDIATION, HINTS, VI_BAI_HOC } from './t9-noi-dung.js';

export const ALL_UNITS = UNITS;
export const ALL_ERRORS = ERRORS;
export const ALL_QUESTIONS = QUESTIONS;
export const ALL_REMEDIATION = REMEDIATION;
export const ALL_HINTS = HINTS;
export const ALL_VI_BAI_HOC = VI_BAI_HOC;

export const UNIT_MAP = new Map(ALL_UNITS.map((u) => [u.id, u]));
export const ERROR_MAP = new Map(ALL_ERRORS.map((e) => [e.code, e]));
export const QUESTION_MAP = new Map(ALL_QUESTIONS.map((q) => [q.id, q]));

export const getUnit = (id) => UNIT_MAP.get(id) || null;
export const getError = (code) => ERROR_MAP.get(code) || null;
export const getQuestion = (id) => QUESTION_MAP.get(id) || null;
export const getViBaiHoc = (id) => ALL_VI_BAI_HOC[id] || null;
