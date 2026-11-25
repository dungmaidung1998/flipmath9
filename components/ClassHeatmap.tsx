'use client';

/**
 * FILE NÀY LÀM GÌ: Component React giao diện hiển thị và xử lý tương tác của người dùng trên trình duyệt.
 * AI DÙNG: học sinh
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: không gọi mô-đun nội bộ khác
 */
import { useState, useMemo } from 'react';

export interface HeatmapStudent {
  id: string;
  name: string;
  group?: string | null;
}

export interface HeatmapUnit {
  id: string;
  name: string;
  order: number;
}

interface Props {
  students: HeatmapStudent[];
  units: HeatmapUnit[];
  masteryData: {
    studentId: string;
    kuId: string;
    level: number;
  }[];
  activeKuId?: string;
}

const MASTERY_COLORS: Record<number, { bg: string; text: string; label: string; icon: string }> = {
  0: { bg: '#ef4444', text: '#ffffff', label: 'Mức 0 · Chưa đạt (Hổng kiến thức)', icon: '⚠️' },
  1: { bg: '#f59e0b', text: '#ffffff', label: 'Mức 1 · Đang học (Nhận biết cơ bản)', icon: '⏳' },
  2: { bg: '#10b981', text: '#ffffff', label: 'Mức 2 · Thành thạo (Vận dụng chuẩn)', icon: '✓' },
  3: { bg: '#047857', text: '#ffffff', label: 'Mức 3 · Làm chủ (Giải quyết tình huống mới)', icon: '⭐' }
};

