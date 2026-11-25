/**
 * FILE NÀY LÀM GÌ: API máy chủ phục vụ giáo viên xử lý dữ liệu lớp học, thống kê hoặc thao tác quản lý trên Supabase.
 * AI DÙNG: máy chủ (API)
 * ĐỊA CHỈ TRÊN WEB: /api/gv/do-chieu-cao
 * LẤY DỮ LIỆU TỪ: vat_moc
 * GỌI TỚI: @/lib/gv/xacThucApi, @/lib/supabase/server
 */
import { NextResponse } from 'next/server';
import { giaoVienCuaLop } from '@/lib/gv/xacThucApi';
import { supabaseAdmin } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

/**
 * Xử lý HTTP POST: kiểm tra đăng nhập/quyền hạn, nhận dữ liệu mới / xử lý và trả về JSON cho trình duyệt.
 */
export async function POST(req: Request) {
  const b = await req.json().catch(() => null);
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  const auth = await giaoVienCuaLop(b?.lop);
  if ('loi' in auth) return auth.loi;

  const ten = String(b?.ten ?? '').trim().slice(0, 120);
  const hThatRaw = b?.hThat;
  const hThat = hThatRaw === '' || hThatRaw == null ? null : Number(hThatRaw);
  const cachDoThat = String(b?.cachDoThat ?? '').trim().slice(0, 200) || null;

  if (!ten) {
    return NextResponse.json({ error: 'Thầy cô cần nhập tên vật mốc.' }, { status: 400 });
  }
  if (hThat != null && (!Number.isFinite(hThat) || hThat <= 0)) {
    return NextResponse.json({ error: 'Chiều cao thật phải là số dương (mét).' }, { status: 400 });
  }

  const admin = supabaseAdmin();
  const { data, error } = await admin
    .from('vat_moc')
    .insert({
      class_id: auth.lop,
      ten,
      h_that: hThat,
      cach_do_that: cachDoThat,
      tao_boi: auth.user.id,
    })
    .select('id, class_id, ten, h_that, cach_do_that, tao_luc')
    .single();

  if (error) {
    return NextResponse.json(
      { error: /does not exist|schema cache/i.test(error.message) ? 'Chưa chạy SQL 56 trên Supabase.' : error.message },
      { status: 400 }
    );
  }
  return NextResponse.json({ ok: true, vatMoc: data });
}

/**
 * Xử lý HTTP DELETE: kiểm tra đăng nhập/quyền hạn, xoá dữ liệu và trả về JSON cho trình duyệt.
 */
export async function DELETE(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get('id') ?? '';
  const lop = url.searchParams.get('lop') ?? '';
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  const auth = await giaoVienCuaLop(lop);
  if ('loi' in auth) return auth.loi;
  if (!id) return NextResponse.json({ error: 'Thiếu mã vật mốc.' }, { status: 400 });

  const admin = supabaseAdmin();
  // Truy vấn Supabase: xoá dữ liệu khỏi bảng vat_moc
  const { error } = await admin.from('vat_moc').delete().eq('id', id).eq('class_id', auth.lop);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
