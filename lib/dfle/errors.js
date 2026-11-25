/**
 * TỪ ĐIỂN MÃ LỖI MÔN TOÁN 9 — LỚP TƯƠNG THÍCH
 * ---------------------------------------------------------------------------
 * Toàn bộ nội dung thật nằm ở src/t9-noi-dung.js (gộp các chương t9-chuongN.js), cắt theo TỪNG MỤC của sách giáo
 * khoa. Tệp này chỉ dựng lại các cấu trúc mà phần còn lại của bộ máy đang dùng
 * (rules.js, engine.js), để đổi nội dung chương không phải sửa bộ máy.
 *
 * Muốn thêm mã lỗi hay đổi đơn vị kiến thức thì sửa src/t9-chuongN.js, KHÔNG sửa
 * tệp này — sửa hai chỗ là con đường ngắn nhất tới hai bản dữ liệu lệch nhau.
 */

import { UNITS, ERRORS, REMEDIATION } from './t9-noi-dung.js';

/** @typedef {{ code:string, ku:string, misconception:string, remediation:string, source:string }} ErrorEntry */

/** @type {ErrorEntry[]} */
export const ERROR_DICTIONARY = ERRORS.map((e) => ({
  code: e.code,
  ku: e.ku,
  misconception: e.misconception,
  remediation: e.remediation,
  // Cột nguồn do học sinh điền sau khi thống kê bài kiểm tra thật của lớp mình.
  // Đây là phần công việc nghiên cứu, không được để máy điền hộ.
  source: '[HS điền: thống kê từ ___ bài kiểm tra]'
}));

/** @type {Map<string, ErrorEntry>} */
export const ERROR_BY_CODE = new Map(ERROR_DICTIONARY.map((e) => [e.code, e]));

/**
 * Kho nội dung bổ trợ. Mỗi mã lỗi trỏ tới một vi bài học.
 * @type {Record<string, {id:string, title:string, type:string, minutes:number}>}
 */
export const REMEDIATION_CATALOG = Object.fromEntries(
  Object.entries(REMEDIATION).map(([id, r]) => [
    id, { id, title: 'Vi bài học: ' + r.title, type: 'micro-lesson', minutes: r.minutes }
  ])
);

/** Đơn vị kiến thức và quan hệ tiên quyết (dùng cho quy tắc R05). */
export const KNOWLEDGE_UNITS = UNITS.map((u) => ({
  id: u.id, name: u.name, order: u.order, prerequisite: u.prerequisite
}));

export const KU_BY_ID = new Map(KNOWLEDGE_UNITS.map((k) => [k.id, k]));
