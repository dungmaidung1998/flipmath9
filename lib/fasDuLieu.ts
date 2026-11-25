/**
 * FILE NÀY LÀM GÌ: Mô-đun TypeScript/JavaScript hỗ trợ xử lý dữ liệu và nghiệp vụ trong hệ thống FlipMath 9.
 * AI DÙNG: dùng chung
 * LẤY DỮ LIỆU TỪ: learning_events, quiz_attempts, quiz_answers, soat_loi_luot, students, lich_bai, knowledge_units
 * GỌI TỚI: ./mucHoatDong
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import { docHet, tinhFas, type SuKien, type LuotLam, type TraLoi, type Fas } from './mucHoatDong';

/**
 * Tải dữ liệu thật của một nhóm học sinh trong một tuần rồi tính FAS.
 * Lượt làm bài lấy thêm 2 ngày sau tuần để xét "làm lại trong 48 giờ".
 */
export async function taiFas(db: SupabaseClient, ids: string[], tu: Date, den: Date): Promise<Map<string, Fas>> {
  if (!ids.length) return new Map();
  // Xử lý mốc ngày giờ theo múi giờ Việt Nam (UTC+7)
  const denK = new Date(den.getTime() + 2 * 86400_000).toISOString();
  // Lượt làm từ 14 ngày trước tuần: em có thể chuẩn bị sớm cho bài có hạn trong tuần.
  const tuP = new Date(tu.getTime() - 14 * 86400_000).toISOString();
  const [suKien, luot] = await Promise.all([
    docHet<SuKien>((a, b) => db.from('learning_events').select('student_id, event_type, ts, ku_id, payload')
      .in('student_id', ids).gte('ts', tu.toISOString()).lt('ts', den.toISOString()).order('event_id').range(a, b)),
    docHet<LuotLam>((a, b) => db.from('quiz_attempts').select('attempt_id, student_id, ku_id, kind, score, submitted_at')
      .in('student_id', ids).gte('submitted_at', tuP).lt('submitted_at', denK).order('attempt_id').range(a, b))
  ]);
  const luotIds = luot.map((l) => l.attempt_id);
  const traLoi: TraLoi[] = [];
  for (let i = 0; i < luotIds.length; i += 300) {
    const phan = luotIds.slice(i, i + 300);
    // Truy vấn Supabase: đọc dữ liệu từ bảng quiz_answers
    traLoi.push(...await docHet<TraLoi>((a, b) => db.from('quiz_answers').select('attempt_id, is_correct').in('attempt_id', phan).range(a, b)));
  }
  // E – Sửa lỗi: tỉ lệ khắc phục ở các lượt Soát lỗi cũ đã nộp trong tuần. Chưa có bảng (chưa chạy tệp 42) thì để trống.
  const soat = new Map<string, { khacPhuc: number; tong: number }>();
  try {
    // Truy vấn Supabase: đọc dữ liệu từ bảng soat_loi_luot
    const ds = await docHet<{ student_id: string; ket_qua: any }>((a, b) => db.from('soat_loi_luot').select('student_id, ket_qua')
      .in('student_id', ids).gte('nop_luc', tu.toISOString()).lt('nop_luc', den.toISOString()).order('luot_id').range(a, b));
    for (const l of ds) {
      const ma = (l.ket_qua?.ma ?? []) as { danhGia: string }[];
      if (!ma.length) continue;
      const x = soat.get(l.student_id) ?? { khacPhuc: 0, tong: 0 };
      x.tong += ma.length; x.khacPhuc += ma.filter((m) => m.danhGia === 'da-khac-phuc').length;
      soat.set(l.student_id, x);
    }
  } catch { /* chưa có bảng soát lỗi */ }
  // P theo lịch giao bài (tệp 43): bài có hạn chuẩn bị trong tuần của lớp từng em. Chưa có bảng thì để trống.
  const giao = new Map<string, { muc: string[]; han: string }[]>();
  try {
    // Truy vấn Supabase: đọc dữ liệu từ bảng students
    const { data: hs } = await db.from('students').select('student_id, class_id').in('student_id', ids);
    const lops = Array.from(new Set((hs ?? []).map((h) => h.class_id).filter(Boolean)));
    if (lops.length) {
      // Truy vấn Supabase: đọc dữ liệu từ bảng lich_bai
      const { data: lich, error } = await db.from('lich_bai').select('class_id, lesson_id, han_chuan_bi').in('class_id', lops)
        .gte('han_chuan_bi', tu.toISOString()).lt('han_chuan_bi', den.toISOString());
      if (error) throw error;
      if (lich?.length) {
        // Truy vấn Supabase: đọc dữ liệu từ bảng knowledge_units
        const { data: units } = await db.from('knowledge_units').select('ku_id, lesson_id').in('lesson_id', Array.from(new Set(lich.map((l) => l.lesson_id))));
        const mucCua = new Map<string, string[]>();
        for (const u of units ?? []) (mucCua.get(u.lesson_id) ?? mucCua.set(u.lesson_id, []).get(u.lesson_id)!).push(u.ku_id);
        for (const h of hs ?? []) giao.set(h.student_id, lich.filter((l) => l.class_id === h.class_id).map((l) => ({ muc: mucCua.get(l.lesson_id) ?? [], han: new Date(l.han_chuan_bi).toISOString() })));
      }
    }
  } catch { /* chưa có lịch giao bài */ }
  return tinhFas(ids, suKien, luot, traLoi, tu, den, soat, giao);
}
