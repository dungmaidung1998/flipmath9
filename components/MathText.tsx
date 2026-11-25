'use client';

/**
 * FILE NÀY LÀM GÌ: Component React giao diện hiển thị và xử lý tương tác của người dùng trên trình duyệt.
 * AI DÙNG: học sinh
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: @/lib/formatMathDisplay, @/lib/normalizeMathText
 */
import { useMemo } from 'react';
import { formatMathNodes, renderKatexHtml, type MathNode } from '@/lib/formatMathDisplay';
import { normalizeMathText } from '@/lib/normalizeMathText';

/** Hiển thị chuỗi có công thức LaTeX inline ($...$) hoặc block ($$...$$), tự động ngắt câu và căn giữa công thức khối. */
export default function MathText({
  children,
  inline = false,
}: {
  children: string | null | undefined;
  inline?: boolean;
}) {
  const value = children ?? '';
  const { nodes, isMulti } = useMemo(() => {
    const normalized = normalizeMathText(value);
    return formatMathNodes(normalized, { inline });
  }, [value, inline]);

  const renderInlineNode = (
    node: Extract<MathNode, { type: 'text' | 'inline-math' }>,
    key: string | number
  ) => {
    if (node.type === 'text') {
      return <span key={key}>{node.value}</span>;
    }
    return (
      <span
        key={key}
        className={node.scroll ? 'math-inline math-inline--scroll' : 'math-inline'}
        dangerouslySetInnerHTML={{ __html: renderKatexHtml(node.math, false) }}
      />
    );
  };

  if (!isMulti) {
    return (
      <span className="math-text">
        {nodes.map((node, index) => {
          if (node.type === 'text' || node.type === 'inline-math') {
            return renderInlineNode(node, index);
          }
          if (node.type === 'block-math') {
            return (
              <span
                key={index}
                className="math-block"
                dangerouslySetInnerHTML={{ __html: renderKatexHtml(node.math, true) }}
              />
            );
          }
          return null;
        })}
      </span>
    );
  }

  const blocks: Array<
    | { kind: 'line'; items: Extract<MathNode, { type: 'text' | 'inline-math' }>[] }
    | { kind: 'block'; math: string }
  > = [];
  let currentLine: Extract<MathNode, { type: 'text' | 'inline-math' }>[] = [];

  const flushLine = () => {
    if (!currentLine.length) return;
    const last = currentLine[currentLine.length - 1];
    if (last.type === 'text') {
      // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
      const trimmed = last.value.replace(/[ \t]+$/, '');
      if (trimmed) currentLine[currentLine.length - 1] = { type: 'text', value: trimmed };
      else currentLine.pop();
    }
    if (currentLine.length > 0) {
      blocks.push({ kind: 'line', items: currentLine });
    }
    currentLine = [];
  };

  for (const node of nodes) {
    if (node.type === 'break') {
      flushLine();
    } else if (node.type === 'block-math') {
      flushLine();
      blocks.push({ kind: 'block', math: node.math });
    } else if (currentLine.length === 0 && node.type === 'text') {
      // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
      const trimmed = node.value.replace(/^[ \t]+/, '');
      if (trimmed) currentLine.push({ type: 'text', value: trimmed });
    } else {
      currentLine.push(node);
    }
  }
  flushLine();

  return (
    <span className="math-text math-text--multi">
      {blocks.map((b, idx) =>
        b.kind === 'block' ? (
          <span
            key={idx}
            className="math-block"
            dangerouslySetInnerHTML={{ __html: renderKatexHtml(b.math, true) }}
          />
        ) : (
          <span key={idx} className="math-line">
            {b.items.map((item, j) => renderInlineNode(item, `${idx}-${j}`))}
          </span>
        )
      )}
    </span>
  );
}
