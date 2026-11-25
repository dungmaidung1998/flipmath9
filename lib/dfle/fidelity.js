/**
 * ĐỘ TRUNG THỰC TRIỂN KHAI (fidelity of implementation)
 * ---------------------------------------------------------------------------
 * Vì sao phải đo cái này?
 *
 * Bản thiết kế nghiên cứu có một câu ràng buộc: chỉ đưa vào phân tích chính
 * những lớp đạt độ trung thực triển khai từ 80% trở lên. Nếu không đo, câu đó
 * chỉ là lời hứa. Và nếu một lớp thực nghiệm thực ra chỉ chạy đúng quy trình
 * ba pha ở một nửa số tiết, thì kết quả "không có khác biệt" giữa lớp thực
 * nghiệm và lớp đối chứng KHÔNG chứng minh mô hình vô hiệu — nó chỉ chứng minh
 * mô hình chưa từng được triển khai. Đây là lỗi phổ biến nhất của các nghiên
 * cứu can thiệp trong lớp học, và cũng là câu hỏi phản biện dễ bị hỏi nhất.
 *
 * Bốn thành phần lấy theo khung Dane & Schneider, đặt lại bằng ngôn ngữ của
 * chính mô hình này:
 *
 *   A. TUÂN THỦ QUY TRÌNH   — tiết dạy có chạy đủ ba pha không?
 *   B. LIỀU LƯỢNG           — học sinh có thật sự học pha trước giờ không?
 *   C. CHẤT LƯỢNG THỰC HIỆN — giáo viên có mở báo cáo chẩn đoán TRƯỚC giờ dạy
 *                             và chia nhóm theo dữ liệu không? Mở sau giờ dạy
 *                             thì mô hình mất đúng phần "thích ứng".
 *   D. MỨC ĐÁP ỨNG          — học sinh có làm nội dung hệ thống giao lại không?
 *
 * Hàm thuần, không đọc cơ sở dữ liệu, không phụ thuộc thời gian hệ thống — nhờ
 * đó kiểm thử lặp lại được và giám khảo tính tay lại được bằng máy tính bỏ túi.
 */

/** Ngưỡng trong bản thiết kế nghiên cứu: dưới mức này thì tách ra phân tích riêng. */
export const NGUONG_DAT = 80;
export const NGUONG_CAN_CAI_THIEN = 60;

/**
 * Trọng số bốn thành phần. Tuân thủ và liều lượng nặng hơn vì đó là hai điều
 * kiện cần: không đủ ba pha, hoặc học sinh không học trước, thì phần còn lại
 * không có ý nghĩa.
 *
 * LƯU Ý: đây là trọng số THIẾT KẾ do nhóm nghiên cứu đặt ra, không phải hằng số
 * đã được chứng minh. Nếu đổi, phải ghi lại trong nhật ký nghiên cứu và tính lại
 * toàn bộ các tuần đã tính, không được đổi giữa chừng.
 */
export const TRONG_SO = Object.freeze({
  tuanThu: 0.30,
  lieuLuong: 0.30,
  chatLuong: 0.25,
  dapUng: 0.15
});

const pct = (tu, mau) => (mau > 0 ? Math.round((tu / mau) * 1000) / 10 : null);
const kep = (x) => Math.max(0, Math.min(100, x));

/**
 * @typedef {object} DauVaoTuan
 * @property {number} soTietTheoKeHoach     số tiết dự kiến dạy theo mô hình trong tuần
 * @property {number} soTietDayDuBaPha      số tiết thực tế chạy đủ ba pha
 * @property {number} soTietMoDashboardTruocGio  số tiết giáo viên mở báo cáo chẩn đoán TRƯỚC giờ dạy
 * @property {number} soTietChiaNhomTheoDuLieu   số tiết có chia nhóm theo dữ liệu chẩn đoán
 * @property {number} soHocSinh             sĩ số lớp (đã đồng thuận tham gia)
 * @property {number} luotHoanThanhTruocGio số lượt học sinh hoàn thành pha trước giờ đúng hạn
 * @property {number} soGoiYDaGiao          số gợi ý hệ thống đã giao trong tuần
 * @property {number} soGoiYDaLam           số gợi ý học sinh đã làm
 */

/**
 * Tính độ trung thực triển khai của MỘT TUẦN ở MỘT LỚP.
 *
 * Thành phần nào không có mẫu số (ví dụ tuần đó hệ thống chưa giao gợi ý nào)
 * thì trả về null và bị LOẠI KHỎI phép tính chứ không tính là 0 — coi "chưa đo"
 * là "bằng không" là cách nhanh nhất để bôi đen một tuần dạy hoàn toàn bình thường.
 *
 * @param {DauVaoTuan} d
 */
