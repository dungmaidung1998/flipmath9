/**
 * FILE NÀY LÀM GÌ: Mô-đun TypeScript/JavaScript hỗ trợ xử lý dữ liệu và nghiệp vụ trong hệ thống FlipMath 9.
 * AI DÙNG: dùng chung
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: không gọi mô-đun nội bộ khác
 */
const ICON = {
  hoc: 'notebook',
  luyen: 'pen',
  choi: 'kite',
  kiem: 'stopwatch',
  loi: 'flashlight',
  thi: 'star',
};

/**
 * Hàm `loaiViec`: nhận (path), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
export function loaiViec(path: string | null): keyof typeof ICON {
  const muc = path?.split('/')[1];
  switch (muc) {
    case 'on-thi-10': return 'thi';
    case 'danh-gia': return 'kiem';
    case 'so-loi': return 'loi';
    case 'lap-nen':
    case 'kien-thuc-nen': return 'choi';
    case 'thi-nghiem':
    case 'phieu': return 'luyen';
    default: return path?.endsWith('/van-dung') ? 'luyen' : 'hoc';
  }
}

/**
 * Hàm `iconViec`: nhận (path), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
export function iconViec(path: string) {
  return `/fluent/${ICON[loaiViec(path)]}_3d.png`;
}