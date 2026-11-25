/**
 * FILE NÀY LÀM GÌ: API máy chủ phục vụ giáo viên xử lý dữ liệu lớp học, thống kê hoặc thao tác quản lý trên Supabase.
 * AI DÙNG: máy chủ (API)
 * ĐỊA CHỈ TRÊN WEB: /api/gv/quet-phieu
 * LẤY DỮ LIỆU TỪ: profiles, students, knowledge_units, questions_public, question_options, questions, distractor_errors, quiz_attempts
 * GỌI TỚI: @/lib/supabase/server, @/lib/gv/lopCuaToi, @/lib/khkt/phieuQR, @/lib/soatLoiMayChu
 */
import { NextResponse } from 'next/server';
import { supabaseAdmin, supabaseServer } from '@/lib/supabase/server';
import { kiemTraQuyenLop, laVaiTroGV } from '@/lib/gv/lopCuaToi';
import { chonCauPhieuQR, type ModePhieuQR } from '@/lib/khkt/phieuQR';
import { ghiLoiTuBaiLam } from '@/lib/soatLoiMayChu';

export const dynamic = 'force-dynamic';

/**
 * Hàm `kiemTraGVChoHS(studentId)`: kiểm tra điều kiện hợp lệ (trả về true/false hoặc thông báo lỗi).
 */
async function kiemTraGVChoHS(studentId: string) {
  const db = supabaseServer();
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  const { data: { user } } = await db.auth.getUser();
  if (!user) return { loi: NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 }) } as const;
  // Truy vấn Supabase: đọc dữ liệu từ bảng profiles
  const { data: p } = await db.from('profiles').select('role').eq('id', user.id).maybeSingle();
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  if (!laVaiTroGV(p?.role)) return { loi: NextResponse.json({ error: 'Chỉ giáo viên' }, { status: 403 }) } as const;

  const admin = supabaseAdmin();
  const { data: st } = await admin
    .from('students')
    .select('student_id, class_id, display_name')
    .eq('student_id', studentId)
    .maybeSingle();
  if (!st?.class_id) {
    return { loi: NextResponse.json({ error: `Không tìm thấy học sinh ${studentId}` }, { status: 404 }) } as const;
  }
  const lop = await kiemTraQuyenLop(db, st.class_id);
  if (!lop) {
    return { loi: NextResponse.json({ error: 'Thầy cô không phụ trách lớp của học sinh này' }, { status: 403 }) } as const;
  }
  return { db, admin, user, student: st, lop } as const;
}

/**
 * Xử lý HTTP GET: kiểm tra đăng nhập/quyền hạn, đọc dữ liệu và trả về JSON cho trình duyệt.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const studentId = url.searchParams.get('studentId')?.trim() ?? '';
  const kuId = url.searchParams.get('kuId')?.trim() ?? '';
  const mode: ModePhieuQR = url.searchParams.get('mode') === 'van-dung' ? 'van-dung' : 'chuan-bi';
  if (!studentId || !kuId) {
    return NextResponse.json({ error: 'Thiếu mã học sinh hoặc mã mục' }, { status: 400 });
  }

  const auth = await kiemTraGVChoHS(studentId);
  if ('loi' in auth) return auth.loi;

  const { admin } = auth;
  const [{ data: ku }, { data: bank }] = await Promise.all([
    admin.from('knowledge_units').select('ku_id, ku_name').eq('ku_id', kuId).maybeSingle(),
    admin.from('questions_public').select('question_id, stem, level').eq('ku_id', kuId).order('level'),
  ]);
  if (!ku) return NextResponse.json({ error: `Không tìm thấy mục ${kuId}` }, { status: 404 });

  const ids = (bank ?? []).map((q) => q.question_id);
  const { data: opts } = ids.length
    ? await admin.from('question_options').select('question_id, option_key, option_text').in('question_id', ids).order('option_key')
    : { data: [] as any[] };

  const cau = chonCauPhieuQR(bank ?? [], opts ?? [], studentId || kuId, mode);
  return NextResponse.json({
    student: auth.student,
    ku,
    mode,
    questions: cau,
  });
}

/**
 * Xử lý HTTP POST: kiểm tra đăng nhập/quyền hạn, nhận dữ liệu mới / xử lý và trả về JSON cho trình duyệt.
 */
