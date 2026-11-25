/**
 * DFLE-M7 · ADAPTIVE LEARNING RECOVERY ENGINE (ALRE)
 * ===========================================================================
 * Trục xương sống khoa học và công nghệ trung tâm của hệ thống DFLE.
 * Chuyển đổi từ cơ chế cảnh báo thụ động (passive alerting) sang
 * Hệ thống Điều khiển Học tập Thích ứng Khép kín (Closed-Loop Cybernetic Adaptive Engine).
 *
 * Chu trình 4 pha khép kín:
 *   Pha 1: GDVM (Guessing Detection & Verification Model) - Lọc nhiễu & đoán mò
 *   Pha 2: RCGT (Root-Cause Gap Tracer) - Truy vết lỗ hổng gốc từ Causal DAG
 *   Pha 3: ARIO (Adaptive Recovery Intervention Optimizer) - Contextual Bandit (LinUCB)
 *   Pha 4: CLVT (Closed-Loop Verification & Gain Tracker) - Đo lường độ phục hồi g của Hake
 */

import {
  ERROR_NODES,
  ROOT_ERROR_IDS,
  buildGraph,
  getAncestors,
  getDescendants,
  diagnoseRootCause,
  calculateCausalRemediationGain
} from './causal-graph.js';

/* ========================================================================= */
/* PHAN HE 1: GUESSING DETECTION & VERIFICATION MODEL (GDVM)                */
/* ========================================================================= */

/**
 * Tham số hồi quy Logit mặc định cho mô hình phát hiện đoán mò GDVM
 * z = beta_0 + beta_1 * Difficulty - beta_2 * Theta - beta_3 * TimeRatio + beta_4 * RapidAnomaly
 */
export const GDVM_DEFAULT_CONFIG = {
  beta0: -1.5,     // Hệ số tự do (Logit odds cơ bản)
  beta1: 1.8,      // Trọng số độ khó câu hỏi (càng khó xác suất đoán mò càng cao)
  beta2: 2.0,      // Trọng số năng lực học sinh (năng lực cao thì ít đoán mò)
  beta3: 2.5,      // Trọng số thời gian làm bài (làm càng lâu xác suất đoán mò càng thấp)
  beta4: 3.2,      // Trọng số độ bất thường thời gian cực ngắn (Rapid-guessing anomaly)
  guessThreshold: 0.70, // Ngưỡng kích hoạt câu hỏi kiểm chứng đẳng cấu
  rapidTimeThresholdRatio: 0.25 // Dưới 25% thời gian chuẩn xem như bất thường
};

/**
 * Tính điểm xác suất đoán mò G in [0, 1]
 *
 * @param {Object} params
 * @param {number} params.studentTheta Năng lực học sinh (chuẩn hoá thang [0, 1] hoặc Rasch theta [-3, 3])
 * @param {number} params.itemDifficulty Độ khó câu hỏi (thang 1-4 hoặc chuẩn hoá [0, 1])
 * @param {number} params.timeSpentSec Thời gian học sinh trả lời (giây)
 * @param {number} [params.expectedTimeSec=60] Thời gian kỳ vọng của câu hỏi (giây)
 * @param {boolean} [params.isCorrect=true] Kết quả trả lời đúng hay sai
 * @param {Object} [params.config] Cấu hình tham số mô hình
 * @returns {{ guessScore: number, isRapidGuess: boolean, triggerIsomorphicCheck: boolean, confidence: number }}
 */
