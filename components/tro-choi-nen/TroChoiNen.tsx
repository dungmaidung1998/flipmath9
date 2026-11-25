'use client';

/**
 * FILE NÀY LÀM GÌ: Vỏ trò chơi nền gắn bối cảnh Đà Nẵng (địa danh, nhân vật và ảnh chủ đề từng chương).
 * AI DÙNG: học sinh
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: @/lib/chuDeMatMa, @/lib/diaDanh, @/lib/chuDeTroChoi, @/components/NhanVat, @/components/AnhChuDe
 */
import { chuDeMatMa, anhMucMatMa } from '@/lib/chuDeMatMa';
import { DIA_DANH } from '@/lib/diaDanh';
import { voTroChoi, canhChuong } from '@/lib/chuDeTroChoi';
import NhanVat from '@/components/NhanVat';
import AnhChuDe from '@/components/AnhChuDe';
import { chuDeChuong } from '@/lib/chuDeChuong';
import { TichVang } from '@/components/truc-quan/PhanHoiDung';
/**
 * Trò chơi ôn kiến thức nền — chơi trước khi xem video bài mới.
 * Chỉ ôn kiến thức đã học (Toán 6–8, các mục Toán 9 trước đó); không dạy kiến thức mới.
 * Dữ liệu: lib/dfle/t9-tro-choi-nen.js (soạn trong dfle-engine/src, giáo viên duyệt qua Word).
 */
import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { amThanh, batNhac, tatNhac, datNhac, datHieuUng, phat } from './amThanh';
import OnNhanh from '@/components/OnNhanh';
import { KY_NANG_THEO_MUC } from '@/lib/dfle/t9-ky-nang-nen.js';
const kyNangCuaMuc = (ku: string): string | undefined => (KY_NANG_THEO_MUC as Record<string, string>)[ku];
import GameMission, { useGameMission } from '../GameMission';
import MathText from '../MathText';
import { TRO_CHOI_THEO_MUC, KIEU_TRO_CHOI, soKhopDapSo } from '@/lib/dfle/t9-tro-choi-nen.js';
import { latexHoa } from '@/lib/dfle/latex-hoa.js';
import './tro-choi-nen.css';
import HinhNen from './HinhNen';
import { GOI_Y_NEN } from '@/lib/dfle/t9-goi-y-nen.js';

type TroChoi = any;
/** Báo câu đang làm cho khung hình bên trái để vẽ đúng hình của câu đó. */
const CauCtx = createContext<(c: { t: string; tra: boolean } | null) => void>(() => {});
function useBaoCau(t: string | undefined, tra: boolean) {
  const bao = useContext(CauCtx);
  useEffect(() => { bao(t ? { t, tra } : null); }, [t, tra, bao]);
  useEffect(() => () => bao(null), [bao]);
}
const M = ({ c }: { c: string }) => <MathText>{latexHoa(String(c))}</MathText>;

function tron<T>(a: T[]): T[] {
  const b = a.slice();
  for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; }
  return b;
}
function tronKhacGoc<T>(a: T[]): T[] {
  if (a.length < 2) return a.slice();
  for (let k = 0; k < 8; k++) { const b = tron(a); if (b.some((x, i) => x !== a[i])) return b; }
  return a.slice().reverse();
}

function ghiSuKien(ku: string, type: 'game_start' | 'game_finish', payload: Record<string, unknown>) {
  try {
    const body = JSON.stringify({ events: [{ type, kuId: ku, payload }] });
    if (navigator.sendBeacon) navigator.sendBeacon('/api/events', new Blob([body], { type: 'application/json' }));
    else fetch('/api/events', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, keepalive: true });
  } catch { /* ghi nhật ký không được thì vẫn cho chơi */ }
}

type KetThuc = (dung: number, tong: number) => void;
/** Phản hồi chung cho mọi trò chơi: âm thanh, điểm, chuỗi đúng, chữ bay (23/11/2026). */
type Fx = { ghi: (ok: boolean) => void; bam: () => void };
const FxCtx = createContext<Fx>({ ghi: () => {}, bam: () => {} });
const useFx = () => useContext(FxCtx);
type GoiY = string[] | undefined;
const KuCtx = createContext<string>('');
function GoiYO({ c }: { c: string | null }) {
  const kuId = useContext(KuCtx);
  const daGui = useRef<string | null>(null);
  useEffect(() => {
    if (!c || !kuId || daGui.current === c) return;
    daGui.current = c;
    fetch('/api/goi-y-su-kien', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nguon: 'tro-choi', kuId, tang: 1, coAi: false }),
      keepalive: true,
    }).catch(() => {});
  }, [c, kuId]);
  return c ? <p className="tcn-goi-y" role="status"><b>💡 Gợi ý:</b> <M c={c} /></p> : null;
}
/** Gợi ý cho Mật mã số: lấy lời giải, che đáp số cuối cùng bằng dấu "?". */
function goiYTuLoiGiai(giai: string, dap: string): string {
  const i = giai.lastIndexOf(dap);
  if (i < 0 || !dap) return 'Đọc lại khung "Ôn nền" và hình ở trên, làm từng bước một.';
  return (giai.slice(0, i) + '?' + giai.slice(i + dap.length)).replace(/\.\s*$/, '');
}

