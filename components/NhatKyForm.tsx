'use client';
/**
 * FILE NÀY LÀM GÌ: Component React giao diện hiển thị và xử lý tương tác của người dùng trên trình duyệt.
 * AI DÙNG: học sinh
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: không gọi mô-đun nội bộ khác
 */
import { useState } from 'react';

/**
 * Ô ghi một mục nhật ký nghiên cứu.
 *
 * Không có nút sửa và không có nút xoá — cố ý. Muốn đính chính thì ghi một mục
 * mới, chọn "đính chính mục đã ghi" và nêu lý do; cả hai mục cùng nằm trong sổ.
 * Đó là thứ làm cho sổ này có giá trị làm chứng cứ.
 */

// Xử lý mốc ngày giờ theo múi giờ Việt Nam (UTC+7)
const homNayVN = () =>
  new Date(Date.now() + 7 * 3600 * 1000).toISOString().slice(0, 10);

/**
 * Component React `NhatKyForm`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export default function NhatKyForm({ dinhChinhId }: { dinhChinhId?: string }) {
  const [dangGui, setDangGui] = useState(false);
  const [loi, setLoi] = useState('');
  const [mo, setMo] = useState(!!dinhChinhId);

  async function gui(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoi('');
    setDangGui(true);
    const f = new FormData(e.currentTarget);
    const res = await fetch('/api/nhat-ky', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ngay: f.get('ngay'),
        congViec: f.get('congViec'),
        phuongPhap: f.get('phuongPhap'),
        ketQua: f.get('ketQua'),
        vaiTro: f.get('vaiTro'),
        congCuAi: f.get('congCuAi'),
        thayCho: dinhChinhId ?? null,
        lyDoSua: f.get('lyDoSua')
      })
    });
    const d = await res.json().catch(() => null);
    setDangGui(false);
    if (!res.ok) { setLoi(d?.error ?? 'Không ghi được.'); return; }
    window.location.reload();
  }

  if (!mo) {
    return (
      <p className="action-row">
        <button className="primary" onClick={() => setMo(true)}>Ghi một mục mới</button>
      </p>
    );
  }

  return (
    <form className="card" onSubmit={gui}>
      <h2>{dinhChinhId ? 'Đính chính một mục đã ghi' : 'Ghi mục nhật ký'}</h2>

      <label htmlFor="ngay">Ngày làm việc</label>
      <input id="ngay" name="ngay" type="date" defaultValue={homNayVN()} required />

      <label htmlFor="congViec">Đã làm gì <span aria-hidden="true">*</span></label>
      <textarea id="congViec" name="congViec" rows={3} required
                placeholder="Ví dụ: gắn mã quan niệm sai cho 12 phương án nhiễu của Bài 2 Mục 2" />

      <label htmlFor="phuongPhap">Làm bằng cách nào</label>
      <textarea id="phuongPhap" name="phuongPhap" rows={2}
                placeholder="Đối chiếu với từ điển lỗi, thử lại trên 3 bài làm cũ của học sinh" />

      <label htmlFor="ketQua">Kết quả</label>
      <textarea id="ketQua" name="ketQua" rows={2}
                placeholder="Gắn xong 12/12. Hai phương án chưa tìm được mã phù hợp, để trống." />

      <label htmlFor="vaiTro">Ai làm phần nào</label>
      <input id="vaiTro" name="vaiTro" placeholder="Em A gắn mã, em B kiểm tra lại" />

      <label htmlFor="congCuAi">Có nhờ AI không — nhờ việc gì, kiểm chứng lại thế nào</label>
      <input id="congCuAi" name="congCuAi" placeholder="Không. Hoặc: nhờ AI gợi ý cách diễn đạt, em tự kiểm tra lại từng câu." />

      {dinhChinhId && (
        <>
          <label htmlFor="lyDoSua">Vì sao phải đính chính <span aria-hidden="true">*</span></label>
          <textarea id="lyDoSua" name="lyDoSua" rows={2} required
                    placeholder="Ghi nhầm ngày, việc này làm hôm 24/9 chứ không phải 25/9" />
        </>
      )}

      <p className="hint" style={{ marginTop: 12 }}>
        Ghi xong là cố định: mục nhật ký không sửa và không xoá được, giờ ghi do máy chủ đóng.
        Cân nhắc trước khi bấm.
      </p>

      <p className="action-row">
        <button className="primary" disabled={dangGui}>{dangGui ? 'Đang ghi…' : 'Ghi vào sổ'}</button>
        {!dinhChinhId && <button type="button" className="ghost" onClick={() => setMo(false)}>Thôi</button>}
      </p>
      {loi && <p className="err">{loi}</p>}
    </form>
  );
}
