'use client';
/**
 * FILE NÀY LÀM GÌ: Component React phía trình duyệt phục vụ bảng điều khiển, biểu đồ và biểu mẫu thao tác cho giáo viên.
 * AI DÙNG: giáo viên
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: @/lib/gv/nguong
 */
import { useState } from 'react';
import { NHOM_NGUONG } from '@/lib/gv/nguong';

/**
 * Component React `FormCaiDat`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export default function FormCaiDat({ lop, nguong, macDinh }: { lop: string; nguong: Record<string, number>; macDinh: Record<string, number> }) {
  const [gt, setGt] = useState<Record<string, number>>(nguong);
  const [tt, setTt] = useState<'' | 'dang' | 'xong' | string>('');
  // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
  const hien = (k: string, pt?: boolean) => (pt ? Math.round(gt[k] * 100) : gt[k]);
  return (
    <form onSubmit={async (e) => {
      e.preventDefault(); setTt('dang');
      const r = await fetch('/api/gv/cai-dat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ lop, nguong: gt }) });
      const d = await r.json().catch(() => ({}));
      setTt(r.ok ? 'xong' : d.error ?? 'Chưa lưu được');
    }}>
      {NHOM_NGUONG.map((n) => (
        <section key={n.tieuDe} className="mc-khoi">
          <h2>{n.tieuDe}</h2>
          <ul className="mc-ds">
            {n.muc.map((m) => (
              <li key={m.k} className="mc-dong">
                <label htmlFor={m.k} style={{ textTransform: 'none', letterSpacing: 'normal', fontSize: 15, color: 'var(--ink)' }}>
                  {m.nhan} <span className="mc-ghi">(mặc định {m.phanTram ? `${Math.round(macDinh[m.k] * 100)}%` : macDinh[m.k]})</span>
                </label>
                <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <input id={m.k} type="number" step={1} value={hien(m.k, m.phanTram)} style={{ width: 80, font: 'inherit', padding: '6px 8px', borderRadius: 8, border: '1px solid var(--mc-vach)', background: 'var(--field)', color: 'var(--ink)' }}
                    onChange={(e) => { const v = Number(e.target.value); setGt({ ...gt, [m.k]: m.phanTram ? v / 100 : v }); setTt(''); }} />
                  <span className="mc-ghi">{m.phanTram ? '%' : m.donVi}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      ))}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <button className="nho chinh" disabled={tt === 'dang'}>{tt === 'dang' ? 'Đang lưu…' : 'Lưu cài đặt'}</button>
        <button type="button" className="nho" onClick={() => { setGt({ ...macDinh }); setTt(''); }}>Về mặc định</button>
        {tt === 'xong' && <span className="da-gui">✓ Đã lưu</span>}
        {tt && tt !== 'xong' && tt !== 'dang' && <span role="alert" style={{ color: 'var(--st-nguy)', fontWeight: 700 }}>{tt}</span>}
      </div>
    </form>
  );
}