/* ------------------------------------------------------------- 1. Lật thẻ -- */
function LatThe({ du, xong }: { du: TroChoi; xong: KetThuc; goiY?: GoiY }) {
  const canh = canhChuong(String((du as { ku?: string }).ku ?? ''));
  const [the] = useState(() => tron((du.cap as string[][]).flatMap((c, i) => [{ id: i * 2, cap: i, chu: c[0] }, { id: i * 2 + 1, cap: i, chu: c[1] }])));
  const [mo, setMo] = useState<number[]>([]);
  const [dat, setDat] = useState<number[]>([]);
  const [luot, setLuot] = useState(0);
  const [loi, setLoi] = useState(0);
  const khoa = useRef(false);
  const fx = useFx();
  const [tb, setTb] = useState('Lật hai thẻ có cùng giá trị. Thẻ lật sai sẽ mở đến khi em bấm thẻ khác.');
  const [saiCap, setSaiCap] = useState(false);
  useEffect(() => { if (dat.length === du.cap.length) xong(du.cap.length, du.cap.length + loi); }, [dat]); // eslint-disable-line react-hooks/exhaustive-deps
  function lat(id: number, cap: number) {
    if (khoa.current || dat.includes(cap)) return;
    if (saiCap) { setSaiCap(false); if (mo.includes(id)) { setMo([]); return; } setMo([id]); fx.bam(); return; }
    if (mo.includes(id)) return;
    const moi = [...mo, id];
    setMo(moi);
    if (moi.length < 2) { fx.bam(); return; }
    khoa.current = true; setLuot((v) => v + 1);
    const a = the.find((t) => t.id === moi[0])!, b = the.find((t) => t.id === moi[1])!;
    fx.ghi(a.cap === b.cap);
    if (a.cap === b.cap) {
      setTb('Đúng một cặp!'); setTimeout(() => { setDat((d) => [...d, a.cap]); setMo([]); khoa.current = false; }, 450);
    } else {
      setLoi((v) => { const n = v + 1; setTb(n >= 3 ? '💡 Mẹo: tính giá trị từng thẻ ra nháp trước, rồi mới tìm thẻ bằng nó. Bấm thẻ khác để úp lại.' : 'Hai thẻ này chưa bằng nhau. Tính và nhớ giá trị, rồi bấm thẻ khác để úp lại.'); return n; });
      setSaiCap(true); khoa.current = false;
    }
  }
  return <div className="tcn-lat">
    <p className="tcn-tb" aria-live="polite">{tb} <small>Đã tìm {dat.length}/{du.cap.length} cặp · {luot} lượt</small></p>
    {saiCap && <button type="button" className="tcn-nut tcn-nut--phu" onClick={() => { setSaiCap(false); setMo([]); }}>Úp hai thẻ lại</button>}
    <div className="tcn-lat__luoi">
      {the.map((t) => {
        const ngua = mo.includes(t.id) || dat.includes(t.cap);
        return <button key={t.id} type="button" className={'tcn-the' + (ngua ? ' ngua' : '') + (dat.includes(t.cap) ? ' dat' : '') + (saiCap && mo.includes(t.id) ? ' lech' : '')}
          onClick={() => lat(t.id, t.cap)} aria-label={ngua ? undefined : 'Thẻ úp'} aria-pressed={ngua}>
          <span className={'tcn-the__mat tcn-the__sau' + (canh ? ' tcn-the__sau--anh' : '')} aria-hidden="true" style={canh ? { backgroundImage: `url(/tro-choi/the/${canh.chuong}.webp)` } : undefined}>{canh ? '' : '?'}</span>
          <span className="tcn-the__mat tcn-the__truoc">{ngua ? <M c={t.chu} /> : null}</span>
        </button>;
      })}
    </div>
  </div>;
}

/* ------------------------------------------------------------- 2. Nối dây -- */
function NoiCot({ du, xong, goiY }: { du: TroChoi; xong: KetThuc; goiY?: GoiY }) {
  const cap = du.cap as string[][];
  const [phai] = useState(() => tronKhacGoc(cap.map((_, i) => i)));
  const [chon, setChon] = useState<number | null>(null);
  const [noi, setNoi] = useState<Record<number, number>>({});
  const [sai, setSai] = useState<number | null>(null);
  const [loi, setLoi] = useState(0);
  const [saiLan, setSaiLan] = useState<Record<number, number>>({});
  const [goi, setGoi] = useState<string | null>(null);
  const fx = useFx();
  useEffect(() => { if (Object.keys(noi).length === cap.length) xong(cap.length, cap.length + loi); }, [noi]); // eslint-disable-line react-hooks/exhaustive-deps
  function chonPhai(j: number) {
    if (chon === null || Object.values(noi).includes(j)) return;
    fx.ghi(chon === j);
    if (chon === j) { setNoi((n) => ({ ...n, [chon]: j })); setChon(null); setGoi(null); }
    else { setLoi((v) => v + 1); setSai(j); setTimeout(() => setSai(null), 600); setSaiLan((s) => ({ ...s, [chon]: (s[chon] ?? 0) + 1 })); setGoi(goiY?.[chon] ?? 'Đọc lại khung "Ôn nền" và hình ở trên.'); }
  }
  const thuTu = (i: number) => Object.keys(noi).map(Number).sort((a, b) => a - b).indexOf(i) + 1;
  return <div className="tcn-noi">
    <p className="tcn-tb" aria-live="polite">{chon === null ? 'Chọn một ô bên trái.' : 'Giờ chọn ô bên phải hợp với nó.'} <small>Đã nối {Object.keys(noi).length}/{cap.length}</small></p>
    <GoiYO c={goi} />
    <div className="tcn-noi__cot">
      <div role="group" aria-label="Cột trái">
        {cap.map((c, i) => <button key={i} type="button" className={'tcn-o' + (chon === i ? ' dang-chon' : '') + (i in noi ? ' da-noi' : '')}
          onClick={() => { if (!(i in noi)) { setChon(i); fx.bam(); } }} aria-pressed={chon === i} disabled={i in noi}>
          {i in noi && <b className="tcn-so">{thuTu(i)}</b>}<M c={c[0]} /></button>)}
      </div>
      <div role="group" aria-label="Cột phải">
        {phai.map((j) => {
          const trai = Object.keys(noi).map(Number).find((k) => noi[k] === j);
          return <button key={j} type="button" className={'tcn-o tcn-o--phai' + (trai !== undefined ? ' da-noi' : '') + (sai === j ? ' rung' : '') + (chon === j && (saiLan[chon] ?? 0) >= 2 ? ' goi-y-dung' : '')}
            onClick={() => chonPhai(j)} disabled={trai !== undefined}>
            {trai !== undefined && <b className="tcn-so">{thuTu(trai)}</b>}<M c={cap[j][1]} /></button>;
        })}
      </div>
    </div>
  </div>;
}

