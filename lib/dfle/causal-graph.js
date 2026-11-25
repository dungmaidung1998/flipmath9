/**
 * DFLE-M7 · MÔ HÌNH TOÁN HỌC ĐỒ THỊ NHÂN QUẢ LỖI SAI (CAUSAL ERROR DAG)
 * ===========================================================================
 * Dựa trên Mô hình Nhân quả Cấu trúc (Structural Causal Model - SCM) và lý thuyết
 * do-calculus của Judea Pearl (2000, 2009).
 *
 * Chức năng cốt lõi:
 *   1. Biểu diễn cấu trúc Topo nhân quả phi chu trình G = (V, E) của 23 mã lỗi Chương I.
 *   2. Tham số hoá xác suất theo cổng Noisy-OR Gate.
 *   3. Thuật toán Chẩn đoán Lỗi gốc (Root-Cause Attribution).
 *   4. Thuật toán Can thiệp do(E_root = 0) và tính Chỉ số Lợi ích Nhân quả (CRG).
 */

/**
 * 23 Nút Lỗi sai trong Chương I được phân loại theo vai trò nhân quả
 * @typedef {'root' | 'mediating' | 'leaf'} ErrorRole
 */
export const ERROR_NODES = [
  // Cụm 1: Khái niệm số hữu tỉ, Số đối, Trục số & So sánh
  { id: 'E-HT-01', name: 'Chỉ phân số mới là số hữu tỉ', role: 'root', kuId: 'C1-B1-M1', cluster: 'Khái niệm & Trục số' },
  { id: 'E-HT-02', name: 'Nhầm số đối với số nghịch đảo', role: 'root', kuId: 'C1-B1-M1', cluster: 'Khái niệm & Trục số' },
  { id: 'E-HT-03', name: 'Đặt số âm sai chiều trên trục số', role: 'mediating', kuId: 'C1-B1-M1B', cluster: 'Khái niệm & Trục số' },
  { id: 'E-TT-01', name: 'So sánh hai số âm theo giá trị tuyệt đối', role: 'leaf', kuId: 'C1-B1-M2', cluster: 'Khái niệm & Trục số' },
  { id: 'E-TT-02', name: 'So sánh phân số so tử với tử, mẫu với mẫu', role: 'leaf', kuId: 'C1-B1-M2', cluster: 'Khái niệm & Trục số' },

  // Cụm 2: Quy tắc dấu ngoặc & Quy tắc chuyển vế
  { id: 'E-DN-01', name: 'Bỏ ngoặc trước có dấu trừ chỉ đổi số hạng đầu', role: 'mediating', kuId: 'C1-B2-M2', cluster: 'Dấu ngoặc & Chuyển vế' },
  { id: 'E-DN-02', name: 'Đặt ngoặc trước có dấu trừ không đổi dấu', role: 'mediating', kuId: 'C1-B2-M2', cluster: 'Dấu ngoặc & Chuyển vế' },
  { id: 'E-CV-01', name: 'Chuyển vế giữ nguyên dấu', role: 'mediating', kuId: 'C1-B4-M2', cluster: 'Dấu ngoặc & Chuyển vế' },
  { id: 'E-CV-02', name: 'Chuyển thừa số sang vế kia bằng cách đổi dấu', role: 'leaf', kuId: 'C1-B4-M2', cluster: 'Dấu ngoặc & Chuyển vế' },

  // Cụm 3: Phép cộng, trừ, nhân, chia phân số
  { id: 'E-CT-01', name: 'Cộng hai phân số là cộng tử với tử, mẫu với mẫu', role: 'root', kuId: 'C1-B2-M1', cluster: 'Phép tính phân số' },
  { id: 'E-CT-02', name: 'Quy đồng mẫu nhưng giữ nguyên tử số', role: 'mediating', kuId: 'C1-B2-M1', cluster: 'Phép tính phân số' },
  { id: 'E-CT-03', name: 'Cộng trái dấu thì cộng 2 trị tuyệt đối rồi giữ dấu đứng trước', role: 'leaf', kuId: 'C1-B2-M1', cluster: 'Phép tính phân số' },
  { id: 'E-NC-01', name: 'Chia hai phân số bằng cách nhân thẳng', role: 'leaf', kuId: 'C1-B2-M3', cluster: 'Phép tính phân số' },
  { id: 'E-NC-02', name: 'Khi chia thì nghịch đảo cả hai phân số', role: 'mediating', kuId: 'C1-B2-M3', cluster: 'Phép tính phân số' },
  { id: 'E-NC-03', name: 'Rút gọn bằng gạch bỏ số hạng của tổng', role: 'leaf', kuId: 'C1-B2-M3', cluster: 'Phép tính phân số' },

  // Cụm 4: Luỹ thừa & Thứ tự thực hiện phép tính
  { id: 'E-LT-01', name: 'Luỹ thừa cơ số âm luôn mang dấu âm', role: 'leaf', kuId: 'C1-B3-M1', cluster: 'Luỹ thừa & Thứ tự' },
  { id: 'E-LT-02', name: 'Không phân biệt (-a)^n với -a^n', role: 'root', kuId: 'C1-B3-M1', cluster: 'Luỹ thừa & Thứ tự' },
  { id: 'E-LT-03', name: 'Luỹ thừa tích/thương chỉ nâng cho một thừa số', role: 'leaf', kuId: 'C1-B3-M1', cluster: 'Luỹ thừa & Thứ tự' },
  { id: 'E-LT-04', name: 'Nhân hai luỹ thừa cùng cơ số thì nhân hai số mũ', role: 'root', kuId: 'C1-B3-M2', cluster: 'Luỹ thừa & Thứ tự' },
  { id: 'E-LT-05', name: 'Chia hai luỹ thừa cùng cơ số thì chia hai số mũ', role: 'leaf', kuId: 'C1-B3-M2', cluster: 'Luỹ thừa & Thứ tự' },
  { id: 'E-LT-06', name: 'Luỹ thừa của luỹ thừa thì cộng hai số mũ', role: 'leaf', kuId: 'C1-B3-M3', cluster: 'Luỹ thừa & Thứ tự' },
  { id: 'E-TU-01', name: 'Thực hiện từ trái sang phải không ưu tiên', role: 'root', kuId: 'C1-B4-M1', cluster: 'Luỹ thừa & Thứ tự' },
  { id: 'E-TU-02', name: 'Trong ngoặc trước thì lại làm ngoài ngoặc trước', role: 'leaf', kuId: 'C1-B4-M1', cluster: 'Luỹ thừa & Thứ tự' }
];

