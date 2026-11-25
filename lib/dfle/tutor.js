/**
 * TRỢ GIẢNG: GỢI Ý THEO TẦNG NEO VÀO TỪ ĐIỂN MÃ LỖI
 * ---------------------------------------------------------------------------
 * KHÔNG gọi mô hình sinh tự do. Hệ thống đã biết học sinh đang mắc quan niệm sai
 * NÀO (nhờ bảng distractor_errors), nên gợi ý được soạn sẵn theo đúng quan niệm
 * sai đó, chia ba tầng và mở dần.
 *
 * Vì sao chọn cách này thay vì gọi AI (cần trả lời được ở phỏng vấn):
 *   1. Học sinh lớp 7 không thể nhận nội dung chưa ai kiểm duyệt. Gợi ý ở đây do
 *      giáo viên soạn và duyệt trước, nằm trong cơ sở dữ liệu.
 *   2. Không tầng nào chứa đáp án — bảo toàn nỗ lực nhận thức của học sinh. Một
 *      mô hình sinh tự do rất khó bảo đảm điều này.
 *   3. Chạy không cần mạng, không tốn phí, và cùng đầu vào luôn cho cùng đầu ra
 *      nên kiểm thử lại được.
 *   4. ĐỘ SÂU GỢI Ý mà học sinh cần dùng trở thành một tín hiệu nghiên cứu đo
 *      được: hiểu ngay ở tầng 1 khác hẳn phải xuống tới tầng 3.
 *
 * Ba tầng, theo mô hình phản hồi "mục tiêu – vị trí hiện tại – bước tiếp theo":
 *   Tầng 1 — câu hỏi gợi mở, chạm đúng vào chỗ hiểu sai, buộc học sinh tự nghĩ lại.
 *   Tầng 2 — ví dụ phản chứng: một trường hợp cụ thể cho thấy cách nghĩ đó sai.
 *   Tầng 3 — nhắc lại quy tắc đúng, vẫn để học sinh tự áp vào bài của mình.
 * Không có tầng 4. Muốn xem lời giải thì phải hỏi giáo viên.
 */

import { HINTS } from './t9-noi-dung.js';

export const SO_TANG_TOI_DA = 3;

export const TEN_TANG = {
  1: 'Câu hỏi gợi mở',
  2: 'Ví dụ phản chứng',
  3: 'Nhắc lại quy tắc'
};

/**
 * Tầng gợi ý tiếp theo được phép mở.
 * Mở tuần tự, không cho nhảy thẳng xuống tầng cuối.
 * @param {number[]} daMo danh sách tầng học sinh đã mở cho câu hỏi này
 * @returns {number|null} tầng tiếp theo, hoặc null nếu đã hết
 */
export function tangTiepTheo(daMo = []) {
  const cao = daMo.length ? Math.max(...daMo.filter((t) => Number.isFinite(t))) : 0;
  const tiep = cao + 1;
  return tiep <= SO_TANG_TOI_DA ? tiep : null;
}

/**
 * Kiểm tra một yêu cầu mở gợi ý có hợp lệ không.
 * @param {object} yc
 * @param {number} yc.tangMuonMo
 * @param {number[]} yc.daMo
 * @returns {{ok:boolean, ly_do?:string}}
 */
export function kiemTraYeuCau(yc) {
  const tiep = tangTiepTheo(yc.daMo ?? []);
  if (tiep === null) {
    return { ok: false, ly_do: 'Đã mở hết ba tầng gợi ý. Em hỏi thầy cô nếu vẫn chưa rõ.' };
  }
  if (yc.tangMuonMo !== tiep) {
    return { ok: false, ly_do: `Gợi ý mở lần lượt. Tầng tiếp theo của em là tầng ${tiep}.` };
  }
  return { ok: true };
}

/**
 * TÍN HIỆU NGHIÊN CỨU: độ sâu gợi ý mà học sinh cần dùng.
 * Càng gần 0 càng tự lực; càng gần 1 càng phải dựa vào gợi ý.
 *
 * @param {{questionId:string, tang:number}[]} luot  các lượt mở gợi ý
 * @param {number} soCauSai  số câu học sinh làm sai
 */
export function doSauGoiY(luot = [], soCauSai = 0) {
  if (soCauSai <= 0) return { chiSo: 0, tangSauNhat: 0, soCauDaHoi: 0, soLuot: 0 };
  const theoCau = new Map();
  for (const l of luot) {
    theoCau.set(l.questionId, Math.max(theoCau.get(l.questionId) ?? 0, l.tang));
  }
  const tongTang = [...theoCau.values()].reduce((s, t) => s + t, 0);
  return {
    // trung bình tầng sâu nhất trên mỗi câu sai, chuẩn hoá về 0–1
    chiSo: Math.round((tongTang / (soCauSai * SO_TANG_TOI_DA)) * 100) / 100,
    tangSauNhat: theoCau.size ? Math.max(...theoCau.values()) : 0,
    soCauDaHoi: theoCau.size,
    soLuot: luot.length
  };
}

/**
 * Bộ gợi ý mặc định cho từng mã lỗi trong từ điển lỗi Toán 7.
 * KHÔNG câu nào chứa đáp án của một câu hỏi cụ thể — gợi ý neo vào QUAN NIỆM SAI,
 * không neo vào câu hỏi, nên dùng lại được cho mọi câu cùng mã lỗi.
 *
 * @type {Record<string, {1:string, 2:string, 3:string}>}
 */
/**
 * Bộ gợi ý mặc định, lấy thẳng từ nội dung các chương (src/t9-noi-dung.js) và đổi sang
 * dạng { 1, 2, 3 } mà bộ máy đang dùng. Sửa nội dung gợi ý thì sửa ở t9-chuongN.js.
 */
export const GOI_Y_MAC_DINH = Object.fromEntries(
  Object.entries(HINTS).map(([code, ba]) => [code, { 1: ba[0], 2: ba[1], 3: ba[2] }])
);
