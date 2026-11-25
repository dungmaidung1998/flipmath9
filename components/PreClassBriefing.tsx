'use client';

/**
 * FILE NÀY LÀM GÌ: Component React giao diện hiển thị và xử lý tương tác của người dùng trên trình duyệt.
 * AI DÙNG: học sinh
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: không gọi mô-đun nội bộ khác
 */
interface Props {
  classCode: string;
  arm?: string;
  kuId: string;
  kuName: string;
  totalStudents: number;
  preparedCount: number;
  averageQuizScore: number | null;
  r01Count: number;
  r04Count: number;
  r05Count: number;
  r06Count: number;
  topMisconception: {
    code: string;
    count: number;
    desc: string;
  } | null;
  prereqHoleCount: number;
  prereqKuName: string | null;
  flaggedStudents: {
    name: string;
    reason: string;
  }[];
}

/** Cắt lời mô tả lỗi tới dấu chấm/dấu hai chấm đầu tiên cho gọn. */
const ngan = (t: string, n = 90) => { const c = t.split(/[.:;]\s/)[0]; return c.length > n ? c.slice(0, n - 1) + '…' : c; };

/**
 * Component React `PreClassBriefing`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export default function PreClassBriefing({
  classCode,
  arm,
  kuId,
  kuName,
  totalStudents,
  preparedCount,
  averageQuizScore,
  r01Count,
  r04Count,
  r05Count,
  r06Count,
  topMisconception,
  prereqHoleCount,
  prereqKuName,
  flaggedStudents
}: Props) {
  // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
  const prepRate = totalStudents > 0 ? Math.round((preparedCount / totalStudents) * 100) : 0;

  let readinessBadge = '🟢 Sẵn sàng cao (Vào thẳng phân hóa)';
  let readinessText = 'Học sinh nắm vững bài trước, có thể vào thẳng hoạt động nhóm.';
  let readinessLevel: 'high' | 'medium' | 'low' = 'high';

  if (prereqHoleCount > 2 || prepRate < 60) {
    readinessLevel = 'low';
    readinessBadge = '🔴 Cần củng cố đầu giờ (5–7 phút)';
    readinessText = prereqHoleCount > 2
      ? `${prereqHoleCount} em hổng kiến thức “${prereqKuName}”. Cần ôn lại trước khi làm bài mới.`
      : `Tỷ lệ chuẩn bị đạt ${prepRate}%. Cần tóm lược trọng tâm đầu giờ.`;
  } else if (prepRate < 80 || (topMisconception && topMisconception.count >= 4)) {
    readinessLevel = 'medium';
    readinessBadge = '🟡 Khởi động đính chính lỗi';
    readinessText = topMisconception
      ? `Lớp hay mắc: ${ngan(topMisconception.desc)} (${topMisconception.count} lượt). Chiếu một ví dụ sai để cả lớp tìm lỗi.`
      : 'Khoảng 1/4 lớp chưa hoàn thành chuẩn bị bài.';
  }

  return (
    <div
      className="card preclass-briefing-card"
      style={{
        border: '1.5px solid var(--navy)',
        borderRadius: 14,
        padding: '20px',
        marginBottom: 20
      }}
    >
      {/* Tiêu đề & Nút in */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 20, margin: 0, color: 'var(--navy-d)' }}>
            Lớp {classCode} · {kuName}
          </h2>
        </div>

        <button
          onClick={() => window.print()}
          className="no-print action-link"
          style={{ fontSize: 13, padding: '7px 14px' }}
        >
          🖨️ In nhanh
        </button>
      </div>

      {/* Chỉ số mức độ sẵn sàng */}
      <div
        style={{
          margin: '14px 0',
          padding: '12px 14px',
          borderRadius: 10,
          background: readinessLevel === 'high' ? 'rgba(23, 132, 91, 0.08)' : readinessLevel === 'medium' ? 'rgba(224, 154, 32, 0.08)' : 'rgba(194, 65, 40, 0.08)',
          border: `1px solid ${readinessLevel === 'high' ? 'var(--ok)' : readinessLevel === 'medium' ? 'var(--accent)' : 'var(--warn)'}`,
          display: 'flex',
          alignItems: 'center',
          gap: 10
        }}
      >
        <span style={{ fontWeight: 700, fontSize: 13.5 }}>{readinessBadge}:</span>
        <span style={{ fontSize: 13.5, color: 'var(--ink)' }}>{readinessText}</span>
      </div>

      {/* Bộ 4 thông số trọng yếu */}
      <div className="stat" style={{ margin: '14px 0' }}>
        <div>
          <b style={{ color: prepRate >= 80 ? 'var(--ok)' : prepRate >= 60 ? 'var(--accent)' : 'var(--warn)' }}>
            {prepRate}%
          </b>
          <span>Đã chuẩn bị ({preparedCount}/{totalStudents})</span>
        </div>
        <div>
          <b>{averageQuizScore !== null ? `${averageQuizScore.toFixed(1)}/10` : '—'}</b>
          <span>Điểm chuẩn bị TB</span>
        </div>
        <div>
          <b style={{ color: (r05Count + r01Count + r04Count) > 0 ? 'var(--warn)' : 'var(--ok)' }}>
            {r05Count + r01Count + r04Count}
          </b>
          <span>Cần hỗ trợ</span>
        </div>
        <div>
          <b style={{ color: 'var(--navy)' }}>{r06Count}</b>
          <span>Em có thể kèm bạn</span>
        </div>
      </div>

      {/* 3 hành động sư phạm trọng tâm */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginTop: 14 }}>
        <div style={{ padding: '10px 12px', background: 'var(--chip)', borderRadius: 8, borderLeft: '3px solid var(--accent)' }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)' }}>PHA 1 · KHỞI ĐỘNG (5–7p)</span>
          <div style={{ fontSize: 13.5, fontWeight: 600, marginTop: 2 }}>
            {topMisconception ? `Chữa lỗi: ${ngan(topMisconception.desc, 60)}` : 'Kiểm tra nhanh'}
          </div>
        </div>

        <div style={{ padding: '10px 12px', background: 'var(--chip)', borderRadius: 8, borderLeft: '3px solid var(--navy)' }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--navy)' }}>PHA 2 · HOẠT ĐỘNG NHÓM (25p)</span>
          <div style={{ fontSize: 13.5, fontWeight: 600, marginTop: 2 }}>
            {r06Count >= 3 ? 'Nhóm có bạn giỏi kèm' : 'Nhóm theo 3 mức'}
          </div>
        </div>

        <div style={{ padding: '10px 12px', background: 'var(--chip)', borderRadius: 8, borderLeft: '3px solid var(--ok)' }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--ok)' }}>PHA 3 · TỔNG KẾT (10p)</span>
          <div style={{ fontSize: 13.5, fontWeight: 600, marginTop: 2 }}>
            Chốt bài & giao bài vận dụng
          </div>
        </div>
      </div>

      {/* Danh sách học sinh cần để mắt */}
      {flaggedStudents.length > 0 && (
        <div style={{ marginTop: 14, paddingTop: 10, borderTop: '1px solid var(--line)', fontSize: 13 }}>
          <strong style={{ color: 'var(--warn)' }}>⚠️ Lưu ý hỗ trợ: </strong>
          {flaggedStudents.slice(0, 6).map((s, idx) => (
            <span key={idx} className="tag" style={{ margin: '2px 4px', fontSize: 12 }}>
              {s.name} ({s.reason})
            </span>
          ))}
          {flaggedStudents.length > 6 && <span style={{ color: 'var(--muted)', fontSize: 12 }}>+{flaggedStudents.length - 6} em</span>}
        </div>
      )}
    </div>
  );
}