/**
 * Danh sách cạnh có hướng thể hiện quan hệ nhân quả trực tiếp
 * Trọng số weight w_ij in (0, 1] là lực truyền dẫn nhân quả (Causal Transmission Strength)
 */
export const CAUSAL_EDGES = [
  // Chuỗi 1: Khái niệm & Trục số
  { from: 'E-HT-01', to: 'E-TT-02', weight: 0.70, reason: 'Chưa hiểu bản chất phân số dẫn đến so sánh tử với tử, mẫu với mẫu' },
  { from: 'E-HT-02', to: 'E-HT-03', weight: 0.85, reason: 'Không hiểu số đối nên không định vị được điểm đối xứng âm qua gốc O' },
  { from: 'E-HT-03', to: 'E-TT-01', weight: 0.92, reason: 'Đặt số âm sai chiều trên trục số tất yếu dẫn đến so sánh âm theo trị tuyệt đối' },

  // Chuỗi 2: Dấu ngoặc & Chuyển vế
  { from: 'E-HT-02', to: 'E-DN-01', weight: 0.78, reason: 'Không nắm số đối dẫn đến nhầm bản chất dấu trừ trước ngoặc là nhân với -1' },
  { from: 'E-DN-01', to: 'E-DN-02', weight: 0.88, reason: 'Bỏ ngoặc sai quy tắc thì đặt ngoặc (phép nghịch đảo) cũng sai' },
  { from: 'E-DN-01', to: 'E-CV-01', weight: 0.72, reason: 'Chưa hiểu đổi dấu khi bỏ ngoặc dẫn đến quên đổi dấu khi chuyển vế' },
  { from: 'E-CV-01', to: 'E-CV-02', weight: 0.80, reason: 'Áp dụng máy móc quy tắc đổi dấu cho cả thừa số khi chia' },

  // Chuỗi 3: Phép tính phân số & Phép chia
  { from: 'E-CT-01', to: 'E-CT-02', weight: 0.75, reason: 'Coi tử và mẫu độc lập nên khi quy đồng chỉ nhân mẫu mà giữ nguyên tử' },
  { from: 'E-HT-02', to: 'E-CT-03', weight: 0.65, reason: 'Không nắm số đối và khoảng cách giá trị tuyệt đối khi cộng trái dấu' },
  { from: 'E-HT-02', to: 'E-NC-02', weight: 0.90, reason: 'Lẫn lộn khái niệm nghịch đảo nên nghịch đảo cả số bị chia' },
  { from: 'E-NC-02', to: 'E-NC-01', weight: 0.78, reason: 'Lúng túng về số nghịch đảo dẫn đến nhân thẳng tử với tử' },
  { from: 'E-CT-01', to: 'E-NC-03', weight: 0.82, reason: 'Tư duy chia cắt tử-mẫu dẫn đến gạch bỏ số hạng trong tổng' },

  // Chuỗi 4: Luỹ thừa & Thứ tự phép tính
  { from: 'E-LT-02', to: 'E-LT-01', weight: 0.86, reason: 'Không phân biệt dấu ngoặc cơ số dẫn đến kết luận cơ số âm luôn cho kết quả âm' },
  { from: 'E-LT-02', to: 'E-LT-03', weight: 0.74, reason: 'Nhầm lẫn phạm vi tác dụng của số mũ' },
  { from: 'E-LT-04', to: 'E-LT-05', weight: 0.72, reason: 'Nhầm cấp độ phép tính ở phép nhân kéo theo nhầm ở phép chia' },
  { from: 'E-LT-04', to: 'E-LT-06', weight: 0.84, reason: 'Nhầm lẫn công thức nhân số mũ khi nâng luỹ thừa của luỹ thừa' },
  { from: 'E-TU-01', to: 'E-TU-02', weight: 0.80, reason: 'Thiếu ý thức về thứ tự ưu tiên dẫn đến làm ngoài ngoặc trước' },
  { from: 'E-TU-01', to: 'E-CV-02', weight: 0.70, reason: 'Sai thứ tự ưu tiên dẫn đến chuyển vế thừa số trước khi cộng trừ' }
];

