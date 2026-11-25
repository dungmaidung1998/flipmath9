/**
 * ĐIỂM KINH NGHIỆM VÀ HUY HIỆU
 * ---------------------------------------------------------------------------
 * Gamification trong một đề tài nghiên cứu là con dao hai lưỡi: thưởng sai chỗ
 * là làm nhiễu chính biến mình đang đo. Ba quyết định thiết kế dưới đây cần
 * giải thích được ở phần phỏng vấn.
 *
 * 1. KHÔNG thưởng theo ĐIỂM CAO.
 *    Thưởng điểm số sẽ khuyến khích đoán mò, chép bài và cày lại nhiều lần —
 *    đúng những hành vi quy tắc R04 đang cố phát hiện. Hệ thống chỉ thưởng
 *    HÀNH VI HỌC TẬP: chuẩn bị bài trước giờ, làm lại sau khi nhận phản hồi,
 *    hoàn thành nội dung bổ trợ, học đều đặn.
 *
 * 2. KHÔNG có bảng xếp hạng công khai.
 *    Xếp hạng công khai giữa học sinh lớp 7 vừa là vấn đề đạo đức nghiên cứu
 *    (so sánh công khai người chưa thành niên), vừa làm nhiễu biến động cơ mà
 *    đề tài đang đo. Học sinh chỉ so với chính mình ở tuần trước.
 *
 * 3. Thưởng phần KIÊN TRÌ nặng nhất.
 *    Làm lại bài sau khi nhận phản hồi là hành vi khó nhất và đúng thứ mô hình
 *    muốn nuôi — nên nó có hệ số cao nhất trong bảng dưới đây.
 */

/** Bảng điểm — tách riêng để hiệu chỉnh mà không phải sửa logic. */
export const XP_RULES = Object.freeze({
  hoan_thanh_chuan_bi: 20,   // làm xong bài kiểm tra ngắn trước giờ học
  xem_het_video: 10,         // xem có tương tác từ 90% thời lượng
  lam_lai_sau_phan_hoi: 30,  // hành vi kiên trì — hệ số cao nhất
  hoan_thanh_bo_tro: 25,     // làm xong nội dung được giao sau chẩn đoán
  lam_bai_van_dung: 20,      // pha sau giờ học
  ngay_hoc_lien_tuc: 5       // mỗi ngày trong chuỗi, tối đa cộng 35
});

/** @typedef {{code:string,name:string,desc:string}} Badge */

/** @type {Badge[]} */
export const BADGES = [
  { code: 'CHUAN_BI_5',   name: 'Chuẩn bị đều',      desc: 'Hoàn thành phần chuẩn bị của 5 bài học' },
  { code: 'KIEN_TRI_3',   name: 'Không bỏ cuộc',     desc: 'Chủ động làm lại 3 lần sau khi nhận phản hồi' },
  { code: 'SUA_LOI',      name: 'Sửa được lỗi cũ',   desc: 'Hết mắc một quan niệm sai từng lặp lại nhiều lần' },
  { code: 'CHUOI_7',      name: 'Bảy ngày liền',     desc: 'Học 7 ngày liên tục' },
  { code: 'LAM_CHU_3',    name: 'Làm chủ bài học',   desc: 'Đạt mức làm chủ 3/3 ở một đơn vị kiến thức' },
  { code: 'HO_TRO_NHOM',  name: 'Chỗ dựa của nhóm',  desc: 'Được hệ thống đề xuất làm nhóm trưởng' },
  { code: 'VAN_DUNG',     name: 'Vận dụng được',     desc: 'Đạt từ 6,5 điểm ở một bài vận dụng' }
];

export const BADGE_BY_CODE = new Map(BADGES.map((b) => [b.code, b]));

