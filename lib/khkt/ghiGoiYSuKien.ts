/**
 * FILE NÀY LÀM GÌ: Mô-đun TypeScript/JavaScript hỗ trợ xử lý dữ liệu và nghiệp vụ trong hệ thống FlipMath 9.
 * AI DÙNG: dùng chung
 * LẤY DỮ LIỆU TỪ: students, goi_y_su_kien
 * GỌI TỚI: ./tuLuc
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import type { NguonGoiY } from './tuLuc';

/**
 * Helper phía máy chủ ghi và cập nhật bảng `goi_y_su_kien`.
 * Mọi truy vấn đều bọc try/catch để không làm gián đoạn luồng học nếu DB chưa chạy SQL 56.
 */
export async function ghiNhanGoiY(
  admin: SupabaseClient,
  params: {
    studentId: string;
    classId?: string | null;
    nguon: NguonGoiY;
    tang?: 1 | 2 | 3 | null;
    kuId?: string | null;
    questionId?: string | null;
    errorCode?: string | null;
    coAi: boolean;
  }
) {
  try {
    let classId = params.classId ?? null;
    if (!classId) {
      const { data: st } = await admin
        .from('students')
        .select('class_id')
        .eq('student_id', params.studentId)
        .maybeSingle();
      classId = st?.class_id ?? null;
    }

    // Nếu đã có sự kiện cùng câu trong vòng 48h chưa thử lại và HS xin gợi ý tầng cao hơn → tăng so_goi_y_them
    if (params.questionId && params.tang != null && params.tang > 1) {
      const han48h = new Date(Date.now() - 48 * 3600_000).toISOString();
      const { data: moCu } = await admin
        .from('goi_y_su_kien')
        .select('id, so_goi_y_them')
        .eq('student_id', params.studentId)
        .eq('question_id', params.questionId)
        .is('thu_lai_luc', null)
        .gte('tao_luc', han48h)
        .order('tao_luc', { ascending: false })
        .limit(3);

      for (const r of moCu ?? []) {
        await admin
          .from('goi_y_su_kien')
          .update({ so_goi_y_them: Number(r.so_goi_y_them ?? 0) + 1 })
          .eq('id', r.id);
      }
    }

    // Truy vấn Supabase: thêm bản ghi vào bảng goi_y_su_kien
    await admin.from('goi_y_su_kien').insert({
      student_id: params.studentId,
      class_id: classId,
      nguon: params.nguon,
      tang: params.tang ?? null,
      ku_id: params.kuId ?? null,
      question_id: params.questionId ?? null,
      error_code: params.errorCode ?? null,
      co_ai: params.coAi,
    });
  } catch {
    /* chưa chạy SQL 56 */
  }
}

/**
 * Hàm `danhDauXemLoiGiai`: nhận (admin, params), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
export async function danhDauXemLoiGiai(
  admin: SupabaseClient,
  params: { studentId: string; kuId?: string | null; questionId?: string | null }
) {
  try {
    const han48h = new Date(Date.now() - 48 * 3600_000).toISOString();
    let q = admin
      .from('goi_y_su_kien')
      .select('id')
      .eq('student_id', params.studentId)
      .is('thu_lai_luc', null)
      .gte('tao_luc', han48h)
      .limit(10);
    if (params.questionId) q = q.eq('question_id', params.questionId);
    else if (params.kuId) q = q.eq('ku_id', params.kuId);

    const { data: rows } = await q;
    if (!rows?.length) return;
    await admin
      .from('goi_y_su_kien')
      .update({ xem_loi_giai: true })
      .in('id', rows.map((r) => r.id));
  } catch {
    /* bỏ qua */
  }
}

/**
 * Cập nhật `thu_lai_luc` và `tu_giai` cho các sự kiện gợi ý mở trong vòng 48h
 * khi học sinh thử lại câu hỏi hoặc mã lỗi tương ứng.
 */
export async function capNhatKetQuaGoiY(
  admin: SupabaseClient,
  params: {
    studentId: string;
    questionId?: string | null;
    errorCode?: string | null;
    kuId?: string | null;
    dung: boolean;
    nguonLoc?: NguonGoiY;
  }
) {
  try {
    const nowIso = new Date().toISOString();
    const han48h = new Date(Date.now() - 48 * 3600_000).toISOString();
    const { data: rows } = await admin
      .from('goi_y_su_kien')
      .select('id, question_id, error_code, ku_id, nguon, so_goi_y_them, xem_loi_giai')
      .eq('student_id', params.studentId)
      .is('thu_lai_luc', null)
      .gte('tao_luc', han48h)
      .limit(20);

    if (!rows?.length) return;
    for (const r of rows as any[]) {
      if (params.nguonLoc && r.nguon !== params.nguonLoc) continue;
      const khopCau = params.questionId && r.question_id === params.questionId;
      const khopMa = params.errorCode && r.error_code === params.errorCode;
      const khopKuChamVo = params.nguonLoc === 'cham-vo' && params.kuId && r.ku_id === params.kuId;
      const khopDoChieuCao = params.nguonLoc === 'do-chieu-cao' && r.nguon === 'do-chieu-cao';
      if (!khopCau && !khopMa && !khopKuChamVo && !khopDoChieuCao) continue;

      const them = Number(r.so_goi_y_them ?? 0) > 0;
      const xemGiai = Boolean(r.xem_loi_giai);
      await admin
        .from('goi_y_su_kien')
        .update({
          thu_lai_luc: nowIso,
          tu_giai: Boolean(params.dung) && !them && !xemGiai,
        })
        .eq('id', r.id);
    }
  } catch {
    /* bỏ qua */
  }
}

/**
 * Hàm `ghiHoacCapNhatGoiYDoChieuCao`: nhận (admin, params), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
export async function ghiHoacCapNhatGoiYDoChieuCao(
  admin: SupabaseClient,
  params: {
    studentId: string;
    classId?: string | null;
    kuId: string;
    tang: number | null;
    errorCode: string | null;
    hsDung: boolean;
  }
) {
  await capNhatKetQuaGoiY(admin, {
    studentId: params.studentId,
    kuId: params.kuId,
    errorCode: params.errorCode,
    dung: params.hsDung,
    nguonLoc: 'do-chieu-cao',
  });
  if (params.tang != null && params.tang >= 1) {
    await ghiNhanGoiY(admin, {
      studentId: params.studentId,
      classId: params.classId,
      nguon: 'do-chieu-cao',
      tang: (Math.min(3, Math.max(1, params.tang)) as 1 | 2 | 3),
      kuId: params.kuId,
      errorCode: params.errorCode,
      coAi: false,
    });
  }
}
