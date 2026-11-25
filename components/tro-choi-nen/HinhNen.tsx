import { hinhCuaMuc } from '@/lib/dfle/t9-hinh-nen.js';
import QuestionFigure from '@/components/QuestionFigure';
import { docHinhHinhHocCau } from '@/lib/hinhTroChoi';
import ToaDoSinhDong, { docHinhCau } from './ToaDoSinhDong';
import HinhToanDong, { coHinhToanDong } from '@/components/truc-quan/HinhToanDong';

/**
 * Hình nhắc lại kiến thức nền, hiện trên trò chơi ôn nền.
 * Mọi hình vẽ bằng SVG từ dữ liệu (lib/dfle/t9-hinh-nen.js), không dùng ảnh.
 */
type H = Record<string, any>;
const MAU = { duong: '#334155', nhat: '#cbd5e1', xanh: '#2563eb', cam: '#ea580c', la: '#16a34a', do: '#dc2626', tim: '#7c3aed', nen: '#eff6ff' };

const Mui = ({ id, c = MAU.duong }: { id: string; c?: string }) => (
  <marker id={id} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill={c} /></marker>
);
const Ch = ({ x, y, t, c = MAU.duong, s = 13, a = 'middle', b = false }: { x: number; y: number; t: string; c?: string; s?: number; a?: 'start' | 'middle' | 'end'; b?: boolean }) => (
  <text x={x} y={y} fill={c} fontSize={s} textAnchor={a} fontWeight={b ? 700 : 400}>{t}</text>
);
const Diem = ({ x, y, c = MAU.duong }: { x: number; y: number; c?: string }) => <circle cx={x} cy={y} r={3.5} fill={c} />;
/** Kí hiệu góc vuông tại (x, y) với hai hướng đơn vị (ux, uy), (vx, vy). */
const GocVuong = ({ x, y, u, v, k = 11 }: { x: number; y: number; u: [number, number]; v: [number, number]; k?: number }) => (
  <path d={`M${x + u[0] * k} ${y + u[1] * k}L${x + u[0] * k + v[0] * k} ${y + u[1] * k + v[1] * k}L${x + v[0] * k} ${y + v[1] * k}`} fill="none" stroke={MAU.duong} strokeWidth={1.3} />
);
/** Cung đánh dấu góc tại đỉnh (x, y), từ góc a1 đến a2 (độ, chiều toán học, trục y hướng lên). */
function cung(x: number, y: number, r: number, a1: number, a2: number) {
  const p = (a: number) => [x + r * Math.cos((a * Math.PI) / 180), y - r * Math.sin((a * Math.PI) / 180)];
  const [x1, y1] = p(a1), [x2, y2] = p(a2);
  return `M${x1} ${y1}A${r} ${r} 0 ${Math.abs(a2 - a1) > 180 ? 1 : 0} 0 ${x2} ${y2}`;
}
const so = (n: number) => String(n).replace('-', '−').replace('.', ',');

function ToaDo({ h }: { h: H }) {
  const O = 140, U = 22, px = (x: number) => O + x * U, py = (y: number) => 130 - y * U;
  const ds = Array.from({ length: 11 }, (_, i) => i - 5);
  return (
    <svg viewBox="0 0 280 260" className="hn-svg">
      <defs><Mui id="td-m" /></defs>
      {ds.map((i) => <g key={i}><line x1={px(i)} x2={px(i)} y1={py(5)} y2={py(-5)} stroke="#eef2f7" /><line y1={py(i)} y2={py(i)} x1={px(-5)} x2={px(5)} stroke="#eef2f7" /></g>)}
      {h.gocPhanTu && <g fill="#94a3b8" fontSize={13} fontWeight={700}><text x={px(3)} y={py(4.3)}>I</text><text x={px(-3.6)} y={py(4.3)}>II</text><text x={px(-3.8)} y={py(-4)}>III</text><text x={px(3)} y={py(-4)}>IV</text></g>}
      <line x1={px(-5.3)} x2={px(5.4)} y1={py(0)} y2={py(0)} stroke={MAU.duong} strokeWidth={1.4} markerEnd="url(#td-m)" />
      <line y1={py(-5.3)} y2={py(5.4)} x1={px(0)} x2={px(0)} stroke={MAU.duong} strokeWidth={1.4} markerEnd="url(#td-m)" />
      <Ch x={px(5.3)} y={py(0) + 16} t="x" s={13} /><Ch x={px(0) - 10} y={py(5.2)} t="y" s={13} /><Ch x={px(0) - 9} y={py(0) + 15} t="O" s={12} />
      {[-4, -2, 2, 4].map((i) => <g key={i}><Ch x={px(i)} y={py(0) + 15} t={so(i)} s={10} c="#64748b" /><Ch x={px(0) - 7} y={py(i) + 4} t={so(i)} s={10} c="#64748b" a="end" /></g>)}
      {h.duong && (() => { const [a, b, c, nhan] = h.duong; const y = (x: number) => (c - a * x) / b;
        return <g><line x1={px(-3)} y1={py(y(-3))} x2={px(5)} y2={py(y(5))} stroke={MAU.xanh} strokeWidth={2.5} /><Ch x={px(2.6)} y={py(y(3.6)) + 10} t={nhan} c={MAU.xanh} b a="end" s={14} /></g>; })()}
      {(h.doiXung ?? []).map(([i, j]: number[]) => <line key={i} x1={px(h.diem[i][0])} y1={py(h.diem[i][1])} x2={px(h.diem[j][0])} y2={py(h.diem[j][1])} stroke={MAU.cam} strokeDasharray="4 3" />)}
      {h.diem.map(([x, y, t]: [number, number, string], k: number) => (
        <g key={k}>
          {!h.duong && x !== 0 && y !== 0 && <path d={`M${px(x)} ${py(0)}V${py(y)}H${px(0)}`} fill="none" stroke="#94a3b8" strokeDasharray="3 3" />}
          <Diem x={px(x)} y={py(y)} c={MAU.do} />
          <Ch x={px(x) + (x < 0 || x >= 4 ? -6 : 6)} y={py(y) + (y < 0 ? 16 : y === 0 && x >= 4 ? -8 : -6)} t={`${t}(${so(x)}; ${so(y)})`} s={11} a={x < 0 || x >= 4 ? 'end' : 'start'} c={MAU.do} b />
        </g>
      ))}
    </svg>
  );
}

function TamGiacVuong({ h }: { h: H }) {
  const A = [70, 190], B = [310, 190], C = [70, 50];
  return (
    <svg viewBox="0 0 400 230" className="hn-svg">
      <polygon points={`${A} ${B} ${C}`} fill={MAU.nen} stroke={MAU.duong} strokeWidth={2} />
      <GocVuong x={A[0]} y={A[1]} u={[1, 0]} v={[0, -1]} k={14} />
      <Ch x={A[0] - 14} y={A[1] + 16} t="A" b /><Ch x={B[0] + 12} y={B[1] + 16} t="B" b /><Ch x={C[0] - 14} y={C[1]} t="C" b />
      {h.goc === 'B' && <path d={cung(B[0], B[1], 34, 150, 180)} fill="none" stroke={MAU.cam} strokeWidth={2.5} />}
      {h.tenCanh ? <>
        <Ch x={(A[0] + B[0]) / 2} y={A[1] + 20} t="cạnh kề của góc B" c={MAU.la} b s={12} />
        <Ch x={A[0] - 10} y={(A[1] + C[1]) / 2} t="cạnh đối" c={MAU.cam} b s={12} a="end" />
        <Ch x={(B[0] + C[0]) / 2 + 22} y={(B[1] + C[1]) / 2 - 8} t="cạnh huyền" c={MAU.tim} b s={12} a="start" />
        <path d="M120 190H310" stroke={MAU.la} strokeWidth={4} /><path d="M70 190V50" stroke={MAU.cam} strokeWidth={4} /><path d="M70 50L310 190" stroke={MAU.tim} strokeWidth={4} />
      </> : <Ch x={(B[0] + C[0]) / 2 + 22} y={(B[1] + C[1]) / 2 - 8} t="cạnh huyền" c={MAU.tim} b s={12} a="start" />}
      {h.trungDiem && <><Diem x={(B[0] + C[0]) / 2} y={(B[1] + C[1]) / 2} c={MAU.do} /><Ch x={(B[0] + C[0]) / 2 - 6} y={(B[1] + C[1]) / 2 + 18} t="M" c={MAU.do} b /></>}
      {(h.ghi ?? []).map((g: string, i: number) => <Ch key={g} x={385} y={60 + i * 22} t={g} a="end" s={15} b c={MAU.xanh} />)}
    </svg>
  );
}

function TamGiacDacBiet() {
  return (
    <svg viewBox="0 0 480 190" className="hn-svg">
      <polygon points="20,160 140,160 80,56" fill={MAU.nen} stroke={MAU.duong} strokeWidth={2} />
      <Ch x={80} y={112} t="60°" s={11} /><Ch x={38} y={154} t="60°" s={11} /><Ch x={122} y={154} t="60°" s={11} />
      <Ch x={80} y={182} t="Tam giác đều" b s={12} />
      <polygon points="180,160 290,160 180,50" fill={MAU.nen} stroke={MAU.duong} strokeWidth={2} />
      <GocVuong x={180} y={160} u={[1, 0]} v={[0, -1]} /><Ch x={262} y={154} t="45°" s={11} /><Ch x={194} y={84} t="45°" s={11} />
      <Ch x={235} y={182} t="Vuông cân" b s={12} />
      <polygon points="330,160 460,160 330,85" fill={MAU.nen} stroke={MAU.duong} strokeWidth={2} />
      <GocVuong x={330} y={160} u={[1, 0]} v={[0, -1]} /><Ch x={428} y={154} t="30°" s={11} /><Ch x={344} y={110} t="60°" s={11} />
      <path d="M330 160V85" stroke={MAU.cam} strokeWidth={4} /><Ch x={322} y={128} t="a" c={MAU.cam} b a="end" /><Ch x={402} y={114} t="2a" c={MAU.tim} b />
      <Ch x={395} y={182} t="Nửa tam giác đều" b s={12} />
    </svg>
  );
}

