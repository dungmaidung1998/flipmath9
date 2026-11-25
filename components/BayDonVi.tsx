'use client';

/**
 * FILE NÀY LÀM GÌ: Component React giao diện hiển thị và xử lý tương tác của người dùng trên trình duyệt.
 * AI DÙNG: học sinh
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: @/lib/chuDeChuong
 */
import { useEffect, useState, type CSSProperties } from 'react';
import { chuDeChuong } from '@/lib/chuDeChuong';

/**
 * Hiệu ứng "+n {đơn vị tiến bộ} bay vào" theo chủ đề chương khi học sinh làm đúng câu.
 */
export default function BayDonVi({
  chuong,
  so = 1,
  triggerKey,
}: {
  chuong?: string | null;
  so?: number;
  triggerKey: number | string;
}) {
  const [hien, setHien] = useState(false);
  const cd = chuDeChuong(chuong);

  useEffect(() => {
    if (!cd || !(so > 0)) {
      setHien(false);
      return;
    }
    setHien(true);
    const id = window.setTimeout(() => setHien(false), 1600);
    return () => window.clearTimeout(id);
  }, [triggerKey, so, cd?.chuong]);

  if (!cd || !hien || !(so > 0)) return null;

  return (
    <span
      key={`${cd.chuong}-${triggerKey}`}
      className="bay-don-vi"
      role="status"
      aria-live="polite"
      style={{ ['--mau-chuong' as string]: cd.mau } as CSSProperties}
    >
      <i aria-hidden="true">{cd.bieuTuong}</i>
      <span>+{so} {cd.donVi}</span>
    </span>
  );
}
