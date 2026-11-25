/**
 * PIPELINE LEARNING ANALYTICS
 * COLLECT → CLEAN → ANALYZE → PREDICT → RECOMMEND → (INTERVENE) → REASSESS
 *
 * Đầu vào là các sự kiện thô (learning_events) và các lượt làm quiz (quiz_attempts,
 * quiz_answers). Đầu ra là hồ sơ người học, chỉ số LES, nhãn nhóm và gợi ý.
 */

import { componentScores, les, quartileCutoffs, classify, WEIGHTS_V1, FIXED_CUTOFFS } from './les.js';
import { evaluateRules, recommend } from './rules.js';
import { computeMastery, lessonMinMastery } from './mastery.js';
import { KU_BY_ID, KNOWLEDGE_UNITS } from './errors.js';
import { ngayVN } from './ngay.js';

/* ------------------------------------------------------------------ CLEAN */

/** Quy tắc làm sạch — công khai để giải thích được ở phần phỏng vấn. */
export const CLEAN_RULES = Object.freeze({
  minSessionSec: 10,          // phiên dưới 10 giây coi như thao tác nhầm
  maxIdleGapSec: 120,         // khoảng không tương tác quá 2 phút thì không tính là đang học
  dedupeWindowMs: 1500        // hai sự kiện giống hệt trong 1,5 giây là bản ghi trùng do mất mạng
});

/**
 * Làm sạch danh sách sự kiện thô.
 * @param {Array<object>} events
 * @returns {{clean:Array<object>, dropped:{tooShort:number, duplicated:number, idle:number}}}
 */
export function cleanEvents(events) {
  const dropped = { tooShort: 0, duplicated: 0, idle: 0 };
  const sorted = [...events].sort((a, b) => a.ts - b.ts);
  /** @type {Array<object>} */
  const clean = [];
  /** @type {Map<string, number>} dấu vết sự kiện gần nhất theo (học sinh, đơn vị KT, loại) */
  const lastSeen = new Map();
  for (const e of sorted) {
    const key = `${e.studentId}|${e.kuId}|${e.type}`;
    const prevTs = lastSeen.get(key);
    if (prevTs !== undefined && e.ts - prevTs <= CLEAN_RULES.dedupeWindowMs) {
      // Bản ghi trùng do client gửi lại khi mất mạng rồi kết nối lại
      dropped.duplicated++;
      continue;
    }
    if (e.type === 'video_active' && (e.durationSec ?? 0) < CLEAN_RULES.minSessionSec) {
      dropped.tooShort++;
      continue;
    }
    if (e.type === 'video_idle') {
      // Sự kiện mở trang mà không tương tác: KHÔNG tính vào thời gian học.
      // Đây là quyết định thiết kế đã ghi ở mục 6.2 của bản thiết kế nghiên cứu.
      dropped.idle++;
      continue;
    }
    lastSeen.set(key, e.ts);
    clean.push(e);
  }
  return { clean, dropped };
}

/* ---------------------------------------------------------------- ANALYZE */

/**
 * Gộp sự kiện đã làm sạch thành số liệu tổng hợp theo học sinh.
 * @param {Array<object>} cleanEventList
 * @param {Array<object>} attempts  các lượt làm quiz
 * @param {object} plan  kế hoạch giao bài của tuần
 */
export function aggregate(cleanEventList, attempts, plan) {
  /** @type {Map<string, any>} */
  const byStudent = new Map();
  const ensure = (id) => {
    if (!byStudent.has(id)) {
      byStudent.set(id, {
        studentId: id,
        activeWatchSec: 0,
        assignedVideoSec: plan.assignedVideoSec,
        firstQuizScores: [],
        assignmentsDone: 0,
        assignmentsAssigned: plan.assignmentsAssigned,
        activeDaySet: new Set(),
        daysWithWork: plan.daysWithWork,
        voluntaryRetries: 0,
        feedbackWithHints: 0,
        lastActivityTs: 0
      });
    }
    return byStudent.get(id);
  };

  for (const e of cleanEventList) {
    const s = ensure(e.studentId);
    s.lastActivityTs = Math.max(s.lastActivityTs, e.ts);
    // NGÀY theo lịch Việt Nam, không theo UTC — xem chú thích đầu src/ngay.js.
    // Đếm theo UTC thì em học 22h30 tối nay và 6h30 sáng mai bị tính là MỘT ngày.
    s.activeDaySet.add(ngayVN(e.ts));
    if (e.type === 'video_active') s.activeWatchSec += e.durationSec ?? 0;
    if (e.type === 'assignment_submit') s.assignmentsDone++;
    if (e.type === 'feedback_with_hint') s.feedbackWithHints++;
    if (e.type === 'voluntary_retry') s.voluntaryRetries++;
  }

  // điểm quiz LẦN ĐẦU của mỗi đơn vị kiến thức
  /** @type {Map<string, Set<string>>} */
  const seen = new Map();
  for (const a of [...attempts].sort((x, y) => x.ts - y.ts)) {
    const s = ensure(a.studentId);
    if (!seen.has(a.studentId)) seen.set(a.studentId, new Set());
    const set = seen.get(a.studentId);
    if (!set.has(a.kuId)) {
      set.add(a.kuId);
      s.firstQuizScores.push(a.score);
    }
  }

  return [...byStudent.values()].map((s) => ({
    ...s,
    activeDays: s.activeDaySet.size,
    activeDaySet: undefined
  }));
}

