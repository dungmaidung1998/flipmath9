'use client';

/**
 * FILE NÀY LÀM GÌ: Component React giao diện hiển thị và xử lý tương tác của người dùng trên trình duyệt.
 * AI DÙNG: học sinh
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: @/components/AnhChuDe, @/components/MathText, @/lib/dfle/t9-tom-tat.js
 */
import { useEffect, useState } from 'react';
import AnhChuDe from '@/components/AnhChuDe';
import MathText from '@/components/MathText';
import { anhTrangBai, anhTrangBaiDuPhong, O_CHU_TRANG_BAI } from '@/lib/dfle/t9-tom-tat.js';

type KieuOChu = 'so-tay' | 'ribbon' | 'may' | 'tab' | 'than' | 'ghi-nho';
type OChu = { x: number; y: number; w: number; h: number; kieu?: KieuOChu; text: string };

/**
 * Component React `KhungTrangCoChu`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
function KhungTrangCoChu({
  bai,
  src,
  fallback,
  nhan,
  dungAnhChinh,
  onPrimaryState,
  oChu,
}: {
  bai: number;
  src: string;
  fallback: string | null;
  nhan: string;
  dungAnhChinh: boolean;
  onPrimaryState?: (ok: boolean) => void;
  oChu?: OChu[];
}) {
  return (
    <div className="tt-trang-bai__khung">
      <AnhChuDe
        src={src}
        fallback={fallback}
        onPrimaryState={onPrimaryState}
        alt={nhan}
        width={941}
        height={1672}
        loading="lazy"
        decoding="async"
      />
      {dungAnhChinh && oChu && oChu.map((o, idx) => (
        <div
          key={idx}
          className={`tt-trang-bai__o tt-trang-bai__o--${o.kieu ?? 'than'}`}
          style={{ left: `${o.x}%`, top: `${o.y}%`, width: `${o.w}%`, height: `${o.h}%` }}
        >
          <div className="tt-trang-bai__noi">
            <MathText>{o.text}</MathText>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Component React `AnhTrangTomTatBai`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export default function AnhTrangTomTatBai({ bai, tenBai }: { bai: number; tenBai?: string }) {
  const [dungAnhChinh, setDungAnhChinh] = useState(true);
  const [phongTo, setPhongTo] = useState(false);
  const src = anhTrangBai(bai);
  const fallback = anhTrangBaiDuPhong(bai);
  const hrefMo = dungAnhChinh || !fallback ? src : fallback;
  const oChu = (O_CHU_TRANG_BAI as Record<number, OChu[] | undefined>)[bai];
  const coLopChu = Boolean(dungAnhChinh && oChu && oChu.length > 0);
  const nhan = tenBai ? `Trang tóm tắt ${tenBai}` : `Trang tóm tắt Bài ${bai}`;

  useEffect(() => {
    if (!phongTo) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPhongTo(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phongTo]);

  return (
    <div className="tt-trang-bai">
      {coLopChu ? (
        <div
          className="tt-trang-bai__bam"
          role="button"
          tabIndex={0}
          onClick={() => setPhongTo(true)}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setPhongTo(true); } }}
          title="Chạm để phóng to trang tóm tắt"
        >
          <KhungTrangCoChu
            bai={bai}
            src={src}
            fallback={fallback}
            nhan={nhan}
            dungAnhChinh={dungAnhChinh}
            onPrimaryState={setDungAnhChinh}
            oChu={oChu}
          />
        </div>
      ) : (
        <a href={hrefMo} target="_blank" rel="noreferrer" title="Mở ảnh kích thước đầy đủ">
          <KhungTrangCoChu
            bai={bai}
            src={src}
            fallback={fallback}
            nhan={nhan}
            dungAnhChinh={dungAnhChinh}
            onPrimaryState={setDungAnhChinh}
          />
        </a>
      )}

      {!dungAnhChinh && fallback && (
        <p className="tt-trang-bai__chu-thich">
          Ảnh tóm tắt cả Bài {bai} đang cập nhật — tạm xem sơ đồ mục mở đầu của bài.
        </p>
      )}
      <p className="tt-nguon" style={{ marginTop: 6 }}>
        {coLopChu ? (
          <button type="button" className="tt-trang-bai__nut-zoom" onClick={() => setPhongTo(true)}>
            🔍 Phóng to trang tóm tắt cả Bài {bai}
          </button>
        ) : (
          <a href={hrefMo} target="_blank" rel="noreferrer">Mở ảnh kích thước đầy đủ</a>
        )}
      </p>

      {phongTo && (
        <div
          className="tt-trang-bai__hop"
          role="dialog"
          aria-modal="true"
          aria-label={nhan}
          onClick={() => setPhongTo(false)}
        >
          <div className="tt-trang-bai__hop-noi" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="tt-trang-bai__dong" onClick={() => setPhongTo(false)}>
              ✕ Đóng
            </button>
            <KhungTrangCoChu
              bai={bai}
              src={src}
              fallback={fallback}
              nhan={nhan}
              dungAnhChinh={dungAnhChinh}
              oChu={oChu}
            />
          </div>
        </div>
      )}
    </div>
  );
}
