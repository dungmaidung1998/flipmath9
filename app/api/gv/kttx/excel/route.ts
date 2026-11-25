/**
 * FILE NÀY LÀM GÌ: API máy chủ tải file Excel mẫu danh sách lớp và đọc/đối chiếu/chốt bảng điểm KTTX từ file .xlsx cho giáo viên.
 * AI DÙNG: máy chủ (API) — dùng exceljs ở server, không đưa xuống trình duyệt
 * ĐỊA CHỈ TRÊN WEB: /api/gv/kttx/excel
 * LẤY DỮ LIỆU TỪ: students, kttx_bai, kttx_bai_nop, kttx_cau_chi_tiet, learning_events
 * GỌI TỚI: @/lib/supabase/server, @/lib/gv/xacThucApi, @/lib/soatLoiMayChu, @/lib/khkt/kttx, @/lib/khkt/kttxExcel, @/lib/dfle/ngay.js
 */
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { giaoVienCuaLop } from '@/lib/gv/xacThucApi';
import { ghiLoiTuBaiLam } from '@/lib/soatLoiMayChu';
import {
  gomNhomLoiKTTX,
  type CauKTTX,
  type KhungCauKTTX,
} from '@/lib/khkt/kttx';
import {
  docBangDiemExcel,
  doiChieuBangDiemExcel,
  taoFileMauExcelKTTX,
  TOI_DA_BYTES_EXCEL,
} from '@/lib/khkt/kttxExcel';
// @ts-ignore
import { homNayVN } from '@/lib/dfle/ngay.js';

export const dynamic = 'force-dynamic';

/**
 * Helper ghi lỗi từ các câu KTTX vào Sổ lỗi khi bài chính thức chuyển sang `da-chot`.
 */
async function ghiSoLoiNeuChuaGhi(
  admin: ReturnType<typeof supabaseAdmin>,
  baiNopId: string,
  studentId: string,
  khungCau: KhungCauKTTX[]
) {
  const { data: cauRows } = await admin
    .from('kttx_cau_chi_tiet')
    .select('*')
    .eq('bai_nop_id', baiNopId);
  const cacCau: CauKTTX[] = (cauRows ?? []).map((c: any) => ({
    soCau: c.so_cau,
    noiDungNgan: c.noi_dung_ngan,
    kuId: c.ku_id,
    maLoiGoiY: c.ma_loi_duyet ?? c.ma_loi_goi_y,
    diemDat: c.diem_gv_sua ?? c.diem_dat,
    diemToiDa: c.diem_toi_da,
    nhanXetGV: c.nhan_xet_gv ?? '',
    doTinCay: Number(c.do_tin_cay ?? 0.8),
  }));
  const nhomLoi = gomNhomLoiKTTX(cacCau, khungCau);
  const byKu = new Map<string, string[]>();
  for (const nl of nhomLoi) {
    const ku = nl.kuId || '';
    const arr = byKu.get(ku) ?? [];
    for (let i = 0; i < nl.soCauList.length; i++) arr.push(nl.errorCode);
    byKu.set(ku, arr);
  }
  let daGhi = 0;
  for (const [ku, codes] of byKu) {
    await ghiLoiTuBaiLam(admin, studentId, codes, ku, null);
    daGhi += codes.length;
  }
  return daGhi;
}

/**
 * GET /api/gv/kttx/excel?lop=...&baiId=... — Xuất file mẫu `.xlsx` gồm STT | Mã HS | Họ và tên | Điểm cho lớp.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const lop = url.searchParams.get('lop');
  const baiId = url.searchParams.get('baiId');

  const auth = await giaoVienCuaLop(lop);
  if ('loi' in auth) return auth.loi;

  const admin = supabaseAdmin();
  const [{ data: sts }, { data: baiRow }] = await Promise.all([
    admin.from('students').select('student_id, display_name').eq('class_id', auth.lop).order('student_id'),
    baiId
      ? admin.from('kttx_bai').select('tieu_de, class_id').eq('id', baiId).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const tenBai = baiRow && baiRow.class_id === auth.lop ? String(baiRow.tieu_de ?? '') : '';
  const buf = await taoFileMauExcelKTTX(tenBai, (sts ?? []) as any[]);
  const safeName = `mau-diem-kttx-${auth.lop}`.replace(/[^a-zA-Z0-9_-]/g, '-');

  return new NextResponse(new Uint8Array(buf), {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${safeName}.xlsx"`,
      'Cache-Control': 'no-store',
    },
  });
}

/**
 * POST /api/gv/kttx/excel — Đọc file `.xlsx` (xem-truoc hoặc chot), đối chiếu 4 nhóm và lưu điểm chính thức + sự kiện `kttx_chot`.
 */
