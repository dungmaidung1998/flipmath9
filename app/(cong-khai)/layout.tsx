/**
 * FILE NÀY LÀM GÌ: Trang công khai (cho phép mở không cần tài khoản) kèm xử lý giới hạn dữ liệu an toàn riêng tư.
 * AI DÙNG: công khai / phụ huynh
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: không gọi mô-đun nội bộ khác
 */
import './trang-chu.css';

/**
 * Nhánh công khai: trang chủ và trang đăng nhập.
 *
 * KHÔNG gọi Supabase ở đây. Xem chú thích ở app/layout.tsx — đó là điều kiện
 * để trang chủ được dựng sẵn lúc build.
 *
 * Cũng không có thanh điều hướng của phần đã đăng nhập: trang chủ có header
 * riêng, còn trang đăng nhập thì không cần điều hướng gì.
 */
export default function CongKhaiLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
