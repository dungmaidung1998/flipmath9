/**
 * FILE NÀY LÀM GÌ: API máy chủ tiếp nhận yêu cầu từ trình duyệt, kiểm tra quyền và làm việc với cơ sở dữ liệu Supabase / AI.
 * AI DÙNG: máy chủ (API)
 * ĐỊA CHỈ TRÊN WEB: /api/de-kiem-tra
 * LẤY DỮ LIỆU TỪ: profiles, students, de_kiem_tra, de_kiem_tra_lam, learning_events, error_dictionary
 * GỌI TỚI: @/lib/supabase/server, @/lib/tronPhuongAn, @/lib/soatLoiMayChu, @/lib/khkt/deKiemTra
 */
import { NextResponse } from 'next/server';
import { supabaseAdmin, supabaseServer } from '@/lib/supabase/server';
import { tronPhuongAn } from '@/lib/tronPhuongAn';
import { ghiLoiTuBaiLam } from '@/lib/soatLoiMayChu';
import type { CauDeKiemTra } from '@/lib/khkt/deKiemTra';

export const dynamic = 'force-dynamic';

/**
 * Hàm `xacThucHS(không cần tham số)`: xử lý dữ liệu đầu vào và trả kết quả.
 */
async function xacThucHS() {
  const db = supabaseServer();
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  const { data: { user } } = await db.auth.getUser();
  if (!user) return { loi: NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 }) } as const;
  const { data: prof } = await db
    .from('profiles')
    .select('student_id, role, class_id')
    .eq('id', user.id)
    .maybeSingle();
  if (!prof?.student_id) {
    return { loi: NextResponse.json({ error: 'Tài khoản không gắn với học sinh nào' }, { status: 403 }) } as const;
  }
  const { data: st } = await db
    .from('students')
    .select('class_id')
    .eq('student_id', prof.student_id)
    .maybeSingle();
  return {
    studentId: prof.student_id as string,
    classId: (st?.class_id ?? prof.class_id ?? '') as string,
  } as const;
}

/**
 * Xử lý HTTP GET: kiểm tra đăng nhập/quyền hạn, đọc dữ liệu và trả về JSON cho trình duyệt.
 */
export async function GET() {
  const hs = await xacThucHS();
  if ('loi' in hs) return hs.loi;
  if (!hs.classId) return NextResponse.json({ deList: [], lichSu: [] });

  const admin = supabaseAdmin();
  const [{ data: deRows, error }, { data: lsRows }] = await Promise.all([
    admin
      .from('de_kiem_tra')
      .select('id, chuong, tieu_de, thoi_gian_phut, cau_hoi, tao_luc')
      .eq('class_id', hs.classId)
      .eq('cho_lam_thu', true)
      .order('tao_luc', { ascending: false })
      .limit(15),
    admin
      .from('de_kiem_tra_lam')
      .select('id, de_id, diem, so_dung, tong_cau, nop_luc')
      .eq('student_id', hs.studentId)
      .order('nop_luc', { ascending: false })
      .limit(20),
  ]);

  if (error) {
    return NextResponse.json({ deList: [], lichSu: [], chuaCoBang: true });
  }

  // Tuyệt đối cắt bỏ correct_option và error_map trước khi trả về học sinh
  const deList = (deRows ?? []).map((d: any) => ({
    id: d.id,
    chuong: d.chuong,
    tieu_de: d.tieu_de,
    thoi_gian_phut: d.thoi_gian_phut,
    tao_luc: d.tao_luc,
    cau_hoi: ((d.cau_hoi ?? []) as CauDeKiemTra[]).map((q) => ({
      question_id: q.question_id,
      ku_id: q.ku_id,
      level: q.level,
      stem: q.stem,
      hinh: q.hinh ?? null,
      options: tronPhuongAn(q.options ?? [], hs.studentId, q.question_id).map((o) => ({
        option_key: o.option_key,
        option_text: o.option_text,
        nhan: o.nhan,
      })),
    })),
  }));

  return NextResponse.json({ deList, lichSu: lsRows ?? [] });
}

