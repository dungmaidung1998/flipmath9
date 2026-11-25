/**
 * FILE NÀY LÀM GÌ: Trang công khai (cho phép mở không cần tài khoản) kèm xử lý giới hạn dữ liệu an toàn riêng tư.
 * AI DÙNG: công khai / phụ huynh
 * ĐỊA CHỈ TRÊN WEB: /dung-thu
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: không gọi mô-đun nội bộ khác
 */
/**
 * /dung-thu — bản dùng thử của MathFlip dùng lớp DEMO Toán 7, chưa có bản Toán 9.
 * Tạm chuyển về trang chủ cho tới khi có dữ liệu DEMO Toán 9.
 */
import { redirect } from 'next/navigation';

/**
 * Component React `DungThu`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export default function DungThu() {
  redirect('/');
}
