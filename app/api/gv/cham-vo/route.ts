/**
 * FILE NÀY LÀM GÌ: API máy chủ phục vụ giáo viên xử lý dữ liệu lớp học, thống kê hoặc thao tác quản lý trên Supabase.
 * AI DÙNG: máy chủ (API)
 * ĐỊA CHỈ TRÊN WEB: /api/gv/cham-vo
 * LẤY DỮ LIỆU TỪ: profiles, cham_vo_luot, students
 * GỌI TỚI: @/lib/supabase/server, @/lib/gv/lopCuaToi, @/lib/gv/xacThucApi
 */
import { NextResponse } from 'next/server';
import { supabaseAdmin, supabaseServer } from '@/lib/supabase/server';
import { chonLopTu, laVaiTroGV, lopCuaToi, tenHienThiLop } from '@/lib/gv/lopCuaToi';
import { giaoVienCuaLop } from '@/lib/gv/xacThucApi';

export const dynamic = 'force-dynamic';

/**
 * Xử lý HTTP GET: kiểm tra đăng nhập/quyền hạn, đọc dữ liệu và trả về JSON cho trình duyệt.
 */
export async function GET(req: Request) {
  const db = supabaseServer();
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  const { data: { user } } = await db.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
  // Truy vấn Supabase: đọc dữ liệu từ bảng profiles
  const { data: p } = await db.from('profiles').select('role').eq('id', user.id).maybeSingle();
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  if (!laVaiTroGV(p?.role)) return NextResponse.json({ error: 'Chỉ giáo viên' }, { status: 403 });

  const lops = await lopCuaToi(db);
  if (!lops.length) {
    return NextResponse.json({
      items: [],
      thongKe: { tongLuot: 0, daCham: 0, daRaSoat: 0, soAiChamSai: 0, doChinhXacPct: null },
    });
  }

  const url = new URL(req.url);
  const lopParam = url.searchParams.get('lop');
  const chon = chonLopTu(lops, lopParam, null, true);
  const classIds = chon.classIds;
  const admin = supabaseAdmin();

  // Dọn ảnh quá hạn 30 ngày trong Storage
  try {
    const { data: expired } = await admin
      .from('cham_vo_luot')
      .select('id, anh_path')
      .in('class_id', classIds)
      .eq('anh_da_xoa', false)
      .not('anh_path', 'is', null)
      .lte('het_han_anh', new Date().toISOString())
      .limit(20);
    if (expired?.length) {
      const paths = expired.map((r) => r.anh_path).filter((x): x is string => Boolean(x));
      if (paths.length) await admin.storage.from('cham-vo').remove(paths).catch(() => {});
      // Truy vấn Supabase: cập nhật dữ liệu ở bảng cham_vo_luot
      await admin.from('cham_vo_luot').update({ anh_da_xoa: true, anh_path: null }).in('id', expired.map((r) => r.id));
    }
  } catch {
    /* bỏ qua nếu bảng chưa chạy migration 54 */
  }

  const { data: rows, error } = await admin
    .from('cham_vo_luot')
    .select('*')
    .in('class_id', classIds)
    .order('tao_luc', { ascending: false })
    .limit(120);

  if (error) {
    return NextResponse.json({
      items: [],
      chuaCoBang: true,
      thongBao: 'Chưa chạy file supabase/54-cham-vo.sql nên chưa có dữ liệu chấm vở.',
      thongKe: { tongLuot: 0, daCham: 0, daRaSoat: 0, soAiChamSai: 0, doChinhXacPct: null },
    });
  }

  const list = rows ?? [];
  const sids = Array.from(new Set(list.map((r) => r.student_id)));
  const { data: stRows } = sids.length
    ? await admin.from('students').select('student_id, display_name').in('student_id', sids)
    : { data: [] as any[] };
  const tenHS = new Map((stRows ?? []).map((s) => [s.student_id, s.display_name || s.student_id]));
  const tenLopMap = new Map(lops.map((l) => [l.class_id, tenHienThiLop(l)]));

  const items = await Promise.all(
    list.map(async (r: any) => {
      let anhUrl: string | null = null;
      if (r.anh_path && !r.anh_da_xoa) {
        try {
          const signed = await admin.storage.from('cham-vo').createSignedUrl(r.anh_path, 900);
          if (!signed.error) anhUrl = signed.data?.signedUrl ?? null;
        } catch {
          anhUrl = null;
        }
      }
      return {
        ...r,
        ten_hs: tenHS.get(r.student_id) ?? r.student_id,
        ten_lop: tenLopMap.get(r.class_id) ?? r.class_id,
        anh_url: anhUrl,
      };
    })
  );

  const daCham = list.filter((r) => r.trang_thai_luot === 'da-cham');
  const daRaSoat = daCham.filter((r) => r.gv_xac_nhan_luc != null || r.ai_cham_sai === true);
  const soAiChamSai = daCham.filter((r) => r.ai_cham_sai === true).length;
  const doChinhXacPct = daRaSoat.length
    ? Math.round(((daRaSoat.length - soAiChamSai) * 1000) / daRaSoat.length) / 10
    : null;

  return NextResponse.json({
    items,
    thongKe: {
      tongLuot: list.length,
      daCham: daCham.length,
      daRaSoat: daRaSoat.length,
      soAiChamSai,
      doChinhXacPct,
    },
  });
}

/**
 * Xử lý HTTP PATCH: kiểm tra đăng nhập/quyền hạn, cập nhật từng phần và trả về JSON cho trình duyệt.
 */
export async function PATCH(req: Request) {
  const b = await req.json().catch(() => null);
  const id = String(b?.id ?? '').trim();
  if (!id) return NextResponse.json({ error: 'Thiếu mã lượt chấm.' }, { status: 400 });

  const admin = supabaseAdmin();
  // Truy vấn Supabase: đọc dữ liệu từ bảng cham_vo_luot
  const { data: row } = await admin.from('cham_vo_luot').select('id, class_id').eq('id', id).maybeSingle();
  if (!row) return NextResponse.json({ error: 'Không tìm thấy lượt chấm.' }, { status: 404 });

  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  const auth = await giaoVienCuaLop(row.class_id);
  if ('loi' in auth) return auth.loi;

  // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
  const diemGv = b?.diemGv === '' || b?.diemGv == null ? null : Math.max(0, Math.min(10, Number(b.diemGv)));
  const nhanXetGv = b?.nhanXetGv == null ? null : String(b.nhanXetGv).trim().slice(0, 1000);
  const aiChamSai = Boolean(b?.aiChamSai);
  const lyDoAiSai = aiChamSai ? String(b?.lyDoAiSai ?? '').trim().slice(0, 500) : null;

  const { data: updated, error } = await admin
    .from('cham_vo_luot')
    .update({
      diem_gv: Number.isFinite(diemGv as number) ? diemGv : null,
      nhan_xet_gv: nhanXetGv,
      ai_cham_sai: aiChamSai,
      ly_do_ai_sai: lyDoAiSai,
      gv_xac_nhan_boi: auth.user.id,
      gv_xac_nhan_luc: new Date().toISOString(),
    })
    .eq('id', id)
    .select('*')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true, item: updated });
}
