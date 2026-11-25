/**
 * FILE NÀY LÀM GÌ: Mô-đun TypeScript/JavaScript hỗ trợ xử lý dữ liệu và nghiệp vụ trong hệ thống FlipMath 9.
 * AI DÙNG: dùng chung
 * LẤY DỮ LIỆU TỪ: student_errors, student_error_log, knowledge_units, questions_public, question_options, soat_loi_luot, distractor_errors, quiz_attempts
 * GỌI TỚI: @/lib/tronPhuongAn, ./soatLoi
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import { tronPhuongAn } from '@/lib/tronPhuongAn';
import {
  chonLoi, chonCau, chuyenTrangThai, saiLai, ngayVN,
  type LoiHS, type CauPhat, type CauNganHang, type KetQuaMa, type LoaiCau
} from './soatLoi';

/**
 * SOÁT LỖI CŨ + ÔN NGẮT QUÃNG — phần máy chủ (dùng khoá máy chủ, gọi từ API).
 * Nguyên tắc: máy chủ LƯU danh sách câu đã phát cho mỗi lượt và chấm đúng danh sách đó;
 * một lượt chỉ được tính một lần (nộp lại trả về kết quả cũ).
 */
type Db = SupabaseClient;

/**
 * Hàm `het`: nhận (q), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
async function het<T>(q: (a: number, b: number) => PromiseLike<{ data: T[] | null; error: any }>): Promise<T[]> {
  const ra: T[] = [];
  for (let i = 0; i < 20000; i += 1000) {
    const { data, error } = await q(i, i + 999);
    if (error) throw new Error(error.message ?? 'Lỗi đọc dữ liệu');
    ra.push(...(data ?? []));
    if (!data || data.length < 1000) break;
  }
  return ra;
}

/** Ghi lỗi quan sát được ở một bài làm thường (bài chuẩn bị, vận dụng) vào sổ lỗi. */
export async function ghiLoiTuBaiLam(db: Db, studentId: string, maLoi: string[], kuId: string, attemptId: number | null) {
  if (!maLoi.length) return;
  const dem = new Map<string, number>();
  for (const m of maLoi) dem.set(m, (dem.get(m) ?? 0) + 1);
  // Truy vấn Supabase: đọc dữ liệu từ bảng student_errors
  const { data: cu, error } = await db.from('student_errors').select('error_code, trang_thai, so_lan_sai, tai_phat')
    .eq('student_id', studentId).in('error_code', Array.from(dem.keys()));
  if (error) throw new Error(error.message);
  const coSan = new Map((cu ?? []).map((r) => [r.error_code, r]));
  const now = new Date().toISOString();
  for (const [ma, n] of dem) {
    const c = coSan.get(ma) ?? null;
    const m = saiLai(c as any, n);
    const dong: Record<string, unknown> = {
      student_id: studentId, error_code: ma, trang_thai: m.trang_thai, han_on: null,
      so_lan_sai: m.so_lan_sai, tai_phat: m.tai_phat, lan_sai_cuoi: now, cap_nhat: now
    };
    if (!c) { dong.lan_sai_dau = now; dong.ku_goc = kuId || null; }
    if (m.moChuKy) dong.chu_ky_tu = now;
    // Truy vấn Supabase: thêm hoặc cập nhật (upsert) bảng student_errors
    const { error: e } = await db.from('student_errors').upsert(dong, { onConflict: 'student_id,error_code' });
    if (e) throw new Error(e.message);
    if (!c || c.trang_thai !== 'can-sua') {
      // Truy vấn Supabase: thêm bản ghi vào bảng student_error_log
      await db.from('student_error_log').insert({ student_id: studentId, error_code: ma, tu: c?.trang_thai ?? null, den: 'can-sua', ly_do: 'bai-lam', luot_id: attemptId });
    }
  }
}

export type DeSoatLoi = {
  luotId: number; daNop: boolean;
  cau: { question_id: string; stem: string; hinh: unknown; loai: LoaiCau; options: { option_key: string; option_text: string; nhan?: string }[] }[];
  thieuCau: number; ketQua?: unknown;
};

/** Mục liền trước trong chương trình (để ưu tiên lỗi của bài liền trước). */
async function kuTruoc(db: Db, kuId: string | null): Promise<string | null> {
  if (!kuId) return null;
  // Truy vấn Supabase: đọc dữ liệu từ bảng knowledge_units
  const { data: u } = await db.from('knowledge_units').select('order_index').eq('ku_id', kuId).maybeSingle();
  if (u?.order_index == null) return null;
  // Truy vấn Supabase: đọc dữ liệu từ bảng knowledge_units
  const { data: t } = await db.from('knowledge_units').select('ku_id').lt('order_index', u.order_index).order('order_index', { ascending: false }).limit(1);
  return t?.[0]?.ku_id ?? null;
}

