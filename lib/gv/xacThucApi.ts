/**
 * FILE NÀY LÀM GÌ: Mô-đun TypeScript/JavaScript hỗ trợ xử lý dữ liệu và nghiệp vụ trong hệ thống FlipMath 9.
 * AI DÙNG: giáo viên
 * LẤY DỮ LIỆU TỪ: profiles
 * GỌI TỚI: @/lib/supabase/server, @/lib/gv/lopCuaToi
 */
import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import {
  kiemTraQuyenLop,
  laQuanTri,
  laVaiTroGV,
  type VaiTro
} from '@/lib/gv/lopCuaToi';

/** Giáo viên / quản trị đăng nhập và có quyền trên lớp `lop`. Trả lỗi dạng NextResponse nếu không. */
export async function giaoVienCuaLop(lop: unknown) {
  const db = supabaseServer();
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  const { data: { user } } = await db.auth.getUser();
  if (!user) return { loi: NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 }) } as const;
  const { data: p } = await db
    .from('profiles')
    .select('role, school_id')
    .eq('id', user.id)
    .maybeSingle();
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  if (!laVaiTroGV(p?.role)) {
    return { loi: NextResponse.json({ error: 'Chỉ giáo viên được làm việc này' }, { status: 403 }) } as const;
  }
  if (typeof lop !== 'string' || !lop) {
    return { loi: NextResponse.json({ error: 'Thiếu lớp' }, { status: 400 }) } as const;
  }
  const lopInfo = await kiemTraQuyenLop(db, lop);
  if (!lopInfo) {
    return { loi: NextResponse.json({ error: 'Thầy cô không phụ trách lớp này' }, { status: 403 }) } as const;
  }
  return {
    db,
    user,
    lop,
    lopInfo,
    role: p!.role as VaiTro,
    schoolId: (p?.school_id ?? null) as string | null
  } as const;
}

/** Xác thực tài khoản quản trị trường hoặc quản trị hệ thống cho API route. */
export async function batBuocQuanTriApi() {
  const db = supabaseServer();
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  const { data: { user } } = await db.auth.getUser();
  if (!user) return { loi: NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 }) } as const;
  const { data: p } = await db
    .from('profiles')
    .select('role, school_id')
    .eq('id', user.id)
    .maybeSingle();
  if (!laQuanTri(p?.role)) {
    return { loi: NextResponse.json({ error: 'Chỉ quản trị trường mới được thực hiện' }, { status: 403 }) } as const;
  }
  return {
    db,
    user,
    role: p!.role as VaiTro,
    schoolId: (p?.school_id ?? null) as string | null
  } as const;
}
