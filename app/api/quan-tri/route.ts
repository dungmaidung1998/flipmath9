/**
 * FILE NÀY LÀM GÌ: API máy chủ tiếp nhận yêu cầu từ trình duyệt, kiểm tra quyền và làm việc với cơ sở dữ liệu Supabase / AI.
 * AI DÙNG: máy chủ (API)
 * ĐỊA CHỈ TRÊN WEB: /api/quan-tri
 * LẤY DỮ LIỆU TỪ: classes, profiles, teacher_classes
 * GỌI TỚI: @/lib/supabase/server, @/lib/gv/xacThucApi, @/lib/gv/lopCuaToi
 */
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { batBuocQuanTriApi } from '@/lib/gv/xacThucApi';
import { laVaiTroGV, lopCuaToi } from '@/lib/gv/lopCuaToi';

export const dynamic = 'force-dynamic';

// Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
const VAI_TRO_LOP = new Set(['bo-mon', 'chu-nhiem', 'du-gio']);
const ARM_HOP_LE = new Set(['TN', 'DC', 'DEMO']);

/**
 * Hàm `timUserTheoEmail(email)`: xử lý dữ liệu đầu vào và trả kết quả.
 */
async function timUserTheoEmail(email: string) {
  const admin = supabaseAdmin();
  const target = email.trim().toLowerCase();
  for (let page = 1; page <= 10; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error || !data?.users?.length) break;
    const found = data.users.find((u) => (u.email ?? '').toLowerCase() === target);
    if (found) return found;
    if (data.users.length < 200) break;
  }
  return null;
}

/**
 * API quản trị trường: tạo lớp mới, gán giáo viên vào lớp, gỡ giáo viên khỏi lớp.
 * Chạy dưới quyền người dùng quản trị (qua RLS của file 51).
 */
export async function POST(req: Request) {
  const x = await batBuocQuanTriApi();
  if ('loi' in x) return x.loi;
  const { db, role, schoolId } = x;
  // Quản trị trường bắt buộc phải gắn với đúng một trường, nếu không sẽ không biết giới hạn quyền ở đâu
  if (role === 'quan-tri-truong' && !schoolId) {
    return NextResponse.json({ error: 'Tài khoản quản trị trường chưa gắn mã trường (school_id).' }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const action = String(body?.action ?? '');

  if (action === 'tao-lop') {
    const tenLop = String(body?.ten_lop ?? '').trim();
    const classCodeRaw = String(body?.class_code ?? '').trim();
    const grade = Number(body?.grade ?? 9);
    const arm = ARM_HOP_LE.has(String(body?.arm)) ? String(body.arm) : 'TN';
    const targetSchool = role === 'quan-tri-he-thong'
      ? String(body?.school_id ?? schoolId ?? 'NPH').trim()
      : (schoolId ?? '');

    if (!targetSchool) {
      return NextResponse.json({ error: 'Tài khoản quản trị trường chưa gắn mã trường (school_id).' }, { status: 403 });
    }
    if (!tenLop || tenLop.length > 30) {
      return NextResponse.json({ error: 'Tên lớp không hợp lệ (ví dụ: 9/1).' }, { status: 400 });
    }
    // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
    if (!/^[A-Za-z0-9_-]{2,24}$/.test(classCodeRaw)) {
      return NextResponse.json({ error: 'Mã đăng nhập lớp chỉ gồm chữ, số, dấu gạch ngang/dưới (ví dụ: 9A3).' }, { status: 400 });
    }
    if (!Number.isInteger(grade) || grade < 6 || grade > 12) {
      return NextResponse.json({ error: 'Khối lớp phải từ 6 đến 12.' }, { status: 400 });
    }

    const classCode = classCodeRaw.toUpperCase();
    const slug = classCode.toLowerCase();
    const classId = `${targetSchool.toLowerCase()}-${slug}`;

    const { data: moi, error } = await db
      .from('classes')
      .insert({
        class_id: classId,
        class_code: classCode,
        ten_lop: tenLop,
        grade,
        arm,
        school_id: targetSchool
      })
      .select('class_id, class_code, ten_lop, grade, arm, school_id')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ ok: true, lop: moi });
  }

  if (action === 'gan-gv') {
    const classId = String(body?.class_id ?? '').trim();
    const vaiTro = String(body?.vai_tro ?? 'bo-mon').trim();
    const teacherIdInput = String(body?.teacher_id ?? '').trim();
    const emailInput = String(body?.email ?? '').trim();

    if (!classId || !VAI_TRO_LOP.has(vaiTro)) {
      return NextResponse.json({ error: 'Thiếu lớp hoặc vai trò lớp không hợp lệ.' }, { status: 400 });
    }

    const lops = await lopCuaToi(db);
    const lop = lops.find((l) => l.class_id === classId);
    if (!lop || (role === 'quan-tri-truong' && lop.school_id !== schoolId)) {
      return NextResponse.json({ error: 'Không có quyền quản lý lớp này.' }, { status: 403 });
    }

    let teacherId = teacherIdInput;
    if (!teacherId && emailInput) {
      const user = await timUserTheoEmail(emailInput);
      if (!user) {
        return NextResponse.json({ error: `Không tìm thấy tài khoản với email "${emailInput}".` }, { status: 404 });
      }
      teacherId = user.id;
    }
    if (!teacherId) {
      return NextResponse.json({ error: 'Chọn giáo viên hoặc nhập email giáo viên.' }, { status: 400 });
    }

    const admin = supabaseAdmin();
    const { data: gvProf } = await admin
      .from('profiles')
      .select('id, role, school_id, full_name')
      .eq('id', teacherId)
      .maybeSingle();

    // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
    if (!gvProf || !laVaiTroGV(gvProf.role)) {
      return NextResponse.json({ error: 'Tài khoản này không phải vai trò giáo viên hoặc quản trị.' }, { status: 400 });
    }
    if (role === 'quan-tri-truong' && gvProf.school_id !== schoolId) {
      return NextResponse.json({ error: 'Giáo viên thuộc trường khác, không thể gán vào lớp của trường mình.' }, { status: 403 });
    }

    const { error } = await db
      .from('teacher_classes')
      .upsert(
        { teacher_id: teacherId, class_id: classId, vai_tro: vaiTro },
        { onConflict: 'teacher_id,class_id' }
      );
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  }

  if (action === 'go-gv') {
    const classId = String(body?.class_id ?? '').trim();
    const teacherId = String(body?.teacher_id ?? '').trim();
    if (!classId || !teacherId) {
      return NextResponse.json({ error: 'Thiếu thông tin lớp hoặc giáo viên.' }, { status: 400 });
    }
    const lops = await lopCuaToi(db);
    const lop = lops.find((l) => l.class_id === classId);
    if (!lop || (role === 'quan-tri-truong' && lop.school_id !== schoolId)) {
      return NextResponse.json({ error: 'Không có quyền trên lớp này.' }, { status: 403 });
    }

    const { error } = await db
      .from('teacher_classes')
      .delete()
      .eq('class_id', classId)
      .eq('teacher_id', teacherId);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: 'Thao tác không hợp lệ.' }, { status: 400 });
}
