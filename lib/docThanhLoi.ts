/**
 * FILE NÀY LÀM GÌ: Mô-đun TypeScript/JavaScript hỗ trợ xử lý dữ liệu và nghiệp vụ trong hệ thống FlipMath 9.
 * AI DÙNG: dùng chung
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: ./latexSangChu
 */
import { latexSangChu } from './latexSangChu';

/**
 * Đổi đề bài (có công thức) thành câu tiếng Việt để giọng đọc của trình duyệt đọc to.
 * Không cần chính xác tuyệt đối như giáo viên đọc, chỉ cần các em nghe hiểu ký hiệu.
 */
const KY: [RegExp, string][] = [
  [/(\w|\))²/g, '$1 bình phương'], [/(\w|\))³/g, '$1 lập phương'],
  [/∛\(([^()]+)\)/g, ' căn bậc ba của $1 '], [/∛(\w+)/g, ' căn bậc ba của $1 '],
  [/√\(([^()]+)\)/g, ' căn của $1 '], [/√(\w+)/g, ' căn $1 '],
  [/(\d+)\/(\d+)/g, '$1 phần $2'], [/([a-zA-Z])\/([\w]+)/g, '$1 chia $2'],
  [/≤/g, ' nhỏ hơn hoặc bằng '], [/≥/g, ' lớn hơn hoặc bằng '], [/≠/g, ' khác '],
  [/⇔/g, ' tương đương '], [/⇒/g, ' suy ra '], [/≈/g, ' xấp xỉ '], [/∈/g, ' thuộc '], [/⊥/g, ' vuông góc với '],
  [/±/g, ' cộng trừ '], [/×|·/g, ' nhân '], [/(\d|\))\s*:\s*(?=\d|\(|[a-zA-Z](?![a-zA-Zà-ỹđ]))/g, '$1 chia '], [/=/g, ' bằng '], [/</g, ' nhỏ hơn '], [/>/g, ' lớn hơn '],
  [/\+/g, ' cộng '], [/[−-]/g, ' trừ '],
  [/°/g, ' độ'], [/π/g, ' pi '], [/α/g, ' an pha '], [/β/g, ' bê ta '], [/Δ/g, ' đen ta '], [/%/g, ' phần trăm'],
  [/ℝ/g, ' tập số thực '], [/\(\s*/g, ' mở ngoặc '], [/\s*\)/g, ' đóng ngoặc '], [/_/g, ' '], [/\{|\}/g, ' ']
];

/**
 * Hàm `docThanhLoi`: nhận (s), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
export function docThanhLoi(s: string): string {
  // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
  let t = latexSangChu(s).replace(/\*\*|__/g, '');
  // Dấu ";" trong toạ độ (a; b) đọc thành "phẩy".
  // Dấu trừ đứng đầu, sau ngoặc mở hoặc sau dấu so sánh là số âm.
  t = t.replace(/(^|[(=<>≤≥≠,;]\s*)[−-]\s*/g, '$1 âm ');
  // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
  t = t.replace(/\(([^();]+);([^();]+)\)/g, ' $1 phẩy $2 ');
  // Ngoặc chứa lời văn (đơn vị, chú thích) chỉ ngắt hơi, không đọc "mở ngoặc".
  t = t.replace(/\(([^()]*[a-zà-ỹđ]{2,}[^()]*|\s*(?:cm|dm|mm|km|m|kg|g|h)[²³]?\s*)\)/giu, ', $1,');
  for (const [re, thay] of KY) t = t.replace(re, thay);
  // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
  return t.replace(/\s+/g, ' ').trim();
}