export async function POST(req: Request) {
  const form = await req.formData().catch(() => null);
  if (!form) {
    return NextResponse.json({ error: 'Yêu cầu gửi dữ liệu dạng multipart/form-data.' }, { status: 400 });
  }

  const lop = String(form.get('lop') ?? '').trim();
  const baiId = String(form.get('baiId') ?? '').trim();
  const mode = String(form.get('mode') ?? 'xem-truoc') === 'chot' ? 'chot' : 'xem-truoc';
  const file = form.get('file');

  const auth = await giaoVienCuaLop(lop);
  if ('loi' in auth) return auth.loi;
  if (auth.lopInfo.vai_tro === 'du-gio') {
    return NextResponse.json({ error: 'Giáo viên dự giờ chỉ được xem, không được chốt bảng điểm.' }, { status: 403 });
  }

  if (!baiId) {
    return NextResponse.json({ error: 'Vui lòng chọn đúng bài KTTX cần chốt điểm.' }, { status: 400 });
  }
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Vui lòng chọn tệp Excel (.xlsx).' }, { status: 400 });
  }
  if (!file.name.toLowerCase().endsWith('.xlsx')) {
    return NextResponse.json({ error: 'Chỉ chấp nhận tệp định dạng .xlsx.' }, { status: 400 });
  }
  if (file.size <= 0 || file.size > TOI_DA_BYTES_EXCEL) {
    return NextResponse.json({ error: 'Kích thước tệp .xlsx phải nằm trong khoảng 1 B – 2 MB.' }, { status: 400 });
  }

  const admin = supabaseAdmin();
  const { data: baiRow, error: errBai } = await admin
    .from('kttx_bai')
    .select('id, class_id, tieu_de, thang_diem, khung_cau')
    .eq('id', baiId)
    .maybeSingle();

  if (errBai) {
    return NextResponse.json({ error: 'Chưa chạy SQL 57/58 trên Supabase.' }, { status: 400 });
  }
  if (!baiRow || baiRow.class_id !== auth.lop) {
    return NextResponse.json({ error: 'Không tìm thấy bài KTTX thuộc lớp này.' }, { status: 404 });
  }

  let dongExcel;
  try {
    const arrBuf = await file.arrayBuffer();
    dongExcel = await docBangDiemExcel(arrBuf, {
      thangDiem: Number(baiRow.thang_diem ?? 10) || 10,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Không đọc được tệp Excel.' }, { status: 400 });
  }

  const [{ data: sts }, { data: nops }] = await Promise.all([
    admin.from('students').select('student_id, display_name').eq('class_id', auth.lop),
    admin
      .from('kttx_bai_nop')
      .select('id, student_id, trang_thai, tong_diem_ai, tong_diem_hs, tong_diem_tren_bai, tong_diem_gv, tong_diem_excel, hs_ly_do_bao_sai, chua_co_anh, da_ghi_so_loi')
      .eq('class_id', auth.lop)
      .eq('bai_id', baiId)
      .order('tao_luc', { ascending: false }),
  ]);

  const ketQua = doiChieuBangDiemExcel(dongExcel, (sts ?? []) as any[], (nops ?? []) as any[]);

  if (mode === 'xem-truoc') {
    return NextResponse.json({ ok: true, mode: 'xem-truoc', ketQua });
  }

  const khungCau: KhungCauKTTX[] = Array.isArray(baiRow.khung_cau) ? (baiRow.khung_cau as KhungCauKTTX[]) : [];
  const nopMap = new Map((nops ?? []).map((n: any) => [n.id, n]));
  const nowIso = new Date().toISOString();
  const homNay = homNayVN();

  let soChotKhop = 0;
  let soDanhDauLech = 0;
  let soChotChuaCoAnh = 0;
  let soLoiDaGhi = 0;

  // 1. Nhóm Khớp → chuyển da-chot và ghi Sổ lỗi (nếu chưa ghi)
  for (const item of ketQua.khop) {
    const existing = nopMap.get(item.bai_nop_id);
    if (existing && !existing.da_ghi_so_loi) {
      soLoiDaGhi += await ghiSoLoiNeuChuaGhi(admin, item.bai_nop_id, item.student_id, khungCau);
    }
    await admin
      .from('kttx_bai_nop')
      .update({
        trang_thai: 'da-chot',
        tong_diem_excel: item.diem_excel,
        tong_diem_gv: item.diem_excel,
        excel_tai_luc: nowIso,
        excel_tai_boi: auth.user.id,
        can_kiem_tra: false,
        gv_duyet_boi: auth.user.id,
        gv_duyet_luc: nowIso,
        da_ghi_so_loi: true,
        cap_nhat: nowIso,
      })
      .eq('id', item.bai_nop_id);
    soChotKhop += 1;
  }

  // 2. Nhóm Lệch → đánh dấu 'lech', giữ can_kiem_tra = true để giáo viên mở ảnh chọn điểm đúng
  for (const item of ketQua.lech) {
    await admin
      .from('kttx_bai_nop')
      .update({
        trang_thai: 'lech',
        tong_diem_excel: item.diem_excel,
        excel_tai_luc: nowIso,
        excel_tai_boi: auth.user.id,
        can_kiem_tra: true,
        cap_nhat: nowIso,
      })
      .eq('id', item.bai_nop_id);
    soDanhDauLech += 1;
  }

  // 3. Nhóm có điểm Excel nhưng em chưa nộp hoặc chưa xác nhận → chốt bằng điểm Excel
  for (const item of ketQua.chuaNopHoacChuaXacNhan) {
    if (item.bai_nop_id) {
      const existing = nopMap.get(item.bai_nop_id);
      if (existing && !existing.da_ghi_so_loi) {
        soLoiDaGhi += await ghiSoLoiNeuChuaGhi(admin, item.bai_nop_id, item.student_id, khungCau);
      }
      await admin
        .from('kttx_bai_nop')
        .update({
          trang_thai: 'da-chot',
          tong_diem_excel: item.diem_excel,
          tong_diem_gv: item.diem_excel,
          excel_tai_luc: nowIso,
          excel_tai_boi: auth.user.id,
          can_kiem_tra: false,
          gv_duyet_boi: auth.user.id,
          gv_duyet_luc: nowIso,
          da_ghi_so_loi: true,
          chua_co_anh: item.chuaCoAnh,
          cap_nhat: nowIso,
        })
        .eq('id', item.bai_nop_id);
    } else {
      await admin.from('kttx_bai_nop').insert({
        bai_id: baiId,
        student_id: item.student_id,
        class_id: auth.lop,
        ngay: homNay,
        so_trang: 0,
        anh_paths: [],
        anh_da_xoa: false,
        chua_co_anh: true,
        trang_thai: 'da-chot',
        tong_diem_excel: item.diem_excel,
        tong_diem_gv: item.diem_excel,
        excel_tai_luc: nowIso,
        excel_tai_boi: auth.user.id,
        gv_duyet_boi: auth.user.id,
        gv_duyet_luc: nowIso,
        da_ghi_so_loi: false,
      });
    }
    soChotChuaCoAnh += 1;
  }

  // Ghi sự kiện nghiên cứu không chứa điểm hay họ tên học sinh
  try {
    await admin.from('learning_events').insert({
      student_id: null,
      ku_id: null,
      event_type: 'kttx_chot',
      duration_active_sec: null,
      payload: {
        class_id: auth.lop,
        bai_id: baiId,
        khop: soChotKhop,
        lech: soDanhDauLech,
        chua_co_anh: soChotChuaCoAnh,
        khong_ghep: ketQua.khongGhepDuoc.length,
      },
    });
  } catch {
    /* Không làm gián đoạn luồng chốt nếu bảng sự kiện hạn chế ghi */
  }

  return NextResponse.json({
    ok: true,
    mode: 'chot',
    soChotKhop,
    soDanhDauLech,
    soChotChuaCoAnh,
    soLoiDaGhi,
    ketQua,
  });
}
