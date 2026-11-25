/**
 * FILE NÀY LÀM GÌ: Mô-đun TypeScript/JavaScript hỗ trợ xử lý dữ liệu và nghiệp vụ trong hệ thống FlipMath 9.
 * AI DÙNG: dùng chung
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: @/lib/dfle/t9-cau-hoi-en.js, @/lib/dfle/latex-hoa.js
 */
/**
 * GẮN BẢN TIẾNG ANH VÀO CÂU HỎI (đề xuất §5 — 22/11/2026). Chạy ở máy chủ, trước khi trộn phương án.
 * Câu chưa có bản dịch thì giữ nguyên (không có trường `en`). Tiếng Việt luôn là bản chính khi chấm điểm.
 */
// @ts-ignore — bộ máy viết bằng JavaScript thuần
import { cauHoiEn, phuongAnEn } from '@/lib/dfle/t9-cau-hoi-en.js';
// @ts-ignore
import { latexHoa } from '@/lib/dfle/latex-hoa.js';

type CoPhuongAn = { question_id: string; options: { option_key: string; option_text: string }[] };

/**
 * Hàm `themTiengAnh`: nhận (cau), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
export function themTiengAnh<Q extends CoPhuongAn>(cau: Q[]): (Q & { en?: string })[] {
  return cau.map((q) => {
    const en = cauHoiEn(q.question_id) as { stem: string; opts?: Record<string, string> } | null;
    if (!en) return q;
    return {
      ...q,
      en: latexHoa(en.stem) as string,
      options: q.options.map((o) => {
        const tu = en.opts?.[o.option_key];
        const enText = tu ? (latexHoa(tu) as string) : (phuongAnEn(q.question_id, o.option_key, o.option_text) as string | null);
        return enText ? { ...o, en: enText } : o;
      })
    };
  });
}
