/**
 * ============================================================================
 * THUẬT TOÁN 8 QUY TẮC SƯ PHẠM GỢI Ý HỌC TẬP THÍCH ỨNG (ADAPTIVE RULES)
 * ============================================================================
 * Tệp mã nguồn: code/web/lib/dfle/rules.js
 * Vai trò: Là "Bộ não sư phạm" của website FlipMath9:
 *   - Sau khi học sinh học bài và làm kiểm tra, website dựa vào 8 quy tắc tường minh
 *     (R01 - R07, R09; không có R08) để chẩn đoán tình trạng và đưa ra lời khuyên học tập phù hợp nhất.
 *   - Vì sao dùng quy tắc tường minh thay vì AI tự đoán?
 *     1. Thầy cô và học sinh hiểu được CHÍNH XÁC lý do vì sao website đưa ra lời khuyên như vậy.
 *     2. Cùng dữ liệu đầu vào luôn cho cùng kết quả đầu ra (tính tất định, khoa học, kiểm thử được).
 *     3. Không lo hiện tượng "ảo giác" (hallucination) của mô hình ngôn ngữ lớn.
 */

import { ERROR_BY_CODE, REMEDIATION_CATALOG, KU_BY_ID } from './errors.js';

/**
 * [SỐ HIỆU TT-14: BỘ 8 QUY TẮC SƯ PHẠM THÍCH ỨNG R01 - R07, R09]
 * ---------------------------------------------------------------------------
 * Bảng các ngưỡng chuẩn để kích hoạt quy tắc:
 */
export const THRESHOLDS = Object.freeze({
  passiveVideoCompletion: 0.9,   // Ngưỡng xem video: 90% thời lượng (dùng chung cho R01 và R09)
  passiveQuizScore: 5,           // Ngưỡng điểm bài chuẩn bị: 5 điểm (dùng chung cho R01 và R09)
  ruleMasteredQuiz: 8,           // R02: Đạt >= 8 điểm trắc nghiệm lý thuyết (đã thuộc quy tắc)
  ruleAppliedWeak: 5,            // R02: Nhưng bài vận dụng < 5 điểm (chưa biết áp dụng)
  repeatedErrorMin: 3,           // R03: Mắc cùng 1 mã lỗi từ 3 lần trở lên (quan niệm sai cố định)
  guessTimeRatio: 0.3,           // R04: Làm bài dưới 30% thời gian dự kiến (dấu hiệu khoanh bừa)
  guessScoreMax: 5,              // R04: Kèm theo điểm số dưới 5
  prerequisiteMin: 1,            // R05: Mức làm chủ bài tiên quyết = 0 (hổng kiến thức nền tảng)
  prereqOverrideScore: 8,        // R05: Nếu bài hiện tại >= 8 điểm thì bỏ qua lỗi hổng nền
  masteredMin: 2,                // R06: Mức làm chủ tất cả các bài đạt từ mức 2 (Đại Thụ) trở lên
  inactiveDays: 3                // R07: Không vào học từ 3 ngày liên tục trở lên
});

/**
 * Hàm kiểm tra nhanh xem học sinh có dấu hiệu đoán mò / khoanh bừa hay không
 */
export function nghiDoanMo(ctx, th = THRESHOLDS) {
  // Dòng 1: Kiểm tra xem có đủ dữ liệu về thời gian làm, thời gian dự kiến và điểm số hay không
  if (
    ctx.timeOnTaskSec === null ||
    ctx.expectedTimeSec === null ||
    ctx.firstQuizScore === null ||
    ctx.expectedTimeSec <= 0
  ) {
    return false;
  }

  // Dòng 2: Trả về true nếu thời gian làm bài < 30% dự kiến VÀ điểm số < 5 điểm
  return (
    ctx.timeOnTaskSec < th.guessTimeRatio * ctx.expectedTimeSec &&
    ctx.firstQuizScore < th.guessScoreMax
  );
}

/**
 * [SỐ HIỆU TT-14: HÀM ĐÁNH GIÁ VÀ KÍCH HOẠT 8 QUY TẮC SƯ PHẠM]
 * ---------------------------------------------------------------------------
 * Thứ tự ưu tiên xử lý sư phạm:
 *   Ưu tiên 1 (R04 - Đoán mò): Chặn ngay hành vi bấm bừa trước khi chẩn đoán kiến thức.
 *   Ưu tiên 2 (R05 - Hổng nền): Chữa gốc trước khi chữa ngọn (ôn lại bài tiên quyết).
 *   Ưu tiên 3 (R03 - Quan niệm sai cố định): Học sinh vấp cùng 1 bẫy sai nhiều lần -> mở vi bài học.
 *   Ưu tiên 4 (R09 - Chưa xem hết bài): Video < 90% mà điểm < 5 -> Yêu cầu xem nốt video.
 *   Ưu tiên 5 (R01 - Xem thụ động): Video >= 90% mà điểm < 5 -> Xem hết nhưng không hiểu, đổi dạng học tương tác.
 *   Ưu tiên 6 (R02 - Thuộc vẹt): Lý thuyết >= 8 nhưng vận dụng < 5 -> Giao bài toán thực tế.
 *   Ưu tiên 7 (R06 - Đã thành thạo): Đạt mức làm chủ >= 2 toàn bài -> Mở bài nâng cao, làm trợ giảng.
 *   Cảnh báo song song (R07 - Nguy cơ bỏ cuộc): Nghỉ học >= 3 ngày -> Báo cho giáo viên.
 */
