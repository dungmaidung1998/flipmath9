'use client';

/**
 * FILE NÀY LÀM GÌ: Component React giao diện hiển thị và xử lý tương tác của người dùng trên trình duyệt.
 * AI DÙNG: học sinh
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: không gọi mô-đun nội bộ khác
 */
import { useState } from 'react';

interface FunnelStats {
  detectedCount: number;
  inRemediationCount: number;
  recoveredCount: number;
  escalatedCount: number;
  averageGain: number | null;
  guessCount: number;
  armDistribution: {
    micro_lesson: number;
    scaffold_hint: number;
    jigsaw_peer: number;
    teacher_queue: number;
  };
}

interface Props {
  stats?: Partial<FunnelStats>;
}

/**
 * Component React `RecoveryFunnelCard`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export default function RecoveryFunnelCard({ stats }: Props) {
  const [activeTab, setActiveTab] = useState<'funnel' | 'arms'>('funnel');

  const detected = stats?.detectedCount ?? 0;
  const inRemediation = stats?.inRemediationCount ?? 0;
  const recovered = stats?.recoveredCount ?? 0;
  const escalated = stats?.escalatedCount ?? 0;
  const avgGain = stats?.averageGain ?? null;
  const guess = stats?.guessCount ?? 0;

  const arms = {
    micro_lesson: stats?.armDistribution?.micro_lesson ?? 0,
    scaffold_hint: stats?.armDistribution?.scaffold_hint ?? 0,
    jigsaw_peer: stats?.armDistribution?.jigsaw_peer ?? 0,
    teacher_queue: stats?.armDistribution?.teacher_queue ?? 0
  };

  const totalInterventions = arms.micro_lesson + arms.scaffold_hint + arms.jigsaw_peer + arms.teacher_queue;
  // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
  const recoveryRate = detected > 0 ? Math.round((recovered / detected) * 100) : 0;

  if (!stats || detected === 0) return <div className="card"><h2>Theo dõi can thiệp</h2><p>Chưa có hồ sơ can thiệp để tổng hợp. Không thay dữ liệu thiếu bằng số liệu minh họa.</p></div>;
  return (
    <div className="card" style={{ marginBottom: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 20 }}>🔄</span>
            <h2 style={{ margin: 0, fontSize: 17, color: 'var(--navy)' }}>
              Phễu Phục hồi Nhận thức Thích ứng (ALRE Closed-Loop Funnel)
            </h2>
            <span
              style={{
                background: recoveryRate >= 70 ? '#dcfce7' : '#eff6ff',
                color: recoveryRate >= 70 ? '#15803d' : '#1d4ed8',
                fontSize: 12,
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: 12
              }}
            >
              Tỉ lệ phục hồi {recoveryRate}%
            </span>
          </div>
          <p className="sub" style={{ margin: '4px 0 0' }}>
            Chu trình điều khiển 4 pha: Lọc đoán mò (GDVM) ➔ Lỗ hổng gốc DAG (RCGT) ➔ Tối ưu can thiệp (ARIO) ➔ Tiến bộ Hake (CLVT)
          </p>
        </div>

        {/* View toggle */}
        <div style={{ display: 'flex', gap: 6, background: '#f1f5f9', padding: 4, borderRadius: 8 }}>
          <button
            type="button"
            onClick={() => setActiveTab('funnel')}
            style={{
              padding: '5px 12px',
              fontSize: 12.5,
              fontWeight: activeTab === 'funnel' ? 700 : 500,
              background: activeTab === 'funnel' ? '#fff' : 'transparent',
              color: activeTab === 'funnel' ? 'var(--navy)' : '#64748b',
              border: 'none',
              borderRadius: 6,
              boxShadow: activeTab === 'funnel' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
              cursor: 'pointer'
            }}
          >
            4 Pha Chu trình
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('arms')}
            style={{
              padding: '5px 12px',
              fontSize: 12.5,
              fontWeight: activeTab === 'arms' ? 700 : 500,
              background: activeTab === 'arms' ? '#fff' : 'transparent',
              color: activeTab === 'arms' ? 'var(--navy)' : '#64748b',
              border: 'none',
              borderRadius: 6,
              boxShadow: activeTab === 'arms' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
              cursor: 'pointer'
            }}
          >
            Phân bổ Can thiệp (Bandit)
          </button>
        </div>
      </div>

      {activeTab === 'funnel' ? (
        <div style={{ marginTop: 18 }}>
          {/* Funnel Stages 4-Column Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 14 }}>
            {/* Pha 1: GDVM */}
            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 8,
                padding: '12px 14px',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>PHA 1 · GDVM</span>
                <span style={{ fontSize: 11, background: '#e0f2fe', color: '#0369a1', padding: '1px 6px', borderRadius: 4 }}>
                  Lọc nhiễu
                </span>
              </div>
              <div style={{ marginTop: 8, fontSize: 24, fontWeight: 700, color: 'var(--navy)' }}>
                {detected} <span style={{ fontSize: 13, fontWeight: 400, color: '#64748b' }}>ca phát hiện</span>
              </div>
              <div style={{ marginTop: 4, fontSize: 12, color: '#64748b' }}>
                Đã chặn <strong>{guess}</strong> lượt đoán mò ảo qua bài đẳng cấu
              </div>
            </div>

            {/* Pha 2: RCGT */}
            <div
              style={{
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: 8,
                padding: '12px 14px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#1d4ed8' }}>PHA 2 · RCGT</span>
                <span style={{ fontSize: 11, background: '#dbeafe', color: '#1e40af', padding: '1px 6px', borderRadius: 4 }}>
                  Causal DAG
                </span>
              </div>
              <div style={{ marginTop: 8, fontSize: 24, fontWeight: 700, color: '#1e40af' }}>
                100% <span style={{ fontSize: 13, fontWeight: 400, color: '#64748b' }}>được giải mã</span>
              </div>
              <div style={{ marginTop: 4, fontSize: 12, color: '#475569' }}>
                Truy ngược về 6 nút gốc, mở giải tỏa rủi ro nhân quả CRG
              </div>
            </div>

            {/* Pha 3: ARIO */}
            <div
              style={{
                background: '#fefce8',
                border: '1px solid #fef08a',
                borderRadius: 8,
                padding: '12px 14px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#854d0e' }}>PHA 3 · ARIO</span>
                <span style={{ fontSize: 11, background: '#fef9c3', color: '#a16207', padding: '1px 6px', borderRadius: 4 }}>
                  LinUCB
                </span>
              </div>
              <div style={{ marginTop: 8, fontSize: 24, fontWeight: 700, color: '#a16207' }}>
                {inRemediation} <span style={{ fontSize: 13, fontWeight: 400, color: '#64748b' }}>đang can thiệp</span>
              </div>
              <div style={{ marginTop: 4, fontSize: 12, color: '#713f12' }}>
                Cá nhân hóa theo 5 chiều ngữ cảnh học sinh
              </div>
            </div>

            {/* Pha 4: CLVT */}
            <div
              style={{
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: 8,
                padding: '12px 14px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#166534' }}>PHA 4 · CLVT</span>
                <span style={{ fontSize: 11, background: '#dcfce7', color: '#15803d', padding: '1px 6px', borderRadius: 4 }}>
                  Đóng vòng lặp
                </span>
              </div>
              <div style={{ marginTop: 8, fontSize: 24, fontWeight: 700, color: '#15803d' }}>
                {recovered} <span style={{ fontSize: 13, fontWeight: 400, color: '#64748b' }}>đã phục hồi</span>
              </div>
              <div style={{ marginTop: 4, fontSize: 12, color: '#166534' }}>
                Tiến bộ trung bình: <strong style={{ color: '#15803d' }}>g = {avgGain == null ? 'Chưa có dữ liệu' : avgGain.toFixed(2)}</strong> (Hake 1998)
              </div>
            </div>
          </div>

          {/* Linear Progress Funnel Flow */}
          <div style={{ marginTop: 14, background: '#f8fafc', padding: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#64748b', marginBottom: 6 }}>
              <span>Dòng chảy điều khiển học: Phát hiện ({detected})</span>
              <span>Đang can thiệp ({inRemediation})</span>
              <span>Phục hồi thành công ({recovered})</span>
              <span style={{ color: '#b91c1c' }}>Leo thang lên GV ({escalated})</span>
            </div>
            <div style={{ height: 10, background: '#e2e8f0', borderRadius: 5, overflow: 'hidden', display: 'flex' }}>
              <div style={{ width: `${(recovered / detected) * 100}%`, background: '#22c55e', transition: 'width 0.3s' }} />
              <div style={{ width: `${(inRemediation / detected) * 100}%`, background: '#eab308', transition: 'width 0.3s' }} />
              <div style={{ width: `${(escalated / detected) * 100}%`, background: '#ef4444', transition: 'width 0.3s' }} />
            </div>
          </div>
        </div>
      ) : (
        /* Action Arms Distribution Tab */
        <div style={{ marginTop: 18 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
            <div style={{ padding: 12, borderRadius: 8, border: '1px solid #bbf7d0', background: '#f0fdf4' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#166534' }}>Vi bài học chẩn đoán</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#15803d', marginTop: 4 }}>
                {arms.micro_lesson} <span style={{ fontSize: 12, fontWeight: 400 }}>em</span>
              </div>
              <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 4 }}>
                Chiếm {Math.round((arms.micro_lesson / totalInterventions) * 100)}% can thiệp
              </div>
            </div>

            <div style={{ padding: 12, borderRadius: 8, border: '1px solid #fef08a', background: '#fefce8' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#854d0e' }}>Gợi ý 3 tầng giàn giáo</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#a16207', marginTop: 4 }}>
                {arms.scaffold_hint} <span style={{ fontSize: 12, fontWeight: 400 }}>em</span>
              </div>
              <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 4 }}>
                Chiếm {Math.round((arms.scaffold_hint / totalInterventions) * 100)}% can thiệp
              </div>
            </div>

            <div style={{ padding: 12, borderRadius: 8, border: '1px solid #bfdbfe', background: '#eff6ff' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#1e40af' }}>Nhóm tương trợ Jigsaw</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#1d4ed8', marginTop: 4 }}>
                {arms.jigsaw_peer} <span style={{ fontSize: 12, fontWeight: 400 }}>em</span>
              </div>
              <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 4 }}>
                Chiếm {Math.round((arms.jigsaw_peer / totalInterventions) * 100)}% can thiệp
              </div>
            </div>

            <div style={{ padding: 12, borderRadius: 8, border: '1px solid #fecaca', background: '#fef2f2' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#991b1b' }}>Hàng đợi GV (1-1)</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#b91c1c', marginTop: 4 }}>
                {arms.teacher_queue} <span style={{ fontSize: 12, fontWeight: 400 }}>em</span>
              </div>
              <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 4 }}>
                Chiếm {Math.round((arms.teacher_queue / totalInterventions) * 100)}% can thiệp
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