export const ROOT_ERROR_IDS = ['E-HT-01', 'E-HT-02', 'E-CT-01', 'E-LT-02', 'E-LT-04', 'E-TU-01'];

export const LEAK_PROBABILITY = 0.05; // q_0: Xác suất lỗi ngẫu nhiên / đãng trí

/**
 * Xây dựng cấu trúc danh sách kề và bản đồ cha/con cho đồ thị
 */
export function buildGraph() {
  /** @type {Map<string, Array<{id: string, weight: number, reason: string}>>} */
  const parents = new Map();
  /** @type {Map<string, Array<{id: string, weight: number, reason: string}>>} */
  const children = new Map();
  const inDegree = new Map();
  const outDegree = new Map();

  for (const node of ERROR_NODES) {
    parents.set(node.id, []);
    children.set(node.id, []);
    inDegree.set(node.id, 0);
    outDegree.set(node.id, 0);
  }

  for (const edge of CAUSAL_EDGES) {
    if (parents.has(edge.to)) {
      parents.get(edge.to).push({ id: edge.from, weight: edge.weight, reason: edge.reason });
      inDegree.set(edge.to, (inDegree.get(edge.to) || 0) + 1);
    }
    if (children.has(edge.from)) {
      children.get(edge.from).push({ id: edge.to, weight: edge.weight, reason: edge.reason });
      outDegree.set(edge.from, (outDegree.get(edge.from) || 0) + 1);
    }
  }

  return { nodes: ERROR_NODES, edges: CAUSAL_EDGES, parents, children, inDegree, outDegree };
}

/**
 * Kiểm tra tính phi chu trình (DAG) bằng thuật toán Kahn
 * @returns {boolean} true nếu không có chu trình
 */