function GocPhu() {
  const O = [90, 170];
  return (
    <svg viewBox="0 0 340 200" className="hn-svg">
      <line x1={O[0]} y1={O[1]} x2={300} y2={O[1]} stroke={MAU.duong} strokeWidth={2} /><line x1={O[0]} y1={O[1]} x2={O[0]} y2={20} stroke={MAU.duong} strokeWidth={2} />
      <line x1={O[0]} y1={O[1]} x2={O[0] + 180 * Math.cos(Math.PI / 6)} y2={O[1] - 180 * Math.sin(Math.PI / 6)} stroke={MAU.xanh} strokeWidth={2} />
      <GocVuong x={O[0]} y={O[1]} u={[1, 0]} v={[0, -1]} k={12} />
      <path d={cung(O[0], O[1], 55, 0, 30)} fill="none" stroke={MAU.cam} strokeWidth={2.5} /><Ch x={O[0] + 72} y={O[1] - 12} t="α" c={MAU.cam} b s={16} />
      <path d={cung(O[0], O[1], 45, 30, 90)} fill="none" stroke={MAU.la} strokeWidth={2.5} /><Ch x={O[0] + 28} y={O[1] - 60} t="β" c={MAU.la} b s={16} />
      <Ch x={310} y={60} t="α + β = 90°" b c={MAU.xanh} s={16} a="end" />
    </svg>
  );
}

function DuongTron() {
  return (
    <svg viewBox="0 0 340 220" className="hn-svg">
      <circle cx={105} cy={110} r={85} fill={MAU.nen} stroke={MAU.duong} strokeWidth={2} />
      <line x1={20} y1={110} x2={190} y2={110} stroke={MAU.xanh} strokeWidth={2.5} />
      <line x1={105} y1={110} x2={105 + 85 * Math.cos(1)} y2={110 - 85 * Math.sin(1)} stroke={MAU.cam} strokeWidth={2.5} />
      <Diem x={105} y={110} /><Ch x={103} y={128} t="O" b />
      <Ch x={125} y={70} t="R" c={MAU.cam} b s={15} /><Ch x={58} y={102} t="d = 2R" c={MAU.xanh} b s={13} />
      <Ch x={210} y={90} t="Tâm O" a="start" s={14} /><Ch x={210} y={115} t="Bán kính R" a="start" s={14} c={MAU.cam} /><Ch x={210} y={140} t="Đường kính d = 2R" a="start" s={14} c={MAU.xanh} />
    </svg>
  );
}

function DoiXungTam() {
  return (
    <svg viewBox="0 0 340 200" className="hn-svg">
      <polygon points="60,160 230,160 290,50 120,50" fill={MAU.nen} stroke={MAU.duong} strokeWidth={2} />
      <line x1={60} y1={160} x2={290} y2={50} stroke={MAU.cam} strokeDasharray="5 4" /><line x1={230} y1={160} x2={120} y2={50} stroke={MAU.cam} strokeDasharray="5 4" />
      <Diem x={175} y={105} c={MAU.do} /><Ch x={175} y={128} t="O" b c={MAU.do} />
      <Ch x={50} y={176} t="A" b /><Ch x={240} y={176} t="B" b /><Ch x={300} y={46} t="C" b /><Ch x={112} y={44} t="D" b />
      <Ch x={330} y={190} t="OA = OC, OB = OD" a="end" s={13} c={MAU.xanh} b />
    </svg>
  );
}

function LoaiGoc() {
  const g = [[0, 50, 'Góc nhọn', '< 90°'], [1, 90, 'Góc vuông', '= 90°'], [2, 130, 'Góc tù', '> 90°'], [3, 180, 'Góc bẹt', '= 180°']] as const;
  return (
    <svg viewBox="0 0 480 150" className="hn-svg">
      {g.map(([i, a, t, s]) => { const x = 40 + i * 118, y = 100, r = 60;
        return <g key={i}>
          <line x1={x} y1={y} x2={x + r} y2={y} stroke={MAU.duong} strokeWidth={2} />
          <line x1={x} y1={y} x2={x + r * Math.cos((a * Math.PI) / 180)} y2={y - r * Math.sin((a * Math.PI) / 180)} stroke={MAU.duong} strokeWidth={2} />
          {a === 90 ? <GocVuong x={x} y={y} u={[1, 0]} v={[0, -1]} /> : <path d={cung(x, y, 18, 0, a)} fill="none" stroke={MAU.cam} strokeWidth={2} />}
          <Ch x={x + 20} y={130} t={t} b s={12} /><Ch x={x + 20} y={146} t={s} s={12} c={MAU.xanh} />
        </g>; })}
    </svg>
  );
}

function GocOTam({ h }: { h: H }) {
  const O = [100, 115], R = 80, a1 = 20, a2 = 110;
  const P = (a: number) => [O[0] + R * Math.cos((a * Math.PI) / 180), O[1] - R * Math.sin((a * Math.PI) / 180)];
  const A = P(a1), B = P(a2), M = P(250);
  return (
    <svg viewBox="0 0 360 220" className="hn-svg">
      <circle cx={O[0]} cy={O[1]} r={R} fill="none" stroke={MAU.duong} strokeWidth={2} />
      <path d={cung(O[0], O[1], R, a1, a2)} fill="none" stroke={MAU.cam} strokeWidth={5} />
      <polyline points={`${A} ${O} ${B}`} fill="none" stroke={MAU.xanh} strokeWidth={2} />
      <path d={cung(O[0], O[1], 22, a1, a2)} fill="none" stroke={MAU.xanh} strokeWidth={2} />
      <Diem x={O[0]} y={O[1]} /><Ch x={O[0] + 4} y={O[1] + 18} t="O" b />
      <Ch x={A[0] + 12} y={A[1]} t="A" b /><Ch x={B[0] - 8} y={B[1] - 8} t="B" b />
      {h.noiTiep && <><polyline points={`${A} ${M} ${B}`} fill="none" stroke={MAU.la} strokeWidth={2} /><Ch x={M[0] - 4} y={M[1] + 18} t="M" b /></>}
      <Ch x={200} y={60} t="Góc ở tâm AOB = α" a="start" s={13} c={MAU.xanh} b />
      <Ch x={200} y={84} t="Cung nhỏ AB = α" a="start" s={13} c={MAU.cam} b />
      <Ch x={200} y={108} t="Cung lớn AB = 360° − α" a="start" s={13} />
      {h.noiTiep && <Ch x={200} y={132} t="Góc nội tiếp AMB = α : 2" a="start" s={13} c={MAU.la} b />}
    </svg>
  );
}

function ChuViDienTich({ h }: { h: H }) {
  return (
    <svg viewBox="0 0 340 210" className="hn-svg">
      <circle cx={110} cy={105} r={85} fill={h.dienTich ? '#dbeafe' : 'none'} stroke={h.dienTich ? MAU.duong : MAU.cam} strokeWidth={h.dienTich ? 2 : 4} />
      {h.dienTich && <path d="M110 105L195 105A85 85 0 0 0 110 20Z" fill="#93c5fd" stroke={MAU.duong} />}
      <line x1={110} y1={105} x2={195} y2={105} stroke={MAU.duong} strokeWidth={2} /><Diem x={110} y={105} /><Ch x={150} y={122} t="R" b />
      <Ch x={330} y={90} t={h.dienTich ? 'S = πR²' : 'C = 2πR = πd'} a="end" s={18} b c={h.dienTich ? MAU.xanh : MAU.cam} />
      {h.dienTich && <Ch x={330} y={118} t="¼ hình tròn = πR² : 4" a="end" s={13} />}
    </svg>
  );
}

function VanhKhuyen() {
  return (
    <svg viewBox="0 0 340 210" className="hn-svg">
      <circle cx={110} cy={105} r={90} fill="#bfdbfe" stroke={MAU.duong} strokeWidth={2} /><circle cx={110} cy={105} r={50} fill="#fff" stroke={MAU.duong} strokeWidth={2} />
      <line x1={110} y1={105} x2={110 + 90 * Math.cos(-0.5)} y2={105 - 90 * Math.sin(-0.5)} stroke={MAU.cam} strokeWidth={2} />
      <line x1={110} y1={105} x2={110 - 50} y2={105} stroke={MAU.la} strokeWidth={2} />
      <Ch x={168} y={128} t="R" c={MAU.cam} b /><Ch x={85} y={100} t="r" c={MAU.la} b />
      <Ch x={330} y={95} t="S = πR² − πr²" a="end" s={17} b c={MAU.xanh} />
    </svg>
  );
}

function KhoangCach() {
  return (
    <svg viewBox="0 0 360 200" className="hn-svg">
      <line x1={20} y1={160} x2={340} y2={160} stroke={MAU.duong} strokeWidth={2} /><Ch x={340} y={178} t="d" b a="end" />
      <line x1={170} y1={40} x2={170} y2={160} stroke={MAU.xanh} strokeWidth={3} />
      <line x1={170} y1={40} x2={70} y2={160} stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 4" /><line x1={170} y1={40} x2={300} y2={160} stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 4" />
      <GocVuong x={170} y={160} u={[1, 0]} v={[0, -1]} />
      <Diem x={170} y={40} /><Ch x={170} y={30} t="M" b /><Ch x={160} y={178} t="H" b /><Ch x={70} y={178} t="A" b /><Ch x={300} y={178} t="B" b />
      <Ch x={162} y={115} t="khoảng cách MH" c={MAU.xanh} b s={12} a="end" />
      <Ch x={350} y={60} t="MH < MA, MH < MB" a="end" s={13} b c={MAU.xanh} />
    </svg>
  );
}

