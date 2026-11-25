'use client';

/**
 * FILE NÀY LÀM GÌ: Component React giao diện hiển thị và xử lý tương tác của người dùng trên trình duyệt.
 * AI DÙNG: học sinh
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: @/lib/mauHocSinh, @/lib/chapters, @/lib/diaDanh, ./tro-choi-nen/amThanh
 */
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { CSSProperties, MouseEvent, ReactNode } from 'react';
import { loaiViec } from '@/lib/mauHocSinh';
import { chapterOf } from '@/lib/chapters';
import { DIA_DANH } from '@/lib/diaDanh';
import { phat } from './tro-choi-nen/amThanh';

/**
 * Component React `amNutKeo`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
function amNutKeo(event: MouseEvent<HTMLDivElement>) {
  if (!(event.target instanceof Element)) return;
  const nut = event.target.closest('.nut-keo, button.primary, .dn-de-xuat .action-link');
  if (nut && !nut.matches(':disabled, [aria-disabled="true"]')) phat('keo');
}

const MAU_GIAY = ['#2478c4', '#ffb775', '#207442', '#d9bcff', '#ffdf74', '#ffaaa7'];

/**
 * Component React `PhaoGiay`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
function PhaoGiay({ path }: { path: string | null }) {
  const [luot, datLuot] = useState(0);
  useEffect(() => {
    let hen: number | undefined;
    const hien = () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      window.clearTimeout(hen);
      datLuot(n => n + 1);
      hen = window.setTimeout(() => datLuot(0), 900);
    };
    datLuot(0);
    window.addEventListener('f9-buoc-xong', hien);
    window.addEventListener('f9-nop-bai-xong', hien);
    return () => {
      window.removeEventListener('f9-buoc-xong', hien);
      window.removeEventListener('f9-nop-bai-xong', hien);
      window.clearTimeout(hen);
    };
  }, [path]);

  if (!luot) return null;
  return (
    <div key={luot} className="hs-phao-giay" aria-hidden="true">
      {Array.from({ length: 16 }, (_, i) => (
        <i key={i} style={{
          '--giay-x': `${(i - 7.5) * 11}px`,
          '--giay-y': `${25 + (i % 4) * 5}vh`,
          '--giay-mau': MAU_GIAY[i % MAU_GIAY.length],
        } as CSSProperties} />
      ))}
    </div>
  );
}

/**
 * Component React `KhungMauHS`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export default function KhungMauHS({ children }: { children: ReactNode }) {
  const path = usePathname();
  const viec = loaiViec(path);
  const [, muc, ma] = path?.split('/') ?? [];
  // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
  const chuong = ma && /^(bai-hoc|hoc|tien-do|hanh-trinh|thi-nghiem|phieu)$/.test(muc)
    ? (chapterOf(ma) ?? ma)
    : '';
  const mau = DIA_DANH[chuong]?.mau;
  const style = mau ? { '--mau-chuong': mau } as CSSProperties : undefined;
  return <div className="hs-mau" style={style} data-viec={viec} onClickCapture={amNutKeo}>{children}<PhaoGiay path={path} /></div>;
}