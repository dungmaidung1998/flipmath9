/**
 * FILE NÀY LÀM GÌ: Trang giao diện dành cho giáo viên trong khu vực đã đăng nhập, tổng hợp số liệu lớp và hỗ trợ điều chỉnh dạy học.
 * AI DÙNG: giáo viên
 * ĐỊA CHỈ TRÊN WEB: /gv/hoi-bin
 * LẤY DỮ LIỆU TỪ: hoi_bin, students, hoi_dap
 * GỌI TỚI: @/components/gv/BoLoc, @/components/gv/HoiBinInbox, @/lib/gv/lopCuaToi, @/lib/ai/gemini, @/lib/supabase/server
 */
import { batBuocGiaoVien, docCookieLop } from '@/components/gv/BoLoc';
import HoiBinInbox, { type CauHoiBinGV, type MucNganHangGV } from '@/components/gv/HoiBinInbox';
import { chonLopTu, lopCuaToi, nhanTruongLop, tenHienThiLop } from '@/lib/gv/lopCuaToi';
import { aiTroGiupBat, coKhoaGemini } from '@/lib/ai/gemini';
import { supabaseAdmin } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

/**
 * Component React `HoiBinGVPage`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export default async function HoiBinGVPage({
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
        <h1>Hộp thư Hỏi Bin theo lớp</h1>
        <div className="the"><p>Thầy cô chưa được phân công lớp nào.</p></div>
      </div>
    );
  }

  const admin = supabaseAdmin();
  const resHB = chon.classIds.length
    ? await admin
        .from('hoi_bin')
        .select('id, student_id, class_id, ku_id, cau_hoi, trang_thai, tra_loi, nguon, tao_luc')
        .in('class_id', chon.classIds)
        .order('tao_luc', { ascending: false })
        .limit(120)
    : { data: [] as any[], error: null };

  const chuaCaiBang = Boolean(
    resHB.error &&
      (resHB.error.code === '42P01' ||
        resHB.error.code === 'PGRST205' ||
        String(resHB.error.message ?? '').includes('does not exist'))
  );

  const studentIds = Array.from(new Set((resHB.data ?? []).map((x: any) => x.student_id)));
  const { data: hsRows } = studentIds.length
    ? await admin.from('students').select('student_id, full_name').in('student_id', studentIds)
    : { data: [] as { student_id: string; full_name: string }[] };
  const tenHS = new Map((hsRows ?? []).map((h) => [h.student_id, h.full_name]));
  const tenLopMap = new Map(lops.map((l) => [l.class_id, tenHienThiLop(l)]));

  const items: CauHoiBinGV[] = (resHB.data ?? []).map((r: any) => ({
    id: r.id,
    student_id: r.student_id,
    tenHS: tenHS.get(r.student_id) ?? r.student_id,
    class_id: r.class_id,
    tenLop: tenLopMap.get(r.class_id) ?? r.class_id,
    ku_id: r.ku_id ?? null,
    cau_hoi: r.cau_hoi,
    trang_thai: r.trang_thai,
    tra_loi: r.tra_loi ?? null,
    nguon: r.nguon ?? null,
    tao_luc: r.tao_luc
  }));

  const resBank = await admin
    .from('hoi_dap')
    .select('id, ku_id, cau_hoi, tra_loi, tu_khoa, nguon, so_lan_dung')
    .order('so_lan_dung', { ascending: false })
    .limit(80)
    .then((r: any) => r, () => ({ data: [] as any[] }));

  const nganHang: MucNganHangGV[] = (resBank.data ?? []).map((m: any) => ({
    id: m.id,
    ku_id: m.ku_id ?? null,
    cau_hoi: m.cau_hoi,
    tra_loi: m.tra_loi,
    tu_khoa: Array.isArray(m.tu_khoa) ? m.tu_khoa : [],
    nguon: m.nguon === 'ai-duyet' ? 'ai-duyet' : 'gv',
    so_lan_dung: Number(m.so_lan_dung ?? 0)
  }));

  const phamViNhan = chon.tatCa
    ? `Tất cả lớp (${lops.length})`
    : chon.lop
      ? nhanTruongLop(chon.lop)
      : 'Chưa chọn lớp';

  return (
    <div className="gv-noi">
      <header style={{ marginBottom: 14 }}>
        <h1>Hộp thư Hỏi Bin</h1>
        <p className="nho">
          Câu hỏi của học sinh chưa có trong ngân hàng sẽ về đây. Thầy cô tự trả lời hoặc dùng Gemini soạn nháp (không gửi tên/mã học sinh), duyệt rồi lưu vào ngân hàng.
        </p>
      </header>

      {chuaCaiBang ? (
        <div className="the">
          <p>Chưa thấy bảng <code>hoi_bin</code> / <code>hoi_dap</code>. Thầy cô chạy tệp SQL <code>supabase/52-tro-giup-ai.sql</code> trên Supabase để kích hoạt.</p>
        </div>
      ) : (
        <HoiBinInbox
          items={items}
          nganHang={nganHang}
          aiBat={aiTroGiupBat()}
          coKhoa={coKhoaGemini()}
          phamViNhan={phamViNhan}
        />
      )}
    </div>
  );
}
