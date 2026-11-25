/**
 * FILE NÀY LÀM GÌ: API lưu và thống kê các lượt thực hành đo chiều cao thực tế Chương IV của học sinh.
 * AI DÙNG: máy chủ (API)
 * ĐỊA CHỈ TRÊN WEB: /api/do-chieu-cao
 * LẤY DỮ LIỆU TỪ: profiles, vat_moc, do_chieu_cao, students, learning_events
 * GỌI TỚI: @/lib/supabase/server, @/lib/soatLoiMayChu, @/lib/do-chieu-cao/tinh
 */
import { NextResponse } from 'next/server';
import { supabaseAdmin, supabaseServer } from '@/lib/supabase/server';
import { ghiLoiTuBaiLam } from '@/lib/soatLoiMayChu';
import {
  chieuCaoHaiDiem,
  chieuCaoMotDiem,
  kiemTraKetQuaHS,
  nhanDienMaLoiDoChieuCao,
  type CachDoChieuCao,
} from '@/lib/do-chieu-cao/tinh';

export const dynamic = 'force-dynamic';

/**
 * Xử lý HTTP GET: kiểm tra đăng nhập/quyền hạn, đọc dữ liệu và trả về JSON cho trình duyệt.
 */
export async function GET() {
  const db = supabaseServer();
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  const { data: { user } } = await db.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });

  const { data: prof } = await db
    .from('profiles')
    .select('student_id, class_id')
    .eq('id', user.id)
    .maybeSingle();

  const admin = supabaseAdmin();
  try {
    const classId = prof?.class_id ?? null;
    const [{ data: vatMoc }, { data: lichSu }] = await Promise.all([
      classId
        ? admin.from('vat_moc').select('id, ten, h_that, cach_do_that').eq('class_id', classId).order('tao_luc', { ascending: false })
        : Promise.resolve({ data: [] as any[] }),
      prof?.student_id
        ? admin
            .from('do_chieu_cao')
            .select('id, ten_vat, cach_do, d, a, alpha1, alpha2, m, h_tinh, h_hs_nhap, hs_dung, nguon_goc, tao_luc')
            .eq('student_id', prof.student_id)
            .order('tao_luc', { ascending: false })
            .limit(12)
        : Promise.resolve({ data: [] as any[] }),
    ]);
    return NextResponse.json({ vatMoc: vatMoc ?? [], lichSu: lichSu ?? [] });
  } catch {
    return NextResponse.json({ vatMoc: [], lichSu: [] });
  }
}

/**
 * Xử lý HTTP POST: kiểm tra đăng nhập/quyền hạn, nhận dữ liệu mới / xử lý và trả về JSON cho trình duyệt.
 */
