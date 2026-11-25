/**
 * ============================================================================
 * THUẬT TOÁN CHỌN ĐỀ BÀI THÍCH ỨNG (ADAPTIVE LEARNING)
 * ============================================================================
 * Tệp mã nguồn: code/web/lib/adaptive.ts
 * Vai trò: Giúp website tự động "đo ni đóng giày" bài tập cho từng học sinh:
 *   - Bạn học lực cơ bản sẽ được củng cố kiến thức nền tảng, không bị "ngợp".
 *   - Bạn học lực khá giỏi sẽ được thử thách bài nâng cao, không bị "nhàm chán".
 *   - Bạn hay sai ở dạng toán nào sẽ được website ưu tiên cho luyện lại dạng đó.
 */

/**
 * [SỐ HIỆU TT-07: CHỌN ĐỀ THÍCH ỨNG THEO VÙNG PHÁT TRIỂN GẦN NHẤT (ZPD)]
 * ---------------------------------------------------------------------------
 * Ý tưởng sư phạm: Dựa trên thuyết "Vùng phát triển gần nhất" của nhà tâm lý học Vygotsky.
 * Một học sinh muốn tiến bộ thì bài tập giao cho em phải gồm 2 mức:
 *   1. Mức em ĐANG ĐỨNG (để tạo cảm giác an tâm, tự tin làm đúng).
 *   2. Mức NGAY TRÊN ĐÓ 1 BẬC (để thử thách và giúp em nâng cao trình độ).
 * 
 * Bốn mức năng lực học sinh (mastery 0 -> 3):
 *   - null / 0: Hạt Mầm (Chưa vững)       -> Giao mức [1, 2] (Nhận biết & Thông hiểu)
 *   - 1:        Chồi Xanh (Đang củng cố)   -> Giao mức [2, 3] (Thông hiểu & Vận dụng)
 *   - 2:        Đại Thụ (Đạt chuẩn)       -> Giao mức [3, 4] (Vận dụng & Vận dụng cao)
 *   - 3:        Đỉnh Sao (Thành thạo)     -> Giao mức [4, 3] (Vận dụng cao & Vận dụng)
 * 
 * @param mastery: Mức độ làm chủ hiện tại của học sinh (từ 0 đến 3, hoặc null nếu là người mới)
 * @returns Mảng gồm 2 cấp độ câu hỏi ưu tiên theo thứ tự giảm dần
 */
export function targetLevels(mastery: number | null): number[] {
  // Dòng 1: Nếu chưa có dữ liệu (null) hoặc đang ở mức 0 (Hạt Mầm), giao câu mức 1 (Nhận biết) và mức 2 (Thông hiểu)
  if (mastery == null || mastery === 0) return [1, 2];

  // Dòng 2: Nếu học sinh đã đạt mức 1 (Chồi Xanh), giao câu mức 2 (Thông hiểu) và mức 3 (Vận dụng)
  if (mastery === 1) return [2, 3];

  // Dòng 3: Nếu đạt mức 2 (Đại Thụ), giao [3, 4]. Nếu đã đạt mức tối đa 3 (Đỉnh Sao), ưu tiên mức 4 rồi đến mức 3
  return mastery === 2 ? [3, 4] : [4, 3];
}

/**
 * [SỐ HIỆU TT-08: CHẤM ĐIỂM ƯU TIÊN THEO LỊCH SỬ LỖI SAI (ERROR TARGETING)]
 * ---------------------------------------------------------------------------
 * Ý tưởng sư phạm: Không để học sinh "sai rồi bỏ quên". Website sẽ ghi nhớ các câu
 * và các dạng lỗi em từng mắc để cộng điểm ưu tiên cho những câu hỏi đó:
 *   - Câu hỏi cụ thể mà em vừa làm sai trước đây: Cộng +3 điểm ưu tiên.
 *   - Câu hỏi mới nhưng có "bẫy" sai giống mã lỗi em từng mắc: Cộng +1 điểm cho mỗi lần em mắc lỗi đó (tối đa +3 điểm).
 * Nhờ điểm ưu tiên này, các câu hỏi trúng "chỗ ngứa" sẽ nổi lên đầu danh sách để giao cho em.
 * 
 * @param saiCu: Lịch sử các câu hỏi em từng làm trước đây (kèm mã lỗi và kết quả đúng/sai)
 * @param nhieu: Danh sách các câu hỏi trong ngân hàng cùng các mã lỗi tiềm ẩn ở phương án nhiễu
 * @returns Một bảng tra cứu (Map) lưu: Mã câu hỏi -> Điểm ưu tiên (càng cao càng ưu tiên giao)
 */
