/**
 * FILE NÀY LÀM GÌ: Mô-đun TypeScript/JavaScript hỗ trợ xử lý dữ liệu và nghiệp vụ trong hệ thống FlipMath 9.
 * AI DÙNG: dùng chung
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: không gọi mô-đun nội bộ khác
 */
/**
 * Tách mô tả mã lỗi dài thành [tên ngắn, phần chi tiết].
 * "Nhận dạng ... sai: coi xy, x² ... Ví dụ: ..." -> ["Nhận dạng ... sai", "coi xy, x² ... Ví dụ: ..."]
 * Dùng chung cho trang GV Hôm nay và kết quả Soát lỗi của học sinh (24/11/2026).
 */
export function tachLoi(t: string): [string, string] {
  let ngan = t, them = '';
  const vd = t.indexOf('. Ví dụ');
  if (vd > 0) { ngan = t.slice(0, vd); them = t.slice(vd + 2); }
  const hc = ngan.indexOf(': ');
  if (hc > 0 && hc < 80) { them = ngan.slice(hc + 2) + (them ? '. ' + them : ''); ngan = ngan.slice(0, hc); }
  const ho = ngan.indexOf(', hoặc ');
  if (ho > 30) { them = 'Hoặc ' + ngan.slice(ho + 7) + (them ? '. ' + them : ''); ngan = ngan.slice(0, ho); }
  return [ngan, them];
}
