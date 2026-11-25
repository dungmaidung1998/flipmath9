/**
 * FILE NÀY LÀM GÌ: Mô-đun TypeScript/JavaScript hỗ trợ xử lý dữ liệu và nghiệp vụ trong hệ thống FlipMath 9.
 * AI DÙNG: dùng chung
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: ./diaDanh, ./chapters
 */
import { DIA_DANH } from './diaDanh';
import { chapterOf } from './chapters';

type MetaChuong = {
  donVi: string;
  thuong: string;
  bieuTuong: string;
};

const META_CHUONG: Record<string, MetaChuong> = {
  C1: { donVi: 'món hàng', thuong: 'Giỏ quà nơ đỏ', bieuTuong: '🧺' },
  C2: { donVi: 'quả cân', thuong: 'Cân vàng', bieuTuong: '⚖️' },
  C3: { donVi: 'nhát đục', thuong: 'Tượng ngọc', bieuTuong: '⛏️' },
  C4: { donVi: 'trụ cáp', thuong: 'Cờ trên đỉnh', bieuTuong: '🚡' },
  C5: { donVi: 'góc quay', thuong: 'Vé VIP vòng quay', bieuTuong: '🎡' },
  C6: { donVi: 'bữa ăn', thuong: 'Rồng phun nước', bieuTuong: '🐉' },
  C7: { donVi: 'xô cát', thuong: 'Lâu đài cắm cờ', bieuTuong: '🪣' },
  C8: { donVi: 'chặng rừng', thuong: 'Ảnh cả đàn voọc', bieuTuong: '🐒' },
  C9: { donVi: 'nhịp cầu', thuong: 'Cầu Vàng lung linh', bieuTuong: '🌉' },
  C10: { donVi: 'lớp đất', thuong: 'Báu vật trong tủ kính', bieuTuong: '🏺' },
};

export type ChuDeChuong = {
  chuong: string;
  mau: string;
  ten: string;
  chuDe: string;
  mucTen: readonly [string, string, string, string, string];
  donVi: string;
  thuong: string;
  icon: string;
  iconImg: string;
  bieuTuong: string;
  hoi: string;
  anhMuc: (i: number) => string;
  tranh: string;
  nvBin: string;
  nvNa: string;
  thuongAnh: string;
  huyHieu: string;
  sticker: (i: number) => string;
};

/** Chuẩn hoá mã chương ("C3", "C3-B9-M1", 3, "3") thành "C1".."C10"; trả null nếu không thuộc C1..C10. */
export function maChuong(kuHoacChuong?: string | number | null): string | null {
  if (kuHoacChuong == null) return null;
  if (typeof kuHoacChuong === 'number') {
    if (!Number.isInteger(kuHoacChuong) || kuHoacChuong < 1 || kuHoacChuong > 10) return null;
    const c = `C${kuHoacChuong}`;
    return DIA_DANH[c] ? c : null;
  }
  const s = String(kuHoacChuong).trim();
  if (!s) return null;
  // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
  if (/^(10|[1-9])$/.test(s)) {
    const c = `C${s}`;
    return DIA_DANH[c] ? c : null;
  }
  const tuKu = chapterOf(s);
  if (tuKu && DIA_DANH[tuKu]) return tuKu;
  // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
  const match = /^(C(?:10|[1-9]))(?:-|$)/i.exec(s);
  if (!match) return null;
  const c = match[1].toUpperCase();
  return DIA_DANH[c] ? c : null;
}

/** Lấy toàn bộ thông tin chủ đề chương từ ku_id hoặc mã/số chương. */
export function chuDeChuong(kuHoacChuong?: string | number | null): ChuDeChuong | null {
  const c = maChuong(kuHoacChuong);
  if (!c) return null;
  const dia = DIA_DANH[c];
  const meta = META_CHUONG[c];
  if (!dia || !meta) return null;
  return {
    chuong: c,
    mau: dia.mau,
    ten: dia.ten,
    chuDe: dia.chuDe,
    mucTen: dia.mucTen,
    donVi: meta.donVi,
    thuong: meta.thuong,
    icon: dia.icon,
    iconImg: `/fluent/${dia.icon}_3d.png`,
    bieuTuong: meta.bieuTuong,
    hoi: dia.hoi,
    anhMuc: (i: number) => `/vuon/${c}-${Math.max(0, Math.min(4, Math.round(i)))}.webp`,
    tranh: `/chu-de/canh/${c}.webp`,
    nvBin: `/chu-de/nv/bin-${c}.webp`,
    nvNa: `/chu-de/nv/na-${c}.webp`,
    thuongAnh: `/chu-de/thuong/${c}.webp`,
    huyHieu: `/chu-de/huy-hieu/${c}.webp`,
    sticker: (i: number) => `/chu-de/sticker/${c}-${Math.max(1, Math.min(6, Math.round(i)))}.webp`,
  };
}

