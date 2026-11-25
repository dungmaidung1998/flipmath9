'use client';
/**
 * FILE NÀY LÀM GÌ: Component React giao diện hiển thị và xử lý tương tác của người dùng trên trình duyệt.
 * AI DÙNG: học sinh
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: không gọi mô-đun nội bộ khác
 */
import { useState } from 'react';

export interface Viec { id: number; loai: string; loiNhan: string; links: { href: string; ten: string }[]; daXem: boolean }

/** Lời nhắn và gói bài thầy cô giao (từ 3 màn chính của giáo viên). Không có nhãn đánh giá nào ở đây. */
export default function LoiNhanThayCo({ viec }: { viec: Viec[] }) {
  const [an, setAn] = useState<Set<number>>(new Set());
  const ds = viec.filter((v) => !an.has(v.id));
  if (!ds.length) return null;
  return (
    <section className="card" aria-label="Lời nhắn từ thầy cô" style={{ borderLeft: '4px solid var(--navy)' }}>
      <h2 style={{ fontSize: 17, margin: '0 0 10px' }}>Thầy cô nhắn em</h2>
      {ds.map((v) => (
        <div key={v.id} style={{ padding: '10px 0', borderTop: '1px solid var(--line)' }}>
          <p style={{ margin: 0 }}>{v.loai === 'goi-sua-loi' ? '🧩 ' : v.loai === 'goi-lap-nen' ? '🧱 ' : '💬 '}{v.loiNhan}</p>
          {v.links.length > 0 && (
            <p style={{ margin: '6px 0 0', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {v.links.map((l) => <a key={l.href} className="tag" href={l.href}>{l.ten}</a>)}
            </p>
          )}
          <button type="button" className="ghost" style={{ marginTop: 8, padding: '6px 12px', fontSize: 13 }} onClick={async () => {
            setAn(new Set([...an, v.id]));
            try { await fetch('/api/hs/viec-duoc-giao', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: v.id }) }); } catch {}
          }}>Em đã đọc</button>
        </div>
      ))}
    </section>
  );
}