function TiepTuyen() {
  const O = [100, 120], R = 70, A = [100, 50];
  return (
    <svg viewBox="0 0 360 210" className="hn-svg">
      <circle cx={O[0]} cy={O[1]} r={R} fill="none" stroke={MAU.duong} strokeWidth={2} />
      <line x1={20} y1={50} x2={340} y2={50} stroke={MAU.duong} strokeWidth={2} />
      <polygon points={`${O} ${A} 290,50`} fill="#dbeafe" stroke={MAU.xanh} strokeWidth={2} />
      <GocVuong x={A[0]} y={A[1]} u={[1, 0]} v={[0, 1]} />
      <Diem x={O[0]} y={O[1]} /><Ch x={O[0] - 10} y={O[1] + 18} t="O" b /><Ch x={A[0] - 6} y={A[1] - 8} t="A" b /><Ch x={292} y={42} t="M" b />
      <Ch x={84} y={92} t="R" c={MAU.cam} b />
      <Ch x={350} y={140} t="OM² = OA² + AM²" a="end" s={14} b c={MAU.xanh} />
    </svg>
  );
}

function TrungTrucPhanGiac() {
  return (
    <svg viewBox="0 0 480 200" className="hn-svg">
      <line x1={30} y1={150} x2={210} y2={150} stroke={MAU.duong} strokeWidth={2} /><Diem x={30} y={150} /><Diem x={210} y={150} />
      <Ch x={24} y={170} t="A" b /><Ch x={216} y={170} t="B" b />
      <line x1={120} y1={20} x2={120} y2={180} stroke={MAU.xanh} strokeWidth={2.5} /><GocVuong x={120} y={150} u={[1, 0]} v={[0, -1]} />
      <Diem x={120} y={60} c={MAU.do} /><Ch x={130} y={56} t="M" b c={MAU.do} a="start" />
      <line x1={120} y1={60} x2={30} y2={150} stroke={MAU.cam} strokeDasharray="4 3" /><line x1={120} y1={60} x2={210} y2={150} stroke={MAU.cam} strokeDasharray="4 3" />
      <Ch x={120} y={196} t="MA = MB" b c={MAU.cam} s={12} />
      <line x1={270} y1={160} x2={460} y2={160} stroke={MAU.duong} strokeWidth={2} />
      <line x1={270} y1={160} x2={270 + 190 * Math.cos(1.05)} y2={160 - 190 * Math.sin(1.05)} stroke={MAU.duong} strokeWidth={2} />
      <line x1={270} y1={160} x2={270 + 190 * Math.cos(0.525)} y2={160 - 190 * Math.sin(0.525)} stroke={MAU.xanh} strokeWidth={2.5} />
      <path d={cung(270, 160, 40, 0, 30)} fill="none" stroke={MAU.cam} strokeWidth={2} /><path d={cung(270, 160, 46, 30, 60)} fill="none" stroke={MAU.cam} strokeWidth={2} />
      <Ch x={262} y={176} t="O" b /><Ch x={365} y={196} t="tia phân giác chia đôi góc" b c={MAU.xanh} s={12} />
    </svg>
  );
}

function ViTriDuongThang() {
  const p = [['cắt nhau', 'd < R', 40], ['tiếp xúc', 'd = R', 60], ['không giao', 'd > R', 80]] as const;
  return (
    <svg viewBox="0 0 480 190" className="hn-svg">
      {p.map(([t, s, dy], i) => { const cx = 80 + i * 160, cy = 85; return <g key={i}>
        <circle cx={cx} cy={cy} r={60} fill="none" stroke={MAU.duong} strokeWidth={2} />
        <line x1={cx - 75} y1={cy + dy} x2={cx + 75} y2={cy + dy} stroke={MAU.xanh} strokeWidth={2.5} />
        <line x1={cx} y1={cy} x2={cx} y2={cy + dy} stroke={MAU.cam} strokeDasharray="4 3" /><Diem x={cx} y={cy} />
        <Ch x={cx} y={176} t={`${t}: ${s}`} b s={12} /></g>; })}
    </svg>
  );
}

function HaiDuongTron() {
  const p = [['tiếp xúc ngoài', 'OO′ = R + r', 60], ['cắt nhau', 'R − r < OO′ < R + r', 40], ['tiếp xúc trong', 'OO′ = R − r', 20]] as const;
  return (
    <svg viewBox="0 0 480 180" className="hn-svg">
      {p.map(([t, s, k], i) => { const cx = 60 + i * 160, cy = 80; return <g key={i}>
        <circle cx={cx} cy={cy} r={40} fill="none" stroke={MAU.duong} strokeWidth={2} />
        <circle cx={cx + k} cy={cy} r={20} fill="none" stroke={MAU.xanh} strokeWidth={2} />
        <Diem x={cx} y={cy} /><Diem x={cx + k} y={cy} c={MAU.xanh} />
        <Ch x={cx + 20} y={145} t={t} b s={12} /><Ch x={cx + 20} y={163} t={s} s={11} c={MAU.xanh} /></g>; })}
    </svg>
  );
}

function BieuDo({ h }: { h: H }) {
  const cot = [3, 5, 2, 4];
  return (
    <svg viewBox="0 0 480 170" className="hn-svg">
      <line x1={20} y1={140} x2={140} y2={140} stroke={MAU.duong} /><line x1={20} y1={140} x2={20} y2={20} stroke={MAU.duong} />
      {cot.map((v, i) => <rect key={i} x={30 + i * 27} y={140 - v * 22} width={18} height={v * 22} fill={MAU.xanh} />)}
      <Ch x={80} y={162} t="Biểu đồ cột" b s={12} />
      <line x1={180} y1={140} x2={300} y2={140} stroke={MAU.duong} /><line x1={180} y1={140} x2={180} y2={20} stroke={MAU.duong} />
      <polyline points={cot.map((v, i) => `${195 + i * 30},${140 - v * 22}`).join(' ')} fill="none" stroke={MAU.cam} strokeWidth={2.5} />
      {cot.map((v, i) => <Diem key={i} x={195 + i * 30} y={140 - v * 22} c={MAU.cam} />)}
      <Ch x={240} y={162} t="Biểu đồ đoạn thẳng" b s={12} />
      {h.quat ? <><circle cx={400} cy={80} r={60} fill="#dbeafe" stroke={MAU.duong} /><path d="M400 80L460 80A60 60 0 0 0 400 20Z" fill={MAU.xanh} /><path d="M400 80L400 20A60 60 0 0 0 340 80Z" fill="#93c5fd" />
        <Ch x={400} y={162} t="Biểu đồ hình quạt tròn" b s={12} /></> : <><g fontSize={18}>{[0, 1, 2].map((r) => <text key={r} x={350} y={45 + r * 35}>{'🍎'.repeat(3 - r)}</text>)}</g><Ch x={400} y={162} t="Biểu đồ tranh" b s={12} /></>}
    </svg>
  );
}

function HinhQuat() {
  return (
    <svg viewBox="0 0 340 200" className="hn-svg">
      <circle cx={110} cy={100} r={85} fill="#e2e8f0" stroke={MAU.duong} strokeWidth={2} />
      <path d="M110 100L195 100A85 85 0 0 0 110 15Z" fill={MAU.xanh} stroke="#fff" strokeWidth={2} />
      <path d="M110 100L110 15A85 85 0 0 0 25 100Z" fill="#93c5fd" stroke="#fff" strokeWidth={2} />
      <path d="M110 100L25 100A85 85 0 0 0 195 100Z" fill="#cbd5e1" stroke="#fff" strokeWidth={2} />
      <Ch x={142} y={68} t="25%" b c="#fff" /><Ch x={78} y={68} t="25%" b /><Ch x={110} y={150} t="50%" b />
      <Ch x={330} y={80} t="25% ↔ 90°" a="end" s={15} b c={MAU.xanh} /><Ch x={330} y={106} t="50% ↔ 180°" a="end" s={15} b /><Ch x={330} y={132} t="100% ↔ 360°" a="end" s={15} b />
    </svg>
  );
}

function XucXac() {
  const cham: Record<number, [number, number][]> = { 1: [[1, 1]], 2: [[0, 0], [2, 2]], 3: [[0, 0], [1, 1], [2, 2]], 4: [[0, 0], [2, 0], [0, 2], [2, 2]], 5: [[0, 0], [2, 0], [1, 1], [0, 2], [2, 2]], 6: [[0, 0], [0, 1], [0, 2], [2, 0], [2, 1], [2, 2]] };
  return (
    <svg viewBox="0 0 480 120" className="hn-svg">
      <circle cx={40} cy={50} r={30} fill="#fde68a" stroke={MAU.duong} /><Ch x={40} y={56} t="S" b s={18} />
      <circle cx={110} cy={50} r={30} fill="#fde68a" stroke={MAU.duong} /><Ch x={110} y={56} t="N" b s={18} />
      <Ch x={75} y={105} t="Đồng xu: 2 mặt" b s={12} />
      {[1, 2, 3, 4, 5, 6].map((n, i) => { const x = 170 + i * 50, y = 25; return <g key={n}>
        <rect x={x} y={y} width={44} height={44} rx={8} fill="#fff" stroke={MAU.duong} strokeWidth={1.5} />
        {cham[n].map(([a, b], k) => <circle key={k} cx={x + 10 + a * 12} cy={y + 10 + b * 12} r={3.6} fill={MAU.duong} />)}</g>; })}
      <Ch x={318} y={105} t="Xúc xắc: 6 mặt" b s={12} />
    </svg>
  );
}

