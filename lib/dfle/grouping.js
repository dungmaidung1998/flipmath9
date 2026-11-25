/**
 * CHIA NHÓM PHÂN HOÁ CHO PHA TRÊN LỚP
 * ---------------------------------------------------------------------------
 * Đây là chỗ dữ liệu chẩn đoán biến thành một việc cụ thể của giờ dạy. Không có
 * bước này thì báo cáo chẩn đoán chỉ là thông tin để biết, không đổi được cách dạy.
 *
 * Hỗ trợ 2 chiến lược sư phạm:
 * 1. CHIẾN LƯỢC HỖN HỢP TƯƠNG TRỢ (Jigsaw / Heterogeneous - Mặc định):
 *    Rải serpentine tạo các nhóm có phổ năng lực tương đương, mỗi nhóm có một
 *    trợ giảng nhí (R06) làm nhóm trưởng.
 * 2. CHIẾN LƯỢC ĐỒNG CHẤT PHÂN HÓA (Targeted / Homogeneous):
 *    Gom các em cùng trình độ / cùng lỗ hổng vào nhóm để giáo viên giao phiếu
 *    học tập phân tầng (Bồi dưỡng / Luyện tập / Thử thách).
 */

/**
 * @typedef {object} Learner
 * @property {string} id
 * @property {string} name
 * @property {number} mastery       0–3
 * @property {number|null} quiz     điểm quiz lần đầu, thang 10
 * @property {string[]} errorCodes  các mã lỗi em đó đã mắc
 */

/**
 * CHIẾN LƯỢC 1 — NHÓM HỖN HỢP TƯƠNG TRỢ (SERPENTINE)
 * @param {Learner[]} learners
 * @param {number} groupSize số học sinh mỗi nhóm (mặc định 4)
 */
export function buildGroups(learners, groupSize = 4) {
  const n = learners.length;
  if (n === 0) return [];
  const size = Math.max(2, Math.min(6, Math.floor(groupSize) || 4));
  const groupCount = Math.max(1, Math.ceil(n / size));

  // Bước 1 — xếp hạng tất định. Khoá phụ là id để hai em cùng điểm luôn ra cùng thứ tự.
  const ranked = [...learners].sort((a, b) => {
    if (b.mastery !== a.mastery) return b.mastery - a.mastery;
    const qa = a.quiz ?? -1, qb = b.quiz ?? -1;
    if (qb !== qa) return qb - qa;
    return a.id.localeCompare(b.id);
  });

  // Bước 2 — rải rắn bò
  const groups = Array.from({ length: groupCount }, () => []);
  ranked.forEach((l, i) => {
    const round = Math.floor(i / groupCount);
    const pos = i % groupCount;
    const idx = round % 2 === 0 ? pos : groupCount - 1 - pos;
    groups[idx].push(l);
  });

  // Bước 3 và 4
  return groups.map((members, i) => {
    const count = {};
    for (const m of members) for (const c of m.errorCodes ?? []) count[c] = (count[c] ?? 0) + 1;
    const entries = Object.entries(count).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
    const leader = members[0] ?? null;   // đã xếp hạng nên phần tử đầu là cao nhất
    return {
      index: i + 1,
      strategy: 'jigsaw',
      members,
      leaderId: leader ? leader.id : null,
      dominantError: entries.length ? entries[0][0] : null,
      dominantErrorCount: entries.length ? entries[0][1] : 0,
      masterySpread: members.length
        ? Math.max(...members.map((m) => m.mastery)) - Math.min(...members.map((m) => m.mastery))
        : 0
    };
  });
}

/**
 * CHIẾN LƯỢC 2 — NHÓM ĐỒNG CHẤT PHÂN HÓA THEO NHIỆM VỤ (TARGETED / HOMOGENEOUS)
 * @param {Learner[]} learners
 * @param {number} groupSize
 */
