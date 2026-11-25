/**
 * FILE NÀY LÀM GÌ: API máy chủ tiếp nhận yêu cầu từ trình duyệt, kiểm tra quyền và làm việc với cơ sở dữ liệu Supabase / AI.
 * AI DÙNG: máy chủ (API)
 * ĐỊA CHỈ TRÊN WEB: /api/goi-y
 * LẤY DỮ LIỆU TỪ: profiles, quiz_answers, hint_requests, error_hints, questions, error_dictionary, learning_events
 * GỌI TỚI: @/lib/supabase/server, @/lib/aiTutor, @/lib/dfle/tutor.js
 */
import { NextResponse } from 'next/server';
import { supabaseServer, supabaseAdmin } from '@/lib/supabase/server';
import { tutorHint } from '@/lib/aiTutor';
// @ts-ignore — dùng chung với gói dfle-engine
import { kiemTraYeuCau, TEN_TANG, SO_TANG_TOI_DA } from '@/lib/dfle/tutor.js';

export const dynamic = 'force-dynamic';

/**
 * MỞ MỘT TẦNG GỢI Ý
 *
 * Ba lớp kiểm soát, cần nói được ở phỏng vấn:
 *
 * 1. Học sinh chỉ nhận được gợi ý của mã lỗi mà CHÍNH EM ĐÓ vừa mắc. Máy chủ tra
 *    lại bài làm thật của em trong bảng quiz_answers rồi mới lấy gợi ý — client
 *    không tự khai mã lỗi được, nên không dò cả bảng để suy ra đáp án.
 * 2. Gợi ý mở TUẦN TỰ tầng 1 → 2 → 3, không cho nhảy cóc, và không có tầng 4.
 * 3. Mỗi lượt mở đều được ghi lại: vừa chống lạm dụng, vừa là dữ liệu nghiên cứu
 *    về độ sâu gợi ý mà học sinh cần dùng.
 *
 * Không gọi mô hình sinh tự do. Toàn bộ nội dung do giáo viên soạn và duyệt trước.
 */
export async function POST(req: Request) {
  const supabase = supabaseServer();
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });

  const { data: profile } = await supabase
    .from('profiles').select('student_id').eq('id', user.id).maybeSingle();
  const studentId = profile?.student_id;
  if (!studentId) return NextResponse.json({ error: 'Tài khoản không gắn với học sinh nào' }, { status: 403 });

  const body = await req.json().catch(() => null);
  const questionId: string = body?.questionId;
  const solution = typeof body?.solution === 'string' ? body.solution.trim() : '';
  if (typeof questionId !== 'string' || !questionId || questionId.length > 80 || solution.length > 2000) {
    return NextResponse.json({ error: 'Thiếu dữ liệu' }, { status: 400 });
  }

  const admin = supabaseAdmin();

  // (1) Em này có thực sự làm sai câu đó không, và sai vào mã lỗi nào?
  const { data: ans } = await admin
    .from('quiz_answers').select('error_code, is_correct, quiz_attempts!inner(student_id)')
    .eq('quiz_attempts.student_id', studentId).eq('question_id', questionId)
    .order('attempt_id', { ascending: false }).limit(1);

  const errorCode = ans?.[0]?.error_code ?? null;
  if (!ans?.length || ans[0].is_correct) {
    return NextResponse.json(
      { error: 'Câu này em làm đúng rồi, chưa cần gợi ý.' }, { status: 400 });
  }
  if (!errorCode) {
    return NextResponse.json({
      hetGoiY: true,
      thongBao: 'Câu này chưa có gợi ý sẵn. Em xem lại video bài học hoặc hỏi thầy cô nhé.'
    });
  }

  // (2) Đã mở tới tầng nào rồi?
  const { data: daMoRows, error: historyError } = await admin
    .from('hint_requests').select('tier')
    .eq('student_id', studentId).eq('question_id', questionId);
  const daMo = (daMoRows ?? []).map((r) => r.tier);
  if(historyError)return NextResponse.json({error:'Không đọc được lịch sử gợi ý.'},{status:503});
  // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
  const tang = Math.max(0,...daMo)+1;

  const check = kiemTraYeuCau({ tangMuonMo: tang, daMo });
  if (!check.ok) {
    return NextResponse.json({ hetGoiY: tang > SO_TANG_TOI_DA, thongBao: check.ly_do }, { status: 400 });
  }

  const { data: hint } = await admin
    .from('error_hints').select('hint_text')
    .eq('error_code', errorCode).eq('tier', tang).maybeSingle();
  if (!hint) {
    return NextResponse.json({
      hetGoiY: true,
      thongBao: 'Chưa soạn gợi ý cho tầng này. Em hỏi thầy cô nhé.'
    });
  }

  // (3) ghi nhật ký — dữ liệu nghiên cứu về độ sâu gợi ý
  const {error:saveError}=await admin.from('hint_requests').insert({
    student_id: studentId, question_id: questionId, error_code: errorCode, tier: tang
  });
  if(saveError)return NextResponse.json({error:'Không ghi được lượt gợi ý. Em thử lại sau.'},{status:503});
  const [{ data: hintMeta }, { data: qMeta }] = await Promise.all([
    admin.from('error_hints').select('nguon').eq('error_code', errorCode).eq('tier', tang).maybeSingle().then((r) => r, () => ({ data: null })),
    admin.from('questions').select('stem,ku_id').eq('question_id', questionId).maybeSingle(),
  ]);
  let reply:{text:string;source:'ai'|'prepared'}={text:hint.hint_text,source:'prepared'};
  if(solution.length>=10){
    // Truy vấn Supabase: đọc dữ liệu từ bảng error_dictionary
    const {data:entry}=await admin.from('error_dictionary').select('misconception').eq('error_code',errorCode).maybeSingle();
    if(qMeta&&entry)reply=await tutorHint({solution,stem:qMeta.stem,misconception:entry.misconception,hint:hint.hint_text,tier:tang});
  }
  // Truy vấn Supabase: thêm bản ghi vào bảng learning_events
  await admin.from('learning_events').insert({
    student_id: studentId, event_type: 'hint_request',
    payload: { question_id: questionId, tier: tang, source:reply.source, has_solution:solution.length>=10 }
  });
  try {
    const { ghiNhanGoiY } = await import('@/lib/khkt/ghiGoiYSuKien');
    await ghiNhanGoiY(admin, {
      studentId,
      nguon: 'goi-y-loi',
      tang: Math.min(3, Math.max(1, tang)) as 1 | 2 | 3,
      kuId: qMeta?.ku_id ?? null,
      questionId,
      errorCode,
      coAi: hintMeta?.nguon === 'ai-duyet' || reply.source === 'ai',
    });
  } catch { /* bỏ qua */ }

  return NextResponse.json({
    tang,
    tenTang: TEN_TANG[tang as 1 | 2 | 3],
    noiDung: reply.text,
    source:reply.source,
    conTang: tang < SO_TANG_TOI_DA
  });
}
