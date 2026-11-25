/**
 * FILE NÀY LÀM GÌ: So khớp nhanh câu hỏi Toán 9 của học sinh với ngân hàng Hỏi-Đáp trước khi gọi AI.
 * AI DÙNG: dùng chung
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: không gọi mô-đun nội bộ khác
 */
/**
 * SO KHỚP HỎI–ĐÁP "HỎI BIN" CHO HỌC SINH (KHÔNG DÙNG AI).
 * Chạy thuần bằng chuẩn hoá văn bản và từ khoá trên ngân hàng thầy cô đã duyệt.
 */

export type HoiDapMuc = {
  id: string;
  ku_id: string | null;
  cau_hoi: string;
  tra_loi: string;
  tu_khoa?: string[] | null;
  nguon: 'gv' | 'ai-duyet';
  so_lan_dung?: number | null;
};

const TU_DUNG = new Set([
  'la', 'gi', 'the', 'nao', 'sao', 'vay', 'em', 'thay', 'co', 'oi', 'bin',
  'cho', 'hoi', 'cua', 'va', 'trong', 'khi', 'khong', 'duoc', 'nhu', 'nay',
  'kia', 'thi', 'ma', 'voi', 'mot', 'cac', 'nhung', 'bai', 'nay', 'giup',
  'voi', 'a', 'da', 'vang', 'xin', 'hoi', 'tai', 'vi', 'sao', 'lam'
]);

const TU_KHOA_TOAN =
  /[0-9=+\-*/√^<>≤≥]|phuong trinh|he phuong trinh|bat phuong trinh|bat dang thuc|can bac|ham so|parabol|do thi|duong tron|tiep tuyen|goc noi tiep|tu giac|tam giac|ti so luong giac|sin|cos|tan|cot|xac suat|khong gian mau|thong ke|tan so|tinh|giai|rut gon|chung minh|bien doi|tim x|tim y|tim m|nghiem|dieu kien|hang dang thuc|viet|dinh li|he thuc|loi sai|soat loi|cong thuc|cach lam|hinh non|hinh tru|hinh cau|dien tich|the tich|do dai|goc|canh|da thuc|phan thuc|an so|van toc|nang suat|toan/;

const TU_KHOA_NGOAI_TOAN =
  /\b(lien quan|free fire|pubg|valorant|roblox|minecraft|xem phim|anime|manga|ca si|nhac rap|to tinh|nguoi yeu|thoi tiet|xo so|ca do|nau an|bong da hom nay|ket qua xo so|giai ho ca de|lam ho bai kiem tra|cho xin tat ca dap an|hack|bypass)\b/;

/**
 * Hàm `chuanHoaVanBan`: nhận (s), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
export function chuanHoaVanBan(s: string): string {
  return String(s ?? '')
    .toLowerCase()
    .replace(/đ/g, 'd')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9+\-*/=<>^√.\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Hàm `tachTuKhoa`: nhận (s), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
export function tachTuKhoa(s: string): string[] {
  const chuan = chuanHoaVanBan(s);
  const raw = chuan.split(' ').filter((w) => w.length >= 2 && !TU_DUNG.has(w));
  return Array.from(new Set(raw));
}

/**
 * Hàm `kiemTraNoiDungToan`: nhận (cauHoi), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
export function kiemTraNoiDungToan(cauHoi: string): { hopLe: boolean; lyDo?: string } {
  const clean = String(cauHoi ?? '').trim();
  if (clean.length < 4) {
    return { hopLe: false, lyDo: 'Em hãy viết câu hỏi rõ hơn (ít nhất 4 kí tự).' };
  }
  if (clean.length > 500) {
    return { hopLe: false, lyDo: 'Câu hỏi tối đa 500 kí tự để thầy cô dễ đọc.' };
  }
  const chuan = chuanHoaVanBan(clean);
  if (TU_KHOA_NGOAI_TOAN.test(chuan)) {
    return {
      hopLe: false,
      lyDo: 'Mục Hỏi Bin chỉ hỗ trợ hỏi cách làm bài Toán lớp 9 (không trò chuyện ngoài bài học hay giải hộ đề).'
    };
  }
  if (!TU_KHOA_TOAN.test(chuan)) {
    return {
      hopLe: false,
      lyDo: 'Em hãy nêu rõ phần Toán 9 đang thắc mắc (ví dụ tên bài, công thức, hoặc bước đang vướng).'
    };
  }
  return { hopLe: true };
}

/**
 * Hàm `timTrongNganHang`: nhận (cauHoi, nganHang, kuId), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
export function timTrongNganHang(
  cauHoi: string,
  nganHang: HoiDapMuc[],
  kuId?: string | null
): { muc: HoiDapMuc; diem: number } | null {
  if (!nganHang.length) return null;
  const qNorm = chuanHoaVanBan(cauHoi);
  const qTokens = tachTuKhoa(cauHoi);
  if (!qNorm || qTokens.length === 0) return null;

  let totNhat: { muc: HoiDapMuc; diem: number } | null = null;

  for (const muc of nganHang) {
    const cNorm = chuanHoaVanBan(muc.cau_hoi);
    if (!cNorm) continue;

    if (cNorm === qNorm) {
      return { muc, diem: 1 };
    }

    const cTokens = new Set([
      ...tachTuKhoa(muc.cau_hoi),
      ...(muc.tu_khoa ?? []).flatMap((k) => tachTuKhoa(k))
    ]);
    if (cTokens.size === 0) continue;

    let trung = 0;
    for (const t of qTokens) {
      if (cTokens.has(t)) trung += 1;
    }

    let tuKhoaKhongDauTrung = 0;
    for (const kw of muc.tu_khoa ?? []) {
      const kwNorm = chuanHoaVanBan(kw);
      if (kwNorm && qNorm.includes(kwNorm)) tuKhoaKhongDauTrung += 1;
    }

    const hop = new Set([...qTokens, ...Array.from(cTokens)]).size;
    let diem = hop > 0 ? trung / hop : 0;
    // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
    if (tuKhoaKhongDauTrung > 0) diem += Math.min(0.28, tuKhoaKhongDauTrung * 0.14);
    if (kuId && muc.ku_id === kuId) diem += 0.12;
    if (cNorm.includes(qNorm) || qNorm.includes(cNorm)) diem += 0.25;

    if ((trung >= 2 || tuKhoaKhongDauTrung >= 1) && diem >= 0.42) {
      if (!totNhat || diem > totNhat.diem) {
        totNhat = { muc, diem };
      }
    }
  }

  return totNhat;
}
