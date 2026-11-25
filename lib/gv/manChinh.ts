/**
 * FILE NÀY LÀM GÌ: Mô-đun TypeScript/JavaScript hỗ trợ xử lý dữ liệu và nghiệp vụ trong hệ thống FlipMath 9.
 * AI DÙNG: giáo viên
 * LẤY DỮ LIỆU TỪ: knowledge_units, students, quiz_attempts, error_dictionary, distractor_errors, contents, video_coverage, mastery_states
 * GỌI TỚI: @/lib/latexSangChu, @/lib/gv/lopCuaToi, @/lib/dfle/man-chinh-gv.js, @/lib/dfle/de-thi-da-nang.js
 */
/**
 * Nạp dữ liệu và tính 3 màn chính của giáo viên (GV-15, GV-16, GV-17).
 *
 * Mọi truy vấn đi qua client có RLS của giáo viên — chỉ đọc được lớp mình dạy.
 * Phần tính toán nằm trong bộ máy (lib/dfle/man-chinh-gv.js), ở đây chỉ nạp và
 * đổi dữ liệu cơ sở dữ liệu sang dạng bộ máy nhận.
 *
 * Khi chưa có bước 🪤 Soát lỗi cũ (Bước 2 của lộ trình), "sau tiết" được đo bằng
 * mọi câu HS làm SAU tiết dạy bài trước mà có phương án sai gắn đúng mã lỗi đó —
 * cùng cách bước Soát lỗi cũ sẽ chấm, nên số liệu nối tiếp được.
 */
