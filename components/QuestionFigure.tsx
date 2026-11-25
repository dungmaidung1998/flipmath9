/**
 * FILE NÀY LÀM GÌ: Component React giao diện hiển thị và xử lý tương tác của người dùng trên trình duyệt.
 * AI DÙNG: học sinh
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: @/components/AnhChuDe, @/lib/chuDeChuong, @/lib/hinhToanHoc
 */
import AnhChuDe from '@/components/AnhChuDe';
import { chuDeChuong } from '@/lib/chuDeChuong';
import {
  hinhHopLe,
  tinhToaDoDuongTronDay,
  tinhToaDoHaiDuongTron,
  tinhToaDoQuatVanhKhuyen,
  tinhToaDoTamGiacVuong,
  tinhToaDoTiepTuyen,
  type D2,
  type DoanThang,
  type DuongTronCu,
  type DuongTronDay,
  type HaiDuongTron,
  type Hinh,
  type HinhVe,
  type Quat,
  type QuatVanhKhuyen,
  type TamGiacVuong,
  type TiepTuyen,
} from '@/lib/hinhToanHoc';

export type { Hinh };

const MAU = ['var(--viz-c1)', 'var(--viz-c2)', 'var(--viz-c3)', 'var(--viz-c4)', 'var(--viz-c5)', 'var(--viz-c6)'];
const NET = 'var(--ink, #182345)';
const NHAN = '#d9531e';
const NEN = 'var(--viz-surface, #fff)';
// Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
const so = (v: number) => String(Math.round(v * 100) / 100).replace('.', ',');

