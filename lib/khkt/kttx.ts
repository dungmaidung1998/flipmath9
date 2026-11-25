/**
 * FILE NÀY LÀM GÌ: Hàm thuần xử lý bài KTTX: kiểm khớp tổng điểm, gắn cờ kiểm tra tay (< 0,60), luồng 3 bước (AI nháp → HS xác nhận → Excel chốt), thống kê nghiên cứu và xuất CSV UTF-8 BOM.
 * AI DÙNG: dùng chung
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: không gọi mô-đun nội bộ khác
 */

import {
  chuanHoaTrangThaiKTTX,
  diemKhopNhau,
  SAI_SO_KHOP_DIEM,
} from './kttxChung.js';

export { chuanHoaTrangThaiKTTX, diemKhopNhau, SAI_SO_KHOP_DIEM };

export type TrangThaiKTTX =
  | 'ai-nhap'
  | 'hs-xac-nhan'
  | 'hs-bao-sai'
  | 'da-chot'
  | 'lech'
  | 'tu-choi';

export type CauKTTX = {
  soCau: number;
  noiDungNgan: string;
  kuId: string | null;
  maLoiGoiY: string | null;
  diemDat: number | null;
  diemToiDa: number | null;
  nhanXetGV: string;
  doTinCay: number;
  ghiChuHs?: string | null;
};

export type KhungCauKTTX = {
  soCau: number;
  kuId?: string | null;
  errorCode?: string | null;
  diemToiDa: number;
  moTa?: string;
};

export type KetQuaDocKTTX = {
  tenBaiGoiY: string | null;
  ngayThiGoiY: string | null;
  tongDiemGhiTrenBai: number | null;
  cacCau: CauKTTX[];
  tongTinhDuoc: number;
  tongDiemKhop: boolean;
  chenhLechTongDiem: number | null;
  canKiemTraTay: boolean;
  lyDoCanKiemTra: string[];
};

/**
 * Kiểm tra học sinh có được phép sửa/xác nhận/báo sai trên bài nộp hiện tại hay không.
 * Bài đã `da-chot` sẽ bị khoá hoàn toàn ở phía học sinh.
 */
export function kiemTraChuyenTrangThaiHS(
  trangThaiHienTai: string | null | undefined,
  _hanhDong: 'cap-nhat-sua' | 'xac-nhan-hs' | 'bao-sai-hs'
): { hopLe: boolean; lyDo?: string } {
  const tt = chuanHoaTrangThaiKTTX(trangThaiHienTai);
  if (tt === 'da-chot') {
    return {
      hopLe: false,
      lyDo: 'Bài KTTX đã được giáo viên chốt điểm chính thức, không thể chỉnh sửa hoặc xác nhận lại.',
    };
  }
  return { hopLe: true };
}

/**
 * Kiểm tra điểm từng câu học sinh nhập hợp lệ (>= 0 và không vượt quá điểm tối đa câu) và tính tổng tự cộng.
 */
export function kiemTraDiemCauHopLe(
  cacCau: Pick<CauKTTX, 'soCau' | 'diemDat' | 'diemToiDa'>[]
): { hopLe: boolean; tongTuCong: number; lyDo?: string } {
  let sum = 0;
  for (const c of cacCau) {
    if (c.diemDat == null) continue;
    const d = Number(c.diemDat);
    if (!Number.isFinite(d) || d < 0) {
      return { hopLe: false, tongTuCong: 0, lyDo: `Điểm câu ${c.soCau} không hợp lệ.` };
    }
    if (c.diemToiDa != null && Number.isFinite(Number(c.diemToiDa)) && d > Number(c.diemToiDa) + 0.001) {
      return {
        hopLe: false,
        tongTuCong: 0,
        lyDo: `Điểm đạt câu ${c.soCau} (${d}) vượt quá điểm tối đa (${c.diemToiDa}).`,
      };
    }
    if (d > 100) {
      return { hopLe: false, tongTuCong: 0, lyDo: `Điểm câu ${c.soCau} vượt giới hạn cho phép.` };
    }
    sum += d;
  }
  return { hopLe: true, tongTuCong: Math.round(sum * 100) / 100 };
}

