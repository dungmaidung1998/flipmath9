'use client';
/**
 * FILE NÀY LÀM GÌ: Component React phía trình duyệt phục vụ bảng điều khiển, biểu đồ và biểu mẫu thao tác cho giáo viên.
 * AI DÙNG: giáo viên
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: @/lib/gv/dieuHuong
 */
import { usePathname, useSearchParams } from 'next/navigation';
import { NHOM_CHINH, NHOM_CAI_DAT, NHOM_NGHIEN_CUU, NHOM_QUAN_TRI, nhomCua } from '@/lib/gv/dieuHuong';

/**
 * Thanh bên trái của giáo viên: 5 mục chính, Quản trị trường (nếu có quyền), ⚙️ Cài đặt, và "Dữ liệu nghiên cứu".
 * Giữ lớp và bài đang chọn khi chuyển trang.
 */
export default function ThanhBen({ laQuanTri = false }: { laQuanTri?: boolean }) {
  const path = usePathname();
  const sp = useSearchParams();
  const giu = new URLSearchParams();
  for (const k of ['lop', 'bai']) { const v = sp.get(k); if (v) giu.set(k, v); }
  const q = giu.toString() ? `?${giu}` : '';
  const dang = nhomCua(path);
  const hien = (id: string) => (dang?.id === id ? 'page' : undefined);
  return (
    <aside className="gv-ben" aria-label="Điều hướng giáo viên">
      {NHOM_CHINH.map((n) => (
        <a key={n.id} href={n.the[0].href + q} aria-current={hien(n.id)} title={n.cauHoi}>
          <span aria-hidden="true">{n.bieuTuong}</span> {n.nhan}
        </a>
      ))}
      {laQuanTri && (
        <a href={NHOM_QUAN_TRI.the[0].href} aria-current={hien(NHOM_QUAN_TRI.id)} title={NHOM_QUAN_TRI.cauHoi}>
          <span aria-hidden="true">{NHOM_QUAN_TRI.bieuTuong}</span> {NHOM_QUAN_TRI.nhan}
        </a>
      )}
      <div className="gv-ben-duoi">
        <a href={NHOM_CAI_DAT.the[0].href + q} aria-current={hien(NHOM_CAI_DAT.id)}>
          <span aria-hidden="true">{NHOM_CAI_DAT.bieuTuong}</span> {NHOM_CAI_DAT.nhan}
        </a>
        <details open={dang?.id === NHOM_NGHIEN_CUU.id}>
          <summary><span aria-hidden="true">{NHOM_NGHIEN_CUU.bieuTuong}</span> {NHOM_NGHIEN_CUU.nhan}</summary>
          <p className="gv-ben-ghi">Chỉ cần dùng cuối đợt.</p>
          {NHOM_NGHIEN_CUU.the.map((t) => <a key={t.href} href={t.href} aria-current={path === t.href ? 'page' : undefined}>{t.nhan}</a>)}
        </details>
      </div>
    </aside>
  );
}
