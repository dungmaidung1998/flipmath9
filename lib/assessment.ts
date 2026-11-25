/**
 * FILE NÀY LÀM GÌ: Mô-đun TypeScript/JavaScript hỗ trợ xử lý dữ liệu và nghiệp vụ trong hệ thống FlipMath 9.
 * AI DÙNG: dùng chung
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: không gọi mô-đun nội bộ khác
 */
/**
 * RA ĐỀ BÀI ĐÁNH GIÁ ĐẦU VÀO VÀ CUỐI CHƯƠNG
 * ---------------------------------------------------------------------------
 * Khác với bài kiểm tra ngắn của từng mục, bài đánh giá phải PHỦ CẢ CHƯƠNG:
 * mỗi đơn vị kiến thức đều phải có câu, nếu không thì kết quả chỉ nói được về
 * vài mục may mắn lọt vào đề.
 *
 * Hai loại:
 *   'dau-vao' — đo trước khi học chương, chỉ lấy câu mức 1–2 (nhận biết, thông
 *               hiểu). Hỏi câu vận dụng về thứ chưa dạy là đo sự may rủi.
 *   'chuong'  — đo sau khi học xong, lấy cả bốn mức và BẮT BUỘC có câu vận dụng,
 *               vì mức làm chủ 2 và 3 chỉ kết luận được từ câu mức 3–4.
 */

export type AssessmentQuestion = {
  question_id: string;
  ku_id: string;
  stem: string;
  level: number;
  expected_time_sec: number;
  correct_option: string;
  hinh?: unknown;
  options: { option_key: string; option_text: string }[];
};

/**
 * Chọn đề, và NÓI RA những mục không đủ đề thay vì lặng lẽ bỏ qua.
 *
 * `missing` là phần quan trọng nhất của hàm này. Một mục thiếu đề mà vẫn ra đề
 * bình thường sẽ cho ra một kết quả trông hoàn chỉnh nhưng không hề đo mục đó —
 * và không ai nhận ra, vì bài vẫn có điểm. Trả về danh sách mục thiếu để trang
 * đánh giá từ chối phát đề và báo đúng tên mục cần soạn thêm câu hỏi.
 *
 * @param units danh sách mã đơn vị kiến thức của chương
 * @param bank  ngân hàng câu hỏi, NÊN được xáo trộn ở phía máy chủ trước khi gọi
 */
export function selectAssessment(
  units: string[], bank: AssessmentQuestion[], kind: 'dau-vao' | 'chuong'
) {
  const questions: AssessmentQuestion[] = [];
  const missing: string[] = [];

  for (const unit of units) {
    // Chỉ nhận câu ĐỦ ĐIỀU KIỆN DÙNG ĐƯỢC: đúng 4 phương án, 4 mã phương án
    // khác nhau, và đáp án đúng phải nằm trong số đó. Một câu soạn dở lọt vào
    // đề đánh giá là một câu không em nào trả lời đúng được.
    const pool = bank.filter((q) =>
      q.ku_id === unit &&
      q.options.length === 4 &&
      new Set(q.options.map((o) => o.option_key)).size === 4 &&
      q.options.some((o) => o.option_key === q.correct_option) &&
      (kind === 'chuong' || q.level <= 2)
    );

    // Lấy mỗi mức một câu trước, để đề trải đều chứ không dồn vào một mức.
    const selected: AssessmentQuestion[] = [];
    for (const level of kind === 'chuong' ? [1, 2, 3, 4] : [1, 2]) {
      const q = pool.find((q) => q.level === level);
      if (q) selected.push(q);
    }
    // Rồi bù cho đủ số câu tối thiểu của mục.
    for (const q of pool) {
      if (selected.length >= (kind === 'chuong' ? 4 : 3)) break;
      if (!selected.some((x) => x.question_id === q.question_id)) selected.push(q);
    }

    // Dưới 3 câu thì không đủ để kết luận gì về mục này (cùng ngưỡng với
    // refresh_mastery_v2). Bài cuối chương còn phải có ít nhất một câu mức 3–4.
    if (selected.length < 3 || (kind === 'chuong' && !selected.some((q) => q.level >= 3))) {
      missing.push(unit);
    } else {
      questions.push(...selected);
    }
  }

  return { questions, missing };
}