export function buildTargetedGroups(learners, groupSize = 4) {
  const n = learners.length;
  if (n === 0) return [];
  const size = Math.max(2, Math.min(6, Math.floor(groupSize) || 4));

  const tier1 = learners.filter((l) => l.mastery === 0 || (l.quiz !== null && l.quiz < 5));
  const tier3 = learners.filter((l) => l.mastery === 3 || (l.quiz !== null && l.quiz >= 8.5 && l.mastery >= 2));
  const tier1Ids = new Set(tier1.map((l) => l.id));
  const tier3Ids = new Set(tier3.map((l) => l.id));
  const tier2 = learners.filter((l) => !tier1Ids.has(l.id) && !tier3Ids.has(l.id));

  const tiers = [
    {
      name: 'Nhóm Cần bồi dưỡng & Tháo gỡ lỗi',
      desc: 'Tập trung ôn kiến thức nền và khắc phục quan niệm sai với sự hướng dẫn của giáo viên.',
      items: tier1,
      type: 'remediation'
    },
    {
      name: 'Nhóm Luyện tập & Vận dụng chuẩn',
      desc: 'Thực hành bài tập mức 2, trao đổi phương pháp và kiểm tra kết quả chéo.',
      items: tier2,
      type: 'practice'
    },
    {
      name: 'Nhóm Thử thách & Mở rộng',
      desc: 'Giải bài toán tình huống thực tế mức 3, tư duy tối ưu và thử sức bài tập nâng cao.',
      items: tier3,
      type: 'enrichment'
    }
  ];

  const resultGroups = [];
  let gIndex = 1;

  for (const tier of tiers) {
    if (!tier.items.length) continue;
    const chunkCount = Math.max(1, Math.ceil(tier.items.length / size));
    const chunks = Array.from({ length: chunkCount }, () => []);
    tier.items.forEach((item, idx) => {
      chunks[idx % chunkCount].push(item);
    });

    for (const members of chunks) {
      const count = {};
      for (const m of members) for (const c of m.errorCodes ?? []) count[c] = (count[c] ?? 0) + 1;
      const entries = Object.entries(count).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
      const leader = members[0] ?? null;

      resultGroups.push({
        index: gIndex++,
        strategy: 'targeted',
        tierName: tier.name,
        tierDesc: tier.desc,
        tierType: tier.type,
        members,
        leaderId: leader ? leader.id : null,
        dominantError: entries.length ? entries[0][0] : null,
        dominantErrorCount: entries.length ? entries[0][1] : 0,
        masterySpread: members.length
          ? Math.max(...members.map((m) => m.mastery)) - Math.min(...members.map((m) => m.mastery))
          : 0
      });
    }
  }

  return resultGroups;
}

/**
 * Kiểm tra các nhóm có cân nhau không — chênh lệch mức làm chủ trung bình giữa
 * nhóm cao nhất và nhóm thấp nhất. Càng gần 0 càng cân.
 * @param {ReturnType<typeof buildGroups> | { members: Learner[] }[]} groups
 */
export function balanceGap(groups) {
  const list = Array.isArray(groups) ? groups : (groups.groups ?? []);
  const live = list.filter((g) => g.members && g.members.length);
  if (live.length < 2) return 0;
  const avgs = live.map((g) => g.members.reduce((s, m) => s + m.mastery, 0) / g.members.length);
  return Math.round((Math.max(...avgs) - Math.min(...avgs)) * 100) / 100;
}

/**
 * CHIẾN LƯỢC 3 — TỐI ƯU HÓA ĐA MỤC TIÊU (MULTI-OBJECTIVE AI GROUPING)
 * ---------------------------------------------------------------------------
 * Sử dụng thuật toán Heuristic Search / Simulated Annealing tối ưu đồng thời:
 * 1. Cân bằng năng lực trung bình (Mastery + Quiz).
 * 2. Phủ nhóm trưởng R06 / học sinh làm chủ (mỗi nhóm có 1 người kèm cặp).
 * 3. Bù trừ quan niệm sai: Một em mắc lỗi E thì trong nhóm có bạn KHÔNG mắc lỗi E đó.
 * 4. Kích thước các nhóm đồng đều (chênh nhau không quá 1 học sinh).
 *
 * @param {Learner[]} learners
 * @param {number} groupSize
 * @param {object} [options]
 */
