'use client';
/**
 * FILE NÀY LÀM GÌ: Component React giao diện hiển thị và xử lý tương tác của người dùng trên trình duyệt.
 * AI DÙNG: học sinh
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: @/components/NhanVat, @/components/tro-choi-nen/amThanh, @/components/truc-quan/NutAmHieuUng, @/components/truc-quan/PhanHoiDung, @/components/MathText, @/components/NutDoc, @/lib/dfle/latex-hoa.js, @/lib/dfle/t9-on-thi-10.js
 */
import NhanVat from '@/components/NhanVat';
import { phat } from '@/components/tro-choi-nen/amThanh';
import NutAmHieuUng from '@/components/truc-quan/NutAmHieuUng';
import { TichVang } from '@/components/truc-quan/PhanHoiDung';

import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import MathText from '@/components/MathText';
import NutDoc from '@/components/NutDoc';
import { latexHoa } from '@/lib/dfle/latex-hoa.js';
import { DANG_ON_THI, deLamThu } from '@/lib/dfle/t9-on-thi-10.js';
import { soKhopDapSo } from '@/lib/dfle/t9-tro-choi-nen.js';
import { ghiSuKien } from '@/lib/giongDoc';
import { chuDeChuong } from '@/lib/chuDeChuong';
import BayDonVi from '@/components/BayDonVi';
import AnhChuDe from '@/components/AnhChuDe';
import QuestionFigure from '@/components/QuestionFigure';
import { hinhHopLe, type Hinh } from '@/lib/hinhToanHoc';
import LoiGiaiDong from '@/components/LoiGiaiDong';
import { NutChamVo } from '@/components/cham-vo/ChamVoModal';
import './on-thi.css';

type HinhDeThi = string | { anh: string; fallback?: string; moTa?: string } | Hinh;
type Buoc = { h: string; d: string };
type Cau = { id: string; loai: 'chon' | 'so'; de: string; hinh?: HinhDeThi; phuongAn?: string[]; dapAn?: string; loiGiai: string; buoc?: Buoc[]; giai?: string[] };

/**
 * Component React `HinhDeOnThi`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
function HinhDeOnThi({ hinh }: { hinh?: HinhDeThi }) {
  if (!hinh) return null;
  if (typeof hinh === 'string') {
    return <AnhChuDe className="ot-de-hinh" src={hinh} alt="" width={640} height={400} loading="lazy" />;
  }
  if ('anh' in hinh && typeof hinh.anh === 'string') {
    return (
      <AnhChuDe
        className="ot-de-hinh"
        src={hinh.anh}
        fallback={hinh.fallback}
        alt={hinh.moTa ?? ''}
        width={640}
        height={400}
        loading="lazy"
      />
    );
  }
  if (hinhHopLe(hinh)) {
    return (
      <div className="ot-de-hinh ot-de-hinh--svg">
        <QuestionFigure hinh={hinh} />
      </div>
    );
  }
  return null;
}
type Dang = { cau: string; ten: string; ku: string; kuLienQuan?: string[]; lienQuan?: { ku: string; ten: string }[]; meo: string; muc: number; chuong: number; tomTat: string; cauHoi: Cau[] };
const DS = DANG_ON_THI as unknown as Dang[];
/** Chuỗi đã có $...$ (LaTeX) thì hiện thẳng; chuỗi Unicode cũ thì đổi sang LaTeX. */
const M = ({ c, inline = false }: { c: string; inline?: boolean }) => <MathText inline={inline}>{String(c).includes('$') ? String(c) : latexHoa(String(c))}</MathText>;
// Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
const docDuoc = (s: string) => String(s).includes('$') ? String(s).replace(/\\dfrac\{([^}]*)\}\{([^}]*)\}/g, '$1 phần $2').replace(/[$\\{}]/g, ' ').replace(/\s+/g, ' ') : latexHoa(s);
// Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
const laSo = (d: string) => /^[−-]?\d+(?:[,.]\d+)?$/.test(d.trim());
const KHOA = 'f9-on-thi-10';
const MUC = ['', '🌱 Hạt Mầm', '🌿 Chồi Xanh', '🌳 Đại Thụ', '⭐ Đỉnh Sao'];