export function calculateGuessScore({
  studentTheta,
  itemDifficulty,
  timeSpentSec,
  expectedTimeSec = 60,
  isCorrect = true,
  config = GDVM_DEFAULT_CONFIG
}) {
  const cfg = { ...GDVM_DEFAULT_CONFIG, ...config };

  // 1. Chuẩn hoá các biến số về thang đo tiêu chuẩn
  // Theta chuẩn hoá về [0, 1]: nếu truyền thang [-3, 3] thì chuyển sang [0, 1]
  const normTheta = studentTheta > 1 || studentTheta < 0
    ? Math.max(0, Math.min(1, (studentTheta + 3) / 6))
    : Math.max(0, Math.min(1, studentTheta));

  // Difficulty chuẩn hoá về [0, 1]: nếu truyền thang 1-4
  const normDiff = itemDifficulty > 1
    ? Math.max(0, Math.min(1, (itemDifficulty - 1) / 3))
    : Math.max(0, Math.min(1, itemDifficulty));

  // Tỉ số thời gian so với thời gian kỳ vọng
  const safeExpected = Math.max(10, expectedTimeSec);
  const timeRatio = Math.max(0.01, timeSpentSec / safeExpected);

  // Chỉ số bất thường thời gian cực ngắn (Rapid Anomaly) theo Wise & Kong (2005)
  // Nếu làm dưới 25% thời gian tối thiểu đọc hiểu đề -> Anomaly tăng vọt lên 1.0
  const rapidAnomaly = timeRatio < cfg.rapidTimeThresholdRatio
    ? Math.min(1.0, (cfg.rapidTimeThresholdRatio - timeRatio) / cfg.rapidTimeThresholdRatio + 0.5)
    : 0.0;

  const isRapidGuess = timeRatio < cfg.rapidTimeThresholdRatio;

  // 2. Tính Logit z
  const z = cfg.beta0 +
    cfg.beta1 * normDiff -
    cfg.beta2 * normTheta -
    cfg.beta3 * Math.min(2.0, timeRatio) +
    cfg.beta4 * rapidAnomaly;

  // 3. Hàm Sigmoid tính G
  const guessScore = 1.0 / (1.0 + Math.exp(-z));
  const roundedGuessScore = Number(guessScore.toFixed(3));

  // 4. Quyết định kích hoạt câu hỏi kiểm chứng đẳng cấu
  // Nếu câu hỏi được trả lời ĐÚNG nhưng điểm đoán mò vượt ngưỡng (G > 0.70)
  const triggerIsomorphicCheck = Boolean(isCorrect && roundedGuessScore >= cfg.guessThreshold);

  // Trọng số tin cậy của câu trả lời (Confidence weight)
  const confidence = Number((1.0 - roundedGuessScore).toFixed(3));

  return {
    guessScore: roundedGuessScore,
    isRapidGuess,
    triggerIsomorphicCheck,
    confidence
  };
}

/**
 * Cập nhật năng lực Rasch Theta có trọng số tin cậy (Confidence-Weighted Ability Update)
 * deltaTheta_eff = (1 - G) * deltaTheta_Rasch
 *
 * @param {Object} params
 * @param {number} params.currentTheta
 * @param {number} params.deltaRasch Mức tăng năng lực thuần của thuật toán Rasch
 * @param {number} params.guessScore Điểm đoán mò G
 * @returns {number} Năng lực mới đã hiệu chỉnh độ tin cậy
 */
export function confidenceWeightedThetaUpdate({ currentTheta, deltaRasch, guessScore }) {
  const confidence = Math.max(0.05, 1.0 - Math.min(0.95, guessScore));
  const effectiveDelta = deltaRasch * confidence;
  return Number((currentTheta + effectiveDelta).toFixed(3));
}

/**
 * Kiểm chứng câu trả lời với bài kiểm tra đẳng cấu (Isomorphic Verification Check)
 *
 * @param {Object} params
 * @param {boolean} params.originalCorrect Kết quả câu gốc (thường là true do đoán trúng)
 * @param {boolean} params.isomorphicCorrect Kết quả câu hỏi đẳng cấu kiểm chứng
 * @param {number} params.guessScore Điểm đoán mò câu gốc
 * @returns {{ verifiedMastery: boolean, confirmedLuckyGuess: boolean, thetaAdjustment: number, diagnosis: string }}
 */
