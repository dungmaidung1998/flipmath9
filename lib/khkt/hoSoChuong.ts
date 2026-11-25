/**
 * FILE NÀY LÀM GÌ: Mô-đun TypeScript/JavaScript hỗ trợ xử lý dữ liệu và nghiệp vụ trong hệ thống FlipMath 9.
 * AI DÙNG: dùng chung
 * LẤY DỮ LIỆU TỪ: students, knowledge_units, error_dictionary, classes, schools, mastery_states, student_errors, quiz_attempts
 * GỌI TỚI: @/lib/chapters, @/lib/chuDeChuong
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import { CHAPTERS, chapterOf } from '@/lib/chapters';
import { chuDeChuong } from '@/lib/chuDeChuong';

export type MucHoSo = {
  ku_id: string;
  ku_name: string;
  lesson_id: string | null;
  mastery_level: number | null;
};

export type HoSoChuongItem = {
  student_id: string;
  ten_hien_thi: string;
  class_id: string;
  ten_lop: string;
  ten_truong: string;
  chuong: string;
  ten_chuong: string;
  chuong_nhan: string;
  mucs: MucHoSo[];
  so_muc_dat: number;
  tong_muc: number;
  ti_le_lam_chu: number;
  muc5: number; // 0..4 tương ứng 5 cấp độ hình ảnh chủ đề chương
  loi_da_sua: number;
  loi_con_mo: number;
  loi_tieu_bieu: { error_code: string; trang_thai: string; mo_ta: string }[];
  so_bai_chuan_bi: number;
  phut_hoc: number;
  dat_huy_hieu: boolean;
  nhan_xet_gv: string;
  cap_nhat_nx: string | null;
};

/**
 * Hàm `docHet`: nhận (tao), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
async function docHet<T = any>(tao: (tu: number, den: number) => any): Promise<T[]> {
  const out: T[] = [];
  for (let tu = 0; ; tu += 1000) {
    const { data, error } = await tao(tu, tu + 999);
    if (error || !data?.length) break;
    out.push(...(data as T[]));
    if (data.length < 1000) break;
  }
  return out;
}

/**
 * Hàm `napHoSoNhieuHS`: nhận (admin, studentIds, chuong), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
export async function napHoSoNhieuHS(
  admin: SupabaseClient,
  studentIds: string[],
  chuong: string
): Promise<HoSoChuongItem[]> {
  if (!studentIds.length) return [];
  const chInfo = CHAPTERS.find((c) => c.id === chuong);
  const cd = chuDeChuong(chuong);
  const tenChuong = chInfo?.title ?? cd?.ten ?? chuong;
  const chuongNhan = chInfo?.label ?? chuong;

  const [{ data: hsRows }, { data: units }, { data: errDict }] = await Promise.all([
    admin.from('students').select('student_id, class_id, display_name').in('student_id', studentIds).order('student_id'),
    admin.from('knowledge_units').select('ku_id, ku_name, lesson_id, order_index').order('order_index'),
    admin.from('error_dictionary').select('error_code, ku_id, misconception'),
  ]);

  const classIds = Array.from(new Set((hsRows ?? []).map((h) => h.class_id).filter(Boolean)));
  const { data: clsRows } = classIds.length
    ? await admin
        .from('classes')
        .select('class_id, class_code, ten_lop, school_id')
        .in('class_id', classIds)
        .then(
          (r) => (r.error ? admin.from('classes').select('class_id, class_code').in('class_id', classIds) : r),
          () => ({ data: [] as any[] })
        )
    : { data: [] as any[] };
  const schoolIds = Array.from(new Set((clsRows ?? []).map((c: any) => c.school_id).filter(Boolean)));
  const { data: schRows } = schoolIds.length
    ? await admin.from('schools').select('school_id, ten').in('school_id', schoolIds).then((r) => r, () => ({ data: [] as any[] }))
    : { data: [] as any[] };

  const schMap = new Map((schRows ?? []).map((s: any) => [s.school_id, s.ten as string]));
  const clsMap = new Map(
    (clsRows ?? []).map((c: any) => [
      c.class_id,
      {
        tenLop: String(c.ten_lop || c.class_code || c.class_id),
        tenTruong: c.school_id ? schMap.get(c.school_id) ?? 'THCS' : 'THCS',
      },
    ])
  );

  const unitsChuong = (units ?? []).filter((u) => chapterOf(String(u.ku_id)) === chuong);
  const kuChuong = unitsChuong.map((u) => String(u.ku_id));
  const kuSet = new Set(kuChuong);
  const dictMap = new Map((errDict ?? []).map((d) => [d.error_code, { ku_id: d.ku_id as string | null, mo_ta: d.misconception as string }]));

  const [msRows, errRows, attRows, evRows, nxRows] = await Promise.all([
    kuChuong.length
      ? docHet<any>((tu, den) =>
          admin.from('mastery_states').select('student_id, ku_id, mastery_level').in('student_id', studentIds).in('ku_id', kuChuong).range(tu, den)
        )
      : Promise.resolve([]),
    docHet<any>((tu, den) =>
      admin.from('student_errors').select('student_id, error_code, trang_thai, ku_goc').in('student_id', studentIds).range(tu, den)
    ),
    kuChuong.length
      ? docHet<any>((tu, den) =>
          admin.from('quiz_attempts').select('student_id, ku_id, kind, time_on_task_sec').in('student_id', studentIds).in('ku_id', kuChuong).range(tu, den)
        )
      : Promise.resolve([]),
    kuChuong.length
      ? docHet<any>((tu, den) =>
          admin.from('learning_events').select('student_id, ku_id, duration_active_sec').in('student_id', studentIds).in('ku_id', kuChuong).range(tu, den)
        )
      : Promise.resolve([]),
    admin
      .from('ho_so_nhan_xet')
      .select('student_id, nhan_xet, cap_nhat')
      .in('student_id', studentIds)
      .eq('chuong', chuong)
      .then((r) => r.data ?? [], () => [] as any[]),
  ]);

  const msByHs = new Map<string, Map<string, number | null>>();
  for (const m of msRows) {
    let mp = msByHs.get(m.student_id);
    if (!mp) {
      mp = new Map();
      msByHs.set(m.student_id, mp);
    }
    mp.set(m.ku_id, m.mastery_level == null ? null : Number(m.mastery_level));
  }

  const errByHs = new Map<string, any[]>();
  for (const e of errRows) {
    const ku = e.ku_goc || dictMap.get(e.error_code)?.ku_id || '';
    if (!kuSet.has(ku) && !String(ku).startsWith(`${chuong}-`)) continue;
    const arr = errByHs.get(e.student_id) ?? [];
    arr.push(e);
    errByHs.set(e.student_id, arr);
  }

  const prepByHs = new Map<string, Set<string>>();
  const secByHs = new Map<string, number>();
  for (const a of attRows) {
    if ((a.kind ?? 'chuan-bi') === 'chuan-bi') {
      const s = prepByHs.get(a.student_id) ?? new Set<string>();
      s.add(a.ku_id);
      prepByHs.set(a.student_id, s);
    }
    secByHs.set(a.student_id, (secByHs.get(a.student_id) ?? 0) + Number(a.time_on_task_sec ?? 0));
  }
  for (const e of evRows) {
    secByHs.set(e.student_id, (secByHs.get(e.student_id) ?? 0) + Number(e.duration_active_sec ?? 0));
  }

  const nxByHs = new Map((nxRows ?? []).map((n: any) => [n.student_id as string, { text: String(n.nhan_xet ?? ''), at: n.cap_nhat as string }]));

  return (hsRows ?? []).map((h) => {
    const mp = msByHs.get(h.student_id) ?? new Map();
    const mucs: MucHoSo[] = unitsChuong.map((u) => ({
      ku_id: u.ku_id,
      ku_name: u.ku_name,
      lesson_id: u.lesson_id ?? null,
      mastery_level: mp.get(u.ku_id) ?? null,
    }));
    const soMucDat = mucs.filter((m) => (m.mastery_level ?? -1) >= 2).length;
    const tongMuc = mucs.length;
    // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
    const tiLe = tongMuc ? Math.round((soMucDat * 100) / tongMuc) : 0;
    // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
    const muc5 = Math.min(4, Math.max(0, Math.round((tiLe / 100) * 4)));
    const errs = errByHs.get(h.student_id) ?? [];
    const loiDaSua = errs.filter((e) => e.trang_thai === 'da-nho').length;
    const loiConMo = errs.filter((e) => e.trang_thai !== 'da-nho').length;
    const loiTieuBieu = errs.slice(0, 4).map((e) => ({
      error_code: e.error_code,
      trang_thai: e.trang_thai,
      mo_ta: dictMap.get(e.error_code)?.mo_ta ?? e.error_code,
    }));
    const cls = clsMap.get(h.class_id);
    const nx = nxByHs.get(h.student_id);

    return {
      student_id: h.student_id,
      ten_hien_thi: h.display_name || h.student_id,
      class_id: h.class_id ?? '',
      ten_lop: cls?.tenLop ?? h.class_id ?? '',
      ten_truong: cls?.tenTruong ?? 'THCS',
      chuong,
      ten_chuong: tenChuong,
      chuong_nhan: chuongNhan,
      mucs,
      so_muc_dat: soMucDat,
      tong_muc: tongMuc,
      ti_le_lam_chu: tiLe,
      muc5,
      loi_da_sua: loiDaSua,
      loi_con_mo: loiConMo,
      loi_tieu_bieu: loiTieuBieu,
      so_bai_chuan_bi: prepByHs.get(h.student_id)?.size ?? 0,
      phut_hoc: Math.round((secByHs.get(h.student_id) ?? 0) / 60),
      dat_huy_hieu: tongMuc > 0 && soMucDat === tongMuc,
      nhan_xet_gv: nx?.text ?? '',
      cap_nhat_nx: nx?.at ?? null,
    };
  });
}
