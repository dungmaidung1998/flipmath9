'use client';

/**
 * FILE NÀY LÀM GÌ: Component React giao diện hiển thị và xử lý tương tác của người dùng trên trình duyệt.
 * AI DÙNG: học sinh
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: không gọi mô-đun nội bộ khác
 */
import { useEffect, useState } from 'react';

/** Ô ghi chép trên phiếu: lưu ngay trên máy em, in ra vẫn thấy chữ em đã gõ. */
export function OGhi({ khoa, dong = 4, goiY }: { khoa: string; dong?: number; goiY?: string }) {
  const [v, setV] = useState('');
  useEffect(() => { try { setV(localStorage.getItem('f9-phieu:' + khoa) ?? ''); } catch { /* bỏ qua */ } }, [khoa]);
  return (
    <textarea className="phieu-o" rows={dong} value={v} placeholder={goiY ?? 'Em ghi vào đây (tự lưu trên máy này)…'}
      onChange={(e) => { setV(e.target.value); try { localStorage.setItem('f9-phieu:' + khoa, e.target.value); } catch { /* bỏ qua */ } }} />
  );
}

/** Ô đánh dấu (mục tiêu đã đạt, phương án chọn): lưu trên máy em. */
export function ODanh({ khoa, nhan, kieu = 'checkbox', nhom }: { khoa: string; nhan: React.ReactNode; kieu?: 'checkbox' | 'radio'; nhom?: string }) {
  const [on, setOn] = useState(false);
  const k = 'f9-phieu:' + (kieu === 'radio' ? nhom! : khoa);
  useEffect(() => { try { const s = localStorage.getItem(k); setOn(kieu === 'radio' ? s === khoa : s === '1'); } catch { /* bỏ qua */ } }, [k, khoa, kieu]);
  const doi = () => {
    try {
      if (kieu === 'radio') { localStorage.setItem(k, khoa); window.dispatchEvent(new CustomEvent('f9-phieu-radio', { detail: k })); }
      else localStorage.setItem(k, on ? '' : '1');
    } catch { /* bỏ qua */ }
    setOn(kieu === 'radio' ? true : !on);
  };
  useEffect(() => {
    if (kieu !== 'radio') return;
    const nghe = (e: Event) => { if ((e as CustomEvent).detail === k) { try { setOn(localStorage.getItem(k) === khoa); } catch { /* bỏ qua */ } } };
    window.addEventListener('f9-phieu-radio', nghe);
    return () => window.removeEventListener('f9-phieu-radio', nghe);
  }, [k, khoa, kieu]);
  return <label className="phieu-danh"><input type={kieu} name={nhom} checked={on} onChange={doi} /> <span>{nhan}</span></label>;
}

/**
 * Component React `NutIn`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export function NutIn() {
  return <button type="button" className="primary" onClick={() => window.print()}>🖨 In phiếu</button>;
}
