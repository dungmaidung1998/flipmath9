/**
 * FILE NÀY LÀM GÌ: Mô-đun TypeScript/JavaScript hỗ trợ xử lý dữ liệu và nghiệp vụ trong hệ thống FlipMath 9.
 * AI DÙNG: học sinh
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: không gọi mô-đun nội bộ khác
 */
import type { MetadataRoute } from 'next';

/**
 * Hàm `manifest(không cần tham số)`: xử lý dữ liệu đầu vào và trả kết quả.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'FlipMath9 — Lớp học đảo ngược Toán 9',
    short_name: 'FlipMath9',
    description: 'Lớp học đảo ngược môn Toán 9 (Kết nối tri thức với cuộc sống), hỗ trợ làm bài khi ít mạng.',
    start_url: '/bai-hoc',
    display: 'standalone',
    background_color: '#f7f9fc',
    theme_color: '#2d5fa8',
    lang: 'vi',
    icons: [
      {
        src: '/hero.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
