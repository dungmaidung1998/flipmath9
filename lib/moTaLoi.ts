/**
 * FILE NÀY LÀM GÌ: Mô-đun TypeScript/JavaScript hỗ trợ xử lý dữ liệu và nghiệp vụ trong hệ thống FlipMath 9.
 * AI DÙNG: dùng chung
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: @/lib/dfle/t9-noi-dung.js
 */
/** Tách mô tả lỗi (từ điển lỗi + vi bài học) thành các mẩu ngắn để học sinh đọc nhanh. */
import { CHUONG_T9 } from '@/lib/dfle/t9-noi-dung.js';

export type MoTaLoi = {
  tieuDe: string;
  tenNgan: string;
  chiTiet: string[];
  viDuSai: string[];
  cachDung: string[];
  viDuDung: string | null;
  saiMotDong: string | null;
  dungMotDong: string | null;
  meoNho: string | null;
  coGiaiThich: boolean;
  bai: string | null;
  ku: string | null;
};

type Err = { code: string; ku: string; misconception: string; viDu: string; remediation: string };
type Vbh = { quyTac?: string; viDu?: { de: string; giai: string }[] };
type Unit = { id: string; bai: string; name: string; muc?: string };

const BANG = new Map<string, { e: Err; v: Vbh | null; u: Unit | null }>();
for (const [, C, V] of CHUONG_T9 as [string, { ERRORS: Err[]; UNIT_BY_ID: Map<string, Unit> }, Record<string, Vbh>][]) {
  for (const e of C.ERRORS) BANG.set(e.code, { e, v: V?.[e.remediation] ?? null, u: C.UNIT_BY_ID.get(e.ku) ?? null });
}

// Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
const tach = (s: string, re: RegExp) => s.split(re).map((x) => x.trim().replace(/[.;,]\s*$/, '')).filter(Boolean);
// Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
const hoaDau = (s: string) => /^[a-zà-ỹđ]{2}/.test(s) ? s[0].toUpperCase() + s.slice(1) : s;

/** Tách ở "; " ngoài ngoặc; gộp lại các mẩu số ngắn (1; 2; 3) vào mẩu trước. */
function tachChamPhay(s: string): string[] {
  const ra: string[] = []; let sau = 0, cur = '';
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
    if ('([{'.includes(ch)) sau++; else if (')]}'.includes(ch)) sau = Math.max(0, sau - 1);
    if (ch === ';' && sau === 0 && s[i + 1] === ' ') { ra.push(cur.trim()); cur = ''; i++; continue; }
    cur += ch;
  }
  ra.push(cur.trim());
  const gop: string[] = [];
  for (const x of ra.filter(Boolean)) {
    if (gop.length && x.length <= 4) gop[gop.length - 1] += '; ' + x; else gop.push(x);
  }
  // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
  return gop.map((x) => x.replace(/[.,]\s*$/, ''));
}

/** Câu dài → các ý ngắn: tách ở "; " (ngoài ngoặc) và ", hoặc ". */
const thanhY = (s: string, coHoac = false) =>
  tachChamPhay(s).flatMap((x) => tach(x, coHoac ? /,\s*hoặc\s+|\s+hoặc\s+(?=[a-zà-ỹ])/i : /,\s*hoặc\s+/i));

/**
 * Hàm `rutGonMeo`: nhận (s), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
function rutGonMeo(s: string | undefined): string | null {
  if (!s) return null;
  // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
  let t = s.trim().replace(/\s+/g, ' ');
  const truocChamPhay = t.split(';')[0]?.trim();
  // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
  if (truocChamPhay && truocChamPhay.split(/\s+/).length >= 4) {
    t = truocChamPhay;
  }
  // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
  const words = t.split(/\s+/);
  if (words.length > 15) {
    // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
    t = words.slice(0, 15).join(' ').replace(/[,:;.]$/, '') + '…';
  }
  return t;
}

/**
 * Hàm `rutGonTen`: nhận (tieuDe), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
function rutGonTen(tieuDe: string): string {
  // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
  let t = tieuDe.trim().replace(/[.;]\s*$/, '');
  if (t.length > 64) {
    // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
    const khongNgoac = t.replace(/\s*\([^)]{8,}\)/g, '').replace(/\s+/g, ' ').trim();
    if (khongNgoac.length >= 16) t = khongNgoac;
  }
  return t;
}

/**
 * Hàm `moTaLoi`: nhận (code, duPhong), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
export function moTaLoi(code: string, duPhong?: string): MoTaLoi {
  const r = BANG.get(code);
  if (!r) {
    // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
    const [a, b] = (duPhong ?? 'Lỗi chưa có mô tả').split(/\.\s*Ví dụ:\s*/);
    const viDuSai = b ? tachChamPhay(b) : [];
    const tenNgan = rutGonTen(a);
    return {
      tieuDe: a,
      tenNgan,
      chiTiet: [],
      viDuSai,
      cachDung: [],
      viDuDung: null,
      saiMotDong: viDuSai[0] ?? null,
      dungMotDong: null,
      meoNho: null,
      coGiaiThich: tenNgan !== a || viDuSai.length > 1,
      bai: null,
      ku: null,
    };
  }
  const { e, v, u } = r;
  const i = e.misconception.indexOf(':');
  const y = thanhY(i > 0 ? e.misconception.slice(i + 1) : e.misconception, i > 0).map(hoaDau);
  const tieuDe = i > 0 ? e.misconception.slice(0, i).trim() : y[0];
  const chiTiet = i > 0 ? y : y.slice(1);
  // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
  const cachDung = v?.quyTac ? tach(v.quyTac, /(?<=[.!?])\s+(?=[A-ZÀ-Ỹ√])/) : [];
  // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
  const dung = v?.viDu?.find((x) => /Cách đúng:/i.test(x.giai));
  // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
  const loiGiai = dung ? dung.giai.split(/Cách đúng:\s*/i)[1]?.trim() : '';
  const viDuDung = dung && loiGiai ? `${dung.de} → ${loiGiai}` : null;
  const viDuSai = tachChamPhay(e.viDu);
  // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
  const bai = u ? `${u.bai.split(/[.:]/)[0]}${u.muc && u.muc !== '—' ? ' · ' + u.muc : ''}` : null;

  const tenNgan = rutGonTen(tieuDe);
  const saiMotDong = viDuSai[0] ?? null;
  // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
  const dungMotDong = loiGiai ? hoaDau(loiGiai.replace(/\.\s*$/, '')) : null;
  const meoNho = rutGonMeo(cachDung[0] ?? chiTiet[0]);
  const coGiaiThich =
    tenNgan !== tieuDe ||
    chiTiet.length > 0 ||
    cachDung.length > 1 ||
    viDuSai.length > 1 ||
    Boolean(cachDung[0] && cachDung[0] !== meoNho) ||
    Boolean(viDuDung);

  return {
    tieuDe,
    tenNgan,
    chiTiet,
    viDuSai,
    cachDung,
    viDuDung,
    saiMotDong,
    dungMotDong,
    meoNho,
    coGiaiThich,
    bai,
    ku: e.ku ?? null,
  };
}
