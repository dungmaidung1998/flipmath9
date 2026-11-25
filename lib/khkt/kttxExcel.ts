/**
 * FILE NÀY LÀM GÌ: Tạo file mẫu Excel (.xlsx) và đọc/đối chiếu bảng điểm Excel ở phía máy chủ cho giáo viên chốt điểm KTTX.
 * AI DÙNG: máy chủ (API / scripts) — KHÔNG import từ component trình duyệt
 * LẤY DỮ LIỆU TỪ: buffer file .xlsx giáo viên tải lên và danh sách học sinh/bài nộp lớp
 * GỌI TỚI: exceljs, @/lib/khkt/kttx
 */
import ExcelJS from 'exceljs';
import {
  chuanHoaTrangThaiKTTX,
  diemKhopNhau,
  SAI_SO_KHOP_DIEM,
} from './kttxChung.js';

export const TOI_DA_BYTES_EXCEL = 2 * 1024 * 1024;
export const TOI_DA_DONG_HS = 60;

export type HocSinhLopExcel = {
  student_id: string;
  display_name: string | null;
};

export type DongBangDiemExcel = {
  dongSo: number;
  maHS: string;
  hoTen: string;
  diem: number | null;
  loi?: string;
};

export type BaiNopDoiChieuInput = {
  id: string;
  student_id: string;
  trang_thai: string;
  tong_diem_ai: number | null;
  tong_diem_hs: number | null;
  tong_diem_tren_bai?: number | null;
  tong_diem_gv?: number | null;
  tong_diem_excel?: number | null;
  hs_ly_do_bao_sai?: string | null;
  chua_co_anh?: boolean;
};

export type KetQuaDoiChieuExcel = {
  khop: {
    student_id: string;
    ten_hs: string;
    bai_nop_id: string;
    diem_ai: number | null;
    diem_hs: number;
    diem_excel: number;
    trang_thai_cu: string;
  }[];
  lech: {
    student_id: string;
    ten_hs: string;
    bai_nop_id: string;
    diem_ai: number | null;
    diem_hs: number;
    diem_excel: number;
    ly_do_hs: string | null;
    trang_thai_cu: string;
  }[];
  chuaNopHoacChuaXacNhan: {
    student_id: string;
    ten_hs: string;
    bai_nop_id: string | null;
    diem_ai: number | null;
    diem_excel: number;
    chuaCoAnh: boolean;
    trang_thai_cu: string | null;
  }[];
  khongGhepDuoc: {
    dongSo: number;
    maHS: string;
    hoTen: string;
    diemRaw: string;
    lyDo: string;
  }[];
  tongDongHopLe: number;
};

/**
 * Chuẩn hoá tên tiếng Việt để đối chiếu linh hoạt: bỏ dấu, chuyển đ/Đ thành d, viết thường, gom khoảng trắng.
 */
