/**
 * FILE NÀY LÀM GÌ: API máy chủ phục vụ giáo viên xử lý dữ liệu lớp học, thống kê hoặc thao tác quản lý trên Supabase.
 * AI DÙNG: máy chủ (API)
 * ĐỊA CHỈ TRÊN WEB: /api/gv/de-kiem-tra
 * LẤY DỮ LIỆU TỪ: profiles, de_kiem_tra, de_kiem_tra_lam, error_dictionary, questions, question_options, distractor_errors, students
 * GỌI TỚI: @/lib/supabase/server, @/lib/gv/lopCuaToi, @/lib/gv/xacThucApi, @/lib/khkt/deKiemTra
 */
import { NextResponse } from 'next/server';
import { randomInt, randomUUID } from 'node:crypto';
import { supabaseAdmin, supabaseServer } from '@/lib/supabase/server';
import { laVaiTroGV, lopCuaToi } from '@/lib/gv/lopCuaToi';
import { giaoVienCuaLop } from '@/lib/gv/xacThucApi';
import type { CauDeKiemTra, DeKiemTraData, MaTran4Muc } from '@/lib/khkt/deKiemTra';

export const dynamic = 'force-dynamic';

/**
 * Hàm `tronNgauNhien(ds)`: xử lý dữ liệu đầu vào và trả kết quả.
 */
