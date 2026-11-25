/**
 * FILE NÀY LÀM GÌ: Mô-đun TypeScript/JavaScript hỗ trợ xử lý dữ liệu và nghiệp vụ trong hệ thống FlipMath 9.
 * AI DÙNG: dùng chung
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: ./mau
 */
import { bai, buoc, so } from './mau';

const theTich = 1000;
export const chuong3 = {
  'C3-B10-M1-Q15': bai('Thùng nước hình lập phương', 'x là độ dài cạnh thùng', 'dm', 'x > 0',
    ['Thùng có dạng hình lập phương', 'Thể tích chứa đầy là 1 000 dm³'],
    [buoc('x³ = 1 000', 'x² = 1 000', '3x = 1 000', 'Hình lập phương cạnh x có thể tích V = x · x · x = x³.', 0, 1)],
    'Lấy căn bậc ba của 1 000. Kiểm tra 10 · 10 · 10 = 1 000.', () => so(Math.cbrt(theTich)) + ' dm'),
};