const STICKER_KEYWORDS: Record<string, [RegExp, number][]> = {
  C1: [
    [/orange|cam|tangerine|🍊/i, 1],
    [/mango|xoài|🥭/i, 2],
    [/bill|constant|set up|word problem|algebraic|express|receipt|🧾|💵|📄/i, 3],
    [/equation|balance|weight|unknown|⚖️/i, 4],
    [/intersection|line|parallel|coordinate|axis|origin|intercept|🚦|🛣️|🗺️/i, 5],
    [/downstream|upstream|speed|boat|river|🚣|🛶|🚌/i, 6],
  ],
  C2: [
    [/pizza|denominator|numerator|🍕/i, 1],
    [/chocolate|common denominator|🍫/i, 2],
    [/positive|negative|number line|thermometer|🌡️|🥶|📉/i, 3],
    [/less than or equal|lift|at most|🛗/i, 4],
    [/inequality|greater|less than|height|transitive|🎢|🐘|🐜|🏃/i, 5],
    [/payload|truck|🚚/i, 6],
  ],
  C3: [
    [/square root|perfect square|garden|🟩|🟦/i, 1],
    [/cube|volume|ice|🎲|🧊/i, 2],
    [/resistance|kettle|🔥/i, 3],
    [/power|bulb|💡/i, 4],
    [/voltage|socket|🔌/i, 5],
    [/edge|rubik|📦/i, 6],
  ],
  C4: [
    [/ladder|hypotenuse|opposite side|adjacent side|leg|🪜/i, 1],
    [/kite|🪁/i, 2],
    [/flagpole|shadow|height|altitude|🌳|🚩/i, 3],
    [/take off|depression|plane|✈️|🛩️/i, 4],
    [/clinometer|elevation|angle|🔭|👀/i, 5],
    [/calculator|trigonometric|degree|sine|cosine|tangent|cotangent|🧮|📐/i, 6],
  ],
  C5: [
    [/radius|bicycle|circumference|wheel|🚲|🛞/i, 1],
    [/central angle|clock|measure of an arc|🕐|🕒/i, 2],
    [/annulus|donut|sector|🍕|🍩/i, 3],
    [/concentric|centre|dartboard|🎯/i, 4],
    [/arc|semicircle|rainbow|🌈|🌗/i, 5],
    [/tangent|gear|⚙️/i, 6],
  ],
  C6: [
    [/parabola|fountain|⛲/i, 1],
    [/quadratic|basketball|🏀/i, 2],
    [/function|vending|🥤/i, 3],
    [/graph|📈/i, 4],
    [/root\b|🌱/i, 5],
    [/discriminant|sum of the roots|product of the roots|🔍/i, 6],
  ],
  C7: [
    [/bar chart|histogram|frequency table|📊|📶/i, 1],
    [/pie chart|relative frequency|percentage|🥧|💯/i, 2],
    [/frequency|vote|🔁/i, 3],
    [/data|inspect|📋/i, 4],
    [/grouped data|class interval|🗂️|📦/i, 5],
    [/table|note/i, 6],
  ],
  C8: [
    [/dice|random experiment|sample space|🎲/i, 1],
    [/coin|heads|tails|outcome|🪙/i, 2],
    [/event|probability|rain|🌧️|🌦️/i, 3],
    [/favourable|🍀/i, 4],
    [/card|box/i, 5],
    [/spinner/i, 6],
  ],
  C9: [
    [/regular polygon|octagon|🛑/i, 1],
    [/circumscribed|inscribed circle|triangle|🍪|⭕/i, 2],
    [/inscribed angle|rotation|wheel|🎡/i, 3],
    [/cyclic quadrilateral|kite|🪁/i, 4],
    [/similar triangles|photo|📸/i, 5],
    [/prove|detective|🕵️/i, 6],
  ],
  C10: [
    [/cylinder|base|lateral|🥫/i, 1],
    [/cone|🍦/i, 2],
    [/sphere|surface area|⚽|🎈/i, 3],
    [/slant height|hat|👒/i, 4],
    [/tank|volume/i, 5],
    [/cubic centimetre|sugar|🧊/i, 6],
  ],
};

/** Chọn sticker nhóm F (/chu-de/sticker/C{n}-{1..6}.webp) phù hợp ngữ nghĩa cho khung Ngoài đời. */
export function stickerChoTu(en: string, chuong?: string | number | null, emoji?: string): string | null {
  const c = maChuong(chuong);
  if (!c) return null;
  const text = `${en} ${emoji ?? ''}`;
  const rules = STICKER_KEYWORDS[c];
  if (rules) {
    for (const [re, idx] of rules) {
      if (re.test(text)) return `/chu-de/sticker/${c}-${idx}.webp`;
    }
  }
  const hash = [...en.toLowerCase()].reduce((acc, ch) => (acc * 31 + ch.charCodeAt(0)) >>> 0, 5);
  return `/chu-de/sticker/${c}-${(hash % 6) + 1}.webp`;
}
