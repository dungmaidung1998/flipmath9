/**
 * FILE NÀY LÀM GÌ: Mô-đun TypeScript/JavaScript hỗ trợ xử lý dữ liệu và nghiệp vụ trong hệ thống FlipMath 9.
 * AI DÙNG: dùng chung
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: không gọi mô-đun nội bộ khác
 */
/**
 * Tính toán toạ độ SVG theo tỉ lệ dữ kiện đề bài và kiểm tra hợp lệ cho hình học Toán 9.
 * Module thuần TypeScript (không phụ thuộc React/DOM) dùng chung cho QuestionFigure.tsx và script kiểm tra.
 */

export type Quat = { loai: 'quat'; chuong?: string; tieuDe?: string; duLieu: [string, number][] };
export type DoanThang = {
  loai: 'doan-thang';
  chuong?: string;
  tieuDe?: string;
  trucX?: string;
  trucY?: string;
  duLieu: [string, number][];
};
export type HinhVe = { loai: 'hinh'; chuong?: string; moTa: string; anh?: string; fallback?: string };

export type TamGiacVuong = {
  loai: 'tam-giac-vuong';
  chuong?: string;
  moTa: string;
  /** [đỉnh góc vuông (dưới trái), đỉnh trên, đỉnh phải] */
  dinh?: [string, string, string];
  canh?: { tren?: string; ngang?: string; huyen?: string };
  goc?: { tren?: string; phai?: string };
  nhanCanh?: { tren?: string; ngang?: string; huyen?: string };
  /** Tỉ lệ thật dùng để tính toạ độ; cạnh lớn không bị méo nếu chênh nhẹ. */
  tyLe?: { tren?: number; ngang?: number; huyen?: number; gocTren?: number; gocPhai?: number };
};

export type DuongTronCu = {
  loai: 'duong-tron';
  chuong?: string;
  moTa: string;
  mau: 'day' | 'goc-tam' | 'quat' | 'vanh-khuyen' | 'tiep-tuyen' | 'hai-tiep-tuyen' | 'day-chung';
  nhan?: Record<string, string>;
  diemB?: boolean;
};

export type DiemDuongTron = {
  ten: string;
  goc: number;
  t?: number;
  dx?: number;
  dy?: number;
};

export type DuongTronDay = {
  loai: 'duong-tron-day';
  chuong?: string;
  moTa: string;
  tam?: string;
  anTam?: boolean;
  anDuongTron?: boolean;
  diem: DiemDuongTron[];
  doan?: { tu: string; den: string; netDut?: boolean; chinh?: boolean; nhan?: string }[];
  daGiac?: { dinh: string[]; chinh?: boolean; toNhe?: boolean };
  vuongTai?: { dinh: string; a: string; b: string }[];
  cung?: {
    tuGoc: number;
    denGoc: number;
    cungLon?: boolean;
    toNhe?: boolean;
    cungGoc?: boolean;
    nhanCung?: string;
    nhanGoc?: string;
  }[];
  nhanThem?: { goc: number; t: number; text: string }[];
  R?: string;
};

export type TiepTuyen = {
  loai: 'tiep-tuyen';
  chuong?: string;
  moTa: string;
  kieu: 'mot' | 'hai' | 'noi-tiep';
  R?: number;
  OM?: number;
  MA?: number;
  gocAMO?: number;
  gocAMB?: number;
  gocAOB?: number;
  diemB?: boolean;
  veOM?: boolean;
  veDayAB?: boolean;
  hienVuong?: boolean;
  tamGiac?: {
    a: number; // BC
    b: number; // AC
    c: number; // AB
    ten?: [string, string, string]; // [A, B, C]
    tiepDiem?: [string, string, string]; // [D on AB, E on AC, F on BC]
    vuongTaiA?: boolean;
  };
  nhan?: {
    R?: string;
    OM?: string;
    MA?: string;
    MB?: string;
    goc?: string;
    gocTam?: string;
    day?: string;
    AB?: string;
    AC?: string;
    BC?: string;
    AD?: string;
  };
};

export type HaiDuongTron = {
  loai: 'hai-duong-tron';
  chuong?: string;
  moTa: string;
  R: number;
  r: number;
  d: number;
  veDayChung?: boolean;
  hienVuongH?: boolean;
  nhan?: { R?: string; r?: string; d?: string; O1?: string; O2?: string; day?: string };
};

