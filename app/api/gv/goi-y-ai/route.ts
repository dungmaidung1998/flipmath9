/**
 * FILE NÀY LÀM GÌ: API máy chủ phục vụ giáo viên xử lý dữ liệu lớp học, thống kê hoặc thao tác quản lý trên Supabase.
 * AI DÙNG: máy chủ (API)
 * ĐỊA CHỈ TRÊN WEB: /api/gv/goi-y-ai
 * LẤY DỮ LIỆU TỪ: profiles, error_dictionary, micro_lessons, ai_nhat_ky, error_hints
 * GỌI TỚI: @/lib/supabase/server, @/lib/gv/lopCuaToi, @/lib/ai/gemini, @/lib/khkt/tuLuc, @/lib/dfle/noi-dung.js
 */
import { NextResponse } from 'next/server';
import { supabaseAdmin, supabaseServer } from '@/lib/supabase/server';
import { laVaiTroGV } from '@/lib/gv/lopCuaToi';
import {
  aiTroGiupBat,
  soanBaTangGoiY
} from '@/lib/ai/gemini';
import { kiemTraLoDapAnGoiY } from '@/lib/khkt/tuLuc';
import * as noiDung from '@/lib/dfle/noi-dung.js';

export const dynamic = 'force-dynamic';

type LoiMoi = { code: string; ku?: string; misconception?: string; viDu?: string; remediation?: string };
const ERROR_MAP = (noiDung as unknown as { ERROR_MAP: Map<string, LoiMoi> }).ERROR_MAP;

/**
 * Hàm `xacThucGV(không cần tham số)`: xử lý dữ liệu đầu vào và trả kết quả.
 */
async function xacThucGV() {
  const db = supabaseServer();
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  const { data: { user } } = await db.auth.getUser();
  if (!user) return { loi: NextResponse.json({ error: 'Chưa đăng nhập.' }, { status: 401 }) } as const;
  // Truy vấn Supabase: đọc dữ liệu từ bảng profiles
  const { data: p } = await db.from('profiles').select('role').eq('id', user.id).maybeSingle();
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  if (!laVaiTroGV(p?.role)) {
    return { loi: NextResponse.json({ error: 'Chỉ giáo viên hoặc quản trị mới được thao tác.' }, { status: 403 }) } as const;
  }
  return { db, user } as const;
}

/**
 * Xử lý HTTP POST: kiểm tra đăng nhập/quyền hạn, nhận dữ liệu mới / xử lý và trả về JSON cho trình duyệt.
 */
export async function POST(req: Request) {
  const auth = await xacThucGV();
  if ('loi' in auth) return auth.loi;

  const b = await req.json().catch(() => null);
  const errorCode = String(b?.errorCode ?? '').trim();
  if (!errorCode) {
    return NextResponse.json({ error: 'Thiếu mã lỗi.' }, { status: 400 });
  }

  const admin = supabaseAdmin();

  if (b?.hanhDong === 'soan-ai') {
    if (!aiTroGiupBat()) {
      return NextResponse.json({ error: 'Tính năng AI đang tắt (AI_TRO_GIUP_BAT=false).' }, { status: 403 });
    }

    const { data: dict } = await admin
      .from('error_dictionary')
      .select('error_code, misconception')
      .eq('error_code', errorCode)
      .maybeSingle();

    const tuNoiDung = ERROR_MAP?.get(errorCode);
    const misconception = String(dict?.misconception ?? tuNoiDung?.misconception ?? b?.misconception ?? '');
    const viDu = tuNoiDung?.viDu ?? null;

    let viBaiHoc: string | null = null;
    if (tuNoiDung?.remediation) {
      const { data: ml } = await admin
        .from('micro_lessons')
        .select('dan, quy_tac')
        .eq('content_id', tuNoiDung.remediation)
        .maybeSingle()
        .then((r: any) => r, () => ({ data: null }));
      if (ml) {
        viBaiHoc = [ml.dan, ml.quy_tac].filter(Boolean).join(' — ');
      }
    }

    const kq = await soanBaTangGoiY({ errorCode, misconception, viDu, viBaiHoc });

    await admin
      .from('ai_nhat_ky')
      .insert({
        giao_vien: auth.user.id,
        loai: 'goi-y-loi',
        doi_tuong: errorCode,
        mo_hinh: kq.moHinh,
        thanh_cong: kq.tuAi,
        ghi_chu: kq.canhBao ?? null
      })
      .then(() => {}, () => {});

    return NextResponse.json({
      ok: true,
      goiY: kq.goiY,
      tuAi: kq.tuAi,
      canhBao: kq.canhBao ?? null
    });
  }

  if (b?.hanhDong === 'luu') {
    const rawTiers = Array.isArray(b?.tiers) ? b.tiers : [];
    const tiers = [0, 1, 2].map((idx) => String(rawTiers[idx] ?? '').trim().slice(0, 1600));
    if (tiers.some((t) => !t)) {
      return NextResponse.json({ error: 'Cần nhập đủ 3 tầng gợi ý trước khi duyệt lưu.' }, { status: 400 });
    }
    if (!b?.boQuaCanhBao) {
      const cb = kiemTraLoDapAnGoiY(tiers.join('\n'));
      if (cb) {
        return NextResponse.json({ canXacNhan: true, canhBaoLoDapAn: cb });
      }
    }

    const nguon = b?.dungAi ? 'ai-duyet' : 'gv';
    const now = new Date().toISOString();
    const rowsDayDu = tiers.map((hint_text, i) => ({
      error_code: errorCode,
      tier: i + 1,
      hint_text,
      nguon,
      duyet_boi: auth.user.id,
      cap_nhat: now
    }));

    const resDayDu = await admin
      .from('error_hints')
      .upsert(rowsDayDu, { onConflict: 'error_code,tier' });

    if (resDayDu.error) {
      // Fallback nếu CSDL chưa chạy SQL 52 (chưa có cột nguon / duyet_boi / cap_nhat)
      const rowsCoBan = tiers.map((hint_text, i) => ({
        error_code: errorCode,
        tier: i + 1,
        hint_text
      }));
      const resCoBan = await admin
        .from('error_hints')
        .upsert(rowsCoBan, { onConflict: 'error_code,tier' });
      if (resCoBan.error) {
        return NextResponse.json({ error: resCoBan.error.message }, { status: 400 });
      }
    }

    return NextResponse.json({ ok: true, errorCode, nguon });
  }

  return NextResponse.json({ error: 'Hành động không hợp lệ.' }, { status: 400 });
}
