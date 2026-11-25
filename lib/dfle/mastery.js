/**
 * ============================================================================
 * THUẬT TOÁN XẾP 4 CẤP ĐỘ NĂNG LỰC & BỘ LỌC CHỐNG BẤM BỪA (MASTERY V2)
 * ============================================================================
 * Tệp mã nguồn: code/web/lib/dfle/mastery.js
 * Vai trò: Giúp website xếp hạng năng lực học sinh theo 4 cấp độ "Hành trình lên lớp 10":
 *   - Mức 0: Hạt Mầm (Chưa vững) - Cần luyện thêm
 *   - Mức 1: Chồi Xanh (Đang củng cố) - Đã hiểu bài và làm được bài cơ bản
 *   - Mức 2: Đại Thụ (Đạt chuẩn) - Đã giải được bài vận dụng vào tình huống quen thuộc
 *   - Mức 3: Đỉnh Sao (Thành thạo) - Giải được câu vận dụng cao, dạng đề thi tuyển sinh vào 10
 * 
 * NGUYÊN TẮC CÔNG BẰNG:
 *   1. Không tính theo điểm tổng, mà soi vào TỪNG CÂU HỎI CỤ THỂ.
 *   2. Làm nhiều câu dễ KHÔNG THỂ lên được cấp cao (phải làm đúng câu vận dụng).
 *   3. Chỉ tính 12 CÂU KHÁC NHAU GẦN NHẤT (câu làm lại chỉ thay thế câu cũ, không cộng dồn).
 *   4. Phát hiện và loại bỏ các lượt "bấm bừa, đoán mò" để bảo vệ quyền lợi học sinh.
 */


/**
 * [SỐ HIỆU TT-12: BỘ NGƯỠNG XẾP 4 CẤP ĐỘ NĂNG LỰC TỪ 12 CÂU GẦN NHẤT]
 * ---------------------------------------------------------------------------
 * Bảng thông số kỹ thuật chuẩn:
 *   - soCauToiThieu: 3 (Làm dưới 3 câu thì trả về "Chưa đủ dữ liệu", không vội kết luận)
 *   - soCauXetToiDa: 12 (Chỉ soi vào 12 câu khác nhau gần đây nhất)
 *   - Mức 1 (Chồi Xanh): Tỉ lệ đúng chung >= 50%
 *   - Mức 2 (Đại Thụ): Tỉ lệ đúng chung >= 65% VÀ phải có ít nhất 2 câu Vận dụng (mức 3-4) với tỉ lệ đúng >= 65%
 *   - Mức 3 (Đỉnh Sao): Tỉ lệ đúng chung >= 80% VÀ phải có ít nhất 2 câu Tình huống mới (mức 4) với tỉ lệ đúng >= 65%
 */
export const MASTERY_V2 = Object.freeze({
  soCauToiThieu: 3,          // Làm dưới 3 câu chưa thể đánh giá (tránh kết luận vội vàng)
  soCauXetToiDa: 12,         // Xét đúng 12 câu khác nhau gần nhất
  mucc1_tiLeDung: 0.5,       // Đúng >= 50% để lên Chồi Xanh (Mức 1)
  muc2_tiLeDung: 0.65,       // Đúng >= 65% toàn bài để lên Đại Thụ (Mức 2)
  muc2_soCauVanDung: 2,      // Bắt buộc phải thử sức ít nhất 2 câu mức Vận dụng
  muc2_tiLeVanDung: 0.65,    // Tỉ lệ đúng phần Vận dụng phải đạt >= 65%
  muc3_tiLeDung: 0.8,        // Đúng >= 80% toàn bài để lên Đỉnh Sao (Mức 3)
  muc3_soCauTinhHuongMoi: 2, // Bắt buộc phải thử sức ít nhất 2 câu Tình huống mới (mức 4)
  muc3_tiLeTinhHuongMoi: 0.65,// Tỉ lệ đúng phần Tình huống mới phải đạt >= 65%
  diemNghiBamBua: 5,         // Ngưỡng điểm dưới 5 thì nghi vấn
  tiLeThoiGianNghiBamBua: 0.3// Làm dưới 30% thời gian dự kiến thì nghi vấn bấm bừa
});