export function buildOptimizedGroups(learners, groupSize = 4, options = {}) {
  const n = learners.length;
  if (n === 0) {
    return {
      groups: [],
      metrics: {
        overallQualityScore: 100,
        balanceScore: 100,
        leaderCoverageScore: 100,
        complementarityScore: 100,
        balanceGap: 0
      }
    };
  }

  const size = Math.max(2, Math.min(6, Math.floor(groupSize) || 4));
  const groupCount = Math.max(1, Math.ceil(n / size));

  const isLeaderCandidate = (l) => Boolean(l.isLeader) || l.mastery >= 2 || (l.quiz !== null && l.quiz >= 8);

  const leaders = learners.filter(isLeaderCandidate).sort((a, b) => (b.mastery - a.mastery) || ((b.quiz ?? 0) - (a.quiz ?? 0)));
  const nonLeaders = learners.filter((l) => !isLeaderCandidate(l)).sort((a, b) => (a.mastery - b.mastery) || ((a.quiz ?? 0) - (b.quiz ?? 0)));

  // Khởi tạo hạt giống thông minh
  const groups = Array.from({ length: groupCount }, () => []);

  leaders.forEach((l, idx) => {
    groups[idx % groupCount].push(l);
  });

  nonLeaders.forEach((l) => {
    let bestG = 0;
    let minLen = Infinity;
    let minSum = Infinity;

    for (let g = 0; g < groupCount; g++) {
      const len = groups[g].length;
      const sum = groups[g].reduce((acc, m) => acc + m.mastery + (m.quiz ?? 5) / 10, 0);
      if (len < minLen || (len === minLen && sum < minSum)) {
        minLen = len;
        minSum = sum;
        bestG = g;
      }
    }
    groups[bestG].push(l);
  });

  // Hàm chi phí đa mục tiêu
  const computeCost = (currentGroups) => {
    const avgs = currentGroups.map((g) => {
      if (!g.length) return 0;
      return g.reduce((sum, m) => sum + (m.mastery * 2.5 + (m.quiz ?? 5) * 0.25), 0) / g.length;
    });
    const meanAll = avgs.reduce((a, b) => a + b, 0) / groupCount;
    const balanceVariance = avgs.reduce((acc, v) => acc + (v - meanAll) ** 2, 0) / groupCount;

    let leaderPenalty = 0;
    for (const g of currentGroups) {
      const count = g.filter(isLeaderCandidate).length;
      if (count === 0) leaderPenalty += 2.0;
      else if (count > 2) leaderPenalty += 0.5 * (count - 1);
    }

    let errorUncovered = 0;
    for (const g of currentGroups) {
      const groupErrors = new Set();
      for (const m of g) for (const e of m.errorCodes ?? []) groupErrors.add(e);

      for (const e of groupErrors) {
        const helper = g.some((m) => !(m.errorCodes ?? []).includes(e));
        if (!helper) errorUncovered += 1.0;
      }
    }

    let sizePenalty = 0;
    const targetMin = Math.floor(n / groupCount);
    const targetMax = Math.ceil(n / groupCount);
    for (const g of currentGroups) {
      if (g.length < targetMin || g.length > targetMax) {
        sizePenalty += 5.0;
      }
    }

    return balanceVariance * 3.0 + leaderPenalty * 4.0 + errorUncovered * 1.5 + sizePenalty * 10.0;
  };

  let currentCost = computeCost(groups);
  let bestGroups = groups.map((g) => [...g]);
  let bestCost = currentCost;

  let temperature = 1.0;
  const coolingRate = 0.99;
  const iterations = Math.min(600, Math.max(150, n * 15));

  for (let it = 0; it < iterations; it++) {
    const g1 = Math.floor(Math.random() * groupCount);
    let g2 = Math.floor(Math.random() * groupCount);
    if (g1 === g2) g2 = (g1 + 1) % groupCount;

    if (!groups[g1].length || !groups[g2].length) continue;

    const idx1 = Math.floor(Math.random() * groups[g1].length);
    const idx2 = Math.floor(Math.random() * groups[g2].length);

    const temp = groups[g1][idx1];
    groups[g1][idx1] = groups[g2][idx2];
    groups[g2][idx2] = temp;

    const newCost = computeCost(groups);
    const delta = newCost - currentCost;

    if (delta < 0 || Math.exp(-delta / Math.max(0.01, temperature)) > Math.random()) {
      currentCost = newCost;
      if (currentCost < bestCost) {
        bestCost = currentCost;
        bestGroups = groups.map((g) => [...g]);
      }
    } else {
      const back = groups[g1][idx1];
      groups[g1][idx1] = groups[g2][idx2];
      groups[g2][idx2] = back;
    }

    temperature *= coolingRate;
  }

  const gap = balanceGap(bestGroups.map((m) => ({ members: m })));
  const balanceScore = Math.max(0, Math.min(100, Math.round((1 - gap / 3.0) * 100)));

  let groupsWithLeader = 0;
  let totalErrorsEvaluated = 0;
  let errorsCovered = 0;

  for (const g of bestGroups) {
    if (g.some(isLeaderCandidate)) groupsWithLeader++;

    const gErrors = new Set();
    for (const m of g) for (const e of m.errorCodes ?? []) gErrors.add(e);
    for (const e of gErrors) {
      totalErrorsEvaluated++;
      if (g.some((m) => !(m.errorCodes ?? []).includes(e))) {
        errorsCovered++;
      }
    }
  }

  const leaderCoverageScore = groupCount > 0 ? Math.round((groupsWithLeader / groupCount) * 100) : 100;
  const complementarityScore = totalErrorsEvaluated > 0
    ? Math.round((errorsCovered / totalErrorsEvaluated) * 100)
    : 100;

  const overallQualityScore = Math.round(
    balanceScore * 0.4 + leaderCoverageScore * 0.35 + complementarityScore * 0.25
  );

  const formattedGroups = bestGroups.map((members, i) => {
    members.sort((a, b) => {
      const la = isLeaderCandidate(a) ? 1 : 0;
      const lb = isLeaderCandidate(b) ? 1 : 0;
      if (lb !== la) return lb - la;
      return (b.mastery - a.mastery) || ((b.quiz ?? 0) - (a.quiz ?? 0));
    });

    const count = {};
    for (const m of members) for (const c of m.errorCodes ?? []) count[c] = (count[c] ?? 0) + 1;
    const entries = Object.entries(count).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
    const leader = members[0] ?? null;

    return {
      index: i + 1,
      strategy: 'optimized',
      members,
      leaderId: leader ? leader.id : null,
      dominantError: entries.length ? entries[0][0] : null,
      dominantErrorCount: entries.length ? entries[0][1] : 0,
      masterySpread: members.length
        ? Math.max(...members.map((m) => m.mastery)) - Math.min(...members.map((m) => m.mastery))
        : 0
    };
  });

  return {
    groups: formattedGroups,
    metrics: {
      overallQualityScore,
      balanceScore,
      leaderCoverageScore,
      complementarityScore,
      balanceGap: gap
    }
  };
}
