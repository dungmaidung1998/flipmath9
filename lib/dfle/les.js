/**
 * CHỈ SỐ THAM GIA HỌC TẬP — Learning Engagement Score (LES)
 * ---------------------------------------------------------------------------
 * LES = w1·Video + w2·Quiz + w3·Assignment + w4·Frequency + w5·Persistence
 * Mỗi thành phần quy về thang 0–100. Tổng trọng số = 1.
 *
 * QUAN TRỌNG cho phần bảo vệ đề tài: bộ trọng số mặc định dưới đây là GIẢ ĐỊNH
 * THIẾT KẾ ban đầu, không phải kết quả nghiên cứu. Học sinh phải hợp thức hoá nó
 * bằng một trong ba cách (xem hàm `calibrateWeights`) và ghi lại quá trình vào sổ
 * nhật ký nghiên cứu.
 */

/** @typedef {{video:number, quiz:number, assignment:number, frequency:number, persistence:number}} Weights */

/** Bộ trọng số bản v1.0 — giả định thiết kế, CHƯA hiệu chỉnh. */
export const WEIGHTS_V1 = Object.freeze({
  video: 0.25,
  quiz: 0.25,
  assignment: 0.2,
  frequency: 0.15,
  persistence: 0.15
});

const clamp = (x, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, x));

/**
 * Không có mẫu số thì trả về null — CHƯA ĐO, không phải bằng 0.
 *
 * Đây là chỗ đã từng làm hỏng cả chỉ số: khi hai thành phần Assignment và
 * Persistence chưa được nối sự kiện, chúng luôn ra 0 và kéo trần LES xuống 65 —
 * không học sinh nào vào nổi nhóm "Tốt" (80–100), kể cả em làm đúng mọi thứ.
 * Trả null rồi chuẩn hoá lại trọng số thì một em chưa từng nhận phản hồi sửa lỗi
 * sẽ được tính trên các thành phần CÓ đo được, thay vì bị trừ oan 15 điểm.
 */
const pct = (num, den) => (den > 0 ? clamp((num / den) * 100) : null);

/**
 * Tính 5 điểm thành phần từ số liệu tổng hợp của một học sinh trong một tuần.
 * @param {object} a
 * @param {number} a.activeWatchSec      thời gian xem CÓ TƯƠNG TÁC (giây)
 * @param {number} a.assignedVideoSec    tổng thời lượng video được giao (giây)
 * @param {number[]} a.firstQuizScores   điểm LẦN ĐẦU của các quiz (thang 10)
 * @param {number} a.assignmentsDone
 * @param {number|null} a.assignmentsAssigned  null/0 = chưa giao bài nào -> CHƯA ĐO
 * @param {number} a.activeDays
 * @param {number|null} a.daysWithWork  số buổi lớp được giao bài (week_plan); null = CHƯA ĐO
 * @param {number} a.voluntaryRetries    số lần chủ động làm lại sau khi nhận phản hồi
 * @param {number} a.feedbackWithHints   số lần nhận phản hồi có gợi ý sửa
 */
export function componentScores(a) {
  const quizAvg =
    a.firstQuizScores.length > 0
      ? a.firstQuizScores.reduce((s, x) => s + x, 0) / a.firstQuizScores.length
      : null;
  return {
    // Dùng thời gian CÓ TƯƠNG TÁC, không dùng thời gian mở trang (quyết định thiết kế 6.2)
    video: pct(a.activeWatchSec, a.assignedVideoSec),
    // Dùng điểm LẦN ĐẦU để phản ánh mức chuẩn bị thật, không phải kết quả sau nhiều lần làm lại
    quiz: quizAvg === null ? null : clamp(quizAvg * 10),
    assignment: pct(a.assignmentsDone, a.assignmentsAssigned),
    frequency: pct(a.activeDays, a.daysWithWork),
    persistence: pct(a.voluntaryRetries, a.feedbackWithHints)
  };
}

/**
 * Thành phần nào CHƯA ĐO ĐƯỢC (null) thì bị loại khỏi phép tính, và trọng số của
 * các thành phần còn lại được chuẩn hoá cho tổng vẫn bằng 1. Nhờ vậy LES luôn
 * nằm trên thang 0–100 dù đo được ba hay năm thành phần.
 *
 * KHÔNG thay null bằng 0. Thay bằng 0 nghĩa là khẳng định em ấy đạt 0 điểm ở
 * thành phần đó, trong khi sự thật là chưa có căn cứ nào để nói gì cả.
 *
 * @param {ReturnType<typeof componentScores>} c
 * @param {Weights} [w]
 * @returns {number|null} LES 0–100 làm tròn 1 chữ số, hoặc null nếu chưa đo được
 *   thành phần nào
 */
