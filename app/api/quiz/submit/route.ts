/**
 * FILE NÀY LÀM GÌ: API máy chủ tiếp nhận yêu cầu từ trình duyệt, kiểm tra quyền và làm việc với cơ sở dữ liệu Supabase / AI.
 * AI DÙNG: máy chủ (API)
 * ĐỊA CHỈ TRÊN WEB: /api/quiz/submit
 * LẤY DỮ LIỆU TỪ: profiles, quiz_attempts, quiz_answers, quiz_locks, questions_public, mastery_states, questions, distractor_errors
 * GỌI TỚI: @/lib/cheDo, @/lib/chonPhieu, @/lib/adaptive, @/lib/loiCu, @/lib/soatLoiMayChu, @/lib/supabase/server, @/lib/dfle/rules.js, @/lib/dfle/mastery.js
 */
import { CHE_DO_KIEM_TRA } from '@/lib/cheDo';
import { NextResponse } from 'next/server';
import { chonPhieu } from '@/lib/chonPhieu';
import {selectAdaptive} from '@/lib/adaptive';
import { uuTienLoiCu } from '@/lib/loiCu';
import { ghiLoiTuBaiLam } from '@/lib/soatLoiMayChu';
import { supabaseServer, supabaseAdmin } from '@/lib/supabase/server';
// @ts-ignore — bộ máy viết bằng JavaScript thuần, dùng chung với bản CLI
import { recommend, nghiDoanMo } from '@/lib/dfle/rules.js';
// @ts-ignore
import { lessonMinMastery } from '@/lib/dfle/mastery.js';
// @ts-ignore
import { tinhXp, xetHuyHieu, capNhatChuoi } from '@/lib/dfle/gamification.js';
// @ts-ignore
import { homNayVN } from '@/lib/dfle/ngay.js';

export const dynamic = 'force-dynamic';

/**
 * Chấm bài và chạy bộ quy tắc thích ứng.
 *
 * Việc chấm BẮT BUỘC làm ở máy chủ: đáp án đúng (questions.correct_option) và bảng
 * ánh xạ phương án nhiễu → mã lỗi (distractor_errors) không cho học sinh đọc, nên
 * chỉ service role mới truy vấn được. Nếu chấm ở trình duyệt thì học sinh mở
 * DevTools là thấy đáp án.
 */
