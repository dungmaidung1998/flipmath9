/**
 * FILE NÀY LÀM GÌ: Component React giao diện hiển thị và xử lý tương tác của người dùng trên trình duyệt.
 * AI DÙNG: học sinh
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: @/lib/qrCode
 */
import { taoMaTranQR } from '@/lib/qrCode';

/**
 * Hiển thị mã QR dưới dạng SVG sắc nét (không cần thư viện ngoài, dùng được cả ở máy chủ và trình duyệt).
 */
export default function MaQR({
  value,
  size = 160,
  label,
  className,
}: {
  value: string;
  size?: number;
  label?: string;
  className?: string;
}) {
  const matrix = taoMaTranQR(value || 'FlipMath9');
  const n = matrix.length;
  const pad = 4;
  const total = n + pad * 2;
  const rects: string[] = [];
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (matrix[r][c]) {
        rects.push(`M${c + pad},${r + pad}h1v1h-1z`);
      }
    }
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${total} ${total}`}
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label={label ?? `Mã QR cho ${value}`}
      style={{ display: 'block', background: '#fff', borderRadius: 6 }}
    >
      <rect width={total} height={total} fill="#ffffff" />
      <path d={rects.join('')} fill="#111827" />
    </svg>
  );
}
