/**
 * FILE NÀY LÀM GÌ: Trang giao diện dành cho giáo viên trong khu vực đã đăng nhập, tổng hợp số liệu lớp và hỗ trợ điều chỉnh dạy học.
 * AI DÙNG: giáo viên
 * ĐỊA CHỈ TRÊN WEB: /gv/goi-y-ai
 * LẤY DỮ LIỆU TỪ: students, student_errors, error_dictionary, error_hints
 * GỌI TỚI: @/components/gv/BoLoc, @/components/gv/GoiYAiEditor, @/lib/gv/lopCuaToi, @/lib/ai/gemini, @/lib/supabase/server, @/lib/dfle/noi-dung.js
 */
import { batBuocGiaoVien, docCookieLop } from '@/components/gv/BoLoc';
import GoiYAiEditor, { type MucLoiGoiY } from '@/components/gv/GoiYAiEditor';
import { chonLopTu, lopCuaToi, nhanTruongLop } from '@/lib/gv/lopCuaToi';
import { aiTroGiupBat, coKhoaGemini } from '@/lib/ai/gemini';
import { supabaseAdmin } from '@/lib/supabase/server';
import * as noiDung from '@/lib/dfle/noi-dung.js';

export const dynamic = 'force-dynamic';

type LoiMoi = { code: string; misconception?: string; viDu?: string };
const ERROR_MAP = (noiDung as unknown as { ERROR_MAP: Map<string, LoiMoi> }).ERROR_MAP;

/**
 * Component React `GoiYAiPage`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export default async function GoiYAiPage({
  searchParams
}: {
  searchParams: { lop?: string };
}) {
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  const { db } = await batBuocGiaoVien();
  const lops = await lopCuaToi(db);
  const chon = chonLopTu(lops, searchParams.lop, docCookieLop(), true);

  if (!lops.length) {
    return (
      <div className="gv-noi">
        <h1>Gợi ý AI cho lỗi sai từ lần 2</h1>
        <div className="the"><p>Thầy cô chưa được phân công lớp nào.</p></div>
      </div>
    );
  }

  const admin = supabaseAdmin();
  const { data: hs } = chon.classIds.length
    ? await admin.from('students').select('student_id').in('class_id', chon.classIds)
    : { data: [] as { student_id: string }[] };
  const studentIds = (hs ?? []).map((x) => x.student_id);

  const { data: errs } = studentIds.length
    ? await admin
        .from('student_errors')
        .select('student_id, error_code, so_lan_sai')
        .in('student_id', studentIds)
        .gte('so_lan_sai', 2)
    : { data: [] as { student_id: string; error_code: string; so_lan_sai: number }[] };

  const tongHop = new Map<string, { hs: Set<string>; tong: number }>();
  for (const r of errs ?? []) {
    const m = tongHop.get(r.error_code) ?? { hs: new Set<string>(), tong: 0 };
    m.hs.add(r.student_id);
    m.tong += Number(r.so_lan_sai ?? 0);
    tongHop.set(r.error_code, m);
  }

  // Nếu lớp mới chưa phát sinh nhiều lỗi lặp, vẫn hiển thị tối đa 15 mã từ điển để thầy cô chuẩn bị sẵn gợi ý
  const { data: dict } = await admin.from('error_dictionary').select('error_code, misconception').limit(200);
  const dictMap = new Map((dict ?? []).map((d) => [d.error_code, d.misconception as string]));

  const maSapXep = Array.from(tongHop.entries())
    .sort((a, b) => b[1].hs.size - a[1].hs.size || b[1].tong - a[1].tong)
    .map(([code]) => code);

  if (maSapXep.length === 0) {
    for (const d of (dict ?? []).slice(0, 15)) maSapXep.push(d.error_code);
  }

  const { data: hintsDayDu, error: loiCot } = maSapXep.length
    ? await admin
        .from('error_hints')
        .select('error_code, tier, hint_text, nguon')
        .in('error_code', maSapXep)
    : { data: [] as any[], error: null };

  const hintsRows = loiCot
    ? (
        await admin
          .from('error_hints')
          .select('error_code, tier, hint_text')
          .in('error_code', maSapXep)
      ).data ?? []
    : hintsDayDu ?? [];

  const hintsByCode = new Map<string, { tiers: [string, string, string]; nguon: 'gv' | 'ai-duyet' | null }>();
  for (const h of hintsRows) {
    const cur = hintsByCode.get(h.error_code) ?? { tiers: ['', '', ''], nguon: null };
    const idx = Number(h.tier) - 1;
    if (idx >= 0 && idx <= 2) cur.tiers[idx] = String(h.hint_text ?? '');
    if (h.nguon === 'ai-duyet' || h.nguon === 'gv') cur.nguon = h.nguon;
    else if (!cur.nguon && h.hint_text) cur.nguon = 'gv';
    hintsByCode.set(h.error_code, cur);
  }

  const items: MucLoiGoiY[] = maSapXep.map((code) => {
    const tk = tongHop.get(code);
    const tuNoiDung = ERROR_MAP?.get(code);
    const h = hintsByCode.get(code);
    return {
      error_code: code,
      misconception: dictMap.get(code) ?? tuNoiDung?.misconception ?? code,
      viDu: tuNoiDung?.viDu ?? null,
      soHS: tk?.hs.size ?? 0,
      tongLanSai: tk?.tong ?? 0,
      tiers: h?.tiers ?? ['', '', ''],
      nguon: h?.nguon ?? null
    };
  });

  const phamViNhan = chon.tatCa
    ? `Tất cả lớp (${lops.length})`
    : chon.lop
      ? nhanTruongLop(chon.lop)
      : 'Chưa chọn lớp';

  return (
    <div className="gv-noi">
      <header style={{ marginBottom: 14 }}>
        <h1>Gợi ý AI cho lỗi sai từ lần 2</h1>
        <p className="nho">
          Chỉ liệt kê các mã lỗi học sinh mắc từ 2 lần trở lên. Giáo viên dùng AI soạn nháp, chỉnh sửa và duyệt trước khi học sinh thấy trong Soát lỗi.
        </p>
      </header>

      <GoiYAiEditor
        items={items}
        aiBat={aiTroGiupBat()}
        coKhoa={coKhoaGemini()}
        phamViNhan={phamViNhan}
      />
    </div>
  );
}
