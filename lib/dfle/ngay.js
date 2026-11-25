/**
 * NGÀY THEO GIỜ VIỆT NAM
 * ---------------------------------------------------------------------------
 * Mọi phép "sự kiện này thuộc ngày nào" trong hệ thống đều đi qua đây.
 *
 * Vì sao cần một tệp riêng cho một việc tưởng như vặt vãnh: `toISOString()` trả
 * về giờ UTC. Việt Nam là UTC+7, nên một em học lúc 22h30 tối nay và một em học
 * lúc 6h30 sáng mai — hai ngày khác nhau trong đời thật — lại rơi vào CÙNG một
 * ngày UTC. Thành phần "Đều đặn" của LES đếm số ngày có hoạt động, nên nó đếm
 * hụt đúng ở nhóm học buổi tối, tức là nhóm đông nhất. Chuỗi ngày liên tiếp
 * (streak) cũng bị đứt oan vì lý do y hệt.
 *
 * Cách tính: Việt Nam dùng UTC+7 cố định, không có giờ mùa hè từ năm 1975, nên
 * cộng thẳng 7 giờ rồi lấy phần ngày của UTC là đúng tuyệt đối — không cần
 * Intl, không cần bảng múi giờ, và cho ra cùng một kết quả ở trình duyệt, ở máy
 * chủ Node và trong PostgreSQL (`at time zone 'Asia/Ho_Chi_Minh'`).
 */

/** Lệch múi giờ Việt Nam so với UTC, tính bằng mili giây. */
export const LECH_VN_MS = 7 * 60 * 60 * 1000;

/**
 * Ngày theo lịch Việt Nam, dạng 'YYYY-MM-DD'.
 * @param {Date|number|string} luc  mốc thời gian (Date, epoch ms, hoặc chuỗi ISO)
 * @returns {string}
 */
export function ngayVN(luc) {
  const t = luc instanceof Date ? luc.getTime() : new Date(luc).getTime();
  if (Number.isNaN(t)) return '';
  return new Date(t + LECH_VN_MS).toISOString().slice(0, 10);
}

/** Hôm nay theo lịch Việt Nam, dạng 'YYYY-MM-DD'. */
export function homNayVN() {
  return ngayVN(Date.now());
}

/**
 * Số ngày (theo lịch Việt Nam) giữa hai mốc. Dùng cho "bao nhiêu ngày không
 * hoạt động" — đếm theo NGÀY LỊCH chứ không theo 24 giờ tròn, vì nghỉ từ tối
 * thứ Hai đến sáng thứ Tư là nghỉ hai ngày, dù chưa đủ 48 giờ.
 * @param {Date|number|string} tu
 * @param {Date|number|string} den
 * @returns {number}
 */
export function soNgayCachNhau(tu, den) {
  const a = Date.parse(ngayVN(tu) + 'T00:00:00Z');
  const b = Date.parse(ngayVN(den) + 'T00:00:00Z');
  if (Number.isNaN(a) || Number.isNaN(b)) return 0;
  return Math.round((b - a) / 86400000);
}
