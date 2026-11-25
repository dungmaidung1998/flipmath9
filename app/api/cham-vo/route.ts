/**
 * FILE NÀY LÀM GÌ: API chấm vở tự luận cho học sinh (đọc ảnh, chấm từng bước có giới hạn lượt/ngày) và xác nhận điểm giáo viên.
 * AI DÙNG: máy chủ (API)
 * ĐỊA CHỈ TRÊN WEB: /api/cham-vo
 * LẤY DỮ LIỆU TỪ: profiles, students, cham_vo_luot, learning_events, questions, question_options, micro_lessons, error_dictionary
 * GỌI TỚI: @/lib/supabase/server, @/lib/ai/nhaCungCap, @/lib/ai/claude, @/lib/soatLoiMayChu, @/lib/chapters, @/lib/dfle/t9-on-thi-10-buoc.js, @/lib/dfle/t9-on-thi-10.js, @/lib/dfle/ngay.js
 */
import { NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { supabaseAdmin, supabaseServer } from '@/lib/supabase/server';
import { chamAnh, trangThaiChamVoAI } from '@/lib/ai/nhaCungCap';
import type { MediaTypeAnh } from '@/lib/ai/claude';
import { ghiLoiTuBaiLam } from '@/lib/soatLoiMayChu';
import { chapterOf } from '@/lib/chapters';
// @ts-ignore
import { ON_THI_BUOC } from '@/lib/dfle/t9-on-thi-10-buoc.js';
// @ts-ignore
import { DANG_ON_THI } from '@/lib/dfle/t9-on-thi-10.js';
// @ts-ignore
import { homNayVN } from '@/lib/dfle/ngay.js';

export const dynamic = 'force-dynamic';

const GIOI_HAN_NGAY = 5;
// Giới hạn lượt CHẤM (gõ dòng bài làm, không chụp ảnh) mỗi ngày và độ dài bài gửi lên AI — chống gọi AI quá nhiều.
const GIOI_HAN_CHAM_NGAY = 20;
const TOI_DA_DONG = 30;
const TOI_DA_KY_TU_DONG = 300;
const MAX_IMAGE_BYTES = 1_048_576; // 1 MB

/**
 * Hàm `dauNgayVN(ngay)`: xử lý dữ liệu đầu vào và trả kết quả.
 */
function dauNgayVN(ngay: string): string {
  return new Date(`${ngay}T00:00:00+07:00`).toISOString();
}

/**
 * Hàm `xacThucHS(không cần tham số)`: xử lý dữ liệu đầu vào và trả kết quả.
 */
async function xacThucHS() {
  const db = supabaseServer();
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  const { data: { user } } = await db.auth.getUser();
  if (!user) return { loi: NextResponse.json({ error: 'Chưa đăng nhập.' }, { status: 401 }) } as const;

  const { data: prof } = await db
    .from('profiles')
    .select('student_id, role, class_id')
    .eq('id', user.id)
    .maybeSingle();

  if (!prof?.student_id) {
    return { loi: NextResponse.json({ error: 'Chỉ học sinh mới dùng chức năng chụp vở.' }, { status: 403 }) } as const;
  }

  const admin = supabaseAdmin();
  const { data: st } = await admin
    .from('students')
    .select('student_id, class_id, consent_status')
    .eq('student_id', prof.student_id)
    .maybeSingle();

  return {
    admin,
    studentId: prof.student_id as string,
    classId: String(st?.class_id ?? prof.class_id ?? ''),
    consentStatus: String(st?.consent_status ?? 'chua'),
  } as const;
}

/**
 * Hàm `demAnhHomNay(admin, studentId)`: xử lý dữ liệu đầu vào và trả kết quả.
 */
async function demAnhHomNay(admin: ReturnType<typeof supabaseAdmin>, studentId: string): Promise<{ daDung: number; chuaCoBang: boolean }> {
  // Xử lý mốc ngày giờ theo múi giờ Việt Nam (UTC+7)
  const tuLuc = dauNgayVN(homNayVN());
  const { count, error } = await admin
    .from('cham_vo_luot')
    .select('*', { count: 'exact', head: true })
    .eq('student_id', studentId)
    .not('anh_path', 'is', null)
    .gte('tao_luc', tuLuc);
  if (error) {
    if (error.message?.includes('cham_vo_luot') || error.code === '42P01') {
      return { daDung: 0, chuaCoBang: true };
    }
    return { daDung: 0, chuaCoBang: false };
  }
  return { daDung: count ?? 0, chuaCoBang: false };
}

/**
 * Hàm `donAnhHetHan(admin)`: xử lý dữ liệu đầu vào và trả kết quả.
 */
async function donAnhHetHan(admin: ReturnType<typeof supabaseAdmin>) {
  try {
    const nowIso = new Date().toISOString();
    const { data: expired } = await admin
      .from('cham_vo_luot')
      .select('id, anh_path')
      .eq('anh_da_xoa', false)
      .not('anh_path', 'is', null)
      .lte('het_han_anh', nowIso)
      .limit(10);
    if (!expired?.length) return;
    const paths = expired.map((r) => r.anh_path).filter((p): p is string => Boolean(p));
    if (paths.length) {
      await admin.storage.from('cham-vo').remove(paths).catch(() => {});
    }
    await admin
      .from('cham_vo_luot')
      .update({ anh_da_xoa: true, anh_path: null })
      .in('id', expired.map((r) => r.id));
  } catch {
    /* bỏ qua có chủ đích */
  }
}

/**
 * Xử lý HTTP GET: kiểm tra đăng nhập/quyền hạn, đọc dữ liệu và trả về JSON cho trình duyệt.
 */
export async function GET() {
  const hs = await xacThucHS();
  if ('loi' in hs) return hs.loi;

  const tt = trangThaiChamVoAI();
  const { daDung, chuaCoBang } = await demAnhHomNay(hs.admin, hs.studentId);
  const dongY = hs.consentStatus === 'dong-y';
  let lyDoChan = '';
  if (!tt.bat) lyDoChan = 'Tính năng chấm vở AI hiện đang tạm tắt bởi nhà trường (AI_CHAM_VO_BAT=false).';
  else if (!dongY) lyDoChan = 'Em cần phụ huynh ký phiếu đồng ý và thầy cô bật quyền cho em ở trang Tài khoản học sinh.';
  else if (daDung >= GIOI_HAN_NGAY) lyDoChan = `Em đã dùng hết ${GIOI_HAN_NGAY} lượt chụp ảnh trong hôm nay. Hãy quay lại vào ngày mai nhé!`;

  return NextResponse.json({
    bat: tt.bat,
    duDieuKien: tt.bat && dongY,
    consentOk: dongY,
    daDungHomNay: daDung,
    conLaiHomNay: Math.max(0, GIOI_HAN_NGAY - daDung),
    gioiHanNgay: GIOI_HAN_NGAY,
    lyDoChan: lyDoChan || null,
    chuaCoBang,
  });
}

/**
 * Xử lý HTTP POST: kiểm tra đăng nhập/quyền hạn, nhận dữ liệu mới / xử lý và trả về JSON cho trình duyệt.
 */
export async function POST(req: Request) {
  const hs = await xacThucHS();
  if ('loi' in hs) return hs.loi;

  const tt = trangThaiChamVoAI();
  if (!tt.bat) {
    return NextResponse.json({ error: 'Tính năng chấm vở AI đang tắt (AI_CHAM_VO_BAT=false).' }, { status: 403 });
  }
  if (hs.consentStatus !== 'dong-y') {
    return NextResponse.json(
      { error: 'Em cần phụ huynh ký phiếu đồng ý và thầy cô bật quyền cho em ở trang Tài khoản học sinh.' },
      { status: 403 }
    );
  }

  const body = await req.json().catch(() => null);
  const buoc = String(body?.buoc ?? '');
  const nguon = body?.nguon === 'van-dung' ? 'van-dung' : 'on-thi-10';
  const baiId = String(body?.baiId ?? '').trim().slice(0, 80);
  const kuIdRaw = String(body?.kuId ?? '').trim().slice(0, 80);
  const deBai = String(body?.deBai ?? '').trim().slice(0, 1200);

  if (!baiId || !deBai) {
    return NextResponse.json({ error: 'Thiếu thông tin bài toán cần chấm.' }, { status: 400 });
  }

  // ---- BƯỚC 1: ĐỌC ẢNH VỞ THÀNH CÁC DÒNG LATEX ----
  if (buoc === 'doc') {
    const { daDung } = await demAnhHomNay(hs.admin, hs.studentId);
    if (daDung >= GIOI_HAN_NGAY) {
      return NextResponse.json(
        { error: `Em đã chụp đủ ${GIOI_HAN_NGAY} ảnh hôm nay. Em vẫn có thể gõ các dòng bài làm để chấm hoặc quay lại vào ngày mai.` },
        { status: 429 }
      );
    }

    const dataUrl = String(body?.imageDataUrl ?? '');
    // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
    const m = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl);
    if (!m) {
      return NextResponse.json({ error: 'Định dạng ảnh không hợp lệ (chỉ nhận JPEG, PNG hoặc WEBP).' }, { status: 400 });
    }
    const mediaType = m[1] as MediaTypeAnh;
    const base64 = m[2];
    const buf = Buffer.from(base64, 'base64');
    if (!buf.length || buf.length > MAX_IMAGE_BYTES) {
      return NextResponse.json({ error: 'Ảnh vượt quá 1 MB sau khi nén. Em chụp gọn lại phần bài làm rồi thử lại nhé.' }, { status: 400 });
    }

    const luotId = randomUUID();
    const ext = mediaType === 'image/png' ? 'png' : mediaType === 'image/webp' ? 'webp' : 'jpg';
    const storagePath = `${hs.classId || 'lop'}/${hs.studentId}/${luotId}.${ext}`;
    let savedPath: string | null = null;

    try {
      const up = await hs.admin.storage.from('cham-vo').upload(storagePath, buf, {
        contentType: mediaType,
        upsert: false,
      });
      if (!up.error) savedPath = storagePath;
    } catch {
      /* tiếp tục ngay cả khi bucket Storage chưa được khởi tạo từ SQL 54 */
    }

    // Chỉ gửi nội dung bài Toán & ảnh sang Claude (KHÔNG gửi họ tên/mã HS)
    const kqDoc = await chamAnh({
      cheDo: 'doc',
      imageBase64: base64,
      mediaType,
      deBai,
    });

    // Xử lý mốc ngày giờ theo múi giờ Việt Nam (UTC+7)
    const hetHan = new Date(Date.now() + 30 * 86400_000).toISOString();
    const rowBase = {
      id: luotId,
      student_id: hs.studentId,
      class_id: hs.classId,
      nguon,
      bai_id: baiId,
      ku_id: kuIdRaw || null,
      de_bai: deBai,
      anh_path: savedPath,
      het_han_anh: hetHan,
      mo_hinh: kqDoc.model,
      nha_cung_cap: kqDoc.nhaCungCap,
    };

    if (!kqDoc.ok || kqDoc.cheDo !== 'doc') {
      await hs.admin
        .from('cham_vo_luot')
        .insert({ ...rowBase, trang_thai_luot: 'loi-doc', dong_ai_doc: [] })
        .then(() => {}, () => {});
      return NextResponse.json({ error: (!kqDoc.ok && kqDoc.error) || 'AI chưa đọc được, em chụp lại hoặc gõ bài' }, { status: 422 });
    }

    await hs.admin
      .from('cham_vo_luot')
      .insert({
        ...rowBase,
        trang_thai_luot: 'da-doc',
        dong_ai_doc: kqDoc.dong,
        dong_hs_sua: kqDoc.dong,
      })
      .then(() => {}, () => {});

    void donAnhHetHan(hs.admin);

    return NextResponse.json({
      ok: true,
      luotId,
      dong: kqDoc.dong,
      conLaiHomNay: Math.max(0, GIOI_HAN_NGAY - daDung - 1),
      nhaCungCap: kqDoc.nhaCungCap,
    });
  }

  // ---- BƯỚC 2: CHẤM CÁC DÒNG BÀI LÀM ----
  if (buoc === 'cham') {
    const luotId = typeof body?.luotId === 'string' && body.luotId ? body.luotId : randomUUID();
    const dongHocSinh: string[] = Array.isArray(body?.dongHocSinh)
      ? body.dongHocSinh.map((x: any) => String(x ?? '').trim()).filter(Boolean)
      : [];
    if (!dongHocSinh.length) {
      return NextResponse.json({ error: 'Em cần nhập hoặc chỉnh ít nhất một dòng bài làm trước khi chấm.' }, { status: 400 });
    }
    // Bài quá dài thì không gửi lên AI (tối đa 30 dòng, mỗi dòng 300 ký tự).
    if (dongHocSinh.length > TOI_DA_DONG || dongHocSinh.some((d) => d.length > TOI_DA_KY_TU_DONG)) {
      return NextResponse.json(
        { error: `Bài làm tối đa ${TOI_DA_DONG} dòng, mỗi dòng không quá ${TOI_DA_KY_TU_DONG} ký tự. Em rút gọn lại nhé.` },
        { status: 400 }
      );
    }

    // Đếm số lượt chấm hôm nay (giờ Việt Nam) qua sự kiện 'cham_vo_yeu_cau'; đủ 20 lượt thì hẹn ngày mai.
    {
      const { count: daCham, error: errDem } = await hs.admin
        .from('learning_events')
        .select('*', { count: 'exact', head: true })
        .eq('student_id', hs.studentId)
        .eq('event_type', 'cham_vo_yeu_cau')
        .gte('ts', dauNgayVN(homNayVN()));
      if (!errDem && (daCham ?? 0) >= GIOI_HAN_CHAM_NGAY) {
        return NextResponse.json(
          { error: `Hôm nay em đã chấm đủ ${GIOI_HAN_CHAM_NGAY} lượt. Em tự soát lại bài và quay lại vào ngày mai nhé!` },
          { status: 429 }
        );
      }
      await hs.admin
        .from('learning_events')
        .insert({ student_id: hs.studentId, ku_id: null, event_type: 'cham_vo_yeu_cau', payload: { luot_id: luotId } })
        .then(() => {}, () => {});
    }

    // Lấy lời giải chuẩn từng dòng (t9-on-thi-10-buoc.js hoặc DB)
    let loiGiaiChuan: string[] = [];
    let kuId = kuIdRaw;

    if (nguon === 'on-thi-10') {
      const buocData = (ON_THI_BUOC as Record<string, { giai?: string[]; de?: string }>)?.[baiId];
      if (Array.isArray(buocData?.giai) && buocData.giai.length) {
        loiGiaiChuan = buocData.giai;
      }
      const prefix = baiId.split('-')[0];
      const dang = (DANG_ON_THI as any[])?.find((d) => d.cau === prefix);
      if (!kuId && dang?.ku) kuId = String(dang.ku);
      if (!loiGiaiChuan.length && dang?.cauHoi) {
        const cau = dang.cauHoi.find((c: any) => c.id === baiId);
        if (Array.isArray(cau?.giai) && cau.giai.length) loiGiaiChuan = cau.giai;
        else if (cau?.loiGiai) loiGiaiChuan = [String(cau.loiGiai)];
      }
    } else {
      const [{ data: q }, { data: opts }, { data: ml }] = await Promise.all([
        hs.admin.from('questions').select('question_id, ku_id, stem, correct_option').eq('question_id', baiId).maybeSingle(),
        hs.admin.from('question_options').select('option_key, option_text').eq('question_id', baiId),
        kuId
          ? hs.admin.from('micro_lessons').select('dan, quy_tac, vi_du').eq('ku_id', kuId).limit(1).maybeSingle().then((r) => r, () => ({ data: null }))
          : Promise.resolve({ data: null }),
      ]);
      if (q) {
        if (!kuId) kuId = String(q.ku_id);
        const dapAnText = (opts ?? []).find((o) => o.option_key === q.correct_option)?.option_text;
        if (ml?.quy_tac) loiGiaiChuan.push(`Quy tắc: ${ml.quy_tac}`);
        if (ml?.vi_du) loiGiaiChuan.push(`Ví dụ tham khảo: ${ml.vi_du}`);
        if (dapAnText) loiGiaiChuan.push(`Kết quả đúng cuối cùng: ${dapAnText}`);
      }
    }

    if (!loiGiaiChuan.length) {
      loiGiaiChuan = ['Giải theo đúng quy tắc và điều kiện xác định của chương Toán 9 tương ứng.'];
    }

    const chuong = chapterOf(kuId) ?? 'C1';
    const { data: errDict } = await hs.admin
      .from('error_dictionary')
      .select('error_code, misconception')
      .like('ku_id', `${chuong}-%`);

    const kqCham = await chamAnh({
      cheDo: 'cham',
      deBai,
      loiGiaiChuan,
      danhSachMaLoi: (errDict ?? []).map((e) => ({
        error_code: String(e.error_code),
        misconception: String(e.misconception),
      })),
      dongHocSinh,
      diemToiDa: 1.0,
    });

    if (!kqCham.ok || kqCham.cheDo !== 'cham') {
      return NextResponse.json(
        { error: (!kqCham.ok && kqCham.error) || 'AI chưa đọc được, em chụp lại hoặc gõ bài' },
        { status: 422 }
      );
    }

    const ketQua = kqCham.ketQua;

    // Lưu / cập nhật bản ghi chấm vở
    const { data: existing } = await hs.admin
      .from('cham_vo_luot')
      .select('id')
      .eq('id', luotId)
      .eq('student_id', hs.studentId)
      .maybeSingle()
      .then((r) => r, () => ({ data: null }));

    if (existing?.id) {
      await hs.admin
        .from('cham_vo_luot')
        .update({
          dong_hs_sua: dongHocSinh,
          ket_qua: ketQua,
          diem_ai: ketQua.diem,
          diem_toi_da: 1.0,
          trang_thai_bai: ketQua.trangThai,
          ma_loi: ketQua.maLoi,
          trang_thai_luot: 'da-cham',
          mo_hinh: kqCham.model,
        })
        .eq('id', luotId)
        .then(() => {}, () => {});
    } else {
      await hs.admin
        .from('cham_vo_luot')
        .insert({
          id: luotId,
          student_id: hs.studentId,
          class_id: hs.classId,
          nguon,
          bai_id: baiId,
          ku_id: kuId || null,
          de_bai: deBai,
          dong_ai_doc: dongHocSinh,
          dong_hs_sua: dongHocSinh,
          ket_qua: ketQua,
          diem_ai: ketQua.diem,
          diem_toi_da: 1.0,
          trang_thai_bai: ketQua.trangThai,
          ma_loi: ketQua.maLoi,
          trang_thai_luot: 'da-cham',
          mo_hinh: kqCham.model,
          nha_cung_cap: kqCham.nhaCungCap,
        })
        .then(() => {}, () => {});
    }

    // Đẩy mã lỗi AI chỉ ra vào Sổ lỗi qua đúng luồng hiện có (lib/soatLoiMayChu.ts)
    if (ketQua.maLoi.length > 0 && kuId) {
      try {
        await ghiLoiTuBaiLam(hs.admin, hs.studentId, ketQua.maLoi, kuId, null);
      } catch {
        /* không làm gián đoạn kết quả chấm nếu DB chưa chạy file 42 */
      }
    }

    if (kuId) {
      await hs.admin
        .from('learning_events')
        .insert({
          student_id: hs.studentId,
          ku_id: kuId,
          event_type: 'cham_vo_ai',
          payload: {
            luot_id: luotId,
            nguon,
            bai_id: baiId,
            diem_ai: ketQua.diem,
            trang_thai: ketQua.trangThai,
            ma_loi: ketQua.maLoi,
          },
        })
        .then(() => {}, () => {});
    }

    // Chỉ số tự lực (goi_y_su_kien): kiểm tra tiến bộ chấm vở trong 48h & ghi nhận goiYTiep mới
    try {
      const { capNhatKetQuaGoiY, ghiNhanGoiY } = await import('@/lib/khkt/ghiGoiYSuKien');
      const han48h = new Date(Date.now() - 48 * 3600_000).toISOString();
      const { data: luotCu } = await hs.admin
        .from('cham_vo_luot')
        .select('id, ket_qua, trang_thai_bai, tao_luc')
        .eq('student_id', hs.studentId)
        .eq('bai_id', baiId)
        .eq('trang_thai_luot', 'da-cham')
        .neq('id', luotId)
        .gte('tao_luc', han48h)
        .order('tao_luc', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (luotCu) {
        const dongSaiCu =
          typeof (luotCu as any)?.ket_qua?.dongSaiDau === 'number'
            ? Number((luotCu as any).ket_qua.dongSaiDau)
            : null;
        const dongSaiMoi = ketQua.dongSaiDau;
        const tienBo =
          ketQua.trangThai === 'xong' ||
          (dongSaiCu != null && (dongSaiMoi == null || dongSaiMoi > dongSaiCu));
        await capNhatKetQuaGoiY(hs.admin, {
          studentId: hs.studentId,
          questionId: baiId,
          kuId: kuId || null,
          dung: tienBo,
          nguonLoc: 'cham-vo',
        });
      }

      if (ketQua.goiYTiep && ketQua.trangThai !== 'xong') {
        await ghiNhanGoiY(hs.admin, {
          studentId: hs.studentId,
          classId: hs.classId,
          nguon: 'cham-vo',
          tang: 1,
          kuId: kuId || null,
          questionId: baiId,
          errorCode: ketQua.maLoi[0] ?? null,
          coAi: true,
        });
      }
    } catch { /* bỏ qua nếu chưa chạy SQL 56 */ }

    return NextResponse.json({
      ok: true,
      luotId,
      ketQua,
      nhaCungCap: kqCham.nhaCungCap,
      thongTinMaLoi: (errDict ?? []).filter((e) => ketQua.maLoi.includes(e.error_code)),
    });
  }

  return NextResponse.json({ error: 'Bước xử lý không hợp lệ.' }, { status: 400 });
}
