/**
 * FILE NÀY LÀM GÌ: Mô-đun TypeScript/JavaScript hỗ trợ xử lý dữ liệu và nghiệp vụ trong hệ thống FlipMath 9.
 * AI DÙNG: dùng chung
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: không gọi mô-đun nội bộ khác
 */
/**
 * Cấu hình linh vật Đà Nẵng (Voọc chà vá chân nâu Sơn Trà, Hoa đào chuông Bà Nà, Cá chép hóa rồng).
 * Ảnh Codex vẽ tại /chu-de/linh-vat/{ten}-{tu-the}.webp; khi chưa có file thật, tự dùng ảnh dự phòng sẵn có.
 */

export type TuTheVooc = 'chao' | 'co-vu' | 'suy-nghi' | 'ngu' | 'cam-cup' | 'chi-tay';
export type TuTheHoaDao = 'vui' | 'no-hoa' | 'roi-canh';
export type TuTheCaChep = 'boi' | 'nhay' | 'hoa-rong';

export type LoaiLinhVat = 'vooc' | 'hoa-dao' | 'ca-chep';

export type ThongTinLinhVat = {
  src: string;
  fallback: string;
  alt: string;
};

const VOOC: Record<TuTheVooc, ThongTinLinhVat> = {
  chao: {
    src: '/chu-de/linh-vat/vooc-cha-va-chan-nau-chao.webp',
    fallback: '/minh-hoa/nv/chao.webp',
    alt: 'Voọc chà vá Sơn Trà vẫy tay chào',
  },
  'co-vu': {
    src: '/chu-de/linh-vat/vooc-cha-va-chan-nau-co-vu.webp',
    fallback: '/minh-hoa/nv/reo-ho.webp',
    alt: 'Voọc chà vá Sơn Trà cổ vũ',
  },
  'suy-nghi': {
    src: '/chu-de/linh-vat/vooc-cha-va-chan-nau-suy-nghi.webp',
    fallback: '/minh-hoa/nv/suy-nghi.webp',
    alt: 'Voọc chà vá Sơn Trà đang suy nghĩ',
  },
  ngu: {
    src: '/chu-de/linh-vat/vooc-cha-va-chan-nau-ngu.webp',
    fallback: '/minh-hoa/nv/nghi-mat.webp',
    alt: 'Voọc chà vá Sơn Trà đang ngủ ngon lành',
  },
  'cam-cup': {
    src: '/chu-de/linh-vat/vooc-cha-va-chan-nau-cam-cup.webp',
    fallback: '/minh-hoa/nv/cup.webp',
    alt: 'Voọc chà vá Sơn Trà cầm cúp chúc mừng',
  },
  'chi-tay': {
    src: '/chu-de/linh-vat/vooc-cha-va-chan-nau-chi-tay.webp',
    fallback: '/minh-hoa/nv/chi-bang.webp',
    alt: 'Voọc chà vá Sơn Trà chỉ tay hướng dẫn',
  },
};

const HOA_DAO: Record<TuTheHoaDao, ThongTinLinhVat> = {
  vui: {
    src: '/chu-de/linh-vat/hoa-dao-chuong-vui.webp',
    fallback: '/chu-de/thuong/C5.webp',
    alt: 'Hoa đào chuông Bà Nà mỉm cười',
  },
  'no-hoa': {
    src: '/chu-de/linh-vat/hoa-dao-chuong-no-hoa.webp',
    fallback: '/chu-de/thuong/C1.webp',
    alt: 'Hoa đào chuông Bà Nà nở rộ',
  },
  'roi-canh': {
    src: '/chu-de/linh-vat/hoa-dao-chuong-roi-canh.webp',
    fallback: '/minh-hoa/bt/sao.webp',
    alt: 'Hoa đào chuông Bà Nà rơi cánh chúc mừng',
  },
};

const CA_CHEP: Record<TuTheCaChep, ThongTinLinhVat> = {
  boi: {
    src: '/chu-de/linh-vat/ca-chep-boi.webp',
    fallback: '/minh-hoa/bt/choi.webp',
    alt: 'Cá chép vượt sóng tiến lên',
  },
  nhay: {
    src: '/chu-de/linh-vat/ca-chep-nhay.webp',
    fallback: '/minh-hoa/bt/cay.webp',
    alt: 'Cá chép nhảy vượt vũ môn',
  },
  'hoa-rong': {
    src: '/chu-de/linh-vat/ca-chep-hoa-rong.webp',
    fallback: '/minh-hoa/bt/huy-hieu.webp',
    alt: 'Cá chép hóa rồng cầu Rồng Đà Nẵng',
  },
};

/**
 * Hàm `layLinhVat`: nhận (loai, tuThe), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
export function layLinhVat(loai: 'vooc', tuThe: TuTheVooc): ThongTinLinhVat;
/**
 * Hàm `layLinhVat`: nhận (loai, tuThe), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
export function layLinhVat(loai: 'hoa-dao', tuThe: TuTheHoaDao): ThongTinLinhVat;
/**
 * Hàm `layLinhVat`: nhận (loai, tuThe), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
export function layLinhVat(loai: 'ca-chep', tuThe: TuTheCaChep): ThongTinLinhVat;
/**
 * Hàm `layLinhVat`: nhận (loai, tuThe), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
export function layLinhVat(loai: LoaiLinhVat, tuThe: string): ThongTinLinhVat {
  if (loai === 'vooc') return VOOC[(tuThe as TuTheVooc)] ?? VOOC.chao;
  if (loai === 'hoa-dao') return HOA_DAO[(tuThe as TuTheHoaDao)] ?? HOA_DAO.vui;
  return CA_CHEP[(tuThe as TuTheCaChep)] ?? CA_CHEP['hoa-rong'];
}
