/**
 * FILE NÀY LÀM GÌ: Hằng số ngưỡng khớp 0,05 điểm và hai hàm chuẩn hoá trạng thái / so khớp điểm KTTX dùng chung cho cả máy chủ và trình duyệt.
 * AI DÙNG: dùng chung
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: không gọi mô-đun nội bộ khác
 */

export const SAI_SO_KHOP_DIEM = 0.05;

/**
 * Chuẩn hoá trạng thái cũ (`cho-duyet`, `da-duyet`) và mới về 6 trạng thái chuẩn của luồng 3 bước.
 * @param {string | null | undefined} raw
 * @returns {'ai-nhap' | 'hs-xac-nhan' | 'hs-bao-sai' | 'da-chot' | 'lech' | 'tu-choi'}
 */
export function chuanHoaTrangThaiKTTX(raw) {
  if (raw === 'cho-duyet' || raw === 'ai-nhap') return 'ai-nhap';
  if (raw === 'da-duyet' || raw === 'da-chot') return 'da-chot';
  if (raw === 'hs-xac-nhan') return 'hs-xac-nhan';
  if (raw === 'hs-bao-sai') return 'hs-bao-sai';
  if (raw === 'lech') return 'lech';
  if (raw === 'tu-choi') return 'tu-choi';
  return 'ai-nhap';
}

/**
 * So khớp hai điểm số trong ngưỡng sai số cho phép (mặc định 0,05 điểm).
 * @param {number | null | undefined} a
 * @param {number | null | undefined} b
 * @param {number} [saiSo]
 * @returns {boolean}
 */
export function diemKhopNhau(a, b, saiSo = SAI_SO_KHOP_DIEM) {
  if (a == null || b == null) return false;
  const na = Number(a);
  const nb = Number(b);
  if (!Number.isFinite(na) || !Number.isFinite(nb)) return false;
  return Math.round(Math.abs(na - nb) * 1000) / 1000 <= saiSo;
}