function DongQuy({ h }: { h: H }) {
  const A = [60, 180], B = [300, 180], C = [130, 40];
  const oy = (() => { // tâm ngoại tiếp
    const [ax, ay] = A, [bx, by] = B, [cx, cy] = C; const d = 2 * (ax * (by - cy) + bx * (cy - ay) + cx * (ay - by));
    return [((ax * ax + ay * ay) * (by - cy) + (bx * bx + by * by) * (cy - ay) + (cx * cx + cy * cy) * (ay - by)) / d, ((ax * ax + ay * ay) * (cx - bx) + (bx * bx + by * by) * (ax - cx) + (cx * cx + cy * cy) * (bx - ax)) / d];
  })();
  const [Ox, Oy] = oy; const R = Math.hypot(A[0] - Ox, A[1] - Oy);
  const G = [(A[0] + B[0] + C[0]) / 3, (A[1] + B[1] + C[1]) / 3];
  const mid = (P: number[], Q: number[]) => [(P[0] + Q[0]) / 2, (P[1] + Q[1]) / 2];
  return (
    <svg viewBox="0 0 400 230" className="hn-svg">
      {!h.ca4 && <circle cx={Ox} cy={Oy} r={R} fill="none" stroke={MAU.la} strokeDasharray="5 4" />}
      <polygon points={`${A} ${B} ${C}`} fill={MAU.nen} stroke={MAU.duong} strokeWidth={2} />
      {[[A, B], [B, C], [C, A]].map(([P, Q], i) => { const M = mid(P, Q); return <line key={i} x1={M[0]} y1={M[1]} x2={Ox} y2={Oy} stroke={MAU.xanh} strokeWidth={1.8} />; })}
      {h.ca4 && [[A, B, C], [B, C, A], [C, A, B]].map(([P, Q, S], i) => { const M = mid(Q, S); return <line key={i} x1={P[0]} y1={P[1]} x2={M[0]} y2={M[1]} stroke={MAU.cam} strokeWidth={1.6} strokeDasharray="5 3" />; })}
      {[A, B, C].map((P, i) => <line key={i} x1={P[0]} y1={P[1]} x2={Ox} y2={Oy} stroke={MAU.la} strokeDasharray={h.ca4 ? '0' : '2 3'} opacity={h.ca4 ? 0 : 1} />)}
      <Diem x={Ox} y={Oy} c={MAU.xanh} /><Ch x={Ox + 10} y={Oy + 4} t="O" b c={MAU.xanh} a="start" />
      {h.ca4 && <><Diem x={G[0]} y={G[1]} c={MAU.cam} /><Ch x={G[0] - 8} y={G[1] - 6} t="G" b c={MAU.cam} a="end" /></>}
      <Ch x={A[0] - 10} y={A[1] + 14} t="A" b /><Ch x={B[0] + 10} y={B[1] + 14} t="B" b /><Ch x={C[0]} y={C[1] - 8} t="C" b />
      {h.ca4 ? <><Ch x={395} y={30} t="— trung trực → O" a="end" s={12} c={MAU.xanh} b /><Ch x={395} y={50} t="- - trung tuyến → G" a="end" s={12} c={MAU.cam} b /></>
        : <Ch x={395} y={26} t="OA = OB = OC" a="end" s={14} c={MAU.xanh} b />}
    </svg>
  );
}

function TrungTuyenHuyen() {
  return (
    <svg viewBox="0 0 440 200" className="hn-svg">
      <polygon points="40,170 240,170 40,40" fill={MAU.nen} stroke={MAU.duong} strokeWidth={2} />
      <GocVuong x={40} y={170} u={[1, 0]} v={[0, -1]} />
      <line x1={40} y1={170} x2={140} y2={105} stroke={MAU.cam} strokeWidth={2.5} /><Diem x={140} y={105} c={MAU.cam} />
      <Ch x={32} y={186} t="A" b /><Ch x={248} y={186} t="B" b /><Ch x={32} y={38} t="C" b /><Ch x={150} y={100} t="M" b c={MAU.cam} a="start" />
      <Ch x={140} y={196} t="AM = BC : 2" b c={MAU.cam} s={12} />
      <polygon points="290,170 420,170 355,57" fill={MAU.nen} stroke={MAU.duong} strokeWidth={2} />
      <line x1={355} y1={57} x2={355} y2={170} stroke={MAU.xanh} strokeWidth={2.5} /><GocVuong x={355} y={170} u={[1, 0]} v={[0, -1]} k={9} />
      <Ch x={355} y={196} t="h = a√3 : 2" b c={MAU.xanh} s={12} /><Ch x={318} y={108} t="a" s={13} b />
    </svg>
  );
}

function TongGoc() {
  return (
    <svg viewBox="0 0 440 180" className="hn-svg">
      <polygon points="30,150 180,150 90,40" fill={MAU.nen} stroke={MAU.duong} strokeWidth={2} />
      <Ch x={105} y={172} t="Tam giác: 180°" b s={13} c={MAU.xanh} />
      <polygon points="240,150 410,150 380,40 270,60" fill={MAU.nen} stroke={MAU.duong} strokeWidth={2} />
      <line x1={240} y1={150} x2={380} y2={40} stroke={MAU.cam} strokeDasharray="5 4" strokeWidth={2} />
      <Ch x={325} y={172} t="Tứ giác: 2 × 180° = 360°" b s={13} c={MAU.xanh} />
    </svg>
  );
}

function HcnCheo() {
  return (
    <svg viewBox="0 0 400 180" className="hn-svg">
      <rect x={30} y={30} width={220} height={120} fill={MAU.nen} stroke={MAU.duong} strokeWidth={2} />
      <line x1={30} y1={150} x2={250} y2={30} stroke={MAU.cam} strokeWidth={2.5} /><line x1={30} y1={30} x2={250} y2={150} stroke="#94a3b8" strokeDasharray="4 3" />
      <Diem x={140} y={90} c={MAU.do} />
      <Ch x={140} y={170} t="a" b /><Ch x={262} y={95} t="b" b a="start" /><Ch x={120} y={80} t="d" b c={MAU.cam} />
      <Ch x={390} y={80} t="d² = a² + b²" a="end" s={16} b c={MAU.xanh} /><Ch x={390} y={106} t="hình vuông: d = a√2" a="end" s={13} />
    </svg>
  );
}

function DaGiac() {
  const pts = Array.from({ length: 5 }, (_, i) => [130 + 85 * Math.cos(((90 + 72 * i) * Math.PI) / 180), 105 - 85 * Math.sin(((90 + 72 * i) * Math.PI) / 180)]);
  return (
    <svg viewBox="0 0 400 200" className="hn-svg">
      <polygon points={pts.map((p) => p.join(',')).join(' ')} fill={MAU.nen} stroke={MAU.duong} strokeWidth={2} />
      <line x1={pts[0][0]} y1={pts[0][1]} x2={pts[2][0]} y2={pts[2][1]} stroke={MAU.cam} strokeWidth={2} strokeDasharray="5 4" />
      <line x1={pts[0][0]} y1={pts[0][1]} x2={pts[3][0]} y2={pts[3][1]} stroke={MAU.cam} strokeWidth={2} strokeDasharray="5 4" />
      <Ch x={390} y={90} t="3 tam giác" a="end" s={14} b /><Ch x={390} y={116} t="(5 − 2) · 180° = 540°" a="end" s={15} b c={MAU.xanh} />
    </svg>
  );
}

function DongHo() {
  const O = [110, 100], R = 82;
  return (
    <svg viewBox="0 0 360 200" className="hn-svg">
      <circle cx={O[0]} cy={O[1]} r={R} fill="#fff" stroke={MAU.duong} strokeWidth={3} />
      {Array.from({ length: 12 }, (_, i) => { const a = (i * 30 * Math.PI) / 180; return <line key={i} x1={O[0] + 70 * Math.sin(a)} y1={O[1] - 70 * Math.cos(a)} x2={O[0] + 80 * Math.sin(a)} y2={O[1] - 80 * Math.cos(a)} stroke={MAU.duong} strokeWidth={2} />; })}
      {[[12, 0], [3, 90], [6, 180], [9, 270]].map(([n, a]) => <Ch key={n} x={O[0] + 58 * Math.sin((a * Math.PI) / 180)} y={O[1] - 58 * Math.cos((a * Math.PI) / 180) + 5} t={String(n)} b s={13} />)}
      <path d={cung(O[0], O[1], 30, 0, 90)} fill="#fde68a" stroke={MAU.cam} strokeWidth={2} />
      <line x1={O[0]} y1={O[1]} x2={O[0]} y2={O[1] - 45} stroke={MAU.duong} strokeWidth={3} /><line x1={O[0]} y1={O[1]} x2={O[0] + 45} y2={O[1]} stroke={MAU.xanh} strokeWidth={3} />
      <Ch x={350} y={80} t="1 phần = 30°" a="end" s={14} b /><Ch x={350} y={106} t="15 phút = 90°" a="end" s={14} b c={MAU.xanh} />
    </svg>
  );
}

function DaGiacDeu() {
  const O = [120, 100], pts = Array.from({ length: 6 }, (_, i) => [O[0] + 80 * Math.cos((i * 60 * Math.PI) / 180), O[1] - 80 * Math.sin((i * 60 * Math.PI) / 180)]);
  return (
    <svg viewBox="0 0 360 200" className="hn-svg">
      <polygon points={pts.map((p) => p.join(',')).join(' ')} fill={MAU.nen} stroke={MAU.duong} strokeWidth={2} />
      {pts.map((p, i) => <line key={i} x1={O[0]} y1={O[1]} x2={p[0]} y2={p[1]} stroke="#94a3b8" />)}
      <path d={cung(O[0], O[1], 22, 0, 60)} fill="none" stroke={MAU.cam} strokeWidth={2.5} /><Ch x={O[0] + 34} y={O[1] - 10} t="60°" c={MAU.cam} b s={12} />
      <Diem x={O[0]} y={O[1]} /><Ch x={350} y={100} t="360° : 6 = 60°" a="end" s={16} b c={MAU.xanh} />
    </svg>
  );
}

