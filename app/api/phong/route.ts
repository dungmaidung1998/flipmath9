/**
 * FILE NÀY LÀM GÌ: API máy chủ tiếp nhận yêu cầu từ trình duyệt, kiểm tra quyền và làm việc với cơ sở dữ liệu Supabase / AI.
 * AI DÙNG: máy chủ (API)
 * ĐỊA CHỈ TRÊN WEB: /api/phong
 * LẤY DỮ LIỆU TỪ: profiles, students, phong_trinh_chieu, phong_tra_loi, phong_dap_an, quiz_attempts, quiz_answers, learning_events
 * GỌI TỚI: @/lib/supabase/server, @/lib/soatLoiMayChu
 */
import { NextResponse } from 'next/server';
import { supabaseAdmin, supabaseServer } from '@/lib/supabase/server';
import { ghiLoiTuBaiLam } from '@/lib/soatLoiMayChu';

export const dynamic = 'force-dynamic';

/**
 * Hàm `xacThucHocSinh(không cần tham số)`: xử lý dữ liệu đầu vào và trả kết quả.
 */
async function xacThucHocSinh() {
  const db = supabaseServer();
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  const { data: { user } } = await db.auth.getUser();
  if (!user) return { loi: NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 }) } as const;
  const { data: p } = await db
    .from('profiles')
    .select('student_id, class_id')
    .eq('id', user.id)
    .maybeSingle();
  if (!p?.student_id) {
    return { loi: NextResponse.json({ error: 'Chỉ học sinh mới tham gia trả lời ở đây.' }, { status: 403 }) } as const;
  }
  const { data: st } = await db
    .from('students')
    .select('class_id, display_name')
    .eq('student_id', p.student_id)
    .maybeSingle();
  return {
    studentId: p.student_id as string,
    classId: (st?.class_id ?? p.class_id ?? '') as string,
    displayName: (st?.display_name ?? p.student_id) as string,
  } as const;
}

/**
 * Xử lý HTTP GET: kiểm tra đăng nhập/quyền hạn, đọc dữ liệu và trả về JSON cho trình duyệt.
 */
