/**
 * FILE NÀY LÀM GÌ: API máy chủ phục vụ giáo viên xử lý dữ liệu lớp học, thống kê hoặc thao tác quản lý trên Supabase.
 * AI DÙNG: máy chủ (API)
 * ĐỊA CHỈ TRÊN WEB: /api/gv/hoi-bin
 * LẤY DỮ LIỆU TỪ: profiles, hoi_bin, knowledge_units, ai_nhat_ky, questions, question_options, hoi_dap
 * GỌI TỚI: @/lib/supabase/server, @/lib/gv/lopCuaToi, @/lib/ai/gemini, @/lib/ai/hoiBinMatch, @/lib/khkt/tuLuc, @/lib/dfle/t9-on-thi-10.js
 */
import { NextResponse } from 'next/server';
import { supabaseAdmin, supabaseServer } from '@/lib/supabase/server';
import { kiemTraQuyenLop, laVaiTroGV } from '@/lib/gv/lopCuaToi';
import { aiTroGiupBat, soanNhapHoiBin } from '@/lib/ai/gemini';
import { tachTuKhoa } from '@/lib/ai/hoiBinMatch';
import { kiemTraLoDapAnGoiY } from '@/lib/khkt/tuLuc';
// @ts-ignore
import { DANG_ON_THI } from '@/lib/dfle/t9-on-thi-10.js';

export const dynamic = 'force-dynamic';

/**
 * Xử lý HTTP POST: kiểm tra đăng nhập/quyền hạn, nhận dữ liệu mới / xử lý và trả về JSON cho trình duyệt.
 */
