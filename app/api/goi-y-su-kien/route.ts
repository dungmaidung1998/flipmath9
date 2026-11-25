/**
 * FILE NÀY LÀM GÌ: API máy chủ tiếp nhận yêu cầu từ trình duyệt, kiểm tra quyền và làm việc với cơ sở dữ liệu Supabase / AI.
 * AI DÙNG: máy chủ (API)
 * ĐỊA CHỈ TRÊN WEB: /api/goi-y-su-kien
 * LẤY DỮ LIỆU TỪ: profiles
 * GỌI TỚI: @/lib/supabase/server, @/lib/khkt/ghiGoiYSuKien, @/lib/khkt/tuLuc
 */
import { NextResponse } from 'next/server';
import { supabaseAdmin, supabaseServer } from '@/lib/supabase/server';
import { danhDauXemLoiGiai, ghiNhanGoiY } from '@/lib/khkt/ghiGoiYSuKien';
import type { NguonGoiY } from '@/lib/khkt/tuLuc';

export const dynamic = 'force-dynamic';

const NGUON_CHO_PHEP = new Set<NguonGoiY>(['tro-choi', 'do-chieu-cao', 'goi-y-loi']);

/**
 * Xử lý HTTP POST: kiểm tra đăng nhập/quyền hạn, nhận dữ liệu mới / xử lý và trả về JSON cho trình duyệt.
 */
export async function POST(req: Request) {
  const db = supabaseServer();
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  const { data: { user } } = await db.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });

  const { data: prof } = await db
    .from('profiles')
    .select('student_id, class_id')
    .eq('id', user.id)
    .maybeSingle();
  if (!prof?.student_id) return NextResponse.json({ ok: true, skipped: true });

  const body = await req.json().catch(() => null);
  const admin = supabaseAdmin();

  if (body?.hanhDong === 'xem-loi-giai') {
    await danhDauXemLoiGiai(admin, {
      studentId: prof.student_id,
      kuId: typeof body?.kuId === 'string' ? body.kuId : null,
      questionId: typeof body?.questionId === 'string' ? body.questionId : null,
    });
    return NextResponse.json({ ok: true });
  }

  const nguon = body?.nguon as NguonGoiY;
  if (!NGUON_CHO_PHEP.has(nguon)) {
    return NextResponse.json({ error: 'Nguồn gợi ý không hợp lệ.' }, { status: 400 });
  }

  await ghiNhanGoiY(admin, {
    studentId: prof.student_id,
    classId: prof.class_id ?? null,
    nguon,
    tang: Number.isInteger(body?.tang) && body.tang >= 1 && body.tang <= 3 ? body.tang : null,
    kuId: typeof body?.kuId === 'string' ? body.kuId.slice(0, 60) : null,
    questionId: typeof body?.questionId === 'string' ? body.questionId.slice(0, 80) : null,
    errorCode: typeof body?.errorCode === 'string' ? body.errorCode.slice(0, 40) : null,
    coAi: Boolean(body?.coAi),
  });

  return NextResponse.json({ ok: true });
}
