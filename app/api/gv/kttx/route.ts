/**
 * FILE NÀY LÀM GÌ: API phía giáo viên quản lý bài KTTX, cấp signed URL xem ảnh, duyệt bài (ghi Sổ lỗi) và chặn quyền ghi nếu là vai trò dự giờ.
 * AI DÙNG: máy chủ (API)
 * ĐỊA CHỈ TRÊN WEB: /api/gv/kttx
 * LẤY DỮ LIỆU TỪ: kttx_bai_nop, kttx, profiles, kttx_bai, de_kiem_tra, students, error_dictionary, kttx_cau_chi_tiet
 * GỌI TỚI: @/lib/supabase/server, @/lib/gv/lopCuaToi, @/lib/gv/xacThucApi, @/lib/soatLoiMayChu, @/lib/khkt/kttx
 */
import { NextResponse } from 'next/server';
import { supabaseAdmin, supabaseServer } from '@/lib/supabase/server';
import { chonLopTu, laVaiTroGV, lopCuaToi } from '@/lib/gv/lopCuaToi';
import { giaoVienCuaLop } from '@/lib/gv/xacThucApi';
import { ghiLoiTuBaiLam } from '@/lib/soatLoiMayChu';
import {
  chuanHoaMaLoi,
  chuanHoaTrangThaiKTTX,
  chuyenDeKiemTraSangKhungCau,
  gomNhomLoiKTTX,
  tinhThongKeBaiKTTX,
  tinhThongKeNghienCuuKTTX,
  type CauKTTX,
  type KhungCauKTTX,
} from '@/lib/khkt/kttx';

export const dynamic = 'force-dynamic';

/**
 * Hàm `donAnhHetHanLop(admin, classIds)`: xử lý dữ liệu đầu vào và trả kết quả.
 */
