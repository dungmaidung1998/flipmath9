/**
 * FILE NÀY LÀM GÌ: API máy chủ tiếp nhận yêu cầu từ trình duyệt, kiểm tra quyền và làm việc với cơ sở dữ liệu Supabase / AI.
 * AI DÙNG: máy chủ (API)
 * ĐỊA CHỈ TRÊN WEB: /api/vi-bai-hoc
 * LẤY DỮ LIỆU TỪ: profiles, recommendations, micro_lessons, contents, micro_lesson_events
 * GỌI TỚI: @/lib/latexSangChu, @/lib/supabase/server
 */
import { latexSangChu } from '@/lib/latexSangChu';
import { NextResponse } from 'next/server';
import { supabaseServer, supabaseAdmin } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

/**
 * MỞ VÀ HOÀN THÀNH MỘT VI BÀI HỌC SỬA LỖI
 *
 * GET  ?id=VBH-DN-01  → trả nội dung vi bài học, ĐÃ BỎ đáp án của phần tự kiểm
 * POST { id, traLoi } → chấm phần tự kiểm, trả đáp án và lời giải thích
 *
 * Ba điều đáng nói ở phỏng vấn:
 *
 * 1. **Học sinh chỉ mở được vi bài học đã được giao cho chính mình.** Máy chủ tra
 *    bảng recommendations xem em đó có bản ghi nào trỏ tới vi bài học này chưa.
 *    Không có thì từ chối. Nếu không kiểm, một em có thể duyệt hết 23 vi bài học
 *    để đọc trước đáp án của mọi câu tự kiểm.
 * 2. **Đáp án không đi xuống trình duyệt ở lượt GET.** Chỉ khi học sinh đã nộp
 *    bài tự kiểm thì máy chủ mới trả đáp án kèm lời giải thích. Cùng một lối làm
 *    với bài kiểm tra chẩn đoán: chấm ở phía máy chủ.
 * 3. **Mỗi lượt mở và mỗi lượt hoàn thành đều được ghi lại.** Đây là nguồn dữ
 *    liệu duy nhất cho thành phần "mức đáp ứng" của độ trung thực triển khai —
 *    trước bảng này, thành phần đó không có gì để đo.
 */

async function hocSinh() {
  const supabase = supabaseServer();
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { loi: NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 }) };
  const { data: profile } = await supabase
    .from('profiles').select('student_id').eq('id', user.id).maybeSingle();
  if (!profile?.student_id) {
    return { loi: NextResponse.json({ error: 'Tài khoản không gắn với học sinh nào' }, { status: 403 }) };
  }
  return { studentId: profile.student_id };
}

/** Vi bài học này có được giao cho em đó không? Trả về ku_id nếu có. */
async function daDuocGiao(admin: any, studentId: string, contentId: string) {
  const { data } = await admin
    .from('recommendations')
    .select('rec_id, ku_id')
    .eq('student_id', studentId).eq('recommended_content', contentId)
    .order('created_at', { ascending: false }).limit(1);
  return data?.[0] ?? null;
}

/**
 * Xử lý HTTP GET: kiểm tra đăng nhập/quyền hạn, đọc dữ liệu và trả về JSON cho trình duyệt.
 */
export async function GET(req: Request) {
  const { loi, studentId } = await hocSinh();
  if (loi) return loi;

  const id = new URL(req.url).searchParams.get('id') ?? '';
  if (!id) return NextResponse.json({ error: 'Thiếu mã vi bài học' }, { status: 400 });

  const admin = supabaseAdmin();
  const rec = await daDuocGiao(admin, studentId!, id);
  if (!rec) {
    return NextResponse.json(
      { error: 'Vi bài học này chưa được giao cho em. Em làm bài kiểm tra trước đã nhé.' },
      { status: 403 }
    );
  }

  const [{ data: bai }, { data: content }] = await Promise.all([
    admin.from('micro_lessons').select('dan, quy_tac, vi_du, tu_lam').eq('content_id', id).maybeSingle(),
    admin.from('contents').select('title, duration_sec, ku_id').eq('content_id', id).maybeSingle()
  ]);
  if (!bai) {
    return NextResponse.json(
      { error: 'Vi bài học này chưa có nội dung. Em báo với thầy cô giúp.' },
      { status: 404 }
    );
  }

  // ghi lượt mở — hỏng thì vẫn cho học, không chặn việc học vì một dòng nhật ký
  try {
    // Truy vấn Supabase: thêm bản ghi vào bảng micro_lesson_events
    await admin.from('micro_lesson_events').insert({
      student_id: studentId, content_id: id, ku_id: content?.ku_id ?? rec.ku_id, kind: 'mo'
    });
  } catch { /* bảng chưa tạo (chưa chạy 08-vi-bai-hoc.sql) */ }

  // BỎ đáp án và lời giải thích khỏi phần tự kiểm trước khi gửi xuống trình duyệt
  const tuLam = (bai.tu_lam as any[]).map((c: any, i: number) => ({ so: i + 1, de: c.de }));

  return NextResponse.json({
    id,
    title: content?.title ?? id,
    minutes: Math.round((content?.duration_sec ?? 300) / 60),
    kuId: content?.ku_id ?? rec.ku_id,
    dan: bai.dan,
    quyTac: bai.quy_tac,
    viDu: bai.vi_du,
    tuLam
  });
}