/**
 * Hàm `dungDe`: nhận (db, hat, luot), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
async function dungDe(db: Db, hat: string, luot: { luot_id: number; cau: CauPhat[]; thieu_cau: string[]; nop_luc: string | null; ket_qua: unknown }): Promise<DeSoatLoi> {
  const ids = luot.cau.map((c) => c.question_id);
  const [{ data: qs }, { data: os }] = await Promise.all([
    db.from('questions_public').select('question_id, stem, hinh').in('question_id', ids.length ? ids : ['__none__']),
    db.from('question_options').select('question_id, option_key, option_text').in('question_id', ids.length ? ids : ['__none__']).order('option_key')
  ]);
  const qm = new Map((qs ?? []).map((q) => [q.question_id, q]));
  return {
    luotId: luot.luot_id, daNop: !!luot.nop_luc, thieuCau: luot.thieu_cau.length, ketQua: luot.ket_qua ?? undefined,
    cau: luot.cau.filter((c) => qm.has(c.question_id)).map((c) => ({
      question_id: c.question_id, stem: qm.get(c.question_id)!.stem, hinh: (qm.get(c.question_id) as any).hinh ?? null, loai: c.loai,
      // Trộn thứ tự phương án theo học sinh (đáp án gốc luôn là A); bài nộp vẫn gửi option_key gốc.
      options: tronPhuongAn((os ?? []).filter((o) => o.question_id === c.question_id).map((o) => ({ option_key: o.option_key, option_text: o.option_text })), hat, c.question_id)
    }))
  };
}

/**
 * Phát đề soát lỗi hôm nay. Trả null nếu không có lỗi nào đến hạn (hoặc thiếu hết câu phù hợp).
 * Trong một ngày: lượt chưa nộp được phát lại y nguyên; đã nộp rồi thì hôm nay không soát nữa
 * (trả về lượt đã nộp để hiện kết quả).
 */
