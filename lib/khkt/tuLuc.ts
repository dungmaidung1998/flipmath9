/**
 * FILE NÀY LÀM GÌ: Tính Chỉ số tự lực (TL ≤ 48h sau gợi ý), xu hướng theo tuần, nhóm có/không AI và cảnh báo lộ đáp án.
 * AI DÙNG: dùng chung
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: không gọi mô-đun nội bộ khác
 */
/**
 * CHỈ SỐ TỰ LỰC KHI CÓ GỢI Ý / AI (hàm thuần TypeScript cho KHKT).
 * Trả lời câu hỏi nghiên cứu: sau khi nhận gợi ý (gợi ý lỗi 3 tầng, Hỏi Bin, Chấm vở AI,
 * Đo chiều cao, Trò chơi nền), học sinh có tự giải được tiếp trong 48 giờ mà không mở thêm gợi ý hay lời giải không?
 */

export type NguonGoiY = 'goi-y-loi' | 'hoi-bin' | 'cham-vo' | 'do-chieu-cao' | 'tro-choi';

export type GoiYSuKienRow = {
  id: string;
  student_id: string;
  class_id?: string | null;
  nguon: NguonGoiY;
  tang: 1 | 2 | 3 | null;
  ku_id: string | null;
  question_id: string | null;
  error_code: string | null;
  co_ai: boolean;
  tao_luc: string;
  thu_lai_luc: string | null;
  tu_giai: boolean | null;
  so_goi_y_them: number | null;
  xem_loi_giai: boolean | null;
};

export type KetQuaTuLucNhom = {
  tongNhan: number;
  daThuLai: number;
  tuGiaiDuoc: number;
  tl: number | null; // 0..100 (null nếu chưa đủ dữ liệu)
  mucGoiYTB: number | null;
  tiLeXemLoiGiai: number | null; // 0..100
};

export type TuanTuLuc = {
  tuan: string; // YYYY-Wxx hoặc ngày đầu tuần YYYY-MM-DD (giờ VN)
  tongNhan: number;
  daThuLai: number;
  tuGiaiDuoc: number;
  tl: number | null; // null khi < 5 lần nhận gợi ý trong tuần ("chưa đủ dữ liệu")
};

export type BaoCaoTuLucHS = KetQuaTuLucNhom & {
  student_id: string;
  theoTuan: TuanTuLuc[];
  doDocXuHuong: number | null;
  xuHuong: '↑' | '↓' | '→' | '—';
};

const BON_TAM_GIO_MS = 48 * 3600_000;

/** Đánh giá một lượt thử lại có đạt chuẩn "tự giải được" trong vòng 48h không. */
export function danhGiaTuGiai(params: {
  taoLucIso: string;
  thuLaiLucIso: string | null;
  ketQuaDung: boolean;
  soGoiYThem?: number | null;
  xemLoiGiai?: boolean | null;
}): { hopLeHan48h: boolean; tuGiai: boolean } {
  if (!params.thuLaiLucIso) return { hopLeHan48h: false, tuGiai: false };
  const t0 = Date.parse(params.taoLucIso);
  const t1 = Date.parse(params.thuLaiLucIso);
  if (!Number.isFinite(t0) || !Number.isFinite(t1)) return { hopLeHan48h: false, tuGiai: false };
  const dt = t1 - t0;
  if (dt < 0 || dt > BON_TAM_GIO_MS) return { hopLeHan48h: false, tuGiai: false };
  const them = Number(params.soGoiYThem ?? 0) > 0;
  const xemGiai = Boolean(params.xemLoiGiai);
  return {
    hopLeHan48h: true,
    tuGiai: Boolean(params.ketQuaDung) && !them && !xemGiai,
  };
}

/** Đánh giá riêng cho Chấm vở AI: tiến bộ khi dòng sai đầu tiên lùi xuống hoặc hoàn thành ('xong'). */
export function danhGiaTuGiaiChamVo(params: {
  taoLucIso: string;
  thuLaiLucIso: string | null;
  dongSaiDauCu: number | null;
  dongSaiDauMoi: number | null;
  trangThaiMoi: 'xong' | 'nua-bai' | 'sai';
  soGoiYThem?: number | null;
  xemLoiGiai?: boolean | null;
}): boolean {
  const tienBo =
    params.trangThaiMoi === 'xong' ||
    (params.dongSaiDauCu != null &&
      (params.dongSaiDauMoi == null || params.dongSaiDauMoi > params.dongSaiDauCu));
  return danhGiaTuGiai({
    taoLucIso: params.taoLucIso,
    thuLaiLucIso: params.thuLaiLucIso,
    ketQuaDung: tienBo,
    soGoiYThem: params.soGoiYThem,
    xemLoiGiai: params.xemLoiGiai,
  }).tuGiai;
}