/**
 * Component React `mauTheoChuong`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
function mauTheoChuong(chuong?: string, macDinh = '#2b4ba8'): string {
  return (chuong && chuDeChuong(chuong)?.mau) || macDinh;
}

/**
 * Component React `Cham`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
function Cham({ p, fill = NET }: { p: D2; fill?: string }) {
  return <circle cx={p.x} cy={p.y} r={3.2} fill={fill} />;
}

/**
 * Component React `Ten`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
function Ten({
  p,
  t,
  dx = 0,
  dy = 0,
  nghieng = true,
}: {
  p: D2;
  t?: string;
  dx?: number;
  dy?: number;
  nghieng?: boolean;
}) {
  if (!t) return null;
  return (
    <text
      x={p.x + dx}
      y={p.y + dy}
      textAnchor="middle"
      dominantBaseline="middle"
      className="lbl"
      fontSize={15}
      fontWeight={700}
      fontStyle={nghieng ? 'italic' : undefined}
      fill={NET}
      paintOrder="stroke"
      stroke="#ffffff"
      strokeWidth={4}
      strokeLinejoin="round"
    >
      {t}
    </text>
  );
}

/**
 * Component React `So`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
function So({
  x,
  y,
  t,
  a = 'middle',
  mau,
}: {
  x: number;
  y: number;
  t?: string;
  a?: 'start' | 'middle' | 'end';
  mau?: string;
}) {
  if (!t) return null;
  const hoi = t.includes('?');
  return (
    <text
      x={x}
      y={y}
      textAnchor={a}
      dominantBaseline="middle"
      className="val"
      fontSize={13.5}
      fontWeight={hoi ? 800 : 600}
      fill={hoi ? NHAN : mau ?? NET}
      paintOrder="stroke"
      stroke="#ffffff"
      strokeWidth={4}
      strokeLinejoin="round"
    >
      {t}
    </text>
  );
}

/**
 * Component React `Vuong`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
function Vuong({ p, u, v, k = 11 }: { p: D2; u: D2; v: D2; k?: number }) {
  const a = { x: p.x + u.x * k, y: p.y + u.y * k };
  const b = { x: p.x + v.x * k, y: p.y + v.y * k };
  return (
    <polyline
      points={`${a.x},${a.y} ${a.x + v.x * k},${a.y + v.y * k} ${b.x},${b.y}`}
      fill="none"
      stroke={NET}
      strokeWidth={1.5}
    />
  );
}

/**
 * Component React `BieuDoQuat`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
function BieuDoQuat({ h }: { h: Quat }) {
  const R = 90;
  const cx = 100;
  const cy = 100;
  const tong = h.duLieu.reduce((s, [, v]) => s + v, 0) || 1;
  let goc = -Math.PI / 2;
  const lat = h.duLieu.map(([nhan, v], i) => {
    const a0 = goc;
    const a1 = goc + (v / tong) * 2 * Math.PI;
    goc = a1;
    const lon = a1 - a0 > Math.PI ? 1 : 0;
    const p = (a: number, r = R) => [cx + r * Math.cos(a), cy + r * Math.sin(a)];
    const [x0, y0] = p(a0);
    const [x1, y1] = p(a1);
    const [tx, ty] = p((a0 + a1) / 2, R * 0.62);
    const d =
      h.duLieu.length === 1
        ? `M ${cx - R} ${cy} a ${R} ${R} 0 1 0 ${2 * R} 0 a ${R} ${R} 0 1 0 ${-2 * R} 0`
        : `M ${cx} ${cy} L ${x0} ${y0} A ${R} ${R} 0 ${lon} 1 ${x1} ${y1} Z`;
    return { nhan, v, d, tx, ty, mau: MAU[i % MAU.length] };
  });
  return (
    <figure className="viz question-figure" aria-label={'Biểu đồ hình quạt tròn: ' + (h.tieuDe ?? '')}>
      {h.tieuDe && <p className="question-figure-title">{h.tieuDe}</p>}
      <div className="question-figure-pie">
        <svg viewBox="0 0 200 200" role="img" aria-hidden="true" style={{ maxWidth: 220 }}>
          {lat.map((l, i) => (
            <path key={i} d={l.d} fill={l.mau} stroke="var(--viz-surface)" strokeWidth={2} />
          ))}
          {lat
            .filter((l) => l.v / tong >= 0.08)
            .map((l, i) => (
              <text key={i} x={l.tx} y={l.ty} textAnchor="middle" dominantBaseline="middle" className="pie-val">
                {so(l.v)}%
              </text>
            ))}
        </svg>
        <ul className="question-figure-legend">
          {lat.map((l, i) => (
            <li key={i}>
              <span className="sw" style={{ background: l.mau }} />
              {l.nhan}: <strong>{so(l.v)}%</strong>
            </li>
          ))}
        </ul>
      </div>
    </figure>
  );
}

/**
 * Component React `buocDep`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
function buocDep(khoang: number) {
  const tho = khoang / 5;
  // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
  const mu = Math.pow(10, Math.floor(Math.log10(tho || 1)));
  for (const k of [1, 2, 2.5, 5, 10]) if (k * mu >= tho) return k * mu;
  return 10 * mu;
}

/**
 * Component React `BieuDoDoanThang`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
function BieuDoDoanThang({ h }: { h: DoanThang }) {
  const W = 520;
  const H = 260;
  const L = 52;
  const Rp = 16;
  const T = 22;
  const B = 44;
  const ys = h.duLieu.map(([, v]) => v);
  // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
  const max = Math.max(...ys);
  // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
  const minV = Math.min(...ys);
  const tuKhong = minV >= 0 && minV <= 0.45 * max;
  const step = buocDep(max - (tuKhong ? 0 : minV) || 1);
  // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
  const y0 = tuKhong ? 0 : Math.floor(minV / step) * step - (minV % step === 0 ? step : 0);
  // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
  const y1 = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let v = y0; v <= y1 + step / 1000; v += step) ticks.push(Math.round(v * 1000) / 1000);
  const n = h.duLieu.length;
  const X = (i: number) => L + (n === 1 ? (W - L - Rp) / 2 : (i * (W - L - Rp)) / (n - 1));
  const Y = (v: number) => T + ((y1 - v) / (y1 - y0 || 1)) * (H - T - B);
  const pts = h.duLieu.map(([m, v], i) => ({ m, v, x: X(i), y: Y(v) }));
  return (
    <figure className="viz question-figure" aria-label={'Biểu đồ đoạn thẳng: ' + (h.tieuDe ?? '')}>
      {h.tieuDe && <p className="question-figure-title">{h.tieuDe}</p>}
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-hidden="true">
        {ticks.map((t) => (
          <g key={t}>
            <line x1={L} x2={W - Rp} y1={Y(t)} y2={Y(t)} stroke="var(--viz-grid)" strokeWidth={1} />
            <text x={L - 8} y={Y(t)} textAnchor="end" dominantBaseline="middle" className="lbl">
              {so(t)}
            </text>
          </g>
        ))}
        <line x1={L} x2={L} y1={T - 6} y2={H - B} stroke="var(--viz-axis)" strokeWidth={1.5} />
        <line x1={L} x2={W - Rp} y1={H - B} y2={H - B} stroke="var(--viz-axis)" strokeWidth={1.5} />
        {h.trucY && (
          <text x={4} y={T - 12} textAnchor="start" className="lbl">
            {h.trucY}
          </text>
        )}
        {h.trucX && (
          <text x={W - Rp} y={H - 6} textAnchor="end" className="lbl">
            {h.trucX}
          </text>
        )}
        <polyline
          points={pts.map((p) => `${p.x},${p.y}`).join(' ')}
          fill="none"
          stroke="var(--viz-c1)"
          strokeWidth={2.5}
          strokeLinejoin="round"
        />
        {pts.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r={4.5} fill="var(--viz-c1)" stroke="var(--viz-surface)" strokeWidth={1.5} />
            <text x={p.x} y={p.y - 11} textAnchor="middle" className="val">
              {so(p.v)}
            </text>
            <text x={p.x} y={H - B + 18} textAnchor="middle" className="lbl">
              {p.m}
            </text>
          </g>
        ))}
      </svg>
    </figure>
  );
}

/**
 * Component React `HinhVeHinhHoc`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
function HinhVeHinhHoc({ h }: { h: HinhVe }) {
  return (
    <figure className="question-figure question-figure-geo">
      {h.anh ? (
        <AnhChuDe
          src={h.anh}
          fallback={h.fallback ?? '/chu-de/canh/C1.webp'}
          alt={h.moTa}
          width={640}
          height={400}
          style={{ maxWidth: '100%', height: 'auto', maxHeight: 280, display: 'block', margin: '0 auto', borderRadius: 8 }}
        />
      ) : (
        <p>
          <strong>Hình vẽ: </strong>
          {h.moTa}
        </p>
      )}
      {h.anh && <figcaption className="sr-only">{h.moTa}</figcaption>}
    </figure>
  );
}

/** Tam giác vuông theo tỉ lệ thực (Chương IV). */
function VeTamGiacVuong({ h }: { h: TamGiacVuong }) {
  const [V, T, P] = h.dinh ?? ['A', 'B', 'C'];
  const c = tinhToaDoTamGiacVuong(h);
  const mau = mauTheoChuong(h.chuong ?? 'C4', '#0284c7');
  const nhan = (v?: string, ten?: string) => [ten, v].filter(Boolean).join(' ');
  const huyen = nhan(h.canh?.huyen, h.nhanCanh?.huyen);
  const tren = nhan(h.canh?.tren, h.nhanCanh?.tren);
  const ngang = nhan(h.canh?.ngang, h.nhanCanh?.ngang);
  const { A, B, C } = c;

  return (
    <figure className="question-figure question-figure-geo" aria-label={'Hình vẽ: ' + h.moTa}>
      <svg
        viewBox={`0 0 ${c.W} ${c.H}`}
        role="img"
        aria-hidden="true"
        style={{ width: 'min(100%, 340px)', maxWidth: '100%', height: 'auto', display: 'block', margin: '0 auto' }}
      >
        <polygon
          points={`${A.x},${A.y} ${B.x},${B.y} ${C.x},${C.y}`}
          fill={mau}
          fillOpacity={0.07}
          stroke={NET}
          strokeWidth={2.5}
          strokeLinejoin="round"
        />
        <Vuong p={A} u={{ x: 0, y: -1 }} v={{ x: 1, y: 0 }} k={14} />
        <Ten p={A} t={V} dx={-14} dy={16} />
        <Ten p={B} t={T} dx={-14} dy={-10} />
        <Ten p={C} t={P} dx={12} dy={16} />
        {tren && <So x={c.trenMid.x} y={c.trenMid.y} t={tren} a="end" />}
        {ngang && <So x={c.ngangMid.x} y={c.ngangMid.y} t={ngang} />}
        {huyen && <So x={c.huyenMid.x} y={c.huyenMid.y} t={huyen} a="start" />}
        {h.goc?.tren && (
          <>
            <path
              d={`M ${B.x} ${B.y + c.rGocB} A ${c.rGocB} ${c.rGocB} 0 0 0 ${c.arcBEnd.x} ${c.arcBEnd.y}`}
              fill="none"
              stroke={mau}
              strokeWidth={2.2}
            />
            <So x={B.x + 12} y={B.y + c.rGocB + 18} t={h.goc.tren} a="start" mau={mau} />
          </>
        )}
        {h.goc?.phai && (
          <>
            <path
              d={`M ${c.arcCStart.x} ${c.arcCStart.y} A ${c.rGocC} ${c.rGocC} 0 0 1 ${c.arcCEnd.x} ${c.arcCEnd.y}`}
              fill="none"
              stroke={mau}
              strokeWidth={2.2}
            />
            <So x={C.x - c.rGocC - 16} y={C.y - 11} t={h.goc.phai} a="end" mau={mau} />
          </>
        )}
      </svg>
      <figcaption className="sr-only">{h.moTa}</figcaption>
    </figure>
  );
}

