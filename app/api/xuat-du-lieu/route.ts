/**
 * FILE NÀY LÀM GÌ: API máy chủ tiếp nhận yêu cầu từ trình duyệt, kiểm tra quyền và làm việc với cơ sở dữ liệu Supabase / AI.
 * AI DÙNG: máy chủ (API)
 * ĐỊA CHỈ TRÊN WEB: /api/xuat-du-lieu
 * LẤY DỮ LIỆU TỪ: profiles, students, recommendations, quiz_attempts, quiz_answers, student_errors, soat_loi_luot, soat_loi_tra_loi
 * GỌI TỚI: @/lib/supabase/server, @/lib/mucHoatDong, @/lib/fasDuLieu, @/lib/gv/lopCuaToi, @/lib/dfle/les.js, @/lib/dfle/ngay.js
 */
import { supabaseServer } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { khungTuan, ngayVN } from '@/lib/mucHoatDong';
import { taiFas } from '@/lib/fasDuLieu';
import { laVaiTroGV, lopCuaToi } from '@/lib/gv/lopCuaToi';
// @ts-ignore — dùng chung công thức với gói dfle-engine
import { componentScores, les, quartileCutoffs, classify, FIXED_CUTOFFS, WEIGHTS_V1 } from '@/lib/dfle/les.js';
// @ts-ignore
import { homNayVN } from '@/lib/dfle/ngay.js';

export const dynamic = 'force-dynamic';

/**
 * XUẤT DỮ LIỆU NGHIÊN CỨU
 *
 * Năm tệp CSV, tất cả đều ẩn danh: khoá là mã nghiên cứu, không có họ tên, không
 * có email. Bảng nối mã với danh tính do người hướng dẫn giữ ngoài hệ thống.
 *
 * ĐIỀU KIỆN BẮT BUỘC: chỉ xuất dữ liệu của học sinh có consent_status = 'dong-y'.
 * Đây là cam kết trong Phiếu 4 được thực thi bằng mã, không phải bằng lời hứa —
 * người hướng dẫn có bấm nhầm cũng không lấy ra được dữ liệu của em chưa đồng thuận.
 */

const esc = (v: unknown) => {
  const s = v === null || v === undefined ? '' : String(v);
  // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const toCsv = (headers: string[], rows: any[][]) =>
  '﻿' + [headers.join(','), ...rows.map((r) => r.map(esc).join(','))].join('\n') + '\n';

/**
 * ĐỌC HẾT, KHÔNG ĐỌC 1000 DÒNG ĐẦU.
 *
 * Supabase trả tối đa 1000 dòng mỗi truy vấn và KHÔNG báo lỗi khi cắt bớt —
 * `.limit(50000)` cũng không vượt qua được, vì trần đó đặt ở phía máy chủ. Với
 * một tệp xuất dữ liệu nghiên cứu thì đây là lỗi nặng nhất có thể có: tệp vẫn
 * mở được, vẫn có số, chỉ thiếu mất phần đuôi mà không ai biết.
 *
 * Hàm này lấy từng trang 1000 dòng cho tới khi hết. Trang cuối ngắn hơn 1000
 * dòng là dấu hiệu đã hết dữ liệu.
 */
const TRANG = 1000;
/**
 * Hàm `docHet(taoTruyVan)`: nạp/truy xuất dữ liệu từ CSDL hoặc bộ nhớ.
 */
async function docHet<T = any>(taoTruyVan: (tu: number, den: number) => any): Promise<T[]> {
  const tatCa: T[] = [];
  for (let tu = 0; ; tu += TRANG) {
    const { data, error } = await taoTruyVan(tu, tu + TRANG - 1);
    if (error || !data?.length) break;
    tatCa.push(...(data as T[]));
    if (data.length < TRANG) break;
  }
  return tatCa;
}

const csvResponse = (name: string, body: string) =>
  new NextResponse(body, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${name}"`
    }
  });

/**
 * Xử lý HTTP GET: kiểm tra đăng nhập/quyền hạn, đọc dữ liệu và trả về JSON cho trình duyệt.
 */