/**
 * Hàm `lamTronDiem`: làm tròn số thực về tối đa 2 chữ số thập phân, loại bỏ giá trị âm/NaN.
 */
export function lamTronDiem(x: number | null | undefined): number | null {
  if (x == null || !Number.isFinite(Number(x))) return null;
  const v = Number(x);
  if (v < 0) return null;
  return Math.round(v * 100) / 100;
}

/**
 * Hàm `chuanHoaMaLoi`: chuẩn hoá mã lỗi định dạng `E-...`, trả `null` nếu không khớp mẫu.
 */
export function chuanHoaMaLoi(raw: unknown): string | null {
  const s = String(raw ?? '').trim().toUpperCase();
  if (!s || !/^E-[A-Z0-9]{2,8}-\d{1,3}$/.test(s)) return null;
  return s;
}

/**
 * Hàm `kiemTraKhopTongDiem`: kiểm tổng điểm các câu với tổng điểm thầy cô ghi trên bài (ngưỡng ±0,15).
 */
export function kiemTraKhopTongDiem(
  cacCau: Pick<CauKTTX, 'diemDat'>[],
  tongDiemGhiTrenBai: number | null
): {
  tongTinhDuoc: number;
  coTongTrenBai: boolean;
  khop: boolean;
  chenhLech: number | null;
} {
  const tongTinhDuoc = Math.round(
    cacCau.reduce((s, c) => s + (c.diemDat != null && Number.isFinite(c.diemDat) ? c.diemDat : 0), 0) * 100
  ) / 100;

  if (tongDiemGhiTrenBai == null || !Number.isFinite(tongDiemGhiTrenBai)) {
    return { tongTinhDuoc, coTongTrenBai: false, khop: true, chenhLech: null };
  }

  const chenhLech = Math.round(Math.abs(tongTinhDuoc - tongDiemGhiTrenBai) * 100) / 100;
  return {
    tongTinhDuoc,
    coTongTrenBai: true,
    khop: chenhLech <= 0.15,
    chenhLech,
  };
}

/**
 * Hàm `xacDinhCanKiemTraTay`: gắn cờ bài cần rà soát kỹ (chưa đọc được câu, tin cậy < 0,60, thiếu điểm, vượt điểm, lệch tổng).
 */
export function xacDinhCanKiemTraTay(
  cacCau: CauKTTX[],
  tongDiemGhiTrenBai: number | null
): { canKiemTra: boolean; lyDo: string[] } {
  const lyDo: string[] = [];

  if (!cacCau.length) {
    lyDo.push('AI chưa tách được câu nào từ ảnh bài làm');
    return { canKiemTra: true, lyDo };
  }

  const cauTinCayThap = cacCau.filter((c) => !Number.isFinite(c.doTinCay) || c.doTinCay < 0.6).map((c) => c.soCau);
  if (cauTinCayThap.length) {
    lyDo.push(`Độ tin cậy thấp (< 0,60) ở câu: ${cauTinCayThap.join(', ')}`);
  }

  const cauThieuDiem = cacCau.filter((c) => c.diemDat == null).map((c) => c.soCau);
  if (cauThieuDiem.length) {
    lyDo.push(`Chưa đọc rõ điểm đạt ở câu: ${cauThieuDiem.join(', ')}`);
  }

  const cauVuotDiem = cacCau
    .filter((c) => c.diemDat != null && c.diemToiDa != null && c.diemDat > c.diemToiDa + 0.01)
    .map((c) => c.soCau);
  if (cauVuotDiem.length) {
    lyDo.push(`Điểm đạt lớn hơn điểm tối đa ở câu: ${cauVuotDiem.join(', ')}`);
  }

  const kiemTong = kiemTraKhopTongDiem(cacCau, tongDiemGhiTrenBai);
  if (kiemTong.coTongTrenBai && !kiemTong.khop) {
    lyDo.push(
      `Tổng điểm các câu (${kiemTong.tongTinhDuoc}) lệch với tổng điểm thầy cô ghi trên bài (${tongDiemGhiTrenBai})`
    );
  }

  return { canKiemTra: lyDo.length > 0, lyDo };
}

/**
 * Hàm `chuanHoaKetQuaDocKTTX`: chuẩn hoá JSON Claude trả về, ghép khung câu và đánh dấu kiểm tra tay.
 */
