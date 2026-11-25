/**
 * FILE NÀY LÀM GÌ: Mô-đun TypeScript/JavaScript hỗ trợ xử lý dữ liệu và nghiệp vụ trong hệ thống FlipMath 9.
 * AI DÙNG: dùng chung
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: không gọi mô-đun nội bộ khác
 */
import fs from 'node:fs';
import path from 'node:path';

/**
 * TÌM ẢNH TRONG public/ — kiểm tra lúc dựng trang, không phải lúc chạy.
 *
 * Vì sao cần: trang chủ có chín chỗ đặt ảnh, và các ảnh đó được thêm dần.
 * Nếu viết thẳng <img src="/vong-lap.webp"> mà tệp chưa có thì người xem gặp
 * biểu tượng ảnh vỡ — xấu hơn hẳn so với không có ảnh nào. Hàm này cho phép
 * trang tự biết ảnh nào đã có: chưa có thì bỏ qua khối ảnh và trang vẫn đầy
 * đủ ý nghĩa, có rồi thì hiện lên, không phải sửa một dòng code nào.
 *
 * Ưu tiên .webp: script scripts/toi-uu-anh.py sinh ra bản .webp nhỏ hơn ảnh
 * gốc khoảng 15–25 lần. Chưa chạy script thì vẫn dùng được ảnh gốc.
 *
 * Hàm này chạy khi Next dựng trang. Ở chế độ `npm run dev` thì mỗi lần tải
 * lại là chạy lại, nên bỏ ảnh vào là thấy ngay. Ở bản dựng sẵn cho máy chủ
 * thì thêm ảnh xong phải `npm run build` lại.
 */

const THU_MUC = path.join(process.cwd(), 'public');
const DUOI_UU_TIEN = ['.webp', '.png', '.jpg', '.jpeg'];

/**
 * Hàm `timAnh`: nhận (tenKhongDuoi, duoiUuTien), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
export function timAnh(tenKhongDuoi: string, duoiUuTien = DUOI_UU_TIEN): string | null {
  for (const duoi of duoiUuTien) {
    const tuongDoi = tenKhongDuoi + duoi;
    try {
      if (fs.existsSync(path.join(THU_MUC, tuongDoi))) return '/' + tuongDoi;
    } catch {
      // Không đọc được thư mục thì coi như không có ảnh. Thiếu ảnh không bao
      // giờ được phép làm hỏng cả trang.
    }
  }
  return null;
}
