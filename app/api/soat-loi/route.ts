/**
 * FILE NÀY LÀM GÌ: API máy chủ tiếp nhận yêu cầu từ trình duyệt, kiểm tra quyền và làm việc với cơ sở dữ liệu Supabase / AI.
 * AI DÙNG: máy chủ (API)
 * ĐỊA CHỈ TRÊN WEB: /api/soat-loi
 * LẤY DỮ LIỆU TỪ: profiles
 * GỌI TỚI: @/lib/supabase/server, @/lib/soatLoiMayChu
 */
import { NextResponse } from 'next/server';
import { supabaseServer, supabaseAdmin } from '@/lib/supabase/server';
import { phatDeSoatLoi, nopSoatLoi } from '@/lib/soatLoiMayChu';

export const dynamic = 'force-dynamic';

/**
 * Hàm `hocSinh(không cần tham số)`: xử lý dữ liệu đầu vào và trả kết quả.
 */
async function hocSinh() {
  const db = supabaseServer();
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  const { data: { user } } = await db.auth.getUser();
  if (!user) return { loi: NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 }) };
  // Truy vấn Supabase: đọc dữ liệu từ bảng profiles
  const { data: p } = await db.from('profiles').select('student_id, role').eq('id', user.id).maybeSingle();
  // Giáo viên xem thử bài: không có sổ lỗi, coi như không có lỗi cần soát.
  if (!p?.student_id) return { khongCo: true as const };
  return { studentId: p.student_id as string };
}

/** GET /api/soat-loi?ku=… → đề soát lỗi hôm nay (hoặc { khongCo: true }). */
export async function GET(req: Request) {
  const h = await hocSinh();
  if ('loi' in h) return h.loi;
  if ('khongCo' in h) return NextResponse.json({ khongCo: true });
  const ku = new URL(req.url).searchParams.get('ku');
  try {
    const de = await phatDeSoatLoi(supabaseAdmin(), h.studentId, ku && ku.length < 60 ? ku : null);
    return NextResponse.json(de ?? { khongCo: true });
  } catch (e: any) {
    // Chưa chạy tệp 42 (thiếu bảng) hoặc lỗi đọc: báo rõ để màn học không bị khoá oan.
    return NextResponse.json({ error: 'Chưa đọc được sổ lỗi.', chiTiet: String(e?.message ?? e).slice(0, 200) }, { status: 503 });
  }
}

/** POST { luotId, answers: [{ questionId, chosen, timeSec }] } → chấm và cập nhật lịch ôn. */
export async function POST(req: Request) {
  const h = await hocSinh();
  if ('loi' in h) return h.loi;
  if ('khongCo' in h) return NextResponse.json({ error: 'Tài khoản không gắn với học sinh nào' }, { status: 403 });
  const b = await req.json().catch(() => null);
  const luotId = Number(b?.luotId);
  if (!Number.isInteger(luotId) || !Array.isArray(b?.answers) || b.answers.length > 20
    || b.answers.some((a: any) => typeof a?.questionId !== 'string' || (a.chosen != null && typeof a.chosen !== 'string'))) {
    return NextResponse.json({ error: 'Bài nộp không hợp lệ' }, { status: 400 });
  }
  try {
    return NextResponse.json(await nopSoatLoi(supabaseAdmin(), h.studentId, luotId, b.answers));
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message ?? 'Không chấm được') }, { status: 400 });
  }
}