export function verifyIsomorphicAttempt({ originalCorrect, isomorphicCorrect, guessScore }) {
  if (originalCorrect && !isomorphicCorrect) {
    // Đoán trúng ngẫu nhiên ở câu trước, sang câu đẳng cấu lộ ngay lỗ hổng
    return {
      verifiedMastery: false,
      confirmedLuckyGuess: true,
      thetaAdjustment: -0.4, // Phạt giảm năng lực do đoán mò không thực chất
      diagnosis: 'Xác nhận đoán mò may mắn: Làm đúng câu gốc do xác suất ngẫu nhiên nhưng thất bại ở câu đẳng cấu.'
    };
  }

  if (originalCorrect && isomorphicCorrect) {
    // Làm đúng cả 2 câu đẳng cấu -> Bác bỏ giả thuyết đoán mò, năng lực thực sự vững
    return {
      verifiedMastery: true,
      confirmedLuckyGuess: false,
      thetaAdjustment: 0.25, // Bổ sung điểm tin cậy đầy đủ
      diagnosis: 'Bác bỏ giả thuyết đoán mò: Học sinh vượt qua bài kiểm chứng đẳng cấu, năng lực vững vàng.'
    };
  }

  return {
    verifiedMastery: false,
    confirmedLuckyGuess: false,
    thetaAdjustment: 0.0,
    diagnosis: 'Cần tiếp tục luyện tập và củng cố kiến thức.'
  };
}


/* ========================================================================= */
/* PHAN HE 2: ROOT-CAUSE GAP TRACER (RCGT)                                  */
/* ========================================================================= */

/**
 * Phân tích và truy vết lỗ hổng nhận thức gốc (Root-Cause Knowledge Gap)
 * từ danh sách các lỗi biểu hiện quan sát được qua Causal Error DAG
 *
 * @param {string[]} observedErrors Danh sách mã lỗi học sinh mắc phải (vd: ['E-DN-02', 'E-TT-01'])
 * @returns {{
 *   manifestErrors: string[],
 *   rootCauseId: string | null,
 *   rootCauseName: string | null,
 *   targetKuId: string | null,
 *   crgGain: number,
 *   causalChain: string[],
 *   recommendation: string
 * }}
 */
export function traceRootKnowledgeGap(observedErrors) {
  if (!observedErrors || observedErrors.length === 0) {
    return {
      manifestErrors: [],
      rootCauseId: null,
      rootCauseName: null,
      targetKuId: null,
      crgGain: 0,
      causalChain: [],
      recommendation: 'Không ghi nhận lỗi sai nhận thức cần truy vết.'
    };
  }

  // 1. Dùng thuật toán Chẩn đoán Lỗi Gốc (Root-Cause Attribution) từ causal-graph
  const candidates = diagnoseRootCause(observedErrors);
  const { parents } = buildGraph();

  let selectedRootId = null;
  let selectedRootMeta = null;

  if (candidates.length > 0) {
    selectedRootId = candidates[0].rootCause;
    selectedRootMeta = ERROR_NODES.find((n) => n.id === selectedRootId);
  } else {
    // Fallback: Nếu không tìm thấy candidate trong ROOT_ERROR_IDS, duyệt ngược tổ tiên
    for (const errId of observedErrors) {
      const ancestors = getAncestors(errId, parents);
      const rootAncestors = ancestors.filter((a) => ROOT_ERROR_IDS.includes(a));
      if (rootAncestors.length > 0) {
        selectedRootId = rootAncestors[0];
        selectedRootMeta = ERROR_NODES.find((n) => n.id === selectedRootId);
        break;
      }
    }

    // Nếu vẫn không có tổ tiên gốc, lấy lỗi đầu tiên làm đích
    if (!selectedRootId) {
      selectedRootId = observedErrors[0];
      selectedRootMeta = ERROR_NODES.find((n) => n.id === selectedRootId);
    }
  }

  // 2. Tính toán Chỉ số Lợi ích Nhân quả CRG khi can thiệp lỗi gốc này
  const crgResult = selectedRootId ? calculateCausalRemediationGain(selectedRootId) : null;
  const crgGain = crgResult?.totalCausalGain ?? 0;

  // 3. Xây dựng chuỗi nhân quả dẫn truyền từ Root -> Manifest Error
  const causalChain = [];
  if (selectedRootId) {
    causalChain.push(selectedRootId);
    for (const obs of observedErrors) {
      if (obs !== selectedRootId && !causalChain.includes(obs)) {
        causalChain.push(obs);
      }
    }
  }

  // 4. Lập lời khuyên sư phạm định hướng can thiệp
  const rootName = selectedRootMeta?.name ?? selectedRootId ?? 'Chưa xác định';
  const targetKuId = selectedRootMeta?.kuId ?? null;
  const recommendation = selectedRootId
    ? `Truy vết nhân quả thành công: Lỗi bề mặt xuất phát từ lỗ hổng gốc [${selectedRootId}: ${rootName}]. Cần can thiệp dứt điểm tại đơn vị kiến thức ${targetKuId} để giải tỏa ${crgGain} điểm rủi ro toàn mạng lưới.`
    : 'Chưa đủ dữ liệu chuỗi nhân quả.';

  return {
    manifestErrors: observedErrors,
    rootCauseId: selectedRootId,
    rootCauseName: rootName,
    targetKuId,
    crgGain,
    causalChain,
    recommendation
  };
}


