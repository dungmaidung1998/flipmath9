/**
 * FILE NÀY LÀM GÌ: API máy chủ tiếp nhận yêu cầu từ trình duyệt, kiểm tra quyền và làm việc với cơ sở dữ liệu Supabase / AI.
 * AI DÙNG: máy chủ (API)
 * ĐỊA CHỈ TRÊN WEB: /api/hs/viec-duoc-giao
 * LẤY DỮ LIỆU TỪ: gv_giao_viec
 * GỌI TỚI: @/lib/supabase/server
 */
import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

/** HS đánh dấu đã đọc một lời nhắn / gói bài thầy cô giao. RLS chỉ cho sửa dòng của chính em. */
export async function POST(req: Request) {
  const db = supabaseServer();
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  const { data: { user } } = await db.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
  const b = await req.json().catch(() => ({}));
  const id = Number(b?.id);
  if (!Number.isInteger(id)) return NextResponse.json({ error: 'Thiếu mã' }, { status: 400 });
  // Truy vấn Supabase: cập nhật dữ liệu ở bảng gv_giao_viec
  const { error } = await db.from('gv_giao_viec').update({ da_xem_at: new Date().toISOString() }).eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