export function les(c, w = WEIGHTS_V1) {
  const total = w.video + w.quiz + w.assignment + w.frequency + w.persistence;
  if (Math.abs(total - 1) > 1e-9) {
    throw new Error(`Tổng trọng số phải bằng 1, đang là ${total}`);
  }
  let tongTrongSo = 0;
  let tongDiem = 0;
  for (const k of ['video', 'quiz', 'assignment', 'frequency', 'persistence']) {
    if (c[k] === null || c[k] === undefined) continue;
    tongTrongSo += w[k];
    tongDiem += w[k] * c[k];
  }
  if (tongTrongSo === 0) return null;
  return Math.round((tongDiem / tongTrongSo) * 10) / 10;
}

/** Số thành phần thực sự đo được — để hiện "LES tính trên n/5 thành phần". */
export function soThanhPhanDoDuoc(c) {
  return ['video', 'quiz', 'assignment', 'frequency', 'persistence']
    .filter((k) => c[k] !== null && c[k] !== undefined).length;
}

/**
 * Hợp thức hoá trọng số bằng thẩm định chuyên gia (cách A — khuyến nghị cho dự án HS).
 * Mỗi giáo viên chấm mức quan trọng của 5 thành phần theo thang 1–5.
 * Hàm lấy trung bình rồi chuẩn hoá cho tổng bằng 1.
 * @param {Array<{video:number,quiz:number,assignment:number,frequency:number,persistence:number}>} ratings
 * @returns {Weights}
 */
export function calibrateWeights(ratings) {
  if (!ratings.length) throw new Error('Cần ít nhất một phiếu thẩm định');
  const keys = ['video', 'quiz', 'assignment', 'frequency', 'persistence'];
  const means = {};
  for (const k of keys) {
    means[k] = ratings.reduce((s, r) => s + r[k], 0) / ratings.length;
  }
  const sum = keys.reduce((s, k) => s + means[k], 0);
  const out = {};
  for (const k of keys) out[k] = Math.round((means[k] / sum) * 1000) / 1000;
  // sửa sai số làm tròn vào thành phần lớn nhất
  const drift = 1 - keys.reduce((s, k) => s + out[k], 0);
  const biggest = keys.reduce((a, b) => (out[a] >= out[b] ? a : b));
  out[biggest] = Math.round((out[biggest] + drift) * 1000) / 1000;
  return /** @type {Weights} */ (out);
}

/**
 * Ngưỡng phân nhóm lấy theo TỨ PHÂN VỊ CỦA CHÍNH MẪU, không áp đặt.
 * Trả về 3 mốc cắt [q1, q2, q3].
 * @param {number[]} values
 */
export function quartileCutoffs(values) {
  if (values.length < 4) throw new Error('Cần ít nhất 4 giá trị để tính tứ phân vị');
  const s = [...values].sort((a, b) => a - b);
  const q = (p) => {
    const idx = (s.length - 1) * p;
    const lo = Math.floor(idx);
    const hi = Math.ceil(idx);
    return lo === hi ? s[lo] : s[lo] + (s[hi] - s[lo]) * (idx - lo);
  };
  return [q(0.25), q(0.5), q(0.75)].map((x) => Math.round(x * 10) / 10);
}

export const GROUPS = ['Nguy cơ', 'Cần hỗ trợ', 'Đạt', 'Tốt'];

/**
 * Xếp nhóm theo mốc cắt.
 * @param {number} lesValue
 * @param {[number,number,number]} cutoffs
 */
export function classify(lesValue, cutoffs) {
  const [c1, c2, c3] = cutoffs;
  if (lesValue < c1) return GROUPS[0];
  if (lesValue < c2) return GROUPS[1];
  if (lesValue < c3) return GROUPS[2];
  return GROUPS[3];
}

/** Ngưỡng cố định bản v1.0 — chỉ dùng khi mẫu quá nhỏ để lấy tứ phân vị. */
export const FIXED_CUTOFFS = /** @type {[number,number,number]} */ ([40, 60, 80]);
