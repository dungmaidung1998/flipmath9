/**
 * FILE NÀY LÀM GÌ: Trang Next.js App Router trong khu vực học tập đã đăng nhập, nạp dữ liệu ban đầu và hiển thị giao diện tương tác.
 * AI DÙNG: học sinh
 * ĐỊA CHỈ TRÊN WEB: /hanh-trinh/[id]
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: @/components/HanhTrinh/HanhTrinh, @/components/DauTrang, @/lib/hanhTrinh, @/lib/chuDeChuong, @/lib/minhHoa
 */
import type { CSSProperties } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import HanhTrinh from '@/components/HanhTrinh/HanhTrinh';
import DauTrang from '@/components/DauTrang';
import { layHanhTrinh } from '@/lib/hanhTrinh';
import { chuDeChuong } from '@/lib/chuDeChuong';
import { hinhNhanVat } from '@/lib/minhHoa';

/**
 * Component React `TrangHanhTrinh`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export default function TrangHanhTrinh({ params }: { params: { id: string } }) {
  const data = layHanhTrinh(params.id);
  if (!data) notFound();
  const cd = chuDeChuong(data.id);
  return (
    <main
      className={cd ? 'wrap trang-chuong' : 'wrap'}
      style={cd ? ({ ['--mau-chuong' as string]: cd.mau } as CSSProperties) : undefined}
    >
      <p style={{ marginBottom: 10 }}><Link className="action-link" href="/hanh-trinh">← Danh sách hành trình</Link></p>
      <DauTrang
        tieuDe={data.ten}
        phu={`Hành trình giải bài · ${data.id}`}
        chuong={data.id}
        nhanVat="bin"
        hinh={hinhNhanVat('lo-trinh')}
      />
      <HanhTrinh key={data.id} data={data} hienDe/>
    </main>
  );
}