/* ------------------------------------------------- PREDICT + RECOMMEND */

/**
 * Chạy trọn một chu kỳ phân tích cho cả lớp.
 * @param {object} input
 * @param {Array<object>} input.events
 * @param {Array<object>} input.attempts
 * @param {object} input.plan
 * @param {Record<string, any>} input.learnerState  trạng thái theo học sinh (mastery, lỗi, vận dụng...)
 * @param {number} input.nowTs
 * @param {import('./les.js').Weights} [input.weights]
 */
export function runCycle(input) {
  const weights = input.weights ?? WEIGHTS_V1;
  const { clean, dropped } = cleanEvents(input.events);
  const aggregates = aggregate(clean, input.attempts, input.plan);

  const scored = aggregates.map((a) => {
    const comp = componentScores(a);
    return { studentId: a.studentId, components: comp, les: les(comp, weights), agg: a };
  });

  // Ngưỡng phân nhóm lấy từ tứ phân vị của chính mẫu; mẫu quá nhỏ thì dùng ngưỡng cố định.
  const values = scored.map((s) => s.les);
  const cutoffs =
    values.length >= 4
      ? /** @type {[number,number,number]} */ (quartileCutoffs(values))
      : FIXED_CUTOFFS;

  const profiles = scored.map((s) => {
    const st = input.learnerState[s.studentId] ?? {};
    const kuId = st.currentKu ?? KNOWLEDGE_UNITS[0].id;
    const ku = KU_BY_ID.get(kuId);

    const guessSuspected = evaluateRules(buildCtx(s, st, kuId, input.nowTs)).some((r) => r.code === 'R04');
    const mastery = computeMastery({
      firstQuizScore: st.firstQuizScore ?? null,
      bestQuizScore: st.bestQuizScore ?? null,
      appliedScore: st.appliedScore ?? null,
      transferScore: st.transferScore ?? null,
      guessSuspected
    });

    const masteryByKu = { ...(st.masteryByKu ?? {}), [kuId]: mastery };
    const ctx = buildCtx(s, { ...st, masteryByKu }, kuId, input.nowTs);
    const rec = recommend(ctx);

    return {
      studentId: s.studentId,
      les: s.les,
      components: s.components,
      group: classify(s.les, cutoffs),
      kuId,
      kuName: ku?.name ?? kuId,
      mastery,
      recommendation: rec
    };
  });

  return {
    cutoffs,
    weights,
    dropped,
    eventsIn: input.events.length,
    eventsClean: clean.length,
    profiles: profiles.sort((a, b) => a.les - b.les)
  };
}

/**
 * @param {{studentId:string, agg:any}} s
 * @param {any} st
 * @param {string} kuId
 * @param {number} nowTs
 * @returns {import('./rules.js').LearnerContext}
 */
function buildCtx(s, st, kuId, nowTs) {
  const ku = KU_BY_ID.get(kuId);
  const masteryByKu = st.masteryByKu ?? {};
  const daysInactive = s.agg.lastActivityTs
    ? Math.floor((nowTs - s.agg.lastActivityTs) / 86400000)
    : 99;
  return {
    studentId: s.studentId,
    kuId,
    // Không được giao video thì là CHƯA ĐO, không phải "được giao mà xem 0%".
    // Để 0 thì quy tắc R09 nổ với mọi đơn vị kiến thức không có video.
    videoCompletionRate:
      s.agg.assignedVideoSec > 0 ? Math.min(1, s.agg.activeWatchSec / s.agg.assignedVideoSec) : null,
    firstQuizScore: st.firstQuizScore ?? null,
    appliedScore: st.appliedScore ?? null,
    timeOnTaskSec: st.timeOnTaskSec ?? null,
    expectedTimeSec: st.expectedTimeSec ?? null,
    errorCounts: st.errorCounts ?? [],
    // Chưa có bản ghi mastery của đơn vị tiên quyết = CHƯA ĐO, không phải "đã đo
    // và thấy bằng 0". Để 0 thì mọi học sinh mới đều bị R05 chẩn đoán hổng nền.
    prerequisiteMastery: ku?.prerequisite ? masteryByKu[ku.prerequisite] ?? null : null,
    lessonMinMastery: lessonMinMastery(masteryByKu, st.lessonKus ?? [kuId]),
    daysInactive
  };
}

/** Báo cáo chẩn đoán lớp cho giáo viên — thứ giáo viên mở TRƯỚC giờ dạy. */
export function teacherReport(cycle) {
  const byGroup = {};
  for (const g of ['Nguy cơ', 'Cần hỗ trợ', 'Đạt', 'Tốt']) byGroup[g] = [];
  for (const p of cycle.profiles) byGroup[p.group].push(p.studentId);

  /** @type {Record<string, string[]>} */
  const byRule = {};
  for (const p of cycle.profiles) {
    const r = p.recommendation.triggerRule;
    if (!r) continue;
    (byRule[r] ??= []).push(p.studentId);
  }

  const alerts = cycle.profiles
    .filter((p) => p.recommendation.teacherAlerts.length > 0)
    .map((p) => ({ studentId: p.studentId, ...p.recommendation.teacherAlerts[0] }));

  return { byGroup, byRule, alerts, cutoffs: cycle.cutoffs };
}