/**
 * Tính điểm kinh nghiệm cộng thêm cho MỘT sự việc vừa xảy ra.
 * Hàm thuần, không đọc ghi gì — nhờ đó kiểm thử được và giải thích được.
 *
 * @param {object} ev
 * @param {'chuan-bi'|'van-dung'} ev.kind
 * @param {number} ev.attemptNo          lượt làm thứ mấy
 * @param {number} ev.videoCompletion    0–1
 * @param {boolean} ev.tuNguyenLamLai    có phải học sinh tự làm lại sau phản hồi không
 * @param {boolean} ev.hoanThanhBoTro    vừa hoàn thành nội dung bổ trợ được giao
 * @param {number} ev.streakDays         số ngày học liên tục tính cả hôm nay
 * @returns {{xp:number, chiTiet:{ly_do:string, diem:number}[]}}
 */
export function tinhXp(ev) {
  const chiTiet = [];
  const add = (ly_do, diem) => { if (diem > 0) chiTiet.push({ ly_do, diem }); };

  if (ev.kind === 'chuan-bi' && ev.attemptNo === 1) {
    add('Hoàn thành phần chuẩn bị trước giờ học', XP_RULES.hoan_thanh_chuan_bi);
  }
  if (ev.kind === 'van-dung' && ev.attemptNo === 1) {
    add('Làm bài vận dụng sau giờ học', XP_RULES.lam_bai_van_dung);
  }
  if (ev.videoCompletion >= 0.9 && ev.attemptNo === 1) {
    add('Xem hết video bài học', XP_RULES.xem_het_video);
  }
  if (ev.tuNguyenLamLai) {
    add('Chủ động làm lại sau khi nhận phản hồi', XP_RULES.lam_lai_sau_phan_hoi);
  }
  if (ev.hoanThanhBoTro) {
    add('Hoàn thành nội dung bổ trợ được giao', XP_RULES.hoan_thanh_bo_tro);
  }
  const streak = Math.max(0, Math.min(7, Math.floor(ev.streakDays || 0)));
  if (streak >= 2) add(`Chuỗi ${streak} ngày học liên tục`, streak * XP_RULES.ngay_hoc_lien_tuc);

  return { xp: chiTiet.reduce((s, c) => s + c.diem, 0), chiTiet };
}

/**
 * Xét các huy hiệu học sinh vừa đạt được.
 * @param {object} st
 * @param {number} st.soBaiDaChuanBi
 * @param {number} st.soLanTuLamLai
 * @param {number} st.streakDays
 * @param {number} st.masteryCaoNhat
 * @param {boolean} st.duocDeXuatNhomTruong
 * @param {number|null} st.diemVanDungCaoNhat
 * @param {boolean} st.daSuaDuocLoiCu
 * @param {string[]} daCo  các mã huy hiệu đã có
 * @returns {string[]} mã huy hiệu MỚI đạt được
 */
export function xetHuyHieu(st, daCo = []) {
  const co = new Set(daCo);
  const moi = [];
  const dat = (code, dieuKien) => { if (dieuKien && !co.has(code)) moi.push(code); };

  dat('CHUAN_BI_5', (st.soBaiDaChuanBi ?? 0) >= 5);
  dat('KIEN_TRI_3', (st.soLanTuLamLai ?? 0) >= 3);
  dat('CHUOI_7', (st.streakDays ?? 0) >= 7);
  dat('LAM_CHU_3', (st.masteryCaoNhat ?? 0) >= 3);
  dat('HO_TRO_NHOM', !!st.duocDeXuatNhomTruong);
  dat('VAN_DUNG', (st.diemVanDungCaoNhat ?? 0) >= 6.5);
  dat('SUA_LOI', !!st.daSuaDuocLoiCu);
  return moi;
}

/**
 * Cập nhật chuỗi ngày học liên tục.
 * @param {string|null} ngayHocGanNhat  'YYYY-MM-DD'
 * @param {number} streakHienTai
 * @param {string} homNay 'YYYY-MM-DD'
 */
export function capNhatChuoi(ngayHocGanNhat, streakHienTai, homNay) {
  if (!ngayHocGanNhat) return 1;
  if (ngayHocGanNhat === homNay) return Math.max(1, streakHienTai);
  const hom_qua = new Date(new Date(homNay + 'T00:00:00Z').getTime() - 86400000)
    .toISOString().slice(0, 10);
  return ngayHocGanNhat === hom_qua ? Math.max(1, streakHienTai) + 1 : 1;
}
