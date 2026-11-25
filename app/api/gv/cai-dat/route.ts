/**
 * FILE NÀY LÀM GÌ: API máy chủ phục vụ giáo viên xử lý dữ liệu lớp học, thống kê hoặc thao tác quản lý trên Supabase.
 * AI DÙNG: máy chủ (API)
 * ĐỊA CHỈ TRÊN WEB: /api/gv/cai-dat
 * LẤY DỮ LIỆU TỪ: class_settings
 * GỌI TỚI: @/lib/gv/xacThucApi, @/lib/gv/nguong, @/lib/dfle/man-chinh-gv.js
 */
import { NextResponse } from 'next/server';
import { giaoVienCuaLop } from '@/lib/gv/xacThucApi';
import { KHOANG } from '@/lib/gv/nguong';
// @ts-ignore
import { NGUONG_MAC_DINH } from '@/lib/dfle/man-chinh-gv.js';

export const dynamic = 'force-dynamic';

/**
 * Xử lý HTTP POST: kiểm tra đăng nhập/quyền hạn, nhận dữ liệu mới / xử lý và trả về JSON cho trình duyệt.
 */
export async function POST(req: Request) {
  let b: any;
  try { b = await req.json(); } catch { return NextResponse.json({ error: 'Dữ liệu không hợp lệ' }, { status: 400 }); }
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  const x = await giaoVienCuaLop(b?.lop);
  if ('loi' in x) return x.loi;
  const { db, lop } = x;
  const nguong: Record<string, number> = {};
  for (const [k, [lo, hi]] of Object.entries(KHOANG)) {
    const v = Number(b?.nguong?.[k]);
    // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
    if (Number.isFinite(v) && v !== (NGUONG_MAC_DINH as any)[k]) nguong[k] = Math.min(hi, Math.max(lo, v));
  }
  if (nguong.coTienBo != null && nguong.tienBoRo != null && nguong.coTienBo >= nguong.tienBoRo) {
    return NextResponse.json({ error: 'Ngưỡng "có tiến bộ" phải nhỏ hơn ngưỡng "tiến bộ rõ".' }, { status: 400 });
  }
  // Truy vấn Supabase: thêm hoặc cập nhật (upsert) bảng class_settings
  const { error } = await db.from('class_settings').upsert({ class_id: lop, nguong, updated_at: new Date().toISOString() });
  // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
  if (error) return NextResponse.json({ error: /does not exist|schema cache/.test(error.message) ? 'Chưa chạy tệp 41-man-chinh-giao-vien.sql trên Supabase.' : error.message }, { status: 400 });
  return NextResponse.json({ ok: true, nguong });
}
