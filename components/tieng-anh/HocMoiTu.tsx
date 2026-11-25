'use client';

/**
 * FILE NÀY LÀM GÌ: Component React giao diện hiển thị và xử lý tương tác của người dùng trên trình duyệt.
 * AI DÙNG: học sinh
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: @/components/MathText, @/components/AnhChuDe, @/lib/chuDeChuong, @/lib/giongDoc, @/lib/tiengAnhMoiTu
 */
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import MathText from '@/components/MathText';
import AnhChuDe, { AnhNenChuong } from '@/components/AnhChuDe';
import { chuDeChuong } from '@/lib/chuDeChuong';
import { noi } from '@/lib/giongDoc';
import {
  BAI_CO_HINH,
  CHE_DO,
  MINI_DE_C1,
  NHOM_TAB,
  TONG_SO_TU,
  capNhatSRS,
  danhDauThuoc,
  docTienDoTA,
  layBai,
  layNhomNoiDung,
  layTuBai,
  layTuCanOn,
  type CheDoId,
  type NhomTabId,
  type TienDoTA
} from '@/lib/tiengAnhMoiTu';
import './moi-tu.css';

/**
 * Component React `renderNhan`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
function renderNhan(nhan: string) {
  // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
  return nhan.split(/(-|\s+)/).map((part, idx) => {
    // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
    const clean = part.replace(/[^A-Za-z]/g, '');
    if (clean.length > 0 && clean === clean.toUpperCase()) {
      return <strong key={idx}>{part}</strong>;
    }
    return <span key={idx}>{part}</span>;
  });
}

/**
 * Component React `tachBanDich`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
function tachBanDich(text: string): [string, string | null] {
  const idx = text.indexOf(' — ');
  if (idx < 0) return [text, null];
  const left = text.slice(0, idx).trim();
  const right = text.slice(idx + 3).trim();
  return right ? [left, right] : [text, null];
}

/**
 * Component React `ThanhCuonNgang`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
function ThanhCuonNgang({
  role,
  label,
  children,
}: {
  role: 'toolbar' | 'tablist';
  label: string;
  children: React.ReactNode;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const cuon = (dx: number) => {
    trackRef.current?.scrollBy({ left: dx, behavior: 'smooth' });
  };
  return (
    <div className="mt-cuon-boc">
      <button
        type="button"
        className="mt-cuon-nut"
        onClick={() => cuon(-140)}
        aria-label={`Cuộn sang trái (${label})`}
      >
        ‹
      </button>
      <div className="mt-cuon-track">
        <div ref={trackRef} className="mt-thanh-cuon" role={role} aria-label={label}>
          {children}
        </div>
      </div>
      <button
        type="button"
        className="mt-cuon-nut"
        onClick={() => cuon(140)}
        aria-label={`Cuộn sang phải (${label})`}
      >
        ›
      </button>
    </div>
  );
}

/**
 * Component React `xaoTron`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
function xaoTron<T>(arr: T[], seed: number): T[] {
  const out = [...arr];
  let s = seed + 1;
  for (let i = out.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) >>> 0;
    const j = s % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Component React `HocMoiTu`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export default function HocMoiTu({
  baiSo = 1,
  slugBanDau,
  nhomBanDau
}: {
  baiSo?: number;
  slugBanDau?: string;
  nhomBanDau?: string;
}) {
  const bai = useMemo(() => layBai(baiSo) ?? layBai(1)!, [baiSo]);
  const dsTu = useMemo(() => layTuBai(bai.baiSo), [bai.baiSo]);
  const cd = useMemo(() => chuDeChuong(bai.chuong), [bai.chuong]);

  const idxBanDau = useMemo(() => {
    if (!slugBanDau) return 0;
    const found = dsTu.findIndex((t) => t.slug === slugBanDau.toLowerCase());
    return found >= 0 ? found : 0;
  }, [dsTu, slugBanDau]);

  const [chiSo, setChiSo] = useState(idxBanDau);
  const [cheDo, setCheDo] = useState<CheDoId>('hoc');
  const [nhomTab, setNhomTab] = useState<NhomTabId>(() => {
    const hop = NHOM_TAB.find((x) => x.id === nhomBanDau)?.id;
    return hop ?? 'tu-vung';
  });
  const [subTab, setSubTab] = useState<'vd' | 'pb' | '30s'>('vd');
  const [latNghia, setLatNghia] = useState(false);

  // Tiến độ SRS & chuỗi ngày trong localStorage
  const [td, setTd] = useState<TienDoTA>({ thuoc: [], srs: {}, chuoi: 0, ngayCuoi: '' });
  useEffect(() => {
    setTd(docTienDoTA());
  }, []);

  // Kiểm tra trình duyệt có hỗ trợ Web Speech Recognition hay không
  const [coSpeechRec, setCoSpeechRec] = useState(false);
  useEffect(() => {
    const w = window as unknown as Record<string, unknown>;
    setCoSpeechRec(Boolean(w.SpeechRecognition || w.webkitSpeechRecognition));
  }, []);

  // Trạng thái nhận diện giọng nói
  const [dangNgheNoi, setDangNgheNoi] = useState(false);
  const [ketQuaNoi, setKetQuaNoi] = useState('');

  // Luyện nhanh 30 giây trong thẻ Học
  const [giay30, setGiay30] = useState(30);
  const [dangChay30, setDangChay30] = useState(false);
  const [buoc30, setBuoc30] = useState<1 | 2 | 3>(1);
  const [diem30, setDiem30] = useState(0);
  const [go30, setGo30] = useState('');

  // Chế độ Thẻ lật / Nghe chọn / Nghe viết / Ghép cặp / Xếp câu / Ôn hôm nay
  const [theMatSau, setTheMatSau] = useState(false);
  const [chonNghe, setChonNghe] = useState<string | null>(null);
  const [goViet, setGoViet] = useState('');
  const [baoViet, setBaoViet] = useState<string | null>(null);
  const [ghepChonEn, setGhepChonEn] = useState<string | null>(null);
  const [ghepXong, setGhepXong] = useState<string[]>([]);
  const [ghepLoi, setGhepLoi] = useState('');
  const [xepChon, setXepChon] = useState<number[]>([]);
  const [baoXep, setBaoXep] = useState<string | null>(null);
  const [onIdx, setOnIdx] = useState(0);
  const [onLat, setOnLat] = useState(false);

  // Nhóm nội dung B-G và I Mini đề
  const [nhomIdx, setNhomIdx] = useState(0);
  const [miniIdx, setMiniIdx] = useState(0);
  const [miniChon, setMiniChon] = useState<Record<string, number>>({});
  const [miniHienVi, setMiniHienVi] = useState(false);

  const tu = dsTu[chiSo] ?? dsTu[0];

  // Đổi URL nhẹ khi chuyển từ mà không reload trang
  const dongBoUrl = useCallback(
    (indexMoi: number) => {
      const target = dsTu[indexMoi];
      if (!target || typeof window === 'undefined') return;
      const urlMoi = `/tieng-anh/${bai.baiSo}/${target.slug}`;
      window.history.replaceState(null, '', urlMoi);
    },
    [bai.baiSo, dsTu]
  );

  const resetTheoTu = useCallback(() => {
    setLatNghia(false);
    setKetQuaNoi('');
    setTheMatSau(false);
    setChonNghe(null);
    setGoViet('');
    setBaoViet(null);
    setXepChon([]);
    setBaoXep(null);
    setDangChay30(false);
    setGiay30(30);
    setBuoc30(1);
    setDiem30(0);
    setGo30('');
  }, []);

  const sangTu = useCallback(
    (indexMoi: number) => {
      if (!dsTu.length) return;
      // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
      const bounded = Math.max(0, Math.min(dsTu.length - 1, indexMoi));
      setChiSo(bounded);
      resetTheoTu();
      dongBoUrl(bounded);
    },
    [dsTu.length, dongBoUrl, resetTheoTu]
  );

  const dsNhom = useMemo(
    () => (nhomTab === 'tu-vung' || nhomTab === 'I' ? [] : layNhomNoiDung(nhomTab)),
    [nhomTab]
  );

  const lui = useCallback(() => {
    if (nhomTab === 'tu-vung') {
      // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
      if (cheDo === 'on-hom-nay') setOnIdx((x) => Math.max(0, x - 1));
      else sangTu(chiSo - 1);
    } else if (nhomTab === 'I') {
      // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
      setMiniIdx((x) => Math.max(0, x - 1));
    } else {
      // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
      setNhomIdx((x) => Math.max(0, x - 1));
    }
  }, [nhomTab, cheDo, sangTu, chiSo]);

  const tien = useCallback(() => {
    if (nhomTab === 'tu-vung') {
      if (cheDo === 'on-hom-nay') setOnIdx((x) => x + 1);
      else sangTu(chiSo + 1);
    } else if (nhomTab === 'I') {
      // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
      setMiniIdx((x) => Math.min(MINI_DE_C1.length - 1, x + 1));
    } else {
      // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
      setNhomIdx((x) => Math.min(dsNhom.length - 1, x + 1));
    }
  }, [nhomTab, cheDo, sangTu, chiSo, dsNhom.length]);

  // Hỗ trợ phím mũi tên trái / phải
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.key === 'ArrowLeft') lui();
      if (e.key === 'ArrowRight') tien();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lui, tien]);

  // Vuốt ngang trên điện thoại
  const touchX = useRef<number | null>(null);
  function batDauVuot(e: React.TouchEvent) {
    touchX.current = e.touches[0]?.clientX ?? null;
  }
  function ketThucVuot(e: React.TouchEvent) {
    if (touchX.current == null) return;
    const dx = (e.changedTouches[0]?.clientX ?? touchX.current) - touchX.current;
    touchX.current = null;
    // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
    if (Math.abs(dx) < 48) return;
    if (dx < 0) tien();
    else lui();
  }

  // Đếm ngược luyện nhanh 30 giây
  useEffect(() => {
    if (!dangChay30) return;
    if (giay30 <= 0) {
      setDangChay30(false);
      setBuoc30(3);
      return;
    }
    const id = window.setTimeout(() => setGiay30((g) => g - 1), 1000);
    return () => window.clearTimeout(id);
  }, [dangChay30, giay30]);

  function phatAm(text: string, slow = false) {
    noi(text, 'en-US', { rate: slow ? 0.72 : 1 });
  }

  function luyenNoi(mucTieu: string) {
    const w = window as unknown as Record<string, any>;
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) {
      setKetQuaNoi('Trình duyệt chưa hỗ trợ thu âm; hãy mở trên Chrome để luyện nói.');
      return;
    }
    try {
      const rec = new SR();
      rec.lang = 'en-US';
      rec.interimResults = false;
      rec.maxAlternatives = 2;
      setDangNgheNoi(true);
      setKetQuaNoi('Đang nghe...');
      rec.onresult = (ev: any) => {
        const heard = String(ev?.results?.[0]?.[0]?.transcript ?? '').trim();
        // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
        const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();
        const dung = norm(heard) === norm(mucTieu) || norm(heard).includes(norm(mucTieu));
        setKetQuaNoi(
          dung
            ? `✓ Chuẩn! Em đọc: "${heard}"`
            : `Nghe được "${heard || '—'}". Thử đọc lại chậm hơn nhé!`
        );
        if (dung && tu) setTd((prev) => capNhatSRS(prev, tu.slug, true));
      };
      rec.onerror = () => {
        setKetQuaNoi('Chưa thu được giọng nói. Kiểm tra micro rồi thử lại.');
        setDangNgheNoi(false);
      };
      rec.onend = () => setDangNgheNoi(false);
      rec.start();
    } catch {
      setDangNgheNoi(false);
      setKetQuaNoi('Không khởi động được micro trên trình duyệt này.');
    }
  }

  // 4 phương án cho Nghe chọn & 30 giây
  const bonPhuongAn = useMemo(() => {
    if (!tu) return [];
    const khac = xaoTron(
      dsTu.filter((x) => x.slug !== tu.slug),
      chiSo * 17 + bai.baiSo
    ).slice(0, 3);
    return xaoTron([tu, ...khac], chiSo * 31 + 7);
  }, [dsTu, tu, chiSo, bai.baiSo]);

  // Ghép cặp 4 từ quanh vị trí hiện tại
  const bonCap = useMemo(() => {
    // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
    const start = Math.max(0, Math.min(dsTu.length - 4, chiSo));
    return dsTu.slice(start, start + 4);
  }, [dsTu, chiSo]);
  const capBenPhai = useMemo(() => xaoTron(bonCap, chiSo * 19 + 3), [bonCap, chiSo]);

  // Xếp câu từ câu ví dụ đề thi
  const tuCuaCau = useMemo(() => {
    if (!tu) return { goc: [] as string[], xao: [] as string[] };
    // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
    const clean = (tu.de || tu.cau).replace(/\$/g, '').replace(/[.,?!]+$/, '').trim();
    // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
    const goc = clean.split(/\s+/).filter(Boolean).slice(0, 10);
    return { goc, xao: xaoTron(goc, chiSo * 23 + 5) };
  }, [tu, chiSo]);

  // Ôn hôm nay (SRS 1–3–7 ngày)
  const dsOnHomNay = useMemo(() => layTuCanOn(dsTu, td), [dsTu, td]);
  // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
  const tuOn = dsOnHomNay[onIdx % Math.max(1, dsOnHomNay.length)] ?? tu;

  if (!tu) {
    return <div className="mt-khung"><p>Chưa có từ vựng cho bài này.</p></div>;
  }

  const daThuoc = td.thuoc.includes(tu.slug);
  // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
  const tiLeBai = Math.round(((chiSo + 1) / dsTu.length) * 100);
  const style = cd ? ({ ['--mau-chuong' as string]: cd.mau } as CSSProperties) : undefined;

  return (
    <div className="mt-khung" style={style}>
      {cd && <AnhNenChuong src={cd.tranh} fallback="/canh/tieng-anh.webp" />}

      {/* Thanh trên: đếm từ + chọn bài mẫu C1 + chuỗi ngày + đã thuộc/275 + Xem tất cả */}
      <div className="mt-top">
        <div className="mt-top__trai">
          <span className="mt-dem">
            Từ {chiSo + 1}/{dsTu.length} · Bài {bai.baiSo}
          </span>
          <div className="mt-bai-ds" role="navigation" aria-label="Chọn bài Chương I–IV">
            {BAI_CO_HINH.map((bSo) => (
              <a
                key={bSo}
                href={`/tieng-anh/${bSo}`}
                className={`mt-bai-nut${bSo === bai.baiSo ? ' mt-bai-nut--dang' : ''}`}
              >
                Bài {bSo}
              </a>
            ))}
          </div>
        </div>
        <div className="mt-top__phai">
          <span className="mt-chip" title="Chuỗi ngày luyện liên tiếp">🔥 {td.chuoi} ngày</span>
          <span className="mt-chip" title="Số từ đã đánh dấu thuộc">
            ⭐ đã thuộc {td.thuoc.length}/{TONG_SO_TU}
          </span>
          <a className="mt-xem-tat-ca" href="/tieng-anh?xem=tat-ca">Xem tất cả</a>
        </div>
      </div>

      {/* Thanh tiến độ bài */}
      <div className="mt-tien-do" aria-label={`Tiến độ Bài ${bai.baiSo}: ${tiLeBai}%`}>
        <i style={{ width: `${tiLeBai}%` }} />
      </div>

      {/* Thanh 8 chế độ */}
      {nhomTab === 'tu-vung' && (
        <ThanhCuonNgang role="toolbar" label="Chế độ học từ vựng">
          {CHE_DO.map((m) => (
            <button
              key={m.id}
              type="button"
              className="mt-pill-btn"
              aria-pressed={cheDo === m.id}
              onClick={() => {
                setCheDo(m.id);
                setGhepXong([]);
                setGhepChonEn(null);
                setGhepLoi('');
                setOnLat(false);
                if (m.id === 'nghe-chon' || m.id === 'nghe-viet') phatAm(tu.en);
              }}
            >
              <AnhChuDe
                src={m.imgSrc}
                fallbackNode={<span aria-hidden="true">{m.icon}</span>}
                alt=""
                width={18}
                height={18}
              />
              <span>{m.ten}</span>
            </button>
          ))}
        </ThanhCuonNgang>
      )}

      {/* Thanh nhóm nội dung B–G + I Mini đề */}
      <ThanhCuonNgang role="tablist" label="Nhóm nội dung Tiếng Anh Toán">
        {NHOM_TAB.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className="mt-pill-btn"
            aria-pressed={nhomTab === tab.id}
            onClick={() => {
              setNhomTab(tab.id);
              setNhomIdx(0);
              setMiniIdx(0);
            }}
          >
            {tab.ten}
          </button>
        ))}
      </ThanhCuonNgang>

      {/* SÂN KHẤU MỘT MÀN HÌNH */}
      <section className="mt-san" onTouchStart={batDauVuot} onTouchEnd={ketThucVuot}>
        <div className="mt-san__dieu-huong">
          <button
            type="button"
            className="mt-nut-mui"
            onClick={lui}
            disabled={
              nhomTab === 'tu-vung'
                ? cheDo === 'on-hom-nay'
                  ? onIdx <= 0
                  : chiSo <= 0
                : nhomTab === 'I'
                  ? miniIdx <= 0
                  : nhomIdx <= 0
            }
            aria-label="Mục trước"
          >
            ←
          </button>
          <span className="mt-bai-ten">
            {nhomTab === 'tu-vung'
              ? `${bai.tenVi} (Bài ${bai.baiSo})`
              : nhomTab === 'I'
                ? `Mini đề Chương I · Câu ${miniIdx + 1}/${MINI_DE_C1.length}`
                : `${NHOM_TAB.find((t) => t.id === nhomTab)?.ten ?? ''} · Mục ${nhomIdx + 1}/${dsNhom.length}`}
          </span>
          <button
            type="button"
            className="mt-nut-mui"
            onClick={tien}
            disabled={
              nhomTab === 'tu-vung'
                ? cheDo === 'on-hom-nay'
                  ? false
                  : chiSo >= dsTu.length - 1
                : nhomTab === 'I'
                  ? miniIdx >= MINI_DE_C1.length - 1
                  : nhomIdx >= dsNhom.length - 1
            }
            aria-label="Mục tiếp theo"
          >
            →
          </button>
        </div>

        {/* ================= NHÓM TỪ VỰNG BÀI 1–3 ================= */}
        {nhomTab === 'tu-vung' && cheDo === 'hoc' && (
          <>
            <div className="mt-hero">
              <button
                type="button"
                className="mt-hinh"
                onClick={() => phatAm(tu.en)}
                title="Bấm hình để nghe phát âm"
                aria-label={`Nghe phát âm ${tu.en}`}
              >
                <AnhChuDe
                  src={tu.imgSrc}
                  fallback={tu.fallbackImg}
                  fallbackNode={<span className="mt-emoji">{tu.emojiFallback}</span>}
                  alt={tu.en}
                  width={80}
                  height={80}
                />
              </button>

              <div className="mt-tu-info">
                <h1 className="mt-tu">{tu.en}</h1>
                <div className="mt-meta">
                  <span>{tu.loai}</span>
                  <span className="mt-ipa">{tu.ipa}</span>
                </div>
                <div>
                  <span className="mt-nhan" title="Âm tiết in đậm là âm nhấn">
                    Nhấn: {renderNhan(tu.nhan)}
                  </span>
                </div>
              </div>

              <button
                type="button"
                className="mt-sao"
                aria-pressed={daThuoc}
                onClick={() => setTd((prev) => danhDauThuoc(prev, tu.slug, !daThuoc))}
                title={daThuoc ? 'Bỏ đánh dấu đã thuộc' : 'Đánh dấu đã thuộc'}
              >
                {daThuoc ? '⭐' : '☆'}
              </button>
            </div>

            <div className="mt-loa">
              <button type="button" onClick={() => phatAm(tu.en, false)}>🔊 Nghe</button>
              <button type="button" onClick={() => phatAm(tu.en, true)}>🐢 Chậm</button>
              {coSpeechRec ? (
                <button type="button" onClick={() => luyenNoi(tu.en)} disabled={dangNgheNoi}>
                  {dangNgheNoi ? '🎙️ Đang nghe...' : '🎙️ Luyện nói'}
                </button>
              ) : (
                <span className="mt-chrome-tip">💡 Dùng Chrome để bật micro luyện nói 🎙️</span>
              )}
              {ketQuaNoi && <span className="mt-chrome-tip"><b>{ketQuaNoi}</b></span>}
            </div>

            <button type="button" className="mt-nghia" onClick={() => setLatNghia((v) => !v)}>
              {!latNghia ? (
                <span className="mt-nghia__an">👆 Chạm để lật nghĩa tiếng Việt &amp; định nghĩa tiếng Anh</span>
              ) : (
                <>
                  <span className="mt-nghia__vi">{tu.vi}</span>
                  <span className="mt-nghia__dn">{tu.dn}</span>
                </>
              )}
            </button>

            <div className="mt-subtabs" role="tablist">
              <button type="button" aria-selected={subTab === 'vd'} onClick={() => setSubTab('vd')}>
                📐 Ví dụ (3)
              </button>
              <button type="button" aria-selected={subTab === 'pb'} onClick={() => setSubTab('pb')}>
                ⚖️ Đúng / Dễ nhầm
              </button>
              <button
                type="button"
                aria-selected={subTab === '30s'}
                onClick={() => {
                  setSubTab('30s');
                  setDangChay30(true);
                  setGiay30(30);
                  setBuoc30(1);
                  setDiem30(0);
                  setGo30('');
                  phatAm(tu.en);
                }}
              >
                ⚡ Luyện 30s
              </button>
            </div>

            {subTab === 'vd' && (() => {
              const [cauEn, cauVi] = tachBanDich(tu.cau);
              const [deEn, deVi] = tachBanDich(tu.de);
              const [hinhEn, hinhVi] = tachBanDich(tu.hinh);
              return (
                <div className="mt-hop">
                  <div className="mt-vd">
                    <div className="mt-vd__noi">
                      <span className="mt-vd__en"><b>📐 Toán:</b> <MathText inline>{cauEn}</MathText></span>
                      {cauVi && <span className="mt-vd__vi"><MathText inline>{cauVi}</MathText></span>}
                    </div>
                    <button type="button" onClick={() => phatAm(cauEn.replace(/\$/g, ''))} aria-label="Nghe câu Toán">🔊</button>
                  </div>
                  <div className="mt-vd">
                    <div className="mt-vd__noi">
                      <span className="mt-vd__en">
                        <b>🍊 Đời thường:</b>{' '}
                        {tu.thucTe ? (
                          <>{tu.thucTe[0]} <MathText inline>{tu.thucTe[1]}</MathText></>
                        ) : (
                          <MathText inline>{hinhEn}</MathText>
                        )}
                      </span>
                      {(tu.thucTe?.[2] ?? hinhVi) && (
                        <span className="mt-vd__vi"><MathText inline>{tu.thucTe?.[2] ?? hinhVi}</MathText></span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => phatAm(tu.thucTe ? tu.thucTe[1] : tu.en)}
                      aria-label="Nghe ví dụ đời thường"
                    >
                      🔊
                    </button>
                  </div>
                  <div className="mt-vd">
                    <div className="mt-vd__noi">
                      <span className="mt-vd__en"><b>📝 Đề thi:</b> <MathText inline>{deEn}</MathText></span>
                      {deVi && <span className="mt-vd__vi"><MathText inline>{deVi}</MathText></span>}
                    </div>
                    <button type="button" onClick={() => phatAm(deEn.replace(/\$/g, ''))} aria-label="Nghe câu lệnh đề thi">🔊</button>
                  </div>
                </div>
              );
            })()}

            {subTab === 'pb' && (
              <div className="mt-frayer">
                <div className="la"><b>✓ Đúng là:</b> <MathText inline>{tu.la}</MathText></div>
                {tu.khong && <div className="khong"><b>✗ Không phải:</b> <MathText inline>{tu.khong}</MathText></div>}
                {tu.deNham && <div className="nham"><b>⚠️ Dễ nhầm:</b> {tu.deNham}</div>}
              </div>
            )}

            {subTab === '30s' && (
              <div className="mt-hop">
                <div className="mt-thanh-30s"><i style={{ width: `${(giay30 / 30) * 100}%` }} /></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5 }}>
                  <b>⚡ Luyện nhanh 30 giây · Còn {giay30}s</b>
                  <span>Điểm: {diem30}/2</span>
                </div>
                {buoc30 === 1 && (
                  <>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span>Bước 1: Nghe &amp; chọn đúng hình/nghĩa:</span>
                      <button type="button" className="nho phu" onClick={() => phatAm(tu.en)}>🔊 Phát lại</button>
                    </div>
                    <div className="mt-luoi-chon">
                      {bonPhuongAn.map((pa) => (
                          <button
                          key={pa.slug}
                          type="button"
                          className="mt-chon-card"
                          onClick={() => {
                            if (pa.slug === tu.slug) setDiem30((d) => d + 1);
                            setBuoc30(2);
                          }}
                        >
                          <span className="mt-chon-card__noi">
                            <AnhChuDe
                              className="mt-chon-card__anh"
                              src={pa.imgSrc}
                              fallback={pa.fallbackImg}
                              fallbackNode={<span>{pa.emojiFallback}</span>}
                              alt=""
                              width={44}
                              height={33}
                            />
                            <span>{pa.vi}</span>
                          </span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
                {buoc30 === 2 && (
                  <div className="mt-hop">
                    <span>Bước 2: Gõ lại từ tiếng Anh nghĩa là <b>&ldquo;{tu.vi}&rdquo;</b>:</span>
                    <div className="mt-input-hang">
                      <input
                        value={go30}
                        onChange={(e) => setGo30(e.target.value)}
                        placeholder={`Gợi ý: ${tu.en[0]}... (${tu.en.length} kí tự)`}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const dung = go30.trim().toLowerCase() === tu.en.toLowerCase();
                          if (dung) {
                            setDiem30((d) => d + 1);
                            setTd((prev) => capNhatSRS(prev, tu.slug, true));
                          }
                          setDangChay30(false);
                          setBuoc30(3);
                        }}
                      >
                        Chốt
                      </button>
                    </div>
                  </div>
                )}
                {buoc30 === 3 && (
                  <div className="mt-vd">
                    <span>
                      Xong vòng 30s! Đạt <b>{diem30}/2</b> điểm {diem30 === 2 ? '🎉 Đã ghi nhận vào lịch ôn!' : `(Từ đúng: ${tu.en})`}
                    </span>
                    <button type="button" onClick={() => setSubTab('vd')}>Xong</button>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {nhomTab === 'tu-vung' && cheDo === 'the' && (
          <div className="mt-hop">
            <button
              type="button"
              className="mt-nghia"
              style={{ textAlign: 'center', padding: '20px 14px', minHeight: 170 }}
              onClick={() => setTheMatSau((v) => !v)}
            >
              {!theMatSau ? (
                <div style={{ display: 'grid', gap: 6, justifyItems: 'center' }}>
                  <AnhChuDe
                    className="mt-the-anh"
                    src={tu.imgSrc}
                    fallback={tu.fallbackImg}
                    fallbackNode={<span className="mt-emoji">{tu.emojiFallback}</span>}
                    alt={tu.en}
                    width={96}
                    height={72}
                  />
                  <b style={{ fontSize: '1.35rem', color: 'var(--navy-d)' }}>{tu.en}</b>
                  <span className="mt-ipa">{tu.ipa}</span>
                  <small>Chạm để lật mặt sau</small>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: 6, justifyItems: 'center' }}>
                  <b style={{ fontSize: '1.2rem', color: '#165b33' }}>{tu.vi}</b>
                  <span>{tu.dn}</span>
                  <small><MathText inline>{tu.cau}</MathText></small>
                </div>
              )}
            </button>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
              <button type="button" className="nho phu" onClick={() => phatAm(tu.en)}>🔊 Nghe</button>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  className="nho phu"
                  onClick={() => {
                    setTd((p) => capNhatSRS(p, tu.slug, false));
                    tien();
                  }}
                >
                  Cần ôn lại
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTd((p) => capNhatSRS(p, tu.slug, true));
                    tien();
                  }}
                >
                  Đã thuộc ⭐
                </button>
              </div>
            </div>
          </div>
        )}

        {nhomTab === 'tu-vung' && cheDo === 'nghe-chon' && (
          <div className="mt-hop">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <b>Nghe phát âm và chọn thẻ đúng:</b>
              <button type="button" className="nho phu" onClick={() => phatAm(tu.en)}>🔊 Nghe từ</button>
            </div>
            <div className="mt-luoi-chon">
              {bonPhuongAn.map((pa) => {
                const daChon = chonNghe === pa.slug;
                const dung = pa.slug === tu.slug;
                const cls = chonNghe
                  ? dung
                    ? 'mt-chon-card mt-chon-card--dung'
                    : daChon
                      ? 'mt-chon-card mt-chon-card--sai'
                      : 'mt-chon-card'
                  : 'mt-chon-card';
                return (
                  <button
                    key={pa.slug}
                    type="button"
                    className={cls}
                    onClick={() => {
                      setChonNghe(pa.slug);
                      if (dung) setTd((p) => capNhatSRS(p, tu.slug, true));
                    }}
                  >
                    <div className="mt-chon-card__noi">
                      <AnhChuDe
                        className="mt-chon-card__anh"
                        src={pa.imgSrc}
                        fallback={pa.fallbackImg}
                        fallbackNode={<span>{pa.emojiFallback}</span>}
                        alt=""
                        width={44}
                        height={33}
                      />
                      <b>{pa.vi}</b>
                    </div>
                    {chonNghe && <small>{pa.en}</small>}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {nhomTab === 'tu-vung' && cheDo === 'nghe-viet' && (
          <div className="mt-hop">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Nghĩa: <b>{tu.vi}</b></span>
              <div style={{ display: 'flex', gap: 6 }}>
                <button type="button" className="nho phu" onClick={() => phatAm(tu.en)}>🔊</button>
                <button type="button" className="nho phu" onClick={() => phatAm(tu.en, true)}>🐢</button>
              </div>
            </div>
            <div className="mt-input-hang">
              <input
                value={goViet}
                onChange={(e) => setGoViet(e.target.value)}
                placeholder={`Gõ từ tiếng Anh (${tu.en.length} kí tự)...`}
              />
              <button
                type="button"
                onClick={() => {
                  const ok = goViet.trim().toLowerCase() === tu.en.toLowerCase();
                  setBaoViet(ok ? '✓ Chính xác!' : `Chưa đúng. Đáp án: ${tu.en}`);
                  if (ok) setTd((p) => capNhatSRS(p, tu.slug, true));
                }}
              >
                Kiểm tra
              </button>
            </div>
            {baoViet && <p style={{ margin: 0, fontWeight: 700 }}>{baoViet}</p>}
          </div>
        )}

        {nhomTab === 'tu-vung' && cheDo === 'noi' && (
          <div className="mt-hop" style={{ textAlign: 'center', padding: '10px 0' }}>
            <b style={{ fontSize: '1.35rem', color: 'var(--navy-d)' }}>{tu.en}</b>
            <div className="mt-ipa">{tu.ipa} · {renderNhan(tu.nhan)}</div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
              <button type="button" className="nho phu" onClick={() => phatAm(tu.en)}>🔊 Nghe mẫu</button>
              {coSpeechRec ? (
                <button type="button" onClick={() => luyenNoi(tu.en)} disabled={dangNgheNoi}>
                  {dangNgheNoi ? '🎙️ Đang thu...' : '🎙️ Bấm để đọc'}
                </button>
              ) : (
                <span className="mt-chrome-tip">Trình duyệt hiện tại không hỗ trợ SpeechRecognition. Vui lòng dùng Google Chrome để luyện nói 🎙️.</span>
              )}
            </div>
            {ketQuaNoi && <p style={{ margin: 0, fontWeight: 700 }}>{ketQuaNoi}</p>}
          </div>
        )}

        {nhomTab === 'tu-vung' && cheDo === 'ghep-cap' && (
          <div className="mt-hop">
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <b>Chọn 1 từ tiếng Anh rồi ghép với nghĩa tiếng Việt ({ghepXong.length}/{bonCap.length})</b>
              {ghepLoi && <span style={{ color: '#b42318' }}>{ghepLoi}</span>}
            </div>
            <div className="mt-ghep-luoi">
              <div className="mt-ghep-cot">
                {bonCap.map((c) => {
                  const xong = ghepXong.includes(c.slug);
                  return (
                    <button
                      key={c.slug}
                      type="button"
                      disabled={xong}
                      aria-pressed={ghepChonEn === c.slug}
                      className={`mt-ghep-item${xong ? ' mt-ghep-item--xong' : ''}`}
                      onClick={() => {
                        setGhepChonEn(c.slug);
                        setGhepLoi('');
                        phatAm(c.en);
                      }}
                    >
                      {c.en}
                    </button>
                  );
                })}
              </div>
              <div className="mt-ghep-cot">
                {capBenPhai.map((c) => {
                  const xong = ghepXong.includes(c.slug);
                  return (
                    <button
                      key={c.slug}
                      type="button"
                      disabled={xong}
                      className={`mt-ghep-item${xong ? ' mt-ghep-item--xong' : ''}`}
                      onClick={() => {
                        if (!ghepChonEn) return;
                        if (ghepChonEn === c.slug) {
                          setGhepXong((p) => [...p, c.slug]);
                          setGhepChonEn(null);
                          setTd((p) => capNhatSRS(p, c.slug, true));
                        } else {
                          setGhepLoi('Chưa khớp cặp, thử lại!');
                        }
                      }}
                    >
                      {c.vi}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {nhomTab === 'tu-vung' && cheDo === 'xep-cau' && (
          <div className="mt-hop">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <b>Xếp lại câu tiếng Anh đúng:</b>
              <button type="button" className="nho phu" onClick={() => phatAm(tuCuaCau.goc.join(' '))}>🔊 Nghe câu</button>
            </div>
            <div className="mt-tile-vung">
              {xepChon.map((idxTile, pos) => (
                <button
                  key={`${idxTile}-${pos}`}
                  type="button"
                  className="mt-tile"
                  onClick={() => setXepChon((p) => p.filter((_, i) => i !== pos))}
                >
                  {tuCuaCau.xao[idxTile]}
                </button>
              ))}
              {xepChon.length === 0 && <span className="mt-chrome-tip">Chạm các mảnh từ bên dưới theo đúng thứ tự...</span>}
            </div>
            <div className="mt-tile-vung" style={{ background: '#fff' }}>
              {tuCuaCau.xao.map((tok, i) => {
                const daDung = xepChon.includes(i);
                return (
                  <button
                    key={`${tok}-${i}`}
                    type="button"
                    className="mt-tile"
                    disabled={daDung}
                    style={daDung ? { opacity: 0.35 } : undefined}
                    onClick={() => setXepChon((p) => [...p, i])}
                  >
                    {tok}
                  </button>
                );
              })}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{baoXep ?? ''}</span>
              <div style={{ display: 'flex', gap: 6 }}>
                <button type="button" className="nho phu" onClick={() => { setXepChon([]); setBaoXep(null); }}>Làm lại</button>
                <button
                  type="button"
                  onClick={() => {
                    const ghep = xepChon.map((i) => tuCuaCau.xao[i]).join(' ');
                    const chuan = tuCuaCau.goc.join(' ');
                    setBaoXep(ghep === chuan ? '✓ Chính xác!' : `Đúng là: "${chuan}"`);
                  }}
                >
                  Kiểm tra
                </button>
              </div>
            </div>
          </div>
        )}

        {nhomTab === 'tu-vung' && cheDo === 'on-hom-nay' && tuOn && (
          <div className="mt-hop">
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <b>🔁 Ôn ngắt quãng (1–3–7 ngày) · Thẻ {(onIdx % dsOnHomNay.length) + 1}/{dsOnHomNay.length}</b>
              <span>Mức SRS: {td.srs[tuOn.slug]?.muc ?? 0}/3</span>
            </div>
            <button
              type="button"
              className="mt-nghia"
              style={{ textAlign: 'center', padding: '18px 14px', minHeight: 140 }}
              onClick={() => setOnLat((v) => !v)}
            >
              {!onLat ? (
                <div style={{ display: 'grid', gap: 6, justifyItems: 'center' }}>
                  <AnhChuDe
                    className="mt-the-anh"
                    src={tuOn.imgSrc}
                    fallback={tuOn.fallbackImg}
                    fallbackNode={<div className="mt-emoji">{tuOn.emojiFallback}</div>}
                    alt={tuOn.en}
                    width={88}
                    height={66}
                  />
                  <b style={{ fontSize: '1.25rem' }}>{tuOn.en}</b>
                  <div className="mt-ipa">{tuOn.ipa}</div>
                </div>
              ) : (
                <div>
                  <b style={{ fontSize: '1.15rem', color: '#165b33' }}>{tuOn.vi}</b>
                  <div className="mt-nghia__dn">{tuOn.dn}</div>
                </div>
              )}
            </button>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
              <button type="button" className="nho phu" onClick={() => phatAm(tuOn.en)}>🔊 Nghe</button>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  className="nho phu"
                  onClick={() => {
                    setTd((p) => capNhatSRS(p, tuOn.slug, false));
                    setOnLat(false);
                    setOnIdx((x) => x + 1);
                  }}
                >
                  Quên (+1 ngày)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTd((p) => capNhatSRS(p, tuOn.slug, true));
                    setOnLat(false);
                    setOnIdx((x) => x + 1);
                  }}
                >
                  Nhớ rõ (+3/+7 ngày)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= NHÓM B–G: MỖI MỤC MỘT THẺ ================= */}
        {nhomTab !== 'tu-vung' && nhomTab !== 'I' && dsNhom[nhomIdx] && (() => {
          const item = dsNhom[nhomIdx];
          const [phuChinh, phuDich] = tachBanDich(item.phu);
          return (
            <div className="mt-hop" style={{ padding: '8px 0' }}>
              <h2 style={{ margin: 0, fontSize: '1.35rem', color: 'var(--navy-d)', overflowWrap: 'anywhere' }}>
                {item.chinh}
              </h2>
              <div className="mt-vd__noi">
                <p style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#165b33' }}>
                  {phuChinh}
                </p>
                {phuDich && <span className="mt-vd__vi">{phuDich}</span>}
              </div>
              {item.viDu && (
                <div className="mt-vd">
                  <div className="mt-vd__noi"><span><b>Ví dụ:</b> <MathText inline>{item.viDu}</MathText></span></div>
                  <button type="button" onClick={() => phatAm(item.viDu!)}>🔊</button>
                </div>
              )}
              <div className="mt-loa">
                <button type="button" onClick={() => phatAm(item.doc)}>🔊 Nghe đọc</button>
                <button type="button" onClick={() => phatAm(item.doc, true)}>🐢 Đọc chậm</button>
              </div>
            </div>
          );
        })()}

        {/* ================= NHÓM I: MINI ĐỀ CHƯƠNG I ================= */}
        {nhomTab === 'I' && MINI_DE_C1[miniIdx] && (() => {
          const q = MINI_DE_C1[miniIdx];
          const daChon = miniChon[q.id];
          const soDung = MINI_DE_C1.filter((x) => miniChon[x.id] === x.dung).length;
          return (
            <div className="mt-hop">
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5 }}>
                <span>Đúng {soDung}/{MINI_DE_C1.length} câu</span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button type="button" className="nho phu" onClick={() => phatAm(q.hoi)}>🔊 Đọc đề</button>
                  <button type="button" className="nho phu" onClick={() => setMiniHienVi((v) => !v)}>
                    {miniHienVi ? 'Ẩn dịch' : 'Dịch gợi ý'}
                  </button>
                </div>
              </div>
              <p style={{ margin: 0, fontWeight: 700, fontSize: '1rem' }}>{q.hoi}</p>
              {miniHienVi && <p style={{ margin: 0, fontSize: 13, color: '#1b4587' }}>{q.goiYVi}</p>}
              <div className="mt-luoi-chon">
                {q.phuongAn.map((pa, idxPa) => {
                  const dung = idxPa === q.dung;
                  const chon = daChon === idxPa;
                  const cls = daChon !== undefined
                    ? dung
                      ? 'mt-chon-card mt-chon-card--dung'
                      : chon
                        ? 'mt-chon-card mt-chon-card--sai'
                        : 'mt-chon-card'
                    : 'mt-chon-card';
                  return (
                    <button
                      key={pa}
                      type="button"
                      className={cls}
                      onClick={() => setMiniChon((p) => ({ ...p, [q.id]: idxPa }))}
                    >
                      {pa}
                    </button>
                  );
                })}
              </div>
              {daChon !== undefined && (
                <div className="mt-vd">
                  <div className="mt-vd__noi"><span>{q.giaiThich}</span></div>
                  <button type="button" onClick={tien}>Câu tiếp →</button>
                </div>
              )}
            </div>
          );
        })()}
      </section>
    </div>
  );
}
