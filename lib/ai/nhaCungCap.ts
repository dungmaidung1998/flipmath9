/**
 * FILE NÀY LÀM GÌ: Bộ điều phối hai nhà cung cấp AI (Gemini và Claude; riêng KTTX chỉ dùng Claude API).
 * AI DÙNG: dùng chung
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: @/lib/ai/claude, @/lib/ai/geminiChamVo, @/lib/ai/gemini
 */
import {
  aiChamVoBat,
  chamBaiTuLuanClaude,
  coKhoaClaude,
  docAnhBaiLamClaude,
  docBaiKTTXClaude,
  tenMoHinhChamVo,
  type CauKttxDocAI,
  type KetQuaChamVo,
  type KetQuaDocKttxClaude,
  type MediaTypeAnh,
} from '@/lib/ai/claude';
import {
  chamBaiTuLuanGemini,
  docAnhBaiLamGemini,
  tenMoHinhGeminiChamVo,
} from '@/lib/ai/geminiChamVo';
import {
  coKhoaGemini,
  soanBaTangGoiY,
  soanNhapHoiBin,
} from '@/lib/ai/gemini';

/**
 * GIAO DIỆN CHUNG CHO 2 NHÀ CUNG CẤP AI (Gemini & Claude — chỉ chạy máy chủ).
 *  - Chấm ảnh vở tự luận (`chamAnh`): hỗ trợ cả Gemini (GEMINI_API_KEY) và Claude (ANTHROPIC_API_KEY).
 *    Chế độ mặc định ('auto'): ưu tiên Gemini nếu có GEMINI_API_KEY, tự chuyển sang Claude nếu thiếu/lỗi
 *    (hoặc đổi bằng AI_CHAM_VO_PROVIDER=gemini|claude|auto).
 *  - Hỏi Bin (`traLoiHoiBinHS`) & gợi ý giáo viên (`soanGoiY`): dùng Gemini với ẩn danh PII,
 *    kiểm tra KaTeX và chặn lộ đáp án cuối.
 */
if (typeof window !== 'undefined') {
  throw new Error('lib/ai/nhaCungCap chỉ được phép chạy trên máy chủ.');
}

export type NhaCungCapTen = 'gemini' | 'claude';

export type YeuCauChamAnh =
  | {
      cheDo: 'doc';
      imageBase64: string;
      mediaType: MediaTypeAnh;
      deBai: string;
    }
  | {
      cheDo: 'cham';
      deBai: string;
      loiGiaiChuan: string[];
      danhSachMaLoi: { error_code: string; misconception: string }[];
      dongHocSinh: string[];
      diemToiDa?: number;
    };

export type KetQuaChamAnh =
  | { ok: true; cheDo: 'doc'; dong: string[]; model: string; nhaCungCap: NhaCungCapTen }
  | { ok: true; cheDo: 'cham'; ketQua: KetQuaChamVo; model: string; nhaCungCap: NhaCungCapTen }
  | { ok: false; error: string; model: string; nhaCungCap: NhaCungCapTen };

export type YeuCauSoanGoiY =
  | {
      nguoiDung: 'giao-vien' | 'hoc-sinh';
      loai: 'ba-tang-loi';
      errorCode: string;
      misconception: string;
      viDu?: string | null;
      viBaiHoc?: string | null;
    }
  | {
      nguoiDung: 'giao-vien' | 'hoc-sinh';
      loai: 'nhap-hoi-bin';
      cauHoi: string;
      tenMuc?: string | null;
      quyTac?: string | null;
    };

/**
 * Hàm `thuTuNhaCungCap`: nhận (không tham số), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
function thuTuNhaCungCap(): NhaCungCapTen[] {
  const pref = (process.env.AI_CHAM_VO_PROVIDER ?? 'auto').trim().toLowerCase();
  const hasG = coKhoaGemini();
  const hasC = coKhoaClaude();
  if (pref === 'claude') {
    if (hasC && hasG) return ['claude', 'gemini'];
    return hasC ? ['claude'] : hasG ? ['gemini'] : ['claude'];
  }
  if (pref === 'gemini') {
    return hasG ? ['gemini'] : hasC ? ['claude'] : ['gemini'];
  }
  // auto: ưu tiên Gemini cho học sinh nếu có khoá, tự fallback sang Claude nếu cần
  if (hasG && hasC) return ['gemini', 'claude'];
  if (hasG) return ['gemini'];
  if (hasC) return ['claude'];
  return ['gemini'];
}

/**
 * Đọc ảnh và chấm vở tự luận cho học sinh — dùng Gemini hoặc Claude theo cấu hình.
 */
