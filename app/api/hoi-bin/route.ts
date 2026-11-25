/**
 * FILE NÀY LÀM GÌ: API máy chủ tiếp nhận yêu cầu từ trình duyệt, kiểm tra quyền và làm việc với cơ sở dữ liệu Supabase / AI.
 * AI DÙNG: máy chủ (API)
 * ĐỊA CHỈ TRÊN WEB: /api/hoi-bin
 * LẤY DỮ LIỆU TỪ: profiles, students, hoi_bin, hoi_dap, knowledge_units, micro_lessons
 * GỌI TỚI: @/lib/supabase/server, @/lib/gv/lopCuaToi, @/lib/lichBai, @/lib/ai/hoiBinMatch, @/lib/ai/gemini, @/lib/ai/nhaCungCap
 */
import { NextResponse } from 'next/server';
import { supabaseAdmin, supabaseServer } from '@/lib/supabase/server';
import { laVaiTroGV } from '@/lib/gv/lopCuaToi';
import { ngayVN } from '@/lib/lichBai';
import {
  kiemTraNoiDungToan,
  timTrongNganHang,
  type HoiDapMuc
} from '@/lib/ai/hoiBinMatch';
import { aiTroGiupBat, coKhoaGemini } from '@/lib/ai/gemini';
import { traLoiHoiBinHS } from '@/lib/ai/nhaCungCap';

export const dynamic = 'force-dynamic';

const GIOI_HAN_NGAY = 10;

/**
 * Hàm `dauNgayUTC(không cần tham số)`: xử lý dữ liệu đầu vào và trả kết quả.
 */
function dauNgayUTC(): string {
  // Xử lý mốc ngày giờ theo múi giờ Việt Nam (UTC+7)
  return new Date(`${ngayVN()}T00:00:00+07:00`).toISOString();
}

/**
 * Hàm `laLoiChuaCoBang(err)`: kiểm tra điều kiện hợp lệ (trả về true/false hoặc thông báo lỗi).
 */
function laLoiChuaCoBang(err: any): boolean {
  const msg = String(err?.message ?? '');
  return err?.code === '42P01' || err?.code === 'PGRST205' || msg.includes('does not exist') || msg.includes('Could not find the table');
}

/**
 * Hàm `nguoiDungHocSinh(không cần tham số)`: tạo đối tượng dữ liệu hoặc chuỗi tổng hợp sẵn dùng.
 */
async function nguoiDungHocSinh() {
  const db = supabaseServer();
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  const { data: { user } } = await db.auth.getUser();
  if (!user) return { loi: NextResponse.json({ error: 'Em cần đăng nhập trước.' }, { status: 401 }) } as const;

  const { data: p } = await db
    .from('profiles')
    .select('role, student_id, class_id')
    .eq('id', user.id)
    .maybeSingle();

  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  if (laVaiTroGV(p?.role) || !p?.student_id) {
    return { loi: NextResponse.json({ error: 'Mục Hỏi Bin chỉ dành cho tài khoản học sinh.' }, { status: 403 }) } as const;
  }

  const admin = supabaseAdmin();
  let classId = (p.class_id ?? null) as string | null;
  if (!classId) {
    const { data: st } = await admin
      .from('students')
      .select('class_id')
      .eq('student_id', p.student_id)
      .maybeSingle();
    classId = st?.class_id ?? null;
  }
  if (!classId) {
    return { loi: NextResponse.json({ error: 'Chưa xác định được lớp của em.' }, { status: 400 }) } as const;
  }

  return { admin, studentId: p.student_id as string, classId } as const;
}

/**
 * Xử lý HTTP GET: kiểm tra đăng nhập/quyền hạn, đọc dữ liệu và trả về JSON cho trình duyệt.
 */