/* ========================================================================= */
/* PHAN HE 3: ADAPTIVE RECOVERY INTERVENTION OPTIMIZER (ARIO)               */
/* Thuật toán Contextual Multi-Armed Bandit (LinUCB)                         */
/* ========================================================================= */

/**
 * 4 Cánh tay can thiệp sư phạm khả dĩ của hệ thống
 * @type {Array<{ id: string, name: string, description: string }>}
 */
export const INTERVENTION_ARMS = [
  {
    id: 'micro_lesson',
    name: 'Vi bài học chẩn đoán',
    description: 'Bài giảng vi mô 3-5 phút đối chiếu trực diện mô hình sai lầm và mô hình đúng đắn.'
  },
  {
    id: 'scaffold_hint',
    name: 'Gợi ý 3 tầng giàn giáo',
    description: 'Hỗ trợ tự lực từng bước qua câu hỏi định hướng, gợi mở và chìa khoá phương pháp.'
  },
  {
    id: 'jigsaw_peer',
    name: 'Nhóm tương trợ Jigsaw',
    description: 'Ghép cặp học tập thích ứng với bạn cùng tiến đã làm chủ kiến thức (R06 Master).'
  },
  {
    id: 'teacher_queue',
    name: 'Hàng đợi Giáo viên (1-1)',
    description: 'Chuyển tiếp ca can thiệp cho giáo viên trực tiếp trao đổi 1-1 trước giờ học.'
  }
];

export const ARM_IDS = INTERVENTION_ARMS.map((a) => a.id);
const CONTEXT_DIMENSION = 5;

/**
 * Khởi tạo mô hình LinUCB với ma trận hiệp phương sai A_a và vector b_a
 *
 * @returns {Record<string, { A: number[][], b: number[], count: number }>}
 */
export function createLinUcbModel() {
  const model = {};
  for (const armId of ARM_IDS) {
    // Ma trận đơn vị kích thước 5x5: A_a = I_d
    const A = Array.from({ length: CONTEXT_DIMENSION }, (_, i) =>
      Array.from({ length: CONTEXT_DIMENSION }, (_, j) => (i === j ? 1.0 : 0.0))
    );
    // Vector b_a = 0_d
    const b = new Array(CONTEXT_DIMENSION).fill(0.0);

    model[armId] = { A, b, count: 0 };
  }
  return model;
}

