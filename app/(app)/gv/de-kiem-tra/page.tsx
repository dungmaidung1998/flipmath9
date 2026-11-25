/**
 * FILE NÀY LÀM GÌ: Trang giao diện dành cho giáo viên trong khu vực đã đăng nhập, tổng hợp số liệu lớp và hỗ trợ điều chỉnh dạy học.
 * AI DÙNG: giáo viên
 * ĐỊA CHỈ TRÊN WEB: /gv/de-kiem-tra
 * LẤY DỮ LIỆU TỪ: knowledge_units, questions
 * GỌI TỚI: @/components/gv/BoLoc, @/components/gv/DeKiemTraClient, @/lib/gv/lopCuaToi, @/lib/chapters, @/lib/supabase/server
 */
import { batBuocGiaoVien, docCookieLop } from '@/components/gv/BoLoc';
import DeKiemTraClient from '@/components/gv/DeKiemTraClient';
import { chonLopTu, lopCuaToi } from '@/lib/gv/lopCuaToi';
import { chapterOf } from '@/lib/chapters';
import { supabaseAdmin } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

/**
 * Component React `DeKiemTraPage`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export default async function DeKiemTraPage({
  searchParams,
}: {
  searchParams: { lop?: string };
}) {
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  const { db } = await batBuocGiaoVien();
  const lops = await lopCuaToi(db);
  if (!lops.length) {
    return (
      <div className="mc">
        <h1>Đề kiểm tra thường xuyên</h1>
        <p className="mc-trong">Thầy cô chưa được phân công lớp nào.</p>
      </div>
    );
  }
  const chon = chonLopTu(lops, searchParams.lop, docCookieLop(), false);
  const admin = supabaseAdmin();

  const [{ data: units }, resQ] = await Promise.all([
    admin.from('knowledge_units').select('ku_id, ku_name, lesson_id, order_index').order('order_index'),
    admin.from('questions').select('ku_id, level, trang_thai').then(
      (r) => (r.error ? admin.from('questions').select('ku_id, level') : r),
      () => ({ data: [] as any[], error: null })
    ),
  ]);

  const demDuyetMap = new Map<string, Record<number, number>>();
  const demTongMap = new Map<string, Record<number, number>>();
  for (const q of (resQ.data ?? []) as any[]) {
    if (q.trang_thai === 'can-sua') continue;
    const lv = Number(q.level);
    const ku = String(q.ku_id);
    const tong = demTongMap.get(ku) ?? { 1: 0, 2: 0, 3: 0, 4: 0 };
    tong[lv] = (tong[lv] ?? 0) + 1;
    demTongMap.set(ku, tong);

    const tt = String(q.trang_thai ?? '').toLowerCase();
    if (tt === 'da-duyet' || tt === 'duyet') {
      const d = demDuyetMap.get(ku) ?? { 1: 0, 2: 0, 3: 0, 4: 0 };
      d[lv] = (d[lv] ?? 0) + 1;
      demDuyetMap.set(ku, d);
    }
  }

  const mucs = (units ?? []).map((u) => ({
    ku_id: String(u.ku_id),
    ku_name: String(u.ku_name),
    lesson_id: u.lesson_id ? String(u.lesson_id) : null,
    chuong: chapterOf(String(u.ku_id)) ?? 'Khác',
    demDuyet: demDuyetMap.get(String(u.ku_id)) ?? { 1: 0, 2: 0, 3: 0, 4: 0 },
    demTong: demTongMap.get(String(u.ku_id)) ?? { 1: 0, 2: 0, 3: 0, 4: 0 },
  }));

  return <DeKiemTraClient lops={lops} lopMacDinh={chon.lop?.class_id ?? lops[0].class_id} mucs={mucs} />;
}