/**
 * Xử lý HTTP POST: kiểm tra đăng nhập/quyền hạn, nhận dữ liệu mới / xử lý và trả về JSON cho trình duyệt.
 */
export async function POST(req: Request) {
  const hs = await xacThucHS();
  if ('loi' in hs) return hs.loi;

  const body = await req.json().catch(() => null);
  const deId = String(body?.deId ?? '');
  const answers = body?.answers && typeof body.answers === 'object' ? (body.answers as Record<string, string>) : null;
  // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
  const thoiGianGiay = Math.max(0, Math.round(Number(body?.thoiGianGiay) || 0));
  if (!deId || !answers) {
    return NextResponse.json({ error: 'Thiếu dữ liệu bài nộp.' }, { status: 400 });
  }

  const admin = supabaseAdmin();
  const { data: de, error } = await admin
    .from('de_kiem_tra')
    .select('id, class_id, chuong, ku_ids, cau_hoi, cho_lam_thu')
    .eq('id', deId)
    .maybeSingle();
  if (error || !de) return NextResponse.json({ error: 'Không tìm thấy đề kiểm tra.' }, { status: 404 });
  if (de.class_id !== hs.classId || !de.cho_lam_thu) {
    return NextResponse.json({ error: 'Đề này hiện không mở cho lớp em.' }, { status: 403 });
  }

  const cauList = (de.cau_hoi ?? []) as CauDeKiemTra[];
  let soDung = 0;
  const maLoiSai: string[] = [];
  const chiTiet = cauList.map((q) => {
    const chon = answers[q.question_id] ?? null;
    const dung = chon !== null && chon === q.correct_option;
    if (dung) soDung++;
    const errCode = !dung && chon ? q.error_map?.[chon] ?? null : null;
    if (errCode) maLoiSai.push(errCode);
    return {
      question_id: q.question_id,
      ku_id: q.ku_id,
      chosen_option: chon,
      correct_option: q.correct_option,
      is_correct: dung,
      error_code: errCode,
    };
  });

  const diem = cauList.length ? Math.round((soDung * 100) / cauList.length) / 10 : 0;

  // Truy vấn Supabase: thêm bản ghi vào bảng de_kiem_tra_lam
  await admin.from('de_kiem_tra_lam').insert({
    de_id: de.id,
    student_id: hs.studentId,
    class_id: hs.classId,
    tra_loi: chiTiet,
    diem,
    so_dung: soDung,
    tong_cau: cauList.length,
    thoi_gian_giay: thoiGianGiay,
  });

  const kuDaiDien = cauList[0]?.ku_id ?? de.ku_ids?.[0] ?? `${de.chuong}-B1-M1`;
  await admin
    .from('learning_events')
    .insert({
      student_id: hs.studentId,
      ku_id: kuDaiDien,
      event_type: 'de_kiem_tra_thu',
      duration_active_sec: thoiGianGiay,
      payload: { de_id: de.id, diem, so_dung: soDung, tong_cau: cauList.length },
    })
    .then(() => {}, () => {});

  // Đẩy mã lỗi sai (nếu có) vào Sổ lỗi theo đúng luồng hiện có
  if (maLoiSai.length) {
    try {
      await ghiLoiTuBaiLam(admin, hs.studentId, maLoiSai, kuDaiDien, null);
    } catch {
      /* không làm hỏng chấm bài */
    }
  }

  // Đọc mô tả lỗi để trả về học sinh tự xem lại
  const uniqueCodes = Array.from(new Set(maLoiSai));
  const { data: dict } = uniqueCodes.length
    ? await admin.from('error_dictionary').select('error_code, misconception').in('error_code', uniqueCodes)
    : { data: [] as any[] };
  const dictMap = new Map((dict ?? []).map((x) => [x.error_code, x.misconception as string]));

  return NextResponse.json({
    ok: true,
    diem,
    soDung,
    tongCau: cauList.length,
    chiTiet: chiTiet.map((c) => ({
      ...c,
      moTaLoi: c.error_code ? dictMap.get(c.error_code) ?? null : null,
    })),
  });
}