function tronNgauNhien<T>(ds: T[]): T[] {
  const arr = [...ds];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Hàm `daDuyet(trangThai)`: xử lý dữ liệu đầu vào và trả kết quả.
 */
function daDuyet(trangThai: unknown): boolean {
  const s = String(trangThai ?? '').trim().toLowerCase();
  return s === 'duyet' || s === 'da-duyet';
}

/**
 * Xử lý HTTP GET: kiểm tra đăng nhập/quyền hạn, đọc dữ liệu và trả về JSON cho trình duyệt.
 */
export async function GET(req: Request) {
  const db = supabaseServer();
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  const { data: { user } } = await db.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Chưa đăng nhập.' }, { status: 401 });
  // Truy vấn Supabase: đọc dữ liệu từ bảng profiles
  const { data: p } = await db.from('profiles').select('role').eq('id', user.id).maybeSingle();
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  if (!laVaiTroGV(p?.role)) {
    return NextResponse.json({ error: 'Chỉ giáo viên hoặc quản trị mới được xem.' }, { status: 403 });
  }

  const lops = await lopCuaToi(db);
  if (!lops.length) return NextResponse.json({ deList: [], baoCaoLoi: [] });
  const lopParam = new URL(req.url).searchParams.get('lop');
  const classIds =
    lopParam && lopParam !== 'tat-ca' && lops.some((l) => l.class_id === lopParam)
      ? [lopParam]
      : lops.map((l) => l.class_id);

  const admin = supabaseAdmin();
  const { data: deRows, error: deErr } = await admin
    .from('de_kiem_tra')
    .select('id, class_id, chuong, ku_ids, tieu_de, thoi_gian_phut, ma_tran, cau_hoi, cho_lam_thu, canh_bao, tao_luc')
    .in('class_id', classIds)
    .order('tao_luc', { ascending: false })
    .limit(30);

  if (deErr) {
    return NextResponse.json({
      deList: [],
      baoCaoLoi: [],
      chuaCoBang: true,
      thongBaoBang: 'Chưa chạy file supabase/53-tinh-nang-khkt.sql — giáo viên vẫn sinh đề và tải Word trực tiếp được.',
    });
  }

  const deIds = (deRows ?? []).map((d) => d.id);
  const { data: lamRows } = deIds.length
    ? await admin
        .from('de_kiem_tra_lam')
        .select('de_id, student_id, tra_loi, diem, so_dung, tong_cau, nop_luc')
        .in('de_id', deIds)
    : { data: [] as any[] };

  // Đọc từ điển lỗi để giải nghĩa mã lỗi hay gặp trước tiết
  const { data: dict } = await admin.from('error_dictionary').select('error_code, misconception');
  const dictMap = new Map((dict ?? []).map((d) => [d.error_code, d.misconception as string]));

  const lamTheoDe = new Map<string, any[]>();
  for (const r of lamRows ?? []) {
    const arr = lamTheoDe.get(r.de_id) ?? [];
    arr.push(r);
    lamTheoDe.set(r.de_id, arr);
  }

  const baoCaoLoi = (deRows ?? []).map((de) => {
    const dsLam = lamTheoDe.get(de.id) ?? [];
    const cauList = (de.cau_hoi ?? []) as CauDeKiemTra[];
    const cauMap = new Map(cauList.map((c) => [c.question_id, c]));

    const demMaLoi = new Map<string, number>();
    const demCauSai = new Map<string, { sai: number; tong: number; stem: string; ku_id: string }>();

    for (const luot of dsLam) {
      const tl = Array.isArray(luot.tra_loi) ? luot.tra_loi : [];
      for (const item of tl) {
        const qid = String(item?.question_id ?? '');
        const q = cauMap.get(qid);
        const cur = demCauSai.get(qid) ?? {
          sai: 0,
          tong: 0,
          stem: q?.stem ?? qid,
          ku_id: q?.ku_id ?? '',
        };
        cur.tong += 1;
        if (!item?.is_correct) {
          cur.sai += 1;
          const code = item?.error_code ? String(item.error_code) : '';
          if (code) demMaLoi.set(code, (demMaLoi.get(code) ?? 0) + 1);
        }
        demCauSai.set(qid, cur);
      }
    }

    const diemTB = dsLam.length
      ? Math.round((dsLam.reduce((s, r) => s + Number(r.diem ?? 0), 0) / dsLam.length) * 100) / 100
      : null;

    const topLoi = Array.from(demMaLoi.entries())
      .map(([errorCode, soLan]) => ({
        errorCode,
        moTa: dictMap.get(errorCode) ?? 'Quan niệm sai cần lưu ý',
        soLan,
      }))
      .sort((a, b) => b.soLan - a.soLan)
      .slice(0, 8);

    const cauSaiNhieu = Array.from(demCauSai.entries())
      .filter(([, v]) => v.sai > 0)
      .map(([questionId, v]) => ({
        questionId,
        kuId: v.ku_id,
        stem: v.stem,
        soSai: v.sai,
        tongLam: v.tong,
        tiLeSai: v.tong ? Math.round((v.sai * 100) / v.tong) : 0,
      }))
      .sort((a, b) => b.tiLeSai - a.tiLeSai || b.soSai - a.soSai)
      .slice(0, 8);

    return {
      deId: de.id,
      soHocSinhLam: new Set(dsLam.map((x) => x.student_id)).size,
      soLuotLam: dsLam.length,
      diemTB,
      topLoi,
      cauSaiNhieu,
    };
  });

  return NextResponse.json({ deList: deRows ?? [], baoCaoLoi });
}

/**
 * Xử lý HTTP POST: kiểm tra đăng nhập/quyền hạn, nhận dữ liệu mới / xử lý và trả về JSON cho trình duyệt.
 */
export async function POST(req: Request) {
  const b = await req.json().catch(() => null);
  const hanhDong = String(b?.hanhDong ?? 'sinh');
  const admin = supabaseAdmin();

  if (hanhDong === 'bat-tat-lam-thu') {
    const deId = String(b?.deId ?? '');
    if (!deId) return NextResponse.json({ error: 'Thiếu mã đề.' }, { status: 400 });
    // Truy vấn Supabase: đọc dữ liệu từ bảng de_kiem_tra
    const { data: row } = await admin.from('de_kiem_tra').select('id, class_id').eq('id', deId).maybeSingle();
    if (!row) return NextResponse.json({ error: 'Không tìm thấy đề.' }, { status: 404 });
    // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
    const auth = await giaoVienCuaLop(row.class_id);
    if ('loi' in auth) return auth.loi;
    const { error } = await admin
      .from('de_kiem_tra')
      .update({ cho_lam_thu: Boolean(b?.choLamThu) })
      .eq('id', deId);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true, cho_lam_thu: Boolean(b?.choLamThu) });
  }

  if (hanhDong === 'xoa') {
    const deId = String(b?.deId ?? '');
    // Truy vấn Supabase: đọc dữ liệu từ bảng de_kiem_tra
    const { data: row } = await admin.from('de_kiem_tra').select('id, class_id').eq('id', deId).maybeSingle();
    if (!row) return NextResponse.json({ error: 'Không tìm thấy đề.' }, { status: 404 });
    // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
    const auth = await giaoVienCuaLop(row.class_id);
    if ('loi' in auth) return auth.loi;
    // Truy vấn Supabase: xoá dữ liệu khỏi bảng de_kiem_tra
    const { error } = await admin.from('de_kiem_tra').delete().eq('id', deId);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  }

  // ---- Sinh đề theo ma trận 4 cấp độ ----
  const classId = String(b?.classId ?? '');
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  const auth = await giaoVienCuaLop(classId);
  if ('loi' in auth) return auth.loi;

  const chuong = String(b?.chuong ?? '').trim();
  const kuIds: string[] = Array.isArray(b?.kuIds) ? b.kuIds.map(String).filter(Boolean) : [];
  if (!chuong || !kuIds.length) {
    return NextResponse.json({ error: 'Thầy cô cần chọn chương và ít nhất một mục kiến thức.' }, { status: 400 });
  }

  const maTran: MaTran4Muc = {
    1: Math.max(0, Math.min(30, Math.round(Number(b?.maTran?.[1]) || 0))),
    2: Math.max(0, Math.min(30, Math.round(Number(b?.maTran?.[2]) || 0))),
    3: Math.max(0, Math.min(30, Math.round(Number(b?.maTran?.[3]) || 0))),
    4: Math.max(0, Math.min(30, Math.round(Number(b?.maTran?.[4]) || 0))),
  };
  const tongYeuCau = maTran[1] + maTran[2] + maTran[3] + maTran[4];
  if (tongYeuCau <= 0 || tongYeuCau > 60) {
    return NextResponse.json({ error: 'Tổng số câu trong ma trận phải từ 1 đến 60 câu.' }, { status: 400 });
  }
  // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
  const thoiGianPhut = Math.max(5, Math.min(120, Math.round(Number(b?.thoiGianPhut) || 15)));
  const tieuDe = String(b?.tieuDe ?? '').trim().slice(0, 140) || `Kiểm tra thường xuyên ${chuong}`;

  // Nạp câu hỏi theo các mục đã chọn (thử đọc cả cột trang_thai & hinh; fallback nếu DB cũ)
  let qRows: any[] = [];
  const resFull = await admin
    .from('questions')
    .select('question_id, ku_id, level, stem, correct_option, expected_time_sec, hinh, trang_thai')
    .in('ku_id', kuIds);
  if (resFull.error) {
    const resFallback = await admin
      .from('questions')
      .select('question_id, ku_id, level, stem, correct_option, expected_time_sec')
      .in('ku_id', kuIds);
    if (resFallback.error) {
      return NextResponse.json({ error: resFallback.error.message }, { status: 500 });
    }
    qRows = resFallback.data ?? [];
  } else {
    qRows = resFull.data ?? [];
  }

  // Loại bỏ câu bị đánh dấu 'can-sua'
  const hopLe = qRows.filter((q) => q.trang_thai !== 'can-sua');
  if (!hopLe.length) {
    return NextResponse.json({ error: 'Các mục đã chọn chưa có câu hỏi hợp lệ trong ngân hàng.' }, { status: 400 });
  }

  const allQids = hopLe.map((q) => q.question_id);
  const [{ data: optRows }, { data: distRows }, { data: hsLop }] = await Promise.all([
    admin.from('question_options').select('question_id, option_key, option_text').in('question_id', allQids).order('option_key'),
    admin.from('distractor_errors').select('question_id, option_key, error_code').in('question_id', allQids),
    admin.from('students').select('student_id').eq('class_id', classId),
  ]);

  // Tìm các câu học sinh lớp này vừa làm trong 7 ngày gần nhất để tránh chọn lại nếu có thể
  const recentQids = new Set<string>();
  const hsIds = (hsLop ?? []).map((h) => h.student_id);
  if (hsIds.length) {
    // Xử lý mốc ngày giờ theo múi giờ Việt Nam (UTC+7)
    const bayNgayTruoc = new Date(Date.now() - 7 * 86400_000).toISOString();
    const { data: recentAttempts } = await admin
      .from('quiz_attempts')
      .select('attempt_id')
      .in('student_id', hsIds)
      .gte('submitted_at', bayNgayTruoc)
      .limit(1000);
    const attIds = (recentAttempts ?? []).map((a) => a.attempt_id);
    if (attIds.length) {
      for (let i = 0; i < attIds.length; i += 200) {
        const { data: ans } = await admin
          .from('quiz_answers')
          .select('question_id')
          .in('attempt_id', attIds.slice(i, i + 200));
        for (const a of ans ?? []) recentQids.add(a.question_id);
      }
    }
  }

  const optMap = new Map<string, { option_key: string; option_text: string }[]>();
  for (const o of optRows ?? []) {
    const list = optMap.get(o.question_id) ?? [];
    list.push({ option_key: o.option_key, option_text: o.option_text });
    optMap.set(o.question_id, list);
  }
  const errMap = new Map<string, Record<string, string>>();
  for (const d of distRows ?? []) {
    const m = errMap.get(d.question_id) ?? {};
    if (d.error_code) m[d.option_key] = d.error_code;
    errMap.set(d.question_id, m);
  }

  const daChon: CauDeKiemTra[] = [];
  const canhBaoList: string[] = [];
  let soChuaDuyet = 0;
  let soTrung7Ngay = 0;

  for (const lv of [1, 2, 3, 4] as const) {
    const can = maTran[lv];
    if (!can) continue;
    const pool = hopLe.filter((q) => Number(q.level) === lv && (optMap.get(q.question_id)?.length ?? 0) >= 2);
    const p1 = tronNgauNhien(pool.filter((q) => daDuyet(q.trang_thai) && !recentQids.has(q.question_id)));
    const p2 = tronNgauNhien(pool.filter((q) => daDuyet(q.trang_thai) && recentQids.has(q.question_id)));
    const p3 = tronNgauNhien(pool.filter((q) => !daDuyet(q.trang_thai) && !recentQids.has(q.question_id)));
    const p4 = tronNgauNhien(pool.filter((q) => !daDuyet(q.trang_thai) && recentQids.has(q.question_id)));

    const picked: any[] = [];
    for (const q of p1) {
      if (picked.length >= can) break;
      picked.push(q);
    }
    for (const q of p2) {
      if (picked.length >= can) break;
      picked.push(q);
      soTrung7Ngay++;
    }
    for (const q of p3) {
      if (picked.length >= can) break;
      picked.push(q);
      soChuaDuyet++;
    }
    for (const q of p4) {
      if (picked.length >= can) break;
      picked.push(q);
      soChuaDuyet++;
      soTrung7Ngay++;
    }

    if (picked.length < can) {
      canhBaoList.push(`Mức ${lv} chỉ có ${picked.length}/${can} câu trong các mục đã chọn.`);
    }

    for (const q of picked) {
      daChon.push({
        question_id: q.question_id,
        ku_id: q.ku_id,
        level: lv,
        stem: q.stem,
        hinh: q.hinh ?? null,
        expected_time_sec: Number(q.expected_time_sec ?? 60),
        trang_thai: q.trang_thai ?? null,
        options: optMap.get(q.question_id) ?? [],
        correct_option: q.correct_option,
        error_map: errMap.get(q.question_id) ?? {},
      });
    }
  }

  if (!daChon.length) {
    return NextResponse.json({ error: 'Không có câu hỏi nào khớp cấp độ trong ma trận đã chọn.' }, { status: 400 });
  }
  if (soChuaDuyet > 0) {
    canhBaoList.push(`Có ${soChuaDuyet} câu chưa ở trạng thái duyệt (được lấy bù do thiếu câu đã duyệt — thầy cô rà lại trước khi phát).`);
  }
  if (soTrung7Ngay > 0) {
    canhBaoList.push(`Có ${soTrung7Ngay} câu học sinh lớp này vừa làm trong 7 ngày qua (do ngân hàng không đủ câu mới).`);
  }

  const canhBao = canhBaoList.length ? canhBaoList.join(' ') : null;
  const draftDe: DeKiemTraData = {
    id: randomUUID(),
    class_id: classId,
    chuong,
    ku_ids: kuIds,
    tieu_de: tieuDe,
    thoi_gian_phut: thoiGianPhut,
    ma_tran: maTran,
    cau_hoi: daChon,
    cho_lam_thu: Boolean(b?.choLamThu ?? true),
    canh_bao: canhBao,
    tao_luc: new Date().toISOString(),
  };

  const { data: saved, error: saveErr } = await admin
    .from('de_kiem_tra')
    .insert({
      id: draftDe.id,
      class_id: draftDe.class_id,
      chuong: draftDe.chuong,
      ku_ids: draftDe.ku_ids,
      tieu_de: draftDe.tieu_de,
      thoi_gian_phut: draftDe.thoi_gian_phut,
      ma_tran: draftDe.ma_tran,
      cau_hoi: draftDe.cau_hoi,
      cho_lam_thu: draftDe.cho_lam_thu,
      canh_bao: draftDe.canh_bao,
      tao_boi: auth.user.id,
    })
    .select('id, class_id, chuong, ku_ids, tieu_de, thoi_gian_phut, ma_tran, cau_hoi, cho_lam_thu, canh_bao, tao_luc')
    .single();

  if (saveErr || !saved) {
    return NextResponse.json({
      ok: true,
      de: draftDe,
      chuaLuuDb: true,
      canhBao: [canhBao, 'Chưa lưu vào DB (kiểm tra đã chạy file supabase/53-tinh-nang-khkt.sql chưa) — thầy cô vẫn tải được bản Word ngay.'].filter(Boolean).join(' '),
    });
  }

  return NextResponse.json({ ok: true, de: saved });
}