/** Đường tròn, dây, đường kính, đa giác nội tiếp và góc ở tâm (Chương V). */
function VeDuongTronDay({ h }: { h: DuongTronDay }) {
  const c = tinhToaDoDuongTronDay(h);
  const mau = mauTheoChuong(h.chuong ?? 'C5', '#c026d3');
  return (
    <figure className="question-figure question-figure-geo" aria-label={'Hình vẽ: ' + h.moTa}>
      <svg
        viewBox={`0 0 ${c.W} ${c.H}`}
        role="img"
        aria-hidden="true"
        style={{ width: 'min(100%, 340px)', maxWidth: '100%', height: 'auto', display: 'block', margin: '0 auto' }}
      >
        {!h.anDuongTron && (
          <circle cx={c.O.x} cy={c.O.y} r={c.R} fill={NEN} stroke={NET} strokeWidth={2.5} />
        )}
        {c.cung.map((arc, idx) => (
          <g key={idx}>
            {arc.toNhe && <path d={arc.sectorPath} fill={mau} fillOpacity={0.14} />}
            <path d={arc.arcPath} fill="none" stroke={mau} strokeWidth={3.6} strokeLinecap="round" />
            {arc.cungGoc && <path d={arc.angleArcPath} fill="none" stroke={NHAN} strokeWidth={2} />}
            {arc.nhanCung && <So x={arc.arcLabelPt.x} y={arc.arcLabelPt.y} t={arc.nhanCung} mau={mau} />}
            {arc.nhanGoc && <So x={arc.gocLabelPt.x} y={arc.gocLabelPt.y} t={arc.nhanGoc} mau={NHAN} />}
          </g>
        ))}
        {c.daGiac && (
          <polygon
            points={c.daGiac.pts.map((p) => `${p.x},${p.y}`).join(' ')}
            fill={c.daGiac.toNhe ? mau : 'none'}
            fillOpacity={c.daGiac.toNhe ? 0.1 : 0}
            stroke={c.daGiac.chinh ? mau : NET}
            strokeWidth={c.daGiac.chinh ? 2.5 : 2}
            strokeLinejoin="round"
          />
        )}
        {c.doan.map((d, idx) => (
          <g key={idx}>
            <line
              x1={d.x1}
              y1={d.y1}
              x2={d.x2}
              y2={d.y2}
              stroke={d.chinh ? mau : NET}
              strokeWidth={d.chinh ? 2.6 : d.netDut ? 1.6 : 2}
              strokeDasharray={d.netDut ? '5 4' : undefined}
              strokeLinecap="round"
            />
            {d.nhan && <So x={d.lx} y={d.ly} t={d.nhan} a={d.anchor} />}
          </g>
        ))}
        {c.vuongTai.map((v, idx) => (
          <Vuong key={idx} p={v.p} u={v.u} v={v.v} k={11} />
        ))}
        {!h.anTam && (
          <>
            <Cham p={c.O} />
            <Ten p={c.O} t={h.tam ?? 'O'} dx={-12} dy={14} />
          </>
        )}
        {c.diem.map((pt, idx) => (
          <g key={idx}>
            {pt.showDot && <Cham p={pt} />}
            {pt.ten && <Ten p={{ x: pt.lx, y: pt.ly }} t={pt.ten} />}
          </g>
        ))}
        {c.nhanThem.map((nt, idx) => (
          <So key={idx} x={nt.x} y={nt.y} t={nt.text} />
        ))}
        {h.R && <So x={c.O.x + c.R * 0.48} y={c.O.y - c.R * 0.52} t={h.R} />}
      </svg>
      <figcaption className="sr-only">{h.moTa}</figcaption>
    </figure>
  );
}