/* ------------------------------------------------- 3. Đúng hay sai siêu tốc -- */
function DungSai({ du, xong }: { du: TroChoi; xong: KetThuc }) {
  const fx = useFx();
  const [cau] = useState(() => tron(du.cau as [string, boolean, string][]));
  const GIAY = 15;
  const [i, setI] = useState(0);
  const [tra, setTra] = useState<null | 'dung' | 'sai' | 'het'>(null);
  const [diem, setDiem] = useState(0);
  const [con, setCon] = useState(GIAY);
  const [dongHo, setDongHo] = useState(true);
  useEffect(() => {
    if (tra || !dongHo) return;
    if (con <= 0) { setTra('het'); return; }
    const t = setTimeout(() => setCon((v) => v - 1), 1000);
    return () => clearTimeout(t);
  }, [con, tra, dongHo]);
  const c = cau[i];
  useBaoCau(c?.[0], !!tra);
  function bam(v: boolean) { if (tra) return; const ok = v === c[1]; fx.ghi(ok); if (ok) setDiem((d) => d + 1); setTra(ok ? 'dung' : 'sai'); }
  function tiep() { if (i + 1 >= cau.length) { xong(diem, cau.length); return; } setI(i + 1); setTra(null); setCon(GIAY); }
  return <div className="tcn-ds">
    <div className="tcn-ds__tren">
      <span>Câu {i + 1}/{cau.length} · Đúng {diem}</span>
      <label className="tcn-nho"><input type="checkbox" checked={dongHo} onChange={(e) => setDongHo(e.target.checked)} /> Bấm giờ</label>
    </div>
    {dongHo && <div className="tcn-giay" aria-hidden="true"><i style={{ width: `${(con / GIAY) * 100}%` }} /></div>}
    <div className="tcn-ds__cau" key={i}><span className="tcn-ds__so" aria-hidden="true">⚡ {i + 1}</span><M c={c[0]} /></div>
    <div className="tcn-ds__nut">
      <button type="button" className="tcn-nut tcn-nut--dung" onClick={() => bam(true)} disabled={!!tra}>✓ Đúng</button>
      <button type="button" className="tcn-nut tcn-nut--sai" onClick={() => bam(false)} disabled={!!tra}>✗ Sai</button>
    </div>
    <div className={'tcn-phan-hoi' + (tra ? (tra === 'dung' ? ' tcn-phan-hoi--dung' : ' tcn-phan-hoi--sai') : '')} aria-live="polite">
      {tra && <>
        <p className={tra === 'dung' ? 'tcn-ok' : 'tcn-chua'}>{tra === 'dung' ? '🎉 ' : '💡 '}{tra === 'dung' ? 'Chính xác!' : tra === 'het' ? `Hết giờ. Câu này ${c[1] ? 'Đúng' : 'Sai'}.` : `Chưa đúng. Câu này ${c[1] ? 'Đúng' : 'Sai'}.`}</p>
        <p><M c={c[2]} /></p>
        <button type="button" className="tcn-nut" onClick={tiep} autoFocus>{i + 1 >= cau.length ? 'Xem kết quả' : 'Câu tiếp →'}</button>
      </>}
    </div>
  </div>;
}

