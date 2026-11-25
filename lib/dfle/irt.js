/**
 * ITEM RESPONSE THEORY (IRT) — MÔ HÌNH RASCH (1PL) VỚI TIỀN NGHIỆM BAYESIAN MAP
 * ===========================================================================
 * Nâng cấp phương pháp trắc nghiệm cổ điển (CTT) lên chuẩn đo lường quốc tế (PISA, SAT).
 *
 * Bản chất mô hình Rasch:
 *   Xác suất học sinh j (năng lực θ_j) trả lời đúng câu hỏi i (độ khó b_i):
 *     P(Y_ij = 1 | θ_j, b_i) = 1 / (1 + exp(-(θ_j - b_i)))
 *
 * Thuật toán ước lượng:
 *   Bayesian Maximum A Posteriori (MAP) với Tiền nghiệm Gauss chuẩn N(0, σ^2).
 *   Giải quyết triệt để bài toán phân kỳ cực trị (Neyman-Scott problem) của phương pháp
 *   JMLE truyền thống khi có học sinh đạt điểm tuyệt đối hoặc 0 điểm.
 */

/**
 * Tính xác suất làm đúng theo hàm Logistic Rasch
 * @param {number} theta năng lực tiềm ẩn của học sinh (-3 đến +3)
 * @param {number} b độ khó của câu hỏi (-3 đến +3)
 * @returns {number} xác suất P in (0, 1)
 */
export function raschProbability(theta, b) {
  const diff = theta - b;
  if (diff > 35) return 0.999999999999;
  if (diff < -35) return 0.000000000001;
  return 1 / (1 + Math.exp(-diff));
}

/**
 * Hàm thông tin câu hỏi (Item Information Function) trong Rasch 1PL
 * Đạt cực đại bằng 0.25 khi theta == b (câu hỏi đo chính xác nhất ở mức năng lực bằng đúng độ khó của nó)
 * @param {number} theta
 * @param {number} b
 * @returns {number}
 */
export function itemInformation(theta, b) {
  const p = raschProbability(theta, b);
  return p * (1 - p);
}

/**
 * Hàm thông tin toàn bài kiểm tra (Test Information Function)
 * @param {number} theta
 * @param {number[]} bs mảng độ khó các câu hỏi
 * @returns {number}
 */
export function testInformation(theta, bs) {
  return bs.reduce((sum, b) => sum + itemInformation(theta, b), 0);
}

/**
 * Sai số đo lường chuẩn (Standard Error of Measurement - SEM)
 * SE(theta) = 1 / sqrt(TestInformation(theta))
 * @param {number} theta
 * @param {number[]} bs mảng độ khó các câu hỏi
 * @returns {number}
 */
export function standardError(theta, bs) {
  const info = testInformation(theta, bs);
  if (info <= 0.0001) return 3.0;
  return Math.round((1 / Math.sqrt(info)) * 100) / 100;
}

/**
 * Quy đổi từ năng lực logit theta sang thang điểm quen thuộc 0–10
 * Dùng hàm Logistic Sigmoid căn chỉnh mốc: theta = 0 tương đương 5.0 điểm
 * @param {number} theta
 * @returns {number} điểm thang 10, làm tròn 1 chữ số thập phân
 */
export function thetaToScore(theta) {
  if (theta === null || theta === undefined || isNaN(theta)) return 0;
  // theta = 0 -> 5.0; theta = +2.5 -> 9.2; theta = -2.5 -> 0.8
  const scaled = 10 / (1 + Math.exp(-theta));
  return Math.round(Math.min(10, Math.max(0, scaled)) * 10) / 10;
}

/**
 * Gán nhãn sư phạm định tính cho độ khó câu hỏi b_i
 * @param {number} b
 * @returns {'rất dễ' | 'dễ' | 'vừa sức' | 'khó' | 'rất khó'}
 */
export function labelDifficulty(b) {
  if (b < -1.2) return 'rất dễ';
  if (b < -0.4) return 'dễ';
  if (b <= 0.4) return 'vừa sức';
  if (b <= 1.2) return 'khó';
  return 'rất khó';
}

/**
 * @typedef {object} ResponseRecord
 * @property {string} studentId
 * @property {string} itemId
 * @property {boolean} isCorrect
 */

/**
 * Ước lượng đồng thời Năng lực học sinh (θ) và Độ khó câu hỏi (b)
 * Phương pháp: Bayesian Maximum A Posteriori (MAP) với Tiền nghiệm Gauss N(0, σ^2).
 *
 * @param {ResponseRecord[]} responses Danh sách các câu trả lời
 * @param {object} [options]
 * @param {number} [options.maxIterations=25] Số vòng lặp tối đa
 * @param {number} [options.convergenceThreshold=0.002] Ngưỡng dừng hội tụ
 * @param {number} [options.priorVariance=2.5] Phương sai tiền nghiệm σ^2
 * @returns {{
 *   students: Map<string, { theta: number, score: number, se: number, rawCount: number, correctCount: number }>,
 *   items: Map<string, { b: number, difficultyLabel: string, pValue: number, totalResponses: number, correctResponses: number }>,
 *   iterations: number,
 *   converged: boolean
 * }}
 */
