'use client';
/**
 * FILE NÀY LÀM GÌ: Component React giao diện hiển thị và xử lý tương tác của người dùng trên trình duyệt.
 * AI DÙNG: học sinh
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: @/components/tro-choi-nen/amThanh, @/components/truc-quan/NutAmHieuUng, @/components/truc-quan/PhanHoiDung, @/lib/dfle/t9-tu-vung-anh.js, @/lib/dfle/t9-tieng-anh-thuc-te.js, @/lib/dfle/t9-tieng-anh-bai.js, @/lib/dfle/t9-tom-tat.js, @/components/MathText
 */
import { phat } from '@/components/tro-choi-nen/amThanh';
import NutAmHieuUng from '@/components/truc-quan/NutAmHieuUng';
import { TichVang } from '@/components/truc-quan/PhanHoiDung';

import { useEffect, useMemo, useState } from 'react';
import { TU_VUNG_ANH, tuVungCuaMuc } from '@/lib/dfle/t9-tu-vung-anh.js';
import { viDuThucTe } from '@/lib/dfle/t9-tieng-anh-thuc-te.js';
import { TIENG_ANH_BAI, BAI_TIENG_ANH, baiCuaMuc, anhTruyen } from '@/lib/dfle/t9-tieng-anh-bai.js';
import { TOM_TAT } from '@/lib/dfle/t9-tom-tat.js';
import MathText from '@/components/MathText';
import { coGiongDoc, chonGiong, noi, ghiSuKien } from '@/lib/giongDoc';
import { chapterOf } from '@/lib/chapters';
import { stickerChoTu } from '@/lib/chuDeChuong';
import { anhTu } from '@/lib/tiengAnhMoiTu';
import AnhChuDe from '@/components/AnhChuDe';
import './tieng-anh.css';

type Tu = { en: string; vi: string; vd: string; vdVi: string; ku: string };
const TV = TU_VUNG_ANH as unknown as Record<string, Tu[]>;
const LA_MA = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];

type TuBai = { en: string; loai: string; ipa: string; vi: string; cau: string; hinh: string; sua?: string };
type Loi = { khung: number; ai: string; en: string };
type Bai = { ten: string; tenVi: string; tu: TuBai[]; truyen: Loi[]; suaTruyen?: string; meo: string };
const TB = TIENG_ANH_BAI as unknown as Record<number, Bai>;
const DS_BAI = BAI_TIENG_ANH as number[];
/** Chương đã có bộ từ theo bài (bài 1–12 = chương I–IV) thì ẩn bộ cũ theo chương. */
const CHUONG_THEO_BAI: Record<string, number[]> = { C1: [1, 2, 3], C2: [4, 5, 6], C3: [7, 8, 9, 10], C4: [11, 12] };
const chuongCuaBai = (so: number | null) => so == null ? null : (Object.entries(CHUONG_THEO_BAI).find(([, bs]) => bs.includes(so))?.[0] ?? null);
const muc1CuaBai = (b: number) => Object.keys(TOM_TAT).find((k) => baiCuaMuc(k) === b) ?? `B${b}`;

/** Chuyển một công thức LaTeX thành chữ tiếng Anh để máy đọc. */
function docCongThuc(m: string): string {
  // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
  let t = m.replace(/\\(text|mathrm)\{([^}]*)\}/g, ' $2 ').replace(/\\begin\{cases\}|\\end\{cases\}/g, ' ').replace(/\\\\/g, ' and ');
  for (let i = 0; i < 4; i++) {
    // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
    t = t.replace(/\\[dt]?frac\{([^{}]*)\}\{([^{}]*)\}/g, ' $1 over $2 ')
      .replace(/\\sqrt\[3\]\{([^{}]*)\}/g, ' the cube root of $1 ')
      .replace(/\\sqrt\{([^{}]*)\}/g, ' the square root of $1 ');
  }
  // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
  return t.replace(/\\sqrt(\w)/g, ' the square root of $1 ')
    .replace(/\^2/g, ' squared ').replace(/\^3/g, ' cubed ').replace(/\^\\circ/g, ' degrees ').replace(/\^\{?(\w+)\}?/g, ' to the power $1 ')
    .replace(/\\le\b/g, ' is less than or equal to ').replace(/\\ge\b/g, ' is greater than or equal to ').replace(/\\ne\b/g, ' is not equal to ')
    .replace(/\\cdot|\\times/g, ' times ').replace(/\\(sin|cos|tan|cot)\b/g, ' $1 ').replace(/\\alpha/g, ' alpha ').replace(/\\beta/g, ' beta ')
    .replace(/\\Rightarrow/g, ' so ').replace(/\\[a-zA-Z]+/g, ' ').replace(/[{}\\]/g, ' ')
    .replace(/</g, ' is less than ').replace(/>/g, ' is greater than ').replace(/=/g, ' equals ')
    .replace(/\+/g, ' plus ').replace(/-/g, ' minus ').replace(/;/g, ', ').replace(/(\d),(\d)/g, '$1.$2');
}
/** Câu có công thức trong $...$ thành câu đọc được. */
export function docDuoc(s: string): string {
  // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
  return s.split('$').map((p, i) => (i % 2 ? docCongThuc(p) : p)).join(' ').replace(/\s+/g, ' ').trim();
}

