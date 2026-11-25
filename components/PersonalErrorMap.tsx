'use client';

/**
 * FILE NÀY LÀM GÌ: Component React giao diện hiển thị và xử lý tương tác của người dùng trên trình duyệt.
 * AI DÙNG: học sinh
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: @/components/LinhVatDaNang
 */
import { useState, useMemo } from 'react';
import LinhVatDaNang from '@/components/LinhVatDaNang';

export interface ErrorIncident {
  errorCode: string;
  kuId: string;
  kuName?: string;
  misconception: string;
  remediationId?: string | null;
  count: number;
  lastOccurredAt: string;
  isResolved: boolean;
}

interface Props {
  errors: ErrorIncident[];
}

export type CognitiveDomain = 'all' | 'conceptual' | 'computational' | 'procedural' | 'persistent';

/** Nhóm lỗi theo tiền tố mã (Toán 9). Mã mới chưa khai thì xếp vào "Quy tắc & Biến đổi". */
const KHAI_NIEM = ['E-CBH', 'E-CBB'];
const TINH_TOAN = ['E-KC'];
/**
 * Component React `getDomain`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export function getDomain(code: string): 'conceptual' | 'computational' | 'procedural' {
  if (KHAI_NIEM.some((p) => code.startsWith(p))) return 'conceptual';
  if (TINH_TOAN.some((p) => code.startsWith(p))) return 'computational';
  return 'procedural';
}

export const DOMAIN_INFO = {
  conceptual: {
    label: 'Khái niệm',
    icon: '💡',
    desc: 'Hiểu đúng khái niệm, điều kiện xác định, so sánh giá trị.'
  },
  computational: {
    label: 'Tính toán',
    icon: '➗',
    desc: 'Thực hiện đúng các phép tính và quy tắc tính.'
  },
  procedural: {
    label: 'Quy tắc & Biến đổi',
    icon: '📐',
    desc: 'Biến đổi biểu thức, rút gọn, trình bày lời giải theo đúng các bước.'
  }
};

/**
 * Component React `PersonalErrorMap`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export default function PersonalErrorMap({ errors }: Props) {
  const [filter, setFilter] = useState<CognitiveDomain>('all');

  const stats = useMemo(() => {
    const totalTypes = errors.length;
    const persistent = errors.filter((e) => e.count >= 3).length;
    const resolved = errors.filter((e) => e.isResolved).length;
    const conceptualCount = errors.filter((e) => getDomain(e.errorCode) === 'conceptual').length;
    const computationalCount = errors.filter((e) => getDomain(e.errorCode) === 'computational').length;
    const proceduralCount = errors.filter((e) => getDomain(e.errorCode) === 'procedural').length;

    return {
      totalTypes,
      persistent,
      resolved,
      active: totalTypes - resolved,
      conceptualCount,
      computationalCount,
      proceduralCount
    };
  }, [errors]);

  const filtered = useMemo(() => {
    if (filter === 'all') return errors;
    if (filter === 'persistent') return errors.filter((e) => e.count >= 3);
    return errors.filter((e) => getDomain(e.errorCode) === filter);
  }, [errors, filter]);

  return (
    <div className="card" style={{ marginTop: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>🧠</span> Bản đồ lỗi sai của em
          </h2>
          <p className="hint" style={{ margin: 0 }}>
            Những lỗi em hay mắc, lỗi nào lặp lại và lỗi nào em đã sửa được.
          </p>
        </div>
      </div>

      {/* Snapshot thống kê 4 miền */}
      <div className="stat stat--hinh" style={{ margin: '18px 0 14px' }}>
        <div>
          <img className="stat-hinh" src="/minh-hoa/bt/loi.webp" alt="" width={160} height={160} />
          <b>{stats.totalTypes}</b>
          <span>Mã lỗi từng gặp</span>
        </div>
        <div>
          <img className="stat-hinh" src="/minh-hoa/bt/lap-lai.webp" alt="" width={160} height={160} />
          <b style={{ color: stats.persistent > 0 ? 'var(--warn)' : 'var(--ok)' }}>
            {stats.persistent}
          </b>
          <span>Lỗi lặp lại bền vững (≥3 lần)</span>
        </div>
        <div>
          <img className="stat-hinh" src="/minh-hoa/bt/thao-go.webp" alt="" width={160} height={160} />
          <b style={{ color: 'var(--ok)' }}>{stats.resolved}</b>
          <span>Đã tháo gỡ thành công</span>
        </div>
        <div>
          <img className="stat-hinh" src="/minh-hoa/bt/luu-y.webp" alt="" width={160} height={160} />
          <b style={{ color: stats.active > 0 ? 'var(--accent)' : 'var(--muted)' }}>
            {stats.active}
          </b>
          <span>Cần lưu ý ôn lại</span>
        </div>
      </div>

      {/* Bộ lọc theo miền nhận thức */}
      <div className="filter-chips-bar" role="toolbar" aria-label="Lọc theo miền nhận thức">
        <button
          type="button"
          className={`filter-chip-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          Tất cả ({errors.length})
        </button>
        <button
          type="button"
          className={`filter-chip-btn ${filter === 'persistent' ? 'active' : ''}`}
          onClick={() => setFilter('persistent')}
        >
          🔄 Lặp lại bền vững ({stats.persistent})
        </button>
        <button
          type="button"
          className={`filter-chip-btn ${filter === 'conceptual' ? 'active' : ''}`}
          onClick={() => setFilter('conceptual')}
        >
          💡 {DOMAIN_INFO.conceptual.label} ({stats.conceptualCount})
        </button>
        <button
          type="button"
          className={`filter-chip-btn ${filter === 'computational' ? 'active' : ''}`}
          onClick={() => setFilter('computational')}
        >
          ➗ {DOMAIN_INFO.computational.label} ({stats.computationalCount})
        </button>
        <button
          type="button"
          className={`filter-chip-btn ${filter === 'procedural' ? 'active' : ''}`}
          onClick={() => setFilter('procedural')}
        >
          📐 {DOMAIN_INFO.procedural.label} ({stats.proceduralCount})
        </button>
      </div>

      {/* Danh sách thẻ lỗi */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14, marginTop: 14 }}>
        {filtered.map((item) => {
          const domain = getDomain(item.errorCode);
          const domainMeta = DOMAIN_INFO[domain];
          const isPersistent = item.count >= 3;

          return (
            <div
              key={item.errorCode}
              style={{
                border: '1px solid var(--line)',
                borderLeft: `4px solid ${isPersistent ? 'var(--warn)' : item.isResolved ? 'var(--ok)' : 'var(--navy)'}`,
                borderRadius: 10,
                padding: '14px 16px',
                background: 'var(--card)',
                boxShadow: 'var(--shadow)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--navy)', textTransform: 'uppercase', letterSpacing: '.05em' }}>
                    {domainMeta.icon} {domainMeta.label}
                  </span>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    {isPersistent && (
                      <span className="tag warn" title="Mắc cùng một lỗi từ 3 lần trở lên">
                        Lặp lại {item.count} lần
                      </span>
                    )}
                    <span className={`tag ${item.isResolved ? 'ok' : ''}`}>
                      {item.isResolved ? 'Đã khắc phục' : `Đã gặp ${item.count} lần`}
                    </span>
                  </div>
                </div>

                <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--ink)', marginBottom: 4 }}>
                  <code>{item.errorCode}</code> · {item.kuName ?? item.kuId}
                </div>

                <p style={{ margin: '0 0 10px', fontSize: '14px', color: 'var(--muted)', lineHeight: 1.5 }}>
                  {item.misconception}
                </p>
              </div>

              <div style={{ paddingTop: 10, borderTop: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="hint" style={{ fontSize: '12px' }}>
                  Gần nhất: {new Date(item.lastOccurredAt).toLocaleDateString('vi-VN')}
                </span>
                {item.remediationId && (
                  <a
                    className="action-link"
                    href={`/vi-bai-hoc/${encodeURIComponent(item.remediationId)}`}
                    style={{ fontSize: '12.5px', padding: '4px 10px' }}
                  >
                    Mở vi bài học sửa lỗi →
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div style={{ padding: '20px 16px 28px', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
            <LinhVatDaNang loai="vooc" tuThe={filter === 'all' ? 'ngu' : 'suy-nghi'} kichThuoc={104} />
          </div>
          <p className="hint" style={{ fontSize: '14.5px' }}>
            {filter === 'all'
              ? '🎉 Tuyệt vời! Em chưa ghi nhận quan niệm sai nào trong các bài kiểm tra.'
              : 'Không có lỗi sai nào thuộc nhóm này.'}
          </p>
        </div>
      )}
    </div>
  );
}
