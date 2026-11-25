/**
 * FILE NÀY LÀM GÌ: Mô-đun TypeScript/JavaScript hỗ trợ xử lý dữ liệu và nghiệp vụ trong hệ thống FlipMath 9.
 * AI DÙNG: dùng chung
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: ./diaDanh, ./chuDeChuong
 */
/** Đổi "vỏ" các trò chơi ôn nền theo chủ đề Đà Nẵng của từng chương.
 *  Cơ chế chơi giữ nguyên; chỉ đổi tên, lời dẫn, vật mục tiêu, màu và cảnh nền (ảnh /chu-de/canh/Cn.webp). */
import { DIA_DANH } from './diaDanh';
import { chuDeChuong } from './chuDeChuong';

export type HinhVat = 'bong' | 'den' | 'trai' | 'da' | 'bot' | 'ngoc' | 'may' | 'gom';
type Vo = { ten: string; bieuTuong: string; cach: string; hd?: string; hinh?: HinhVat; vat?: string };
type ChuongVo = { matThe: string; gio: string; banBong: Vo; latThe: Vo; noiCot: Vo; dungSai: Vo; leoNui: Vo; sapXep: Vo; phanLoai: Vo; dich: string };

const V: Record<string, ChuongVo> = {
  C1: { matThe: '🧺', gio: '🧺', dich: '🧺',
    banBong: { ten: 'Hái trái cây sạp chợ Hàn', bieuTuong: '🍊', cach: 'Bấm vào trái cây mang đáp án đúng để bỏ vào giỏ.', hd: 'Hái trái cây mang đáp án đúng.', hinh: 'trai', vat: '🍊' },
    latThe: { ten: 'Lật thẻ giá chợ Hàn', bieuTuong: '🏷️', cach: 'Lật hai thẻ giá có cùng giá trị. Tìm đủ các cặp.' },
    noiCot: { ten: 'Nối món với giá', bieuTuong: '🧾', cach: 'Chọn một món bên trái rồi chọn giá bên phải hợp với nó.' },
    dungSai: { ten: 'Bà bán hàng hỏi nhanh', bieuTuong: '🛒', cach: 'Nghe bà hỏi, bấm Đúng hoặc Sai trước khi hết giờ.' },
    leoNui: { ten: 'Đi hết các sạp chợ Hàn', bieuTuong: '🛍️', cach: 'Mỗi câu đúng đưa em qua một sạp hàng.' },
    sapXep: { ten: 'Xếp các bước tính tiền', bieuTuong: '🧮', cach: 'Kéo thả hoặc bấm mũi tên để xếp các bước giải theo đúng thứ tự.' },
    phanLoai: { ten: 'Xếp hàng vào giỏ', bieuTuong: '🧺', cach: 'Chọn một món rồi bấm vào giỏ đúng của nó.' } },
  C2: { matThe: '⚖️', gio: '🛍️', dich: '⚖️',
    banBong: { ten: 'Bắt quả cân chợ Cồn', bieuTuong: '⚖️', cach: 'Bấm vào quả cân mang đáp án đúng.', hd: 'Chọn quả cân mang đáp án đúng.', hinh: 'da', vat: '⚖️' },
    latThe: { ten: 'Lật thẻ quầy chợ Cồn', bieuTuong: '🏷️', cach: 'Lật hai thẻ có cùng giá trị. Tìm đủ các cặp.' },
    noiCot: { ten: 'Nối hàng lên cân', bieuTuong: '⚖️', cach: 'Chọn một ô bên trái rồi chọn ô bên phải hợp với nó.' },
    dungSai: { ten: 'Cân đúng hay cân sai?', bieuTuong: '⚖️', cach: 'Đọc nhanh từng câu rồi bấm Đúng hoặc Sai trước khi hết giờ.' },
    leoNui: { ten: 'Đi hết dãy hàng chợ Cồn', bieuTuong: '🛍️', cach: 'Mỗi câu đúng đưa em qua một quầy hàng. Tới quầy cuối là thắng.' },
    sapXep: { ten: 'Xếp bước như xếp hàng lên cân', bieuTuong: '📦', cach: 'Kéo thả hoặc bấm mũi tên để xếp các bước giải theo đúng thứ tự.' },
    phanLoai: { ten: 'Xếp hàng vào sạp', bieuTuong: '🛍️', cach: 'Chọn một món hàng rồi bấm vào sạp đúng của nó.' } },
  C3: { matThe: '🪨', gio: '🪨', dich: '🗿',
    banBong: { ten: 'Đục đúng viên đá', bieuTuong: '⛏️', cach: 'Bấm vào viên đá mang đáp án đúng để đục.', hd: 'Đục viên đá mang đáp án đúng.', hinh: 'da', vat: '⛏️' },
    latThe: { ten: 'Lật phiến đá Non Nước', bieuTuong: '🪨', cach: 'Lật hai phiến đá có cùng giá trị. Tìm đủ các cặp.' },
    noiCot: { ten: 'Ghép mảnh tượng', bieuTuong: '🗿', cach: 'Chọn một mảnh bên trái rồi chọn mảnh bên phải khớp với nó.' },
    dungSai: { ten: 'Thợ cả kiểm tra nhanh', bieuTuong: '🔨', cach: 'Đọc nhanh từng câu rồi bấm Đúng hoặc Sai trước khi hết giờ.' },
    leoNui: { ten: 'Leo Ngũ Hành Sơn', bieuTuong: '⛰️', cach: 'Mỗi câu đúng đưa em lên một bậc đá. Lên tới đỉnh là thắng.' },
    sapXep: { ten: 'Xếp các nhát đục', bieuTuong: '🔨', cach: 'Kéo thả hoặc bấm mũi tên để xếp các bước giải theo đúng thứ tự.' },
    phanLoai: { ten: 'Xếp đá vào xưởng', bieuTuong: '🪨', cach: 'Chọn một khối đá rồi bấm vào xưởng đúng của nó.' } },
  C4: { matThe: '🚡', gio: '🚡', dich: '🏔️',
    banBong: { ten: 'Bắt mây trên cáp treo', bieuTuong: '☁️', cach: 'Bấm vào đám mây mang đáp án đúng khi cabin lướt qua.', hd: 'Bắt đám mây mang đáp án đúng.', hinh: 'may', vat: '☁️' },
    latThe: { ten: 'Lật vé cáp treo', bieuTuong: '🎫', cach: 'Lật hai vé có cùng giá trị. Tìm đủ các cặp.' },
    noiCot: { ten: 'Nối các ga cáp treo', bieuTuong: '🚡', cach: 'Chọn một ga bên trái rồi chọn ga bên phải hợp với nó.' },
    dungSai: { ten: 'Kiểm tra trước khi lên cabin', bieuTuong: '✅', cach: 'Đọc nhanh từng câu rồi bấm Đúng hoặc Sai trước khi hết giờ.' },
    leoNui: { ten: 'Cabin lên đỉnh Bà Nà', bieuTuong: '🚡', cach: 'Mỗi câu đúng đưa cabin qua một trụ. Lên tới đỉnh là thắng.' },
    sapXep: { ten: 'Xếp các ga lên núi', bieuTuong: '🪜', cach: 'Kéo thả hoặc bấm mũi tên để xếp các bước giải theo đúng thứ tự.' },
    phanLoai: { ten: 'Xếp khách lên cabin', bieuTuong: '🚡', cach: 'Chọn một thẻ rồi bấm vào cabin đúng của nó.' } },
  C5: { matThe: '🎡', gio: '🎡', dich: '🎡',
    banBong: { ten: 'Bắn bóng khu vui chơi Sun Wheel', bieuTuong: '🎈', cach: 'Bấm vào quả bóng mang đáp án đúng ở khu vui chơi.', hd: 'Bắn quả bóng mang đáp án đúng.', hinh: 'bong', vat: '🎡' },
    latThe: { ten: 'Lật vé khu vui chơi', bieuTuong: '🎟️', cach: 'Lật hai vé có cùng giá trị. Tìm đủ các cặp.' },
    noiCot: { ten: 'Nối cabin vòng quay', bieuTuong: '🎡', cach: 'Chọn một cabin bên trái rồi chọn cabin bên phải hợp với nó.' },
    dungSai: { ten: 'Đúng sai trên vòng quay', bieuTuong: '🎡', cach: 'Đọc nhanh từng câu rồi bấm Đúng hoặc Sai trước khi hết giờ.' },
    leoNui: { ten: 'Lên đỉnh vòng quay', bieuTuong: '🎡', cach: 'Mỗi câu đúng đưa cabin lên cao thêm. Lên tới đỉnh là thắng.' },
    sapXep: { ten: 'Xếp hàng lên vòng quay', bieuTuong: '🎟️', cach: 'Kéo thả hoặc bấm mũi tên để xếp các bước giải theo đúng thứ tự.' },
    phanLoai: { ten: 'Xếp khách vào cabin', bieuTuong: '🎡', cach: 'Chọn một thẻ rồi bấm vào cabin đúng của nó.' } },
  C6: { matThe: '🐉', gio: '🐲', dich: '🐉',
    banBong: { ten: 'Bắt ngọc rồng', bieuTuong: '🔮', cach: 'Bấm vào viên ngọc mang đáp án đúng để rồng lớn thêm.', hd: 'Bắt viên ngọc mang đáp án đúng.', hinh: 'ngoc', vat: '🐉' },
    latThe: { ten: 'Lật vảy rồng', bieuTuong: '🐉', cach: 'Lật hai vảy rồng có cùng giá trị. Tìm đủ các cặp.' },
    noiCot: { ten: 'Nối vảy rồng', bieuTuong: '🐲', cach: 'Chọn một vảy bên trái rồi chọn vảy bên phải hợp với nó.' },
    dungSai: { ten: 'Rồng hỏi nhanh', bieuTuong: '🐉', cach: 'Đọc nhanh từng câu rồi bấm Đúng hoặc Sai trước khi hết giờ.' },
    leoNui: { ten: 'Đi dọc lưng Cầu Rồng', bieuTuong: '🐉', cach: 'Mỗi câu đúng đưa em qua một khúc rồng. Tới đầu rồng là thắng.' },
    sapXep: { ten: 'Xếp khúc rồng', bieuTuong: '🐲', cach: 'Kéo thả hoặc bấm mũi tên để xếp các bước giải theo đúng thứ tự.' },
    phanLoai: { ten: 'Xếp ngọc vào ổ rồng', bieuTuong: '🐲', cach: 'Chọn một viên ngọc rồi bấm vào ổ đúng của nó.' } },
  C7: { matThe: '🐚', gio: '🪣', dich: '🏰',
    banBong: { ten: 'Bắt bong bóng biển Mỹ Khê', bieuTuong: '🫧', cach: 'Bấm vào bong bóng mang đáp án đúng trên mặt biển.', hd: 'Bắt bong bóng mang đáp án đúng.', hinh: 'bot', vat: '🐚' },
    latThe: { ten: 'Lật vỏ sò', bieuTuong: '🐚', cach: 'Lật hai vỏ sò có cùng giá trị. Tìm đủ các cặp.' },
    noiCot: { ten: 'Nối phao bơi', bieuTuong: '🛟', cach: 'Chọn một phao bên trái rồi chọn phao bên phải hợp với nó.' },
    dungSai: { ten: 'Cứu hộ kiểm tra nhanh', bieuTuong: '🛟', cach: 'Đọc nhanh từng câu rồi bấm Đúng hoặc Sai trước khi hết giờ.' },
    leoNui: { ten: 'Đắp lâu đài cát', bieuTuong: '🏰', cach: 'Mỗi câu đúng đắp lâu đài cao thêm. Cắm được cờ là thắng.' },
    sapXep: { ten: 'Xếp xô cát', bieuTuong: '🪣', cach: 'Kéo thả hoặc bấm mũi tên để xếp các bước giải theo đúng thứ tự.' },
    phanLoai: { ten: 'Nhặt sò vào xô', bieuTuong: '🪣', cach: 'Chọn một vỏ sò rồi bấm vào xô đúng của nó.' } },
  C8: { matThe: '🍃', gio: '🧺', dich: '🐒',
    banBong: { ten: 'Hái quả rừng cho voọc', bieuTuong: '🐒', cach: 'Bấm vào quả rừng mang đáp án đúng để cho voọc ăn.', hd: 'Hái quả rừng mang đáp án đúng.', hinh: 'trai', vat: '🍃' },
    latThe: { ten: 'Lật lá rừng Sơn Trà', bieuTuong: '🍃', cach: 'Lật hai chiếc lá có cùng giá trị. Tìm đủ các cặp.' },
    noiCot: { ten: 'Nối dấu chân voọc', bieuTuong: '🐾', cach: 'Chọn một ô bên trái rồi chọn ô bên phải hợp với nó.' },
    dungSai: { ten: 'Kiểm lâm hỏi nhanh', bieuTuong: '🌲', cach: 'Đọc nhanh từng câu rồi bấm Đúng hoặc Sai trước khi hết giờ.' },
    leoNui: { ten: 'Lên rừng Sơn Trà', bieuTuong: '🌲', cach: 'Mỗi câu đúng đưa em đi sâu vào rừng. Gặp đàn voọc là thắng.' },
    sapXep: { ten: 'Xếp đường mòn', bieuTuong: '🥾', cach: 'Kéo thả hoặc bấm mũi tên để xếp các bước giải theo đúng thứ tự.' },
    phanLoai: { ten: 'Xếp quả vào giỏ cho voọc', bieuTuong: '🧺', cach: 'Chọn một quả rồi bấm vào giỏ đúng của nó.' } },
  C9: { matThe: '🌉', gio: '🧱', dich: '🌉',
    banBong: { ten: 'Thả lồng đèn trên Cầu Vàng', bieuTuong: '🏮', cach: 'Bấm vào lồng đèn mang đáp án đúng để thắp sáng cầu.', hd: 'Chọn lồng đèn mang đáp án đúng.', hinh: 'den', vat: '🌉' },
    latThe: { ten: 'Lật gạch lát Cầu Vàng', bieuTuong: '🧱', cach: 'Lật hai viên gạch có cùng giá trị. Tìm đủ các cặp.' },
    noiCot: { ten: 'Nối nhịp cầu', bieuTuong: '🌉', cach: 'Chọn một nhịp bên trái rồi chọn nhịp bên phải khớp với nó.' },
    dungSai: { ten: 'Kỹ sư kiểm tra cầu', bieuTuong: '👷', cach: 'Đọc nhanh từng câu rồi bấm Đúng hoặc Sai trước khi hết giờ.' },
    leoNui: { ten: 'Đi trên Cầu Vàng', bieuTuong: '🌉', cach: 'Mỗi câu đúng đưa em qua một nhịp cầu. Qua hết cầu là thắng.' },
    sapXep: { ten: 'Xếp các bước dựng cầu', bieuTuong: '🏗️', cach: 'Kéo thả hoặc bấm mũi tên để xếp các bước giải theo đúng thứ tự.' },
    phanLoai: { ten: 'Xếp vật liệu vào kho', bieuTuong: '🧱', cach: 'Chọn một vật liệu rồi bấm vào kho đúng của nó.' } },
  C10: { matThe: '🏺', gio: '🏺', dich: '🏺',
    banBong: { ten: 'Nhặt mảnh gốm Chăm', bieuTuong: '🏺', cach: 'Bấm vào mảnh gốm mang đáp án đúng để ghép cổ vật.', hd: 'Nhặt mảnh gốm mang đáp án đúng.', hinh: 'gom', vat: '🏺' },
    latThe: { ten: 'Lật mảnh gốm', bieuTuong: '🏺', cach: 'Lật hai mảnh gốm có cùng giá trị. Tìm đủ các cặp.' },
    noiCot: { ten: 'Ghép cổ vật', bieuTuong: '🗿', cach: 'Chọn một mảnh bên trái rồi chọn mảnh bên phải khớp với nó.' },
    dungSai: { ten: 'Thẩm định cổ vật', bieuTuong: '🔍', cach: 'Đọc nhanh từng câu rồi bấm Đúng hoặc Sai trước khi hết giờ.' },
    leoNui: { ten: 'Đi qua các phòng bảo tàng', bieuTuong: '🏛️', cach: 'Mỗi câu đúng đưa em qua một phòng trưng bày.' },
    sapXep: { ten: 'Xếp các lớp khai quật', bieuTuong: '⛏️', cach: 'Kéo thả hoặc bấm mũi tên để xếp các bước giải theo đúng thứ tự.' },
    phanLoai: { ten: 'Xếp cổ vật vào tủ', bieuTuong: '🏛️', cach: 'Chọn một cổ vật rồi bấm vào tủ đúng của nó.' } }
};

// Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
const chuongCua = (ku: string) => /^C\d+/.exec(ku)?.[0] ?? '';

/** Tên, biểu tượng, cách chơi của một trò theo chương (null nếu không có). */
export function voTroChoi(ku: string, kieu: string): (Vo & { chuong: string }) | null {
  const c = chuongCua(ku);
  const v = (V[c] as unknown as Record<string, Vo> | undefined)?.[kieu];
  return v && typeof v === 'object' ? { ...v, chuong: c } : null;
}

/** Màu, cảnh nền, mặt sau thẻ, biểu tượng giỏ của chương. */
export function canhChuong(ku: string) {
  const c = chuongCua(ku);
  const v = V[c];
  if (!v) return null;
  return {
    chuong: c,
    mau: DIA_DANH[c]?.mau ?? '#2b4ba8',
    nen: chuDeChuong(c)?.tranh ?? '/canh/bai-hoc.webp',
    matThe: v.matThe,
    gio: v.gio,
    dich: v.dich,
  };
}