/** Tiếp tuyến, hai tiếp tuyến cắt nhau và đường tròn nội tiếp tam giác. */
function VeTiepTuyen({ h }: { h: TiepTuyen }) {
  const c = tinhToaDoTiepTuyen(h);
  const mau = mauTheoChuong(h.chuong ?? 'C5', '#c026d3');
  const nhan = h.nhan ?? {};

  if (c.kieu === 'noi-tiep') {
    const { A, B, C, I, D, E, F, rPx, ten, posTen, uAB, uAC } = c;
    return (
      <figure className="question-figure question-figure-geo" aria-label={'Hình vẽ: ' + h.moTa}>
        <svg
          viewBox={`0 0 ${c.W} ${c.H}`}
          role="img"
          aria-hidden="true"
          style={{ width: 'min(100%, 340px)', maxWidth: '100%', height: 'auto', display: 'block', margin: '0 auto' }}
        >
          <polygon
            points={`${A.x},${A.y} ${B.x},${B.y} ${C.x},${C.y}`}
            fill="none"
            stroke={NET}
            strokeWidth={2.5}
            strokeLinejoin="round"
          />
          <circle cx={I.x} cy={I.y} r={rPx} fill={mau} fillOpacity={0.08} stroke={mau} strokeWidth={2.4} />
          {h.tamGiac?.vuongTaiA && <Vuong p={A} u={uAB} v={uAC} k={12} />}
          <Cham p={I} fill={mau} />
          <Ten p={I} t="I" dx={8} dy={12} />
          <Cham p={D} />
          <Cham p={E} />
          <Cham p={F} />
          <Ten p={posTen.A} t={ten.A} />
          <Ten p={posTen.B} t={ten.B} />
          <Ten p={posTen.C} t={ten.C} />
          <Ten p={posTen.D} t={ten.D} />
          <Ten p={posTen.E} t={ten.E} />
          <Ten p={posTen.F} t={ten.F} />
          {nhan.AD && <So x={(A.x + D.x) / 2 - 14} y={(A.y + D.y) / 2 - 6} t={nhan.AD} a="end" />}
          {nhan.AB && <So x={(B.x + D.x) / 2 - 14} y={(B.y + D.y) / 2 + 4} t={nhan.AB} a="end" />}
          {nhan.AC && <So x={(A.x + C.x) / 2 + 18} y={(A.y + C.y) / 2 - 4} t={nhan.AC} a="start" />}
          {nhan.BC && <So x={(B.x + C.x) / 2} y={B.y + 20} t={nhan.BC} />}
        </svg>
        <figcaption className="sr-only">{h.moTa}</figcaption>
      </figure>
    );
  }

  const { O, M, A, B, Rpx, uAO, uAM, uBO, uBM } = c;
  const hienVuong = h.hienVuong !== false;

  if (c.kieu === 'mot') {
    const uLine = uAM;
    const tx1 = { x: A.x - uLine.x * 26, y: A.y - uLine.y * 26 };
    const tx2 = { x: M.x + uLine.x * 16, y: M.y + uLine.y * 16 };
    return (
      <figure className="question-figure question-figure-geo" aria-label={'Hình vẽ: ' + h.moTa}>
        <svg
          viewBox={`0 0 ${c.W} ${c.H}`}
          role="img"
          aria-hidden="true"
          style={{ width: 'min(100%, 340px)', maxWidth: '100%', height: 'auto', display: 'block', margin: '0 auto' }}
        >
          <circle cx={O.x} cy={O.y} r={Rpx} fill={NEN} stroke={NET} strokeWidth={2.5} />
          <line x1={tx1.x} y1={tx1.y} x2={tx2.x} y2={tx2.y} stroke={mau} strokeWidth={2.6} />
          <line x1={O.x} y1={O.y} x2={A.x} y2={A.y} stroke={NET} strokeWidth={1.8} />
          <line x1={O.x} y1={O.y} x2={M.x} y2={M.y} stroke={NET} strokeWidth={1.8} />
          {hienVuong && <Vuong p={A} u={uAO} v={uAM} k={11} />}
          <Cham p={O} />
          <Cham p={A} />
          <Cham p={M} />
          <Ten p={O} t="O" dx={-14} dy={6} />
          <Ten p={A} t="A" dx={-6} dy={-14} />
          <Ten p={M} t="M" dx={12} dy={4} />
          {h.diemB && (
            <>
              <Cham p={B} />
              <Ten p={B} t="B" dx={6} dy={15} />
            </>
          )}
          <So x={(O.x + A.x) / 2 - 10} y={(O.y + A.y) / 2 - 6} t={nhan.R} a="end" />
          <So x={(A.x + M.x) / 2 + 8} y={(A.y + M.y) / 2 - 14} t={nhan.MA} />
          <So x={(O.x + M.x) / 2} y={O.y + 18} t={nhan.OM} />
          {h.diemB && <So x={(B.x + M.x) / 2} y={O.y - 14} t={nhan.MB} />}
          {nhan.goc && <So x={M.x - 42} y={M.y - 12} t={nhan.goc} a="end" mau={mau} />}
        </svg>
        <figcaption className="sr-only">{h.moTa}</figcaption>
      </figure>
    );
  }

  return (
    <figure className="question-figure question-figure-geo" aria-label={'Hình vẽ: ' + h.moTa}>
      <svg
        viewBox={`0 0 ${c.W} ${c.H}`}
        role="img"
        aria-hidden="true"
        style={{ width: 'min(100%, 340px)', maxWidth: '100%', height: 'auto', display: 'block', margin: '0 auto' }}
      >
        <circle cx={O.x} cy={O.y} r={Rpx} fill={NEN} stroke={NET} strokeWidth={2.5} />
        <line x1={M.x} y1={M.y} x2={A.x} y2={A.y} stroke={mau} strokeWidth={2.6} strokeLinecap="round" />
        <line x1={M.x} y1={M.y} x2={B.x} y2={B.y} stroke={mau} strokeWidth={2.6} strokeLinecap="round" />
        <line x1={O.x} y1={O.y} x2={A.x} y2={A.y} stroke={NET} strokeWidth={1.7} />
        <line x1={O.x} y1={O.y} x2={B.x} y2={B.y} stroke={NET} strokeWidth={1.7} />
        {(h.veOM || nhan.OM) && (
          <line x1={O.x} y1={O.y} x2={M.x} y2={M.y} stroke={NET} strokeWidth={1.5} strokeDasharray="5 4" />
        )}
        {(h.veDayAB || nhan.day) && (
          <line x1={A.x} y1={A.y} x2={B.x} y2={B.y} stroke={NET} strokeWidth={1.6} />
        )}
        {hienVuong && (
          <>
            <Vuong p={A} u={uAO} v={uAM} k={10} />
            <Vuong p={B} u={uBO} v={uBM} k={10} />
          </>
        )}
        <Cham p={O} />
        <Cham p={A} />
        <Cham p={B} />
        <Cham p={M} />
        <Ten p={O} t="O" dx={-14} dy={0} />
        <Ten p={A} t="A" dx={-4} dy={-15} />
        <Ten p={B} t="B" dx={-4} dy={16} />
        <Ten p={M} t="M" dx={14} dy={0} />
        <So x={(A.x + M.x) / 2 + 8} y={(A.y + M.y) / 2 - 14} t={nhan.MA} />
        <So x={(B.x + M.x) / 2 + 8} y={(B.y + M.y) / 2 + 16} t={nhan.MB} />
        <So x={(O.x + A.x) / 2 - 8} y={(O.y + A.y) / 2 - 8} t={nhan.R} a="end" />
        <So x={(O.x + M.x) / 2 + 16} y={O.y + 15} t={nhan.OM} />
        {nhan.goc && <So x={M.x - 18} y={M.y + 38} t={nhan.goc} a="middle" mau={mau} />}
        {nhan.gocTam && <So x={O.x + 28} y={O.y} t={nhan.gocTam} a="start" mau={mau} />}
        {nhan.day && <So x={A.x + 8} y={O.y + 18} t={nhan.day} a="start" />}
      </svg>
      <figcaption className="sr-only">{h.moTa}</figcaption>
    </figure>
  );
}