export function chuanHoaKetQuaDocKTTX(
  raw: {
    tenBaiGoiY?: unknown;
    ngayThiGoiY?: unknown;
    tongDiemGhiTrenBai?: unknown;
    cacCau?: unknown[];
  },
  khungCau: KhungCauKTTX[] = []
): KetQuaDocKTTX {
  const khungMap = new Map(khungCau.map((k) => [k.soCau, k]));
  const rawList = Array.isArray(raw?.cacCau) ? raw.cacCau : [];

  const cacCau: CauKTTX[] = rawList.map((item: any, idx: number) => {
    const soCau = Math.max(1, Math.round(Number(item?.soCau ?? idx + 1) || idx + 1));
    const khung = khungMap.get(soCau);
    const diemToiDaRaw = lamTronDiem(item?.diemToiDa);
    const diemToiDa = diemToiDaRaw ?? (khung ? lamTronDiem(khung.diemToiDa) : null);
    const diemDatRaw = lamTronDiem(item?.diemDat);
    const diemDat = diemDatRaw != null && diemDatRaw <= 10 ? diemDatRaw : null;
    const tinRaw = Number(item?.doTinCay ?? 0.5);
    const doTinCay = Number.isFinite(tinRaw) ? Math.max(0, Math.min(1, Math.round(tinRaw * 100) / 100)) : 0.5;

    return {
      soCau,
      noiDungNgan: String(item?.noiDungNgan ?? khung?.moTa ?? `Câu ${soCau}`).trim().slice(0, 240),
      kuId: String(item?.kuId ?? khung?.kuId ?? '').trim() || null,
      maLoiGoiY: chuanHoaMaLoi(item?.maLoiGoiY) ?? (khung?.errorCode ? chuanHoaMaLoi(khung.errorCode) : null),
      diemDat,
      diemToiDa,
      nhanXetGV: String(item?.nhanXetGV ?? '').trim().slice(0, 500),
      doTinCay,
      ghiChuHs: item?.ghiChuHs ? String(item.ghiChuHs).trim().slice(0, 300) : null,
    };
  });

  cacCau.sort((a, b) => a.soCau - b.soCau);

  const tongRaw = raw?.tongDiemGhiTrenBai == null ? null : lamTronDiem(Number(raw.tongDiemGhiTrenBai));
  const tongDiemGhiTrenBai = tongRaw != null && tongRaw <= 10 ? tongRaw : null;

  const kiemTong = kiemTraKhopTongDiem(cacCau, tongDiemGhiTrenBai);
  const kiemTay = xacDinhCanKiemTraTay(cacCau, tongDiemGhiTrenBai);

  return {
    tenBaiGoiY: raw?.tenBaiGoiY ? String(raw.tenBaiGoiY).trim().slice(0, 180) : null,
    ngayThiGoiY: raw?.ngayThiGoiY ? String(raw.ngayThiGoiY).trim().slice(0, 40) : null,
    tongDiemGhiTrenBai,
    cacCau,
    tongTinhDuoc: kiemTong.tongTinhDuoc,
    tongDiemKhop: kiemTong.khop,
    chenhLechTongDiem: kiemTong.chenhLech,
    canKiemTraTay: kiemTay.canKiemTra,
    lyDoCanKiemTra: kiemTay.lyDo,
  };
}

/**
 * Gom nhóm mã lỗi phát sinh để giáo viên duyệt ghi vào Sổ lỗi.
 * Chỉ lấy lỗi ở các câu thực sự bị trừ điểm hoặc đã gán mã lỗi tường minh.
 */
