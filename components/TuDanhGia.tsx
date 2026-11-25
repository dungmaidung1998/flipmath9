'use client';

/**
 * FILE NÀY LÀM GÌ: Component React giao diện hiển thị và xử lý tương tác của người dùng trên trình duyệt.
 * AI DÙNG: học sinh
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: không gọi mô-đun nội bộ khác
 */
import { useState } from 'react';

/** BƯỚC 4 ❓ Tự đánh giá mức hiểu (1–4 ⭐) và câu hỏi mang lên lớp (SPEC M2). */
const MUC = ['', 'Em chưa hiểu', 'Em hiểu một phần', 'Em hiểu và làm được bài cơ bản', 'Em hiểu rõ, giảng lại được cho bạn'];

/**
 * Component React `TuDanhGia`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export default function TuDanhGia({ kuId }: { kuId: string }) {
  const [muc, setMuc] = useState(0);
  const [hoi, setHoi] = useState('');
  const [tt, setTt] = useState<'' | 'gui' | 'xong' | 'loi'>('');
  const gui = async () => {
    setTt('gui');
    try {
      const r = await fetch('/api/events', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events: [{ kuId, type: 'tu_danh_gia', payload: { muc, cau_hoi: hoi.trim().slice(0, 500) } }] }) });
      if (!r.ok) throw new Error();
      setTt('xong');
    } catch { setTt('loi'); }
  };
  if (tt === 'xong') return <div className="card tu-danh-gia"><p role="status">✅ Đã gửi. Thầy cô sẽ xem trước giờ học{hoi.trim() ? ' và giải đáp câu hỏi của em trên lớp' : ''}.</p></div>;
  return (
    <div className="card tu-danh-gia">
      <h2>❓ Em hiểu bài này tới đâu?</h2>
      <div className="tu-danh-gia__sao" role="group" aria-label="Mức hiểu bài">
        {[1, 2, 3, 4].map((m) => (
          <button key={m} type="button" aria-pressed={muc === m} onClick={() => setMuc(m)} title={MUC[m]}>{'⭐'.repeat(m)}</button>
        ))}
      </div>
      {muc > 0 && <p className="hint">{MUC[muc]}</p>}
      <label>Điều em còn thắc mắc, muốn hỏi thầy cô trên lớp (không bắt buộc)
        <textarea rows={3} maxLength={500} value={hoi} onChange={(e) => setHoi(e.target.value)} />
      </label>
      <p><button type="button" className="primary" disabled={!muc || tt === 'gui'} onClick={gui}>{tt === 'gui' ? 'Đang gửi…' : 'Gửi tự đánh giá'}</button></p>
      {tt === 'loi' && <p role="alert">Chưa gửi được. Em thử lại.</p>}
    </div>
  );
}