/** Hai đường tròn (cắt nhau, tiếp xúc ngoài/trong, ở ngoài nhau, đựng nhau). */
function VeHaiDuongTron({ h }: { h: HaiDuongTron }) {
  const c = tinhToaDoHaiDuongTron(h);
  const mau = mauTheoChuong(h.chuong ?? 'C5', '#c026d3');
  const nhan = h.nhan ?? {};
  const { O1, O2, Rpx, rpx, inter } = c;
  const pR = { x: O1.x - Rpx * 0.42, y: O1.y - Rpx * 0.91 };
  const pr = { x: O2.x + rpx * 0.36, y: O2.y - rpx * 0.93 };

  return (
    <figure className="question-figure question-figure-geo" aria-label={'Hình vẽ: ' + h.moTa}>
      <svg
        viewBox={`0 0 ${c.W} ${c.H}`}
        role="img"
        aria-hidden="true"
        style={{ width: 'min(100%, 340px)', maxWidth: '100%', height: 'auto', display: 'block', margin: '0 auto' }}
      >
        <circle cx={O1.x} cy={O1.y} r={Rpx} fill="none" stroke={NET} strokeWidth={2.5} />
        <circle cx={O2.x} cy={O2.y} r={rpx} fill="none" stroke={mau} strokeWidth={2.5} />
        <line x1={O1.x} y1={O1.y} x2={O2.x} y2={O2.y} stroke={NET} strokeWidth={1.7} />
        {nhan.R && <line x1={O1.x} y1={O1.y} x2={pR.x} y2={pR.y} stroke={NET} strokeWidth={1.5} strokeDasharray="5 4" />}
        {nhan.r && <line x1={O2.x} y1={O2.y} x2={pr.x} y2={pr.y} stroke={mau} strokeWidth={1.5} strokeDasharray="5 4" />}
        {inter && h.veDayChung && (
          <>
            <line x1={inter.A.x} y1={inter.A.y} x2={inter.B.x} y2={inter.B.y} stroke={mau} strokeWidth={2.5} />
            {h.hienVuongH && <Vuong p={inter.H} u={{ x: 1, y: 0 }} v={{ x: 0, y: -1 }} k={10} />}
            <Cham p={inter.A} />
            <Cham p={inter.B} />
            <Ten p={inter.A} t="A" dy={-13} />
            <Ten p={inter.B} t="B" dy={15} />
          </>
        )}
        <Cham p={O1} />
        <Cham p={O2} fill={mau} />
        <Ten p={O1} t={nhan.O1 ?? 'O'} dx={-6} dy={16} />
        <Ten p={O2} t={nhan.O2 ?? 'O′'} dx={8} dy={16} />
        {nhan.R && <So x={pR.x - 4} y={pR.y - 10} t={nhan.R} a="end" />}
        {nhan.r && <So x={pr.x + 4} y={pr.y - 10} t={nhan.r} a="start" mau={mau} />}
        {nhan.d && <So x={(O1.x + O2.x) / 2} y={O1.y + Math.max(Rpx, rpx) + 22} t={nhan.d} />}
        {nhan.day && inter && <So x={inter.A.x + 12} y={(inter.A.y + inter.H.y) / 2} t={nhan.day} a="start" />}
      </svg>
      <figcaption className="sr-only">{h.moTa}</figcaption>
    </figure>
  );
}