export async function phatDeSoatLoi(db: Db, studentId: string, kuId: string | null): Promise<DeSoatLoi | null> {
  // Xử lý mốc ngày giờ theo múi giờ Việt Nam (UTC+7)
  const homNay = ngayVN();
  // Truy vấn Supabase: đọc dữ liệu từ bảng soat_loi_luot
  const { data: luotCu, error: eL } = await db.from('soat_loi_luot').select('luot_id, cau, thieu_cau, nop_luc, ket_qua')
    .eq('student_id', studentId).eq('ngay', homNay).order('luot_id', { ascending: false }).limit(1);
  if (eL) throw new Error(eL.message);
  if (luotCu?.[0]) return (luotCu[0].cau as CauPhat[]).length ? dungDe(db, studentId, luotCu[0] as any) : null;

  // Truy vấn Supabase: đọc dữ liệu từ bảng student_errors
  const { data: loi, error: e1 } = await db.from('student_errors')
    .select('error_code, trang_thai, han_on, so_lan_sai, tai_phat, lan_sai_cuoi, ku_goc, chu_ky_tu').eq('student_id', studentId).neq('trang_thai', 'da-nho');
  if (e1) throw new Error(e1.message);
  const chon = chonLoi((loi ?? []) as LoiHS[], homNay, await kuTruoc(db, kuId));
  if (!chon.length) return null;

  const ma = chon.map((c) => c.ma.error_code);
  // Truy vấn Supabase: đọc dữ liệu từ bảng distractor_errors
  const nhieu = await het<{ question_id: string; error_code: string }>((a, b) => db.from('distractor_errors').select('question_id, error_code').in('error_code', ma).order('question_id').range(a, b));
  const qids = Array.from(new Set(nhieu.map((n) => n.question_id)));
  // Đọc qua questions_public để câu "cần sửa" không được phát.
  const { data: qs } = await db.from('questions_public').select('question_id, level').in('question_id', qids.length ? qids : ['__none__']);
  const capDo = new Map((qs ?? []).map((q) => [q.question_id, q.level as number]));
  const theoCau = new Map<string, string[]>();
  for (const n of nhieu) (theoCau.get(n.question_id) ?? theoCau.set(n.question_id, []).get(n.question_id)!).push(n.error_code);
  const nganHang: CauNganHang[] = Array.from(theoCau).filter(([id]) => capDo.has(id)).map(([question_id, m]) => ({ question_id, level: capDo.get(question_id)!, ma: m }));

  // Câu đã phát cho từng mã trong chu kỳ hiện tại, và câu em từng trả lời sai.
  const luotTruoc = await het<{ cau: CauPhat[]; tao_luc: string }>((a, b) => db.from('soat_loi_luot').select('cau, tao_luc').eq('student_id', studentId).order('luot_id').range(a, b));
  const daDung: Record<string, string[]> = {};
  for (const c of chon) {
    daDung[c.ma.error_code] = luotTruoc.filter((l) => l.tao_luc >= c.ma.chu_ky_tu).flatMap((l) => l.cau.filter((x) => x.error_code === c.ma.error_code).map((x) => x.question_id));
  }
  const tungSai = new Set<string>();
  if (qids.length) {
    // Truy vấn Supabase: đọc dữ liệu từ bảng quiz_attempts
    const { data: at } = await db.from('quiz_attempts').select('attempt_id').eq('student_id', studentId).order('attempt_id', { ascending: false }).limit(200);
    const aids = (at ?? []).map((x) => x.attempt_id);
    for (let i = 0; i < aids.length; i += 100) {
      // Truy vấn Supabase: đọc dữ liệu từ bảng quiz_answers
      const { data: sai } = await db.from('quiz_answers').select('question_id').in('attempt_id', aids.slice(i, i + 100)).eq('is_correct', false).in('question_id', qids);
      (sai ?? []).forEach((s) => tungSai.add(s.question_id));
    }
  }

  const { cau, thieu } = chonCau(chon, nganHang, daDung, tungSai);
  if (!cau.length) {
    // Ghi nhận thiếu câu để giáo viên bổ sung; không tạo lượt cho học sinh.
    await db.from('soat_loi_luot').insert({ student_id: studentId, ku_id: kuId, ngay: homNay, cau: [], thieu_cau: thieu, nop_luc: new Date().toISOString(), ket_qua: { thieuHet: true } });
    return null;
  }
  // Truy vấn Supabase: thêm bản ghi vào bảng soat_loi_luot
  const { data: moi, error: e2 } = await db.from('soat_loi_luot').insert({ student_id: studentId, ku_id: kuId, ngay: homNay, cau, thieu_cau: thieu })
    .select('luot_id, cau, thieu_cau, nop_luc, ket_qua').single();
  if (e2) throw new Error(e2.message);
  return dungDe(db, studentId, moi as any);
}

export type GoiYDaDuyet = { tier: number; text: string; nguon: string };

export type KetQuaSoatLoi = {
  ma: (KetQuaMa & { moTa: string; saiLanThu?: number; goiY?: GoiYDaDuyet[] })[];
  cau: { question_id: string; dung: boolean; dapAn: string; chon: string | null }[];
  tiLeKhacPhuc: number;
};

