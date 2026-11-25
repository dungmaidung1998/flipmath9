/**
 * FILE NÀY LÀM GÌ: Mô-đun TypeScript/JavaScript hỗ trợ xử lý dữ liệu và nghiệp vụ trong hệ thống FlipMath 9.
 * AI DÙNG: dùng chung
 * LẤY DỮ LIỆU TỪ: student_errors, error_dictionary
 * GỌI TỚI: @/lib/supabase/server
 */
import 'server-only';
import { supabaseServer, supabaseAdmin } from '@/lib/supabase/server';

/** Đọc mã đang cần sửa của chính học sinh, ưu tiên mục đã phát sinh lỗi. */
export async function docSauTheoMuc(db: ReturnType<typeof supabaseServer>, sid: string) {
  const theoMuc = new Map<string, number>();
  if (!sid) return theoMuc;

  // Truy vấn Supabase: đọc dữ liệu từ bảng student_errors
  const { data } = await db.from('student_errors').select('error_code, ku_goc')
    .eq('student_id', sid).eq('trang_thai', 'can-sua');
  const canTra = [...new Set((data ?? []).filter(x => !x.ku_goc).map(x => x.error_code))];
  const tuDien = new Map<string, string>();
  if (canTra.length) try {
    // Truy vấn Supabase: đọc dữ liệu từ bảng error_dictionary
    const { data: rows } = await supabaseAdmin().from('error_dictionary')
      .select('error_code, ku_id').in('error_code', canTra);
    for (const row of rows ?? []) if (row.ku_id) tuDien.set(row.error_code, row.ku_id);
  } catch { /* Bản ghi có mục gốc vẫn hiển thị được. */ }

  for (const loi of data ?? []) {
    const id = loi.ku_goc ?? tuDien.get(loi.error_code);
    if (id) theoMuc.set(id, (theoMuc.get(id) ?? 0) + 1);
  }
  return theoMuc;
}