export function gomNhomLoiKTTX(
  cacCau: CauKTTX[],
  khungCau: KhungCauKTTX[] = []
): { errorCode: string; kuId: string; soCauList: number[] }[] {
  const khungMap = new Map(khungCau.map((k) => [k.soCau, k]));
  const map = new Map<string, { errorCode: string; kuId: string; soCauSet: Set<number> }>();

  for (const c of cacCau) {
    const matDiem =
      c.diemDat != null &&
      c.diemToiDa != null &&
      c.diemToiDa > 0 &&
      c.diemDat < c.diemToiDa - 0.01;
    if (!matDiem && !c.maLoiGoiY) continue;
    if (c.diemDat != null && c.diemToiDa != null && c.diemDat >= c.diemToiDa - 0.01) continue;

    const code = chuanHoaMaLoi(c.maLoiGoiY) ?? chuanHoaMaLoi(khungMap.get(c.soCau)?.errorCode);
    if (!code) continue;
    const kuId = (c.kuId || khungMap.get(c.soCau)?.kuId || '').trim();
    const key = `${code}|${kuId}`;
    const entry = map.get(key) ?? { errorCode: code, kuId, soCauSet: new Set<number>() };
    entry.soCauSet.add(c.soCau);
    map.set(key, entry);
  }

  return Array.from(map.values()).map((v) => ({
    errorCode: v.errorCode,
    kuId: v.kuId,
    soCauList: Array.from(v.soCauSet).sort((a, b) => a - b),
  }));
}

/** Chuyển danh sách câu từ bảng `de_kiem_tra.cau_hoi` sang khung câu KTTX thang 10. */
export function chuyenDeKiemTraSangKhungCau(cauHoiJson: unknown[]): KhungCauKTTX[] {
  const ds = Array.isArray(cauHoiJson) ? cauHoiJson : [];
  if (!ds.length) return [];
  const diemMoiCau = Math.round((10 / ds.length) * 100) / 100;
  return ds.map((c: any, idx: number) => ({
    soCau: idx + 1,
    kuId: String(c?.ku_id ?? '').trim() || null,
    errorCode: c?.error_by_option ? String(Object.values(c.error_by_option)[0] ?? '').trim() || null : null,
    diemToiDa: idx === ds.length - 1 ? Math.round((10 - diemMoiCau * (ds.length - 1)) * 100) / 100 : diemMoiCau,
    moTa: String(c?.stem ?? `Câu ${idx + 1}`).replace(/\s+/g, ' ').slice(0, 120),
  }));
}

export type BaiNopThongKeInput = {
  student_id: string;
  ten_hs?: string;
  trang_thai: TrangThaiKTTX | 'cho-duyet' | 'da-duyet' | string;
  tong_diem: number | null;
  can_kiem_tra: boolean;
  cac_cau: CauKTTX[];
  tong_diem_ai?: number | null;
  tong_diem_hs?: number | null;
  tong_diem_excel?: number | null;
  hs_ly_do_bao_sai?: string | null;
  chua_co_anh?: boolean;
};

/**
 * Thống kê tổng hợp lớp học cho bảng KTTX giáo viên (tương thích cả trạng thái cũ và luồng 3 bước mới).
 */
