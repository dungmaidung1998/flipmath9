/**
 * FILE NÀY LÀM GÌ: Component React giao diện hiển thị và xử lý tương tác của người dùng trên trình duyệt.
 * AI DÙNG: học sinh
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: không gọi mô-đun nội bộ khác
 */
/**
 * Mặt phẳng toạ độ sinh động (23/11/2026): vẽ đúng điểm và đường thẳng có trong câu hỏi đang làm.
 * - Đọc "(a; b)" và "ax + by = c" (hoặc "y = ax + b") từ chữ của câu.
 * - Đường thẳng tự vẽ ra, điểm nhấp nháy; sau khi em trả lời thì hiện điểm trên đường thẳng có cùng hoành độ để so sánh.
 */
export type HinhCau = { diem: [number, number][]; pt: { a: number; b: number; c: number; chu: string } | null };

// Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
const so = (n: number) => (Math.round(n * 100) / 100).toString().replace('-', '−').replace('.', ',');
// Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
const docSo = (s: string) => Number(s.replace(/\s/g, '').replace(',', '.'));

/** Đọc điểm và phương trình bậc nhất hai ẩn từ chữ của câu hỏi; không đọc được thì trả về null. */
export function docHinhCau(chu: string): HinhCau | null {
  // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
  const t = chu.replace(/−/g, '-').replace(/\$/g, '');
  const diem: [number, number][] = [];
  // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
  for (const m of t.matchAll(/\(\s*(-?\d+(?:[.,]\d+)?)\s*;\s*(-?\d+(?:[.,]\d+)?)\s*\)/g)) diem.push([docSo(m[1]), docSo(m[2])]);
  let pt: HinhCau['pt'] = null;
  // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
  const m1 = t.match(/(-?\s*\d*(?:[.,]\d+)?\s*x)\s*([+-]\s*\d*(?:[.,]\d+)?\s*y)\s*=\s*(-?\s*\d+(?:[.,]\d+)?)/);
  // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
  const heSo = (s: string, bien: string) => { const k = s.replace(/\s/g, '').replace(bien, ''); return k === '' || k === '+' ? 1 : k === '-' ? -1 : docSo(k); };
  // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
  if (m1) pt = { a: heSo(m1[1], 'x'), b: heSo(m1[2], 'y'), c: docSo(m1[3].replace(/\s/g, '')), chu: m1[0].replace(/-/g, '−').replace(/\s+/g, ' ').trim() };
  else {
    // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
    const m2 = t.match(/y\s*=\s*(-?\s*\d*(?:[.,]\d+)?)\s*x\s*([+-]\s*\d+(?:[.,]\d+)?)?/);
    // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
    if (m2) { const k = m2[1].replace(/\s/g, ''); const a = k === '' ? 1 : k === '-' ? -1 : docSo(k); const b = m2[2] ? docSo(m2[2].replace(/\s/g, '')) : 0;
      // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
      pt = { a: -a, b: 1, c: b, chu: m2[0].replace(/-/g, '−').replace(/\s+/g, ' ').trim() }; }
  }
  if (!diem.length && !pt) return null;
  return { diem, pt };
}

const N = 5, U = 26, O = 150;
const px = (x: number) => O + x * U, py = (y: number) => O - y * U;
const trong = (v: number) => v >= -N && v <= N;

