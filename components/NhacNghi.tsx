'use client';

/**
 * FILE NÀY LÀM GÌ: Component React giao diện hiển thị và xử lý tương tác của người dùng trên trình duyệt.
 * AI DÙNG: học sinh
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: @/components/NhanVat, @/components/AnhChuDe, @/lib/quaTai
 */
import { useEffect, useRef, useState } from 'react';
import NhanVat from '@/components/NhanVat';
import AnhChuDe from '@/components/AnhChuDe';
import {
  CAU_HINH_QUA_TAI_MAC_DINH,
  NHAN_DAU_HIEU_QUA_TAI,
  TU_THE_GIAN_CO,
  biKhoaMemBaiMoi,
  canGiamTaiDe,
  phatHienDauHieuQuaTai,
  phutHienTaiVN,
  type CauHinhQuaTai,
  type LoaiDauHieuQuaTai,
  type LuotCauGanDay,
} from '@/lib/quaTai';

/**
 * CẢNH BÁO SỨC KHOẺ & ÔN THI KHÔNG QUÁ TẢI (SPEC M9 + KHKT C).
 * DÙNG DUY NHẤT BỘ ĐẾM NÀY — không tạo bộ đếm thứ hai.
 * Thời gian hoạt động thực = trang đang hiện VÀ có thao tác (hoặc đang xem video) trong 2 phút gần nhất.
 */
const KHOA = 'f9-suc-khoe';
const KHOA_GIAM_TAI = 'f9-qua-tai-giam-tai';
const KHOA_KHOA_MEM = 'f9-qua-tai-khoa-mem';
const PHUT = 60_000;
const NGHI_DU = 10 * PHUT;

type TrangThai = {
  batDau: number;
  cuoi: number;
  ngay: string;
  trongNgay: number;
  hoan30: number;
  da30: boolean;
  da50: boolean;
  daTuThe: number;
  baoNgay: string;
  baoKhuya: string;
};

// Xử lý mốc ngày giờ theo múi giờ Việt Nam (UTC+7)
const ngayVN = (t = Date.now()) => new Date(t + 7 * 3600_000).toISOString().slice(0, 10);

/**
 * Component React `moi`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
function moi(now: number): TrangThai {
  return {
    batDau: now,
    cuoi: now,
    ngay: ngayVN(now),
    trongNgay: 0,
    hoan30: 0,
    da30: false,
    da50: false,
    daTuThe: 0,
    baoNgay: '',
    baoKhuya: '',
  };
}
/**
 * Component React `doc`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
function doc(): TrangThai | null {
  try {
    const s = localStorage.getItem(KHOA);
    return s ? JSON.parse(s) : null;
  } catch {
    return null;
  }
}
/**
 * Component React `ghi`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
function ghi(t: TrangThai) {
  try {
    localStorage.setItem(KHOA, JSON.stringify(t));
  } catch {
    /* không lưu được thì thôi */
  }
}

type Hop = null | 'nghi-mat' | 'nghi-dai' | 'du-ngay' | 'khuya' | 'qua-tai-nhe' | 'nghi-5-phut';
const UU_TIEN: Record<string, number> = {
  'nghi-5-phut': 6,
  'nghi-dai': 5,
  khuya: 4,
  'qua-tai-nhe': 3,
  'nghi-mat': 2,
  'du-ngay': 1,
};
const chon = (m: Exclude<Hop, null>) => (cu: Hop): Hop => (cu && UU_TIEN[cu] >= UU_TIEN[m] ? cu : m);

