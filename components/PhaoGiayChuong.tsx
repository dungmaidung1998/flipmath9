'use client';

/**
 * FILE NÀY LÀM GÌ: Component React giao diện hiển thị và xử lý tương tác của người dùng trên trình duyệt.
 * AI DÙNG: học sinh
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: không gọi mô-đun nội bộ khác
 */
import type { CSSProperties } from 'react';

/** Pháo giấy theo màu chủ đề chương; tự ẩn khi người dùng bật prefers-reduced-motion. */
export default function PhaoGiayChuong({
  mau,
  active = true,
  count = 18,
}: {
  mau: string;
  active?: boolean;
  count?: number;
}) {
  if (!active) return null;

  const tones = [
    mau,
    `color-mix(in srgb, ${mau} 65%, #ffd76a)`,
    `color-mix(in srgb, ${mau} 55%, #ffffff)`,
    '#ffd166',
    `color-mix(in srgb, ${mau} 80%, #ff8fab)`,
  ];

  return (
    <div className="lc-phao" aria-hidden="true" style={{ ['--mau-chuong' as string]: mau } as CSSProperties}>
      {Array.from({ length: count }, (_, i) => {
        const left = `${((i * 19 + 7) % 92) + 4}%`;
        const delay = `${(i % 6) * 0.14}s`;
        const dur = `${2.2 + (i % 4) * 0.35}s`;
        const dx = `${((i % 5) - 2) * 18}px`;
        return (
          <i
            key={i}
            style={{
              left,
              background: tones[i % tones.length],
              animationDelay: delay,
              animationDuration: dur,
              ['--dx' as string]: dx,
            } as CSSProperties}
          />
        );
      })}
    </div>
  );
}