export function tinhDoTrungThuc(d = {}) {
  const soTiet = Math.max(0, Number(d.soTietTheoKeHoach) || 0);
  const soHs = Math.max(0, Number(d.soHocSinh) || 0);

  const tuanThu = pct(Number(d.soTietDayDuBaPha) || 0, soTiet);

  const lieuLuong = pct(Number(d.luotHoanThanhTruocGio) || 0, soTiet * soHs);

  // Chất lượng thực hiện gộp hai việc: mở báo cáo trước giờ, và có dùng báo cáo
  // đó để chia nhóm. Mở mà không dùng thì mới đi được nửa đường.
  const chatLuong = soTiet > 0
    ? kep(Math.round((
        ((Number(d.soTietMoDashboardTruocGio) || 0) / soTiet) * 0.5 +
        ((Number(d.soTietChiaNhomTheoDuLieu) || 0) / soTiet) * 0.5
      ) * 1000) / 10)
    : null;

  // MỨC ĐÁP ỨNG = số nội dung bổ trợ học sinh LÀM XONG / số đã giao.
  const dapUng = pct(Number(d.soGoiYDaLam) || 0, Number(d.soGoiYDaGiao) || 0);

  /**
   * Tỉ lệ MỞ là số CHẨN ĐOÁN, không tính vào điểm.
   *
   * Nó tách "được giao mà không mở" khỏi "mở ra rồi bỏ dở" — hai tình trạng cần
   * hai can thiệp khác hẳn nhau. Không mở thì vấn đề nằm ở chỗ các em không biết
   * có bài, hoặc không vào được hệ thống ở nhà. Mở rồi bỏ dở thì vấn đề nằm ở
   * chính nội dung: dài quá, khó quá, hoặc không dính gì tới chỗ em đang vướng.
   *
   * Đây đúng là phân biệt mà cả dự án được xây quanh nó — "chưa xem bài" khác
   * "xem hết mà không hiểu" — chỉ là áp cho nội dung bổ trợ thay vì cho video.
   *
   * Không tính vào điểm vì nó không phải mục tiêu: mở ra mà không làm thì cũng
   * chưa sửa được quan niệm sai. Nó chỉ giúp giáo viên biết phải sửa ở đâu.
   */
  // Không truyền số lượt mở thì trả null, KHÔNG trả 0. Bảng micro_lesson_events
  // có thể chưa tồn tại (chưa chạy 08-vi-bai-hoc.sql) hoặc dữ liệu cũ không có
  // trường này — hiện "0% mở" trong hai trường hợp đó là báo động giả, và giáo
  // viên sẽ đi tìm một vấn đề không có thật.
  const tiLeMo = d.soGoiYDaMo === undefined || d.soGoiYDaMo === null
    ? null
    : pct(Number(d.soGoiYDaMo) || 0, Number(d.soGoiYDaGiao) || 0);

  const thanhPhan = {
    tuanThu: tuanThu === null ? null : kep(tuanThu),
    lieuLuong: lieuLuong === null ? null : kep(lieuLuong),
    chatLuong,
    dapUng: dapUng === null ? null : kep(dapUng)
  };

  // trung bình có trọng số trên các thành phần đo được, chuẩn hoá lại trọng số
  let tongTrongSo = 0, tongDiem = 0;
  for (const [k, v] of Object.entries(thanhPhan)) {
    if (v === null) continue;
    tongTrongSo += TRONG_SO[k];
    tongDiem += TRONG_SO[k] * v;
  }
  const tong = tongTrongSo > 0 ? Math.round((tongDiem / tongTrongSo) * 10) / 10 : null;

  return {
    thanhPhan,
    tong,
    soThanhPhanDoDuoc: Object.values(thanhPhan).filter((v) => v !== null).length,
    xepLoai: xepLoai(tong),
    dat: tong !== null && tong >= NGUONG_DAT,
    // chẩn đoán, không tính điểm — xem chú thích ở trên
    tiLeMo: tiLeMo === null ? null : kep(tiLeMo)
  };
}

/** @param {number|null} tong */
export function xepLoai(tong) {
  if (tong === null || tong === undefined) return 'chua-du-lieu';
  if (tong >= NGUONG_DAT) return 'dat';
  if (tong >= NGUONG_CAN_CAI_THIEN) return 'can-cai-thien';
  return 'khong-dat';
}

export const NHAN_XEP_LOAI = Object.freeze({
  'dat': 'Đạt — đưa vào phân tích chính',
  'can-cai-thien': 'Cần cải thiện — vẫn đưa vào phân tích, có ghi chú',
  'khong-dat': 'Không đạt — tách ra phân tích riêng',
  'chua-du-lieu': 'Chưa đủ dữ liệu để kết luận'
});

/**
 * Gộp nhiều tuần thành độ trung thực của cả đợt thực nghiệm cho một lớp.
 *
 * Gộp bằng cách CỘNG DỒN TỬ SỐ VÀ MẪU SỐ rồi mới chia, chứ không lấy trung bình
 * của các tỉ lệ tuần. Trung bình của tỉ lệ sẽ cho một tuần chỉ có 1 tiết cùng
 * sức nặng với tuần có 4 tiết, làm sai lệch kết quả.
 *
 * @param {DauVaoTuan[]} tuans
 */
