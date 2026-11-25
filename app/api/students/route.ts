/**
 * FILE NÀY LÀM GÌ: API máy chủ tiếp nhận yêu cầu từ trình duyệt, kiểm tra quyền và làm việc với cơ sở dữ liệu Supabase / AI.
 * AI DÙNG: máy chủ (API)
 * ĐỊA CHỈ TRÊN WEB: /api/students
 * LẤY DỮ LIỆU TỪ: profiles, students
 * GỌI TỚI: @/lib/supabase/server, @/lib/gv/lopCuaToi
 */
import { NextResponse } from 'next/server';
import { supabaseServer, supabaseAdmin } from '@/lib/supabase/server';
import { kiemTraQuyenLop, laVaiTroGV } from '@/lib/gv/lopCuaToi';

export const dynamic = 'force-dynamic';

const DOMAIN = process.env.NEXT_PUBLIC_STUDENT_EMAIL_DOMAIN ?? 'hs.dfle.local';

/**
 * Giáo viên tạo tài khoản cho học sinh trong lớp mình.
 *
 * Học sinh KHÔNG khai email cá nhân. Hệ thống ghép một email nội bộ
 * <ma_hoc_sinh>@<ma_lop>.<DOMAIN> chỉ để làm định danh đăng nhập cho Supabase Auth.
 * Trường display_name nên dùng tên gọi trong lớp, không nhất thiết là họ tên đầy đủ.
 */
export async function POST(req: Request) {
  const supabase = supabaseServer();
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).maybeSingle();
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  if (!laVaiTroGV(profile?.role)) {
    return NextResponse.json({ error: 'Chỉ giáo viên mới tạo được tài khoản học sinh' }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const classId: string = body?.classId;
  const list: Array<{ studentCode: string; displayName?: string; password: string }> =
    Array.isArray(body?.students) ? body.students : [];
  if (!classId || !list.length) return NextResponse.json({ error: 'Thiếu dữ liệu' }, { status: 400 });
  if (list.length > 60) return NextResponse.json({ error: 'Tối đa 60 học sinh mỗi lần' }, { status: 400 });

  // xác nhận lớp thuộc quyền phụ trách
  const cls = await kiemTraQuyenLop(supabase, classId);
  if (!cls) return NextResponse.json({ error: 'Lớp không thuộc quyền quản lý của tài khoản này' }, { status: 403 });

  const admin = supabaseAdmin();
  const done: string[] = [];
  const failed: { code: string; reason: string }[] = [];

  for (const s of list) {
    const code = String(s.studentCode || '').trim().toLowerCase();
    // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
    if (!/^[a-z0-9._-]{2,32}$/.test(code)) {
      failed.push({ code: s.studentCode, reason: 'Mã học sinh chỉ gồm chữ thường, số, dấu . _ -' });
      continue;
    }
    if (!s.password || s.password.length < 6) {
      failed.push({ code, reason: 'Mật khẩu phải từ 6 ký tự' });
      continue;
    }

    const email = `${code}@${cls.class_code.toLowerCase()}.${DOMAIN}`;
    const { data: created, error: authErr } = await admin.auth.admin.createUser({
      email,
      password: s.password,
      email_confirm: true,
      user_metadata: { role: 'hoc-sinh', class_id: classId }
    });
    if (authErr || !created?.user) {
      failed.push({ code, reason: authErr?.message ?? 'Không tạo được tài khoản' });
      continue;
    }

    // Truy vấn Supabase: thêm hoặc cập nhật (upsert) bảng students
    const { error: sErr } = await admin.from('students').upsert(
      { student_id: code, class_id: classId, display_name: s.displayName?.trim() || code },
      { onConflict: 'student_id' }
    );
    if (sErr) { failed.push({ code, reason: sErr.message }); continue; }

    const profileRow: Record<string, any> = {
      id: created.user.id,
      role: 'hoc-sinh',
      student_id: code,
      class_id: classId
    };
    if (cls.school_id) profileRow.school_id = cls.school_id;
    // Truy vấn Supabase: thêm hoặc cập nhật (upsert) bảng profiles
    let { error: pErr } = await admin.from('profiles').upsert(
      profileRow,
      { onConflict: 'id' }
    );
    // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
    if (pErr && cls.school_id && /school_id/i.test(pErr.message)) {
      delete profileRow.school_id;
      // Truy vấn Supabase: thêm hoặc cập nhật (upsert) bảng profiles
      ({ error: pErr } = await admin.from('profiles').upsert(profileRow, { onConflict: 'id' }));
    }
    if (pErr) { failed.push({ code, reason: pErr.message }); continue; }

    done.push(code);
  }

  return NextResponse.json({ created: done, failed });
}
