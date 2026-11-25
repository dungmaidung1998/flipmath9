'use client';
/**
 * FILE NÀY LÀM GÌ: Component React giao diện hiển thị và xử lý tương tác của người dùng trên trình duyệt.
 * AI DÙNG: học sinh
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: không gọi mô-đun nội bộ khác
 */
import { useState } from 'react';

/** Nút xác nhận của giáo viên hướng dẫn. Chỉ đặt được một lần, không gỡ lại được. */
export default function XacNhanNhatKy({ id }: { id: string }) {
  const [dangGui, setDangGui] = useState(false);
  const [loi, setLoi] = useState('');

  async function xacNhan() {
    setLoi('');
    setDangGui(true);
    const res = await fetch('/api/nhat-ky', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hanhDong: 'xac-nhan', id })
    });
    const d = await res.json().catch(() => null);
    setDangGui(false);
    if (!res.ok) { setLoi(d?.error ?? 'Không xác nhận được.'); return; }
    window.location.reload();
  }

  return (
    <>
      <button className="ghost" onClick={xacNhan} disabled={dangGui}>
        {dangGui ? 'Đang xác nhận…' : 'Xác nhận'}
      </button>
      {loi && <span className="err"> {loi}</span>}
    </>
  );
}