/**
 * Nhân ma trận nghịch đảo với vector: x = A^(-1) * b (dùng giải hệ Gauss-Jordan cho ma trận 5x5)
 * @param {number[][]} A Ma trận 5x5
 * @param {number[]} b Vector 5
 * @returns {number[]} Vector nghiệm theta = A^(-1) * b
 */
function solveLinearSystem(A, b) {
  const n = b.length;
  // Ghép ma trận tăng cường [A | b]
  const M = A.map((row, i) => [...row, b[i]]);

  for (let i = 0; i < n; i++) {
    // Tìm phần tử chốt lớn nhất
    let maxRow = i;
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(M[k][i]) > Math.abs(M[maxRow][i])) {
        maxRow = k;
      }
    }
    // Hoán vị dòng
    const tmp = M[i];
    M[i] = M[maxRow];
    M[maxRow] = tmp;

    const pivot = M[i][i] || 1e-6;
    for (let j = i; j <= n; j++) {
      M[i][j] /= pivot;
    }

    for (let k = 0; k < n; k++) {
      if (k !== i) {
        const factor = M[k][i];
        for (let j = i; j <= n; j++) {
          M[k][j] -= factor * M[i][j];
        }
      }
    }
  }

  return M.map((row) => row[n]);
}

/**
 * Trích xuất vector ngữ cảnh học sinh x in R^5
 * x = [thetaNorm, timeRatio, lesEngagementNorm, errorRecurrenceNorm, bias]
 *
 * @param {Object} params
 * @param {number} params.studentTheta Năng lực hiện tại
 * @param {number} params.timeSpentSec Thời gian làm bài trung bình
 * @param {number} [params.expectedTimeSec=60]
 * @param {number} [params.lesScore=70] Chỉ số gắn kết LES [0, 100]
 * @param {number} [params.errorRecurrence=1] Số lần tái phát lỗi
 * @returns {number[]} Vector ngũ chiều x
 */
export function extractContextVector({
  studentTheta = 0.5,
  timeSpentSec = 60,
  expectedTimeSec = 60,
  lesScore = 70,
  errorRecurrence = 1
}) {
  const thetaNorm = studentTheta > 1 || studentTheta < 0
    ? Math.max(0, Math.min(1, (studentTheta + 3) / 6))
    : Math.max(0, Math.min(1, studentTheta));

  const safeExpected = Math.max(10, expectedTimeSec);
  const timeRatio = Math.max(0.1, Math.min(2.0, timeSpentSec / safeExpected));
  const lesNorm = Math.max(0, Math.min(1, lesScore / 100));
  const recurrenceNorm = Math.max(0, Math.min(1, errorRecurrence / 3));

  return [thetaNorm, timeRatio, lesNorm, recurrenceNorm, 1.0];
}

/**
 * Thuật toán LinUCB lựa chọn Cánh tay Can thiệp tối ưu nhất (Action Arm Selection)
 * p_a = x^T * theta_hat_a + alpha * sqrt(x^T * A_a^(-1) * x)
 *
 * @param {number[]} contextVector Vector x
 * @param {Record<string, any>} [model] Mô hình LinUCB (tự khởi tạo nếu chưa có)
 * @param {number} [alpha=0.4] Hệ số khám phá (Exploration parameter)
 * @param {number} [recurrenceCount=1] Số lần tái phát lỗi sai
 * @returns {{
 *   selectedArm: string,
 *   armName: string,
 *   predictedScore: number,
 *   scores: Record<string, number>,
 *   reason: string
 * }}
 */