/** Dạng còn khoá → các mục em cần học trước (từ máy chủ). Dạng không có trong đây là đã mở. */
export type KhoaDang = Record<string, { ku: string; ten: string }[]>;

type Luu = { dang: Record<string, number>; thu: { diem: number; luc: number }[] };
/**
 * Component React `docLuu`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
function docLuu(): Luu {
  try { const s = localStorage.getItem(KHOA); if (s) return { dang: {}, thu: [], ...JSON.parse(s) }; } catch { /* trình duyệt chặn lưu */ }
  return { dang: {}, thu: [] };
}
/**
 * Component React `ghiLuu`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
function ghiLuu(l: Luu) { try { localStorage.setItem(KHOA, JSON.stringify(l)); } catch { /* bỏ qua */ } }

/**
 * Component React `tron`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
function tron<T>(a: T[]): T[] {
  const b = a.slice();
  // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
  for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; }
  return b;
}
const dungChua = (c: Cau, tl: string | undefined) => tl != null && (c.loai === 'chon' ? tl === c.phuongAn![0] : soKhopDapSo(tl, c.dapAn));

/** Một câu hỏi: chọn phương án hoặc gõ đáp số. */
function HoiDap({ c, traLoi, datTraLoi, khoa, anDe = false }: { c: Cau; traLoi?: string; datTraLoi: (v: string) => void; khoa: boolean; anDe?: boolean }) {
  const pa = useMemo(() => (c.phuongAn ? tron(c.phuongAn) : []), [c]);
  const [go, setGo] = useState(traLoi ?? '');
  useEffect(() => { setGo(traLoi ?? ''); }, [c.id]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="ot-hoi">
      {!anDe && <p className="ot-de"><M c={c.de} /></p>}
      {!anDe && <HinhDeOnThi hinh={c.hinh} />}
      <NutDoc text={docDuoc(c.de) + (c.phuongAn ? '. ' + pa.map((p, i) => `Phương án ${'ABCD'[i]}. ${docDuoc(p)}`).join('. ') : '')} />
      {c.loai === 'chon' ? (
        <div className="ot-pa">
          {pa.map((p, i) => (
            <button key={p} type="button" disabled={khoa} aria-pressed={traLoi === p}
              className={'ot-pa__nut' + (traLoi === p ? ' chon' : '') + (khoa && p === c.phuongAn![0] ? ' dung' : '') + (khoa && traLoi === p && p !== c.phuongAn![0] ? ' sai' : '')}
              onClick={() => datTraLoi(p)}>
              <b>{'ABCD'[i]}</b> <M inline c={p} />
            </button>
          ))}
        </div>
      ) : (
        <form className="ot-so" onSubmit={(e) => { e.preventDefault(); if (go.trim()) datTraLoi(go.trim()); }}>
          <label>Đáp số <input inputMode="decimal" value={go} disabled={khoa} onChange={(e) => { setGo(e.target.value); if (!khoa) datTraLoi(e.target.value.trim()); }} placeholder="Gõ số, ví dụ 2,5" /></label>
        </form>
      )}
    </div>
  );
}

