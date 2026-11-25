/**
 * FILE NÀY LÀM GÌ: Trang Next.js App Router trong khu vực học tập đã đăng nhập, nạp dữ liệu ban đầu và hiển thị giao diện tương tác.
 * AI DÙNG: học sinh
 * ĐỊA CHỈ TRÊN WEB: /hanh-trinh
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: @/lib/hanhTrinh, @/components/DauTrang, @/lib/minhHoa, @/lib/chuDeChuong
 */
import type { CSSProperties } from 'react';
import Link from 'next/link';
import { DANH_SACH, MAU } from '@/lib/hanhTrinh';
import DauTrang from '@/components/DauTrang';
import { hinhNhanVat } from '@/lib/minhHoa';
import { chuDeChuong } from '@/lib/chuDeChuong';
import '@/components/HanhTrinh/hanh-trinh.css';

const chuong = [
  'Phương trình và hệ hai phương trình bậc nhất hai ẩn',
  'Phương trình và bất phương trình bậc nhất một ẩn',
  'Căn bậc hai và căn bậc ba',
  'Hệ thức lượng trong tam giác vuông',
  'Đường tròn',
];

/**
 * Component React `TrangDanhSach`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export default function TrangDanhSach() {
  return (
    <main className="wrap">
      <DauTrang
        tieuDe="Hành trình giải bài"
        phu={`Chọn một trong ${DANH_SACH.length} câu thực tế để luyện phân tích đề và giải từng bước.`}
        hinh={hinhNhanVat('lo-trinh')}
        tranh="bai-hoc"
        canh="bien"
      />
      {chuong.map((ten, i) => {
        const cd = chuDeChuong(i + 1);
        return (
          <section
            key={ten}
            className="ht-nhom-chuong"
            style={cd ? ({ ['--mau-chuong' as string]: cd.mau } as CSSProperties) : undefined}
          >
            <h2 className="ht-nhom-chuong__tieu">
              <span>Chương {['I', 'II', 'III', 'IV', 'V'][i]}. {ten}</span>
              {cd && (
                <span className="chuong-chip" style={{ ['--ch' as string]: cd.mau } as CSSProperties}>
                  {cd.bieuTuong} 📍 {cd.ten} · {cd.chuDe}
                </span>
              )}
            </h2>
            <ul className="ht-danh-sach">
              {DANH_SACH.filter(id => id.startsWith('C' + (i + 1) + '-')).map(id => (
                <li key={id}>
                  <Link href={'/hanh-trinh/' + id}>
                    {MAU[id].ten}
                    <small>{id}</small>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </main>
  );
}