/**
 * Component React `NhacNghi`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export default function NhacNghi() {
  const [hop, setHop] = useState<Hop>(null);
  const [phutLienTuc, setPhutLienTuc] = useState(0);
  const [tuThe, setTuThe] = useState(false);
  const [dem, setDem] = useState(0);
  const [lyDoNhe, setLyDoNhe] = useState<LoaiDauHieuQuaTai | null>(null);
  const [cauHinh, setCauHinh] = useState<CauHinhQuaTai>(CAU_HINH_QUA_TAI_MAC_DINH);
  const cauHinhRef = useRef<CauHinhQuaTai>(CAU_HINH_QUA_TAI_MAC_DINH);
  cauHinhRef.current = cauHinh;

  const hopRef = useRef<Hop>(null);
  hopRef.current = hop;

  const cauGanDayRef = useRef<LuotCauGanDay[]>([]);
  const daGhiSuKienRef = useRef<Set<string>>(new Set());
  const phutServerRef = useRef<number>(0);

  const ghiSuKienQuaTai = (loai: LoaiDauHieuQuaTai) => {
    // Xử lý mốc ngày giờ theo múi giờ Việt Nam (UTC+7)
    const key = `${ngayVN()}:${loai}`;
    if (daGhiSuKienRef.current.has(key)) return;
    daGhiSuKienRef.current.add(key);
    fetch('/api/qua-tai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ loai }),
      keepalive: true,
    }).catch(() => {});
  };

  useEffect(() => {
    fetch('/api/qua-tai', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.cauHinh) setCauHinh(d.cauHinh);
        if (typeof d?.phutHomNay === 'number') phutServerRef.current = d.phutHomNay;
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    let thaoTac = Date.now();
    const cham = () => {
      thaoTac = Date.now();
    };
    const su = ['pointerdown', 'keydown', 'scroll', 'touchstart', 'wheel'];
    su.forEach((e) => window.addEventListener(e, cham, { passive: true }));
    let truoc = Date.now();

    const kiem = () => {
      const now = Date.now();
      const cfg = cauHinhRef.current;
      let t = doc() ?? moi(now);
      // Xử lý mốc ngày giờ theo múi giờ Việt Nam (UTC+7)
      if (t.ngay !== ngayVN(now)) {
        // Xử lý mốc ngày giờ theo múi giờ Việt Nam (UTC+7)
        t = { ...t, ngay: ngayVN(now), trongNgay: 0, baoNgay: '' };
        try {
          sessionStorage.removeItem(KHOA_GIAM_TAI);
          sessionStorage.removeItem(KHOA_KHOA_MEM);
        } catch {}
      }
      if (now - t.cuoi > NGHI_DU) {
        t = { ...t, batDau: now, cuoi: now, hoan30: 0, da30: false, da50: false, daTuThe: 0 };
      }

      const xemVideo = document.activeElement?.tagName === 'IFRAME';
      const hoatDong = document.visibilityState === 'visible' && (now - thaoTac < 2 * PHUT || xemVideo);
      if (hoatDong) {
        // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
        t.trongNgay += Math.min(now - truoc, PHUT);
        t.cuoi = now;
      }
      truoc = now;
      // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
      const lienTuc = Math.floor((t.cuoi - t.batDau) / PHUT);
      setPhutLienTuc(now - t.cuoi < 2 * PHUT ? lienTuc : 0);

      // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
      const phutNgayTong = Math.max(Math.floor(t.trongNgay / PHUT), phutServerRef.current);
      const dauHieu = phatHienDauHieuQuaTai(
        {
          phutTrongNgayVN: phutHienTaiVN(now),
          phutLienTuc: lienTuc,
          phutTrongNgay: phutNgayTong,
          cauGanDay: cauGanDayRef.current,
          nowMs: now,
        },
        cfg
      );

      for (const d of dauHieu) ghiSuKienQuaTai(d);

      const khoa = biKhoaMemBaiMoi(dauHieu);
      try {
        if (khoa) {
          sessionStorage.setItem(
            KHOA_KHOA_MEM,
            JSON.stringify({
              khoa: true,
              phutGioiHan: cfg.phut_ngay,
              khuya: dauHieu.includes('khuya'),
              vuotNgay: dauHieu.includes('vuot-ngay'),
            })
          );
        } else {
          sessionStorage.removeItem(KHOA_KHOA_MEM);
        }
        window.dispatchEvent(
          new CustomEvent('f9-qua-tai-khoa-mem', {
            detail: { khoa, phutGioiHan: cfg.phut_ngay, dauHieu },
          })
        );
      } catch {}

      const dangThi = !!document.querySelector('[data-bai-co-gio]');
      // Xử lý mốc ngày giờ theo múi giờ Việt Nam (UTC+7)
      const dem6 = ngayVN(now - 6 * 3600_000);
      if (!hopRef.current && !dangThi) {
        if (dauHieu.includes('khuya') && t.baoKhuya !== dem6) {
          t.baoKhuya = dem6;
          setHop(chon('khuya'));
        } else if (dauHieu.includes('lien-tuc') && !t.da50) {
          t.da50 = true;
          setHop(chon('nghi-dai'));
        } else if (lienTuc >= 30 && !t.da30 && now >= t.hoan30) {
          setHop(chon('nghi-mat'));
        } else if (dauHieu.includes('vuot-ngay') && t.baoNgay !== t.ngay) {
          t.baoNgay = t.ngay;
          setHop(chon('du-ngay'));
        }
      }

      // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
      const moc = Math.floor(lienTuc / 20);
      if (moc > t.daTuThe && !dangThi) {
        t.daTuThe = moc;
        setTuThe(true);
        window.setTimeout(() => setTuThe(false), 10_000);
      }
      ghi(t);
    };

    const onCauMoi = (e: Event) => {
      const dung = Boolean((e as CustomEvent)?.detail?.dung);
      const now = Date.now();
      cauGanDayRef.current = [...cauGanDayRef.current, { tsMs: now, dung }].slice(-30);
      const t = doc() ?? moi(now);
      // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
      const lienTuc = Math.floor((t.cuoi - t.batDau) / PHUT);
      const ds = phatHienDauHieuQuaTai(
        {
          phutTrongNgayVN: phutHienTaiVN(now),
          phutLienTuc: lienTuc,
          phutTrongNgay: Math.max(Math.floor(t.trongNgay / PHUT), phutServerRef.current),
          cauGanDay: cauGanDayRef.current,
          nowMs: now,
        },
        cauHinhRef.current
      );
      if (canGiamTaiDe(ds)) {
        const lyDo = ds.includes('don-dap') ? 'don-dap' : 'sai-lien-tiep';
        ghiSuKienQuaTai(lyDo);
        try {
          sessionStorage.setItem(KHOA_GIAM_TAI, '1');
          window.dispatchEvent(new CustomEvent('f9-qua-tai-giam-tai', { detail: { giamTai: true, lyDo } }));
        } catch {}
        if (!hopRef.current) {
          setLyDoNhe(lyDo);
          setHop(chon('qua-tai-nhe'));
        }
      }
    };

    kiem();
    const id = window.setInterval(kiem, 15_000);
    window.addEventListener('f9-qua-tai-cau', onCauMoi);
    return () => {
      window.clearInterval(id);
      window.removeEventListener('f9-qua-tai-cau', onCauMoi);
      su.forEach((e) => window.removeEventListener(e, cham));
    };
  }, []);

  useEffect(() => {
    setDem(
      hop === 'nghi-5-phut' ? 300 : hop === 'nghi-dai' ? 120 : hop === 'nghi-mat' ? 20 : 0
    );
  }, [hop]);

  useEffect(() => {
    if (!hop || dem <= 0) return;
    const id = window.setTimeout(() => setDem((d) => d - 1), 1000);
    return () => window.clearTimeout(id);
  }, [hop, dem]);

  const dong = (kieu: 'xong' | 'de-sau') => {
    const t = doc();
    const now = Date.now();
    if (t) {
      if (hop === 'nghi-mat') {
        if (kieu === 'de-sau') t.hoan30 = now + 10 * PHUT;
        else t.da30 = true;
      }
      if (hop === 'nghi-dai' || hop === 'nghi-5-phut') {
        t.batDau = now;
        t.cuoi = now;
        t.da30 = false;
        t.da50 = false;
        t.hoan30 = 0;
        t.daTuThe = 0;
      }
      ghi(t);
    }
    setHop(null);
  };

  const mauVong = phutLienTuc >= 45 ? '#e8590c' : phutLienTuc >= 30 ? '#e0a800' : '#2f9e44';
  const vong = (
    <div
      className="suc-khoe-vong"
      title={`Em đã học liên tục ${phutLienTuc} phút`}
      aria-label={`Đã học liên tục ${phutLienTuc} phút`}
      role="img"
    >
      <svg viewBox="0 0 36 36" width="40" height="40" aria-hidden="true">
        <circle cx="18" cy="18" r="15" fill="#fff" stroke="#e6ebf7" strokeWidth="4" />
        <circle
          cx="18"
          cy="18"
          r="15"
          fill="none"
          stroke={mauVong}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={`${Math.min(1, phutLienTuc / 50) * 94.2} 94.2`}
          transform="rotate(-90 18 18)"
        />
      </svg>
      <span aria-hidden="true">{phutLienTuc}′</span>
      {tuThe && <em className="suc-khoe-tu-the" role="status">Ngồi thẳng lưng nhé 🙆</em>}
    </div>
  );

  if (!hop) return vong;

  if (hop === 'nghi-5-phut') {
    const phaTho = Math.floor(dem / 4) % 3; // Hít vào (4s) -> Giữ nhẹ (4s) -> Thở ra (4s)
    const loiTho = phaTho === 0 ? 'Hít vào chậm…' : phaTho === 1 ? 'Giữ nhẹ…' : 'Thở ra từ từ…';
    return (
      <>
        {vong}
        <div className="suc-khoe-che" role="dialog" aria-modal="true" aria-labelledby="sk-5p-td">
          <div className="suc-khoe-che__hop" style={{ maxWidth: 480, textAlign: 'left' }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <AnhChuDe src="/tinh-nang/qua-tai/tho-deu.webp" fallback="/minh-hoa/nv/chao.webp" alt="" width={76} height={76} className="qt-tho-anh" />
              <div>
                <h2 id="sk-5p-td" style={{ margin: 0 }}>Nghỉ 5 phút cùng Bin và Na</h2>
                <p style={{ margin: '4px 0 0', fontSize: 14 }}>{loiTho} ({Math.floor(dem / 60)}:{String(dem % 60).padStart(2, '0')})</p>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 8, margin: '12px 0' }}>
              {TU_THE_GIAN_CO.map((g) => (
                <div key={g.id} style={{ background: '#f8fafc', borderRadius: 10, padding: 8, border: '1px solid #e2e8f0', fontSize: 12.5 }}>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 3 }}>
                    <AnhChuDe src={g.anh} fallbackNode={<span>🙆</span>} alt="" width={34} height={34} />
                    <b>{g.ten}</b>
                  </div>
                  <span style={{ color: '#475569' }}>{g.moTa}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <button type="button" className="nho phu" onClick={() => dong('xong')}>Làm tiếp luôn</button>
              <button type="button" className="primary" onClick={() => dong('xong')} autoFocus>Em thấy thoải mái hơn rồi</button>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (hop === 'nghi-dai') {
    return (
      <div className="suc-khoe-che" role="dialog" aria-modal="true" aria-labelledby="sk-tieu-de">
        <div className="suc-khoe-che__hop">
          <AnhChuDe src="/tinh-nang/qua-tai/nghi-5-phut.webp" fallback="/minh-hoa/nv/chao.webp" alt="" width={140} height={105} />
          <h2 id="sk-tieu-de">Em đã học liền {phutLienTuc} phút rồi!</h2>
          <p>Đứng dậy vươn vai, nhìn ra xa, uống một cốc nước. Bài làm của em đã được lưu.</p>
          <p className="suc-khoe-dem" aria-live="polite">{dem > 0 ? `${Math.floor(dem / 60)}:${String(dem % 60).padStart(2, '0')}` : 'Xong rồi!'}</p>
          <button type="button" className="primary" disabled={dem > 60} onClick={() => dong('xong')} autoFocus>
            {dem > 0 && dem > 60 ? `Nghỉ thêm ${dem - 60} giây nữa` : 'Em đã nghỉ xong'}
          </button>
        </div>
      </div>
    );
  }

  if (hop === 'qua-tai-nhe') {
    return (
      <>
        {vong}
        <div className="nhac-nghi" role="dialog" aria-modal="false" aria-labelledby="nhac-qt-td">
          <AnhChuDe src="/tinh-nang/qua-tai/nghi-5-phut.webp" fallback="/minh-hoa/nv/chao.webp" alt="" width={92} height={70} style={{ borderRadius: 10, objectFit: 'cover' }} />
          <div>
            <h2 id="nhac-qt-td">Em làm nhiều rồi, nghỉ 5 phút nhé</h2>
            <p>{lyDoNhe ? NHAN_DAU_HIEU_QUA_TAI[lyDoNhe].loiBin : 'Nghỉ 5 phút rồi làm đề nhẹ hơn giúp em nhớ chắc hơn đấy.'}</p>
            <div className="nhac-nghi__nut">
              <button type="button" className="primary" onClick={() => setHop('nghi-5-phut')} autoFocus>Nghỉ 5 phút</button>
              <button type="button" onClick={() => dong('xong')}>Làm tiếp</button>
            </div>
          </div>
        </div>
      </>
    );
  }

  const noiDung = {
    'nghi-mat': {
      td: 'Nghỉ mắt 20-20-20',
      nd: 'Nhìn ra xa khoảng 6 mét trong 20 giây, chớp mắt vài lần.',
      nut: dem > 0 ? `Đang nghỉ… ${dem} giây` : 'Em nghỉ xong rồi',
      src: '/tinh-nang/qua-tai/nhin-xa.webp',
      fallback: '/minh-hoa/nv/chao.webp',
    },
    'du-ngay': {
      td: 'Hôm nay em học đủ rồi',
      nd: `Hôm nay em đã học đủ ${cauHinh.phut_ngay} phút theo giới hạn thầy cô/phụ huynh đặt. Em có thể xem lại tóm tắt hoặc Sổ lỗi, bài mới để ngày mai nhé.`,
      nut: 'Em hiểu rồi',
      src: '/tinh-nang/qua-tai/du-gio-hom-nay.webp',
      fallback: '/minh-hoa/nv/cup.webp',
    },
    khuya: {
      td: 'Đã khuya rồi, em nên nghỉ ngơi',
      nd: `Bây giờ đang trong giờ nghỉ ngơi (${cauHinh.gio_khuya}–${cauHinh.gio_sang}). Em vẫn xem được Sổ lỗi và Tóm tắt, bài mới hẹn sáng mai nhé.`,
      nut: 'Em biết rồi',
      src: '/tinh-nang/qua-tai/khuya-roi.webp',
      fallback: '/minh-hoa/nv/chao.webp',
    },
  }[hop];

  return (
    <>
      {vong}
      <div className="nhac-nghi" role="dialog" aria-modal="false" aria-labelledby="nhac-nghi-tieu-de">
        {hop !== 'nghi-mat' && (
          <AnhChuDe src={noiDung.src} fallback={noiDung.fallback} alt="" width={84} height={84} loading="lazy" />
        )}
        <div>
          <h2 id="nhac-nghi-tieu-de">{noiDung.td}</h2>
          {hop === 'nghi-mat' ? <NhanVat loi="nghiMat" compact /> : <p>{noiDung.nd}</p>}
          <div className="nhac-nghi__nut">
            <button type="button" className="primary" disabled={hop === 'nghi-mat' && dem > 0} onClick={() => dong('xong')} autoFocus>
              {noiDung.nut}
            </button>
            {hop === 'nghi-mat' && <button type="button" onClick={() => dong('de-sau')}>Để sau 10 phút</button>}
          </div>
        </div>
      </div>
    </>
  );
}
