'use client';

/**
 * FILE NÀY LÀM GÌ: Component React giao diện hiển thị và xử lý tương tác của người dùng trên trình duyệt.
 * AI DÙNG: học sinh
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: @/components/AnhChuDe
 */
import { useEffect, useState } from 'react';
import AnhChuDe from '@/components/AnhChuDe';

const KHOA_KHOA_MEM = 'f9-qua-tai-khoa-mem';
const KHOA_GIAM_TAI = 'f9-qua-tai-giam-tai';

/**
 * Khoá mềm bài MỚI khi học sinh vượt giới hạn phút ngày / vào giờ ngủ,
 * và gợi ý chuyển sang chế độ nhẹ (3 câu) khi gặp nhiều câu khó liên tiếp.
 * Vẫn cho xem lại tóm tắt, Sổ lỗi, Toán tiếng Anh.
 */
export default function KhoaMemQuaTai({
  khoaBanDau = false,
  phutGioiHanBanDau = 90,
  laGioKhuyaBanDau = false,
  duongDanGiamTai,
  children,
}: {
  khoaBanDau?: boolean;
  phutGioiHanBanDau?: number;
  laGioKhuyaBanDau?: boolean;
  duongDanGiamTai?: string;
  children: React.ReactNode;
}) {
  const [khoa, setKhoa] = useState(khoaBanDau);
  const [phut, setPhut] = useState(phutGioiHanBanDau);
  const [khuya, setKhuya] = useState(laGioKhuyaBanDau);
  const [giamTai, setGiamTai] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(KHOA_KHOA_MEM);
      if (raw) {
        const p = JSON.parse(raw);
        if (p?.khoa) {
          setKhoa(true);
          if (p.phutGioiHan) setPhut(Number(p.phutGioiHan));
          setKhuya(Boolean(p.khuya));
        }
      }
      if (sessionStorage.getItem(KHOA_GIAM_TAI) === '1') {
        setGiamTai(true);
      }
    } catch {}

    const onKhoa = (e: Event) => {
      const d = (e as CustomEvent)?.detail;
      if (typeof d?.khoa === 'boolean') setKhoa(d.khoa);
      if (typeof d?.phutGioiHan === 'number') setPhut(d.phutGioiHan);
      if (Array.isArray(d?.dauHieu)) setKhuya(d.dauHieu.includes('khuya'));
    };
    const onGiam = () => setGiamTai(true);
    window.addEventListener('f9-qua-tai-khoa-mem', onKhoa);
    window.addEventListener('f9-qua-tai-giam-tai', onGiam);
    return () => {
      window.removeEventListener('f9-qua-tai-khoa-mem', onKhoa);
      window.removeEventListener('f9-qua-tai-giam-tai', onGiam);
    };
  }, []);

  if (khoa) {
    return (
      <div className="card" style={{ borderLeft: '5px solid #2f9e44', background: '#f5fbf7' }}>
        <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
          <AnhChuDe
            src={khuya ? '/tinh-nang/qua-tai/khuya-roi.webp' : '/tinh-nang/qua-tai/du-gio-hom-nay.webp'}
            fallback="/minh-hoa/nv/cup.webp"
            alt=""
            width={110}
            height={84}
            style={{ borderRadius: 12, objectFit: 'cover' }}
          />
          <div style={{ flex: '1 1 240px' }}>
            <h2 style={{ margin: '0 0 6px', color: '#14532d' }}>
              {khuya ? '🌙 Đã đến giờ nghỉ ngơi' : '🎉 Hôm nay em đã học đủ rồi'}
            </h2>
            <p style={{ margin: 0, lineHeight: 1.55 }}>
              {khuya
                ? 'Đã qua khung giờ học buổi tối theo quy định của thầy cô / phụ huynh. Các bài làm mới tạm nghỉ đến sáng mai.'
                : `Hôm nay em đã học đủ ${phut} phút theo giới hạn thầy cô/phụ huynh đặt.`}
              {' '}Em vẫn có thể xem lại tóm tắt kiến thức, ôn Sổ lỗi hoặc từ vựng tiếng Anh.
            </p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
              <a className="action-link" href="/so-loi">🪤 Mở Sổ lỗi</a>
              <a className="action-link" href="/tieng-anh">🇬🇧 Toán tiếng Anh</a>
              <a className="action-link" href="/bai-hoc">← Danh sách bài học</a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {giamTai && duongDanGiamTai && (
        <div className="card" style={{ background: '#fff9eb', borderColor: '#f3dc9b', marginBottom: 12, display: 'flex', gap: 10, alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <span>💡 Bin gợi ý: em mới gặp vài câu khó liên tiếp, có thể chọn gói nhẹ 3 câu để lấy lại nhịp tự tin.</span>
          <a className="action-link" href={duongDanGiamTai}>Chuyển sang đề nhẹ (3 câu) →</a>
        </div>
      )}
      {children}
    </>
  );
}