function HinhKhoi({ h }: { h: H }) {
  const tru = <g>
    <ellipse cx={70} cy={50} rx={45} ry={13} fill="#dbeafe" stroke={MAU.duong} strokeWidth={2} />
    <path d="M25 50V150M115 50V150" stroke={MAU.duong} strokeWidth={2} /><path d="M25 150A45 13 0 0 0 115 150" fill="none" stroke={MAU.duong} strokeWidth={2} />
    <path d="M25 150A45 13 0 0 1 115 150" fill="none" stroke={MAU.duong} strokeDasharray="4 3" />
    <line x1={70} y1={150} x2={115} y2={150} stroke={MAU.cam} strokeWidth={2} /><Ch x={92} y={146} t="r" c={MAU.cam} b />
    <line x1={70} y1={50} x2={70} y2={150} stroke={MAU.xanh} strokeDasharray="4 3" /><Ch x={78} y={104} t="h" c={MAU.xanh} b a="start" />
    <Ch x={70} y={185} t="Hình trụ" b s={12} /></g>;
  const non = (dx: number) => <g transform={`translate(${dx} 0)`}>
    <path d="M25 150L70 35L115 150" fill="none" stroke={MAU.duong} strokeWidth={2} />
    <path d="M25 150A45 13 0 0 0 115 150" fill="none" stroke={MAU.duong} strokeWidth={2} /><path d="M25 150A45 13 0 0 1 115 150" fill="none" stroke={MAU.duong} strokeDasharray="4 3" />
    <line x1={70} y1={35} x2={70} y2={150} stroke={MAU.xanh} strokeDasharray="4 3" /><line x1={70} y1={150} x2={115} y2={150} stroke={MAU.cam} strokeWidth={2} />
    <line x1={70} y1={35} x2={115} y2={150} stroke={MAU.tim} strokeWidth={3} />
    <Ch x={76} y={100} t="h" c={MAU.xanh} b a="start" /><Ch x={92} y={146} t="r" c={MAU.cam} b /><Ch x={102} y={88} t="l" c={MAU.tim} b a="start" />
    <Ch x={70} y={185} t="Hình nón" b s={12} /></g>;
  const cau = <g transform="translate(330 0)"><circle cx={70} cy={95} r={55} fill="#dbeafe" stroke={MAU.duong} strokeWidth={2} />
    <ellipse cx={70} cy={95} rx={55} ry={15} fill="none" stroke={MAU.duong} strokeDasharray="4 3" />
    <line x1={70} y1={95} x2={125} y2={95} stroke={MAU.cam} strokeWidth={2} /><Ch x={98} y={90} t="R" c={MAU.cam} b /><Ch x={70} y={185} t="Hình cầu" b s={12} /></g>;
  if (h.non) return <svg viewBox="0 0 400 195" className="hn-svg">{non(20)}<Ch x={390} y={90} t="l² = r² + h²" a="end" s={17} b c={MAU.tim} /></svg>;
  if (h.ca3) return <svg viewBox="0 0 480 195" className="hn-svg">{tru}<g>{non(165)}</g>{cau}</svg>;
  return (
    <svg viewBox="0 0 400 200" className="hn-svg">{tru}
      <g transform="translate(200 5)"><polygon points="0,50 120,50 120,150 0,150" fill="#dbeafe" stroke={MAU.duong} strokeWidth={2} />
        <polygon points="0,50 40,20 160,20 120,50" fill="#eff6ff" stroke={MAU.duong} strokeWidth={2} /><polygon points="120,50 160,20 160,120 120,150" fill="#bfdbfe" stroke={MAU.duong} strokeWidth={2} />
        <Ch x={60} y={166} t="a" b /><Ch x={150} y={150} t="b" b /><Ch x={-10} y={105} t="c" b /></g>
      <Ch x={280} y={190} t="Hình hộp chữ nhật: V = abc" b s={12} />
    </svg>
  );
}

function ChuyenDong() {
  return (
    <svg viewBox="0 0 440 150" className="hn-svg">
      <defs><Mui id="cd-x" c={MAU.xanh} /><Mui id="cd-c" c={MAU.cam} /></defs>
      <line x1={30} y1={90} x2={410} y2={90} stroke={MAU.duong} strokeWidth={3} /><Diem x={30} y={90} /><Diem x={410} y={90} />
      <Ch x={30} y={115} t="A" b /><Ch x={410} y={115} t="B" b /><Ch x={220} y={140} t="khoảng cách AB" s={12} />
      <line x1={30} y1={60} x2={250} y2={60} stroke={MAU.xanh} strokeWidth={2.5} markerEnd="url(#cd-x)" /><Ch x={140} y={50} t="xe 1: s₁ = v₁ · t" c={MAU.xanh} b s={13} />
      <line x1={410} y1={60} x2={256} y2={60} stroke={MAU.cam} strokeWidth={2.5} markerEnd="url(#cd-c)" /><Ch x={335} y={50} t="xe 2: s₂ = v₂ · t" c={MAU.cam} b s={13} />
      <Ch x={252} y={25} t="gặp nhau: s₁ + s₂ = AB" b s={13} />
    </svg>
  );
}

function CongViec() {
  return (
    <svg viewBox="0 0 420 120" className="hn-svg">
      {[0, 1, 2].map((i) => <g key={i}><rect x={30 + i * 120} y={30} width={120} height={44} fill={i === 0 ? MAU.xanh : '#dbeafe'} stroke="#fff" strokeWidth={3} />
        <Ch x={90 + i * 120} y={58} t={`ngày ${i + 1}`} c={i === 0 ? '#fff' : MAU.duong} b s={13} /></g>)}
      <rect x={30} y={30} width={360} height={44} fill="none" stroke={MAU.duong} strokeWidth={2} />
      <Ch x={210} y={20} t="Cả công việc = 1" b s={13} /><Ch x={90} y={98} t="1 ngày làm 1/3" c={MAU.xanh} b s={13} />
    </svg>
  );
}

function TrucSo({ h }: { h: H }) {
  const px = (x: number) => 210 + x * 50;
  return (
    <svg viewBox="0 0 420 100" className="hn-svg">
      <defs><Mui id="ts-m" /></defs>
      <line x1={20} y1={50} x2={405} y2={50} stroke={MAU.duong} strokeWidth={2} markerEnd="url(#ts-m)" />
      {[-3, -2, -1, 0, 1, 2, 3].map((i) => <g key={i}><line x1={px(i)} x2={px(i)} y1={45} y2={55} stroke={MAU.duong} /><Ch x={px(i)} y={72} t={so(i)} s={11} c="#64748b" /></g>)}
      {h.diem.map(([x, t]: [number, string]) => <g key={t}><Diem x={px(x)} y={50} c={MAU.do} /><Ch x={px(x)} y={36} t={t} b c={MAU.do} s={12} /></g>)}
      <Ch x={210} y={94} t="nhỏ hơn ←          → lớn hơn" s={12} c={MAU.xanh} b />
    </svg>
  );
}

function GiaTriTuyetDoi() {
  const px = (x: number) => 210 + x * 50;
  return (
    <svg viewBox="0 0 420 110" className="hn-svg">
      <defs><Mui id="gt-m" /><Mui id="gt-c" c={MAU.cam} /></defs>
      <line x1={20} y1={60} x2={405} y2={60} stroke={MAU.duong} strokeWidth={2} markerEnd="url(#gt-m)" />
      {[-3, -2, -1, 0, 1, 2, 3].map((i) => <g key={i}><line x1={px(i)} x2={px(i)} y1={55} y2={65} stroke={MAU.duong} /><Ch x={px(i)} y={82} t={so(i)} s={11} c="#64748b" /></g>)}
      <path d={`M${px(0)} 40H${px(-3) + 4}`} stroke={MAU.cam} strokeWidth={2.5} markerEnd="url(#gt-c)" /><path d={`M${px(0)} 40H${px(3) - 4}`} stroke={MAU.cam} strokeWidth={2.5} markerEnd="url(#gt-c)" />
      <Ch x={px(-1.5)} y={30} t="|−3| = 3" b c={MAU.cam} s={13} /><Ch x={px(1.5)} y={30} t="|3| = 3" b c={MAU.cam} s={13} />
      <Diem x={px(-3)} y={60} c={MAU.do} /><Diem x={px(3)} y={60} c={MAU.do} />
      <Ch x={210} y={104} t="giá trị tuyệt đối = khoảng cách đến 0" s={12} c={MAU.xanh} b />
    </svg>
  );
}

function DuongThangNghiem() {
  const ox = 115, oy = 115;
  return (
    <svg viewBox="0 0 380 215" className="hn-svg">
      <defs><Mui id="hn-dtn-m" /></defs>
      <rect x={16} y={14} width={205} height={186} rx={12} fill="#f8fafc" stroke="#e2e8f0" />
      {[-3, -2, -1, 1, 2, 3].map((k) => (
        <g key={k} stroke="#e2e8f0" strokeWidth={1}>
          <line x1={ox + k * 25} y1={24} x2={ox + k * 25} y2={190} />
          <line x1={26} y1={oy - k * 24} x2={210} y2={oy - k * 24} />
        </g>
      ))}
      <line x1={24} y1={oy} x2={212} y2={oy} stroke={MAU.duong} strokeWidth={1.6} markerEnd="url(#hn-dtn-m)" />
      <line x1={ox} y1={194} x2={ox} y2={22} stroke={MAU.duong} strokeWidth={1.6} markerEnd="url(#hn-dtn-m)" />
      <Ch x={208} y={oy + 14} t="x" s={12} b /><Ch x={ox - 10} y={32} t="y" s={12} b /><Ch x={ox - 10} y={oy + 14} t="O" s={11} />
      <line x1={38} y1={172} x2={198} y2={44} stroke={MAU.xanh} strokeWidth={3} strokeLinecap="round" />
      <Ch x={175} y={40} t="ax + by = c" s={12.5} c={MAU.xanh} b />
      <circle cx={78} cy={140} r={5.5} fill={MAU.la} stroke="#fff" strokeWidth={2} />
      <Ch x={68} y={128} t="M₁" s={12} c={MAU.la} b />
      <circle cx={158} cy={76} r={5.5} fill={MAU.la} stroke="#fff" strokeWidth={2} />
      <Ch x={168} y={92} t="M₂" s={12} c={MAU.la} b />
      <circle cx={145} cy={154} r={5.5} fill={MAU.do} stroke="#fff" strokeWidth={2} />
      <Ch x={156} y={158} t="N" s={12} c={MAU.do} b a="start" />
      <rect x={232} y={24} width={136} height={74} rx={12} fill="#f0fdf4" stroke="#86efac" />
      <circle cx={246} cy={46} r={4.5} fill={MAU.la} />
      <Ch x={256} y={50} t="M₁, M₂ trên đt" a="start" s={12} c={MAU.la} b />
      <Ch x={256} y={70} t="→ là nghiệm" a="start" s={12} />
      <rect x={232} y={110} width={136} height={74} rx={12} fill="#fef2f2" stroke="#fca5a5" />
      <circle cx={246} cy={132} r={4.5} fill={MAU.do} />
      <Ch x={256} y={136} t="N ngoài đt" a="start" s={12} c={MAU.do} b />
      <Ch x={256} y={156} t="→ không là nghiệm" a="start" s={11.5} />
    </svg>
  );
}