/** Kiểm tra một sự kiện gợi ý có được tính là "đã có lần thử lại hợp lệ (<= 48h)" và "tự giải được" không. */
export function xetSuKienTuLuc(e: GoiYSuKienRow): { daThuLai: boolean; tuGiai: boolean } {
  if (!e.thu_lai_luc) return { daThuLai: false, tuGiai: false };
  const t0 = Date.parse(e.tao_luc);
  const t1 = Date.parse(e.thu_lai_luc);
  if (!Number.isFinite(t0) || !Number.isFinite(t1)) return { daThuLai: false, tuGiai: false };
  const dt = t1 - t0;
  if (dt < 0 || dt > BON_TAM_GIO_MS) return { daThuLai: false, tuGiai: false };
  const them = Number(e.so_goi_y_them ?? 0) > 0;
  const xemGiai = Boolean(e.xem_loi_giai);
  return {
    daThuLai: true,
    tuGiai: Boolean(e.tu_giai) && !them && !xemGiai,
  };
}

/** Ngày Thứ Hai đầu tuần (giờ Việt Nam) dạng YYYY-MM-DD để nhóm các tuần ổn định. */
export function dauTuanVN(iso: string): string {
  const ms = Date.parse(iso);
  if (!Number.isFinite(ms)) return 'khong-ro';
  // Xử lý mốc ngày giờ theo múi giờ Việt Nam (UTC+7)
  const d = new Date(ms + 7 * 3600_000);
  const day = d.getUTCDay(); // 0 = CN, 1 = T2
  const diff = day === 0 ? -6 : 1 - day;
  const t2 = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + diff));
  return t2.toISOString().slice(0, 10);
}

/**
 * Hàm `tinhNhomCoBan`: nhận (ds), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
function tinhNhomCoBan(ds: GoiYSuKienRow[]): KetQuaTuLucNhom {
  const tongNhan = ds.length;
  if (!tongNhan) {
    return {
      tongNhan: 0,
      daThuLai: 0,
      tuGiaiDuoc: 0,
      tl: null,
      mucGoiYTB: null,
      tiLeXemLoiGiai: null,
    };
  }
  let daThuLai = 0;
  let tuGiaiDuoc = 0;
  let xemLoiGiaiTruocThuLai = 0;
  const cacMuc: number[] = [];

  for (const e of ds) {
    const tangSo = Number(e.tang ?? 1) + Number(e.so_goi_y_them ?? 0);
    if (e.tang != null) {
      // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
      cacMuc.push(Math.min(3, Math.max(1, tangSo)));
    }
    const { daThuLai: okThu, tuGiai } = xetSuKienTuLuc(e);
    if (okThu) {
      daThuLai += 1;
      if (tuGiai) tuGiaiDuoc += 1;
      if (e.xem_loi_giai) xemLoiGiaiTruocThuLai += 1;
    } else if (e.xem_loi_giai) {
      xemLoiGiaiTruocThuLai += 1;
    }
  }

  return {
    tongNhan,
    daThuLai,
    tuGiaiDuoc,
    tl: daThuLai > 0 ? Math.round((tuGiaiDuoc / daThuLai) * 1000) / 10 : null,
    mucGoiYTB: cacMuc.length
      ? Math.round((cacMuc.reduce((a, b) => a + b, 0) / cacMuc.length) * 100) / 100
      : null,
    tiLeXemLoiGiai:
      daThuLai > 0
        ? Math.round((xemLoiGiaiTruocThuLai / Math.max(daThuLai, 1)) * 1000) / 10
        : null,
  };
}

/** Hồi quy tuyến tính đơn giản tìm độ dốc theo tuần (%/tuần). */
export function tinhDoDocTuyenTinh(giaTriTheoTuan: number[]): number | null {
  if (giaTriTheoTuan.length < 2) return null;
  const n = giaTriTheoTuan.length;
  let sx = 0;
  let sy = 0;
  let sxx = 0;
  let sxy = 0;
  for (let i = 0; i < n; i++) {
    sx += i;
    sy += giaTriTheoTuan[i];
    sxx += i * i;
    sxy += i * giaTriTheoTuan[i];
  }
  const mau = n * sxx - sx * sx;
  // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
  if (Math.abs(mau) < 1e-9) return 0;
  return Math.round(((n * sxy - sx * sy) / mau) * 100) / 100;
}