/** Một ý dẫn dắt: ý là số thì em gõ và máy chấm (sai 2 lần thì hiện đáp); ý là chữ thì em nghĩ rồi bấm xem. */
function MotBuoc({ b, so, xong }: { b: Buoc; so: number; xong: () => void }) {
  const [go, setGo] = useState('');
  const [lan, setLan] = useState(0);
  const [hien, setHien] = useState<null | 'dung' | 'xem'>(null);
  const so_ = laSo(b.d);
  const thu = (e?: React.FormEvent) => {
    e?.preventDefault(); if (hien || !go.trim()) return;
    if (soKhopDapSo(go, b.d)) { setHien('dung'); phat('dung'); xong(); }
    else { const n = lan + 1; setLan(n); if (n >= 2) { setHien('xem'); xong(); } }
  };
  return (
    <li className={'ot-buoc' + (hien ? ' ot-buoc--xong' : '')} style={{ ['--b' as string]: ['#2b6de0', '#ff8a1f', '#22a06b', '#a24bd8', '#e0498a'][so % 5] }}>
      <span className="ot-buoc__so">{hien === 'dung' ? '✓' : so + 1}</span>
      <div className="ot-buoc__than">
        <p className="ot-buoc__hoi"><M c={b.h} /></p>
        {hien ? <p className={'ot-buoc__dap' + (hien === 'xem' ? ' xem' : '')}>{hien === 'dung' ? '🎉 Đúng: ' : '👉 '}<M c={b.d} /></p>
          : so_ ? <form className="ot-buoc__o" onSubmit={thu}>
              <input inputMode="decimal" value={go} onChange={(e) => setGo(e.target.value)} placeholder="Gõ số" aria-label={`Trả lời ý ${so + 1}`} autoFocus />
              <button type="submit" className="ot-nut ot-nut--xanh" disabled={!go.trim()}>✔ Kiểm tra</button>
              {lan === 1 && <span className="ot-buoc__thu">Chưa đúng, thử lại nhé!</span>}
            </form>
          : <button type="button" className="ot-nut ot-nut--tim" onClick={() => { setHien('xem'); xong(); }}>🤔 Em nghĩ xong · Xem đáp</button>}
      </div>
    </li>
  );
}

/** Lời giải trình bày tự luận, không đánh số và căn thẳng theo dấu bằng. */
function LoiGiaiTuLuan({ c }: { c: Cau }) {
  const dong = c.giai?.length ? c.giai : [c.loiGiai];
  return (
    <div className="ot-giai">
      <p className="ot-giai__tieu">📜 Lời giải trình bày (chép vào vở)</p>
      <LoiGiaiDong dong={dong} />
    </div>
  );
}

