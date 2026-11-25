/**
 * FILE NÀY LÀM GÌ: Mô-đun TypeScript/JavaScript hỗ trợ xử lý dữ liệu và nghiệp vụ trong hệ thống FlipMath 9.
 * AI DÙNG: dùng chung
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: không gọi mô-đun nội bộ khác
 */
/**
 * Hình minh hoạ vẽ bằng máy (three.js, xem code/do-hoa-3d). Tất cả chỉ để trang trí: alt rỗng.
 * - /minh-hoa/chuong/<C1..C10|TN>.webp : thẻ chương
 * - /minh-hoa/bai/<B1..B32|LTC3>.webp  : thẻ bài và đầu trang mục học
 * - /minh-hoa/nv/<tên>.webp            : bạn học sinh ở các trang
 */
export type NhanVat = 'chao' | 'di-hoc' | 'suy-nghi' | 'xem-video' | 'reo-ho' | 'doc-sach' | 'cup' | 'kinh-lup' | 'van-dung' | 'goi-y' | 'lo-trinh';

export const hinhNhanVat = (ten: NhanVat) => `/minh-hoa/nv/${ten}.webp`;

/** "Bài 6. Bất phương trình…" → /minh-hoa/bai/B6.webp; "Luyện tập chung … chương III" → LTC3. */
export function hinhBai(tenBai?: string | null): string | null {
  const s = String(tenBai ?? '');
  // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
  const m = s.match(/^Bài\s+(\d+)/);
  if (m && +m[1] >= 1 && +m[1] <= 32) return `/minh-hoa/bai/B${m[1]}.webp`;
  // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
  if (/^Luyện tập chung/.test(s) && /III\b/.test(s)) return '/minh-hoa/bai/LTC3.webp';
  return null;
}
