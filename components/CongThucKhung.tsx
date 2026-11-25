/**
 * FILE NÀY LÀM GÌ: Component React giao diện hiển thị và xử lý tương tác của người dùng trên trình duyệt.
 * AI DÙNG: học sinh
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: @/components/MathText
 */
import MathText from '@/components/MathText';

/**
 * Hiển thị nội dung Vi bài học theo chuẩn trình bày Toán:
 * mỗi câu một dòng, công thức khối tự căn giữa (trong khung nhẹ ở Vi bài học), chữ thường không đóng khung.
 */
export default function CongThucKhung({ text }: { text: string }) {
  return <MathText>{text}</MathText>;
}
