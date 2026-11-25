'use client';

/**
 * FILE NÀY LÀM GÌ: Thẻ chỉ số tự lực hàng tuần cho học sinh, hiển thị 3 mức tự giải sau gợi ý.
 * AI DÙNG: học sinh
 * LẤY DỮ LIỆU TỪ: nhận qua props từ trang Tiến độ (/tien-do)
 * GỌI TỚI: @/components/AnhChuDe
 */
import AnhChuDe from '@/components/AnhChuDe';

export type PropsTheTuLucHS = {
  tuGiai: number;
  tongThuLai: number;
  muc1: number;
  muc2: number;
  muc3: number;
  loiDongVien: string;
};

/**
 * Component React `TheTuLucHS`: hiển thị kết quả tự lực tuần này và phân bố 3 mức độ cần gợi ý.
 */
export default function TheTuLucHS({
  tuGiai,
  tongThuLai,
  muc1,
  muc2,
  muc3,
  loiDongVien,
}: PropsTheTuLucHS) {
  const maxMuc = Math.max(muc1, muc2, muc3);
  const cacMuc = [
    {
      id: 'muc-1',
      src: '/tinh-nang/tu-luc/muc-1.webp',
      fallback: '/minh-hoa/nv/reo-ho.webp',
      alt: 'Mức 1: Tự giải sau gợi ý nhẹ',
      ten: 'Tự giải sau gợi ý nhẹ',
      so: muc1,
      mau: '#15803d',
      nen: '#dcfce7',
    },
    {
      id: 'muc-2',
      src: '/tinh-nang/tu-luc/muc-2.webp',
      fallback: '/minh-hoa/nv/goi-y.webp',
      alt: 'Mức 2: Cần gợi ý thêm',
      ten: 'Cần gợi ý thêm',
      so: muc2,
      mau: '#b45309',
      nen: '#fef3c7',
    },
    {
      id: 'muc-3',
      src: '/tinh-nang/tu-luc/muc-3.webp',
      fallback: '/minh-hoa/nv/doc-sach.webp',
      alt: 'Mức 3: Xem lời giải và làm lại',
      ten: 'Xem lời giải',
      so: muc3,
      mau: '#1d4ed8',
      nen: '#dbeafe',
    },
  ];

  return (
    <div className="card" style={{ background: '#f5fbf7', borderColor: '#bbf7d0', minWidth: 0 }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', minWidth: 0 }}>
        <AnhChuDe
          src="/tinh-nang/tu-luc/the-tu-luc.webp"
          fallback="/minh-hoa/nv/reo-ho.webp"
          alt="Chỉ số tự lực tuần này"
          width={68}
          height={52}
          loading="lazy"
          style={{ borderRadius: 10, objectFit: 'cover', flex: 'none' }}
        />
        <div style={{ minWidth: 0 }}>
          <p style={{ margin: 0, fontWeight: 700, color: '#14532d' }}>
            🧠 Em tự giải được {tuGiai}/{tongThuLai} lần sau khi được gợi ý tuần này
          </p>
          <p className="hint" style={{ margin: '4px 0 0' }}>{loiDongVien}</p>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
          gap: 8,
          marginTop: 10,
        }}
      >
        {cacMuc.map((m) => {
          const noiBat = maxMuc > 0 && m.so === maxMuc;
          return (
            <div
              key={m.id}
              style={{
                borderRadius: 10,
                padding: '8px 6px',
                background: noiBat ? m.nen : '#fff',
                border: `1.5px solid ${noiBat ? m.mau : '#dcfce7'}`,
                textAlign: 'center',
                display: 'grid',
                gap: 4,
                justifyItems: 'center',
                minWidth: 0,
              }}
            >
              <AnhChuDe
                src={m.src}
                fallback={m.fallback}
                alt={m.alt}
                width={44}
                height={44}
                loading="lazy"
                style={{ objectFit: 'contain' }}
              />
              <b style={{ fontSize: 15, color: m.mau, lineHeight: 1.1 }}>{m.so}</b>
              <span style={{ fontSize: 11.5, lineHeight: 1.25, color: '#334155', overflowWrap: 'anywhere' }}>
                {m.ten}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
