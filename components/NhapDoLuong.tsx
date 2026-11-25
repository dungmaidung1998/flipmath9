'use client';
/**
 * FILE NÀY LÀM GÌ: Component React giao diện hiển thị và xử lý tương tác của người dùng trên trình duyệt.
 * AI DÙNG: học sinh
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: không gọi mô-đun nội bộ khác
 */
import { useState } from 'react';

const WAVES = [
  { v: 'pre', t: 'Trước tác động' },
  { v: 'post', t: 'Sau tác động' },
  { v: 'followup', t: 'Đo duy trì (sau 6 tuần)' }
];

/**
 * Component React `NhapDoLuong`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export default function NhapDoLuong() {
  const [wave, setWave] = useState('pre');
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function submit() {
    setBusy(true); setMsg(null);
    const res = await fetch('/api/do-luong', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wave, text })
    });
    const d = await res.json();
    setBusy(false);
    if (!res.ok) { setMsg(d.error ?? 'Không nhập được'); return; }
    setMsg(`Đã ghi ${d.inserted} dòng.` + (d.loi?.length ? ' Bỏ qua: ' + d.loi.join('; ') : ''));
    if (d.inserted) setText('');
  }

  return (
    <div className="card">
      <h2>Nhập số liệu một đợt đo</h2>
      <label htmlFor="w">Đợt đo</label>
      <select id="w" value={wave} onChange={(e) => setWave(e.target.value)}>
        {WAVES.map((x) => <option key={x.v} value={x.v}>{x.t}</option>)}
      </select>

      <label htmlFor="d">
        Mỗi dòng một học sinh: <code>mã học sinh, M1, M2, M3, Y</code>
      </label>
      <textarea id="d" rows={8} value={text} onChange={(e) => setText(e.target.value)}
        placeholder={'hs001, 3.42, 3.15, 3.08, 6.5\nhs002, 3.71, 3.60, 3.33, 7.0'}
        style={{ fontFamily: 'ui-monospace, monospace', fontSize: 13.5 }} />
      <p className="hint" style={{ marginTop: 6 }}>
        M1 = năng lực số · M2 = học tập chủ động · M3 = tự điều chỉnh học tập (điểm trung bình
        thang 1–5 của bảng hỏi) · Y = điểm bài kiểm tra Toán thang 10. Dán lại cùng đợt sẽ ghi đè,
        không tạo dòng trùng. Dán cả dòng tiêu đề cũng được, hệ thống tự bỏ qua.
      </p>
      <button className="primary" onClick={submit} disabled={busy || !text.trim()} style={{ marginTop: 12 }}>
        {busy ? 'Đang ghi…' : 'Ghi số liệu'}
      </button>
      {msg && <p className="err" style={{ color: 'var(--ink)' }}>{msg}</p>}
    </div>
  );
}
