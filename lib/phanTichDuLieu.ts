/**
 * FILE NÀY LÀM GÌ: Mô-đun TypeScript/JavaScript hỗ trợ xử lý dữ liệu và nghiệp vụ trong hệ thống FlipMath 9.
 * AI DÙNG: dùng chung
 * LẤY DỮ LIỆU TỪ: students, questions, question_options, distractor_errors, knowledge_units, quiz_attempts, quiz_answers, assessments
 * GỌI TỚI: @/lib/supabase/server, @/lib/gv/lopCuaToi
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import { supabaseAdmin } from '@/lib/supabase/server';
import { lopCuaToi, tenHienThiLop } from '@/lib/gv/lopCuaToi';

/**
 * NẠP DỮ LIỆU THÔ CHO TRANG /gv/phan-tich
 *
 * Chỉ ĐỌC. Không ghi bảng nào, không tạo bảng mới — BKT và phân tích câu hỏi
 * được tính lại từ câu trả lời thô mỗi lần mở trang.
 *
 * Phạm vi:
 *   · chỉ lớp THỰC NGHIỆM (arm = 'TN') mà giáo viên này dạy — nhóm đối chứng
 *     không dùng hệ thống nên không có câu trả lời nào để phân tích
 *   · chỉ học sinh đã có đồng thuận ('dong-y'), đúng như tệp xuất dữ liệu
 *
 * Dùng khoá máy chủ vì cần cột đáp án (correct_option) — cột mà từ tệp 20 trở
 * đi tài khoản đăng nhập thường không đọc trực tiếp được.
 *
 * Mọi truy vấn đều đọc theo trang 1000 dòng: PostgREST cắt ngầm ở 1000 dòng, và
 * bảng câu trả lời của 80 em trong 4 tuần vượt mốc đó rất nhanh.
 */

const TRANG = 1000;
const LO_IN = 300; // số mã trong một mệnh đề .in(), tránh URL quá dài