export function gopCacTuan(tuans = []) {
  const cong = (f) => tuans.reduce((s, t) => s + (Number(t[f]) || 0), 0);
  const mauLieuLuong = tuans.reduce(
    (s, t) => s + (Number(t.soTietTheoKeHoach) || 0) * (Number(t.soHocSinh) || 0), 0);

  // dựng lại một "tuần tổng" rồi dùng đúng công thức trên, để chỉ có một chỗ
  // định nghĩa cách tính
  const soTiet = cong('soTietTheoKeHoach');
  const kq = tinhDoTrungThuc({
    soTietTheoKeHoach: soTiet,
    soTietDayDuBaPha: cong('soTietDayDuBaPha'),
    soTietMoDashboardTruocGio: cong('soTietMoDashboardTruocGio'),
    soTietChiaNhomTheoDuLieu: cong('soTietChiaNhomTheoDuLieu'),
    // sĩ số quy đổi để tích soTiet * soHocSinh khớp mẫu số thực
    soHocSinh: soTiet > 0 ? mauLieuLuong / soTiet : 0,
    luotHoanThanhTruocGio: cong('luotHoanThanhTruocGio'),
    soGoiYDaGiao: cong('soGoiYDaGiao'),
    // Cùng lý do như trong tinhDoTrungThuc: không tuần nào có số liệu mở thì
    // truyền undefined để tiLeMo ra null, chứ cộng dồn sẽ ra 0 và thành báo
    // động giả "0% mở".
    soGoiYDaMo: tuans.some((t) => t.soGoiYDaMo !== undefined && t.soGoiYDaMo !== null)
      ? cong('soGoiYDaMo') : undefined,
    soGoiYDaLam: cong('soGoiYDaLam')
  });
  return { ...kq, soTuan: tuans.length, soTietTheoKeHoach: soTiet };
}

/**
 * Việc nên làm tiếp — chỉ ra thành phần yếu nhất, vì "độ trung thực 71%" tự nó
 * không nói cho giáo viên biết phải sửa cái gì.
 */
export function viecCanLam(kq) {
  /**
   * Với mức đáp ứng, lời khuyên phụ thuộc vào chỗ đứt nằm ở đâu — và tỉ lệ mở là
   * thứ chỉ ra điều đó. Giao mà không mở là vấn đề tiếp cận; mở rồi bỏ dở là vấn
   * đề nội dung. Nói chung chung "học sinh ít làm bài" thì giáo viên không biết
   * sửa gì.
   */
  const dapUngGoi = () => {
    const mo = kq.tiLeMo;
    if (mo !== null && mo !== undefined && mo < 60) {
      return `Chỉ ${mo}% nội dung được giao là có em mở ra — chỗ đứt nằm ở khâu tiếp cận, không phải ở nội dung. Kiểm tra các em có biết mình được giao bài không, và có vào được hệ thống ở nhà không.`;
    }
    if (mo !== null && mo !== undefined && kq.thanhPhan.dapUng !== null && mo - kq.thanhPhan.dapUng >= 25) {
      return `Học sinh có mở (${mo}%) nhưng bỏ dở giữa chừng (${kq.thanhPhan.dapUng}% làm xong) — chỗ đứt nằm ở chính nội dung bổ trợ. Xem lại độ dài: quá 12 phút thì tỉ lệ bỏ dở tăng rõ.`;
    }
    return 'Học sinh ít làm nội dung được giao lại. Xem lại độ dài nội dung giao thêm — quá 12 phút thì tỉ lệ làm sẽ tụt.';
  };

  const goi = {
    tuanThu: 'Có tiết chưa chạy đủ ba pha. Xem lại tiết nào thiếu pha nào trong bảng nhật ký bên dưới.',
    lieuLuong: 'Nhiều học sinh chưa hoàn thành pha trước giờ. Kiểm tra các em không có thiết bị hoặc không vào được mạng ở nhà trước khi kết luận là các em không chịu học.',
    chatLuong: 'Báo cáo chẩn đoán chưa được mở trước giờ dạy hoặc chưa dùng để chia nhóm. Đây là phần làm nên chữ "thích ứng" của mô hình.',
    dapUng: dapUngGoi()
  };
  const co = Object.entries(kq.thanhPhan).filter(([, v]) => v !== null);
  if (!co.length) return [];
  const min = Math.min(...co.map(([, v]) => v));
  return co.filter(([, v]) => v === min && v < NGUONG_DAT).map(([k, v]) => ({
    thanhPhan: k, giaTri: v, viec: goi[k]
  }));
}

export const TEN_THANH_PHAN = Object.freeze({
  tuanThu: 'Tuân thủ quy trình ba pha',
  lieuLuong: 'Liều lượng — HS hoàn thành pha trước giờ',
  chatLuong: 'Chất lượng — dùng dữ liệu để dạy',
  dapUng: 'Mức đáp ứng — HS làm nội dung được giao'
});
