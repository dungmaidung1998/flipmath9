'use client';

/**
 * FILE NÀY LÀM GÌ: Component React giao diện hiển thị và xử lý tương tác của người dùng trên trình duyệt.
 * AI DÙNG: học sinh
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: ./CapDo, @/lib/chapters
 */
import { useMemo, useState } from 'react';
import CapDo from './CapDo';
import { chapterOf } from '@/lib/chapters';

export interface QuestionObservation {
  questionId: string;
  isCorrect: boolean;
  ts: string;
}

export interface KuTrajectoryData {
  kuId: string;
  kuName: string;
  masteryLevel: number | null;
  observations: QuestionObservation[];
}

interface Props {
  trajectories: KuTrajectoryData[];
}

// [SỐ HIỆU TT-01: BKT - BƯỚC CẬP NHẬT XÁC SUẤT BAYES HIỂN THỊ ĐỒ THỊ]
// [SỐ HIỆU TT-02: BKT - BƯỚC HỌC TĂNG TIẾN T = 0.10 SAU MỖI CÂU]
// 4 Tham số chuẩn của mô hình: L0 (ban đầu) = 0.3; T (học thêm) = 0.1; G (đoán mò) = 0.25; S (sơ suất) = 0.1
const BKT_DEFAULT = { L0: 0.3, T: 0.1, G: 0.25, S: 0.1 };

// Ngưỡng xác suất 0.95 (95%) để xác nhận học sinh đã vững kiến thức bài học
const MASTERY_THRESHOLD = 0.95;

/**
 * Hàm tính toán chuỗi xác suất BKT qua từng câu trả lời để vẽ biểu đồ "Hành trình hiểu bài"
 * Dành cho học sinh quan sát sự tiến bộ của chính mình sau mỗi câu làm đúng hay sai
 */
function computeBktSeries(obs: QuestionObservation[], p = BKT_DEFAULT) {
  // Dòng 1: Khởi tạo mức hiểu bài ban đầu pL = L0 (30% xác suất)
  let pL = p.L0;

  // Dòng 2: Mảng lưu tọa độ các điểm trên biểu đồ (bước số mấy, xác suất bao nhiêu, đúng hay sai)
  const series: Array<{ step: number; pL: number; isCorrect: boolean; ts: string }> = [];

  // Dòng 3: Điểm mốc ban đầu (Bước 0) trước khi làm câu đầu tiên
  series.push({ step: 0, pL, isCorrect: true, ts: obs[0]?.ts ?? '' });

  // Dòng 4: Duyệt qua từng câu hỏi học sinh đã trả lời
  for (let i = 0; i < obs.length; i++) {
    const q = obs[i];

    // [SỐ HIỆU TT-01] Dòng 5: Áp dụng công thức Bayes cập nhật xác suất hiểu bài ngay sau khi biết kết quả đúng/sai
    const sau = q.isCorrect
      // Nếu câu này ĐÚNG: Tăng xác suất hiểu bài (có tính trừ hao khả năng đoán may rủi G = 0.25)
      ? (pL * (1 - p.S)) / (pL * (1 - p.S) + (1 - pL) * p.G)
      // Nếu câu này SAI: Giảm xác suất hiểu bài (nhưng không triệt tiêu về 0 vì có thể do sơ suất S = 0.1)
      : (pL * p.S) / (pL * p.S + (1 - pL) * (1 - p.G));

    // [SỐ HIỆU TT-02] Dòng 6: Cộng thêm lượng kiến thức học được sau khi làm xong câu này (T = 0.1)
    pL = sau + (1 - sau) * p.T;

    // Dòng 7: Lưu điểm mốc mới vào chuỗi để vẽ đường gấp khúc biểu đồ
    series.push({ step: i + 1, pL, isCorrect: q.isCorrect, ts: q.ts });
  }

  // Dòng 8: Trả về kết quả xác suất cuối cùng, trạng thái đã vững bài (>= 0.95) và toàn bộ chuỗi điểm vẽ biểu đồ
  return {
    finalPL: pL,
    isMastered: pL >= MASTERY_THRESHOLD,
    series
  };
}

