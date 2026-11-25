'use client';

/**
 * FILE NÀY LÀM GÌ: Component React giao diện hiển thị và xử lý tương tác của người dùng trên trình duyệt.
 * AI DÙNG: học sinh
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: ./MathText, @/lib/normalizeMathText, @/lib/formatMathDisplay, @/lib/goiYDocDe
 */
import { useMemo, useState } from 'react';
import MathText from './MathText';
import { normalizeMathText } from '@/lib/normalizeMathText';
import { renderKatexHtml } from '@/lib/formatMathDisplay';
import { goiYDocDe } from '@/lib/goiYDocDe';

/**
 * Component React `DeCauHoi`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export default function DeCauHoi({ text }: { text: string }) {
  const [bat, datBat] = useState(false);
  const { loai, doan } = useMemo(() => goiYDocDe(normalizeMathText(text)), [text]);
  return (
    <span className="cau-noi-dung">
      {bat ? (
        doan.map(({ text: part, math, block, gach }, i) =>
          math ? (
            block ? (
              <span
                key={i}
                className="math-block"
                dangerouslySetInnerHTML={{ __html: renderKatexHtml(part, true) }}
              />
            ) : (
              <span
                key={i}
                className="math-inline"
                dangerouslySetInnerHTML={{ __html: renderKatexHtml(part, false) }}
              />
            )
          ) : gach ? (
            <mark key={i} className="cau-tu-khoa">
              {part}
            </mark>
          ) : (
            <span key={i}>{part}</span>
          )
        )
      ) : (
        <MathText>{text}</MathText>
      )}
      {loai.size > 0 && (
        <span className="cau-doc-de">
          <button
            type="button"
            className="nut-keo--phu"
            aria-pressed={bat}
            onClick={() => datBat(!bat)}
          >
            💡 Gợi ý đọc đề
          </button>
          {bat && loai.has('mau') && <small>🔍 Mẫu số phải khác 0</small>}
          {bat && loai.has('can') && <small>🔍 Biểu thức dưới căn ≥ 0</small>}
        </span>
      )}
    </span>
  );
}
