'use client';
import { useMemo, useState } from 'react';
import MathText from '@/components/MathText';
import type { Khung } from '@/lib/thiNghiem';
import {
  CungQuat,
  DayCung,
  HaiTron,
  ThangTron,
  TronDiem,
  TronDoiXung,
} from './KhungDuongTron';

/** Định dạng số kiểu Việt Nam: dấu phẩy thập phân, tối đa d chữ số. */
export const so = (x: number, d = 2) =>
  Number.isFinite(x) ? x.toLocaleString('vi-VN', { maximumFractionDigits: d }) : '—';
const M = ({ t }: { t: string }) => <MathText>{`$${t}$`}</MathText>;
/** "=" khi kết quả đúng là số nguyên (hoặc làm tròn không mất gì), "≈" khi là số làm tròn. */
const xapXi = (x: number) => (Math.abs(x * 1000 - Math.round(x * 1000)) < 1e-6 ? '=' : '≈');
const RAD = Math.PI / 180;

type P = { onThaoTac: () => void };

export function Truot({ nhan, min, max, step = 1, value, onChange, donVi = '' }: {
  nhan: React.ReactNode; min: number; max: number; step?: number; value: number; onChange: (v: number) => void; donVi?: string;
}) {
  return (
    <div className="tn-truot">
      <span className="tn-truot__nhan">{typeof nhan === 'string' ? <MathText>{nhan}</MathText> : nhan}: <b>{so(value, 2)}{donVi}</b></span>
      {/* Nút − / + để chỉnh từng nấc trên điện thoại (kéo thanh trượt khó dừng đúng số) */}
      <span className="tn-truot__hang">
        <button type="button" className="tn-truot__nut" aria-label="Giảm" disabled={value <= min}
          onClick={() => onChange(Math.max(min, +(value - step).toFixed(4)))}>−</button>
        <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
        <button type="button" className="tn-truot__nut" aria-label="Tăng" disabled={value >= max}
          onClick={() => onChange(Math.min(max, +(value + step).toFixed(4)))}>+</button>
      </span>
    </div>
  );
}

