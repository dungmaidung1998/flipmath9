/**
 * FILE NÀY LÀM GÌ: Mô-đun TypeScript/JavaScript hỗ trợ xử lý dữ liệu và nghiệp vụ trong hệ thống FlipMath 9.
 * AI DÙNG: giáo viên
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: không gọi mô-đun nội bộ khác
 */
/**
 * Điều hướng của giáo viên và quản trị trường.
 * Trang không có trong danh sách vẫn mở được bằng đường dẫn.
 */
export type The = { href: string; nhan: string };
export type Nhom = { id: string; nhan: string; bieuTuong: string; cauHoi: string; the: The[] };

export const NHOM_CHINH: Nhom[] = [
  { id: 'hom-nay', nhan: 'Hôm nay', bieuTuong: '🏠', cauHoi: 'Tiết tới cần làm gì, em nào cần mình ngay?',
    the: [{ href: '/gv', nhan: 'Hôm nay' }] },
  { id: 'tiet-day', nhan: 'Tiết dạy', bieuTuong: '📘', cauHoi: 'Chuẩn bị, dạy và xem lại một bài',
    the: [
      { href: '/gv/chuan-bi', nhan: 'Trước giờ' },
      { href: '/gv/goi-y-tiet', nhan: 'Trên lớp' },
      { href: '/gv/chia-nhom', nhan: 'Chia nhóm' },
      { href: '/gv/trinh-chieu', nhan: 'Trình chiếu' },
      { href: '/gv/de-kiem-tra', nhan: 'Đề kiểm tra' },
      { href: '/gv/quet-phieu', nhan: 'Quét phiếu QR' },
      { href: '/thi-nghiem', nhan: 'Thử tay' },
      { href: '/gv/tien-bo', nhan: 'Sau giờ' }
    ] },
  { id: 'hoc-sinh', nhan: 'Học sinh', bieuTuong: '👥', cauHoi: 'Từng em và so sánh các lớp',
    the: [
      { href: '/gv/lop', nhan: 'Cả lớp' },
      { href: '/gv/so-sanh-lop', nhan: 'So sánh lớp' },
      { href: '/gv/hoat-dong', nhan: 'Chăm chỉ theo tuần' },
      { href: '/gv/phan-tich-lop', nhan: 'Theo từng mục' }
    ] },
  { id: 'loi-nen', nhan: 'Lỗi & nền', bieuTuong: '🪤', cauHoi: 'Lớp còn mắc lỗi gì, hổng kiến thức nền nào',
    the: [
      { href: '/gv/soat-loi', nhan: 'Lỗi của lớp' },
      { href: '/gv/mat-goc', nhan: 'Mất gốc' },
      { href: '/gv/goi-y-ai', nhan: 'Gợi ý AI' },
      { href: '/gv/hoi-bin', nhan: 'Hỏi Bin' },
      { href: '/gv/cham-vo', nhan: 'Chấm vở AI' },
      { href: '/gv/kttx', nhan: 'KTTX trên giấy' }
    ] },
  { id: 'lich', nhan: 'Lịch & nội dung', bieuTuong: '📅', cauHoi: 'Giao bài, bật/tắt mục, video và câu hỏi',
    the: [
      { href: '/gv/lich-bai', nhan: 'Lịch giao bài' },
      { href: '/gv/chuong-trinh', nhan: 'Chương trình' },
      { href: '/gv/noi-dung', nhan: 'Video, nội dung' },
      { href: '/gv/cau-hoi', nhan: 'Câu hỏi' }
    ] }
];

export const NHOM_QUAN_TRI: Nhom = {
  id: 'quan-tri', nhan: 'Quản trị trường', bieuTuong: '🏫', cauHoi: 'Quản lý lớp, phân công giáo viên và so sánh toàn trường',
  the: [{ href: '/quan-tri', nhan: 'Quản trị trường' }]
};

export const NHOM_CAI_DAT: Nhom = {
  id: 'cai-dat', nhan: 'Cài đặt', bieuTuong: '⚙️', cauHoi: 'Lớp, tài khoản học sinh, kiểm tra hệ thống',
  the: [
    { href: '/gv/cai-dat-lop', nhan: 'Cài đặt lớp' },
    { href: '/gv/qua-tai', nhan: 'Giới hạn quá tải' },
    { href: '/gv/hoc-sinh', nhan: 'Tài khoản học sinh' },
    { href: '/gv/ai-minh-bach', nhan: 'Minh bạch AI' },
    { href: '/gv/tu-kiem-tra', nhan: 'Tự kiểm tra' }
  ]
};

export const NHOM_NGHIEN_CUU: Nhom = {
  id: 'nghien-cuu', nhan: 'Dữ liệu nghiên cứu', bieuTuong: '🔬', cauHoi: 'Chỉ cần dùng cuối đợt thực nghiệm',
  the: [
    { href: '/gv/du-lieu', nhan: 'Xuất dữ liệu' },
    { href: '/gv/do-luong', nhan: 'Số liệu đo' },
    { href: '/gv/do-chieu-cao', nhan: 'Đo chiều cao C4' },
    { href: '/gv/tu-luc', nhan: 'Chỉ số tự lực' },
    { href: '/gv/do-trung-thuc', nhan: 'Độ trung thực' },
    { href: '/gv/phan-tich', nhan: 'Phân tích nghiên cứu' },
    { href: '/gv/bang-chung', nhan: 'Bảng bằng chứng' },
    { href: '/gv/ho-tro', nhan: 'Hiệu quả hỗ trợ' },
    { href: '/gv/phan-hoi', nhan: 'Phản hồi gợi ý' },
    { href: '/gv/hoan-thanh', nhan: 'Hoàn thành học tập' },
    { href: '/nhat-ky', nhan: 'Sổ nhật ký' }
  ]
};

export const MOI_NHOM = [...NHOM_CHINH, NHOM_QUAN_TRI, NHOM_CAI_DAT, NHOM_NGHIEN_CUU];

/** Nhóm chứa đường dẫn (khớp cả trang con, ví dụ /gv/lop/mau01 thuộc nhóm có /gv/lop). */
export function nhomCua(path: string): Nhom | undefined {
  if (path === '/gv') return NHOM_CHINH[0];
  return MOI_NHOM.find((n) => n.the.some((t) => t.href !== '/gv' && (path === t.href || path.startsWith(t.href + '/'))));
}