export async function GET(req: Request) {
  const hs = await xacThucHocSinh();
  if ('loi' in hs) return hs.loi;

  const maPhong = new URL(req.url).searchParams.get('ma')?.trim() ?? '';
  // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
  if (!/^\d{6}$/.test(maPhong)) {
    return NextResponse.json({ error: 'Mã phòng gồm 6 chữ số.' }, { status: 400 });
  }

  const admin = supabaseAdmin();
  const { data: phong, error } = await admin
    .from('phong_trinh_chieu')
    .select('ma_phong, class_id, ku_id, chuong, trang_thai, chi_so_cau, giay_moi_cau, bat_dau_cau_luc, cau_hoi')
    .eq('ma_phong', maPhong)
    .maybeSingle();

  if (error || !phong) {
    return NextResponse.json({ error: 'Không tìm thấy phòng trình chiếu này.' }, { status: 404 });
  }
  if (phong.class_id !== hs.classId) {
    return NextResponse.json({ error: 'Phòng này thuộc lớp khác, em không vào được.' }, { status: 403 });
  }

  const [{ data: myAnswers }, { data: dapAnRow }] = await Promise.all([
    admin
      .from('phong_tra_loi')
      .select('chi_so_cau, nhan_hien_thi, is_correct, diem')
      .eq('ma_phong', maPhong)
      .eq('student_id', hs.studentId),
    phong.trang_thai === 'hien-dap-an' || phong.trang_thai === 'ket-thuc'
      ? admin.from('phong_dap_an').select('dap_an').eq('ma_phong', maPhong).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const chiSo = Number(phong.chi_so_cau ?? 0);
  const daChonHienTai = (myAnswers ?? []).find((a) => Number(a.chi_so_cau) === chiSo) ?? null;
  const tongDiem = (myAnswers ?? []).reduce((s, a) => s + Number(a.diem ?? 0), 0);
  const soCauDung = (myAnswers ?? []).filter((a) => a.is_correct).length;
  const dapAnDung = dapAnRow?.dap_an?.[chiSo]?.correct_nhan ?? null;

  return NextResponse.json({
    maPhong: phong.ma_phong,
    chuong: phong.chuong,
    kuId: phong.ku_id,
    trangThai: phong.trang_thai,
    chiSoCau: chiSo,
    tongCau: Array.isArray(phong.cau_hoi) ? phong.cau_hoi.length : 0,
    giayMoiCau: phong.giay_moi_cau,
    batDauCauLuc: phong.bat_dau_cau_luc,
    daChonHienTai,
    dapAnDung,
    tongDiem,
    soCauDung,
    tenHS: hs.displayName,
  });
}

/**
 * Xử lý HTTP POST: kiểm tra đăng nhập/quyền hạn, nhận dữ liệu mới / xử lý và trả về JSON cho trình duyệt.
 */
export async function POST(req: Request) {
  const hs = await xacThucHocSinh();
  if ('loi' in hs) return hs.loi;

  const b = await req.json().catch(() => null);
  const maPhong = String(b?.maPhong ?? '').trim();
  const chiSoCau = Number(b?.chiSoCau);
  const nhan = String(b?.nhan ?? '').toUpperCase();
  // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
  if (!/^\d{6}$/.test(maPhong) || !Number.isInteger(chiSoCau) || !['A', 'B', 'C', 'D'].includes(nhan)) {
    return NextResponse.json({ error: 'Dữ liệu trả lời không hợp lệ.' }, { status: 400 });
  }

  const admin = supabaseAdmin();
  const [{ data: phong }, { data: dapAnRow }] = await Promise.all([
    admin.from('phong_trinh_chieu').select('*').eq('ma_phong', maPhong).maybeSingle(),
    admin.from('phong_dap_an').select('dap_an').eq('ma_phong', maPhong).maybeSingle(),
  ]);

  if (!phong || phong.class_id !== hs.classId) {
    return NextResponse.json({ error: 'Phòng không tồn tại hoặc không thuộc lớp em.' }, { status: 403 });
  }
  if (phong.trang_thai !== 'dang-hoi' || Number(phong.chi_so_cau) !== chiSoCau) {
    return NextResponse.json({ error: 'Câu hỏi này đã đóng hoặc chưa mở.' }, { status: 409 });
  }

  const cauList = Array.isArray(phong.cau_hoi) ? phong.cau_hoi : [];
  const cau = cauList[chiSoCau];
  const dap = Array.isArray(dapAnRow?.dap_an) ? dapAnRow.dap_an[chiSoCau] : null;
  if (!cau || !dap) {
    return NextResponse.json({ error: 'Không tìm thấy câu hỏi hiện tại.' }, { status: 404 });
  }

  const opt = (cau.options ?? []).find((o: any) => o.nhan === nhan);
  if (!opt) {
    return NextResponse.json({ error: 'Phương án không hợp lệ.' }, { status: 400 });
  }

  const chosenOption = String(opt.option_key);
  const isCorrect = chosenOption === String(dap.correct_option);
  const errorCode = !isCorrect ? (dap.error_map?.[chosenOption] ?? null) : null;

  const startMs = phong.bat_dau_cau_luc ? new Date(phong.bat_dau_cau_luc).getTime() : Date.now();
  // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
  const thoiGianMs = Math.max(0, Date.now() - startMs);
  // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
  const tongMs = Math.max(1000, Number(phong.giay_moi_cau ?? 30) * 1000);
  // Hết giờ (cho dư 2 giây vì mạng chậm) thì không nhận trả lời nữa, kể cả khi thầy cô chưa bấm đóng câu
  if (thoiGianMs > tongMs + 2000) {
    return NextResponse.json({ error: 'Hết giờ trả lời câu này rồi.' }, { status: 409 });
  }
  // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
  const tiLeConLai = Math.max(0, Math.min(1, 1 - thoiGianMs / tongMs));
  // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
  const diem = isCorrect ? Math.round(500 + 500 * tiLeConLai) : 0;

  // Truy vấn Supabase: thêm bản ghi vào bảng phong_tra_loi
  const { error: insErr } = await admin.from('phong_tra_loi').insert({
    ma_phong: maPhong,
    student_id: hs.studentId,
    chi_so_cau: chiSoCau,
    question_id: cau.question_id,
    chosen_option: chosenOption,
    nhan_hien_thi: nhan,
    is_correct: isCorrect,
    error_code: errorCode,
    diem,
    thoi_gian_ms: thoiGianMs,
  });

  if (insErr) {
    return NextResponse.json({ error: 'Em đã trả lời câu này rồi.' }, { status: 409 });
  }

  // Đồng bộ vào quiz_attempts + quiz_answers + learning_events (event_type: 'trinh_chieu')
  // và Sổ lỗi (ghiLoiTuBaiLam)
  const kuCau = String(cau.ku_id || phong.ku_id);
  const subKey = `trinh-chieu:${maPhong}:${kuCau}`;
  let attemptId: number | null = null;

  try {
    const { data: existingAtt } = await admin
      .from('quiz_attempts')
      .select('attempt_id')
      .eq('student_id', hs.studentId)
      .eq('client_submission_id', subKey)
      .maybeSingle();

    if (existingAtt?.attempt_id) {
      attemptId = existingAtt.attempt_id;
    } else {
      const { count } = await admin
        .from('quiz_attempts')
        .select('*', { count: 'exact', head: true })
        .eq('student_id', hs.studentId)
        .eq('ku_id', kuCau)
        .eq('kind', 'trinh-chieu');
      const attemptNo = (count ?? 0) + 1;
      const resAtt = await admin
        .from('quiz_attempts')
        .insert({
          student_id: hs.studentId,
          ku_id: kuCau,
          attempt_no: attemptNo,
          score: isCorrect ? 10 : 0,
          time_on_task_sec: Math.round(thoiGianMs / 1000),
          kind: 'trinh-chieu',
          nguon: 'trinh-chieu',
          client_submission_id: subKey,
        })
        .select('attempt_id')
        .single();
      // Chưa chạy file 53 (chưa có loại 'trinh-chieu') thì KHÔNG ghi thành bài 'chuan-bi':
      // ghi nhầm sẽ làm sai điểm chuẩn bị, quy tắc R04 và điểm chăm chỉ. Khi đó chỉ ghi sự kiện bên dưới.
      attemptId = resAtt.data?.attempt_id ?? null;
    }

    if (attemptId) {
      // Truy vấn Supabase: thêm hoặc cập nhật (upsert) bảng quiz_answers
      await admin.from('quiz_answers').upsert(
        {
          attempt_id: attemptId,
          question_id: cau.question_id,
          chosen_option: chosenOption,
          is_correct: isCorrect,
          error_code: errorCode,
          answer_time_sec: Math.round(thoiGianMs / 1000),
        },
        { onConflict: 'attempt_id,question_id' }
      );
      const { data: allAns } = await admin
        .from('quiz_answers')
        .select('is_correct, answer_time_sec')
        .eq('attempt_id', attemptId);
      if (allAns?.length) {
        const sc = Math.round((allAns.filter((x) => x.is_correct).length * 100) / allAns.length) / 10;
        const totSec = allAns.reduce((s, x) => s + Number(x.answer_time_sec ?? 0), 0);
        await admin
          .from('quiz_attempts')
          .update({ score: sc, time_on_task_sec: totSec })
          .eq('attempt_id', attemptId);
      }
    }
  } catch {
    /* bảo đảm trả lời phòng trình chiếu không bị lỗi nếu bảng cũ chưa nâng cấp */
  }

  await admin
    .from('learning_events')
    .insert({
      student_id: hs.studentId,
      ku_id: kuCau,
      event_type: 'trinh_chieu',
      duration_active_sec: Math.round(thoiGianMs / 1000),
      payload: {
        ma_phong: maPhong,
        question_id: cau.question_id,
        chosen_option: chosenOption,
        is_correct: isCorrect,
        error_code: errorCode,
      },
    })
    .then(() => {}, () => {});

  if (errorCode) {
    try {
      await ghiLoiTuBaiLam(admin, hs.studentId, [errorCode], kuCau, attemptId);
    } catch {
      /* bỏ qua có chủ đích */
    }
  }

  return NextResponse.json({ ok: true, daGhiNhan: true, nhan });
}