/* ------------------------------------------------------------ 4. Bắn bóng -- */
const MAU_BONG = ['#e3392f', '#2f6fe0', '#ffb703', '#46b35a'];
function BanBong({ du, xong, goiY }: { du: TroChoi; xong: KetThuc; goiY?: GoiY }) {
  const fx = useFx();
  const vo = voTroChoi(String((du as { ku?: string }).ku ?? ''), 'banBong');
  const hinh = vo?.hinh ?? 'bong';
  const [cau] = useState(() => tron((du.cau as string[][]).map((c, g) => ({ g, c }))).map(({ g, c }) => ({ g, hoi: c[0], dung: c[1], chon: tron(c.slice(1)) })));
  const [i, setI] = useState(0);
  const [no, setNo] = useState<string[]>([]);
  const [trung, setTrung] = useState<string | null>(null);
  const [diem, setDiem] = useState(0);
  const c = cau[i];
  useBaoCau(c?.hoi, !!trung);
  function ban(x: string) {
    if (trung || no.includes(x)) return;
    fx.ghi(x === c.dung);
    if (x === c.dung) {
      if (!no.length) setDiem((d) => d + 1);
      setTrung(x);
      setTimeout(() => { if (i + 1 >= cau.length) xong(diem + (no.length ? 0 : 1), cau.length); else { setI(i + 1); setNo([]); setTrung(null); } }, 750);
    } else setNo((n) => [...n, x]);
  }
  return <div className={'tcn-bong tcn-bong--' + hinh}>
    <p className="tcn-tb" aria-live="polite">{no.length ? 'Chưa đúng rồi. Thử cái khác!' : (vo?.hd ?? 'Bắn vào quả bóng mang đáp án đúng.')} <small>Câu {i + 1}/{cau.length} · Trúng ngay {diem}</small></p>
    <GoiYO c={no.length && !trung ? goiY?.[c.g] ?? 'Đọc lại khung "Ôn nền" ở trên.' : null} />
    <div className="tcn-bong__hoi"><M c={c.hoi} /></div>
    <div className="tcn-bong__troi">
      {c.chon.map((x, k) => <button key={i + '-' + x} type="button" style={{ ['--mau' as string]: MAU_BONG[k % 4], ['--tre' as string]: `${k * -0.7}s` }}
        className={'tcn-qua' + (vo ? ' tcn-qua--anh' : '') + (x.length > 9 ? ' dai' : '') + (no.includes(x) ? ' xit' : '') + (trung === x ? ' no' : '')} onClick={() => ban(x)} disabled={no.includes(x) || !!trung}>
        {vo ? <span className="tcn-qua__than tcn-qua__than--anh" style={{ backgroundImage: `url(/tro-choi/ban/${vo.chuong}-${(k % 4) + 1}.webp)` }}><span className="tcn-qua__nhan"><M c={x} /></span></span>
          : <><span className="tcn-qua__than"><M c={x} /></span><span className="tcn-qua__day" aria-hidden="true" /></>}
      </button>)}
    </div>
  </div>;
}

/* ------------------------------------------------------------- 5. Leo núi -- */
function LeoNui({ du, xong, goiY }: { du: TroChoi; xong: KetThuc; goiY?: GoiY }) {
  const fx = useFx();
  const canh = canhChuong(String((du as { ku?: string }).ku ?? ''));
  const cd = chuDeChuong(canh?.chuong);
  const [cau] = useState(() => (du.cau as string[][]).map((c) => ({ hoi: c[0], dung: c[1], chon: tron(c.slice(1)) })));
  const [i, setI] = useState(0);
  const [sai, setSai] = useState<string[]>([]);
  const [loi, setLoi] = useState(0);
  const tong = cau.length;
  const c = cau[Math.min(i, tong - 1)];
  useBaoCau(c?.hoi, false);
  function chon(x: string) {
    if (sai.includes(x)) return;
    fx.ghi(x === c.dung);
    if (x === c.dung) { const j = i + 1; setI(j); setSai([]); if (j >= tong) setTimeout(() => xong(tong, tong + loi), 900); }
    else { setSai((s) => [...s, x]); setLoi((v) => v + 1); }
  }
  const diem = (k: number) => ({ x: 8 + (k / tong) * 84, y: 88 - (k / tong) * 74 });
  const p = diem(i);
  return <div className="tcn-nui">
    <div className={'tcn-nui__canh' + (canh ? ' co-canh' : '')} aria-hidden="true">
      {canh && <span className="tcn-nui__dich">{canh.dich}</span>}
      <svg viewBox="0 0 100 100" preserveAspectRatio="none">
        {!canh && <polygon points="0,100 30,40 45,55 70,12 100,100" fill="#8fd18a" />}
        {!canh && <polygon points="62,26 70,12 78,28 73,24 69,30 66,25" fill="#ffffff" />}
        <polyline points={Array.from({ length: tong + 1 }, (_, k) => `${diem(k).x},${diem(k).y}`).join(' ')} fill="none" stroke="#7a5a3c" strokeWidth="1.2" strokeDasharray="2 1.5" />
        {Array.from({ length: tong + 1 }, (_, k) => <circle key={k} cx={diem(k).x} cy={diem(k).y} r="1.8" fill={k <= i ? '#ffcf3f' : '#ffffff'} stroke="#7a5a3c" strokeWidth=".5" />)}
        <line x1={diem(tong).x} y1={diem(tong).y} x2={diem(tong).x} y2={diem(tong).y - 10} stroke="#5b3a2a" strokeWidth=".8" />
        <polygon points={`${diem(tong).x},${diem(tong).y - 10} ${diem(tong).x + 7},${diem(tong).y - 8} ${diem(tong).x},${diem(tong).y - 6}`} fill="#e3392f" />
      </svg>
      <AnhChuDe className="tcn-nui__ban" src={cd?.nvBin ?? '/minh-hoa/nv/lo-trinh.webp'} fallback="/minh-hoa/nv/lo-trinh.webp" alt="" style={{ left: `${p.x}%`, top: `${p.y}%` }} />
    </div>
    {i < tong ? <>
      <p className="tcn-tb" aria-live="polite">{sai.length ? 'Chưa đúng, đứng lại một nhịp! Chọn đáp án khác.' : `Chặng ${i + 1}/${tong}`}</p>
      <GoiYO c={sai.length ? goiY?.[i] ?? 'Đọc lại khung "Ôn nền" ở trên.' : null} />
      <div className="tcn-bong__hoi"><M c={c.hoi} /></div>
      <div className="tcn-nui__chon">
        {c.chon.map((x) => <button key={i + '-' + x} type="button" className={'tcn-nut tcn-nut--lua-chon' + (sai.includes(x) ? ' sai' : '')} onClick={() => chon(x)} disabled={sai.includes(x)}><M c={x} /></button>)}
      </div>
    </> : <p className="tcn-tb tcn-ok">Lên tới đỉnh rồi! 🚩</p>}
  </div>;
}