/**
 * Xử lý HTTP POST: kiểm tra đăng nhập/quyền hạn, nhận dữ liệu mới / xử lý và trả về JSON cho trình duyệt.
 */
export async function POST(req: Request) {
  const { loi, studentId } = await hocSinh();
  if (loi) return loi;

  const body = await req.json().catch(() => null);
  const id: string = body?.id ?? '';
  const traLoi: string[] = Array.isArray(body?.traLoi) ? body.traLoi : [];
  if (!id) return NextResponse.json({ error: 'Thiếu mã vi bài học' }, { status: 400 });

  const admin = supabaseAdmin();
  const rec = await daDuocGiao(admin, studentId!, id);
  if (!rec) return NextResponse.json({ error: 'Vi bài học này chưa được giao cho em' }, { status: 403 });

  const { data: bai } = await admin
    .from('micro_lessons').select('tu_lam').eq('content_id', id).maybeSingle();
  if (!bai) return NextResponse.json({ error: 'Không tìm thấy nội dung' }, { status: 404 });

  const cau = bai.tu_lam as any[];

  /**
   * Chấm câu tự kiểm bằng cách so chuỗi đã chuẩn hoá.
   *
   * Có chủ ý DỄ DÃI: bỏ dấu cách, bỏ tiền tố "x =", coi dấu phẩy và dấu chấm
   * thập phân như nhau, không phân biệt hoa thường. Đây là bài TỰ KIỂM để học
   * sinh biết mình đã hiểu chưa, không phải bài chấm điểm — bắt lỗi hình thức ở
   * đây chỉ làm các em nản và bỏ dở, mà tỉ lệ bỏ dở lại chính là thứ ta đang đo.
   * Vì vậy câu nào máy chấm là sai thì vẫn hiện đáp án và lời giải thích đầy đủ.
   */
  const chuanHoa = (s: string) =>
    String(s ?? '')
      .toLowerCase()
      .replace(/\s+/g, '')
      .replace(/^x=/, '')
      .replace(/,/g, '.')
      .replace(/[−–—]/g, '-');

  const ketQua = cau.map((c: any, i: number) => {
    // dapAnGoc: đáp án viết thường (Unicode) để so; dapAn có thể đã đổi sang LaTeX để hiển thị.
    const dung = chuanHoa(traLoi[i]) !== '' && chuanHoa(traLoi[i]) === chuanHoa(c.dapAnGoc ?? latexSangChu(c.dapAn));
    return { so: i + 1, de: c.de, traLoi: traLoi[i] ?? '', dung, dapAn: c.dapAn, giaiThich: c.giaiThich };
  });
  const soDung = ketQua.filter((k) => k.dung).length;

  try {
    // Truy vấn Supabase: thêm bản ghi vào bảng micro_lesson_events
    await admin.from('micro_lesson_events').insert({
      student_id: studentId, content_id: id, ku_id: rec.ku_id,
      kind: 'hoan-thanh', so_cau_dung: soDung, so_cau: cau.length
    });
  } catch { /* bảng chưa tạo */ }

  /**
   * Đánh dấu gợi ý đã được chấp nhận.
   *
   * CHỈ đặt accepted = true, KHÔNG đụng tới post_score. Cột post_score dành riêng
   * cho điểm bài vận dụng làm lại sau đó — nếu lấy điểm bài tự kiểm ba câu đổ vào
   * đấy thì phép thử T6 ("gợi ý có tác dụng không") sẽ so hai thứ khác nhau và
   * cho ra một con số vô nghĩa.
   */
  try {
    // Truy vấn Supabase: cập nhật dữ liệu ở bảng recommendations
    await admin.from('recommendations').update({ accepted: true }).eq('rec_id', rec.rec_id);
  } catch { /* không chặn việc học */ }

  return NextResponse.json({ soDung, tong: cau.length, ketQua, kuId: rec.ku_id });
}
