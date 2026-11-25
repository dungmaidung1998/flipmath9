'use client';

/**
 * FILE NÀY LÀM GÌ: Giao diện 4 bước đo chiều cao 3D + AR (có chế độ thanh trượt dự phòng) và bảng thống kê giáo viên.
 * AI DÙNG: học sinh
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: @/components/MathText, @/components/AnhChuDe, @/lib/do-chieu-cao/tinh
 */
import dynamic from 'next/dynamic';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import MathText from '@/components/MathText';
import AnhChuDe from '@/components/AnhChuDe';
import {
  chieuCaoHaiDiem,
  chieuCaoMotDiem,
  dinhDangSoVN,
  doDaoDongGoc,
  doLechHieuChinh,
  goiYDoChieuCaoTheoTang,
  kiemTraKetQuaHS,
  phanTichSoNhap,
  saiSoTuongDoi,
  tinhGocNangTuCamBien,
  trungViGoc,
  type BanGhiDoChieuCao,
  type CachDoChieuCao,
} from '@/lib/do-chieu-cao/tinh';
import './do-chieu-cao.css';

const Canh3D = dynamic(() => import('./Canh3D'), {
  ssr: false,
  loading: () => <p className="dcc-phu">Đang dựng cảnh 3D…</p>,
});

export type VatMocItem = {
  id: string;
  ten: string;
  h_that: number | null;
  cach_do_that?: string | null;
  anh: string;
  loaiVat: 'cot-co' | 'cay' | 'tru-den' | 'toa-nha' | 'cau-rong';
  cachDoGoiY?: CachDoChieuCao;
};

const VAT_MAU_SAN: VatMocItem[] = [
  { id: 'mau-cot-co', ten: 'Cột cờ sân trường', h_that: null, anh: '/do-chieu-cao/vat-cot-co.webp', loaiVat: 'cot-co' },
  { id: 'mau-cay', ten: 'Cây xanh sân trường', h_that: null, anh: '/do-chieu-cao/vat-cay.webp', loaiVat: 'cay' },
  { id: 'mau-tru-den', ten: 'Trụ đèn đường', h_that: null, anh: '/do-chieu-cao/vat-tru-den.webp', loaiVat: 'tru-den' },
  { id: 'mau-toa-nha', ten: 'Toà nhà / dãy phòng học', h_that: null, anh: '/do-chieu-cao/vat-toa-nha.webp', loaiVat: 'toa-nha' },
  {
    id: 'mau-cau-rong',
    ten: 'Cầu Rồng (đo từ bờ sông Hàn)',
    h_that: null,
    anh: '/do-chieu-cao/vat-cau-rong.webp',
    loaiVat: 'cau-rong',
    cachDoGoiY: 'hai-diem',
  },
];

const FALLBACK_C4 = '/chu-de/canh/C4.webp';
const KHOA_DO_LECH = 'f9_do_chieu_cao_offset_v1';