export function estimateRasch(responses, options = {}) {
  const maxIterations = options.maxIterations ?? 25;
  const tol = options.convergenceThreshold ?? 0.002;
  const sigmaSq = options.priorVariance ?? 2.5;

  const studentSet = new Set();
  const itemSet = new Set();
  const matrix = new Map();

  for (const r of responses) {
    studentSet.add(r.studentId);
    itemSet.add(r.itemId);
    if (!matrix.has(r.studentId)) matrix.set(r.studentId, new Map());
    matrix.get(r.studentId).set(r.itemId, Boolean(r.isCorrect));
  }

  const studentList = [...studentSet];
  const itemList = [...itemSet];
  const N = studentList.length;
  const I = itemList.length;

  if (N === 0 || I === 0) {
    return {
      students: new Map(),
      items: new Map(),
      iterations: 0,
      converged: true
    };
  }

  // Khởi tạo năng lực ban đầu từ tỷ lệ làm đúng
  const thetas = new Map();
  const rawCorrectStudent = new Map();
  const rawTotalStudent = new Map();

  for (const s of studentList) {
    const sMap = matrix.get(s);
    let correct = 0, total = 0;
    for (const item of itemList) {
      if (sMap && sMap.has(item)) {
        total++;
        if (sMap.get(item)) correct++;
      }
    }
    rawCorrectStudent.set(s, correct);
    rawTotalStudent.set(s, total);
    const p = total > 0 ? (correct + 0.5) / (total + 1.0) : 0.5;
    thetas.set(s, Math.log(p / (1 - p)));
  }

  // Khởi tạo độ khó câu hỏi ban đầu
  const bs = new Map();
  const rawCorrectItem = new Map();
  const rawTotalItem = new Map();

  for (const item of itemList) {
    let correct = 0, total = 0;
    for (const s of studentList) {
      const sMap = matrix.get(s);
      if (sMap && sMap.has(item)) {
        total++;
        if (sMap.get(item)) correct++;
      }
    }
    rawCorrectItem.set(item, correct);
    rawTotalItem.set(item, total);
    const p = total > 0 ? (correct + 0.5) / (total + 1.0) : 0.5;
    bs.set(item, Math.log((1 - p) / p));
  }

  // Vòng lặp Bayesian MAP Newton-Raphson
  let iter = 0;
  let converged = false;

  while (iter < maxIterations) {
    iter++;
    let maxChange = 0;

    // 1. Cập nhật theta học sinh với prior N(0, sigmaSq)
    for (const s of studentList) {
      const sMap = matrix.get(s);
      const currTheta = thetas.get(s);
      let residual = 0;
      let variance = 0;

      for (const item of itemList) {
        if (!sMap || !sMap.has(item)) continue;
        const y = sMap.get(item) ? 1 : 0;
        const p = raschProbability(currTheta, bs.get(item));
        residual += (y - p);
        variance += p * (1 - p);
      }

      const grad1 = residual - (currTheta / sigmaSq);
      const grad2 = -variance - (1 / sigmaSq);
      const delta = - (grad1 / grad2);

      const clampedDelta = Math.max(-1.5, Math.min(1.5, delta));
      thetas.set(s, currTheta + clampedDelta);
      maxChange = Math.max(maxChange, Math.abs(clampedDelta));
    }

    // 2. Cập nhật b câu hỏi với prior N(0, sigmaSq)
    for (const item of itemList) {
      const currB = bs.get(item);
      let residual = 0;
      let variance = 0;

      for (const s of studentList) {
        const sMap = matrix.get(s);
        if (!sMap || !sMap.has(item)) continue;
        const y = sMap.get(item) ? 1 : 0;
        const p = raschProbability(thetas.get(s), currB);
        residual += (p - y);
        variance += p * (1 - p);
      }

      const grad1 = residual - (currB / sigmaSq);
      const grad2 = -variance - (1 / sigmaSq);
      const delta = - (grad1 / grad2);

      const clampedDelta = Math.max(-1.5, Math.min(1.5, delta));
      bs.set(item, currB + clampedDelta);
      maxChange = Math.max(maxChange, Math.abs(clampedDelta));
    }

    // Ràng buộc nhận diện: Căn trọng tâm b về 0
    const meanB = [...bs.values()].reduce((sum, v) => sum + v, 0) / I;
    for (const item of itemList) bs.set(item, bs.get(item) - meanB);

    if (maxChange < tol) {
      converged = true;
      break;
    }
  }

  // Đóng gói kết quả đầu ra
  const allBs = [...bs.values()];
  const studentsResult = new Map();

  for (const s of studentList) {
    const rawTheta = thetas.get(s);
    const thetaClamped = Math.round(Math.max(-4, Math.min(4, rawTheta)) * 100) / 100;
    const se = standardError(thetaClamped, allBs);
    const score = thetaToScore(thetaClamped);

    studentsResult.set(s, {
      theta: thetaClamped,
      score,
      se,
      rawCount: rawTotalStudent.get(s) ?? 0,
      correctCount: rawCorrectStudent.get(s) ?? 0
    });
  }

  const itemsResult = new Map();
  for (const item of itemList) {
    const rawB = bs.get(item);
    const bClamped = Math.round(Math.max(-4, Math.min(4, rawB)) * 100) / 100;
    const total = rawTotalItem.get(item) ?? 0;
    const correct = rawCorrectItem.get(item) ?? 0;
    const pValue = total > 0 ? Math.round((correct / total) * 100) / 100 : 0.5;

    itemsResult.set(item, {
      b: bClamped,
      difficultyLabel: labelDifficulty(bClamped),
      pValue,
      totalResponses: total,
      correctResponses: correct
    });
  }

  return {
    students: studentsResult,
    items: itemsResult,
    iterations: iter,
    converged
  };
}