/**
 * Component React `tron`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
function tron<T>(a: T[]): T[] {
  const b = a.slice();
  // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
  for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; }
  return b;
}

/** Kiểm tra máy có giọng tiếng Anh không (giọng nạp chậm nên nghe sự kiện voiceschanged). */
function useGiongAnh() {
  const [co, setCo] = useState<boolean | null>(null);
  useEffect(() => {
    if (!coGiongDoc()) { setCo(false); return; }
    const xem = () => setCo(!!chonGiong('en-US') || !!chonGiong('en-GB'));
    xem();
    window.speechSynthesis.addEventListener?.('voiceschanged', xem);
    return () => window.speechSynthesis.removeEventListener?.('voiceschanged', xem);
  }, []);
  return co;
}
const doc = (s: string, cham = false) => noi(s, chonGiong('en-US') ? 'en-US' : 'en-GB', { rate: cham ? 0.6 : 0.85 });

/** Ví dụ đời thường: hình minh hoạ to + câu tiếng Anh + nghĩa. */
function ViDuDoi({ en, chuong }: { en: string; chuong?: string | null }) {
  const v = viDuThucTe(en) as [string, string, string] | null;
  if (!v) return null;
  const sticker = stickerChoTu(en, chuong, v[0]);
  return (
    <div className="ta-doi">
      <span className="ta-doi__hinh" aria-hidden="true">
        {sticker ? (
          <AnhChuDe
            className="ta-doi__sticker"
            src={sticker}
            fallbackNode={<span>{v[0]}</span>}
            width={52}
            height={52}
            alt=""
            loading="lazy"
          />
        ) : (
          v[0]
        )}
      </span>
      <div className="ta-doi__chu">
        <span className="ta-nhan ta-nhan--doi">🍊 Ngoài đời</span>
        <p><button type="button" className="ta-loa ta-loa--nho" onClick={() => doc(v[1])} aria-label="Nghe ví dụ đời thường">🔊</button>
          <span lang="en">{v[1]}</span></p>
        <small className="ta-dich">{v[2]}</small>
      </div>
    </div>
  );
}