/**
 * Component React `ToaDoSinhDong`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export default function ToaDoSinhDong({ hinh, daTra, khoa }: { hinh: HinhCau; daTra: boolean; khoa: string }) {
  const { diem, pt } = hinh;
  const ds = Array.from({ length: 2 * N + 1 }, (_, i) => i - N);
  let duong: [number, number, number, number] | null = null;
  if (pt) {
    if (pt.b !== 0) { const y = (x: number) => (pt.c - pt.a * x) / pt.b; duong = [-N, y(-N), N, y(N)]; }
    else if (pt.a !== 0) { const x = pt.c / pt.a; duong = [x, -N, x, N]; }
  }
  /* Điểm mẫu trên đường thẳng (để thấy "vô số nghiệm") và điểm so sánh sau khi trả lời */
  const tren = (x: number) => (pt && pt.b !== 0 ? (pt.c - pt.a * x) / pt.b : NaN);
  // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
  const mau = pt && pt.b !== 0 ? [-3, -2, -1, 0, 1, 2, 3, 4].filter((x) => Number.isInteger(tren(x)) && Math.abs(tren(x)) <= 4).slice(0, 4) : [];
  /* Đặt nhãn phương trình ở chỗ trên đường thẳng xa các điểm nhất, trong khung */
  const nhanPt = duong ? (() => {
    const ung: [number, number][] = pt!.b !== 0
      ? [-3.5, -2.5, -1.5, 1.5, 2.5, 3.5].map((x) => [x, tren(x)] as [number, number]).filter(([, y]) => Math.abs(y) <= 3.8)
      : [-3, -1.5, 1.5, 3].map((y) => [duong![0], y] as [number, number]);
    if (!ung.length) return null;
    // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
    const xa = ([x, y]: [number, number]) => Math.min(9, ...diem.map(([a, b]) => Math.hypot(a - x, b - y)), Math.hypot(x, y) + .5);
    const [x, y] = ung.reduce((m, v) => (xa(v) > xa(m) ? v : m));
    const w = pt!.chu.length * 9.2 + 20;
    return { x: Math.min(Math.max(px(x) + (pt!.b !== 0 ? 0 : w / 2 + 10), w / 2 + 8), 292 - w / 2), y: Math.min(Math.max(py(y) + 28, 24), 284) };
  })() : null;
  return (
    <svg viewBox="0 0 300 300" className="tdd" key={khoa} role="img" aria-label="Mặt phẳng toạ độ minh hoạ câu đang làm">
      <defs>
        <radialGradient id="tdd-nen" cx="50%" cy="45%" r="70%"><stop offset="0" stopColor="#ffffff" /><stop offset="1" stopColor="#e8f1ff" /></radialGradient>
        <linearGradient id="tdd-dt" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#2563eb" /><stop offset="1" stopColor="#7c3aed" /></linearGradient>
        <clipPath id="tdd-khung"><rect x={px(-N)} y={py(N)} width={2 * N * U} height={2 * N * U} /></clipPath>
        <filter id="tdd-sang" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="3" /></filter>
        <marker id="tdd-mui" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="#1e293b" /></marker>
      </defs>
      <rect x="2" y="2" width="296" height="296" rx="22" fill="url(#tdd-nen)" stroke="#c7d7f5" strokeWidth="2" />
      <g opacity=".55"><rect x={px(0)} y={py(N)} width={N * U} height={N * U} fill="#e0f2fe" /><rect x={px(-N)} y={py(N)} width={N * U} height={N * U} fill="#fef9c3" />
        <rect x={px(-N)} y={py(0)} width={N * U} height={N * U} fill="#fce7f3" /><rect x={px(0)} y={py(0)} width={N * U} height={N * U} fill="#dcfce7" /></g>
      {ds.map((i) => <g key={i} stroke="#ffffff" strokeWidth="1.4"><line x1={px(i)} x2={px(i)} y1={py(N)} y2={py(-N)} /><line y1={py(i)} y2={py(i)} x1={px(-N)} x2={px(N)} /></g>)}
      <line x1={px(-N)} x2={px(N) + 12} y1={py(0)} y2={py(0)} stroke="#1e293b" strokeWidth="2.4" markerEnd="url(#tdd-mui)" />
      <line y1={py(-N)} y2={py(N) - 12} x1={px(0)} x2={px(0)} stroke="#1e293b" strokeWidth="2.4" markerEnd="url(#tdd-mui)" />
      <text x={px(N) + 6} y={py(0) + 20} className="tdd-truc">x</text><text x={px(0) - 16} y={py(N) - 2} className="tdd-truc">y</text>
      <text x={px(0) - 13} y={py(0) + 17} className="tdd-truc tdd-o">O</text>
      {[-4, -2, 2, 4].map((i) => <g key={i} className="tdd-so"><text x={px(i)} y={py(0) + 17}>{so(i)}</text><text x={px(0) - 9} y={py(i) + 4} textAnchor="end">{so(i)}</text></g>)}
      {duong && <g clipPath="url(#tdd-khung)">
        <line x1={px(duong[0])} y1={py(duong[1])} x2={px(duong[2])} y2={py(duong[3])} stroke="#60a5fa" strokeWidth="9" opacity=".35" filter="url(#tdd-sang)" className="tdd-ve" />
        <line x1={px(duong[0])} y1={py(duong[1])} x2={px(duong[2])} y2={py(duong[3])} stroke="url(#tdd-dt)" strokeWidth="4" strokeLinecap="round" className="tdd-ve" pathLength={1} />
      </g>}
      {pt && !diem.length && mau.map((x, k) => <circle key={x} cx={px(x)} cy={py(tren(x))} r="6" className="tdd-mau" style={{ animationDelay: `${k * .45}s` }} />)}
      {nhanPt && <g className="tdd-nhan-pt" transform={`translate(${nhanPt.x} ${nhanPt.y})`}>
        <rect x={-pt!.chu.length * 4.6 - 10} y="-15" width={pt!.chu.length * 9.2 + 20} height="26" rx="13" fill="#ffffff" stroke="#7c3aed" strokeWidth="2" />
        <text textAnchor="middle" y="4" fill="#4c1d95">{pt!.chu}</text></g>}
      {diem.map(([x, y], k) => trong(x) && trong(y) && <g key={k}>
        <path d={`M${px(x)} ${py(0)}V${py(y)}H${px(0)}`} fill="none" stroke="#f97316" strokeWidth="1.6" strokeDasharray="4 4" className="tdd-gioi" />
        {daTra && pt && pt.b !== 0 && Math.abs(tren(x) - y) > 1e-9 && trong(tren(x)) && <g className="tdd-so-sanh">
          <line x1={px(x)} y1={py(y)} x2={px(x)} y2={py(tren(x))} stroke="#16a34a" strokeWidth="2.4" strokeDasharray="5 4" />
          <circle cx={px(x)} cy={py(tren(x))} r="7" fill="#ffffff" stroke="#16a34a" strokeWidth="3" />
          <g transform={`translate(${Math.min(px(x) + 12, 196)} ${py(tren(x)) + 5})`}><rect x="0" y="-15" width="94" height="24" rx="12" fill="#16a34a" /><text x="47" y="2" textAnchor="middle" fill="#fff" className="tdd-nho">trên đt: ({so(x)}; {so(tren(x))})</text></g>
        </g>}
        <circle cx={px(x)} cy={py(y)} r="9" className="tdd-vong" />
        <circle cx={px(x)} cy={py(y)} r="6.5" fill="#ef4444" stroke="#ffffff" strokeWidth="2.5" />
        <g transform={`translate(${x > 2 ? px(x) - 12 : px(x) + 12} ${py(y) - 12})`}>
          <rect x={x > 2 ? -66 : 0} y="-14" width="66" height="24" rx="12" fill="#ef4444" />
          <text x={x > 2 ? -33 : 33} y="3" textAnchor="middle" fill="#fff" className="tdd-diem">({so(x)}; {so(y)})</text></g>
        {daTra && pt && pt.b !== 0 && Math.abs(tren(x) - y) < 1e-9 && <g transform={`translate(${Math.min(Math.max(px(x), 66), 234)} ${py(y) > 200 ? py(y) - 30 : py(y) + 30})`} className="tdd-dung">
          <rect x="-72" y="-13" width="144" height="24" rx="12" fill="#16a34a" /><text y="4" textAnchor="middle" fill="#fff" className="tdd-nho">✓ nằm trên đường thẳng</text></g>}
      </g>)}
    </svg>
  );
}
