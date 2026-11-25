/**
 * FILE NÀY LÀM GÌ: Mô-đun TypeScript/JavaScript hỗ trợ xử lý dữ liệu và nghiệp vụ trong hệ thống FlipMath 9.
 * AI DÙNG: dùng chung
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: không gọi mô-đun nội bộ khác
 */
/**
 * 4 CẤP ĐỘ "HÀNH TRÌNH LÊN LỚP 10" theo SPEC M3.1: Hạt Mầm → Chồi Xanh → Đại Thụ → Đỉnh Sao.
 * Cấp k (1–4) ứng với mức độ câu hỏi; mức làm chủ m (0–3) của em hiển thị là cấp m + 1.
 * Phía giáo viên vẫn giữ tên chuyên môn (Chưa vững, Đang củng cố, Đạt yêu cầu, Thành thạo).
 */
export const CAP_DO = [
  { ten: 'Hạt Mầm', en: 'Seed', bieuTuong: '🌱', mucDo: 'Nhận biết', mau: '#4a7a12', nen: '#eef8dc', y: 'Em nhận biết được kiến thức. Luyện tiếp để lên Chồi Xanh.' },
  { ten: 'Chồi Xanh', en: 'Sprout', bieuTuong: '🌿', mucDo: 'Thông hiểu', mau: '#0f766e', nen: '#dcf5f1', y: 'Em hiểu bài và làm được bài cơ bản.' },
  { ten: 'Đại Thụ', en: 'Oak', bieuTuong: '🌳', mucDo: 'Vận dụng', mau: '#1e5631', nen: '#dff0e4', y: 'Em vận dụng được kiến thức vào bài toán.' },
  { ten: 'Đỉnh Sao', en: 'Star Summit', bieuTuong: '⭐', mucDo: 'Vận dụng cao', mau: '#6b3fa0', nen: '#f6eecd', y: 'Em giải được bài vận dụng cao, dạng đề thi vào 10.' }
] as const;

/**
 * Hàm `tenCapDo`: nhận (m), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
export function tenCapDo(m: number | null | undefined): string {
  return m == null || !CAP_DO[m] ? 'Chưa đủ dữ liệu' : `${CAP_DO[m].bieuTuong} ${CAP_DO[m].ten}`;
}

/** Tên cấp theo mức độ câu hỏi (1–4): dùng cho nhãn câu hỏi. */
export function tenCapCau(level: number): string {
  const c = CAP_DO[level - 1];
  return c ? `${c.bieuTuong} ${c.ten}` : '';
}