export function diemLoiCu(
  saiCu: { question_id: string; error_code: string | null; is_correct: boolean }[],
  nhieu: { question_id: string; error_code: string | null }[]
): Map<string, number> {
  // Dòng 1: Tạo bảng đếm số lần học sinh mắc từng mã lỗi cụ thể (ví dụ: lỗi E-CBH-04 mắc 2 lần)
  const demLoi = new Map<string, number>();

  // Dòng 2: Tạo bảng ghi nhận kết quả cuối cùng của từng câu hỏi học sinh đã làm
  const ketQua = new Map<string, boolean>();

  // Dòng 3: Duyệt qua từng câu trong lịch sử làm bài của học sinh
  for (const a of saiCu) {
    // Dòng 4: Cập nhật câu này đã làm đúng lần nào chưa (nếu từng đúng ít nhất 1 lần thì ghi nhận là true)
    ketQua.set(a.question_id, a.is_correct || ketQua.get(a.question_id) === true);

    // Dòng 5: Nếu câu trả lời bị sai và có gắn mã lỗi, tăng số lần mắc mã lỗi đó thêm 1
    if (!a.is_correct && a.error_code) demLoi.set(a.error_code, (demLoi.get(a.error_code) ?? 0) + 1);
  }

  // Dòng 6: Tạo bảng điểm ưu tiên cho từng câu hỏi
  const diem = new Map<string, number>();

  // Dòng 7: Nếu câu nào em từng làm sai mà chưa bao giờ làm đúng lại, cộng ngay +3 điểm ưu tiên
  for (const [q, dung] of ketQua) if (!dung) diem.set(q, 3);

  // Dòng 8: Xét các câu hỏi trong ngân hàng có phương án bẫy chứa mã lỗi em từng mắc
  for (const n of nhieu) {
    // Dòng 9: Lấy số lần em từng mắc lỗi này trong quá khứ (nếu chưa mắc lần nào thì bằng 0)
    const c = n.error_code ? demLoi.get(n.error_code) ?? 0 : 0;

    // Dòng 10: Nếu em từng mắc lỗi đó, cộng dồn điểm ưu tiên tương ứng (mỗi lần mắc +1 điểm, trần tối đa +3 điểm)
    if (c) diem.set(n.question_id, (diem.get(n.question_id) ?? 0) + Math.min(3, c));
  }

  // Dòng 11: Trả về bảng điểm ưu tiên hoàn chỉnh để đưa vào thuật toán chọn đề
  return diem;
}

/**
 * [SỐ HIỆU TT-09: CHỌN ĐỀ VÒNG TRÒN LUÂN PHIÊN (ROUND-ROBIN ADAPTIVE SELECTION)]
 * ---------------------------------------------------------------------------
 * Ý tưởng sư phạm: Chọn tối đa 5 câu hỏi từ ngân hàng để tạo thành một đề luyện tập hoàn hảo:
 *   1. Lọc ra các câu hỏi thuộc 2 mức năng lực phù hợp (TT-07).
 *   2. Câu nào có điểm ưu tiên lỗi cũ cao nhất (TT-08) sẽ được xếp lên trước.
 *   3. Lấy xen kẽ hình vòng tròn (Round-Robin): Lấy 1 câu mức A, rồi 1 câu mức B, rồi lặp lại...
 *      -> Tránh trường hợp đề thi bị lệch (ví dụ toàn câu dễ mức 1 mà không có câu mức 2 để em tiến bộ).
 * 
 * @param bank: Toàn bộ ngân hàng câu hỏi của bài học
 * @param mastery: Mức độ năng lực hiện tại của học sinh
 * @param uuTien: Bảng điểm ưu tiên lỗi cũ đã tính ở TT-08
 * @returns Danh sách tối đa 5 câu hỏi đã được chọn lọc và cân bằng
 */
export function selectAdaptive<T extends { question_id: string; level: number }>(
  bank: T[], mastery: number | null, uuTien: Map<string, number> = new Map()
): T[] {
  // Dòng 1: Xác định 2 mức độ câu hỏi mục tiêu dành riêng cho học sinh này (theo TT-07)
  const levels = targetLevels(mastery);

  // Dòng 2: Lọc các câu thuộc 2 mức đó, rồi sắp xếp theo:
  //         - Điểm ưu tiên lỗi cũ cao hơn thì đứng trước (giúp chữa đúng lỗi em đang yếu)
  //         - Nếu điểm bằng nhau, sắp theo mã câu hỏi để đảm bảo tính ổn định (cùng học sinh, cùng bài thì ra đề như nhau)
  const sorted = bank.filter((q) => levels.includes(q.level))
                     .sort((a, b) => (uuTien.get(b.question_id) ?? 0) - (uuTien.get(a.question_id) ?? 0)
                       || a.question_id.localeCompare(b.question_id));

  // Dòng 3: Khởi tạo mảng chứa các câu hỏi sẽ được chọn ra cho đề bài
  const chosen: T[] = [];

  // Dòng 4: Chia các câu đã sắp xếp vào 2 "hồ chứa" (pool) riêng biệt theo từng cấp độ
  const pools = levels.map((level) => sorted.filter((q) => q.level === level));

  // Dòng 5: Vòng lặp lấy vòng tròn (Round-Robin): Duyệt theo thứ tự vị trí i (i = 0, 1, 2...)
  //         Điều kiện dừng: Đã chọn đủ 5 câu HOẶC cả 2 hồ đều không còn câu nào
  for (let i = 0; chosen.length < 5 && pools.some((p) => p.length > i); i++) {
    // Dòng 6: Lần lượt ghé qua từng hồ mức độ câu hỏi
    for (const pool of pools) {
      // Dòng 7: Nếu hồ đó còn câu ở vị trí i và tổng số câu chọn chưa đủ 5, lấy câu đó bỏ vào đề
      if (pool[i] && chosen.length < 5) chosen.push(pool[i]);
    }
  }

  // Dòng 8: Trả về danh sách bộ đề 5 câu thích ứng hoàn chỉnh cho học sinh làm bài
  return chosen;
}