export function tinhThongKeBaiKTTX(
  baiNopList: BaiNopThongKeInput[],
  siSoLop: number
): {
  soHsNop: number;
  siSoLop: number;
  tiLeNopPct: number | null;
  choDuyet: number;
  daDuyet: number;
  hsXacNhan: number;
  hsBaoSai: number;
  lech: number;
  canKiemTraTay: number;
  diemTB: number | null;
  diemTrungVi: number | null;
  topLoi: { errorCode: string; soLan: number }[];
  cauHaySai: { soCau: number; tiLeMatDiemPct: number; soLuot: number }[];
} {
  const hsSet = new Set(baiNopList.map((b) => b.student_id));
  const normList = baiNopList.map((b) => ({ ...b, tt: chuanHoaTrangThaiKTTX(b.trang_thai) }));
  const daDuyet = normList.filter((b) => b.tt === 'da-chot').length;
  const hsXacNhan = normList.filter((b) => b.tt === 'hs-xac-nhan').length;
  const hsBaoSai = normList.filter((b) => b.tt === 'hs-bao-sai').length;
  const lech = normList.filter((b) => b.tt === 'lech').length;
  const choDuyet = normList.filter((b) => b.tt !== 'da-chot' && b.tt !== 'tu-choi').length;
  const canKiemTraTay = baiNopList.filter((b) => b.can_kiem_tra).length;

  const diems = baiNopList
    .map((b) => b.tong_diem)
    .filter((d): d is number => d != null && Number.isFinite(d))
    .sort((a, b) => a - b);

  const diemTB = diems.length
    ? Math.round((diems.reduce((s, d) => s + d, 0) / diems.length) * 100) / 100
    : null;
  const diemTrungVi = diems.length
    ? diems.length % 2 === 1
      ? diems[(diems.length - 1) / 2]
      : Math.round(((diems[diems.length / 2 - 1] + diems[diems.length / 2]) / 2) * 100) / 100
    : null;

  const loiMap = new Map<string, number>();
  const cauMap = new Map<number, { sai: number; tong: number }>();

  for (const b of baiNopList) {
    for (const c of b.cac_cau ?? []) {
      const stat = cauMap.get(c.soCau) ?? { sai: 0, tong: 0 };
      stat.tong += 1;
      const matDiem = c.diemDat != null && c.diemToiDa != null && c.diemDat < c.diemToiDa - 0.01;
      if (matDiem) {
        stat.sai += 1;
      }
      cauMap.set(c.soCau, stat);
      if (c.maLoiGoiY && (matDiem || c.diemDat == null)) {
        loiMap.set(c.maLoiGoiY, (loiMap.get(c.maLoiGoiY) ?? 0) + 1);
      }
    }
  }

  const topLoi = Array.from(loiMap.entries())
    .map(([errorCode, soLan]) => ({ errorCode, soLan }))
    .sort((a, b) => b.soLan - a.soLan)
    .slice(0, 8);

  const cauHaySai = Array.from(cauMap.entries())
    .map(([soCau, v]) => ({
      soCau,
      tiLeMatDiemPct: v.tong ? Math.round((v.sai / v.tong) * 100) : 0,
      soLuot: v.tong,
    }))
    .sort((a, b) => b.tiLeMatDiemPct - a.tiLeMatDiemPct || a.soCau - b.soCau);

  return {
    soHsNop: hsSet.size,
    siSoLop,
    tiLeNopPct: siSoLop > 0 ? Math.round((hsSet.size / siSoLop) * 100) : null,
    choDuyet,
    daDuyet,
    hsXacNhan,
    hsBaoSai,
    lech,
    canKiemTraTay,
    diemTB,
    diemTrungVi,
    topLoi,
    cauHaySai,
  };
}

export type BaiNopNghienCuuInput = {
  trang_thai?: string | null;
  tong_diem_ai?: number | null;
  tong_diem_hs?: number | null;
  tong_diem_excel?: number | null;
  hs_ly_do_bao_sai?: string | null;
  cau_doi_chieu?: Array<{ diem_ai: number | null; diem_chot: number | null }>;
};

export type ThongKeNghienCuuKTTX = {
  aiTrungExcel: { trung: number; n: number; tiLePct: number | null };
  aiTrungExcelTheoCau: { trung: number; n: number; tiLePct: number | null };
  hsTrungExcel: { trung: number; n: number; tiLePct: number | null };
  baoSaiDungThat: { soBai: number; coDoiChieu: number; tongBaoSai: number };
};

/**
 * Tính 3 chỉ số nghiên cứu KHKT (kèm cỡ mẫu n) cho đối chiếu 3 lớp điểm: AI, học sinh, Excel giáo viên.
 */
