/**
 * FILE NÀY LÀM GÌ: API máy chủ tiếp nhận yêu cầu từ trình duyệt, kiểm tra quyền và làm việc với cơ sở dữ liệu Supabase / AI.
 * AI DÙNG: máy chủ (API)
 * ĐỊA CHỈ TRÊN WEB: /api/do-luong
 * LẤY DỮ LIỆU TỪ: profiles, students, measurements
 * GỌI TỚI: @/lib/supabase/server, @/lib/gv/lopCuaToi
 */
import { NextResponse } from 'next/server';
import { supabaseServer, supabaseAdmin } from '@/lib/supabase/server';
import { laVaiTroGV, lopCuaToi } from '@/lib/gv/lopCuaToi';

export const dynamic = 'force-dynamic';

/**
 * NHẬP SỐ LIỆU ĐO CỦA BA ĐỢT: trước tác động, sau tác động, và ĐO DUY TRÌ.
 *
 * Bốn cột M1, M2, M3, Y đến từ bảng hỏi 46 câu và bài kiểm tra Toán trên giấy —
 * hệ thống không sinh ra được, giáo viên nhập vào một lần rồi tệp CSV xuất ra
 * mới đầy đủ để chạy analyze.py.
 *
 * Lần đo DUY TRÌ (sau khi ngừng can thiệp 6 tuần) là thứ trả lời câu hỏi mà
 * gần như mọi dự án cùng chủ đề bỏ qua: hiệu quả có giữ được không, hay chỉ là
 * hiệu ứng của việc được quan tâm trong thời gian thực nghiệm.
 */
const WAVES = new Set(['pre', 'post', 'followup']);

/**
 * Xử lý HTTP POST: kiểm tra đăng nhập/quyền hạn, nhận dữ liệu mới / xử lý và trả về JSON cho trình duyệt.
 */
export async function POST(req: Request) {
  const supabase = supabaseServer();
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).maybeSingle();
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  if (!laVaiTroGV(profile?.role)) {
    return NextResponse.json({ error: 'Chỉ giáo viên mới nhập được số liệu đo' }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const wave: string = body?.wave;
  const text: string = body?.text ?? '';
  if (!WAVES.has(wave)) return NextResponse.json({ error: 'Đợt đo không hợp lệ' }, { status: 400 });

  // chỉ cho nhập cho học sinh thuộc các lớp thầy cô được phân quyền
  const classes = await lopCuaToi(supabase);
  const { data: mine } = await supabase
    .from('students').select('student_id')
    .in('class_id', classes.map((c) => c.class_id).length
      ? classes.map((c) => c.class_id) : ['__none__']);
  const allowed = new Set((mine ?? []).map((s) => s.student_id));

  const num = (v: string) => {
    const x = Number(String(v ?? '').trim().replace(',', '.'));
    return Number.isFinite(x) ? x : null;
  };

  const rows: any[] = [];
  const loi: string[] = [];
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);

  for (const [i, line] of lines.entries()) {
    // bỏ qua dòng tiêu đề nếu người dùng dán cả tiêu đề
    if (i === 0 && /student_id/i.test(line)) continue;
    // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
    const parts = line.split(/[,;\t]/).map((x) => x.trim());
    const [sid, m1, m2, m3, y] = parts;
    if (!sid) continue;
    if (!allowed.has(sid)) { loi.push(`${sid}: không thuộc lớp của thầy cô`); continue; }
    if (parts.length < 5) { loi.push(`${sid}: thiếu cột, cần đủ 5 giá trị`); continue; }
    rows.push({
      student_id: sid, wave,
      m1_digital: num(m1), m2_active: num(m2), m3_srl: num(m3), y_math: num(y)
    });
  }

  if (!rows.length) {
    return NextResponse.json({ inserted: 0, loi: loi.length ? loi : ['Không đọc được dòng hợp lệ nào'] });
  }

  const admin = supabaseAdmin();
  // Truy vấn Supabase: đọc dữ liệu từ bảng measurements
  const { error } = await admin.from('measurements')
    .upsert(rows, { onConflict: 'student_id,wave' });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ inserted: rows.length, loi });
}