// ---------------------------------------------------------------- 1. Hình vuông / khối lập phương
function HinhVuong({ k, onThaoTac }: P & { k: Extract<Khung, { loai: 'hinh-vuong' }> }) {
  const [v, setV] = useState(k.batDau);
  const doi = (x: number) => { setV(x); onThaoTac(); };
  const bac2 = k.bac === 2;
  const canh = bac2 ? (v >= 0 ? Math.sqrt(v) : NaN) : Math.cbrt(v);
  const canhMax = bac2 ? Math.sqrt(k.max) : Math.cbrt(Math.max(Math.abs(k.min), k.max));
  const px = Number.isFinite(canh) ? (Math.abs(canh) / canhMax) * 170 : 0;
  const tron = Number.isFinite(canh) && Math.abs(canh - Math.round(canh)) < 1e-9;
  return (
    <div className="tn-hinh">
      <Truot nhan={bac2 ? 'Diện tích $S$' : 'Số $V$'} min={k.min} max={k.max} value={v} onChange={doi} />
      <div className="tn-hinh__ve">
        <svg viewBox="0 0 260 230" role="img" aria-label={bac2 ? `Hình vuông diện tích ${v}` : `Khối lập phương ứng với ${v}`}>
          {bac2 && v >= 0 && <rect x={40} y={200 - px} width={px} height={px} className="tn-to" />}
          {!bac2 && px > 0 && (() => {
            const s = px * 0.85, d = s * 0.4, x0 = 40, y0 = 205;
            const am = v < 0;
            return (
              <g className={am ? 'tn-khoi tn-khoi--am' : 'tn-khoi'}>
                <polygon points={`${x0},${y0} ${x0 + s},${y0} ${x0 + s},${y0 - s} ${x0},${y0 - s}`} />
                <polygon points={`${x0},${y0 - s} ${x0 + d},${y0 - s - d} ${x0 + s + d},${y0 - s - d} ${x0 + s},${y0 - s}`} />
                <polygon points={`${x0 + s},${y0} ${x0 + s + d},${y0 - d} ${x0 + s + d},${y0 - s - d} ${x0 + s},${y0 - s}`} />
              </g>
            );
          })()}
          {bac2 && v < 0 && <text x={130} y={115} textAnchor="middle" className="tn-chu-loi">Không có hình vuông nào</text>}
        </svg>
        <div className="tn-hinh__so">
          {bac2 ? (
            v >= 0 ? (
              <>
                <p>Cạnh: <M t={`\\sqrt{${v}} ${tron ? '=' : '\\approx'} ${so(canh).replace(',', '{,}')}`} /></p>
                <p className="tn-phu">Hai số có bình phương bằng {v}: <M t={`${so(canh).replace(',', '{,}')}`} /> và <M t={`-${so(canh).replace(',', '{,}')}`} />{v === 0 && ' (trùng nhau, chỉ là 0)'}</p>
              </>
            ) : <p className="tn-chu-loi">Không số nào bình phương lên bằng {v}, nên {v} không có căn bậc hai.</p>
          ) : (
            <>
              <p><M t={`\\sqrt[3]{${v}} ${tron ? '=' : '\\approx'} ${so(canh).replace(',', '{,}')}`} /></p>
              <p className="tn-phu">Kiểm tra: <M t={`(${so(canh).replace(',', '{,}')})^3 ${tron ? '=' : '\\approx'} ${v}`} />{v < 0 && '. Số âm vẫn có căn bậc ba (là số âm).'}</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- 2. Căn của bình phương
function BinhPhuong({ k, onThaoTac }: P & { k: Extract<Khung, { loai: 'binh-phuong' }> }) {
  const [a, setA] = useState(k.batDau);
  const dong = [
    { nhan: 'a', gt: a },
    { nhan: 'a^2', gt: a * a },
    { nhan: '\\sqrt{a^2}', gt: Math.abs(a) }
  ];
  const lon = k.max * k.max;
  return (
    <div>
      <Truot nhan="$a$" min={k.min} max={k.max} value={a} onChange={(x) => { setA(x); onThaoTac(); }} />
      <div className="tn-cot-ngang" role="list">
        {dong.map((d) => (
          <div key={d.nhan} className="tn-cot-ngang__dong" role="listitem">
            <span className="tn-cot-ngang__nhan"><M t={d.nhan} /></span>
            <span className="tn-cot-ngang__truc">
              <i className={d.gt < 0 ? 'tn-am' : ''} style={{ width: `${(Math.abs(d.gt) / lon) * 50}%`, [d.gt < 0 ? 'right' : 'left']: '50%' } as React.CSSProperties} />
            </span>
            <b>{so(d.gt)}</b>
          </div>
        ))}
      </div>
      <p className={a < 0 ? 'tn-nhan-manh' : 'tn-phu'}>
        {a < 0 ? <>Khi <M t="a" /> âm: <M t={`\\sqrt{a^2} = ${Math.abs(a)} \\ne a`} />. Lúc này <M t="\sqrt{a^2} = -a = |a|" />.</> : <>Khi <M t="a \ge 0" />: <M t="\sqrt{a^2} = a" />.</>}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------- 3. Điều kiện có nghĩa trên trục số
function DieuKien({ k, onThaoTac }: P & { k: Extract<Khung, { loai: 'dieu-kien' }> }) {
  const [x, setX] = useState(k.min + 1);
  const A = k.a * x + k.b;
  const bieuThuc = `${k.a === 1 ? '' : k.a}x ${k.b < 0 ? '-' : '+'} ${Math.abs(k.b)}`;
  const moc = -k.b / k.a;
  const vi = (t: number) => 20 + ((t - k.min) / (k.max - k.min)) * 320;
  const dong = (y: number, nhan: string, vung: [number, number] | null, ok: boolean) => (
    <g>
      <text x={0} y={y - 14} className="tn-nho">{nhan}</text>
      <line x1={20} x2={340} y1={y} y2={y} className="tn-truc" />
      {vung && <line x1={vi(vung[0])} x2={vi(vung[1])} y1={y} y2={y} className="tn-vung" />}
      <circle cx={vi(x)} cy={y} r={7} className={ok ? 'tn-diem-ok' : 'tn-diem-sai'} />
    </g>
  );
  return (
    <div>
      <Truot nhan="$x$" min={k.min} max={k.max} step={0.5} value={x} onChange={(v) => { setX(v); onThaoTac(); }} />
      <svg viewBox="0 0 360 150" className="tn-truc-so" role="img" aria-label={`x = ${x}`}>
        {dong(45, `√(${bieuThuc})`, k.a > 0 ? [moc, k.max] : [k.min, moc], A >= 0)}
        {dong(115, `∛(${bieuThuc})`, [k.min, k.max], true)}
        {Array.from({ length: k.max - k.min + 1 }, (_, i) => k.min + i).map((t) => (
          <text key={t} x={vi(t)} y={140} textAnchor="middle" className="tn-nho">{t}</text>
        ))}
      </svg>
      <div className="tn-hai-cot">
        <p>Với <M t={`x = ${so(x).replace(',', '{,}')}`} />: <M t={`${bieuThuc} = ${so(A).replace(',', '{,}')}`} /></p>
        <p>{A >= 0 ? <><M t={`\\sqrt{${bieuThuc}} \\approx ${so(Math.sqrt(A)).replace(',', '{,}')}`} /> ✔️</> : <span className="tn-chu-loi">√ không có nghĩa (số dưới căn âm)</span>}</p>
        <p><M t={`\\sqrt[3]{${bieuThuc}} \\approx ${so(Math.cbrt(A)).replace(',', '{,}')}`} /> ✔️</p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- 4. Căn của tích / thương
function NhanChia({ k, onThaoTac }: P & { k: Extract<Khung, { loai: 'nhan-chia' }> }) {
  const [a, setA] = useState(k.a);
  const [b, setB] = useState(k.b);
  const nhan = k.phep === 'nhan';
  const bang = (x: number, y: number) => Math.abs(x - y) < 1e-9;
  const dong = nhan
    ? [
        { trai: `\\sqrt{${a}\\cdot${b}}`, vt: Math.sqrt(a * b), phai: `\\sqrt{${a}}\\cdot\\sqrt{${b}}`, vp: Math.sqrt(a) * Math.sqrt(b) },
        { trai: `\\sqrt{${a}+${b}}`, vt: Math.sqrt(a + b), phai: `\\sqrt{${a}}+\\sqrt{${b}}`, vp: Math.sqrt(a) + Math.sqrt(b) }
      ]
    : [
        { trai: `\\sqrt{${a}:${b}}`, vt: b > 0 ? Math.sqrt(a / b) : NaN, phai: `\\sqrt{${a}}:\\sqrt{${b}}`, vp: b > 0 ? Math.sqrt(a) / Math.sqrt(b) : NaN },
        { trai: `\\sqrt{${a}-${b}}`, vt: a - b >= 0 ? Math.sqrt(a - b) : NaN, phai: `\\sqrt{${a}}-\\sqrt{${b}}`, vp: Math.sqrt(a) - Math.sqrt(b) }
      ];
  return (
    <div>
      <div className="tn-hai-cot">
        <Truot nhan="$a$" min={0} max={k.max} value={a} onChange={(v) => { setA(v); onThaoTac(); }} />
        <Truot nhan="$b$" min={0} max={k.max} value={b} onChange={(v) => { setB(v); onThaoTac(); }} />
      </div>
      <table className="tn-bang">
        <tbody>
          {dong.map((d, i) => {
            const coSo = Number.isFinite(d.vt) && Number.isFinite(d.vp);
            const eq = coSo && bang(d.vt, d.vp);
            return (
              <tr key={i}>
                <td><M t={d.trai} /> {Number.isFinite(d.vt) ? <>{xapXi(d.vt)} <b>{so(d.vt, 3)}</b></> : <span className="tn-chu-loi">không có nghĩa</span>}</td>
                <td className={coSo ? (eq ? 'tn-bang-nhau' : 'tn-khac-nhau') : ''}>{coSo ? (eq ? '=' : '≠') : '?'}</td>
                <td><M t={d.phai} /> {Number.isFinite(d.vp) ? <>{xapXi(d.vp)} <b>{so(d.vp, 3)}</b></> : <span className="tn-chu-loi">không có nghĩa</span>}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {!nhan && b === 0 && <p className="tn-chu-loi"><M t="b = 0" />: không chia được cho 0.</p>}
    </div>
  );
}

// ---------------------------------------------------------------- 5. Tách thừa số chính phương
const CHINH_PHUONG = [4, 9, 16, 25, 36, 49, 64, 100];
const conThuaSoCP = (n: number) => CHINH_PHUONG.some((f) => n % f === 0 && n >= f);
function TachThuaSo({ k, onThaoTac }: P & { k: Extract<Khung, { loai: 'tach-thua-so' }> }) {
  const [n, setN] = useState(k.so[0]);
  const [buoc, setBuoc] = useState<{ ngoai: number; trong: number }[]>([{ ngoai: 1, trong: k.so[0] }]);
  const [bao, setBao] = useState('');
  const hien = buoc[buoc.length - 1];
  const chonSo = (x: number) => { setN(x); setBuoc([{ ngoai: 1, trong: x }]); setBao(''); onThaoTac(); };
  const tach = (f: number) => {
    onThaoTac();
    if (hien.trong % f !== 0) { setBao(`${hien.trong} không chia hết cho ${f}.`); return; }
    setBao('');
    setBuoc([...buoc, { ngoai: hien.ngoai * Math.sqrt(f), trong: hien.trong / f }]);
  };
  const viet = (b: { ngoai: number; trong: number }) => (b.trong === 1 ? `${b.ngoai}` : `${b.ngoai === 1 ? '' : b.ngoai}\\sqrt{${b.trong}}`);
  const gon = !conThuaSoCP(hien.trong);
  return (
    <div>
      <div className="tn-nut-hang" role="group" aria-label="Chọn số dưới dấu căn">
        {k.so.map((x) => <button key={x} type="button" aria-pressed={x === n} onClick={() => chonSo(x)}><M t={`\\sqrt{${x}}`} /></button>)}
      </div>
      <p className="tn-chuoi"><M t={`\\sqrt{${n}}` + buoc.slice(1).map((b) => ` = ${viet(b)}`).join('')} /></p>
      {gon ? (
        <p className="tn-nhan-manh">Đã gọn: dưới dấu căn không còn thừa số chính phương. {buoc.length > 2 && 'Em tách nhiều lần; chọn thừa số lớn nhất ngay từ đầu thì chỉ cần một lần.'}</p>
      ) : (
        <>
          <p className="tn-phu">Bấm thừa số chính phương muốn tách ra khỏi <M t={`${hien.trong}`} />:</p>
          <div className="tn-nut-hang">
            {CHINH_PHUONG.filter((f) => f <= hien.trong).map((f) => (
              <button key={f} type="button" onClick={() => tach(f)}>{f} = {Math.sqrt(f)}²</button>
            ))}
          </div>
        </>
      )}
      {bao && <p className="tn-chu-loi" role="status">{bao}</p>}
    </div>
  );
}

// ---------------------------------------------------------------- 6. Đưa thừa số vào trong
function DuaVao({ k, onThaoTac }: P & { k: Extract<Khung, { loai: 'dua-vao' }> }) {
  const [da, setDa] = useState<boolean[]>(k.cap.map(() => false));
  const vao = (i: number) => { setDa(da.map((x, j) => (j === i ? true : x))); onThaoTac(); };
  const trong = (c: { k: number; m: number }) => c.k * c.k * c.m;
  const [p, q] = k.cap;
  return (
    <div>
      <ul className="tn-ds-vao">
        {k.cap.map((c, i) => (
          <li key={i}>
            <M t={`${c.k}\\sqrt{${c.m}}`} />
            {da[i] ? (
              <span> = <M t={c.k < 0 ? `-\\sqrt{${Math.abs(c.k)}^2\\cdot${c.m}} = -\\sqrt{${trong(c)}}` : `\\sqrt{${c.k}^2\\cdot${c.m}} = \\sqrt{${trong(c)}}`} />
                {c.k < 0 && <em className="tn-phu"> (dấu trừ ở lại bên ngoài)</em>}</span>
            ) : <button type="button" onClick={() => vao(i)}>Đưa vào trong</button>}
          </li>
        ))}
      </ul>
      {da[0] && da[1] && (
        <p className="tn-nhan-manh">So sánh: <M t={`\\sqrt{${trong(p)}} ${trong(p) > trong(q) ? '>' : trong(p) < trong(q) ? '<' : '='} \\sqrt{${trong(q)}}`} /> nên <M t={`${p.k}\\sqrt{${p.m}} ${trong(p) > trong(q) ? '>' : trong(p) < trong(q) ? '<' : '='} ${q.k}\\sqrt{${q.m}}`} /></p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------- 7. Trục căn thức: thử nhân
function TrucCan({ k, onThaoTac }: P & { k: Extract<Khung, { loai: 'truc-can' }> }) {
  const [chon, setChon] = useState<number | null>(null);
  const lc = chon != null ? k.luaChon[chon] : null;
  return (
    <div>
      <p className="tn-chuoi"><M t={`\\dfrac{${k.tu}}{${k.mau}}`} /></p>
      <p className="tn-phu">Nhân cả tử và mẫu với:</p>
      <div className="tn-nut-hang">
        {k.luaChon.map((l, i) => <button key={i} type="button" aria-pressed={chon === i} onClick={() => { setChon(i); onThaoTac(); }}><M t={l.nhan} /></button>)}
      </div>
      {lc && (
        <div className={`tn-ket-qua ${lc.huuTi ? 'tn-ket-qua--ok' : 'tn-ket-qua--chua'}`} role="status">
          <p><M t={`\\dfrac{${k.tu}}{${k.mau}} = ${lc.ketQua}`} /></p>
          <p>{lc.huuTi ? '✔️ ' : '✖️ '}<MathText>{lc.nhanXet}</MathText></p>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------- 8. Ghép các bước
function GhepBuoc({ k, onThaoTac }: P & { k: Extract<Khung, { loai: 'ghep-buoc' }> }) {
  const the = useMemo(() => {
    const ds = [...k.buoc, ...k.nhieu];
    // xáo cố định theo nội dung thẻ (lần nào cũng cùng thứ tự, để cả lớp nhìn giống nhau khi chiếu)
    const bam = (t: string) => Array.from(t).reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
    return [...ds].sort((x, y) => bam(x) - bam(y));
  }, [k]);
  const [da, setDa] = useState<string[]>([]);
  const [bao, setBao] = useState('');
  const chon = (t: string) => {
    onThaoTac();
    if (t === k.buoc[da.length]) { setDa([...da, t]); setBao(''); }
    else setBao(k.nhieu.includes(t) ? 'Bước này sai. Thử thẻ khác.' : 'Bước này đúng nhưng chưa tới lượt.');
  };
  const xong = da.length === k.buoc.length;
  return (
    <div>
      <div className="tn-loi-giai">
        <M t={k.deBai} />
        {da.map((t) => <div key={t}><M t={t} /></div>)}
        {!xong && <div className="tn-cho">…</div>}
      </div>
      {!xong && (
        <div className="tn-nut-hang tn-nut-hang--doc">
          {the.filter((t) => !da.includes(t)).map((t) => <button key={t} type="button" onClick={() => chon(t)}><M t={t} /></button>)}
        </div>
      )}
      {bao && <p className="tn-chu-loi" role="status">{bao}</p>}
      {xong && <p className="tn-nhan-manh">Xong! <button type="button" className="tn-lam-lai" onClick={() => { setDa([]); setBao(''); }}>Làm lại</button></p>}
    </div>
  );
}

// ---------------------------------------------------------------- 9. Tam giác vuông
const DAC_BIET: Record<number, { sin: string; cos: string; tan: string; cot: string }> = {
  30: { sin: '\\dfrac12', cos: '\\dfrac{\\sqrt3}{2}', tan: '\\dfrac{\\sqrt3}{3}', cot: '\\sqrt3' },
  45: { sin: '\\dfrac{\\sqrt2}{2}', cos: '\\dfrac{\\sqrt2}{2}', tan: '1', cot: '1' },
  60: { sin: '\\dfrac{\\sqrt3}{2}', cos: '\\dfrac12', tan: '\\sqrt3', cot: '\\dfrac{\\sqrt3}{3}' }
};
function TamGiac({ k, onThaoTac }: P & { k: Extract<Khung, { loai: 'tam-giac' }> }) {
  const [g, setG] = useState(k.gocBatDau);
  const [phong, setPhong] = useState(1);
  const [canh, setCanh] = useState(k.cheDo === 'canh-huyen' ? 10 : 8);
  const [kc, setKc] = useState(20);
  const doi = (f: (v: number) => void) => (v: number) => { f(v); onThaoTac(); };
  const r = g * RAD;
  const cd = k.cheDo;

  if (cd === 'do-cao') {
    const mat = 1.5, cao = mat + kc * Math.tan(r);
    const ppu = Math.min(300 / (kc + 4), 190 / (cao + 1));
    const X = (m: number) => 30 + m * ppu, Y = (m: number) => 215 - m * ppu;
    return (
      <div>
        <div className="tn-hai-cot">
          <Truot nhan="Khoảng cách tới gốc cây" min={5} max={40} value={kc} onChange={doi(setKc)} donVi=" m" />
          <Truot nhan="Góc nhìn lên ngọn" min={10} max={70} value={g} onChange={doi(setG)} donVi="°" />
        </div>
        <svg viewBox="0 0 360 230" className="tn-tam-giac" role="img" aria-label={`Cây cao khoảng ${so(cao, 1)} mét`}>
          <line x1={0} x2={360} y1={Y(0)} y2={Y(0)} className="tn-dat" />
          <line x1={X(0)} x2={X(0)} y1={Y(0)} y2={Y(mat)} className="tn-nguoi" />
          <circle cx={X(0)} cy={Y(mat)} r={4} className="tn-mat" />
          <line x1={X(kc)} x2={X(kc)} y1={Y(0)} y2={Y(cao)} className="tn-cay" />
          <circle cx={X(kc)} cy={Y(cao) + 8} r={14} className="tn-tan-cay" />
          <line x1={X(0)} y1={Y(mat)} x2={X(kc)} y2={Y(cao)} className="tn-tia" />
          <line x1={X(0)} y1={Y(mat)} x2={X(kc)} y2={Y(mat)} className="tn-ngang" />
          <text x={X(kc / 2)} y={Y(0) + 13} textAnchor="middle" className="tn-nho">{kc} m</text>
          <text x={X(0) + 34} y={Y(mat) - 6} className="tn-nho">{g}°</text>
        </svg>
        <p>Phần trên tầm mắt: <M t={`${kc}\\cdot\\tan ${g}^\\circ \\approx ${so(kc * Math.tan(r), 1).replace(',', '{,}')}`} /> m. Cộng <M t="1{,}5" /> m tới mắt: cây cao khoảng <b>{so(cao, 1)} m</b>.</p>
      </div>
    );
  }

  // độ dài (đơn vị) của cạnh huyền a, cạnh đối b (AC), cạnh kề c (AB) đối với góc B = g
  let a: number;
  if (cd === 'canh-huyen') a = canh;
  else if (cd === 'canh-goc-vuong') a = canh / Math.cos(r);
  else a = 10 * phong;
  const b = a * Math.sin(r), c = a * Math.cos(r);
  // Thí nghiệm "phóng to": tỉ lệ vẽ cố định để thấy tam giác lớn lên thật; các chế độ khác thì vẽ vừa khung
  const ppu = cd === 'ti-so' ? 15 : Math.min(240 / Math.max(c, 1), 215 / Math.max(b, 1), 40);
  const A = { x: 62, y: 245 }, B = { x: 62 + c * ppu, y: 245 }, C = { x: 62, y: 245 - b * ppu };
  const tiSo = (x: number) => so(x, 3);
  const beta = 90 - g;
  return (
    <div>
      <div className="tn-hai-cot">
        {cd === 'dac-biet' ? (
          <div className="tn-nut-hang" role="group" aria-label="Chọn góc">
            {[30, 45, 60].map((x) => <button key={x} type="button" aria-pressed={g === x} onClick={() => { setG(x); onThaoTac(); }}>{x}°</button>)}
          </div>
        ) : <Truot nhan="Góc $B$" min={5} max={85} value={g} onChange={doi(setG)} donVi="°" />}
        {cd === 'ti-so' && <Truot nhan="Phóng to" min={0.5} max={1.5} step={0.1} value={phong} onChange={doi(setPhong)} donVi=" lần" />}
        {cd === 'canh-huyen' && <Truot nhan="Cạnh huyền $a = BC$" min={4} max={12} value={canh} onChange={doi(setCanh)} />}
        {cd === 'canh-goc-vuong' && <Truot nhan="Cạnh $c = AB$" min={3} max={10} value={canh} onChange={doi(setCanh)} />}
      </div>
      <div className="tn-hinh__ve">
        <svg viewBox="0 0 330 268" className="tn-tam-giac" role="img" aria-label={`Tam giác vuông tại A, góc B bằng ${g} độ`}>
          <polygon points={`${A.x},${A.y} ${B.x},${B.y} ${C.x},${C.y}`} className="tn-to" />
          <polyline points={`${A.x + 12},${A.y} ${A.x + 12},${A.y - 12} ${A.x},${A.y - 12}`} className="tn-goc-vuong" />
          <path d={`M ${B.x - 26} ${B.y} A 26 26 0 0 1 ${B.x - 26 * Math.cos(r)} ${B.y - 26 * Math.sin(r)}`} className="tn-cung" />
          <text x={A.x - 14} y={A.y + 4} className="tn-dinh">A</text>
          <text x={B.x + 6} y={B.y + 4} className="tn-dinh">B</text>
          <text x={C.x - 14} y={C.y + 4} className="tn-dinh">C</text>
          <text x={B.x - 44} y={B.y - 8} className="tn-nho">{cd === 'phu-nhau' ? `α=${g}°` : `${g}°`}</text>
          {cd === 'phu-nhau' && <text x={C.x + 6} y={C.y + 34} className="tn-nho">β={beta}°</text>}
          <text x={(A.x + B.x) / 2} y={A.y + 16} textAnchor="middle" className="tn-canh">c = {so(c)}</text>
          <text x={A.x - 6} y={(A.y + C.y) / 2} textAnchor="end" className="tn-canh">b = {so(b)}</text>
          <text x={(B.x + C.x) / 2 + 8} y={(B.y + C.y) / 2 - 6} className="tn-canh">a = {so(a)}</text>
        </svg>
        <div className="tn-hinh__so">
          {cd === 'dac-biet' && DAC_BIET[g] ? (
            <table className="tn-bang">
              <tbody>
                {(['sin', 'cos', 'tan', 'cot'] as const).map((f) => (
                  <tr key={f}><td><M t={`\\${f} ${g}^\\circ`} /></td><td><M t={`= ${DAC_BIET[g][f]}`} /></td><td className="tn-phu">≈ {tiSo(f === 'sin' ? b / a : f === 'cos' ? c / a : f === 'tan' ? b / c : c / b)}</td></tr>
                ))}
              </tbody>
            </table>
          ) : cd === 'phu-nhau' ? (
            <table className="tn-bang">
              <thead><tr><th></th><th>α = {g}°</th><th>β = {beta}°</th></tr></thead>
              <tbody>
                <tr><td>sin</td><td className="tn-cap1">{tiSo(b / a)}</td><td className="tn-cap2">{tiSo(c / a)}</td></tr>
                <tr><td>cos</td><td className="tn-cap2">{tiSo(c / a)}</td><td className="tn-cap1">{tiSo(b / a)}</td></tr>
                <tr><td>tan</td><td className="tn-cap3">{tiSo(b / c)}</td><td className="tn-cap4">{tiSo(c / b)}</td></tr>
                <tr><td>cot</td><td className="tn-cap4">{tiSo(c / b)}</td><td className="tn-cap3">{tiSo(b / c)}</td></tr>
              </tbody>
            </table>
          ) : cd === 'canh-huyen' ? (
            <>
              <p><M t={`b = a\\sin B = ${so(a)}\\cdot\\sin ${g}^\\circ \\approx ${so(b).replace(',', '{,}')}`} /></p>
              <p><M t={`c = a\\cos B = ${so(a)}\\cdot\\cos ${g}^\\circ \\approx ${so(c).replace(',', '{,}')}`} /></p>
            </>
          ) : cd === 'canh-goc-vuong' ? (
            <>
              <p><M t={`b = c\\tan B = ${so(canh)}\\cdot\\tan ${g}^\\circ \\approx ${so(b).replace(',', '{,}')}`} /></p>
              <p><M t={`c = b\\cot B`} /> (ngược lại)</p>
            </>
          ) : (
            <table className="tn-bang">
              <tbody>
                <tr><td><M t="\sin B = \dfrac{b}{a}" /></td><td>{tiSo(b / a)}</td></tr>
                <tr><td><M t="\cos B = \dfrac{c}{a}" /></td><td>{tiSo(c / a)}</td></tr>
                <tr><td><M t="\tan B = \dfrac{b}{c}" /></td><td>{tiSo(b / c)}</td></tr>
                <tr><td><M t="\cot B = \dfrac{c}{b}" /></td><td>{tiSo(c / b)}</td></tr>
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}


// ---------------------------------------------------------------- 10. Mặt phẳng toạ độ
const LUOI = 6, DV = 22, O = 150; // lưới −6…6, mỗi đơn vị 22px, gốc ở giữa khung 300×300
const px = (x: number) => O + x * DV, py = (y: number) => O - y * DV;
/** "ax + by = c" viết đẹp; giuKhong = vẫn ghi hệ số 0 (để học sinh thấy). */
function ptChu([a, b, c]: number[], giuKhong = false) {
  const hang = (k: number, bien: string, dau: boolean) => {
    if (k === 0 && !giuKhong) return '';
    const tri = Math.abs(k), sk = tri === 1 ? '' : so(tri).replace(',', '{,}');
    return `${dau ? (k < 0 ? ' - ' : ' + ') : k < 0 ? '-' : ''}${sk}${bien}`;
  };
  const t1 = hang(a, 'x', false), t2 = hang(b, 'y', t1 !== '');
  return `${t1}${t2 || (t1 ? '' : '0')} = ${so(c).replace(',', '{,}')}`;
}
/** Hai đầu mút của đường ax + by = c trong khung lưới (null nếu a = b = 0). */
function doanThang(a: number, b: number, c: number): [number, number, number, number] | null {
  if (a === 0 && b === 0) return null;
  if (b === 0) { const x = c / a; return [x, -LUOI - 1, x, LUOI + 1]; }
  const y = (x: number) => (c - a * x) / b;
  return [-LUOI - 1, y(-LUOI - 1), LUOI + 1, y(LUOI + 1)];
}
function Luoi({ children }: { children: React.ReactNode }) {
  const ds = Array.from({ length: 2 * LUOI + 1 }, (_, i) => i - LUOI);
  return (
    <svg viewBox="0 0 300 300" className="tn-luoi" role="img" aria-label="Mặt phẳng toạ độ">
      <defs><clipPath id="tn-khung-luoi"><rect x={px(-LUOI) - 4} y={py(LUOI) - 4} width={2 * LUOI * DV + 8} height={2 * LUOI * DV + 8} /></clipPath></defs>
      {ds.map((i) => <g key={i}><line x1={px(i)} x2={px(i)} y1={py(LUOI)} y2={py(-LUOI)} className="tn-luoi__ke" /><line y1={py(i)} y2={py(i)} x1={px(-LUOI)} x2={px(LUOI)} className="tn-luoi__ke" /></g>)}
      <line x1={px(-LUOI)} x2={px(LUOI)} y1={O} y2={O} className="tn-luoi__truc" />
      <line y1={py(-LUOI)} y2={py(LUOI)} x1={O} x2={O} className="tn-luoi__truc" />
      {[-4, -2, 2, 4].map((i) => <g key={i}><text x={px(i)} y={O + 13} textAnchor="middle" className="tn-nho">{i}</text><text x={O - 6} y={py(i) + 4} textAnchor="end" className="tn-nho">{i}</text></g>)}
      <text x={px(LUOI) - 2} y={O - 6} textAnchor="end" className="tn-nho">x</text>
      <text x={O + 6} y={py(LUOI) + 10} className="tn-nho">y</text>
      <g clipPath="url(#tn-khung-luoi)">{children}</g>
    </svg>
  );
}
const Duong = ({ pt, lop }: { pt: number[]; lop: string }) => {
  const d = doanThang(pt[0], pt[1], pt[2]);
  return d ? <line x1={px(d[0])} y1={py(d[1])} x2={px(d[2])} y2={py(d[3])} className={lop} /> : null;
};

function MatPhang({ k, onThaoTac }: P & { k: Extract<Khung, { loai: 'mat-phang' }> }) {
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  const [daThu, setDaThu] = useState<{ x: number; y: number; dung: boolean }[]>([]);
  const [hienDuong, setHienDuong] = useState(false);
  const [buocHien, setBuocHien] = useState(0);
  const [h, setH] = useState<[number, number, number]>(k.cheDo === 'hai-duong' ? (k.pt2 ?? [1, -1, 1]) : k.pt);
  const doiH = (i: number) => (v: number) => { const m = [...h] as [number, number, number]; m[i] = v; setH(m); onThaoTac(); };
  const [a, b, c] = k.pt;

  if (k.cheDo === 'diem') {
    const vt = a * x + b * y;
    const dung = Math.abs(vt - c) < 1e-9;
    return (
      <div className="tn-hinh__ve">
        <Luoi>
          {hienDuong && <Duong pt={k.pt} lop="tn-duong1" />}
          {daThu.map((d, i) => <circle key={i} cx={px(d.x)} cy={py(d.y)} r={4.5} className={d.dung ? 'tn-diem-ok' : 'tn-diem-sai'} />)}
          <circle cx={px(x)} cy={py(y)} r={7} className="tn-diem-chon" />
        </Luoi>
        <div className="tn-hinh__so">
          <Truot nhan="$x$" min={-5} max={5} step={0.5} value={x} onChange={(v) => { setX(v); onThaoTac(); }} />
          <Truot nhan="$y$" min={-5} max={5} step={0.5} value={y} onChange={(v) => { setY(v); onThaoTac(); }} />
          <p><M t={`${a}\\cdot(${so(x).replace(',', '{,}')}) ${b < 0 ? '-' : '+'} ${Math.abs(b)}\\cdot(${so(y).replace(',', '{,}')}) = ${so(vt).replace(',', '{,}')}`} /> {dung ? `✔️ đúng bằng ${c}` : <M t={`\\ne ${c}`} />}</p>
          <div className="tn-nut-hang">
            <button type="button" onClick={() => { setDaThu([...daThu, { x, y, dung }]); onThaoTac(); }}>Thử điểm này</button>
            <button type="button" onClick={() => { setHienDuong(!hienDuong); onThaoTac(); }}>{hienDuong ? 'Ẩn đường thẳng' : 'Vẽ tất cả các điểm nghiệm'}</button>
          </div>
          <p className="tn-phu">Đã thử {daThu.length} điểm, {daThu.filter((d) => d.dung).length} điểm là nghiệm (chấm xanh).</p>
        </div>
      </div>
    );
  }

  if (k.cheDo === 'mot-duong') {
    const [ha, hb, hc] = h;
    const loai = ha === 0 && hb === 0 ? (hc === 0 ? 'Mọi điểm của mặt phẳng đều là nghiệm.' : 'Không có điểm nào: phương trình vô nghiệm.')
      : ha === 0 ? `Đường thẳng y = ${so(hc / hb)} song song với trục Ox.` : hb === 0 ? `Đường thẳng x = ${so(hc / ha)} song song với trục Oy.`
      : hc === 0 ? 'Đường thẳng đi qua gốc toạ độ O.' : 'Đường thẳng cắt cả hai trục toạ độ.';
    return (
      <div className="tn-hinh__ve">
        <Luoi><Duong pt={h} lop="tn-duong1" /></Luoi>
        <div className="tn-hinh__so">
          <Truot nhan="$a$" min={-4} max={4} value={ha} onChange={doiH(0)} />
          <Truot nhan="$b$" min={-4} max={4} value={hb} onChange={doiH(1)} />
          <Truot nhan="$c$" min={-6} max={6} value={hc} onChange={doiH(2)} />
          <p className="tn-chuoi"><M t={ptChu(h, true)} /></p>
          <p className="tn-nhan-manh">{loai}</p>
        </div>
      </div>
    );
  }

  // hai đường
  const [a2, b2, c2] = h;
  const D = a * b2 - a2 * b;
  let ketLuan: string; let giao: [number, number] | null = null;
  if (D !== 0) { giao = [(c * b2 - c2 * b) / D, (a * c2 - a2 * c) / D]; ketLuan = `Cắt nhau tại một điểm (${so(giao[0])}; ${so(giao[1])}): hệ có một nghiệm.`; }
  else if (a2 === 0 && b2 === 0) ketLuan = c2 === 0 ? 'Phương trình thứ hai đúng với mọi điểm.' : 'Phương trình thứ hai vô nghiệm, nên hệ vô nghiệm.';
  else if (a * c2 === a2 * c && b * c2 === b2 * c) ketLuan = 'Hai đường thẳng trùng nhau: hệ có vô số nghiệm.';
  else ketLuan = 'Hai đường thẳng song song: hệ vô nghiệm.';
  return (
    <div className="tn-hinh__ve">
      <Luoi>
        <Duong pt={k.pt} lop="tn-duong1" />
        <Duong pt={h} lop="tn-duong2" />
        {giao && <circle cx={px(giao[0])} cy={py(giao[1])} r={6} className="tn-diem-ok" />}
      </Luoi>
      <div className="tn-hinh__so">
        <p><span className="tn-mau1">━</span> <M t={ptChu(k.pt)} /> &nbsp; <span className="tn-mau2">━</span> <M t={ptChu(h, true)} /></p>
        {k.buocGiai ? <>
          <div className="tn-buoc-giai">
            {k.buocGiai.slice(0, buocHien).map((t) => <div key={t}><M t={t} /></div>)}
          </div>
          {buocHien < k.buocGiai.length
            ? <div className="tn-nut-hang"><button type="button" className="primary" onClick={() => { setBuocHien(buocHien + 1); onThaoTac(); }}>Bước tiếp ({buocHien + 1}/{k.buocGiai.length})</button></div>
            : <p className="tn-nhan-manh">{ketLuan} Đúng bằng giao điểm trên hình.</p>}
        </> : <>
          <Truot nhan="$a_2$" min={-4} max={4} value={a2} onChange={doiH(0)} />
          <Truot nhan="$b_2$" min={-4} max={4} value={b2} onChange={doiH(1)} />
          <Truot nhan="$c_2$" min={-6} max={8} value={c2} onChange={doiH(2)} />
          <p className="tn-nhan-manh">{ketLuan}</p>
        </>}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- 11. Cộng đại số
function CongDaiSo({ k, onThaoTac }: P & { k: Extract<Khung, { loai: 'cong-dai-so' }> }) {
  const [m1, setM1] = useState(1);
  const [m2, setM2] = useState(1);
  const [phep, setPhep] = useState<'cong' | 'tru'>('cong');
  const n1 = k.pt1.map((v) => v * m1), n2 = k.pt2.map((v) => v * m2);
  const kq = n1.map((v, i) => (phep === 'cong' ? v + n2[i] : v - n2[i]));
  const khu = kq[0] === 0 && kq[1] !== 0 ? 'x' : kq[1] === 0 && kq[0] !== 0 ? 'y' : null;
  const con = khu === 'x' ? { bien: 'y', gt: kq[2] / kq[1] } : khu === 'y' ? { bien: 'x', gt: kq[2] / kq[0] } : null;
  return (
    <div>
      <div className="tn-hai-cot">
        <Truot nhan="Nhân (1) với" min={-4} max={4} value={m1} onChange={(v) => { setM1(v); onThaoTac(); }} />
        <Truot nhan="Nhân (2) với" min={-4} max={4} value={m2} onChange={(v) => { setM2(v); onThaoTac(); }} />
        <div className="tn-nut-hang" role="group" aria-label="Phép tính">
          <button type="button" aria-pressed={phep === 'cong'} onClick={() => { setPhep('cong'); onThaoTac(); }}>Cộng vế với vế</button>
          <button type="button" aria-pressed={phep === 'tru'} onClick={() => { setPhep('tru'); onThaoTac(); }}>Trừ vế với vế</button>
        </div>
      </div>
      <div className="tn-loi-giai">
        <div><M t={`${ptChu(n1, true)} \\quad (1)\\times${m1 < 0 ? `(${m1})` : m1}`} /></div>
        <div><M t={`${ptChu(n2, true)} \\quad (2)\\times${m2 < 0 ? `(${m2})` : m2}`} /></div>
        <div className="tn-gach"><M t={`${phep === 'cong' ? '\\text{Cộng: }' : '\\text{Trừ: }'} ${ptChu(kq, true)}`} /></div>
      </div>
      {khu && con ? (
        <p className="tn-nhan-manh">Đã khử được {khu}! Còn <M t={`${so(kq[khu === 'x' ? 1 : 0])}${con.bien} = ${so(kq[2])}`} />, suy ra <M t={`${con.bien} = ${so(con.gt).replace(',', '{,}')}`} />.</p>
      ) : kq[0] === 0 && kq[1] === 0 ? <p className="tn-chu-loi">Mất cả hai ẩn: chọn số nhân khác nhé (đừng nhân với 0).</p>
        : <p className="tn-phu">Chưa khử được ẩn nào. Làm cho hệ số của x (hoặc y) đối nhau rồi cộng, hoặc bằng nhau rồi trừ.</p>}
    </div>
  );
}

// ---------------------------------------------------------------- 12. Tình huống thực tế
function TinhHuong({ k, onThaoTac }: P & { k: Extract<Khung, { loai: 'tinh-huong' }> }) {
  const [x, setX] = useState(Math.round(k.maxX / 4 / k.buoc) * k.buoc);
  const [y, setY] = useState(Math.round(k.maxY / 4 / k.buoc) * k.buoc);
  const kt = k.dieuKien.map((d) => ({ ...d, vt: d.a * x + d.b * y, dung: d.a * x + d.b * y === d.c }));
  const xong = kt.every((d) => d.dung);
  const cd = k.chuyenDong;
  return (
    <div>
      <div className="tn-hai-cot">
        <Truot nhan={k.tenX} min={0} max={k.maxX} step={k.buoc} value={x} onChange={(v) => { setX(v); onThaoTac(); }} donVi={k.donVi} />
        <Truot nhan={k.tenY} min={0} max={k.maxY} step={k.buoc} value={y} onChange={(v) => { setY(v); onThaoTac(); }} donVi={k.donVi} />
      </div>
      {cd && (() => {
        const sa = x * cd.gio, sb = y * cd.gio, L = cd.quangDuong;
        const vx = (km: number) => 20 + (Math.min(km, L * 1.3) / L) * 300;
        return (
          <svg viewBox="0 0 360 80" className="tn-truc-so" role="img" aria-label={`Sau ${cd.gio} giờ xe A đi ${sa} km, xe B đi ${sb} km`}>
            <line x1={20} x2={320} y1={40} y2={40} className="tn-truc" />
            <text x={20} y={66} textAnchor="middle" className="tn-dinh">A</text>
            <text x={320} y={66} textAnchor="middle" className="tn-dinh">B</text>
            <text x={170} y={66} textAnchor="middle" className="tn-nho">{L} km</text>
            <line x1={20} x2={vx(sa)} y1={34} y2={34} className="tn-xe-a" />
            <line x1={320} x2={320 - (vx(sb) - 20)} y1={46} y2={46} className="tn-xe-b" />
            <text x={vx(sa)} y={24} textAnchor="middle" className="tn-nho">🚗 {sa} km</text>
            <text x={320 - (vx(sb) - 20)} y={20} textAnchor="middle" className="tn-nho" dy={-2}>{sb} km 🚙</text>
          </svg>
        );
      })()}
      <ul className="tn-dk">
        {kt.map((d, i) => (
          <li key={i} className={d.dung ? 'tn-dk--ok' : ''}>
            {d.dung ? '✔️' : '✖️'} <MathText>{d.nhan}</MathText>
            <span className="tn-phu"> — với số em chọn: <M t={`${so(d.vt).replace(',', '{,}')} ${d.dung ? '=' : '\\ne'} ${d.c}`} /></span>
          </li>
        ))}
      </ul>
      {xong ? <p className="tn-nhan-manh">Tìm được rồi: cả hai điều kiện cùng đúng. Đây chính là nghiệm của hệ phương trình.</p>
        : <p className="tn-phu">Đoán mò rất lâu mới trúng. Lập hệ phương trình rồi giải sẽ nhanh hơn nhiều.</p>}
    </div>
  );
}

// ---------------------------------------------------------------- 13. Phương trình tích
const bieuThucBN = ([a, b]: [number, number]) => `${a === 1 ? '' : a === -1 ? '-' : a}x ${b < 0 ? '-' : '+'} ${Math.abs(b)}`;
function Tich({ k, onThaoTac }: P & { k: Extract<Khung, { loai: 'tich' }> }) {
  const [x, setX] = useState(0);
  const gt = k.thuaSo.map(([a, b]) => a * x + b);
  const tich = gt.reduce((p, v) => p * v, 1);
  return (
    <div>
      <Truot nhan="$x$" min={k.min} max={k.max} step={0.5} value={x} onChange={(v) => { setX(v); onThaoTac(); }} />
      <table className="tn-bang">
        <tbody>
          {k.thuaSo.map((t, i) => (
            <tr key={i} className={gt[i] === 0 ? 'tn-dong-0' : ''}><td><M t={bieuThucBN(t)} /></td><td><b>{so(gt[i])}</b></td><td>{gt[i] === 0 ? '← bằng 0' : ''}</td></tr>
          ))}
          <tr className={tich === 0 ? 'tn-dong-0' : ''}><td><M t={k.thuaSo.map((t) => `(${bieuThucBN(t)})`).join('')} /></td><td><b>{so(tich)}</b></td><td>{tich === 0 ? '← tích bằng 0' : ''}</td></tr>
        </tbody>
      </table>
    </div>
  );
}

// ---------------------------------------------------------------- 14. Ẩn ở mẫu
function AnOMau({ k, onThaoTac }: P & { k: Extract<Khung, { loai: 'an-o-mau' }> }) {
  const [x, setX] = useState(0);
  const mau = k.mau[0] * x + k.mau[1];
  const tu = k.tu[0] * x + k.tu[1];
  const loiGiai = (k.vePhai - k.tu[1]) / k.tu[0];
  const nghiemMau = -k.mau[1] / k.mau[0];
  return (
    <div>
      <Truot nhan="$x$" min={k.min} max={k.max} step={0.5} value={x} onChange={(v) => { setX(v); onThaoTac(); }} />
      <table className="tn-bang">
        <tbody>
          <tr><td>Mẫu <M t={bieuThucBN(k.mau)} /></td><td><b>{so(mau)}</b></td><td>{mau === 0 ? <span className="tn-chu-loi">mẫu bằng 0!</span> : ''}</td></tr>
          <tr><td>Vế trái <M t={`\\dfrac{${bieuThucBN(k.tu)}}{${bieuThucBN(k.mau)}}`} /></td><td><b>{mau === 0 ? 'không xác định' : so(tu / mau, 3)}</b></td><td /></tr>
          <tr><td>Vế phải <M t={`\\dfrac{${k.vePhai}}{${bieuThucBN(k.mau)}}`} /></td><td><b>{mau === 0 ? 'không xác định' : so(k.vePhai / mau, 3)}</b></td><td>{mau !== 0 && tu === k.vePhai ? '= vế trái' : ''}</td></tr>
        </tbody>
      </table>
      <div className="tn-loi-giai">
        <div>Khử mẫu: <M t={`${bieuThucBN(k.tu)} = ${k.vePhai} \\Rightarrow x = ${so(loiGiai)}`} /></div>
        <div>Điều kiện xác định: <M t={`x \\ne ${so(nghiemMau)}`} /> {loiGiai === nghiemMau ? <span className="tn-chu-loi">→ x = {so(loiGiai)} vi phạm điều kiện, phải loại!</span> : '→ thoả mãn'}</div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- 15. So sánh hai số
function SoSanh({ k, onThaoTac }: P & { k: Extract<Khung, { loai: 'so-sanh' }> }) {
  const [a, setA] = useState(k.a);
  const [b, setB] = useState(k.b);
  const vi = (t: number) => 20 + ((t + 8) / 16) * 320;
  const kd = [
    { t: 'a < b', d: a < b }, { t: 'a > b', d: a > b }, { t: 'a \\le b', d: a <= b }, { t: 'a \\ge b', d: a >= b }
  ];
  return (
    <div>
      <div className="tn-hai-cot">
        <Truot nhan="$a$" min={-8} max={8} value={a} onChange={(v) => { setA(v); onThaoTac(); }} />
        <Truot nhan="$b$" min={-8} max={8} value={b} onChange={(v) => { setB(v); onThaoTac(); }} />
      </div>
      <svg viewBox="0 0 360 60" className="tn-truc-so" role="img" aria-label={`a = ${a}, b = ${b}`}>
        <line x1={20} x2={340} y1={30} y2={30} className="tn-truc" />
        {[-8, -4, 0, 4, 8].map((t) => <text key={t} x={vi(t)} y={54} textAnchor="middle" className="tn-nho">{t}</text>)}
        <circle cx={vi(a)} cy={30} r={7} className="tn-diem-chon" />
        <circle cx={vi(b)} cy={30} r={a === b ? 4 : 7} className="tn-diem-ok" />
        {a === b ? <text x={vi(a)} y={16} textAnchor="middle" className="tn-dinh">a = b</text>
          : <><text x={vi(a)} y={16} textAnchor="middle" className="tn-dinh">a</text><text x={vi(b)} y={16} textAnchor="middle" className="tn-dinh">b</text></>}
      </svg>
      <div className="tn-nut-hang">
        {kd.map((x) => <span key={x.t} className={`tn-kd ${x.d ? 'tn-kd--dung' : 'tn-kd--sai'}`}><M t={x.t} /> {x.d ? 'đúng' : 'sai'}</span>)}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- 16. Tính chất bất đẳng thức
function TinhChat({ k, onThaoTac }: P & { k: Extract<Khung, { loai: 'tinh-chat' }> }) {
  const [phep, setPhep] = useState<'cong' | 'nhan'>('nhan');
  const [kk, setK] = useState(2);
  const f = (v: number) => (phep === 'cong' ? v + kk : v * kk);
  const ta = f(k.a), tb = f(k.b);
  const dau = ta < tb ? '<' : ta > tb ? '>' : '=';
  const vt = phep === 'cong' ? `${k.a} + (${kk})` : `${k.a}\\cdot(${kk})`, vp = phep === 'cong' ? `${k.b} + (${kk})` : `${k.b}\\cdot(${kk})`;
  return (
    <div>
      <p className="tn-chuoi">Ban đầu: <M t={`${k.a} < ${k.b}`} /></p>
      <div className="tn-hai-cot">
        <div className="tn-nut-hang" role="group" aria-label="Phép biến đổi">
          <button type="button" aria-pressed={phep === 'cong'} onClick={() => { setPhep('cong'); onThaoTac(); }}>Cộng hai vế với k</button>
          <button type="button" aria-pressed={phep === 'nhan'} onClick={() => { setPhep('nhan'); onThaoTac(); }}>Nhân hai vế với k</button>
        </div>
        <Truot nhan="$k$" min={-4} max={4} value={kk} onChange={(v) => { setK(v); onThaoTac(); }} />
      </div>
      <p className="tn-chuoi"><M t={`${vt} = ${ta} \\quad ${dau} \\quad ${tb} = ${vp}`} /></p>
      <p className={dau === '>' ? 'tn-nhan-manh' : 'tn-phu'}>
        {dau === '<' ? 'Giữ nguyên chiều.' : dau === '>' ? 'Chiều bất đẳng thức đã ĐỔI (từ < thành >)!' : 'Hai vế bằng nhau: nhân với 0 làm mất bất đẳng thức.'}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------- 17. Dò nghiệm bất phương trình
function Bpt({ k, onThaoTac }: P & { k: Extract<Khung, { loai: 'bpt' }> }) {
  const [x, setX] = useState(0);
  const [da, setDa] = useState<{ x: number; dung: boolean }[]>([]);
  const vt = k.a * x + k.b;
  const thoa = (v: number) => (k.dau === '>' ? v > 0 : k.dau === '<' ? v < 0 : k.dau === '≥' ? v >= 0 : v <= 0);
  const vi = (t: number) => 20 + ((t - k.min) / (k.max - k.min)) * 320;
  const dauTex = { '>': '>', '<': '<', '≥': '\\ge', '≤': '\\le' }[k.dau];
  const bt = bieuThucBN([k.a, k.b]);
  return (
    <div>
      <Truot nhan="$x$" min={k.min} max={k.max} step={0.5} value={x} onChange={(v) => {
        setX(v); onThaoTac();
        // Mỗi lần đổi x là tự thử luôn, đỡ phải bấm "Thử".
        const g = k.a * v + k.b; setDa((d) => (d.some((p) => p.x === v) ? d : [...d, { x: v, dung: thoa(g) }]));
      }} />
      <svg viewBox="0 0 360 60" className="tn-truc-so" role="img" aria-label="Các điểm đã thử trên trục số">
        <line x1={20} x2={340} y1={30} y2={30} className="tn-truc" />
        {Array.from({ length: k.max - k.min + 1 }, (_, i) => k.min + i).map((t) => <text key={t} x={vi(t)} y={54} textAnchor="middle" className="tn-nho">{t}</text>)}
        {da.map((d, i) => <circle key={i} cx={vi(d.x)} cy={30} r={5} className={d.dung ? 'tn-diem-ok' : 'tn-diem-sai'} />)}
        <circle cx={vi(x)} cy={30} r={8} className="tn-diem-chon" fillOpacity={0.35} />
      </svg>
      <p><M t={`${bt} = ${so(vt).replace(',', '{,}')}`} /> {thoa(vt) ? <>✔️ <M t={`${dauTex} 0`} />: <b>là nghiệm</b></> : <>✖️ không <M t={`${dauTex} 0`} /></>}</p>
      <div className="tn-nut-hang">
        {da.length > 0 && <button type="button" onClick={() => setDa([])}>Xoá các điểm</button>}
      </div>
    </div>
  );
}

export function VeKhung({ khung, onThaoTac }: { khung: Khung; onThaoTac: () => void }) {
  switch (khung.loai) {
    case 'hinh-vuong': return <HinhVuong k={khung} onThaoTac={onThaoTac} />;
    case 'binh-phuong': return <BinhPhuong k={khung} onThaoTac={onThaoTac} />;
    case 'dieu-kien': return <DieuKien k={khung} onThaoTac={onThaoTac} />;
    case 'nhan-chia': return <NhanChia k={khung} onThaoTac={onThaoTac} />;
    case 'tach-thua-so': return <TachThuaSo k={khung} onThaoTac={onThaoTac} />;
    case 'dua-vao': return <DuaVao k={khung} onThaoTac={onThaoTac} />;
    case 'truc-can': return <TrucCan k={khung} onThaoTac={onThaoTac} />;
    case 'ghep-buoc': return <GhepBuoc k={khung} onThaoTac={onThaoTac} />;
    case 'tam-giac': return <TamGiac k={khung} onThaoTac={onThaoTac} />;
    case 'mat-phang': return <MatPhang k={khung} onThaoTac={onThaoTac} />;
    case 'cong-dai-so': return <CongDaiSo k={khung} onThaoTac={onThaoTac} />;
    case 'tinh-huong': return <TinhHuong k={khung} onThaoTac={onThaoTac} />;
    case 'tich': return <Tich k={khung} onThaoTac={onThaoTac} />;
    case 'an-o-mau': return <AnOMau k={khung} onThaoTac={onThaoTac} />;
    case 'so-sanh': return <SoSanh k={khung} onThaoTac={onThaoTac} />;
    case 'tinh-chat': return <TinhChat k={khung} onThaoTac={onThaoTac} />;
    case 'bpt': return <Bpt k={khung} onThaoTac={onThaoTac} />;
    case 'tron-diem': return <TronDiem k={khung} onThaoTac={onThaoTac} />;
    case 'tron-doi-xung': return <TronDoiXung k={khung} onThaoTac={onThaoTac} />;
    case 'day-cung': return <DayCung k={khung} onThaoTac={onThaoTac} />;
    case 'cung-quat': return <CungQuat k={khung} onThaoTac={onThaoTac} />;
    case 'thang-tron': return <ThangTron k={khung} onThaoTac={onThaoTac} />;
    case 'hai-tron': return <HaiTron k={khung} onThaoTac={onThaoTac} />;
  }
}