export function selectInterventionArm(
  contextVector,
  model = null,
  alpha = 0.4,
  recurrenceCount = 1
) {
  const activeModel = model ?? createLinUcbModel();

  // Quy tắc ưu tiên sư phạm nghiêm ngặt (Pedagogical Safety Guardrail):
  // Nếu lỗi đã tái phát >= 3 lần thì ưu tiên chuyển thẳng Giáo viên hoặc Jigsaw
  if (recurrenceCount >= 3) {
    const isTeacher = recurrenceCount >= 4;
    const armId = isTeacher ? 'teacher_queue' : 'jigsaw_peer';
    const armMeta = INTERVENTION_ARMS.find((a) => a.id === armId);
    return {
      selectedArm: armId,
      armName: armMeta?.name ?? armId,
      predictedScore: 0.99,
      scores: { [armId]: 0.99 },
      reason: `Can thiệp an toàn sư phạm: Lỗi sai đã tái phát ${recurrenceCount} lần, cần chuyển giao can thiệp cấp cao.`
    };
  }

  let bestArm = ARM_IDS[0];
  let maxScore = -Infinity;
  const scores = {};

  for (const armId of ARM_IDS) {
    const { A, b } = activeModel[armId];
    // theta_hat = A^(-1) * b
    const thetaHat = solveLinearSystem(A, b);

    // p_expected = x^T * theta_hat
    let mean = 0;
    for (let i = 0; i < CONTEXT_DIMENSION; i++) {
      mean += contextVector[i] * thetaHat[i];
    }

    // Heuristic LinUCB UCB term: approximation using diagonal of A
    // In strict LinUCB: var = x^T * A^(-1) * x
    let variance = 0;
    for (let i = 0; i < CONTEXT_DIMENSION; i++) {
      variance += (contextVector[i] * contextVector[i]) / (A[i][i] || 1.0);
    }
    const ucb = alpha * Math.sqrt(Math.max(0, variance));

    // Bổ sung bias chuyên môn sư phạm khởi điểm (Priors)
    let priorBias = 0;
    const [theta, , les, rec] = contextVector;
    if (armId === 'scaffold_hint' && theta >= 0.5 && rec <= 1) priorBias = 0.20;
    if (armId === 'micro_lesson' && les < 0.5) priorBias = 0.25;
    if (armId === 'jigsaw_peer' && rec === 2) priorBias = 0.22;
    if (armId === 'teacher_queue' && rec >= 3) priorBias = 0.35;

    const totalArmScore = Number((mean + ucb + priorBias).toFixed(3));
    scores[armId] = totalArmScore;

    if (totalArmScore > maxScore) {
      maxScore = totalArmScore;
      bestArm = armId;
    }
  }

  const selectedMeta = INTERVENTION_ARMS.find((a) => a.id === bestArm);

  return {
    selectedArm: bestArm,
    armName: selectedMeta?.name ?? bestArm,
    predictedScore: maxScore,
    scores,
    reason: `LinUCB chọn ${selectedMeta?.name} dựa trên điểm thích ứng tối ưu (UCB: ${maxScore}).`
  };
}

/**
 * Cập nhật mô hình LinUCB sau khi nhận phần thưởng thực tế Reward (CLVT Feedback)
 * A_a = A_a + x * x^T
 * b_a = b_a + r * x
 *
 * @param {Record<string, any>} model
 * @param {string} chosenArm
 * @param {number[]} contextVector
 * @param {number} reward Phần thưởng r in [0, 1]
 */
export function updateLinUcbModel(model, chosenArm, contextVector, reward) {
  if (!model[chosenArm]) return;

  const { A, b } = model[chosenArm];

  for (let i = 0; i < CONTEXT_DIMENSION; i++) {
    for (let j = 0; j < CONTEXT_DIMENSION; j++) {
      A[i][j] += contextVector[i] * contextVector[j];
    }
    b[i] += reward * contextVector[i];
  }
  model[chosenArm].count += 1;
}


/* ========================================================================= */
/* PHAN HE 4: CLOSED-LOOP VERIFICATION & GAIN TRACKER (CLVT)                */
/* ========================================================================= */