export function isAcyclic() {
  const { nodes, inDegree, children } = buildGraph();
  const inDegCopy = new Map(inDegree);
  const queue = [];

  for (const [id, deg] of inDegCopy.entries()) {
    if (deg === 0) queue.push(id);
  }

  let visitedCount = 0;
  while (queue.length > 0) {
    const curr = queue.shift();
    visitedCount++;
    const nexts = children.get(curr) || [];
    for (const edge of nexts) {
      const d = inDegCopy.get(edge.id) - 1;
      inDegCopy.set(edge.id, d);
      if (d === 0) queue.push(edge.id);
    }
  }

  return visitedCount === nodes.length;
}

/**
 * Sắp xếp tô-pô (Topological Sort)
 * @returns {string[]} Danh sách ID nút theo thứ tự nguyên nhân trước - hệ quả sau
 */
export function topologicalSort() {
  const { nodes, inDegree, children } = buildGraph();
  const inDegCopy = new Map(inDegree);
  const queue = [];
  const order = [];

  for (const [id, deg] of inDegCopy.entries()) {
    if (deg === 0) queue.push(id);
  }

  while (queue.length > 0) {
    const curr = queue.shift();
    order.push(curr);
    const nexts = children.get(curr) || [];
    for (const edge of nexts) {
      const d = inDegCopy.get(edge.id) - 1;
      inDegCopy.set(edge.id, d);
      if (d === 0) queue.push(edge.id);
    }
  }

  if (order.length !== nodes.length) {
    throw new Error('Đồ thị nhân quả có chu trình (Cyclic Graph)!');
  }

  return order;
}

/**
 * Lấy toàn bộ các nút con cháu trong chuỗi nhân quả (Descendants)
 * @param {string} nodeId
 * @param {Map<string, any[]>} childrenMap
 * @param {Set<string>} [visited]
 * @returns {string[]}
 */
export function getDescendants(nodeId, childrenMap, visited = new Set()) {
  const result = [];
  const directChildren = childrenMap.get(nodeId) || [];

  for (const child of directChildren) {
    if (!visited.has(child.id)) {
      visited.add(child.id);
      result.push(child.id);
      result.push(...getDescendants(child.id, childrenMap, visited));
    }
  }
  return [...new Set(result)];
}

/**
 * Lấy toàn bộ các nút tổ tiên trong chuỗi nhân quả (Ancestors)
 * @param {string} nodeId
 * @param {Map<string, any[]>} parentsMap
 * @param {Set<string>} [visited]
 * @returns {string[]}
 */
export function getAncestors(nodeId, parentsMap, visited = new Set()) {
  const result = [];
  const directParents = parentsMap.get(nodeId) || [];

  for (const parent of directParents) {
    if (!visited.has(parent.id)) {
      visited.add(parent.id);
      result.push(parent.id);
      result.push(...getAncestors(parent.id, parentsMap, visited));
    }
  }
  return [...new Set(result)];
}

/**
 * Tính xác suất sinh lỗi qua Cổng Noisy-OR Gate
 * P(E_j = 1 | PA(E_j)) = 1 - (1 - q_0) * \prod_{i in PA(E_j)} (1 - w_ij * E_i)
 *
 * @param {string} nodeId
 * @param {Set<string>} activeErrorsSet Tập các lỗi đang xuất hiện (E_i = 1)
 * @param {Map<string, any[]>} parentsMap
 * @param {number} [leak] Xác suất rò rỉ q_0
 * @returns {number} Xác suất trong [0, 1]
 */
export function computeNoisyOrProbability(nodeId, activeErrorsSet, parentsMap, leak = LEAK_PROBABILITY) {
  const pa = parentsMap.get(nodeId) || [];
  if (pa.length === 0) {
    // Nút gốc: Nếu đang active thì xác suất 1.0, ngược lại bằng xác suất ngẫu nhiên
    return activeErrorsSet.has(nodeId) ? 0.95 : leak;
  }

  let prod = 1.0 - leak;
  for (const parent of pa) {
    const isParentActive = activeErrorsSet.has(parent.id) ? 1 : 0;
    prod *= (1.0 - parent.weight * isParentActive);
  }

  const p = 1.0 - prod;
  return Math.min(0.99, Math.max(0.01, p));
}

