'use client';
/**
 * FILE NÀY LÀM GÌ: Component React giao diện hiển thị và xử lý tương tác của người dùng trên trình duyệt.
 * AI DÙNG: học sinh
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: @/lib/chuDeChuong
 */
import { createContext, useEffect, useLayoutEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import { chuDeChuong } from '@/lib/chuDeChuong';

/** Số màn học đang mở (màn trò chơi nằm lồng trong màn bài học). Dùng để gắn lớp
 *  `co-man-hoc` lên <html> thay cho bộ chọn body:has(...) vốn tốn sức trên máy yếu. */
let soManMo = 0;
const useIsoLayout = typeof window === 'undefined' ? useEffect : useLayoutEffect;

export const LearningBack = createContext<(() => void) | null>(null);
export const LearningNext = createContext<(() => void) | null>(null);
export const LearningActive = createContext(true);

/**
 * Component React `LearningScreen`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export default function LearningScreen({
  title,
  step,
  children,
  onBack,
  onNext,
  nextLabel = 'Tiếp theo →',
  disabled = false,
  busy = false,
  status = '',
  exitHref = '/bai-hoc',
  chuong
}: {
  title: string;
  step: string;
  children: ReactNode;
  onBack: () => void;
  onNext: () => void;
  nextLabel?: string;
  disabled?: boolean;
  busy?: boolean;
  status?: string;
  exitHref?: string;
  chuong?: string | null;
}) {
  const cd = chuDeChuong(chuong);
  const heading = useRef<HTMLHeadingElement>(null);
  const body = useRef<HTMLDivElement>(null);

  // Nhớ vị trí cuộn của từng bước: quay lại bước cũ thì về đúng chỗ đang đọc,
  // sang bước mới thì bắt đầu từ đầu. Đặt trước khi vẽ để không thấy trang nhảy.
  const viTri = useRef(new Map<string, number>());
  const buocHienTai = useRef(step);
  useIsoLayout(() => {
    buocHienTai.current = step;
    const el = body.current;
    if (el) {
      el.scrollTop = viTri.current.get(step) ?? 0;
      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        el.animate?.([{ opacity: 0.35 }, { opacity: 1 }], { duration: 160, easing: 'ease-out' });
      }
    }
    heading.current?.focus({ preventScroll: true });
  }, [step]);

  useEffect(() => {
    soManMo += 1;
    document.documentElement.classList.add('co-man-hoc');
    return () => {
      soManMo -= 1;
      if (soManMo <= 0) { soManMo = 0; document.documentElement.classList.remove('co-man-hoc'); }
    };
  }, []);

  return (
    <section
      className={'learning-screen' + (cd ? ' learning-screen--chuong trang-chuong' : '')}
      style={cd ? ({ ['--mau-chuong' as string]: cd.mau } as CSSProperties) : undefined}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onKeyDown={(e) => {
        if (e.key !== 'Tab' || (e.target as HTMLElement).closest('.learning-screen') !== e.currentTarget) return;
        const nodes = Array.from(
          e.currentTarget.querySelectorAll<HTMLElement>(
            'a[href],button:not(:disabled),input:not(:disabled),summary,[tabindex="0"]'
          )
        ).filter((el) => el.getClientRects().length && !el.closest('[hidden]'));
        const first = nodes[0];
        const last = nodes[nodes.length - 1];
        if (e.shiftKey && (document.activeElement === first || document.activeElement === heading.current)) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }}
    >
      <header>
        <span style={{ fontWeight: 700 }}>
          {title}
          {cd && <span className="learning-screen__dia-danh">📍 {cd.ten}</span>}
        </span>
        <a href={exitHref} style={{ fontSize: 13.5, color: 'var(--muted)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          ✕ Đóng
        </a>
      </header>

      <div className="learning-screen-body" ref={body} onScroll={(e) => { viTri.current.set(buocHienTai.current, e.currentTarget.scrollTop); }}>
        {/* Khối giao diện: Khung nội dung chính của trang */}
        <main>
          <h2 ref={heading} tabIndex={-1} style={{ fontSize: 18, margin: '0 0 16px' }}>
            {step}
          </h2>
          {children}
        </main>
      </div>

      <footer>
        {/* Dòng nhắc nổi lên trên thanh nút, không làm thanh nút cao/thấp theo chữ (đỡ giật). */}
        <p role="status" aria-live="polite" className={'ls-nhac' + (status ? ' co' : '')}>{status}</p>
        <div>
          <button type="button" disabled={busy} onClick={onBack}>
            ← Quay lại
          </button>
          <button type="button" className="primary" disabled={disabled || busy} onClick={onNext}>
            {busy ? 'Đang lưu…' : nextLabel}
          </button>
        </div>
      </footer>
    </section>
  );
}
