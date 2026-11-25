'use client';
/**
 * FILE NÀY LÀM GÌ: Component React giao diện hiển thị và xử lý tương tác của người dùng trên trình duyệt.
 * AI DÙNG: học sinh
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: ./SignOut, @/lib/mauHocSinh
 */
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import SignOut from './SignOut';
import { iconViec, loaiViec } from '@/lib/mauHocSinh';

/**
 * Thanh trên cùng của học sinh (22/11/2026 — tối giản điện thoại).
 * Điện thoại (≤ 640px): chỉ còn chữ "FlipMath9 ▾"; bấm vào mới mở danh sách các trang.
 * Máy tính: menu vẫn hiện thành hàng như cũ (bấm chữ FlipMath9 không làm gì khác).
 */
export default function ThanhTrenHS({ laNCKH }: { laNCKH?: boolean }) {
  const path = usePathname() || '';
  const [mo, setMo] = useState(false);
  useEffect(() => setMo(false), [path]);
  useEffect(() => {
    if (!mo) return;
    const dong = (e: KeyboardEvent) => { if (e.key === 'Escape') setMo(false); };
    window.addEventListener('keydown', dong);
    return () => window.removeEventListener('keydown', dong);
  }, [mo]);
  const MUC = [
    { href: '/bai-hoc', ten: 'Bài học' },
    { href: '/so-loi', ten: 'Sổ lỗi' },
    { href: '/on-thi-10', ten: 'Ôn thi vào 10' },
    { href: '/tien-do', ten: 'Tiến độ của tôi' },
    { href: '/danh-gia', ten: 'Đánh giá kiến thức' },
    { href: '/kien-thuc-nen', ten: 'Kiến thức nền' },
    { href: '/thi-nghiem', ten: 'Thử tay' },
    { href: '/tieng-anh', ten: 'Toán tiếng Anh' },
    ...(laNCKH ? [{ href: '/nhat-ky', ten: 'Sổ nhật ký' }] : []),
  ];
  const dung = (h: string) => path === h || path.startsWith(h + '/');
  return (
    <div className={'topnav topnav--hs' + (mo ? ' topnav--mo' : '')}>
      <button type="button" className="brand brand-nut" aria-expanded={mo} aria-controls="menu-hs" onClick={() => setMo((v) => !v)}>
        FlipMath9 <span className="brand-nut__mui" aria-hidden="true">▾</span>
      </button>
      <nav id="menu-hs" aria-label="Các trang">
        {MUC.map((m) => (
          <a key={m.href} href={m.href} data-viec={loaiViec(m.href)} aria-current={dung(m.href) ? 'page' : undefined}><img src={iconViec(m.href)} alt="" width={18} height={18} />{m.ten}</a>
        ))}
        <SignOut />
      </nav>
      {mo && <div className="menu-hs-man" onClick={() => setMo(false)} aria-hidden="true" />}
    </div>
  );
}