export async function GET() {
  const ctx = await nguoiDungHocSinh();
  if ('loi' in ctx) return ctx.loi;

  const { data: rows, error } = await ctx.admin
    .from('hoi_bin')
    .select('id, ku_id, cau_hoi, trang_thai, tra_loi, nguon, tao_luc, tra_loi_luc')
    .eq('student_id', ctx.studentId)
    .order('tao_luc', { ascending: false })
    .limit(20);

  if (error) {
    if (laLoiChuaCoBang(error)) {
      return NextResponse.json({ items: [], conLai: GIOI_HAN_NGAY, chuaSanSang: true });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { count } = await ctx.admin
    .from('hoi_bin')
    .select('id', { count: 'exact', head: true })
    .eq('student_id', ctx.studentId)
    .gte('tao_luc', dauNgayUTC());

  const daDung = count ?? 0;
  return NextResponse.json({
    items: [...(rows ?? [])].reverse(),
    conLai: Math.max(0, GIOI_HAN_NGAY - daDung),
    gioiHan: GIOI_HAN_NGAY
  });
}

/**
 * Xử lý HTTP POST: kiểm tra đăng nhập/quyền hạn, nhận dữ liệu mới / xử lý và trả về JSON cho trình duyệt.
 */
export async function POST(req: Request) {
  const ctx = await nguoiDungHocSinh();
  if ('loi' in ctx) return ctx.loi;

  const b = await req.json().catch(() => null);
  const cauHoi = String(b?.cauHoi ?? '').trim();
  const kuId = typeof b?.kuId === 'string' && b.kuId.trim() ? b.kuId.trim().slice(0, 60) : null;

  const kt = kiemTraNoiDungToan(cauHoi);
  if (!kt.hopLe) {
    return NextResponse.json({ error: kt.lyDo }, { status: 400 });
  }

  const { count, error: errDem } = await ctx.admin
    .from('hoi_bin')
    .select('id', { count: 'exact', head: true })
    .eq('student_id', ctx.studentId)
    .gte('tao_luc', dauNgayUTC());

  if (errDem) {
    if (laLoiChuaCoBang(errDem)) {
      return NextResponse.json(
        { error: 'Mục Hỏi Bin đang chờ thầy/cô kích hoạt bảng dữ liệu.' },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: errDem.message }, { status: 500 });
  }

  const daDung = count ?? 0;
  if (daDung >= GIOI_HAN_NGAY) {
    return NextResponse.json(
      { error: `Hôm nay em đã hỏi đủ ${GIOI_HAN_NGAY} câu rồi. Mai em hỏi tiếp hoặc xem lại bài nhé!` },
      { status: 429 }
    );
  }

  // 1. Ưu tiên tìm trong ngân hàng đã duyệt (hoi_dap) bằng từ khoá
  const { data: bank } = await ctx.admin
    .from('hoi_dap')
    .select('id, ku_id, cau_hoi, tra_loi, tu_khoa, nguon, so_lan_dung')
    .limit(400);

  const hit = timTrongNganHang(cauHoi, (bank ?? []) as HoiDapMuc[], kuId);
  const now = new Date().toISOString();

  if (hit) {
    const { data: inserted, error: errIns } = await ctx.admin
      .from('hoi_bin')
      .insert({
        student_id: ctx.studentId,
        class_id: ctx.classId,
        ku_id: kuId,
        cau_hoi: cauHoi,
        trang_thai: 'da-tra-loi',
        tra_loi: hit.muc.tra_loi,
        nguon: hit.muc.nguon,
        tra_loi_luc: now
      })
      .select('id, ku_id, cau_hoi, trang_thai, tra_loi, nguon, tao_luc, tra_loi_luc')
      .single();

    if (errIns) {
      return NextResponse.json({ error: errIns.message }, { status: 500 });
    }

    await ctx.admin
      .from('hoi_dap')
      .update({ so_lan_dung: Number(hit.muc.so_lan_dung ?? 0) + 1 })
      .eq('id', hit.muc.id)
      .then(() => {}, () => {});

    try {
      const { ghiNhanGoiY } = await import('@/lib/khkt/ghiGoiYSuKien');
      await ghiNhanGoiY(ctx.admin, {
        studentId: ctx.studentId,
        classId: ctx.classId,
        nguon: 'hoi-bin',
        tang: 1,
        kuId,
        coAi: hit.muc.nguon === 'ai-duyet',
      });
    } catch { /* bỏ qua */ }

    return NextResponse.json({
      loai: 'ngan-hang',
      item: inserted,
      traLoi: hit.muc.tra_loi,
      nguon: hit.muc.nguon,
      conLai: Math.max(0, GIOI_HAN_NGAY - daDung - 1)
    });
  }

  // 2. Nếu ngân hàng chưa có và Gemini đang bật: trả lời gợi mở trực tiếp qua Gemini (ẩn danh PII, lọc KaTeX)
  if (aiTroGiupBat() && coKhoaGemini()) {
    let tenMuc: string | null = null;
    let quyTac: string | null = null;
    if (kuId) {
      const [{ data: u }, { data: ml }] = await Promise.all([
        ctx.admin.from('knowledge_units').select('ku_name').eq('ku_id', kuId).maybeSingle(),
        ctx.admin
          .from('micro_lessons')
          .select('quy_tac')
          .eq('ku_id', kuId)
          .limit(1)
          .maybeSingle()
          .then((r) => r, () => ({ data: null }))
      ]);
      tenMuc = u?.ku_name ?? null;
      quyTac = ml?.quy_tac ?? null;
    }

    const aiKq = await traLoiHoiBinHS({ cauHoi, tenMuc, quyTac });
    if (aiKq.tuAi && aiKq.nhap) {
      let nguonUsed: 'ai-truc-tiep' | 'ai-duyet' = 'ai-truc-tiep';
      let resAi = await ctx.admin
        .from('hoi_bin')
        .insert({
          student_id: ctx.studentId,
          class_id: ctx.classId,
          ku_id: kuId,
          cau_hoi: cauHoi,
          trang_thai: 'da-tra-loi',
          tra_loi: aiKq.nhap,
          nguon: nguonUsed,
          tra_loi_luc: now
        })
        .select('id, ku_id, cau_hoi, trang_thai, tra_loi, nguon, tao_luc, tra_loi_luc')
        .single();

      if (resAi.error) {
        // Fallback nếu CSDL chưa chạy SQL 54 mở rộng hoi_bin_nguon_check
        nguonUsed = 'ai-duyet';
        resAi = await ctx.admin
          .from('hoi_bin')
          .insert({
            student_id: ctx.studentId,
            class_id: ctx.classId,
            ku_id: kuId,
            cau_hoi: cauHoi,
            trang_thai: 'da-tra-loi',
            tra_loi: aiKq.nhap,
            nguon: nguonUsed,
            tra_loi_luc: now
          })
          .select('id, ku_id, cau_hoi, trang_thai, tra_loi, nguon, tao_luc, tra_loi_luc')
          .single();
      }

      if (!resAi.error && resAi.data) {
        try {
          const { ghiNhanGoiY } = await import('@/lib/khkt/ghiGoiYSuKien');
          await ghiNhanGoiY(ctx.admin, {
            studentId: ctx.studentId,
            classId: ctx.classId,
            nguon: 'hoi-bin',
            tang: 1,
            kuId,
            coAi: true,
          });
        } catch { /* bỏ qua */ }
        return NextResponse.json({
          loai: 'ai-truc-tiep',
          item: resAi.data,
          traLoi: aiKq.nhap,
          nguon: nguonUsed,
          conLai: Math.max(0, GIOI_HAN_NGAY - daDung - 1)
        });
      }
    }
  }

  const { data: queued, error: errQueue } = await ctx.admin
    .from('hoi_bin')
    .insert({
      student_id: ctx.studentId,
      class_id: ctx.classId,
      ku_id: kuId,
      cau_hoi: cauHoi,
      trang_thai: 'cho'
    })
    .select('id, ku_id, cau_hoi, trang_thai, tra_loi, nguon, tao_luc, tra_loi_luc')
    .single();

  if (errQueue) {
    return NextResponse.json({ error: errQueue.message }, { status: 500 });
  }

  return NextResponse.json({
    loai: 'chuyen-gv',
    item: queued,
    traLoi: 'Bin đã chuyển câu hỏi cho thầy cô, em sẽ nhận trả lời trong mục Hỏi Bin.',
    nguon: null,
    conLai: Math.max(0, GIOI_HAN_NGAY - daDung - 1)
  });
}