/**
 * Component React `DoChieuCaoClient`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export default function DoChieuCaoClient({
  vatMocsGV = [],
  lichSuBanDau = [],
  laHocSinh = true,
}: {
  vatMocsGV?: VatMocItem[];
  lichSuBanDau?: BanGhiDoChieuCao[];
  laHocSinh?: boolean;
}) {
  const dsVat = useMemo(() => {
    const tuGV = vatMocsGV.map((v) => ({
      ...v,
      anh: v.anh || (/rồng/i.test(v.ten) ? '/do-chieu-cao/vat-cau-rong.webp' : '/do-chieu-cao/vat-cot-co.webp'),
    }));
    return tuGV.length ? [...tuGV, ...VAT_MAU_SAN] : VAT_MAU_SAN;
  }, [vatMocsGV]);

  const [buoc, setBuoc] = useState<1 | 2 | 3 | 4>(1);
  const [vatChon, setVatChon] = useState<VatMocItem>(dsVat[0]);
  const [tenTuNhap, setTenTuNhap] = useState('');
  const [cachDo, setCachDo] = useState<CachDoChieuCao>('mot-diem');

  // Bước 2: khoảng cách & chiều cao mắt
  const [dNhap, setDNhap] = useState('15');
  const [aNhap, setANhap] = useState('10');
  const [mNhap, setMNhap] = useState('1,5');
  const [buocChan, setBuocChan] = useState('20');
  const [doDaiBuoc, setDoDaiBuoc] = useState('0,75');

  // Bước 3: ngắm AR hoặc thanh trượt
  const [dungAR, setDungAR] = useState(false);
  const [arLoi, setArLoi] = useState<string | null>(null);
  const [canXinCamBienIOS, setCanXinCamBienIOS] = useState(false);
  const [camBienBat, setCamBienBat] = useState(false);
  const [gocTrucTiep, setGocTrucTiep] = useState(35);
  const [gocTrungVi, setGocTrungVi] = useState(35);
  const [onDinh, setOnDinh] = useState(true);
  const [doLech, setDoLech] = useState(0);
  const [nguonGoc, setNguonGoc] = useState<'cam-bien' | 'thanh-truot'>('thanh-truot');

  // Góc đã khoá
  const [alpha1Khoa, setAlpha1Khoa] = useState<number | null>(null);
  const [alpha2Khoa, setAlpha2Khoa] = useState<number | null>(null);

  // Bước 4: học sinh tự tính
  const [hNhap, setHNhap] = useState('');
  const [tangGoiY, setTangGoiY] = useState<0 | 1 | 2 | 3>(0);
  const [daNop, setDaNop] = useState(false);
  const [ketQuaNop, setKetQuaNop] = useState<{
    dung: boolean;
    hTinh: number;
    hHs: number;
    maLoi: string | null;
    saiSoPct: number | null;
  } | null>(null);
  const [dangLuu, setDangLuu] = useState(false);
  const [thongBaoLuu, setThongBaoLuu] = useState('');
  const [lichSu, setLichSu] = useState<BanGhiDoChieuCao[]>(lichSuBanDau);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mauGocRef = useRef<{ t: number; val: number }[]>([]);
  const gocThoGanNhatRef = useRef<number>(35);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(KHOA_DO_LECH);
      if (saved != null) {
        const n = Number(saved);
        if (Number.isFinite(n)) setDoLech(n);
      }
    } catch {
      /* trình duyệt chặn storage */
    }
  }, []);

  const dungCamera = useCallback(() => {
    if (streamRef.current) {
      for (const track of streamRef.current.getTracks()) {
        track.stop();
      }
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  useEffect(() => {
    const khiAn = () => {
      if (document.hidden) dungCamera();
    };
    document.addEventListener('visibilitychange', khiAn);
    return () => {
      document.removeEventListener('visibilitychange', khiAn);
      dungCamera();
    };
  }, [dungCamera]);

  useEffect(() => {
    if (buoc !== 3) {
      dungCamera();
    }
  }, [buoc, dungCamera]);

  const batAR = async () => {
    setArLoi(null);
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setDungAR(false);
      setNguonGoc('thanh-truot');
      setArLoi('Máy của em chưa đo được góc, em kéo thanh trượt hoặc dùng thước đo góc tự làm (xem hướng dẫn).');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setDungAR(true);
      setNguonGoc('cam-bien');

      const DOE = window.DeviceOrientationEvent as unknown as {
        requestPermission?: () => Promise<'granted' | 'denied'>;
      };
      if (typeof DOE?.requestPermission === 'function') {
        setCanXinCamBienIOS(true);
        setCamBienBat(false);
      } else if ('DeviceOrientationEvent' in window) {
        setCamBienBat(true);
      } else {
        setDungAR(false);
        setNguonGoc('thanh-truot');
        dungCamera();
        setArLoi('Máy của em chưa đo được góc, em kéo thanh trượt hoặc dùng thước đo góc tự làm (xem hướng dẫn).');
      }
    } catch {
      setDungAR(false);
      setNguonGoc('thanh-truot');
      setArLoi('Máy của em chưa đo được góc, em kéo thanh trượt hoặc dùng thước đo góc tự làm (xem hướng dẫn).');
    }
  };

  const xinQuyenIOS = async () => {
    try {
      const DOE = window.DeviceOrientationEvent as unknown as {
        requestPermission?: () => Promise<'granted' | 'denied'>;
      };
      const kq = await DOE?.requestPermission?.();
      if (kq === 'granted') {
        setCamBienBat(true);
        setCanXinCamBienIOS(false);
      } else {
        setDungAR(false);
        setNguonGoc('thanh-truot');
        dungCamera();
        setArLoi('Máy của em chưa đo được góc, em kéo thanh trượt hoặc dùng thước đo góc tự làm (xem hướng dẫn).');
      }
    } catch {
      setDungAR(false);
      setNguonGoc('thanh-truot');
      dungCamera();
    }
  };

  useEffect(() => {
    if (!dungAR || !camBienBat) return;
    let nhanDuLieu = false;
    const timeout = window.setTimeout(() => {
      if (!nhanDuLieu) {
        setDungAR(false);
        setNguonGoc('thanh-truot');
        dungCamera();
        setArLoi('Máy của em chưa đo được góc, em kéo thanh trượt hoặc dùng thước đo góc tự làm (xem hướng dẫn).');
      }
    }, 1800);

    const onOrient = (e: DeviceOrientationEvent) => {
      const ang = window.screen?.orientation?.angle ?? 0;
      const gTho = tinhGocNangTuCamBien(e.beta, e.gamma, ang);
      if (gTho == null) return;
      nhanDuLieu = true;
      gocThoGanNhatRef.current = gTho;
      const gHieuChinh = doLechHieuChinh(gTho, doLech);
      setGocTrucTiep(gHieuChinh);

      const now = Date.now();
      const moi = [...mauGocRef.current, { t: now, val: gHieuChinh }].filter((x) => now - x.t <= 1000);
      mauGocRef.current = moi;
      if (moi.length >= 2) {
        const vals = moi.map((x) => x.val);
        setGocTrungVi(trungViGoc(vals));
        setOnDinh(doDaoDongGoc(vals) < 1);
      } else {
        setGocTrungVi(gHieuChinh);
        setOnDinh(false);
      }
    };

    window.addEventListener('deviceorientation', onOrient);
    return () => {
      window.clearTimeout(timeout);
      window.removeEventListener('deviceorientation', onOrient);
    };
  }, [dungAR, camBienBat, doLech, dungCamera]);

  // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
  const dVal = Math.max(0.5, phanTichSoNhap(dNhap) ?? 15);
  // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
  const aVal = Math.max(0.5, phanTichSoNhap(aNhap) ?? 10);
  // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
  const mVal = Math.max(0, phanTichSoNhap(mNhap) ?? 1.5);

  const gocHienTai = nguonGoc === 'cam-bien' ? gocTrungVi : gocTrucTiep;
  // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
  const gocHienTaiHopLe = Math.max(1, Math.min(89, gocHienTai));

  const duLieu3D = useMemo(() => {
    if (cachDo === 'mot-diem') {
      const a1 = alpha1Khoa ?? gocHienTaiHopLe;
      let h = 10;
      try {
        h = chieuCaoMotDiem(dVal, a1, mVal);
      } catch {
        h = 10;
      }
      return {
        cachDo,
        d: dVal,
        alpha1: a1,
        m: mVal,
        h,
        daNop,
        loaiVat: vatChon.loaiVat,
      };
    }
    const a1 = alpha1Khoa ?? 55;
    const a2 = alpha2Khoa ?? 32;
    let h = 12;
    if (a1 > a2) {
      try {
        h = chieuCaoHaiDiem(aVal, a1, a2, mVal);
      } catch {
        h = 12;
      }
    }
    return {
      cachDo,
      d: dVal,
      a: aVal,
      alpha1: a1,
      alpha2: a2,
      m: mVal,
      h,
      daNop,
      loaiVat: vatChon.loaiVat,
    };
  }, [cachDo, dVal, aVal, mVal, alpha1Khoa, alpha2Khoa, gocHienTaiHopLe, daNop, vatChon.loaiVat]);

  const khoaGoc = () => {
    // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
    const g = Math.max(1, Math.min(89, Math.round(gocHienTaiHopLe * 10) / 10));
    if (cachDo === 'mot-diem') {
      setAlpha1Khoa(g);
    } else if (alpha1Khoa == null) {
      setAlpha1Khoa(g);
    } else {
      setAlpha2Khoa(g);
    }
    setDaNop(false);
    setKetQuaNop(null);
    setTangGoiY(0);
  };

  const datVe0Do = () => {
    const raw = gocThoGanNhatRef.current;
    setDoLech(raw);
    try {
      window.localStorage.setItem(KHOA_DO_LECH, String(raw));
    } catch {
      /* bỏ qua */
    }
  };

  const nopKetQua = async (e: React.FormEvent) => {
    e.preventDefault();
    const hHs = phanTichSoNhap(hNhap);
    if (hHs == null || hHs <= 0) {
      setThongBaoLuu('Em nhập số đo chiều cao tính được (ví dụ 13,05).');
      return;
    }
    if (alpha1Khoa == null || (cachDo === 'hai-diem' && alpha2Khoa == null)) {
      setThongBaoLuu('Em quay lại Bước 3 để khoá đủ góc ngắm trước nhé.');
      return;
    }
    if (cachDo === 'hai-diem' && alpha1Khoa <= (alpha2Khoa ?? 0)) {
      setThongBaoLuu('Ở cách đo 2 điểm, góc ở điểm gần (α₁) phải lớn hơn góc sau khi lùi (α₂). Em đo lại góc nhé.');
      return;
    }

    const hTinh =
      cachDo === 'mot-diem'
        ? chieuCaoMotDiem(dVal, alpha1Khoa, mVal)
        : chieuCaoHaiDiem(aVal, alpha1Khoa, alpha2Khoa!, mVal);
    const dung = kiemTraKetQuaHS(hHs, hTinh);
    const saiSoPct = vatChon.h_that && vatChon.h_that > 0 ? saiSoTuongDoi(hTinh, vatChon.h_that) : null;

    setDangLuu(true);
    setThongBaoLuu('');
    try {
      const res = await fetch('/api/do-chieu-cao', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vatId: vatChon.id.startsWith('mau-') ? null : vatChon.id,
          tenVat: tenTuNhap.trim() || vatChon.ten,
          cachDo,
          d: cachDo === 'mot-diem' ? dVal : null,
          a: cachDo === 'hai-diem' ? aVal : null,
          alpha1: alpha1Khoa,
          alpha2: cachDo === 'hai-diem' ? alpha2Khoa : null,
          m: mVal,
          hHsNhap: hHs,
          nguonGoc,
          doLechGoc: doLech,
          tangGoiYDaMo: tangGoiY > 0 ? tangGoiY : null,
        }),
      });
      const json = await res.json().catch(() => ({}));
      setDaNop(true);
      setKetQuaNop({
        dung,
        hTinh,
        hHs,
        maLoi: json?.maLoi ?? null,
        saiSoPct,
      });
      if (!dung) {
        setTangGoiY((prev) => (prev === 0 ? 1 : prev < 3 ? ((prev + 1) as 1 | 2 | 3) : 3));
      }
      if (json?.banGhi) {
        setLichSu((prev) => [json.banGhi, ...prev].slice(0, 8));
      }
      setThongBaoLuu(
        res.ok
          ? laHocSinh
            ? 'Đã ghi kết quả vào dữ liệu thực hành của lớp.'
            : 'Đã chạy thử xong công thức.'
          : json?.error || ''
      );
    } catch {
      setDaNop(true);
      setKetQuaNop({ dung, hTinh, hHs, maLoi: null, saiSoPct });
      if (!dung) setTangGoiY((prev) => (prev < 3 ? ((prev + 1) as 1 | 2 | 3) : 3));
    } finally {
      setDangLuu(false);
    }
  };

  const coTheMoBuoc4 =
    alpha1Khoa != null && (cachDo === 'mot-diem' || (alpha2Khoa != null && alpha1Khoa > alpha2Khoa));

  return (
    <div className="dcc-trang">
      {/* Thanh 4 bước */}
      <nav className="dcc-buoc-thanh" aria-label="4 bước đo chiều cao">
        {[
          [1, '① Chọn vật'],
          [2, '② Đo khoảng cách'],
          [3, '③ Khoá góc α'],
          [4, '④ Em tự tính h'],
        ].map(([soB, nhan]) => (
          <button
            key={soB}
            type="button"
            className={`dcc-buoc-btn${Number(soB) < buoc ? ' dcc-buoc-btn--xong' : ''}`}
            aria-current={buoc === soB ? 'step' : undefined}
            onClick={() => setBuoc(soB as 1 | 2 | 3 | 4)}
          >
            <span>{nhan}</span>
          </button>
        ))}
      </nav>

      {/* BƯỚC 1: CHỌN VẬT + AN TOÀN */}
      {buoc === 1 && (
        <section className="dcc-the">
          <div className="dcc-an-toan" role="note">
            <AnhChuDe src="/do-chieu-cao/ic-an-toan.webp" fallbackNode={<span>🛡️</span>} alt="" width={28} height={28} />
            <span>
              <b>An toàn khi đo:</b> Không đo khi đang đi trên đường có xe cộ, không leo trèo chỗ cao; nên đo ở sân trường khi có thầy cô hướng dẫn.
            </span>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <AnhChuDe src="/do-chieu-cao/buoc-1.webp" fallback={FALLBACK_C4} alt="" width={84} height={63} style={{ borderRadius: 10, objectFit: 'cover' }} />
            <div>
              <h2 style={{ margin: 0, fontSize: '1.05rem' }}>Bước 1 · Chọn vật cần đo chiều cao</h2>
              <p className="dcc-phu" style={{ margin: '2px 0 0' }}>
                Chọn vật đứng thẳng, nhìn rõ chân và đỉnh. Vật mốc của thầy cô sẽ giúp em kiểm tra sai số đo thật!
              </p>
            </div>
          </div>

          <div className="dcc-luoi-vat">
            {dsVat.map((v) => (
              <button
                key={v.id}
                type="button"
                className="dcc-vat"
                aria-pressed={vatChon.id === v.id}
                onClick={() => {
                  setVatChon(v);
                  if (v.cachDoGoiY) setCachDo(v.cachDoGoiY);
                }}
              >
                <AnhChuDe src={v.anh} fallback={FALLBACK_C4} alt={v.ten} width={220} height={110} />
                <b>{v.ten}</b>
                <small>
                  {v.h_that ? `Vật mốc của lớp · cao thật ${dinhDangSoVN(v.h_that)} m` : 'Thực hành đo ngoài thực tế'}
                </small>
              </button>
            ))}
          </div>

          <div className="dcc-o-nhap">
            <label>
              Hoặc ghi tên vật khác em đang đo (tuỳ chọn)
              <input
                type="text"
                value={tenTuNhap}
                onChange={(e) => setTenTuNhap(e.target.value)}
                placeholder={vatChon.ten}
              />
            </label>
          </div>

          <div className="dcc-hang-nut">
            <button type="button" className="primary" onClick={() => setBuoc(2)}>
              Sang Bước 2: Đo khoảng cách →
            </button>
          </div>
        </section>
      )}

      {/* BƯỚC 2: CHỌN CÁCH ĐO & NHẬP d / a, m */}
      {buoc === 2 && (
        <section className="dcc-the">
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <AnhChuDe src="/do-chieu-cao/buoc-2.webp" fallback={FALLBACK_C4} alt="" width={84} height={63} style={{ borderRadius: 10, objectFit: 'cover' }} />
            <div>
              <h2 style={{ margin: 0, fontSize: '1.05rem' }}>Bước 2 · Chọn cách đo &amp; nhập khoảng cách</h2>
              <p className="dcc-phu" style={{ margin: '2px 0 0' }}>
                Đo chiều cao tầm mắt <MathText inline>{'$m$'}</MathText> (từ mặt đất lên tới mắt em, thường khoảng <MathText inline>{'$1{,}4 - 1{,}6$'}</MathText> m).
              </p>
            </div>
          </div>

          <div className="dcc-che-do" role="group" aria-label="Hai cách đo">
            <button
              type="button"
              className="dcc-che-do-btn"
              aria-pressed={cachDo === 'mot-diem'}
              onClick={() => {
                setCachDo('mot-diem');
                setAlpha1Khoa(null);
                setAlpha2Khoa(null);
              }}
            >
              <AnhChuDe src="/do-chieu-cao/mot-diem.webp" fallback={FALLBACK_C4} alt="" width={240} height={135} />
              <b>Cách 1 · Đứng được tới chân vật</b>
              <small className="dcc-phu">Đo khoảng cách d từ chỗ đứng tới chân vật, ngắm 1 góc α.</small>
            </button>
            <button
              type="button"
              className="dcc-che-do-btn"
              aria-pressed={cachDo === 'hai-diem'}
              onClick={() => {
                setCachDo('hai-diem');
                setAlpha1Khoa(null);
                setAlpha2Khoa(null);
              }}
            >
              <AnhChuDe src="/do-chieu-cao/hai-diem.webp" fallback={FALLBACK_C4} alt="" width={240} height={135} />
              <b>Cách 2 · Không tới được chân vật</b>
              <small className="dcc-phu">Ngắm ở A được α₁, lùi thẳng thêm a mét tới B ngắm α₂ (công thức Bài 12).</small>
            </button>
          </div>

          <div className="dcc-o-nhap">
            {cachDo === 'mot-diem' ? (
              <label>
                <span className="dcc-nhan-ic">
                  <AnhChuDe src="/do-chieu-cao/ic-thuoc-day.webp" fallbackNode={<span>📏</span>} alt="Đo bằng thước dây" width={22} height={22} className="dcc-ic" loading="lazy" />
                  Khoảng cách d (mét)
                </span>
                <input
                  inputMode="decimal"
                  value={dNhap}
                  onChange={(e) => setDNhap(e.target.value)}
                  placeholder="Ví dụ: 15"
                />
              </label>
            ) : (
              <label>
                <span className="dcc-nhan-ic">
                  <AnhChuDe src="/do-chieu-cao/ic-thuoc-day.webp" fallbackNode={<span>📏</span>} alt="Đo bằng thước dây" width={22} height={22} className="dcc-ic" loading="lazy" />
                  Khoảng lùi thẳng từ A ra B: a (mét)
                </span>
                <input
                  inputMode="decimal"
                  value={aNhap}
                  onChange={(e) => setANhap(e.target.value)}
                  placeholder="Ví dụ: 10"
                />
              </label>
            )}
            <label>
              Chiều cao mắt m (mét)
              <input
                inputMode="decimal"
                value={mNhap}
                onChange={(e) => setMNhap(e.target.value)}
                placeholder="Ví dụ: 1,5"
              />
            </label>
          </div>

          <details className="dcc-giac-ke">
            <summary style={{ cursor: 'pointer', fontWeight: 700, fontSize: 13.5 }}>
              <span className="dcc-btn-ic" style={{ verticalAlign: 'middle' }}>
                <AnhChuDe src="/do-chieu-cao/ic-buoc-chan.webp" fallbackNode={<span>👣</span>} alt="Đo bằng bước chân" width={22} height={22} className="dcc-ic" loading="lazy" />
                <span>Không có thước dây? Quy đổi từ số bước chân</span>
              </span>
            </summary>
            <div className="dcc-o-nhap" style={{ marginTop: 8 }}>
              <label>
                Số bước chân em đếm được
                <input inputMode="decimal" value={buocChan} onChange={(e) => setBuocChan(e.target.value)} />
              </label>
              <label>
                Độ dài 1 bước (mét)
                <input inputMode="decimal" value={doDaiBuoc} onChange={(e) => setDoDaiBuoc(e.target.value)} />
              </label>
            </div>
            <button
              type="button"
              className="nho phu"
              style={{ marginTop: 8 }}
              onClick={() => {
                const s = (phanTichSoNhap(buocChan) ?? 0) * (phanTichSoNhap(doDaiBuoc) ?? 0.75);
                // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
                const val = dinhDangSoVN(Math.max(1, s), 2);
                if (cachDo === 'mot-diem') setDNhap(val);
                else setANhap(val);
              }}
            >
              Áp dụng khoảng cách đã quy đổi
            </button>
          </details>

          <div className="dcc-hang-nut">
            <button type="button" className="nho phu" onClick={() => setBuoc(1)}>← Bước 1</button>
            <button type="button" className="primary" onClick={() => setBuoc(3)}>
              Sang Bước 3: Ngắm và khoá góc →
            </button>
          </div>
        </section>
      )}

      {/* BƯỚC 3: NGẮM AR / THANH TRƯỢT + DỰNG CẢNH 3D */}
      {buoc === 3 && (
        <section className="dcc-the">
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <AnhChuDe src="/do-chieu-cao/buoc-3.webp" fallback={FALLBACK_C4} alt="" width={84} height={63} style={{ borderRadius: 10, objectFit: 'cover' }} />
            <div>
              <h2 style={{ margin: 0, fontSize: '1.05rem' }}>Bước 3 · Ngắm đỉnh vật &amp; khoá góc α</h2>
              <p className="dcc-phu" style={{ margin: '2px 0 0' }}>
                {cachDo === 'mot-diem'
                  ? 'Đặt tâm ngắm (+) đúng vào đỉnh vật rồi bấm Khoá góc.'
                  : alpha1Khoa == null
                    ? 'Đứng ở điểm A (gần hơn) ngắm đỉnh vật để khoá góc α₁.'
                    : `Đã khoá α₁ = ${dinhDangSoVN(alpha1Khoa, 1)}°. Giờ lùi thêm ${dinhDangSoVN(aVal, 1)} m tới B ngắm để khoá α₂ (< α₁).`}
              </p>
            </div>
          </div>

          <div className="dcc-hang-nut">
            <button
              type="button"
              className={(nguonGoc === 'cam-bien' ? 'primary' : 'nho phu') + ' dcc-btn-ic'}
              onClick={() => void batAR()}
            >
              <AnhChuDe src="/do-chieu-cao/ic-camera.webp" fallbackNode={<span>📷</span>} alt="Bật camera ngắm góc" width={22} height={22} className="dcc-ic" loading="lazy" />
              Bật camera &amp; cảm biến AR
            </button>
            <button
              type="button"
              className={(nguonGoc === 'thanh-truot' ? 'primary' : 'nho phu') + ' dcc-btn-ic'}
              onClick={() => {
                dungCamera();
                setDungAR(false);
                setNguonGoc('thanh-truot');
              }}
            >
              <AnhChuDe src="/do-chieu-cao/ic-cam-bien.webp" fallbackNode={<span>📐</span>} alt="Cảm biến góc nghiêng hoặc giác kế" width={22} height={22} className="dcc-ic" loading="lazy" />
              Dùng thanh trượt / giác kế tự làm
            </button>
            {canXinCamBienIOS && dungAR && (
              <button type="button" className="nho dcc-btn-ic" onClick={() => void xinQuyenIOS()}>
                <AnhChuDe src="/do-chieu-cao/ic-cam-bien.webp" fallbackNode={<span>🧭</span>} alt="Bật cảm biến góc (iOS)" width={22} height={22} className="dcc-ic" loading="lazy" />
                Bật cảm biến (iOS)
              </button>
            )}
          </div>

          {arLoi && (
            <div className="dcc-goi-y" role="status">
              {arLoi}
            </div>
          )}

          {dungAR ? (
            <>
              <div className="dcc-ar-khung">
                <video ref={videoRef} autoPlay playsInline muted className="dcc-ar-video" />
                <div className="dcc-ar-chan-troi" aria-hidden="true" />
                <div className="dcc-ar-tam" aria-hidden="true" />
                <div className="dcc-ar-goc-so">α = {dinhDangSoVN(gocHienTaiHopLe, 1)}°</div>
                <div className="dcc-ar-on">
                  {onDinh ? '✓ Tay đang vững (< 1°)' : '⏳ Giữ máy yên 1 giây…'}
                </div>
              </div>
              <p className="dcc-rieng-tu">
                🔒 Riêng tư: Hình camera chỉ hiện trên máy, không chụp, không lưu, không gửi đi.
              </p>
              <div className="dcc-hang-nut">
                <button type="button" className="nho phu" onClick={datVe0Do}>
                  Đặt về 0° (hiệu chỉnh ngang tầm mắt)
                </button>
              </div>
            </>
          ) : (
            <div className="dcc-truot">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                <span>Góc nâng α (hoặc đọc từ giác kế tự làm):</span>
                <b style={{ fontSize: '1.15rem', color: '#255f3d' }}>{dinhDangSoVN(gocTrucTiep, 1)}°</b>
              </div>
              <div className="dcc-truot__hang">
                <button
                  type="button"
                  className="dcc-truot__nut"
                  aria-label="Giảm góc 1 độ"
                  disabled={gocTrucTiep <= 1}
                  onClick={() => setGocTrucTiep((v) => Math.max(1, v - 1))}
                >
                  −
                </button>
                <input
                  type="range"
                  min={1}
                  max={89}
                  step={0.5}
                  value={gocTrucTiep}
                  onChange={(e) => setGocTrucTiep(Number(e.target.value))}
                  aria-label="Chọn góc nâng alpha từ 1 đến 89 độ"
                />
                <button
                  type="button"
                  className="dcc-truot__nut"
                  aria-label="Tăng góc 1 độ"
                  disabled={gocTrucTiep >= 89}
                  onClick={() => setGocTrucTiep((v) => Math.min(89, v + 1))}
                >
                  +
                </button>
              </div>
              <details className="dcc-giac-ke">
                <summary style={{ cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>
                  📏 Cách tự làm giác kế bằng thước đo góc, ống hút, dây dọi
                </summary>
                <div style={{ display: 'grid', gap: 8, marginTop: 8 }}>
                  <AnhChuDe src="/do-chieu-cao/giac-ke-tu-lam.webp" fallback={FALLBACK_C4} alt="Giác kế tự làm" width={420} height={236} />
                  <AnhChuDe src="/do-chieu-cao/giac-ke-cach-lam.webp" fallbackNode={null} alt="3 bước làm giác kế" width={420} height={236} />
                  <p className="dcc-phu" style={{ margin: 0 }}>
                    Dán ống hút dọc mép thẳng của thước đo góc, buộc sợi dây có vật nặng ở tâm thước. Ngắm đỉnh vật qua ống hút, đọc góc lệch so với đường thẳng đứng (90° − số đọc = góc nâng α).
                  </p>
                </div>
              </details>
            </div>
          )}

          <div className="dcc-hang-nut">
            <button
              type="button"
              className="primary dcc-btn-ic"
              disabled={nguonGoc === 'cam-bien' && !onDinh}
              onClick={khoaGoc}
            >
              <AnhChuDe src="/do-chieu-cao/ic-khoa-goc.webp" fallbackNode={<span>🔒</span>} alt="Khoá góc nâng" width={22} height={22} className="dcc-ic" loading="lazy" />
              {cachDo === 'mot-diem'
                ? 'Khoá góc α'
                : alpha1Khoa == null
                  ? 'Khoá góc α₁ (điểm gần)'
                  : 'Khoá góc α₂ (điểm xa)'}
            </button>
            {(alpha1Khoa != null || alpha2Khoa != null) && (
              <button
                type="button"
                className="nho phu"
                onClick={() => {
                  setAlpha1Khoa(null);
                  setAlpha2Khoa(null);
                  setDaNop(false);
                }}
              >
                Đo lại góc
              </button>
            )}
          </div>

          {(alpha1Khoa != null || nguonGoc === 'thanh-truot') && (
            <div style={{ display: 'grid', gap: 6 }}>
              <div className="dcc-phu">
                {alpha1Khoa != null && (
                  <b>
                    Đã khoá {cachDo === 'mot-diem' ? `α = ${dinhDangSoVN(alpha1Khoa, 1)}°` : `α₁ = ${dinhDangSoVN(alpha1Khoa, 1)}°`}
                    {cachDo === 'hai-diem' && alpha2Khoa != null ? `, α₂ = ${dinhDangSoVN(alpha2Khoa, 1)}°` : ''}
                  </b>
                )}
              </div>
              {cachDo === 'hai-diem' && alpha1Khoa != null && alpha2Khoa != null && alpha1Khoa <= alpha2Khoa && (
                <p role="alert" style={{ color: '#b42318', fontWeight: 700, margin: 0 }}>
                  ⚠️ Góc ở vị trí xa α₂ ({dinhDangSoVN(alpha2Khoa, 1)}°) đang lớn hơn hoặc bằng α₁ ({dinhDangSoVN(alpha1Khoa, 1)}°). Em hãy đo lại vì càng lùi xa góc nâng càng nhỏ!
                </p>
              )}
              <Canh3D duLieu={duLieu3D} />
            </div>
          )}

          <div className="dcc-hang-nut">
            <button type="button" className="nho phu" onClick={() => setBuoc(2)}>← Bước 2</button>
            <button
              type="button"
              className="primary"
              disabled={!coTheMoBuoc4}
              onClick={() => setBuoc(4)}
            >
              Sang Bước 4: Tự tính h →
            </button>
          </div>
        </section>
      )}

      {/* BƯỚC 4: EM TỰ TÍNH h, GỢI Ý THEO BẬC, SO VẬT MỐC */}
      {buoc === 4 && (
        <section className="dcc-the">
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <AnhChuDe src="/do-chieu-cao/buoc-4.webp" fallback={FALLBACK_C4} alt="" width={84} height={63} style={{ borderRadius: 10, objectFit: 'cover' }} />
            <div>
              <h2 style={{ margin: 0, fontSize: '1.05rem' }}>Bước 4 · Em tự tính chiều cao {tenTuNhap.trim() || vatChon.ten}</h2>
              <p className="dcc-phu" style={{ margin: '2px 0 0' }}>
                Số liệu em vừa đo:{' '}
                {cachDo === 'mot-diem'
                  ? `d = ${dinhDangSoVN(dVal, 2)} m, α = ${dinhDangSoVN(alpha1Khoa ?? 35, 1)}°, m = ${dinhDangSoVN(mVal, 2)} m.`
                  : `a = ${dinhDangSoVN(aVal, 2)} m, α₁ = ${dinhDangSoVN(alpha1Khoa ?? 55, 1)}°, α₂ = ${dinhDangSoVN(alpha2Khoa ?? 32, 1)}°, m = ${dinhDangSoVN(mVal, 2)} m.`}
              </p>
            </div>
          </div>

          <Canh3D duLieu={duLieu3D} />

          {/* Khối giao diện: Biểu mẫu nhập liệu */}
          <form onSubmit={nopKetQua} style={{ display: 'grid', gap: 10 }}>
            <div className="dcc-o-nhap">
              <label>
                Kết quả chiều cao h em tính được (mét, dùng dấu phẩy thập phân)
                <input
                  inputMode="decimal"
                  value={hNhap}
                  onChange={(e) => setHNhap(e.target.value)}
                  placeholder="Ví dụ: 13,05"
                />
              </label>
            </div>
            <div className="dcc-hang-nut">
              <button type="submit" className="primary" disabled={dangLuu}>
                {dangLuu ? 'Đang kiểm tra…' : 'Kiểm tra & Lưu kết quả'}
              </button>
              <button
                type="button"
                className="nho phu"
                onClick={() => setTangGoiY((prev) => (prev < 3 ? ((prev + 1) as 1 | 2 | 3) : 3))}
              >
                💡 {tangGoiY === 0 ? 'Xin gợi ý tầng 1' : tangGoiY < 3 ? `Xem thêm gợi ý tầng ${tangGoiY + 1}/3` : 'Đã mở đủ 3 tầng'}
              </button>
            </div>
          </form>

          {tangGoiY > 0 && (
            <div className="dcc-goi-y" role="status">
              {[1, 2, 3]
                .filter((t) => t <= tangGoiY)
                .map((t) => (
                  <p key={t} style={{ margin: '4px 0' }}>
                    <b>Gợi ý tầng {t}:</b>{' '}
                    <MathText>
                      {goiYDoChieuCaoTheoTang(t as 1 | 2 | 3, {
                        cachDo,
                        d: dVal,
                        a: aVal,
                        alpha1: alpha1Khoa ?? 35,
                        alpha2: alpha2Khoa ?? 25,
                        m: mVal,
                      })}
                    </MathText>
                  </p>
                ))}
            </div>
          )}

          {ketQuaNop && (
            <div className={`dcc-ket${ketQuaNop.dung ? '' : ' dcc-ket--sai'}`} role="status">
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <AnhChuDe
                  src={
                    ketQuaNop.dung
                      ? ketQuaNop.saiSoPct != null && ketQuaNop.saiSoPct > 5
                        ? '/do-chieu-cao/ket-qua-gan.webp'
                        : '/do-chieu-cao/ket-qua-dung.webp'
                      : '/do-chieu-cao/ket-qua-xa.webp'
                  }
                  fallback={
                    ketQuaNop.dung ? '/minh-hoa/nv/reo-ho.webp' : '/minh-hoa/nv/suy-nghi.webp'
                  }
                  alt=""
                  width={72}
                  height={72}
                />
                <div>
                  <b style={{ fontSize: '1.05rem' }}>
                    {ketQuaNop.dung
                      ? `🎉 Tuyệt vời! Em tính đúng chiều cao theo số đo là ${dinhDangSoVN(ketQuaNop.hTinh, 2)} m.`
                      : `Chưa khớp số liệu đo (${dinhDangSoVN(ketQuaNop.hHs, 2)} m). Em xem gợi ý ở trên để tính lại nhé!`}
                  </b>
                  {ketQuaNop.maLoi && (
                    <p className="dcc-phu" style={{ margin: '4px 0 0' }}>
                      Lỗi dễ mắc ({ketQuaNop.maLoi}): đã ghi vào <a href="/so-loi">Sổ lỗi của em</a>.
                    </p>
                  )}
                </div>
              </div>

              {vatChon.h_that && vatChon.h_that > 0 && (
                <div style={{ background: '#fff', borderRadius: 10, padding: '8px 10px', border: '1px solid #cbd5e1' }}>
                  <p style={{ margin: 0, fontWeight: 700 }}>
                    Em đo được {dinhDangSoVN(ketQuaNop.hTinh, 2)} m, chiều cao thật {dinhDangSoVN(vatChon.h_that, 2)} m, sai số{' '}
                    {dinhDangSoVN(ketQuaNop.saiSoPct, 1)}%.
                  </p>
                  <p className="dcc-phu" style={{ margin: '4px 0 0' }}>
                    Mẹo giảm sai số: đứng xa vật hơn một chút (góc khoảng 30°–60°), khoá góc khi tay giữ vững, đo 3 lần rồi lấy trung bình cộng.
                  </p>
                </div>
              )}
              {thongBaoLuu && <p className="dcc-phu" style={{ margin: 0 }}>{thongBaoLuu}</p>}
            </div>
          )}

          <div className="dcc-hang-nut">
            <button type="button" className="nho phu" onClick={() => setBuoc(3)}>← Quay lại Bước 3</button>
            <button
              type="button"
              className="nho phu"
              onClick={() => {
                setHNhap('');
                setDaNop(false);
                setKetQuaNop(null);
                setTangGoiY(0);
                setBuoc(1);
              }}
            >
              🔄 Thực hiện phép đo mới
            </button>
          </div>
        </section>
      )}

      {lichSu.length > 0 && (
        <section className="dcc-the">
          <h3 style={{ margin: 0, fontSize: '0.98rem' }}>Các lần đo gần đây của em</h3>
          <div style={{ overflowX: 'auto' }}>
            {/* Khối giao diện: Bảng số liệu tổng hợp */}
            <table style={{ width: '100%', fontSize: 13 }}>
              <thead>
                <tr>
                  <th>Vật đo</th>
                  <th>Cách</th>
                  <th>α</th>
                  <th>h tính (m)</th>
                  <th>Tự tính</th>
                </tr>
              </thead>
              <tbody>
                {lichSu.map((r) => (
                  <tr key={r.id}>
                    <td>{r.ten_vat}</td>
                    <td>{r.cach_do === 'hai-diem' ? '2 điểm' : '1 điểm'}</td>
                    <td>{dinhDangSoVN(r.alpha1, 1)}°{r.alpha2 ? ` / ${dinhDangSoVN(r.alpha2, 1)}°` : ''}</td>
                    <td>{dinhDangSoVN(r.h_tinh, 2)}</td>
                    <td>{r.hs_dung ? '✓ Đúng' : 'Cần sửa'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
