/**
 * FILE NÀY LÀM GÌ: Mô-đun TypeScript/JavaScript hỗ trợ xử lý dữ liệu và nghiệp vụ trong hệ thống FlipMath 9.
 * AI DÙNG: học sinh
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: không gọi mô-đun nội bộ khác
 */
import type { Metadata } from 'next';
import './globals.css';
import './mobile.css';

/**
 * LAYOUT GỐC — CỐ Ý KHÔNG GỌI SUPABASE.
 *
 * Bản trước gọi supabaseServer() ngay ở đây, và hậu quả là MỌI trang của site
 * đều thành trang động: không trang nào được dựng sẵn lúc build, mỗi lượt truy
 * cập đều phải chờ một vòng mạng tới Supabase.
 *
 * Với trang chủ thì đó là điều tệ nhất có thể: đây là trang người ngoài mở đầu
 * tiên, và là trang duy nhất KHÔNG cần biết người xem là ai. Khi layout gốc
 * không đụng tới Supabase, nhánh (cong-khai) được dựng sẵn lúc build —
 * phục vụ từ bộ nhớ đệm, không chạm cơ sở dữ liệu, và Supabase có sập thì
 * trang chủ vẫn hiện.
 *
 * Thanh điều hướng cần biết người dùng nên nó chuyển xuống (app)/layout.tsx.
 */

export const metadata: Metadata = {
  title: 'FlipMath9 — Lớp học đảo ngược Toán 9',
  description:
    'Lật ngược cách học, vững bước vào 10. Lớp học đảo ngược môn Toán 9 (Kết nối tri thức với cuộc sống).'
};

/**
 * Component React `RootLayout`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <head>
        <link rel="preload" href="/fonts/be-vietnam-pro-vietnamese-400-normal.woff2" as="font" type="font/woff2" crossOrigin="" />
        <link rel="stylesheet" href="/fonts/fonts.css" />
      </head>
      <body>{children}</body>
    </html>
  );
}
