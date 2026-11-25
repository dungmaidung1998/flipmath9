/**
 * FILE NÀY LÀM GÌ: Mô-đun TypeScript/JavaScript hỗ trợ xử lý dữ liệu và nghiệp vụ trong hệ thống FlipMath 9.
 * AI DÙNG: dùng chung
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: không gọi mô-đun nội bộ khác
 */
/**
 * TRỘN THỨ TỰ PHƯƠNG ÁN (đề xuất §0, 22/11/2026)
 * Ngân hàng câu lưu đáp án đúng ở phương án A. Nếu hiển thị nguyên thứ tự, học sinh đoán ra "luôn chọn A".
 * - Thứ tự trộn CỐ ĐỊNH theo (hạt giống người học, mã câu): cùng một em mở lại thấy y như cũ, hai em khác nhau thấy khác.
 * - Chữ cái hiển thị (`nhan`) theo vị trí mới: A, B, C, D.
 * - Bài nộp vẫn gửi `option_key` GỐC → phần chấm điểm, bảng mã lỗi (distractor_errors) KHÔNG phải sửa.
 * - Phiếu in và màn nội dung của giáo viên KHÔNG dùng hàm này (giữ thứ tự gốc, có đáp án).
 */
const NHAN = 'ABCDEFGH';

/**
 * Hàm `bam`: nhận (s), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
export function bam(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
/**
 * Hàm `ngauNhien`: nhận (hat), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
function ngauNhien(hat: number) {
  let a = hat;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type CoNhan = { nhan?: string };

/**
 * Hàm `tronPhuongAn`: nhận (options, hat, maCau), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
export function tronPhuongAn<T extends { option_key: string }>(options: T[], hat: string, maCau: string): (T & { nhan: string })[] {
  const a = [...options].sort((x, y) => x.option_key.localeCompare(y.option_key));
  const r = ngauNhien(bam(hat + '|' + maCau));
  // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a.map((o, i) => ({ ...o, nhan: NHAN[i] ?? o.option_key }));
}

/**
 * Hàm `tronCauHoi`: nhận (cau, hat), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
export function tronCauHoi<Q extends { question_id: string; options: { option_key: string }[] }>(cau: Q[], hat: string) {
  return cau.map((q) => ({ ...q, options: tronPhuongAn(q.options, hat, q.question_id) }));
}

/** Chữ cái đang hiển thị của một phương án gốc (dùng khi báo "em chọn …, đáp án đúng …"). */
export function nhanCua(options: { option_key: string; nhan?: string }[], key: string | null | undefined): string {
  if (!key) return '';
  return options.find((o) => o.option_key === key)?.nhan ?? key;
}