/**
 * Tính Chỉ số Tiến bộ Chuẩn hoá (Normalized Learning Gain - g) theo Hake (1998)
 * g = (Post - Pre) / (MaxPossible - Pre)
 *
 * @param {number} preScore Điểm trước can thiệp (thang 0-10)
 * @param {number} postScore Điểm sau can thiệp (thang 0-10)
 * @param {number} [maxScore=10] Thang điểm tối đa
 * @returns {{
 *   gain: number,
 *   gainCategory: 'high' | 'medium' | 'low' | 'negative',
 *   gainLabel: string,
 *   isRecovered: boolean
 * }}
 */
export function calculateNormalizedGain(preScore, postScore, maxScore = 10) {
  const safePre = Math.max(0, Math.min(maxScore, preScore));
  const safePost = Math.max(0, Math.min(maxScore, postScore));

  let gain = 0;

  if (safePre >= maxScore) {
    gain = safePost >= maxScore ? 1.0 : 0.0;
  } else {
    gain = (safePost - safePre) / (maxScore - safePre);
  }

  const roundedGain = Number(gain.toFixed(3));

  let gainCategory = 'low';
  let gainLabel = 'Tiến bộ thấp (Chưa phục hồi)';
  let isRecovered = false;

  if (roundedGain < 0) {
    gainCategory = 'negative';
    gainLabel = 'Thụt lùi (Cần xem xét lại)';
  } else if (roundedGain >= 0.70) {
    gainCategory = 'high';
    gainLabel = 'Tiến bộ cao (Phục hồi xuất sắc)';
    isRecovered = true;
  } else if (roundedGain >= 0.30) {
    gainCategory = 'medium';
    gainLabel = 'Tiến bộ trung bình (Phục hồi đạt yêu cầu)';
    isRecovered = true;
  }

  return {
    gain: roundedGain,
    gainCategory,
    gainLabel,
    isRecovered
  };
}

/**
 * Máy trạng thái Quá trình Phục hồi Kiến thức (Recovery State Machine)
 * Các trạng thái: 'detected' -> 'in_remediation' -> 'verified_success' | 'escalated'
 *
 * @param {Object} params
 * @param {'detected' | 'in_remediation' | 'verified_success' | 'escalated'} params.currentState
 * @param {number} params.attemptCount Số lần thử nghiệm can thiệp
 * @param {number} params.learningGain Chỉ số tiến bộ g
 * @param {number} params.postScore Điểm kiểm chứng sau can thiệp
 * @returns {{
 *   nextState: 'detected' | 'in_remediation' | 'verified_success' | 'escalated',
 *   isResolved: boolean,
 *   needsTeacherEscalation: boolean,
 *   actionSummary: string
 * }}
 */
export function transitionRecoveryState({
  currentState,
  attemptCount = 1,
  learningGain = 0,
  postScore = 0
}) {
  // 1. Nếu đã thành công trước đó thì giữ nguyên
  if (currentState === 'verified_success') {
    return {
      nextState: 'verified_success',
      isResolved: true,
      needsTeacherEscalation: false,
      actionSummary: 'Đã hoàn tất chu trình phục hồi thành công.'
    };
  }

  // 2. Tiêu chuẩn thành công: g >= 0.40 HOẶC điểm sau can thiệp >= 8.0
  if (learningGain >= 0.40 || postScore >= 8.0) {
    return {
      nextState: 'verified_success',
      isResolved: true,
      needsTeacherEscalation: false,
      actionSummary: `Thành công: Đã phục hồi nhận thức với chỉ số tiến bộ g = ${learningGain} và điểm kiểm chứng ${postScore}/10.`
    };
  }

  // 3. Tiêu chuẩn leo thang lên Giáo viên (Escalation):
  // Thử nghiệm can thiệp tự động >= 2 lần mà tiến bộ vẫn thấp (g < 0.3)
  if (attemptCount >= 2 && learningGain < 0.30) {
    return {
      nextState: 'escalated',
      isResolved: false,
      needsTeacherEscalation: true,
      actionSummary: `Báo động: Can thiệp tự động không hiệu quả qua ${attemptCount} lần (g = ${learningGain}). Chuyển giao ngay cho giáo viên can thiệp trực tiếp.`
    };
  }

  // 4. Nếu chưa đạt nhưng chưa vượt quá số lần thử -> Tiếp tục can thiệp
  return {
    nextState: 'in_remediation',
    isResolved: false,
    needsTeacherEscalation: false,
    actionSummary: `Đang can thiệp: Học sinh đạt tiến bộ g = ${learningGain}, tiếp tục đợt rèn luyện tiếp theo.`
  };
}