/**
 * Component React `ClassHeatmap`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export default function ClassHeatmap({
  students,
  units,
  masteryData,
  activeKuId
}: Props) {
  const [filter, setFilter] = useState<'all' | 'need_help' | 'mastered'>('all');
  const [hoveredCell, setHoveredCell] = useState<{
    studentName: string;
    kuName: string;
    level: number | null;
  } | null>(null);

  // Tổ chức dữ liệu thành Map 2 chiều: studentId -> kuId -> level
  const matrix = useMemo(() => {
    const map = new Map<string, Map<string, number>>();
    for (const item of masteryData) {
      if (!map.has(item.studentId)) {
        map.set(item.studentId, new Map());
      }
      map.get(item.studentId)!.set(item.kuId, item.level);
    }
    return map;
  }, [masteryData]);

  // Thống kê tỷ lệ làm chủ trên từng KU cho hàng tổng kết
  const kuStats = useMemo(() => {
    return units.map((u) => {
      let masteredCount = 0;
      let evaluatedCount = 0;
      let needHelpCount = 0;

      for (const s of students) {
        const lvl = matrix.get(s.id)?.get(u.id);
        if (lvl !== undefined && lvl !== null) {
          evaluatedCount++;
          if (lvl >= 2) masteredCount++;
          if (lvl === 0) needHelpCount++;
        }
      }

      // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
      const masteredRate = evaluatedCount > 0 ? Math.round((masteredCount / evaluatedCount) * 100) : 0;
      return {
        kuId: u.id,
        masteredRate,
        masteredCount,
        needHelpCount,
        evaluatedCount
      };
    });
  }, [units, students, matrix]);

  // Lọc học sinh
  const filteredStudents = useMemo(() => {
    if (!activeKuId || filter === 'all') return students;

    return students.filter((s) => {
      const lvl = matrix.get(s.id)?.get(activeKuId);
      if (filter === 'need_help') {
        return lvl === undefined || lvl === null || lvl === 0;
      }
      if (filter === 'mastered') {
        return lvl !== undefined && lvl !== null && lvl >= 2;
      }
      return true;
    });
  }, [students, matrix, activeKuId, filter]);

  return (
    <div className="card" style={{ marginTop: 24, overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>🗺️</span> Bản đồ nhiệt kiến thức lớp (Class Knowledge Heatmap)
          </h2>
          <p className="hint" style={{ margin: 0 }}>
            Ma trận trực quan mức độ làm chủ (Mastery 0–3) của từng học sinh trên toàn bộ 14 đơn vị kiến thức Chương 1
          </p>
        </div>

        {/* Chú giải bảng màu */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', fontSize: 12.5 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 12, height: 12, borderRadius: 3, background: '#ef4444', display: 'inline-block' }} />
            Mức 0 (Chưa đạt)
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 12, height: 12, borderRadius: 3, background: '#f59e0b', display: 'inline-block' }} />
            Mức 1 (Đang học)
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 12, height: 12, borderRadius: 3, background: '#10b981', display: 'inline-block' }} />
            Mức 2 (Thành thạo)
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 12, height: 12, borderRadius: 3, background: '#047857', display: 'inline-block' }} />
            Mức 3 (Làm chủ)
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 12, height: 12, borderRadius: 3, background: 'var(--chip)', border: '1px solid var(--line)', display: 'inline-block' }} />
            Chưa học
          </span>
        </div>
      </div>

      {/* Thanh bộ lọc danh sách học sinh */}
      <div className="filter-chips-bar no-print" style={{ margin: '16px 0 12px' }}>
        <span style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 600 }}>Hiển thị:</span>
        <button
          className={`filter-chip-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          Tất cả học sinh ({students.length})
        </button>
        {activeKuId && (
          <>
            <button
              className={`filter-chip-btn ${filter === 'need_help' ? 'active' : ''}`}
              onClick={() => setFilter('need_help')}
            >
              Cần hỗ trợ ở mục này ({students.filter((s) => (matrix.get(s.id)?.get(activeKuId) ?? 0) === 0).length})
            </button>
            <button
              className={`filter-chip-btn ${filter === 'mastered' ? 'active' : ''}`}
              onClick={() => setFilter('mastered')}
            >
              Đã thành thạo / Làm chủ ({students.filter((s) => (matrix.get(s.id)?.get(activeKuId) ?? 0) >= 2).length})
            </button>
          </>
        )}
      </div>

      {/* Ma trận Heatmap có thanh cuộn ngang */}
      <div className="scroll" style={{ border: '1px solid var(--line)', borderRadius: 10, maxHeight: 520 }}>
        {/* Khối giao diện: Bảng số liệu tổng hợp */}
        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 2, minWidth: 900 }}>
          <thead>
            <tr>
              <th style={{
                position: 'sticky',
                left: 0,
                background: 'var(--card)',
                zIndex: 3,
                minWidth: 160,
                padding: '8px 12px',
                borderBottom: '2px solid var(--line)',
                boxShadow: '2px 0 5px rgba(0,0,0,0.04)'
              }}>
                Học sinh ({filteredStudents.length})
              </th>
              {units.map((u) => {
                const isActive = u.id === activeKuId;
                return (
                  <th
                    key={u.id}
                    title={u.name}
                    style={{
                      textAlign: 'center',
                      padding: '8px 4px',
                      fontSize: 11.5,
                      minWidth: 50,
                      maxWidth: 68,
                      borderBottom: '2px solid var(--line)',
                      background: isActive ? 'var(--chip)' : 'transparent',
                      color: isActive ? 'var(--navy-d)' : 'var(--muted)',
                      fontWeight: isActive ? 700 : 600,
                      borderLeft: isActive ? '2px solid var(--navy)' : undefined,
                      borderRight: isActive ? '2px solid var(--navy)' : undefined
                    }}
                  >
                    <div>{u.id.replace(/^C\d+-/, '')}</div>
                    {isActive && (
                      <span style={{
                        fontSize: 9, background: 'var(--navy)', color: '#fff',
                        padding: '1px 4px', borderRadius: 4, display: 'inline-block', marginTop: 2
                      }}>
                        Đang dạy
                      </span>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((s, idx) => (
              <tr key={s.id} style={{ background: idx % 2 === 0 ? 'transparent' : 'rgba(0,0,0,0.015)' }}>
                {/* Cột tên học sinh ghim cố định bên trái */}
                <td style={{
                  position: 'sticky',
                  left: 0,
                  background: 'var(--card)',
                  zIndex: 2,
                  padding: '6px 12px',
                  fontWeight: 600,
                  fontSize: 13,
                  whiteSpace: 'nowrap',
                  borderRight: '1px solid var(--line)',
                  boxShadow: '2px 0 5px rgba(0,0,0,0.03)'
                }}>
                  {s.name}
                </td>

                {/* Các ô Mastery của từng KU */}
                {units.map((u) => {
                  const isActive = u.id === activeKuId;
                  const level = matrix.get(s.id)?.get(u.id);
                  const info = level !== undefined && level !== null ? MASTERY_COLORS[level] : null;

                  return (
                    <td
                      key={u.id}
                      onMouseEnter={() => setHoveredCell({ studentName: s.name, kuName: u.name, level: level ?? null })}
                      onMouseLeave={() => setHoveredCell(null)}
                      style={{
                        textAlign: 'center',
                        padding: '3px',
                        background: isActive ? 'rgba(37, 99, 217, 0.04)' : undefined,
                        borderLeft: isActive ? '2px solid var(--navy)' : undefined,
                        borderRight: isActive ? '2px solid var(--navy)' : undefined
                      }}
                    >
                      <div
                        style={{
                          height: 28,
                          borderRadius: 6,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: 'pointer',
                          transition: 'transform .1s',
                          background: info ? info.bg : 'var(--chip)',
                          color: info ? info.text : 'var(--muted)',
                          opacity: info ? 1 : 0.4
                        }}
                      >
                        {level !== undefined && level !== null ? level : '—'}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>

          {/* HÀNG TỔNG KẾT TỶ LỆ LÀM CHỦ CẢ LỚP */}
          <tfoot>
            <tr style={{ background: 'var(--chip)', fontWeight: 700 }}>
              <td style={{
                position: 'sticky',
                left: 0,
                background: 'var(--chip)',
                zIndex: 2,
                padding: '10px 12px',
                fontSize: 12.5,
                color: 'var(--navy-d)',
                borderTop: '2px solid var(--line)',
                borderRight: '1px solid var(--line)',
                boxShadow: '2px 0 5px rgba(0,0,0,0.04)'
              }}>
                % Làm chủ (Mức 2 & 3)
              </td>
              {kuStats.map((st) => {
                const isActive = st.kuId === activeKuId;
                const isBottleneck = st.evaluatedCount > 0 && st.masteredRate < 50;
                return (
                  <td
                    key={st.kuId}
                    style={{
                      textAlign: 'center',
                      padding: '8px 3px',
                      fontSize: 12,
                      borderTop: '2px solid var(--line)',
                      color: isBottleneck ? 'var(--warn)' : 'var(--ok)',
                      background: isActive ? 'rgba(37,99,217,0.1)' : undefined,
                      borderLeft: isActive ? '2px solid var(--navy)' : undefined,
                      borderRight: isActive ? '2px solid var(--navy)' : undefined
                    }}
                    title={`${st.kuId}: ${st.masteredCount}/${st.evaluatedCount} em làm chủ (${st.masteredRate}%)`}
                  >
                    <div>{st.evaluatedCount > 0 ? `${st.masteredRate}%` : '—'}</div>
                  </td>
                );
              })}
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Tooltip hoặc thanh giải thích ô đang rê chuột */}
      <div style={{
        marginTop: 10,
        padding: '8px 12px',
        background: 'var(--bg)',
        borderRadius: 8,
        fontSize: 13,
        minHeight: 38,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {hoveredCell ? (
          <div>
            <b>{hoveredCell.studentName}</b> · <span>{hoveredCell.kuName}</span>: {' '}
            <strong style={{
              color: hoveredCell.level !== null ? MASTERY_COLORS[hoveredCell.level]?.bg : 'var(--muted)'
            }}>
              {hoveredCell.level !== null
                ? MASTERY_COLORS[hoveredCell.level]?.label
                : 'Chưa có dữ liệu đánh giá'}
            </strong>
          </div>
        ) : (
          <span className="hint">
            💡 Rê chuột vào từng ô để xem chi tiết mức độ làm chủ của học sinh trên đơn vị kiến thức tương ứng
          </span>
        )}

        <span className="hint" style={{ fontSize: 12 }}>
          Hàng dưới cùng: Vùng trũng kiến thức (tỷ lệ &lt; 50% làm chủ) sẽ hiển thị màu cam cảnh báo
        </span>
      </div>
    </div>
  );
}
