/**
 * FILE NÀY LÀM GÌ: Mô-đun TypeScript/JavaScript hỗ trợ xử lý dữ liệu và nghiệp vụ trong hệ thống FlipMath 9.
 * AI DÙNG: giáo viên
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: không gọi mô-đun nội bộ khác
 */
/** Ngưỡng GV chỉnh được ở Cài đặt lớp: khoảng cho phép, nhãn, đơn vị hiển thị. */
export const KHOANG: Record<string, [number, number]> = {
  soKyNangHong: [1, 10], tiLeNenBaiSapDay: [0.1, 1],
  videoToiThieu: [0.1, 1], soBaiChuaLam: [1, 10], giayMoiCau: [3, 60], diemDoanBua: [1, 10], soNgayVang: [1, 14], soNgayXet: [7, 60],
  tienBoRo: [0.5, 1], coTienBo: [0.1, 0.9]
};

export const NHOM_NGUONG: { tieuDe: string; muc: { k: string; nhan: string; phanTram?: boolean; donVi?: string }[] }[] = [
  { tieuDe: '🔴 Khối B · Nguy cơ do hổng nền (HS thoả một trong hai)', muc: [
    { k: 'soKyNangHong', nhan: 'Số phần kiến thức nền hổng trong chương, từ', donVi: 'phần' },
    { k: 'tiLeNenBaiSapDay', nhan: 'Hoặc tỉ lệ kiến thức nền của bài sắp dạy bị hổng, từ', phanTram: true }
  ] },
  { tieuDe: '🟠 Khối C · Học chưa chăm (một trong các dấu hiệu)', muc: [
    { k: 'videoToiThieu', nhan: 'Thời gian xem video thực trung bình dưới', phanTram: true },
    { k: 'soBaiChuaLam', nhan: 'Chưa làm từ', donVi: 'bài' },
    { k: 'giayMoiCau', nhan: 'Làm phiếu nhanh hơn', donVi: 'giây/câu' },
    { k: 'diemDoanBua', nhan: '…mà điểm dưới', donVi: 'điểm' },
    { k: 'soNgayVang', nhan: 'Đang có bài mở mà không vào web từ', donVi: 'ngày' },
    { k: 'soNgayXet', nhan: 'Xét trong', donVi: 'ngày gần nhất' }
  ] },
  { tieuDe: '📈 Nhóm HS ở màn Tiến bộ', muc: [
    { k: 'tienBoRo', nhan: '🚀 Tiến bộ rõ khi khắc phục từ', phanTram: true },
    { k: 'coTienBo', nhan: '➡ Có tiến bộ khi khắc phục từ', phanTram: true }
  ] }
];
