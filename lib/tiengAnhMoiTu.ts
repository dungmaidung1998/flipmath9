/**
 * FILE NÀY LÀM GÌ: Dữ liệu từ vựng, bộ ảnh 12 bài Toán tiếng Anh (Chương I–IV) và lưu tiến độ luyện tập ở trình duyệt.
 * AI DÙNG: dùng chung
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: @/lib/dfle/t9-tieng-anh-bai.js, @/lib/dfle/t9-tieng-anh-mo-rong.js, @/lib/dfle/t9-tieng-anh-thuc-te.js, @/lib/chuDeChuong
 */
import * as taBai from '@/lib/dfle/t9-tieng-anh-bai.js';
import * as taMoRong from '@/lib/dfle/t9-tieng-anh-mo-rong.js';
import * as taThucTe from '@/lib/dfle/t9-tieng-anh-thuc-te.js';
import { chuDeChuong } from '@/lib/chuDeChuong';

export const BAI_MAU_C1 = [1, 2, 3] as const;
export const BAI_CO_HINH = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17] as const;
export const TONG_SO_TU = 275;

/**
 * Hàm `chuongTuBai`: nhận (baiSo), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
export function chuongTuBai(baiSo: number): string {
  if (baiSo >= 1 && baiSo <= 3) return 'C1';
  if (baiSo >= 4 && baiSo <= 6) return 'C2';
  if (baiSo >= 7 && baiSo <= 10) return 'C3';
  if (baiSo >= 11 && baiSo <= 12) return 'C4';
  if (baiSo >= 13 && baiSo <= 17) return 'C5';
  return 'C1';
}

type TuGoc = {
  en: string;
  loai: string;
  ipa: string;
  vi: string;
  cau: string;
  hinh: string;
  sua?: string;
};

type BaiGoc = {
  chuong: string;
  ten: string;
  tenVi: string;
  meo?: string;
  truyen?: any;
  tu: TuGoc[];
};

type MoRong = {
  dn: string;
  de: string;
  nhan: string;
  la: string;
  khong: string;
};

const TIENG_ANH_BAI = (taBai as unknown as { TIENG_ANH_BAI: Record<number, BaiGoc> }).TIENG_ANH_BAI;
const moRongTu = (taMoRong as unknown as { moRongTu: (en: string) => MoRong | null }).moRongTu;
const deNhamFn = (taMoRong as unknown as { deNham: (en: string) => string | null }).deNham;
const DE_NHAM = (taMoRong as unknown as { DE_NHAM: Record<string, string> }).DE_NHAM;
const NHOM = (
  taMoRong as unknown as {
    NHOM: {
      docCongThuc: [string, string, string][];
      tuLenh: [string, string, string][];
      mauCau: [string, string, string][];
      tuKhoa: [string, string, string][];
      trongLop: [string, string][];
    };
  }
).NHOM;
const viDuThucTeFn = (
  taThucTe as unknown as { viDuThucTe: (en: string) => [string, string, string] | null }
).viDuThucTe;

export type TuDayDu = {
  slug: string;
  en: string;
  loai: string;
  ipa: string;
  vi: string;
  cau: string;
  hinh: string;
  sua?: string;
  dn: string;
  de: string;
  nhan: string;
  la: string;
  khong: string;
  deNham: string | null;
  thucTe: [string, string, string] | null;
  imgSrc: string;
  fallbackImg: string;
  emojiFallback: string;
};

export type BaiInfo = {
  baiSo: number;
  chuong: string;
  ten: string;
  tenVi: string;
  meo?: string;
};

/**
 * Hàm `slugTu`: nhận (en), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
export function slugTu(en: string): string {
  return String(en ?? '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Hàm `anhTu`: nhận (en), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
export function anhTu(en: string): string {
  return `/tieng-anh/tu/${slugTu(en)}.webp`;
}

/**
 * Hàm `anhCheDo`: nhận (id), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
export function anhCheDo(id: string): string {
  return `/tieng-anh/che-do/${id}.webp`;
}

/**
 * Hàm `layBai`: nhận (baiSo), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
export function layBai(baiSo: number): BaiInfo | null {
  const b = TIENG_ANH_BAI?.[baiSo];
  if (!b) return null;
  return {
    baiSo,
    chuong: b.chuong || chuongTuBai(baiSo),
    ten: b.ten,
    tenVi: b.tenVi,
    meo: b.meo
  };
}

/**
 * Hàm `layTuBai`: nhận (baiSo), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
export function layTuBai(baiSo: number): TuDayDu[] {
  const b = TIENG_ANH_BAI?.[baiSo];
  if (!b?.tu?.length) return [];
  const chuongId = b.chuong || chuongTuBai(baiSo);
  const cd = chuDeChuong(chuongId);
  const fallbackImg = cd?.iconImg ?? `/minh-hoa/chuong/${chuongId}.webp`;

  return b.tu.map((w) => {
    const mr = moRongTu(w.en);
    const tt = viDuThucTeFn(w.en);
    const dn = deNhamFn(w.en);
    return {
      ...w,
      slug: slugTu(w.en),
      dn: mr?.dn ?? `Key concept in ${b.ten}.`,
      de: mr?.de ?? w.cau,
      nhan: mr?.nhan ?? w.en.toUpperCase(),
      la: mr?.la ?? (w.hinh || w.en),
      khong: mr?.khong ?? '',
      deNham: dn,
      thucTe: tt,
      imgSrc: anhTu(w.en),
      fallbackImg,
      emojiFallback: tt?.[0] ?? cd?.bieuTuong ?? '📐'
    };
  });
}

/**
 * Hàm `timTuTrongBai`: nhận (baiSo, slug), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
export function timTuTrongBai(baiSo: number, slug?: string | null) {
  const ds = layTuBai(baiSo);
  if (!ds.length) return { ds, index: 0, tu: null as TuDayDu | null };
  const s = (slug ?? '').trim().toLowerCase();
  const idx = s ? ds.findIndex((t) => t.slug === s) : 0;
  const index = idx >= 0 ? idx : 0;
  return { ds, index, tu: ds[index] };
}

export type CheDoId =
  | 'hoc'
  | 'the'
  | 'nghe-chon'
  | 'nghe-viet'
  | 'noi'
  | 'ghep-cap'
  | 'xep-cau'
  | 'on-hom-nay';

export const CHE_DO: { id: CheDoId; icon: string; ten: string; imgSrc: string }[] = [
  { id: 'hoc', icon: '📖', ten: 'Học', imgSrc: anhCheDo('hoc') },
  { id: 'the', icon: '🃏', ten: 'Thẻ lật', imgSrc: anhCheDo('the-lat') },
  { id: 'nghe-chon', icon: '🎧', ten: 'Nghe chọn', imgSrc: anhCheDo('nghe-chon') },
  { id: 'nghe-viet', icon: '⌨️', ten: 'Nghe viết', imgSrc: anhCheDo('nghe-viet') },
  { id: 'noi', icon: '🎙️', ten: 'Nói', imgSrc: anhCheDo('noi') },
  { id: 'ghep-cap', icon: '🔗', ten: 'Ghép cặp', imgSrc: anhCheDo('ghep-cap') },
  { id: 'xep-cau', icon: '🧩', ten: 'Xếp câu', imgSrc: anhCheDo('xep-cau') },
  { id: 'on-hom-nay', icon: '🔁', ten: 'Ôn hôm nay', imgSrc: anhCheDo('on-hom-nay') }
];

export type NhomTabId = 'tu-vung' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'I';

export const NHOM_TAB: { id: NhomTabId; ten: string }[] = [
  { id: 'tu-vung', ten: 'Từ vựng bài' },
  { id: 'B', ten: 'B · Đọc công thức' },
  { id: 'C', ten: 'C · Từ lệnh' },
  { id: 'D', ten: 'D · Mẫu câu lời giải' },
  { id: 'E', ten: 'E · Từ khoá bài toán' },
  { id: 'F', ten: 'F · Từ dễ nhầm' },
  { id: 'G', ten: 'G · Tiếng Anh trong lớp' },
  { id: 'I', ten: 'I · Mini đề' }
];

export type MucNhom = {
  chinh: string;
  phu: string;
  viDu?: string;
  doc: string;
};

/**
 * Hàm `layNhomNoiDung`: nhận (id), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
export function layNhomNoiDung(id: 'B' | 'C' | 'D' | 'E' | 'F' | 'G'): MucNhom[] {
  if (id === 'B') {
    return NHOM.docCongThuc.map(([ct, doc, vi]) => ({
      chinh: ct,
      phu: `${doc} — ${vi}`,
      doc
    }));
  }
  if (id === 'C') {
    return NHOM.tuLenh.map(([en, vi, vd]) => ({
      chinh: en,
      phu: vi,
      viDu: vd,
      doc: en
    }));
  }
  if (id === 'D') {
    return NHOM.mauCau.map(([en, vi, vd]) => ({
      chinh: en,
      phu: vi,
      viDu: vd || undefined,
      doc: (vd || en).replace(/…/g, '')
    }));
  }
  if (id === 'E') {
    return NHOM.tuKhoa.map(([en, vi, phep]) => ({
      chinh: en,
      phu: `${vi} (ký hiệu: ${phep})`,
      doc: en.split(',')[0].replace(/…/g, '')
    }));
  }
  if (id === 'F') {
    return Object.entries(DE_NHAM).map(([tu, giaiThich]) => ({
      chinh: tu,
      phu: giaiThich,
      doc: tu
    }));
  }
  return NHOM.trongLop.map(([en, vi]) => ({
    chinh: en,
    phu: vi,
    doc: en.replace(/…/g, '')
  }));
}

export type CauMiniDe = {
  id: string;
  hoi: string;
  goiYVi: string;
  phuongAn: string[];
  dung: number;
  giaiThich: string;
};

export const MINI_DE_C1: CauMiniDe[] = [
  {
    id: 'c1-1',
    hoi: 'Which of the following is a linear equation in two variables?',
    goiYVi: 'Phương trình nào sau đây là phương trình bậc nhất hai ẩn?',
    phuongAn: ['xy + 2 = 0', '3x − 4y = 7', 'x² + y = 5', '2/x + y = 1'],
    dung: 1,
    giaiThich: '3x − 4y = 7 has the form ax + by = c with a = 3, b = −4 (linear in x and y).'
  },
  {
    id: 'c1-2',
    hoi: 'Check which ordered pair is a solution of 2x + y = 5.',
    goiYVi: 'Cặp số có thứ tự nào là nghiệm của phương trình 2x + y = 5?',
    phuongAn: ['(1; 2)', '(2; 1)', '(3; 0)', '(0; 2)'],
    dung: 1,
    giaiThich: 'Substitute x = 2, y = 1: 2(2) + 1 = 5 ✓.'
  },
  {
    id: 'c1-3',
    hoi: 'Which method solves x + y = 5, x − y = 1 by adding the two equations side by side?',
    goiYVi: 'Phương pháp nào cộng từng vế hai phương trình để khử một ẩn?',
    phuongAn: ['Substitution method', 'Elimination method', 'Graphing method', 'Estimation'],
    dung: 1,
    giaiThich: 'Elimination method (phương pháp cộng đại số) removes y when adding side by side.'
  },
  {
    id: 'c1-4',
    hoi: 'If two straight lines in the coordinate plane are parallel, how many solutions does the system have?',
    goiYVi: 'Hai đường thẳng song song thì hệ phương trình có bao nhiêu nghiệm?',
    phuongAn: ['Unique solution', 'Two solutions', 'No solution', 'Infinitely many solutions'],
    dung: 2,
    giaiThich: 'Parallel lines never intersect, so the system has no solution (vô nghiệm).'
  },
  {
    id: 'c1-5',
    hoi: 'What is the downstream speed of a boat with own speed x and current speed y?',
    goiYVi: 'Vận tốc xuôi dòng của thuyền khi vận tốc riêng là x và dòng nước là y?',
    phuongAn: ['x − y', 'x + y', 'x · y', 'y − x'],
    dung: 1,
    giaiThich: 'Downstream speed = own speed + current speed = x + y.'
  },
  {
    id: 'c1-6',
    hoi: '"A car goes 120 km in total. Let x be the speed..." — Here "speed" means:',
    goiYVi: 'Từ "speed" trong bài toán chuyển động nghĩa là gì?',
    phuongAn: ['năng suất', 'quãng đường', 'vận tốc', 'ẩn số'],
    dung: 2,
    giaiThich: 'Speed = vận tốc; productivity = năng suất; unknown = ẩn số.'
  }
];

// ================= SRS 1–3–7 NGÀY & CHUỖI NGÀY (localStorage có try/catch) =================

const KEY_TIEN_DO = 'f9_ta_moi_tu_v1';

export type MucSRS = { muc: 0 | 1 | 2 | 3; han: string };
export type TienDoTA = {
  thuoc: string[];
  srs: Record<string, MucSRS>;
  chuoi: number;
  ngayCuoi: string;
};

/**
 * Hàm `ngayHomNayVN`: nhận (không tham số), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
export function ngayHomNayVN(): string {
  // Xử lý mốc ngày giờ theo múi giờ Việt Nam (UTC+7)
  const d = new Date(Date.now() + 7 * 3600_000);
  return d.toISOString().slice(0, 10);
}

/**
 * Hàm `congNgay`: nhận (isoNgay, soNgay), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
function congNgay(isoNgay: string, soNgay: number): string {
  // Xử lý mốc ngày giờ theo múi giờ Việt Nam (UTC+7)
  const ms = Date.parse(`${isoNgay}T00:00:00Z`) + soNgay * 86400_000;
  return new Date(ms).toISOString().slice(0, 10);
}

/**
 * Hàm `docTienDoTA`: nhận (không tham số), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
export function docTienDoTA(): TienDoTA {
  const rong: TienDoTA = { thuoc: [], srs: {}, chuoi: 0, ngayCuoi: '' };
  try {
    const raw = window.localStorage.getItem(KEY_TIEN_DO);
    if (!raw) return rong;
    const p = JSON.parse(raw);
    return {
      thuoc: Array.isArray(p?.thuoc) ? p.thuoc.filter((x: unknown) => typeof x === 'string') : [],
      srs: p?.srs && typeof p.srs === 'object' ? p.srs : {},
      chuoi: Number.isFinite(Number(p?.chuoi)) ? Number(p.chuoi) : 0,
      ngayCuoi: typeof p?.ngayCuoi === 'string' ? p.ngayCuoi : ''
    };
  } catch {
    return rong;
  }
}

/**
 * Hàm `luuTienDoTA`: nhận (td), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
export function luuTienDoTA(td: TienDoTA): void {
  try {
    window.localStorage.setItem(KEY_TIEN_DO, JSON.stringify(td));
  } catch {
    // Bỏ qua khi trình duyệt chặn storage
  }
}

/**
 * Hàm `ghiNhanHoatDongNgay`: nhận (td), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
export function ghiNhanHoatDongNgay(td: TienDoTA): TienDoTA {
  const homNay = ngayHomNayVN();
  if (td.ngayCuoi === homNay) return td;
  const homQua = congNgay(homNay, -1);
  const chuoiMoi = td.ngayCuoi === homQua ? td.chuoi + 1 : 1;
  const moi: TienDoTA = { ...td, chuoi: chuoiMoi, ngayCuoi: homNay };
  luuTienDoTA(moi);
  return moi;
}

/**
 * Hàm `danhDauThuoc`: nhận (td, slug, daThuoc), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
export function danhDauThuoc(td: TienDoTA, slug: string, daThuoc: boolean): TienDoTA {
  const set = new Set(td.thuoc);
  if (daThuoc) set.add(slug);
  else set.delete(slug);
  const base = ghiNhanHoatDongNgay({ ...td, thuoc: Array.from(set) });
  luuTienDoTA(base);
  return base;
}

/**
 * Hàm `capNhatSRS`: nhận (td, slug, nho), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
export function capNhatSRS(td: TienDoTA, slug: string, nho: boolean): TienDoTA {
  const homNay = ngayHomNayVN();
  const cu = td.srs[slug]?.muc ?? 0;
  // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
  const mucMoi: 0 | 1 | 2 | 3 = nho ? (Math.min(3, cu + 1) as 0 | 1 | 2 | 3) : 1;
  const buocNgay = mucMoi === 1 ? 1 : mucMoi === 2 ? 3 : 7;
  const hanMoi = congNgay(homNay, buocNgay);

  const thuocSet = new Set(td.thuoc);
  if (nho && mucMoi >= 2) thuocSet.add(slug);

  const cap = ghiNhanHoatDongNgay({
    ...td,
    thuoc: Array.from(thuocSet),
    srs: { ...td.srs, [slug]: { muc: mucMoi, han: hanMoi } }
  });
  luuTienDoTA(cap);
  return cap;
}

/**
 * Hàm `layTuCanOn`: nhận (ds, td), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
export function layTuCanOn(ds: TuDayDu[], td: TienDoTA): TuDayDu[] {
  const homNay = ngayHomNayVN();
  const denHan = ds.filter((w) => {
    const s = td.srs[w.slug];
    return s && s.han <= homNay;
  });
  if (denHan.length > 0) return denHan;
  const chuaThuoc = ds.filter((w) => !td.thuoc.includes(w.slug));
  return chuaThuoc.length > 0 ? chuaThuoc.slice(0, 6) : ds.slice(0, 5);
}