/** Cung tròn, hình quạt tròn và hình vành khuyên theo góc & tỉ lệ bán kính thật. */
function VeQuatVanhKhuyen({ h }: { h: QuatVanhKhuyen }) {
  const c = tinhToaDoQuatVanhKhuyen(h);
  const mau = mauTheoChuong(h.chuong ?? 'C5', '#c026d3');
  const nhan = h.nhan ?? {};

  if (c.kieu === 'vanh-khuyen') {
    const { O, Rpx, rpx, P, Q } = c;
    return (
      <figure className="question-figure question-figure-geo" aria-label={'Hình vẽ: ' + h.moTa}>
        <svg
          viewBox={`0 0 ${c.W} ${c.H}`}
          role="img"
          aria-hidden="true"
          style={{ width: 'min(100%, 340px)', maxWidth: '100%', height: 'auto', display: 'block', margin: '0 auto' }}
        >
          <path
            d={`M ${O.x - Rpx} ${O.y} a ${Rpx} ${Rpx} 0 1 0 ${2 * Rpx} 0 a ${Rpx} ${Rpx} 0 1 0 ${-2 * Rpx} 0 M ${O.x - rpx} ${O.y} a ${rpx} ${rpx} 0 1 0 ${2 * rpx} 0 a ${rpx} ${rpx} 0 1 0 ${-2 * rpx} 0`}
            fill={mau}
            fillOpacity={0.2}
            fillRule="evenodd"
            stroke={NET}
            strokeWidth={2.4}
          />
          <line x1={O.x} y1={O.y} x2={P.x} y2={P.y} stroke={NET} strokeWidth={nhan.duongKinhNgoai ? 1.3 : 1.8} strokeDasharray={nhan.duongKinhNgoai ? '4 3' : undefined} />
          <line x1={O.x} y1={O.y} x2={Q.x} y2={Q.y} stroke={NET} strokeWidth={nhan.duongKinhTrong ? 1.3 : 1.6} strokeDasharray="5 4" />
          {nhan.duongKinhNgoai && (
            <>
              <line x1={O.x - Rpx} y1={O.y} x2={O.x + Rpx} y2={O.y} stroke={NET} strokeWidth={1.6} strokeDasharray="5 4" />
              <So x={O.x + Rpx * 0.45} y={O.y + 14} t={nhan.duongKinhNgoai} />
            </>
          )}
          {nhan.duongKinhTrong && (
            <>
              <line x1={O.x - rpx} y1={O.y - 10} x2={O.x + rpx} y2={O.y - 10} stroke={mau} strokeWidth={1.6} strokeDasharray="4 3" />
              <So x={O.x} y={O.y - 22} t={nhan.duongKinhTrong} mau={mau} />
            </>
          )}
          <Cham p={O} />
          <Ten p={O} t="O" dx={8} dy={14} />
          {nhan.R && <So x={P.x + 8} y={P.y - 4} t={nhan.R} a="start" />}
          {nhan.r && <So x={(O.x + Q.x) / 2 + 6} y={(O.y + Q.y) / 2 + 16} t={nhan.r} a="middle" />}
          {nhan.doDay && <So x={O.x + (Rpx + rpx) / 2} y={O.y - 16} t={nhan.doDay} mau={mau} />}
        </svg>
        <figcaption className="sr-only">{h.moTa}</figcaption>
      </figure>
    );
  }

  const { O, Rpx, A, B, uOA, uOB, cungPath, quatPath, gPath, gocLabel, cungLabel, rLabel } = c;
  return (
    <figure className="question-figure question-figure-geo" aria-label={'Hình vẽ: ' + h.moTa}>
      <svg
        viewBox={`0 0 ${c.W} ${c.H}`}
        role="img"
        aria-hidden="true"
        style={{ width: 'min(100%, 340px)', maxWidth: '100%', height: 'auto', display: 'block', margin: '0 auto' }}
      >
        <circle cx={O.x} cy={O.y} r={Rpx} fill={NEN} stroke={NET} strokeWidth={2.2} strokeDasharray={c.kieu === 'quat' ? undefined : '4 4'} />
        {c.kieu === 'quat' && <path d={quatPath} fill={mau} fillOpacity={0.22} />}
        <path d={cungPath} fill="none" stroke={mau} strokeWidth={3.6} strokeLinecap="round" />
        <line x1={O.x} y1={O.y} x2={A.x} y2={A.y} stroke={NET} strokeWidth={2} />
        <line x1={O.x} y1={O.y} x2={B.x} y2={B.y} stroke={NET} strokeWidth={2} />
        {nhan.duongKinh && (
          <>
            <line x1={O.x - Rpx} y1={O.y} x2={O.x + Rpx} y2={O.y} stroke={NET} strokeWidth={1.6} strokeDasharray="5 4" />
            <So x={O.x + Rpx * 0.44} y={O.y + 18} t={nhan.duongKinh} />
          </>
        )}
        {h.veGocVuong ? (
          <Vuong p={O} u={uOA} v={uOB} k={12} />
        ) : (
          <path d={gPath} fill="none" stroke={NHAN} strokeWidth={2} />
        )}
        <Cham p={O} />
        <Ten p={O} t="O" dx={nhan.duongKinh ? -12 : 0} dy={nhan.duongKinh ? 14 : 16} />
        <Ten p={A} t="A" dx={-12} dy={-8} />
        <Ten p={B} t="B" dx={12} dy={-6} />
        <So x={gocLabel.x} y={gocLabel.y} t={nhan.goc} mau={NHAN} />
        <So x={cungLabel.x} y={cungLabel.y} t={nhan.cung} mau={mau} />
        {nhan.R && <So x={rLabel.x} y={rLabel.y} t={nhan.R} a="middle" />}
        {nhan.S && <So x={O.x} y={O.y + 38} t={nhan.S} mau={mau} />}
      </svg>
      <figcaption className="sr-only">{h.moTa}</figcaption>
    </figure>
  );
}