/* ---------------------------------------------------------- 6. Mật mã số -- */
function DienSo({ du, xong }: { du: TroChoi; xong: KetThuc; goiY?: GoiY }) {
  const fx = useFx();
  const cd = chuDeMatMa(String((du as { ku?: string }).ku ?? ''));
  const cau = du.cau as [string, string, string][];
  const [i, setI] = useState(0);
  const [go, setGo] = useState('');
  const [lan, setLan] = useState(0);
  const [mo, setMo] = useState<boolean[]>([]);
  const [hien, setHien] = useState<null | 'dung' | 'lo'>(null);
  const o = useRef<HTMLInputElement>(null);
  useEffect(() => { o.current?.focus(); }, [i]);
  const c = cau[i];
  useBaoCau(c?.[0], !!hien);
  function thu(e?: React.FormEvent) {
    e?.preventDefault();
    if (hien || !go.trim()) return;
    fx.ghi(soKhopDapSo(go, c[1]));
    if (soKhopDapSo(go, c[1])) { setHien('dung'); setMo((m) => [...m, true]); }
    else if (lan >= 1) { setHien('lo'); setMo((m) => [...m, false]); }
    else setLan(1);
  }
  function tiep() { if (i + 1 >= cau.length) { xong(mo.filter(Boolean).length, cau.length); return; } setI(i + 1); setGo(''); setLan(0); setHien(null); }
  return <div className="tcn-mat-ma">
    {cd ? <div className="tcn-nv" style={{ ['--nv' as string]: DIA_DANH[cd.chuong]?.mau }} aria-label={`${cd.ten}: ${mo.filter(Boolean).length}/${cau.length} ${cd.don}`}>
      <img key={anhMucMatMa(cd.chuong, mo.filter(Boolean).length, cau.length)} className="tcn-nv__anh" src={anhMucMatMa(cd.chuong, mo.filter(Boolean).length, cau.length)} width={120} height={120} alt="" />
      <div className="tcn-nv__chu">
        <b>{cd.bieuTuong} {cd.ten}</b>
        <span className="tcn-nv__nac" aria-hidden="true">{cau.map((_, k) => <i key={k} className={k < mo.length ? (mo[k] ? 'dung' : 'lo') : ''} />)}</span>
        <small>{mo.filter(Boolean).length}/{cau.length} {cd.don}</small>
      </div>
    </div> : <div className="tcn-ruong" aria-label={`Đã mở ${mo.length}/${cau.length} ổ khoá`}>
      <span className="tcn-ruong__hop" aria-hidden="true">{mo.length === cau.length ? '💰' : '🧰'}</span>
      {cau.map((_, k) => <span key={k} className={'tcn-khoa' + (k < mo.length ? (mo[k] ? ' mo' : ' lo') : '')} aria-hidden="true">{k < mo.length ? (mo[k] ? '🔓' : '🔑') : '🔒'}</span>)}
    </div>}
    <div className="tcn-bong__hoi"><M c={c[0]} /></div>
    <form className="tcn-so__o" onSubmit={thu}>
      <label className="sr-only" htmlFor="tcn-dap-so">Đáp số</label>
      <input id="tcn-dap-so" ref={o} inputMode="decimal" autoComplete="off" value={go} onChange={(e) => setGo(e.target.value)} disabled={!!hien} placeholder="Gõ đáp số" />
      <button type="submit" className="tcn-nut" disabled={!!hien || !go.trim()}>{cd?.nut ?? 'Mở khoá'}</button>
    </form>
    <div className="tcn-phan-hoi" aria-live="polite">
      {!hien && lan === 1 && <><p className="tcn-chua">Chưa đúng. Em thử lại một lần nữa nhé.</p><GoiYO c={goiYTuLoiGiai(c[2], c[1])} /></>}
      {hien && <>
        <p className={hien === 'dung' ? 'tcn-ok' : 'tcn-chua'}>{hien === 'dung' ?  <><TichVang/> {cd?.dung ?? 'Mở khoá thành công!'}</> : <>Đáp số là <M c={c[1]} />. Lần sau em sẽ làm được!</>}</p>
        <p><M c={c[2]} /></p>
        <button type="button" className="tcn-nut" onClick={tiep} autoFocus>{i + 1 >= cau.length ? (cd?.cuoi ?? 'Mở rương') : (cd?.tiep ?? 'Ổ khoá tiếp →')}</button>
      </>}
    </div>
  </div>;
}

