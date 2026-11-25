/**
 * FILE NÀY LÀM GÌ: Mô-đun TypeScript/JavaScript hỗ trợ xử lý dữ liệu và nghiệp vụ trong hệ thống FlipMath 9.
 * AI DÙNG: dùng chung
 * LẤY DỮ LIỆU TỪ: quiz_attempts, quiz_answers, distractor_errors
 * GỌI TỚI: ./adaptive
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import { diemLoiCu } from './adaptive';

/**
 * Điểm ưu tiên LỖI CŨ của một học sinh cho các câu trong ngân hàng của một mục (dùng ở máy chủ).
 * Trang vận dụng (phát đề) và API chấm bài (xác minh đề) PHẢI cùng gọi hàm này với cùng dữ liệu,
 * để bộ câu phát ra và bộ câu kiểm khi nộp trùng nhau.
 * Dùng khoá máy chủ vì bảng phương án nhiễu → mã lỗi chỉ giáo viên đọc được; kết quả chỉ dùng để xếp thứ tự câu.
 */
export async function uuTienLoiCu(admin: SupabaseClient, studentId: string, bankIds: string[]): Promise<Map<string, number>> {
  if (!studentId || !bankIds.length) return new Map();
  // 40 lượt làm gần nhất của em.
  const { data: luot, error: e1 } = await admin.from('quiz_attempts').select('attempt_id')
    .eq('student_id', studentId).order('submitted_at', { ascending: false }).order('attempt_id').limit(40);
  if (e1) throw new Error('Không đọc được lượt làm bài.');
  const luotIds = (luot ?? []).map((a) => a.attempt_id);
  if (!luotIds.length) return new Map();
  // Truy vấn Supabase: đọc dữ liệu từ bảng quiz_answers
  const { data: traLoi, error: e2 } = await admin.from('quiz_answers').select('question_id, error_code, is_correct').in('attempt_id', luotIds);
  if (e2) throw new Error('Không đọc được câu trả lời.');
  const maLoi = Array.from(new Set((traLoi ?? []).filter((a) => !a.is_correct && a.error_code).map((a) => a.error_code as string)));
  let nhieu: { question_id: string; error_code: string | null }[] = [];
  if (maLoi.length) {
    // Truy vấn Supabase: đọc dữ liệu từ bảng distractor_errors
    const { data, error: e3 } = await admin.from('distractor_errors').select('question_id, error_code')
      .in('error_code', maLoi).in('question_id', bankIds);
    if (e3) throw new Error('Không đọc được bảng lỗi.');
    nhieu = data ?? [];
  }
  // Chỉ giữ điểm cho câu thuộc ngân hàng mục này.
  const trong = new Set(bankIds);
  const diem = diemLoiCu((traLoi ?? []) as { question_id: string; error_code: string | null; is_correct: boolean }[], nhieu);
  for (const k of Array.from(diem.keys())) if (!trong.has(k)) diem.delete(k);
  return diem;
}