/**
 * Tính phần thưởng tích hợp Reward cho vòng lặp học tăng cường Bandit
 * r = 0.7 * g + 0.3 * (Post / 10)
 *
 * @param {number} normalizedGain Chỉ số g của Hake
 * @param {number} postScore Điểm kiểm chứng thang 10
 * @returns {number} Reward r in [0, 1]
 */
export function calculateInterventionReward(normalizedGain, postScore) {
  const normPost = Math.max(0, Math.min(1.0, postScore / 10));
  const safeGain = Math.max(0, Math.min(1.0, normalizedGain));
  const reward = 0.7 * safeGain + 0.3 * normPost;
  return Number(reward.toFixed(3));
}

/* ========================================================================= */
/* TRỤ CỘT ĐIỀU PHỐI TỔNG THỂ (ALRE MASTER ORCHESTRATOR)                    */
/* ========================================================================= */

/**
 * Xử lý toàn diện một chu trình phục hồi nhận thức cho học sinh
 *
 * @param {Object} params
 * @param {string} params.studentId
 * @param {number} params.studentTheta
 * @param {string[]} params.observedErrors
 * @param {number} params.itemDifficulty
 * @param {number} params.timeSpentSec
 * @param {number} params.expectedTimeSec
 * @param {boolean} params.isCorrect
 * @param {number} [params.lesScore=75]
 * @param {number} [params.errorRecurrence=1]
 * @param {Record<string, any>} [params.banditModel]
 * @returns {Object} Toàn bộ hồ sơ chẩn đoán và kế hoạch can thiệp ALRE
 */
export function orchestrateRecoveryProcess({
  studentId,
  studentTheta,
  observedErrors,
  itemDifficulty,
  timeSpentSec,
  expectedTimeSec = 60,
  isCorrect,
  lesScore = 75,
  errorRecurrence = 1,
  banditModel = null
}) {
  // Pha 1: Lọc nhiễu & Đoán mò (GDVM)
  const gdvmResult = calculateGuessScore({
    studentTheta,
    itemDifficulty,
    timeSpentSec,
    expectedTimeSec,
    isCorrect
  });

  // Pha 2: Truy vết lỗ hổng gốc (RCGT)
  const rcgtResult = traceRootKnowledgeGap(observedErrors);

  // Pha 3: Tối ưu hoá can thiệp (ARIO)
  const contextVector = extractContextVector({
    studentTheta,
    timeSpentSec,
    expectedTimeSec,
    lesScore,
    errorRecurrence
  });

  const arioResult = selectInterventionArm(
    contextVector,
    banditModel,
    0.4,
    errorRecurrence
  );

  return {
    studentId,
    timestamp: new Date().toISOString(),
    phase1_gdvm: gdvmResult,
    phase2_rcgt: rcgtResult,
    phase3_ario: arioResult,
    contextVector,
    recoveryPlan: {
      actionArm: arioResult.selectedArm,
      actionName: arioResult.armName,
      targetKuId: rcgtResult.targetKuId,
      rootCauseId: rcgtResult.rootCauseId,
      rootCauseName: rcgtResult.rootCauseName,
      status: 'detected',
      triggerIsomorphicCheck: gdvmResult.triggerIsomorphicCheck
    }
  };
}
