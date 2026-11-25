'use client';

/**
 * FILE NÀY LÀM GÌ: Component React giao diện hiển thị và xử lý tương tác của người dùng trên trình duyệt.
 * AI DÙNG: học sinh
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: không gọi mô-đun nội bộ khác
 */
import { useState } from 'react';

export interface InterventionQueueItem {
  recovery_id: string;
  student_id: string;
  student_name: string;
  manifest_error: string;
  manifest_error_name?: string;
  root_cause_error?: string;
  root_cause_name?: string;
  target_ku_id?: string;
  target_ku_name?: string;
  guess_score: number;
  is_rapid_guess: boolean;
  selected_arm: 'micro_lesson' | 'scaffold_hint' | 'jigsaw_peer' | 'teacher_queue';
  status: 'detected' | 'in_remediation' | 'verified_success' | 'escalated';
  attempt_count: number;
  pre_score: number;
  post_score?: number | null;
  learning_gain?: number | null;
  teacher_pedagogical_prompt?: string;
  priority_score?: number;
  teacher_contacted_at?: string | null;
}

interface Props {
  queue: InterventionQueueItem[];
  classCode?: string;
}

const ARM_BADGE: Record<string, { label: string; bg: string; color: string }> = {
  teacher_queue: { label: 'Nói chuyện riêng', bg: '#fef2f2', color: '#991b1b' },
  jigsaw_peer: { label: 'Học cùng bạn', bg: '#eff6ff', color: '#1e40af' },
  scaffold_hint: { label: 'Gợi ý từng bước', bg: '#fefce8', color: '#854d0e' },
  micro_lesson: { label: 'Bài học ngắn', bg: '#f0fdf4', color: '#166534' }
};

const STATUS_BADGE: Record<string, { label: string; bg: string; color: string }> = {
  escalated: { label: 'Cần thầy cô', bg: '#fee2e2', color: '#b91c1c' },
  in_remediation: { label: 'Web đang hỗ trợ', bg: '#fef3c7', color: '#b45309' },
  verified_success: { label: 'Đã sửa được', bg: '#dcfce7', color: '#15803d' },
  detected: { label: 'Mới thấy', bg: '#f1f5f9', color: '#475569' }
};

