/**
 * DỮ LIỆU MẪU ĐỂ CHẠY THỬ BỘ MÁY
 * ---------------------------------------------------------------------------
 * CẢNH BÁO: đây là dữ liệu SINH RA để kiểm thử logic, KHÔNG phải dữ liệu nghiên cứu.
 * Tuyệt đối không dùng bất kỳ con số nào ở đây làm kết quả trong báo cáo dự thi.
 *
 * Sáu hồ sơ dưới đây được thiết kế để mỗi hồ sơ kích hoạt một quy tắc khác nhau,
 * dùng làm bộ ca kiểm thử cho phép thử T3 (độ chính xác phân loại).
 */

const DAY = 86400000;
export const NOW = Date.UTC(2026, 8, 14, 7, 0, 0); // 14/09/2026

export const PLAN = {
  assignedVideoSec: 480, // 8 phút
  assignmentsAssigned: 4,
  daysWithWork: 5
};

/** Sáu kiểu học sinh điển hình, mỗi kiểu ứng với một quy tắc cần nhận diện. */
export const PERSONAS = [
  { id: 'HS-001', label: 'Xem thụ động (kỳ vọng R01)' },
  { id: 'HS-002', label: 'Thuộc quy tắc, chưa vận dụng (kỳ vọng R02)' },
  { id: 'HS-003', label: 'Quan niệm sai lặp lại (kỳ vọng R03)' },
  { id: 'HS-004', label: 'Đoán mò (kỳ vọng R04)' },
  { id: 'HS-005', label: 'Hổng kiến thức nền (kỳ vọng R05)' },
  { id: 'HS-006', label: 'Đã làm chủ (kỳ vọng R06)' },
  { id: 'HS-007', label: 'Bỏ học nhiều ngày (kỳ vọng R07)' }
];

function videoEvents(studentId, kuId, totalSec, startTs, chunkSec = 120) {
  const out = [];
  let done = 0;
  let ts = startTs;
  while (done < totalSec) {
    const d = Math.min(chunkSec, totalSec - done);
    out.push({ studentId, kuId, type: 'video_active', durationSec: d, ts });
    done += d;
    ts += d * 1000 + 60000;
  }
  return out;
}