export async function POST(req: Request) {
  const db = supabaseServer();
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  const { data: { user } } = await db.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });

  const { data: prof } = await db
    .from('profiles')
    .select('student_id, class_id, role')
    .eq('id', user.id)
    .maybeSingle();

  const body = await req.json().catch(() => null);
  const cachDo: CachDoChieuCao = body?.cachDo === 'hai-diem' ? 'hai-diem' : 'mot-diem';
  const d = Number(body?.d);
  const a = Number(body?.a);
  const alpha1 = Number(body?.alpha1);
  const alpha2 = Number(body?.alpha2);
  const m = Number(body?.m);
  const hHsNhap = Number(body?.hHsNhap);
  const tenVat = String(body?.tenVat ?? 'Vật đo').trim().slice(0, 120) || 'Vật đo';
  const vatId = typeof body?.vatId === 'string' && body.vatId ? body.vatId : null;
  const nguonGoc = body?.nguonGoc === 'cam-bien' ? 'cam-bien' : 'thanh-truot';
  const doLechGoc = Number.isFinite(Number(body?.doLechGoc)) ? Number(body.doLechGoc) : 0;
  const tangGoiYDaMo =
    Number.isInteger(body?.tangGoiYDaMo) && body.tangGoiYDaMo >= 1 && body.tangGoiYDaMo <= 3
      ? Number(body.tangGoiYDaMo)
      : null;

  let hTinh = 0;
  try {
    hTinh =
      cachDo === 'mot-diem'
        ? chieuCaoMotDiem(d, alpha1, m)
        : chieuCaoHaiDiem(a, alpha1, alpha2, m);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Số liệu đo không hợp lệ.' }, { status: 400 });
  }

  if (!Number.isFinite(hHsNhap) || hHsNhap <= 0) {
    return NextResponse.json({ error: 'Chiều cao tự tính chưa hợp lệ.' }, { status: 400 });
  }

  const hsDung = kiemTraKetQuaHS(hHsNhap, hTinh);
  const loi = nhanDienMaLoiDoChieuCao({
    cachDo,
    hHsNhap,
    hTinh,
    d: cachDo === 'mot-diem' ? d : 0,
    a: cachDo === 'hai-diem' ? a : 0,
    alpha1,
    alpha2: cachDo === 'hai-diem' ? alpha2 : 0,
    m,
  });

  if (!prof?.student_id) {
    return NextResponse.json({
      ok: true,
      hsDung,
      hTinh,
      maLoi: loi?.maLoi ?? null,
      banGhi: null,
    });
  }

  const admin = supabaseAdmin();
  let classId = prof.class_id ?? '';
  if (!classId) {
    const { data: st } = await admin
      .from('students')
      .select('class_id')
      .eq('student_id', prof.student_id)
      .maybeSingle();
    classId = String(st?.class_id ?? '');
  }

  // Vật mốc phải thuộc đúng lớp của em; không thì coi như đo vật tự chọn (không gắn vật mốc)
  let vatIdHopLe: string | null = null;
  if (vatId && classId) {
    const { data: vm } = await admin.from('vat_moc').select('id').eq('id', vatId).eq('class_id', classId).maybeSingle();
    vatIdHopLe = vm?.id ? String(vm.id) : null;
  }

  let banGhi: any = null;
  if (classId) {
    try {
      const { data: inserted } = await admin
        .from('do_chieu_cao')
        .insert({
          student_id: prof.student_id,
          class_id: classId,
          vat_id: vatIdHopLe,
          ten_vat: tenVat,
          cach_do: cachDo,
          d: cachDo === 'mot-diem' ? d : null,
          a: cachDo === 'hai-diem' ? a : null,
          alpha1,
          alpha2: cachDo === 'hai-diem' ? alpha2 : null,
          m,
          h_tinh: hTinh,
          h_hs_nhap: hHsNhap,
          hs_dung: hsDung,
          nguon_goc: nguonGoc,
          do_lech_goc: doLechGoc,
        })
        .select('id, ten_vat, cach_do, d, a, alpha1, alpha2, m, h_tinh, h_hs_nhap, hs_dung, nguon_goc, tao_luc')
        .single();
      banGhi = inserted ?? null;
    } catch {
      /* Bỏ qua nếu chưa chạy SQL 56 */
    }
  }

  try {
    // Truy vấn Supabase: thêm bản ghi vào bảng learning_events
    await admin.from('learning_events').insert({
      student_id: prof.student_id,
      ku_id: 'C4-B12-M3',
      event_type: 'do_chieu_cao',
      payload: {
        cach_do: cachDo,
        hs_dung: hsDung,
        nguon_goc: nguonGoc,
        ma_loi: loi?.maLoi ?? null,
      },
    });
  } catch {
    /* bỏ qua */
  }

  if (loi?.maLoi) {
    try {
      await ghiLoiTuBaiLam(admin, prof.student_id, [loi.maLoi], 'C4-B12-M3', null);
    } catch {
      /* không để thiếu mã lỗi mới làm hỏng kết quả */
    }
  }

  // Ghi / cập nhật chỉ số tự lực (goi_y_su_kien) cho nguồn 'do-chieu-cao'
  try {
    const { ghiHoacCapNhatGoiYDoChieuCao } = await import('@/lib/khkt/ghiGoiYSuKien');
    await ghiHoacCapNhatGoiYDoChieuCao(admin, {
      studentId: prof.student_id,
      classId,
      kuId: 'C4-B12-M3',
      tang: tangGoiYDaMo,
      errorCode: loi?.maLoi ?? null,
      hsDung,
    });
  } catch {
    /* chưa có bảng goi_y_su_kien thì bỏ qua */
  }

  return NextResponse.json({
    ok: true,
    hsDung,
    hTinh,
    maLoi: loi?.maLoi ?? null,
    banGhi,
  });
}