/** Chấm một lượt soát lỗi theo đúng danh sách câu đã phát. Nộp lại trả kết quả cũ. */
export async function nopSoatLoi(
  db: Db, studentId: string, luotId: number, traLoi: { questionId: string; chosen: string | null; timeSec?: number }[]
): Promise<KetQuaSoatLoi> {
  // Truy vấn Supabase: đọc dữ liệu từ bảng soat_loi_luot
  const { data: luot, error } = await db.from('soat_loi_luot').select('luot_id, student_id, ku_id, ngay, cau, nop_luc, ket_qua').eq('luot_id', luotId).maybeSingle();
  if (error) throw new Error(error.message);
  if (!luot || luot.student_id !== studentId) throw new Error('Không tìm thấy lượt soát lỗi.');
  if (luot.nop_luc) return luot.ket_qua as KetQuaSoatLoi;

  const cau = luot.cau as CauPhat[];
  const ids = cau.map((c) => c.question_id);
  const tl = new Map(traLoi.filter((t) => ids.includes(t.questionId)).map((t) => [t.questionId, t]));
  if (tl.size !== ids.length) throw new Error('Em cần trả lời đủ các câu trước khi nộp.');

  const [{ data: qs }, { data: ds }] = await Promise.all([
    db.from('questions').select('question_id, correct_option').in('question_id', ids),
    db.from('distractor_errors').select('question_id, option_key, error_code').in('question_id', ids)
  ]);
  const dapAn = new Map((qs ?? []).map((q) => [q.question_id, q.correct_option as string]));
  const maNhieu = new Map((ds ?? []).map((d) => [`${d.question_id}|${d.option_key}`, d.error_code as string]));

  const cham = cau.map((c) => {
    const t = tl.get(c.question_id)!;
    // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
    return { ...c, chosen: t.chosen, dung: t.chosen != null && t.chosen === dapAn.get(c.question_id), time: Math.max(0, Math.min(3600, Math.round(Number(t.timeSec) || 0))) };
  });

  // Khoá lượt trước khi cập nhật trạng thái: chỉ lượt nào đặt được nop_luc (đang null) mới được tính.
  const now = new Date().toISOString();
  // Xử lý mốc ngày giờ theo múi giờ Việt Nam (UTC+7)
  const homNay = ngayVN();
  const theoMa = new Map<string, { loai: LoaiCau; dung: number; tong: number }>();
  for (const c of cham) {
    const m = theoMa.get(c.error_code) ?? { loai: c.loai, dung: 0, tong: 0 };
    m.tong++; if (c.dung) m.dung++;
    theoMa.set(c.error_code, m);
  }
  const kq = Array.from(theoMa).map(([ma, m]) => chuyenTrangThai(ma, m.loai, m.dung, m.tong, homNay));
  const maCodes = kq.map((k) => k.error_code);
  const [{ data: tuDien }, { data: cu }] = await Promise.all([
    db.from('error_dictionary').select('error_code, misconception').in('error_code', maCodes),
    db.from('student_errors').select('error_code, trang_thai, so_lan_sai').eq('student_id', studentId).in('error_code', maCodes)
  ]);
  const moTa = new Map((tuDien ?? []).map((t) => [t.error_code, t.misconception as string]));
  const cuMap = new Map((cu ?? []).map((c) => [c.error_code, c]));

  // Chỉ lấy gợi ý ĐÃ ĐƯỢC THẦY CÔ DUYỆT cho những mã học sinh vừa sai lại (từ lần sai thứ 2 trở đi)
  const maLap = kq
    .filter((k) => {
      const sai = k.tong - k.dung;
      const tongSai = (cuMap.get(k.error_code)?.so_lan_sai ?? 0) + sai;
      return sai > 0 && tongSai >= 2;
    })
    .map((k) => k.error_code);

  const goiYMap = new Map<string, GoiYDaDuyet[]>();
  if (maLap.length) {
    const resGoiY = await db
      .from('error_hints')
      .select('error_code, tier, hint_text, nguon')
      .in('error_code', maLap)
      .order('tier', { ascending: true });
    const rowsGoiY = resGoiY.error
      ? (
          await db
            .from('error_hints')
            .select('error_code, tier, hint_text')
            .in('error_code', maLap)
            .order('tier', { ascending: true })
        ).data ?? []
      : resGoiY.data ?? [];
    for (const r of rowsGoiY as any[]) {
      const ds = goiYMap.get(r.error_code) ?? [];
      ds.push({
        tier: Number(r.tier),
        text: String(r.hint_text ?? ''),
        nguon: String(r.nguon ?? 'gv')
      });
      goiYMap.set(r.error_code, ds);
    }
  }

  const ketQua: KetQuaSoatLoi = {
    ma: kq.map((k) => {
      const sai = k.tong - k.dung;
      const tongSai = (cuMap.get(k.error_code)?.so_lan_sai ?? 0) + sai;
      const goiY = sai > 0 && tongSai >= 2 ? goiYMap.get(k.error_code) : undefined;
      return {
        ...k,
        moTa: moTa.get(k.error_code) ?? '',
        ...(sai > 0 && tongSai >= 2 ? { saiLanThu: tongSai } : {}),
        ...(goiY?.length ? { goiY } : {})
      };
    }),
    cau: cham.map((c) => ({ question_id: c.question_id, dung: c.dung, dapAn: dapAn.get(c.question_id) ?? '', chon: c.chosen })),
    tiLeKhacPhuc: kq.length ? kq.filter((k) => k.danhGia === 'da-khac-phuc').length / kq.length : 1
  };
  // Truy vấn Supabase: cập nhật dữ liệu ở bảng soat_loi_luot
  const { data: khoa, error: eK } = await db.from('soat_loi_luot').update({ nop_luc: now, ket_qua: ketQua }).eq('luot_id', luotId).is('nop_luc', null).select('luot_id');
  if (eK) throw new Error(eK.message);
  if (!khoa?.length) {
    // Truy vấn Supabase: đọc dữ liệu từ bảng soat_loi_luot
    const { data: lai } = await db.from('soat_loi_luot').select('ket_qua').eq('luot_id', luotId).maybeSingle();
    return lai?.ket_qua as KetQuaSoatLoi;
  }

  // Truy vấn Supabase: thêm hoặc cập nhật (upsert) bảng soat_loi_tra_loi
  await db.from('soat_loi_tra_loi').upsert(cham.map((c) => ({
    luot_id: luotId, question_id: c.question_id, error_code: c.error_code, chosen_option: c.chosen, is_correct: c.dung, answer_time_sec: c.time
  })), { onConflict: 'luot_id,question_id', ignoreDuplicates: true });

  for (const k of kq) {
    const c = cuMap.get(k.error_code);
    const sai = k.tong - k.dung;
    // Truy vấn Supabase: cập nhật dữ liệu ở bảng student_errors
    await db.from('student_errors').update({
      trang_thai: k.trangThaiMoi, han_on: k.hanMoi, cap_nhat: now,
      ...(sai ? { so_lan_sai: (c?.so_lan_sai ?? 0) + sai, lan_sai_cuoi: now } : {})
    }).eq('student_id', studentId).eq('error_code', k.error_code);
    if (c?.trang_thai !== k.trangThaiMoi) {
      // Truy vấn Supabase: thêm bản ghi vào bảng student_error_log
      await db.from('student_error_log').insert({ student_id: studentId, error_code: k.error_code, tu: c?.trang_thai ?? null, den: k.trangThaiMoi, ly_do: k.loai === 'sua' ? 'soat-loi' : k.loai, luot_id: luotId });
    }
  }

  // Phương án sai mang MÃ LỖI KHÁC mã đang soát → ghi riêng mã đó theo quy tắc tạo mục.
  const khac = cham.filter((c) => !c.dung && c.chosen).map((c) => maNhieu.get(`${c.question_id}|${c.chosen}`)).filter((m): m is string => !!m && !theoMa.has(m));
  if (khac.length) await ghiLoiTuBaiLam(db, studentId, khac, luot.ku_id ?? '', null).catch(() => {});

  // Chỉ số tự lực KHKT: cập nhật lần thử lại của từng câu/mã và ghi nhận gợi ý vừa hiện (nếu có)
  try {
    const { capNhatKetQuaGoiY, ghiNhanGoiY } = await import('@/lib/khkt/ghiGoiYSuKien');
    for (const c of cham) {
      await capNhatKetQuaGoiY(db, {
        studentId,
        questionId: c.question_id,
        errorCode: c.error_code,
        kuId: luot.ku_id ?? null,
        dung: c.dung,
      });
    }
    for (const m of ketQua.ma) {
      if (m.goiY && m.goiY.length > 0) {
        await ghiNhanGoiY(db, {
          studentId,
          nguon: 'goi-y-loi',
          tang: (Math.min(3, Math.max(1, m.goiY[0]?.tier ?? 1)) as 1 | 2 | 3),
          kuId: luot.ku_id ?? null,
          errorCode: m.error_code,
          coAi: m.goiY.some((g) => g.nguon === 'ai-duyet'),
        });
      }
    }
  } catch { /* bỏ qua nếu chưa chạy SQL 56 */ }

  return ketQua;
}

/** Số mã lỗi đến hạn hôm nay (cho thẻ "Ôn lỗi hôm nay"). Đã soát hôm nay thì trả 0. */
export async function demLoiDenHan(db: Db, studentId: string): Promise<{ denHan: number; daSoatHomNay: boolean }> {
  // Xử lý mốc ngày giờ theo múi giờ Việt Nam (UTC+7)
  const homNay = ngayVN();
  const [{ data: loi }, { data: luot }] = await Promise.all([
    db.from('student_errors').select('error_code, trang_thai, han_on, so_lan_sai, tai_phat, lan_sai_cuoi, ku_goc, chu_ky_tu').eq('student_id', studentId).neq('trang_thai', 'da-nho'),
    db.from('soat_loi_luot').select('luot_id, nop_luc').eq('student_id', studentId).eq('ngay', homNay).order('luot_id', { ascending: false }).limit(1)
  ]);
  const daSoat = !!luot?.[0]?.nop_luc;
  return { denHan: daSoat ? 0 : chonLoi((loi ?? []) as LoiHS[], homNay).length, daSoatHomNay: daSoat };
}