function HeHaiDuong() {
  return (
    <svg viewBox="0 0 480 185" className="hn-svg">
      <g>
        <rect x={10} y={14} width={144} height={116} rx={12} fill="#f8fafc" stroke="#cbd5e1" />
        <line x1={26} y1={112} x2={136} y2={32} stroke={MAU.xanh} strokeWidth={2.6} />
        <line x1={26} y1={42} x2={136} y2={106} stroke={MAU.cam} strokeWidth={2.6} />
        <circle cx={81} cy={74} r={5.5} fill={MAU.do} stroke="#fff" strokeWidth={2} />
        <Ch x={95} y={68} t="(x₀; y₀)" s={11.5} c={MAU.do} b a="start" />
        <Ch x={82} y={150} t="Cắt nhau" s={13} b />
        <Ch x={82} y={169} t="1 nghiệm duy nhất" s={12} c={MAU.xanh} b />
      </g>
      <g transform="translate(158 0)">
        <rect x={10} y={14} width={144} height={116} rx={12} fill="#f8fafc" stroke="#cbd5e1" />
        <line x1={26} y1={96} x2={136} y2={34} stroke={MAU.xanh} strokeWidth={2.6} />
        <line x1={26} y1={118} x2={136} y2={56} stroke={MAU.cam} strokeWidth={2.6} />
        <Ch x={82} y={150} t="Song song" s={13} b />
        <Ch x={82} y={169} t="Vô nghiệm" s={12} c={MAU.do} b />
      </g>
      <g transform="translate(316 0)">
        <rect x={10} y={14} width={144} height={116} rx={12} fill="#f8fafc" stroke="#cbd5e1" />
        <line x1={26} y1={110} x2={136} y2={36} stroke={MAU.xanh} strokeWidth={4.2} />
        <line x1={26} y1={110} x2={136} y2={36} stroke={MAU.cam} strokeWidth={2.2} strokeDasharray="6 4" />
        <Ch x={82} y={150} t="Trùng nhau" s={13} b />
        <Ch x={82} y={169} t="Vô số nghiệm" s={12} c={MAU.la} b />
      </g>
    </svg>
  );
}

function SoDoBuoc({ h }: { h: H }) {
  const ds = (h.buoc ?? []) as { so: string; icon: string; ten: string; moTa: string }[];
  if (ds.length <= 3) {
    return (
      <svg viewBox="0 0 480 140" className="hn-svg">
        <defs><Mui id="hn-sdb-m" c={MAU.xanh} /></defs>
        {ds.map((b, i) => {
          const x = 10 + i * 160;
          return (
            <g key={b.so}>
              <rect x={x} y={16} width={140} height={106} rx={14} fill={i === 2 ? '#f0fdf4' : MAU.nen} stroke={i === 2 ? '#86efac' : '#93c5fd'} strokeWidth={1.8} />
              <circle cx={x + 24} cy={40} r={13} fill={i === 2 ? MAU.la : MAU.xanh} />
              <Ch x={x + 24} y={45} t={b.so} c="#fff" s={13} b />
              <Ch x={x + 114} y={46} t={b.icon} s={18} />
              <Ch x={x + 70} y={76} t={b.ten} s={13} b />
              <Ch x={x + 70} y={98} t={b.moTa} s={11.5} c="#475569" />
              {i < ds.length - 1 && <line x1={x + 142} y1={68} x2={x + 157} y2={68} stroke={MAU.xanh} strokeWidth={2.4} markerEnd="url(#hn-sdb-m)" />}
            </g>
          );
        })}
      </svg>
    );
  }
  const viTri = [[14, 14], [250, 14], [14, 108], [250, 108]];
  return (
    <svg viewBox="0 0 480 198" className="hn-svg">
      <defs><Mui id="hn-sdb-m" c={MAU.xanh} /></defs>
      {ds.slice(0, 4).map((b, i) => {
        const [x, y] = viTri[i];
        return (
          <g key={b.so}>
            <rect x={x} y={y} width={214} height={74} rx={14} fill={i === 3 ? '#f0fdf4' : MAU.nen} stroke={i === 3 ? '#86efac' : '#93c5fd'} strokeWidth={1.8} />
            <circle cx={x + 22} cy={y + 24} r={12} fill={i === 3 ? MAU.la : MAU.xanh} />
            <Ch x={x + 22} y={y + 29} t={b.so} c="#fff" s={12.5} b />
            <Ch x={x + 190} y={y + 28} t={b.icon} s={16} />
            <Ch x={x + 42} y={y + 29} t={b.ten} a="start" s={13} b />
            <Ch x={x + 16} y={y + 56} t={b.moTa} a="start" s={12} c="#475569" />
          </g>
        );
      })}
      <line x1={230} y1={51} x2={247} y2={51} stroke={MAU.xanh} strokeWidth={2.4} markerEnd="url(#hn-sdb-m)" />
      <path d="M357 89V98H121V105" fill="none" stroke={MAU.xanh} strokeWidth={2.2} markerEnd="url(#hn-sdb-m)" />
      <line x1={230} y1={145} x2={247} y2={145} stroke={MAU.xanh} strokeWidth={2.4} markerEnd="url(#hn-sdb-m)" />
    </svg>
  );
}

function TichBangKhong() {
  return (
    <svg viewBox="0 0 420 155" className="hn-svg">
      <defs><Mui id="hn-tbk-m" c={MAU.xanh} /></defs>
      <rect x={125} y={12} width={170} height={44} rx={14} fill={MAU.nen} stroke={MAU.xanh} strokeWidth={2} />
      <Ch x={210} y={40} t="A · B = 0" s={18} b c={MAU.xanh} />
      <line x1={170} y1={57} x2={115} y2={92} stroke={MAU.xanh} strokeWidth={2.2} markerEnd="url(#hn-tbk-m)" />
      <line x1={250} y1={57} x2={305} y2={92} stroke={MAU.xanh} strokeWidth={2.2} markerEnd="url(#hn-tbk-m)" />
      <Ch x={210} y={124} t="hoặc" s={13} b c={MAU.cam} />
      <rect x={42} y={96} width={132} height={44} rx={12} fill="#f0fdf4" stroke={MAU.la} strokeWidth={2} />
      <Ch x={108} y={124} t="A = 0" s={17} b c={MAU.la} />
      <rect x={246} y={96} width={132} height={44} rx={12} fill="#f0fdf4" stroke={MAU.la} strokeWidth={2} />
      <Ch x={312} y={124} t="B = 0" s={17} b c={MAU.la} />
    </svg>
  );
}

function DieuKienMau() {
  return (
    <svg viewBox="0 0 440 165" className="hn-svg">
      <defs><Mui id="hn-dkm-m" /></defs>
      <rect x={36} y={12} width={160} height={64} rx={12} fill={MAU.nen} stroke="#93c5fd" strokeWidth={1.8} />
      <Ch x={116} y={34} t="P(x)" s={15} b />
      <line x1={82} y1={43} x2={150} y2={43} stroke={MAU.duong} strokeWidth={2} />
      <Ch x={116} y={63} t="Q(x)" s={15} b c={MAU.do} />
      <rect x={220} y={18} width={184} height={52} rx={12} fill="#fef2f2" stroke="#fca5a5" strokeWidth={1.8} />
      <Ch x={312} y={50} t="ĐKXĐ: Q(x) ≠ 0" s={16} b c={MAU.do} />
      <line x1={40} y1={116} x2={400} y2={116} stroke={MAU.duong} strokeWidth={2.4} markerEnd="url(#hn-dkm-m)" />
      <Ch x={392} y={136} t="x" s={12} b />
      <circle cx={210} cy={116} r={8} fill="#fff" stroke={MAU.do} strokeWidth={3} />
      <line x1={202} y1={108} x2={218} y2={124} stroke={MAU.do} strokeWidth={2.4} />
      <line x1={218} y1={108} x2={202} y2={124} stroke={MAU.do} strokeWidth={2.4} />
      <Ch x={210} y={98} t="x = a (Q(a) = 0)" s={12.5} b c={MAU.do} />
      <Ch x={210} y={150} t="Gạch bỏ giá trị làm mẫu thức bằng 0" s={12.5} b c={MAU.xanh} />
    </svg>
  );
}

