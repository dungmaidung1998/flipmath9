/**
 * FILE NÀY LÀM GÌ: API máy chủ phục vụ giáo viên xử lý dữ liệu lớp học, thống kê hoặc thao tác quản lý trên Supabase.
 * AI DÙNG: máy chủ (API)
 * ĐỊA CHỈ TRÊN WEB: /api/gv/de-kiem-tra/word
 * LẤY DỮ LIỆU TỪ: knowledge_units, profiles, de_kiem_tra
 * GỌI TỚI: @/lib/supabase/server, @/lib/gv/lopCuaToi, @/lib/khkt/deKiemTra
 */
import { NextResponse } from 'next/server';
import { supabaseAdmin, supabaseServer } from '@/lib/supabase/server';
import { kiemTraQuyenLop, laVaiTroGV, tenHienThiLop } from '@/lib/gv/lopCuaToi';
import { taoFileWordDeKiemTra, type DeKiemTraData } from '@/lib/khkt/deKiemTra';

export const dynamic = 'force-dynamic';

/**
 * Hàm `taiTenMuc(admin)`: nạp/truy xuất dữ liệu từ CSDL hoặc bộ nhớ.
 */
async function taiTenMuc(admin: ReturnType<typeof supabaseAdmin>) {
  // Truy vấn Supabase: đọc dữ liệu từ bảng knowledge_units
  const { data } = await admin.from('knowledge_units').select('ku_id, ku_name');
  return new Map((data ?? []).map((u) => [u.ku_id as string, u.ku_name as string]));
}

/**
 * Xử lý HTTP GET: kiểm tra đăng nhập/quyền hạn, đọc dữ liệu và trả về JSON cho trình duyệt.
 */
export async function GET(req: Request) {
  const db = supabaseServer();
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  const { data: { user } } = await db.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
  // Truy vấn Supabase: đọc dữ liệu từ bảng profiles
  const { data: prof } = await db.from('profiles').select('role, full_name').eq('id', user.id).maybeSingle();
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  if (!laVaiTroGV(prof?.role)) return NextResponse.json({ error: 'Chỉ giáo viên' }, { status: 403 });

  const id = new URL(req.url).searchParams.get('id') ?? '';
  if (!id) return NextResponse.json({ error: 'Thiếu mã đề' }, { status: 400 });

  const admin = supabaseAdmin();
  // Truy vấn Supabase: đọc dữ liệu từ bảng de_kiem_tra
  const { data: de, error } = await admin.from('de_kiem_tra').select('*').eq('id', id).maybeSingle();
  if (error || !de) return NextResponse.json({ error: 'Không tìm thấy đề kiểm tra' }, { status: 404 });

  const lopInfo = await kiemTraQuyenLop(db, de.class_id);
  if (!lopInfo) return NextResponse.json({ error: 'Không có quyền truy cập lớp này' }, { status: 403 });

  const tenMucMap = await taiTenMuc(admin);
  const buf = await taoFileWordDeKiemTra({
    de: de as DeKiemTraData,
    tenLop: tenHienThiLop(lopInfo),
    tenGV: prof?.full_name,
    tenMucMap,
  });

  // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
  const fileName = `DeKT-${de.chuong}-${lopInfo.class_code || de.class_id}.docx`.replace(/[^A-Za-z0-9_.-]/g, '_');
  return new NextResponse(new Uint8Array(buf), {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename="${fileName}"; filename*=UTF-8''${encodeURIComponent(fileName)}`,
    },
  });
}

/**
 * Xử lý HTTP POST: kiểm tra đăng nhập/quyền hạn, nhận dữ liệu mới / xử lý và trả về JSON cho trình duyệt.
 */
export async function POST(req: Request) {
  const db = supabaseServer();
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  const { data: { user } } = await db.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
  // Truy vấn Supabase: đọc dữ liệu từ bảng profiles
  const { data: prof } = await db.from('profiles').select('role, full_name').eq('id', user.id).maybeSingle();
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  if (!laVaiTroGV(prof?.role)) return NextResponse.json({ error: 'Chỉ giáo viên' }, { status: 403 });

  const de = (await req.json().catch(() => null)) as DeKiemTraData | null;
  if (!de || !de.class_id || !Array.isArray(de.cau_hoi) || !de.cau_hoi.length) {
    return NextResponse.json({ error: 'Dữ liệu đề không hợp lệ' }, { status: 400 });
  }
  const lopInfo = await kiemTraQuyenLop(db, de.class_id);
  if (!lopInfo) return NextResponse.json({ error: 'Không có quyền truy cập lớp này' }, { status: 403 });

  const admin = supabaseAdmin();
  const tenMucMap = await taiTenMuc(admin);
  const buf = await taoFileWordDeKiemTra({
    de,
    tenLop: tenHienThiLop(lopInfo),
    tenGV: prof?.full_name,
    tenMucMap,
  });

  // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
  const fileName = `DeKT-${de.chuong}-${lopInfo.class_code || de.class_id}.docx`.replace(/[^A-Za-z0-9_.-]/g, '_');
  return new NextResponse(new Uint8Array(buf), {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename="${fileName}"; filename*=UTF-8''${encodeURIComponent(fileName)}`,
    },
  });
}