export function evaluateRules(ctx, th = THRESHOLDS) {
  // Dòng 1: Mảng lưu danh sách các quy tắc bị kích hoạt
  const fired = [];

  // [ƯU TIÊN 1] R04 — Đoán mò (Bấm bừa)
  // Dòng 2: Kiểm tra nếu em làm quá nhanh (< 30% thời gian) và điểm < 5
  if (nghiDoanMo(ctx, th)) {
    fired.push({
      code: 'R04',
      priority: 1, // Mức ưu tiên 1 (Cao nhất)
      diagnosis: 'Có dấu hiệu đoán mò: làm bài quá nhanh so với thời gian dự kiến và điểm thấp',
      action: 'Khoá lượt làm lại 30 phút, yêu cầu mở lại học liệu trước khi thử tiếp',
      payload: { lockMinutes: 30, requireContentReview: true }
    });
  }

  // [ƯU TIÊN 2] R05 — Hổng kiến thức nền tảng (Bài trước chưa vững)
  // Dòng 3: Em làm bài hiện tại tốt (>= 8 điểm) thì không bắt quay lại bài cũ
  const boQuaViBaiHienTaiTot =
    ctx.firstQuizScore !== null && ctx.firstQuizScore >= th.prereqOverrideScore;
  // Dòng 4: Nếu bài tiên quyết mức làm chủ < 1 (tức là mức 0 - Hạt mầm) và bài hiện tại chưa tốt
  if (
    ctx.prerequisiteMastery !== null &&
    ctx.prerequisiteMastery < th.prerequisiteMin &&
    !boQuaViBaiHienTaiTot
  ) {
    const ku = KU_BY_ID.get(ctx.kuId);
    const prereq = ku?.prerequisite ? KU_BY_ID.get(ku.prerequisite) : null;
    fired.push({
      code: 'R05',
      priority: 2, // Mức ưu tiên 2
      diagnosis: `Hổng đơn vị kiến thức tiên quyết${prereq ? ` (${prereq.name})` : ''}`,
      action: 'Truy ngược theo quan hệ tiên quyết, giao ôn tập đơn vị trước',
      payload: { targetKu: ku?.prerequisite ?? null }
    });
  }

  // [ƯU TIÊN 3] R03 — Quan niệm sai lặp lại nhiều lần (Mắc cùng lỗi >= 3 lần)
  // Dòng 5: Lọc các mã lỗi học sinh đã mắc từ 3 lần trở lên
  const repeated = ctx.errorCounts.filter((e) => e.count >= th.repeatedErrorMin);
  if (repeated.length > 0) {
    // Dòng 6: Lấy lỗi mắc nhiều lần nhất để tập trung khắc phục
    const worst = repeated.reduce((a, b) => (a.count >= b.count ? a : b));
    const entry = ERROR_BY_CODE.get(worst.code);
    fired.push({
      code: 'R03',
      priority: 3, // Mức ưu tiên 3
      diagnosis: entry
        ? `Quan niệm sai lặp lại ${worst.count} lần: ${entry.misconception}`
        : `Mã lỗi ${worst.code} lặp lại ${worst.count} lần (chưa có trong từ điển lỗi)`,
      action: 'Kích hoạt vi bài học sửa lỗi tương ứng',
      payload: {
        errorCode: worst.code,
        contentId: entry ? entry.remediation : null,
        content: entry ? REMEDIATION_CATALOG[entry.remediation] ?? null : null
      }
    });
  }

  // [ƯU TIÊN 4] R09 — Chưa xem hết video bài giảng mà đã vội làm bài
  // Dòng 7: Xem video < 90% thời lượng và điểm bài chuẩn bị < 5
  if (
    ctx.videoCompletionRate !== null &&
    ctx.videoCompletionRate < th.passiveVideoCompletion &&
    ctx.firstQuizScore !== null &&
    ctx.firstQuizScore < th.passiveQuizScore
  ) {
    fired.push({
      code: 'R09',
      priority: 4, // Mức ưu tiên 4
      diagnosis: `Chưa xem hết bài học (mới ${Math.round(ctx.videoCompletionRate * 100)}% thời lượng video) mà điểm đã thấp`,
      action: 'Xem nốt phần video còn lại và làm phiếu học tập, rồi hãy làm lại bài kiểm tra',
      payload: { requireVideoFirst: true, minCompletion: th.passiveVideoCompletion }
    });
  }

  // [ƯU TIÊN 5] R01 — Xem thụ động (Xem hết video nhưng không hiểu bài)
  // Dòng 8: Đã xem video >= 90% thời lượng nhưng điểm kiểm tra vẫn < 5
  if (
    ctx.videoCompletionRate >= th.passiveVideoCompletion &&
    ctx.firstQuizScore !== null &&
    ctx.firstQuizScore < th.passiveQuizScore
  ) {
    fired.push({
      code: 'R01',
      priority: 5, // Mức ưu tiên 5
      diagnosis: 'Xem thụ động: hoàn thành video nhưng không nắm được nội dung',
      action: 'Giao video có câu hỏi chèn và yêu cầu tóm tắt lại bằng sơ đồ',
      payload: { interactiveVideo: true, requireSummaryDiagram: true }
    });
  }

  // [ƯU TIÊN 6] R02 — Thuộc quy tắc lý thuyết nhưng chưa biết vận dụng giải toán
  // Dòng 9: Điểm trắc nghiệm lý thuyết >= 8 nhưng điểm bài vận dụng < 5
  if (
    ctx.firstQuizScore !== null &&
    ctx.firstQuizScore >= th.ruleMasteredQuiz &&
    ctx.appliedScore !== null &&
    ctx.appliedScore < th.ruleAppliedWeak
  ) {
    fired.push({
      code: 'R02',
      priority: 6, // Mức ưu tiên 6
      diagnosis: 'Nắm quy tắc nhưng chưa chuyển hoá thành năng lực giải quyết vấn đề',
      action: 'Giao bài toán thực tiễn, nhiệm vụ mô hình hoá cùng đơn vị kiến thức',
      payload: { taskType: 'real-world' }
    });
  }

  // [ƯU TIÊN 7] R06 — Đã làm chủ vững vàng kiến thức toàn bài
  // Dòng 10: Tất cả các mục trong bài học đều đạt mức làm chủ từ 2 (Đại Thụ) trở lên
  if (ctx.lessonMinMastery >= th.masteredMin) {
    fired.push({
      code: 'R06',
      priority: 7, // Mức ưu tiên 7
      diagnosis: 'Đã làm chủ toàn bộ đơn vị kiến thức của bài',
      action: 'Mở nhiệm vụ nâng cao; đề xuất vai trò hỗ trợ nhóm ở giờ trên lớp',
      payload: { unlockAdvanced: true, peerTutorCandidate: true }
    });
  }

  // [CẢNH BÁO SONG SONG] R07 — Nguy cơ bỏ cuộc / sao nhãng học tập
  // Dòng 11: Học sinh không đăng nhập học bài từ 3 ngày trở lên
  if (ctx.daysInactive >= th.inactiveDays) {
    fired.push({
      code: 'R07',
      priority: 8, // Cảnh báo gửi tới giáo viên
      diagnosis: `Không có hoạt động trong ${ctx.daysInactive} ngày`,
      action: 'Nhắc nhở cá nhân hoá; hiện cảnh báo trên bảng điều khiển giáo viên',
      payload: { teacherAlert: true }
    });
  }

  // Dòng 12: Sắp xếp các quy tắc theo thứ tự ưu tiên từ nhỏ đến lớn (priority 1 -> 8)
  return fired.sort((a, b) => a.priority - b.priority);
}