/** Mẫu đường tròn cũ giữ nguyên tương thích ngược cho các câu đã gắn từ đợt trước. */
function VeDuongTronCu({ h }: { h: DuongTronCu }) {
  const n = h.nhan ?? {};
  const O = { x: 180, y: 120 };
  const R = 88;
  const TO = mauTheoChuong(h.chuong ?? 'C5', 'var(--viz-c1, #3b82f6)');
  let ve: JSX.Element;
  if (h.mau === 'day') {
    const A = { x: O.x + R * Math.cos((215 * Math.PI) / 180), y: O.y - R * Math.sin((215 * Math.PI) / 180) };
    const B = { x: O.x + R * Math.cos((325 * Math.PI) / 180), y: O.y - R * Math.sin((325 * Math.PI) / 180) };
    const H = { x: O.x, y: A.y };
    ve = (
      <>
        <circle cx={O.x} cy={O.y} r={R} fill={NEN} stroke={NET} strokeWidth={2.5} />
        <line x1={A.x} y1={A.y} x2={B.x} y2={B.y} stroke={TO} strokeWidth={2.6} />
        <line x1={O.x} y1={O.y} x2={A.x} y2={A.y} stroke={NET} strokeWidth={1.6} />
        <line x1={O.x} y1={O.y} x2={H.x} y2={H.y} stroke={NET} strokeWidth={1.6} strokeDasharray="5 4" />
        <Vuong p={H} u={{ x: 1, y: 0 }} v={{ x: 0, y: -1 }} />
        <Cham p={O} />
        <Ten p={O} t="O" dy={-14} />
        <Ten p={A} t="A" dx={-12} dy={8} />
        <Ten p={B} t="B" dx={12} dy={8} />
        <Ten p={H} t="H" dy={16} />
        <So x={(O.x + A.x) / 2 - 10} y={(O.y + A.y) / 2 - 8} t={n.R} a="end" />
        <So x={O.x + 8} y={(O.y + H.y) / 2} t={n.d} a="start" />
        <So x={O.x + 50} y={A.y + 18} t={n.day} />
      </>
    );
  } else if (h.mau === 'goc-tam' || h.mau === 'quat') {
    const g = h.mau === 'quat' ? [30, 120] : [35, 145];
    const pDeg = (r: number, deg: number) => ({
      x: O.x + r * Math.cos((deg * Math.PI) / 180),
      y: O.y - r * Math.sin((deg * Math.PI) / 180),
    });
    const A = pDeg(R, g[1]);
    const B = pDeg(R, g[0]);
    const M = pDeg(R + 16, (g[0] + g[1]) / 2);
    const cung = `M ${A.x} ${A.y} A ${R} ${R} 0 0 1 ${B.x} ${B.y}`;
    ve = (
      <>
        <circle cx={O.x} cy={O.y} r={R} fill={NEN} stroke={NET} strokeWidth={2.5} />
        {h.mau === 'quat' && <path d={`M ${O.x} ${O.y} L ${A.x} ${A.y} A ${R} ${R} 0 0 1 ${B.x} ${B.y} Z`} fill={TO} fillOpacity={0.22} />}
        <path d={cung} fill="none" stroke={TO} strokeWidth={4} />
        <line x1={O.x} y1={O.y} x2={A.x} y2={A.y} stroke={NET} strokeWidth={1.8} />
        <line x1={O.x} y1={O.y} x2={B.x} y2={B.y} stroke={NET} strokeWidth={1.8} />
        <path d={`M ${pDeg(24, g[1]).x} ${pDeg(24, g[1]).y} A 24 24 0 0 1 ${pDeg(24, g[0]).x} ${pDeg(24, g[0]).y}`} fill="none" stroke={NHAN} strokeWidth={2} />
        <Cham p={O} />
        <Ten p={O} t="O" dy={16} />
        <Ten p={A} t="A" dx={-12} dy={-6} />
        <Ten p={B} t="B" dx={12} dy={-6} />
        <So x={O.x} y={O.y - 38} t={n.goc} />
        <So x={M.x} y={M.y - 4} t={n.cung} />
        <So x={(O.x + B.x) / 2 + 12} y={(O.y + B.y) / 2 + 10} t={n.R} a="start" />
      </>
    );
  } else if (h.mau === 'vanh-khuyen') {
    const r = 48;
    const pDeg = (rad: number, deg: number) => ({
      x: O.x + rad * Math.cos((deg * Math.PI) / 180),
      y: O.y - rad * Math.sin((deg * Math.PI) / 180),
    });
    const P = pDeg(R, 30);
    const Q = pDeg(r, 200);
    ve = (
      <>
        <path
          d={`M ${O.x - R} ${O.y} a ${R} ${R} 0 1 0 ${2 * R} 0 a ${R} ${R} 0 1 0 ${-2 * R} 0 M ${O.x - r} ${O.y} a ${r} ${r} 0 1 0 ${2 * r} 0 a ${r} ${r} 0 1 0 ${-2 * r} 0`}
          fill={TO}
          fillOpacity={0.22}
          fillRule="evenodd"
          stroke={NET}
          strokeWidth={2.5}
        />
        <line x1={O.x} y1={O.y} x2={P.x} y2={P.y} stroke={NET} strokeWidth={1.6} />
        <line x1={O.x} y1={O.y} x2={Q.x} y2={Q.y} stroke={NET} strokeWidth={1.6} strokeDasharray="5 4" />
        <Cham p={O} />
        <Ten p={O} t="O" dx={6} dy={14} />
        <So x={(O.x + P.x) / 2 + 4} y={(O.y + P.y) / 2 - 12} t={n.R} a="start" />
        <So x={(O.x + Q.x) / 2 - 4} y={(O.y + Q.y) / 2 + 14} t={n.r} a="end" />
      </>
    );
  } else if (h.mau === 'tiep-tuyen') {
    const O2 = { x: 105, y: 150 };
    const r = 72;
    const A = { x: O2.x, y: O2.y - r };
    const M = { x: 305, y: A.y };
    const dm = Math.hypot(M.x - O2.x, M.y - O2.y);
    const B = { x: O2.x + ((M.x - O2.x) * r) / dm, y: O2.y + ((M.y - O2.y) * r) / dm };
    ve = (
      <>
        <circle cx={O2.x} cy={O2.y} r={r} fill={NEN} stroke={NET} strokeWidth={2.5} />
        <line x1={A.x - 30} y1={A.y} x2={M.x + 15} y2={M.y} stroke={TO} strokeWidth={2.5} />
        <line x1={O2.x} y1={O2.y} x2={A.x} y2={A.y} stroke={NET} strokeWidth={1.6} />
        <line x1={O2.x} y1={O2.y} x2={M.x} y2={M.y} stroke={NET} strokeWidth={1.6} />
        <Vuong p={A} u={{ x: 1, y: 0 }} v={{ x: 0, y: 1 }} />
        <Cham p={O2} />
        <Ten p={O2} t="O" dx={-12} dy={6} />
        <Ten p={A} t="A" dx={-10} dy={-12} />
        <Ten p={M} t="M" dx={10} dy={-12} />
        {h.diemB && (
          <>
            <Cham p={B} />
            <Ten p={B} t="B" dx={2} dy={16} />
          </>
        )}
        <So x={O2.x - 8} y={(O2.y + A.y) / 2} t={n.R} a="end" />
        <So x={(A.x + M.x) / 2} y={A.y - 14} t={n.MA} />
        <So x={(O2.x + M.x) / 2 + 22} y={(O2.y + M.y) / 2 + 16} t={n.OM} a="start" />
        {h.diemB && <So x={(B.x + M.x) / 2 + 6} y={(B.y + M.y) / 2 + 16} t={n.MB} a="start" />}
        {n.goc && <So x={O2.x + 22} y={O2.y - 30} t={n.goc} a="start" />}
      </>
    );
  } else if (h.mau === 'hai-tiep-tuyen') {
    const O2 = { x: 110, y: 120 };
    const r = 62;
    const M = { x: 315, y: 120 };
    const dm = M.x - O2.x;
    const t = Math.acos(r / dm);
    const A = { x: O2.x + r * Math.cos(t), y: O2.y - r * Math.sin(t) };
    const B = { x: A.x, y: O2.y + r * Math.sin(t) };
    ve = (
      <>
        <circle cx={O2.x} cy={O2.y} r={r} fill={NEN} stroke={NET} strokeWidth={2.5} />
        <line x1={M.x} y1={M.y} x2={A.x} y2={A.y} stroke={TO} strokeWidth={2.5} />
        <line x1={M.x} y1={M.y} x2={B.x} y2={B.y} stroke={TO} strokeWidth={2.5} />
        <line x1={O2.x} y1={O2.y} x2={A.x} y2={A.y} stroke={NET} strokeWidth={1.6} />
        <line x1={O2.x} y1={O2.y} x2={B.x} y2={B.y} stroke={NET} strokeWidth={1.6} />
        <line x1={O2.x} y1={O2.y} x2={M.x} y2={M.y} stroke={NET} strokeWidth={1.4} strokeDasharray="5 4" />
        {n.day && <line x1={A.x} y1={A.y} x2={B.x} y2={B.y} stroke={NET} strokeWidth={1.4} />}
        <Cham p={O2} />
        <Ten p={O2} t="O" dx={-12} dy={0} />
        <Ten p={A} t="A" dx={-4} dy={-14} />
        <Ten p={B} t="B" dx={-4} dy={14} />
        <Ten p={M} t="M" dx={14} dy={0} />
        <So x={(A.x + M.x) / 2 + 6} y={(A.y + M.y) / 2 - 14} t={n.MA} />
        <So x={O2.x + 2} y={O2.y + 36} t={n.R} a="end" />
        <So x={M.x - 52} y={M.y - 8} t={n.goc} a="end" />
        <So x={(O2.x + M.x) / 2 + 30} y={M.y + 14} t={n.OM} />
        <So x={A.x + 8} y={O2.y + 18} t={n.day} a="start" />
      </>
    );
  } else {
    const O1 = { x: 128, y: 120 };
    const O2 = { x: 232, y: 120 };
    const r = 72;
    // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
    const hy = Math.sqrt(r * r - 52 * 52);
    const A = { x: 180, y: 120 - hy };
    const B = { x: 180, y: 120 + hy };
    const H = { x: 180, y: 120 };
    ve = (
      <>
        <circle cx={O1.x} cy={O1.y} r={r} fill="none" stroke={NET} strokeWidth={2.5} />
        <circle cx={O2.x} cy={O2.y} r={r} fill="none" stroke={NET} strokeWidth={2.5} />
        <line x1={O1.x} y1={O1.y} x2={O2.x} y2={O2.y} stroke={NET} strokeWidth={1.6} />
        <line x1={A.x} y1={A.y} x2={B.x} y2={B.y} stroke={TO} strokeWidth={2.6} />
        <line x1={O1.x} y1={O1.y} x2={A.x} y2={A.y} stroke={NET} strokeWidth={1.4} strokeDasharray="5 4" />
        <Vuong p={H} u={{ x: 1, y: 0 }} v={{ x: 0, y: -1 }} />
        <Cham p={O1} />
        <Cham p={O2} />
        <Ten p={O1} t="O" dx={-4} dy={16} />
        <Ten p={O2} t="O′" dx={4} dy={16} />
        <Ten p={A} t="A" dy={-12} />
        <Ten p={B} t="B" dy={14} />
        <Ten p={H} t="H" dx={10} dy={14} />
        <So x={(O1.x + A.x) / 2 - 8} y={(O1.y + A.y) / 2 - 6} t={n.R} a="end" />
        <So x={180} y={B.y + 30} t={n.d} />
        <So x={A.x + 12} y={(A.y + H.y) / 2} t={n.day} a="start" />
      </>
    );
  }
  return (
    <figure className="question-figure question-figure-geo" aria-label={'Hình vẽ: ' + h.moTa}>
      <svg viewBox="0 0 360 240" role="img" aria-hidden="true" style={{ width: 'min(100%, 340px)', maxWidth: '100%', height: 'auto', display: 'block', margin: '0 auto' }}>
        {ve}
      </svg>
      <figcaption className="sr-only">{h.moTa}</figcaption>
    </figure>
  );
}

/**
 * Component React `QuestionFigure`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export default function QuestionFigure({ hinh }: { hinh?: unknown }) {
  if (!hinhHopLe(hinh)) return null;
  if (hinh.loai === 'quat') return <BieuDoQuat h={hinh} />;
  if (hinh.loai === 'doan-thang') return <BieuDoDoanThang h={hinh} />;
  if (hinh.loai === 'tam-giac-vuong') return <VeTamGiacVuong h={hinh} />;
  if (hinh.loai === 'duong-tron-day') return <VeDuongTronDay h={hinh} />;
  if (hinh.loai === 'tiep-tuyen') return <VeTiepTuyen h={hinh} />;
  if (hinh.loai === 'hai-duong-tron') return <VeHaiDuongTron h={hinh} />;
  if (hinh.loai === 'quat-vanh-khuyen') return <VeQuatVanhKhuyen h={hinh} />;
  if (hinh.loai === 'duong-tron') return <VeDuongTronCu h={hinh} />;
  return <HinhVeHinhHoc h={hinh} />;
}
