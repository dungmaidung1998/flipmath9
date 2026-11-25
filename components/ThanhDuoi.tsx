'use client';
/**
 * FILE NÀY LÀM GÌ: Component React giao diện hiển thị và xử lý tương tác của người dùng trên trình duyệt.
 * AI DÙNG: học sinh
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: ./SignOut, @/lib/mauHocSinh
 */
import { useEffect, useState, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import SignOut from './SignOut';
import { iconViec, loaiViec } from '@/lib/mauHocSinh';

/**
 * Thanh menu dưới đáy cho học sinh dùng điện thoại (≤ 640px).
 * 4 mục hay dùng + "Thêm" mở danh sách còn lại. Trên máy tính thanh này ẩn,
 * vẫn dùng menu trên cùng như cũ.
 */
const I = (d: ReactNode) => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{d}</svg>
);
const CHINH = [
  { href: '/bai-hoc', ten: 'Bài học', icon: I(<><path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z" /><path d="M4 19V5" /></>) },
  { href: '/so-loi', ten: 'Sổ lỗi', icon: I(<><circle cx="12" cy="12" r="9" /><path d="M12 7v6" /><path d="M12 16.5v.5" /></>) },
  { href: '/on-thi-10', ten: 'Ôn thi 10', icon: I(<><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.5" /></>) },
  { href: '/tien-do', ten: 'Tiến độ', icon: I(<><path d="M4 20V10" /><path d="M10 20V4" /><path d="M16 20v-7" /><path d="M22 20H2" /></>) },
];

/**
 * Component React `ThanhDuoi`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export default function ThanhDuoi({ laNCKH }: { laNCKH?: boolean }) {
  const path = usePathname() || '';
  const [mo, setMo] = useState(false);
  useEffect(() => setMo(false), [path]);
  const dung = (h: string) => path === h || path.startsWith(h + '/');
  const THEM = [
    { href: '/danh-gia', ten: 'Đánh giá kiến thức' },
    { href: '/thi-nghiem', ten: 'Thử tay' },
    { href: '/tieng-anh', ten: 'Toán tiếng Anh' },
    { href: '/kien-thuc-nen', ten: 'Kiến thức nền' },
    ...(laNCKH ? [{ href: '/nhat-ky', ten: 'Sổ nhật ký' }] : []),
  ];
  const themDung = THEM.some((t) => dung(t.href));
  return (
    <>
      {mo && <div className="td-man" onClick={() => setMo(false)} aria-hidden="true" />}
      {mo && (
        <div className="td-bang" role="dialog" aria-label="Các mục khác">
          {THEM.map((t) => (
            <a key={t.href} href={t.href} data-viec={loaiViec(t.href)} aria-current={dung(t.href) ? 'page' : undefined}><img src={iconViec(t.href)} alt="" width={18} height={18} />{t.ten}</a>
          ))}
          <div className="td-bang__dang-xuat"><SignOut /></div>
        </div>
      )}
      <nav className="thanh-duoi" aria-label="Menu chính">
        {CHINH.map((m) => (
          <a key={m.href} href={m.href} data-viec={loaiViec(m.href)} aria-current={dung(m.href) ? 'page' : undefined}>
            {m.icon}<span>{m.ten}</span>
          </a>
        ))}
        <button type="button" aria-expanded={mo} aria-current={themDung ? 'page' : undefined} onClick={() => setMo((v) => !v)}>
          {I(<><circle cx="5" cy="12" r="1.3" /><circle cx="12" cy="12" r="1.3" /><circle cx="19" cy="12" r="1.3" /></>)}<span>Thêm</span>
        </button>
      </nav>
    </>
  );
}
