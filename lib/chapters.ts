/**
 * FILE NÀY LÀM GÌ: Mô-đun TypeScript/JavaScript hỗ trợ xử lý dữ liệu và nghiệp vụ trong hệ thống FlipMath 9.
 * AI DÙNG: dùng chung
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: không gọi mô-đun nội bộ khác
 */
/** Các chương Toán 9 — Kết nối tri thức với cuộc sống (FlipMath9). */
export const CHAPTERS = [
  { id: 'C1', label: 'Chương I', title: 'PHƯƠNG TRÌNH VÀ HỆ HAI PHƯƠNG TRÌNH BẬC NHẤT HAI ẨN' },
  { id: 'C2', label: 'Chương II', title: 'PHƯƠNG TRÌNH VÀ BẤT PHƯƠNG TRÌNH BẬC NHẤT MỘT ẨN' },
  { id: 'C3', label: 'Chương III', title: 'CĂN BẬC HAI VÀ CĂN BẬC BA' },
  { id: 'C4', label: 'Chương IV', title: 'HỆ THỨC LƯỢNG TRONG TAM GIÁC VUÔNG' },
  { id: 'C5', label: 'Chương V', title: 'ĐƯỜNG TRÒN' },
  { id: 'C6', label: 'Chương VI', title: 'HÀM SỐ y = ax² (a ≠ 0). PHƯƠNG TRÌNH BẬC HAI MỘT ẨN' },
  { id: 'C7', label: 'Chương VII', title: 'TẦN SỐ VÀ TẦN SỐ TƯƠNG ĐỐI' },
  { id: 'C8', label: 'Chương VIII', title: 'XÁC SUẤT CỦA BIẾN CỐ TRONG MỘT SỐ MÔ HÌNH XÁC SUẤT ĐƠN GIẢN' },
  { id: 'C9', label: 'Chương IX', title: 'ĐƯỜNG TRÒN NGOẠI TIẾP VÀ ĐƯỜNG TRÒN NỘI TIẾP' },
  { id: 'C10', label: 'Chương X', title: 'MỘT SỐ HÌNH KHỐI TRONG THỰC TIỄN' },
  { id: 'TN', label: 'Hoạt động', title: 'THỰC HÀNH TRẢI NGHIỆM' },
] as const;

// Mã đơn vị kiến thức dạng C3-B7-M1 (chương – bài – mục).
export function chapterOf(unitId: string): string | undefined {
  return CHAPTERS.find(c => unitId.startsWith(c.id + '-'))?.id;
}