/**
 * Component React `KnowledgeTrajectory`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export default function KnowledgeTrajectory({ trajectories }: Props) {
  const [selectedKu, setSelectedKu] = useState<string>(trajectories[0]?.kuId ?? '');

  const computed = useMemo(() => {
    return trajectories.map((item) => {
      const bkt = computeBktSeries(item.observations);
      return {
        ...item,
        bkt
      };
    });
  }, [trajectories]);

  const activeItem = computed.find((c) => c.kuId === selectedKu) ?? computed[0];

  const masteredCount = computed.filter((c) => c.bkt.isMastered).length;
  const inProgressCount = computed.filter((c) => !c.bkt.isMastered && c.observations.length > 0).length;

  return (
    <div className="card" style={{ marginTop: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>🌳</span> Hành trình hiểu bài của em
          </h2>
          <p className="hint" style={{ margin: 0 }}>
            Sau mỗi câu em trả lời, hệ thống ước lượng lại em đã nắm từng mục tới đâu.
          </p>
        </div>
      </div>

      <div className="stat stat--hinh" style={{ margin: '18px 0 14px' }}>
        <div>
          <img className="stat-hinh" src="/minh-hoa/bt/mam.webp" alt="" width={160} height={160} />
          <b>{computed.length}</b>
          <span>Mục kiến thức đã bắt đầu</span>
        </div>
        <div>
          <img className="stat-hinh" src="/minh-hoa/bt/cay.webp" alt="" width={160} height={160} />
          <b style={{ color: 'var(--ok)' }}>{masteredCount}</b>
          <span>Đạt ngưỡng vững chắc (P ≥ 95%)</span>
        </div>
        <div>
          <img className="stat-hinh" src="/minh-hoa/bt/choi.webp" alt="" width={160} height={160} />
          <b style={{ color: inProgressCount > 0 ? 'var(--accent)' : 'var(--muted)' }}>
            {inProgressCount}
          </b>
          <span>Đang hình thành năng lực</span>
        </div>
      </div>

      {computed.length > 0 && (
        <div style={{ marginTop: 14 }}>
          {/* Menu chọn KU */}
          <div className="filter-chips-bar" role="tablist" aria-label="Chọn đơn vị kiến thức để xem quỹ đạo">
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--muted)', marginRight: 4 }}>
              Chọn mục:
            </span>
            {computed.map((c) => (
              <button
                key={c.kuId}
                type="button"
                className={`filter-chip-btn ${c.kuId === activeItem?.kuId ? 'active' : ''}`}
                onClick={() => setSelectedKu(c.kuId)}
              >
                {c.kuName} ({Math.round(c.bkt.finalPL * 100)}%)
              </button>
            ))}
          </div>

          {activeItem && (
            <div style={{ marginTop: 16, background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: 12, padding: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
                <div>
                  <h3 style={{ margin: '0 0 4px', fontSize: '17px', color: 'var(--navy-d)' }}>
                    {activeItem.kuName}
                  </h3>
                  <div className="hint">
                    Đã xét {activeItem.observations.length} câu trả lời thực nghiệm
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span className={`tag ${activeItem.bkt.isMastered ? 'ok' : 'warn'}`}>
                    Xác suất làm chủ: {Math.round(activeItem.bkt.finalPL * 100)}%
                  </span>
                  <CapDo m={activeItem.masteryLevel} chuong={chapterOf(activeItem.kuId)} />
                </div>
              </div>

              {activeItem.observations.length === 0 ? (
                <p className="hint" style={{ padding: '20px 0', textAlign: 'center' }}>
                  <img src="/minh-hoa/bt/mam.webp" alt="" width={160} height={160} style={{ width: 72, height: 72, display: 'block', margin: '0 auto 8px' }} />
                  Chưa có câu trả lời nào cho mục này. Hãy làm bài kiểm tra chuẩn bị để hệ thống bắt đầu dựng quỹ đạo!
                </p>
              ) : (
                <div style={{ width: '100%', overflowX: 'auto' }}>
                  {/* SVG biểu đồ Learning Trajectory */}
                  <svg
                    viewBox="0 0 600 220"
                    style={{ width: '100%', maxWidth: 700, height: 'auto', display: 'block', margin: '0 auto' }}
                    aria-label={`Biểu đồ quỹ đạo tri thức mục ${activeItem.kuName}`}
                  >
                    <defs>
                      <linearGradient id="bktGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--navy)" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="var(--navy)" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Lưới tọa độ */}
                    <line x1="50" y1="20" x2="570" y2="20" stroke="#94a3b8" strokeDasharray="3 3" strokeWidth="1" />
                    <text x="44" y="24" textAnchor="end" fontSize="11" fill="var(--muted)">100%</text>

                    {/* Ngưỡng làm chủ 95% */}
                    <line x1="50" y1="28" x2="570" y2="28" stroke="var(--ok)" strokeDasharray="4 2" strokeWidth="1.5" />
                    <text x="575" y="32" textAnchor="start" fontSize="10.5" fill="var(--ok)" fontWeight="700">
                      Ngưỡng 95%
                    </text>

                    <line x1="50" y1="100" x2="570" y2="100" stroke="var(--line)" strokeWidth="1" />
                    <text x="44" y="104" textAnchor="end" fontSize="11" fill="var(--muted)">50%</text>

                    <line x1="50" y1="180" x2="570" y2="180" stroke="var(--line)" strokeWidth="1.5" />
                    <text x="44" y="184" textAnchor="end" fontSize="11" fill="var(--muted)">0%</text>

                    {/* Render đường cong BKT */}
                    {(() => {
                      const series = activeItem.bkt.series;
                      const n = series.length;
                      // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
                      const xStep = 520 / Math.max(1, n - 1);
                      const points = series.map((s, idx) => {
                        const x = 50 + idx * xStep;
                        const y = 180 - s.pL * 160;
                        return { x, y, ...s };
                      });

                      const pathD = points.reduce((acc, pt, idx) => {
                        return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
                      }, '');

                      const areaD = `${pathD} L ${points[points.length - 1].x} 180 L ${points[0].x} 180 Z`;

                      return (
                        <>
                          <path d={areaD} fill="url(#bktGradient)" />
                          <path d={pathD} fill="none" stroke="var(--navy)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                          {points.map((pt, idx) => (
                            <g key={idx}>
                              <circle
                                cx={pt.x}
                                cy={pt.y}
                                r={idx === 0 ? 3.5 : 5}
                                fill={idx === 0 ? 'var(--muted)' : pt.isCorrect ? 'var(--ok)' : 'var(--warn)'}
                                stroke="#fff"
                                strokeWidth="2"
                              >
                                <title>
                                  {idx === 0
                                    ? `Khởi điểm: P(L0) = ${Math.round(pt.pL * 100)}%`
                                    : `Câu ${pt.step}: ${pt.isCorrect ? 'Đúng ✅' : 'Sai ❌'} → P(L) = ${Math.round(pt.pL * 100)}%`}
                                </title>
                              </circle>
                              {idx > 0 && (
                                <text x={pt.x} y="198" textAnchor="middle" fontSize="10.5" fill="var(--muted)">
                                  C{idx}
                                </text>
                              )}
                            </g>
                          ))}
                        </>
                      );
                    })()}
                  </svg>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 10, fontSize: '12px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--ok)' }}></span> Câu làm đúng
                    </span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--warn)' }}></span> Câu làm sai
                    </span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ width: 14, height: 2, background: 'var(--ok)' }}></span> Ngưỡng vững chắc (95%)
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