/**
 * Component React `TeacherInterventionQueue`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export default function TeacherInterventionQueue({ queue, classCode }: Props) {
  const [filter, setFilter] = useState<'all' | 'escalated' | 'guessing' | 'resolved'>('all');
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set(queue.filter(q=>q.teacher_contacted_at).map(q=>q.recovery_id)));
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [saving,setSaving]=useState<string|null>(null);
  const [saveError,setSaveError]=useState('');
  const toggleComplete = async (id:string) => {
    if(saving)return;
    setSaving(id);setSaveError('');
    const contacted=!completedIds.has(id);
    try{const res=await fetch('/api/can-thiep',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id,contacted})});
      if(!res.ok)throw Error();
      setCompletedIds(prev=>{const next=new Set(prev);if(contacted)next.add(id);else next.delete(id);return next;});
    }catch{setSaveError('Chưa lưu được trạng thái trao đổi. Em/Thầy cô thử lại sau.');}finally{setSaving(null);}
  };

  const filteredItems = queue.filter((item) => {
    const isCompleted = completedIds.has(item.recovery_id);
    if (filter === 'resolved') return isCompleted || item.status === 'verified_success';
    if (isCompleted) return false;
    if (filter === 'escalated') return item.status === 'escalated' || item.selected_arm === 'teacher_queue';
    if (filter === 'guessing') return item.is_rapid_guess || item.guess_score >= 0.70;
    return true;
  });

  const urgentCount = queue.filter(
    (q) => (q.status === 'escalated' || q.selected_arm === 'teacher_queue') && !completedIds.has(q.recovery_id)
  ).length;

  const guessingCount = queue.filter(
    (q) => (q.is_rapid_guess || q.guess_score >= 0.70) && !completedIds.has(q.recovery_id)
  ).length;

  return (
    <div className="card" style={{ marginBottom: 20 }}>
      {saveError&&<p role="alert">{saveError}</p>}
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 20 }}>🎯</span>
            <h2 style={{ margin: 0, fontSize: 17, color: 'var(--navy)' }}>
              Em cần thầy cô trao đổi
            </h2>
            {urgentCount > 0 && (
              <span
                style={{
                  background: '#ef4444',
                  color: '#fff',
                  fontSize: 12,
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: 12
                }}
              >
                {urgentCount} em cần gặp
              </span>
            )}
          </div>
          <p className="sub" style={{ margin: '4px 0 0' }}>
            Suy từ bài làm của bài này. Đã trao đổi chưa có nghĩa là em đã hiểu bài.
          </p>
        </div>

        {/* Filter Segmented Controls */}
        <div style={{ display: 'flex', gap: 6, background: '#f1f5f9', padding: 4, borderRadius: 8 }}>
          <button
            type="button"
            onClick={() => setFilter('all')}
            style={{
              padding: '5px 12px',
              fontSize: 12.5,
              fontWeight: filter === 'all' ? 700 : 500,
              background: filter === 'all' ? '#fff' : 'transparent',
              color: filter === 'all' ? 'var(--navy)' : '#64748b',
              border: 'none',
              borderRadius: 6,
              boxShadow: filter === 'all' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
              cursor: 'pointer'
            }}
          >
            Tất cả ({queue.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('escalated')}
            style={{
              padding: '5px 12px',
              fontSize: 12.5,
              fontWeight: filter === 'escalated' ? 700 : 500,
              background: filter === 'escalated' ? '#fff' : 'transparent',
              color: filter === 'escalated' ? '#b91c1c' : '#64748b',
              border: 'none',
              borderRadius: 6,
              boxShadow: filter === 'escalated' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
              cursor: 'pointer'
            }}
          >
            Cần gặp ({urgentCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter('guessing')}
            style={{
              padding: '5px 12px',
              fontSize: 12.5,
              fontWeight: filter === 'guessing' ? 700 : 500,
              background: filter === 'guessing' ? '#fff' : 'transparent',
              color: filter === 'guessing' ? '#c2410c' : '#64748b',
              border: 'none',
              borderRadius: 6,
              boxShadow: filter === 'guessing' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
              cursor: 'pointer'
            }}
          >
            Làm quá nhanh ({guessingCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter('resolved')}
            style={{
              padding: '5px 12px',
              fontSize: 12.5,
              fontWeight: filter === 'resolved' ? 700 : 500,
              background: filter === 'resolved' ? '#fff' : 'transparent',
              color: filter === 'resolved' ? '#15803d' : '#64748b',
              border: 'none',
              borderRadius: 6,
              boxShadow: filter === 'resolved' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
              cursor: 'pointer'
            }}
          >
            Đã trao đổi ({completedIds.size})
          </button>
        </div>
      </div>

      {/* List */}
      <div style={{ marginTop: 16 }}>
        {filteredItems.length === 0 ? (
          <div style={{ padding: 24, textAlign: 'center', color: '#64748b', background: '#f8fafc', borderRadius: 8 }}>
            ✅ Không có trường hợp nào trong bộ lọc này cần giáo viên xử lý thêm.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filteredItems.map((item) => {
              const isExpanded = expandedId === item.recovery_id;
              const isDone = completedIds.has(item.recovery_id);
              const arm = ARM_BADGE[item.selected_arm] ?? ARM_BADGE.teacher_queue;
              const status = STATUS_BADGE[item.status] ?? STATUS_BADGE.detected;

              return (
                <div
                  key={item.recovery_id}
                  style={{
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    padding: '14px 16px',
                    background: isDone ? '#f8fafc' : '#fff',
                    opacity: isDone ? 0.75 : 1,
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                    <div style={{ flex: 1 }}>
                      {/* Line 1: Student info & badges */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--navy)' }}>
                          {item.student_name}
                        </span>
                        <span
                          style={{
                            fontSize: 11.5,
                            fontWeight: 600,
                            padding: '2px 8px',
                            borderRadius: 4,
                            background: status.bg,
                            color: status.color
                          }}
                        >
                          {status.label}
                        </span>
                        <span
                          style={{
                            fontSize: 11.5,
                            fontWeight: 600,
                            padding: '2px 8px',
                            borderRadius: 4,
                            background: arm.bg,
                            color: arm.color
                          }}
                        >
                          {arm.label}
                        </span>
                        {item.attempt_count > 1 && (
                          <span style={{ fontSize: 11.5, color: '#64748b' }}>
                            (Tái phát lần {item.attempt_count})
                          </span>
                        )}
                      </div>

                      {/* Line 2: Causal Chain Diagnosis */}
                      <div style={{ marginTop: 8, fontSize: 13.5, lineHeight: 1.5 }}>
                        <span style={{ color: '#b91c1c', fontWeight: 600 }}>Lỗi: </span>
                        <span>{item.manifest_error_name ?? 'Lỗi tính toán'}</span>
                        {item.root_cause_error && (
                          <span style={{ marginLeft: 10, display: 'inline-block' }}>
                            ➔ <span style={{ color: '#0369a1', fontWeight: 600 }}>Gốc ở: </span>
                            <span style={{ fontWeight: 600 }}>{item.root_cause_name ?? 'kiến thức trước đó'}</span>
                          </span>
                        )}
                      </div>

                      {/* Line 3: Metric Indicators */}
                      <div style={{ marginTop: 6, display: 'flex', gap: 14, fontSize: 12, color: '#64748b', flexWrap: 'wrap' }}>
                        <span>
                          Điểm trước: <strong>{item.pre_score}/10</strong>
                        </span>
                        {item.post_score !== undefined && item.post_score !== null && (
                          <span>
                            Sau hỗ trợ: <strong>{item.post_score}/10</strong>
                          </span>
                        )}
                        {item.learning_gain !== undefined && item.learning_gain !== null && (
                          <span>
                            Tiến bộ: <strong>{item.learning_gain}</strong>
                          </span>
                        )}
                        {item.guess_score > 0 && (
                          <span style={{ color: item.guess_score >= 0.70 ? '#c2410c' : '#64748b' }}>
                            {item.is_rapid_guess ? 'Làm quá nhanh, có thể đoán mò' : 'Có dấu hiệu đoán mò'}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
                      <button
                        type="button"
                        disabled={saving!==null}
                        onClick={() => toggleComplete(item.recovery_id)}
                        style={{
                          fontSize: 12,
                          padding: '5px 10px',
                          borderRadius: 6,
                          border: '1px solid var(--border)',
                          background: isDone ? '#dcfce7' : '#fff',
                          color: isDone ? '#166534' : 'var(--navy)',
                          cursor: 'pointer',
                          fontWeight: 600
                        }}
                      >
                        {isDone ? '✓ Đã trao đổi' : 'Đánh dấu đã trao đổi'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setExpandedId(isExpanded ? null : item.recovery_id)}
                        style={{
                          fontSize: 12,
                          background: 'none',
                          border: 'none',
                          color: '#0284c7',
                          cursor: 'pointer',
                          padding: 2
                        }}
                      >
                        {isExpanded ? 'Thu gọn ▲' : 'Xem câu hỏi gợi ý ▼'}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Teacher Script */}
                  {isExpanded && (
                    <div
                      style={{
                        marginTop: 12,
                        paddingTop: 12,
                        borderTop: '1px dashed var(--border)',
                        background: '#f8fafc',
                        padding: 12,
                        borderRadius: 6
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#0369a1', fontWeight: 600, fontSize: 13 }}>
                        <span>💡</span>
                        <span>Gợi ý câu hỏi sư phạm 2 phút (Human-in-the-Loop):</span>
                      </div>
                      <p style={{ margin: '6px 0 0', fontSize: 13.5, fontStyle: 'italic', color: '#1e293b', lineHeight: 1.5 }}>
                        "{item.teacher_pedagogical_prompt ?? 'Yêu cầu học sinh giải thích lại từng bước suy luận, chú ý phân biệt rõ quy tắc dấu ngoặc và số đối.'}"
                      </p>
                      <div style={{ marginTop: 8, display: 'flex', gap: 10, fontSize: 12 }}>
                        <span style={{ color: '#64748b' }}>
                          Lời khuyên: Để học sinh tự chỉ ra sự mâu thuẫn trong kết quả tính toán trước khi thầy/cô gợi mở quy tắc chuẩn.
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