/** Luyện một dạng: mặc định 4–5 câu, rút xuống 3 câu nhẹ hơn khi bật chế độ giảm tải. */
function LuyenDang({ d, xong, choChamVo, giamTai = false }: { d: Dang; xong: (dung: number) => void; choChamVo: boolean; giamTai?: boolean }) {
  const cauDs = useMemo(() => (giamTai ? d.cauHoi.slice(0, 3) : d.cauHoi), [d.cauHoi, giamTai]);
  const [i, setI] = useState(0);
  const [tl, setTl] = useState<string | undefined>();
  const [daKiem, setDaKiem] = useState(false);
  const [dung, setDung] = useState(0);
  const [chuoiDung, datChuoiDung] = useState(0);
  const c = cauDs[i] ?? d.cauHoi[0];
  const cd = chuDeChuong(d.chuong);
  const ok = dungChua(c, tl);
  const [cheDo, setCheDo] = useState<'buoc' | 'thang'>('buoc');
  const [soBuoc, setSoBuoc] = useState(1);
  const buoc = c.buoc ?? [];
  const xongBuoc = cheDo === 'thang' || soBuoc > buoc.length;
  const kiem = () => {
    if (tl == null) return;
    setDaKiem(true);
    datChuoiDung(v => ok ? v + 1 : 0);
    if (ok) { setDung((n) => n + 1); phat('dung'); }
    window.dispatchEvent(new CustomEvent('f9-qua-tai-cau', { detail: { dung: ok } }));
  };
  const tiep = () => {
    if (i + 1 >= cauDs.length) { xong(dung); return; }
    setI(i + 1); setTl(undefined); setDaKiem(false); setSoBuoc(1);
  };
  return (
    <section
      className="card ot-khung"
      aria-label={`Luyện dạng ${d.cau}`}
      style={cd ? ({ ['--mau-chuong' as string]: cd.mau } as CSSProperties) : undefined}
    >
      <NutAmHieuUng/>
      <p className="ot-dau">
        <span className="ot-the" style={cd ? { background: cd.mau, color: '#fff' } : undefined}>Câu {d.cau}</span>
        {cd && <span className="ot-dang__ch" style={{ ['--ot-ch' as string]: cd.mau } as CSSProperties}>{cd.bieuTuong} Chương {d.chuong} · {cd.ten}</span>}
        {d.ten} <small>Câu {i + 1}/{cauDs.length}{giamTai ? ' (nhẹ)' : ''}</small>
      </p>
      <p className="ot-meo">💡 <M c={d.meo} /></p>
      {buoc.length > 0 && !daKiem && <div className="ot-che-do" role="group" aria-label="Cách làm">
        <button type="button" aria-pressed={cheDo === 'buoc'} className="ot-nut ot-nut--cam" onClick={() => setCheDo('buoc')}>🪜 Làm từng bước</button>
        <button type="button" aria-pressed={cheDo === 'thang'} className="ot-nut ot-nut--hong" onClick={() => setCheDo('thang')}>⚡ Làm thẳng</button>
      </div>}
      <div className="ot-hoi">
        <p className="ot-de"><M c={c.de} /></p>
        <HinhDeOnThi hinh={c.hinh} />
        {choChamVo && (
          <div style={{ margin: '8px 0 4px' }}>
            <NutChamVo nguon="on-thi-10" baiId={c.id} kuId={d.ku} deBai={c.de} bat={choChamVo} />
          </div>
        )}
      </div>
      {cheDo === 'buoc' && buoc.length > 0 && (
        <ol className="ot-buoc-ds" key={c.id}>
          {buoc.slice(0, soBuoc).map((b, k) => <MotBuoc key={k} b={b} so={k} xong={() => setSoBuoc((n) => Math.max(n, k + 2))} />)}
        </ol>
      )}
      {xongBuoc && <>
        {cheDo === 'buoc' && buoc.length > 0 && <p className="ot-chot">🏁 Giờ trả lời câu hỏi chính:</p>}
        <HoiDap c={c} traLoi={tl} datTraLoi={(v) => { if (!daKiem) setTl(v || undefined); }} khoa={daKiem} anDe />
      </>}
      {!xongBuoc ? null : daKiem ? (
        <div className={'ot-phan-hoi ' + (ok ? 'dung' : 'sai')} role="status">
          <p>
            <b>{ok ? <><TichVang/> Chính xác!</> : c.loai === 'so' ? <>Chưa đúng. Đáp số: <M c={c.dapAn!} /></> : 'Chưa đúng.'}</b>
            {ok && <span style={{ marginLeft: 8 }}><BayDonVi chuong={cd?.chuong} so={1} triggerKey={c.id} /></span>}
          </p>
          <LoiGiaiTuLuan c={c} />
          {ok && chuoiDung >= 3 && <NhanVat loi="chuoi" chuong={cd?.chuong} compact />}
          {!ok && <NhanVat loi="sai" chuong={cd?.chuong} compact />}
          <button type="button" className="ot-nut ot-nut--xanh ot-nut--to" onClick={tiep} autoFocus>{i + 1 >= cauDs.length ? '🏆 Xem kết quả' : '➡️ Câu tiếp theo'}</button>
        </div>
      ) : (
        <p><button type="button" className="ot-nut ot-nut--cam ot-nut--to" disabled={tl == null} onClick={kiem}>⭐ Kiểm tra</button></p>
      )}
    </section>
  );
}