/**
 * Component React `TheTu`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
function TheTu({ t, chuong }: { t: Tu; chuong?: string | null }) {
  return (
    <li className="ta-the">
      <div className="ta-the__tren">
        <button type="button" className="ta-loa" onClick={() => doc(t.en)} aria-label={`Nghe: ${t.en}`}>🔊</button>
        <div>
          <p className="ta-en" lang="en">{t.en}</p>
          <p className="ta-vi">{t.vi}</p>
        </div>
        <button type="button" className="ta-cham" onClick={() => doc(t.en, true)} aria-label={`Nghe chậm: ${t.en}`} title="Nghe chậm">🐢</button>
      </div>
      <div className="ta-vd ta-vd--toan">
        <span className="ta-nhan ta-nhan--toan">📐 Trong bài Toán</span>
        <p><button type="button" className="ta-loa ta-loa--nho" onClick={() => doc(t.vd)} aria-label="Nghe câu ví dụ">🔊</button>
        <span><span lang="en">{t.vd}</span><small className="ta-dich">{t.vdVi}</small></span></p>
      </div>
      <ViDuDoi en={t.en} chuong={chuong ?? chapterOf(t.ku)} />
    </li>
  );
}

/** Luyện nghe: nghe một thuật ngữ, chọn nghĩa tiếng Việt đúng. 8 lượt. */
function LuyenNghe({ ds, ku, xong }: { ds: Tu[]; ku: string; xong: () => void }) {
  // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
  const luot = useMemo(() => tron(ds).slice(0, Math.min(8, ds.length)), [ds]);
  const [i, setI] = useState(0);
  const [chon, setChon] = useState<string | null>(null);
  const [dung, setDung] = useState(0);
  const t = luot[i];
  const pa = useMemo(() => t ? tron([t.vi, ...tron(ds.filter((x) => x.vi !== t.vi)).slice(0, 3).map((x) => x.vi)]) : [], [t, ds]);
  useEffect(() => { if (t) { const id = window.setTimeout(() => doc(t.en), 300); return () => window.clearTimeout(id); } }, [t]);

  if (!t) {
    return (
      <div className="ta-ket" role="status">
        <img src="/minh-hoa/nv/reo-ho.webp" alt="" width={110} height={165} />
        <h3>Em nghe đúng {dung}/{luot.length} từ</h3>
        <p className="ta-ket__nut"><button type="button" className="primary" onClick={xong}>Xong</button></p>
      </div>
    );
  }
  const bam = (v: string) => {
    if (chon) return;
    setChon(v);
    const ok = v === t.vi;
    if (ok) { setDung((n) => n + 1); phat('dung'); }
    if (i + 1 === luot.length) ghiSuKien(ku, 'tieng_anh', { viec: 'luyen-nghe', dung: dung + (ok ? 1 : 0), tong: luot.length });
  };
  return (
    <div className="ta-nghe">
      <NutAmHieuUng/>
      <p className="ta-nghe__tren">Lượt {i + 1}/{luot.length} · Đúng {dung}</p>
      <div className="ta-nghe__loa">
        <button type="button" className="ta-loa ta-loa--to" onClick={() => doc(t.en)} aria-label="Nghe lại">🔊</button>
        <button type="button" onClick={() => doc(t.en, true)}>🐢 Nghe chậm</button>
      </div>
      <p className="ta-nghe__hoi">Em vừa nghe từ nào? Chọn nghĩa đúng.</p>
      <div className="ta-nghe__pa">
        {pa.map((v) => (
          <button key={v} type="button" onClick={() => bam(v)} disabled={!!chon}
            className={chon ? (v === t.vi ? 'dung' : v === chon ? 'sai' : '') : ''}>{v}</button>
        ))}
      </div>
      {chon && (
        <div className={'ta-nghe__kq ' + (chon === t.vi ? 'dung' : 'sai')} role="status">
          <p><b>{chon === t.vi ? <><TichVang/> Đúng rồi!</> : 'Chưa đúng.'}</b> <span lang="en">{t.en}</span> = {t.vi}</p>
          <button type="button" className="primary" autoFocus onClick={() => { setI(i + 1); setChon(null); }}>{i + 1 === luot.length ? 'Xem kết quả' : 'Từ tiếp theo'}</button>
        </div>
      )}
    </div>
  );
}

/**
 * Component React `ThongBaoGiong`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
function ThongBaoGiong({ co }: { co: boolean | null }) {
  if (co !== false) return null;
  return <p className="ta-bao" role="status">Máy này chưa có giọng đọc tiếng Anh nên chưa nghe được. Em vẫn xem được từ và nghĩa; muốn nghe thì nhờ người lớn cài giọng English trong phần Cài đặt ngôn ngữ, hoặc mở bằng Chrome.</p>;
}

/** Thẻ từ theo bài: từ, loại từ, phiên âm, nghĩa, câu giải thích, công thức minh hoạ. */
function TheTuBai({ t, so, chuong }: { t: TuBai; so: number; chuong?: string | null }) {
  return (
    <li className="ta-the ta-the--bai">
      <div className="ta-the__tren">
        <span className="ta-so">{so}</span>
        <button type="button" className="ta-loa" onClick={() => doc(t.en)} aria-label={`Nghe: ${t.en}`}>🔊</button>
        <div>
          <p className="ta-en" lang="en">{t.en}</p>
          <p className="ta-ipa"><i>{t.loai}</i> <span lang="en">{t.ipa}</span></p>
          <p className="ta-vi"><MathText>{t.vi}</MathText></p>
        </div>
        <AnhChuDe
          className="ta-the__anh"
          src={anhTu(t.en)}
          fallbackNode={null}
          alt=""
          width={68}
          height={51}
          loading="lazy"
        />
        <button type="button" className="ta-cham" onClick={() => doc(t.en, true)} aria-label={`Nghe chậm: ${t.en}`} title="Nghe chậm">🐢</button>
      </div>
      {t.hinh && <p className="ta-hinh"><MathText inline>{`$${t.hinh}$`}</MathText></p>}
      <div className="ta-vd ta-vd--toan">
        <span className="ta-nhan ta-nhan--toan">📐 Trong bài Toán</span>
        <p><button type="button" className="ta-loa ta-loa--nho" onClick={() => doc(docDuoc(t.cau))} aria-label="Nghe câu">🔊</button>
        <span lang="en"><MathText inline>{t.cau}</MathText></span></p>
      </div>
      <ViDuDoi en={t.en} chuong={chuong} />
    </li>
  );
}

