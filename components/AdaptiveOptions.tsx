'use client';

/**
 * FILE NÀY LÀM GÌ: Component React giao diện hiển thị và xử lý tương tác của người dùng trên trình duyệt.
 * AI DÙNG: học sinh
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: không gọi mô-đun nội bộ khác
 */
import { ReactNode, useLayoutEffect, useRef, useState } from 'react';

/** Measure rendered text and math, rather than the length of the LaTeX source. */
export default function AdaptiveOptions({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [columns, setColumns] = useState(1);

  useLayoutEffect(() => {
    const grid = ref.current;
    if (!grid) return;
    let disposed = false;
    const measure = () => {
      if (disposed) return;
      const gap = parseFloat(getComputedStyle(grid).columnGap) || 0;
      const widths = Array.from(grid.querySelectorAll<HTMLElement>('.opt')).map(option => {
        const style = getComputedStyle(option);
        const spacing = ['paddingLeft', 'paddingRight', 'borderLeftWidth', 'borderRightWidth']
          .reduce((sum, key) => sum + (parseFloat(style.getPropertyValue(key.replace(/[A-Z]/g, c => `-${c.toLowerCase()}`))) || 0), 0);
        const parts = Array.from(option.children).map(child => {
          const element = child as HTMLElement;
          const content = element.querySelector<HTMLElement>('.answer-content') || element;
          const css = getComputedStyle(element);
          return content.getBoundingClientRect().width + (parseFloat(css.marginLeft) || 0) + (parseFloat(css.marginRight) || 0);
        });
        return spacing + parts.reduce((a, b) => a + b, 0) + (parts.length - 1) * (parseFloat(style.columnGap) || 0);
      });
      // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
      const needed = Math.ceil(Math.max(0, ...widths)) + 2;
      setColumns([4, 2, 1].find(count => count * needed + (count - 1) * gap <= grid.clientWidth) || 1);
    };
    const observer = new ResizeObserver(measure);
    observer.observe(grid);
    grid.querySelectorAll('.answer-content').forEach(element => observer.observe(element));
    document.fonts.ready.then(measure);
    document.fonts.addEventListener('loadingdone', measure);
    measure();
    return () => {
      disposed = true;
      observer.disconnect();
      document.fonts.removeEventListener('loadingdone', measure);
    };
  }, [children]);

  return <div ref={ref} className="options-grid quiz-options" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>{children}</div>;
}