/** Làm thử: mỗi dạng một câu, đúng thứ tự đề thật, có bấm giờ, nộp xong mới chấm. */
function LamThu({ phut, mo, giamTai = false, xong }: { phut: number; mo: Set<string>; giamTai?: boolean; xong: (de: (Cau & { cau: string; ten: string })[], tl: Record<string, string>) => void }) {
  // Chỉ lấy các dạng đã mở khoá (đã học chương đó); nếu đang giảm tải thì rút gọn 3 câu nhẹ nhàng.
  const de = useMemo(() => {
    const goc = (deLamThu(Date.now()) as unknown as (Cau & { cau: string; ten: string })[]).filter((c) => mo.has(c.cau));
    return giamTai ? goc.slice(0, 3) : goc;
  }, [mo, giamTai]);
  const [i, setI] = useState(0);
  const [tl, setTl] = useState<Record<string, string>>({});
  const [con, setCon] = useState(phut * 60);
  const nop = useRef(() => {});
  nop.current = () => xong(de, tl);
  useEffect(() => {
    const id = window.setInterval(() => setCon((s) => { if (s <= 1) { window.clearInterval(id); window.setTimeout(() => nop.current(), 0); return 0; } return s - 1; }), 1000);
    return () => window.clearInterval(id);
  }, []);
  const c = de[i];
  const daLam = Object.keys(tl).length;
  const [xacNhan, setXacNhan] = useState(false);
  const bamNop = () => { if (daLam < de.length && !xacNhan) { setXacNhan(true); return; } nop.current(); };
  return (
    <section className="card ot-khung" aria-label="Làm thử đề" data-bai-co-gio="">
      <div className="ot-thu-tren">
        <span className={'ot-gio' + (con < 300 ? ' gap' : '')} aria-live="off">⏱ {Math.floor(con / 60)}:{String(con % 60).padStart(2, '0')}</span>
        <span>Đã làm {daLam}/{de.length}</span>
        <button type="button" onClick={bamNop}>Nộp bài</button>
      </div>
      {xacNhan && daLam < de.length && <p className="ot-xac-nhan" role="alert">Còn {de.length - daLam} câu chưa làm. Bấm <b>Nộp bài</b> lần nữa để nộp luôn, hoặc làm tiếp.</p>}
      <nav className="ot-o" aria-label="Chuyển câu">
        {de.map((x, k) => <button key={x.id} type="button" aria-current={k === i} className={(x.id in tl ? 'da' : '') + (k === i ? ' dang' : '')} onClick={() => setI(k)}>{x.cau}</button>)}
      </nav>
      <p className="ot-dau"><span className="ot-the">Câu {c.cau}</span> {c.ten}</p>
      <HoiDap c={c} traLoi={tl[c.id]} datTraLoi={(v) => setTl((t) => { const n = { ...t }; if (v) n[c.id] = v; else delete n[c.id]; return n; })} khoa={false} />
      <p className="ot-dieu-huong">
        <button type="button" disabled={i === 0} onClick={() => setI(i - 1)}>← Câu trước</button>
        {i + 1 < de.length ? <button type="button" className="primary" onClick={() => setI(i + 1)}>Câu sau →</button>
          : <button type="button" className="primary" onClick={bamNop}>Nộp bài</button>}
      </p>
    </section>
  );
}