/** Một bài: 15 thẻ từ (đúng thứ tự tài liệu), luyện nghe, truyện tranh "Math class in English". */
function BaiTiengAnh({ so, co }: { so: number; co: boolean | null }) {
  const b = TB[so];
  const chuongBai = chuongCuaBai(so);
  const [luyen, setLuyen] = useState(false);
  // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
  const dsNghe = useMemo(() => b.tu.map((t) => ({ en: t.en, vi: t.vi.replace(/\$[^$]*\$/g, '').replace(/\s*\(\s*\)/g, '').trim(), vd: '', vdVi: '', ku: muc1CuaBai(so) })), [b, so]);
  return (
    <>
      {/* Khối giao diện: Khối nội dung chính */}
      <section className="card">
        <div className="ta-dau">
          <div>
            <h2 lang="en">Lesson {so}: {b.ten}</h2>
            <p className="ta-vi">Bài {so}. {b.tenVi} · {b.tu.length} từ</p>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            {so <= 17 && <a className="action-link" href={`/tieng-anh/${so}`}>📖 Học từng từ</a>}
            {!luyen && <button type="button" className="primary" onClick={() => setLuyen(true)} disabled={co === false}>🎧 Luyện nghe</button>}
          </div>
        </div>
        {luyen ? <LuyenNghe key={so} ds={dsNghe} ku={muc1CuaBai(so)} xong={() => setLuyen(false)} />
          : <ul className="ta-ds">{b.tu.map((t, i) => <TheTuBai key={t.en + i} t={t} so={i + 1} chuong={chuongBai} />)}</ul>}
        {b.meo && <p className="ta-meo">💡 <span lang="en"><MathText>{b.meo}</MathText></span></p>}
      </section>
      {b.truyen.length > 0 && (
        <section className="card ta-truyen" aria-label="Math class in English">
          <h2>⭐ Math class in English</h2>
          <img src={anhTruyen(so)} alt={`Truyện tranh Lesson ${so} (ảnh minh hoạ)`} loading="lazy" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
          <ol className="ta-loi">
            {b.truyen.map((l, i) => (
              <li key={i} className={l.ai === 'Teacher' ? 'ta-loi--gv' : 'ta-loi--hs'}>
                <span className="ta-loi__ai">{l.khung} · {l.ai === 'Teacher' ? 'Ms. Alice' : 'Student'}</span>
                <button type="button" className="ta-loa ta-loa--nho" onClick={() => doc(docDuoc(l.en))} aria-label="Nghe câu thoại">🔊</button>
                <span lang="en"><MathText>{l.en}</MathText></span>
              </li>
            ))}
          </ol>
        </section>
      )}
      <p className="ta-nguon">Nguồn: Teaching Mathematics in English – Grade 9, thiết kế bởi NCE. Hình là ảnh minh hoạ.</p>
    </>
  );
}

