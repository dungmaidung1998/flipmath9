/**
 * FILE NÀY LÀM GÌ: API máy chủ phục vụ giáo viên xử lý dữ liệu lớp học, thống kê hoặc thao tác quản lý trên Supabase.
 * AI DÙNG: máy chủ (API)
 * ĐỊA CHỈ TRÊN WEB: /api/gv/lich-bai
 * LẤY DỮ LIỆU TỪ: lich_bai
 * GỌI TỚI: @/lib/gv/xacThucApi
 */
import { NextResponse } from 'next/server';
import { giaoVienCuaLop } from '@/lib/gv/xacThucApi';

export const dynamic = 'force-dynamic';

// Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
const NGAY = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Lưu lịch giao bài của một lớp: { lop, dong: [{ lesson_id, ngay_mo, han_chuan_bi, ngay_hoc }], xoa?: [lesson_id] }.
 * Ghi bằng phiên đăng nhập của giáo viên, chính sách RLS chỉ cho sửa lớp mình dạy.
 */
export async function POST(req: Request) {
  let b: any;
  try { b = await req.json(); } catch { return NextResponse.json({ error: 'Dữ liệu không hợp lệ' }, { status: 400 }); }
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  const x = await giaoVienCuaLop(b?.lop);
  if ('loi' in x) return x.loi;
  const { db, lop } = x;

  const dong = Array.isArray(b.dong) ? b.dong.slice(0, 80) : [];
  const xoa: string[] = Array.isArray(b.xoa) ? b.xoa.filter((s: any) => typeof s === 'string').slice(0, 80) : [];
  const rows = [];
  for (const d of dong) {
    const han = new Date(String(d?.han_chuan_bi ?? ''));
    if (typeof d?.lesson_id !== 'string' || !NGAY.test(d.ngay_mo) || !NGAY.test(d.ngay_hoc) || isNaN(han.getTime())) {
      return NextResponse.json({ error: `Ngày chưa hợp lệ ở bài: ${d?.lesson_id ?? '?'}` }, { status: 400 });
    }
    if (d.ngay_mo > d.ngay_hoc) return NextResponse.json({ error: `Ngày mở phải trước ngày học: ${d.lesson_id}` }, { status: 400 });
    if (han.getTime() > Date.parse(`${d.ngay_hoc}T23:59:59+07:00`)) return NextResponse.json({ error: `Hạn chuẩn bị phải trước hết ngày học: ${d.lesson_id}` }, { status: 400 });
    rows.push({ class_id: lop, lesson_id: d.lesson_id, ngay_mo: d.ngay_mo, han_chuan_bi: han.toISOString(), ngay_hoc: d.ngay_hoc, cap_nhat: new Date().toISOString() });
  }
  if (rows.length) {
    // Truy vấn Supabase: thêm hoặc cập nhật (upsert) bảng lich_bai
    const { error } = await db.from('lich_bai').upsert(rows, { onConflict: 'class_id,lesson_id' });
    if (error) {
      // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
      const chuaTao = /lich_bai/.test(error.message) && /does not exist|schema cache/.test(error.message);
      return NextResponse.json({ error: chuaTao ? 'Chưa chạy tệp 43-lich-giao-bai.sql trên Supabase.' : error.message }, { status: 400 });
    }
  }
  if (xoa.length) {
    // Truy vấn Supabase: xoá dữ liệu khỏi bảng lich_bai
    const { error } = await db.from('lich_bai').delete().eq('class_id', lop).in('lesson_id', xoa);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ luu: rows.length, xoa: xoa.length });
}
