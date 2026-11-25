'use client';

/**
 * FILE NÀY LÀM GÌ: Component React phía trình duyệt phục vụ bảng điều khiển, biểu đồ và biểu mẫu thao tác cho giáo viên.
 * AI DÙNG: giáo viên
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: @/lib/chapters, @/lib/gv/lopCuaToi
 */
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CHAPTERS } from '@/lib/chapters';
import { COOKIE_LOP, nhanTruongLop, type LopCuaToi } from '@/lib/gv/lopCuaToi';

const KHOANG_NGAY = [
  { id: '7', nhan: '7 ngày' },
  { id: '14', nhan: '14 ngày' },
  { id: '28', nhan: '28 ngày' },
  { id: '90', nhan: '90 ngày' },
  { id: 'tat-ca', nhan: 'Tất cả' }
];

/**
 * Component React `docCookieTrinhDuyet`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
function docCookieTrinhDuyet(ten: string): string | null {
  if (typeof document === 'undefined') return null;
  // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
  const m = document.cookie.match(new RegExp('(?:^|; )' + ten + '=([^;]*)'));
  return m ? decodeURIComponent(m[1]) : null;
}

/**
 * Thanh chọn lớp dùng chung: dropdown "Trường › Lớp" + nút "Tất cả lớp",
 * lưu ở cookie f9_lop và ?lop= trên URL; tuỳ chọn lọc theo chương và khoảng ngày.
 */
export default function ChonLop({
  lops,
  dang,
  coTatCa = true,
  coChuong = false,
  chuong,
  coNgay = false,
  ngay,
  kieu = 'gon'
}: {
  lops: LopCuaToi[];
  dang?: string;
  coTatCa?: boolean;
  coChuong?: boolean;
  chuong?: string;
  coNgay?: boolean;
  ngay?: string;
  kieu?: 'thanh' | 'gon';
}) {
  const sp = useSearchParams();
  const [cookieLop, setCookieLop] = useState<string | null>(null);

  useEffect(() => {
    setCookieLop(docCookieTrinhDuyet(COOKIE_LOP));
  }, []);

  if (!lops.length) return null;

  const qLop = sp?.get('lop');
  const giaTriTho = dang ?? qLop ?? cookieLop ?? lops[0].class_id;
  const hopLe =
    (coTatCa && giaTriTho === 'tat-ca') ||
    lops.some((l) => l.class_id === giaTriTho);
  const hienTai = hopLe ? giaTriTho : lops[0].class_id;

  const chuongHienTai = chuong ?? sp?.get('chuong') ?? 'tat-ca';
  const ngayHienTai = ngay ?? sp?.get('ngay') ?? '28';

  const dieuHuong = (thamSo: Record<string, string | null>, luuCookieLop?: string) => {
    if (luuCookieLop) {
      document.cookie = `${COOKIE_LOP}=${encodeURIComponent(luuCookieLop)}; path=/; max-age=2592000; SameSite=Lax`;
      setCookieLop(luuCookieLop);
    }
    const u = new URL(window.location.href);
    for (const [k, v] of Object.entries(thamSo)) {
      if (v === null || v === '') u.searchParams.delete(k);
      else u.searchParams.set(k, v);
    }
    window.location.href = u.toString();
  };

  return (
    <div
      className={kieu === 'thanh' ? 'chon-lop-thanh khong-in' : 'chon-lop-gon khong-in'}
      role="region"
      aria-label="Chọn lớp và bộ lọc"
    >
      <label className="chon-lop">
        <span>Trường › Lớp</span>
        <select
          value={hienTai === 'tat-ca' ? '' : hienTai}
          aria-label="Chọn Trường và Lớp"
          onChange={(e) => {
            if (e.target.value) dieuHuong({ lop: e.target.value }, e.target.value);
          }}
        >
          {hienTai === 'tat-ca' && (
            <option value="" disabled>
              Đang xem: Tất cả ({lops.length} lớp)
            </option>
          )}
          {lops.map((l) => (
            <option key={l.class_id} value={l.class_id}>
              {nhanTruongLop(l)}
            </option>
          ))}
        </select>
      </label>

      {coTatCa && (
        <button
          type="button"
          className="chon-lop-tat-ca"
          aria-pressed={hienTai === 'tat-ca'}
          onClick={() => dieuHuong({ lop: 'tat-ca' }, 'tat-ca')}
        >
          Tất cả lớp ({lops.length})
        </button>
      )}

      {coChuong && (
        <label className="chon-lop">
          <span>Chương</span>
          <select
            value={chuongHienTai}
            aria-label="Lọc theo chương"
            onChange={(e) => dieuHuong({ chuong: e.target.value === 'tat-ca' ? null : e.target.value })}
          >
            <option value="tat-ca">Tất cả chương</option>
            {CHAPTERS.filter((c) => c.id !== 'TN').map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}: {c.title}
              </option>
            ))}
          </select>
        </label>
      )}

      {coNgay && (
        <label className="chon-lop">
          <span>Khoảng ngày</span>
          <select
            value={ngayHienTai}
            aria-label="Lọc theo khoảng ngày"
            onChange={(e) => dieuHuong({ ngay: e.target.value })}
          >
            {KHOANG_NGAY.map((k) => (
              <option key={k.id} value={k.id}>
                {k.nhan}
              </option>
            ))}
          </select>
        </label>
      )}
    </div>
  );
}