/** Trang Toán tiếng Anh: chọn bài (chương I–IV) hoặc chương (V trở đi), nghe từng từ, luyện nghe. */
export default function ToanTiengAnh({ batDau }: { batDau?: string }) {
  const daThay = new Set(Object.keys(CHUONG_THEO_BAI).filter((c) => CHUONG_THEO_BAI[c].every((b) => DS_BAI.includes(b))));
  const chuong = Object.keys(TV).filter((c) => !daThay.has(c));
  const chon = [...DS_BAI.map((b) => 'b' + b), ...chuong];
  const hopLe = (v?: string | null) => !!v && chon.includes(v);
  const [ch, setCh] = useState(hopLe(batDau) ? batDau! : chon[0]);
  const [luyen, setLuyen] = useState(false);
  const co = useGiongAnh();
  useEffect(() => {
    if (hopLe(batDau)) return;
    try { const s = localStorage.getItem('f9-tieng-anh-chuong'); if (hopLe(s)) setCh(s!); } catch { /* bỏ qua */ }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const doi = (c: string) => { setCh(c); setLuyen(false); try { localStorage.setItem('f9-tieng-anh-chuong', c); } catch { /* bỏ qua */ } };
  const laBai = ch.startsWith('b');
  const ds = laBai ? [] : TV[ch];
  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
        <ThongBaoGiong co={co} />
        <a className="action-link" href="/tieng-anh">📖 Học mỗi từ một trang (Chương I–IV)</a>
      </div>
      <nav className="ta-chuong" aria-label="Chọn bài">
        {Object.entries(CHUONG_THEO_BAI).filter(([c]) => daThay.has(c)).map(([c, bs]) => (
          <span key={c} className="ta-nhom" data-ch={c}><b>Chương {LA_MA[Number(c.slice(1))]}</b>
            {bs.map((b) => <button key={b} type="button" aria-pressed={ch === 'b' + b} onClick={() => doi('b' + b)}>Bài {b}</button>)}
          </span>
        ))}
        {chuong.length > 0 && <span className="ta-nhom"><b>Theo chương</b>
          {chuong.map((c) => <button key={c} type="button" data-ch={c} aria-pressed={c === ch} onClick={() => doi(c)}>Chương {LA_MA[Number(c.slice(1))]}</button>)}
        </span>}
      </nav>
      {laBai ? <BaiTiengAnh key={ch} so={Number(ch.slice(1))} co={co} /> : (
        <section className="card">
          <div className="ta-dau">
            <h2>{ds.length} thuật ngữ Chương {LA_MA[Number(ch.slice(1))]}</h2>
            {!luyen && <button type="button" className="primary" onClick={() => setLuyen(true)} disabled={co === false}>🎧 Luyện nghe</button>}
          </div>
          {luyen ? <LuyenNghe key={ch} ds={ds} ku={ds[0].ku} xong={() => setLuyen(false)} />
            : <ul className="ta-ds">{ds.map((t) => <TheTu key={t.en} t={t} chuong={ch} />)}</ul>}
        </section>
      )}
    </>
  );
}

/** Thẻ gọn trên trang mục bài học: từ tiếng Anh của bài (nếu đã có bộ theo bài), không thì từ của mục. */
export function TuVungMuc({ kuId }: { kuId: string }) {
  const so = baiCuaMuc(kuId) as number | null;
  const bai = so != null ? TB[so] : undefined;
  const ds = bai ? [] : (tuVungCuaMuc(kuId) as Tu[]);
  const [mo, setMo] = useState(false);
  const co = useGiongAnh();
  if (bai) {
    return (
      <section className="card ta-muc" aria-label="Toán tiếng Anh">
        <div className="ta-dau">
          <h2>🇬🇧 Toán tiếng Anh · Bài {so} <small>(không bắt buộc)</small></h2>
          <a className="action-link" href={`/tieng-anh?bai=${so}`}>Xem đủ {bai.tu.length} từ{bai.truyen.length ? ' và truyện tranh' : ''}</a>
        </div>
        <ThongBaoGiong co={co} />
        <ul className="ta-ds ta-ds--gon">{bai.tu.slice(0, 4).map((t, i) => <TheTuBai key={t.en + i} t={t} so={i + 1} chuong={chuongCuaBai(so) ?? chapterOf(kuId)} />)}</ul>
      </section>
    );
  }
  if (!ds.length) return null;
  const hien = mo ? ds : ds.slice(0, 4);
  return (
    <section className="card ta-muc" aria-label="Toán tiếng Anh">
      <div className="ta-dau">
        <h2>🇬🇧 Toán tiếng Anh</h2>
        <a className="action-link" href="/tieng-anh">Luyện nghe cả chương</a>
      </div>
      <ThongBaoGiong co={co} />
      <ul className="ta-ds ta-ds--gon">{hien.map((t) => <TheTu key={t.en} t={t} chuong={chapterOf(kuId)} />)}</ul>
      {ds.length > 4 && <button type="button" onClick={() => setMo(!mo)}>{mo ? 'Thu gọn' : `Xem thêm ${ds.length - 4} từ`}</button>}
    </section>
  );
}
