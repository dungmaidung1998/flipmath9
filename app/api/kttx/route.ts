/**
 * FILE NÀY LÀM GÌ: API phía học sinh nộp ảnh bài KTTX (tối đa 5 ảnh/ngày, lưu riêng tư 30 ngày) và rà soát điểm do Claude AI đọc.
 * AI DÙNG: máy chủ (API)
 * ĐỊA CHỈ TRÊN WEB: /api/kttx
 * LẤY DỮ LIỆU TỪ: kttx_bai_nop, kttx, profiles, students, kttx_bai, error_dictionary, kttx_cau_chi_tiet
 * GỌI TỚI: @/lib/supabase/server, @/lib/ai/nhaCungCap, @/lib/ai/claude, @/lib/khkt/kttx, @/lib/dfle/ngay.js
 */
import { NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { supabaseAdmin, supabaseServer } from '@/lib/supabase/server';
import { docBaiKTTX } from '@/lib/ai/nhaCungCap';
import { aiChamVoBat, coKhoaClaude, type MediaTypeAnh } from '@/lib/ai/claude';
import {
  chuanHoaKetQuaDocKTTX,
  chuanHoaTrangThaiKTTX,
  kiemTraChuyenTrangThaiHS,
  kiemTraDiemCauHopLe,
  type CauKTTX,
  type KhungCauKTTX,
} from '@/lib/khkt/kttx';
// @ts-ignore
import { homNayVN } from '@/lib/dfle/ngay.js';

export const dynamic = 'force-dynamic';

const GIOI_HAN_ANH_NGAY = 5;
const TOI_DA_BYTES_TRANG = 1_048_576;

const MEDIA_HOP_LE = new Set<MediaTypeAnh>(['image/jpeg', 'image/png', 'image/webp']);

/**
 * Hàm `donAnhHetHanCuaHS(admin, studentId)`: xử lý dữ liệu đầu vào và trả kết quả.
 */
async function donAnhHetHanCuaHS(admin: ReturnType<typeof supabaseAdmin>, studentId: string) {
  try {
    const { data: expired } = await admin
      .from('kttx_bai_nop')
      .select('id, anh_paths')
      .eq('student_id', studentId)
      .eq('anh_da_xoa', false)
      .lte('het_han_anh', new Date().toISOString())
      .limit(20);
    if (!expired?.length) return;
    const paths = expired.flatMap((r: any) => (Array.isArray(r.anh_paths) ? r.anh_paths : [])).filter(Boolean);
    // Thao tác Supabase Storage: truy cập kho ảnh riêng tư (bucket) kttx
    if (paths.length) await admin.storage.from('kttx').remove(paths).catch(() => {});
    await admin
      .from('kttx_bai_nop')
      .update({ anh_da_xoa: true, anh_paths: [] })
      .in('id', expired.map((r: any) => r.id));
  } catch {
    /* bảng 57 chưa chạy */
  }
}

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

  if (!prof?.student_id) {
    return NextResponse.json({ error: 'Trang này dành cho học sinh.' }, { status: 403 });
  }

  const admin = supabaseAdmin();
  // Xử lý mốc ngày giờ theo múi giờ Việt Nam (UTC+7)
  const homNay = homNayVN();
  await donAnhHetHanCuaHS(admin, prof.student_id);

  let chuaCoBang = false;
  let baiList: any[] = [];
  let mySubmissions: any[] = [];
  let daDungHomNay = 0;
  let consentStatus = 'chua';

  try {
    const [{ data: st }, { data: bais, error: errBai }, { data: nops, error: errNop }, { data: dict }] =
      await Promise.all([
        admin.from('students').select('consent_status, class_id').eq('student_id', prof.student_id).maybeSingle(),
        prof.class_id
          ? admin.from('kttx_bai').select('id, tieu_de, chuong, ngay_thi, thang_diem, khung_cau').eq('class_id', prof.class_id).order('tao_luc', { ascending: false }).limit(30)
          : Promise.resolve({ data: [], error: null }),
        admin.from('kttx_bai_nop').select('*').eq('student_id', prof.student_id).order('tao_luc', { ascending: false }).limit(30),
        admin.from('error_dictionary').select('error_code, ku_id, misconception').order('error_code'),
      ]);

    // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
    consentStatus = String(st?.consent_status ?? 'chua');
    if (errBai || errNop) chuaCoBang = true;
    baiList = bais ?? [];

    const nopIds = (nops ?? []).map((n: any) => n.id);
    const { data: cauRows } = nopIds.length
      ? await admin.from('kttx_cau_chi_tiet').select('*').in('bai_nop_id', nopIds).order('so_cau')
      : { data: [] as any[] };
    const cauByNop = new Map<string, any[]>();
    for (const c of cauRows ?? []) {
      const arr = cauByNop.get(c.bai_nop_id) ?? [];
      arr.push(c);
      cauByNop.set(c.bai_nop_id, arr);
    }

    mySubmissions = (nops ?? []).map((n: any) => {
      const tt = chuanHoaTrangThaiKTTX(n.trang_thai);
      const hsCauMap = new Map<number, any>(
        Array.isArray(n.diem_cau_hs) ? n.diem_cau_hs.map((x: any) => [Number(x?.soCau), x]) : []
      );
      return {
        ...n,
        trang_thai: tt,
        cacCau: (cauByNop.get(n.id) ?? []).map((c: any) => {
          const hsO = hsCauMap.get(c.so_cau);
          const diemHien =
            tt === 'da-chot'
              ? (c.diem_gv_sua ?? hsO?.diemDat ?? c.diem_dat)
              : (hsO?.diemDat ?? c.diem_gv_sua ?? c.diem_dat);
          return {
            soCau: c.so_cau,
            noiDungNgan: c.noi_dung_ngan,
            kuId: c.ku_id,
            maLoiGoiY: c.ma_loi_duyet ?? c.ma_loi_goi_y,
            diemDat: diemHien,
            diemToiDa: c.diem_toi_da,
            nhanXetGV: c.nhan_xet_gv ?? '',
            doTinCay: Number(c.do_tin_cay ?? 0.8),
            ghiChuHs: hsO?.ghiChuHs ?? c.ghi_chu_hs,
          };
        }),
      };
    });

    daDungHomNay = (nops ?? [])
      .filter((n: any) => n.ngay === homNay)
      .reduce((s: number, n: any) => s + Number(n.so_trang ?? 1), 0);

    return NextResponse.json({
      chuaCoBang,
      baiList,
      mySubmissions,
      errorDictionary: dict ?? [],
      quota: {
        daDungHomNay,
        gioiHanNgay: GIOI_HAN_ANH_NGAY,
        conLaiHomNay: Math.max(0, GIOI_HAN_ANH_NGAY - daDungHomNay),
        consentStatus,
        coKhoaClaude: coKhoaClaude(),
        aiBat: aiChamVoBat(),
      },
    });
  } catch {
    return NextResponse.json({
      chuaCoBang: true,
      baiList: [],
      mySubmissions: [],
      errorDictionary: [],
      quota: {
        daDungHomNay: 0,
        gioiHanNgay: GIOI_HAN_ANH_NGAY,
        conLaiHomNay: GIOI_HAN_ANH_NGAY,
        consentStatus: 'chua',
        coKhoaClaude: coKhoaClaude(),
        aiBat: aiChamVoBat(),
      },
    });
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
    .select('student_id, class_id')
    .eq('id', user.id)
    .maybeSingle();

  if (!prof?.student_id) {
    return NextResponse.json({ error: 'Chỉ học sinh mới nộp ảnh KTTX ở đây.' }, { status: 403 });
  }

  const admin = supabaseAdmin();
  const sid = prof.student_id;
  const b = await req.json().catch(() => null);
  const action = String(b?.action ?? 'doc-va-luu');

  if (action === 'cap-nhat-sua' || action === 'xac-nhan-hs' || action === 'bao-sai-hs') {
    const baiNopId = String(b?.baiNopId ?? '').trim();
    const rawCau = Array.isArray(b?.cacCau) ? b.cacCau : [];
    const tongTrenBai = b?.tongDiemTrenBai == null ? null : Number(b.tongDiemTrenBai);
    const lyDoBaoSai = String(b?.lyDoBaoSai ?? '').trim().slice(0, 200);
    if (!baiNopId) return NextResponse.json({ error: 'Thiếu mã bài nộp.' }, { status: 400 });
    if (action === 'bao-sai-hs' && !lyDoBaoSai) {
      return NextResponse.json({ error: 'Vui lòng nhập lý do ngắn gọn (tối đa 200 ký tự) khi báo sai.' }, { status: 400 });
    }

    const { data: existing } = await admin
      .from('kttx_bai_nop')
      .select('id, student_id, trang_thai, bai_id, tong_diem_ai')
      .eq('id', baiNopId)
      .maybeSingle();

    if (!existing || existing.student_id !== sid) {
      return NextResponse.json({ error: 'Không tìm thấy bài nộp.' }, { status: 404 });
    }
    const quyenSua = kiemTraChuyenTrangThaiHS(existing.trang_thai, action);
    if (!quyenSua.hopLe) {
      return NextResponse.json({ error: quyenSua.lyDo }, { status: 400 });
    }

    let khungCau: KhungCauKTTX[] = [];
    if (existing.bai_id) {
      // Truy vấn Supabase: đọc dữ liệu từ bảng kttx_bai
      const { data: baiRow } = await admin.from('kttx_bai').select('khung_cau').eq('id', existing.bai_id).maybeSingle();
      if (Array.isArray(baiRow?.khung_cau)) khungCau = baiRow.khung_cau as KhungCauKTTX[];
    }

    const chuan = chuanHoaKetQuaDocKTTX(
      { tongDiemGhiTrenBai: tongTrenBai, cacCau: rawCau },
      khungCau
    );
    const kiemDiem = kiemTraDiemCauHopLe(chuan.cacCau);
    if (!kiemDiem.hopLe) {
      return NextResponse.json({ error: kiemDiem.lyDo }, { status: 400 });
    }

    const tongHsTuNhap = b?.tongDiemHs != null && Number.isFinite(Number(b.tongDiemHs))
      ? Math.max(0, Math.min(100, Math.round(Number(b.tongDiemHs) * 100) / 100))
      : null;
    const tongDiemHs = chuan.cacCau.length > 0 ? kiemDiem.tongTuCong : (tongHsTuNhap ?? existing.tong_diem_ai ?? null);
    const trangThaiMoi = action === 'bao-sai-hs' ? 'hs-bao-sai' : 'hs-xac-nhan';
    const nowIso = new Date().toISOString();

    const diemCauHsJson = chuan.cacCau.map((c: CauKTTX) => ({
      soCau: c.soCau,
      diemDat: c.diemDat,
      diemToiDa: c.diemToiDa,
      ghiChuHs: c.ghiChuHs ?? null,
    }));

    const { data: updated, error: errUp } = await admin
      .from('kttx_bai_nop')
      .update({
        trang_thai: trangThaiMoi,
        tong_diem_hs: tongDiemHs,
        diem_cau_hs: diemCauHsJson,
        hs_xac_nhan_luc: nowIso,
        hs_ly_do_bao_sai: action === 'bao-sai-hs' ? lyDoBaoSai : null,
        tong_diem_tren_bai: chuan.tongDiemGhiTrenBai,
        cap_nhat: nowIso,
      })
      .eq('id', baiNopId)
      .select('*')
      .single();

    if (errUp) {
      return NextResponse.json({ error: errUp.message }, { status: 400 });
    }

    return NextResponse.json({
      ok: true,
      baiNop: { ...updated, cacCau: chuan.cacCau },
      ketQua: chuan,
    });
  }

  // Luồng 1: Nhận 1-4 trang ảnh JPEG -> lưu Storage private `kttx` (30 ngày) -> gọi Claude Vision
  const { data: st } = await admin
    .from('students')
    .select('consent_status, class_id')
    .eq('student_id', sid)
    .maybeSingle();

  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  if (st?.consent_status !== 'dong-y') {
    return NextResponse.json(
      { error: 'Chức năng gửi ảnh cho AI chỉ bật khi em có xác nhận đồng ý tham gia nghiên cứu (consent_status = dong-y).' },
      { status: 403 }
    );
  }

  const classId = st?.class_id ?? prof.class_id;
  if (!classId) return NextResponse.json({ error: 'Chưa xác định được lớp của em.' }, { status: 400 });

  const pagesRaw = Array.isArray(b?.pages) ? b.pages.slice(0, 4) : [];
  if (!pagesRaw.length) {
    return NextResponse.json({ error: 'Cần gửi từ 1 đến 4 ảnh trang bài KTTX.' }, { status: 400 });
  }

  const images: { imageBase64: string; mediaType: MediaTypeAnh }[] = [];
  for (let i = 0; i < pagesRaw.length; i++) {
    const p = pagesRaw[i];
    // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
    const b64 = String(p?.imageBase64 ?? '').trim().replace(/^data:image\/[a-z+]+;base64,/i, '');
    const mediaType = (MEDIA_HOP_LE.has(p?.mediaType) ? p.mediaType : 'image/jpeg') as MediaTypeAnh;
    if (!b64) return NextResponse.json({ error: `Trang ${i + 1} trống dữ liệu ảnh.` }, { status: 400 });
    const bytes = Buffer.from(b64, 'base64').byteLength;
    if (bytes > TOI_DA_BYTES_TRANG) {
      return NextResponse.json({ error: `Ảnh trang ${i + 1} vượt quá 1 MB.` }, { status: 400 });
    }
    images.push({ imageBase64: b64, mediaType });
  }

  // Xử lý mốc ngày giờ theo múi giờ Việt Nam (UTC+7)
  const homNay = homNayVN();
  const { data: trongNgay, error: errDem } = await admin
    .from('kttx_bai_nop')
    .select('so_trang')
    .eq('student_id', sid)
    .eq('ngay', homNay);

  if (errDem) {
    return NextResponse.json(
      { error: /does not exist|schema cache/i.test(errDem.message) ? 'Chưa chạy SQL 57 (57-kttx.sql) trên Supabase.' : errDem.message },
      { status: 400 }
    );
  }

  const daDung = (trongNgay ?? []).reduce((s: number, r: any) => s + Number(r.so_trang ?? 1), 0);
  if (daDung + images.length > GIOI_HAN_ANH_NGAY) {
    return NextResponse.json(
      { error: `Hôm nay em đã dùng ${daDung}/${GIOI_HAN_ANH_NGAY} ảnh KTTX. Gửi thêm ${images.length} ảnh sẽ vượt giới hạn ngày.` },
      { status: 429 }
    );
  }

  const baiId = b?.baiId ? String(b.baiId).trim() : null;
  let tenBai: string | null = null;
  let khungCau: KhungCauKTTX[] = [];
  if (baiId) {
    const { data: baiRow } = await admin
      .from('kttx_bai')
      .select('id, class_id, tieu_de, khung_cau')
      .eq('id', baiId)
      .maybeSingle();
    if (baiRow && baiRow.class_id === classId) {
      tenBai = baiRow.tieu_de;
      if (Array.isArray(baiRow.khung_cau)) khungCau = baiRow.khung_cau as KhungCauKTTX[];
    }
  }

  const { data: dict } = await admin
    .from('error_dictionary')
    .select('error_code, ku_id, misconception')
    .order('error_code');

  // Lưu các trang ảnh vào bucket riêng tư 'kttx' trước khi gọi Claude
  const batchId = randomUUID();
  const uploadedPaths: string[] = [];
  for (let i = 0; i < images.length; i++) {
    const path = `${sid}/${homNay}/${batchId}-p${i + 1}.jpg`;
    const buf = Buffer.from(images[i].imageBase64, 'base64');
    // Thao tác Supabase Storage: truy cập kho ảnh riêng tư (bucket) kttx
    const up = await admin.storage.from('kttx').upload(path, buf, {
      contentType: images[i].mediaType,
      upsert: false,
    });
    if (!up.error) uploadedPaths.push(path);
  }

  // CHỈ gọi Claude API cho tính năng KTTX
  const aiRes = await docBaiKTTX({
    images,
    tenBai,
    khungCau,
    danhSachMaLoi: (dict ?? []) as any[],
  });

  if (!aiRes.ok) {
    // Thao tác Supabase Storage: truy cập kho ảnh riêng tư (bucket) kttx
    if (uploadedPaths.length) await admin.storage.from('kttx').remove(uploadedPaths).catch(() => {});
    return NextResponse.json({ error: aiRes.error, model: aiRes.model }, { status: 422 });
  }

  const chuan = chuanHoaKetQuaDocKTTX(aiRes.duLieu, khungCau);
  // Xử lý mốc ngày giờ theo múi giờ Việt Nam (UTC+7)
  const hetHanIso = new Date(Date.now() + 30 * 86400_000).toISOString();

  const { data: inserted, error: errIns } = await admin
    .from('kttx_bai_nop')
    .insert({
      bai_id: baiId,
      student_id: sid,
      class_id: classId,
      ngay: homNay,
      so_trang: images.length,
      anh_paths: uploadedPaths,
      anh_da_xoa: false,
      het_han_anh: hetHanIso,
      ten_bai_ai: chuan.tenBaiGoiY ?? tenBai,
      ngay_thi_ai: chuan.ngayThiGoiY,
      tong_diem_ai: chuan.tongTinhDuoc,
      tong_diem_tren_bai: chuan.tongDiemGhiTrenBai,
      tong_diem_khop: chuan.tongDiemKhop,
      can_kiem_tra: chuan.canKiemTraTay,
      ly_do_kiem_tra: chuan.lyDoCanKiemTra,
      mo_hinh: aiRes.model,
      trang_thai: 'ai-nhap',
    })
    .select('*')
    .single();

  if (errIns || !inserted) {
    // Thao tác Supabase Storage: truy cập kho ảnh riêng tư (bucket) kttx
    if (uploadedPaths.length) await admin.storage.from('kttx').remove(uploadedPaths).catch(() => {});
    return NextResponse.json({ error: errIns?.message || 'Không lưu được bài KTTX.' }, { status: 400 });
  }

  if (chuan.cacCau.length) {
    // Truy vấn Supabase: thêm bản ghi vào bảng kttx_cau_chi_tiet
    await admin.from('kttx_cau_chi_tiet').insert(
      chuan.cacCau.map((c: CauKTTX) => ({
        bai_nop_id: inserted.id,
        so_cau: c.soCau,
        noi_dung_ngan: c.noiDungNgan,
        ku_id: c.kuId,
        ma_loi_goi_y: c.maLoiGoiY,
        diem_dat: c.diemDat,
        diem_toi_da: c.diemToiDa,
        nhan_xet_gv: c.nhanXetGV,
        do_tin_cay: c.doTinCay,
      }))
    );
  }

  return NextResponse.json({
    ok: true,
    baiNop: { ...inserted, cacCau: chuan.cacCau },
    ketQua: chuan,
    model: aiRes.model,
    nhaCungCap: 'claude',
  });
}