/**
 * Hàm `nhanXuHuongTuDoDoc`: nhận (slope), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
export function nhanXuHuongTuDoDoc(slope: number | null): '↑' | '↓' | '→' | '—' {
  if (slope == null || !Number.isFinite(slope)) return '—';
  if (slope >= 2) return '↑';
  if (slope <= -2) return '↓';
  return '→';
}

/** Tổng hợp đầy đủ chỉ số tự lực cho cả nhóm / lớp (hỗ trợ lọc nguồn gợi ý). */
export function tinhChiSoTuLuc(
  suKien: GoiYSuKienRow[],
  nguonLoc?: NguonGoiY | 'tat-ca'
): {
  tongHop: KetQuaTuLucNhom;
  theoTuan: TuanTuLuc[];
  doDocXuHuong: number | null;
  xuHuong: '↑' | '↓' | '→' | '—';
  coAi: KetQuaTuLucNhom;
  khongAi: KetQuaTuLucNhom;
} {
  const ds = nguonLoc && nguonLoc !== 'tat-ca' ? suKien.filter((e) => e.nguon === nguonLoc) : suKien;
  const tongHop = tinhNhomCoBan(ds);
  const coAi = tinhNhomCoBan(ds.filter((e) => e.co_ai));
  const khongAi = tinhNhomCoBan(ds.filter((e) => !e.co_ai));

  const mapTuan = new Map<string, GoiYSuKienRow[]>();
  for (const e of ds) {
    const t = dauTuanVN(e.tao_luc);
    const list = mapTuan.get(t) ?? [];
    list.push(e);
    mapTuan.set(t, list);
  }

  const theoTuan: TuanTuLuc[] = Array.from(mapTuan.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([tuan, items]) => {
      const kq = tinhNhomCoBan(items);
      // Quy tắc B3: Đủ ít nhất 5 lần nhận gợi ý trong tuần mới tính TL tuần đó ("chưa đủ dữ liệu" thay vì 0)
      const duDuLieu = items.length >= 5 && kq.daThuLai > 0;
      return {
        tuan,
        tongNhan: items.length,
        daThuLai: kq.daThuLai,
        tuGiaiDuoc: kq.tuGiaiDuoc,
        tl: duDuLieu ? kq.tl : null,
      };
    });

  const tlHopLe = theoTuan.map((t) => t.tl).filter((v): v is number => v != null);
  const doDocXuHuong = tinhDoDocTuyenTinh(tlHopLe);
  return {
    tongHop,
    theoTuan,
    doDocXuHuong,
    xuHuong: nhanXuHuongTuDoDoc(doDocXuHuong),
    coAi,
    khongAi,
  };
}

/**
 * Hàm `tinhTuLucTheoHocSinh`: nhận (suKien, studentIds), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
export function tinhTuLucTheoHocSinh(
  suKien: GoiYSuKienRow[],
  studentIds: string[]
): BaoCaoTuLucHS[] {
  return studentIds.map((sid) => {
    const kq = tinhChiSoTuLuc(suKien.filter((e) => e.student_id === sid));
    return {
      student_id: sid,
      ...kq.tongHop,
      theoTuan: kq.theoTuan,
      doDocXuHuong: kq.doDocXuHuong,
      xuHuong: kq.xuHuong,
    };
  });
}

const fmt = (v: number | null, d = 1) =>
  v == null || !Number.isFinite(v) ? '—' : v.toFixed(d).replace('.', ',');

/**
 * Hàm `taoBaoCaoTuLuc`: nhận (ketQua), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
export function taoBaoCaoTuLuc(ketQua: ReturnType<typeof tinhChiSoTuLuc>): string {
  const { tongHop, coAi, khongAi, doDocXuHuong, xuHuong, theoTuan } = ketQua;
  if (tongHop.tongNhan === 0) {
    return 'Chưa có lượt nhận gợi ý nào được ghi nhận trong phạm vi đang chọn.';
  }
  const tuanDu = theoTuan.filter((t) => t.tl != null).length;
  const doan: string[] = [
    `Trong tổng số ${tongHop.tongNhan} lượt học sinh nhận gợi ý (${tongHop.daThuLai} lượt có lần thử lại hợp lệ trong vòng 48 giờ), học sinh tự giải được ${tongHop.tuGiaiDuoc} lượt mà không cần mở thêm gợi ý tầng cao hơn hoặc xem lời giải; chỉ số tự lực TL đạt ${fmt(tongHop.tl)}%.`,
  ];
  if (tongHop.mucGoiYTB != null) {
    doan.push(`Mức gợi ý trung bình cần mở là tầng ${fmt(tongHop.mucGoiYTB, 2)}, tỉ lệ xem lời giải trước khi thử lại là ${fmt(tongHop.tiLeXemLoiGiai)}%.`);
  }
  if (coAi.daThuLai > 0 && khongAi.daThuLai > 0) {
    doan.push(
      `Khi tách theo nguồn soạn: nhóm gợi ý có AI hỗ trợ (n = ${coAi.daThuLai} lượt thử lại) có TL = ${fmt(coAi.tl)}%, trong khi nhóm gợi ý không AI (n = ${khongAi.daThuLai}) có TL = ${fmt(khongAi.tl)}%.`
    );
  }
  if (doDocXuHuong != null) {
    doan.push(
      `Theo dõi ${tuanDu} tuần đủ ngưỡng (≥ 5 lượt gợi ý/tuần), xu hướng chỉ số tự lực ${xuHuong} với độ dốc tuyến tính ${fmt(doDocXuHuong, 2)} điểm %/tuần.`
    );
  }
  if (tongHop.daThuLai < 20) {
    doan.push(
      `Lưu ý cỡ mẫu nhỏ (n = ${tongHop.daThuLai} < 20 lượt thử lại): chưa đủ cơ sở kết luận xu hướng ổn định hay suy diễn quan hệ nhân quả.`
    );
  } else {
    doan.push('Lưu ý phương pháp luận: đây là số liệu quan sát hành vi tự giải theo thời gian, không khẳng định quan hệ nhân quả.');
  }
  return doan.join(' ');
}

/**
 * Rà nguyên tắc "chỉ gợi ý, không đưa đáp án cuối" khi giáo viên lưu câu trả lời Hỏi Bin / gợi ý lỗi.
 * Chỉ dùng để cảnh báo mềm (giáo viên vẫn có quyền quyết định lưu).
 */