import { latexSangChu } from '@/lib/latexSangChu';
import type { SupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { COOKIE_LOP, lopCuaToi } from '@/lib/gv/lopCuaToi';
import * as mcGoc from '@/lib/dfle/man-chinh-gv.js';
import * as deGoc from '@/lib/dfle/de-thi-da-nang.js';
// Bộ máy viết bằng JS kèm JSDoc; đọc qua `any` để TypeScript không suy kiểu quá chặt từ chú thích.
const mc: any = mcGoc, de: any = deGoc;
const { tinhTienBo, tinhCanChuY, goiYTiet, canLaiThoiGian, kyNangNenTamTinh, doanXemLaiNhieu, hopNhatNguong, NGUONG_MAC_DINH } = mc;
const { yDeTheoChuong } = de;

export type PhamVi = 'bai' | 'tuan' | 'chuong';

export interface Bai {
  id: string; ten: string; tenNgan: string; chuong: number; viTri: number;
  thuTu: number; kuIds: string[];
}

const NGAY = 86400000;
// Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
const tenNgan = (lessonId: string) => (lessonId.match(/^Bài\s*\d+/)?.[0] ?? lessonId);

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

/**
 * Hàm `theoLo`: nhận (ids, lo, f), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
async function theoLo<T>(ids: T[], lo: number, f: (part: T[]) => Promise<any[]>) {
  const out: any[] = [];
  for (let i = 0; i < ids.length; i += lo) out.push(...(await f(ids.slice(i, i + lo))));
  return out;
}

/**
 * Hàm `dsBai`: nhận (units), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
export function dsBai(units: any[]): Bai[] {
  const map = new Map<string, Bai>();
  for (const u of [...units].sort((a, b) => a.order_index - b.order_index)) {
    const id = u.lesson_id ?? u.ku_id;
    // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
    const chuong = Number(String(u.ku_id).match(/^C(\d+)/)?.[1] ?? 0);
    if (!map.has(id)) map.set(id, { id, ten: id, tenNgan: tenNgan(id), chuong, viTri: 0, thuTu: u.order_index, kuIds: [] });
    map.get(id)!.kuIds.push(u.ku_id);
  }
  const ds = [...map.values()].sort((a, b) => a.thuTu - b.thuTu);
  const dem = new Map<number, number>();
  for (const b of ds) { b.viTri = dem.get(b.chuong) ?? 0; dem.set(b.chuong, b.viTri + 1); }
  return ds;
}

/**
 * Hàm `napLopVaBai`: nhận (db, _userId), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
export async function napLopVaBai(db: SupabaseClient, _userId?: string) {
  const [lops, units] = await Promise.all([
    lopCuaToi(db),
    tatCa(() => db.from('knowledge_units').select('ku_id, lesson_id, ku_name, order_index, prerequisite_ku').order('order_index'))
  ]);
  return { lops, units, bais: dsBai(units) };
}

/**
 * Bài sắp dạy mặc định. Lớp học đảo ngược: HS làm phiếu chuẩn bị TRƯỚC giờ học,
 * nên bài mới nhất có bài làm thường chính là bài sắp dạy.
 * Có nhật ký tiết thì lấy bài liền sau bài đã dạy gần nhất.
 */
function baiMacDinh(bais: Bai[], attempts: any[], logs: any[]): Bai | undefined {
  const viTri = (ku: string) => bais.findIndex((b) => b.kuIds.includes(ku));
  const daDay = logs.map((l: any) => viTri(l.ku_id)).filter((i) => i >= 0);
  // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
  if (daDay.length) return bais[Math.min(Math.max(...daDay) + 1, bais.length - 1)];
  const coBai = attempts.filter((a) => (a.kind ?? 'chuan-bi') === 'chuan-bi').map((a) => viTri(a.ku_id)).filter((i) => i >= 0);
  // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
  return coBai.length ? bais[Math.max(...coBai)] : bais[0];
}

/**
 * Hàm `napManChinh`: nhận (db, userId, q), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
export async function napManChinh(db: SupabaseClient, userId: string, q: { lop?: string; bai?: string; pv?: string }) {
  const { lops, units, bais } = await napLopVaBai(db, userId);
  let cookieLop: string | null = null;
  try { cookieLop = cookies().get(COOKIE_LOP)?.value ?? null; } catch { cookieLop = null; }
  const chonId = q.lop && q.lop !== 'tat-ca' ? q.lop : (cookieLop && cookieLop !== 'tat-ca' ? cookieLop : undefined);
  const lop = (chonId ? lops.find((l) => l.class_id === chonId) : undefined) ?? lops[0];
  if (!lop || !bais.length) return { lop: null, lops, bais } as const;

  // Truy vấn Supabase: đọc dữ liệu từ bảng students
  const hsRows = await tatCa(() => db.from('students').select('student_id, display_name').eq('class_id', lop.class_id).order('student_id'));
  const hocSinh = hsRows.map((s) => ({ id: s.student_id as string, ten: (s.display_name ?? s.student_id) as string }));
  const ids = hocSinh.map((h) => h.id);
  const coHS = ids.length > 0;
  const tu = new Date(Date.now() - 60 * NGAY).toISOString();

  const [attempts, dict, distractors, contents, coverage, mastery, settings, boQua, logs, events] = await Promise.all([
    coHS ? theoLo(ids, 100, (p) => tatCa(() => db.from('quiz_attempts').select('attempt_id, student_id, ku_id, score, kind, time_on_task_sec, submitted_at').in('student_id', p).order('attempt_id'))) : [],
    tatCa(() => db.from('error_dictionary').select('error_code, ku_id, misconception, remediation_id').order('error_code')),
    tatCa(() => db.from('distractor_errors').select('question_id, option_key, error_code').order('question_id')),
    tatCa(() => db.from('contents').select('ku_id, url, duration_sec').eq('kind', 'video').order('ku_id')),
    coHS ? theoLo(ids, 100, (p) => tatCa(() => db.from('video_coverage').select('student_id, ku_id, video_url, unique_seconds').in('student_id', p))) : [],
    coHS ? theoLo(ids, 100, (p) => tatCa(() => db.from('mastery_states').select('student_id, ku_id, mastery_level').in('student_id', p))) : [],
    db.from('class_settings').select('nguong').eq('class_id', lop.class_id).maybeSingle().then((r: any) => r.data?.nguong ?? {}, () => ({})),
    db.from('gv_bo_qua').select('student_id, den_ngay').eq('class_id', lop.class_id).then((r: any) => r.data ?? [], () => []),
    db.from('lesson_log').select('ku_id, ngay_day').eq('class_id', lop.class_id).then((r: any) => r.data ?? [], () => []),
    coHS ? theoLo(ids, 100, (p) => tatCa(() => db.from('learning_events').select('student_id, ku_id, event_type, ts, payload').in('student_id', p).gte('ts', tu).order('event_id'))) : []
  ]);

  const nguong = hopNhatNguong(settings);
  const bai = bais.find((b) => b.id === q.bai) ?? baiMacDinh(bais, attempts, logs)!;
  const iBai = bais.indexOf(bai);
  const baiTruoc = iBai > 0 ? bais[iBai - 1] : null;
  const baiTruoc2 = iBai > 1 ? bais[iBai - 2] : null;
  const baiSau = bais[iBai + 1] ?? null;

  // câu trả lời của mọi lượt làm
  const answers = attempts.length
    ? await theoLo(attempts.map((a) => a.attempt_id), 150, (p) => tatCa(() => db.from('quiz_answers').select('attempt_id, question_id, chosen_option, is_correct, error_code, answer_time_sec').in('attempt_id', p).order('attempt_id')))
    : [];
  const attById = new Map(attempts.map((a) => [a.attempt_id, a]));

  // Câu trả lời ở các lượt SOÁT LỖI CŨ đã nộp: bằng chứng trực tiếp nhất cho "đã khắc phục lỗi chưa".
  // Chưa chạy tệp 42 (thiếu bảng) thì bỏ qua, màn Tiến bộ vẫn tính từ bài làm thường như trước.
  let soatLoi: { sid: string; code: string; dung: boolean; chonLoi: boolean; t: number; ts: string }[] = [];
  if (coHS) {
    try {
      // Truy vấn Supabase: đọc dữ liệu từ bảng soat_loi_luot
      const luotSoat = await theoLo(ids, 100, (p) => tatCa(() => db.from('soat_loi_luot').select('luot_id, student_id, nop_luc').in('student_id', p).not('nop_luc', 'is', null).order('luot_id')));
      const luotById = new Map(luotSoat.map((l: any) => [l.luot_id, l]));
      // Truy vấn Supabase: đọc dữ liệu từ bảng soat_loi_tra_loi
      const tl = luotSoat.length ? await theoLo(luotSoat.map((l: any) => l.luot_id), 150, (p) => tatCa(() => db.from('soat_loi_tra_loi').select('luot_id, question_id, error_code, chosen_option, is_correct').in('luot_id', p).order('luot_id'))) : [];
      const maPhuongAn = new Map(distractors.map((d: any) => [`${d.question_id}|${d.option_key}`, d.error_code]));
      soatLoi = tl.map((r: any) => {
        const l: any = luotById.get(r.luot_id);
        return { sid: l.student_id, code: r.error_code, dung: !!r.is_correct, chonLoi: maPhuongAn.get(`${r.question_id}|${r.chosen_option}`) === r.error_code,
          t: new Date(l.nop_luc).getTime(), ts: `${l.nop_luc}|sl${String(r.luot_id).padStart(10, '0')}` };
      });
    } catch { soatLoi = []; }
  }
  const kuCuaBai = new Map<string, string>();
  for (const b of bais) for (const k of b.kuIds) kuCuaBai.set(k, b.id);
  const tenLoi: Record<string, string> = Object.fromEntries(dict.map((d) => [d.error_code, d.misconception]));
  const maLoiCuaCau = new Map<string, Set<string>>();
  for (const d of distractors) {
    if (!d.error_code) continue;
    if (!maLoiCuaCau.has(d.question_id)) maLoiCuaCau.set(d.question_id, new Set());
    maLoiCuaCau.get(d.question_id)!.add(d.error_code);
  }

  /** Mốc "sau tiết" của một bài: ngày dạy ghi ở nhật ký tiết (cuối ngày), không có thì lượt làm cuối của từng HS ở bài đó. */
  function mocSauTiet(b: Bai) {
    const ngay = logs.filter((l: any) => b.kuIds.includes(l.ku_id)).map((l: any) => new Date(`${l.ngay_day}T23:59:59+07:00`).getTime());
    // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
    const chung = ngay.length ? Math.max(...ngay) : null;
    const rieng = new Map<string, number>();
    for (const a of attempts) {
      if (!b.kuIds.includes(a.ku_id)) continue;
      const t = new Date(a.submitted_at).getTime();
      // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
      rieng.set(a.student_id, Math.max(rieng.get(a.student_id) ?? 0, t));
    }
    return (sid: string) => chung ?? rieng.get(sid) ?? null;
  }

  function capTienBo(truoc: Bai | null, denMoc?: (sid: string) => number | null) {
    if (!truoc) return null;
    const moc = mocSauTiet(truoc);
    const loiTruoc: { sid: string; code: string }[] = [];
    const daCo = new Map<string, Set<string>>();
    for (const an of answers) {
      const a = attById.get(an.attempt_id);
      if (!a || !an.error_code || !truoc.kuIds.includes(a.ku_id)) continue;
      const m = moc(a.student_id);
      if (m != null && new Date(a.submitted_at).getTime() > m) continue;
      loiTruoc.push({ sid: a.student_id, code: an.error_code });
      if (!daCo.has(a.student_id)) daCo.set(a.student_id, new Set());
      daCo.get(a.student_id)!.add(an.error_code);
    }
    const bangChungSau: any[] = [];
    for (const an of answers) {
      const a = attById.get(an.attempt_id);
      if (!a) continue;
      const loiHS = daCo.get(a.student_id);
      if (!loiHS) continue;
      const m = moc(a.student_id), t = new Date(a.submitted_at).getTime();
      if (m == null || t <= m) continue;
      const het = denMoc?.(a.student_id);
      if (het != null && t > het) continue;
      for (const code of maLoiCuaCau.get(an.question_id) ?? []) {
        if (!loiHS.has(code)) continue;
        bangChungSau.push({ sid: a.student_id, code, dung: !!an.is_correct, chonLoi: an.error_code === code, ts: `${a.submitted_at}|${String(a.attempt_id).padStart(12, '0')}` });
      }
    }
    for (const s of soatLoi) {
      if (!daCo.get(s.sid)?.has(s.code)) continue;
      const m = moc(s.sid);
      if (m == null || s.t <= m) continue;
      const het = denMoc?.(s.sid);
      if (het != null && s.t > het) continue;
      bangChungSau.push({ sid: s.sid, code: s.code, dung: s.dung, chonLoi: s.chonLoi, ts: s.ts });
    }
    return { loiTruoc, bangChungSau, moc };
  }

  // ---- GV-15
  const capNay = capTienBo(baiTruoc);
  const capCu = capTienBo(baiTruoc2, capNay ? capNay.moc : undefined);
  const tienBoCu = capCu ? tinhTienBo({ hocSinh, ...capCu, tenLoi, nguong }) : null;
  const tienBo = capNay ? tinhTienBo({ hocSinh, ...capNay, tenLoi, tiLeLanTruoc: tienBoCu?.tiLe ?? null, nguong }) : null;

  // ---- GV-16
  const pv: PhamVi = q.pv === 'tuan' || q.pv === 'chuong' ? q.pv : 'bai';
  const kuPhamVi = new Set(pv === 'chuong' ? bais.filter((b) => b.chuong === bai.chuong).flatMap((b) => b.kuIds) : bai.kuIds);
  const mocTuan = Date.now() - 7 * NGAY;
  const loiTrongPhamVi: { sid: string; code: string }[] = [];
  for (const an of answers) {
    const a = attById.get(an.attempt_id);
    if (!a || !an.error_code) continue;
    if (pv === 'tuan' ? new Date(a.submitted_at).getTime() < mocTuan : !kuPhamVi.has(a.ku_id)) continue;
    loiTrongPhamVi.push({ sid: a.student_id, code: an.error_code });
  }

  // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
  const unitsChuong = units.filter((u) => Number(String(u.ku_id).match(/^C(\d+)/)?.[1]) === bai.chuong)
    .map((u) => ({ ku_id: u.ku_id, ku_name: u.ku_name, lesson_id: u.lesson_id ?? u.ku_id, order: u.order_index, prerequisite: u.prerequisite_ku }));
  const { kyNang, nenBaiSapDay } = kyNangNenTamTinh(unitsChuong, bai.id);
  const diemMoiNhat = new Map<string, number>(); // sid|ku → điểm lượt cuối
  for (const a of attempts) diemMoiNhat.set(`${a.student_id}|${a.ku_id}`, Number(a.score));
  const mucLamChu = new Map(mastery.map((m: any) => [`${m.student_id}|${m.ku_id}`, m.mastery_level]));
  const hong: { sid: string; kn: string }[] = [];
  for (const h of hocSinh) for (const k of kyNang) {
    const d = diemMoiNhat.get(`${h.id}|${k.id}`), m = mucLamChu.get(`${h.id}|${k.id}`);
    if ((d != null && d < 5) || m === 0) hong.push({ sid: h.id, kn: k.id });
  }

  const hocTap: Record<string, any> = {};
  // Bài đã qua hạn chuẩn bị: các bài trước bài sắp dạy trong chương (bài sắp dạy còn đang trong hạn).
  const baiXet = bais.filter((b) => b.chuong === bai.chuong && b.thuTu < bai.thuTu);
  const kuVideo = new Set([...(baiTruoc?.kuIds ?? []), ...bai.kuIds]);
  const videoCua = new Map<string, { url: string; giay: number }>();
  for (const c of contents) if (c.url && c.duration_sec > 0 && !videoCua.has(c.ku_id)) videoCua.set(c.ku_id, { url: c.url, giay: c.duration_sec });
  const phu = new Map(coverage.map((c: any) => [`${c.student_id}|${c.ku_id}|${c.video_url}`, Number(c.unique_seconds)]));
  const soCauCua = new Map<number, number>();
  for (const an of answers) soCauCua.set(an.attempt_id, (soCauCua.get(an.attempt_id) ?? 0) + 1);
  const mocXet = Date.now() - nguong.soNgayXet * NGAY;
  const lanCuoi = new Map<string, number>();
  // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
  for (const e of events) lanCuoi.set(e.student_id, Math.max(lanCuoi.get(e.student_id) ?? 0, new Date(e.ts).getTime()));
  // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
  for (const a of attempts) lanCuoi.set(a.student_id, Math.max(lanCuoi.get(a.student_id) ?? 0, new Date(a.submitted_at).getTime()));
  for (const h of hocSinh) {
    const tiLe: number[] = [];
    for (const ku of kuVideo) {
      const v = videoCua.get(ku);
      if (!v) continue;
      const giay = phu.get(`${h.id}|${ku}|${v.url}`) ?? 0;
      // Video của bài sắp dạy còn trong hạn chuẩn bị: chỉ tính khi em đã bắt đầu xem.
      if (bai.kuIds.includes(ku) && giay === 0) continue;
      // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
      tiLe.push(Math.min(1, giay / v.giay));
    }
    const cuaHS = attempts.filter((a) => a.student_id === h.id);
    const soBaiChuaLam = baiXet.filter((b) => !cuaHS.some((a) => b.kuIds.includes(a.ku_id) && (a.kind ?? 'chuan-bi') === 'chuan-bi')).length;
    const ganDay = cuaHS.filter((a) => new Date(a.submitted_at).getTime() >= mocXet && a.time_on_task_sec != null && (soCauCua.get(a.attempt_id) ?? 0) > 0);
    const giay = ganDay.length ? ganDay.reduce((s, a) => s + a.time_on_task_sec / soCauCua.get(a.attempt_id)!, 0) / ganDay.length : null;
    const diem = ganDay.length ? ganDay.reduce((s, a) => s + Number(a.score), 0) / ganDay.length : null;
    const cuoi = lanCuoi.get(h.id);
    hocTap[h.id] = {
      videoPct: tiLe.length ? tiLe.reduce((s, x) => s + x, 0) / tiLe.length : null,
      soBaiChuaLam, giayMoiCau: giay, diemTB: diem,
      soNgayVang: cuoi ? Math.floor((Date.now() - cuoi) / NGAY) : null,
      coBaiMo: true
    };
  }
  const homNay = new Date().toISOString().slice(0, 10);
  const dsBoQua = boQua.filter((b: any) => b.den_ngay >= homNay).map((b: any) => b.student_id);
  const canChuY = tinhCanChuY({ hocSinh, loiTrongPhamVi, kyNangNen: kyNang, nenBaiSapDay, hong, hocTap, tenLoi, boQua: dsBoQua, nguong });

  // ---- GV-17
  const keHoach = await db.from('gv_ke_hoach_tiet').select('loi_dua_vao, ban_sua, updated_at')
    .eq('class_id', lop.class_id).eq('lesson_id', bai.id).maybeSingle().then((r: any) => r.data, () => null);
  const phieu = attempts.filter((a) => bai.kuIds.includes(a.ku_id) && (a.kind ?? 'chuan-bi') === 'chuan-bi');
  const daChuanBi = new Set(phieu.map((a) => a.student_id));
  const diemTheoHS = new Map<string, Map<string, number>>();
  for (const a of phieu) {
    if (!diemTheoHS.has(a.student_id)) diemTheoHS.set(a.student_id, new Map());
    diemTheoHS.get(a.student_id)!.set(a.ku_id, Number(a.score)); // lượt sau ghi đè lượt trước
  }
  const diemPhieu: Record<string, number> = {};
  for (const [sid, m] of diemTheoHS) diemPhieu[sid] = [...m.values()].reduce((s, x) => s + x, 0) / m.size;
  // lượt đầu mỗi HS mỗi mục → tỉ lệ sai từng câu
  const luotDau = new Map<string, any>();
  for (const a of phieu) { const k = `${a.student_id}|${a.ku_id}`; if (!luotDau.has(k)) luotDau.set(k, a); }
  const idLuotDau = new Set([...luotDau.values()].map((a) => a.attempt_id));
  const thongKeCau = new Map<string, { lam: number; sai: number }>();
  for (const an of answers) {
    if (!idLuotDau.has(an.attempt_id)) continue;
    const t = thongKeCau.get(an.question_id) ?? { lam: 0, sai: 0 };
    t.lam += 1; if (!an.is_correct) t.sai += 1;
    thongKeCau.set(an.question_id, t);
  }
  const cauNhieu = [...thongKeCau.entries()].filter(([, t]) => t.lam >= 3);
  const stems = cauNhieu.length
    ? await db.from('questions_public').select('question_id, stem').in('question_id', cauNhieu.map(([id]) => id)).then((r: any) => r.data ?? [], () => [])
    : [];
  const stemCua = new Map<string, string>(stems.map((s: any) => [String(s.question_id), String(s.stem)]));
  // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
  const tenMuc = new Map(units.map((u) => [u.ku_id, String(u.ku_name).replace(/^Mục \d+\.\s*/, '')]));
  const cauSai = cauNhieu.map(([id, t]) => ({
    so: Number(id.match(/Q(\d+)$/)?.[1] ?? 0), ma: `“${tenMuc.get(id.replace(/-Q\d+$/, '')) ?? id}”`, tiLeSai: t.sai / t.lam,
    noiDung: rutGon(latexSangChu(stemCua.get(id) ?? ''), 90)
  }));
  const tuaLai = events.filter((e: any) => e.event_type === 'video_replay' && bai.kuIds.includes(e.ku_id) && e.payload)
    .map((e: any) => ({ sid: e.student_id, muc: tenMuc.get(e.ku_id) ?? e.ku_id, tu: Number(e.payload.tu), den: Number(e.payload.den) }));
  const cauHoiHS = events.filter((e: any) => e.event_type === 'cau_hoi_len_lop' && bai.kuIds.includes(e.ku_id) && e.payload?.text)
    .map((e: any) => String(e.payload.text));

  const goiY = goiYTiet({
    tienBo, canChuY, hocSinh, soDaChuanBi: daChuanBi.size, diemPhieu, cauSai,
    doanXemLai: doanXemLaiNhieu(tuaLai), cauHoiHS,
    deThi: yDeTheoChuong(bai.chuong, bai.viTri), baiSau: baiSau ? { ten: baiSau.tenNgan } : null,
    loiDuaVao: keHoach?.loi_dua_vao ?? [], tenLoi, tenBai: bai.tenNgan, nguong
  });
  // Áp bản GV đã chỉnh (chấp nhận / sửa / bỏ) lên gợi ý mới nhất
  const banSuaGoc: any = keHoach?.ban_sua ?? null;
  const banSua: any[] = Array.isArray(banSuaGoc) ? banSuaGoc : (banSuaGoc?.hoatDong ?? []);
  const nhomSua: Record<string, string> = (!Array.isArray(banSuaGoc) && banSuaGoc?.nhom) || {};
  // GV đã chuyển HS giữa các nhóm → cập nhật sĩ số nhóm trong nội dung Luyện tập
  if (Object.keys(nhomSua).length) {
    const dem: Record<string, number> = { sao: 0, choi: 0, mam: 0 };
    for (const k of ['sao', 'choi', 'mam']) for (const h of goiY.nhom[k]) dem[nhomSua[h.id] ?? k] += 1;
    const lt = goiY.hoatDong.find((h: any) => h.id === 'luyen-tap');
    // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
    if (lt) lt.noiDung = lt.noiDung.map((x: string, i: number) => x.replace(/\(\d+ HS\)/, `(${dem[['sao', 'choi', 'mam'][i]] ?? 0} HS)`));
  }
  const hoatDong = canLaiThoiGian(goiY.hoatDong.map((h: any) => {
    const s = banSua.find((x) => x.id === h.id);
    return {
      ...h, phutGoiY: h.phut,
      ...(s ? { trangThai: s.trangThai ?? h.trangThai, bo: s.trangThai === 'bo', coDinh: !!s.coDinh, phut: s.coDinh ? s.phut : h.phut, noiDungSua: s.noiDungSua ?? null } : {})
    };
  })).ds;

  return {
    lop, lops, bais, bai, baiTruoc, baiTruoc2, baiSau, hocSinh, nguong, pv,
    tienBo, tienBoCu, canChuY, goiY: { ...goiY, hoatDong }, keHoach, nhomSua,
    soDaChuanBi: daChuanBi.size, tenLoi,
    remediation: Object.fromEntries(dict.map((d) => [d.error_code, { ku: d.ku_id, vbh: d.remediation_id }])),
    kyNang
  } as const;
}

/**
 * Hàm `rutGon`: nhận (s, n), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
function rutGon(s: string, n: number) {
  // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
  const t = s.replace(/\s+/g, ' ').trim();
  return t.length > n ? t.slice(0, n - 1) + '…' : t;
}

export { NGUONG_MAC_DINH };
