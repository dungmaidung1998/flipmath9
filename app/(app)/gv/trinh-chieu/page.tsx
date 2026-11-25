/**
 * FILE NÀY LÀM GÌ: Trang giao diện dành cho giáo viên trong khu vực đã đăng nhập, tổng hợp số liệu lớp và hỗ trợ điều chỉnh dạy học.
 * AI DÙNG: giáo viên
 * ĐỊA CHỈ TRÊN WEB: /gv/trinh-chieu
 * LẤY DỮ LIỆU TỪ: knowledge_units
 * GỌI TỚI: @/components/gv/BoLoc, @/components/gv/TrinhChieuGV, @/lib/gv/lopCuaToi, @/lib/chapters, @/lib/supabase/server
 */
import { batBuocGiaoVien, docCookieLop } from '@/components/gv/BoLoc';
import TrinhChieuGV from '@/components/gv/TrinhChieuGV';
import { chonLopTu, lopCuaToi } from '@/lib/gv/lopCuaToi';
import { chapterOf } from '@/lib/chapters';
import { supabaseAdmin } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

/**
 * Component React `TrinhChieuPage`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export default async function TrinhChieuPage({
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
        <h1>Trình chiếu trên lớp</h1>
        <p className="mc-trong">Thầy cô chưa được phân công lớp nào.</p>
      </div>
    );
  }
  const chon = chonLopTu(lops, searchParams.lop, docCookieLop(), false);
  const admin = supabaseAdmin();
  const { data: units } = await admin
    .from('knowledge_units')
    .select('ku_id, ku_name, order_index')
    .order('order_index');

  const ds = (units ?? []).map((u) => {
    const id = String(u.ku_id);
    const uuTien = id.includes('-LTC') || id.includes('-OTC');
    return {
      ku_id: id,
      ku_name: String(u.ku_name),
      chuong: chapterOf(id) ?? 'Khác',
      uuTien,
      order: Number(u.order_index ?? 0),
    };
  });

  // Đưa các mục Luyện tập chung / Ôn tập chương lên đầu danh sách chọn
  ds.sort((a, b) => Number(b.uuTien) - Number(a.uuTien) || a.order - b.order);

  return <TrinhChieuGV lops={lops} lopMacDinh={chon.lop?.class_id ?? lops[0].class_id} mucs={ds} />;
}