/**
 * [SỐ HIỆU TT-13: BỘ LỌC ĐÁNG TIN CẬY - CHỐNG BẤM BỪA / ĐOÁN MÒ]
 * ---------------------------------------------------------------------------
 * Ý tưởng sư phạm: Làm thế nào để biết học sinh có bấm bừa hay không?
 *   - Không thể chỉ nhìn điểm thấp: Học sinh yếu làm bài nghiêm túc vẫn có thể bị điểm thấp!
 *   - Không thể chỉ nhìn làm nhanh: Học sinh xuất sắc làm bài quá siêu nên xong rất nhanh!
 *   -> ĐIỀU KIỆN KÉP: Vừa bị ĐIỂM DƯỚI 5 VÀ làm NHANH DƯỚI 30% thời gian quy định.
 *      Đây là bằng chứng rõ ràng của việc "khoanh bừa cho xong".
 *   -> Xử lý nhân văn: Lượt làm này bị LOẠI BỎ khỏi hệ thống, không tính là điểm kém để không làm oan học sinh.
 * 
 * @param q: Câu hỏi học sinh đã làm kèm điểm số và thời gian
 * @returns true nếu dữ liệu đáng tin cậy; false nếu nghi ngờ bấm bừa
 */
export function dangTin(q) {
  // Dòng 1: Lấy điểm của cả lượt làm bài (thang 10)
  const diem = q.diemLuot;

  // Dòng 2: Lấy số giây học sinh thực tế ngồi làm bài
  const giay = q.giayLamBai;

  // Dòng 3: Lấy thời gian chuẩn giáo viên dự kiến cho bài này
  const duKien = q.giayDuKien;

  // Dòng 4: Nếu không có dữ liệu đo điểm hoặc thời gian, mặc định coi là đáng tin cậy (nguyên tắc suy đoán vô tội)
  if (diem === null || diem === undefined) return true;
  if (giay === null || giay === undefined) return true;
  if (duKien === null || duKien === undefined || duKien <= 0) return true;

  // Dòng 5: Trả về true nếu KHÔNG vi phạm đồng thời cả 2 điều kiện (điểm < 5 VÀ thời gian < 30% dự kiến)
  return !(diem < MASTERY_V2.diemNghiBamBua &&
           giay < MASTERY_V2.tiLeThoiGianNghiBamBua * duKien);
}

/**
 * [SỐ HIỆU TT-12: HÀM TÍNH TOÁN CẤP ĐỘ NĂNG LỰC TỪ 12 CÂU GẦN NHẤT]
 * ---------------------------------------------------------------------------
 * Quy trình xử lý gồm 4 bước:
 *   Bước 1: Lọc bỏ các câu bấm bừa qua bộ lọc TT-13.
 *   Bước 2: Mỗi câu chỉ giữ lại kết quả của LẦN LÀM MỚI NHẤT (chống cày điểm số lượng).
 *   Bước 3: Lấy đúng 12 câu khác nhau gần đây nhất.
 *   Bước 4: So khớp với các tiêu chí để phong cấp (Hạt Mầm, Chồi Xanh, Đại Thụ, Đỉnh Sao).
 */
