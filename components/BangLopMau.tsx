'use client';
/**
 * FILE NÀY LÀM GÌ: Component React giao diện hiển thị và xử lý tương tác của người dùng trên trình duyệt.
 * AI DÙNG: học sinh
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: không gọi mô-đun nội bộ khác
 */
import { useSearchParams } from 'next/navigation';

/**
 * Dải báo LỚP MẪU (dữ liệu giả lập). Giáo viên: hiện khi đang chọn lớp nhóm DEMO (tham số ?lop=).
 * Học sinh mẫu: luôn hiện (laHocSinhMau). Không để ai nhầm dữ liệu giả lập là dữ liệu thật.
 */
export default function BangLopMau({ lopMau, laHocSinhMau = false }: { lopMau: string[]; laHocSinhMau?: boolean }) {
  const sp = useSearchParams();
  const lop = sp.get('lop');
  if (!laHocSinhMau && !(lop && lopMau.includes(lop))) return null;
  return (
    <div className="bang-lop-mau" role="note">
      {laHocSinhMau
        ? 'Tài khoản của lớp mẫu: mọi bài làm, điểm và lỗi ở đây là dữ liệu giả lập để xem thử tính năng.'
        : 'Đang xem LỚP MẪU: 40 học sinh và mọi số liệu là dữ liệu giả lập để xem thử tính năng, không phải kết quả thật.'}
    </div>
  );
}