export async function POST(req: Request) {
  const db = supabaseServer();
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  const { data: { user } } = await db.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Chưa đăng nhập.' }, { status: 401 });

  // Truy vấn Supabase: đọc dữ liệu từ bảng profiles
  const { data: p } = await db.from('profiles').select('role').eq('id', user.id).maybeSingle();
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  if (!laVaiTroGV(p?.role)) {
    return NextResponse.json({ error: 'Chỉ giáo viên mới được thao tác mục Hỏi Bin.' }, { status: 403 });
  }

  const b = await req.json().catch(() => null);
  const id = String(b?.id ?? '').trim();
  if (!id) return NextResponse.json({ error: 'Thiếu mã câu hỏi.' }, { status: 400 });

  const admin = supabaseAdmin();
  const { data: row, error: errRow } = await admin
    .from('hoi_bin')
    .select('id, class_id, ku_id, cau_hoi')
    .eq('id', id)
    .maybeSingle();

  if (errRow || !row) {
    return NextResponse.json({ error: 'Không tìm thấy câu hỏi.' }, { status: 404 });
  }

  const lopQuyen = await kiemTraQuyenLop(db, row.class_id);
  if (!lopQuyen) {
    return NextResponse.json({ error: 'Thầy cô không phụ trách lớp của câu hỏi này.' }, { status: 403 });
  }

  if (b?.hanhDong === 'soan-nhap') {
    if (!aiTroGiupBat()) {
      return NextResponse.json({ error: 'Tính năng AI đang tắt (AI_TRO_GIUP_BAT=false).' }, { status: 403 });
    }

    let tenMuc: string | null = row.ku_id ?? null;
    if (row.ku_id) {
      const { data: ku } = await admin
        .from('knowledge_units')
        .select('ku_name')
        .eq('ku_id', row.ku_id)
        .maybeSingle();
      if (ku?.ku_name) tenMuc = `${row.ku_id} — ${ku.ku_name}`;
    }

    // CHỈ gửi câu hỏi và tên mục kiến thức cho Gemini — tuyệt đối không gửi tên/mã/email học sinh
    const kq = await soanNhapHoiBin({ cauHoi: row.cau_hoi, tenMuc });

    await admin
      .from('ai_nhat_ky')
      .insert({
        giao_vien: user.id,
        loai: 'soan-nhap-hoi-bin',
        doi_tuong: row.ku_id ?? 'hoi-bin',
        mo_hinh: kq.moHinh,
        thanh_cong: kq.tuAi,
        ghi_chu: kq.canhBao ?? null
      })
      .then(() => {}, () => {});

    return NextResponse.json({
      ok: true,
      nhap: kq.nhap,
      tuAi: kq.tuAi,
      canhBao: kq.canhBao ?? null
    });
  }

  const now = new Date().toISOString();

  if (b?.hanhDong === 'tra-loi') {
    const traLoi = String(b?.traLoi ?? '').trim().slice(0, 2000);
    if (!traLoi) {
      return NextResponse.json({ error: 'Thầy cô cần nhập nội dung trả lời trước khi gửi.' }, { status: 400 });
    }
    if (!b?.boQuaCanhBao) {
      const dapAnRef: string[] = [];
      if (row.ku_id) {
        try {
          const { data: qs } = await admin
            .from('questions')
            .select('question_id, correct_option')
            .eq('ku_id', row.ku_id)
            .limit(12);
          const qIds = (qs ?? []).map((x: any) => x.question_id);
          if (qIds.length) {
            const { data: opts } = await admin
              .from('question_options')
              .select('question_id, option_key, option_text')
              .in('question_id', qIds);
            for (const q of qs ?? []) {
              const hitOpt = (opts ?? []).find((o: any) => o.question_id === q.question_id && o.option_key === q.correct_option);
              if (hitOpt?.option_text) dapAnRef.push(String(hitOpt.option_text));
            }
          }
          for (const d of (DANG_ON_THI as any[]) ?? []) {
            if (d.ku === row.ku_id || (d.kuLienQuan ?? []).includes(row.ku_id)) {
              for (const c of d.cauHoi ?? []) {
                if (c.dapAn) dapAnRef.push(String(c.dapAn));
              }
            }
          }
        } catch { /* bỏ qua */ }
      }
      const canhBaoLoDapAn = kiemTraLoDapAnGoiY(traLoi, dapAnRef);
      if (canhBaoLoDapAn) {
        return NextResponse.json({ canXacNhan: true, canhBaoLoDapAn });
      }
    }
    const nguon = b?.dungAi ? 'ai-duyet' : 'gv';

    const { error: errUp } = await admin
      .from('hoi_bin')
      .update({
        trang_thai: 'da-tra-loi',
        tra_loi: traLoi,
        nguon,
        tra_loi_boi: user.id,
        tra_loi_luc: now
      })
      .eq('id', row.id);

    if (errUp) return NextResponse.json({ error: errUp.message }, { status: 400 });

    let daLuuNganHang = false;
    if (b?.luuNganHang) {
      const tuKhoa = typeof b?.tuKhoa === 'string' && b.tuKhoa.trim()
        ? b.tuKhoa.split(',').map((s: string) => s.trim()).filter(Boolean).slice(0, 12)
        : tachTuKhoa(row.cau_hoi).slice(0, 10);

      // Truy vấn Supabase: thêm bản ghi vào bảng hoi_dap
      const { error: errBank } = await admin.from('hoi_dap').insert({
        ku_id: row.ku_id ?? null,
        cau_hoi: row.cau_hoi,
        tra_loi: traLoi,
        tu_khoa: tuKhoa,
        nguon,
        duyet_boi: user.id
      });
      daLuuNganHang = !errBank;
    }

    return NextResponse.json({ ok: true, nguon, daLuuNganHang });
  }

  if (b?.hanhDong === 'tu-choi') {
    const lyDo = String(b?.traLoi ?? '').trim() || 'Em hãy nêu rõ phần bài tập Toán 9 đang vướng để thầy/cô hướng dẫn nhé.';
    const { error: errUp } = await admin
      .from('hoi_bin')
      .update({
        trang_thai: 'tu-choi',
        tra_loi: lyDo,
        nguon: 'gv',
        tra_loi_boi: user.id,
        tra_loi_luc: now
      })
      .eq('id', row.id);
    if (errUp) return NextResponse.json({ error: errUp.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: 'Hành động không hợp lệ.' }, { status: 400 });
}
