/**
 * FILE NÀY LÀM GÌ: API máy chủ phục vụ giáo viên xử lý dữ liệu lớp học, thống kê hoặc thao tác quản lý trên Supabase.
 * AI DÙNG: máy chủ (API)
 * ĐỊA CHỈ TRÊN WEB: /api/gv/bo-qua
 * LẤY DỮ LIỆU TỪ: gv_bo_qua
 * GỌI TỚI: @/lib/gv/xacThucApi
 */
import { NextResponse } from 'next/server';
import { giaoVienCuaLop } from '@/lib/gv/xacThucApi';

export const dynamic = 'force-dynamic';

/** GV-16 khối C: "Bỏ qua lần này" — loại HS khỏi khối Học chưa chăm trong 14 ngày. */
export async function POST(req: Request) {
  let b: any;
  try { b = await req.json(); } catch { return NextResponse.json({ error: 'Dữ liệu không hợp lệ' }, { status: 400 }); }
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  const x = await giaoVienCuaLop(b?.lop);
  if ('loi' in x) return x.loi;
  const { db, lop } = x;
  if (typeof b.hs !== 'string') return NextResponse.json({ error: 'Thiếu học sinh' }, { status: 400 });
  const den = new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10);
  // Truy vấn Supabase: thêm hoặc cập nhật (upsert) bảng gv_bo_qua
  const { error } = await db.from('gv_bo_qua').upsert({ class_id: lop, student_id: b.hs, den_ngay: den });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true, denNgay: den });
}