export function buildSeed() {
  /** @type {Array<object>} */
  const events = [];
  /** @type {Array<object>} */
  const attempts = [];
  /** @type {Record<string, any>} */
  const learnerState = {};

  const KU = 'C1-B2-M2'; // Quy tắc dấu ngoặc (Bài 2, Chương I)
  const t = (dAgo, h = 8) => NOW - dAgo * DAY + h * 3600000;

  // HS-001 — xem hết video nhưng quiz thấp -> R01
  events.push(...videoEvents('HS-001', KU, 470, t(2)));
  events.push({ studentId: 'HS-001', kuId: KU, type: 'assignment_submit', ts: t(2, 10) });
  events.push({ studentId: 'HS-001', kuId: KU, type: 'assignment_submit', ts: t(1, 10) });
  attempts.push({ studentId: 'HS-001', kuId: KU, score: 4.0, ts: t(2, 9) });
  learnerState['HS-001'] = {
    currentKu: KU, firstQuizScore: 4.0, bestQuizScore: 5.0, appliedScore: null,
    timeOnTaskSec: 520, expectedTimeSec: 600, errorCounts: [{ code: 'E-DN-01', count: 1 }],
    masteryByKu: { 'C1-B2-M1': 2 }, lessonKus: [KU]
  };

  // HS-002 — quiz cao, bài vận dụng thấp -> R02
  events.push(...videoEvents('HS-002', KU, 460, t(3)));
  events.push({ studentId: 'HS-002', kuId: KU, type: 'assignment_submit', ts: t(3, 10) });
  events.push({ studentId: 'HS-002', kuId: KU, type: 'assignment_submit', ts: t(2, 10) });
  events.push({ studentId: 'HS-002', kuId: KU, type: 'assignment_submit', ts: t(1, 11) });
  attempts.push({ studentId: 'HS-002', kuId: KU, score: 8.5, ts: t(3, 9) });
  learnerState['HS-002'] = {
    currentKu: KU, firstQuizScore: 8.5, bestQuizScore: 9.0, appliedScore: 4.0,
    timeOnTaskSec: 640, expectedTimeSec: 600, errorCounts: [],
    masteryByKu: { 'C1-B2-M1': 3 }, lessonKus: [KU]
  };

  // HS-003 — lỗi E-TLT-02 lặp 4 lần -> R03
  events.push(...videoEvents('HS-003', KU, 300, t(2)));
  events.push({ studentId: 'HS-003', kuId: KU, type: 'assignment_submit', ts: t(2, 12) });
  events.push({ studentId: 'HS-003', kuId: KU, type: 'feedback_with_hint', ts: t(2, 13) });
  events.push({ studentId: 'HS-003', kuId: KU, type: 'voluntary_retry', ts: t(2, 14) });
  attempts.push({ studentId: 'HS-003', kuId: KU, score: 6.0, ts: t(2, 11) });
  learnerState['HS-003'] = {
    currentKu: KU, firstQuizScore: 6.0, bestQuizScore: 7.0, appliedScore: 5.5,
    timeOnTaskSec: 700, expectedTimeSec: 600,
    errorCounts: [{ code: 'E-DN-02', count: 4 }, { code: 'E-DN-01', count: 1 }],
    masteryByKu: { 'C1-B2-M1': 2 }, lessonKus: [KU]
  };

  // HS-004 — làm quá nhanh, điểm thấp -> R04
  events.push(...videoEvents('HS-004', KU, 120, t(1)));
  attempts.push({ studentId: 'HS-004', kuId: KU, score: 3.0, ts: t(1, 9) });
  learnerState['HS-004'] = {
    currentKu: KU, firstQuizScore: 3.0, bestQuizScore: 3.0, appliedScore: null,
    timeOnTaskSec: 90, expectedTimeSec: 600, errorCounts: [],
    masteryByKu: { 'C1-B2-M1': 2 }, lessonKus: [KU]
  };

  // HS-005 — hổng đơn vị tiên quyết -> R05
  // mastery của đơn vị tiên quyết để 0, không để 1: từ bản siết R05, mastery 1 nghĩa
  // là em ấy ĐÃ hiểu đơn vị trước ở mức tối thiểu nên không còn bị kéo quay lại nữa.
  events.push(...videoEvents('HS-005', KU, 400, t(2)));
  events.push({ studentId: 'HS-005', kuId: KU, type: 'assignment_submit', ts: t(2, 15) });
  attempts.push({ studentId: 'HS-005', kuId: KU, score: 5.5, ts: t(2, 14) });
  learnerState['HS-005'] = {
    currentKu: KU, firstQuizScore: 5.5, bestQuizScore: 6.0, appliedScore: 5.0,
    timeOnTaskSec: 620, expectedTimeSec: 600, errorCounts: [],
    masteryByKu: { 'C1-B2-M1': 0 }, lessonKus: [KU]
  };

  // HS-006 — đã làm chủ -> R06
  events.push(...videoEvents('HS-006', KU, 480, t(4)));
  for (let i = 0; i < 4; i++) {
    events.push({ studentId: 'HS-006', kuId: KU, type: 'assignment_submit', ts: t(4 - i, 16) });
  }
  events.push({ studentId: 'HS-006', kuId: KU, type: 'feedback_with_hint', ts: t(3, 17) });
  events.push({ studentId: 'HS-006', kuId: KU, type: 'voluntary_retry', ts: t(3, 18) });
  attempts.push({ studentId: 'HS-006', kuId: KU, score: 9.5, ts: t(4, 9) });
  learnerState['HS-006'] = {
    currentKu: KU, firstQuizScore: 9.5, bestQuizScore: 10, appliedScore: 8.5, transferScore: 7.5,
    timeOnTaskSec: 580, expectedTimeSec: 600, errorCounts: [],
    masteryByKu: { 'C1-B2-M1': 3 }, lessonKus: [KU]
  };

  // HS-007 — không hoạt động 5 ngày -> R07
  events.push(...videoEvents('HS-007', KU, 200, t(6)));
  attempts.push({ studentId: 'HS-007', kuId: KU, score: 5.0, ts: t(6, 9) });
  learnerState['HS-007'] = {
    currentKu: KU, firstQuizScore: 5.0, bestQuizScore: 5.0, appliedScore: null,
    timeOnTaskSec: 610, expectedTimeSec: 600, errorCounts: [],
    masteryByKu: { 'C1-B2-M1': 2 }, lessonKus: [KU]
  };

  // Thêm nhiễu để kiểm thử phần CLEAN: bản ghi trùng, phiên quá ngắn, mở tab không tương tác
  events.push({ studentId: 'HS-001', kuId: KU, type: 'video_active', durationSec: 120, ts: t(2) + 500 }); // trùng
  events.push({ studentId: 'HS-002', kuId: KU, type: 'video_active', durationSec: 4, ts: t(3, 20) });      // quá ngắn
  events.push({ studentId: 'HS-003', kuId: KU, type: 'video_idle', durationSec: 900, ts: t(2, 21) });      // mở tab bỏ đó

  return { events, attempts, learnerState, plan: PLAN, nowTs: NOW };
}
