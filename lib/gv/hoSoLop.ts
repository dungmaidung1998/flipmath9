/**
 * FILE NÀY LÀM GÌ: Mô-đun TypeScript/JavaScript hỗ trợ xử lý dữ liệu và nghiệp vụ trong hệ thống FlipMath 9.
 * AI DÙNG: giáo viên
 * LẤY DỮ LIỆU TỪ: students, knowledge_units, lich_bai, quiz_attempts, mastery_states, student_errors, learning_events
 * GỌI TỚI: @/lib/lichBai
 */
/**
 * Số liệu cho trang "Học sinh" của giáo viên: mỗi em 4 con số.
 *   - Chuẩn bị đúng hạn: số bài đã qua hạn (theo Lịch giao bài) em chuẩn bị kịp / số bài đã qua hạn.
 *   - Nắm bài chương đang học: trung bình mức làm chủ các mục của chương (0–3), đổi ra lời.
 *   - Lỗi cần sửa: số mã lỗi trong sổ lỗi đang ở trạng thái "Cần sửa".
 *   - Lần vào gần nhất: lần cuối có hoạt động trên web.
 * Mọi truy vấn đi qua client có RLS của giáo viên.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import { trangThaiBai, ngayVN, type Lich } from '@/lib/lichBai';

// Xử lý mốc ngày giờ theo múi giờ Việt Nam (UTC+7)
const NGAY = 86400_000;

/**
 * Hàm `tatCa`: nhận (query), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
async function tatCa(query: () => any): Promise<any[]> {
  const rows: any[] = [];
  for (let off = 0; ; off += 1000) {
    const { data, error } = await query().range(off, off + 999);
    if (error) throw new Error(error.message);
    rows.push(...(data ?? []));
    if (!data || data.length < 1000) return rows;
  }
}

export type MucNam = 'chac' | 'dang-len' | 'chua' | null;
export const TEN_MUC_NAM: Record<Exclude<MucNam, null>, string> = { chac: 'Nắm chắc', 'dang-len': 'Đang lên', chua: 'Chưa nắm' };
export const mucNam = (tb: number | null): MucNam => (tb == null ? null : tb >= 2 ? 'chac' : tb >= 1 ? 'dang-len' : 'chua');

export type DongHS = {
  id: string; ten: string;
  chuanBi: { kip: number; tong: number };
  namBai: { tb: number | null; muc: MucNam };
  loiCanSua: number;
  vaoCuoi: string | null;   // ISO
  soNgayVang: number | null;
};

/** Ngày "x ngày trước" dễ đọc. */
export function vaoDep(soNgay: number | null) {
  if (soNgay == null) return 'Chưa vào';
  if (soNgay === 0) return 'Hôm nay';
  if (soNgay === 1) return 'Hôm qua';
  return `${soNgay} ngày trước`;
}