export function chuanHoaTenVN(raw: unknown): string {
  return String(raw ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Rút giá trị text thuần từ ô Excel (hỗ trợ ô công thức `{ result }`, richText `{ richText }`, chuỗi, số).
 */
function layGiaTriO(val: ExcelJS.CellValue): unknown {
  if (val == null) return '';
  if (typeof val === 'object') {
    if ('result' in val && val.result !== undefined) return val.result;
    if ('richText' in val && Array.isArray(val.richText)) {
      return val.richText.map((x) => x.text ?? '').join('');
    }
    if ('text' in val && val.text !== undefined) return val.text;
  }
  return val;
}

/**
 * Đọc điểm số từ ô Excel, chấp nhận cả dấu phẩy thập phân kiểu Việt Nam ("7,5").
 */
export function docSoDiemExcel(
  val: unknown,
  thangDiem = 10
): { ok: true; diem: number | null } | { ok: false; lyDo: string } {
  if (val == null) return { ok: true, diem: null };
  if (typeof val === 'number') {
    if (!Number.isFinite(val) || val < 0 || val > thangDiem) {
      return { ok: false, lyDo: `Điểm ${val} nằm ngoài thang 0–${thangDiem}.` };
    }
    return { ok: true, diem: Math.round(val * 100) / 100 };
  }
  const s = String(val).trim();
  if (!s) return { ok: true, diem: null };
  const norm = s.replace(',', '.');
  if (!/^-?\d+(?:\.\d+)?$/.test(norm)) {
    return { ok: false, lyDo: `Ô điểm "${s}" không phải là số hợp lệ.` };
  }
  const num = Number(norm);
  if (!Number.isFinite(num) || num < 0 || num > thangDiem) {
    return { ok: false, lyDo: `Điểm "${s}" nằm ngoài thang 0–${thangDiem}.` };
  }
  return { ok: true, diem: Math.round(num * 100) / 100 };
}

/**
 * Tạo file `.xlsx` mẫu cho lớp gồm 4 cột: STT | Mã HS | Họ và tên | Điểm.
 */
export async function taoFileMauExcelKTTX(
  tenBai: string,
  students: HocSinhLopExcel[]
): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('BangDiemKTTX');

  ws.columns = [
    { key: 'stt', width: 8 },
    { key: 'maHS', width: 16 },
    { key: 'hoTen', width: 28 },
    { key: 'diem', width: 14 },
  ];

  const headerRow = ws.addRow(['STT', 'Mã HS', 'Họ và tên', 'Điểm']);
  headerRow.font = { bold: true };
  headerRow.eachCell((cell) => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };
  });

  const sorted = [...students].sort((a, b) => a.student_id.localeCompare(b.student_id));
  sorted.forEach((s, idx) => {
    ws.addRow([idx + 1, s.student_id, s.display_name || s.student_id, null]);
  });

  ws.getCell('F1').value = tenBai ? `Bài: ${tenBai}` : 'Bảng điểm KTTX';
  const raw = await wb.xlsx.writeBuffer();
  return Buffer.from(raw);
}

/**
 * Đọc bảng điểm Excel `.xlsx`: giới hạn <= 2 MB, tự tìm dòng tiêu đề trong 10 dòng đầu, tối đa 60 học sinh.
 */
export async function docBangDiemExcel(
  input: Buffer | Uint8Array | ArrayBuffer,
  opts?: { thangDiem?: number }
): Promise<DongBangDiemExcel[]> {
  const buf = input instanceof Buffer ? input : Buffer.from(input instanceof ArrayBuffer ? new Uint8Array(input) : input);
  if (!buf.byteLength) {
    throw new Error('File Excel trống.');
  }
  if (buf.byteLength > TOI_DA_BYTES_EXCEL) {
    throw new Error('File Excel vượt quá giới hạn tối đa 2 MB.');
  }

  const thangDiem = opts?.thangDiem && opts.thangDiem > 0 ? opts.thangDiem : 10;
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(buf as any);

  const ws = wb.worksheets[0];
  if (!ws) {
    throw new Error('Không tìm thấy trang tính (worksheet) trong file Excel.');
  }

  let headerRowNum = -1;
  let colMa = -1;
  let colTen = -1;
  let colDiem = -1;

  const maxScan = Math.min(10, ws.rowCount || 10);
  for (let r = 1; r <= maxScan; r++) {
    const row = ws.getRow(r);
    let fMa = -1;
    let fTen = -1;
    let fDiem = -1;
    row.eachCell({ includeEmpty: false }, (cell, colNumber) => {
      const txt = chuanHoaTenVN(layGiaTriO(cell.value));
      if (!txt) return;
      if (fMa === -1 && (txt === 'ma hs' || txt === 'ma hoc sinh' || txt === 'student_id' || txt.includes('ma hs') || txt.includes('ma hoc sinh'))) {
        fMa = colNumber;
      } else if (fTen === -1 && (txt === 'ho va ten' || txt === 'ho ten' || txt === 'ten hoc sinh' || txt.includes('ho va ten') || txt.includes('ho ten'))) {
        fTen = colNumber;
      } else if (fDiem === -1 && (txt === 'diem' || txt === 'diem kttx' || txt === 'diem so' || txt.startsWith('diem '))) {
        fDiem = colNumber;
      }
    });
    if (fDiem !== -1 && (fMa !== -1 || fTen !== -1)) {
      headerRowNum = r;
      colMa = fMa;
      colTen = fTen;
      colDiem = fDiem;
      break;
    }
  }

  if (headerRowNum === -1 || colDiem === -1) {
    throw new Error('Không tìm thấy dòng tiêu đề hợp lệ trong 10 dòng đầu (cần cột "Mã HS" hoặc "Họ và tên" và cột "Điểm").');
  }

  const rows: DongBangDiemExcel[] = [];
  for (let r = headerRowNum + 1; r <= ws.rowCount; r++) {
    const row = ws.getRow(r);
    const maHS = colMa !== -1 ? String(layGiaTriO(row.getCell(colMa).value) ?? '').trim() : '';
    const hoTen = colTen !== -1 ? String(layGiaTriO(row.getCell(colTen).value) ?? '').trim() : '';
    const diemRaw = layGiaTriO(row.getCell(colDiem).value);
    const diemStr = String(diemRaw ?? '').trim();

    if (!maHS && !hoTen && !diemStr) continue;

    if (rows.length >= TOI_DA_DONG_HS) {
      throw new Error(`File Excel có hơn ${TOI_DA_DONG_HS} dòng học sinh. Vui lòng tách tối đa ${TOI_DA_DONG_HS} học sinh mỗi lượt.`);
    }

    const parsed = docSoDiemExcel(diemRaw, thangDiem);
    if (!parsed.ok) {
      rows.push({ dongSo: r, maHS, hoTen, diem: null, loi: parsed.lyDo });
    } else if (parsed.diem == null) {
      rows.push({ dongSo: r, maHS, hoTen, diem: null, loi: 'Thiếu điểm ở dòng này.' });
    } else {
      rows.push({ dongSo: r, maHS, hoTen, diem: parsed.diem });
    }
  }

  if (!rows.length) {
    throw new Error('Không có dòng dữ liệu học sinh nào bên dưới dòng tiêu đề.');
  }

  return rows;
}

