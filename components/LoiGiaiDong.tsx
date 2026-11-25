'use client';

/**
 * FILE NÀY LÀM GÌ: Component React giao diện hiển thị và xử lý tương tác của người dùng trên trình duyệt.
 * AI DÙNG: học sinh
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: @/components/MathText, @/lib/formatMathDisplay
 */
import MathText from '@/components/MathText';
import { groupSolutionLines, renderKatexHtml } from '@/lib/formatMathDisplay';

/**
 * Hiển thị lời giải từng dòng: không đánh số 1. 2. 3.,
 * các dòng biến đổi liên tiếp có '=' ở đầu dòng sau được gộp thành một khối KaTeX aligned căn theo dấu '='.
 */
export default function LoiGiaiDong({
  dong,
  className,
}: {
  dong: string[];
  className?: string;
}) {
  const items = groupSolutionLines(dong);
  return (
    <div className={className ? `lg-ds ${className}` : 'lg-ds'}>
      {items.map((item, idx) =>
        item.kind === 'aligned' ? (
          <div key={idx} className="lg-aligned">
            <span
              className="math-block"
              dangerouslySetInnerHTML={{ __html: renderKatexHtml(item.latex, true) }}
            />
          </div>
        ) : (
          <div key={idx} className="lg-dong">
            <MathText>{item.text}</MathText>
          </div>
        )
      )}
    </div>
  );
}