export async function chamAnh(input: YeuCauChamAnh): Promise<KetQuaChamAnh> {
  const thuTu = thuTuNhaCungCap();
  let loiCuoi: KetQuaChamAnh | null = null;

  for (const ncc of thuTu) {
    if (input.cheDo === 'doc') {
      const res =
        ncc === 'gemini'
          ? await docAnhBaiLamGemini({
              imageBase64: input.imageBase64,
              mediaType: input.mediaType,
              deBai: input.deBai,
            })
          : await docAnhBaiLamClaude({
              imageBase64: input.imageBase64,
              mediaType: input.mediaType,
              deBai: input.deBai,
            });
      if (res.ok) {
        return { ok: true, cheDo: 'doc', dong: res.dong, model: res.model, nhaCungCap: ncc };
      }
      loiCuoi = { ok: false, error: res.error, model: res.model, nhaCungCap: ncc };
    } else {
      const res =
        ncc === 'gemini'
          ? await chamBaiTuLuanGemini({
              deBai: input.deBai,
              loiGiaiChuan: input.loiGiaiChuan,
              danhSachMaLoi: input.danhSachMaLoi,
              dongHocSinh: input.dongHocSinh,
              diemToiDa: input.diemToiDa,
            })
          : await chamBaiTuLuanClaude({
              deBai: input.deBai,
              loiGiaiChuan: input.loiGiaiChuan,
              danhSachMaLoi: input.danhSachMaLoi,
              dongHocSinh: input.dongHocSinh,
              diemToiDa: input.diemToiDa,
            });
      if (res.ok) {
        return { ok: true, cheDo: 'cham', ketQua: res.ketQua, model: res.model, nhaCungCap: ncc };
      }
      loiCuoi = { ok: false, error: res.error, model: res.model, nhaCungCap: ncc };
    }
  }

  return (
    loiCuoi ?? {
      ok: false,
      error: 'AI chưa đọc được, em chụp lại hoặc gõ bài',
      model: tenMoHinhGeminiChamVo(),
      nhaCungCap: 'gemini',
    }
  );
}

/**
 * Soạn gợi ý / nháp qua Gemini (hỗ trợ cả giáo viên và Hỏi Bin học sinh).
 */
export async function soanGoiY(input: YeuCauSoanGoiY) {
  if (input.loai === 'ba-tang-loi') {
    return soanBaTangGoiY({
      errorCode: input.errorCode,
      misconception: input.misconception,
      viDu: input.viDu,
      viBaiHoc: input.viBaiHoc,
    });
  }
  return soanNhapHoiBin({
    cauHoi: input.cauHoi,
    tenMuc: input.tenMuc,
    quyTac: input.quyTac,
  });
}

/**
 * Trả lời trực tiếp câu hỏi Toán 9 trong Hỏi Bin của học sinh bằng Gemini (có ẩn danh PII & lọc KaTeX).
 */
export async function traLoiHoiBinHS(input: {
  cauHoi: string;
  tenMuc?: string | null;
  quyTac?: string | null;
}) {
  return soanNhapHoiBin({
    cauHoi: input.cauHoi,
    tenMuc: input.tenMuc,
    quyTac: input.quyTac,
  });
}

/**
 * Hàm `trangThaiChamVoAI`: nhận (không tham số), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
export function trangThaiChamVoAI() {
  const thuTu = thuTuNhaCungCap();
  const uuTien = thuTu[0] ?? 'gemini';
  return {
    bat: aiChamVoBat(),
    coKhoaGemini: coKhoaGemini(),
    coKhoaClaude: coKhoaClaude(),
    moHinhGemini: tenMoHinhGeminiChamVo(),
    moHinhClaude: tenMoHinhChamVo(),
    moHinh: uuTien === 'gemini' ? tenMoHinhGeminiChamVo() : tenMoHinhChamVo(),
    nhaCungCap: uuTien,
  };
}

/**
 * Đọc ảnh bài kiểm tra thường xuyên (KTTX) bằng Claude API Vision.
 * Quy tắc bắt buộc: CHỈ gọi Claude API cho tính năng KTTX (tuyệt đối không fallback sang Gemini).
 */
export async function docBaiKTTX(input: {
  images: { imageBase64: string; mediaType: MediaTypeAnh }[];
  tenBai?: string | null;
  khungCau?: { soCau: number; kuId?: string | null; errorCode?: string | null; diemToiDa: number; moTa?: string }[];
  danhSachMaLoi: { error_code: string; ku_id?: string | null; misconception: string }[];
}): Promise<
  | { ok: true; duLieu: KetQuaDocKttxClaude; model: string; nhaCungCap: 'claude' }
  | { ok: false; error: string; model: string; nhaCungCap: 'claude' }
> {
  const res = await docBaiKTTXClaude(input);
  if (!res.ok) {
    return { ok: false, error: res.error, model: res.model, nhaCungCap: 'claude' };
  }
  return { ok: true, duLieu: res.duLieu, model: res.model, nhaCungCap: 'claude' };
}

export type { CauKttxDocAI, KetQuaDocKttxClaude };