/**
 * Đối chiếu từng dòng Excel với danh sách lớp và bài nộp KTTX hiện có thành 4 nhóm rõ ràng.
 */
export function doiChieuBangDiemExcel(
  dongList: DongBangDiemExcel[],
  studentsLop: HocSinhLopExcel[],
  baiNopList: BaiNopDoiChieuInput[]
): KetQuaDoiChieuExcel {
  const byId = new Map<string, HocSinhLopExcel>();
  const byName = new Map<string, HocSinhLopExcel[]>();

  for (const s of studentsLop) {
    byId.set(s.student_id.trim().toUpperCase(), s);
    const norm = chuanHoaTenVN(s.display_name || '');
    if (norm) {
      const arr = byName.get(norm) ?? [];
      arr.push(s);
      byName.set(norm, arr);
    }
  }

  const nopBySid = new Map<string, BaiNopDoiChieuInput>();
  for (const b of baiNopList) {
    if (!nopBySid.has(b.student_id)) nopBySid.set(b.student_id, b);
  }

  const res: KetQuaDoiChieuExcel = {
    khop: [],
    lech: [],
    chuaNopHoacChuaXacNhan: [],
    khongGhepDuoc: [],
    tongDongHopLe: 0,
  };

  const daGhepSid = new Set<string>();

  for (const d of dongList) {
    let hs: HocSinhLopExcel | undefined;
    let lyDoKhongGhep = '';

    if (d.maHS) {
      hs = byId.get(d.maHS.trim().toUpperCase());
      if (!hs && d.hoTen) {
        const hitName = byName.get(chuanHoaTenVN(d.hoTen)) ?? [];
        if (hitName.length === 1) hs = hitName[0];
        else if (hitName.length > 1) lyDoKhongGhep = `Không khớp mã "${d.maHS}" và tên trùng nhiều em trong lớp.`;
      }
      if (!hs && !lyDoKhongGhep) {
        lyDoKhongGhep = `Không tìm thấy mã HS "${d.maHS}" trong lớp này.`;
      }
    } else if (d.hoTen) {
      const hitName = byName.get(chuanHoaTenVN(d.hoTen)) ?? [];
      if (hitName.length === 1) hs = hitName[0];
      else if (hitName.length > 1) lyDoKhongGhep = `Trùng họ tên "${d.hoTen}" với ${hitName.length} học sinh trong lớp, cần điền Mã HS.`;
      else lyDoKhongGhep = `Không tìm thấy học sinh "${d.hoTen}" trong lớp này.`;
    } else {
      lyDoKhongGhep = 'Dòng thiếu cả Mã HS và Họ tên.';
    }

    if (!hs) {
      res.khongGhepDuoc.push({
        dongSo: d.dongSo,
        maHS: d.maHS,
        hoTen: d.hoTen,
        diemRaw: d.diem != null ? String(d.diem) : '',
        lyDo: lyDoKhongGhep,
      });
      continue;
    }

    if (daGhepSid.has(hs.student_id)) {
      res.khongGhepDuoc.push({
        dongSo: d.dongSo,
        maHS: d.maHS || hs.student_id,
        hoTen: d.hoTen || hs.display_name || hs.student_id,
        diemRaw: d.diem != null ? String(d.diem) : '',
        lyDo: `Mã HS ${hs.student_id} bị lặp ở nhiều dòng trong file Excel.`,
      });
      continue;
    }

    if (d.loi || d.diem == null) {
      res.khongGhepDuoc.push({
        dongSo: d.dongSo,
        maHS: d.maHS || hs.student_id,
        hoTen: d.hoTen || hs.display_name || hs.student_id,
        diemRaw: '',
        lyDo: d.loi || 'Thiếu điểm.',
      });
      continue;
    }

    daGhepSid.add(hs.student_id);
    res.tongDongHopLe += 1;

    const nop = nopBySid.get(hs.student_id);
    const tenHs = hs.display_name || hs.student_id;

    if (!nop) {
      res.chuaNopHoacChuaXacNhan.push({
        student_id: hs.student_id,
        ten_hs: tenHs,
        bai_nop_id: null,
        diem_ai: null,
        diem_excel: d.diem,
        chuaCoAnh: true,
        trang_thai_cu: null,
      });
      continue;
    }

    const tt = chuanHoaTrangThaiKTTX(nop.trang_thai);
    const diemHs = nop.tong_diem_hs != null ? Number(nop.tong_diem_hs) : null;

    if (diemHs == null || tt === 'ai-nhap' || tt === 'tu-choi') {
      res.chuaNopHoacChuaXacNhan.push({
        student_id: hs.student_id,
        ten_hs: tenHs,
        bai_nop_id: nop.id,
        diem_ai: nop.tong_diem_ai,
        diem_excel: d.diem,
        chuaCoAnh: Boolean(nop.chua_co_anh),
        trang_thai_cu: tt,
      });
      continue;
    }

    if (tt === 'hs-xac-nhan' || tt === 'da-chot') {
      if (diemKhopNhau(diemHs, d.diem, SAI_SO_KHOP_DIEM)) {
        res.khop.push({
          student_id: hs.student_id,
          ten_hs: tenHs,
          bai_nop_id: nop.id,
          diem_ai: nop.tong_diem_ai,
          diem_hs: diemHs,
          diem_excel: d.diem,
          trang_thai_cu: tt,
        });
      } else {
        res.lech.push({
          student_id: hs.student_id,
          ten_hs: tenHs,
          bai_nop_id: nop.id,
          diem_ai: nop.tong_diem_ai,
          diem_hs: diemHs,
          diem_excel: d.diem,
          ly_do_hs: nop.hs_ly_do_bao_sai ?? null,
          trang_thai_cu: tt,
        });
      }
      continue;
    }

    // Trạng thái 'hs-bao-sai' hoặc 'lech' đã có điểm HS gửi lên: đưa vào nhóm lệch nếu chưa khớp, hoặc khớp nếu đã trùng
    if (diemKhopNhau(diemHs, d.diem, SAI_SO_KHOP_DIEM) && tt !== 'hs-bao-sai') {
      res.khop.push({
        student_id: hs.student_id,
        ten_hs: tenHs,
        bai_nop_id: nop.id,
        diem_ai: nop.tong_diem_ai,
        diem_hs: diemHs,
        diem_excel: d.diem,
        trang_thai_cu: tt,
      });
    } else {
      res.lech.push({
        student_id: hs.student_id,
        ten_hs: tenHs,
        bai_nop_id: nop.id,
        diem_ai: nop.tong_diem_ai,
        diem_hs: diemHs,
        diem_excel: d.diem,
        ly_do_hs: nop.hs_ly_do_bao_sai ?? null,
        trang_thai_cu: tt,
      });
    }
  }

  return res;
}