export function kiemTraLoDapAnGoiY(
  noiDung: string,
  dapAnThamChieu: string[] = []
): string | null {
  const text = String(noiDung ?? '').trim();
  if (!text) return null;

  // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
  if (/(?:^|[\s,.;:!?(\["'])((?:đáp án (?:đúng )?|đáp số(?: cuối cùng)? |kết quả cuối(?: cùng)? )là|chọn(?: phương án)? [A-D](?:$|[\s,.;:!?\])"']))/i.test(text)) {
    return 'Nội dung có cụm từ giống câu chốt đáp án ("đáp án là / đáp số là / chọn A–D"). Thầy cô kiểm tra lại để tránh lộ kết quả cuối.';
  }

  const chuan = (s: string) =>
    s
      .toLowerCase()
      .replace(/\$|\\\(|\\\)/g, '')
      .replace(/\s+/g, ' ')
      .trim();

  const textNorm = chuan(text);
  for (const rawAns of dapAnThamChieu) {
    const ans = chuan(rawAns);
    if (!ans || ans.length < 2) continue;
    // Bỏ qua các số quá ngắn phổ biến kiểu "0", "1", "2" dễ trùng ngẫu nhiên nếu không đứng trong dạng "= ans"
    const isShortNum = /^-?\d+(?:[,.]\d+)?$/.test(ans) && ans.length <= 2;
    if (isShortNum) {
      // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
      const reEq = new RegExp(`(?:=|là)\\s*${ans.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:\\s|$|[.,;])`, 'i');
      if (reEq.test(textNorm)) {
        return `Câu trả lời chứa giá trị trùng đáp án (${rawAns}) sau dấu "=" hoặc chữ "là".`;
      }
    } else if (textNorm.includes(ans)) {
      return `Câu trả lời có đoạn trùng với đáp án tham chiếu ("${rawAns.slice(0, 40)}").`;
    }
  }
  return null;
}

/**
 * Hàm `xuatCsvTuLuc`: nhận (dongHS), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
export function xuatCsvTuLuc(
  dongHS: Array<BaoCaoTuLucHS & { tenHS: string }>
): string {
  const header = ['Ma HS', 'Ho ten', 'Luot nhan goi y', 'Luot thu lai <=48h', 'Tu giai duoc', 'TL (%)', 'Muc goi y TB', 'Ty le xem loi giai (%)', 'Xu huong'];
  const rows = dongHS.map((r) =>
    [
      r.student_id,
      `"${r.tenHS.replace(/"/g, '""')}"`,
      r.tongNhan,
      r.daThuLai,
      r.tuGiaiDuoc,
      r.tl ?? '',
      r.mucGoiYTB ?? '',
      r.tiLeXemLoiGiai ?? '',
      r.xuHuong,
    ].join(',')
  );
  return '\ufeff' + [header.join(','), ...rows].join('\n');
}
