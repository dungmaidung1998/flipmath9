'use client';

/**
 * FILE NÀY LÀM GÌ: Component React giao diện hiển thị và xử lý tương tác của người dùng trên trình duyệt.
 * AI DÙNG: học sinh
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: không gọi mô-đun nội bộ khác
 */
import { useEffect, useRef, useState, type ImgHTMLAttributes, type ReactNode } from 'react';

type AnhChuDeProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> & {
  src: string;
  fallback?: string | null;
  fallbackNode?: ReactNode;
  onPrimaryState?: (ok: boolean) => void;
};

/**
 * Hiển thị ảnh chủ đề có fallback an toàn:
 * - stage 0: thử src (ảnh Codex mới)
 * - stage 1: chuyển sang fallback (ảnh cũ có sẵn) nếu src lỗi
 * - stage 2: hiện fallbackNode hoặc ẩn sạch nếu cả hai lỗi
 */
export default function AnhChuDe({
  src,
  fallback,
  fallbackNode = null,
  onPrimaryState,
  alt = '',
  onError,
  onLoad,
  ...rest
}: AnhChuDeProps) {
  const [stage, setStage] = useState<0 | 1 | 2>(0);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    setStage(0);
  }, [src, fallback]);

  const advance = () => {
    setStage((prev) => {
      if (prev === 0) {
        return fallback && fallback !== src ? 1 : 2;
      }
      return 2;
    });
  };

  useEffect(() => {
    if (stage > 0) {
      onPrimaryState?.(false);
    }
  }, [stage, onPrimaryState]);

  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth === 0) {
      advance();
    } else if (img && img.complete && img.naturalWidth > 0) {
      onPrimaryState?.(stage === 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, src, fallback]);

  if (stage === 2) {
    return <>{fallbackNode}</>;
  }

  const activeSrc = stage === 0 ? src : fallback!;
  if (!activeSrc) {
    return <>{fallbackNode}</>;
  }

  return (
    <img
      ref={imgRef}
      src={activeSrc}
      alt={alt}
      onLoad={(e) => {
        onPrimaryState?.(stage === 0);
        onLoad?.(e);
      }}
      onError={(e) => {
        advance();
        onError?.(e);
      }}
      {...rest}
    />
  );
}

/**
 * Tranh bối cảnh làm nền cho đầu trang; chỉ hiện tranh + lớp phủ trắng mờ khi ảnh thực sự tải được.
 */
export function AnhNenChuong({
  src,
  fallback,
  className = 'dau-trang__nen',
}: {
  src: string;
  fallback?: string | null;
  className?: string;
}) {
  const [stage, setStage] = useState<0 | 1 | 2>(0);
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    setStage(0);
    setLoaded(false);
  }, [src, fallback]);

  const advance = () => {
    setLoaded(false);
    setStage((prev) => (prev === 0 && fallback && fallback !== src ? 1 : 2));
  };

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;
    if (img.complete) {
      if (img.naturalWidth === 0) advance();
      else setLoaded(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, src, fallback]);

  if (stage === 2) return null;
  const activeSrc = stage === 0 ? src : fallback;
  if (!activeSrc) return null;

  return (
    <>
      <img
        ref={imgRef}
        src={activeSrc}
        alt=""
        aria-hidden="true"
        className={className}
        style={loaded ? undefined : { opacity: 0 }}
        onLoad={() => setLoaded(true)}
        onError={advance}
      />
      {loaded && <span className="dau-trang__phu-nen" aria-hidden="true" />}
    </>
  );
}