function CanBatDangThuc() {
  return (
    <svg viewBox="0 0 480 180" className="hn-svg">
      <defs><Mui id="hn-cbdt-m" c={MAU.do} /></defs>
      <g>
        <rect x={10} y={10} width={222} height={158} rx={14} fill="#f0fdf4" stroke="#86efac" strokeWidth={1.8} />
        <Ch x={121} y={32} t="+ c hoặc × c (c > 0)" s={13} b c={MAU.la} />
        <polygon points="121,110 109,128 133,128" fill="#64748b" />
        <line x1={50} y1={102} x2={192} y2={84} stroke={MAU.duong} strokeWidth={3} strokeLinecap="round" />
        <rect x={36} y={76} width={34} height={24} rx={6} fill="#dbeafe" stroke={MAU.xanh} />
        <Ch x={53} y={93} t="a" s={14} b c={MAU.xanh} />
        <rect x={172} y={56} width={34} height={26} rx={6} fill="#bbf7d0" stroke={MAU.la} />
        <Ch x={189} y={74} t="b" s={14} b c={MAU.la} />
        <Ch x={121} y={148} t="Giữ nguyên chiều (<)" s={13} b c={MAU.la} />
      </g>
      <g transform="translate(238 0)">
        <rect x={10} y={10} width={222} height={158} rx={14} fill="#fff7ed" stroke="#fdba74" strokeWidth={1.8} />
        <Ch x={121} y={32} t="× c với c < 0 (số âm)" s={13} b c={MAU.do} />
        <polygon points="121,110 109,128 133,128" fill="#64748b" />
        <line x1={50} y1={84} x2={192} y2={102} stroke={MAU.duong} strokeWidth={3} strokeLinecap="round" />
        <rect x={36} y={56} width={38} height={26} rx={6} fill="#fee2e2" stroke={MAU.do} />
        <Ch x={55} y={74} t="a·c" s={13} b c={MAU.do} />
        <rect x={170} y={76} width={38} height={24} rx={6} fill="#ffedd5" stroke={MAU.cam} />
        <Ch x={189} y={93} t="b·c" s={13} b c={MAU.cam} />
        <path d="M96 64Q121 44 146 64" fill="none" stroke={MAU.do} strokeWidth={2.2} markerEnd="url(#hn-cbdt-m)" />
        <Ch x={121} y={148} t="Đảo chiều: a < b ⇒ a·c > b·c" s={12.5} b c={MAU.do} />
      </g>
    </svg>
  );
}

function TrucNghiem() {
  const gach = (x1: number, x2: number, y: number) => {
    const ds: number[] = [];
    for (let x = x1; x <= x2; x += 14) ds.push(x);
    return ds.map((x) => <line key={x} x1={x} y1={y - 7} x2={x - 7} y2={y + 7} stroke="#94a3b8" strokeWidth={1.6} />);
  };
  return (
    <svg viewBox="0 0 460 180" className="hn-svg">
      <defs><Mui id="hn-tn-m" /></defs>
      <Ch x={22} y={40} t="x > a" a="start" s={15} b c={MAU.xanh} />
      <line x1={88} y1={35} x2={425} y2={35} stroke="#94a3b8" strokeWidth={2} markerEnd="url(#hn-tn-m)" />
      {gach(100, 224, 35)}
      <line x1={234} y1={35} x2={415} y2={35} stroke={MAU.xanh} strokeWidth={4} />
      <circle cx={234} cy={35} r={6.5} fill="#fff" stroke={MAU.xanh} strokeWidth={2.8} />
      <Ch x={234} y={60} t="a" s={13} b />
      <Ch x={22} y={108} t="x ≤ a" a="start" s={15} b c={MAU.cam} />
      <line x1={88} y1={103} x2={425} y2={103} stroke="#94a3b8" strokeWidth={2} markerEnd="url(#hn-tn-m)" />
      <line x1={94} y1={103} x2={266} y2={103} stroke={MAU.cam} strokeWidth={4} />
      {gach(278, 405, 103)}
      <circle cx={266} cy={103} r={6.5} fill={MAU.cam} />
      <Ch x={266} y={128} t="a" s={13} b />
      <rect x={28} y={144} width={404} height={28} rx={10} fill="#f8fafc" stroke="#e2e8f0" />
      <Ch x={230} y={163} t="○ không lấy điểm mút   ·   ● có lấy điểm mút   ·   //// phần bỏ" s={12} b c="#475569" />
    </svg>
  );
}

function HinhVuongCan() {
  return (
    <svg viewBox="0 0 440 175" className="hn-svg">
      <rect x={36} y={24} width={116} height={116} rx={6} fill="#dbeafe" stroke={MAU.xanh} strokeWidth={2.4} />
      <Ch x={94} y={88} t="S = a" s={18} b c={MAU.xanh} />
      <Ch x={94} y={160} t="√a" s={15} b c={MAU.cam} />
      <Ch x={162} y={88} t="√a" s={15} b c={MAU.cam} a="start" />
      <rect x={212} y={24} width={206} height={58} rx={12} fill="#f0fdf4" stroke="#86efac" strokeWidth={1.8} />
      <Ch x={315} y={48} t="Hình vuông diện tích a (a ≥ 0)" s={12.5} b />
      <Ch x={315} y={70} t="→ Cạnh là √a ≥ 0" s={14} b c={MAU.la} />
      <rect x={212} y={96} width={206} height={52} rx={12} fill={MAU.nen} stroke="#93c5fd" strokeWidth={1.8} />
      <Ch x={315} y={128} t="(√a)² = a   (với a ≥ 0)" s={15} b c={MAU.xanh} />
    </svg>
  );
}

