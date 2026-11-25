/**
 * FILE NÀY LÀM GÌ: API máy chủ phục vụ giáo viên xử lý dữ liệu lớp học, thống kê hoặc thao tác quản lý trên Supabase.
 * AI DÙNG: máy chủ (API)
 * ĐỊA CHỈ TRÊN WEB: /api/gv/ho-so-nhan-xet
 * LẤY DỮ LIỆU TỪ: profiles, students, ho_so_nhan_xet
 * GỌI TỚI: @/lib/supabase/server, @/lib/gv/lopCuaToi
 */
import { NextResponse } from 'next/server';
import { supabaseAdmin, supabaseServer } from '@/lib/supabase/server';
import { kiemTraQuyenLop, laVaiTroGV } from '@/lib/gv/lopCuaToi';

export const dynamic = 'force-dynamic';

/**
 * Xử lý HTTP POST: kiểm tra đăng nhập/quyền hạn, nhận dữ liệu mới / xử lý và trả về JSON cho trình duyệt.
 */
export async function POST(req: Request) {
  const db = supabaseServer();
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  const { data: { user } } = await db.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
  // Truy vấn Supabase: đọc dữ liệu từ bảng profiles
  const { data: p } = await db.from('profiles').select('role').eq('id', user.id).maybeSingle();
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  if (!laVaiTroGV(p?.role)) return NextResponse.json({ error: 'Chỉ giáo viên' }, { status: 403 });

  const b = await req.json().catch(() => null);
  const studentId = String(b?.studentId ?? '').trim();
  const chuong = String(b?.chuong ?? '').trim();
  const nhanXet = String(b?.nhanXet ?? '').trim().slice(0, 1000);
  // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
  if (!studentId || !/^C(?:10|[1-9])$/.test(chuong)) {
    return NextResponse.json({ error: 'Thiếu mã học sinh hoặc mã chương hợp lệ.' }, { status: 400 });
  }

  const admin = supabaseAdmin();
  // Truy vấn Supabase: đọc dữ liệu từ bảng students
  const { data: st } = await admin.from('students').select('class_id').eq('student_id', studentId).maybeSingle();
  if (!st?.class_id) return NextResponse.json({ error: 'Không tìm thấy học sinh.' }, { status: 404 });

  const lop = await kiemTraQuyenLop(db, st.class_id);
  if (!lop) return NextResponse.json({ error: 'Thầy cô không phụ trách lớp của học sinh này.' }, { status: 403 });

  // Truy vấn Supabase: thêm hoặc cập nhật (upsert) bảng ho_so_nhan_xet
  const { error } = await admin.from('ho_so_nhan_xet').upsert(
    {
      student_id: studentId,
      chuong,
      nhan_xet: nhanXet,
      giao_vien: user.id,
      cap_nhat: new Date().toISOString(),
    },
    { onConflict: 'student_id,chuong' }
  );

  if (error) {
    return NextResponse.json(
      { error: `Không lưu được nhận xét (${error.message}). Kiểm tra đã chạy file supabase/53-tinh-nang-khkt.sql chưa.` },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, studentId, chuong, nhanXet });
}