export function computeMasteryV2(quanSats) {
  // Bước 1: [TT-13] Lọc bỏ các câu làm bài không đáng tin cậy
  const tin = (quanSats ?? []).filter(dangTin);

  // Bước 2: Với mỗi câu hỏi, chỉ giữ lại lượt nộp bài MỚI NHẤT theo mốc thời gian ts
  const moiCau = new Map();
  for (const q of tin) {
    const cu = moiCau.get(q.questionId);
    if (!cu || q.ts > cu.ts) moiCau.set(q.questionId, q);
  }

  // Bước 3: Lấy tối đa 12 câu khác nhau gần nhất (sắp xếp thời gian giảm dần, câu mới làm đứng trước)
  const ganNhat = [...moiCau.values()]
    .sort((a, b) => b.ts - a.ts || a.questionId.localeCompare(b.questionId))
    .slice(0, MASTERY_V2.soCauXetToiDa);

  // Tổng số câu thu thập được trong hồ sơ
  const n = ganNhat.length;

  // Tách riêng các câu ở mức Vận dụng (mức độ 3 hoặc 4)
  const vanDung = ganNhat.filter((q) => q.level >= 3);

  // Tách riêng các câu ở mức Tình huống mới / Đề thi vào 10 (mức độ 4)
  const tinhHuongMoi = ganNhat.filter((q) => q.level === 4);

  // Hàm tính tỉ lệ làm đúng của một nhóm câu hỏi
  const tiLe = (ds) => (ds.length ? ds.filter((q) => q.isCorrect).length / ds.length : null);

  // Nếu học sinh làm DƯỚI 3 CÂU: Chưa đủ bằng chứng, trả về level = null (Chưa đủ dữ liệu)
  if (n < MASTERY_V2.soCauToiThieu) {
    return {
      level: null, 
      status: 'insufficient', 
      index: null,
      questionCount: n, 
      appliedCount: vanDung.length, 
      transferCount: tinhHuongMoi.length,
      observations: ganNhat
    };
  }

  // Tính các tỉ lệ đúng thực tế của học sinh
  const r = /** @type {number} */ (tiLe(ganNhat));          // Tỉ lệ đúng chung trên toàn bộ các câu
  const rVanDung = tiLe(vanDung);                           // Tỉ lệ đúng riêng ở phần Vận dụng
  const rTinhHuongMoi = tiLe(tinhHuongMoi);                 // Tỉ lệ đúng riêng ở phần Tình huống mới

  // Bước 4: Xét điều kiện phong cấp từ thấp lên cao:
  let level = 0; // Khởi điểm: Mức 0 - Hạt Mầm

  // Điều kiện lên Mức 1 (Chồi Xanh): Đúng từ 50% số câu trở lên
  if (r >= MASTERY_V2.mucc1_tiLeDung) level = 1;

  // Điều kiện lên Mức 2 (Đại Thụ): Đúng từ 65% chung VÀ đúng ít nhất 2 câu Vận dụng (tỉ lệ >= 65%)
  if (r >= MASTERY_V2.muc2_tiLeDung &&
      vanDung.length >= MASTERY_V2.muc2_soCauVanDung &&
      rVanDung !== null && rVanDung >= MASTERY_V2.muc2_tiLeVanDung) level = 2;

  // Điều kiện lên Mức 3 (Đỉnh Sao): Đúng từ 80% chung VÀ đúng ít nhất 2 câu Tình huống mới (tỉ lệ >= 65%)
  if (r >= MASTERY_V2.muc3_tiLeDung &&
      tinhHuongMoi.length >= MASTERY_V2.muc3_soCauTinhHuongMoi &&
      rTinhHuongMoi !== null && rTinhHuongMoi >= MASTERY_V2.muc3_tiLeTinhHuongMoi) level = 3;

  // Trả về kết quả xếp cấp độ hoàn chỉnh
  return {
    level: /** @type {0|1|2|3} */ (level),
    status: 'measured',
    index: Math.round(r * 1000) / 1000,
    questionCount: n, 
    appliedCount: vanDung.length, 
    transferCount: tinhHuongMoi.length,
    observations: ganNhat
  };
}

/**
 * Bản v1 cũ (giữ lại để kiểm chứng tính tương thích lịch sử)
 * @deprecated Dùng computeMasteryV2
 */
export function computeMastery(ev) {
  if (ev.guessSuspected) return 0;
  const first = ev.firstQuizScore ?? 0;
  const best = ev.bestQuizScore ?? first;
  const quiz = 0.7 * first + 0.3 * best;
  if (ev.transferScore !== null && ev.transferScore >= 6.5 && quiz >= 8) return 3;
  if (ev.appliedScore !== null && ev.appliedScore >= 6.5 && quiz >= 6.5) return 2;
  if (quiz >= 5) return 1;
  return 0;
}

/** Hàm tính mức làm chủ thấp nhất trong các đơn vị kiến thức của bài học */
export function lessonMinMastery(masteryByKu, kuIds) {
  if (kuIds.length === 0) return 0;
  return kuIds.reduce((m, k) => Math.min(m, masteryByKu[k] ?? 0), 3);
}