function CanTichThuong({ h }: { h: H }) {
  if (h.thuong) {
    return (
      <svg viewBox="0 0 460 180" className="hn-svg">
        <rect x={24} y={26} width={144} height={54} rx={10} fill="#dbeafe" stroke={MAU.xanh} strokeWidth={2} />
        <Ch x={96} y={59} t="Tử số: a ≥ 0" s={14} b c={MAU.xanh} />
        <line x1={20} y1={92} x2={172} y2={92} stroke={MAU.duong} strokeWidth={2.5} />
        <rect x={24} y={104} width={144} height={54} rx={10} fill="#ffedd5" stroke={MAU.cam} strokeWidth={2} />
        <Ch x={96} y={137} t="Mẫu số: b > 0" s={14} b c={MAU.cam} />
        <rect x={198} y={32} width={238} height={116} rx={14} fill="#f8fafc" stroke="#cbd5e1" strokeWidth={1.8} />
        <Ch x={317} y={76} t="√(a / b) = √a / √b" s={19} b c={MAU.xanh} />
        <Ch x={317} y={108} t="Điều kiện: a ≥ 0 và b > 0" s={13} b />
        <Ch x={317} y={130} t="Tách căn tử chia căn mẫu" s={12} c="#64748b" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 460 180" className="hn-svg">
      <rect x={24} y={28} width={88} height={106} rx={8} fill="#dbeafe" stroke={MAU.xanh} strokeWidth={2} />
      <rect x={112} y={28} width={58} height={106} rx={8} fill="#dcfce7" stroke={MAU.la} strokeWidth={2} />
      <Ch x={68} y={86} t="a" s={18} b c={MAU.xanh} />
      <Ch x={141} y={86} t="b" s={18} b c={MAU.la} />
      <Ch x={97} y={156} t="Tích a · b" s={13} b />
      <rect x={196} y={32} width={240} height={116} rx={14} fill="#f8fafc" stroke="#cbd5e1" strokeWidth={1.8} />
      <Ch x={316} y={76} t="√(a · b) = √a · √b" s={19} b c={MAU.xanh} />
      <Ch x={316} y={108} t="Điều kiện: a ≥ 0 và b ≥ 0" s={13} b />
      <Ch x={316} y={130} t="Khai căn từng thừa số không âm" s={12} c="#64748b" />
    </svg>
  );
}

function RaVaoCan({ h }: { h: H }) {
  const ra = h.huong !== 'vao';
  return (
    <svg viewBox="0 0 460 175" className="hn-svg">
      <defs><Mui id="hn-rv-x" c={MAU.xanh} /><Mui id="hn-rv-m" c={MAU.cam} /></defs>
      <rect x={24} y={36} width={144} height={68} rx={14} fill={MAU.nen} stroke={MAU.xanh} strokeWidth={2} />
      <Ch x={96} y={76} t="√(a² · b)" s={18} b c={MAU.xanh} />
      <rect x={292} y={36} width={144} height={68} rx={14} fill="#fff7ed" stroke={MAU.cam} strokeWidth={2} />
      <Ch x={364} y={76} t="|a| · √b" s={18} b c={MAU.cam} />
      <line x1={174} y1={54} x2={284} y2={54} stroke={MAU.xanh} strokeWidth={ra ? 3 : 1.6} markerEnd="url(#hn-rv-x)" />
      <Ch x={230} y={42} t="Đưa ra ngoài" s={12} b={ra} c={MAU.xanh} />
      <line x1={284} y1={86} x2={174} y2={86} stroke={MAU.cam} strokeWidth={ra ? 1.6 : 3} markerEnd="url(#hn-rv-m)" />
      <Ch x={230} y={108} t="Đưa vào trong" s={12} b={!ra} c={MAU.cam} />
      <rect x={24} y={124} width={412} height={38} rx={10} fill="#f8fafc" stroke="#e2e8f0" />
      <Ch x={230} y={148} t="Với a ≥ 0: a√b = √(a²b)   |   Với a < 0: a√b = −√(a²b)  (b ≥ 0)" s={12} b />
    </svg>
  );
}

function TrucCan({ h }: { h: H }) {
  return (
    <svg viewBox="0 0 460 175" className="hn-svg">
      <defs><Mui id="hn-tc-m" c={MAU.xanh} /></defs>
      {h.lienHop ? <>
        <rect x={18} y={24} width={126} height={74} rx={12} fill="#fff7ed" stroke={MAU.cam} strokeWidth={1.8} />
        <Ch x={81} y={48} t="C" s={14} b /><line x1={42} y1={56} x2={120} y2={56} stroke={MAU.duong} strokeWidth={1.8} />
        <Ch x={81} y={78} t="√a − √b" s={14} b c={MAU.cam} />
        <line x1={150} y1={61} x2={244} y2={61} stroke={MAU.xanh} strokeWidth={2.5} markerEnd="url(#hn-tc-m)" />
        <Ch x={197} y={48} t="× (√a + √b)" s={12} b c={MAU.xanh} />
        <rect x={252} y={24} width={190} height={74} rx={12} fill="#f0fdf4" stroke={MAU.la} strokeWidth={1.8} />
        <Ch x={347} y={48} t="C(√a + √b)" s={14} b c={MAU.la} /><line x1={276} y1={56} x2={418} y2={56} stroke={MAU.duong} strokeWidth={1.8} />
        <Ch x={347} y={78} t="a − b" s={14} b />
        <rect x={32} y={116} width={396} height={42} rx={10} fill={MAU.nen} stroke="#93c5fd" />
        <Ch x={230} y={142} t="Dùng hằng đẳng thức: (√a − √b)(√a + √b) = a − b" s={13} b c={MAU.xanh} />
      </> : <>
        <rect x={24} y={24} width={114} height={74} rx={12} fill="#fff7ed" stroke={MAU.cam} strokeWidth={1.8} />
        <Ch x={81} y={48} t="A" s={15} b /><line x1={52} y1={56} x2={110} y2={56} stroke={MAU.duong} strokeWidth={1.8} />
        <Ch x={81} y={78} t="√B" s={15} b c={MAU.cam} />
        <line x1={144} y1={61} x2={252} y2={61} stroke={MAU.xanh} strokeWidth={2.5} markerEnd="url(#hn-tc-m)" />
        <Ch x={198} y={48} t="× √B tử & mẫu" s={12} b c={MAU.xanh} />
        <rect x={260} y={24} width={174} height={74} rx={12} fill="#f0fdf4" stroke={MAU.la} strokeWidth={1.8} />
        <Ch x={347} y={48} t="A · √B" s={15} b c={MAU.la} /><line x1={296} y1={56} x2={398} y2={56} stroke={MAU.duong} strokeWidth={1.8} />
        <Ch x={347} y={78} t="B" s={15} b />
        <rect x={44} y={116} width={372} height={42} rx={10} fill={MAU.nen} stroke="#93c5fd" />
        <Ch x={230} y={142} t="Khử căn ở mẫu bằng công thức: (√B)² = B  (với B > 0)" s={13} b c={MAU.xanh} />
      </>}
    </svg>
  );
}

function LapPhuongCan() {
  return (
    <svg viewBox="0 0 460 180" className="hn-svg">
      <polygon points="44,62 126,62 126,144 44,144" fill="#dbeafe" stroke={MAU.duong} strokeWidth={2} />
      <polygon points="44,62 76,34 158,34 126,62" fill="#eff6ff" stroke={MAU.duong} strokeWidth={2} />
      <polygon points="126,62 158,34 158,116 126,144" fill="#bfdbfe" stroke={MAU.duong} strokeWidth={2} />
      <Ch x={85} y={108} t="V = a" s={16} b c={MAU.xanh} />
      <Ch x={85} y={164} t="∛a" s={14} b c={MAU.cam} />
      <Ch x={165} y={84} t="∛a" s={14} b c={MAU.cam} a="start" />
      <rect x={210} y={22} width={226} height={64} rx={12} fill={MAU.nen} stroke="#93c5fd" strokeWidth={1.8} />
      <Ch x={323} y={48} t="Khối lập phương thể tích a" s={12.5} b />
      <Ch x={323} y={72} t="→ Cạnh là ∛a  |  (∛a)³ = a" s={14} b c={MAU.xanh} />
      <rect x={210} y={100} width={226} height={60} rx={12} fill="#fff7ed" stroke="#fdba74" strokeWidth={1.8} />
      <Ch x={323} y={125} t="Số âm vẫn có căn bậc ba:" s={12.5} b />
      <Ch x={323} y={147} t="a < 0  ⇒  ∛a < 0" s={14} b c={MAU.cam} />
    </svg>
  );
}

function BonCongThucCan() {
  const the = [
    ['1) Hằng đẳng thức', '√(A²) = |A|', 'Luôn không âm'],
    ['2) Khai căn tích', '√(A·B) = √A · √B', 'A ≥ 0, B ≥ 0'],
    ['3) Khai căn thương', '√(A/B) = √A / √B', 'A ≥ 0, B > 0'],
    ['4) Căn bậc ba', '(∛A)³ = ∛(A³) = A', 'Mọi số thực A'],
  ];
  return (
    <svg viewBox="0 0 460 190" className="hn-svg">
      {the.map(([tieu, ct, dk], i) => {
        const x = 14 + (i % 2) * 222, y = 12 + Math.floor(i / 2) * 88;
        return (
          <g key={tieu}>
            <rect x={x} y={y} width={210} height={78} rx={12} fill={i === 3 ? '#fff7ed' : MAU.nen} stroke={i === 3 ? '#fdba74' : '#93c5fd'} strokeWidth={1.8} />
            <Ch x={x + 105} y={y + 22} t={tieu} s={12} b c="#475569" />
            <Ch x={x + 105} y={y + 46} t={ct} s={15} b c={i === 3 ? MAU.cam : MAU.xanh} />
            <Ch x={x + 105} y={y + 67} t={dk} s={11.5} c="#64748b" />
          </g>
        );
      })}
    </svg>
  );
}

const VE: Record<string, (p: { h: H }) => JSX.Element> = {
  toaDo: ToaDo, tamGiacVuong: TamGiacVuong, tamGiacDacBiet: TamGiacDacBiet, gocPhu: GocPhu, duongTron: DuongTron, doiXungTam: DoiXungTam,
  loaiGoc: LoaiGoc, gocOTam: GocOTam, chuViDienTich: ChuViDienTich, vanhKhuyen: VanhKhuyen, khoangCach: KhoangCach, tiepTuyen: TiepTuyen,
  trungTrucPhanGiac: TrungTrucPhanGiac, viTriDuongThang: ViTriDuongThang, haiDuongTron: HaiDuongTron, bieuDo: BieuDo, hinhQuat: HinhQuat,
  xucXac: XucXac, dongQuy: DongQuy, trungTuyenHuyen: TrungTuyenHuyen, tongGoc: TongGoc, hcnCheo: HcnCheo, daGiac: DaGiac, dongHo: DongHo,
  daGiacDeu: DaGiacDeu, hinhKhoi: HinhKhoi, chuyenDong: ChuyenDong, congViec: CongViec, trucSo: TrucSo, giaTriTuyetDoi: GiaTriTuyetDoi,
  duongThangNghiem: DuongThangNghiem, heHaiDuong: HeHaiDuong, soDoBuoc: SoDoBuoc, tichBangKhong: TichBangKhong,
  dieuKienMau: DieuKienMau, canBatDangThuc: CanBatDangThuc, trucNghiem: TrucNghiem, hinhVuongCan: HinhVuongCan,
  canTichThuong: CanTichThuong, raVaoCan: RaVaoCan, trucCan: TrucCan, lapPhuongCan: LapPhuongCan, bonCongThucCan: BonCongThucCan
};

function HinhNenGoc({ kuId, cau }: { kuId: string; cau?: { t: string; tra: boolean } | null }) {
  const h = hinhCuaMuc(kuId) as H | null;
  /* Câu đang làm có điểm hoặc phương trình đường thẳng: vẽ đúng hình của câu đó */
  const hc = cau && (!h || h.loai === 'toaDo') ? docHinhCau(cau.t) : null;
  if (hc) {
    const chu = [hc.pt ? `Đường thẳng ${hc.pt.chu}` : '', hc.diem.length ? `điểm ${hc.diem.map(([x, y]) => `(${so(x)}; ${so(y)})`).join(', ')}` : ''].filter(Boolean).join(' và ');
    return (
      <details className="hn hn--dong" open>
        <summary>📐 Hình của câu này</summary>
        <figure className="hn-hinh" aria-label={chu}>
          <ToaDoSinhDong hinh={hc} daTra={cau!.tra} khoa={cau!.t} />
          <figcaption>{cau!.tra ? (hc.pt && hc.diem.length ? 'Điểm đỏ nằm trên đường thẳng thì cặp số là nghiệm. Chấm xanh là điểm trên đường thẳng có cùng hoành độ.' : chu) : chu}</figcaption>
        </figure>
      </details>
    );
  }
  const hh = cau ? docHinhHinhHocCau(cau.t, kuId, cau.tra) : null;
  if (hh) {
    return (
      <details className="hn hn--dong hn--cau" open>
        <summary>📐 Hình của câu này</summary>
        <div className="hn-hinh hn-hinh--cau">
          <QuestionFigure hinh={hh.hinh} />
          <p className="hn-chu">{hh.chu}</p>
        </div>
      </details>
    );
  }
  const Ve = h ? VE[h.loai] : null;
  if (!h || !Ve) return null;
  /* Hình toạ độ tĩnh cũng dùng kiểu sinh động */
  if (h.loai === 'toaDo' && !h.doiXung && !h.gocPhanTu) {
    const tinh = { diem: (h.diem as [number, number, string][]).map(([x, y]) => [x, y] as [number, number]), pt: h.duong ? { a: h.duong[0], b: h.duong[1], c: h.duong[2], chu: h.duong[3] } : null };
    return (
      <details className="hn hn--dong" open>
        <summary>📐 Nhắc lại bằng hình</summary>
        <figure className="hn-hinh" aria-label={h.chu}><ToaDoSinhDong hinh={tinh} daTra={false} khoa={kuId} /><figcaption>{h.chu}</figcaption></figure>
      </details>
    );
  }
  return (
    <details className="hn" open>
      <summary>📐 Nhắc lại bằng hình</summary>
      <figure className="hn-hinh" aria-label={h.chu}>
        <Ve h={h} />
        <figcaption>{h.chu}</figcaption>
      </figure>
    </details>
  );
}

export default function HinhNen(props: { kuId: string; cau?: { t:string; tra:boolean } | null }) {
  if (!coHinhToanDong(props.kuId)) return <HinhNenGoc {...props}/>;
  return <>
    <HinhNenGoc {...props}/>
    <details className="hn">
      <summary>Nhắc lại bằng hình tương tác</summary>
      <HinhToanDong kuId={props.kuId}/>
    </details>
  </>;
}