/**
 * Thuật toán 1: Chẩn đoán Lỗi Gốc (Root-Cause Attribution)
 * Cho một danh sách lỗi quan sát được từ bài làm, tìm lỗi gốc có trọng trách nhân quả cao nhất
 *
 * @param {string[]} observedErrors Danh sách mã lỗi quan sát được
 * @returns {Array<{ rootCause: string, rootName: string, explainedErrors: string[], confidence: number, isRootItselfObserved: boolean }>}
 */
export function diagnoseRootCause(observedErrors) {
  if (!observedErrors || observedErrors.length === 0) return [];

  const { parents, children } = buildGraph();
  const observedSet = new Set(observedErrors);
  const candidates = [];

  for (const rootId of ROOT_ERROR_IDS) {
    const descendants = getDescendants(rootId, children);
    const explainedErrors = descendants.filter((e) => observedSet.has(e));
    const isRootItselfObserved = observedSet.has(rootId);

    if (explainedErrors.length > 0 || isRootItselfObserved) {
      const rootMeta = ERROR_NODES.find((n) => n.id === rootId);
      // Điểm số nhân quả = (2.0 nếu chính lỗi gốc xuất hiện) + 1.5 * (số lỗi con được giải thích)
      const causalScore = (isRootItselfObserved ? 2.5 : 0.8) + explainedErrors.length * 1.5;
      const maxPossible = observedErrors.length * 1.5 + 2.0;
      const confidence = Math.min(0.99, Math.max(0.20, causalScore / maxPossible));

      candidates.push({
        rootCause: rootId,
        rootName: rootMeta?.name ?? rootId,
        cluster: rootMeta?.cluster ?? '',
        explainedErrors,
        isRootItselfObserved,
        confidence: Number(confidence.toFixed(2))
      });
    }
  }

  return candidates.sort((a, b) => b.confidence - a.confidence);
}

/**
 * Thuật toán 2: Tính Chỉ số Lợi ích Nhân quả (Causal Remediation Gain - CRG) qua toán tử do-calculus
 * Đo lường mức độ giảm thiểu rủi ro toàn mạng lưới khi can thiệp triệt tiêu một lỗi: do(targetNode = 0)
 *
 * @param {string} targetNodeId ID của lỗi được chọn can thiệp
 * @returns {{ targetNodeId: string, totalCausalGain: number, downstreamCount: number, impactBreakdown: Array<{ errorId: string, errorName: string, riskReduction: number }> }}
 */
export function calculateCausalRemediationGain(targetNodeId) {
  const { parents, children } = buildGraph();
  const descendants = getDescendants(targetNodeId, children);

  let totalGain = 0;
  const impactBreakdown = [];

  for (const descId of descendants) {
    // 1. Xác suất khi nút target bị mắc: E_target = 1
    const pBefore = computeNoisyOrProbability(descId, new Set([targetNodeId]), parents);

    // 2. Xác suất sau khi can thiệp do(target = 0): E_target = 0
    const pAfter = computeNoisyOrProbability(descId, new Set(), parents);

    const gain = Math.max(0, pBefore - pAfter);
    totalGain += gain;

    const descMeta = ERROR_NODES.find((n) => n.id === descId);
    impactBreakdown.push({
      errorId: descId,
      errorName: descMeta?.name ?? descId,
      riskReduction: Number(gain.toFixed(3))
    });
  }

  return {
    targetNodeId,
    totalCausalGain: Number(totalGain.toFixed(2)),
    downstreamCount: descendants.length,
    impactBreakdown: impactBreakdown.sort((a, b) => b.riskReduction - a.riskReduction)
  };
}

/**
 * Xếp hạng tất cả các nút gốc theo Chỉ số Lợi ích Can thiệp CRG
 */
export function rankRootCausesByGain() {
  return ROOT_ERROR_IDS.map((rootId) => calculateCausalRemediationGain(rootId))
    .sort((a, b) => b.totalCausalGain - a.totalCausalGain);
}