export type QuatVanhKhuyen = {
  loai: 'quat-vanh-khuyen';
  chuong?: string;
  moTa: string;
  kieu: 'quat' | 'cung' | 'vanh-khuyen';
  R: number;
  r?: number;
  goc?: number;
  veGocVuong?: boolean;
  nhan?: {
    R?: string;
    r?: string;
    duongKinh?: string;
    duongKinhNgoai?: string;
    duongKinhTrong?: string;
    doDay?: string;
    goc?: string;
    cung?: string;
    S?: string;
  };
};

export type Hinh =
  | Quat
  | DoanThang
  | HinhVe
  | TamGiacVuong
  | DuongTronCu
  | DuongTronDay
  | TiepTuyen
  | HaiDuongTron
  | QuatVanhKhuyen;

export type D2 = { x: number; y: number };

const RAD = Math.PI / 180;
// Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
export const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const pos = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v) && v > 0;
const nonNeg = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v) && v >= 0;

/**
 * Hàm `diemTrenVong`: nhận (o, r, deg), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
export function diemTrenVong(o: D2, r: number, deg: number): D2 {
  return { x: o.x + r * Math.cos(deg * RAD), y: o.y - r * Math.sin(deg * RAD) };
}

/**
 * Hàm `donVi`: nhận (a, b), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
function donVi(a: D2, b: D2): D2 {
  const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
  return { x: (b.x - a.x) / len, y: (b.y - a.y) / len };
}

/**
 * Hàm `trongTam`: nhận (pts), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
function trongTam(pts: D2[]): D2 {
  if (!pts.length) return { x: 180, y: 120 };
  const s = pts.reduce((acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }), { x: 0, y: 0 });
  return { x: s.x / pts.length, y: s.y / pts.length };
}

/** Kiểm tra cấu trúc dữ liệu `hinh` hợp lệ trước khi render hoặc chạy script kiểm thử. */
export function hinhHopLe(h: unknown): h is Hinh {
  if (!h || typeof h !== 'object') return false;
  const x = h as Record<string, unknown>;
  if (x.loai === 'quat' || x.loai === 'doan-thang') {
    return Array.isArray(x.duLieu) && x.duLieu.length > 0;
  }
  if (typeof x.moTa !== 'string' || !x.moTa.trim()) return false;
  switch (x.loai) {
    case 'hinh':
    case 'tam-giac-vuong':
    case 'duong-tron':
      return true;
    case 'duong-tron-day':
      return Array.isArray(x.diem) && x.diem.every((d: any) => d && typeof d.ten === 'string' && Number.isFinite(d.goc));
    case 'tiep-tuyen':
      if (x.kieu === 'noi-tiep') {
        const tg = x.tamGiac as any;
        return !!tg && pos(tg.a) && pos(tg.b) && pos(tg.c) && tg.a + tg.b > tg.c && tg.a + tg.c > tg.b && tg.b + tg.c > tg.a;
      }
      return x.kieu === 'mot' || x.kieu === 'hai';
    case 'hai-duong-tron':
      return pos(x.R) && pos(x.r) && nonNeg(x.d);
    case 'quat-vanh-khuyen':
      if (!pos(x.R)) return false;
      if (x.kieu === 'vanh-khuyen') return x.r == null || (pos(x.r) && (x.r as number) < (x.R as number));
      return x.kieu === 'quat' || x.kieu === 'cung';
    default:
      return false;
  }
}