/* ------------------------------------------------------- 7. Xếp bậc thang -- */
function SapXep({ du, xong }: { du: TroChoi; xong: KetThuc; goiY?: GoiY }) {
  const fx = useFx();
  const bai = du.bai as { de: string; buoc: string[] }[];
  const [b, setB] = useState(0);
  const [thu, setThu] = useState<number[]>(() => tronKhacGoc(bai[0].buoc.map((_, k) => k)));
  const [kq, setKq] = useState<boolean[] | null>(null);
  const [loi, setLoi] = useState(0);
  const [saiBai, setSaiBai] = useState(0);
  const keo = useRef<number | null>(null);
  const doi = (a: number, c: number) => { if (c < 0 || c >= thu.length) return; const t = thu.slice(); [t[a], t[c]] = [t[c], t[a]]; setThu(t); setKq(null); };
  const dungHet = kq?.every(Boolean);
  useBaoCau(bai[b]?.de, !!dungHet);
  function kiemTra() { const r = thu.map((v, k) => v === k); setKq(r); fx.ghi(r.every(Boolean)); if (!r.every(Boolean)) { setLoi((v) => v + 1); setSaiBai((v) => v + 1); } }
  function tiep() { if (b + 1 >= bai.length) { xong(bai.length, bai.length + loi); return; } const nb = b + 1; setB(nb); setThu(tronKhacGoc(bai[nb].buoc.map((_, k) => k))); setKq(null); setSaiBai(0); }
  return <div className="tcn-xep">
    <p className="tcn-tb">Bài {b + 1}/{bai.length}: <M c={bai[b].de} /></p>
    <ol className="tcn-xep__ds">
      {thu.map((v, k) => <li key={v} draggable onDragStart={() => { keo.current = k; }} onDragOver={(e) => e.preventDefault()}
        onDrop={() => { if (keo.current !== null && keo.current !== k) { const t = thu.slice(); const [x] = t.splice(keo.current, 1); t.splice(k, 0, x); setThu(t); setKq(null); } keo.current = null; }}
        className={'tcn-bac' + (kq ? (kq[k] ? ' dung' : ' sai') : '')} style={{ ['--lui' as string]: `${k * 14}px` }}>
        <span className="tcn-bac__so">{k + 1}</span>
        <span className="tcn-bac__chu"><M c={bai[b].buoc[v]} /></span>
        <span className="tcn-bac__nut">
          <button type="button" onClick={() => doi(k, k - 1)} disabled={k === 0} aria-label="Đưa lên">▲</button>
          <button type="button" onClick={() => doi(k, k + 1)} disabled={k === thu.length - 1} aria-label="Đưa xuống">▼</button>
        </span>
      </li>)}
    </ol>
    <div className="tcn-phan-hoi" aria-live="polite">
      {kq && !dungHet && <p className="tcn-chua">Các bậc màu đỏ còn sai chỗ. Em đổi lại rồi kiểm tra tiếp.</p>}
      {saiBai >= 2 && !dungHet && <GoiYO c={(() => { const n = Math.min(saiBai - 1, bai[b].buoc.length - 1); return (n === 1 ? 'Bậc 1 đúng là: ' : `${n} bậc đầu đúng là: `) + bai[b].buoc.slice(0, n).join('  →  '); })()} />}
      {dungHet ? <><p className="tcn-ok">Xếp đúng hết rồi!</p><button type="button" className="tcn-nut" onClick={tiep} autoFocus>{b + 1 >= bai.length ? 'Xem kết quả' : 'Bài tiếp →'}</button></>
        : <button type="button" className="tcn-nut" onClick={kiemTra}>Kiểm tra</button>}
    </div>
  </div>;
}

/* ---------------------------------------------------- 8. Phân loại vào giỏ -- */
function PhanLoai({ du, xong, goiY }: { du: TroChoi; xong: KetThuc; goiY?: GoiY }) {
  const canh = canhChuong(String((du as { ku?: string }).ku ?? ''));
  const [muc] = useState(() => tron((du.muc as [string, number][]).map((m, k) => ({ k, chu: m[0], gio: m[1] }))));
  const [chon, setChon] = useState<number | null>(null);
  const [vao, setVao] = useState<Record<number, number>>({});
  const [rung, setRung] = useState<number | null>(null);
  const [loi, setLoi] = useState(0);
  const [tb, setTb] = useState('Chọn một thẻ rồi bấm vào giỏ.');
  const fx = useFx();
  const [goi, setGoi] = useState<string | null>(null);
  useEffect(() => { if (Object.keys(vao).length === muc.length) xong(muc.length, muc.length + loi); }, [vao]); // eslint-disable-line react-hooks/exhaustive-deps
  function bo(g: number, k = chon) {
    if (k === null) { setTb('Em chọn một thẻ trước đã.'); return; }
    const m = muc.find((x) => x.k === k)!;
    fx.ghi(m.gio === g);
    if (m.gio === g) { setVao((v) => ({ ...v, [k]: g })); setChon(null); setTb('Đúng giỏ rồi!'); setGoi(null); }
    else { setLoi((v) => v + 1); setRung(g); setTb('Chưa đúng giỏ. Em nghĩ lại nhé.'); setGoi(goiY?.[k] ?? null); setTimeout(() => setRung(null), 500); }
  }
  return <div className="tcn-loai">
    <p className="tcn-tb" aria-live="polite">{tb} <small>Đã xếp {Object.keys(vao).length}/{muc.length}</small></p>
    <GoiYO c={goi} />
    <div className="tcn-loai__the">
      {muc.filter((m) => !(m.k in vao)).map((m) => <button key={m.k} type="button" draggable onDragStart={(e) => { e.dataTransfer.setData('text/plain', String(m.k)); setChon(m.k); }}
        className={'tcn-chip' + (chon === m.k ? ' dang-chon' : '')} aria-pressed={chon === m.k} onClick={() => setChon(m.k)}><M c={m.chu} /></button>)}
    </div>
    <div className="tcn-loai__gio">
      {(du.gio as string[]).map((g, gi) => <button key={gi} type="button" className={'tcn-gio' + (rung === gi ? ' rung' : '')} onClick={() => bo(gi)}
        onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); bo(gi, Number(e.dataTransfer.getData('text/plain'))); }}>
        <span className="tcn-gio__ten">{canh ? <img className="tcn-gio__anh" src={`/tro-choi/gio/${canh.chuong}.webp`} width={56} height={56} alt="" /> : '🧺'} <M c={g} /></span>
        <span className="tcn-gio__trong">{muc.filter((m) => vao[m.k] === gi).map((m) => <span key={m.k} className="tcn-chip tcn-chip--vao"><M c={m.chu} /></span>)}</span>
      </button>)}
    </div>
  </div>;
}