/**
 * Chọn MỘT gợi ý quan trọng nhất để hiển thị cho học sinh, đồng thời tách cảnh báo R07 cho giáo viên
 */
export function recommend(ctx, th = THRESHOLDS) {
  // Dòng 1: Đánh giá danh sách các quy tắc khớp
  const fired = evaluateRules(ctx, th);

  // Dòng 2: Tách nhóm quy tắc nội dung học tập (loại trừ cảnh báo R07)
  const contentRules = fired.filter((f) => f.code !== 'R07');

  // Dòng 3: Tách riêng cảnh báo R07 dành cho thầy cô
  const alerts = fired.filter((f) => f.code === 'R07');

  // Dòng 4: Chọn quy tắc có độ ưu tiên cao nhất trong nhóm nội dung
  const chosen = contentRules[0] ?? null;

  // Dòng 5: Trả về kết quả tư vấn hoàn chỉnh
  return {
    studentId: ctx.studentId,
    kuId: ctx.kuId,
    triggerRule: chosen ? chosen.code : null,
    diagnosis: chosen
      ? chosen.diagnosis
      : alerts.length
        ? 'Chỉ có cảnh báo tham gia, chưa có căn cứ nội dung để can thiệp'
        : 'Không có quy tắc nào được kích hoạt — tiếp tục lộ trình chuẩn',
    action: chosen ? chosen.action : 'Giao nội dung chuẩn của bài tiếp theo',
    payload: chosen?.payload ?? null,
    allTriggered: fired.map((f) => f.code),
    teacherAlerts: alerts.map((a) => ({ code: a.code, diagnosis: a.diagnosis }))
  };
}