/**
 * Hàm `docHet`: nhận (tao), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
async function docHet<T = any>(tao: (tu: number, den: number) => any): Promise<T[]> {
  const tatCa: T[] = [];
  for (let tu = 0; ; tu += TRANG) {
    const { data, error } = await tao(tu, tu + TRANG - 1);
    if (error) throw new Error(error.message);
    if (!data?.length) break;
    tatCa.push(...(data as T[]));
    if (data.length < TRANG) break;
  }
  return tatCa;
}

/**
 * Hàm `docTheoLo`: nhận (ids, tao), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
async function docTheoLo<T = any>(ids: (string | number)[], tao: (lo: any[], tu: number, den: number) => any) {
  const tatCa: T[] = [];
  for (let i = 0; i < ids.length; i += LO_IN) {
    const lo = ids.slice(i, i + LO_IN);
    tatCa.push(...(await docHet<T>((tu, den) => tao(lo, tu, den))));
  }
  return tatCa;
}

export type TraLoi = {
  studentId: string; questionId: string; kuId: string; level: number;
  chosen: string | null; isCorrect: boolean; errorCode: string | null; ts: number;
  diemLuot: number | null; giayLamBai: number | null; giayDuKien: number | null;
};

export type NganHang = {
  dapAn: Map<string, string>;
  phuongAn: Map<string, string[]>;
  maLoiPhuongAn: Map<string, string>;
  thongTinCau: Map<string, { kuId: string; level: number }>;
};

export type DuLieuPhanTich = {
  lop: { class_id: string; class_code: string }[];
  soHocSinh: number;
  traLoi: TraLoi[];
  nganHang: NganHang;
  tenDonVi: Map<string, string>;
};

/**
 * Hàm `taiDuLieuPhanTich`: nhận (dbUser, chonLop), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
export async function taiDuLieuPhanTich(
  dbUser: SupabaseClient,
  chonLop?: string | null
): Promise<DuLieuPhanTich> {
  const tatCaLop = await lopCuaToi(dbUser);
  const lopTN = tatCaLop.filter((l) => l.arm === 'TN');
  const lop = (
    chonLop && chonLop !== 'tat-ca'
      ? lopTN.filter((l) => l.class_id === chonLop)
      : lopTN
  ).map((l) => ({
    class_id: l.class_id,
    class_code: tenHienThiLop(l)
  }));
  const maLop = lop.map((l) => l.class_id);

  const db = supabaseAdmin();

  const hs = maLop.length
    ? await docHet<{ student_id: string }>((tu, den) => db.from('students')
        .select('student_id').in('class_id', maLop).eq('consent_status', 'dong-y')
        .order('student_id').range(tu, den))
    : [];
  const maHs = hs.map((h) => h.student_id);

  // ---- ngân hàng câu hỏi
  const [cau, pa, nhieu, dv] = await Promise.all([
    docHet<any>((tu, den) => db.from('questions')
      .select('question_id, ku_id, level, correct_option, expected_time_sec').order('question_id').range(tu, den)),
    docHet<any>((tu, den) => db.from('question_options')
      .select('question_id, option_key').order('question_id').order('option_key').range(tu, den)),
    docHet<any>((tu, den) => db.from('distractor_errors')
      .select('question_id, option_key, error_code').order('question_id').order('option_key').range(tu, den)),
    docHet<any>((tu, den) => db.from('knowledge_units')
      .select('ku_id, ku_name, order_index').order('order_index').range(tu, den))
  ]);
  const thongTinCau = new Map<string, { kuId: string; level: number }>(
    cau.map((q) => [q.question_id, { kuId: q.ku_id, level: q.level }]));
  const thoiGianCau = new Map<string, number>(cau.map((q) => [q.question_id, q.expected_time_sec ?? 0]));
  const phuongAn = new Map<string, string[]>();
  for (const o of pa) {
    if (!phuongAn.has(o.question_id)) phuongAn.set(o.question_id, []);
    phuongAn.get(o.question_id)!.push(o.option_key);
  }
  const nganHang: NganHang = {
    dapAn: new Map(cau.map((q) => [q.question_id, q.correct_option])),
    phuongAn,
    maLoiPhuongAn: new Map(nhieu.map((d) => [`${d.question_id}|${d.option_key}`, d.error_code])),
    thongTinCau
  };

  const traLoi: TraLoi[] = [];
  if (maHs.length) {
    // ---- (1) bài kiểm tra ngắn và bài vận dụng
    const luot = await docTheoLo<any>(maHs, (lo, tu, den) => db.from('quiz_attempts')
      .select('attempt_id, student_id, ku_id, score, time_on_task_sec, submitted_at')
      .in('student_id', lo).order('attempt_id').range(tu, den));
    const theoLuot = new Map<number, any>(luot.map((l) => [l.attempt_id, l]));
    // Truy vấn Supabase: đọc dữ liệu từ bảng quiz_answers
    const traLoiLuot = await docTheoLo<any>(luot.map((l) => l.attempt_id), (lo, tu, den) => db.from('quiz_answers')
      .select('attempt_id, question_id, chosen_option, is_correct, error_code')
      .in('attempt_id', lo).order('attempt_id').order('question_id').range(tu, den));

    // thời gian dự kiến của CẢ LƯỢT — cần cho bộ lọc "đáng tin" giống mastery v2
    const duKienLuot = new Map<number, number>();
    for (const a of traLoiLuot) {
      duKienLuot.set(a.attempt_id, (duKienLuot.get(a.attempt_id) ?? 0) + (thoiGianCau.get(a.question_id) ?? 0));
    }

    for (const a of traLoiLuot) {
      const l = theoLuot.get(a.attempt_id);
      const info = thongTinCau.get(a.question_id);
      if (!l || !info) continue;
      traLoi.push({
        studentId: l.student_id, questionId: a.question_id, kuId: info.kuId, level: info.level,
        chosen: a.chosen_option, isCorrect: !!a.is_correct, errorCode: a.error_code,
        ts: Date.parse(l.submitted_at),
        diemLuot: l.score === null ? null : Number(l.score),
        giayLamBai: l.time_on_task_sec, giayDuKien: duKienLuot.get(a.attempt_id) ?? null
      });
    }

    // ---- (2) bài đánh giá đầu vào / cuối chương — mastery v2 cũng tính phần này
    const danhGia = await docTheoLo<any>(maHs, (lo, tu, den) => db.from('assessments')
      .select('student_id, submitted_at, active_seconds, questions, result')
      .in('student_id', lo).not('submitted_at', 'is', null).order('submitted_at').range(tu, den));
    for (const s of danhGia) {
      const duKien = (s.questions ?? []).reduce((t: number, q: any) => t + (Number(q.expected_time_sec) || 0), 0);
      for (const x of s.result?.answers ?? []) {
        const info = thongTinCau.get(x.question_id);
        if (!info) continue;
        const dung = !!x.is_correct;
        const chon = x.chosen_option ?? null;
        traLoi.push({
          studentId: s.student_id, questionId: x.question_id, kuId: info.kuId, level: info.level,
          chosen: chon, isCorrect: dung,
          errorCode: dung || !chon ? null : nganHang.maLoiPhuongAn.get(`${x.question_id}|${chon}`) ?? null,
          ts: Date.parse(s.submitted_at),
          diemLuot: s.result?.score == null ? null : Number(s.result.score),
          giayLamBai: s.active_seconds, giayDuKien: duKien || null
        });
      }
    }
  }

  return {
    lop: (lop ?? []) as any, soHocSinh: maHs.length, traLoi, nganHang,
    tenDonVi: new Map(dv.map((k) => [k.ku_id, k.ku_name]))
  };
}

/** Gom câu trả lời thành hocSinh → (donVi → quanSats) cho BKT và mastery v2. */
export function theoHocSinhDonVi(traLoi: TraLoi[]) {
  const m = new Map<string, Map<string, any[]>>();
  for (const t of traLoi) {
    if (!m.has(t.studentId)) m.set(t.studentId, new Map());
    const d = m.get(t.studentId)!;
    if (!d.has(t.kuId)) d.set(t.kuId, []);
    d.get(t.kuId)!.push({
      questionId: t.questionId, level: t.level, isCorrect: t.isCorrect, ts: t.ts,
      diemLuot: t.diemLuot, giayLamBai: t.giayLamBai, giayDuKien: t.giayDuKien
    });
  }
  return m;
}