const TRO: Record<string, (p: { du: TroChoi; xong: KetThuc; goiY?: GoiY }) => ReactNode> = { latThe: LatThe, noiCot: NoiCot, dungSai: DungSai, banBong: BanBong, leoNui: LeoNui, dienSo: DienSo, sapXep: SapXep, phanLoai: PhanLoai };

/** Thanh điểm, chữ bay, pháo giấy và nút nhạc bao quanh trò chơi. */
function LopFx({ children, chay, xongVan, chuong }: { children: ReactNode; chay: boolean; xongVan: boolean; chuong?: string | null }) {
  const [diem, setDiem] = useState(0);
  const [chuoi, setChuoi] = useState(0);
  const [loiLienTiep, setLoiLienTiep] = useState(0);
  const [bay, setBay] = useState<{ id: number; x: number; y: number; chu: string; ok: boolean }[]>([]);
  const [rung, setRung] = useState(false);
  const [nhac, setNhac] = useState(true);
  const [hu, setHu] = useState(true);
  const vung = useRef<HTMLDivElement>(null);
  const tro = useRef({ x: 50, y: 40 });
  const chuoiRef = useRef(0);
  const dem = useRef(0);
  useEffect(() => { setNhac(amThanh.nhac); setHu(amThanh.hieuUng); }, []);
  useEffect(() => {
    if (chay && !xongVan) batNhac(); else tatNhac();
    if (xongVan) phat('ve-dich');
  }, [chay, xongVan]);
  useEffect(() => {
    const roi = () => tatNhac();
    const an = () => { if (document.hidden) tatNhac(); else if (chay && !xongVan) batNhac(); };
    window.addEventListener('learning-step-leave', roi); document.addEventListener('visibilitychange', an);
    return () => { window.removeEventListener('learning-step-leave', roi); document.removeEventListener('visibilitychange', an); tatNhac(); };
  }, [chay, xongVan]);
  const themBay = (chu: string, ok: boolean) => {
    const id = ++dem.current;
    setBay((b) => [...b.filter(v => v.ok === ok).slice(-5), { id, x: tro.current.x, y: tro.current.y, chu, ok }]);
    setTimeout(() => setBay((b) => b.filter((v) => v.id !== id)), 1100);
  };
  const fx: Fx = {
    bam: () => phat('bam'),
    ghi: (ok) => {
      if (ok) {
        const c = chuoiRef.current + 1; chuoiRef.current = c; setChuoi(c);
        const cong = 10 + Math.min(c - 1, 4) * 5; setDiem((d) => d + cong);
        setLoiLienTiep(0);
        setRung(false);
        phat('dung', c); themBay(c >= 3 ? `🔥 x${c}  +${cong}` : `+${cong}`, true);
      } else {
        setLoiLienTiep(n => n + 1);
        chuoiRef.current = 0; setChuoi(0); phat('sai'); themBay('Thử lại nhé!', false);
        setRung(true); setTimeout(() => setRung(false), 420);
      }
    }
  };
  return <FxCtx.Provider value={fx}>
    <div className="tcn-hud">
      <span className="tcn-hud__diem">⭐ <b>{diem}</b> điểm</span>
      <span className={'tcn-hud__chuoi' + (chuoi >= 2 ? ' nong' : '')}>🔥 {chuoi >= 2 ? `Chuỗi ${chuoi}` : 'Chuỗi 0'}</span>
      <span className="tcn-hud__nut">
        <button type="button" aria-pressed={nhac} title={nhac ? 'Tắt nhạc' : 'Bật nhạc'} onClick={() => { const v = !nhac; setNhac(v); datNhac(v); if (v && !(chay && !xongVan)) tatNhac(); }}>{nhac ? '🎵' : '🔇'}<span> Nhạc</span></button>
        <button type="button" aria-pressed={hu} title={hu ? 'Tắt âm thanh' : 'Bật âm thanh'} onClick={() => { const v = !hu; setHu(v); datHieuUng(v); }}>{hu ? '🔊' : '🔈'}<span> Âm thanh</span></button>
      </span>
    </div>
    <div ref={vung} className={'tcn-san' + (rung ? ' tcn-san--rung' : '')}
      onPointerDownCapture={(e) => { const r = vung.current?.getBoundingClientRect(); if (r) tro.current = { x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 }; }}>
      {children}
      {!xongVan && (loiLienTiep > 0 || chuoi >= 3) && <NhanVat
        key={loiLienTiep >= 3 ? 'dong-vien' : loiLienTiep ? 'sai' : 'chuoi'}
        loi={loiLienTiep >= 3 ? 'saiNhieu' : loiLienTiep ? 'sai' : 'chuoi'} chuong={chuong} compact />}
      <div className="tcn-bay"  aria-hidden="true">
        {bay.map((b) => <span key={b.id} className={'tcn-bay__chu' + (b.ok ? '' : ' sai')} style={{ left: `${b.x}%`, top: `${b.y}%` }}>
          {b.ok && <TichVang/>} {b.chu}{b.ok && <><i style={{ ['--g' as string]: '-40deg' }}>✦</i><i style={{ ['--g' as string]: '20deg' }}>★</i><i style={{ ['--g' as string]: '80deg' }}>✦</i><i style={{ ['--g' as string]: '150deg' }}>★</i></>}
        </span>)}
      </div>
      {xongVan && <div className="tcn-phao" aria-hidden="true">{Array.from({ length: 36 }, (_, k) => <i key={k} style={{ left: `${(k * 37) % 100}%`, animationDelay: `${(k % 9) * 0.08}s`, background: ['#ff595e', '#ffca3a', '#8ac926', '#1982c4', '#6a4c93', '#ff924c'][k % 6] }} />)}</div>}
    </div>
  </FxCtx.Provider>;
}