export async function POST(req: Request) {
  const b = await req.json().catch(() => null);
  const studentId = String(b?.studentId ?? '').trim();
  const kuId = String(b?.kuId ?? '').trim();
  const mode: ModePhieuQR = b?.mode === 'van-dung' ? 'van-dung' : 'chuan-bi';
  const answers: { questionId: string; option: string | null }[] = Array.isArray(b?.answers) ? b.answers : [];

  if (!studentId || !kuId || !answers.length) {
    return NextResponse.json({ error: 'Thiếu dữ liệu phiếu trả lời' }, { status: 400 });
  }

  const auth = await kiemTraGVChoHS(studentId);
  if ('loi' in auth) return auth.loi;
  const { admin } = auth;

  const ids = answers.map((a) => String(a.questionId));
  const [{ data: qRows }, { data: distRows }] = await Promise.all([
    admin.from('questions').select('question_id, correct_option, expected_time_sec').eq('ku_id', kuId).in('question_id', ids),
    admin.from('distractor_errors').select('question_id, option_key, error_code').in('question_id', ids),
  ]);

  // Mọi câu trên phiếu phải thuộc đúng mục đang chấm và không trùng nhau
  if (new Set(ids).size !== ids.length || (qRows ?? []).length !== ids.length) {
    return NextResponse.json({ error: 'Phiếu có câu không thuộc mục này hoặc bị trùng. Thầy cô quét lại phiếu.' }, { status: 400 });
  }
  const qMap = new Map((qRows ?? []).map((q) => [q.question_id, q]));
  const dMap = new Map((distRows ?? []).map((d) => [`${d.question_id}|${d.option_key}`, d.error_code as string]));

  let correctCount = 0;
  const graded = answers.map((a) => {
    const q = qMap.get(a.questionId);
    const isCorrect = !!q && a.option != null && a.option === q.correct_option;
    if (isCorrect) correctCount++;
    const errCode = !isCorrect && a.option ? dMap.get(`${a.questionId}|${a.option}`) ?? null : null;
    return {
      question_id: a.questionId,
      chosen_option: a.option,
      is_correct: isCorrect,
      error_code: errCode,
      answer_time_sec: Number(q?.expected_time_sec ?? 60),
    };
  });

  const score = Math.round((correctCount / graded.length) * 100) / 10;

  // Quét lại đúng tờ phiếu đó (cùng em, cùng mục, cùng đáp án) thì không ghi thêm lượt mới
  const chuKy = graded.map((g) => `${g.question_id}:${g.chosen_option ?? '-'}`).sort().join(',');
  let bam = 0;
  for (const ch of `${studentId}|${kuId}|${mode}|${chuKy}`) bam = (bam * 31 + ch.charCodeAt(0)) >>> 0;
  const subKey = `phieu-${mode}-${bam.toString(36)}`;
  const { data: daCo } = await admin
    .from('quiz_attempts').select('attempt_id').eq('student_id', studentId).eq('client_submission_id', subKey)
    .maybeSingle()
    .then((r) => r, () => ({ data: null }));
  if (daCo?.attempt_id) {
    return NextResponse.json({ ok: true, attemptId: daCo.attempt_id, score, correctCount, total: graded.length, daQuetTruoc: true, nguon: 'phieu-giay' });
  }

  // Phiếu giấy là bài CHUẨN BỊ / VẬN DỤNG làm trên giấy (cho em không có thiết bị), nên ghi đúng loại bài
  // để được tính là đã chuẩn bị bài; cột nguon = 'phieu-giay' cho biết làm trên giấy.
  const { count } = await admin
    .from('quiz_attempts')
    .select('*', { count: 'exact', head: true })
    .eq('student_id', studentId)
    .eq('ku_id', kuId)
    .eq('kind', mode);
  const attemptNo = (count ?? 0) + 1;
  const goc = {
    student_id: studentId,
    ku_id: kuId,
    attempt_no: attemptNo,
    score,
    time_on_task_sec: graded.reduce((s, g) => s + g.answer_time_sec, 0),
    kind: mode
  };

  let attemptId: number | null = null;
  const resAtt = await admin
    .from('quiz_attempts')
    .insert({ ...goc, nguon: 'phieu-giay', client_submission_id: subKey })
    .select('attempt_id')
    .single();

  if (resAtt.data?.attempt_id) {
    attemptId = resAtt.data.attempt_id;
  } else {
    // Chưa chạy file 53 (chưa có cột nguon / client_submission_id)
    const fb = await admin.from('quiz_attempts').insert(goc).select('attempt_id').single();
    if (fb.error || !fb.data) {
      return NextResponse.json({ error: fb.error?.message ?? 'Không ghi được lượt làm phiếu giấy' }, { status: 400 });
    }
    attemptId = fb.data.attempt_id;
  }

  // Truy vấn Supabase: thêm bản ghi vào bảng quiz_answers
  await admin.from('quiz_answers').insert(graded.map((g) => ({ ...g, attempt_id: attemptId })));

  await admin
    .from('learning_events')
    .insert({
      student_id: studentId,
      ku_id: kuId,
      event_type: 'phieu_giay',
      payload: { nguon: 'phieu-giay', mode, score, attempt_id: attemptId },
    })
    .then(() => {}, () => {});

  // Cập nhật mức làm chủ & ghi lỗi vào Sổ lỗi
  await admin.rpc('refresh_mastery_v2', { p_student: studentId, p_ku: kuId }).then(() => {}, () => {});
  const wrongCodes = graded.filter((g) => !g.is_correct && g.error_code).map((g) => g.error_code!);
  if (wrongCodes.length) {
    try {
      await ghiLoiTuBaiLam(admin, studentId, wrongCodes, kuId, attemptId);
    } catch {
      /* bỏ qua nếu chưa chạy file 42 */
    }
  }

  return NextResponse.json({
    ok: true,
    attemptId,
    score,
    correctCount,
    total: graded.length,
    errorCodes: Array.from(new Set(wrongCodes)),
    nguon: 'phieu-giay',
  });
}