export async function GET(req: Request) {
  const supabase = supabaseServer();
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).maybeSingle();
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  if (!laVaiTroGV(profile?.role)) {
    return NextResponse.json({ error: 'Chỉ giáo viên mới xuất được dữ liệu' }, { status: 403 });
  }

  const url = new URL(req.url);
  const loai = url.searchParams.get('loai') ?? 'phan-tich';
  const classId = url.searchParams.get('lop');
  // đợt đo dùng cho bốn cột M1, M2, M3, Y của tệp phân tích
  const wave = ['pre', 'post', 'followup'].includes(url.searchParams.get('dot') ?? '')
    ? (url.searchParams.get('dot') as string) : 'post';

  const classes = await lopCuaToi(supabase);

  // ------------------------------------------------ so sánh các lớp (CSV/Excel BOM)
  if (loai === 'so-sanh-lop') {
    const tuParam = url.searchParams.get('tu');
    // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
    const tuNgay = tuParam && /^\d{4}-\d{2}-\d{2}$/.test(tuParam)
      ? tuParam
      : new Date(Date.now() - 28 * 86400_000 + 7 * 3600_000).toISOString().slice(0, 10);
    const { data: tk, error: tkErr } = await supabase.rpc('thong_ke_lop', { p_tu: tuNgay });
    if (tkErr) {
      return NextResponse.json({ error: 'Chưa có thống kê lớp. Kiểm tra đã chạy file 51-phan-cap-truong-gv-lop.sql chưa.' }, { status: 503 });
    }
    const truongCua = new Map(classes.map((c) => [c.class_id, c.ten_truong ?? c.school_id ?? '']));
    const vaiTroCua = new Map(classes.map((c) => [c.class_id, c.vai_tro ?? '']));
    // Xử lý mốc ngày giờ theo múi giờ Việt Nam (UTC+7)
    const today = homNayVN();
    return csvResponse(`so-sanh-lop-${today}.csv`, toCsv(
      ['class_id', 'ten_lop', 'truong', 'vai_tro', 'so_hs', 'hs_hoat_dong', 'ti_le_lam_chu_pct', 'muc_tb', 'loi_dang_mo', 'loi_da_nho', 'phut_hoc', 'tu_ngay'],
      (tk ?? []).map((r: any) => [
        r.class_id,
        r.ten_lop,
        truongCua.get(r.class_id) ?? '',
        vaiTroCua.get(r.class_id) ?? '',
        r.so_hs ?? 0,
        r.hs_hoat_dong ?? 0,
        r.ti_le_lam_chu ?? '',
        r.muc_tb ?? '',
        r.loi_dang_mo ?? 0,
        r.loi_da_nho ?? 0,
        r.phut_hoc ?? 0,
        tuNgay
      ])
    ));
  }

  // Chỉ lớp thực nghiệm và đối chứng. Lớp mang nhóm 'DEMO' là lớp dữ liệu mô
  // phỏng dùng để xem thử bảng điều khiển — dữ liệu ở đó KHÔNG BAO GIỜ được đi
  // vào tệp phân tích. Đây là lớp chắn thứ hai; lớp thứ nhất là trạng thái đồng
  // thuận, mà học sinh mô phỏng không có.
  const allowed = classes
    .filter((c) => c.arm === 'TN' || c.arm === 'DC')
    .filter((c) => !classId || classId === 'tat-ca' || c.class_id === classId);
  if (!allowed.length) return NextResponse.json({ error: 'Không có lớp nào' }, { status: 404 });
  const armOf = new Map(allowed.map((c) => [c.class_id, c.arm]));

  // ---- CHỈ học sinh đã đồng thuận
  const { data: students } = await supabase
    .from('students')
    .select('student_id, class_id, gender, baseline_math, device_type, internet_access')
    .in('class_id', allowed.map((c) => c.class_id))
    .eq('consent_status', 'dong-y');

  const ids = (students ?? []).map((s) => s.student_id);
  if (!ids.length) {
    return csvResponse('khong-co-du-lieu.csv',
      toCsv(['ghi_chu'], [['Chưa có học sinh nào ở trạng thái đã đồng thuận tham gia']]));
  }
  // Tên tệp mang ngày THEO LỊCH VIỆT NAM — xem chú thích đầu lib/dfle/ngay.js
  const today = homNayVN();

  // ---------------------------------------------------------------- gợi ý (T6)
  if (loai === 'goi-y') {
    const recs = await docHet((tu, den) => supabase
      .from('recommendations')
      .select('student_id, ku_id, trigger_rule, recommended_content, created_at, accepted, pre_score, post_score')
      .in('student_id', ids).order('created_at').range(tu, den));
    return csvResponse(`goi-y-T6-${today}.csv`, toCsv(
      ['student_id', 'ku_id', 'trigger_rule', 'recommended_content', 'created_at', 'accepted', 'pre_score', 'post_score', 'muc_tang'],
      recs.map((r: any) => [
        r.student_id, r.ku_id, r.trigger_rule, r.recommended_content, r.created_at,
        r.accepted, r.pre_score, r.post_score,
        r.post_score !== null && r.pre_score !== null
          ? (Number(r.post_score) - Number(r.pre_score)).toFixed(2) : ''
      ])
    ));
  }

  // ----------------------------------------- lỗi sai ở lần làm bài chuẩn bị đầu tiên
  // Dùng cho biểu đồ "mã lỗi phổ biến nhất" trong hồ sơ EEAI. Chỉ lần làm thứ nhất
  // (attempt_no = 1): đó là bức tranh trước tiết học mà giáo viên dùng để quyết định.
  if (loai === 'loi-sai') {
    const att = await docHet((tu, den) => supabase
      .from('quiz_attempts')
      .select('attempt_id, student_id, ku_id, attempt_no, submitted_at')
      .in('student_id', ids).eq('attempt_no', 1).order('attempt_id').range(tu, den));
    const attOf = new Map(att.map((a: any) => [a.attempt_id, a]));
    const ans: any[] = [];
    const attIds = att.map((a: any) => a.attempt_id);
    for (let i = 0; i < attIds.length; i += 200) {
      const lo = attIds.slice(i, i + 200);
      ans.push(...await docHet((tu, den) => supabase
        .from('quiz_answers')
        .select('attempt_id, question_id, is_correct, error_code')
        .in('attempt_id', lo).order('attempt_id').range(tu, den)));
    }
    return csvResponse(`loi-sai-lan-dau-${today}.csv`, toCsv(
      ['student_id', 'arm', 'ku_id', 'submitted_at', 'question_id', 'is_correct', 'error_code'],
      ans.map((r: any) => {
        const a: any = attOf.get(r.attempt_id);
        return [a.student_id, armOf.get((students ?? []).find((s) => s.student_id === a.student_id)?.class_id ?? '') ?? '',
          a.ku_id, a.submitted_at, r.question_id, r.is_correct, r.error_code ?? ''];
      })
    ));
  }

  // ------------------------------------------------- sổ lỗi, soát lỗi, ôn ngắt quãng (tệp 42)
  const thieu42 = () => NextResponse.json({ error: 'Chưa chạy supabase/42-soat-loi-va-on-ngat-quang.sql — chưa có bảng sổ lỗi để xuất.' }, { status: 503 });
  const armCuaHS = new Map((students ?? []).map((s) => [s.student_id, armOf.get(s.class_id) ?? '']));

  // Trạng thái hiện tại của từng mã lỗi ở từng học sinh.
  if (loai === 'so-loi') {
    // Truy vấn Supabase: đọc dữ liệu từ bảng student_errors
    const { error: e0 } = await supabase.from('student_errors').select('student_id').limit(1);
    if (e0) return thieu42();
    // Truy vấn Supabase: đọc dữ liệu từ bảng student_errors
    const rows = await docHet((tu, den) => supabase.from('student_errors')
      .select('student_id, error_code, trang_thai, han_on, so_lan_sai, tai_phat, lan_sai_dau, lan_sai_cuoi, ku_goc')
      .in('student_id', ids).order('student_id').order('error_code').range(tu, den));
    return csvResponse(`so-loi-${today}.csv`, toCsv(
      ['student_id', 'arm', 'error_code', 'ku_goc', 'trang_thai', 'han_on', 'so_lan_sai', 'tai_phat', 'lan_sai_dau', 'lan_sai_cuoi'],
      rows.map((r: any) => [r.student_id, armCuaHS.get(r.student_id), r.error_code, r.ku_goc ?? '', r.trang_thai, r.han_on ?? '', r.so_lan_sai, r.tai_phat, r.lan_sai_dau, r.lan_sai_cuoi])
    ));
  }

  // Từng câu trả lời ở các lượt soát lỗi / ôn ngắt quãng — số liệu chính để đo "lỗi cũ có còn không sau khoảng chờ".
  if (loai === 'soat-loi') {
    // Truy vấn Supabase: đọc dữ liệu từ bảng soat_loi_luot
    const luot = await docHet((tu, den) => supabase.from('soat_loi_luot')
      .select('luot_id, student_id, ku_id, ngay, cau, tao_luc, nop_luc').in('student_id', ids).not('nop_luc', 'is', null).order('luot_id').range(tu, den));
    if (!luot.length) {
      // Truy vấn Supabase: đọc dữ liệu từ bảng soat_loi_luot
      const { error: e0 } = await supabase.from('soat_loi_luot').select('luot_id').limit(1);
      if (e0) return thieu42();
    }
    const luotOf = new Map(luot.map((l: any) => [l.luot_id, l]));
    const tl: any[] = [];
    const lids = luot.map((l: any) => l.luot_id);
    for (let i = 0; i < lids.length; i += 200) {
      const lo = lids.slice(i, i + 200);
      // Truy vấn Supabase: đọc dữ liệu từ bảng soat_loi_tra_loi
      tl.push(...await docHet((tu, den) => supabase.from('soat_loi_tra_loi')
        .select('luot_id, question_id, error_code, chosen_option, is_correct, answer_time_sec').in('luot_id', lo).order('luot_id').order('question_id').range(tu, den)));
    }
    return csvResponse(`soat-loi-${today}.csv`, toCsv(
      ['student_id', 'arm', 'luot_id', 'ngay', 'ku_dang_hoc', 'nop_luc', 'error_code', 'loai', 'question_id', 'is_correct', 'answer_time_sec'],
      tl.map((r: any) => {
        const l: any = luotOf.get(r.luot_id);
        const loaiCau = ((l.cau ?? []) as any[]).find((c) => c.question_id === r.question_id)?.loai ?? '';
        return [l.student_id, armCuaHS.get(l.student_id), r.luot_id, l.ngay, l.ku_id ?? '', l.nop_luc, r.error_code, loaiCau, r.question_id, r.is_correct, r.answer_time_sec ?? ''];
      })
    ));
  }

  // Lịch sử chuyển trạng thái từng lỗi: mở, chờ ôn lần 1, lần 2, đã nhớ, tái diễn.
  if (loai === 'lich-su-loi') {
    // Truy vấn Supabase: đọc dữ liệu từ bảng student_error_log
    const { error: e0 } = await supabase.from('student_error_log').select('id').limit(1);
    if (e0) return thieu42();
    // Truy vấn Supabase: đọc dữ liệu từ bảng student_error_log
    const rows = await docHet((tu, den) => supabase.from('student_error_log')
      .select('id, student_id, error_code, tu, den, ly_do, ts').in('student_id', ids).order('id').range(tu, den));
    return csvResponse(`lich-su-loi-${today}.csv`, toCsv(
      ['student_id', 'arm', 'error_code', 'tu', 'den', 'ly_do', 'ts'],
      rows.map((r: any) => [r.student_id, armCuaHS.get(r.student_id), r.error_code, r.tu ?? '', r.den, r.ly_do, r.ts])
    ));
  }

  // Chỉ số năng động FAS theo tuần, 8 tuần gần nhất (SPEC M11.1).
  if (loai === 'fas') {
    const rows: any[][] = [];
    const theoLop = new Map<string, string[]>();
    for (const s of students ?? []) (theoLop.get(s.class_id) ?? theoLop.set(s.class_id, []).get(s.class_id)!).push(s.student_id);
    for (let lui = 7; lui >= 0; lui--) {
      const t = khungTuan(Date.now(), lui);
      for (const dsLop of theoLop.values()) {
        // FAS cần cả lớp để xác định "mục lớp đang học"; ở đây chỉ có học sinh đã đồng thuận, ghi rõ trong mô tả tệp.
        const kq = await taiFas(supabase, dsLop, t.tu, t.den);
        // Xử lý mốc ngày giờ theo múi giờ Việt Nam (UTC+7)
        for (const [sid, f] of kq) rows.push([sid, armCuaHS.get(sid), ngayVN(t.tu), f.fas, f.nhom,
          f.P == null ? '' : f.P.toFixed(3), f.L.toFixed(3), f.T.toFixed(3), f.R.toFixed(3), f.K.toFixed(3), f.E.toFixed(3), f.ngay, f.cauTraLoi, f.diemPhieu ?? '', f.khuya]);
      }
    }
    return csvResponse(`weekly-fas-${today}.csv`, toCsv(
      ['student_id', 'arm', 'tuan_bat_dau', 'fas', 'nhom', 'P', 'L', 'T', 'R', 'K', 'E', 'ngay_hoat_dong', 'cau_tra_loi', 'diem_phieu_tb', 'lan_hoc_khuya'], rows));
  }

  // Tự đánh giá mức hiểu sau mỗi mục. KHÔNG xuất nội dung câu hỏi tự do của học sinh (có thể chứa tên riêng).
  if (loai === 'tu-danh-gia') {
    // Truy vấn Supabase: đọc dữ liệu từ bảng learning_events
    const ev = await docHet((tu, den) => supabase.from('learning_events')
      .select('student_id, ku_id, ts, payload').in('student_id', ids).eq('event_type', 'tu_danh_gia').order('ts').range(tu, den));
    return csvResponse(`tu-danh-gia-${today}.csv`, toCsv(
      ['student_id', 'arm', 'ku_id', 'ts', 'muc_hieu', 'co_cau_hoi'],
      ev.map((e: any) => [e.student_id, armCuaHS.get(e.student_id), e.ku_id, e.ts, e.payload?.muc ?? '', e.payload?.cau_hoi ? 1 : 0])
    ));
  }

  // ------------------------------------------------------------ sự kiện thô
  if (loai === 'su-kien') {
    const ev = await docHet((tu, den) => supabase
      .from('learning_events')
      .select('student_id, ku_id, event_type, ts, duration_active_sec')
      .in('student_id', ids).order('ts').range(tu, den));
    return csvResponse(`su-kien-hoc-tap-${today}.csv`, toCsv(
      ['student_id', 'ku_id', 'event_type', 'ts', 'duration_active_sec'],
      ev.map((e: any) => [e.student_id, e.ku_id, e.event_type, e.ts, e.duration_active_sec])
    ));
  }

  // ------------------------------- tính LES dùng chung công thức với bản CLI
  //
  // Số liệu thô đã được cộng sẵn ở view les_tong_hop (supabase/15-...sql): một
  // dòng mỗi học sinh, ngày tính theo giờ Việt Nam. Bản cũ tải toàn bộ
  // learning_events của cả khối về rồi mới cộng — vượt trần 1000 dòng từ tuần
  // thứ hai, và tệp xuất ra vẫn trông bình thường.
  const [tongHopRes, videoRes] = await Promise.all([
    supabase.from('les_tong_hop').select('*').in('class_id', allowed.map((c) => c.class_id)),
    supabase.from('contents').select('duration_sec').eq('kind', 'video')
  ]);
  if (tongHopRes.error) {
    return NextResponse.json({
      error: 'Chưa chạy supabase/15-view-tong-hop-va-lich-su.sql — chưa có bảng tổng hợp để xuất dữ liệu.',
      chiTiet: tongHopRes.error.message
    }, { status: 503 });
  }
  const tongHopOf = new Map((tongHopRes.data ?? []).map((t: any) => [t.student_id, t]));

  // Truy vấn Supabase: đọc dữ liệu từ bảng quiz_attempts
  const attempts = await docHet((tu, den) => supabase.from('quiz_attempts')
    .select('student_id, ku_id, score, attempt_no, kind').in('student_id', ids).range(tu, den));
  // Truy vấn Supabase: đọc dữ liệu từ bảng mastery_states
  const mastery = await docHet((tu, den) => supabase.from('mastery_states')
    .select('student_id, ku_id, mastery_level').in('student_id', ids).range(tu, den));

  // MẪU SỐ của thành phần Video: tử số cộng trên MỌI mục, nên mẫu số cũng phải
  // là tổng thời lượng của những mục em ấy đã bắt đầu, không phải một hằng số
  // 480 giây. Hằng số cũ khiến mọi em học quá 8 phút đều ra 100% và thành phần
  // Video mất hết khả năng phân biệt.
  const dsVideo = (videoRes.data ?? []).filter((c: any) => c.duration_sec);
  const videoTB = dsVideo.length
    ? dsVideo.reduce((n: number, c: any) => n + c.duration_sec, 0) / dsVideo.length
    : 480;

  // ---- MẪU SỐ của thành phần Đều đặn: số buổi lớp ĐƯỢC GIAO BÀI, khai báo từ
  // đầu tuần trong bảng week_plan. Cùng một lập luận với chỉ số độ trung thực:
  // nếu lấy chính số buổi học sinh có hoạt động làm mẫu số thì em nào cũng 100%.
  // Lớp chưa khai kế hoạch tuần nào thì để null — thành phần Đều đặn CHƯA ĐO,
  // và công thức LES tự chuẩn hoá lại trọng số trên bốn thành phần còn lại.
  const { data: keHoach } = await supabase
    .from('week_plan').select('class_id, so_tiet_ke_hoach')
    .in('class_id', allowed.map((c) => c.class_id));
  const buoiCoBai = new Map<string, number>();
  for (const w of keHoach ?? []) {
    buoiCoBai.set(w.class_id, (buoiCoBai.get(w.class_id) ?? 0) + (w.so_tiet_ke_hoach ?? 0));
  }

  const prep = attempts.filter((a: any) => (a.kind ?? 'chuan-bi') === 'chuan-bi');
  const applied = attempts.filter((a: any) => a.kind === 'van-dung');

  const rows = (students ?? []).map((s) => {
    const t: any = tongHopOf.get(s.student_id);
    const soMuc = t ? Number(t.so_muc_da_bat_dau ?? 0) : 0;
    const comp = componentScores({
      activeWatchSec: t ? Number(t.giay_xem_co_tuong_tac ?? 0) : 0,
      assignedVideoSec: videoTB * Math.max(1, soMuc),
      firstQuizScores: ((t?.diem_quiz_lan_dau ?? []) as any[]).map(Number),
      assignmentsDone: t ? Number(t.so_bai_tap_da_nop ?? 0) : 0,
      // MẪU SỐ phải là số mục em ấy ĐÃ BẮT ĐẦU học, không phải một hằng số.
      // Mỗi mục giao đúng một bài vận dụng, nên số mục đã bắt đầu chính là số bài
      // tập được giao. Để hằng số 4 thì em học 2 mục bị chấm như học 4 mục.
      assignmentsAssigned: soMuc,
      // Số NGÀY có hoạt động, đã đếm theo lịch Việt Nam ở view.
      activeDays: t ? Number(t.so_ngay_co_hoat_dong ?? 0) : 0,
      daysWithWork: buoiCoBai.get(s.class_id) || null,
      voluntaryRetries: t ? Number(t.so_lan_tu_lam_lai ?? 0) : 0,
      feedbackWithHints: t ? Number(t.so_lan_nhan_phan_hoi ?? 0) : 0
    });
    // CHỈ lấy những mục ĐÃ ĐO ĐƯỢC mức làm chủ. Từ tệp 18, mastery_level có thể
    // là null nghĩa là "chưa đủ bằng chứng". Cộng null vào trung bình thì
    // JavaScript coi như 0, và tệp phân tích nghiên cứu bị kéo xuống một cách
    // âm thầm — đúng loại lỗi không ai phát hiện được khi đọc tệp CSV.
    const ms = mastery.filter((m: any) => m.student_id === s.student_id && m.mastery_level !== null);
    const ap = applied.filter((a: any) => a.student_id === s.student_id).map((a: any) => Number(a.score));
    return {
      s, comp,
      les: les(comp, WEIGHTS_V1),
      // null = chưa đo được mục nào → ô TRỐNG trong CSV, không phải 0.
      masteryAvg: ms.length ? ms.reduce((n, m) => n + Number(m.mastery_level), 0) / ms.length : null,
      soMucDaDoMastery: ms.length,
      soBaiDaLam: prep.filter((a) => a.student_id === s.student_id && a.attempt_no === 1).length,
      appliedAvg: ap.length ? ap.reduce((a, b) => a + b, 0) / ap.length : null
    };
  });

  // Em chưa có dữ liệu nào thì LES là null — không đưa vào phép tính tứ phân vị.
  const daDo = rows.filter((r) => r.les !== null).map((r) => r.les as number);
  const cutoffs: [number, number, number] =
    daDo.length >= 4 ? (quartileCutoffs(daDo) as [number, number, number]) : FIXED_CUTOFFS;
  // Ô TRỐNG chứ không phải số 0: chưa đo được thì để trống, để bên phân tích
  // biết mà loại dòng, thay vì nhận một con số không có thật.
  const so = (x: number | null, n = 1) => (x === null || x === undefined ? '' : x.toFixed(n));

  // số liệu bảng hỏi và bài kiểm tra do giáo viên nhập ở /gv/do-luong
  const { data: meas } = await supabase
    .from('measurements').select('student_id, wave, m1_digital, m2_active, m3_srl, y_math')
    .in('student_id', ids).eq('wave', wave);
  const measOf = new Map((meas ?? []).map((m) => [m.student_id, m]));

  // ------------------------------------------------------- hồ sơ LES đầy đủ
  if (loai === 'les') {
    return csvResponse(`ho-so-les-${today}.csv`, toCsv(
      ['student_id', 'class_id', 'arm', 'video', 'quiz', 'assignment', 'frequency',
       // so_muc_da_do_mastery là MẪU SỐ của mastery_tb. Không có nó thì bên phân
       // tích không phân biệt được "trung bình 1,0 trên 14 mục" với "trung bình
       // 1,0 trên đúng 1 mục" — hai câu chuyện hoàn toàn khác nhau.
       'persistence', 'les', 'nhom', 'mastery_tb', 'so_muc_da_do_mastery',
       'so_bai_da_lam', 'diem_van_dung_tb'],
      rows.map((r) => [
        r.s.student_id, r.s.class_id, armOf.get(r.s.class_id) ?? '',
        so(r.comp.video), so(r.comp.quiz), so(r.comp.assignment),
        so(r.comp.frequency), so(r.comp.persistence),
        so(r.les), r.les === null ? '' : classify(r.les, cutoffs),
        so(r.masteryAvg, 2), r.soMucDaDoMastery,
        r.soBaiDaLam, r.appliedAvg === null ? '' : r.appliedAvg.toFixed(2)
      ])
    ));
  }

  // ------------------------- khung phân tích cho analysis/analyze.py (mặc định)
  // Bốn cột M1, M2, M3, Y lấy từ bảng measurements của đợt đo đang chọn. Đợt nào
  // chưa nhập thì cột để TRỐNG — analyze.py sẽ từ chối chạy chứ không bịa số.
  return csvResponse(`analysis_input-${wave}-${today}.csv`, toCsv(
    ['student_id', 'arm', 'baseline_math', 'X_les', 'M1_digital', 'M2_active', 'M3_srl', 'Y_math'],
    rows.map((r) => {
      const m = measOf.get(r.s.student_id);
      return [
        r.s.student_id, armOf.get(r.s.class_id) ?? '', r.s.baseline_math ?? '',
        so(r.les),
        m?.m1_digital ?? '', m?.m2_active ?? '', m?.m3_srl ?? '', m?.y_math ?? ''
      ];
    })
  ));
}