/**
 * Hàm `napHoSoLop`: nhận (db, lop, chiHS), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
export async function napHoSoLop(db: SupabaseClient, lop: string, chiHS?: string) {
  const [hsRows, units, lich] = await Promise.all([
    // Truy vấn Supabase: đọc dữ liệu từ bảng students
    tatCa(() => { let q = db.from('students').select('student_id, display_name').eq('class_id', lop).order('student_id'); if (chiHS) q = q.eq('student_id', chiHS); return q; }),
    tatCa(() => db.from('knowledge_units').select('ku_id, lesson_id, order_index').order('order_index')),
    db.from('lich_bai').select('lesson_id, ngay_mo, han_chuan_bi, ngay_hoc').eq('class_id', lop).order('ngay_hoc')
      .then((r: any) => (r.data ?? []) as Lich[], () => [] as Lich[])
  ]);
  const ids = hsRows.map((h) => h.student_id as string);
  if (!ids.length) return { dong: [] as DongHS[], chuong: null as number | null, lich, units, attempts: [] as any[] };

  const tu = new Date(Date.now() - 30 * NGAY).toISOString();
  const [attempts, mastery, loi, events] = await Promise.all([
    tatCa(() => db.from('quiz_attempts').select('student_id, ku_id, kind, score, submitted_at').in('student_id', ids).order('submitted_at')),
    tatCa(() => db.from('mastery_states').select('student_id, ku_id, mastery_level').in('student_id', ids)),
    tatCa(() => db.from('student_errors').select('student_id, trang_thai').in('student_id', ids).eq('trang_thai', 'can-sua')).catch(() => []),
    tatCa(() => db.from('learning_events').select('student_id, ts').in('student_id', ids).gte('ts', tu).order('ts', { ascending: false }))
  ]);

  // Chương đang học: chương của bài tới trong lịch; chưa có lịch thì chương của bài làm gần nhất
  const homNay = ngayVN();
  const kuTheoBai = new Map<string, string[]>();
  for (const u of units) kuTheoBai.set(u.lesson_id ?? u.ku_id, [...(kuTheoBai.get(u.lesson_id ?? u.ku_id) ?? []), u.ku_id]);
  const tietToi = lich.find((l) => l.ngay_hoc >= homNay);
  const kuGanNhat = attempts.length ? attempts[attempts.length - 1].ku_id : null;
  const kuMoc = tietToi ? kuTheoBai.get(tietToi.lesson_id)?.[0] : kuGanNhat;
  // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
  const chuong = kuMoc ? Number(String(kuMoc).match(/^C(\d+)/)?.[1] ?? 0) || null : null;
  const kuChuong = new Set(units.filter((u) => chuong && String(u.ku_id).startsWith(`C${chuong}-`)).map((u) => u.ku_id));

  const daQuaHan = lich.filter((l) => Date.parse(l.han_chuan_bi) < Date.now());
  const vaoCuoi = new Map<string, string>();
  for (const e of events) if (!vaoCuoi.has(e.student_id)) vaoCuoi.set(e.student_id, e.ts);
  for (const a of attempts) if (!vaoCuoi.has(a.student_id) || a.submitted_at > vaoCuoi.get(a.student_id)!) vaoCuoi.set(a.student_id, a.submitted_at);

  const dong: DongHS[] = hsRows.map((h) => {
    const id = h.student_id as string;
    const nop = new Map<string, string>();
    for (const a of attempts) if (a.student_id === id && a.kind === 'chuan-bi' && !nop.has(a.ku_id)) nop.set(a.ku_id, a.submitted_at);
    const kip = daQuaHan.filter((l) => trangThaiBai(l, kuTheoBai.get(l.lesson_id) ?? [], nop) === 'da-chuan-bi').length;
    const ms = mastery.filter((m) => m.student_id === id && kuChuong.has(m.ku_id) && m.mastery_level != null).map((m) => Number(m.mastery_level));
    const tb = ms.length ? ms.reduce((s, x) => s + x, 0) / ms.length : null;
    const cuoi = vaoCuoi.get(id) ?? null;
    return {
      id, ten: (h.display_name ?? id) as string,
      chuanBi: { kip, tong: daQuaHan.length },
      namBai: { tb, muc: mucNam(tb) },
      loiCanSua: loi.filter((l) => l.student_id === id).length,
      vaoCuoi: cuoi,
      soNgayVang: cuoi ? Math.floor((Date.parse(homNay + 'T00:00:00+07:00') - Date.parse(ngayVN(cuoi) + 'T00:00:00+07:00')) / NGAY) : null
    };
  });
  return { dong, chuong, lich, units, attempts };
}

/** Những ô đáng để ý (tô màu): chuẩn bị dưới một nửa, chưa nắm bài, từ 15 lỗi cần sửa, 7 ngày không vào. */
export const batThuong = {
  chuanBi: (d: DongHS) => d.chuanBi.tong > 0 && d.chuanBi.kip / d.chuanBi.tong < 0.5,
  namBai: (d: DongHS) => d.namBai.muc === 'chua',
  loi: (d: DongHS) => d.loiCanSua >= 15,
  vang: (d: DongHS) => d.soNgayVang == null || d.soNgayVang >= 7
};
