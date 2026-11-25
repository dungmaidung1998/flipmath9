/**
 * FILE NÀY LÀM GÌ: Mô-đun TypeScript/JavaScript hỗ trợ xử lý dữ liệu và nghiệp vụ trong hệ thống FlipMath 9.
 * AI DÙNG: dùng chung
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: không gọi mô-đun nội bộ khác
 */
/** Trò "Mật mã số" đổi thành nhiệm vụ theo chủ đề Đà Nẵng của từng chương.
 *  Mỗi câu đúng đưa nhiệm vụ lên một nấc; hình lấy từ 5 mức của khu vườn kiến thức (/vuon/Cn-0..4.webp). */
export type ChuDeMatMa = { ten: string; bieuTuong: string; cach: string; nut: string; dung: string; tiep: string; cuoi: string; xong: string; don: string };

export const CHU_DE_MAT_MA: Record<string, ChuDeMatMa> = {
  C1:  { ten: 'Đi chợ Hàn', bieuTuong: '🧺', cach: 'Gõ đúng đáp số để trả tiền, mỗi câu đúng thêm một món vào giỏ.', nut: 'Trả tiền', dung: 'Mua được rồi! Thêm một món vào giỏ.', tiep: 'Sạp tiếp theo →', cuoi: 'Xách giỏ về', xong: 'Đầy giỏ rồi! 🧺', don: 'món' },
  C2:  { ten: 'Cân hàng chợ Cồn', bieuTuong: '⚖️', cach: 'Gõ đúng đáp số để đặt quả cân, giúp bà bán hàng cân cho thăng bằng.', nut: 'Đặt quả cân', dung: 'Cân nhích dần về thăng bằng!', tiep: 'Mẻ hàng tiếp →', cuoi: 'Chốt cân', xong: 'Cân thăng bằng! ⚖️', don: 'quả cân' },
  C3:  { ten: 'Thợ đá Non Nước', bieuTuong: '🪨', cach: 'Mỗi đáp số đúng là một nhát đục, khối đá dần thành tượng.', nut: 'Đục đá', dung: 'Nhát đục chuẩn! Tượng rõ hình hơn.', tiep: 'Nhát tiếp →', cuoi: 'Hoàn thiện tượng', xong: 'Tượng đá hoàn thành! 🗿', don: 'nhát đục' },
  C4:  { ten: 'Cáp treo Bà Nà', bieuTuong: '🚡', cach: 'Mỗi đáp số đúng đưa cabin vượt qua một trụ cáp lên đỉnh núi.', nut: 'Cho cabin chạy', dung: 'Cabin qua trụ, lên cao thêm!', tiep: 'Trụ tiếp →', cuoi: 'Lên đỉnh', xong: 'Tới đỉnh Bà Nà! 🏔️', don: 'trụ' },
  C5:  { ten: 'Vòng quay Sun Wheel', bieuTuong: '🎡', cach: 'Mỗi đáp số đúng quay vòng quay thêm một góc, quay trọn 360° là thắng.', nut: 'Quay', dung: 'Vòng quay xoay thêm một góc!', tiep: 'Quay tiếp →', cuoi: 'Quay trọn vòng', xong: 'Trọn 360°! 🎡', don: 'góc quay' },
  C6:  { ten: 'Nuôi rồng Cầu Rồng', bieuTuong: '🐉', cach: 'Mỗi đáp số đúng giúp rồng lớn thêm, đủ lớn thì rồng phun nước.', nut: 'Cho rồng ăn', dung: 'Rồng lớn thêm rồi!', tiep: 'Câu tiếp →', cuoi: 'Cho rồng phun nước', xong: 'Rồng phun nước! 🐉', don: 'bữa' },
  C7:  { ten: 'Lâu đài cát Mỹ Khê', bieuTuong: '🏖️', cach: 'Mỗi đáp số đúng đắp thêm một phần cho lâu đài cát.', nut: 'Đắp cát', dung: 'Lâu đài cao thêm!', tiep: 'Xô cát tiếp →', cuoi: 'Cắm cờ', xong: 'Lâu đài hoàn thành! 🏰', don: 'xô cát' },
  C8:  { ten: 'Tìm voọc Sơn Trà', bieuTuong: '🐒', cach: 'Mỗi đáp số đúng đưa em đi sâu vào rừng, gần đàn voọc hơn.', nut: 'Đi tiếp', dung: 'Thấy thêm dấu vết của voọc!', tiep: 'Đường mòn tiếp →', cuoi: 'Gặp đàn voọc', xong: 'Gặp cả đàn voọc! 🐒', don: 'chặng' },
  C9:  { ten: 'Dựng Cầu Vàng', bieuTuong: '🌉', cach: 'Mỗi đáp số đúng lắp thêm một nhịp cầu trên bàn tay đá.', nut: 'Lắp nhịp', dung: 'Lắp xong một nhịp cầu!', tiep: 'Nhịp tiếp →', cuoi: 'Thông cầu', xong: 'Cầu Vàng hoàn thành! 🌉', don: 'nhịp' },
  C10: { ten: 'Khai quật cổ vật Chăm', bieuTuong: '🏺', cach: 'Mỗi đáp số đúng gạt thêm một lớp đất, cổ vật lộ dần.', nut: 'Gạt đất', dung: 'Lộ thêm một mảnh cổ vật!', tiep: 'Lớp đất tiếp →', cuoi: 'Nhấc cổ vật', xong: 'Tìm thấy báu vật! 🏺', don: 'lớp đất' }
};

export const chuDeMatMa = (ku: string): (ChuDeMatMa & { chuong: string }) | null => {
  // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
  const chuong = /^C\d+/.exec(ku)?.[0];
  return chuong && CHU_DE_MAT_MA[chuong] ? { ...CHU_DE_MAT_MA[chuong], chuong } : null;
};
/** Ảnh mức 0..4 theo tỉ lệ câu đúng. */
export const anhMucMatMa = (chuong: string, dung: number, tong: number) =>
  `/vuon/${chuong}-${Math.min(4, Math.round((4 * dung) / Math.max(1, tong)))}.webp`;
