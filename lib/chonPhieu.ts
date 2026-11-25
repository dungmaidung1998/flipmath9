/**
 * FILE NÀY LÀM GÌ: Mô-đun TypeScript/JavaScript hỗ trợ xử lý dữ liệu và nghiệp vụ trong hệ thống FlipMath 9.
 * AI DÙNG: dùng chung
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: @/lib/tronPhuongAn
 */
/**
 * CHỌN CÂU CHO PHIẾU HỌC TẬP (bước 📝 trước giờ) — 22/11/2026.
 * Ngân hàng mỗi mục có thể lớn hơn phiếu (Chương IV: 13 câu mức 1–3). Phiếu chỉ lấy tối đa 10 câu:
 * 3 câu 🌱 + 4 câu 🌿 + 3 câu 🌳; mức nào thiếu thì bù bằng mức khác.
 * Lựa chọn CỐ ĐỊNH theo (hạt giống người học, mã câu) để trang phát đề và API chấm bài ra cùng một đề.
 * Ngân hàng ≤ 10 câu (các chương 8 câu/mục) → lấy tất cả, như trước.
 */
import { bam } from '@/lib/tronPhuongAn';

export const SO_CAU_PHIEU = 10;
const HAN_MUC: Record<number, number> = { 1: 3, 2: 4, 3: 3 };

/**
 * Hàm `chonPhieu`: nhận (nganHang, hat), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
export function chonPhieu<Q extends { question_id: string; level: number }>(nganHang: Q[], hat: string): Q[] {
  if (nganHang.length <= SO_CAU_PHIEU) return nganHang;
  const xep = [...nganHang].sort((a, b) => bam(hat + '|' + a.question_id) - bam(hat + '|' + b.question_id));
  const chon: Q[] = [];
  for (const [muc, n] of Object.entries(HAN_MUC)) chon.push(...xep.filter((q) => q.level === Number(muc)).slice(0, n));
  for (const q of xep) { if (chon.length >= SO_CAU_PHIEU) break; if (!chon.includes(q)) chon.push(q); }
  return chon.sort((a, b) => a.level - b.level || a.question_id.localeCompare(b.question_id));
}
