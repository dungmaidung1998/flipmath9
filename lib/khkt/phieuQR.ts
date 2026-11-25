/**
 * FILE NÀY LÀM GÌ: Mô-đun TypeScript/JavaScript hỗ trợ xử lý dữ liệu và nghiệp vụ trong hệ thống FlipMath 9.
 * AI DÙNG: dùng chung
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: @/lib/chonPhieu, @/lib/tronPhuongAn
 */
import { chonPhieu } from '@/lib/chonPhieu';
import { tronCauHoi } from '@/lib/tronPhuongAn';

export type ModePhieuQR = 'chuan-bi' | 'van-dung';

export type ParsedQRPhieu = {
  studentId: string;
  kuId: string;
  mode: ModePhieuQR;
};

/**
 * Hàm `taoChuoiQRPhieu`: nhận (studentId, kuId, mode), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
export function taoChuoiQRPhieu(
  studentId: string,
  kuId: string,
  mode: ModePhieuQR = 'chuan-bi'
): string {
  return `FM9|${studentId.trim()}|${kuId.trim()}|${mode}`;
}

/**
 * Hàm `giaiMaQRPhieu`: nhận (raw), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
export function giaiMaQRPhieu(raw: string): ParsedQRPhieu | null {
  const s = String(raw ?? '').trim();
  if (!s) return null;
  const parts = s.split('|').map((x) => x.trim());
  if (parts.length >= 3 && parts[0].toUpperCase() === 'FM9') {
    const studentId = parts[1];
    const kuId = parts[2];
    const mode: ModePhieuQR = parts[3] === 'van-dung' ? 'van-dung' : 'chuan-bi';
    if (studentId && kuId) return { studentId, kuId, mode };
  }
  return null;
}

/**
 * Hàm `chonCauPhieuQR`: nhận (bank, options, seed, mode), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
export function chonCauPhieuQR<
  Q extends { question_id: string; level: number; stem?: string },
  O extends { question_id: string; option_key: string; option_text: string }
>(
  bank: Q[],
  options: O[],
  seed: string,
  mode: ModePhieuQR = 'chuan-bi'
) {
  const filtered = mode === 'chuan-bi' ? bank.filter((q) => q.level <= 3) : bank;
  const selected = chonPhieu(filtered, seed);
  const withOpts = selected.map((q) => ({
    ...q,
    options: options.filter((o) => o.question_id === q.question_id),
  }));
  return tronCauHoi(withOpts, seed);
}
