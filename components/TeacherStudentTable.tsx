'use client';

/**
 * FILE NÀY LÀM GÌ: Component React giao diện hiển thị và xử lý tương tác của người dùng trên trình duyệt.
 * AI DÙNG: học sinh
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: không gọi mô-đun nội bộ khác
 */
import { useState, useMemo } from 'react';

export interface StudentRow {
  id: string;
  name: string;
  consent: string | null;
  les: number | null;
  soThanhPhan: number;
  video: number | null;
  quiz: number | null;
  mastery: number | null;
  rule: string | null;
  group: string | null;
}

interface Props {
  rows: StudentRow[];
  cutoffs: [number, number, number];
  buoiCoBai: number | null;
}

/** Tên dễ hiểu của các gợi ý web tự đưa ra (quy tắc R01…R09). */
const TEN_QUY_TAC: Record<string, string> = {
  R01: 'Xem video chưa kĩ', R02: 'Thuộc nhưng chưa vận dụng', R03: 'Lỗi lặp lại', R04: 'Làm quá nhanh',
  R05: 'Hổng nền', R06: 'Nắm chắc, kèm được bạn', R07: 'Lâu không vào', R09: 'Chưa xem bài mà điểm thấp'
};

type FilterType = 'all' | 'risk' | 'unsubmitted' | 'r01' | 'mastery';

/**
 * Component React `TeacherStudentTable`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export default function TeacherStudentTable({ rows, cutoffs, buoiCoBai }: Props) {
  const [filter, setFilter] = useState<FilterType>('all');
  const [search, setSearch] = useState('');

  const countRisk = useMemo(
    () => rows.filter((r) => r.group === 'Nguy cơ' || r.group === 'Cần hỗ trợ').length,
    [rows]
  );
  const countUnsubmitted = useMemo(
    () => rows.filter((r) => r.quiz === null).length,
    [rows]
  );
  const countR01 = useMemo(
    () => rows.filter((r) => r.rule === 'R01' || r.rule === 'R09').length,
    [rows]
  );
  const countMastery = useMemo(
    () => rows.filter((r) => r.group === 'Tốt' || r.rule === 'R06' || (r.mastery !== null && r.mastery >= 2)).length,
    [rows]
  );

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        if (!r.name.toLowerCase().includes(q) && !r.id.toLowerCase().includes(q)) {
          return false;
        }
      }
      if (filter === 'risk') return r.group === 'Nguy cơ' || r.group === 'Cần hỗ trợ';
      if (filter === 'unsubmitted') return r.quiz === null;
      if (filter === 'r01') return r.rule === 'R01' || r.rule === 'R09';
      if (filter === 'mastery') return r.group === 'Tốt' || r.rule === 'R06' || (r.mastery !== null && r.mastery >= 2);
      return true;
    });
  }, [rows, filter, search]);

  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <h2>Chi tiết từng học sinh ({rows.length})</h2>
        <div style={{ maxWidth: '240px' }}>
          <input
            type="search"
            placeholder="Tìm theo tên học sinh..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ padding: '6px 10px', fontSize: '13.5px' }}
          />
        </div>
      </div>

      <div className="filter-chips-bar" role="toolbar" aria-label="Bộ lọc nhanh học sinh">
        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--muted)', marginRight: '4px' }}>
          Lọc nhanh:
        </span>
        <button
          type="button"
          className={`filter-chip-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          Tất cả ({rows.length})
        </button>
        <button
          type="button"
          className={`filter-chip-btn ${filter === 'risk' ? 'active' : ''}`}
          onClick={() => setFilter('risk')}
        >
          Nguy cơ / Cần hỗ trợ ({countRisk})
        </button>
        <button
          type="button"
          className={`filter-chip-btn ${filter === 'unsubmitted' ? 'active' : ''}`}
          onClick={() => setFilter('unsubmitted')}
        >
          Chưa làm bài ({countUnsubmitted})
        </button>
        <button
          type="button"
          className={`filter-chip-btn ${filter === 'r01' ? 'active' : ''}`}
          onClick={() => setFilter('r01')}
        >
          Xem video chưa kĩ ({countR01})
        </button>
        <button
          type="button"
          className={`filter-chip-btn ${filter === 'mastery' ? 'active' : ''}`}
          onClick={() => setFilter('mastery')}
        >
          Đã nắm chắc ({countMastery})
        </button>
      </div>

      <div className="scroll">
        {/* Khối giao diện: Bảng số liệu tổng hợp */}
        <table>
          <thead>
            <tr>
              <th>Học sinh</th>
              <th>Nhóm</th>
              <th className="n">Video</th>
              <th className="n">Điểm chuẩn bị</th>
              <th className="n">Nắm mục</th>
              <th>Web nhận thấy</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id}>
                <td>
                  <strong>{r.name}</strong>
                </td>
                <td>
                  {r.group === null ? (
                    <span className="hint">—</span>
                  ) : (
                    <span
                      className={
                        'tag' +
                        (r.group === 'Tốt'
                          ? ' ok'
                          : r.group === 'Nguy cơ'
                          ? ' warn'
                          : '')
                      }
                    >
                      {r.group}
                    </span>
                  )}
                </td>
                <td className="n">{r.video === null ? '—' : r.video + '%'}</td>
                <td className="n">{r.quiz !== null ? r.quiz.toFixed(1) : '—'}</td>
                <td className="n">
                  {r.mastery === null ? (
                    <span className="hint">chưa đủ dữ liệu</span>
                  ) : (
                    <span className="mastery-stars" title={`Mức nắm mục: ${r.mastery}/3`}>
                      {[1, 2, 3].map((s) => (
                        <span key={s} className={`star-icon ${s <= (r.mastery ?? 0) ? 'filled' : 'empty'}`}>
                          ★
                        </span>
                      ))}
                      <span style={{ fontSize: '12px', fontWeight: 600, marginLeft: '3px' }}>
                        {r.mastery}/3
                      </span>
                    </span>
                  )}
                </td>
                <td>
                  {r.rule ? (
                    <span className="tag" style={{ fontWeight: 600 }}>{TEN_QUY_TAC[r.rule] ?? r.rule}</span>
                  ) : (
                    '—'
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 && (
        <p className="hint" style={{ padding: '24px 0', textAlign: 'center' }}>
          Không có học sinh nào phù hợp với bộ lọc hiện tại.
        </p>
      )}

      <p className="hint" style={{ marginTop: 10 }}>
        Mốc cắt bốn nhóm lấy theo tứ phân vị của chính lớp này: {cutoffs.map((c: number) => c.toFixed(1)).join(' | ')}.
        Học sinh chưa có đồng thuận tham gia vẫn học bình thường nhưng dữ liệu không đưa vào phân tích nghiên cứu.
      </p>
    </div>
  );
}