async function donAnhHetHanLop(admin: ReturnType<typeof supabaseAdmin>, classIds: string[]) {
  if (!classIds.length) return;
  try {
    const { data: expired } = await admin
      .from('kttx_bai_nop')
      .select('id, anh_paths')
      .in('class_id', classIds)
      .eq('anh_da_xoa', false)
      .lte('het_han_anh', new Date().toISOString())
      .limit(30);
    if (!expired?.length) return;
    const paths = expired.flatMap((r: any) => (Array.isArray(r.anh_paths) ? r.anh_paths : [])).filter(Boolean);
    // Thao tác Supabase Storage: truy cập kho ảnh riêng tư (bucket) kttx
    if (paths.length) await admin.storage.from('kttx').remove(paths).catch(() => {});
    await admin
      .from('kttx_bai_nop')
      .update({ anh_da_xoa: true, anh_paths: [] })
      .in('id', expired.map((r: any) => r.id));
  } catch {
    /* chưa chạy SQL 57 */
  }
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
  const { data: prof } = await db.from('profiles').select('role').eq('id', user.id).maybeSingle();
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  if (!laVaiTroGV(prof?.role)) return NextResponse.json({ error: 'Chỉ giáo viên mới xem được.' }, { status: 403 });

  const lops = await lopCuaToi(db);
  if (!lops.length) {
    return NextResponse.json({ baiList: [], deKiemTraList: [], baiNopList: [], errorDictionary: [], thongKe: null });
  }

  const url = new URL(req.url);
  const lopParam = url.searchParams.get('lop');
  const baiIdParam = url.searchParams.get('baiId');
  const chon = chonLopTu(lops, lopParam, null, false);
  const lop = chon.lop;
  if (!lop) {
    return NextResponse.json({ error: 'Không có quyền truy cập lớp.' }, { status: 403 });
  }

  const admin = supabaseAdmin();
  await donAnhHetHanLop(admin, [lop.class_id]);

  try {
    const [{ data: bais, error: errBai }, { data: des }, { data: sts }, { data: dict }] = await Promise.all([
      admin.from('kttx_bai').select('*').eq('class_id', lop.class_id).order('tao_luc', { ascending: false }).limit(50),
      admin.from('de_kiem_tra').select('id, tieu_de, chuong, cau_hoi, tao_luc').eq('class_id', lop.class_id).order('tao_luc', { ascending: false }).limit(30),
      admin.from('students').select('student_id, display_name').eq('class_id', lop.class_id),
      admin.from('error_dictionary').select('error_code, ku_id, misconception').order('error_code'),
    ]);

    if (errBai) {
      return NextResponse.json({
        chuaCoBang: true,
        baiList: [],
        deKiemTraList: des ?? [],
        baiNopList: [],
        errorDictionary: dict ?? [],
        thongKe: null,
        vaiTro: lop.vai_tro,
      });
    }

    let qNop = admin
      .from('kttx_bai_nop')
      .select('*')
      .eq('class_id', lop.class_id)
      .order('tao_luc', { ascending: false })
      .limit(250);
    if (baiIdParam) {
      qNop = qNop.eq('bai_id', baiIdParam);
    }

    const { data: nopRows } = await qNop;
    const list = nopRows ?? [];
    const nopIds = list.map((r: any) => r.id);
    const { data: cauRows } = nopIds.length
      ? await admin.from('kttx_cau_chi_tiet').select('*').in('bai_nop_id', nopIds).order('so_cau')
      : { data: [] as any[] };

    const cauMap = new Map<string, any[]>();
    for (const c of cauRows ?? []) {
      const arr = cauMap.get(c.bai_nop_id) ?? [];
      arr.push(c);
      cauMap.set(c.bai_nop_id, arr);
    }
    const tenHS = new Map((sts ?? []).map((s: any) => [s.student_id, s.display_name || s.student_id]));

    const baiNopList = await Promise.all(
      list.map(async (r: any) => {
        const paths = Array.isArray(r.anh_paths) ? r.anh_paths : [];
        const signedUrls: string[] = [];
        if (!r.anh_da_xoa && paths.length) {
          for (const p of paths) {
            try {
              // Thao tác Supabase Storage: truy cập kho ảnh riêng tư (bucket) kttx
              const s = await admin.storage.from('kttx').createSignedUrl(String(p), 900);
              if (s.data?.signedUrl) signedUrls.push(s.data.signedUrl);
            } catch {}
          }
        }
        const hsCauMap = new Map<number, any>(
          Array.isArray(r.diem_cau_hs) ? r.diem_cau_hs.map((x: any) => [Number(x?.soCau), x]) : []
        );
        const tt = chuanHoaTrangThaiKTTX(r.trang_thai);
        const cacCauRows = cauMap.get(r.id) ?? [];
        const cacCau: CauKTTX[] = cacCauRows.map((c: any) => {
          const hsO = hsCauMap.get(c.so_cau);
          return {
            soCau: c.so_cau,
            noiDungNgan: c.noi_dung_ngan,
            kuId: c.ku_id,
            maLoiGoiY: c.ma_loi_duyet ?? c.ma_loi_goi_y,
            diemDat: c.diem_gv_sua ?? hsO?.diemDat ?? c.diem_dat,
            diemToiDa: c.diem_toi_da,
            nhanXetGV: c.nhan_xet_gv ?? '',
            doTinCay: Number(c.do_tin_cay ?? 0.8),
            ghiChuHs: hsO?.ghiChuHs ?? c.ghi_chu_hs,
          };
        });
        return {
          ...r,
          trang_thai: tt,
          ten_hs: tenHS.get(r.student_id) ?? r.student_id,
          anh_urls: signedUrls,
          cacCau,
          cauDoiChieu: cacCauRows.map((c: any) => ({
            diem_ai: c.diem_dat != null ? Number(c.diem_dat) : null,
            diem_chot: c.diem_gv_sua != null ? Number(c.diem_gv_sua) : null,
          })),
        };
      })
    );

    const thongKe = tinhThongKeBaiKTTX(
      baiNopList.map((b: any) => ({
        student_id: b.student_id,
        ten_hs: b.ten_hs,
        trang_thai: b.trang_thai,
        tong_diem: b.tong_diem_excel ?? b.tong_diem_gv ?? b.tong_diem_hs ?? b.tong_diem_tren_bai ?? b.tong_diem_ai ?? null,
        can_kiem_tra: Boolean(b.can_kiem_tra),
        cac_cau: b.cacCau,
      })),
      (sts ?? []).length
    );

    const thongKeNghienCuu = tinhThongKeNghienCuuKTTX(
      baiNopList.map((b: any) => ({
        trang_thai: b.trang_thai,
        tong_diem_ai: b.tong_diem_ai ?? null,
        tong_diem_hs: b.tong_diem_hs ?? null,
        tong_diem_excel: b.tong_diem_excel ?? null,
        hs_ly_do_bao_sai: b.hs_ly_do_bao_sai ?? null,
        cau_doi_chieu: b.cauDoiChieu ?? [],
      }))
    );

    return NextResponse.json({
      baiList: bais ?? [],
      deKiemTraList: des ?? [],
      baiNopList,
      errorDictionary: dict ?? [],
      thongKe,
      thongKeNghienCuu,
      vaiTro: lop.vai_tro,
      siSoLop: (sts ?? []).length,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Lỗi tải dữ liệu KTTX.' }, { status: 400 });
  }
}

/**
 * Xử lý HTTP POST: kiểm tra đăng nhập/quyền hạn, nhận dữ liệu mới / xử lý và trả về JSON cho trình duyệt.
 */
export async function POST(req: Request) {
  const b = await req.json().catch(() => null);
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  const auth = await giaoVienCuaLop(b?.lop);
  if ('loi' in auth) return auth.loi;
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  if (auth.lopInfo.vai_tro === 'du-gio') {
    return NextResponse.json({ error: 'Giáo viên dự giờ chỉ được xem, không được tạo bài KTTX.' }, { status: 403 });
  }

  const tieuDe = String(b?.tieuDe ?? '').trim().slice(0, 180);
  if (!tieuDe) return NextResponse.json({ error: 'Cần nhập tên bài KTTX.' }, { status: 400 });

  const admin = supabaseAdmin();
  let khungCau: KhungCauKTTX[] = Array.isArray(b?.khungCau) ? b.khungCau : [];
  const deId = b?.deId ? String(b.deId).trim() : null;

  if (deId && !khungCau.length) {
    const { data: de } = await admin
      .from('de_kiem_tra')
      .select('id, class_id, cau_hoi')
      .eq('id', deId)
      .maybeSingle();
    if (de && de.class_id === auth.lop) {
      khungCau = chuyenDeKiemTraSangKhungCau(Array.isArray(de.cau_hoi) ? de.cau_hoi : []);
    }
  }

  const { data: created, error } = await admin
    .from('kttx_bai')
    .insert({
      class_id: auth.lop,
      de_id: deId,
      tieu_de: tieuDe,
      chuong: b?.chuong ? String(b.chuong).trim().slice(0, 20) : null,
      ngay_thi: /^\d{4}-\d{2}-\d{2}$/.test(String(b?.ngayThi ?? '')) ? String(b.ngayThi) : null,
      thang_diem: Math.max(1, Math.min(100, Number(b?.thangDiem ?? 10) || 10)),
      khung_cau: khungCau,
      tao_boi: auth.user.id,
    })
    .select('*')
    .single();

  if (error) {
    return NextResponse.json(
      { error: /does not exist|schema cache/i.test(error.message) ? 'Chưa chạy SQL 57-kttx.sql.' : error.message },
      { status: 400 }
    );
  }
  return NextResponse.json({ ok: true, bai: created });
}

/**
 * Xử lý HTTP PATCH: kiểm tra đăng nhập/quyền hạn, cập nhật từng phần và trả về JSON cho trình duyệt.
 */
export async function PATCH(req: Request) {
  const b = await req.json().catch(() => null);
  const action = String(b?.action ?? 'duyet');
  const admin = supabaseAdmin();

  if (action === 'duyet-hang-loat') {
    // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
    const auth = await giaoVienCuaLop(b?.lop);
    if ('loi' in auth) return auth.loi;
    // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
    if (auth.lopInfo.vai_tro === 'du-gio') {
      return NextResponse.json({ error: 'Giáo viên dự giờ chỉ được xem, không được duyệt bài.' }, { status: 403 });
    }
    const ids: string[] = Array.isArray(b?.ids) ? b.ids.map((x: unknown) => String(x)).filter(Boolean) : [];
    if (!ids.length) return NextResponse.json({ error: 'Chưa chọn bài nào để duyệt.' }, { status: 400 });

    const { data: rows } = await admin
      .from('kttx_bai_nop')
      .select('id, bai_id, student_id, class_id, tong_diem_gv, tong_diem_hs, tong_diem_tren_bai, tong_diem_ai, tong_diem_excel, da_ghi_so_loi')
      .eq('class_id', auth.lop)
      .in('id', ids);

    let soDaDuyet = 0;
    let soLoiDaGhi = 0;

    for (const r of rows ?? []) {
      // Truy vấn Supabase: đọc dữ liệu từ bảng kttx_cau_chi_tiet
      const { data: cauRows } = await admin.from('kttx_cau_chi_tiet').select('*').eq('bai_nop_id', r.id);
      let khungCau: KhungCauKTTX[] = [];
      if (r.bai_id) {
        // Truy vấn Supabase: đọc dữ liệu từ bảng kttx_bai
        const { data: baiRow } = await admin.from('kttx_bai').select('khung_cau').eq('id', r.bai_id).maybeSingle();
        if (Array.isArray(baiRow?.khung_cau)) khungCau = baiRow.khung_cau as KhungCauKTTX[];
      }

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

      if (!r.da_ghi_so_loi) {
        const nhomLoi = gomNhomLoiKTTX(cacCau, khungCau);
        const byKu = new Map<string, string[]>();
        for (const nl of nhomLoi) {
          const ku = nl.kuId || '';
          const arr = byKu.get(ku) ?? [];
          for (let i = 0; i < nl.soCauList.length; i++) arr.push(nl.errorCode);
          byKu.set(ku, arr);
        }
        for (const [ku, codes] of byKu) {
          await ghiLoiTuBaiLam(admin, r.student_id, codes, ku, null);
          soLoiDaGhi += codes.length;
        }
      }

      await admin
        .from('kttx_bai_nop')
        .update({
          trang_thai: 'da-chot',
          tong_diem_gv: r.tong_diem_excel ?? r.tong_diem_gv ?? r.tong_diem_hs ?? r.tong_diem_tren_bai ?? r.tong_diem_ai,
          can_kiem_tra: false,
          gv_duyet_boi: auth.user.id,
          gv_duyet_luc: new Date().toISOString(),
          da_ghi_so_loi: true,
          cap_nhat: new Date().toISOString(),
        })
        .eq('id', r.id);
      soDaDuyet += 1;
    }

    return NextResponse.json({ ok: true, soDaDuyet, soLoiDaGhi });
  }

  // Duyệt hoặc từ chối 1 bài nộp (cho phép thầy cô chỉnh điểm từng câu & gán mã lỗi chính xác)
  const id = String(b?.id ?? '').trim();
  if (!id) return NextResponse.json({ error: 'Thiếu mã bài nộp.' }, { status: 400 });
  // Truy vấn Supabase: đọc dữ liệu từ bảng kttx_bai_nop
  const { data: row } = await admin.from('kttx_bai_nop').select('*').eq('id', id).maybeSingle();
  if (!row) return NextResponse.json({ error: 'Không tìm thấy bài nộp.' }, { status: 404 });

  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  const auth = await giaoVienCuaLop(row.class_id);
  if ('loi' in auth) return auth.loi;
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  if (auth.lopInfo.vai_tro === 'du-gio') {
    return NextResponse.json({ error: 'Giáo viên dự giờ chỉ được xem, không được sửa/duyệt bài.' }, { status: 403 });
  }

  const trangThaiMoi = b?.trangThai === 'tu-choi' ? 'tu-choi' : 'da-chot';
  const nhanXetGv = b?.nhanXetGv == null ? null : String(b.nhanXetGv).trim().slice(0, 1000);
  const cacCauInput = Array.isArray(b?.cacCau) ? b.cacCau : [];

  if (cacCauInput.length) {
    for (const c of cacCauInput) {
      // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
      const soCau = Math.round(Number(c?.soCau ?? 0));
      if (!soCau) continue;
      const diemSua = c?.diemDat == null || c?.diemDat === '' ? null : Number(c.diemDat);
      const maLoiDuyet = c?.maLoiGoiY ? chuanHoaMaLoi(c.maLoiGoiY) : null;
      await admin
        .from('kttx_cau_chi_tiet')
        .update({
          diem_gv_sua: diemSua != null && Number.isFinite(diemSua) ? diemSua : null,
          ma_loi_duyet: maLoiDuyet,
          ku_id: c?.kuId ? String(c.kuId).trim() : null,
          nhan_xet_gv: c?.nhanXetGV ? String(c.nhanXetGV).trim().slice(0, 500) : null,
        })
        .eq('bai_nop_id', id)
        .eq('so_cau', soCau);
    }
  }

  let khungCau: KhungCauKTTX[] = [];
  if (row.bai_id) {
    // Truy vấn Supabase: đọc dữ liệu từ bảng kttx_bai
    const { data: baiRow } = await admin.from('kttx_bai').select('khung_cau').eq('id', row.bai_id).maybeSingle();
    if (Array.isArray(baiRow?.khung_cau)) khungCau = baiRow.khung_cau as KhungCauKTTX[];
  }

  // Truy vấn Supabase: đọc dữ liệu từ bảng kttx_cau_chi_tiet
  const { data: cauSauSua } = await admin.from('kttx_cau_chi_tiet').select('*').eq('bai_nop_id', id).order('so_cau');
  const cacCauChuan: CauKTTX[] = (cauSauSua ?? []).map((c: any) => ({
    soCau: c.so_cau,
    noiDungNgan: c.noi_dung_ngan,
    kuId: c.ku_id,
    maLoiGoiY: c.ma_loi_duyet ?? c.ma_loi_goi_y,
    diemDat: c.diem_gv_sua ?? c.diem_dat,
    diemToiDa: c.diem_toi_da,
    nhanXetGV: c.nhan_xet_gv ?? '',
    doTinCay: Number(c.do_tin_cay ?? 0.8),
  }));

  let soLoiDaGhi = 0;
  let daGhiSoLoi = Boolean(row.da_ghi_so_loi);
  if (trangThaiMoi === 'da-chot' && !daGhiSoLoi) {
    const nhomLoi = gomNhomLoiKTTX(cacCauChuan, khungCau);
    const byKu = new Map<string, string[]>();
    for (const nl of nhomLoi) {
      const ku = nl.kuId || '';
      const arr = byKu.get(ku) ?? [];
      for (let i = 0; i < nl.soCauList.length; i++) arr.push(nl.errorCode);
      byKu.set(ku, arr);
    }
    for (const [ku, codes] of byKu) {
      await ghiLoiTuBaiLam(admin, row.student_id, codes, ku, null);
      soLoiDaGhi += codes.length;
    }
    daGhiSoLoi = true;
  }

  const tongMoi =
    b?.tongDiemGv != null && b?.tongDiemGv !== '' && Number.isFinite(Number(b.tongDiemGv))
      ? Number(b.tongDiemGv)
      : row.tong_diem_excel != null
        ? Number(row.tong_diem_excel)
        : Math.round(cacCauChuan.reduce((s, c) => s + (c.diemDat ?? 0), 0) * 100) / 100;

  const { data: updated, error } = await admin
    .from('kttx_bai_nop')
    .update({
      trang_thai: trangThaiMoi,
      tong_diem_gv: tongMoi,
      nhan_xet_gv: nhanXetGv,
      can_kiem_tra: false,
      gv_duyet_boi: auth.user.id,
      gv_duyet_luc: new Date().toISOString(),
      da_ghi_so_loi: daGhiSoLoi,
      cap_nhat: new Date().toISOString(),
    })
    .eq('id', id)
    .select('*')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true, item: { ...updated, cacCau: cacCauChuan }, soLoiDaGhi });
}