export default function TroChoiNen({ kuId }: { kuId: string }) {
  const du = (TRO_CHOI_THEO_MUC as Record<string, TroChoi>)[kuId];
  const mission = useGameMission();
  const [van, setVan] = useState(0);
  const [kq, setKq] = useState<{ dung: number; tong: number } | null>(null);
  const [chay, setChay] = useState(false);
  const [cauHinh, setCauHinh] = useState<{ t: string; tra: boolean } | null>(null);
  const kieu = du ? (KIEU_TRO_CHOI as Record<string, { ten: string; bieuTuong: string; cach: string }>)[du.kieu] : null;
  const Tro = du ? TRO[du.kieu] : null;
  const cdTen = du?.kieu === 'dienSo' ? chuDeMatMa(kuId) : null;
  const voKhac = du && du.kieu !== 'dienSo' ? voTroChoi(kuId, du.kieu) : null;
  const canh = canhChuong(kuId);
  const kieuHien = kieu && cdTen ? { ...kieu, ten: cdTen.ten, bieuTuong: cdTen.bieuTuong, cach: cdTen.cach }
    : kieu && voKhac ? { ...kieu, ten: voKhac.ten, bieuTuong: voKhac.bieuTuong, cach: voKhac.cach } : kieu;
  const batDau = useMemo(() => () => { setKq(null); setChay(true); setVan((v) => v + 1); ghiSuKien(kuId, 'game_start', { kieu: du?.kieu }); }, [kuId, du]);
  if (!du || !kieu || !Tro) return null;
  const xong: KetThuc = (dung, tong) => { setKq({ dung, tong }); ghiSuKien(kuId, 'game_finish', { kieu: du.kieu, dung, tong }); window.dispatchEvent(new CustomEvent('f9-buoc-xong', { detail: 'game' })); };
  const sao = kq ? (kq.dung / Math.max(1, kq.tong) >= 0.85 ? 3 : kq.dung / Math.max(1, kq.tong) >= 0.6 ? 2 : 1) : 0;
  return <GameMission mission={mission} title={`${kieuHien!.bieuTuong} ${kieuHien!.ten}`} icon={kieuHien!.bieuTuong}
    intro={`Ôn kiến thức nền trước khi xem video bài mới. ${kieuHien!.cach}`}
    step={kq ? 'Hoàn thành' : 'Đang chơi'} finished={!!kq} ready={!!kq} onStart={batDau}>
    <section className={'tcn' + (canh ? ' tcn--chu-de' : '')} aria-label={kieuHien!.ten}
      style={canh ? { ['--cd-mau' as string]: canh.mau, ['--cd-nen' as string]: `url(${canh.nen})` } : undefined}>
      <LopFx key={van} chay={chay} xongVan={!!kq} chuong={kuId}>
      <KuCtx.Provider value={kuId}>
      <p className="tcn-nen"><span>Ôn nền</span> <M c={du.nen} /></p>
      <CauCtx.Provider value={setCauHinh}>
      <div className="tcn-bo">
      <div className="tcn-bo__hinh"><HinhNen kuId={kuId} cau={kq ? null : cauHinh} /></div>
      <div className="tcn-bo__choi">
      {kq ? <div className="tcn-ket">
        <NhanVat loi={kq.dung * 2 < kq.tong ? "saiNhieu" : "gameXong"} chuong={kuId} />
        <p className="tcn-ket__sao" aria-label={`${sao} trên 3 sao`}>{'★'.repeat(sao)}<span>{'★'.repeat(3 - sao)}</span></p>
        <h3>{sao === 3 ? 'Nền vững rồi!' : sao === 2 ? 'Khá lắm!' : 'Đã ôn xong!'}</h3>
        {kq.dung / Math.max(1, kq.tong) < 0.5 && kyNangCuaMuc(kuId)
          ? <><p>Phần nền này em còn sai nhiều. Đọc thẻ Ôn nhanh dưới đây trong 1 phút rồi hãy xem video nhé.</p><OnNhanh ma={kyNangCuaMuc(kuId)!} /></>
          : <p>Em đã sẵn sàng xem video bài mới. Bấm <b>Tiếp tục bài học</b> ở dưới.</p>}
        <button type="button" className="tcn-nut tcn-nut--phu" onClick={batDau}>Chơi lại</button>
      </div> : <Tro key={van} du={du} xong={xong} goiY={(GOI_Y_NEN as Record<string, string[]>)[kuId]} />}
      </div>
      </div>
      </CauCtx.Provider>
      </KuCtx.Provider>
      </LopFx>
    </section>
  </GameMission>;
}
