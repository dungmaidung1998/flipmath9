/**
 * FILE NÀY LÀM GÌ: Component React giao diện hiển thị và xử lý tương tác của người dùng trên trình duyệt.
 * AI DÙNG: học sinh
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: @/components/MathText, @/components/NutDoc, @/lib/dfle/latex-hoa.js, @/lib/dfle/t9-ky-nang-nen.js
 */
import MathText from '@/components/MathText';
import NutDoc from '@/components/NutDoc';
import { latexHoa } from '@/lib/dfle/latex-hoa.js';
import { KY_NANG_NEN } from '@/lib/dfle/t9-ky-nang-nen.js';

/** THẺ ÔN NHANH 1 phút của một kỹ năng nền: công thức cần nhớ + một ví dụ (SPEC M2, M13). */
export default function OnNhanh({ ma, tieuDe = '⚡ Ôn nhanh 1 phút' }: { ma: string; tieuDe?: string }) {
  const k = (KY_NANG_NEN as Record<string, { ten: string; lop: number; congThuc: string; viDu: string }>)[ma];
  if (!k) return null;
  return (
    <div className="on-nhanh" role="note">
      <p className="on-nhanh__dau">{tieuDe} · <b>{k.ten}</b> <small>(Toán {k.lop})</small></p>
      <div className="on-nhanh__muc">
        <p className="on-nhanh__nhan"><b>Nhớ:</b></p>
        <div className="on-nhanh__nd"><MathText>{latexHoa(k.congThuc)}</MathText></div>
      </div>
      <div className="on-nhanh__muc">
        <p className="on-nhanh__nhan"><b>Ví dụ:</b></p>
        <div className="on-nhanh__nd"><MathText>{latexHoa(k.viDu)}</MathText></div>
      </div>
      <NutDoc text={`${k.ten}. Nhớ: ${latexHoa(k.congThuc)}. Ví dụ: ${latexHoa(k.viDu)}`} nhan="Đọc thẻ" />
    </div>
  );
}
