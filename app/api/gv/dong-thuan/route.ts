/**
 * FILE NÀY LÀM GÌ: API máy chủ phục vụ giáo viên xử lý dữ liệu lớp học, thống kê hoặc thao tác quản lý trên Supabase.
 * AI DÙNG: máy chủ (API)
 * ĐỊA CHỈ TRÊN WEB: /api/gv/dong-thuan
 * LẤY DỮ LIỆU TỪ: students, learning_events
 * GỌI TỚI: @/lib/supabase/server, @/lib/gv/xacThucApi
 */
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { giaoVienCuaLop } from '@/lib/gv/xacThucApi';

export const dynamic = 'force-dynamic';

const HOP_LE = new Set(['chua', 'dong-y', 'tu-choi']);

type MucDongThuan = {
  student_id: string;
  consent_status: 'chua' | 'dong-y' | 'tu-choi';
};

/**
 * Cập nhật trạng thái đồng thuận (consent_status) cho học sinh trong một lớp.
 * POST { lop, ds: [{ student_id, consent_status }] }
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
  const { user, lop, lopInfo, role } = x;

  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  if (lopInfo.vai_tro === 'du-gio') {
    return NextResponse.json(
      { error: 'Giáo viên dự giờ chỉ được xem, không được sửa trạng thái đồng thuận của lớp.' },
      { status: 403 }
    );
  }

  if (!Array.isArray(b?.ds) || b.ds.length === 0 || b.ds.length > 200) {
    return NextResponse.json({ error: 'Danh sách cập nhật không hợp lệ.' }, { status: 400 });
  }

  const theoMa = new Map<string, 'chua' | 'dong-y' | 'tu-choi'>();
  for (const item of b.ds) {
    const sid = typeof item?.student_id === 'string' ? item.student_id.trim() : '';
    // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
    const st = typeof item?.consent_status === 'string' ? item.consent_status.trim() : '';
    if (!sid || !HOP_LE.has(st)) {
      return NextResponse.json(
        { error: 'Giá trị đồng thuận chỉ chấp nhận: chua, dong-y hoặc tu-choi.' },
        { status: 400 }
      );
    }
    // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
    theoMa.set(sid, st as MucDongThuan['consent_status']);
  }

  const ids = Array.from(theoMa.keys());
  const admin = supabaseAdmin();

  const { data: hienCo, error: errRead } = await admin
    .from('students')
    .select('student_id, consent_status')
    .eq('class_id', lop)
    .in('student_id', ids);

  if (errRead) {
    return NextResponse.json({ error: 'Không đọc được danh sách học sinh.' }, { status: 500 });
  }

  if (!hienCo || hienCo.length !== ids.length) {
    return NextResponse.json({ error: 'Có học sinh không thuộc lớp này.' }, { status: 403 });
  }

  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  const trangThaiCu = new Map(hienCo.map((r: any) => [String(r.student_id), String(r.consent_status)]));
  const theoTrangThaiMoi = new Map<'chua' | 'dong-y' | 'tu-choi', string[]>();
  const thayDoi: { student_id: string; from: string; to: string }[] = [];

  for (const [sid, moi] of theoMa.entries()) {
    const cu = trangThaiCu.get(sid) ?? 'chua';
    if (cu !== moi) {
      thayDoi.push({ student_id: sid, from: cu, to: moi });
    }
    const list = theoTrangThaiMoi.get(moi) ?? [];
    list.push(sid);
    theoTrangThaiMoi.set(moi, list);
  }

  for (const [st, groupIds] of theoTrangThaiMoi.entries()) {
    const { error: errUpd } = await admin
      .from('students')
      .update({ consent_status: st })
      .eq('class_id', lop)
      .in('student_id', groupIds);
    if (errUpd) {
      return NextResponse.json({ error: 'Không lưu được trạng thái đồng thuận.' }, { status: 500 });
    }
  }

  if (thayDoi.length > 0) {
    const nowIso = new Date().toISOString();
    await admin
      .from('learning_events')
      .insert(
        thayDoi.map((ch) => ({
          student_id: ch.student_id,
          ku_id: null,
          event_type: 'consent_change',
          payload: {
            actor_id: user.id,
            actor_role: role,
            class_id: lop,
            from: ch.from,
            to: ch.to,
            changed_at: nowIso,
          },
        }))
      )
      .then(() => {}, () => {});
  }

  return NextResponse.json({
    ok: true,
    updated: thayDoi.length,
    ds: ids.map((sid) => ({ student_id: sid, consent_status: theoMa.get(sid)! })),
  });
}
