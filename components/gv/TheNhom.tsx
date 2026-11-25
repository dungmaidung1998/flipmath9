'use client';
/**
 * FILE NÀY LÀM GÌ: Component React phía trình duyệt phục vụ bảng điều khiển, biểu đồ và biểu mẫu thao tác cho giáo viên.
 * AI DÙNG: giáo viên
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: @/lib/gv/dieuHuong
 */
import { usePathname, useSearchParams } from 'next/navigation';
import { nhomCua } from '@/lib/gv/dieuHuong';

/** Hàng thẻ ở đầu trang giáo viên: các trang cùng một mục (ví dụ Tiết dạy: Trước giờ · Trên lớp · Chia nhóm · Sau giờ). */
export default function TheNhom() {
  const path = usePathname();
  const sp = useSearchParams();
  const nhom = nhomCua(path);
  if (!nhom || nhom.the.length < 2 || nhom.id === 'nghien-cuu') return null;
  const giu = new URLSearchParams();
  for (const k of ['lop', 'bai']) { const v = sp.get(k); if (v) giu.set(k, v); }
  const q = giu.toString() ? `?${giu}` : '';
  return (
    <nav className="gv-the" aria-label={nhom.nhan}>
      <span className="gv-the__nhom">{nhom.bieuTuong} {nhom.nhan}</span>
      {nhom.the.map((t) => {
        const dang = path === t.href || path.startsWith(t.href + '/');
        return <a key={t.href} href={t.href + q} aria-current={dang ? 'page' : undefined}>{t.nhan}</a>;
      })}
    </nav>
  );
}
