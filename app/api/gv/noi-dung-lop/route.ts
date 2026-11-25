/**
 * FILE NÀY LÀM GÌ: API máy chủ phục vụ giáo viên xử lý dữ liệu lớp học, thống kê hoặc thao tác quản lý trên Supabase.
 * AI DÙNG: máy chủ (API)
 * ĐỊA CHỈ TRÊN WEB: /api/gv/noi-dung-lop
 * LẤY DỮ LIỆU TỪ: class_content
 * GỌI TỚI: @/lib/gv/xacThucApi
 */
import { NextResponse } from 'next/server';
import { giaoVienCuaLop } from '@/lib/gv/xacThucApi';

export const dynamic = 'force-dynamic';

type MucCapNhat = {
  ku_id: string;
  dao_nguoc: boolean;
  an: boolean;
  an_game: boolean;
  an_video: boolean;
};

/**
 * Lưu cấu hình bật/tắt nội dung theo lớp vào bảng class_content (file SQL 51).
 * POST { lop, muc: [{ ku_id, dao_nguoc, an, an_game, an_video }] }
 */
export async function POST(req: Request) {
  let b: any;
  try {
    b = await req.json();
  } catch {
    return NextResponse.json({ error: 'Dữ liệu không hợp lệ' }, { status: 400 });
  }

  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  const x = await giaoVienCuaLop(b?.lop);
  if ('loi' in x) return x.loi;
  const { db, lop, lopInfo } = x;
  // Giáo viên dự giờ chỉ được xem, không được đổi nội dung của lớp
  if (lopInfo.vai_tro === 'du-gio') {
    return NextResponse.json({ error: 'Giáo viên dự giờ chỉ được xem, không được sửa nội dung lớp.' }, { status: 403 });
  }

  const danhSach: MucCapNhat[] = Array.isArray(b?.muc)
    ? b.muc
        .filter((m: any) => typeof m?.ku_id === 'string' && m.ku_id.trim())
        .slice(0, 200)
        .map((m: any) => ({
          ku_id: m.ku_id.trim(),
          dao_nguoc: !!m.dao_nguoc,
          an: !!m.an,
          an_game: !!m.an_game,
          an_video: !!m.an_video
        }))
    : [];

  if (!danhSach.length) {
    return NextResponse.json({ error: 'Không có mục nào để lưu.' }, { status: 400 });
  }

  const now = new Date().toISOString();
  const rows = danhSach.map((m) => ({
    class_id: lop,
    ku_id: m.ku_id,
    dao_nguoc: m.dao_nguoc,
    an: m.an,
    an_game: m.an_game,
    an_video: m.an_video,
    cap_nhat: now
  }));

  const { error } = await db
    .from('class_content')
    .upsert(rows, { onConflict: 'class_id,ku_id' });

  if (error) {
    // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
    const chuaTao = /class_content/.test(error.message) && /does not exist|schema cache/i.test(error.message);
    return NextResponse.json(
      { error: chuaTao ? 'Chưa chạy tệp 51-phan-cap-truong-gv-lop.sql trên Supabase.' : error.message },
      { status: 400 }
    );
  }

  return NextResponse.json({ ok: true, luu: rows.length });
}
