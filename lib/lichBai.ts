/**
 * FILE NÀY LÀM GÌ: Mô-đun TypeScript/JavaScript hỗ trợ xử lý dữ liệu và nghiệp vụ trong hệ thống FlipMath 9.
 * AI DÙNG: dùng chung
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: không gọi mô-đun nội bộ khác
 */
/**
 * LỊCH GIAO BÀI THEO BA MỐC (SPEC M2): quy tắc thuần, kiểm thử được.
 * Một bài có thể gồm nhiều mục; bài "đã chuẩn bị" khi mọi mục của bài đã nộp bài chuẩn bị.
 */
export type Lich = { lesson_id: string; ngay_mo: string; han_chuan_bi: string; ngay_hoc: string };
export type TrangThaiBai = 'chua-giao' | 'chua-mo' | 'dang-mo' | 'da-chuan-bi' | 'nop-tre' | 'qua-han';

// Xử lý mốc ngày giờ theo múi giờ Việt Nam (UTC+7)
const VN = 7 * 3600_000;
// Xử lý mốc ngày giờ theo múi giờ Việt Nam (UTC+7)
export const ngayVN = (t: number | string | Date = Date.now()) => new Date(new Date(t).getTime() + VN).toISOString().slice(0, 10);
// Xử lý mốc ngày giờ theo múi giờ Việt Nam (UTC+7)
export const congNgay = (ngay: string, n: number) => new Date(Date.parse(ngay + 'T00:00:00Z') + n * 86400_000).toISOString().slice(0, 10);
/** "2026-11-13" + "19:00" giờ Việt Nam → ISO (UTC). */
export const gioVN = (ngay: string, gio = '19:00') => new Date(`${ngay}T${gio}:00+07:00`).toISOString();

export const TEN_TRANG_THAI_BAI: Record<TrangThaiBai, { ten: string; bieuTuong: string; mau: string; nen: string }> = {
  'chua-giao': { ten: 'Chưa có lịch', bieuTuong: '', mau: '#5b6478', nen: '#eef1f7' },
  'chua-mo': { ten: 'Chưa mở', bieuTuong: '🔒', mau: '#5b6478', nen: '#eef1f7' },
  'dang-mo': { ten: 'Đang mở', bieuTuong: '⏰', mau: '#17579c', nen: '#e2eefb' },
  'da-chuan-bi': { ten: 'Đã chuẩn bị', bieuTuong: '✅', mau: '#1e7a4b', nen: '#e3f6ea' },
  'nop-tre': { ten: 'Nộp trễ', bieuTuong: '🕒', mau: '#9a5b00', nen: '#ffecd2' },
  'qua-han': { ten: 'Quá hạn, chưa làm xong', bieuTuong: '⚠️', mau: '#b3261e', nen: '#fde7e5' }
};

/** Trạng thái một bài của một học sinh. `nop`: mục → lần nộp bài chuẩn bị ĐẦU TIÊN (ISO). */
export function trangThaiBai(lich: Lich | undefined, muc: string[], nop: Map<string, string>, now = Date.now()): TrangThaiBai {
  if (!lich) return 'chua-giao';
  // Xử lý mốc ngày giờ theo múi giờ Việt Nam (UTC+7)
  if (ngayVN(now) < lich.ngay_mo) return 'chua-mo';
  const lan = muc.map((m) => nop.get(m));
  const du = muc.length > 0 && lan.every(Boolean);
  if (du) return lan.every((t) => t! <= lich.han_chuan_bi) ? 'da-chuan-bi' : 'nop-tre';
  return new Date(now).toISOString() > lich.han_chuan_bi ? 'qua-han' : 'dang-mo';
}

/**
 * Tự điền lịch cả chương: mỗi bài một buổi học, lần lượt vào các thứ có tiết (0 = Chủ nhật … 6 = thứ Bảy),
 * bắt đầu từ ngày `batDau`. Ngày mở = ngày học của bài trước (bài đầu: 3 ngày trước buổi học).
 * Hạn chuẩn bị = 19:00 tối hôm trước ngày học.
 */
export function tuDienChuong(bai: string[], batDau: string, thu: number[], gioHan = '19:00'): Lich[] {
  const coTiet = new Set(thu.filter((t) => t >= 0 && t <= 6));
  if (!coTiet.size || !bai.length) return [];
  const ra: Lich[] = [];
  let ngay = batDau;
  for (let i = 0; i < bai.length; i++) {
    let an = 0;
    while (!coTiet.has(new Date(ngay + 'T00:00:00Z').getUTCDay()) && an++ < 7) ngay = congNgay(ngay, 1);
    const ngayMo = i === 0 ? congNgay(ngay, -3) : ra[i - 1].ngay_hoc;
    ra.push({ lesson_id: bai[i], ngay_mo: ngayMo, han_chuan_bi: gioVN(congNgay(ngay, -1), gioHan), ngay_hoc: ngay });
    ngay = congNgay(ngay, 1);
  }
  return ra;
}

/** Ngày dd/mm và giờ hh:mm theo giờ Việt Nam. */
export const ngayDep = (d: string) => d.slice(0, 10).split('-').reverse().slice(0, 2).join('/');
export const gioDep = (iso: string) => {
  const t = new Date(new Date(iso).getTime() + VN).toISOString();
  return `${t.slice(11, 16)} ${t.slice(8, 10)}/${t.slice(5, 7)}`;
};