/**
 * Hàm `tinhToaDoTamGiacVuong`: nhận (h), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
export function tinhToaDoTamGiacVuong(h: TamGiacVuong) {
  const tl = h.tyLe;
  let ratio = 150 / 240; // ~0.625 mặc định dễ đọc
  if (tl) {
    if (pos(tl.tren) && pos(tl.ngang)) {
      ratio = tl.tren / tl.ngang;
    } else if (pos(tl.huyen) && pos(tl.tren) && tl.huyen > tl.tren) {
      // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
      ratio = tl.tren / Math.sqrt(tl.huyen * tl.huyen - tl.tren * tl.tren);
    } else if (pos(tl.huyen) && pos(tl.ngang) && tl.huyen > tl.ngang) {
      // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
      ratio = Math.sqrt(tl.huyen * tl.huyen - tl.ngang * tl.ngang) / tl.ngang;
    } else if (pos(tl.gocPhai) && tl.gocPhai < 89) {
      // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
      ratio = Math.tan(tl.gocPhai * RAD);
    } else if (pos(tl.gocTren) && tl.gocTren < 89) {
      // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
      ratio = 1 / Math.tan(tl.gocTren * RAD);
    }
  }
  ratio = clamp(ratio, 0.45, 1.85);

  const maxW = 240;
  const maxH = 152;
  let w = maxW;
  let height = w * ratio;
  if (height > maxH) {
    height = maxH;
    w = height / ratio;
  }
  // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
  w = Math.max(104, w);
  // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
  height = Math.max(82, height);

  // Căn giữa phần hình trong khung 360x230, chừa chỗ nhãn bên trái/dưới/trên
  const ax = clamp((360 - w) / 2 + 6, 62, 130);
  const ay = clamp(190, 178, 196);
  const A: D2 = { x: ax, y: ay };
  const B: D2 = { x: ax, y: ay - height };
  const C: D2 = { x: ax + w, y: ay };
  const uBC = donVi(B, C);
  // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
  const gocTrenRad = Math.atan2(w, height);
  // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
  const gocPhaiRad = Math.atan2(height, w);
  const rGocB = clamp(height * 0.24, 22, 34);
  const rGocC = clamp(w * 0.22, 24, 42);
  const arcBEnd = { x: B.x + rGocB * uBC.x, y: B.y + rGocB * uBC.y };
  const arcCStart = { x: C.x - rGocC, y: C.y };
  const arcCEnd = { x: C.x - rGocC * Math.cos(gocPhaiRad), y: C.y - rGocC * Math.sin(gocPhaiRad) };

  return {
    W: 360,
    H: 230,
    A,
    B,
    C,
    rGocB,
    rGocC,
    gocTrenRad,
    gocPhaiRad,
    arcBEnd,
    arcCStart,
    arcCEnd,
    trenMid: { x: A.x - 10, y: (A.y + B.y) / 2 },
    ngangMid: { x: (A.x + C.x) / 2, y: A.y + 20 },
    huyenMid: { x: (B.x + C.x) / 2 + 12, y: (B.y + C.y) / 2 - 12 },
  };
}

/**
 * Hàm `tinhToaDoDuongTronDay`: nhận (h), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
export function tinhToaDoDuongTronDay(h: DuongTronDay) {
  const W = 360;
  const H = 248;
  const O: D2 = { x: 180, y: 124 };
  const R = 82;

  const ptMap = new Map<string, { x: number; y: number; lx: number; ly: number; ten: string }>();
  const diem: { x: number; y: number; lx: number; ly: number; ten: string; showDot: boolean }[] = [];

  for (const d of h.diem) {
    const t = d.t ?? 1;
    const p = t === 0 ? { ...O } : diemTrenVong(O, R * t, d.goc);
    const out = t === 0 ? { x: -0.7, y: 0.7 } : donVi(O, p);
    const offset = d.ten ? 15 : 0;
    const item = {
      ten: d.ten,
      x: p.x,
      y: p.y,
      lx: p.x + out.x * offset + (d.dx ?? 0),
      ly: p.y + out.y * offset + (d.dy ?? 0),
      showDot: Boolean(d.ten),
    };
    if (d.ten) ptMap.set(d.ten, item);
    diem.push(item);
  }

  const getP = (key: string): D2 => {
    if (key === (h.tam ?? 'O')) return O;
    return ptMap.get(key) ?? O;
  };

  const doan = (h.doan ?? []).map((seg) => {
    const p1 = getP(seg.tu);
    const p2 = getP(seg.den);
    const mid = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
    const out = Math.hypot(mid.x - O.x, mid.y - O.y) > 4 ? donVi(O, mid) : { x: 0, y: -1 };
    // Đẩy nhãn ra ngoài nhẹ để không đè lên đoạn thẳng
    const perp = { x: -(p2.y - p1.y), y: p2.x - p1.x };
    const plen = Math.hypot(perp.x, perp.y) || 1;
    const nx = perp.x / plen;
    const ny = perp.y / plen;
    const dotOut = nx * out.x + ny * out.y;
    const sx = dotOut >= 0 ? nx : -nx;
    const sy = dotOut >= 0 ? ny : -ny;
    const anchor = sx > 0.45 ? 'start' : sx < -0.45 ? 'end' : 'middle';
    const dist = anchor === 'middle' ? 14 : 9;
    return {
      x1: p1.x,
      y1: p1.y,
      x2: p2.x,
      y2: p2.y,
      netDut: Boolean(seg.netDut),
      chinh: Boolean(seg.chinh),
      nhan: seg.nhan,
      anchor: anchor as 'start' | 'middle' | 'end',
      lx: mid.x + sx * dist,
      ly: mid.y + sy * dist,
    };
  });

  const daGiac = h.daGiac
    ? {
        pts: h.daGiac.dinh.map((k) => getP(k)),
        chinh: Boolean(h.daGiac.chinh),
        toNhe: Boolean(h.daGiac.toNhe),
      }
    : null;

  const vuongTai = (h.vuongTai ?? []).map((v) => {
    const pv = getP(v.dinh);
    return { p: pv, u: donVi(pv, getP(v.a)), v: donVi(pv, getP(v.b)) };
  });

  const cung = (h.cung ?? []).map((c) => {
    const ccw = ((c.denGoc - c.tuGoc) % 360 + 360) % 360 || 360;
    let sweepFlag: 0 | 1;
    let largeArc: 0 | 1;
    let midAngle: number;
    if (c.cungLon) {
      largeArc = ccw === 180 ? 0 : 1;
      if (ccw >= 180) {
        sweepFlag = 0;
        midAngle = c.tuGoc + ccw / 2;
      } else {
        sweepFlag = 1;
        midAngle = c.tuGoc - (360 - ccw) / 2;
      }
    } else {
      largeArc = 0;
      if (ccw <= 180) {
        sweepFlag = 0;
        midAngle = c.tuGoc + ccw / 2;
      } else {
        sweepFlag = 1;
        midAngle = c.tuGoc - (360 - ccw) / 2;
      }
    }
    const p1 = diemTrenVong(O, R, c.tuGoc);
    const p2 = diemTrenVong(O, R, c.denGoc);
    const rGoc = 22;
    const g1 = diemTrenVong(O, rGoc, c.tuGoc);
    const g2 = diemTrenVong(O, rGoc, c.denGoc);
    const arcLabelPt = diemTrenVong(O, R + 18, midAngle);
    const gocLabelPt = diemTrenVong(O, 36, midAngle);
    return {
      arcPath: `M ${p1.x} ${p1.y} A ${R} ${R} 0 ${largeArc} ${sweepFlag} ${p2.x} ${p2.y}`,
      sectorPath: `M ${O.x} ${O.y} L ${p1.x} ${p1.y} A ${R} ${R} 0 ${largeArc} ${sweepFlag} ${p2.x} ${p2.y} Z`,
      angleArcPath: `M ${g1.x} ${g1.y} A ${rGoc} ${rGoc} 0 ${largeArc} ${sweepFlag} ${g2.x} ${g2.y}`,
      toNhe: Boolean(c.toNhe),
      cungGoc: c.cungGoc !== false,
      nhanCung: c.nhanCung,
      nhanGoc: c.nhanGoc,
      arcLabelPt,
      gocLabelPt,
    };
  });

  const nhanThem = (h.nhanThem ?? []).map((item) => ({
    ...diemTrenVong(O, R * item.t, item.goc),
    text: item.text,
  }));

  return { W, H, O, R, diem, doan, daGiac, vuongTai, cung, nhanThem };
}

/**
 * Hàm `tinhToaDoTiepTuyen`: nhận (h), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
export function tinhToaDoTiepTuyen(h: TiepTuyen) {
  const W = 360;
  const H = 240;

  if (h.kieu === 'noi-tiep' && h.tamGiac) {
    const { a, b, c } = h.tamGiac;
    const B0: D2 = { x: 0, y: 0 };
    const C0: D2 = { x: a, y: 0 };
    const xA = (c * c + a * a - b * b) / (2 * a);
    // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
    const yA = -Math.sqrt(Math.max(1e-6, c * c - xA * xA));
    const A0: D2 = { x: xA, y: yA };

    const s = (a + b + c) / 2;
    // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
    const area = 0.5 * a * Math.abs(yA);
    const r0 = area / s;
    const I0: D2 = {
      x: (a * A0.x + b * B0.x + c * C0.x) / (2 * s),
      y: (a * A0.y + b * B0.y + c * C0.y) / (2 * s),
    };
    const D0: D2 = { x: A0.x + ((s - a) / c) * (B0.x - A0.x), y: A0.y + ((s - a) / c) * (B0.y - A0.y) };
    const E0: D2 = { x: A0.x + ((s - a) / b) * (C0.x - A0.x), y: A0.y + ((s - a) / b) * (C0.y - A0.y) };
    const F0: D2 = { x: B0.x + ((s - b) / a) * (C0.x - B0.x), y: B0.y + ((s - b) / a) * (C0.y - B0.y) };

    // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
    const minX = Math.min(A0.x, B0.x, C0.x);
    // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
    const maxX = Math.max(A0.x, B0.x, C0.x);
    const minY = A0.y;
    const maxY = 0;
    const scale = Math.min(246 / (maxX - minX || 1), 160 / (maxY - minY || 1));
    const ox = (W - (maxX - minX) * scale) / 2 - minX * scale;
    const oy = (H - (maxY - minY) * scale) / 2 - minY * scale + 6;
    const mapP = (p: D2): D2 => ({ x: ox + p.x * scale, y: oy + p.y * scale });

    const A = mapP(A0);
    const B = mapP(B0);
    const C = mapP(C0);
    const I = mapP(I0);
    const D = mapP(D0);
    const E = mapP(E0);
    const F = mapP(F0);
    const centroid = trongTam([A, B, C]);
    const labelPt = (p: D2, dist = 16): D2 => {
      const u = donVi(centroid, p);
      return { x: p.x + u.x * dist, y: p.y + u.y * dist };
    };
    const [nA, nB, nC] = h.tamGiac.ten ?? ['A', 'B', 'C'];
    const [nD, nE, nF] = h.tamGiac.tiepDiem ?? ['D', 'E', 'F'];

    return {
      W,
      H,
      kieu: 'noi-tiep' as const,
      A,
      B,
      C,
      I,
      D,
      E,
      F,
      rPx: r0 * scale,
      ten: { A: nA, B: nB, C: nC, D: nD, E: nE, F: nF },
      posTen: {
        A: labelPt(A, 15),
        B: labelPt(B, 16),
        C: labelPt(C, 16),
        D: labelPt(D, 14),
        E: labelPt(E, 14),
        F: labelPt(F, 14),
      },
      uAB: donVi(A, B),
      uAC: donVi(A, C),
    };
  }

  // Tính tỉ số k = OM / R từ dữ liệu thật của bài
  let k = 1.85;
  if (pos(h.R) && pos(h.OM) && h.OM > h.R) {
    k = h.OM / h.R;
  } else if (pos(h.R) && pos(h.MA)) {
    k = Math.hypot(h.R, h.MA) / h.R;
  } else if (pos(h.gocAMO) && h.gocAMO < 82) {
    k = 1 / Math.sin(h.gocAMO * RAD);
  } else if (pos(h.gocAMB) && h.gocAMB < 164) {
    k = 1 / Math.sin((h.gocAMB / 2) * RAD);
  } else if (pos(h.gocAOB) && h.gocAOB < 168) {
    k = 1 / Math.cos((h.gocAOB / 2) * RAD);
  }
  k = clamp(k, 1.42, 2.65);

  const Rpx = clamp(248 / (1 + k), 46, 70);
  const t = Math.acos(1 / k);
  const totalW = Rpx + k * Rpx;
  const Ox = (W - totalW) / 2 + Rpx;
  const Oy = h.kieu === 'mot' ? 142 : 120;
  const O: D2 = { x: Ox, y: Oy };
  const M: D2 = { x: Ox + k * Rpx, y: Oy };
  const A: D2 = { x: Ox + Rpx * Math.cos(t), y: Oy - Rpx * Math.sin(t) };
  const B: D2 =
    h.kieu === 'mot'
      ? { x: Ox + Rpx, y: Oy }
      : { x: Ox + Rpx * Math.cos(t), y: Oy + Rpx * Math.sin(t) };

  return {
    W,
    H,
    kieu: h.kieu as 'mot' | 'hai',
    O,
    M,
    A,
    B,
    Rpx,
    t,
    uAO: donVi(A, O),
    uAM: donVi(A, M),
    uBO: donVi(B, O),
    uBM: donVi(B, M),
  };
}

/**
 * Hàm `tinhToaDoHaiDuongTron`: nhận (h), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
export function tinhToaDoHaiDuongTron(h: HaiDuongTron) {
  const W = 360;
  const H = 232;
  const { R, r, d } = h;
  // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
  const minRawX = Math.min(-R, d - r);
  // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
  const maxRawX = Math.max(R, d + r);
  const spanX = maxRawX - minRawX || 2 * R;
  // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
  const spanY = 2 * Math.max(R, r);
  const scale = Math.min(268 / spanX, 152 / spanY);

  // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
  const Rpx = Math.max(18, R * scale);
  // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
  const rpx = Math.max(14, r * scale);
  const dpx = d * scale;

  // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
  const leftPx = Math.min(-Rpx, dpx - rpx);
  // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
  const rightPx = Math.max(Rpx, dpx + rpx);
  const O1x = (W - (leftPx + rightPx)) / 2;
  const Oy = 112;
  const O1: D2 = { x: O1x, y: Oy };
  const O2: D2 = { x: O1x + dpx, y: Oy };

  // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
  const catNhau = d > Math.abs(R - r) + 1e-6 && d < R + r - 1e-6;
  let inter: { A: D2; B: D2; H: D2 } | null = null;
  if (catNhau && dpx > 1) {
    const xRel = (dpx * dpx + Rpx * Rpx - rpx * rpx) / (2 * dpx);
    // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
    const yRel = Math.sqrt(Math.max(0, Rpx * Rpx - xRel * xRel));
    inter = {
      A: { x: O1.x + xRel, y: Oy - yRel },
      B: { x: O1.x + xRel, y: Oy + yRel },
      H: { x: O1.x + xRel, y: Oy },
    };
  }

  return { W, H, O1, O2, Rpx, rpx, dpx, inter };
}

/**
 * Hàm `tinhToaDoQuatVanhKhuyen`: nhận (h), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
export function tinhToaDoQuatVanhKhuyen(h: QuatVanhKhuyen) {
  const W = 360;
  const H = 236;
  if (h.kieu === 'vanh-khuyen') {
    const O: D2 = { x: 180, y: 118 };
    const Rpx = 84;
    const rpx = h.r && h.R > 0 ? clamp(Rpx * (h.r / h.R), 24, 66) : 48;
    const P = diemTrenVong(O, Rpx, 28);
    const Q = diemTrenVong(O, rpx, 210);
    return { W, H, kieu: 'vanh-khuyen' as const, O, Rpx, rpx, P, Q };
  }

  const O: D2 = { x: 180, y: h.goc && h.goc > 165 ? 128 : 138 };
  const Rpx = 82;
  const goc = clamp(h.goc ?? 90, 8, 352);
  // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
  const startDeg = goc <= 95 ? 12 : Math.max(0, 90 - goc / 2);
  const endDeg = startDeg + goc;
  const A = diemTrenVong(O, Rpx, endDeg);
  const B = diemTrenVong(O, Rpx, startDeg);
  const midDeg = (startDeg + endDeg) / 2;
  const largeArc = goc > 180 ? 1 : 0;
  const gA = diemTrenVong(O, 22, endDeg);
  const gB = diemTrenVong(O, 22, startDeg);

  return {
    W,
    H,
    kieu: h.kieu,
    O,
    Rpx,
    goc,
    A,
    B,
    uOA: donVi(O, A),
    uOB: donVi(O, B),
    cungPath: `M ${A.x} ${A.y} A ${Rpx} ${Rpx} 0 ${largeArc} 1 ${B.x} ${B.y}`,
    quatPath: `M ${O.x} ${O.y} L ${A.x} ${A.y} A ${Rpx} ${Rpx} 0 ${largeArc} 1 ${B.x} ${B.y} Z`,
    gPath: `M ${gA.x} ${gA.y} A 22 22 0 ${largeArc} 1 ${gB.x} ${gB.y}`,
    gocLabel: diemTrenVong(O, 36, midDeg),
    cungLabel: diemTrenVong(O, Rpx + 18, midDeg),
    rLabel: { x: (O.x + B.x) / 2, y: (O.y + B.y) / 2 + 18 },
  };
}

/** Kiểm tra toàn diện hình hợp lệ, mọi toạ độ không NaN, nằm gọn trong viewBox, và thu thập các nhãn hiển thị. */
export function kiemTraHinhVaToaDo(h: Hinh): { ok: boolean; loi?: string; nhanTexts: string[] } {
  if (!hinhHopLe(h)) return { ok: false, loi: 'Cấu trúc hinh không hợp lệ hoặc thiếu trường bắt buộc.', nhanTexts: [] };

  const pts: D2[] = [];
  const labels: string[] = [];
  let W = 360;
  let H = 248;

  const pushRectCircle = (c: D2, r: number) => {
    pts.push({ x: c.x - r, y: c.y }, { x: c.x + r, y: c.y }, { x: c.x, y: c.y - r }, { x: c.x, y: c.y + r });
  };

  if (h.loai === 'tam-giac-vuong') {
    const t = tinhToaDoTamGiacVuong(h);
    W = t.W;
    H = t.H;
    pts.push(t.A, t.B, t.C);
    [h.canh?.tren, h.canh?.ngang, h.canh?.huyen, h.goc?.tren, h.goc?.phai].forEach((s) => s && labels.push(s));
  } else if (h.loai === 'duong-tron-day') {
    const t = tinhToaDoDuongTronDay(h);
    W = t.W;
    H = t.H;
    pushRectCircle(t.O, t.R);
    t.diem.forEach((d) => pts.push({ x: d.x, y: d.y }));
    t.doan.forEach((d) => d.nhan && labels.push(d.nhan));
    t.cung.forEach((c) => {
      if (c.nhanCung) labels.push(c.nhanCung);
      if (c.nhanGoc) labels.push(c.nhanGoc);
    });
    if (h.R) labels.push(h.R);
  } else if (h.loai === 'tiep-tuyen') {
    const t = tinhToaDoTiepTuyen(h);
    W = t.W;
    H = t.H;
    if (t.kieu === 'noi-tiep') {
      pts.push(t.A, t.B, t.C, t.I, t.D, t.E, t.F);
    } else {
      pushRectCircle(t.O, t.Rpx);
      pts.push(t.M, t.A, t.B);
    }
    if (h.nhan) Object.values(h.nhan).forEach((s) => s && labels.push(s));
  } else if (h.loai === 'hai-duong-tron') {
    const t = tinhToaDoHaiDuongTron(h);
    W = t.W;
    H = t.H;
    pushRectCircle(t.O1, t.Rpx);
    pushRectCircle(t.O2, t.rpx);
    if (h.nhan) Object.values(h.nhan).forEach((s) => s && labels.push(s));
  } else if (h.loai === 'quat-vanh-khuyen') {
    const t = tinhToaDoQuatVanhKhuyen(h);
    W = t.W;
    H = t.H;
    if (t.kieu === 'vanh-khuyen') {
      pushRectCircle(t.O, t.Rpx);
    } else {
      pts.push(t.O, t.A, t.B, t.cungLabel);
    }
    if (h.nhan) Object.values(h.nhan).forEach((s) => s && labels.push(s));
  }

  for (const p of pts) {
    if (!Number.isFinite(p.x) || !Number.isFinite(p.y)) {
      return { ok: false, loi: `Toạ độ chứa NaN/Infinity: (${p.x}, ${p.y})`, nhanTexts: labels };
    }
    if (p.x < -4 || p.x > W + 4 || p.y < -4 || p.y > H + 4) {
      return { ok: false, loi: `Toạ độ (${p.x.toFixed(1)}, ${p.y.toFixed(1)}) vượt khỏi viewBox ${W}x${H}`, nhanTexts: labels };
    }
  }

  return { ok: true, nhanTexts: labels };
}
