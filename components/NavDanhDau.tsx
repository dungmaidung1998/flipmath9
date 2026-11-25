'use client';
/**
 * FILE NÀY LÀM GÌ: Component React giao diện hiển thị và xử lý tương tác của người dùng trên trình duyệt.
 * AI DÙNG: học sinh
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: không gọi mô-đun nội bộ khác
 */
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/** Tô đậm mục menu đang mở và cuộn dải menu (trên điện thoại) tới đúng mục đó. */
export default function NavDanhDau() {
  const path = usePathname();
  useEffect(() => {
    document.querySelectorAll<HTMLAnchorElement>('.topnav nav a').forEach((a) => {
      const href = a.getAttribute('href') || '';
      const dung = href !== '/' && (path === href || path.startsWith(href + '/'));
      if (dung) { a.setAttribute('aria-current', 'page'); a.scrollIntoView({ block: 'nearest', inline: 'center' }); }
      else a.removeAttribute('aria-current');
    });
  }, [path]);
  return null;
}