export async function POST(req: Request) {
  // Mốc thời gian chụp TRƯỚC mọi lần ghi của chính request này. Nếu lấy now() sau
  // khi đã ghi lượt làm thì "số ngày không hoạt động" luôn bằng 0, vì hoạt động
  // gần nhất chính là lượt vừa ghi.
  const batDau = new Date();
  const supabase = supabaseServer();
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });

  const { data: profile } = await supabase
    .from('profiles').select('student_id').eq('id', user.id).maybeSingle();
  const studentId = profile?.student_id;
  if (!studentId) return NextResponse.json({ error: 'Tài khoản không gắn với học sinh nào' }, { status: 403 });

  const body = await req.json().catch(() => null);
  const kuId: string = body?.kuId;
  const answers: Array<{ questionId: string; option: string | null; answerTimeSec?: number }> =
    Array.isArray(body?.answers) ? body.answers : [];
  // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
  const timeOnTaskSec = Math.max(0, Math.round(Number(body?.timeOnTaskSec) || 0));
  // 'chuan-bi' = bài kiểm tra trước giờ học · 'van-dung' = bài vận dụng sau giờ học
  const kind: 'chuan-bi' | 'van-dung' = body?.mode === 'van-dung' ? 'van-dung' : 'chuan-bi';
  const giamTai = Boolean(body?.giamTai);
  if (!kuId || !answers.length) return NextResponse.json({ error: 'Thiếu dữ liệu' }, { status: 400 });

  const rawSubId = typeof body?.clientSubmissionId === 'string' ? body.clientSubmissionId.trim() : '';
  // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
  const clientSubmissionId = /^[A-Za-z0-9_-]{8,80}$/.test(rawSubId) ? rawSubId : null;

  const admin = supabaseAdmin();

  if (clientSubmissionId) {
    try {
      const { data: existingSub } = await admin
        .from('quiz_attempts')
        .select('attempt_id, attempt_no, score')
        .eq('student_id', studentId)
        .eq('client_submission_id', clientSubmissionId)
        .maybeSingle();
      if (existingSub) {
        const { data: prevAns } = await admin
          .from('quiz_answers')
          .select('question_id, is_correct')
          .eq('attempt_id', existingSub.attempt_id);
        const perQ = (prevAns ?? []).map((x: any) => ({ questionId: x.question_id, isCorrect: Boolean(x.is_correct) }));
        return NextResponse.json({
          duplicate: true,
          recoverySaved: true,
          supportAvailable: false,
          score: Number(existingSub.score),
          attemptNo: existingSub.attempt_no,
          kind,
          thuong: { xp: 0, chiTiet: [], huyHieuMoi: [] },
          mastery: null,
          masteryStatus: 'measured',
          correctCount: perQ.filter((x) => x.isCorrect).length,
          total: perQ.length || answers.length,
          perQuestion: perQ,
          recommendation: { triggerRule: null, diagnosis: '', action: '', content: null, contentId: null, allTriggered: [] },
          videoCompletionRate: null
        });
      }
    } catch {
      /* bỏ qua nếu DB chưa có cột client_submission_id (trước khi chạy file 53) */
    }
  }

  // ---- kiểm tra khoá làm lại (hệ quả của quy tắc R04)
  const { data: lock } = kind === 'chuan-bi'
    ? await admin.from('quiz_locks').select('locked_until')
        .eq('student_id', studentId).eq('ku_id', kuId).maybeSingle()
    : { data: null };
  if (!CHE_DO_KIEM_TRA && lock && new Date(lock.locked_until) > new Date()) {
    return NextResponse.json(
      { error: 'locked', lockedUntil: lock.locked_until,
        message: 'Em cần xem lại học liệu trước khi làm lại. Hãy quay lại sau ít phút.' },
      { status: 423 }
    );
  }

  // ---- chấm bài
  const ids = answers.map((a) => a.questionId);
  // Đọc qua questions_public: câu giáo viên đánh dấu "cần sửa" bị ẩn ở đây giống như ở trang phát đề.
  let assignedQuery=admin.from('questions_public').select('question_id,level').eq('ku_id',kuId);
  if(kind==='chuan-bi')assignedQuery=assignedQuery.lte('level',3);
  const {data:bank,error:assignedError}=await assignedQuery;
  // Truy vấn Supabase: đọc dữ liệu từ bảng mastery_states
  const {data:state,error:stateError}=await admin.from('mastery_states').select('mastery_level').eq('student_id',studentId).eq('ku_id',kuId).maybeSingle();
  if(stateError)return NextResponse.json({error:'Không đọc được mức làm chủ.'},{status:503});
  // Bài vận dụng: chọn lại đúng như trang phát đề (cùng mức làm chủ, cùng ưu tiên lỗi cũ) để xác minh.
  let uuTien = new Map<string, number>();
  if (kind === 'van-dung') {
    try { uuTien = await uuTienLoiCu(admin, studentId, (bank ?? []).map((q) => q.question_id)); }
    catch { return NextResponse.json({ error: 'Không đọc được dữ liệu lỗi cũ.' }, { status: 503 }); }
  }
  const mucThichUng = giamTai
    ? ((state?.mastery_level ?? null) == null ? 0 : Math.max(0, Number(state!.mastery_level) - 1))
    : (state?.mastery_level ?? null);
  const baseAssigned = kind === 'van-dung' ? selectAdaptive(bank ?? [], mucThichUng, uuTien) : chonPhieu(bank ?? [], user.id);
  const assigned = kind === 'van-dung' && giamTai ? baseAssigned.slice(0, 3) : baseAssigned;
  if(assignedError)return NextResponse.json({error:'Không đọc được đề bài.'},{status:503});
  if(!assigned?.length||assigned.length!==ids.length||assigned.some(q=>!ids.includes(q.question_id)))return NextResponse.json({error:'Đề bài đã thay đổi hoặc chưa đầy đủ. Em tải lại trang để làm đề hiện tại.'},{status:400});
  const { data: questions } = await admin
    .from('questions').select('question_id, correct_option, expected_time_sec, level').eq('ku_id', kuId).in('question_id', ids);
  if (new Set(ids).size !== ids.length || !questions || questions.length !== ids.length ||
      questions.some(q => kind === 'chuan-bi' && q.level > 3)) {
    return NextResponse.json({ error: 'Câu hỏi không thuộc bài hoặc cấp độ đang làm.' }, { status: 400 });
  }
  const { data: distractors } = await admin
    .from('distractor_errors').select('question_id, option_key, error_code').in('question_id', ids);

  const qMap = new Map((questions ?? []).map((q) => [q.question_id, q]));
  const dMap = new Map((distractors ?? []).map((d) => [`${d.question_id}|${d.option_key}`, d.error_code]));

  let correctCount = 0;
  let expectedTotal = 0;
  const graded = answers.map((a) => {
    const q = qMap.get(a.questionId);
    const isCorrect = !!q && a.option === q.correct_option;
    if (isCorrect) correctCount++;
    expectedTotal += q?.expected_time_sec ?? 0;
    return {
      question_id: a.questionId,
      chosen_option: a.option,
      is_correct: isCorrect,
      error_code: isCorrect || !a.option ? null : dMap.get(`${a.questionId}|${a.option}`) ?? null,
      answer_time_sec: Math.max(0, Math.round(Number(a.answerTimeSec) || 0))
    };
  });
  const score = Math.round((correctCount / answers.length) * 100) / 10; // thang 10

  // ---- ghi lượt làm
  const { count } = await admin
    .from('quiz_attempts').select('*', { count: 'exact', head: true })
    .eq('student_id', studentId).eq('ku_id', kuId).eq('kind', kind);
  const attemptNo = (count ?? 0) + 1;

  let attempt: { attempt_id: number } | null = null;
  let aErr: any = null;
  if (clientSubmissionId) {
    const resSub = await admin
      .from('quiz_attempts')
      .insert({
        student_id: studentId, ku_id: kuId, attempt_no: attemptNo, score,
        time_on_task_sec: timeOnTaskSec, kind, client_submission_id: clientSubmissionId
      })
      .select('attempt_id').single();
    if (!resSub.error && resSub.data) {
      attempt = resSub.data;
    } else if (resSub.error?.code === '23505') {
      const { data: dup } = await admin
        .from('quiz_attempts').select('attempt_id, attempt_no, score')
        .eq('student_id', studentId).eq('client_submission_id', clientSubmissionId).maybeSingle();
      if (dup) {
        return NextResponse.json({
          duplicate: true, recoverySaved: true, supportAvailable: false,
          score: Number(dup.score), attemptNo: dup.attempt_no, kind,
          thuong: { xp: 0, chiTiet: [], huyHieuMoi: [] },
          mastery: null, masteryStatus: 'measured',
          correctCount: answers.length, total: answers.length, perQuestion: [],
          recommendation: { triggerRule: null, diagnosis: '', action: '', content: null, contentId: null, allTriggered: [] },
          videoCompletionRate: null
        });
      }
    } else {
      const fb = await admin
        .from('quiz_attempts')
        .insert({ student_id: studentId, ku_id: kuId, attempt_no: attemptNo, score, time_on_task_sec: timeOnTaskSec, kind })
        .select('attempt_id').single();
      attempt = fb.data;
      aErr = fb.error;
    }
  } else {
    const resNormal = await admin
      .from('quiz_attempts')
      .insert({ student_id: studentId, ku_id: kuId, attempt_no: attemptNo, score, time_on_task_sec: timeOnTaskSec, kind })
      .select('attempt_id').single();
    attempt = resNormal.data;
    aErr = resNormal.error;
  }
  if (aErr || !attempt) return NextResponse.json({ error: aErr?.message ?? 'Không ghi được' }, { status: 400 });

  // Truy vấn Supabase: thêm bản ghi vào bảng quiz_answers
  await admin.from('quiz_answers').insert(graded.map((g) => ({ ...g, attempt_id: attempt.attempt_id })));

  // ---- ba sự kiện nuôi chỉ số LES
  //
  // Trước đây ba loại này nằm trong danh sách cho phép của /api/events nhưng
  // KHÔNG nơi nào phát ra, nên hai thành phần Assignment và Persistence luôn
  // bằng 0 và LES bị chặn trần ở 65 — không em nào vào nổi nhóm "Tốt".
  //
  // Ghi ở MÁY CHỦ chứ không ở trình duyệt: đây là ba sự kiện suy ra từ kết quả
  // chấm bài, nên trình duyệt không có căn cứ để tự khai, và cũng không nên tự
  // khai được — nếu không thì học sinh bơm thêm lượt "chủ động làm lại" là xong.
  const soCauSaiCoMaLoi = graded.filter((g) => g.error_code).length;
  const suKien: any[] = [];

  // MẪU SỐ của thành phần Kiên trì: em ấy đã nhận một phản hồi CÓ gợi ý sửa.
  // Bài làm đúng hết thì không có phản hồi nào để mà kiên trì với nó.
  if (soCauSaiCoMaLoi > 0) {
    suKien.push({ event_type: 'feedback_with_hint',
      payload: { so_cau_sai_co_ma_loi: soCauSaiCoMaLoi, attempt_no: attemptNo } });
  }
  // TỬ SỐ của thành phần Kiên trì: chủ động làm lại sau khi đã thấy phản hồi.
  // Chỉ tính bài CHUẨN BỊ: làm lại bài vận dụng là bước bắt buộc của vòng lặp
  // thích ứng, không phải hành vi tự nguyện.
  if (kind === 'chuan-bi' && attemptNo > 1) {
    suKien.push({ event_type: 'voluntary_retry', payload: { attempt_no: attemptNo } });
  }
  // Thành phần Bài tập: mỗi đơn vị kiến thức giao đúng MỘT bài vận dụng, nên
  // nộp bài vận dụng lần đầu chính là hoàn thành bài tập được giao của mục đó.
  if (kind === 'van-dung' && attemptNo === 1) {
    suKien.push({ event_type: 'assignment_submit', payload: { score } });
  }
  if (suKien.length) {
    // Truy vấn Supabase: thêm bản ghi vào bảng learning_events
    await admin.from('learning_events').insert(
      suKien.map((e) => ({ student_id: studentId, ku_id: kuId, ...e }))
    );
  }

  // ---- dựng ngữ cảnh cho bộ quy tắc
  const { data: allAttempts } = await admin
    .from('quiz_attempts').select('attempt_id, score, attempt_no')
    .eq('student_id', studentId).eq('ku_id', kuId).eq('kind', kind).order('attempt_no');
  const sameKind = allAttempts ?? [];
  // Điểm bài CHUẨN BỊ: nếu đang nộp bài vận dụng thì phải tra lại lượt chuẩn bị đầu tiên
  let firstQuizScore: number;
  if (kind === 'chuan-bi') {
    firstQuizScore = Number(sameKind[0]?.score ?? score);
  } else {
    const { data: prep } = await admin
      .from('quiz_attempts').select('score, attempt_no')
      .eq('student_id', studentId).eq('ku_id', kuId).eq('kind', 'chuan-bi').order('attempt_no');
    firstQuizScore = Number(prep?.[0]?.score ?? 0);
  }
  // Điểm bài VẬN DỤNG mới nhất — đây là thứ quy tắc R02 cần
  let appliedScore:number|null=null;
  // Truy vấn Supabase: đọc dữ liệu từ bảng quiz_attempts
  const {data:latestApplication}=await admin.from('quiz_attempts').select('attempt_id').eq('student_id',studentId).eq('ku_id',kuId).eq('kind','van-dung').order('submitted_at',{ascending:false}).limit(1);
  if(latestApplication?.[0]){
    // Truy vấn Supabase: đọc dữ liệu từ bảng quiz_answers
    const {data:evidence}=await admin.from('quiz_answers').select('is_correct,questions!inner(level)').eq('attempt_id',latestApplication[0].attempt_id).gte('questions.level',3);
    if(evidence?.length)appliedScore=10*evidence.filter(a=>a.is_correct).length/evidence.length;
  }

  // đếm mã lỗi tích luỹ trên toàn bộ các lượt làm của đơn vị kiến thức này
  const attemptIds = (allAttempts ?? []).map((x) => x.attempt_id);
  const { data: pastAnswers } = await admin
    .from('quiz_answers').select('error_code').in('attempt_id', attemptIds).not('error_code', 'is', null);
  const errorCounts = Object.entries(
    (pastAnswers ?? []).reduce((acc: Record<string, number>, r: any) => {
      acc[r.error_code] = (acc[r.error_code] ?? 0) + 1;
      return acc;
    }, {})
  ).map(([code, cnt]) => ({ code, count: cnt as number }));

  // tỉ lệ hoàn thành video: tính trong SQL (learning_completion) — thời gian xem CÓ TƯƠNG TÁC / thời lượng được giao
  // Đơn vị kiến thức KHÔNG được giao video thì tỉ lệ hoàn thành là null — CHƯA ĐO,
  // khác hẳn "được giao mà chưa xem". Để 0 thì quy tắc R09 nổ oan với mọi mục
  // không có video.
  const {data:coverage}=await supabase.rpc('learning_completion',{p_student:studentId,p_ku:kuId});
  const videoCompletionRate: number | null = coverage?.video_percent == null ? null : coverage.video_percent/100;

  // mastery của đơn vị tiên quyết
  const { data: ku } = await admin
    .from('knowledge_units').select('prerequisite_ku').eq('ku_id', kuId).maybeSingle();
  let prerequisiteMastery: number | null = null;
  if (ku?.prerequisite_ku) {
    const { data: pm } = await admin
      .from('mastery_states').select('mastery_level')
      .eq('student_id', studentId).eq('ku_id', ku.prerequisite_ku).maybeSingle();
    // Chưa có bản ghi mastery nghĩa là CHƯA ĐO, không phải "đã đo và thấy thấp".
    // Để null thì quy tắc R05 không kích hoạt — nếu không, mọi học sinh mới đều bị
    // chẩn đoán "hổng kiến thức nền" chỉ vì chưa từng làm bài ở đơn vị tiên quyết.
    prerequisiteMastery = pm ? pm.mastery_level : null;
  }

  // ---- số ngày không hoạt động (quy tắc R07)
  //
  // Lấy mốc hoạt động gần nhất TRƯỚC request này, xét cả sự kiện học tập lẫn lượt
  // làm bài — chỉ nhìn một trong hai thì em chỉ xem video mà chưa làm bài sẽ bị
  // báo là bỏ cuộc. Chưa từng có hoạt động nào thì để 0: em mới vào hệ thống
  // không phải em bỏ cuộc.
  const [{ data: evTruoc }, { data: luotTruoc }] = await Promise.all([
    admin.from('learning_events').select('ts').eq('student_id', studentId)
      .lt('ts', batDau.toISOString()).order('ts', { ascending: false }).limit(1),
    admin.from('quiz_attempts').select('submitted_at').eq('student_id', studentId)
      .lt('submitted_at', batDau.toISOString())
      .order('submitted_at', { ascending: false }).limit(1)
  ]);
  const mocCuoi = [evTruoc?.[0]?.ts, luotTruoc?.[0]?.submitted_at]
    .filter(Boolean).map((t) => new Date(t as string).getTime());
  const daysInactive = mocCuoi.length
    ? Math.max(0, Math.floor((batDau.getTime() - Math.max(...mocCuoi)) / 86400000))
    : 0;

  // ---- mức làm chủ, TÍNH TRƯỚC bộ quy tắc
  //
  // Thứ tự này là chỗ đã làm R06 thành mã chết: R06 cần mastery nhỏ nhất của cả
  // BÀI, mà mastery của mục vừa làm chỉ có sau khi chấm. Trước đây lời giải tạm là
  // gán cứng `lessonMinMastery: 0`, nghĩa là R06 không bao giờ đúng điều kiện.
  // Nay mastery được tính trước, ghi xuống, rồi mới đọc lại cả bài — còn cờ "nghi
  // đoán mò" lấy thẳng từ `nghiDoanMo` nên không phải chờ `recommend` nữa.
  // One common evaluator for preparation, application and chapter assessments.
  // It ignores unreliable attempts and keeps the latest answer per distinct question.
  const { data: masteryV2, error: masteryError } = await admin.rpc('refresh_mastery_v2', {
    p_student: studentId, p_ku: kuId
  });
  const mastery: number | null = masteryError ? null : masteryV2?.level ?? null;
  // ---- mức làm chủ nhỏ nhất trong các đơn vị kiến thức CÙNG MỘT BÀI (quy tắc R06)
  //
  // Mục nào chưa có bản ghi mastery thì `lessonMinMastery` trả 0, nên R06 không
  // kích hoạt. Đúng như vậy: "đã làm chủ toàn bộ bài" phải có bằng chứng ở TỪNG
  // mục, chưa đo mục nào thì chưa kết luận được cho cả bài.
  const { data: kuBai } = await admin
    .from('knowledge_units').select('ku_id, lesson_id').eq('ku_id', kuId).maybeSingle();
  let kuCungBai: string[] = [kuId];
  if (kuBai?.lesson_id) {
    const { data: ds } = await admin
      .from('knowledge_units').select('ku_id').eq('lesson_id', kuBai.lesson_id);
    if (ds?.length) kuCungBai = ds.map((x) => x.ku_id);
  }
  const { data: msBai } = await admin
    .from('mastery_states').select('ku_id, mastery_level')
    .eq('student_id', studentId).in('ku_id', kuCungBai);
  const masteryTheoKu: Record<string, number> = Object.fromEntries(
    (msBai ?? []).map((m) => [m.ku_id, m.mastery_level])
  );
  if (mastery !== null) masteryTheoKu[kuId] = mastery;   // bản ghi vừa upsert, khỏi phải đọc lại

  // Reassessment uses current preparation evidence; mastery uses recent distinct-question evidence.
  const { data: latestPrep } = await admin.from('quiz_attempts').select('score')
    .eq('student_id', studentId).eq('ku_id', kuId).eq('kind', 'chuan-bi')
    .order('attempt_no', { ascending: false }).limit(1);
  const ctx = {
    studentId,
    kuId,
    videoCompletionRate,
    firstQuizScore: Number(latestPrep?.[0]?.score ?? firstQuizScore),
    appliedScore,                // có giá trị khi học sinh đã làm bài vận dụng
    timeOnTaskSec,
    expectedTimeSec: expectedTotal || null,
    errorCounts,
    prerequisiteMastery,
    lessonMinMastery: lessonMinMastery(masteryTheoKu, kuCungBai),
    daysInactive
  };

  const rec: any = recommend(ctx);

  let daHoanThanhBoTro = false;

  // ---- đóng vòng lặp thích ứng: gợi ý trước đó có tác dụng không? (phép thử T6)
  //
  // ĐIỀU KIỆN ĐÓNG VÒNG đã phải sửa lại, và đây là chỗ đáng giải thích nhất:
  //
  // Bản trước yêu cầu MỌI câu của lượt vận dụng phải từ mức 3 trở lên. Nhưng đề
  // vận dụng do `selectAdaptive` chọn theo mức làm chủ, và em nào mức 0 hoặc
  // chưa đủ dữ liệu thì nhận đề mức 1–2. Hai điều đó cộng lại thành một lỗ hổng
  // im lặng: đúng những em bị R03, R05, R09 — tức là nhóm yếu, nhóm mà cả hệ
  // thống thích ứng sinh ra để phục vụ — không bao giờ đóng được vòng, nên cột
  // "Mức tăng" của bảng T6 vĩnh viễn trống ở đúng chỗ cần đo.
  //
  // Nhưng cũng không thể lấy điểm của một đề toàn câu NHẬN BIẾT làm post_score:
  // so nó với pre_score của bài chuẩn bị (mức 1–3) sẽ báo một mức tăng không có
  // thật. Cách giải quyết: post_score tính TRÊN CÁC CÂU TỪ MỨC 2 TRỞ LÊN của
  // chính lượt này, và chỉ đóng vòng khi có ít nhất 2 câu như vậy. Đề toàn câu
  // mức 1 thì không đóng vòng — đúng, vì nó chưa chứng minh được điều gì.
  const cauDoiChieu = graded.filter((g) => (qMap.get(g.question_id)?.level ?? 0) >= 2);
  if (kind === 'van-dung' && cauDoiChieu.length >= 2) {
    const diemDoiChieu =
      Math.round((10 * cauDoiChieu.filter((g) => g.is_correct).length / cauDoiChieu.length) * 10) / 10;
    const { data: open } = await admin
      .from('recommendations').select('rec_id, pre_score')
      .eq('student_id', studentId).eq('ku_id', kuId).is('post_score', null)
      .order('created_at', { ascending: false }).limit(1);
    if (open?.[0]) {
      // Truy vấn Supabase: đọc dữ liệu từ bảng recommendations
      await admin.from('recommendations')
        .update({ accepted: true, post_score: diemDoiChieu })
        .eq('rec_id', open[0].rec_id);
      daHoanThanhBoTro = true;
      // Ghi lại ĐỀ ĐÃ DÙNG để đóng vòng, nếu không thì mức tăng trong bảng T6
      // không nói được là tăng trên đề khó hay đề dễ.
      await admin.from('learning_events').insert({
        student_id: studentId, ku_id: kuId, event_type: 't6_dong_vong',
        payload: {
          rec_id: open[0].rec_id,
          pre_score: open[0].pre_score,
          post_score: diemDoiChieu,
          so_cau_doi_chieu: cauDoiChieu.length,
          muc_cau: cauDoiChieu.map((g) => qMap.get(g.question_id)?.level ?? null)
        }
      });
    }
  }

  // ---- ghi gợi ý mới (để sau này kiểm chứng quy tắc nào có tác dụng — phép thử T6)
  if (rec.triggerRule) {
    const contentId = rec.payload?.contentId ?? null;
    // Truy vấn Supabase: thêm bản ghi vào bảng recommendations
    await admin.from('recommendations').insert({
      student_id: studentId, ku_id: kuId, trigger_rule: rec.triggerRule,
      diagnosis: rec.diagnosis, action: rec.action,
      recommended_content: contentId, pre_score: score
    });
  }

  // ---- hệ quả của R04: khoá làm lại 30 phút
  if (!CHE_DO_KIEM_TRA && rec.allTriggered.includes('R04')) {
    const until = new Date(Date.now() + (rec.payload?.lockMinutes ?? 30) * 60000).toISOString();
    // Truy vấn Supabase: thêm hoặc cập nhật (upsert) bảng quiz_locks
    await admin.from('quiz_locks').upsert(
      { student_id: studentId, ku_id: kuId, locked_until: until },
      { onConflict: 'student_id,ku_id' }
    );
  }

  // ---- điểm kinh nghiệm và huy hiệu
  // Thưởng HÀNH VI học tập, không thưởng điểm số — xem chú thích đầu lib/dfle/gamification.js
  let thuong: { xp: number; chiTiet: { ly_do: string; diem: number }[]; huyHieuMoi: string[] } =
    { xp: 0, chiTiet: [], huyHieuMoi: [] };
  try {
    // Chuỗi ngày liên tiếp phải đếm theo LỊCH VIỆT NAM. Theo UTC thì em học đều
    // mỗi tối 22h bị tính là học hai lần trong cùng một ngày rồi nghỉ hẳn một
    // ngày — chuỗi đứt oan đúng với nhóm học buổi tối, tức là nhóm đông nhất.
    const homNay = homNayVN();
    const { data: xpRow } = await admin
      .from('student_xp').select('xp, streak_days, last_active_day')
      .eq('student_id', studentId).maybeSingle();
    const streak = capNhatChuoi(xpRow?.last_active_day ?? null, xpRow?.streak_days ?? 0, homNay);

    const { xp, chiTiet } = tinhXp({
      kind,
      attemptNo,
      videoCompletion: videoCompletionRate ?? 0,
      // học sinh tự làm lại bài chuẩn bị sau khi đã nhận phản hồi lần trước
      tuNguyenLamLai: kind === 'chuan-bi' && attemptNo > 1,
      hoanThanhBoTro: daHoanThanhBoTro,
      streakDays: streak
    });

    if (xp > 0) {
      // Truy vấn Supabase: thêm bản ghi vào bảng xp_log
      await admin.from('xp_log').insert(
        chiTiet.map((c: any) => ({ student_id: studentId, ly_do: c.ly_do, diem: c.diem, ku_id: kuId }))
      );
    }
    // Truy vấn Supabase: thêm hoặc cập nhật (upsert) bảng student_xp
    await admin.from('student_xp').upsert(
      { student_id: studentId, xp: (xpRow?.xp ?? 0) + xp, streak_days: streak,
        last_active_day: homNay, updated_at: new Date().toISOString() },
      { onConflict: 'student_id' }
    );

    // ---- xét huy hiệu
    const [{ data: allMastery }, { data: allPrep }, { data: allApplied }, { data: badges }, { data: retries }] =
      await Promise.all([
        admin.from('mastery_states').select('mastery_level').eq('student_id', studentId),
        admin.from('quiz_attempts').select('ku_id').eq('student_id', studentId)
          .eq('kind', 'chuan-bi').eq('attempt_no', 1),
        admin.from('quiz_attempts').select('score').eq('student_id', studentId).eq('kind', 'van-dung'),
        admin.from('student_badges').select('badge_code').eq('student_id', studentId),
        admin.from('quiz_attempts').select('attempt_no').eq('student_id', studentId)
          .eq('kind', 'chuan-bi').gt('attempt_no', 1)
      ]);

    const daCo = (badges ?? []).map((b: any) => b.badge_code);
    const huyHieuMoi = xetHuyHieu({
      soBaiDaChuanBi: (allPrep ?? []).length,
      soLanTuLamLai: (retries ?? []).length,
      streakDays: streak,
      masteryCaoNhat: Math.max(0, ...(allMastery ?? []).map((m: any) => m.mastery_level)),
      duocDeXuatNhomTruong: rec.allTriggered.includes('R06'),
      diemVanDungCaoNhat: Math.max(0, ...(allApplied ?? []).map((a: any) => Number(a.score))),
      daSuaDuocLoiCu: false   // cần so sánh theo thời gian, để dành cho bản sau
    }, daCo);

    if (huyHieuMoi.length) {
      // Truy vấn Supabase: thêm bản ghi vào bảng student_badges
      await admin.from('student_badges').insert(
        huyHieuMoi.map((code: string) => ({ student_id: studentId, badge_code: code }))
      );
    }
    thuong = { xp, chiTiet, huyHieuMoi };
  } catch {
    // Gamification hỏng thì KHÔNG được làm hỏng việc chấm bài — nuốt lỗi có chủ đích.
    // Bảng chưa tạo (chưa chạy 04-gamification-va-do-luong.sql) cũng rơi vào nhánh này.
  }

  // Record observed errors only. Do not invent root causes, theta or post-test gain.
  const observedCodes = [...new Set(graded.filter(g=>!g.is_correct&&g.error_code).map(g=>g.error_code!))];
  let recoverySaved = true;
  if(observedCodes.length){
    // Truy vấn Supabase: thêm hoặc cập nhật (upsert) bảng learning_recovery_records
    const {error: recoveryError}=await admin.from('learning_recovery_records').upsert(observedCodes.map(code=>({
      student_id:studentId,ku_id:kuId,manifest_error:code,target_ku_id:kuId,
      source_attempt_id:attempt.attempt_id,selected_arm:'teacher_queue',status:'detected',
      pre_score:score,teacher_pedagogical_prompt:'Mã lỗi là giả thuyết từ phương án đã chọn. Hãy yêu cầu học sinh giải thích bước làm trước khi quyết định hỗ trợ.'
    })),{onConflict:'source_attempt_id,manifest_error',ignoreDuplicates:true});
    recoverySaved=!recoveryError;
  }
  // Sổ lỗi: mỗi phương án sai có mã lỗi → mục "Cần sửa" (đang chờ ôn hoặc đã nhớ mà sai lại thì mở lại).
  // Hỏng (ví dụ chưa chạy tệp 42) thì không làm hỏng việc chấm bài.
  try {
    await ghiLoiTuBaiLam(admin, studentId, graded.filter(g => !g.is_correct && g.error_code).map(g => g.error_code!), kuId, attempt.attempt_id);
  } catch { /* bỏ qua có chủ đích */ }

  // Chỉ số tự lực (goi_y_su_kien): nếu HS vừa làm lại câu hoặc mã lỗi từng nhận gợi ý trong 48h → chốt kết quả
  try {
    const { capNhatKetQuaGoiY } = await import('@/lib/khkt/ghiGoiYSuKien');
    for (const g of graded) {
      await capNhatKetQuaGoiY(admin, {
        studentId,
        questionId: g.question_id,
        errorCode: g.error_code,
        kuId,
        dung: g.is_correct,
      });
    }
  } catch { /* bỏ qua nếu chưa chạy SQL 56 */ }

  return NextResponse.json({
    recoverySaved,
    supportAvailable: recoverySaved && observedCodes.includes('E-CT-01'),
    score,
    attemptNo,
    kind,
    thuong,
    mastery,
    masteryStatus: masteryError ? "unavailable" : masteryV2?.status ?? "insufficient",
    correctCount,
    total: answers.length,
    perQuestion: graded.map((g) => ({ questionId: g.question_id, isCorrect: g.is_correct })),
    recommendation: {
      triggerRule: rec.triggerRule,
      diagnosis: rec.diagnosis,
      action: rec.action,
      content: rec.payload?.content ?? null,
      // Mã vi bài học, để thẻ kết quả có nút mở thẳng nội dung bổ trợ. Không có
      // trường này thì học sinh chỉ đọc được TÊN vi bài học rồi không biết vào
      // đâu — đúng chỗ vòng lặp thích ứng đứt trước đây.
      contentId: rec.payload?.contentId ?? null,
      allTriggered: rec.allTriggered
    },
    videoCompletionRate: videoCompletionRate === null ? null : Math.round(videoCompletionRate * 100)
  });
}