/**
 * Component React `OnThi10`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export default function OnThi10({ khoa = {}, choChamVo = true }: { khoa?: KhoaDang; choChamVo?: boolean }) {
  const mo = useMemo(() => new Set(DS.filter((d) => !khoa[d.cau]).map((d) => d.cau)), [khoa]);
  const [luu, setLuu] = useState<Luu>({ dang: {}, thu: [] });
  const [che, setChe] = useState<{ k: 'ds' } | { k: 'dang'; d: Dang } | { k: 'xong-dang'; d: Dang; dung: number } | { k: 'thu'; phut: number } | { k: 'kq'; de: (Cau & { cau: string; ten: string })[]; tl: Record<string, string> }>({ k: 'ds' });
  const [phut, setPhut] = useState(45);
  const [giamTai, setGiamTai] = useState(false);
  useEffect(() => {
    setLuu(docLuu());
    try {
      if (sessionStorage.getItem('f9-qua-tai-giam-tai') === '1') setGiamTai(true);
    } catch {}
    const onGiam = () => setGiamTai(true);
    window.addEventListener('f9-qua-tai-giam-tai', onGiam);
    return () => window.removeEventListener('f9-qua-tai-giam-tai', onGiam);
  }, []);
  const veDau = () => { setChe({ k: 'ds' }); window.scrollTo({ top: 0 }); };

  if (che.k === 'dang') return <><p><button type="button" onClick={veDau}>← Danh sách dạng</button></p>
    <LuyenDang key={che.d.cau} d={che.d} choChamVo={choChamVo} giamTai={giamTai} xong={(dung) => {
      // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
      const l = docLuu(); l.dang[che.d.cau] = Math.max(l.dang[che.d.cau] ?? 0, dung); ghiLuu(l); setLuu(l);
      // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
      ghiSuKien(che.d.ku, 'on_thi_10', { che_do: 'dang', cau: che.d.cau, dung, tong: giamTai ? Math.min(3, che.d.cauHoi.length) : che.d.cauHoi.length });
      setChe({ k: 'xong-dang', d: che.d, dung });
    }} /></>;

  if (che.k === 'xong-dang') {
    // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
    const { d, dung } = che; const tong = giamTai ? Math.min(3, d.cauHoi.length) : d.cauHoi.length;
    const cd = chuDeChuong(d.chuong);
    const nvFallback = `/minh-hoa/nv/${dung === tong ? 'reo-ho' : 'suy-nghi'}.webp`;
    return <section className="card ot-ket">
      <AnhChuDe src={cd ? (dung === tong ? cd.nvBin : cd.nvNa) : nvFallback} fallback={nvFallback} alt="" width={120} height={180} />
      <h2>Dạng {d.cau}: đúng {dung}/{tong} câu</h2>
      <p>{dung === tong ? 'Em nắm chắc dạng này rồi.' : dung >= tong / 2 ? 'Gần được rồi, xem lại lời giải câu sai rồi luyện lại.' : 'Em nên ôn lại lý thuyết trước rồi luyện lại.'}</p>
      <p className="ot-dieu-huong">
        <button type="button" className="primary" onClick={() => setChe({ k: 'dang', d })}>Luyện lại</button>
        <a className="action-link" href={`/hoc/${encodeURIComponent(d.ku)}`}>Ôn lý thuyết</a>
        {(d.lienQuan ?? []).map((m) => <a key={m.ku} className="action-link" href={`/hoc/${encodeURIComponent(m.ku)}`}>Ôn thêm: {m.ten}</a>)}
        <button type="button" onClick={veDau}>Chọn dạng khác</button>
      </p>
    </section>;
  }

  if (che.k === 'thu') return <LamThu phut={che.phut} mo={mo} giamTai={giamTai} xong={(de, tl) => {
    const dung = de.filter((c) => dungChua(c, tl[c.id])).length;
    if (dung > 0) phat('dung');
    const diem = Math.round(dung / de.length * 100) / 10;
    const l = docLuu(); l.thu = [...l.thu, { diem, luc: Date.now() }].slice(-10); ghiLuu(l); setLuu(l);
    ghiSuKien(DS[0].ku, 'on_thi_10', { che_do: 'lam-thu', dung, tong: de.length, sai: de.filter((c) => !dungChua(c, tl[c.id])).map((c) => c.cau) });
    setChe({ k: 'kq', de, tl }); window.scrollTo({ top: 0 });
  }} />;

  if (che.k === 'kq') {
    const { de, tl } = che;
    const dung = de.filter((c) => dungChua(c, tl[c.id])).length;
    return <section className="card ot-khung">
      <div className="ot-ket">
        <img src={`/minh-hoa/nv/${dung >= 12 ? 'reo-ho' : 'doc-sach'}.webp`} alt="" width={120} height={180} />
        <h2>Đúng {dung}/{de.length} ý · quy đổi {(dung / de.length * 10).toFixed(1).replace('.', ',')} điểm</h2>
        <p>Điểm quy đổi chỉ để em tự theo dõi, không thay cho điểm bài tự luận thật.</p>
      </div>
      <ol className="ot-chua">
        {de.map((c) => { const ok = dungChua(c, tl[c.id]); const d = DS.find((x) => x.cau === c.cau)!; return (
          <li key={c.id} className={ok ? 'dung' : 'sai'}>
            <p><b>{ok ? <TichVang/> : '✗'} Câu {c.cau}</b> · {c.ten}</p>
            <p><M c={c.de} /></p>
            {!ok && <p className="ot-loi-giai">{tl[c.id] == null ? 'Em chưa làm. ' : <>Em trả lời <M c={tl[c.id]} />. </>}Đáp án đúng: <b><M c={c.loai === 'chon' ? c.phuongAn![0] : c.dapAn!} /></b></p>}
            {!ok && <LoiGiaiTuLuan c={c} />}
            {!ok && <button type="button" onClick={() => setChe({ k: 'dang', d })}>Luyện dạng {c.cau}</button>}
          </li>); })}
      </ol>
      <p className="ot-dieu-huong"><button type="button" className="primary" onClick={() => setChe({ k: 'thu', phut })}>Làm đề khác</button><button type="button" onClick={veDau}>Về danh sách dạng</button></p>
    </section>;
  }

  const daXong = DS.filter((d) => (luu.dang[d.cau] ?? 0) === d.cauHoi.length).length;
  const lanCuoi = luu.thu.at(-1);
  return (
    <>
      <div className="tq-dieu-khien"><NutAmHieuUng/><NhanVat loi="onThi" compact /></div>
      {/* Khối giao diện: Khối nội dung chính */}
      <section className="card ot-lam-thu">
        <div>
          <h2>Làm thử một đề</h2>
          <p>{mo.size === DS.length ? '15 câu, mỗi câu ứng với một ý của đề Đà Nẵng 2026 (1a đến 6c)' : `Đề gồm ${mo.size}/${DS.length} câu của các chương em đã học`}, đổi câu mỗi lần làm. Nộp bài xong mới biết đúng sai.</p>
          {mo.size === 0 && <p className="hint">🔒 Em chưa học chương nào có trong đề. Học xong bài trên lớp hoặc làm bài chuẩn bị của mục đó là mở khoá.</p>}
          {lanCuoi && <p className="hint">Lần gần nhất: {lanCuoi.diem.toFixed(1).replace('.', ',')} điểm quy đổi ({luu.thu.length} lần làm).</p>}
        </div>
        <div className="ot-lam-thu__chon">
          <label>Thời gian
            <select value={phut} onChange={(e) => setPhut(Number(e.target.value))}>
              <option value={45}>45 phút (luyện nhanh)</option>
              <option value={120}>120 phút (như thi thật)</option>
            </select>
          </label>
          <button type="button" className="primary" disabled={mo.size === 0} onClick={() => setChe({ k: 'thu', phut })}>Bắt đầu làm thử</button>
        </div>
      </section>

      <h2 className="ot-tieu-de">Luyện theo dạng câu <small>{daXong}/{DS.length} dạng đã đúng hết · {mo.size}/{DS.length} dạng đã mở</small></h2>
      <ul className="ot-ds">
        {DS.map((d) => { const best = luu.dang[d.cau]; const can = khoa[d.cau]; const cd = chuDeChuong(d.chuong); const st = cd ? ({ ['--ot-ch' as string]: cd.mau } as CSSProperties) : undefined; if (can) return (
          <li key={d.cau}>
            <div className="ot-dang ot-dang--khoa ot-dang--chuong" aria-disabled="true" style={st}>
              <span className="ot-the">🔒 Câu {d.cau}</span>
              <span className="ot-dang__ch">{cd ? `${cd.bieuTuong} Chương ${d.chuong} · ${cd.ten}` : `Chương ${d.chuong}`}</span>
              <strong>{d.ten}</strong>
              <small>{MUC[d.muc]}</small>
              <span className="ot-dang__can">Mở khoá khi em học xong: {can.map((m, k) => <span key={m.ku}>{k ? ', ' : ''}<a href={`/hoc/${encodeURIComponent(m.ku)}`}>{m.ten}</a></span>)}</span>
            </div>
          </li>); return (
          <li key={d.cau}>
            <button type="button" className={'ot-dang ot-dang--chuong' + (best === d.cauHoi.length ? ' xong' : '')} style={st} onClick={() => { setChe({ k: 'dang', d }); window.scrollTo({ top: 0 }); }}>
              <span className="ot-the">Câu {d.cau}</span>
              <span className="ot-dang__ch">{cd ? `${cd.bieuTuong} Chương ${d.chuong} · ${cd.ten}` : `Chương ${d.chuong}`}</span>
              <strong>{d.ten}</strong>
              <small>{MUC[d.muc]}</small>
              <span className="ot-dang__tien">{best == null ? 'Chưa luyện' : `Tốt nhất ${best}/${d.cauHoi.length}`}</span>
            </button>
          </li>); })}
      </ul>
    </>
  );
}