export function tinhThongKeNghienCuuKTTX(rows: BaiNopNghienCuuInput[]): ThongKeNghienCuuKTTX {
  let aiN = 0;
  let aiTrung = 0;
  let cauN = 0;
  let cauTrung = 0;
  let hsN = 0;
  let hsTrung = 0;
  let tongBaoSai = 0;
  let coDoiChieuBaoSai = 0;
  let baoSaiDungThat = 0;

  for (const r of rows) {
    const ai = r.tong_diem_ai != null && Number.isFinite(Number(r.tong_diem_ai)) ? Number(r.tong_diem_ai) : null;
    const hs = r.tong_diem_hs != null && Number.isFinite(Number(r.tong_diem_hs)) ? Number(r.tong_diem_hs) : null;
    const ex = r.tong_diem_excel != null && Number.isFinite(Number(r.tong_diem_excel)) ? Number(r.tong_diem_excel) : null;

    if (ai != null && ex != null) {
      aiN += 1;
      if (diemKhopNhau(ai, ex, SAI_SO_KHOP_DIEM)) aiTrung += 1;
    }

    if (hs != null && ex != null) {
      hsN += 1;
      if (diemKhopNhau(hs, ex, SAI_SO_KHOP_DIEM)) hsTrung += 1;
    }

    for (const c of r.cau_doi_chieu ?? []) {
      if (c.diem_ai != null && c.diem_chot != null) {
        cauN += 1;
        if (diemKhopNhau(c.diem_ai, c.diem_chot, SAI_SO_KHOP_DIEM)) cauTrung += 1;
      }
    }

    const laBaoSai = r.trang_thai === 'hs-bao-sai' || Boolean(r.hs_ly_do_bao_sai && String(r.hs_ly_do_bao_sai).trim());
    if (laBaoSai) {
      tongBaoSai += 1;
      if (ex != null) {
        coDoiChieuBaoSai += 1;
        if (ai == null || !diemKhopNhau(ai, ex, SAI_SO_KHOP_DIEM)) {
          baoSaiDungThat += 1;
        }
      }
    }
  }

  return {
    aiTrungExcel: {
      trung: aiTrung,
      n: aiN,
      tiLePct: aiN > 0 ? Math.round((aiTrung * 1000) / aiN) / 10 : null,
    },
    aiTrungExcelTheoCau: {
      trung: cauTrung,
      n: cauN,
      tiLePct: cauN > 0 ? Math.round((cauTrung * 1000) / cauN) / 10 : null,
    },
    hsTrungExcel: {
      trung: hsTrung,
      n: hsN,
      tiLePct: hsN > 0 ? Math.round((hsTrung * 1000) / hsN) / 10 : null,
    },
    baoSaiDungThat: {
      soBai: baoSaiDungThat,
      coDoiChieu: coDoiChieuBaoSai,
      tongBaoSai,
    },
  };
}

/**
 * Bọc chuỗi ô CSV an toàn, chặn CSV formula injection (=, +, -, @, tab, CR).
 */
function oCsvAnToan(val: unknown): string {
  let s = String(val ?? '').replace(/\r?\n/g, ' ');
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

/**
 * Xuất bảng điểm KTTX dạng CSV UTF-8 BOM (đủ điểm AI, điểm HS, điểm Excel/chốt, lý do báo sai và từng câu).
 */
export function xuatCsvKTTX(
  tenBai: string,
  rows: (BaiNopThongKeInput & { ngay_nop?: string })[]
): string {
  const maxCau = rows.reduce(
    (mx, r) => Math.max(mx, ...(r.cac_cau ?? []).map((c) => c.soCau), 0),
    0
  );
  const headers = [
    'Bài KTTX',
    'Mã HS',
    'Tên hiển thị',
    'Trạng thái',
    'Cần kiểm tra tay',
    'Tổng điểm chốt',
    'Điểm AI đọc',
    'Điểm HS xác nhận',
    'Điểm Excel GV',
    'Lý do HS báo sai',
    ...Array.from({ length: maxCau }, (_, i) => `Câu ${i + 1}`),
    'Mã lỗi phát hiện',
    'Ngày nộp',
  ];

  const lines = [headers.map(oCsvAnToan).join(',')];
  for (const r of rows) {
    const cauByNum = new Map((r.cac_cau ?? []).map((c) => [c.soCau, c]));
    const loiStr = Array.from(
      new Set((r.cac_cau ?? []).map((c) => c.maLoiGoiY).filter(Boolean))
    ).join('; ');
    const fmt = (v: number | null | undefined) => (v != null ? String(v).replace('.', ',') : '');
    const cols = [
      tenBai,
      r.student_id,
      r.ten_hs ?? r.student_id,
      r.trang_thai,
      r.can_kiem_tra ? 'Có' : 'Không',
      fmt(r.tong_diem),
      fmt(r.tong_diem_ai),
      fmt(r.tong_diem_hs),
      fmt(r.tong_diem_excel),
      r.hs_ly_do_bao_sai ?? '',
      ...Array.from({ length: maxCau }, (_, i) => {
        const c = cauByNum.get(i + 1);
        return fmt(c?.diemDat);
      }),
      loiStr,
      r.ngay_nop ?? '',
    ];
    lines.push(cols.map(oCsvAnToan).join(','));
  }
  return '\uFEFF' + lines.join('\r\n');
}
